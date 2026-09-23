from functools import lru_cache
from app.services.url_service import URLService
from app.storage.memory import InMemoryURLRepository

# Singleton in-memory repository for application lifecycle
_memory_repository = InMemoryURLRepository()


def get_repository() -> InMemoryURLRepository:
    """Returns the active URL repository."""
    return _memory_repository


def get_url_service() -> URLService:
    """Dependency provider for URLService."""
    return URLService(repository=get_repository())
