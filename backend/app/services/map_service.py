"""地图服务。

提供底图数据加载、图层配置管理、地图要素查询等功能。
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

from app.utils.geojson_utils import validate_geojson_feature_collection


class MapService:
    """地图服务类。"""

    def __init__(self, basemap_path: Optional[str] = None):
        """初始化地图服务。

        Args:
            basemap_path: 底图GeoJSON文件路径
        """
        # 查找底图文件
        if basemap_path:
            self.basemap_path = Path(basemap_path)
        else:
            # 尝试从多个位置查找
            candidates = [
                Path("frontend/public/basemap/production-line.geojson"),
                Path("backend/data/basemap/production-line.geojson"),
                Path("data/basemap/production-line.geojson"),
            ]
            self.basemap_path = next((p for p in candidates if p.exists()), None)

    def load_basemap(self) -> dict[str, Any]:
        """加载底图数据。

        Returns:
            GeoJSON FeatureCollection对象

        Raises:
            FileNotFoundError: 如果底图文件不存在
            ValueError: 如果GeoJSON格式无效
        """
        if not self.basemap_path or not self.basemap_path.exists():
            raise FileNotFoundError(f"Basemap file not found: {self.basemap_path}")

        with open(self.basemap_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not validate_geojson_feature_collection(data):
            raise ValueError("Invalid GeoJSON FeatureCollection format")

        return data

    def get_layers(self) -> list[dict[str, Any]]:
        """获取图层配置列表。

        Returns:
            图层配置列表
        """
        return [
            {
                "id": "basemap",
                "name": "底图",
                "type": "geojson",
                "visible": True,
                "opacity": 1.0,
            },
            {
                "id": "stations",
                "name": "工位",
                "type": "geojson",
                "visible": True,
                "opacity": 0.8,
            },
            {
                "id": "equipment",
                "name": "设备",
                "type": "geojson",
                "visible": True,
                "opacity": 0.8,
            },
            {
                "id": "workpieces",
                "name": "工件",
                "type": "geojson",
                "visible": True,
                "opacity": 0.6,
            },
        ]


# 全局地图服务实例
_map_service: Optional[MapService] = None


def get_map_service() -> MapService:
    """获取全局地图服务实例。

    Returns:
        MapService实例
    """
    global _map_service
    if _map_service is None:
        _map_service = MapService()
    return _map_service

