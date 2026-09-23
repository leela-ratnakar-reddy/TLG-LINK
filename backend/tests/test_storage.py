import pytest
from app.models.url import ClickEvent, URLItem
from app.storage.memory import InMemoryURLRepository


def test_in_memory_repository_token_crud():
    repo = InMemoryURLRepository()
    item = URLItem(
        short_code="test12",
        original_url="https://test.com",
        analytics_token="secure_token_abc_123",
    )

    # Create & Index
    repo.create(item)
    assert repo.exists("test12") is True
    assert repo.exists("nonexistent") is False

    # Get by code (for public redirect)
    by_code = repo.get_by_code("test12")
    assert by_code is not None
    assert by_code.original_url == "https://test.com"

    # Get by token (for private analytics)
    by_token = repo.get_by_token("secure_token_abc_123")
    assert by_token is not None
    assert by_token.short_code == "test12"

    # Invalid token lookup
    assert repo.get_by_token("wrong_token") is None

    # Record privacy-safe click
    repo.record_click("test12", ClickEvent(short_code="test12", device="Mobile", browser="Chrome", os="Android"))
    analytics = repo.get_link_analytics("secure_token_abc_123")
    assert analytics is not None
    assert analytics["total_clicks"] == 1
    assert len(analytics["devices"]) == 1
    assert analytics["devices"][0]["label"] == "Mobile"

    # Delete by private token
    assert repo.delete_by_token("secure_token_abc_123") is True
    assert repo.get_by_code("test12") is None
    assert repo.get_by_token("secure_token_abc_123") is None
    assert repo.get_link_analytics("secure_token_abc_123") is None
    assert repo.delete_by_token("secure_token_abc_123") is False
