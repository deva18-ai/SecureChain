from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SecureChain API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/securechain")

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Blockchain
    BLOCKCHAIN_RPC_URL: str = os.getenv("BLOCKCHAIN_RPC_URL", "http://127.0.0.1:8545")
    CONTRACT_ADDRESS: str = os.getenv("CONTRACT_ADDRESS", "")
    DEPLOYER_PRIVATE_KEY: str = os.getenv("DEPLOYER_PRIVATE_KEY", "")

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()