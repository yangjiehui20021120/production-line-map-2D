from __future__ import annotations

from datetime import datetime
from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from app.services import trajectory_service as service

router = APIRouter(prefix="/trajectory", tags=["trajectory"])
TrajectoryKind = Literal["equipment", "workpiece", "personnel"]


@router.get("/search")
async def search_trajectory_entities(
    entity_type: TrajectoryKind | None = Query(default=None, alias="entityType"),
    start: datetime | None = Query(default=None),
    end: datetime | None = Query(default=None),
) -> dict:
    """List trajectory-enabled entities within a given time window."""

    results = service.list_available_entities(entity_type, start, end)
    return {"success": True, "data": [item.model_dump() for item in results]}


@router.get("/{entity_id}")
async def get_entity_trajectory(
    entity_id: str,
    start: datetime | None = Query(default=None),
    end: datetime | None = Query(default=None),
    max_points: int = Query(default=500, ge=10, le=5000),
) -> dict:
    """Return a trajectory series ready for playback."""

    try:
        series = service.get_trajectory_series(entity_id, start, end, max_points)
    except service.TrajectoryNotFoundError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"Trajectory not found: {exc}")
    return {"success": True, "data": series.model_dump()}




