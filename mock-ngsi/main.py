"""Lightweight NGSI-LD mock service for local development."""

from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

DEFAULT_CONTEXT = [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/production-context.jsonld",
]

STATIC_ENTITIES: List[Dict[str, Any]] = [
    {
        "id": "urn:ngsi-ld:TwinObject:Station:ST-GZ-01",
        "type": "TwinObject",
        "subType": {"type": "Property", "value": "Station"},
        "twinType": {"type": "Property", "value": "Constituent"},
        "name": {"type": "Property", "value": "组焊台位-01"},
        "status": {"type": "Property", "value": "Running"},
        "location": {
            "type": "GeoProperty",
            "value": {"type": "Point", "coordinates": [60, 130]},
        },
        "@context": DEFAULT_CONTEXT,
    },
    {
        "id": "urn:ngsi-ld:TwinObject:AutoEquipment:RBT-01",
        "type": "TwinObject",
        "subType": {"type": "Property", "value": "AutoEquipment"},
        "twinType": {"type": "Property", "value": "Constituent"},
        "name": {"type": "Property", "value": "焊接机器人-01"},
        "status": {"type": "Property", "value": "Running"},
        "location": {
            "type": "GeoProperty",
            "value": {"type": "Point", "coordinates": [140, 110]},
        },
        "@context": DEFAULT_CONTEXT,
    },
    {
        "id": "urn:ngsi-ld:TwinObject:Workpiece:M670-SN001",
        "type": "TwinObject",
        "subType": {"type": "Property", "value": "Workpiece"},
        "twinType": {"type": "Property", "value": "Transitional"},
        "name": {"type": "Property", "value": "侧墙半成品#001"},
        "status": {"type": "Property", "value": "InProcess"},
        "location": {
            "type": "GeoProperty",
            "value": {"type": "Point", "coordinates": [210, 150]},
        },
        "@context": DEFAULT_CONTEXT,
    },
    {
        "id": "urn:ngsi-ld:TwinObject:Person:EMP-001",
        "type": "TwinObject",
        "subType": {"type": "Property", "value": "Person"},
        "twinType": {"type": "Property", "value": "Constituent"},
        "name": {"type": "Property", "value": "张三"},
        "status": {"type": "Property", "value": "Working"},
        "location": {
            "type": "GeoProperty",
            "value": {"type": "Point", "coordinates": [330, 120]},
        },
        "@context": DEFAULT_CONTEXT,
    },
]


@lru_cache(maxsize=1)
def load_trajectory_payload() -> Optional[Dict[str, Any]]:
    path = Path(
        os.environ.get("MOCK_TRAJECTORY_FILE", "/data/trajectory_7days_sample.json")
    )
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


app = FastAPI(title="Mock NGSI-LD service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _match_type(entity: Dict[str, Any], target: str) -> bool:
    type_value = entity.get("type", "")
    subtype_value = entity.get("subType", {}).get("value", "")
    return target in {type_value.lower(), subtype_value.lower()}


@app.get("/health")
def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/ngsi-ld/v1/entities")
def list_entities(
    entity_type: Optional[str] = Query(default=None, alias="type"),
    limit: Optional[int] = Query(default=None),
) -> List[Dict[str, Any]]:
    if entity_type:
        filtered = [
            entity
            for entity in STATIC_ENTITIES
            if _match_type(entity, entity_type.lower())
        ]
    else:
        filtered = STATIC_ENTITIES
    if limit is not None:
        return filtered[:limit]
    return filtered


@app.get("/ngsi-ld/v1/entities/{entity_id}")
def get_entity(entity_id: str) -> Dict[str, Any]:
    for entity in STATIC_ENTITIES:
        if entity["id"] == entity_id:
            return entity
    raise HTTPException(status_code=404, detail="Entity not found")


@app.get("/ngsi-ld/v1/temporal/entities/{entity_id}")
def get_temporal_entity(entity_id: str) -> Dict[str, Any]:
    payload = load_trajectory_payload()
    if not payload or payload.get("entityId") != entity_id:
        raise HTTPException(status_code=404, detail="Trajectory not found")

    values = [
        {
            "observedAt": point["ts"],
            "value": {"type": "Point", "coordinates": [point["x"], point["y"]]},
        }
        for point in payload.get("points", [])
    ]

    return {
        "id": entity_id,
        "type": "TwinObject",
        "location": {"type": "GeoProperty", "values": values},
        "timeFrame": {
            "type": "Property",
            "value": {
                "start": payload.get("startDate"),
                "end": payload.get("endDate"),
            },
        },
        "@context": DEFAULT_CONTEXT,
    }

