from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "TLG LINK"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Base URL for generated short links
    BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # URL Short code settings
    SHORT_CODE_LENGTH: int = 7
    MAX_COLLISION_RETRIES: int = 10
    
    # Allowed CORS origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # URL limits
    MAX_URL_LENGTH: int = 2048
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()
