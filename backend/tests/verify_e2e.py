import time
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.api.deps import get_repository

def run_privacy_e2e_verification():
    print("=" * 60)
    print("TLG LINK PRIVACY-FIRST END-TO-END VERIFICATION")
    print("=" * 60)

    repo = get_repository()
    repo.clear()

    with TestClient(app) as client:
        # 1. Health check
        print("\n1. Testing GET /health...")
        res = client.get("/health")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        print(f"   [PASS] Health check: {res.json()}")

        # 2. Shorten valid URL
        print("\n2. Testing POST /api/v1/urls (Shorten URL & generate private token)...")
        target_url = "https://fastapi.tiangolo.com/tutorial"
        res = client.post("/api/v1/urls", json={"url": target_url})
        assert res.status_code == 201, f"Expected 201, got {res.status_code}"
        link = res.json()
        short_code = link["short_code"]
        analytics_token = link["analytics_token"]
        analytics_url = link["analytics_url"]

        assert len(short_code) == 7
        assert len(analytics_token) >= 32
        assert f"/analytics/{analytics_token}" in analytics_url
        print(f"   [PASS] Short code: {short_code}")
        print(f"   [PASS] Analytics URL: {analytics_url}")

        # 3. Verify public endpoint does NOT reveal private token
        print("\n3. Testing public metadata endpoint privacy...")
        pub_res = client.get(f"/api/v1/urls/{short_code}")
        assert pub_res.status_code == 200
        pub_data = pub_res.json()
        assert "analytics_token" not in pub_data
        assert "analytics_url" not in pub_data
        print("   [PASS] Public metadata does NOT leak analytics token")

        # 4. Verify global listing endpoints are removed
        print("\n4. Testing that global user listings are completely removed...")
        res_list = client.get("/api/v1/urls")
        assert res_list.status_code in (404, 405)
        res_summary = client.get("/api/v1/analytics/summary")
        assert res_summary.status_code in (404, 405)
        print("   [PASS] GET /api/v1/urls and GET /api/v1/analytics/summary are removed")

        # 5. Redirect and Click Tracking with Privacy Metadata
        print(f"\n5. Testing GET /{short_code} (Redirect #1)...")
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://github.com/trending",
        }
        res = client.get(f"/{short_code}", headers=headers, follow_redirects=False)
        assert res.status_code == 307
        assert res.headers["location"] == target_url
        print(f"   [PASS] Redirected to {target_url}")

        # 6. Verify Private Analytics after Redirect #1
        print("\n6. Testing GET /api/v1/analytics/{analytics_token} (After 1 click)...")
        res_analytics = client.get(f"/api/v1/analytics/{analytics_token}")
        assert res_analytics.status_code == 200
        assert "no-store" in res_analytics.headers.get("cache-control", "").lower()
        assert "noindex" in res_analytics.headers.get("x-robots-tag", "").lower()
        stats = res_analytics.json()
        assert stats["total_clicks"] == 1
        assert stats["clicks_today"] == 1
        assert any(d["label"] == "Desktop" for d in stats["devices"])
        assert any(b["label"] == "Chrome" for b in stats["browsers"])
        assert any(o["label"] == "macOS" for o in stats["operating_systems"])
        assert any(r["label"] == "github.com" for r in stats["referrers"])
        # Verify no raw IP stored
        assert "ip" not in stats["recent_activity"][0]
        print("   [PASS] Private analytics accurate and zero raw IP stored")

        # 7. Redirect #2
        print(f"\n7. Testing GET /{short_code} (Redirect #2)...")
        client.get(f"/{short_code}", follow_redirects=False)
        stats2 = client.get(f"/api/v1/analytics/{analytics_token}").json()
        assert stats2["total_clicks"] == 2
        print("   [PASS] Click count incremented from 1 to 2")

        # 8. Invalid analytics token
        print("\n8. Testing invalid analytics token...")
        bad_token_res = client.get("/api/v1/analytics/invalid-fake-token-999")
        assert bad_token_res.status_code == 404
        print("   [PASS] Invalid token returns 404 Not Found")

        # 9. Expiration behavior
        print("\n9. Testing link expiration...")
        expire_time = (datetime.now(timezone.utc) + timedelta(seconds=1)).isoformat()
        exp_res = client.post("/api/v1/urls", json={"url": "https://temp.org", "expires_at": expire_time})
        exp_code = exp_res.json()["short_code"]
        exp_token = exp_res.json()["analytics_token"]
        time.sleep(1.2)
        exp_redir = client.get(f"/{exp_code}", follow_redirects=False)
        assert exp_redir.status_code == 410
        exp_analytics = client.get(f"/api/v1/analytics/{exp_token}").json()
        assert exp_analytics["is_expired"] is True
        print(f"   [PASS] Expired link {exp_code} blocked from redirecting")

        # 10. Deletion via private token
        print(f"\n10. Testing DELETE /api/v1/analytics/{analytics_token}...")
        del_res = client.delete(f"/api/v1/analytics/{analytics_token}")
        assert del_res.status_code == 200
        # Subsequent lookups return 404
        assert client.get(f"/{short_code}", follow_redirects=False).status_code == 404
        assert client.get(f"/api/v1/analytics/{analytics_token}").status_code == 404
        print("   [PASS] Link deleted via token and subsequent access blocked")

        # 11. Dangerous schemes
        print("\n11. Testing rejection of malicious schemes...")
        malicious = [
            "javascript:alert(1)",
            "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
            "file:///etc/hosts",
        ]
        for bad_url in malicious:
            assert client.post("/api/v1/urls", json={"url": bad_url}).status_code in (400, 422)
        print("   [PASS] Dangerous schemes safely rejected")

    print("\n" + "=" * 60)
    print("ALL PRIVACY-FIRST END-TO-END VERIFICATION CHECKS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    run_privacy_e2e_verification()
