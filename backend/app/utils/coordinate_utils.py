"""坐标处理工具。

提供车间坐标系转换、坐标验证和规范化、坐标距离计算等功能。
"""

from __future__ import annotations

import math
from typing import Optional, Tuple


# 常用EPSG代码
EPSG_WGS84 = "EPSG:4326"  # WGS84地理坐标系
EPSG_WEB_MERCATOR = "EPSG:3857"  # Web Mercator投影
EPSG_CHINA_2000 = "EPSG:4490"  # 中国2000坐标系
EPSG_BEIJING_54 = "EPSG:2433"  # 北京54坐标系


def validate_coordinate(x: float, y: float, z: Optional[float] = None) -> bool:
    """验证坐标值是否有效。

    Args:
        x: X坐标
        y: Y坐标
        z: Z坐标（可选）

    Returns:
        如果坐标有效返回True，否则返回False
    """
    if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
        return False
    if math.isnan(x) or math.isnan(y) or math.isinf(x) or math.isinf(y):
        return False
    if z is not None:
        if not isinstance(z, (int, float)) or math.isnan(z) or math.isinf(z):
            return False
    return True


def normalize_coordinate(
    x: float,
    y: float,
    z: Optional[float] = None,
) -> Tuple[float, float, Optional[float]]:
    """规范化坐标值（保留合理精度）。

    Args:
        x: X坐标
        y: Y坐标
        z: Z坐标（可选）

    Returns:
        规范化后的坐标元组
    """
    x = round(x, 6)
    y = round(y, 6)
    if z is not None:
        z = round(z, 6)
    return (x, y, z)


def calculate_distance(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    z1: Optional[float] = None,
    z2: Optional[float] = None,
) -> float:
    """计算两点之间的欧氏距离。

    Args:
        x1: 第一个点的X坐标
        y1: 第一个点的Y坐标
        x2: 第二个点的X坐标
        y2: 第二个点的Y坐标
        z1: 第一个点的Z坐标（可选）
        z2: 第二个点的Z坐标（可选）

    Returns:
        两点之间的距离（单位与坐标单位相同）
    """
    dx = x2 - x1
    dy = y2 - y1
    distance_sq = dx * dx + dy * dy

    if z1 is not None and z2 is not None:
        dz = z2 - z1
        distance_sq += dz * dz

    return math.sqrt(distance_sq)


def calculate_distance_2d(x1: float, y1: float, x2: float, y2: float) -> float:
    """计算两点之间的2D距离。

    Args:
        x1: 第一个点的X坐标
        y1: 第一个点的Y坐标
        x2: 第二个点的X坐标
        y2: 第二个点的Y坐标

    Returns:
        两点之间的2D距离
    """
    return calculate_distance(x1, y1, x2, y2)


def transform_coordinate_simple(
    x: float,
    y: float,
    offset_x: float = 0.0,
    offset_y: float = 0.0,
    scale: float = 1.0,
) -> Tuple[float, float]:
    """简单的坐标转换（平移+缩放）。

    Args:
        x: 原始X坐标
        y: 原始Y坐标
        offset_x: X方向偏移量
        offset_y: Y方向偏移量
        scale: 缩放因子

    Returns:
        转换后的坐标元组 (x, y)
    """
    new_x = (x + offset_x) * scale
    new_y = (y + offset_y) * scale
    return (new_x, new_y)


def transform_coordinate_rotation(
    x: float,
    y: float,
    angle_rad: float,
    center_x: float = 0.0,
    center_y: float = 0.0,
) -> Tuple[float, float]:
    """坐标旋转变换。

    Args:
        x: 原始X坐标
        y: 原始Y坐标
        angle_rad: 旋转角度（弧度）
        center_x: 旋转中心X坐标
        center_y: 旋转中心Y坐标

    Returns:
        旋转后的坐标元组 (x, y)
    """
    # 平移到原点
    dx = x - center_x
    dy = y - center_y

    # 旋转
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    new_dx = dx * cos_a - dy * sin_a
    new_dy = dx * sin_a + dy * cos_a

    # 平移回原位置
    new_x = new_dx + center_x
    new_y = new_dy + center_y

    return (new_x, new_y)


def is_point_in_bbox(
    x: float,
    y: float,
    bbox: Tuple[float, float, float, float],
) -> bool:
    """判断点是否在边界框内。

    Args:
        x: 点的X坐标
        y: 点的Y坐标
        bbox: 边界框 (min_x, min_y, max_x, max_y)

    Returns:
        如果点在边界框内返回True，否则返回False
    """
    min_x, min_y, max_x, max_y = bbox
    return min_x <= x <= max_x and min_y <= y <= max_y


def calculate_bbox(points: list[Tuple[float, float]]) -> Tuple[float, float, float, float]:
    """计算点集的边界框。

    Args:
        points: 点列表 [(x, y), ...]

    Returns:
        边界框 (min_x, min_y, max_x, max_y)
    """
    if not points:
        raise ValueError("Points list cannot be empty")

    min_x = min(p[0] for p in points)
    min_y = min(p[1] for p in points)
    max_x = max(p[0] for p in points)
    max_y = max(p[1] for p in points)

    return (min_x, min_y, max_x, max_y)


def meters_to_millimeters(meters: float) -> float:
    """米转换为毫米。

    Args:
        meters: 米数

    Returns:
        毫米数
    """
    return meters * 1000.0


def millimeters_to_meters(millimeters: float) -> float:
    """毫米转换为米。

    Args:
        millimeters: 毫米数

    Returns:
        米数
    """
    return millimeters / 1000.0


def degrees_to_radians(degrees: float) -> float:
    """度转换为弧度。

    Args:
        degrees: 度数

    Returns:
        弧度数
    """
    return degrees * math.pi / 180.0


def radians_to_degrees(radians: float) -> float:
    """弧度转换为度。

    Args:
        radians: 弧度数

    Returns:
        度数
    """
    return radians * 180.0 / math.pi

