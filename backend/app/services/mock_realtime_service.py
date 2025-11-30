"""Mock dataset for realtime equipment / workpiece / personnel entities."""

from __future__ import annotations

import random
import time
from typing import Dict, List, Literal, TypedDict, cast

from shared.types.ngsi import GeoPoint


Coordinate = List[float]


class BaseEntity(TypedDict, total=False):
    id: str
    name: str
    entityType: Literal["Equipment", "Workpiece", "Person", "Station"]
    status: str
    location: GeoPoint
    attributes: Dict[str, object]


class StationEntity(TypedDict, total=False):
    id: str
    name: str
    entityType: Literal["Station"]
    status: str
    location: GeoPoint
    processGroup: str
    wipCount: int
    avgProcessTime: float
    standardCT: float
    targetOEE: float
    oee: float
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
            "recentDefectRate24h": 2.1,
            "qualityThreshold": 3.0,
            "oeeBreakdown": {
                "availability": 0.92,
                "performance": 0.94,
                "quality": 0.995,
            },
        },
    },
    {
        "id": "urn:ngsi-ld:Equipment:Robot-02",
        "name": "焊接机器人-02",
        "entityType": "Equipment",
        "status": "Idle",
        "location": {"type": "Point", "coordinates": [140, 110]},
        "attributes": {
            "type": "robot",
            "oee": 80.5,
            "temperature": 38.0,
            "recentDefectRate24h": 3.5,
            "qualityThreshold": 3.0,
            "oeeBreakdown": {
                "availability": 0.88,
                "performance": 0.91,
                "quality": 0.985,
            },
        },
    },
    {
        "id": "urn:ngsi-ld:Equipment:Machining-01",
        "name": "加工中心-01",
        "entityType": "Equipment",
        "status": "Running",
        "location": {"type": "Point", "coordinates": [520, 90]},
        "attributes": {
            "type": "cnc",
            "oee": 91.0,
            "temperature": 52.1,
            "recentDefectRate24h": 1.2,
            "qualityThreshold": 2.5,
            "oeeBreakdown": {
                "availability": 0.95,
                "performance": 0.96,
                "quality": 0.998,
            },
        },
    },
    {
        "id": "urn:ngsi-ld:Equipment:Robot-03",
        "name": "焊接机器人-03",
        "entityType": "Equipment",
        "status": "Fault",
        "location": {"type": "Point", "coordinates": [220, 110]},
        "attributes": {
            "type": "robot",
            "oee": 65.3,
            "temperature": 58.5,
            "recentDefectRate24h": 4.8,
            "qualityThreshold": 3.0,
            "oeeBreakdown": {
                "availability": 0.75,
                "performance": 0.82,
                "quality": 0.96,
            },
        },
    },
]

STATION_DATA: List[StationEntity] = [
    {
        "id": "urn:ngsi-ld:Station:ST-GZ-01",
        "name": "ST-GZ-01",
        "entityType": "Station",
        "status": "Running",
        "location": {"type": "Point", "coordinates": [60, 130]},
        "processGroup": "组焊工序区",
        "wipCount": 5,
        "avgProcessTime": 145.0,
        "standardCT": 120.0,
        "targetOEE": 85.0,
        "oee": 82.5,
        "attributes": {"type": "welding", "capacity": 10},
    },
    {
        "id": "urn:ngsi-ld:Station:ST-GZ-02",
        "name": "ST-GZ-02",
        "entityType": "Station",
        "status": "Idle",
        "location": {"type": "Point", "coordinates": [60, 80]},
        "processGroup": "组焊工序区",
        "wipCount": 2,
        "avgProcessTime": 108.0,
        "standardCT": 105.0,
        "targetOEE": 85.0,
        "oee": 87.2,
        "attributes": {"type": "welding", "capacity": 8},
    },
    {
        "id": "urn:ngsi-ld:Station:ST-GZ-03",
        "name": "ST-GZ-03",
        "entityType": "Station",
        "status": "Running",
        "location": {"type": "Point", "coordinates": [140, 130]},
        "processGroup": "组焊工序区",
        "wipCount": 8,
        "avgProcessTime": 142.0,
        "standardCT": 114.0,
        "targetOEE": 85.0,
        "oee": 80.1,
        "attributes": {"type": "welding", "capacity": 10},
    },
    {
        "id": "urn:ngsi-ld:Station:ST-GZ-05",
        "name": "ST-GZ-05",
        "entityType": "Station",
        "status": "Running",
        "location": {"type": "Point", "coordinates": [300, 130]},
        "processGroup": "组焊工序区",
        "wipCount": 12,
        "avgProcessTime": 95.0,
        "standardCT": 79.0,
        "targetOEE": 85.0,
        "oee": 70.5,
        "attributes": {"type": "welding", "capacity": 10, "oeeBreakdown": {"availability": 0.80, "performance": 0.88, "quality": 0.90}},
    },
    {
        "id": "urn:ngsi-ld:Station:ST-RW-01",
        "name": "ST-RW-01",
        "entityType": "Station",
        "status": "Running",
        "location": {"type": "Point", "coordinates": [220, 130]},
        "processGroup": "圆顶焊接",
        "wipCount": 3,
        "avgProcessTime": 88.0,
        "standardCT": 85.0,
        "targetOEE": 85.0,
        "oee": 75.3,
        "attributes": {"type": "welding", "capacity": 8, "oeeBreakdown": {"availability": 0.82, "performance": 0.90, "quality": 0.92}},
    },
    {
        "id": "urn:ngsi-ld:Station:ST-TX-01",
        "name": "ST-TX-01",
        "entityType": "Station",
        "status": "Running",
        "location": {"type": "Point", "coordinates": [420, 130]},
        "processGroup": "调修工序区",
        "wipCount": 1,
        "avgProcessTime": 94.0,
        "standardCT": 92.0,
        "targetOEE": 85.0,
        "oee": 90.1,
        "attributes": {"type": "adjustment", "capacity": 6},
    },
]

WORKPIECE_DATA: List[BaseEntity] = [
    {
        "id": "urn:ngsi-ld:Workpiece:M670-SN001",
        "name": "侧墙#001",
        "entityType": "Workpiece",
        "status": "InProcess",
        "location": {"type": "Point", "coordinates": [220, 130]},  # 在ST-RW-01圆顶焊接工位
        "attributes": {"progress": 0.45, "queueTime": 180, "currentStation": "urn:ngsi-ld:Station:ST-RW-01"},
    },
    {
        "id": "urn:ngsi-ld:Workpiece:M670-SN002",
        "name": "侧墙#002",
        "entityType": "Workpiece",
        "status": "Delayed",
        "location": {"type": "Point", "coordinates": [300, 130]},  # 在ST-GZ-05组焊工位（瓶颈工位）
        "attributes": {"progress": 0.32, "queueTime": 620, "currentStation": "urn:ngsi-ld:Station:ST-GZ-05"},
    },
    {
        "id": "urn:ngsi-ld:Workpiece:M670-SN003",
        "name": "侧墙#003",
        "entityType": "Workpiece",
        "status": "InProcess",
        "location": {"type": "Point", "coordinates": [140, 130]},  # 在ST-GZ-03组焊工位
        "attributes": {"progress": 0.68, "queueTime": 45, "currentStation": "urn:ngsi-ld:Station:ST-GZ-03"},
    },
    {
        "id": "urn:ngsi-ld:Workpiece:M670-SN004",
        "name": "侧墙#004",
        "entityType": "Workpiece",
        "status": "InProcess",
        "location": {"type": "Point", "coordinates": [60, 130]},  # 在ST-GZ-01组焊工位
        "attributes": {"progress": 0.25, "queueTime": 120, "currentStation": "urn:ngsi-ld:Station:ST-GZ-01"},
    },
    {
        "id": "urn:ngsi-ld:Workpiece:M670-SN005",
        "name": "侧墙#005",
        "entityType": "Workpiece",
        "status": "InProcess",
        "location": {"type": "Point", "coordinates": [420, 130]},  # 在ST-TX-01调修工位
        "attributes": {"progress": 0.85, "queueTime": 30, "currentStation": "urn:ngsi-ld:Station:ST-TX-01"},
    },
]

PERSONNEL_DATA: List[BaseEntity] = [
    {
        "id": "urn:ngsi-ld:Person:EMP-001",
        "name": "张三",
        "entityType": "Person",
        "status": "Working",
        "location": {"type": "Point", "coordinates": [60, 80]},  # 在ST-GZ-02组焊工位附近
        "attributes": {"role": "焊接工", "assignedStation": "urn:ngsi-ld:Station:ST-GZ-02"},
    },
    {
        "id": "urn:ngsi-ld:Person:EMP-002",
        "name": "李四",
        "entityType": "Person",
        "status": "Working",
        "location": {"type": "Point", "coordinates": [220, 130]},  # 在ST-RW-01圆顶焊接工位附近
        "attributes": {"role": "检测员", "assignedStation": "urn:ngsi-ld:Station:ST-RW-01"},
    },
    {
        "id": "urn:ngsi-ld:Person:EMP-003",
        "name": "王五",
        "entityType": "Person",
        "status": "Working",
        "location": {"type": "Point", "coordinates": [300, 130]},  # 在ST-GZ-05组焊工位附近
        "attributes": {"role": "焊接工", "assignedStation": "urn:ngsi-ld:Station:ST-GZ-05"},
    },
    {
        "id": "urn:ngsi-ld:Person:EMP-004",
        "name": "赵六",
        "entityType": "Person",
        "status": "Working",
        "location": {"type": "Point", "coordinates": [420, 130]},  # 在ST-TX-01调修工位附近
        "attributes": {"role": "调修工", "assignedStation": "urn:ngsi-ld:Station:ST-TX-01"},
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
    if not type_set or "station" in type_set:
        payload["stations"] = STATION_DATA
    return payload


def get_stations() -> List[StationEntity]:
    """Return all station entities."""
    return STATION_DATA


def get_equipment() -> List[BaseEntity]:
    """Return all equipment entities."""
    return EQUIPMENT_DATA


def _random_coord(coord: Coordinate) -> Coordinate:
    jitter = lambda: random.uniform(-1.5, 1.5)
    return [coord[0] + jitter(), coord[1] + jitter()]


def generate_updates() -> Dict[str, object]:
    """Simulate incremental updates for websocket consumers."""
    equipment = random.choice(EQUIPMENT_DATA)
    equipment["status"] = random.choice(["Running", "Idle", "Fault"])
    equipment_location = cast(GeoPoint, equipment["location"])
    equipment_location["coordinates"] = _random_coord(equipment_location["coordinates"])

    workpiece = random.choice(WORKPIECE_DATA)
    workpiece["attributes"]["progress"] = min(  # type: ignore[index]
        1.0, workpiece["attributes"]["progress"] + random.uniform(0.05, 0.15)
    )
    workpiece_location = cast(GeoPoint, workpiece["location"])
    workpiece_location["coordinates"] = _random_coord(workpiece_location["coordinates"])

    person = random.choice(PERSONNEL_DATA)
    person["status"] = random.choice(["Working", "Break", "Idle"])
    person_location = cast(GeoPoint, person["location"])
    person_location["coordinates"] = _random_coord(person_location["coordinates"])

    return {
        "type": "entityUpdate",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S+08:00"),
        "entities": [equipment, workpiece, person],
    }


# 历史路径数据（用于 Spaghetti 图）
# 模拟过去24小时的物料流转路径，基于实际工位坐标和生产流程
# 工艺流程：组焊工序区(ST-GZ-01/02/03) -> 圆顶焊接(ST-RW-01) -> 组焊工序区(ST-GZ-05) -> 调修工序区(ST-TX-01) -> 加工中心
SPAGHETTI_PATH_DATA: List[Dict[str, object]] = [
    {
        "id": "path-001",
        "workpieceId": "urn:ngsi-ld:Workpiece:M670-SN001",
        "path": [
            {"timestamp": "2024-11-18T06:00:00Z", "coordinates": [60, 130]},  # ST-GZ-01 组焊工位1
            {"timestamp": "2024-11-18T06:25:00Z", "coordinates": [140, 130]},  # ST-GZ-03 组焊工位3
            {"timestamp": "2024-11-18T06:50:00Z", "coordinates": [220, 130]},  # ST-RW-01 圆顶焊接
            {"timestamp": "2024-11-18T07:20:00Z", "coordinates": [300, 130]},  # ST-GZ-05 组焊工位5
            {"timestamp": "2024-11-18T07:50:00Z", "coordinates": [420, 130]},  # ST-TX-01 调修工位
            {"timestamp": "2024-11-18T08:25:00Z", "coordinates": [520, 90]},  # Machining-01 加工中心
        ],
        "frequency": 18,  # 标准流程路径，使用频率最高
    },
    {
        "id": "path-002",
        "workpieceId": "urn:ngsi-ld:Workpiece:M670-SN002",
        "path": [
            {"timestamp": "2024-11-18T06:15:00Z", "coordinates": [60, 80]},  # ST-GZ-02 组焊工位2
            {"timestamp": "2024-11-18T06:40:00Z", "coordinates": [140, 130]},  # ST-GZ-03 组焊工位3
            {"timestamp": "2024-11-18T07:05:00Z", "coordinates": [220, 130]},  # ST-RW-01 圆顶焊接
            {"timestamp": "2024-11-18T07:35:00Z", "coordinates": [300, 130]},  # ST-GZ-05 组焊工位5
            {"timestamp": "2024-11-18T08:05:00Z", "coordinates": [420, 130]},  # ST-TX-01 调修工位
            {"timestamp": "2024-11-18T08:40:00Z", "coordinates": [520, 90]},  # Machining-01 加工中心
        ],
        "frequency": 15,  # 标准流程路径，使用频率高
    },
    {
        "id": "path-003",
        "workpieceId": "urn:ngsi-ld:Workpiece:M670-SN003",
        "path": [
            {"timestamp": "2024-11-18T07:00:00Z", "coordinates": [60, 130]},  # ST-GZ-01 组焊工位1
            {"timestamp": "2024-11-18T07:25:00Z", "coordinates": [140, 130]},  # ST-GZ-03 组焊工位3
            {"timestamp": "2024-11-18T07:50:00Z", "coordinates": [220, 130]},  # ST-RW-01 圆顶焊接
            {"timestamp": "2024-11-18T08:20:00Z", "coordinates": [300, 130]},  # ST-GZ-05 组焊工位5
            {"timestamp": "2024-11-18T08:50:00Z", "coordinates": [420, 130]},  # ST-TX-01 调修工位
        ],
        "frequency": 12,  # 标准流程路径，部分工件在调修后直接下线
    },
    {
        "id": "path-004",
        "workpieceId": "urn:ngsi-ld:Workpiece:M670-SN004",
        "path": [
            {"timestamp": "2024-11-18T06:30:00Z", "coordinates": [60, 130]},  # ST-GZ-01 组焊工位1
            {"timestamp": "2024-11-18T07:00:00Z", "coordinates": [220, 130]},  # ST-RW-01 圆顶焊接（跳过ST-GZ-03）
            {"timestamp": "2024-11-18T07:30:00Z", "coordinates": [300, 130]},  # ST-GZ-05 组焊工位5
            {"timestamp": "2024-11-18T08:00:00Z", "coordinates": [420, 130]},  # ST-TX-01 调修工位
        ],
        "frequency": 8,  # 简化流程路径，部分工件跳过中间工位
    },
    {
        "id": "path-005",
        "workpieceId": "urn:ngsi-ld:Workpiece:M670-SN005",
        "path": [
            {"timestamp": "2024-11-18T08:00:00Z", "coordinates": [60, 80]},  # ST-GZ-02 组焊工位2
            {"timestamp": "2024-11-18T08:25:00Z", "coordinates": [140, 130]},  # ST-GZ-03 组焊工位3
            {"timestamp": "2024-11-18T08:50:00Z", "coordinates": [220, 130]},  # ST-RW-01 圆顶焊接
            {"timestamp": "2024-11-18T09:20:00Z", "coordinates": [300, 130]},  # ST-GZ-05 组焊工位5（返工路径）
            {"timestamp": "2024-11-18T09:50:00Z", "coordinates": [220, 130]},  # ST-RW-01 圆顶焊接（返工）
            {"timestamp": "2024-11-18T10:20:00Z", "coordinates": [300, 130]},  # ST-GZ-05 组焊工位5
            {"timestamp": "2024-11-18T10:50:00Z", "coordinates": [420, 130]},  # ST-TX-01 调修工位
        ],
        "frequency": 5,  # 返工路径，频率较低
    },
    {
        "id": "path-006",
        "workpieceId": "urn:ngsi-ld:Workpiece:M670-SN006",
        "path": [
            {"timestamp": "2024-11-18T09:00:00Z", "coordinates": [60, 130]},  # ST-GZ-01 组焊工位1
            {"timestamp": "2024-11-18T09:30:00Z", "coordinates": [140, 130]},  # ST-GZ-03 组焊工位3
            {"timestamp": "2024-11-18T10:00:00Z", "coordinates": [220, 130]},  # ST-RW-01 圆顶焊接
            {"timestamp": "2024-11-18T10:30:00Z", "coordinates": [300, 130]},  # ST-GZ-05 组焊工位5
            {"timestamp": "2024-11-18T11:00:00Z", "coordinates": [420, 130]},  # ST-TX-01 调修工位
            {"timestamp": "2024-11-18T11:35:00Z", "coordinates": [520, 90]},  # Machining-01 加工中心
        ],
        "frequency": 10,  # 标准流程路径
    },
]


def get_spaghetti_paths(hours: int = 24) -> List[Dict[str, object]]:
    """Return historical path data for Spaghetti diagram."""
    return SPAGHETTI_PATH_DATA

