# Phase1 契约摘要

> **说明**: 本摘要依据 `孪生建模/契约` 目录下 00~08 契约文档整理, 仅用于 Phase1 开发快速查阅。所有字段/语义必须以原契约文档为准, 实现过程中如有冲突, 以原文为权威。

## 1. 通用规范 (来源: `00_总契约.md`)
- **URN 格式**: `urn:ngsi-ld:{EntityType}:{UniqueID}`。示例: `urn:ngsi-ld:TwinObject:Station:ST-GZ-01`。
- **@context**: 所有接口与实体返回需包含, Phase1 统一使用 `https://example.com/contexts/production-context.jsonld`。
- **时间戳**: ISO 8601, 带时区, 如 `2025-11-12T10:30:00+08:00`。
- **Relationship 属性**: 目标通过 `object` 字段存储 URN。
- **只读原则**: 前端/后端均禁止对 NGSI-LD 平台执行写操作。

## 2. TwinObject 核心字段 (来源: `01_TwinObject契约.md`)
| 字段 | 说明 | 备注 |
| --- | --- | --- |
| `id` | 实体 URN | 必填 |
| `type` | Zone / Station / Robot / Person / Workpiece 等 | 必填 |
| `name.value` | 名称 | 本地化支持 `name_lang` |
| `location.value` | GeoJSON(Phase1 主要 Point/Polygon) | EPSG:10001 |
| `status.value` | 运行 (`Running`)/空闲(`Idle`)/故障(`Fault`)/维护(`Maintenance`) | Station / Robot 关键 |
| `processStep.value` | 工序编码, 例如 `T01:P0010` | Station 适用 |
| `stdCycleTime.value` | 标准节拍(分钟) | Station 可选 |
| `refScene`, `refMBOM` | Relationship, 指向 Scene/MBOM | Phase1 占位, Phase3 需有效 |

> **Phase1 实现范围**: 需覆盖 Zone(Polygon)、Station(Point+状态)、Buffer(Point) 等静态数据, 并提前填入 `status`、`processGroup` 等字段, 为 Phase2+ 提供基础。

## 3. Modality & ModalityBinding (来源: `04_Modality契约.md`, `05_ModalityBinding契约.md`)
- **Modality** 定义 KPI 指标:
  - `id`: `urn:ngsi-ld:Modality:Flow:DailyOutput` 等。
  - `name`, `unit`, `allowedRange`, `threshold`(green/yellow/red)。
  - Phase1 需至少覆盖 Flow 产量、PLT 信息率、WIP、Quality FPY、Cost OEE、Flexibility OTD 六项。
- **ModalityBinding** 负责将 KPI 绑定到实体:
  - `refModality` → `refEntity`(如产线、工位)。
  - 可扩展 `refRole`/`refScene` 等, Phase1 可仅绑定产线或关键工序。
- **实现要求**:
  - KPIBar 读取 `threshold` 决定颜色。
  - Mock 数据需提供合规的 `refModality` / `refEntity`。

## 4. ModalData (来源: `06_ModalData契约.md`)
| 字段 | 说明 |
| --- | --- |
| `id` | `urn:ngsi-ld:ModalData:{Entity}:{Metric}:{Timestamp}` |
| `type` | `"ModalData"` |
| `refEntity.object` | 指向 TwinObject |
| `refModality.object` | 指向 Modality |
| `value.value` | 数值 (number/string) |
| `unit.value` | 单位, 与 Modality 一致 |
| `qualityTag.value` | `Good/Warning/Bad` |
| `observedAt` | 采集时间 |

> Phase1: KPI 接口可直接聚合 ModalData 最新值。Phase2 开始, 设备/在制品实时状态也遵循 ModalData 结构。

## 5. Scene & MBOM (来源: `03_Scene契约.md`, `02_MBOM契约.md`)
- Phase1 只需在实体中预留 Relationship:
  - `refScene`: 关联到生产过程的时间框架, Phase3 用于历史轨迹。
  - `refMBOM`: 关联工艺/工序链, Phase4 路径分析使用。
- 数据格式参照契约, 但 Phase1 不需展开完整结构。

## 6. Role & Assignment (来源: `07_Role契约.md`, `08_Assignment契约.md`)
- Phase1 可作为占位, 保证人员实体具有 `refRole` 和 `refAssignment`。
- Phase2 实时人员追踪时, 需根据 Assignment 确认责任人/班组信息。

## 7. 接入策略
1. **类型定义**: 在 `shared/contracts` 中使用 TypeScript/Pydantic 描述以上字段, 并提供 JSON Schema 校验。
2. **Mock 数据**: 基于孪生建模目录下的实例 JSON(例如 `twinobject/stations_instances.json`, `modaldata_instances.json`), 按契约字段生成 Phase1 所需数据。
3. **接口格式**: 所有 API/WS 返回遵循 NGSI-LD 结构, 即便是 Mock 也需带 `@context`、`id`、`type`。

此摘要将随着 Phase 推进持续完善, 更新时务必标注日期与变更内容。

