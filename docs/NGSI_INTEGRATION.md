# NGSI-LD 接入改造清单

## 配置与契约
- 环境变量：`NGSI_LD_ENDPOINT`、`NGSI_LD_CONTEXT`、`NGSI_LD_AUTH_TOKEN`(可选)、`USE_MOCK_DATA=false`、`USE_REDIS_CACHE=true`、`ENTITY_CACHE_TTL`。
- 契约校验：确保 `@context`、URN、ISO8601、Relationship.object 解析符合 `shared/contracts`。

## 核心客户端
- `backend/app/core/ngsi_client.py`：补全 `get_entity`、`query_entities`、`temporal_query`、批量查询、过滤(q/attrs/timerel/georel)；加入 auth header、超时、重试。
- 增加 `NGSIClient` 错误映射：404→HTTPException 404，其他→502/500。

## 实体与缓存
- `services/entity_service.py`：用真实 `ngsi_client` 代替 mock；`options=keyValues` 支持；Relationship 查询落地；缓存键沿用 `entities:*`。
- `core/cache_service.py`：确认 Redis 连接在 lifespan 启动，TTL 可配置。

## KPI
- `services/kpi_service.py`：改为从 ModalData/ModalityBinding 查询实时值；按契约映射6项KPI；可选缓存短TTL（1-5分钟）。

## 实时与WS
- `services/realtime_service.py`/`mock_realtime_service.py`：新增 `pull_latest_entities()` 从 NGSI-LD 拉取最新位置/状态；移除随机生成。
- `api/v1/websocket_routes.py`：接入 NGSI-LD 订阅（如无订阅接口则轮询+diff）；实现心跳、广播、批量更新格式 `{type:"entityUpdate",entities:[...]}`。

## 轨迹
- `services/trajectory_service.py`：实现 Temporal Query `/temporal/entities/{id}` 支持 `timerel=between/timeAt/endTimeAt`、`attrs=location,status`、分页/limit；插值/简化保留。
- `api/v1/trajectory.py`：调用真实服务，错误映射 404/400。

## 分析
- `services/analysis_service.py`：用真实数据计算瓶颈/质量/效率/Spaghetti；废弃 mock 静态结果。
- `api/v1/analysis.py`：保持接口，改为调用真实计算，必要时加 `hours`、`limit` 参数。

## 地图数据
- `services/map_service.py`：底图可改为 NGSI-LD TwinObject(type=Zone/Station/Passage/Buffer) 拉取生成 GeoJSON，或保留本地文件作为回退。

## 错误与日志
- 统一错误响应：`success=false`、`code/message/details`，记录 NGSI 请求耗时与失败原因。
- 超时/重试：httpx 超时 5-10s，重试 3 次（指数退避）。

## 前端影响
- `.env`: `VITE_API_BASE_URL`、`VITE_WS_URL`、`VITE_USE_MOCK=false`。
- 对齐后端返回结构：实体属性完整 `@context`、`location` GeoJSON、状态字段与契约一致。

## 测试与验证
- 单测：ngsi_client 调用（可用 httpx Mock）、entity/kpi/trajectory 服务、缓存命中。
- 集成：对 Mockserver/T1 环境跑实体列表、单实体、轨迹、KPI、WS 更新。
- 性能：1周轨迹<2s，WS 100并发，实体查询命中率>80%。

## 步骤建议
1) 完善 `ngsi_client` + 配置/env。  
2) 切换 `entity_service` 到真实 NGSI，验证列表/详情缓存。  
3) 接入 KPI 真实数据并设短TTL。  
4) 实现 Temporal Query 与轨迹接口。  
5) 替换 WS 数据源为 NGSI 订阅/轮询。  
6) 重新实现分析接口基于真实数据。  
7) 前端关闭 mock，联调实体/KPI/WS/轨迹。  
8) 补充测试与性能基线，更新文档。

