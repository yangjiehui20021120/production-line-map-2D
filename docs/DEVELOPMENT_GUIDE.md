# Development Guide

## 环境
- Node 20+, Python 3.11+, Redis 7+
- 前端: `cd frontend && npm i`
- 后端: `cd backend && pip install -r requirements.txt`

## 启动
- 前端: `npm run dev`
- 后端: `uvicorn app.main:app --reload`
- Redis: `docker run -p6379:6379 redis:7-alpine`

## 配置
- `.env` 后端关键: `NGSI_LD_ENDPOINT, USE_MOCK_DATA, USE_REDIS_CACHE, ENTITY_CACHE_TTL`
- 前端 `.env`: `VITE_API_BASE_URL, VITE_WS_URL, VITE_USE_MOCK`

## 代码规范
- 前端 ESLint+Prettier, 后端 black/flake8
- 分支: feature/* → develop/main，PR 需 lint+test 通过

## Mock/实数切换
- 后端: `USE_MOCK_DATA=true` 使用本地 Mock；否则走 NGSI-LD
- 前端: `VITE_USE_MOCK=true` 走 MSW/本地数据

## 测试命令
- 前端: `npm run test` / `npm run test:coverage`
- 后端: `pytest` / `pytest --cov=app`

## 常见问题
- Redis未起: 关闭 `USE_REDIS_CACHE` 或启动 Redis
- NGSI不可达: 开启 `USE_MOCK_DATA`


