from datetime import datetime, timedelta, timezone
import pytest
from fastapi import status


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "healthy"


def test_create_short_url_generates_token_and_analytics_url(client):
    payload = {"url": "https://example.com/deep/path?query=1"}
    response = client.post("/api/v1/urls", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    # Public fields
    assert "short_code" in data
    assert len(data["short_code"]) == 7
    assert data["original_url"] == payload["url"]
    assert data["click_count"] == 0
    assert data["is_expired"] is False

    # Private analytics fields
    assert "analytics_token" in data
    assert len(data["analytics_token"]) >= 32
    assert "analytics_url" in data
    assert f"/analytics/{data['analytics_token']}" in data["analytics_url"]


def test_public_url_metadata_does_not_leak_analytics_token(client):
    create_res = client.post("/api/v1/urls", json={"url": "https://secret-project.com"})
    created_data = create_res.json()
    short_code = created_data["short_code"]
    analytics_token = created_data["analytics_token"]

    # Access public metadata
    public_res = client.get(f"/api/v1/urls/{short_code}")
    assert public_res.status_code == status.HTTP_200_OK
    public_data = public_res.json()

    # Must NOT expose private analytics token or analytics url
    assert "analytics_token" not in public_data
    assert "analytics_url" not in public_data
    assert public_data["short_code"] == short_code


def test_global_urls_list_endpoint_is_removed(client):
    # Public / global link directory must NOT exist
    response = client.get("/api/v1/urls")
    assert response.status_code in (status.HTTP_404_NOT_FOUND, status.HTTP_405_METHOD_NOT_ALLOWED)


def test_global_analytics_summary_endpoint_is_removed(client):
    # Global analytics across all users must NOT exist
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code in (status.HTTP_404_NOT_FOUND, status.HTTP_405_METHOD_NOT_ALLOWED)


def test_private_analytics_access_and_security_headers(client):
    create_res = client.post("/api/v1/urls", json={"url": "https://privacy-first.org"})
    data = create_res.json()
    token = data["analytics_token"]
    short_code = data["short_code"]

    # Query private analytics endpoint
    res = client.get(f"/api/v1/analytics/{token}")
    assert res.status_code == status.HTTP_200_OK

    # Verify anti-indexing and private caching headers
    assert "no-store" in res.headers.get("cache-control", "").lower()
    assert "noindex" in res.headers.get("x-robots-tag", "").lower()

    analytics = res.json()
    assert analytics["short_code"] == short_code
    assert analytics["total_clicks"] == 0
    assert analytics["clicks_today"] == 0
    assert analytics["timeline"] == []
    assert "devices" in analytics
    assert "browsers" in analytics
    assert "operating_systems" in analytics
    assert "referrers" in analytics
    assert "recent_activity" in analytics


def test_invalid_analytics_token_returns_404(client):
    response = client.get("/api/v1/analytics/completely-bogus-token-123456789")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_token_for_url_a_cannot_access_url_b(client):
    res_a = client.post("/api/v1/urls", json={"url": "https://site-a.com"}).json()
    res_b = client.post("/api/v1/urls", json={"url": "https://site-b.com"}).json()

    token_a = res_a["analytics_token"]
    token_b = res_b["analytics_token"]

    # Ensure tokens are completely distinct
    assert token_a != token_b

    analytics_a = client.get(f"/api/v1/analytics/{token_a}").json()
    analytics_b = client.get(f"/api/v1/analytics/{token_b}").json()

    assert analytics_a["short_code"] == res_a["short_code"]
    assert analytics_b["short_code"] == res_b["short_code"]
    assert analytics_a["short_code"] != analytics_b["short_code"]


def test_redirect_and_privacy_click_tracking(client):
    target = "https://example.com/target-redirect"
    create_res = client.post("/api/v1/urls", json={"url": target})
    data = create_res.json()
    short_code = data["short_code"]
    token = data["analytics_token"]

    # Redirect with custom User-Agent and Referer
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Referer": "https://news.ycombinator.com/item?id=123456",
    }
    redir = client.get(f"/{short_code}", headers=headers, follow_redirects=False)
    assert redir.status_code == status.HTTP_307_TEMPORARY_REDIRECT
    assert redir.headers["location"] == target

    # Check updated private analytics
    analytics = client.get(f"/api/v1/analytics/{token}").json()
    assert analytics["total_clicks"] == 1
    assert analytics["clicks_today"] == 1

    # Verify device and OS parsed from UA
    assert any(d["label"] == "Mobile" for d in analytics["devices"])
    assert any(o["label"] == "iOS" for o in analytics["operating_systems"])
    assert any(b["label"] == "Safari" for b in analytics["browsers"])
    # Verify referrer domain sanitized without query parameters
    assert any(r["label"] == "news.ycombinator.com" for r in analytics["referrers"])

    # Verify recent activity item does NOT contain raw IP
    assert len(analytics["recent_activity"]) == 1
    activity_item = analytics["recent_activity"][0]
    assert "ip" not in activity_item
    assert "raw_ip" not in activity_item
    assert activity_item["device"] == "Mobile"


def test_delete_via_private_token(client):
    create_res = client.post("/api/v1/urls", json={"url": "https://delete-me.com"}).json()
    short_code = create_res["short_code"]
    token = create_res["analytics_token"]

    # Delete with private token
    del_res = client.delete(f"/api/v1/analytics/{token}")
    assert del_res.status_code == status.HTTP_200_OK

    # Subsequent redirect returns 404
    redir_res = client.get(f"/{short_code}", follow_redirects=False)
    assert redir_res.status_code == status.HTTP_404_NOT_FOUND

    # Subsequent analytics lookup returns 404
    analytics_res = client.get(f"/api/v1/analytics/{token}")
    assert analytics_res.status_code == status.HTTP_404_NOT_FOUND


def test_link_expiration(client):
    future_time = (datetime.now(timezone.utc) + timedelta(seconds=1)).isoformat()
    create_res = client.post(
        "/api/v1/urls",
        json={"url": "https://expiring-site.com", "expires_at": future_time},
    )
    assert create_res.status_code == status.HTTP_201_CREATED
    short_code = create_res.json()["short_code"]
    token = create_res.json()["analytics_token"]

    # Active redirect
    res1 = client.get(f"/{short_code}", follow_redirects=False)
    assert res1.status_code == status.HTTP_307_TEMPORARY_REDIRECT

    import time
    time.sleep(1.2)

    # Expired redirect returns 410 Gone
    res2 = client.get(f"/{short_code}", follow_redirects=False)
    assert res2.status_code == status.HTTP_410_GONE

    analytics = client.get(f"/api/v1/analytics/{token}").json()
    assert analytics["is_expired"] is True
    assert analytics["total_clicks"] == 1


@pytest.mark.parametrize(
    "invalid_url",
    [
        "javascript:alert('xss')",
        "JAVASCRIPT:prompt(1)",
        "data:text/html,<script>alert(1)</script>",
        "file:///etc/passwd",
        "blob:https://example.com/uuid",
        "ftp://ftp.example.com",
        "htt://malformed",
        "not-a-url",
        "",
        "   ",
        "http://",
        "https://",
        "http:// spaced url.com",
    ],
)
def test_reject_dangerous_and_invalid_urls(client, invalid_url):
    response = client.post("/api/v1/urls", json={"url": invalid_url})
    assert response.status_code in (status.HTTP_422_UNPROCESSABLE_ENTITY, status.HTTP_400_BAD_REQUEST)


def test_reject_oversized_url(client):
    huge_url = "https://example.com/" + "a" * 2100
    response = client.post("/api/v1/urls", json={"url": huge_url})
    assert response.status_code in (status.HTTP_422_UNPROCESSABLE_ENTITY, status.HTTP_400_BAD_REQUEST)
