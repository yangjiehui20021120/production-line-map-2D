"""KPI API endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from app.services import kpi_service

router = APIRouter(prefix="/map", tags=["kpi"])


@router.get("/kpi")
async def get_kpi_summary() -> dict:
    """Return KPI summary with 6 core metrics."""
    response = kpi_service.get_kpi_summary()
    return response.model_dump()


