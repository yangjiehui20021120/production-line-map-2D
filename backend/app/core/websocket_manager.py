from __future__ import annotations

import asyncio
from typing import Any, Dict, List

from fastapi import WebSocket


class WebSocketManager:
    """Manage realtime WebSocket connections with basic heartbeat support."""

    def __init__(self) -> None:
        self.connections: List[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self.connections.append(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            if websocket in self.connections:
                self.connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]) -> None:
        async with self._lock:
            websockets = list(self.connections)

        for connection in websockets:
            try:
                await connection.send_json(message)
            except Exception:
                await self.disconnect(connection)

    async def send_personal_message(
        self, websocket: WebSocket, message: Dict[str, Any]
    ) -> None:
        await websocket.send_json(message)

