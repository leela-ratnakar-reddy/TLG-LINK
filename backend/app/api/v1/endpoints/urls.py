from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import get_url_service
from app.core.config import settings
from app.schemas.url import PublicURLResponse, URLCreateRequest, URLResponse
from app.services.url_service import URLService

router = APIRouter()


def _get_request_base_url(request: Request) -> str:
    """Derive base URL from request or fallback to config."""
    if settings.BASE_URL and settings.BASE_URL != "http://localhost:8000":
        return settings.BASE_URL
    return str(request.base_url).rstrip("/")


@router.post(
    "",
    response_model=URLResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create shortened URL",
    description="Shortens a long HTTP/HTTPS URL, generates a public short code and a private analytics token.",
)
def create_url(
    payload: URLCreateRequest,
    request: Request,
    service: URLService = Depends(get_url_service),
) -> URLResponse:
    base_url = _get_request_base_url(request)
    frontend_url = settings.FRONTEND_URL
    try:
        return service.create_short_url(
            payload,
            base_url=base_url,
            frontend_url=frontend_url,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get(
    "/{short_code}",
    response_model=PublicURLResponse,
    summary="Get public URL metadata",
    description="Retrieve public link metadata without exposing private analytics tokens.",
)
def get_public_url(
    short_code: str,
    request: Request,
    service: URLService = Depends(get_url_service),
) -> PublicURLResponse:
    base_url = _get_request_base_url(request)
    url_item = service.get_public_url(short_code, base_url=base_url)
    if not url_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Short link with code '{short_code}' not found.",
        )
    return url_item
