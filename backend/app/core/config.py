from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Postgres connection
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/fund_advisor"

    # Auth
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 1 day

    class Config:
        env_file = ".env"


settings = Settings()