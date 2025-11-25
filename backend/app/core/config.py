from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "Production Line Map API"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    NGSI_LD_ENDPOINT: str = "http://localhost:9090/ngsi-ld/v1"
    USE_MOCK_DATA: bool = True


settings = Settings()

