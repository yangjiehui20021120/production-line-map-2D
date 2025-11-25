# MBOM元模型设计说明文档

**版本**: V1.0  
**日期**: 2025-10-21  
**文档类型**: 技术设计规范

---

## 1. 概述

### 1.1 文档目的

本文档定义了制造物料清单(Manufacturing Bill of Materials, MBOM)的元模型结构,为数字孪生系统中的工艺蓝图建模提供统一标准。MBOM是连接产品设计与车间制造的核心数据契约,集成了工艺(Process)、资源(Resource)、物料(Material)、文档(Document)四大要素。

### 1.2 核心设计理念

**M-P-R-D集成模型**: MBOM采用四要素集成架构:
- **M (Material)**: 物料清单,定义产品所需原材料、辅料、消耗品
- **P (Process)**: 工艺路线,完整的Route→Takt→Process→Step四层嵌套结构
- **R (Resource)**: 资源约束,包括人员角色、设备能力、工装要求、工位配置
- **D (Document)**: 文档关联,链接SOP、图纸、标准、规程

**自包含设计**: MBOM实体是完整的、自包含的JSON文档,包含产品制造所需的全部工艺信息,无需外部关联即可理解完整工艺流程。

**版本化管理**: 每个MBOM实例都有明确的版本号,支持工艺演进的可追溯性和历史数据的可解释性。

---

## 2. 元模型架构

### 2.1 顶层结构

MBOM元模型采用树形嵌套结构,顶层包含5个核心部分:

```
MBOM实体
├─ 基本信息 (id, type, mbomCode, mbomVersion, productCode, status)
├─ D: documents (文档要素)
├─ M: materials (物料要素)
├─ R: resources (资源要素)
└─ P: route (工艺要素)
    └─ takts[] (节拍数组)
        └─ processes[] (工序数组)
            └─ steps[] (工步数组)
```

### 2.2 标识规范

**MBOM ID格式**: `urn:ngsi-ld:MBOM:{productCode}:{version}`

示例: `urn:ngsi-ld:MBOM:M000004670327:V1.0`

- 遵循NGSI-LD URN规范
- 包含产品代码确保业务语义
- 版本号明确标识,支持多版本并存

### 2.3 状态管理

MBOM生命周期状态:
- **draft**: 草稿状态,正在编制中
- **active**: 激活状态,当前生产使用
- **retired**: 已退役,不再使用但保留历史
- **deprecated**: 已弃用,即将被新版本替代

---

## 3. 四要素详细设计

### 3.1 Document (文档要素)

**设计目标**: 建立MBOM与技术文档的关联,确保工艺执行有据可依。

**结构定义**:
```json
"documents": {
  "sopCodes": ["SOP_ZQ_001"],        // 作业指导书
  "drawingRefs": ["DWG_M000004"],    // 工程图纸
  "inspectionStandards": ["GB/T"],   // 检验标准
  "safetyInstructions": ["SAFETY"]   // 安全规程
}
```

**设计要点**:
- 所有文档采用编码引用,不嵌入文档内容
- 支持多个SOP对应一个MBOM(复杂产品场景)
- 文档编码应关联到文档管理系统(如SOP_REGISTRY)

### 3.2 Material (物料要素)

**设计目标**: 定义产品的物料需求,支持从MBOM到采购/库存的数据流通。

**两层结构**:
1. **MBOM级物料清单**: 总体BOM,列出所有原材料
2. **Process/Step级消耗**: 细化到每道工序/工步的物料用量

**核心字段**:
- `bomReference`: 引用PLM系统中的EBOM/BOM
- `materialList[]`: 详细物料清单,每项包含:
  - materialCode: 物料编码
  - specification: 规格型号
  - quantity + unit: 数量和单位
  - consumableType: 消耗品类型(如焊材、气体)

**继承关系**:
```
MBOM.materials.materialList (总清单)
  ↓ 细分到
Process.consumedMaterials (工序级消耗)
  ↓ 再细分到
Step.materialConsumption (工步级消耗)
```

### 3.3 Resource (资源要素)

**设计目标**: 定义制造资源约束,支持生产调度和能力校验。

**四类资源**:

1. **requiredRoles**: 人力资源
   - 定义岗位(Role)需求,而非具体人员
   - 关联技能(Skills)和资质(Certifications)要求
   - 指定最小人数(minCount)

2. **requiredEquipment**: 设备资源
   - 按设备类型定义能力(Capabilities)要求
   - 支持优选机型(preferredModels)

3. **requiredTooling**: 工装资源
   - 夹具(fixture)、量具(gauge)、吊具(sling)等
   - 指定数量确保资源充足性

4. **requiredStations**: 工位资源
   - 关联允许的生产工位
   - 工位能力标签匹配

**解耦设计**:
- MBOM定义"需要什么能力",不指定"用哪台设备"
- 实际执行时,Scene通过TwinObject查找满足能力的设备实例
- 支持设备替换而不修改MBOM

### 3.4 Process (工艺要素)

**设计目标**: 完整定义工艺路线的四层嵌套结构,这是MBOM的核心。

#### 3.4.1 Route层 (工艺路线)

**作用**: 定义整体工艺框架和路线级KPI

**关键字段**:
- routeCode/routeName: 路线标识
- lineCode: 所属产线
- effectiveFrom/To: 生效时间范围
- requiredMeasurements[]: Route级测量要求(如总周期时间、整体良品率)

#### 3.4.2 Takt层 (节拍)

**作用**: 工艺路线的时间分段,定义生产节奏

**关键字段**:
- taktSeq: 节拍序号(1, 2, 3...)
- targetCT_min: 目标节拍时间(分钟)
- requiredMeasurements[]: Takt级测量(如节拍实际CT、WIP数量)

**设计要点**:
- 节拍是工序的容器,一个Takt包含多个Process
- 节拍边界定义了物流转运点

#### 3.4.3 Process层 (工序)

**作用**: 定义一道完整的加工/装配/检验工序

**核心结构**:
```json
{
  "procCode": "0010",
  "procName": "焊接侧墙反面焊缝",
  "procSeqInTakt": 1,
  
  // M: Process级物料
  "consumedMaterials": [...],
  
  // R: Process级资源
  "requiredResources": {
    "roles": ["ROLE_WELDER"],
    "equipment": ["AUTO_WELDER"],
    "tooling": ["FIXTURE_HJ_01"]
  },
  
  // D: Process级文档
  "documents": {
    "sopCode": "SOP_WELD_001"
  },
  
  // P: 测量要求
  "requiredMeasurements": [...],
  
  // 包含的工步
  "steps": [...]
}
```

**allowedStationCodes**: 工序可执行的工位白名单,支持柔性调度

#### 3.4.4 Step层 (工步)

**作用**: 最小执行单元,定义具体操作和测量要求

**完整的M-P-R-D集成**:

```json
{
  "stepSeq": 1,
  "stepName": "焊接反装焊缝",
  "stdTime_min": 210,
  "stationCode": "ST-HJ-01",
  
  // M: 物料操作
  "materialsHandled": [
    {"materialCode": "MAT_STEEL_01", "operation": "weld"}
  ],
  "materialConsumption": [
    {"materialCode": "MAT_WELDING_WIRE", "quantity": 0.5, "unit": "KG"}
  ],
  
  // R: 资源约束
  "resourceRequirements": {
    "requiredCapabilities": ["CAP.Weld.MIG"],
    "requiredSkills": ["Skill.Welder.L2"],
    "mustHaveTooling": ["WELDER_MIG_300A"]
  },
  
  // D: 文档
  "stepDocuments": {
    "workInstructionSection": "WI_WELD_001_S4",
    "safetyNotes": "佩戴防护面罩"
  },
  
  // P: 测量要求 (关键!)
  "requiredMeasurements": [
    {
      "modalityCode": "WeldingCurrent",
      "ruleId": "RULE_CURRENT_150_250A",
      "timing": "in",
      "capturedByResourceClass": "AUTO_WELDER"
    }
  ]
}
```

**质量门设计**:
- `qgateIn`: 工步入口质量检查
- `qgateOut`: 工步出口质量检查
- 与requiredMeasurements配合实现闭环质量控制

---

## 4. 测量要求 (RequiredMeasurements)

### 4.1 多层级测量设计

**关键创新**: 测量要求不是独立层级,而是Route/Takt/Process/Step各层的**数组属性**。

**层级对应**:
- Route级: 整体KPI(总CT、良品率)
- Takt级: 节拍监控(节拍CT、WIP)
- Process级: 工序质量(缺陷率、环境参数)
- Step级: 具体测量(焊接电流、尺寸精度)

### 4.2 测量定义结构

```json
{
  "modalityCode": "WeldingCurrent",           // 模态名称(抽象)
  "ruleId": "RULE_CURRENT_150_250A",          // 质量规则
  "timing": "in",                             // 测量时机
  "aggregator": "mean",                       // 聚合方式
  "sampleSize": 5,                            // 采样数
  "capturedByResourceClass": "AUTO_WELDER",   // 采集资源类别
  "description": "焊接电流监控"                // 说明
}
```

### 4.3 三层映射机制

**MBOM只定义抽象Modality名称**,不涉及具体设备点位:

```
Layer 1: MBOM定义需求
  "modalityCode": "WeldingCurrent"  (抽象)

Layer 2: TwinObject.ModalityBinding定义数据源
  {
    "modalityCode": "WeldingCurrent",
    "twinCode": "Welder_Robot01",
    "sourceRef": "opc.tcp://192.168.1.100:4840"  (具体)
  }

Layer 3: Scene运行时生成ModalData
  {
    "refScene": "Scene_ID",
    "refTwin": "Welder_Robot01",
    "refModality": "WeldingCurrent",  (三锚齐全)
    "value": 185.2
  }
```

**设计优势**:
- MBOM保持抽象,与具体设备解耦
- 更换设备只需修改ModalityBinding,不动MBOM
- 支持同一MBOM在不同产线执行

---

## 5. 数据建模最佳实践

### 5.1 字段粒度原则

**根据业务需要灵活填充**:
- 简单产品: 可能只填Route→Takt→Process三层
- 复杂产品: 填充到Step级,甚至每个Step有多个测量要求

**不强制填充所有字段**:
- 元模型定义了最大能力边界
- 实际实例根据产品复杂度选择性填充
- 典型填充率: 30%-60%

### 5.2 版本管理策略

**严格版本控制**:
- 每次MBOM修改都创建新版本
- 旧版本保留,状态标记为retired
- Scene实例锁定MBOM版本,执行期间不漂移

**变更管理**:
- 所有MBOM变更通过ChangeMgt实体记录
- 记录变更原因、审批人、生效时间
- 支持回溯任意历史版本

### 5.3 与Scene的关系

**MBOM是Scene的模板/契约**:

```
MBOM (静态蓝图)
  ↓ basedOnMBOM (引用关系)
Scene (运行实例)
  ↓ 执行时触发
ModalData (实际测量)
```

**Scene创建时**:
1. 引用特定版本MBOM
2. 复制工艺步骤定义
3. 根据requiredMeasurements配置数据采集
4. 校验资源是否满足MBOM要求

**Scene执行时**:
1. 按MBOM定义的Step顺序执行
2. 在规定timing采集ModalData
3. 用MBOM的ruleId校验数据质量
4. 将结果derivedFrom链接到ModalData

---

## 6. 存储与实现

### 6.1 推荐存储方案

**方案1: 文档数据库 (MongoDB)**
```javascript
db.mbom.insertOne({
  _id: "urn:ngsi-ld:MBOM:M000004670327:V1.0",
  type: "MBOM",
  // 完整嵌套JSON
  route: { takts: [...] }
})
```
- 完美支持深度嵌套
- 查询灵活(聚合管道)
- 版本管理简单

**方案2: 关系数据库 + JSONB (PostgreSQL)**
```sql
CREATE TABLE mbom (
  id TEXT PRIMARY KEY,
  mbom_code TEXT,
  product_code TEXT,
  status TEXT,
  
  -- 复杂结构用JSONB
  materials JSONB,
  resources JSONB,
  route JSONB
);

CREATE INDEX idx_mbom_product ON mbom(product_code);
CREATE INDEX idx_mbom_route ON mbom USING GIN(route);
```
- 核心字段建索引查询快
- JSONB支持灵活结构
- PostgreSQL性能优异

### 6.2 查询模式

**按产品查询最新MBOM**:
```javascript
db.mbom.findOne(
  { productCode: "M000004670327", status: "active" },
  { sort: { mbomVersion: -1 } }
)
```

**查询特定工步定义**:
```javascript
db.mbom.aggregate([
  { $match: { "id": "urn:ngsi-ld:MBOM:M000004670327:V1.0" } },
  { $unwind: "$route.takts" },
  { $unwind: "$route.takts.processes" },
  { $unwind: "$route.takts.processes.steps" },
  { $match: { 
      "route.takts.taktSeq": 2,
      "route.takts.processes.procCode": "0010",
      "route.takts.processes.steps.stepSeq": 4
  }},
  { $project: { "route.takts.processes.steps": 1 } }
])
```

### 6.3 从Excel转换

**转换流程**:
```python
def excel_to_mbom(excel_file):
    # 1. 读取各Sheet
    routes = read_sheet('ROUTE_MASTER')
    takts = read_sheet('TAKT')
    procs = read_sheet('PROC_IN_TAKT')
    steps = read_sheet('STEP_IN_PROC')
    materials = read_sheet('WORKPIECE_MASTER')
    
    # 2. 构建嵌套结构
    mbom = {
        "id": generate_mbom_id(routes[0]),
        "type": "MBOM",
        "materials": build_materials(materials),
        "route": {
            "takts": [
                build_takt(takt, procs, steps)
                for takt in takts
            ]
        }
    }
    
    # 3. 校验Schema
    validate_against_schema(mbom, mbom_schema)
    
    return mbom
```

---

## 7. 设计约束与规范

### 7.1 必填字段

**MBOM顶层**:
- id, type, mbomCode, mbomName, mbomVersion
- productCode, status
- route (至少包含一个Takt)

**Route层**: routeCode, routeName, takts[]

**Takt层**: taktSeq, taktName, processes[]

**Process层**: procCode, procName, procSeqInTakt, steps[]

**Step层**: stepSeq, stepName, stdTime_min, stationCode

### 7.2 命名约定

- **驼峰命名**: JSON字段使用小驼峰(camelCase)
- **枚举值**: 小写+下划线(snake_case), 如 "per_piece"
- **编码字段**: 大写+下划线, 如 "MBOM_M000004670327"
- **URN格式**: `urn:ngsi-ld:{EntityType}:{BusinessKey}:{Version}`

### 7.3 扩展性设计

**预留扩展点**:
- 各层级支持自定义属性
- 使用`additionalProperties: true`允许业务扩展
- 关键路径字段严格约束,非关键字段灵活

---

## 8. 总结

MBOM元模型通过**M-P-R-D四要素集成**和**Route-Takt-Process-Step四层嵌套**,构建了完整的数字化工艺蓝图。其核心价值在于:

1. **自包含**: 一个MBOM实例包含产品制造全部信息
2. **可追溯**: 版本化管理确保历史可审计
3. **解耦设计**: 抽象Modality与具体设备分离
4. **契约驱动**: 作为Scene创建的模板和ModalData采集的依据
5. **灵活粒度**: 支持从粗到细的多层级测量要求

配合NGSI-LD标准和文档数据库,MBOM为智能制造提供了坚实的数据底座。
