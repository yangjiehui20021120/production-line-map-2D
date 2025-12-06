"""实体查询服务。

基于NGSI-LD的实体查询服务，支持TwinObject、Scene、MBOM等实体查询。
支持Mock模式和真实NGSI-LD客户端模式。
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.models.requests import EntityQueryRequest
from app.utils.validation import validate_urn, validate_entity_type

# 条件导入
if settings.USE_MOCK_DATA:
    from app.services.mock_ngsi_service import get_mock_ngsi_service
else:
    from app.core.ngsi_client import get_ngsi_client

# 缓存服务（可选）
try:
    from app.core.cache_service import get_cache_service
    CACHE_AVAILABLE = settings.USE_REDIS_CACHE
except Exception:
    CACHE_AVAILABLE = False


class EntityService:
    """实体查询服务类。"""

    def __init__(self):
        """初始化实体服务，根据配置选择使用Mock或真实客户端。"""
        self.use_mock = settings.USE_MOCK_DATA
        if self.use_mock:
            self._mock_service = get_mock_ngsi_service()
        else:
            self._mock_service = None
        self.cache_prefix = "entities"
        self.cache_ttl = getattr(settings, "ENTITY_CACHE_TTL", 300)

    async def get_entity(self, entity_id: str, options: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """获取单个实体（别名方法，兼容旧接口）。"""
        return await self.get_entity_by_id(entity_id, options)

    async def get_entity_by_id(self, entity_id: str, options: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """获取单个实体。

        Args:
            entity_id: 实体ID（URN格式）
            options: 选项（keyValues, sysAttrs等）

        Returns:
            实体数据字典

        Raises:
            ValueError: 如果URN格式无效
        """
        if not validate_urn(entity_id):
            raise ValueError(f"Invalid URN format: {entity_id}")

        cache_key = self._build_cache_key("detail", entity_id, options=options)
        if CACHE_AVAILABLE:
            try:
                cache = await get_cache_service()
                cached = await cache.get(cache_key, prefix=self.cache_prefix)
                if cached is not None:
                    return cached
            except Exception:
                pass

        if self.use_mock and self._mock_service:
            # 使用Mock服务
            entity_data = await self._mock_service.get_entity(entity_id)
            # 应用options（简化处理）
            if options == "keyValues" and entity_data:
                entity_data = self._mock_service._to_key_values(entity_data)
        else:
            # 使用真实NGSI-LD客户端
            ngsi_client = get_ngsi_client()
            params = {"options": options} if options else None
            entity_data = await ngsi_client.get_entity(entity_id, attrs=params.get("attrs") if params else None)
        
        if CACHE_AVAILABLE and entity_data is not None:
            try:
                cache = await get_cache_service()
                await cache.set(cache_key, entity_data, prefix=self.cache_prefix, expire=self.cache_ttl)
            except Exception:
                pass
        return entity_data

    async def query_entities(self, request: EntityQueryRequest) -> List[Dict[str, Any]]:
        """查询实体列表。

        Args:
            request: 查询请求对象

        Returns:
            实体列表

        Raises:
            ValueError: 如果实体类型无效
        """
        # 获取实体类型（支持entity_type字段，可能为None）
        entity_type = getattr(request, 'entity_type', None)
        if not entity_type:
            raise ValueError("Entity type is required")
        
        if not validate_entity_type(entity_type):
            raise ValueError(f"Invalid entity type: {entity_type}")

        cache_key = self._build_cache_key(
            "list",
            entity_type,
            q=getattr(request, "q", None),
            limit=request.limit,
            offset=request.offset,
            options=getattr(request, "options", None),
        )
        if CACHE_AVAILABLE:
            try:
                cache = await get_cache_service()
                cached = await cache.get(cache_key, prefix=self.cache_prefix)
                if cached is not None:
                    return cached
            except Exception:
                pass

        if self.use_mock and self._mock_service:
            # 使用Mock服务
            # 构建查询字符串（如果有sub_type等过滤条件）
            q = getattr(request, 'q', None)
            if not q and hasattr(request, 'sub_type') and request.sub_type:
                q = f"subType.value=='{request.sub_type}'"
            
            entities_data = await self._mock_service.query_entities(
                entity_type=entity_type,
                q=q,
                limit=request.limit,
                offset=request.offset,
                options=getattr(request, 'options', None),
            )
        else:
            # 使用真实NGSI-LD客户端
            ngsi_client = get_ngsi_client()
            entities_data = await ngsi_client.query_entities(
                entity_type=entity_type,
                query=request.q,
                limit=request.limit,
                offset=request.offset,
                options=request.options,
            )
        
        if CACHE_AVAILABLE and entities_data is not None:
            try:
                cache = await get_cache_service()
                await cache.set(cache_key, entities_data, prefix=self.cache_prefix, expire=self.cache_ttl)
            except Exception:
                pass
        return entities_data

    async def get_entity_relationships(self, entity_id: str) -> Dict[str, List[str]]:
        """获取实体关系。

        Args:
            entity_id: 实体ID（URN格式）

        Returns:
            关系字典，key为关系名，value为目标实体ID列表

        Raises:
            ValueError: 如果URN格式无效
        """
        if not validate_urn(entity_id):
            raise ValueError(f"Invalid URN format: {entity_id}")

        if self.use_mock and self._mock_service:
            # 使用Mock服务
            return await self._mock_service.get_entity_relationships(entity_id)
        else:
            # 使用真实NGSI-LD客户端（待实现）
            # return await ngsi_client.get_entity_relationships(entity_id)
            raise NotImplementedError("NGSI-LD client relationship query not implemented yet")

    def _build_cache_key(
        self,
        scope: str,
        entity_type_or_id: str,
        q: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        options: Optional[str] = None,
        attrs: Optional[List[str]] = None,
    ) -> str:
        """构建缓存键，兼容列表和详情查询。"""
        parts = [scope, entity_type_or_id]
        if q:
            parts.append(f"q={q}")
        if limit is not None:
            parts.append(f"l={limit}")
        if offset is not None:
            parts.append(f"o={offset}")
        if options:
            parts.append(f"opt={options}")
        if attrs:
            parts.append(f"attrs={','.join(sorted(attrs))}")
        return "|".join(parts)


# 全局实体服务实例
entity_service = EntityService()


def get_entity_service() -> EntityService:
    """获取全局实体服务实例（兼容性函数）。

    Returns:
        EntityService实例
    """
    return entity_service
