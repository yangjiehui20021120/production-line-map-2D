"""Mock NGSI-LD服务。

提供完整的实体数据查询功能，即使没有真实的NGSI-LD客户端也能测试所有功能。
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.core.config import settings

# 条件导入Redis缓存
if settings.USE_REDIS_CACHE:
    try:
        from app.core.cache_service import get_cache_service
        REDIS_CACHE_AVAILABLE = True
    except Exception:
        REDIS_CACHE_AVAILABLE = False
else:
    REDIS_CACHE_AVAILABLE = False


class MockNGSIService:
    """Mock NGSI-LD服务，加载本地JSON数据并提供查询接口。"""

    def __init__(self, data_dir: Optional[Path] = None):
        """初始化服务。

        Args:
            data_dir: 数据文件目录，默认为backend/data/entities
        """
        if data_dir is None:
            # 从当前文件位置计算数据目录
            current_file = Path(__file__)
            self.data_dir = current_file.parent.parent.parent / "data" / "entities"
        else:
            self.data_dir = data_dir

        # 实体数据缓存
        self._entities_cache: Dict[str, List[Dict[str, Any]]] = {}
        self._entities_by_id: Dict[str, Dict[str, Any]] = {}
        self._loaded = False
        self._use_redis_cache = settings.USE_REDIS_CACHE and REDIS_CACHE_AVAILABLE

    async def _load_all_entities(self) -> None:
        """加载所有实体数据到内存（支持Redis缓存）。"""
        if self._loaded:
            return

        # 尝试从Redis缓存加载
        if self._use_redis_cache:
            try:
                cache_service = await get_cache_service()
                cached_data = await cache_service.get("entities:all", prefix="mock_ngsi")
                if cached_data:
                    self._entities_cache = cached_data.get("by_type", {})
                    self._entities_by_id = cached_data.get("by_id", {})
                    self._loaded = True
                    total = sum(len(entities) for entities in self._entities_cache.values())
                    print(f"Loaded {total} entities from Redis cache")
                    return
            except Exception as e:
                print(f"Warning: Failed to load from Redis cache: {e}")
                print("Falling back to loading from JSON files...")

        print("Loading mock entity data from JSON files...")

        # TwinObject实体
        twinobject_dir = self.data_dir / "twinobject"
        if twinobject_dir.exists():
            for file_name in [
                "orgunit.json",
                "stations.json",
                "positions.json",
                "autoequipment.json",
                "person.json",
                "products.json",
                "workpieces.json",
            ]:
                file_path = twinobject_dir / file_name
                if file_path.exists():
                    entities = self._load_json_file(file_path)
                    if entities:
                        for entity in entities:
                            entity_id = entity.get("id")
                            if entity_id:
                                self._entities_by_id[entity_id] = entity
                                entity_type = entity.get("type", "TwinObject")
                                if entity_type not in self._entities_cache:
                                    self._entities_cache[entity_type] = []
                                self._entities_cache[entity_type].append(entity)

        # MBOM实体
        mbom_dir = self.data_dir / "mbom"
        if mbom_dir.exists():
            for file_path in mbom_dir.glob("*.json"):
                entities = self._load_json_file(file_path)
                if entities:
                    for entity in entities:
                        entity_id = entity.get("id")
                        if entity_id:
                            self._entities_by_id[entity_id] = entity
                            entity_type = entity.get("type", "MBOM")
                            if entity_type not in self._entities_cache:
                                self._entities_cache[entity_type] = []
                            self._entities_cache[entity_type].append(entity)

        # Scene实体
        scene_dir = self.data_dir / "scene"
        if scene_dir.exists():
            for file_path in scene_dir.glob("*.json"):
                entities = self._load_json_file(file_path)
                if entities:
                    for entity in entities:
                        entity_id = entity.get("id")
                        if entity_id:
                            self._entities_by_id[entity_id] = entity
                            entity_type = entity.get("type", "Scene")
                            if entity_type not in self._entities_cache:
                                self._entities_cache[entity_type] = []
                            self._entities_cache[entity_type].append(entity)

        # Modality实体
        modality_file = self.data_dir / "modality" / "modalities.json"
        if modality_file.exists():
            entities = self._load_json_file(modality_file)
            if entities:
                for entity in entities:
                    entity_id = entity.get("id")
                    if entity_id:
                        self._entities_by_id[entity_id] = entity
                        entity_type = entity.get("type", "Modality")
                        if entity_type not in self._entities_cache:
                            self._entities_cache[entity_type] = []
                        self._entities_cache[entity_type].append(entity)

        # ModalityBinding实体
        binding_file = self.data_dir / "modalitybinding" / "modalitybindings.json"
        if binding_file.exists():
            entities = self._load_json_file(binding_file)
            if entities:
                for entity in entities:
                    entity_id = entity.get("id")
                    if entity_id:
                        self._entities_by_id[entity_id] = entity
                        entity_type = entity.get("type", "ModalityBinding")
                        if entity_type not in self._entities_cache:
                            self._entities_cache[entity_type] = []
                        self._entities_cache[entity_type].append(entity)

        # ModalData实体（采样数据）
        modaldata_file = self.data_dir / "modaldata" / "modaldata.json"
        if modaldata_file.exists():
            entities = self._load_json_file(modaldata_file)
            if entities:
                for entity in entities:
                    entity_id = entity.get("id")
                    if entity_id:
                        self._entities_by_id[entity_id] = entity
                        entity_type = entity.get("type", "ModalData")
                        if entity_type not in self._entities_cache:
                            self._entities_cache[entity_type] = []
                        self._entities_cache[entity_type].append(entity)

        # Role实体
        role_file = self.data_dir / "role" / "roles.json"
        if role_file.exists():
            entities = self._load_json_file(role_file)
            if entities:
                for entity in entities:
                    entity_id = entity.get("id")
                    if entity_id:
                        self._entities_by_id[entity_id] = entity
                        entity_type = entity.get("type", "Role")
                        if entity_type not in self._entities_cache:
                            self._entities_cache[entity_type] = []
                        self._entities_cache[entity_type].append(entity)

        # Assignment实体
        assignment_file = self.data_dir / "assignment" / "assignments.json"
        if assignment_file.exists():
            entities = self._load_json_file(assignment_file)
            if entities:
                for entity in entities:
                    entity_id = entity.get("id")
                    if entity_id:
                        self._entities_by_id[entity_id] = entity
                        entity_type = entity.get("type", "Assignment")
                        if entity_type not in self._entities_cache:
                            self._entities_cache[entity_type] = []
                        self._entities_cache[entity_type].append(entity)

        self._loaded = True
        total_entities = sum(len(entities) for entities in self._entities_cache.values())
        print(f"Loaded {total_entities} entities from {len(self._entities_cache)} types")
        
        # 保存到Redis缓存
        if self._use_redis_cache:
            try:
                cache_service = await get_cache_service()
                cache_data = {
                    "by_type": self._entities_cache,
                    "by_id": self._entities_by_id,
                }
                # 缓存24小时
                await cache_service.set("entities:all", cache_data, prefix="mock_ngsi", expire=86400)
                print("Cached entities data to Redis")
            except Exception as e:
                print(f"Warning: Failed to cache to Redis: {e}")

    def _load_json_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """加载JSON文件。"""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict):
                    # 处理包装格式
                    if "entities" in data:
                        return data["entities"]
                    elif "modalities" in data:
                        return data["modalities"]
                    else:
                        return [data]
                return []
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            return []

    async def get_entity(self, entity_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取实体。

        Args:
            entity_id: 实体URN

        Returns:
            实体数据，如果不存在则返回None
        """
        await self._load_all_entities()
        return self._entities_by_id.get(entity_id)

    async def query_entities(
        self,
        entity_type: str,
        q: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        options: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """查询实体列表。

        Args:
            entity_type: 实体类型（TwinObject, MBOM, Scene等）
            q: NGSI-LD查询字符串（简化支持）
            limit: 返回数量限制
            offset: 分页偏移量
            options: 选项（keyValues, count等）

        Returns:
            实体列表
        """
        await self._load_all_entities()

        # 获取指定类型的所有实体
        entities = self._entities_cache.get(entity_type, [])

        # 应用查询过滤
        if q:
            entities = self._apply_query_filter(entities, q)

        # 分页
        total = len(entities)
        entities = entities[offset : offset + limit]

        # 应用选项
        if options == "keyValues":
            entities = [self._to_key_values(e) for e in entities]
        elif options == "count":
            return [{"count": total}]

        return entities

    def _apply_query_filter(self, entities: List[Dict[str, Any]], q: str) -> List[Dict[str, Any]]:
        """应用NGSI-LD查询过滤（简化实现）。

        支持简单的属性查询，如：
        - subType.value=='Station'
        - status.value=='Active'
        - mbomType.value=='MBOMRoot'
        """
        filtered = []
        for entity in entities:
            if self._matches_query(entity, q):
                filtered.append(entity)
        return filtered

    def _matches_query(self, entity: Dict[str, Any], q: str) -> bool:
        """检查实体是否匹配查询条件。"""
        # 简单的查询解析（支持==操作符）
        # 例如: subType.value=='Station'
        pattern = r"(\w+(?:\.\w+)*)\s*==\s*['\"]([^'\"]+)['\"]"
        matches = re.findall(pattern, q)

        for attr_path, expected_value in matches:
            # 获取属性值
            attr_value = self._get_nested_value(entity, attr_path)
            if attr_value != expected_value:
                return False

        return True

    def _get_nested_value(self, obj: Dict[str, Any], path: str) -> Any:
        """获取嵌套属性值。

        例如: subType.value -> obj['subType']['value']
        """
        parts = path.split(".")
        current = obj
        for part in parts:
            if isinstance(current, dict):
                current = current.get(part)
                if current is None:
                    return None
            else:
                return None
        return current

    def _to_key_values(self, entity: Dict[str, Any]) -> Dict[str, Any]:
        """转换为keyValues格式（简化属性结构）。"""
        result = {"id": entity.get("id"), "type": entity.get("type")}
        for key, value in entity.items():
            if key in ["id", "type", "@context"]:
                continue
            if isinstance(value, dict):
                if value.get("type") == "Property":
                    result[key] = value.get("value")
                elif value.get("type") == "Relationship":
                    result[key] = value.get("object")
                elif value.get("type") == "GeoProperty":
                    result[key] = value.get("value")
            else:
                result[key] = value
        return result

    async def get_entity_relationships(self, entity_id: str) -> Dict[str, List[str]]:
        """获取实体的所有关系。

        Args:
            entity_id: 实体URN

        Returns:
            关系字典，key为关系名，value为目标实体ID列表
        """
        entity = await self.get_entity(entity_id)
        if not entity:
            return {}

        relationships: Dict[str, List[str]] = {}
        for key, value in entity.items():
            if isinstance(value, dict):
                if value.get("type") == "Relationship":
                    target_id = value.get("object")
                    if target_id:
                        if key not in relationships:
                            relationships[key] = []
                        relationships[key].append(target_id)
                elif isinstance(value, list):
                    # 处理关系数组
                    for item in value:
                        if isinstance(item, dict) and item.get("type") == "Relationship":
                            target_id = item.get("object")
                            if target_id:
                                if key not in relationships:
                                    relationships[key] = []
                                relationships[key].append(target_id)

        return relationships

    async def search_by_attribute(
        self, attr_name: str, attr_value: Any, entity_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """按属性搜索实体。

        Args:
            attr_name: 属性名（支持嵌套，如subType.value）
            attr_value: 属性值
            entity_type: 可选的实体类型过滤

        Returns:
            匹配的实体列表
        """
        await self._load_all_entities()

        results = []
        entities_to_search = []

        if entity_type:
            entities_to_search = self._entities_cache.get(entity_type, [])
        else:
            # 搜索所有类型
            for entities in self._entities_cache.values():
                entities_to_search.extend(entities)

        for entity in entities_to_search:
            value = self._get_nested_value(entity, attr_name)
            if value == attr_value:
                results.append(entity)

        return results


# 全局实例
_mock_ngsi_service: Optional[MockNGSIService] = None


def get_mock_ngsi_service() -> MockNGSIService:
    """获取Mock NGSI服务实例（单例）。"""
    global _mock_ngsi_service
    if _mock_ngsi_service is None:
        _mock_ngsi_service = MockNGSIService()
    return _mock_ngsi_service

