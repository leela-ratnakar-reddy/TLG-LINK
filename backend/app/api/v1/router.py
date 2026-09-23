from fastapi import APIRouter
from app.api.v1.endpoints import analytics, urls

api_router = APIRouter()
api_router.include_router(urls.router, prefix="/urls", tags=["URLs"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
