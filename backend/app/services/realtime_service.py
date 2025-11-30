"""真实实时数据服务。

基于NGSI-LD的实时数据获取，替换mock版本。
"""

from __future__ import annotations

from typing import Any, Optional

from app.core.ngsi_client import NGSIClient
from app.services.entity_service import EntityService


class RealtimeService:
    """实时数据服务类。"""

    def __init__(
        self,
        ngsi_client: Optional[NGSIClient] = None,
        entity_service: Optional[EntityService] = None,
    ):
        """初始化实时数据服务。

        Args:
            ngsi_client: NGSI-LD客户端
            entity_service: 实体服务
        """
        self.ngsi_client = ngsi_client or NGSIClient()
        self.entity_service = entity_service or EntityService(self.ngsi_client)

    async def get_realtime_entities(self) -> list[dict[str, Any]]:
        """获取实时实体列表。

        Returns:
            实时实体列表

        TODO: 实现基于NGSI-LD的实时数据获取
        """
        # TODO: 查询所有TwinObject实体，过滤出有实时状态的实体
        # entities = await self.entity_service.query_entities(
        #     EntityQueryRequest(entity_type="TwinObject")
        # )
        # return [self._format_realtime_entity(e) for e in entities]
        raise NotImplementedError("NGSI-LD client not implemented yet")

    def _format_realtime_entity(self, entity: dict[str, Any]) -> dict[str, Any]:
        """格式化实体为实时实体格式。

        Args:
            entity: 原始实体数据

        Returns:
            格式化后的实时实体
        """
        # TODO: 从NGSI-LD格式转换为实时实体格式
        return {
            "id": entity.get("id"),
            "type": entity.get("type"),
            "name": self._extract_property_value(entity, "name"),
            "location": self._extract_geoproperty(entity, "location"),
            "status": self._extract_property_value(entity, "status"),
            "lastUpdated": self._extract_property_value(entity, "observedAt"),
        }

    def _extract_property_value(self, entity: dict[str, Any], attr: str) -> Optional[Any]:
        """提取Property类型的属性值。

        Args:
            entity: 实体数据
            attr: 属性名

        Returns:
            属性值
        """
        prop = entity.get(attr)
        if isinstance(prop, dict) and prop.get("type") == "Property":
            return prop.get("value")
        return None

    def _extract_geoproperty(self, entity: dict[str, Any], attr: str) -> Optional[dict[str, Any]]:
        """提取GeoProperty类型的属性值。

        Args:
            entity: 实体数据
            attr: 属性名

        Returns:
            GeoJSON对象
        """
        geoprop = entity.get(attr)
        if isinstance(geoprop, dict) and geoprop.get("type") == "GeoProperty":
            return geoprop.get("value")
        return None


# 全局实时服务实例
_realtime_service: Optional[RealtimeService] = None


def get_realtime_service() -> RealtimeService:
    """获取全局实时服务实例。

    Returns:
        RealtimeService实例
    """
    global _realtime_service
    if _realtime_service is None:
        _realtime_service = RealtimeService()
    return _realtime_service

