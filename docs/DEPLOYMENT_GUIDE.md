# Deployment Guide

## 开发环境 (docker-compose)
- 运行: `docker-compose up --build`
- 服务: frontend(5173)、backend(8000)、redis(6379)
- 环境变量示例: `.env`  
  - 后端: `NGSI_LD_ENDPOINT=http://mockserver:9090/ngsi-ld/v1`  
  - `USE_REDIS_CACHE=true`, `ENTITY_CACHE_TTL=300`

## 生产建议
- 使用 `docker-compose.prod.yml`（待补充）或 K8s
- 前端 Nginx 静态托管，反向代理后端 `/api` `/realtime/ws`
- 后端 `uvicorn --workers 4 --proxy-headers`
- 监控: 健康检查 `/health`，日志挂载，Redis 持久卷

## 构建
- 前端: `npm run build` → `docker build -f docker/frontend.Dockerfile`
- 后端: `docker build -f docker/backend.Dockerfile`

## 配置要点
- CORS: 允许前端域名
- 安全: 生产关闭 `USE_MOCK_DATA`，开启鉴权（后续）
- 性能: 开启 Redis 缓存，设置 `QUERY_TIMEOUT`、`MAX_WORKERS`


