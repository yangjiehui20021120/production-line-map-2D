"""GeoJSON处理工具。

提供GeoJSON数据解析和生成、Feature/FeatureCollection转换、坐标系统转换等功能。
"""

from __future__ import annotations

from typing import Any, Optional

from shared.types.ngsi import GeoPoint, GeoPolygon
from app.utils.coordinate_utils import validate_coordinate, normalize_coordinate


class GeoJSONError(Exception):
    """GeoJSON处理错误异常"""
    pass


def validate_geojson_point(coordinates: list[float]) -> bool:
    """验证GeoJSON Point坐标。

    Args:
        coordinates: 坐标数组 [x, y] 或 [x, y, z]

    Returns:
        如果坐标有效返回True，否则返回False
    """
    if not isinstance(coordinates, list):
        return False
    if len(coordinates) < 2 or len(coordinates) > 3:
        return False
    x, y = coordinates[0], coordinates[1]
    z = coordinates[2] if len(coordinates) > 2 else None
    return validate_coordinate(x, y, z)


def validate_geojson_polygon(coordinates: list[list[list[float]]]) -> bool:
    """验证GeoJSON Polygon坐标。

    Args:
        coordinates: 多边形坐标数组 [[[x, y], ...], ...]

    Returns:
        如果坐标有效返回True，否则返回False
    """
    if not isinstance(coordinates, list) or len(coordinates) == 0:
        return False
    # 检查外环
    outer_ring = coordinates[0]
    if not isinstance(outer_ring, list) or len(outer_ring) < 4:
        return False
    # 检查每个点
    for ring in coordinates:
        for point in ring:
            if not validate_geojson_point(point):
                return False
    return True


def create_geojson_point(
    x: float,
    y: float,
    z: Optional[float] = None,
) -> GeoPoint:
    """创建GeoJSON Point对象。

    Args:
        x: X坐标
        y: Y坐标
        z: Z坐标（可选）

    Returns:
        GeoJSON Point对象

    Raises:
        GeoJSONError: 如果坐标无效
    """
    if not validate_coordinate(x, y, z):
        raise GeoJSONError(f"Invalid coordinates: ({x}, {y}, {z})")

    x, y, z = normalize_coordinate(x, y, z)
    coords = [x, y]
    if z is not None:
        coords.append(z)

    return {
        "type": "Point",
        "coordinates": coords,
    }


def create_geojson_polygon(
    coordinates: list[list[tuple[float, float]]],
) -> GeoPolygon:
    """创建GeoJSON Polygon对象。

    Args:
        coordinates: 多边形坐标列表，每个元素是一个环（外环+内环）

    Returns:
        GeoJSON Polygon对象

    Raises:
        GeoJSONError: 如果坐标无效
    """
    # 转换为列表格式
    polygon_coords = []
    for ring in coordinates:
        ring_coords = []
        for point in ring:
            x, y = point
            if not validate_coordinate(x, y):
                raise GeoJSONError(f"Invalid point: {point}")
            x, y, _ = normalize_coordinate(x, y)
            ring_coords.append([x, y])
        polygon_coords.append(ring_coords)

    if not validate_geojson_polygon(polygon_coords):
        raise GeoJSONError("Invalid polygon coordinates")

    return {
        "type": "Polygon",
        "coordinates": polygon_coords,
    }


def create_geojson_feature(
    geometry: dict[str, Any],
    properties: Optional[dict[str, Any]] = None,
    id: Optional[str] = None,
) -> dict[str, Any]:
    """创建GeoJSON Feature对象。

    Args:
        geometry: GeoJSON几何对象
        properties: 属性字典（可选）
        id: Feature ID（可选）

    Returns:
        GeoJSON Feature对象
    """
    feature: dict[str, Any] = {
        "type": "Feature",
        "geometry": geometry,
    }
    if properties:
        feature["properties"] = properties
    if id:
        feature["id"] = id
    return feature


def create_geojson_feature_collection(
    features: list[dict[str, Any]],
) -> dict[str, Any]:
    """创建GeoJSON FeatureCollection对象。

    Args:
        features: Feature对象列表

    Returns:
        GeoJSON FeatureCollection对象
    """
    return {
        "type": "FeatureCollection",
        "features": features,
    }


def extract_point_coordinates(point: GeoPoint) -> tuple[float, float, Optional[float]]:
    """从GeoJSON Point中提取坐标。

    Args:
        point: GeoJSON Point对象

    Returns:
        坐标元组 (x, y, z)
    """
    coords = point["coordinates"]
    x = coords[0]
    y = coords[1]
    z = coords[2] if len(coords) > 2 else None
    return (x, y, z)


def extract_polygon_rings(polygon: GeoPolygon) -> list[list[tuple[float, float]]]:
    """从GeoJSON Polygon中提取环坐标。

    Args:
        polygon: GeoJSON Polygon对象

    Returns:
        环坐标列表，每个环是一个点列表
    """
    rings = []
    for ring_coords in polygon["coordinates"]:
        ring = [(p[0], p[1]) for p in ring_coords]
        rings.append(ring)
    return rings


def validate_geojson_geometry(geometry: dict[str, Any]) -> bool:
    """验证GeoJSON几何对象。

    Args:
        geometry: GeoJSON几何对象

    Returns:
        如果几何对象有效返回True，否则返回False
    """
    geom_type = geometry.get("type")
    coordinates = geometry.get("coordinates")

    if geom_type == "Point":
        return validate_geojson_point(coordinates)
    elif geom_type == "Polygon":
        return validate_geojson_polygon(coordinates)
    elif geom_type == "LineString":
        if not isinstance(coordinates, list) or len(coordinates) < 2:
            return False
        for point in coordinates:
            if not validate_geojson_point(point):
                return False
        return True
    elif geom_type == "MultiPoint":
        if not isinstance(coordinates, list):
            return False
        for point in coordinates:
            if not validate_geojson_point(point):
                return False
        return True
    else:
        # 其他类型暂不支持
        return False


def validate_geojson_feature(feature: dict[str, Any]) -> bool:
    """验证GeoJSON Feature对象。

    Args:
        feature: GeoJSON Feature对象

    Returns:
        如果Feature有效返回True，否则返回False
    """
    if feature.get("type") != "Feature":
        return False
    geometry = feature.get("geometry")
    if not geometry:
        return False
    return validate_geojson_geometry(geometry)


def validate_geojson_feature_collection(fc: dict[str, Any]) -> bool:
    """验证GeoJSON FeatureCollection对象。

    Args:
        fc: GeoJSON FeatureCollection对象

    Returns:
        如果FeatureCollection有效返回True，否则返回False
    """
    if fc.get("type") != "FeatureCollection":
        return False
    features = fc.get("features")
    if not isinstance(features, list):
        return False
    for feature in features:
        if not validate_geojson_feature(feature):
            return False
    return True

