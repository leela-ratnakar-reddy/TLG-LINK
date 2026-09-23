from typing import Optional, Tuple
from app.core.config import settings
from app.core.security import generate_analytics_token, generate_short_code
from app.core.user_agent import clean_referrer, parse_user_agent
from app.models.url import ClickEvent, URLItem
from app.schemas.url import (
    LinkAnalyticsResponse,
    PublicURLResponse,
    URLCreateRequest,
    URLResponse,
)
from app.storage.base import BaseURLRepository


class URLService:
    def __init__(self, repository: BaseURLRepository) -> None:
        self.repository = repository

    def _to_response(
        self,
        item: URLItem,
        base_url: str = settings.BASE_URL,
        frontend_url: str = settings.FRONTEND_URL,
    ) -> URLResponse:
        short_url = f"{base_url.rstrip('/')}/{item.short_code}"
        analytics_url = f"{frontend_url.rstrip('/')}/analytics/{item.analytics_token}"
        return URLResponse(
            short_code=item.short_code,
            short_url=short_url,
            original_url=item.original_url,
            created_at=item.created_at,
            expires_at=item.expires_at,
            click_count=item.click_count,
            is_expired=item.is_expired,
            analytics_url=analytics_url,
            analytics_token=item.analytics_token,
        )

    def create_short_url(
        self,
        request: URLCreateRequest,
        base_url: str = settings.BASE_URL,
        frontend_url: str = settings.FRONTEND_URL,
    ) -> URLResponse:
        short_code: Optional[str] = None

        if request.custom_alias:
            alias = request.custom_alias.strip()
            if self.repository.exists(alias):
                raise ValueError(f"Custom alias '{alias}' is already in use.")
            short_code = alias
        else:
            for _ in range(settings.MAX_COLLISION_RETRIES):
                candidate = generate_short_code(settings.SHORT_CODE_LENGTH)
                if not self.repository.exists(candidate):
                    short_code = candidate
                    break

            if not short_code:
                raise RuntimeError("Failed to generate a unique short code after maximum retries.")

        # Generate cryptographically secure private analytics token
        analytics_token = generate_analytics_token()

        url_item = URLItem(
            short_code=short_code,
            original_url=request.url,
            analytics_token=analytics_token,
            expires_at=request.expires_at,
        )

        saved = self.repository.create(url_item)
        return self._to_response(saved, base_url=base_url, frontend_url=frontend_url)

    def get_public_url(
        self,
        short_code: str,
        base_url: str = settings.BASE_URL,
    ) -> Optional[PublicURLResponse]:
        item = self.repository.get_by_code(short_code)
        if not item:
            return None
        short_url = f"{base_url.rstrip('/')}/{item.short_code}"
        return PublicURLResponse(
            short_code=item.short_code,
            short_url=short_url,
            original_url=item.original_url,
            created_at=item.created_at,
            expires_at=item.expires_at,
            click_count=item.click_count,
            is_expired=item.is_expired,
        )

    def handle_redirect(
        self,
        short_code: str,
        user_agent: Optional[str] = None,
        referrer: Optional[str] = None,
        referer: Optional[str] = None,
    ) -> Tuple[str, Optional[str]]:
        """
        Processes redirect and records privacy-safe click metadata.
        Sub-millisecond synchronous execution without outbound network calls.
        """
        item = self.repository.get_by_code(short_code)
        if not item:
            return "not_found", None

        if item.is_expired:
            return "expired", item.original_url

        # Fast UA & referrer parsing
        device, browser, os = parse_user_agent(user_agent)
        effective_referrer = referrer or referer
        sanitized_referrer = clean_referrer(effective_referrer)

        event = ClickEvent(
            short_code=short_code,
            device=device,
            browser=browser,
            os=os,
            referrer=sanitized_referrer,
        )
        self.repository.record_click(short_code, event)
        return "ok", item.original_url

    def get_analytics_by_token(
        self,
        analytics_token: str,
        base_url: str = settings.BASE_URL,
    ) -> Optional[LinkAnalyticsResponse]:
        raw_data = self.repository.get_link_analytics(analytics_token)
        if not raw_data:
            return None

        short_url = f"{base_url.rstrip('/')}/{raw_data['short_code']}"
        return LinkAnalyticsResponse(short_url=short_url, **raw_data)

    def delete_by_token(self, analytics_token: str) -> bool:
        return self.repository.delete_by_token(analytics_token)
