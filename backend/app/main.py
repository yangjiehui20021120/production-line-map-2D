from fastapi import FastAPI

from app.api.v1.router import router as api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """轻量级健康检查端点."""
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.API_V1_PREFIX)

