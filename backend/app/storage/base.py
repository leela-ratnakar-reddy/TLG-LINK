from abc import ABC, abstractmethod
from typing import Optional
from app.models.url import ClickEvent, URLItem


class BaseURLRepository(ABC):
    """
    Abstract storage interface for privacy-first URL shortening and analytics.
    Enables clean swap from InMemoryURLRepository in V1 to PostgresURLRepository in V2.
    """

    @abstractmethod
    def create(self, item: URLItem) -> URLItem:
        """Store a new URL item and index it by code and analytics token."""
        pass

    @abstractmethod
    def get_by_code(self, short_code: str) -> Optional[URLItem]:
        """Retrieve a URL item by its unique public short code."""
        pass

    @abstractmethod
    def get_by_token(self, analytics_token: str) -> Optional[URLItem]:
        """Retrieve a URL item by its private analytics token."""
        pass

    @abstractmethod
    def record_click(self, short_code: str, event: ClickEvent) -> Optional[URLItem]:
        """Record privacy-safe click event and increment click count."""
        pass

    @abstractmethod
    def get_link_analytics(self, analytics_token: str) -> Optional[dict]:
        """Retrieve private analytics metrics and breakdowns for a specific link token."""
        pass

    @abstractmethod
    def delete_by_token(self, analytics_token: str) -> bool:
        """Permanently delete a URL item and all its clicks using its private analytics token."""
        pass

    @abstractmethod
    def exists(self, short_code: str) -> bool:
        """Check if a short code is already allocated."""
        pass
