"""WebSocket路由。

提供实时数据推送的WebSocket连接。
"""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.websocket_manager import WebSocketManager
from app.services.mock_realtime_service import generate_updates

router = APIRouter(prefix="/realtime", tags=["websocket"])
manager = WebSocketManager()


@router.websocket("/ws")
async def realtime_websocket(websocket: WebSocket) -> None:
    """推送实时更新到连接的客户端。

    当前使用mock数据，每2秒推送一次更新。
    后续可替换为基于NGSI-LD的真实数据推送。
    """
    await manager.connect(websocket)
    try:
        while True:
            payload = generate_updates()
            await manager.send_personal_message(websocket, payload)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        await manager.disconnect(websocket)

