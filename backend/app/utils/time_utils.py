"""时间处理工具。

提供ISO 8601格式转换、时区处理、时间范围验证等功能。
"""

from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Optional

# 中国时区（UTC+8）
CHINA_TZ = timezone(timedelta(hours=8))


def parse_iso8601(time_str: str) -> datetime:
    """解析ISO 8601格式的时间字符串。

    Args:
        time_str: ISO 8601格式的时间字符串

    Returns:
        datetime对象

    Raises:
        ValueError: 如果时间格式无效

    Example:
        >>> parse_iso8601("2025-10-28T09:00:00Z")
        datetime.datetime(2025, 10, 28, 9, 0, tzinfo=timezone.utc)
    """
    # 尝试多种ISO 8601格式
    formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%f%z",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
    ]

    for fmt in formats:
        try:
            dt = datetime.strptime(time_str, fmt)
            # 如果没有时区信息，假设为UTC
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue

    raise ValueError(f"Invalid ISO 8601 format: {time_str}")


def format_iso8601(dt: datetime) -> str:
    """将datetime对象格式化为ISO 8601字符串。

    Args:
        dt: datetime对象

    Returns:
        ISO 8601格式的时间字符串

    Example:
        >>> dt = datetime(2025, 10, 28, 9, 0, tzinfo=timezone.utc)
        >>> format_iso8601(dt)
        '2025-10-28T09:00:00Z'
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")


def to_utc(dt: datetime) -> datetime:
    """将datetime转换为UTC时区。

    Args:
        dt: datetime对象

    Returns:
        UTC时区的datetime对象
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def to_china_tz(dt: datetime) -> datetime:
    """将datetime转换为中国时区（UTC+8）。

    Args:
        dt: datetime对象

    Returns:
        中国时区的datetime对象
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(CHINA_TZ)


def now_utc() -> datetime:
    """获取当前UTC时间。

    Returns:
        当前UTC时间的datetime对象
    """
    return datetime.now(timezone.utc)


def now_china() -> datetime:
    """获取当前中国时区时间。

    Returns:
        当前中国时区的datetime对象
    """
    return datetime.now(CHINA_TZ)


def validate_time_range(
    start: Optional[datetime],
    end: Optional[datetime],
) -> None:
    """验证时间范围。

    Args:
        start: 开始时间
        end: 结束时间

    Raises:
        ValueError: 如果时间范围无效
    """
    if start and end:
        if start >= end:
            raise ValueError("Start time must be before end time")
        # 检查时间范围是否过大（例如超过1年）
        if (end - start).days > 365:
            raise ValueError("Time range cannot exceed 365 days")


def time_range_duration(start: datetime, end: datetime) -> timedelta:
    """计算时间范围的持续时间。

    Args:
        start: 开始时间
        end: 结束时间

    Returns:
        持续时间（timedelta对象）

    Raises:
        ValueError: 如果开始时间晚于结束时间
    """
    if start >= end:
        raise ValueError("Start time must be before end time")
    return end - start


def duration_to_seconds(duration: timedelta) -> float:
    """将timedelta转换为秒数。

    Args:
        duration: timedelta对象

    Returns:
        秒数（浮点数）
    """
    return duration.total_seconds()


def seconds_to_duration(seconds: float) -> timedelta:
    """将秒数转换为timedelta。

    Args:
        seconds: 秒数

    Returns:
        timedelta对象
    """
    return timedelta(seconds=seconds)


def parse_time_string(time_str: Optional[str]) -> Optional[datetime]:
    """解析时间字符串，如果为None则返回None。

    Args:
        time_str: 时间字符串或None

    Returns:
        datetime对象或None
    """
    if time_str is None:
        return None
    return parse_iso8601(time_str)


def format_time_string(dt: Optional[datetime]) -> Optional[str]:
    """格式化datetime为字符串，如果为None则返回None。

    Args:
        dt: datetime对象或None

    Returns:
        时间字符串或None
    """
    if dt is None:
        return None
    return format_iso8601(dt)

