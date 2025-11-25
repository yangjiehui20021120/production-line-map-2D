# MBOM实体实例生成说明文档

## 📋 文档概述

本文档详细说明了从Excel源数据生成NGSI-LD格式的MBOM实体实例的过程、规则和自动填充逻辑。

---

## 📦 生成的文件清单

### 实体实例JSON文件（2个）

| 文件名 | 产品代码 | 实体数量 | 说明 |
|--------|----------|----------|------|
| `mbom_M000004670327_entities.json` | M000004670327 | 119个 | 1 MBOMRoot + 1 Route + 11 Takt + 27 Process + 79 Step |
| `mbom_M000004803474_entities.json` | M000004803474 | 115个 | 1 MBOMRoot + 1 Route + 11 Takt + 27 Process + 75 Step |

**总计**: 234个NGSI-LD实体

---

## 🗂️ 数据源文件

| 文件名 | 用途 | 数据行数 | 说明 |
|--------|------|----------|------|
| `ROUTE_MASTER.xlsx` | 工艺路线主表 | 2 | 定义产品与路线的关系 |
| `TAKT.xlsx` | 节拍定义 | 22 | 每条路线11个节拍 |
| `PROC_IN_TAKT.xlsx` | 工序定义 | 54 | 每条路线27个工序 |
| `STEP_IN_PROC.xlsx` | 工步定义 | 154 | M000004670327: 79个, M000004803474: 75个 |

**注意**: Excel文件的前5行（索引0-4）为元数据说明，实际数据从第6行（索引5）开始。部分文件包含空行，生成时已自动过滤。

---

## 🏗️ 实体生成规则

### 1. 层级结构

遵循五层MBOM架构，自底向上创建：

```
MBOMRoot (产品级)
    └─ Route (路线级)
        └─ Takt (节拍级)
            └─ Process (工序级)
                └─ Step (工步级)
```

### 2. ID命名规范

所有实体ID严格遵循NGSI-LD URN格式：

| 层级 | ID格式 | 示例 |
|------|--------|------|
| **MBOMRoot** | `urn:ngsi-ld:MBOM:{productCode}:{version}` | `urn:ngsi-ld:MBOM:M000004670327:V1.0` |
| **Route** | `urn:ngsi-ld:MBOM:{routeCode}:{version}` | `urn:ngsi-ld:MBOM:RT_M000004670327:V1.0` |
| **Takt** | `urn:ngsi-ld:MBOM:{productCode}:T{seq:02d}` | `urn:ngsi-ld:MBOM:M000004670327:T01` |
| **Process** | `urn:ngsi-ld:MBOM:{productCode}:T{takt}:P{code:04d}` | `urn:ngsi-ld:MBOM:M000004670327:T01:P0010` |
| **Step** | `urn:ngsi-ld:MBOM:{productCode}:T{takt}:P{proc}:S{seq:02d}` | `urn:ngsi-ld:MBOM:M000004670327:T01:P0010:S01` |

**格式规则**:
- `taktSeq`: 2位数字补零 (01, 02, ..., 11)
- `procCode`: 4位数字补零 (0010, 0020, ...)
- `stepSeq`: 2位数字补零 (01, 02, ...)

---

## 🔗 双向关系构建

每个层级都包含双向关系：

### 向下关系（父→子）
- `Route.consistsOfTakts` → `Takt[]`
- `Takt.includesProcesses` → `Process[]`
- `Process.composedOfSteps` → `Step[]`

### 向上关系（子→父）
- `Route.partOfMBOM` → `MBOMRoot`
- `Takt.partOfRoute` → `Route`
- `Process.partOfTakt` → `Takt`
- `Step.partOfProcess` → `Process`

---

## 📝 字段映射与自动填充

### 第1层：MBOMRoot

| 字段 | 必填 | 数据来源 | 自动生成规则 |
|------|------|----------|--------------|
| `id` | ✅ | 自动生成 | `urn:ngsi-ld:MBOM:{productCode}:V1.0` |
| `mbomType` | ✅ | 固定值 | `"MBOMRoot"` |
| `mbomCode` | ✅ | 自动生成 | `MBOM_{productCode}` |
| `mbomName` | ✅ | 自动生成 | `{productCode}侧墙制造BOM` |
| `mbomVersion` | ✅ | 自动生成 | `V1.0`（初始版本） |
| `productCode` | ✅ | `ROUTE_MASTER.product_code` | 直接映射 |
| `status` | ✅ | `ROUTE_MASTER.status` | 默认`"active"` |
| `hasRoute` | ✅ | 自动生成 | 指向对应Route实体 |
| `effectiveFrom` | ✅ | 自动生成 | `2025-01-01T00:00:00Z`（默认生效时间） |

**自动填充说明**:
1. **mbomCode**: 因Excel中未提供，自动生成为`MBOM_` + 产品代码
2. **mbomName**: 自动生成描述性名称
3. **mbomVersion**: 默认为`V1.0`，表示初始版本
4. **effectiveFrom**: 设置为2025年1月1日，可根据实际需求调整

---

### 第2层：Route

| 字段 | 必填 | 数据来源 | 自动生成规则 |
|------|------|----------|--------------|
| `id` | ✅ | 自动生成 | `urn:ngsi-ld:MBOM:{routeCode}:V1.0` |
| `mbomType` | ✅ | 固定值 | `"Route"` |
| `routeCode` | ✅ | `ROUTE_MASTER.route_code` | 直接映射 |
| `routeName` | ✅ | 自动生成 | `{productCode}侧墙工艺路线` |
| `routeVersion` | - | 自动生成 | `V1.0` |
| `lineCode` | ✅ | `ROUTE_MASTER.line_code` | 直接映射 |
| `status` | ✅ | `ROUTE_MASTER.status` | 直接映射 |
| `partOfMBOM` | ✅ | 自动生成 | 指向父MBOMRoot |
| `consistsOfTakts` | ✅ | 自动生成 | 指向该路线的所有Takt（数组） |
| `taktCount` | - | 自动计算 | 该路线的Takt总数（11） |

**自动填充说明**:
1. **routeName**: Excel中`route_name`列为空，自动生成为`{productCode}侧墙工艺路线`
2. **routeVersion**: 与MBOMRoot版本保持一致
3. **taktCount**: 统计该路线下的Takt数量，便于快速查询

---

### 第3层：Takt

| 字段 | 必填 | 数据来源 | 自动生成规则 |
|------|------|----------|--------------|
| `id` | ✅ | 自动生成 | `urn:ngsi-ld:MBOM:{productCode}:T{seq:02d}` |
| `mbomType` | ✅ | 固定值 | `"Takt"` |
| `taktSeq` | ✅ | `TAKT.takt_seq` | 直接映射（转为整数） |
| `taktCode` | - | `TAKT.takt_code` | 直接映射（如`D0000518642`） |
| `taktName` | ✅ | `TAKT.takt_name` | 直接映射或自动生成 |
| `targetCT` | - | `TAKT.target_ct_min` | 直接映射，单位MIN |
| `partOfRoute` | ✅ | 自动生成 | 指向父Route |
| `includesProcesses` | ✅ | 自动生成 | 指向该Takt的所有Process（数组） |
| `processCount` | - | 自动计算 | 该Takt的Process总数 |

**自动填充说明**:
1. **taktName**: 如果Excel中为空，自动生成为`{productCode}侧墙组成节拍{seq}`
2. **targetCT**: 仅在Excel提供数值时添加该字段

---

### 第4层：Process

| 字段 | 必填 | 数据来源 | 自动生成规则 |
|------|------|----------|--------------|
| `id` | ✅ | 自动生成 | `urn:ngsi-ld:MBOM:{productCode}:T{takt}:P{code:04d}` |
| `mbomType` | ✅ | 固定值 | `"Process"` |
| `procCode` | ✅ | `PROC_IN_TAKT.proc_code` | 格式化为4位数字（0010, 0020） |
| `procName` | ✅ | `PROC_IN_TAKT.proc_name_cn` | 直接映射或默认`工序{code}` |
| `procSeqInTakt` | ✅ | `PROC_IN_TAKT.proc_seq_in_takt` | 直接映射，默认1 |
| `procKind` | - | `PROC_IN_TAKT.proc_kind` | 枚举值验证后映射 |
| `partOfTakt` | ✅ | 自动生成 | 指向父Takt |
| `composedOfSteps` | ✅ | 自动生成 | 指向该Process的所有Step（数组） |
| `stepCount` | - | 自动计算 | 该Process的Step总数 |

**自动填充说明**:
1. **procCode**: Excel中可能为`10.0`格式，自动转换为`0010`（4位补零）
2. **procName**: 如果为空，默认为`工序{code}`
3. **procKind**: 仅当值在允许枚举中时添加（`process`, `handling`, `inspection`, `andon`, `measurement`）

---

### 第5层：Step

| 字段 | 必填 | 数据来源 | 自动生成规则 |
|------|------|----------|--------------|
| `id` | ✅ | 自动生成 | `urn:ngsi-ld:MBOM:{productCode}:T{t}:P{p}:S{seq:02d}` |
| `mbomType` | ✅ | 固定值 | `"Step"` |
| `stepSeq` | ✅ | `STEP_IN_PROC.step_seq` | 直接映射（转为整数） |
| `stepName` | ✅ | `STEP_IN_PROC.step_name_cn` | 直接映射或默认`工步{seq}` |
| `stdTime` | ✅ | `STEP_IN_PROC.std_time_min` | 直接映射，默认0.0，单位MIN |
| `stationCode` | ✅ | `STEP_IN_PROC.station_code` | 直接映射或默认`ST-UNKNOWN` |
| `processKind` | - | `STEP_IN_PROC.process_kind` | 枚举值验证后映射 |
| `actsOnType` | - | `STEP_IN_PROC.acts_on_type` | 枚举值验证后映射 |
| `resourceClasses` | - | `STEP_IN_PROC.resource_classes` | 分号分隔解析为数组 |
| `partOfProcess` | ✅ | 自动生成 | 指向父Process |

**自动填充说明**:
1. **stepName**: 如果为空，默认为`工步{seq}`
2. **stdTime**: 如果为空或无效，默认为`0.0`
3. **stationCode**: 如果为空，默认为`ST-UNKNOWN`（表示未知工位）
4. **resourceClasses**: 将分号分隔的字符串解析为数组（如`"OPERATOR;ROBOT"` → `["OPERATOR", "ROBOT"]`）

---

## ⚠️ 数据清洗规则

### 1. 空行过滤
所有Excel文件在读取时自动过滤`route_code`为空的行，确保数据完整性。

### 2. 数据类型转换
- **整数字段**: 如`taktSeq`, `procSeqInTakt`, `stepSeq`，从Excel的浮点数（如`1.0`）转为整数
- **浮点数字段**: 如`target_ct_min`, `std_time_min`，保留浮点精度
- **字符串字段**: 所有文本字段trim去除首尾空格
- **列表字段**: 分号分隔的字符串解析为数组，过滤空项

### 3. 枚举值验证
对于枚举类型字段（如`status`, `procKind`, `processKind`, `actsOnType`），仅在值符合Schema定义的枚举范围时才添加到实体中。

**允许的枚举值**:
- `status`: `draft`, `active`, `retired`, `deprecated`
- `procKind / processKind`: `process`, `handling`, `inspection`, `andon`, `measurement`
- `actsOnType`: `Workpiece`, `Station`, `Buffer`, `Equipment`

---

## 📊 实体统计

### 产品1: M000004670327

| 层级 | 数量 | ID范围示例 |
|------|------|-----------|
| MBOMRoot | 1 | `urn:ngsi-ld:MBOM:M000004670327:V1.0` |
| Route | 1 | `urn:ngsi-ld:MBOM:RT_M000004670327:V1.0` |
| Takt | 11 | `...T01` ~ `...T11` |
| Process | 27 | `...T01:P0010` ~ `...T11:P0180` |
| Step | 79 | `...T01:P0010:S01` ~ `...T11:P0180:S02` |
| **总计** | **119** | |

### 产品2: M000004803474

| 层级 | 数量 | ID范围示例 |
|------|------|-----------|
| MBOMRoot | 1 | `urn:ngsi-ld:MBOM:M000004803474:V1.0` |
| Route | 1 | `urn:ngsi-ld:MBOM:RT_M000004803474:V1.0` |
| Takt | 11 | `...T01` ~ `...T11` |
| Process | 27 | `...T01:P0010` ~ `...T11:P0180` |
| Step | 75 | `...T01:P0010:S01` ~ `...T11:P0180:S02` |
| **总计** | **115** | |

---

## 🔍 Schema符合性验证

所有生成的实体严格符合以下JSON Schema规范：

| 层级 | Schema文件 | 验证要点 |
|------|-----------|----------|
| MBOMRoot | `mbom_root_schema.json` | ✅ 所有必填字段完整，ID格式正确 |
| Route | `mbom_route_schema.json` | ✅ Relationship数组格式正确 |
| Takt | `mbom_takt_schema.json` | ✅ taktSeq为整数，关系正确 |
| Process | `mbom_process_schema.json` | ✅ procCode格式化为4位数字 |
| Step | `mbom_step_schema.json` | ✅ 所有必填字段完整，枚举值有效 |

**验证方法**（示例）:
```bash
# 使用ajv进行Schema验证
ajv validate -s mbom_root_schema.json -d "mbom_M000004670327_entities.json#/0"
ajv validate -s mbom_route_schema.json -d "mbom_M000004670327_entities.json#/1"
```

---

## 🚀 使用指南

### 1. 导入到NGSI-LD Context Broker

**单产品导入**:
```bash
curl -X POST "http://localhost:1026/ngsi-ld/v1/entityOperations/create" \
  -H "Content-Type: application/ld+json" \
  -d @mbom_M000004670327_entities.json
```

**批量导入两个产品**:
```bash
# 合并两个JSON文件
jq -s 'add' mbom_M000004670327_entities.json mbom_M000004803474_entities.json > mbom_all_entities.json

# 导入
curl -X POST "http://localhost:1026/ngsi-ld/v1/entityOperations/create" \
  -H "Content-Type: application/ld+json" \
  -d @mbom_all_entities.json
```

### 2. 查询示例

**查询某产品的MBOM**:
```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="MBOMRoot";productCode.value=="M000004670327"
```

**查询某Takt的所有Process**:
```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="Process";partOfTakt.object=="urn:ngsi-ld:MBOM:M000004670327:T01"
```

**查询某工位的所有Step**:
```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="Step";stationCode.value=="ST-HJ-01"
```

---

## 📝 已知限制与注意事项

### 1. 必填字段自动填充
以下必填字段在Excel中缺失，已自动生成：
- `MBOMRoot.mbomCode`: 自动生成为`MBOM_{productCode}`
- `MBOMRoot.mbomName`: 自动生成描述性名称
- `MBOMRoot.mbomVersion`: 固定为`V1.0`
- `MBOMRoot.effectiveFrom`: 固定为`2025-01-01T00:00:00Z`
- `Route.routeName`: 自动生成描述性名称
- `Route.routeVersion`: 固定为`V1.0`
- `Step.stationCode`: 如缺失则填充为`ST-UNKNOWN`

### 2. 可选字段处理
以下可选字段仅在Excel提供有效数据时才添加：
- `Takt.taktCode`
- `Takt.targetCT`
- `Process.procKind`
- `Step.processKind`
- `Step.actsOnType`
- `Step.resourceClasses`

### 3. 版本管理
- 当前所有实体的版本号统一为`V1.0`
- 未来版本更新时，建议修改生成脚本中的`mbom_version`变量
- 版本变更应同步更新MBOMRoot、Route的ID

### 4. 关系完整性
- 所有双向关系已正确建立
- 父实体的子实体数组与子实体的父实体引用严格对应
- 建议导入Context Broker后进行关系完整性验证

---

## 🔧 扩展与定制

### 修改自动生成规则
如需调整自动填充逻辑，修改`generate_mbom_entities.py`中的对应函数：
- `create_mbom_root()`: MBOMRoot生成逻辑
- `create_route()`: Route生成逻辑
- `create_takt()`: Takt生成逻辑
- `create_process()`: Process生成逻辑
- `create_step()`: Step生成逻辑

### 添加新字段
1. 在Excel源文件中添加新列
2. 修改对应的`create_*`函数，添加字段映射
3. 确保新字段符合JSON Schema定义
4. 重新运行生成脚本

---

## 📞 联系与支持

如有疑问或需要定制化支持，请参考：
- NGSI-LD规范: https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.06.01_60/gs_CIM009v010601p.pdf
- MBOM Schema文档: `mbom_schemas_readme.md`
- 生成脚本: `generate_mbom_entities.py`

---

**文档版本**: V1.0  
**生成时间**: 2025-01-21  
**生成工具**: Python 3.12 + pandas + json
