"""错误处理中间件。

提供统一错误响应格式、异常捕获和转换、错误日志记录等功能。
"""

from __future__ import annotations

import logging
from typing import Callable

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.models.responses import ErrorResponse, ErrorDetail
from app.utils.validation import ValidationError

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """错误处理中间件。"""

    async def dispatch(self, request: Request, call_next: Callable) -> JSONResponse:
        """处理请求并捕获异常。

        Args:
            request: FastAPI请求对象
            call_next: 下一个中间件或路由处理器

        Returns:
            JSON响应
        """
        try:
            response = await call_next(request)
            return response
        except ValidationError as e:
            logger.warning(f"Validation error: {e}", exc_info=True)
            return self._create_error_response(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="VALIDATION_ERROR",
                message=str(e),
            )
        except ValueError as e:
            logger.warning(f"Value error: {e}", exc_info=True)
            return self._create_error_response(
                status_code=status.HTTP_400_BAD_REQUEST,
                code="VALUE_ERROR",
                message=str(e),
            )
        except NotImplementedError as e:
            logger.error(f"Not implemented: {e}", exc_info=True)
            return self._create_error_response(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                code="NOT_IMPLEMENTED",
                message=str(e) or "Feature not implemented yet",
            )
        except Exception as e:
            logger.error(f"Unhandled error: {e}", exc_info=True)
            return self._create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                code="INTERNAL_ERROR",
                message="Internal server error",
            )

    def _create_error_response(
        self,
        status_code: int,
        code: str,
        message: str,
    ) -> JSONResponse:
        """创建错误响应。

        Args:
            status_code: HTTP状态码
            code: 错误代码
            message: 错误消息

        Returns:
            JSON响应
        """
        error_response = ErrorResponse(
            error=ErrorDetail(code=code, message=message),
        )
        return JSONResponse(
            status_code=status_code,
            content=error_response.model_dump(),
        )

