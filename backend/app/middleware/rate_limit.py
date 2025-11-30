"""限流中间件（可选）。

提供API限流保护、基于IP/用户的限流、限流响应处理等功能。
"""

from __future__ import annotations

import time
from collections import defaultdict
from typing import Callable, Optional

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """限流中间件。"""

    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
    ):
        """初始化限流中间件。

        Args:
            app: ASGI应用
            requests_per_minute: 每分钟请求数限制
            requests_per_hour: 每小时请求数限制
        """
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.minute_requests: dict[str, list[float]] = defaultdict(list)
        self.hour_requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: Callable) -> JSONResponse:
        """处理请求并检查限流。

        Args:
            request: FastAPI请求对象
            call_next: 下一个中间件或路由处理器

        Returns:
            JSON响应
        """
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()

        # 清理过期记录
        self._cleanup_old_requests(client_ip, current_time)

        # 检查每分钟限制
        if len(self.minute_requests[client_ip]) >= self.requests_per_minute:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": f"Rate limit exceeded: {self.requests_per_minute} requests per minute",
                    },
                },
            )

        # 检查每小时限制
        if len(self.hour_requests[client_ip]) >= self.requests_per_hour:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": f"Rate limit exceeded: {self.requests_per_hour} requests per hour",
                    },
                },
            )

        # 记录请求
        self.minute_requests[client_ip].append(current_time)
        self.hour_requests[client_ip].append(current_time)

        # 继续处理请求
        response = await call_next(request)
        return response

    def _cleanup_old_requests(self, client_ip: str, current_time: float) -> None:
        """清理过期的请求记录。

        Args:
            client_ip: 客户端IP
            current_time: 当前时间戳
        """
        # 清理1分钟前的记录
        self.minute_requests[client_ip] = [
            t for t in self.minute_requests[client_ip] if current_time - t < 60
        ]
        # 清理1小时前的记录
        self.hour_requests[client_ip] = [
            t for t in self.hour_requests[client_ip] if current_time - t < 3600
        ]

