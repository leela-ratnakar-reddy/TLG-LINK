from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse

from app.api.deps import get_url_service
from app.core.config import settings
from app.services.url_service import URLService

router = APIRouter()


def _render_error_html(title: str, heading: str, message: str, status_code: int) -> HTMLResponse:
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} • TLG LINK</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #080B12;
      color: #F8FAFC;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .card {{
      background: #0F1420;
      border: 1px solid #1E2638;
      border-radius: 16px;
      padding: 40px 32px;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }}
    .badge {{
      display: inline-block;
      padding: 4px 12px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #EF4444;
      font-size: 12px;
      font-weight: 600;
      border-radius: 9999px;
      margin-bottom: 20px;
    }}
    h1 {{
      font-size: 24px;
      margin: 0 0 12px 0;
      font-weight: 700;
    }}
    p {{
      color: #94A3B8;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 28px 0;
    }}
    .btn {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #3B82F6;
      color: #FFFFFF;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 10px;
      transition: all 0.2s ease;
    }}
    .btn:hover {{
      background: #2563EB;
      transform: translateY(-1px);
    }}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">{status_code} Error</div>
    <h1>{heading}</h1>
    <p>{message}</p>
    <a href="{settings.FRONTEND_URL}" class="btn">Go to TLG LINK</a>
  </div>
</body>
</html>"""
    return HTMLResponse(content=html, status_code=status_code)


@router.get(
    "/{short_code}",
    response_class=RedirectResponse,
    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    summary="Redirect to original URL",
    description="Resolves the short code, increments the click counter, and issues a 307 temporary redirect to the destination URL.",
)
def redirect_to_url(
    short_code: str,
    request: Request,
    service: URLService = Depends(get_url_service),
):
    # Extract referer and user-agent for analytics
    referer = request.headers.get("referer")
    user_agent = request.headers.get("user-agent")

    redirect_status, original_url = service.handle_redirect(
        short_code=short_code,
        referer=referer,
        user_agent=user_agent,
    )

    accept_header = request.headers.get("accept", "")
    prefers_html = "text/html" in accept_header

    if redirect_status == "not_found":
        if prefers_html:
            return _render_error_html(
                title="Link not found",
                heading="Link not found",
                message="This short link doesn't exist or may have been removed.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Short link '{short_code}' does not exist.",
        )

    if redirect_status == "expired":
        if prefers_html:
            return _render_error_html(
                title="Link expired",
                heading="Link expired",
                message="This short link is no longer active.",
                status_code=status.HTTP_410_GONE,
            )
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail=f"Short link '{short_code}' has expired.",
        )

    # Valid redirect
    return RedirectResponse(
        url=original_url,
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )
