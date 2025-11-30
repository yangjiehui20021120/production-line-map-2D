"""实时数据API路由。

提供实时实体查询的HTTP接口。
WebSocket路由已拆分到websocket_routes.py。
"""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Query

from app.services.mock_realtime_service import list_entities

router = APIRouter(prefix="/realtime", tags=["realtime"])


def parse_types(types: Optional[List[str]]) -> Optional[List[str]]:
    """解析和规范化实体类型列表。

    Args:
        types: 实体类型列表（如["equipment", "workpiece"]）

    Returns:
        规范化后的类型列表（小写），如果输入为空则返回None
    """
    if not types:
        return None
    normalized = [t.lower() for t in types]
    return normalized


@router.get("/entities")
async def get_realtime_entities(types: Optional[List[str]] = Query(default=None)) -> dict:
    """获取实时实体列表。

    返回设备/工件/人员图层的初始数据集。

    Args:
        types: 可选的实体类型过滤列表（如["equipment", "workpiece", "personnel"]）

    Returns:
        包含实体列表的响应
    """
    data = list_entities(parse_types(types))
    return {"success": True, "data": data}

