"""Analysis service for bottleneck, quality, efficiency detection and path statistics."""

from __future__ import annotations

from typing import Dict, List

from app.services.mock_realtime_service import (
    STATION_DATA,
    EQUIPMENT_DATA,
    get_spaghetti_paths,
    StationEntity,
    BaseEntity,
)


def calculate_threshold(station: StationEntity) -> int:
    """Calculate WIP threshold for a station based on its capacity."""
    capacity = station.get("attributes", {}).get("capacity", 10)
    return max(3, int(capacity * 0.7))


def is_bottleneck(station: StationEntity) -> bool:
    """
    Determine if a station is a bottleneck.
    
    Criteria:
    - WIP count > threshold (70% of capacity)
    - Average process time > standard CT * 1.2
    """
    wip_count = station.get("wipCount", 0)
    avg_ct = station.get("avgProcessTime", 0.0)
    standard_ct = station.get("standardCT", 0.0)
    threshold = calculate_threshold(station)
    
    return wip_count > threshold or (standard_ct > 0 and avg_ct > standard_ct * 1.2)


def get_bottleneck_stations() -> List[Dict[str, object]]:
    """Return list of bottleneck stations."""
    bottlenecks = []
    for station in STATION_DATA:
        if is_bottleneck(station):
            bottlenecks.append({
                "id": station["id"],
                "name": station["name"],
                "processGroup": station.get("processGroup", ""),
                "location": station["location"],
                "wipCount": station.get("wipCount", 0),
                "avgProcessTime": station.get("avgProcessTime", 0.0),
                "standardCT": station.get("standardCT", 0.0),
                "threshold": calculate_threshold(station),
                "queueLength": station.get("wipCount", 0),
            })
    return bottlenecks


def has_quality_issue(equipment: BaseEntity) -> bool:
    """
    Determine if equipment has quality issues.
    
    Criteria:
    - Recent 24h defect rate > quality threshold
    """
    attributes = equipment.get("attributes", {})
    defect_rate = attributes.get("recentDefectRate24h", 0.0)
    threshold = attributes.get("qualityThreshold", 3.0)
    
    return defect_rate > threshold


def get_quality_issues() -> List[Dict[str, object]]:
    """Return list of equipment with quality issues."""
    issues = []
    for equipment in EQUIPMENT_DATA:
        if has_quality_issue(equipment):
            attributes = equipment.get("attributes", {})
            issues.append({
                "id": equipment["id"],
                "name": equipment["name"],
                "location": equipment["location"],
                "status": equipment.get("status", ""),
                "recentDefectRate24h": attributes.get("recentDefectRate24h", 0.0),
                "qualityThreshold": attributes.get("qualityThreshold", 3.0),
                "oee": attributes.get("oee", 0.0),
            })
    return issues


def is_low_efficiency(station: StationEntity) -> bool:
    """
    Determine if a station has low efficiency.
    
    Criteria:
    - Actual OEE < target OEE * 0.9
    """
    actual_oee = station.get("oee", 0.0)
    target_oee = station.get("targetOEE", 85.0)
    
    return actual_oee < target_oee * 0.9


def get_efficiency_issues() -> List[Dict[str, object]]:
    """Return list of stations with efficiency issues."""
    issues = []
    for station in STATION_DATA:
        if is_low_efficiency(station):
            attributes = station.get("attributes", {})
            oee_breakdown = attributes.get("oeeBreakdown", {})
            issues.append({
                "id": station["id"],
                "name": station["name"],
                "processGroup": station.get("processGroup", ""),
                "location": station["location"],
                "actualOEE": station.get("oee", 0.0),
                "targetOEE": station.get("targetOEE", 85.0),
                "oeeBreakdown": {
                    "availability": oee_breakdown.get("availability", 0.0),
                    "performance": oee_breakdown.get("performance", 0.0),
                    "quality": oee_breakdown.get("quality", 0.0),
                },
            })
    return issues


def get_spaghetti_paths_statistics(hours: int = 24) -> Dict[str, object]:
    """
    Return path statistics for Spaghetti diagram.
    
    Returns:
    - paths: List of path data with frequency
    - totalPaths: Total number of paths
    - maxFrequency: Maximum frequency value
    - pathSegments: Path segments with frequency counts
    """
    paths = get_spaghetti_paths(hours)
    
    # Calculate path segment frequencies
    segment_freq: Dict[str, int] = {}
    for path in paths:
        path_points = path.get("path", [])
        for i in range(len(path_points) - 1):
            start = path_points[i]["coordinates"]
            end = path_points[i + 1]["coordinates"]
            segment_key = f"{start[0]},{start[1]}-{end[0]},{end[1]}"
            segment_freq[segment_key] = segment_freq.get(segment_key, 0) + path.get("frequency", 1)
    
    max_frequency = max([p.get("frequency", 1) for p in paths], default=1)
    
    return {
        "paths": paths,
        "totalPaths": len(paths),
        "maxFrequency": max_frequency,
        "pathSegments": segment_freq,
    }



