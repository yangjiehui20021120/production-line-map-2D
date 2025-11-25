## 阶段三（历史回放）阶段性规划

### 1. 环境与前提
- 当前无 NGSI-LD 实际接入，全部通过 Mock 数据完成闭环验证。
- `test-data/trajectory_7days_sample.json` 以 `frontend/public/basemap/production-line.geojson` 为坐标背景，提供 AGV 的 7 日轨迹样本，作为后端查询与前端回放的基准。
- 前端 UI/交互需继续沿用 `frontend` 目录中既有的暗色主题、OpenLayers 布局与扩展方式。

### 2. 目标与交付
| 模块 | 描述 | 交付物 | 备注 |
| --- | --- | --- | --- |
| Mock Temporal API | 提供历史轨迹查询接口（分页、批量、多对象） | `backend/app/api/v1/trajectory_routes.py`、`trajectory_service.py`、`tests/test_trajectory.py` | 数据源读取 `test-data/trajectory_7days_sample.json` |
| 数据处理 | 插值/简化、异常点剔除、速度计算 | `backend/app/services/trajectory_processing.py` | 支撑 T3.2 要求 |
| 轨迹回放引擎 | OpenLayers 动画、速度控制、拖尾 | `frontend/src/components/TrajectoryPlayer.tsx` | 对接实时/历史数据 |
| 时间轴控件 | 播放器式 UI，按钮与快捷键 | `frontend/src/components/TimelineControl.tsx` | 与 TrajectoryPlayer 解耦 |
| 多对象管理 | 支持 5 个实体并行回放、颜色区分 | `frontend/src/stores/trajectoryStore.ts` | 负责选择/同步 |
| 性能优化 & 测试 | 1000 点<3秒加载、60fps动画 | 针对前端/后端单元与集成测试 | 结合 Vitest、Pytest |

### 3. Mock 数据方案
1. **后端**：启动时加载 `test-data/trajectory_7days_sample.json`，构建内存索引（按 entityId + ts），支持条件过滤。
2. **查询接口**：
   - `GET /api/v1/trajectory/{entityId}/points?startTime=&endTime=&limit=&offset=`。
   - `POST /api/v1/trajectory/batch` 支持多对象批量请求。
   - 响应字段遵循 NGSI-LD Temporal Query 风格：`entityId`, `observedAt`, `coordinates`, `velocity`, `status`.
3. **分页策略**：默认 `limit=200`，最大 `1000`；支持 `nextOffset`。
4. **插值/简化**：实现 Douglas-Peucker 简化与等间隔插值，确保轨迹点减少 50% 的同时维持关键节点。
5. **异常处理**：例如样本中的 `x=900` 属于离群点，需标记并可配置忽略。

### 4. 前端实现要点
- 新建 `trajectoryStore`：负责加载历史数据、缓存、选中实体、播放状态（play/pause/speed）。
- `TrajectoryPlayer`：基于 OpenLayers `VectorLayer` + `postrender` 绘制，支持：
  - 速度倍率：`1x/2x/5x/10x`；
  - 拖尾效果：最近 5 秒路径加粗/发光；
  - 多对象颜色区分、图例同步。
- `TimelineControl`：包含播放/暂停、快进/快退、时间刻度显示、键盘快捷键（Space/←/→）。
- 集成入口：在 `MapContainer` 新增历史回放面板入口，与实时视图互斥或可并行展示。

### 5. 验收与测试
- **后端**：Pytest 覆盖查询准确性、分页、批量、多线程安全。
- **前端**：Vitest + Playwright（如需）验证控件交互、状态同步、动画渲染。
- **性能**：在 Mock 数据基础上构造 1000+ 点轨迹，确保 3 秒内加载、60fps 回放。

### 6. 下一步行动
1. 实现后端 Mock Temporal API 及处理逻辑。
2. 前端搭建 `trajectoryStore`、`TrajectoryPlayer`、`TimelineControl` 基础框架。
3. 双端联调，确保契约字段一致。

