from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Database
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./test.db"

    # Version
    BACKEND_VERSION: str = "2.7.7"

    # Security
    SECRET_KEY: str = "a_very_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # General
    TIMEZONE: str = "Asia/Shanghai"


settings = Settings()
