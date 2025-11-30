"""CORS配置中间件。

从main.py拆分CORS配置，提供可配置的CORS策略。
"""

from typing import List, Optional

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from app.core.config import settings


def setup_cors(app: FastAPI, allow_origins: Optional[List[str]] = None) -> None:
    """配置CORS中间件。

    Args:
        app: FastAPI应用实例
        allow_origins: 允许的来源列表，如果为None则从配置读取
    """
    if allow_origins is None:
        allow_origins = getattr(settings, "CORS_ORIGINS", ["http://localhost:5173"])

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

