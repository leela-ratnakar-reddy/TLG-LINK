from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.api.deps import get_url_service
from app.core.config import settings
from app.schemas.url import LinkAnalyticsResponse
from app.services.url_service import URLService

router = APIRouter()


def _get_request_base_url(request: Request) -> str:
    """Derive base URL from request or fallback to config."""
    if settings.BASE_URL and settings.BASE_URL != "http://localhost:8000":
        return settings.BASE_URL
    return str(request.base_url).rstrip("/")


@router.get(
    "/{analytics_token}",
    response_model=LinkAnalyticsResponse,
    summary="Get private link analytics",
    description="Retrieve private click analytics, device breakdowns, and timeline using the private analytics token.",
)
def get_private_analytics(
    analytics_token: str,
    request: Request,
    response: Response,
    service: URLService = Depends(get_url_service),
) -> LinkAnalyticsResponse:
    # Set privacy and anti-indexing headers
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
    response.headers["Pragma"] = "no-cache"
    response.headers["X-Robots-Tag"] = "noindex, nofollow"

    base_url = _get_request_base_url(request)
    analytics = service.get_analytics_by_token(analytics_token, base_url=base_url)
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Private analytics not found. The token may be invalid or the link has been removed.",
        )
    return analytics


@router.delete(
    "/{analytics_token}",
    status_code=status.HTTP_200_OK,
    summary="Delete short link via private token",
    description="Permanently delete a short link and its associated click statistics using its private analytics token.",
)
def delete_link_by_token(
    analytics_token: str,
    service: URLService = Depends(get_url_service),
) -> dict:
    success = service.delete_by_token(analytics_token)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found or invalid analytics token.",
        )
    return {"message": "Short link and all associated analytics deleted successfully."}
