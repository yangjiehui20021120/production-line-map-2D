# 核心实体字段表与JSON Schema规范
## 版本: V2.3 | 更新日期: 2025-10-16

---

## 一、核心决策说明

### 1.1 Station和Position纳入TwinObject体系

**决策**: Station(工位/缓存区)和Position(台位)正式纳入TwinObject孪生对象体系

**理由**:
- Station和Position是生产空间的物理/逻辑实体,具有位置、状态、能力等孪生特征
- 需要统一的标识、版本管理和溯源机制
- 与设备、工装等其他TwinObject保持一致的建模范式

**实现方式**:
- Station: `twin_type = "Station"` 或 `"BufferZone"`
- Position: `twin_type = "Position"`
- 都使用统一的 `urn:ngsi-ld:TwinObject:{Type}.{Code}` 命名规则

### 1.2 方案3架构特征

**核心原则**:
1. **统一注册**: 所有实体都有唯一ID和注册表
2. **责任可追溯**: Role → Assignment → Person 完整责任链
3. **三锚机制**: 时间锚(when)、空间锚(where)、责任锚(who)
4. **版本化管理**: 所有配置变更都有版本记录和审计轨迹
5. **数据契约**: 通过ModalityBinding定义数据采集和质量规则

---

## 二、核心实体字段表

### 2.1 TwinObject (孪生对象) - 扩展版

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string | ✓ | URN格式唯一标识 | `urn:ngsi-ld:TwinObject:Station.ST-GZ-03` |
| `type` | const | ✓ | 固定值 "TwinObject" | `TwinObject` |
| `twin_code` | string | ✓ | 业务编码 | `ST-GZ-03`, `POS-A1` |
| `twin_name_cn` | string | ✓ | 中文名称 | `焊接工位3号`, `A1台位` |
| `twin_type` | enum | ✓ | 对象类型 | `Station/Position/Robot/Fixture/Gauge` |
| `twin_subtype` | string | | 子类型 | `BufferZone`, `WeldingStation` |
| `status` | enum | ✓ | 状态 | `active/maintenance/retired` |
| `located_in_station_code` | string | | 所在工位(仅Position需要) | `ST-GZ-03` |
| `parent_twin_id` | string | | 父对象引用 | `urn:ngsi-ld:TwinObject:Station.ST-GZ-03` |
| `capability_tags` | array[string] | | 能力标签 | `["CAP.WELD", "CAP.ROBOT"]` |
| `supports_modalities` | array[string] | | 支持的模态 | `["TEMP", "CURRENT", "IMAGE"]` |
| `coordinate_x` | float | | X坐标 | `125.5` |
| `coordinate_y` | float | | Y坐标 | `80.3` |
| `coordinate_z` | float | | Z坐标(可选) | `10.0` |
| `capacity_wip` | integer | | 在制品容量 | `5` |
| `hazard_flags` | array[enum] | | 风险标记 | `["WELDING", "LIFTING", "HIGH_TEMP"]` |
| `vendor` | string | | 供应商 | `ABB`, `FANUC` |
| `model` | string | | 型号 | `IRB-6700` |
| `serial_no` | string | | 序列号 | `SN202501001` |
| `safety_constraints` | string | | 安全约束说明 | `需佩戴防护面罩;禁止越线作业` |
| `alias_codes` | array[string] | | 别名/旧编码 | `["TS36120201", "老3号位"]` |
| `metadata` | object | | 扩展元数据 | `{"线体": "侧墙产线", "区域": "焊接区"}` |
| `effective_from` | datetime | | 生效时间 | `2025-01-01T00:00:00Z` |
| `effective_to` | datetime | | 失效时间 | `2025-12-31T23:59:59Z` |
| `created_at` | datetime | | 创建时间(系统生成) | `2025-01-15T08:30:00Z` |
| `updated_at` | datetime | | 更新时间(系统生成) | `2025-10-16T14:20:00Z` |
| `version` | string | | 版本号 | `V2.1` |
| `notes` | string | | 备注 | 自由文本 |

**Station特有字段** (当 `twin_type = "Station"` 或 `"BufferZone"`):
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `line_code` | string | | 所属产线 |
| `area_code` | string | | 所属区域 |
| `zone_id` | string | | 所属分区 |
| `is_buffer` | boolean | ✓ | 是否为缓存区 |

**Position特有字段** (当 `twin_type = "Position"`):
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `station_code` | string | ✓ | 所属工位编码 |
| `position_code` | string | ✓ | 台位编码 |
| `offset_x` | float | | 相对工位X偏移 |
| `offset_y` | float | | 相对工位Y偏移 |

---

### 2.2 Scene (场景)

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string | ✓ | URN格式 | `urn:ngsi-ld:Scene:WeldProc.2025-10-16T14:30:00` |
| `type` | const | ✓ | 固定值 "Scene" | `Scene` |
| `scene_type` | enum | ✓ | 场景类型 | `ProcessExecution/Inspection/Transfer` |
| `workpiece_sn` | string | ✓ | 在制件序列号 | `ZQ-2025-00123` |
| `route_id` | string | ✓ | 工艺路线ID | `urn:ngsi-ld:Route:SideWall.V2.0` |
| `takt_id` | string | ✓ | 节拍ID | `urn:ngsi-ld:Takt:T01` |
| `proc_id` | string | ✓ | 工序ID | `urn:ngsi-ld:Proc:P30` |
| `step_id` | string | ✓ | 工步ID | `urn:ngsi-ld:Step:S01` |
| `station_id` | string | ✓ | 工位ID(空间锚) | `urn:ngsi-ld:TwinObject:Station.ST-GZ-03` |
| `position_id` | string | | 台位ID | `urn:ngsi-ld:TwinObject:Position.POS-A1` |
| `start_time` | datetime | ✓ | 开始时间(时间锚) | `2025-10-16T14:30:00Z` |
| `end_time` | datetime | | 结束时间 | `2025-10-16T14:45:00Z` |
| `status` | enum | ✓ | 状态 | `InProgress/Completed/Failed` |
| `assignments` | array[object] | ✓ | 责任分配(责任锚) | `[{"role_id": "...", "person_id": "..."}]` |
| `involved_twins` | array[string] | | 涉及的孪生体 | `["urn:ngsi-ld:TwinObject:Robot.R01"]` |
| `quality_gate_passed` | boolean | | 质量关口通过 | `true/false` |
| `notes` | string | | 备注 | 自由文本 |

---

### 2.3 MBOM (制造物料清单)

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string | ✓ | URN格式 | `urn:ngsi-ld:MBOM:Item.SW-FRAME-001` |
| `type` | const | ✓ | 固定值 "MBOM" | `MBOM` |
| `mbom_code` | string | ✓ | MBOM编码 | `SW-FRAME-001` |
| `item_name_cn` | string | ✓ | 物料中文名 | `侧墙骨架总成` |
| `parent_mbom_code` | string | | 父级MBOM编码 | `SW-BODY-001` |
| `level` | integer | ✓ | BOM层级 | `1` |
| `quantity` | float | ✓ | 用量 | `1.0` |
| `unit` | string | ✓ | 单位 | `件/套/个` |
| `material_spec` | string | | 材料规格 | `Q235B, 厚度3mm` |
| `process_route_ref` | string | | 工艺路线引用 | `urn:ngsi-ld:Route:...` |
| `supplier_code` | string | | 供应商编码 | `SUP-2025-001` |
| `version` | string | ✓ | 版本号 | `V1.2` |
| `effective_from` | datetime | ✓ | 生效时间 | `2025-01-01T00:00:00Z` |
| `effective_to` | datetime | | 失效时间 | |
| `status` | enum | ✓ | 状态 | `active/obsolete` |
| `notes` | string | | 备注 | |

---

### 2.4 Role (角色)

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string | ✓ | URN格式 | `urn:ngsi-ld:Role:WeldOperator` |
| `type` | const | ✓ | 固定值 "Role" | `Role` |
| `role_code` | string | ✓ | 角色编码 | `ROLE_WELD_OP` |
| `name` | string | ✓ | 角色名称 | `焊接操作工` |
| `description` | string | | 角色描述 | `负责执行焊接作业的一线操作人员` |
| `responsibilities` | array[string] | | 职责清单 | `["执行焊接作业", "记录参数", "报告异常"]` |
| `permissionSet` | array[string] | | 权限集合 | `["MES_StartWork", "MES_ReportIssue"]` |
| `qualificationReq` | array[string] | | 资质要求 | `["焊工证", "安全培训证"]` |
| `kpiOwnership` | array[string] | | 关联KPI | `["一次合格率", "返工率"]` |
| `orgScope` | string | | 组织范围 | `焊接车间` |
| `relatedFunctions` | array[string] | | 相关职能 | `["质量管理", "工艺执行"]` |
| `effective_from` | datetime | | 生效时间 | `2025-01-01T00:00:00Z` |
| `effective_to` | datetime | | 失效时间 | |
| `ownerOrg` | string | | 归属组织 | `制造部` |
| `policyRef` | string | | 政策引用 | `urn:ngsi-ld:Policy:SafetyPolicy01` |
| `version` | string | | 版本号 | `V1.0` |
| `notes` | string | | 备注 | |

---

### 2.5 Assignment (岗位指派)

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string | ✓ | URN格式 | `urn:ngsi-ld:Assignment:20251016-001` |
| `type` | const | ✓ | 固定值 "Assignment" | `Assignment` |
| `assigneeId` | string | ✓ | 被指派人员ID | `urn:ngsi-ld:TwinObject:Person.EMP001` |
| `roleId` | string | ✓ | 角色ID | `urn:ngsi-ld:Role:WeldOperator` |
| `orgId` | string | ✓ | 组织单元ID | `urn:ngsi-ld:OrgUnit:WeldShop` |
| `sceneId` | string | | 场景ID(可选) | `urn:ngsi-ld:Scene:...` |
| `validFrom` | datetime | ✓ | 有效开始时间 | `2025-10-16T08:00:00Z` |
| `validTo` | datetime | ✓ | 有效结束时间 | `2025-10-16T20:00:00Z` |
| `shiftId` | string | | 班次ID | `SHIFT_DAY` |
| `qualificationRef` | array[string] | | 资质证明引用 | `["urn:ngsi-ld:Qualification:..."]` |
| `approvalRef` | string | | 审批记录引用 | `urn:ngsi-ld:Approval:...` |
| `assignmentStatus` | enum | ✓ | 指派状态 | `Active/Suspended/Revoked` |
| `station_code` | string | | 指派工位 | `ST-GZ-03` |
| `notes` | string | | 备注 | |

---

### 2.6 Modality (模态定义)

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string | ✓ | URN格式 | `urn:ngsi-ld:Modality:TEMP` |
| `type` | const | ✓ | 固定值 "Modality" | `Modality` |
| `modality_code` | string | ✓ | 模态编码 | `TEMP`, `CURRENT`, `IMAGE` |
| `modality_name` | string | ✓ | 模态名称 | `温度`, `电流`, `图像` |
| `category` | enum | ✓ | 类别 | `Sensor/Vision/Audio/Control` |
| `unit` | string | | 单位 | `°C`, `A`, `pixel` |
| `data_type` | enum | ✓ | 数据类型 | `numeric/image/video/text` |
| `value_range` | object | | 值域范围 | `{"min": 0, "max": 1000}` |
| `quality_rules` | array[string] | | 质量规则引用 | `["urn:ngsi-ld:QualityRule:..."]` |
| `description` | string | | 描述 | 详细说明 |
| `version` | string | | 版本号 | `V1.0` |
| `notes` | string | | 备注 | |

---

### 2.7 ModalityBinding (模态绑定)

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string | ✓ | URN格式 | `urn:ngsi-ld:ModalityBinding:R01-TEMP-001` |
| `type` | const | ✓ | 固定值 "ModalityBinding" | `ModalityBinding` |
| `binding_code` | string | ✓ | 绑定编码 | `R01-TEMP-001` |
| `twin_code` | string | ✓ | 孪生体编码 | `R01` (机器人) |
| `twin_id` | string | ✓ | 孪生体ID引用 | `urn:ngsi-ld:TwinObject:Robot.R01` |
| `modality_code` | string | ✓ | 模态编码 | `TEMP` |
| `modality_id` | string | ✓ | 模态ID引用 | `urn:ngsi-ld:Modality:TEMP` |
| `source_type` | enum | ✓ | 数据源类型 | `opcua/mqtt/http/modbus` |
| `source_ref` | string | ✓ | 数据源引用 | `ns=2;s=Robot.Temperature` |
| `payload_path` | string | | 字段路径 | `$.data.temp` (JSONPath) |
| `sample_model` | enum | ✓ | 采样模式 | `periodic/event/onDemand` |
| `sample_rate_ms` | integer | | 采样周期(毫秒) | `1000` |
| `trigger` | enum | | 触发方式 | `byStep/event/cron` |
| `filter_pipeline` | string | | 过滤/聚合管道 | `avg(5s)` |
| `quality_rule_id` | string | | 质量规则ID | `urn:ngsi-ld:QualityRule:...` |
| `provenance_template` | object | | 溯源模板 | `{"method": "opcua", "version": "1.0"}` |
| `time_sync_policy` | string | | 时钟同步策略 | `Clock±50ms` |
| `effective_from` | datetime | ✓ | 生效时间 | `2025-01-01T00:00:00Z` |
| `binding_version` | string | ✓ | 绑定版本 | `V1.0` |
| `status` | enum | ✓ | 状态 | `active/deprecated` |
| `notes` | string | | 备注 | |

---

### 2.8 ModalData (模态数据)

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | string | ✓ | URN格式 | `urn:ngsi-ld:ModalData:R01-TEMP-20251016143000` |
| `type` | const | ✓ | 固定值 "ModalData" | `ModalData` |
| `binding_id` | string | ✓ | 绑定关系ID | `urn:ngsi-ld:ModalityBinding:R01-TEMP-001` |
| `scene_id` | string | ✓ | 场景ID(空间锚) | `urn:ngsi-ld:Scene:...` |
| `timestamp` | datetime | ✓ | 时间戳(时间锚) | `2025-10-16T14:30:00.123Z` |
| `value` | any | ✓ | 数据值 | `85.3` (根据模态类型) |
| `unit` | string | | 单位 | `°C` |
| `quality_tag` | enum | ✓ | 质量标签 | `OK/Warn/Error/Missing/Outlier` |
| `provenance` | object | ✓ | 溯源信息 | `{"source": "...", "method": "..."}` |
| `derivedFrom` | array[string] | | 派生自(血缘) | `["urn:ngsi-ld:ModalData:..."]` |
| `responsibility_chain` | array[object] | | 责任链 | `[{"role": "...", "person": "..."}]` |
| `metadata` | object | | 扩展元数据 | 自定义字段 |

---

## 三、JSON Schema定义

### 3.1 TwinObject Schema (含Station/Position)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schema/TwinObject.schema.json",
  "title": "TwinObject",
  "type": "object",
  "required": ["id", "type", "twin_code", "twin_name_cn", "twin_type", "status"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:TwinObject:[A-Za-z]+\\.[A-Z0-9_-]+$",
      "description": "URN格式唯一标识,格式: urn:ngsi-ld:TwinObject:{Type}.{Code}"
    },
    "type": {
      "const": "TwinObject"
    },
    "twin_code": {
      "type": "string",
      "description": "业务编码,如 ST-GZ-03, POS-A1, R01"
    },
    "twin_name_cn": {
      "type": "string",
      "description": "中文名称"
    },
    "twin_type": {
      "type": "string",
      "enum": [
        "Station",
        "BufferZone",
        "Position",
        "Robot",
        "Welder",
        "Crane",
        "AGV",
        "Fixture",
        "Gauge",
        "Jig",
        "Sensor",
        "Camera",
        "PLC",
        "Workpiece"
      ],
      "description": "孪生对象类型"
    },
    "twin_subtype": {
      "type": "string",
      "description": "子类型,可自定义"
    },
    "status": {
      "type": "string",
      "enum": ["active", "maintenance", "retired", "offline"],
      "description": "对象状态"
    },
    "located_in_station_code": {
      "type": "string",
      "description": "所在工位编码(仅Position需要)"
    },
    "parent_twin_id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:TwinObject:.+",
      "description": "父对象ID引用"
    },
    "capability_tags": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^CAP\\..+"
      },
      "description": "能力标签,格式: CAP.{CAPABILITY_NAME}"
    },
    "supports_modalities": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "支持的模态列表"
    },
    "coordinate_x": {
      "type": "number",
      "description": "X坐标"
    },
    "coordinate_y": {
      "type": "number",
      "description": "Y坐标"
    },
    "coordinate_z": {
      "type": "number",
      "description": "Z坐标"
    },
    "capacity_wip": {
      "type": "integer",
      "minimum": 0,
      "description": "在制品容量"
    },
    "hazard_flags": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["WELDING", "LIFTING", "HIGH_TEMP", "HIGH_VOLTAGE", "CONFINED_SPACE", "CHEMICAL"]
      },
      "description": "风险标记"
    },
    "vendor": {
      "type": "string",
      "description": "供应商"
    },
    "model": {
      "type": "string",
      "description": "型号"
    },
    "serial_no": {
      "type": "string",
      "description": "序列号"
    },
    "safety_constraints": {
      "type": "string",
      "description": "安全约束说明"
    },
    "alias_codes": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "别名或旧编码"
    },
    "metadata": {
      "type": "object",
      "description": "扩展元数据"
    },
    "effective_from": {
      "type": "string",
      "format": "date-time",
      "description": "生效时间"
    },
    "effective_to": {
      "type": "string",
      "format": "date-time",
      "description": "失效时间"
    },
    "version": {
      "type": "string",
      "description": "版本号"
    },
    "notes": {
      "type": "string",
      "description": "备注"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "twin_type": {
            "enum": ["Station", "BufferZone"]
          }
        }
      },
      "then": {
        "properties": {
          "line_code": {
            "type": "string",
            "description": "所属产线编码"
          },
          "area_code": {
            "type": "string",
            "description": "所属区域编码"
          },
          "zone_id": {
            "type": "string",
            "description": "所属分区ID"
          },
          "is_buffer": {
            "type": "boolean",
            "description": "是否为缓存区"
          }
        },
        "required": ["is_buffer"]
      }
    },
    {
      "if": {
        "properties": {
          "twin_type": {
            "const": "Position"
          }
        }
      },
      "then": {
        "properties": {
          "station_code": {
            "type": "string",
            "description": "所属工位编码"
          },
          "position_code": {
            "type": "string",
            "description": "台位编码"
          },
          "offset_x": {
            "type": "number",
            "description": "相对工位X偏移"
          },
          "offset_y": {
            "type": "number",
            "description": "相对工位Y偏移"
          }
        },
        "required": ["station_code", "position_code"]
      }
    }
  ]
}
```

### 3.2 Scene Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schema/Scene.schema.json",
  "title": "Scene",
  "type": "object",
  "required": [
    "id",
    "type",
    "scene_type",
    "workpiece_sn",
    "route_id",
    "takt_id",
    "proc_id",
    "step_id",
    "station_id",
    "start_time",
    "status",
    "assignments"
  ],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Scene:.+",
      "description": "场景唯一标识"
    },
    "type": {
      "const": "Scene"
    },
    "scene_type": {
      "type": "string",
      "enum": ["ProcessExecution", "Inspection", "Transfer", "Rework", "Emergency"],
      "description": "场景类型"
    },
    "workpiece_sn": {
      "type": "string",
      "description": "在制件序列号"
    },
    "route_id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Route:.+",
      "description": "工艺路线ID"
    },
    "takt_id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Takt:.+",
      "description": "节拍ID"
    },
    "proc_id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Proc:.+",
      "description": "工序ID"
    },
    "step_id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Step:.+",
      "description": "工步ID"
    },
    "station_id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:TwinObject:(Station|BufferZone)\\..+",
      "description": "工位ID(空间锚)"
    },
    "position_id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:TwinObject:Position\\..+",
      "description": "台位ID(可选)"
    },
    "start_time": {
      "type": "string",
      "format": "date-time",
      "description": "开始时间(时间锚)"
    },
    "end_time": {
      "type": "string",
      "format": "date-time",
      "description": "结束时间"
    },
    "status": {
      "type": "string",
      "enum": ["Pending", "InProgress", "Completed", "Failed", "Cancelled"],
      "description": "场景状态"
    },
    "assignments": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["role_id", "person_id"],
        "properties": {
          "role_id": {
            "type": "string",
            "pattern": "^urn:ngsi-ld:Role:.+"
          },
          "person_id": {
            "type": "string",
            "pattern": "^urn:ngsi-ld:TwinObject:Person\\..+"
          },
          "assignment_id": {
            "type": "string",
            "pattern": "^urn:ngsi-ld:Assignment:.+"
          }
        }
      },
      "description": "责任分配(责任锚)"
    },
    "involved_twins": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^urn:ngsi-ld:TwinObject:.+"
      },
      "description": "涉及的孪生体列表"
    },
    "quality_gate_passed": {
      "type": "boolean",
      "description": "质量关口是否通过"
    },
    "notes": {
      "type": "string",
      "description": "备注"
    }
  }
}
```

### 3.3 Role Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schema/Role.schema.json",
  "title": "Role",
  "type": "object",
  "required": ["id", "type", "role_code", "name"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Role:.+",
      "description": "角色唯一标识"
    },
    "type": {
      "const": "Role"
    },
    "role_code": {
      "type": "string",
      "pattern": "^ROLE_.+",
      "description": "角色编码,格式: ROLE_{NAME}"
    },
    "name": {
      "type": "string",
      "description": "角色名称"
    },
    "description": {
      "type": "string",
      "description": "角色描述"
    },
    "responsibilities": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "职责清单"
    },
    "permissionSet": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "权限集合"
    },
    "qualificationReq": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "资质要求"
    },
    "kpiOwnership": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "关联KPI"
    },
    "orgScope": {
      "type": "string",
      "description": "组织范围"
    },
    "relatedFunctions": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "相关职能"
    },
    "effective_from": {
      "type": "string",
      "format": "date-time",
      "description": "生效时间"
    },
    "effective_to": {
      "type": "string",
      "format": "date-time",
      "description": "失效时间"
    },
    "ownerOrg": {
      "type": "string",
      "description": "归属组织"
    },
    "policyRef": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Policy:.+",
      "description": "政策引用"
    },
    "version": {
      "type": "string",
      "description": "版本号"
    },
    "notes": {
      "type": "string",
      "description": "备注"
    }
  }
}
```

### 3.4 Assignment Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schema/Assignment.schema.json",
  "title": "Assignment",
  "type": "object",
  "required": [
    "id",
    "type",
    "assigneeId",
    "roleId",
    "orgId",
    "validFrom",
    "validTo",
    "assignmentStatus"
  ],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Assignment:.+",
      "description": "指派唯一标识"
    },
    "type": {
      "const": "Assignment"
    },
    "assigneeId": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:TwinObject:Person\\..+",
      "description": "被指派人员ID"
    },
    "roleId": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Role:.+",
      "description": "角色ID"
    },
    "orgId": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:OrgUnit:.+",
      "description": "组织单元ID"
    },
    "sceneId": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Scene:.+",
      "description": "场景ID(可选)"
    },
    "validFrom": {
      "type": "string",
      "format": "date-time",
      "description": "有效开始时间"
    },
    "validTo": {
      "type": "string",
      "format": "date-time",
      "description": "有效结束时间"
    },
    "shiftId": {
      "type": "string",
      "description": "班次ID"
    },
    "qualificationRef": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^urn:ngsi-ld:Qualification:.+"
      },
      "description": "资质证明引用"
    },
    "approvalRef": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:Approval:.+",
      "description": "审批记录引用"
    },
    "assignmentStatus": {
      "type": "string",
      "enum": ["Active", "Suspended", "Revoked"],
      "description": "指派状态"
    },
    "station_code": {
      "type": "string",
      "description": "指派工位编码"
    },
    "notes": {
      "type": "string",
      "description": "备注"
    }
  }
}
```

---

## 四、实体关系图

```
TwinObject (Station/Position/Device/...)
    ↓ (located_in / parent_twin_id)
    └─ 空间层级关系
    
Scene
    ├─ station_id → TwinObject(Station)      [空间锚]
    ├─ position_id → TwinObject(Position)    [空间锚细化]
    ├─ start_time                             [时间锚]
    ├─ assignments[] → Assignment             [责任锚]
    │   ├─ roleId → Role
    │   └─ assigneeId → TwinObject(Person)
    ├─ route_id → Route
    ├─ proc_id → Proc
    └─ step_id → Step

ModalityBinding
    ├─ twin_id → TwinObject
    ├─ modality_id → Modality
    └─ quality_rule_id → QualityRule

ModalData
    ├─ binding_id → ModalityBinding
    ├─ scene_id → Scene
    ├─ timestamp                              [时间锚]
    ├─ responsibility_chain[]                 [责任锚]
    └─ derivedFrom[] → ModalData             [血缘溯源]

MBOM
    └─ parent_mbom_code → MBOM               [层级关系]

Role → Assignment ← Person (TwinObject)
```

---

## 五、命名规范

### 5.1 URN命名规则

所有实体ID遵循统一URN格式:
```
urn:ngsi-ld:{EntityType}:{BusinessCode}
```

**示例**:
- TwinObject: `urn:ngsi-ld:TwinObject:Station.ST-GZ-03`
- TwinObject: `urn:ngsi-ld:TwinObject:Position.POS-A1`
- TwinObject: `urn:ngsi-ld:TwinObject:Robot.R01`
- Scene: `urn:ngsi-ld:Scene:WeldProc.2025-10-16T14:30:00`
- Role: `urn:ngsi-ld:Role:WeldOperator`
- Assignment: `urn:ngsi-ld:Assignment:20251016-001`

### 5.2 业务编码规则

| 实体类型 | 编码前缀 | 格式示例 | 说明 |
|---------|---------|---------|------|
| Station | ST- | ST-GZ-03 | 工位 |
| BufferZone | BUF- | BUF-03 | 缓存区 |
| Position | POS- | POS-A1 | 台位 |
| Robot | R | R01, R02 | 机器人 |
| Fixture | FIX- | FIX-WELD-01 | 夹具 |
| Gauge | GAU- | GAU-THK-01 | 量具 |
| Workpiece | ZQ- | ZQ-2025-00123 | 在制件 |
| Role | ROLE_ | ROLE_WELD_OP | 角色 |
| Modality | - | TEMP, CURRENT | 模态 |

---

## 六、质量标签规范

### 6.1 标准质量标签枚举

| 标签 | 说明 | 处理建议 |
|------|------|---------|
| `OK` | 数据正常 | 正常使用 |
| `Warn` | 数据可疑但可用 | 标记警告,可使用 |
| `Error` | 数据错误 | 不可用,需人工检查 |
| `Missing` | 数据缺失 | 补采或使用默认值 |
| `Outlier` | 数据异常值 | 标记异常,可选过滤 |
| `Interpolated` | 插值数据 | 标记来源,谨慎使用 |
| `ClockUnsynced` | 时钟未同步 | 时序分析需谨慎 |
| `MissingEvidence` | 缺少溯源证据 | 审计失败 |

### 6.2 质量门禁策略

数据质量策略 (DATA_QUALITY_POLICY) 定义:
- **missing_anchor_policy**: `reject` / `warn` / `accept`
- **quality_tags_allowed**: 允许通过的质量标签列表
- **time_sync_skew_ms_max**: 最大时钟偏差(毫秒)
- **sample_loss_rate_max**: 最大丢样率

---

## 七、版本管理与变更审计

### 7.1 ChangeMgt (变更管理) 实体

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `change_id` | string | ✓ | 变更唯一ID |
| `entity_type` | string | ✓ | 实体类型 |
| `entity_key` | string | ✓ | 实体业务键 |
| `change_type` | enum | ✓ | `create/update/delete/version` |
| `old_value` | object | | 变更前值 |
| `new_value` | object | | 变更后值 |
| `effective_from` | datetime | ✓ | 生效时间 |
| `requested_by` | string | ✓ | 申请人 |
| `approved_by` | string | | 审批人 |
| `approval_status` | enum | ✓ | `pending/approved/rejected` |
| `reason` | string | | 变更原因 |
| `notes` | string | | 备注 |

### 7.2 版本化原则

1. **关键配置必须版本化**: Route, Proc, Step, ModalityBinding, QualityRule等
2. **版本号格式**: `V{major}.{minor}`, 如 `V1.0`, `V2.1`
3. **变更必须审批**: 所有版本变更需经过审批流程
4. **历史可回溯**: 保留所有历史版本以支持回滚
5. **生效时间明确**: 每个版本必须有 `effective_from` 和 `effective_to`

---

## 八、三锚机制完整性要求

### 8.1 三锚定义

1. **时间锚 (When)**: `timestamp` / `start_time` / `end_time`
2. **空间锚 (Where)**: `station_id` / `position_id`
3. **责任锚 (Who)**: `assignments[]` → `Role` + `Person`

### 8.2 完整性规则

- **Scene**: 必须同时具备三锚
- **ModalData**: 必须通过 `scene_id` 关联到完整的三锚场景
- **审计要求**: 三锚完整率 ≥ 99.5%

---

## 九、实施检查清单

### 9.1 上线前检查项

- [ ] 所有TwinObject已注册且ID符合命名规范
- [ ] Station和Position已纳入TwinObject体系
- [ ] 所有Role已定义且职责清晰
- [ ] 所有Assignment有效期覆盖生产时段
- [ ] 所有ModalityBinding已配置且状态为active
- [ ] 质量规则已配置并关联到ModalityBinding
- [ ] 三锚完整率达到99.5%以上
- [ ] 质量标签覆盖率达到99%以上
- [ ] JSON Schema验证通过
- [ ] 变更管理流程已启用

### 9.2 运行时监控指标

- 三锚完整率实时统计
- 质量标签分布监控
- Assignment覆盖率监控
- 时钟同步偏差监控
- 数据采样丢失率监控
- 变更审批流程合规性检查

---

## 十、附录

### 10.1 术语对照表

| 中文术语 | 英文术语 | 实体类型 |
|---------|---------|---------|
| 工位 | Station | TwinObject |
| 缓存区 | Buffer Zone | TwinObject |
| 台位 | Position | TwinObject |
| 场景 | Scene | Scene |
| 角色 | Role | Role |
| 指派 | Assignment | Assignment |
| 模态 | Modality | Modality |
| 模态绑定 | Modality Binding | ModalityBinding |
| 模态数据 | Modal Data | ModalData |
| 制造BOM | MBOM | MBOM |

### 10.2 参考文档

- NGSI-LD规范: https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_CIM009v010801p.pdf
- JSON Schema规范: https://json-schema.org/
- 工艺路线采集模板说明文档 V2.2
- 专题三V1.0: 责任流建模指南
- 专题五V1.3: 混合智能数据产品闭环

---

**文档版本**: V2.3  
**更新日期**: 2025-10-16  
**更新说明**: 
- 将Station和Position纳入TwinObject体系
- 采用方案3统一架构
- 完善JSON Schema定义
- 增加质量标签和三锚机制规范
- 添加版本管理和变更审计要求