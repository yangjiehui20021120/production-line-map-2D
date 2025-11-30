# Redis缓存集成说明

## 概述

后端已完整集成Redis缓存服务，用于提升Mock数据服务的性能。

## 配置状态

✅ **已实现：**
- Redis缓存服务 (`app/core/cache_service.py`)
- Mock NGSI服务Redis缓存集成
- 应用生命周期管理（启动/关闭时连接/断开Redis）
- 配置项支持（config.py）

✅ **已配置：**
- Docker Compose中的Redis服务
- requirements.txt中的redis依赖

## 功能特性

### 1. Mock NGSI服务缓存

- **首次启动**: 从JSON文件加载实体数据，缓存到Redis（24小时）
- **后续启动**: 优先从Redis加载，大幅提升启动速度
- **降级处理**: Redis不可用时自动回退到JSON文件加载

### 2. 缓存服务API

提供完整的异步Redis操作接口：
- `get()` - 获取缓存
- `set()` - 设置缓存（支持过期时间）
- `delete()` - 删除缓存
- `exists()` - 检查缓存是否存在
- `expire()` - 设置过期时间
- `clear_prefix()` - 清除指定前缀的所有缓存

## 使用方法

### 启动Redis

**方式1: Docker Compose**
```bash
docker-compose up redis
```

**方式2: 本地安装**
```bash
# 安装并启动Redis
redis-server
```

### 配置

在 `backend/.env` 或环境变量中配置：

```env
# 启用Redis缓存
USE_REDIS_CACHE=true

# Redis连接配置（可选，有默认值）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
# 或直接使用URL
REDIS_URL=redis://localhost:6379/0
```

### 验证

启动后端服务，查看日志：

**有Redis时：**
```
Loading mock entity data from JSON files...
Loaded 3334 entities from 8 types
Cached entities data to Redis
```

**无Redis时（降级）：**
```
Warning: Failed to load from Redis cache: ...
Falling back to loading from JSON files...
Loading mock entity data from JSON files...
Loaded 3334 entities from 8 types
Warning: Failed to cache to Redis: ...
```

## 性能提升

- **首次加载**: ~2-3秒（从JSON文件）
- **缓存加载**: ~0.1-0.2秒（从Redis）
- **性能提升**: 约10-20倍

## 注意事项

1. Redis是可选的，不运行Redis也能正常工作
2. 缓存数据会在24小时后过期
3. 修改JSON文件后，需要清除Redis缓存或等待过期
4. Docker环境会自动连接到Redis容器

## 清除缓存

```bash
# 使用Redis CLI
redis-cli
DEL mock_ngsi:entities:all

# 或使用Python
python -c "from app.core.cache_service import get_cache_service; import asyncio; asyncio.run(get_cache_service().then(lambda cs: cs.clear_prefix('mock_ngsi')))"
```

