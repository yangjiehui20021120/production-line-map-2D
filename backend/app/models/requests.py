"""API请求参数验证模型。

定义所有API端点的请求参数验证模型。
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.models.contracts import (
    TwinObjectSubType,
    MBOMType,
    SceneLevel,
    ENTITY_TYPE_TWIN_OBJECT,
    ENTITY_TYPE_MBOM,
    ENTITY_TYPE_SCENE,
)


# ============================================================================
# 实体查询请求
# ============================================================================

class EntityQueryRequest(BaseModel):
    """实体查询请求"""
    entity_type: Optional[str] = Field(
        None,
        alias="entityType",
        description="实体类型：TwinObject, MBOM, Scene等"
    )
    q: Optional[str] = Field(
        None,
        description="NGSI-LD查询字符串"
    )
    sub_type: Optional[str] = Field(
        None,
        alias="subType",
        description="子类型（如TwinObject的subType）"
    )
    ids: Optional[list[str]] = Field(
        None,
        description="实体ID列表（URN格式）"
    )
    limit: int = Field(
        default=100,
        ge=1,
        le=1000,
        description="返回结果数量限制"
    )
    offset: int = Field(
        default=0,
        ge=0,
        description="分页偏移量"
    )
    attrs: Optional[list[str]] = Field(
        None,
        description="需要返回的属性列表（逗号分隔）"
    )
    options: Optional[str] = Field(
        None,
        description="查询选项：keyValues, sysAttrs等"
    )


class TwinObjectQueryRequest(EntityQueryRequest):
    """TwinObject查询请求"""
    entity_type: Literal["TwinObject"] = ENTITY_TYPE_TWIN_OBJECT
    sub_type: Optional[TwinObjectSubType] = Field(
        None,
        alias="subType",
        description="TwinObject子类型"
    )
    twin_type: Optional[str] = Field(
        None,
        alias="twinType",
        description="顶层分类：Constituent或Transitional"
    )
    function_category: Optional[str] = Field(
        None,
        alias="functionCategory",
        description="生产功能分类"
    )


class MBOMQueryRequest(EntityQueryRequest):
    """MBOM查询请求"""
    entity_type: Literal["MBOM"] = ENTITY_TYPE_MBOM
    mbom_type: Optional[MBOMType] = Field(
        None,
        alias="mbomType",
        description="MBOM子类型"
    )
    status: Optional[str] = Field(
        None,
        description="MBOM状态"
    )
    product_code: Optional[str] = Field(
        None,
        alias="productCode",
        description="产品代码"
    )


class SceneQueryRequest(EntityQueryRequest):
    """Scene查询请求"""
    entity_type: Literal["Scene"] = ENTITY_TYPE_SCENE
    scene_level: Optional[SceneLevel] = Field(
        None,
        alias="sceneLevel",
        description="场景层级"
    )
    status: Optional[str] = Field(
        None,
        description="执行状态"
    )
    workpiece_id: Optional[str] = Field(
        None,
        alias="workpieceId",
        description="工件ID（URN）"
    )
    start_time: Optional[datetime] = Field(
        None,
        alias="startTime",
        description="开始时间"
    )
    end_time: Optional[datetime] = Field(
        None,
        alias="endTime",
        description="结束时间"
    )


# ============================================================================
# 轨迹查询请求
# ============================================================================

class TrajectorySearchRequest(BaseModel):
    """轨迹搜索请求"""
    entity_type: Optional[Literal["equipment", "workpiece", "personnel"]] = Field(
        None,
        alias="entityType",
        description="实体类型"
    )
    start: Optional[datetime] = Field(
        None,
        description="开始时间"
    )
    end: Optional[datetime] = Field(
        None,
        description="结束时间"
    )


class TrajectoryDetailRequest(BaseModel):
    """轨迹详情请求"""
    entity_id: str = Field(..., alias="entityId", description="实体ID")
    start: Optional[datetime] = Field(None, description="开始时间")
    end: Optional[datetime] = Field(None, description="结束时间")
    max_points: int = Field(
        default=500,
        ge=10,
        le=5000,
        alias="maxPoints",
        description="最大点数"
    )


# ============================================================================
# 地图查询请求
# ============================================================================

class MapQueryRequest(BaseModel):
    """地图查询请求"""
    layer: Optional[str] = Field(None, description="图层名称")
    bbox: Optional[list[float]] = Field(
        None,
        description="边界框 [minLon, minLat, maxLon, maxLat]",
        min_length=4,
        max_length=4
    )
    zoom: Optional[int] = Field(None, ge=0, le=20, description="缩放级别")


class BasemapRequest(BaseModel):
    """底图数据请求"""
    format: Literal["geojson", "json"] = Field(
        default="geojson",
        description="返回格式"
    )


# ============================================================================
# KPI查询请求
# ============================================================================

class KPIQueryRequest(BaseModel):
    """KPI查询请求"""
    kpi_ids: Optional[list[str]] = Field(
        None,
        alias="kpiIds",
        description="KPI ID列表"
    )
    start_time: Optional[datetime] = Field(
        None,
        alias="startTime",
        description="开始时间"
    )
    end_time: Optional[datetime] = Field(
        None,
        alias="endTime",
        description="结束时间"
    )


# ============================================================================
# 分析查询请求
# ============================================================================

class AnalysisQueryRequest(BaseModel):
    """分析查询请求基类"""
    start_time: Optional[datetime] = Field(
        None,
        alias="startTime",
        description="开始时间"
    )
    end_time: Optional[datetime] = Field(
        None,
        alias="endTime",
        description="结束时间"
    )
    limit: int = Field(default=100, ge=1, le=1000, description="结果数量限制")


class BottleneckAnalysisRequest(AnalysisQueryRequest):
    """瓶颈分析请求"""
    station_ids: Optional[list[str]] = Field(
        None,
        alias="stationIds",
        description="工位ID列表"
    )
    min_delay: Optional[float] = Field(
        None,
        alias="minDelay",
        description="最小延迟时间（秒）"
    )


class QualityIssuesRequest(AnalysisQueryRequest):
    """质量问题查询请求"""
    severity: Optional[Literal["low", "medium", "high", "critical"]] = Field(
        None,
        description="严重程度"
    )
    station_ids: Optional[list[str]] = Field(
        None,
        alias="stationIds",
        description="工位ID列表"
    )


class EfficiencyIssuesRequest(AnalysisQueryRequest):
    """效率问题查询请求"""
    threshold: Optional[float] = Field(
        None,
        description="效率阈值（百分比）"
    )
    entity_type: Optional[str] = Field(
        None,
        alias="entityType",
        description="实体类型"
    )


class SpaghettiPathsRequest(AnalysisQueryRequest):
    """路径统计请求"""
    entity_type: Optional[Literal["equipment", "workpiece", "personnel"]] = Field(
        None,
        alias="entityType",
        description="实体类型"
    )
    min_frequency: Optional[int] = Field(
        None,
        alias="minFrequency",
        ge=1,
        description="最小频率"
    )

