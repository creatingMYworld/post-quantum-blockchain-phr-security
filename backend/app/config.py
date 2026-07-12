from functools import lru_cache
from pydantic import BaseModel
import os


class Settings(BaseModel):
    firebase_project_id: str | None = os.getenv("FIREBASE_PROJECT_ID")
    jwt_secret: str = os.getenv("BACKEND_JWT_SECRET", "change-me-in-production")
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = int(os.getenv("ACCESS_TOKEN_MINUTES", "30"))
    refresh_token_days: int = int(os.getenv("REFRESH_TOKEN_DAYS", "14"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
