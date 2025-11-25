from __future__ import annotations

import asyncio
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect

from app.core.websocket_manager import WebSocketManager
from app.services.mock_realtime_service import generate_updates, list_entities

router = APIRouter(prefix="/realtime", tags=["realtime"])
manager = WebSocketManager()


def parse_types(types: Optional[List[str]]) -> Optional[List[str]]:
    if not types:
        return None
    normalized = [t.lower() for t in types]
    return normalized


@router.get("/entities")
async def get_realtime_entities(types: Optional[List[str]] = Query(default=None)) -> dict:
    """Return initial dataset for equipment / workpiece / personnel layers."""
    data = list_entities(parse_types(types))
    return {"success": True, "data": data}


@router.websocket("/ws")
async def realtime_websocket(websocket: WebSocket) -> None:
    """Push mock realtime updates to connected clients."""
    await manager.connect(websocket)
    try:
        while True:
            payload = generate_updates()
            await manager.send_personal_message(websocket, payload)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        await manager.disconnect(websocket)

