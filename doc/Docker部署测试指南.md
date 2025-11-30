# Docker部署测试指南

## 一、准备工作

### 1.1 检查Docker环境

确保已安装Docker和Docker Compose：

```bash
# 检查Docker版本
docker --version

# 检查Docker Compose版本
docker-compose --version
```

### 1.2 检查端口占用

确保以下端口未被占用：
- `5173` - 前端开发服务器
- `8000` - 后端API服务
- `6379` - Redis服务
- `9090` - Mock NGSI服务

## 二、启动服务

### 2.1 使用Docker Compose启动所有服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 或者分步执行
docker-compose build
docker-compose up -d
```

### 2.2 查看服务状态

```bash
# 查看所有服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis
```

### 2.3 使用测试脚本

**Windows PowerShell:**
```powershell
.\docker\test_docker.ps1
```

**Linux/Mac:**
```bash
chmod +x docker/test_docker.sh
./docker/test_docker.sh
```

## 三、服务配置

### 3.1 服务列表

| 服务 | 端口 | 地址 | 说明 |
|------|------|------|------|
| frontend | 5173 | http://localhost:5173 | 前端开发服务器 |
| backend | 8000 | http://localhost:8000 | 后端API服务 |
| redis | 6379 | localhost:6379 | Redis缓存服务 |
| mock-ngsi | 9090 | http://localhost:9090 | Mock NGSI服务 |

### 3.2 环境变量配置

**前端环境变量（docker-compose.yml）:**
- `VITE_API_BASE_URL=http://localhost:8000` - 后端API地址
- `VITE_WS_URL=ws://localhost:8000/api/v1/realtime/ws` - WebSocket地址
- `VITE_USE_MOCK=false` - 禁用前端Mock，使用真实后端

**后端环境变量:**
- `USE_MOCK_DATA=true` - 使用Mock数据服务
- `USE_REDIS_CACHE=true` - 启用Redis缓存
- `REDIS_HOST=redis` - Redis主机（Docker服务名）
- `REDIS_PORT=6379` - Redis端口

## 四、测试步骤

### 4.1 健康检查

```bash
# 后端健康检查
curl http://localhost:8000/health

# 后端Ping
curl http://localhost:8000/api/v1/ping
```

### 4.2 测试API端点

```bash
# 查询实体列表
curl "http://localhost:8000/api/v1/entities?type=TwinObject&limit=5"

# 获取单个实体
curl "http://localhost:8000/api/v1/entities/urn:ngsi-ld:TwinObject:Station:ST-HJ"

# 查询KPI
curl http://localhost:8000/api/v1/map/kpi

# 查询实时数据
curl http://localhost:8000/api/v1/realtime/entities
```

### 4.3 测试Redis缓存

```bash
# 进入后端容器
docker-compose exec backend bash

# 测试Redis连接
python -c "
import asyncio
from app.core.cache_service import get_cache_service

async def test():
    cs = await get_cache_service()
    await cs.set('test', 'value', expire=60)
    val = await cs.get('test')
    print(f'Redis连接成功: {val}')

asyncio.run(test())
"
```

### 4.4 测试前端连接

1. 打开浏览器访问: http://localhost:5173
2. 打开开发者工具（F12）
3. 检查Network标签，确认API请求正常
4. 检查Console标签，确认无错误

## 五、常见问题

### 5.1 端口被占用

```bash
# 查看端口占用
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000

# 停止占用端口的进程或修改docker-compose.yml中的端口映射
```

### 5.2 服务启动失败

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs frontend

# 重启服务
docker-compose restart backend
```

### 5.3 Redis连接失败

```bash
# 检查Redis服务状态
docker-compose ps redis

# 查看Redis日志
docker-compose logs redis

# 测试Redis连接
docker-compose exec redis redis-cli ping
```

### 5.4 前端无法连接后端

1. 检查CORS配置
2. 检查前端环境变量
3. 检查后端服务是否正常运行
4. 检查浏览器控制台错误

## 六、性能优化

### 6.1 Redis缓存

首次启动后，实体数据会缓存到Redis，后续启动会更快。

### 6.2 开发模式

- 前端：热重载已启用
- 后端：自动重载已启用（`--reload`）
- 修改代码后会自动重新加载

## 七、停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除卷
docker-compose down -v

# 停止特定服务
docker-compose stop backend
```

## 八、清理

```bash
# 删除所有容器和网络
docker-compose down

# 删除所有镜像
docker-compose down --rmi all

# 清理未使用的资源
docker system prune -a
```

## 九、生产部署

生产环境建议：

1. 使用 `prod` target构建镜像
2. 配置环境变量文件（`.env.production`）
3. 使用Nginx反向代理
4. 配置HTTPS
5. 使用Docker Swarm或Kubernetes进行编排

