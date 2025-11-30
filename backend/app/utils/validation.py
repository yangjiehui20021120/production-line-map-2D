"""数据验证工具。

提供URN格式验证、实体类型验证、请求参数验证等功能。
"""

from __future__ import annotations

import re
from typing import Optional

from app.models.contracts import (
    ENTITY_TYPE_TWIN_OBJECT,
    ENTITY_TYPE_MBOM,
    ENTITY_TYPE_SCENE,
    ENTITY_TYPE_MODALITY,
    ENTITY_TYPE_MODALITY_BINDING,
    ENTITY_TYPE_MODAL_DATA,
    ENTITY_TYPE_ROLE,
    ENTITY_TYPE_ASSIGNMENT,
    URN_PREFIX_TWIN_OBJECT,
    URN_PREFIX_MBOM,
    URN_PREFIX_SCENE,
    URN_PREFIX_MODALITY,
    URN_PREFIX_MODALITY_BINDING,
    URN_PREFIX_MODAL_DATA,
    URN_PREFIX_ROLE,
    URN_PREFIX_ASSIGNMENT,
)


# URN格式正则表达式
URN_PATTERN = re.compile(
    r"^urn:ngsi-ld:(?P<entity_type>[A-Za-z]+):(?P<identifier>.+)$"
)

# 支持的实体类型
SUPPORTED_ENTITY_TYPES = {
    ENTITY_TYPE_TWIN_OBJECT,
    ENTITY_TYPE_MBOM,
    ENTITY_TYPE_SCENE,
    ENTITY_TYPE_MODALITY,
    ENTITY_TYPE_MODALITY_BINDING,
    ENTITY_TYPE_MODAL_DATA,
    ENTITY_TYPE_ROLE,
    ENTITY_TYPE_ASSIGNMENT,
}

# URN前缀映射
URN_PREFIX_MAP = {
    ENTITY_TYPE_TWIN_OBJECT: URN_PREFIX_TWIN_OBJECT,
    ENTITY_TYPE_MBOM: URN_PREFIX_MBOM,
    ENTITY_TYPE_SCENE: URN_PREFIX_SCENE,
    ENTITY_TYPE_MODALITY: URN_PREFIX_MODALITY,
    ENTITY_TYPE_MODALITY_BINDING: URN_PREFIX_MODALITY_BINDING,
    ENTITY_TYPE_MODAL_DATA: URN_PREFIX_MODAL_DATA,
    ENTITY_TYPE_ROLE: URN_PREFIX_ROLE,
    ENTITY_TYPE_ASSIGNMENT: URN_PREFIX_ASSIGNMENT,
}


class ValidationError(Exception):
    """验证错误异常"""
    pass


def validate_urn(urn: str) -> bool:
    """验证URN格式是否正确。

    Args:
        urn: 待验证的URN字符串

    Returns:
        如果URN格式正确返回True，否则返回False

    Example:
        >>> validate_urn("urn:ngsi-ld:TwinObject:Station:FrontWelding")
        True
        >>> validate_urn("invalid-urn")
        False
    """
    if not isinstance(urn, str):
        return False
    return bool(URN_PATTERN.match(urn))


def parse_urn(urn: str) -> Optional[dict[str, str]]:
    """解析URN，提取实体类型和标识符。

    Args:
        urn: URN字符串

    Returns:
        包含entity_type和identifier的字典，如果解析失败返回None

    Example:
        >>> parse_urn("urn:ngsi-ld:TwinObject:Station:FrontWelding")
        {'entity_type': 'TwinObject', 'identifier': 'Station:FrontWelding'}
    """
    match = URN_PATTERN.match(urn)
    if not match:
        return None
    return {
        "entity_type": match.group("entity_type"),
        "identifier": match.group("identifier"),
    }


def validate_entity_type(entity_type: str) -> bool:
    """验证实体类型是否支持。

    Args:
        entity_type: 实体类型字符串

    Returns:
        如果实体类型支持返回True，否则返回False
    """
    return entity_type in SUPPORTED_ENTITY_TYPES


def validate_urn_entity_type(urn: str, expected_type: str) -> bool:
    """验证URN的实体类型是否匹配预期类型。

    Args:
        urn: URN字符串
        expected_type: 预期的实体类型

    Returns:
        如果匹配返回True，否则返回False
    """
    parsed = parse_urn(urn)
    if not parsed:
        return False
    return parsed["entity_type"] == expected_type


def validate_urn_prefix(urn: str) -> bool:
    """验证URN前缀是否正确。

    Args:
        urn: URN字符串

    Returns:
        如果URN前缀正确返回True，否则返回False
    """
    parsed = parse_urn(urn)
    if not parsed:
        return False
    entity_type = parsed["entity_type"]
    if entity_type not in URN_PREFIX_MAP:
        return False
    expected_prefix = URN_PREFIX_MAP[entity_type]
    return urn.startswith(expected_prefix)


def validate_urn_list(urns: list[str]) -> tuple[bool, Optional[str]]:
    """验证URN列表。

    Args:
        urns: URN字符串列表

    Returns:
        (是否全部有效, 第一个无效的URN或None)
    """
    for urn in urns:
        if not validate_urn(urn):
            return False, urn
    return True, None


def validate_entity_id(entity_id: str, entity_type: Optional[str] = None) -> None:
    """验证实体ID（URN格式），如果无效则抛出异常。

    Args:
        entity_id: 实体ID（URN格式）
        entity_type: 可选的预期实体类型

    Raises:
        ValidationError: 如果URN格式无效或实体类型不匹配
    """
    if not validate_urn(entity_id):
        raise ValidationError(f"Invalid URN format: {entity_id}")

    if entity_type:
        if not validate_urn_entity_type(entity_id, entity_type):
            raise ValidationError(
                f"URN entity type mismatch: expected {entity_type}, "
                f"got {parse_urn(entity_id)['entity_type']}"
            )


def validate_time_range(start: Optional[str], end: Optional[str]) -> None:
    """验证时间范围。

    Args:
        start: 开始时间（ISO 8601格式）
        end: 结束时间（ISO 8601格式）

    Raises:
        ValidationError: 如果时间范围无效
    """
    if start and end:
        from app.utils.time_utils import parse_iso8601
        try:
            start_dt = parse_iso8601(start)
            end_dt = parse_iso8601(end)
            if start_dt >= end_dt:
                raise ValidationError("Start time must be before end time")
        except ValueError as e:
            raise ValidationError(f"Invalid time format: {e}")


def validate_pagination(limit: int, offset: int) -> None:
    """验证分页参数。

    Args:
        limit: 每页数量
        offset: 偏移量

    Raises:
        ValidationError: 如果分页参数无效
    """
    if limit < 1 or limit > 1000:
        raise ValidationError("Limit must be between 1 and 1000")
    if offset < 0:
        raise ValidationError("Offset must be >= 0")

