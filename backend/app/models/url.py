from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class URLItem:
    short_code: str
    original_url: str
    analytics_token: str
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None
    click_count: int = 0
    is_active: bool = True

    @property
    def is_expired(self) -> bool:
        """Returns True if the link has an expiration date in the past."""
        if not self.expires_at:
            return False
        now_utc = datetime.now(timezone.utc)
        expires_utc = self.expires_at if self.expires_at.tzinfo else self.expires_at.replace(tzinfo=timezone.utc)
        return now_utc >= expires_utc


@dataclass
class ClickEvent:
    short_code: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    device: str = "Unknown"
    browser: str = "Unknown"
    os: str = "Unknown"
    referrer: Optional[str] = None
