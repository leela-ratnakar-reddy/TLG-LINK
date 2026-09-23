import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_repository
from app.main import app
from app.storage.memory import InMemoryURLRepository


@pytest.fixture(autouse=True)
def reset_storage():
    """Reset repository before each test to guarantee test isolation."""
    repo = get_repository()
    repo.clear()
    yield
    repo.clear()


@pytest.fixture
def client():
    """TestClient fixture for FastAPI."""
    with TestClient(app) as test_client:
        yield test_client
