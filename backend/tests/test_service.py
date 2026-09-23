from datetime import datetime, timezone
import pytest
from app.core.security import generate_analytics_token, generate_short_code
from app.models.url import ClickEvent, URLItem
from app.schemas.url import URLCreateRequest
from app.services.url_service import URLService
from app.storage.memory import InMemoryURLRepository


def test_short_code_generation():
    codes = set()
    for _ in range(100):
        code = generate_short_code(7)
        assert len(code) == 7
        assert code.isalnum()
        codes.add(code)
    assert len(codes) == 100


def test_analytics_token_generation():
    tokens = set()
    for _ in range(100):
        tok = generate_analytics_token()
        assert len(tok) >= 32
        tokens.add(tok)
    # 100% uniqueness and high entropy
    assert len(tokens) == 100


def test_collision_handling():
    repo = InMemoryURLRepository()
    service = URLService(repo)

    # Prepopulate with a known code
    repo.create(
        URLItem(
            short_code="fixed01",
            original_url="https://fixed.com",
            analytics_token="test_token_fixed01",
        )
    )

    req = URLCreateRequest(url="https://another.com", custom_alias="fixed01")
    with pytest.raises(ValueError, match="already in use"):
        service.create_short_url(req)


def test_link_private_analytics_calculation():
    repo = InMemoryURLRepository()
    service = URLService(repo)

    req = URLCreateRequest(url="https://privacy-test.com")
    link = service.create_short_url(req)
    token = link.analytics_token

    # Initial analytics
    initial = service.get_analytics_by_token(token)
    assert initial is not None
    assert initial.total_clicks == 0
    assert initial.clicks_today == 0
    assert initial.timeline == []
    assert initial.devices == []

    # Simulate clicks with UA and referrer
    service.handle_redirect(
        link.short_code,
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)",
        referrer="https://twitter.com/post/123",
    )
    service.handle_redirect(
        link.short_code,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        referrer=None,  # Direct
    )

    updated = service.get_analytics_by_token(token)
    assert updated.total_clicks == 2
    assert updated.clicks_today == 2
    assert len(updated.timeline) == 1

    # Check breakdown calculations
    device_labels = {d.label for d in updated.devices}
    assert "Mobile" in device_labels
    assert "Desktop" in device_labels

    referrer_labels = {r.label for r in updated.referrers}
    assert "twitter.com" in referrer_labels
    assert "Direct" in referrer_labels
