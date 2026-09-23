from datetime import datetime, timezone
from typing import List, Optional
from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator
from app.core.config import settings


class URLCreateRequest(BaseModel):
    url: str = Field(..., description="The original long URL to shorten.")
    expires_at: Optional[datetime] = Field(
        None,
        description="Optional ISO expiration datetime. Must be in the future.",
    )
    custom_alias: Optional[str] = Field(
        None,
        description="Optional custom alias (V2 preview).",
        min_length=3,
        max_length=30,
    )

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        clean_url = v.strip()
        if not clean_url:
            raise ValueError("URL cannot be empty.")

        if len(clean_url) > settings.MAX_URL_LENGTH:
            raise ValueError(f"URL exceeds maximum allowed length of {settings.MAX_URL_LENGTH} characters.")

        # Reject dangerous schemes immediately
        lowered = clean_url.lower()
        forbidden_schemes = ("javascript:", "data:", "file:", "vbscript:", "blob:")
        if any(lowered.startswith(prefix) for prefix in forbidden_schemes):
            raise ValueError("Invalid URL scheme. Only HTTP and HTTPS are permitted.")

        parsed = urlparse(clean_url)
        if parsed.scheme.lower() not in ("http", "https"):
            raise ValueError("Please enter a valid HTTP or HTTPS URL.")

        if not parsed.netloc:
            raise ValueError("URL must include a valid host or domain name.")

        if " " in clean_url or "\t" in clean_url or "\n" in clean_url:
            raise ValueError("URL cannot contain whitespace.")

        return clean_url

    @field_validator("expires_at")
    @classmethod
    def validate_expires_at(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is not None:
            now_utc = datetime.now(timezone.utc)
            v_utc = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
            if v_utc <= now_utc:
                raise ValueError("Expiration date must be in the future.")
        return v


class PublicURLResponse(BaseModel):
    short_code: str
    short_url: str
    original_url: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    click_count: int
    is_expired: bool


class URLResponse(BaseModel):
    short_code: str
    short_url: str
    original_url: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    click_count: int
    is_expired: bool
    analytics_url: str
    analytics_token: str


class TimelinePoint(BaseModel):
    date: str
    clicks: int


class CategoryBreakdown(BaseModel):
    label: str
    count: int
    percentage: float


class RecentClickItem(BaseModel):
    timestamp: datetime
    device: str
    browser: str
    os: str
    referrer: Optional[str] = None


class LinkAnalyticsResponse(BaseModel):
    short_code: str
    short_url: str
    original_url: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_expired: bool
    total_clicks: int
    clicks_today: int
    clicks_7d: int
    clicks_30d: int
    timeline: List[TimelinePoint]
    devices: List[CategoryBreakdown]
    browsers: List[CategoryBreakdown]
    operating_systems: List[CategoryBreakdown]
    referrers: List[CategoryBreakdown]
    recent_activity: List[RecentClickItem]
