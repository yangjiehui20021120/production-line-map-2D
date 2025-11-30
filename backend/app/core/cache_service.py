"""Redis缓存服务。

提供Redis连接管理、缓存读写操作、缓存过期策略等功能。
"""

from __future__ import annotations

import json
from typing import Any, Optional

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None

from app.core.config import settings


class CacheService:
    """Redis缓存服务类。"""

    def __init__(self, redis_url: Optional[str] = None):
        """初始化缓存服务。

        Args:
            redis_url: Redis连接URL，如果为None则从配置读取
        """
        # 构建Redis URL
        if redis_url:
            self.redis_url = redis_url
        elif hasattr(settings, "REDIS_URL") and settings.REDIS_URL and settings.REDIS_URL != "redis://localhost:6379/0":
            # 如果REDIS_URL不是默认值，使用它
            self.redis_url = settings.REDIS_URL
        else:
            # 从HOST/PORT/DB构建URL（优先使用环境变量）
            host = getattr(settings, "REDIS_HOST", "localhost")
            port = getattr(settings, "REDIS_PORT", 6379)
            db = getattr(settings, "REDIS_DB", 0)
            self.redis_url = f"redis://{host}:{port}/{db}"
        self.client: Optional[redis.Redis] = None

    async def connect(self) -> None:
        """连接Redis服务器。"""
        if not REDIS_AVAILABLE:
            raise RuntimeError("Redis not available. Install redis package: pip install redis")
        self.client = await redis.from_url(self.redis_url, decode_responses=True)

    async def disconnect(self) -> None:
        """断开Redis连接。"""
        if self.client:
            await self.client.aclose()
            self.client = None

    def _make_key(self, prefix: str, key: str) -> str:
        """生成缓存键。

        Args:
            prefix: 键前缀
            key: 键名

        Returns:
            完整的缓存键
        """
        return f"{prefix}:{key}"

    async def get(self, key: str, prefix: str = "app") -> Optional[Any]:
        """获取缓存值。

        Args:
            key: 缓存键
            prefix: 键前缀

        Returns:
            缓存值，如果不存在返回None
        """
        if not self.client:
            await self.connect()
        cache_key = self._make_key(prefix, key)
        value = await self.client.get(cache_key)
        if value is None:
            return None
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value

    async def set(
        self,
        key: str,
        value: Any,
        prefix: str = "app",
        expire: Optional[int] = None,
    ) -> None:
        """设置缓存值。

        Args:
            key: 缓存键
            value: 缓存值
            prefix: 键前缀
            expire: 过期时间（秒），如果为None则不过期
        """
        if not self.client:
            await self.connect()
        cache_key = self._make_key(prefix, key)
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        await self.client.set(cache_key, value, ex=expire)

    async def delete(self, key: str, prefix: str = "app") -> None:
        """删除缓存值。

        Args:
            key: 缓存键
            prefix: 键前缀
        """
        if not self.client:
            await self.connect()
        cache_key = self._make_key(prefix, key)
        await self.client.delete(cache_key)

    async def exists(self, key: str, prefix: str = "app") -> bool:
        """检查缓存键是否存在。

        Args:
            key: 缓存键
            prefix: 键前缀

        Returns:
            如果存在返回True，否则返回False
        """
        if not self.client:
            await self.connect()
        cache_key = self._make_key(prefix, key)
        return bool(await self.client.exists(cache_key))

    async def expire(self, key: str, seconds: int, prefix: str = "app") -> None:
        """设置缓存过期时间。

        Args:
            key: 缓存键
            seconds: 过期时间（秒）
            prefix: 键前缀
        """
        if not self.client:
            await self.connect()
        cache_key = self._make_key(prefix, key)
        await self.client.expire(cache_key, seconds)

    async def clear_prefix(self, prefix: str) -> None:
        """清除指定前缀的所有缓存。

        Args:
            prefix: 键前缀
        """
        if not self.client:
            await self.connect()
        pattern = f"{prefix}:*"
        keys = await self.client.keys(pattern)
        if keys:
            await self.client.delete(*keys)


# 全局缓存服务实例
_cache_service: Optional[CacheService] = None


async def get_cache_service() -> CacheService:
    """获取全局缓存服务实例。

    Returns:
        CacheService实例
    """
    global _cache_service
    if _cache_service is None:
        _cache_service = CacheService()
        await _cache_service.connect()
    return _cache_service


async def close_cache_service() -> None:
    """关闭全局缓存服务。"""
    global _cache_service
    if _cache_service:
        await _cache_service.disconnect()
        _cache_service = None

