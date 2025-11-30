"""API响应格式定义。

定义所有API端点的标准响应格式。
"""

from __future__ import annotations

from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


# ============================================================================
# 标准响应格式
# ============================================================================

class StandardResponse(BaseModel, Generic[T]):
    """标准响应格式"""
    success: bool = Field(..., description="请求是否成功")
    data: T = Field(..., description="响应数据")
    message: Optional[str] = Field(None, description="响应消息")
    timestamp: Optional[str] = Field(None, description="响应时间戳")


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应格式"""
    success: bool = Field(..., description="请求是否成功")
    data: list[T] = Field(..., description="响应数据列表")
    total: int = Field(..., description="总记录数")
    limit: int = Field(..., description="每页数量")
    offset: int = Field(..., description="偏移量")
    has_more: bool = Field(..., alias="hasMore", description="是否有更多数据")


# ============================================================================
# 错误响应
# ============================================================================

class ErrorDetail(BaseModel):
    """错误详情"""
    code: str = Field(..., description="错误代码")
    message: str = Field(..., description="错误消息")
    field: Optional[str] = Field(None, description="错误字段（如有）")


class ErrorResponse(BaseModel):
    """错误响应格式"""
    success: bool = Field(default=False, description="请求是否成功")
    error: ErrorDetail = Field(..., description="错误详情")
    timestamp: Optional[str] = Field(None, description="错误时间戳")


# ============================================================================
# 实体响应
# ============================================================================

class EntityListResponse(BaseModel, Generic[T]):
    """实体列表响应"""
    success: bool = Field(..., description="请求是否成功")
    data: list[T] = Field(..., description="实体列表")
    count: int = Field(..., description="实体数量")
    timestamp: Optional[str] = Field(None, description="响应时间戳")


class EntityDetailResponse(BaseModel, Generic[T]):
    """实体详情响应"""
    success: bool = Field(..., description="请求是否成功")
    data: T = Field(..., description="实体详情")
    timestamp: Optional[str] = Field(None, description="响应时间戳")


# ============================================================================
# 轨迹响应
# ============================================================================

class TrajectoryPoint(BaseModel):
    """轨迹点"""
    ts: str = Field(..., description="时间戳")
    position: dict[str, Any] = Field(..., description="位置信息（GeoJSON Point）")
    status: Optional[str] = Field(None, description="状态")


class TrajectorySeries(BaseModel):
    """轨迹序列"""
    entity_id: str = Field(..., alias="entityId", description="实体ID")
    entity_type: Optional[str] = Field(None, alias="entityType", description="实体类型")
    name: Optional[str] = Field(None, description="实体名称")
    points: list[TrajectoryPoint] = Field(..., description="轨迹点列表")
    start_time: Optional[str] = Field(None, alias="startTime", description="开始时间")
    end_time: Optional[str] = Field(None, alias="endTime", description="结束时间")


class TrajectorySearchResponse(StandardResponse[list[dict[str, Any]]]):
    """轨迹搜索响应"""
    pass


class TrajectoryDetailResponse(StandardResponse[TrajectorySeries]):
    """轨迹详情响应"""
    pass


# ============================================================================
# 地图响应
# ============================================================================

class BasemapResponse(StandardResponse[dict[str, Any]]):
    """底图数据响应"""
    pass


class LayerConfigResponse(StandardResponse[list[dict[str, Any]]]):
    """图层配置响应"""
    pass


# ============================================================================
# 实时数据响应
# ============================================================================

class RealtimeEntity(BaseModel):
    """实时实体"""
    id: str = Field(..., description="实体ID")
    type: str = Field(..., description="实体类型")
    name: Optional[str] = Field(None, description="实体名称")
    location: Optional[dict[str, Any]] = Field(None, description="位置信息")
    status: Optional[str] = Field(None, description="状态")
    last_updated: Optional[str] = Field(None, alias="lastUpdated", description="最后更新时间")


class RealtimeEntitiesResponse(StandardResponse[list[RealtimeEntity]]):
    """实时实体列表响应"""
    pass

