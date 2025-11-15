from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_URL: str = ""
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    # R2 Cloudflare Settings
    R2_ENDPOINT_URL: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = ""
    R2_PUBLIC_URL: str = ""
    # Redis Settings
    REDIS_URL: str = ""
    # Celery Settings
    CELERY_BROKER_URL: str = ""
    CELERY_RESULT_BACKEND: str = ""
    # GitHub OAuth Settings
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/github/callback"
    # Google OAuth Settings
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    # Email Settings
    RESEND_API_KEY: str = ""
    # Platform Settings
    PLATFORM_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file="../../.env",  # <-- can be None safely
        env_file_encoding="utf-8",
        extra="ignore",
        # Optional: case_sensitive=True,
    )


settings = Settings()
