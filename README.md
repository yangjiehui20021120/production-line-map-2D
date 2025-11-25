# 产线2D地图系统 Monorepo

该仓库用于实现 `T3_产线2D地图_技术规格书-V1_0` 中的全部功能, 包含前端、后端与共享契约。

## 目录
- `frontend/` — React + TypeScript + Vite(OpenLayers 将在此集成)
- `backend/` — FastAPI 服务, 对接 NGSI-LD/Mock
- `shared/` — 契约摘要、类型定义
- `docker/` — 前后端容器定义
- `scripts/` — 常用脚本(开发/测试)
- `doc/` — 规格书与补充文档(原有)

## 快速开始
```bash
# 前端
cd frontend
npm install
npm run dev

# 后端
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 测试
```bash
npm run test   # 前端 (Vitest)
cd backend && pytest
```

## CI
GitHub Actions 工作流位于 `.github/workflows/ci.yml`, 会执行:
1. `npm ci && npm run lint` (frontend)
2. `pip install -r backend/requirements.txt && pytest` (backend)

## 开发进度
- ✅ 阶段一：仓库搭建、CI 配置、GeoJSON 基础底图、OpenLayers 地图容器、KPI 面板、图层/视图控制、WebSocket 基础设施。
- ✅ 阶段二：实时监控核心模块——Mock WebSocket 数据流、Zustand 实时仓库、设备/在制品/人员数据结构、筛选面板、Feature Popup。
- 🚧 阶段三：历史回放（进行中）——`doc/phase3_progress_plan.md` 已输出 Mock 实施方案，下一步将落地 Temporal Query Mock API、轨迹回放组件与时间轴控件。
- 📌 当前重点：按照 `T3_产线2D地图_技术规格书-V1_0` 第 13 章进度计划推进 Phase 3，保持与契约/业务逻辑一致。
