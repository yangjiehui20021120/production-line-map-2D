"""Trajectory playback service: loads mock trajectory data and exposes query helpers."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from functools import lru_cache
from pathlib import Path
from typing import Iterable, Literal, Sequence

from pydantic import BaseModel, Field

from app.core.config import settings

TrajectoryKind = Literal["equipment", "workpiece", "personnel"]
DEFAULT_KIND: TrajectoryKind = "equipment"
# Path resolution: find project root by looking for test-data directory
# In container: /app/app/services/trajectory_service.py -> /app (parents[2])
# In local dev: backend/app/services/trajectory_service.py -> project root (parents[3])
_file_path = Path(__file__).resolve()
_max_parents = len(_file_path.parents)
_candidates = [_file_path.parents[i] for i in range(min(2, _max_parents), min(5, _max_parents))]
REPO_ROOT = next((p for p in _candidates if (p / "test-data" / "trajectory_7days_sample.json").exists()), _file_path.parents[min(2, _max_parents - 1)])


class RawTrajectoryPoint(BaseModel):
    ts: datetime = Field(..., description="ISO8601 timestamp")
    x: float
    y: float
    status: str | None = None


class RawTrajectory(BaseModel):
    entity_id: str = Field(..., alias="entityId")
    entity_type: TrajectoryKind | None = Field(default=None, alias="entityType")
    name: str | None = None
    process_group: str | None = Field(default=None, alias="processGroup")
    layer: str | None = None
    points: list[RawTrajectoryPoint]


class PointGeometry(BaseModel):
    type: Literal["Point"] = "Point"
    coordinates: tuple[float, float]


class TrajectoryPoint(BaseModel):
    ts: datetime
    position: PointGeometry
    status: str | None = None


class TrajectoryMeta(BaseModel):
    start: datetime
    end: datetime
    durationSec: float
    totalPoints: int


class TrajectorySeries(BaseModel):
    id: str
    name: str
    kind: TrajectoryKind
    processGroup: str | None = None
    layer: str | None = None
    points: list[TrajectoryPoint]
    meta: TrajectoryMeta


class TrajectorySummary(BaseModel):
    id: str
    name: str
    kind: TrajectoryKind
    processGroup: str | None = None
    layer: str | None = None
    availableRange: dict[str, str]
    totalPoints: int


class TrajectoryNotFoundError(Exception):
    """Raised when a requested trajectory entity cannot be located."""


def _resolve_dataset_path() -> Path:
    candidate = Path(settings.TRAJECTORY_SAMPLE_FILE)
    if not candidate.is_absolute():
        candidate = REPO_ROOT / candidate
    return candidate


def _infer_kind(entity_id: str, declared: TrajectoryKind | None) -> TrajectoryKind:
    if declared:
        return declared
    lowered = entity_id.lower()
    if "workpiece" in lowered or "product" in lowered:
        return "workpiece"
    if "person" in lowered or "staff" in lowered or "worker" in lowered:
        return "personnel"
    return DEFAULT_KIND


def _prepare_points(raw_points: Iterable[RawTrajectoryPoint]) -> list[TrajectoryPoint]:
    points = [
        TrajectoryPoint(
            ts=pt.ts.astimezone(UTC),
            position=PointGeometry(coordinates=(pt.x, pt.y)),
            status=pt.status,
        )
        for pt in raw_points
    ]
    points.sort(key=lambda item: item.ts)
    return points


def _prepare_entry(record: RawTrajectory) -> TrajectorySeries:
    points = _prepare_points(record.points)
    if not points:
        raise ValueError(f"Trajectory {record.entity_id} has no points")
    kind = _infer_kind(record.entity_id, record.entity_type)
    name = record.name or record.entity_id.split(":")[-1]
    meta = TrajectoryMeta(
        start=points[0].ts,
        end=points[-1].ts,
        durationSec=(points[-1].ts - points[0].ts).total_seconds(),
        totalPoints=len(points),
    )
    return TrajectorySeries(
        id=record.entity_id,
        name=name,
        kind=kind,
        processGroup=record.process_group,
        layer=record.layer,
        points=points,
        meta=meta,
    )


@lru_cache(maxsize=1)
def _load_dataset() -> list[TrajectorySeries]:
    path = _resolve_dataset_path()
    if not path.exists():
        raise FileNotFoundError(f"Trajectory sample file not found: {path}")
    raw_payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(raw_payload, dict) and "series" in raw_payload:
        records = raw_payload["series"]
    elif isinstance(raw_payload, list):
        records = raw_payload
    else:
        records = [raw_payload]
    prepared: list[TrajectorySeries] = []
    for item in records:
        record = RawTrajectory.model_validate(item)
        prepared.append(_prepare_entry(record))
    return prepared


def list_available_entities(
    entity_type: TrajectoryKind | None,
    start: datetime | None,
    end: datetime | None,
) -> list[TrajectorySummary]:
    dataset = _load_dataset()
    summaries: list[TrajectorySummary] = []
    for series in dataset:
        if entity_type and series.kind != entity_type:
            continue
        if start and series.meta.end < start:
            continue
        if end and series.meta.start > end:
            continue
        summaries.append(
            TrajectorySummary(
                id=series.id,
                name=series.name,
                kind=series.kind,
                processGroup=series.processGroup,
                layer=series.layer,
                availableRange={
                    "start": series.meta.start.isoformat(),
                    "end": series.meta.end.isoformat(),
                },
                totalPoints=series.meta.totalPoints,
            )
        )
    return summaries


def _filter_points(
    points: Sequence[TrajectoryPoint], start: datetime | None, end: datetime | None
) -> list[TrajectoryPoint]:
    if not points:
        return []
    start_ts = start.astimezone(UTC) if start else points[0].ts
    end_ts = end.astimezone(UTC) if end else points[-1].ts
    if end_ts < start_ts:
        start_ts, end_ts = end_ts, start_ts
    filtered = [pt for pt in points if start_ts <= pt.ts <= end_ts]
    return filtered or [points[0], points[-1]]


def _simplify_points(points: list[TrajectoryPoint], max_points: int) -> list[TrajectoryPoint]:
    if len(points) <= max_points:
        return points
    total = len(points)
    if max_points < 2:
        return [points[0], points[-1]]
    indices: list[int] = []
    for i in range(max_points):
        raw_index = round(i * (total - 1) / (max_points - 1))
        index = min(total - 1, max(0, raw_index))
        if indices and index == indices[-1]:
            continue
        indices.append(index)
    if indices[-1] != total - 1:
        indices.append(total - 1)
    return [points[i] for i in indices]


def get_trajectory_series(
    entity_id: str,
    start: datetime | None,
    end: datetime | None,
    max_points: int = 500,
) -> TrajectorySeries:
    dataset = _load_dataset()
    match = next((item for item in dataset if item.id == entity_id), None)
    if not match:
        raise TrajectoryNotFoundError(entity_id)
    filtered_points = _filter_points(match.points, start, end)
    simplified = _simplify_points(filtered_points, max_points)
    meta = TrajectoryMeta(
        start=simplified[0].ts,
        end=simplified[-1].ts,
        durationSec=(simplified[-1].ts - simplified[0].ts).total_seconds(),
        totalPoints=len(simplified),
    )
    return TrajectorySeries(
        id=match.id,
        name=match.name,
        kind=match.kind,
        processGroup=match.processGroup,
        layer=match.layer,
        points=simplified,
        meta=meta,
    )

