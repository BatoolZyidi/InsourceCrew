from functools import lru_cache
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    app_env: str = "development"
    database_url: str
    jwt_secret_key: str = Field(min_length=32)
    jwt_access_token_minutes: int = 60
    jwt_refresh_token_days: int = 14
    cors_origins: str = "http://localhost:3000"
    # Optional Supabase service configuration. DATABASE_URL remains the single
    # SQLAlchemy connection source and should contain Supabase's Postgres URL.
    supabase_url: AnyHttpUrl | None = None
    supabase_publishable_key: str | None = None
    supabase_jwks_url: AnyHttpUrl | None = None
    llm_provider: str = "fireworks"
    fireworks_api_key: str | None = None
    llm_model: str = "accounts/fireworks/models/gpt-oss-120b"
    llm_base_url: AnyHttpUrl = "https://api.fireworks.ai/inference/v1"
    serpapi_enabled: bool = False
    serpapi_api_key: str | None = None
    demo_mode: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
