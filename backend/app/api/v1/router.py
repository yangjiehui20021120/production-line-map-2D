from fastapi import APIRouter

from . import realtime

router = APIRouter()
router.include_router(realtime.router)


@router.get("/ping", tags=["system"])
async def ping() -> dict[str, str]:
    """CI 用通用探活接口."""
    return {"message": "pong"}

