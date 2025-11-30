from fastapi import APIRouter

from . import analysis, entity_routes, kpi, map_routes, realtime, trajectory, websocket_routes

router = APIRouter()
router.include_router(realtime.router)
router.include_router(websocket_routes.router)
router.include_router(trajectory.router)
router.include_router(analysis.router)
router.include_router(kpi.router)
router.include_router(map_routes.router)
router.include_router(entity_routes.router)


@router.get("/ping", tags=["system"])
async def ping() -> dict[str, str]:
    """CI 用通用探活接口."""
    return {"message": "pong"}

