# Redis缓存配置说明

## 一、Redis配置

### 1.1 配置项

在 `backend/app/core/config.py` 中已添加Redis配置：

```python
# Redis配置
REDIS_HOST: str = "localhost"
REDIS_PORT: int = 6379
REDIS_DB: int = 0
REDIS_URL: str = "redis://localhost:6379/0"  # 如果设置了REDIS_URL，会覆盖HOST/PORT/DB
USE_REDIS_CACHE: bool = True  # 是否启用Redis缓存
```

### 1.2 环境变量配置

可以通过环境变量或 `.env` 文件配置：

```env
# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
# 或者直接使用REDIS_URL
REDIS_URL=redis://localhost:6379/0
USE_REDIS_CACHE=true
```

### 1.3 Docker配置

在 `docker-compose.yml` 中已配置Redis服务：

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

后端服务会自动连接到Redis（通过环境变量 `REDIS_HOST=redis`）。

## 二、Redis缓存功能

### 2.1 Mock NGSI服务缓存

Mock NGSI服务已集成Redis缓存：

- **首次加载**: 从JSON文件加载实体数据，并缓存到Redis（24小时过期）
- **后续加载**: 优先从Redis缓存加载，大幅提升加载速度
- **缓存键**: `mock_ngsi:entities:all`
- **缓存内容**: 包含所有实体类型和按ID索引的实体

### 2.2 缓存服务API

`backend/app/core/cache_service.py` 提供了完整的Redis缓存服务：

```python
from app.core.cache_service import get_cache_service

# 获取缓存服务
cache_service = await get_cache_service()

# 设置缓存
await cache_service.set("key", {"data": "value"}, prefix="app", expire=3600)

# 获取缓存
value = await cache_service.get("key", prefix="app")

# 删除缓存
await cache_service.delete("key", prefix="app")

# 检查缓存是否存在
exists = await cache_service.exists("key", prefix="app")

# 设置过期时间
await cache_service.expire("key", seconds=7200, prefix="app")

# 清除指定前缀的所有缓存
await cache_service.clear_prefix("app")
```

## 三、使用场景

### 3.1 实体数据缓存

Mock NGSI服务自动使用Redis缓存实体数据，无需手动操作。

### 3.2 自定义缓存

可以在服务中使用Redis缓存其他数据：

```python
from app.core.cache_service import get_cache_service

async def get_cached_data(key: str):
    cache_service = await get_cache_service()
    cached = await cache_service.get(key, prefix="my_service")
    if cached:
        return cached
    
    # 从数据源获取
    data = await fetch_from_source()
    
    # 缓存结果
    await cache_service.set(key, data, prefix="my_service", expire=3600)
    return data
```

## 四、启动和测试

### 4.1 启动Redis

**方式1: 使用Docker Compose**
```bash
docker-compose up redis
```

**方式2: 本地安装Redis**
```bash
# Windows (使用Chocolatey)
choco install redis-64

# Linux
sudo apt-get install redis-server

# Mac
brew install redis

# 启动Redis
redis-server
```

### 4.2 测试Redis连接

```python
# 测试Redis连接
from app.core.cache_service import get_cache_service

async def test_redis():
    try:
        cache_service = await get_cache_service()
        await cache_service.set("test", "value", expire=60)
        value = await cache_service.get("test")
        print(f"Redis连接成功: {value}")
    except Exception as e:
        print(f"Redis连接失败: {e}")
```

### 4.3 验证缓存功能

启动后端服务后，查看日志：

```
Loading mock entity data from JSON files...
Loaded 3334 entities from 8 types
Cached entities data to Redis
```

第二次启动时（如果Redis中有缓存）：

```
Loaded 3334 entities from Redis cache
```

## 五、性能优化

### 5.1 缓存策略

- **实体数据**: 缓存24小时（86400秒）
- **查询结果**: 可根据需要缓存（建议5-30分钟）
- **实时数据**: 不缓存或短时间缓存（建议<1分钟）

### 5.2 缓存键命名规范

使用前缀避免键冲突：

- `mock_ngsi:entities:all` - Mock实体数据
- `app:query:{entity_type}:{hash}` - 查询结果缓存
- `app:entity:{entity_id}` - 单个实体缓存

## 六、故障处理

### 6.1 Redis不可用

如果Redis不可用，系统会：
1. 打印警告信息
2. 继续使用内存缓存（Mock服务）
3. 不影响基本功能

### 6.2 清除缓存

```python
from app.core.cache_service import get_cache_service

async def clear_all_cache():
    cache_service = await get_cache_service()
    await cache_service.clear_prefix("mock_ngsi")
    await cache_service.clear_prefix("app")
```

### 6.3 禁用Redis缓存

设置环境变量：
```env
USE_REDIS_CACHE=false
```

或修改 `config.py`:
```python
USE_REDIS_CACHE: bool = False
```

## 七、监控和调试

### 7.1 Redis CLI

```bash
# 连接Redis
redis-cli

# 查看所有键
KEYS *

# 查看特定前缀的键
KEYS mock_ngsi:*

# 查看键的值
GET mock_ngsi:entities:all

# 查看键的TTL
TTL mock_ngsi:entities:all

# 删除键
DEL mock_ngsi:entities:all
```

### 7.2 监控缓存命中率

可以在代码中添加统计：

```python
# 缓存命中统计
cache_hits = 0
cache_misses = 0

# 在get方法中统计
if cached:
    cache_hits += 1
else:
    cache_misses += 1
```

## 八、最佳实践

1. **合理设置过期时间**: 根据数据更新频率设置
2. **使用前缀**: 避免键冲突
3. **错误处理**: Redis不可用时要有降级方案
4. **监控**: 定期检查Redis内存使用情况
5. **清理**: 定期清理过期或不需要的缓存

