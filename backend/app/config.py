"""
CreditBridge Enterprise Application Configuration
"""

import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "CreditBridge"
    PROJECT_TAGLINE: str = "Bridging the Credit Gap with Alternative Financial Intelligence & Explainable AI"
    API_V1_PREFIX: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")  # "development" | "staging" | "production"
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "creditbridge-enterprise-secret-key-prod-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))  # 7 days
    
    # Storage Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    MODELS_DIR: str = os.path.join(DATA_DIR, "models")
    DATASETS_DIR: str = os.path.join(DATA_DIR, "datasets")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'creditbridge.db').replace(chr(92), '/')}"
    )
    
    # CORS Origins (supports comma-separated string or list)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:80",
        "http://127.0.0.1:80",
        "*"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

# Ensure directories exist
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.MODELS_DIR, exist_ok=True)
os.makedirs(settings.DATASETS_DIR, exist_ok=True)
