from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.router import router as api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.middleware.cors import setup_cors
from app.middleware.error_handler import ErrorHandlerMiddleware

# 配置日志
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理：启动和关闭时的操作。"""
    # 启动时
    if settings.USE_REDIS_CACHE:
        try:
            from app.core.cache_service import get_cache_service
            cache_service = await get_cache_service()
            print("Redis cache service connected")
        except Exception as e:
            print(f"Warning: Redis cache service not available: {e}")
            print("Continuing without Redis cache...")
    
    yield
    
    # 关闭时
    if settings.USE_REDIS_CACHE:
        try:
            from app.core.cache_service import close_cache_service
            await close_cache_service()
            print("Redis cache service disconnected")
        except Exception:
            pass


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# 配置CORS
setup_cors(app)

# 添加错误处理中间件
app.add_middleware(ErrorHandlerMiddleware)


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """轻量级健康检查端点."""
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.API_V1_PREFIX)

