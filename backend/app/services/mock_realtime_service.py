"""Mock dataset for realtime equipment / workpiece / personnel entities."""

from __future__ import annotations

import random
import time
from typing import Dict, List, Literal, TypedDict


Coordinate = List[float]


class BaseEntity(TypedDict, total=False):
    id: str
    name: str
    entityType: Literal["Equipment", "Workpiece", "Person"]
    status: str
    location: Dict[str, object]
    attributes: Dict[str, object]


EQUIPMENT_DATA: List[BaseEntity] = [
    {
        "id": "urn:ngsi-ld:Equipment:Robot-01",
        "name": "焊接机器人-01",
        "entityType": "Equipment",
        "status": "Running",
        "location": {"type": "Point", "coordinates": [60, 110]},
        "attributes": {
            "type": "robot",
            "oee": 86.2,
            "temperature": 45.3,
        },
    },
    {
        "id": "urn:ngsi-ld:Equipment:Robot-02",
        "name": "焊接机器人-02",
        "entityType": "Equipment",
        "status": "Idle",
        "location": {"type": "Point", "coordinates": [140, 110]},
        "attributes": {"type": "robot", "oee": 80.5, "temperature": 38.0},
    },
    {
        "id": "urn:ngsi-ld:Equipment:Machining-01",
        "name": "加工中心-01",
        "entityType": "Equipment",
        "status": "Running",
        "location": {"type": "Point", "coordinates": [520, 90]},
        "attributes": {"type": "cnc", "oee": 91.0, "temperature": 52.1},
    },
]

WORKPIECE_DATA: List[BaseEntity] = [
    {
        "id": "urn:ngsi-ld:Workpiece:M670-SN001",
        "name": "侧墙#001",
        "entityType": "Workpiece",
        "status": "InProcess",
        "location": {"type": "Point", "coordinates": [190, 150]},
        "attributes": {"progress": 0.45, "queueTime": 180},
    },
    {
        "id": "urn:ngsi-ld:Workpiece:M670-SN002",
        "name": "侧墙#002",
        "entityType": "Workpiece",
        "status": "Delayed",
        "location": {"type": "Point", "coordinates": [280, 310]},
        "attributes": {"progress": 0.32, "queueTime": 620},
    },
]

PERSONNEL_DATA: List[BaseEntity] = [
    {
        "id": "urn:ngsi-ld:Person:EMP-001",
        "name": "张三",
        "entityType": "Person",
        "status": "Working",
        "location": {"type": "Point", "coordinates": [350, 120]},
        "attributes": {"role": "焊接工", "assignedStation": "ST-GZ-02"},
    },
    {
        "id": "urn:ngsi-ld:Person:EMP-002",
        "name": "李四",
        "entityType": "Person",
        "status": "Break",
        "location": {"type": "Point", "coordinates": [100, 260]},
        "attributes": {"role": "检测员", "assignedStation": "ST-RW-01"},
    },
]


def list_entities(types: List[str] | None = None) -> Dict[str, List[BaseEntity]]:
    """Return mock realtime data filtered by entity types."""
    type_set = {t.lower() for t in types} if types else None
    payload: Dict[str, List[BaseEntity]] = {}
    if not type_set or "equipment" in type_set:
        payload["equipment"] = EQUIPMENT_DATA
    if not type_set or "workpiece" in type_set:
        payload["workpieces"] = WORKPIECE_DATA
    if not type_set or "person" in type_set or "personnel" in type_set:
        payload["personnel"] = PERSONNEL_DATA
    return payload


def _random_coord(coord: Coordinate) -> Coordinate:
    jitter = lambda: random.uniform(-1.5, 1.5)
    return [coord[0] + jitter(), coord[1] + jitter()]


def generate_updates() -> Dict[str, object]:
    """Simulate incremental updates for websocket consumers."""
    equipment = random.choice(EQUIPMENT_DATA)
    equipment["status"] = random.choice(["Running", "Idle", "Fault"])
    equipment["location"]["coordinates"] = _random_coord(
        equipment["location"]["coordinates"]  # type: ignore[index]
    )

    workpiece = random.choice(WORKPIECE_DATA)
    workpiece["attributes"]["progress"] = min(
        1.0, workpiece["attributes"]["progress"] + random.uniform(0.05, 0.15)
    )  # type: ignore[index]
    workpiece["location"]["coordinates"] = _random_coord(
        workpiece["location"]["coordinates"]  # type: ignore[index]
    )

    person = random.choice(PERSONNEL_DATA)
    person["status"] = random.choice(["Working", "Break", "Idle"])
    person["location"]["coordinates"] = _random_coord(
        person["location"]["coordinates"]  # type: ignore[index]
    )

    return {
        "type": "entityUpdate",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S+08:00"),
        "entities": [equipment, workpiece, person],
    }

