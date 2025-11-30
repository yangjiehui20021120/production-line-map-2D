"""Analysis API endpoints for bottleneck, quality, efficiency detection and path statistics."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.services import analysis_service

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/bottlenecks")
async def get_bottlenecks() -> dict:
    """Return list of bottleneck stations."""
    bottlenecks = analysis_service.get_bottleneck_stations()
    return {"success": True, "data": bottlenecks}


@router.get("/quality-issues")
async def get_quality_issues() -> dict:
    """Return list of equipment with quality issues."""
    issues = analysis_service.get_quality_issues()
    return {"success": True, "data": issues}


@router.get("/efficiency-issues")
async def get_efficiency_issues() -> dict:
    """Return list of stations with efficiency issues."""
    issues = analysis_service.get_efficiency_issues()
    return {"success": True, "data": issues}


@router.get("/spaghetti-paths")
async def get_spaghetti_paths(hours: int = Query(default=24, ge=1, le=168)) -> dict:
    """Return path statistics for Spaghetti diagram."""
    stats = analysis_service.get_spaghetti_paths_statistics(hours)
    return {"success": True, "data": stats}


