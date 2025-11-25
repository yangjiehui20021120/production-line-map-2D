# Backend

FastAPI 服务, 负责对接 NGSI-LD、提供地图/KPI/轨迹 API 以及 WebSocket 数据。

## 快速开始
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

访问:
- REST: http://localhost:8000
- OpenAPI: http://localhost:8000/docs

## 测试
```bash
cd backend
pytest
```

## 环境变量
复制 `env.example` 为 `.env`, 关键项:
- `NGSI_LD_ENDPOINT`
- `USE_MOCK_DATA`

