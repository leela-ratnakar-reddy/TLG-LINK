from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.redirects import router as redirects_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Production-quality URL Shortener & Analytics API. Short links. Smart analytics.",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check endpoint
    @app.get("/health", tags=["Health"])
    def health_check() -> dict:
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }

    # API v1 routes
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    # Top-level short code redirect: GET /{short_code}
    app.include_router(redirects_router)

    return app


app = create_app()
