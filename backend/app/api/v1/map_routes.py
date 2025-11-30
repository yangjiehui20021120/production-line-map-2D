"""地图相关API路由。"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.responses import BasemapResponse, LayerConfigResponse
from app.services.map_service import get_map_service

router = APIRouter(prefix="/map", tags=["map"])


@router.get("/basemap")
async def get_basemap() -> BasemapResponse:
    """获取底图数据。

    Returns:
        底图GeoJSON数据
    """
    try:
        map_service = get_map_service()
        basemap = map_service.load_basemap()
        return BasemapResponse(success=True, data=basemap)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/layers")
async def get_layers() -> LayerConfigResponse:
    """获取图层配置。

    Returns:
        图层配置列表
    """
    map_service = get_map_service()
    layers = map_service.get_layers()
    return LayerConfigResponse(success=True, data=layers)

