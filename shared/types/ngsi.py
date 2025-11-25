from pydantic import BaseModel, Field
from typing import Literal, Union, List, Optional, TypedDict


class GeoPoint(TypedDict):
    type: Literal["Point"]
    coordinates: List[float]


class GeoPolygon(TypedDict):
    type: Literal["Polygon"]
    coordinates: List[List[List[float]]]


class Property(BaseModel):
    type: Literal["Property"] = "Property"
    value: Union[str, float, int, bool]


class GeoProperty(BaseModel):
    type: Literal["GeoProperty"] = "GeoProperty"
    value: Union[GeoPoint, GeoPolygon]


class Relationship(BaseModel):
    type: Literal["Relationship"] = "Relationship"
    object: str


class TwinObject(BaseModel):
    id: str
    type: Literal["Zone", "Station", "Robot", "Person", "Workpiece", "Buffer"]
    name: Property
    location: GeoProperty
    status: Optional[Property] = None
    processStep: Optional[Property] = None
    stdCycleTime: Optional[Property] = None
    refScene: Optional[Relationship] = None
    refMBOM: Optional[Relationship] = None
    context: Optional[Union[str, list[str]]] = Field(None, alias="@context")


class KPIThreshold(BaseModel):
    green: float
    yellow: float


class KPIItem(BaseModel):
    id: str
    name: str
    value: float
    unit: str
    target: float
    threshold: KPIThreshold
    status: Literal["green", "yellow", "red"]
    trend: Literal["up", "down", "stable"]
    observedAt: str


class KPIResponse(BaseModel):
    success: bool
    data: list[KPIItem]
    lastUpdated: str

