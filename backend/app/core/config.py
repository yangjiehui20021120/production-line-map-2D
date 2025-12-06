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
    TRAJECTORY_SAMPLE_FILE: str = "test-data/trajectory_7days_sample.json"
    
    # Redis配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://localhost:6379/0"  # 如果设置了REDIS_URL，会覆盖HOST/PORT/DB
    USE_REDIS_CACHE: bool = True  # 是否启用Redis缓存
    ENTITY_CACHE_TTL: int = 300  # 实体查询缓存TTL（秒）


settings = Settings()

