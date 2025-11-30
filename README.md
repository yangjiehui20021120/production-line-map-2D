# 产线2D地图系统

基于数字孪生技术的生产线实时监控与历史回放系统，支持多视图分析、实时数据推送和历史轨迹回放。

## 📋 项目概述

本项目实现了一个完整的产线2D地图可视化系统，包含：

- **实时监控**：设备、在制品、人员的实时状态展示
- **多视图分析**：Flow（流动）、Quality（质量）、Efficiency（效率）、Plan（计划）、Spaghetti（意面图）五种专题视图
- **历史回放**：支持轨迹数据的时空回放和查询
- **KPI看板**：6个核心KPI指标实时展示
- **图层控制**：14个可配置图层，支持动态显示/隐藏

## 🏗️ 技术架构

### 前端
- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **地图引擎**：OpenLayers 9
- **状态管理**：Zustand
- **数据获取**：React Query
- **WebSocket**：原生 WebSocket API

### 后端
- **框架**：FastAPI
- **Python版本**：3.11+
- **数据格式**：NGSI-LD（数字孪生标准）
- **缓存**：Redis（可选）
- **实时通信**：WebSocket

### 数据流
```
Mock数据服务 → 后端API → 前端展示
     ↓
NGSI-LD Context Broker（生产环境）
```

## 📁 项目结构

```
production-line-map-2D/
├── frontend/          # React前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── services/      # API服务层
│   │   ├── stores/        # Zustand状态管理
│   │   ├── types/         # TypeScript类型定义
│   │   └── utils/         # 工具函数
│   └── public/            # 静态资源（GeoJSON底图）
│
├── backend/           # FastAPI后端服务
│   ├── app/
│   │   ├── api/v1/       # API路由
│   │   ├── core/         # 核心服务（配置、缓存、NGSI客户端）
│   │   ├── services/     # 业务服务层
│   │   ├── models/       # 数据模型（Pydantic）
│   │   ├── middleware/   # 中间件（CORS、错误处理、限流）
│   │   └── utils/        # 工具函数
│   ├── data/              # Mock数据（JSON文件）
│   └── scripts/          # 数据准备脚本
│
├── shared/            # 共享代码
│   ├── contracts/        # NGSI-LD契约文档
│   └── types/            # 共享类型定义（Python + TypeScript）
│
├── docker/            # Docker配置文件
├── doc/               # 项目文档
└── test-data/         # 测试数据（轨迹样本）
```

## 🚀 快速开始

### 环境要求

- **Node.js**：18+
- **Python**：3.11+
- **Docker**（可选）：用于容器化部署
- **Redis**（可选）：用于缓存加速

### 方式一：Docker Compose（推荐）

```bash
# 1. 复制环境变量配置
cp env.docker.example .env

# 2. 启动所有服务
docker-compose up --build

# 3. 访问应用
# 前端：http://localhost:5173
# 后端API：http://localhost:8000
# API文档：http://localhost:8000/docs
```

服务包括：
- `frontend`：前端开发服务器（端口5173）
- `backend`：后端API服务（端口8000）
- `redis`：Redis缓存（端口6379）
- `mock-ngsi`：Mock NGSI-LD服务（端口9090）

### 方式二：本地开发

#### 前端

```bash
cd frontend
npm install
npm run dev
```

前端将在 `http://localhost:5173` 启动。

#### 后端

```bash
cd backend

# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 准备Mock数据（首次运行）
python scripts/prepare_mock_data.py

# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端将在 `http://localhost:8000` 启动，API文档在 `http://localhost:8000/docs`。

## ⚙️ 配置说明

### 前端配置

创建 `frontend/.env`：

```env
# API基础地址
VITE_API_BASE_URL=http://localhost:8000

# WebSocket地址
VITE_WS_URL=ws://localhost:8000/api/v1/realtime/ws
```

### 后端配置

创建 `backend/.env`：

```env
# 项目配置
PROJECT_NAME="Production Line Map API"
VERSION="0.1.0"
API_V1_PREFIX="/api/v1"

# Mock数据模式（开发环境）
USE_MOCK_DATA=True

# Redis配置（可选）
USE_REDIS_CACHE=True
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# NGSI-LD端点（生产环境）
NGSI_LD_ENDPOINT=http://localhost:9090/ngsi-ld/v1

# 日志级别
LOG_LEVEL=INFO
```

## 📡 API接口

### 核心接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/map/kpi` | GET | 获取KPI指标 |
| `/api/v1/realtime/entities` | GET | 获取实时实体数据 |
| `/api/v1/realtime/ws` | WebSocket | 实时数据推送 |
| `/api/v1/trajectory/search` | GET | 查询轨迹摘要 |
| `/api/v1/trajectory/{id}/series` | GET | 获取轨迹时间序列 |
| `/api/v1/analysis/bottlenecks` | GET | 瓶颈分析 |
| `/api/v1/analysis/quality-issues` | GET | 质量问题分析 |
| `/api/v1/analysis/efficiency-issues` | GET | 效率问题分析 |
| `/api/v1/analysis/spaghetti-paths` | GET | 意面图路径分析 |
| `/api/v1/map/basemap` | GET | 获取底图GeoJSON |
| `/api/v1/entities` | GET | 查询NGSI-LD实体 |

完整API文档：访问 `http://localhost:8000/docs`

## 🎯 功能特性

### 实时监控
- ✅ 设备状态实时展示（Running/Idle/Fault/Maintenance）
- ✅ 在制品位置跟踪
- ✅ 人员位置和状态
- ✅ WebSocket实时数据推送

### 专题视图
- ✅ **Flow视图**：生产节奏与物流瓶颈分析
- ✅ **Quality视图**：质量异常与缺陷分析
- ✅ **Efficiency视图**：设备效率与成本分析
- ✅ **Plan视图**：订单排产与交付
- ✅ **Spaghetti视图**：物流路径综合分析

### 历史回放
- ✅ 轨迹数据查询和过滤
- ✅ 时间轴播放控制
- ✅ 多实体轨迹同时回放
- ✅ 轨迹抽稀和性能优化

### KPI看板
- ✅ Flow产量
- ✅ PLT信息率
- ✅ WIP在制数
- ✅ Quality FPY
- ✅ Cost OEE
- ✅ Flexibility OTD

### 图层控制
支持14个可配置图层：
- 工位状态层
- 路径流量监控
- 在制品位置
- 瓶颈标识
- 安灯层
- 设备OEE层
- 设备状态
- 人员层
- 天车系统
- 订单位置
- 意面图路径
- 品质层
- 返工路径
- 水蜘蛛路线

## 🧪 测试

### 前端测试

```bash
cd frontend
npm run test
```

### 后端测试

```bash
cd backend
pytest
```

### API测试

```bash
cd backend
python test_api.py
```

## 📚 文档

- [技术规格书](doc/T3_产线2D地图_技术规格书-V1_0.md)
- [前后端连接测试指南](doc/前后端连接测试指南.md)
- [Docker部署测试指南](doc/Docker部署测试指南.md)
- [Redis缓存配置说明](doc/Redis缓存配置说明.md)

## 🔧 开发指南

### 数据流说明

系统采用 **Mock数据服务 → 后端API → 前端展示** 的数据流：

1. **Mock数据服务**：`backend/app/services/mock_ngsi_service.py` 和 `mock_realtime_service.py` 提供模拟数据
2. **后端API**：FastAPI路由层处理请求，调用服务层获取数据
3. **前端展示**：React组件通过服务层调用API，使用Zustand管理状态

### 添加新功能

1. **后端**：
   - 在 `app/services/` 添加业务逻辑
   - 在 `app/api/v1/` 添加路由
   - 在 `app/models/` 定义数据模型

2. **前端**：
   - 在 `src/services/` 添加API调用
   - 在 `src/components/` 添加UI组件
   - 在 `src/stores/` 管理状态

### Mock数据准备

```bash
cd backend
python scripts/prepare_mock_data.py
```

该脚本会从 `孪生建模/` 目录复制JSON数据到 `backend/data/entities/`。

## 🐳 Docker部署

### 开发环境

```bash
docker-compose up --build
```

### 生产环境

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 📊 项目状态

### 已完成 ✅

- [x] 项目架构搭建（Monorepo）
- [x] 前端基础框架（React + TypeScript + OpenLayers）
- [x] 后端API框架（FastAPI）
- [x] 实时监控功能
- [x] 多视图分析功能
- [x] 历史回放功能
- [x] KPI看板
- [x] 图层控制系统
- [x] Mock数据服务
- [x] WebSocket实时推送
- [x] Redis缓存集成
- [x] Docker容器化

### 进行中 🚧

- [ ] NGSI-LD客户端完整实现（当前为注释版本）
- [ ] 生产环境部署配置
- [ ] 性能优化

### 计划中 📋

- [ ] 单元测试覆盖率提升
- [ ] E2E测试
- [ ] 监控和日志系统
- [ ] 用户权限管理

## 🤝 贡献

欢迎提交Issue和Pull Request。

## 📄 许可证

[待定]

## 📞 联系方式

[待定]

---

**最后更新**：2025-11-30
