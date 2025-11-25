



# TwinObject统一元模型详细设计指南

## 版本: V1.0 | 发布日期: 2025-10-16

---

## 文档摘要

本文档是TwinObject统一元模型的详细设计规范,定义了所有孪生对象共享的核心字段、建模原则和使用约束。TwinObject元模型是数字孪生系统的基础抽象,用于统一表达生产系统中的各类物理和逻辑实体(设备、人员、在制品等)。

**适用对象**: 系统架构师、数据建模工程师、开发人员  
**相关标准**: NGSI-LD v1.6.1, ISO 23247(数字孪生制造框架)  
**配套文件**: `twinobject_core_schema.json`

---

## 目录

1. [设计理念与原则](#1-设计理念与原则)
2. [字段分层架构](#2-字段分层架构)
3. [核心字段详解](#3-核心字段详解)
4. [分类体系规范](#4-分类体系规范)
5. [建模公理与约束](#5-建模公理与约束)
6. [接口定义规范](#6-接口定义规范)
7. [状态管理机制](#7-状态管理机制)
8. [数据模态集成](#8-数据模态集成)
9. [命名与ID规则](#9-命名与id规则)
10. [完整示例](#10-完整示例)
11. [常见问题FAQ](#11-常见问题faq)
12. [附录](#12-附录)

---

## 1. 设计理念与原则

### 1.1 核心设计哲学

TwinObject元模型遵循"**统一抽象、分层扩展**"的设计哲学:

1. **统一抽象** (Unified Abstraction)
   - 所有孪生对象(设备、人员、在制品等)共享同一元模型
   - 通过`twinType`和`subType`区分不同类别
   - 避免为每种对象类型创建独立的实体模式

2. **分层扩展** (Layered Extension)
   - 核心层: 所有对象必须的字段(本文档定义)
   - 扩展层: 各子类型特有字段(独立Schema定义)
   - 实例层: 具体对象的属性值

3. **语义驱动** (Semantic-Driven)
   - 基于NGSI-LD标准,保证语义互操作性
   - 使用URN全局唯一标识
   - 支持语义上下文(@context)扩展

4. **能力与度量分离** (Capability vs. Metrics)
   - TwinObject描述**能做什么**(能力)
   - Modality描述**怎么度量**(数据)
   - 严禁在TwinObject中硬编码性能指标

### 1.2 基本建模原则

| 原则 | 说明 | 示例 |
|------|------|------|
| **单一职责** | 每个TwinObject只表达一个物理或逻辑实体 | ✅ 一个机器人; ❌ "生产线"(应拆分) |
| **最小必要** | 核心字段保持最小集,特有字段放入扩展层 | ✅ 核心20字段; ❌ 核心包含50+字段 |
| **语义显式** | 使用标准术语,避免隐含语义 | ✅ `functionCategory`; ❌ `type1` |
| **可验证性** | 所有字段都有明确的类型和约束 | ✅ JSON Schema验证; ❌ 自由文本 |
| **前向兼容** | 新增字段不破坏已有模型 | ✅ 可选字段; ❌ 修改必填字段 |

### 1.3 与NGSI-LD标准的关系

本元模型完全符合[ETSI NGSI-LD v1.6.1规范](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.06.01_60/gs_CIM009v010601p.pdf):

- 所有实体包含`@context`, `id`, `type`三要素
- 使用Property/Relationship/GeoProperty三类属性
- URN标识符遵循`urn:ngsi-ld:{EntityType}:{...}`格式
- 支持时态属性(temporal properties)和元数据(metadata)

---

## 2. 字段分层架构

TwinObject核心字段按功能分为**8个层级**,从底层到高层逐步构建完整的孪生对象模型:

```
L0: NGSI-LD基础 (@context, id, type)
    ↓
L1: 类型分类 (twinType, subType)
    ↓
L2: 功能维度 (functionCategory, functionCode, functionDesc, behaviorIntent, twinLevel)
    ↓
L3: 结构维度 (partOf, installPosition, location, locatedIn)
    ↓
L4: 交互接口 (inputAttr, outputAttr, controlAttr)
    ↓
L5: 状态管理 (stateAttr)
    ↓
L6: 数据模态 (supportedModalities, modalityBindings)
    ↓
L7: 类型特定 (hasRole, basedOnMBOM, mbomItemId)
    ↓
L8: 扩展属性 (capabilities, specifications, vendor, model, serialNumber, notes)
```

**设计意图**:
- **L0-L1**: 建立对象身份
- **L2**: 定义对象功能
- **L3**: 确定对象位置
- **L4-L5**: 描述对象行为
- **L6**: 连接数据采集
- **L7-L8**: 特殊化与扩展

---

## 3. 核心字段详解

### 3.1 L0层: NGSI-LD基础字段

#### `@context` (必填)
- **类型**: Array[String]
- **说明**: NGSI-LD语义上下文引用,定义字段的语义解释
- **约束**: 
  - 必须包含NGSI-LD标准上下文
  - 可追加自定义上下文
- **示例**:
```json
"@context": [
  "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
  "https://example.com/contexts/manufacturing-context.jsonld"
]
```

#### `id` (必填)
- **类型**: String (URN格式)
- **说明**: 全局唯一标识符
- **格式**: `urn:ngsi-ld:TwinObject:{subType}:{code}`
- **约束**: 
  - 正则: `^urn:ngsi-ld:TwinObject:[A-Za-z]+:[A-Za-z0-9_-]+$`
  - 不可变(一旦创建不可修改)
- **示例**:
  - `urn:ngsi-ld:TwinObject:Robot:ROBOT-R01`
  - `urn:ngsi-ld:TwinObject:Station:ST-GZ-03`
  - `urn:ngsi-ld:TwinObject:Person:EMP-20250101`

#### `type` (必填)
- **类型**: String (常量)
- **说明**: NGSI-LD实体类型
- **约束**: 固定值 `"TwinObject"`
- **用途**: 用于NGSI-LD查询过滤

#### `name` (建议必填)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 对象的人类可读名称
- **约束**: 
  - 建议使用中文或英文
  - 支持多语言版本(通过languageMap)
- **示例**:
```json
"name": {
  "type": "Property",
  "value": "侧墙焊接机器人01"
}
```

---

### 3.2 L1层: 类型分类字段

#### `twinType` (必填)
- **NGSI-LD类型**: Property
- **值枚举**: `"Constituent"` | `"Transitional"`
- **说明**: 顶层类型分类,区分构成性和流转性对象
- **语义**:
  - **Constituent**(构成性): 固定存在于系统结构中的资源单元
    - 特征: 有固定安装位置,不在产线流转
    - 使用字段: `installPosition`, 禁止`locatedIn`
    - 典型实例: 设备、工位、人员
  - **Transitional**(流转性): 在系统中流动、被加工的对象
    - 特征: 位置动态变化,随工艺流程移动
    - 使用字段: `locatedIn`, 禁止`installPosition`
    - 典型实例: 在制品、原料、成品
- **建模公理**: 所有TwinObject必须归属其中之一(互斥且完备)
- **示例**:
```json
"twinType": {
  "type": "Property",
  "value": "Constituent"
}
```

#### `subType` (必填)
- **NGSI-LD类型**: Property
- **值枚举**: 见[4.2节 subType枚举表](#42-subtype枚举值)
- **说明**: 细化的子类型,明确对象的具体类别
- **约束**:
  - 必须与`twinType`对应(见枚举表的归属关系)
  - 用于条件验证子类型特有字段
- **示例**:
```json
"subType": {
  "type": "Property",
  "value": "Robot"
}
```

#### 完整枚举清单

| twinType     | subType            | 中文名         | 分类         | 说明                   |
| ------------ | ------------------ | -------------- | ------------ | ---------------------- |
| Constituent  | AutoEquipment      | 自动化生产设备 | 设备设施     | 机器人、焊机、变位机等 |
| Constituent  | TransportEquipment | 转运设备       | 设备设施     | 天车、AGV、输送线等    |
| Constituent  | QC_Tool            | 质检工具       | 设备设施     | 量检具、测量仪等       |
| Constituent  | Fixture            | 夹具           | 设备设施     | 工装夹具、胎具         |
| Constituent  | Station            | 工位           | 空间设施     | 生产作业工位           |
| Constituent  | BufferZone         | 缓存区         | 空间设施     | 物料暂存区域           |
| Constituent  | Position           | 台位           | 空间设施     | 工位内台位             |
| Constituent  | Person             | 人员           | 组织人员资产 | 操作工、工程师         |
| Constituent  | OrgUnit            | 组织单元       | 组织人员资产 | 车间、产线、班组       |
| Transitional | Workpiece          | 在制品         | 流转对象     | 加工中半成品           |
| Transitional | Product            | 成品           | 流转对象     | 完成品                 |
| Transitional | Material           | 原料           | 流转对象     | 未加工原材料           |

---

### 3.3 L2层: 功能维度字段

#### `functionCategory` (必填)
- **NGSI-LD类型**: Property
- **值格式**: String, 正则 `^F[12](\\.[0-9]+)*$`
- **说明**: 生产功能分类代码,基于F1/F2功能分解体系
- **分类体系**:
  - **F1系**: 构成性系统/设备功能
  - **F2系**: 流转性对象功能
  - 详见[4.3节 功能分类体系](#43-功能分类体系f1f2)
- **约束**: 
  - 必填且必须来自标准体系
  - 不允许自定义一级分类(F3, F4等)
- **示例**:
```json
"functionCategory": {
  "type": "Property",
  "value": "F1.2.1"
}
```

#### `functionCode` (可选)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 内部简短功能代码,用于系统内部快速识别
- **示例**: `"SPOT_WELDER"`, `"AGV_CARRIER"`

#### `functionDesc` (建议必填)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 功能描述文字,详细说明对象的功能职责
- **示例**:
```json
"functionDesc": {
  "type": "Property",
  "value": "执行侧墙骨架前后面的点焊作业,支持自动焊接程序"
}
```

#### `behaviorIntent` (可选)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 行为意图说明,描述对象的预期行为模式或策略
- **用途**: 用于AI决策、自动化编排
- **示例**: `"优先处理紧急订单"`, `"节能模式运行"`

#### `twinLevel` (建议必填)
- **NGSI-LD类型**: Property
- **值类型**: Integer (≥1)
- **说明**: 系统分解层级深度,表示在层次结构中的位置
- **约定**:
  - Level 1: 产线/车间级
  - Level 2: 区域/系统级
  - Level 3: 工位/设备级
  - Level 4: 子设备/台位级
  - Level 5+: 组件/传感器级
- **示例**:
```json
"twinLevel": {
  "type": "Property",
  "value": 3
}
```

---

### 3.4 L3层: 结构维度字段

#### `partOf` (建议必填,顶层除外)
- **NGSI-LD类型**: Relationship
- **引用对象**: 父级TwinObject的URN
- **说明**: 表示"部分-整体"关系,指向上级对象
- **约束**:
  - 顶层对象(如产线)可为空
  - 其他对象建议必填
  - 不允许循环引用
- **用途**: 构建层级结构树,支持聚合查询
- **示例**:
```json
"partOf": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:ProductionLine:SideWall"
}
```

#### `installPosition` (条件必填)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 固定安装位置描述(仅构成性非人员对象)
- **约束**:
  - **必填条件**: `twinType="Constituent"` AND `subType≠"Person"`
  - **禁用条件**: `twinType="Transitional"`
- **示例**:
```json
"installPosition": {
  "type": "Property",
  "value": "侧墙产线-焊接区-A区-03号工位"
}
```

#### `location` (可选)
- **NGSI-LD类型**: GeoProperty
- **值格式**: GeoJSON Point
- **说明**: 地理坐标(平面坐标或经纬度)
- **约束**: 仅用于构成性对象
- **坐标系**: 通过`coordinateSystem`字段指定
- **示例**:
```json
"location": {
  "type": "GeoProperty",
  "value": {
    "type": "Point",
    "coordinates": [125.5, 80.3]
  }
}
```

#### `coordinateSystem` (可选)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 坐标系标识
- **常用值**: `"WGS84"`, `"Local-XY"`, `"Shop-Floor-Grid"`

#### `locatedIn` (条件必填)
- **NGSI-LD类型**: Relationship
- **引用对象**: 载体TwinObject的URN
- **说明**: 当前所在位置载体(仅流转性对象)
- **约束**:
  - **必填条件**: `twinType="Transitional"`
  - **禁用条件**: `twinType="Constituent"`
  - 值动态更新(随物料移动)
- **示例**:
```json
"locatedIn": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
}
```

---

### 3.5 L4层: 交互接口字段

#### 设计意图
接口字段描述TwinObject与外部的**信息交互能力**,主要用于:
- 系统集成: 明确数据流向
- 自动化编排: 识别依赖关系
- 故障诊断: 追溯信息链路

#### `inputAttr` (可选)
- **NGSI-LD类型**: Property (Array)
- **元素结构**:
```typescript
{
  name: string,           // 接口名称
  sourceTwin?: string,    // 来源孪生体URN
  sourceInterface?: string // 来源接口名称
}
```
- **说明**: 输入接口列表,声明对象接收的数据/信号
- **适用**: 主要用于Constituent类型(设备)
- **示例**:
```json
"inputAttr": {
  "type": "Property",
  "value": [
    {
      "name": "welding_current",
      "sourceTwin": "urn:ngsi-ld:TwinObject:Welder:WELDER-01",
      "sourceInterface": "current_output"
    },
    {
      "name": "start_signal",
      "sourceTwin": "urn:ngsi-ld:TwinObject:PLC:PLC-01",
      "sourceInterface": "robot_start"
    }
  ]
}
```

#### `outputAttr` (可选)
- **NGSI-LD类型**: Property (Array)
- **元素结构**:
```typescript
{
  name: string,           // 接口名称
  targetTwin?: string,    // 目标孪生体URN
  targetInterface?: string // 目标接口名称
}
```
- **说明**: 输出接口列表,声明对象发出的数据/信号
- **示例**:
```json
"outputAttr": {
  "type": "Property",
  "value": [
    {
      "name": "position_feedback",
      "targetTwin": "urn:ngsi-ld:TwinObject:PLC:PLC-01",
      "targetInterface": "robot_position"
    },
    {
      "name": "alarm_signal"
    }
  ]
}
```

#### `controlAttr` (可选)
- **NGSI-LD类型**: Property (Array)
- **元素结构**:
```typescript
{
  name: string,      // 控制接口名称
  source?: string    // 控制来源
}
```
- **说明**: 控制接口列表,声明对象接受的控制指令
- **示例**:
```json
"controlAttr": {
  "type": "Property",
  "value": [
    {
      "name": "start_weld",
      "source": "MES"
    },
    {
      "name": "emergency_stop",
      "source": "Safety_PLC"
    }
  ]
}
```

---

### 3.6 L5层: 状态管理字段

#### `stateAttr` (可选)
- **NGSI-LD类型**: Property (Array)
- **元素结构**:
```typescript
{
  name: string,   // 状态属性名
  value: any      // 当前值
}
```
- **说明**: 当前状态属性集合,存储对象的运行时状态
- **用途**: 
  - 实时监控
  - 状态查询
  - 历史分析
- **示例**:
```json
"stateAttr": {
  "type": "Property",
  "value": [
    {"name": "operating_mode", "value": "auto"},
    {"name": "current_program", "value": "WELD_PROG_003"},
    {"name": "cycle_count", "value": 1523}
  ]
}
```

---

### 3.7 L6层: 数据模态字段

#### `supportedModalities` (可选)
- **NGSI-LD类型**: Relationship (Array)
- **引用对象**: Modality实体URN
- **说明**: 该对象支持的数据模态白名单
- **用途**: 声明对象**能够**提供哪些类型的数据
- **约束**: 仅声明,不定义具体采集方式(由ModalityBinding定义)
- **示例**:
```json
"supportedModalities": [
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:TEMP"
  },
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:CURRENT"
  },
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:IMAGE"
  }
]
```

#### `modalityBindings` (可选)
- **NGSI-LD类型**: Property (Array)
- **元素结构**: (必含字段)
```typescript
{
  modalityId: string,       // 模态ID(URN)
  pointRef: string,         // 数据点引用(OPC UA NodeId等)
  bindingVersion: string,   // 绑定版本号
  changeId: string,         // 变更单ID
  effectiveFrom: string     // 生效时间(ISO8601)
}
```
- **说明**: 模态数据绑定配置,定义**如何**采集数据
- **设计原则**: 
  - 数据契约化: 每个绑定是一个数据契约
  - 版本化管理: 通过changeId和bindingVersion追溯变更
  - 生效时间: 支持配置的时态管理
- **示例**:
```json
"modalityBindings": [
  {
    "type": "Property",
    "value": {
      "modalityId": "urn:ngsi-ld:Modality:TEMP",
      "pointRef": "ns=2;s=Robot.R01.MotorTemp",
      "bindingVersion": "V1.2",
      "changeId": "CHG-2025-001",
      "effectiveFrom": "2025-01-01T00:00:00Z"
    }
  }
]
```

**重要**: `modalityBindings`的完整定义在`ModalityBinding`实体中,此处仅存储引用摘要。

---

### 3.8 L7层: 类型特定字段

#### `hasRole` (条件必填: Person)
- **NGSI-LD类型**: Relationship
- **引用对象**: Role实体URN
- **说明**: 人员关联的岗位角色
- **约束**: 仅当`subType="Person"`时使用
- **语义**: 声明人员**有资格担任**的角色(非当前职责)
- **当前职责**: 通过Assignment实体的时态绑定表达
- **示例**:
```json
"hasRole": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:Role:WeldOperator"
}
```

#### `basedOnMBOM` (建议必填: Transitional)
- **NGSI-LD类型**: Relationship
- **引用对象**: MBOM实体URN
- **说明**: 关联的制造BOM
- **约束**: 建议Transitional类型必填
- **用途**: 定义对象的物料清单、工艺路线
- **示例**:
```json
"basedOnMBOM": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:MBOM:SideWall-Panel-V2.0"
}
```

#### `mbomItemId` (建议必填: Transitional)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 在MBOM中的项目ID
- **示例**:
```json
"mbomItemId": {
  "type": "Property",
  "value": "SWP-Panel-001"
}
```

---

### 3.9 L8层: 扩展属性字段

#### `capabilities` (可选)
- **NGSI-LD类型**: Property (Array)
- **值类型**: Array[String]
- **格式**: `CAP.{Domain}.{Capability}`
- **说明**: 能力标签集合,描述对象具备的能力
- **用途**: 资源匹配、工艺规划
- **示例**:
```json
"capabilities": {
  "type": "Property",
  "value": [
    "CAP.Weld.Robot",
    "CAP.Weld.Spot",
    "CAP.Load.Heavy"
  ]
}
```

#### `specifications` (可选)
- **NGSI-LD类型**: Property (Object)
- **值类型**: JSON Object
- **说明**: 结构化技术规格参数
- **用途**: 存储设备的详细技术参数
- **示例**:
```json
"specifications": {
  "type": "Property",
  "value": {
    "axes": 6,
    "payload": 210,
    "payload_unit": "kg",
    "reach": 2650,
    "reach_unit": "mm",
    "repeatability": 0.08,
    "repeatability_unit": "mm"
  }
}
```

#### `vendor` (可选)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 制造厂商名称
- **示例**: `"ABB"`, `"FANUC"`, `"KUKA"`

#### `model` (可选)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 设备型号
- **示例**: `"IRB-6700-210/2.65"`

#### `serialNumber` (可选)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 序列号,设备或产品的唯一标识
- **用途**: 资产管理、质量追溯
- **示例**: `"SN20250101001"`

#### `notes` (可选)
- **NGSI-LD类型**: Property
- **值类型**: String
- **说明**: 自由文本备注
- **用途**: 补充说明、特殊信息记录

---

## 4. 分类体系规范

### 4.1 twinType 枚举值

| 枚举值 | 中文名 | 说明 | 关键特征 |
|--------|--------|------|----------|
| `Constituent` | 构成性 | 固定存在于系统结构中的资源单元 | 使用`installPosition`,禁止`locatedIn` |
| `Transitional` | 流转性 | 在系统中流动、被加工的对象 | 使用`locatedIn`,禁止`installPosition` |

**判断决策树**:
```
对象是否随工艺流程移动?
  ├─ 是 → Transitional (在制品、原料、成品)
  └─ 否 → Constituent
      ├─ 是否为人员? → Person
      └─ 否 → 设备/工位/工装
```

---

### 4.2 subType 枚举值

#### Constituent 子类型

| subType | 中文名 | 典型实例 | 说明 |
|---------|--------|----------|------|
| `Robot` | 机器人 | 焊接机器人、装配机器人 | 工业机器人 |
| `Welder` | 焊机 | 焊接电源、送丝机 | 焊接设备 |
| `Positioner` | 变位机 | 工件旋转台、倾斜台 | 工件定位设备 |
| `Crane` | 天车 | 桥式起重机、吊车 | 起重设备 |
| `Scanner` | 扫描仪 | 激光扫描仪、3D相机 | 视觉/扫描设备 |
| `QC_Tool` | 质检工具 | 量检具、测量仪 | 检测工具 |
| `Fixture` | 夹具 | 工装夹具、胎具 | 定位夹紧装置 |
| `Station` | 工位 | 焊接工位、装配工位 | 生产工位 |
| `BufferZone` | 缓存区 | 周转区、暂存区 | 物料缓存区域 |
| `Position` | 台位 | 工位内的作业台位 | 工位细分单元 |
| `Person` | 人员 | 操作工、工程师 | 人员 |

#### Transitional 子类型

| subType | 中文名 | 典型实例 | 说明 |
|---------|--------|----------|------|
| `Workpiece` | 在制品 | 加工中的半成品 | 生产过程中的工件 |
| `Product` | 成品 | 完成的产品 | 已完成加工的产品 |
| `Material` | 原料 | 钢板、焊丝 | 未加工的原材料 |

---

### 4.3 功能分类体系(F1/F2)

#### F1系: 构成性系统功能

```
F1 - 构成性系统/设备
  ├─ F1.1 - 电气系统
  │   ├─ F1.1.1 - 控制系统 (PLC, DCS)
  │   ├─ F1.1.2 - 动力系统 (电机, 驱动器)
  │   └─ F1.1.3 - 传感系统 (传感器, 采集器)
  │
  ├─ F1.2 - 机械系统
  │   ├─ F1.2.1 - 加工设备 (焊接, 切割, 钻孔)
  │   ├─ F1.2.2 - 装配设备 (拧紧, 压装, 胶接)
  │   ├─ F1.2.3 - 检测设备 (测量, 扫描, 检验)
  │   └─ F1.2.4 - 辅助设备 (变位机, 夹具)
  │
  ├─ F1.3 - 物流系统
  │   ├─ F1.3.1 - 运输设备 (AGV, 输送线)
  │   ├─ F1.3.2 - 搬运设备 (机械手, 起重机)
  │   └─ F1.3.3 - 存储设备 (货架, 缓存区)
  │
  └─ F1.4 - 空间设施
      ├─ F1.4.1 - 生产工位 (加工位, 装配位)
      ├─ F1.4.2 - 检验工位 (质检位, 测量位)
      └─ F1.4.3 - 物流节点 (缓存区, 周转区)
```

#### F2系: 流转性对象功能

```
F2 - 流转性对象
  ├─ F2.1 - 原料
  │   ├─ F2.1.1 - 金属材料 (钢板, 型材)
  │   ├─ F2.1.2 - 辅料 (焊丝, 涂料)
  │   └─ F2.1.3 - 采购件 (标准件, 外协件)
  │
  ├─ F2.2 - 在制品
  │   ├─ F2.2.1 - 零件 (单个零件)
  │   ├─ F2.2.2 - 组件 (部分装配)
  │   └─ F2.2.3 - 总成 (大型组件)
  │
  └─ F2.3 - 成品
      ├─ F2.3.1 - 半成品 (待后续工序)
      └─ F2.3.2 - 最终产品 (可交付产品)
```

#### 使用规则

1. **必须从标准体系选择**: 不允许自定义F3, F4等一级分类
2. **建议使用3级以上**: 如`F1.2.1`比`F1.2`更精确
3. **多功能对象**: 选择主要功能,次要功能用`capabilities`补充
4. **层级对应**: 通常`twinLevel`与`functionCategory`层级数一致

**示例映射**:
| 对象 | subType | functionCategory | 说明 |
|------|---------|------------------|------|
| 焊接机器人 | Robot | F1.2.1 | 加工设备 |
| 焊接工位 | Station | F1.4.1 | 生产工位 |
| 在制品-侧墙 | Workpiece | F2.2.3 | 总成级在制品 |
| 缓存区 | BufferZone | F1.3.3 | 存储设备 |

---

## 5. 建模公理与约束

### 5.1 核心建模公理

#### A1: 能力与度量分离
**内容**: TwinObject只描述**能力**(能做什么),禁止填入**性能指标**(做得怎样)

**正例**:
```json
✅ "capabilities": ["CAP.Weld.Spot"]  // 能力
✅ 在Modality中定义: "urn:ngsi-ld:Modality:OEE"  // 指标
```

**反例**:
```json
❌ "oee": {"type": "Property", "value": 0.85}  // 指标硬编码
❌ "quality_rate": 98.5  // 不应在TwinObject中
```

**理由**: 
- 能力相对稳定,指标动态变化
- 指标应通过ModalData时序数据表达
- 保持TwinObject定义的稳定性

---

#### A2: 功能分类强制
**内容**: `functionCategory`必填且必须来自F1/F2标准体系

**正例**:
```json
✅ "functionCategory": {"value": "F1.2.1"}
✅ "functionCategory": {"value": "F2.2.3"}
```

**反例**:
```json
❌ "functionCategory": {"value": ""}  // 空值
❌ "functionCategory": {"value": "ProductionLine"}  // 自定义
❌ "functionCategory": {"value": "F3.1"}  // 非标准分类
```

---

#### A3: 位置字段互斥
**内容**: 构成性用`installPosition`,流转性用`locatedIn`,二者互斥

| twinType | 使用 | 禁止 |
|----------|------|------|
| Constituent | `installPosition`, `location` | `locatedIn` |
| Transitional | `locatedIn` | `installPosition`, `location` |

**校验规则**:
```javascript
if (twinType === "Constituent" && subType !== "Person") {
  assert(installPosition !== null, "installPosition必填");
  assert(locatedIn === null, "禁止使用locatedIn");
}
if (twinType === "Transitional") {
  assert(locatedIn !== null, "locatedIn必填");
  assert(installPosition === null, "禁止使用installPosition");
}
```

---

#### A4: 传感器边界
**内容**: 传感器应建模为**Modality**,不应作为TwinObject

**正例**:
```json
✅ 温度传感器 → Modality实体
✅ 机器人(有温度模态) → TwinObject + supportedModalities: [TEMP]
```

**反例**:
```json
❌ 温度传感器 → TwinObject:Sensor
```

**理由**:
- 传感器是数据采集手段,不是生产资源
- 通过Modality建模更符合数据契约思想
- 避免TwinObject数量爆炸

---

#### A5: 角色解耦
**内容**: Person的`hasRole`仅声明资格,实际职责通过**Assignment**时态绑定

**正例**:
```json
✅ Person.hasRole → 声明"有资格担任焊工"
✅ Assignment实体 → 绑定"张三在2025-10-16早班担任焊工"
```

**反例**:
```json
❌ Person中直接写"当前担任焊工" → 无法表达时态性
```

**理由**:
- 资格相对稳定,职责动态变化
- Assignment支持排班、轮岗等场景
- 实现人岗分离、责任可追溯

---

### 5.2 字段条件约束规则

| 规则ID | 条件 | 约束内容 | 违反后果 |
|--------|------|----------|----------|
| R1 | `twinType="Constituent"` AND `subType≠"Person"` | `installPosition`必填 | Schema验证失败 |
| R2 | `twinType="Constituent"` | `locatedIn`禁止使用 | Schema验证失败 |
| R3 | `twinType="Transitional"` | `locatedIn`必填 | Schema验证失败 |
| R4 | `twinType="Transitional"` | `installPosition`禁止使用 | Schema验证失败 |
| R5 | `subType="Person"` | `hasRole`建议必填 | 警告 |
| R6 | `subType∈{Workpiece,Product,Material}` | `basedOnMBOM`和`mbomItemId`建议必填 | 警告 |
| R7 | 所有类型 | `functionCategory`必须匹配F1/F2体系 | Schema验证失败 |
| R8 | `modalityBindings`存在 | 必须包含`bindingVersion`, `changeId`, `effectiveFrom` | 数据验证失败 |

---

## 6. 接口定义规范

### 6.1 接口建模目的

接口字段(`inputAttr`, `outputAttr`, `controlAttr`)用于描述TwinObject的**信息交互能力**,而非物理连接。

**用途**:
1. **系统集成**: 明确数据流向和依赖关系
2. **自动化编排**: 识别哪些对象需要协同
3. **故障诊断**: 追溯信息链路中断点

### 6.2 接口命名约定

#### 输入接口 (inputAttr)
- **命名格式**: `{dataType}_{qualifier}`
- **示例**:
  - `welding_current` - 焊接电流输入
  - `start_signal` - 启动信号输入
  - `part_detect` - 零件检测信号

#### 输出接口 (outputAttr)
- **命名格式**: `{dataType}_{qualifier}`
- **示例**:
  - `position_feedback` - 位置反馈
  - `cycle_complete` - 周期完成信号
  - `alarm_code` - 报警代码输出

#### 控制接口 (controlAttr)
- **命名格式**: `{action}_{object}`
- **示例**:
  - `start_weld` - 启动焊接
  - `emergency_stop` - 急停
  - `reset_alarm` - 复位报警

### 6.3 接口连接规则

1. **明确方向**: inputAttr和outputAttr成对出现
   ```
   Robot.outputAttr: position_feedback
       ↓
   PLC.inputAttr: robot_position
   ```

2. **避免循环**: 不允许A→B→A的直接循环依赖

3. **可选引用**: `sourceTwin`/`targetTwin`可为空(表示外部系统)

---

## 7. 状态管理机制

### 7.1 stateAttr 使用指南

`stateAttr`存储对象的**运行时状态**,与静态属性的区别:

| 特征 | 静态属性 | stateAttr |
|------|----------|-----------|
| 变化频率 | 低(配置级) | 高(运行级) |
| 存储位置 | TwinObject根属性 | stateAttr数组 |
| 示例 | `model`, `vendor` | `operating_mode`, `cycle_count` |

### 7.2 典型状态属性

#### 设备类(Robot, Welder等)
- `operating_mode`: 运行模式(auto/manual/debug)
- `current_program`: 当前程序号
- `cycle_count`: 循环计数
- `alarm_status`: 报警状态
- `connection_status`: 连接状态

#### 人员类(Person)
- `current_shift`: 当前班次
- `attendance_status`: 出勤状态(在岗/请假/离岗)
- `current_task`: 当前任务

#### 在制品类(Workpiece)
- `process_status`: 工序状态(待加工/加工中/已完成)
- `quality_status`: 质量状态(合格/待检/不合格)
- `current_route_step`: 当前工艺步骤

### 7.3 状态更新机制

状态更新通过以下方式:
1. **事件驱动**: 接收设备状态变化事件
2. **周期轮询**: 定期查询设备状态
3. **指令反馈**: 执行指令后更新状态

**重要**: `stateAttr`是快照,历史状态通过ModalData时序数据记录

---

## 8. 数据模态集成

### 8.1 设计理念

**数据契约化**: 将数据采集配置视为TwinObject与数据源之间的契约

```
TwinObject (What)
    ↓ 声明
supportedModalities (Which modalities)
    ↓ 绑定
ModalityBinding (How to collect)
    ↓ 产生
ModalData (Actual data)
```

### 8.2 supportedModalities vs modalityBindings

| 字段 | 作用 | 必填 | 内容 |
|------|------|------|------|
| `supportedModalities` | 声明**能力** | 可选 | 模态ID列表 |
| `modalityBindings` | 定义**实现** | 可选 | 绑定配置详情 |

**关系**: 
- `supportedModalities`是白名单,`modalityBindings`是具体实现
- 可以只有白名单而无绑定(能力预留)
- 不应有绑定而无白名单(违反能力声明)

### 8.3 modalityBindings 最佳实践

#### 必填字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `modalityId` | 模态ID | `urn:ngsi-ld:Modality:TEMP` |
| `pointRef` | 数据点引用 | `ns=2;s=Robot.R01.MotorTemp` |
| `bindingVersion` | 绑定版本号 | `V1.2` |
| `changeId` | 变更单ID | `CHG-2025-001` |
| `effectiveFrom` | 生效时间 | `2025-01-01T00:00:00Z` |

#### 版本管理

**原则**: 配置变更必须创建新版本,不允许原地修改

**流程**:
1. 创建变更单(`changeId`)
2. 新增绑定记录(版本号递增)
3. 设置生效时间(`effectiveFrom`)
4. 旧版本保留(便于回滚)

**示例**:
```json
// V1.0 绑定 (2024-01-01生效)
{
  "modalityId": "urn:ngsi-ld:Modality:TEMP",
  "pointRef": "ns=2;s=Robot.R01.Temp",
  "bindingVersion": "V1.0",
  "changeId": "CHG-2024-001",
  "effectiveFrom": "2024-01-01T00:00:00Z"
}

// V1.1 绑定 (2025-01-01生效, 数据点变更)
{
  "modalityId": "urn:ngsi-ld:Modality:TEMP",
  "pointRef": "ns=2;s=Robot.R01.MotorTemp",  // 数据点变更
  "bindingVersion": "V1.1",
  "changeId": "CHG-2025-001",
  "effectiveFrom": "2025-01-01T00:00:00Z"
}
```

---

## 9. 命名与ID规则

### 9.1 URN标识符格式

**标准格式**:
```
urn:ngsi-ld:TwinObject:{subType}:{businessCode}
```

**组成部分**:
1. `urn:ngsi-ld:` - NGSI-LD标准前缀(固定)
2. `TwinObject` - 实体类型(固定)
3. `{subType}` - 子类型名称(如Robot, Station)
4. `{businessCode}` - 业务编码(唯一标识)

### 9.2 业务编码规则

#### 设备类编码
- **格式**: `{TYPE}-{SEQUENCE}`
- **示例**:
  - `ROBOT-R01` - 机器人01
  - `WELDER-W03` - 焊机03
  - `CRANE-C02` - 天车02

#### 工位类编码
- **格式**: `{PREFIX}-{AREA}-{SEQ}`
- **示例**:
  - `ST-GZ-03` - 工位-焊接区-03
  - `BUF-03` - 缓存区-03
  - `POS-A1` - 台位-A1

#### 人员类编码
- **格式**: `EMP-{DATE}{SEQ}` 或 `{ID}`
- **示例**:
  - `EMP-20250101` - 员工-入职日期
  - `EMP-001` - 员工-序号

#### 在制品类编码
- **格式**: `{PRODUCT}-{YEAR}-{SEQ}`
- **示例**:
  - `ZQ-2025-00123` - 侧墙-2025年-序号123

### 9.3 命名最佳实践

| 原则 | 说明 | 示例 |
|------|------|------|
| **唯一性** | 全局唯一,不可重复 | ✅ `ROBOT-R01`; ❌ 重复ID |
| **可读性** | 编码具有业务含义 | ✅ `ST-WELD-01`; ❌ `OBJ-12345` |
| **稳定性** | 一旦创建不可修改 | ✅ 永久ID; ❌ 随意改ID |
| **分层性** | 体现层级关系 | ✅ `POS-A1`属于`ST-GZ-03` |

---

## 10. 完整示例

### 10.1 示例1: 焊接机器人

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:Robot:ROBOT-R01",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "侧墙焊接机器人01"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "Robot"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.2.1"
  },
  
  "functionCode": {
    "type": "Property",
    "value": "WELD_ROBOT"
  },
  
  "functionDesc": {
    "type": "Property",
    "value": "执行侧墙骨架的点焊和连续焊作业,支持自动焊接程序"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 3
  },
  
  "partOf": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
  },
  
  "installPosition": {
    "type": "Property",
    "value": "侧墙产线-焊接区-A区-03号工位-机器人位"
  },
  
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [127.5, 81.0]
    }
  },
  
  "inputAttr": {
    "type": "Property",
    "value": [
      {
        "name": "welding_current",
        "sourceTwin": "urn:ngsi-ld:TwinObject:Welder:WELDER-01",
        "sourceInterface": "current_output"
      },
      {
        "name": "start_signal",
        "sourceTwin": "urn:ngsi-ld:TwinObject:PLC:PLC-01",
        "sourceInterface": "robot_start"
      }
    ]
  },
  
  "outputAttr": {
    "type": "Property",
    "value": [
      {
        "name": "position_feedback",
        "targetTwin": "urn:ngsi-ld:TwinObject:PLC:PLC-01",
        "targetInterface": "robot_position"
      },
      {
        "name": "weld_complete"
      }
    ]
  },
  
  "controlAttr": {
    "type": "Property",
    "value": [
      {
        "name": "start_weld",
        "source": "MES"
      },
      {
        "name": "emergency_stop",
        "source": "Safety_PLC"
      }
    ]
  },
  
  "stateAttr": {
    "type": "Property",
    "value": [
      {"name": "operating_mode", "value": "auto"},
      {"name": "current_program", "value": "WELD_PROG_003"},
      {"name": "cycle_count", "value": 1523},
      {"name": "alarm_status", "value": "normal"}
    ]
  },
  
  "supportedModalities": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:TEMP"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:CURRENT"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:POSITION"
    }
  ],
  
  "modalityBindings": [
    {
      "type": "Property",
      "value": {
        "modalityId": "urn:ngsi-ld:Modality:TEMP",
        "pointRef": "ns=2;s=Robot.R01.MotorTemp",
        "bindingVersion": "V1.0",
        "changeId": "CHG-2024-001",
        "effectiveFrom": "2024-01-01T00:00:00Z"
      }
    }
  ],
  
  "capabilities": {
    "type": "Property",
    "value": [
      "CAP.Weld.Robot",
      "CAP.Weld.Spot",
      "CAP.Weld.Seam",
      "CAP.Motion.6Axis"
    ]
  },
  
  "specifications": {
    "type": "Property",
    "value": {
      "axes": 6,
      "payload": 210,
      "payload_unit": "kg",
      "reach": 2650,
      "reach_unit": "mm",
      "repeatability": 0.08,
      "repeatability_unit": "mm"
    }
  },
  
  "vendor": {
    "type": "Property",
    "value": "ABB"
  },
  
  "model": {
    "type": "Property",
    "value": "IRB-6700-210/2.65"
  },
  
  "serialNumber": {
    "type": "Property",
    "value": "SN20240101001"
  },
  
  "notes": {
    "type": "Property",
    "value": "2024年1月投产,主要用于侧墙骨架焊接"
  }
}
```

### 10.2 示例2: 在制品(侧墙)

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00123",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "侧墙总成-ZQ-2025-00123"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Transitional"
  },
  
  "subType": {
    "type": "Property",
    "value": "Workpiece"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F2.2.3"
  },
  
  "functionDesc": {
    "type": "Property",
    "value": "侧墙骨架总成,包含内外板和加强筋,用于车身结构"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 2
  },
  
  "locatedIn": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
  },
  
  "basedOnMBOM": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:MBOM:SideWall-V2.0"
  },
  
  "mbomItemId": {
    "type": "Property",
    "value": "SWP-Panel-001"
  },
  
  "stateAttr": {
    "type": "Property",
    "value": [
      {"name": "process_status", "value": "加工中"},
      {"name": "quality_status", "value": "待检"},
      {"name": "current_route_step", "value": "焊接-正面焊"},
      {"name": "completion_rate", "value": 65}
    ]
  },
  
  "specifications": {
    "type": "Property",
    "value": {
      "length_mm": 1800,
      "width_mm": 1200,
      "thickness_mm": 3,
      "weight_kg": 45.5,
      "material": "Q235B"
    }
  },
  
  "serialNumber": {
    "type": "Property",
    "value": "ZQ-2025-00123"
  }
}
```

### 10.3 示例3: 操作人员

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:Person:EMP-20250101",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "张三(脱敏编码:EMP-20250101)"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "Person"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.2.1"
  },
  
  "functionDesc": {
    "type": "Property",
    "value": "焊接操作工,负责侧墙焊接作业"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 4
  },
  
  "hasRole": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Role:WeldOperator"
  },
  
  "stateAttr": {
    "type": "Property",
    "value": [
      {"name": "attendance_status", "value": "在岗"},
      {"name": "current_shift", "value": "早班"},
      {"name": "current_station", "value": "ST-GZ-03"}
    ]
  },
  
  "capabilities": {
    "type": "Property",
    "value": [
      "Skill.Welder.L2",
      "Skill.Safety.Certified"
    ]
  },
  
  "specifications": {
    "type": "Property",
    "value": {
      "certifications": ["焊工证", "安全培训证"],
      "skill_level": "L2",
      "shift_group": "A班"
    }
  }
}
```

---

## 11. 常见问题FAQ

### Q1: TwinObject和DigitalTwin有什么区别?

**A**: TwinObject是数字孪生(Digital Twin)的**实例化表达**:
- **Digital Twin**: 概念/范式,强调物理-数字映射
- **TwinObject**: 实体模型,是Digital Twin的具体数据结构

可以理解为: TwinObject是实现Digital Twin的一种建模方式。

---

### Q2: 为什么要区分Constituent和Transitional?

**A**: 这是基于**物理特性**的根本性分类:

| 维度 | Constituent | Transitional |
|------|-------------|--------------|
| 位置 | 固定 | 流动 |
| 寿命 | 长(年) | 短(天/周) |
| 数量 | 相对稳定 | 动态变化 |
| 管理 | 资产管理 | 物料管理 |

这种分类直接影响数据模型设计(位置字段互斥)和系统架构(不同的生命周期管理)。

---

### Q3: functionCategory能否自定义?

**A**: **不能**自定义一级分类(F1/F2),但可以:
1. 在现有体系下细化(如F1.2.1.1)
2. 通过`functionCode`补充内部编码
3. 使用`capabilities`标签表达额外能力

**理由**: 统一分类体系是跨系统互操作的基础。

---

### Q4: 传感器应该建模为TwinObject吗?

**A**: **一般不应该**。遵循**A4公理: 传感器边界**:

- ✅ 温度传感器 → `Modality` + `ModalityBinding`
- ❌ 温度传感器 → `TwinObject:Sensor`

**例外情况**: 独立的检测设备(如三坐标测量仪)可以建模为`TwinObject:QC_Tool`。

**判断标准**: 
- 是否是生产资源? → 是 → TwinObject
- 只是数据采集手段? → 是 → Modality

---

### Q5: 一个对象可以有多个subType吗?

**A**: **不可以**。`subType`是单值字段,每个TwinObject只能归属一个子类型。

**替代方案**: 使用`capabilities`表达多重能力:
```json
{
  "subType": {"value": "Robot"},
  "capabilities": {"value": [
    "CAP.Weld.Spot",
    "CAP.Handle.PartLoad"
  ]}
}
```

---

### Q6: partOf和locatedIn有什么区别?

**A**: 

| 字段 | 关系类型 | 用途 | 是否变化 |
|------|----------|------|----------|
| `partOf` | 结构关系 | 表达层级归属 | 不变 |
| `locatedIn` | 位置关系 | 表达当前位置 | 动态 |

**示例**:
```json
// 机器人
"partOf": "urn:...Station:ST-GZ-03"  // 归属于工位(固定)

// 在制品
"locatedIn": "urn:...Station:ST-GZ-03"  // 当前在工位(会移动)
```

---

### Q7: 如何表达设备停机/维护等状态?

**A**: 通过`stateAttr`记录运行时状态:

```json
"stateAttr": {
  "type": "Property",
  "value": [
    {"name": "operating_status", "value": "maintenance"},
    {"name": "maintenance_type", "value": "preventive"},
    {"name": "expected_resume", "value": "2025-10-17T08:00:00Z"}
  ]
}
```

**不要**创建新字段如`maintenanceStatus`,保持核心模型简洁。

---

### Q8: modalityBindings应该放在TwinObject中还是单独管理?

**A**: **两种方式都支持**:

1. **嵌入式**(推荐用于简单场景):
   - 直接在TwinObject的`modalityBindings`数组中
   - 优点: 数据集中,查询方便
   - 缺点: TwinObject体积增大

2. **外部式**(推荐用于复杂场景):
   - 创建独立的`ModalityBinding`实体
   - TwinObject中只存储引用ID
   - 优点: 解耦,支持复杂绑定逻辑
   - 缺点: 需要额外查询

**建议**: 
- 绑定数量<5个 → 嵌入式
- 绑定数量≥5个或频繁变更 → 外部式

---

### Q9: 如何处理设备更换(保留历史数据)?

**A**: **不要修改原TwinObject的ID**,而是:

1. 将旧设备状态改为`"retired"`
2. 创建新设备的TwinObject(新ID)
3. 在新对象中添加:
```json
"replacedBy": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:Robot:ROBOT-R01-NEW"
}
```
4. 历史数据仍关联旧ID,保证可追溯

---

### Q10: Person对象需要实名吗?可以脱敏吗?

**A**: **支持脱敏**:

```json
{
  "id": "urn:ngsi-ld:TwinObject:Person:EMP-20250101",
  "name": {"value": "员工编号EMP-20250101"},  // 脱敏显示
  "specifications": {
    "value": {
      "real_name_encrypted": "***",  // 加密存储
      "employee_id": "EMP-20250101"
    }
  }
}
```

**原则**: 
- 对外接口: 使用编码
- 内部系统: 可解密查看(权限控制)
- 日志/报告: 仅显示编码

---

## 12. 附录

### 12.1 字段总览表(按层级分组)

| 层级 | 字段名 | NGSI-LD类型 | 必填性 | 业务语义 |
|------|--------|-------------|--------|----------|
| **L0-NGSI-LD基础** |
| | `@context` | Array | 必填 | 语义上下文引用 |
| | `id` | String(URN) | 必填 | 全局唯一标识符 |
| | `type` | String | 必填 | 实体类型(固定"TwinObject") |
| | `name` | Property | 建议必填 | 对象名称 |
| **L1-类型分类** |
| | `twinType` | Property | 必填 | 顶层类型(Constituent/Transitional) |
| | `subType` | Property | 必填 | 细化子类型 |
| **L2-功能维度** |
| | `functionCategory` | Property | 必填 | 功能分类代码(F1/F2体系) |
| | `functionCode` | Property | 可选 | 内部功能代码 |
| | `functionDesc` | Property | 建议必填 | 功能描述文字 |
| | `behaviorIntent` | Property | 可选 | 行为意图说明 |
| | `twinLevel` | Property | 建议必填 | 系统分解层级深度 |
| **L3-结构维度** |
| | `partOf` | Relationship | 建议必填 | 上级对象引用 |
| | `installPosition` | Property | 条件必填 | 固定安装位置 |
| | `location` | GeoProperty | 可选 | 地理坐标 |
| | `locatedIn` | Relationship | 条件必填 | 当前所在位置载体 |
| **L4-交互接口** |
| | `inputAttr` | Property(Array) | 可选 | 输入接口列表 |
| | `outputAttr` | Property(Array) | 可选 | 输出接口列表 |
| | `controlAttr` | Property(Array) | 可选 | 控制接口列表 |
| **L5-状态管理** |
| | `stateAttr` | Property(Array) | 可选 | 当前状态属性集合 |
| **L6-数据模态** |
| | `supportedModalities` | Relationship(Array) | 可选 | 支持的数据模态白名单 |
| | `modalityBindings` | Property(Array) | 可选 | 模态数据绑定配置 |
| **L7-类型特定** |
| | `hasRole` | Relationship | 条件必填 | 关联的岗位角色(Person) |
| | `basedOnMBOM` | Relationship | 建议必填 | 关联的制造BOM(Transitional) |
| | `mbomItemId` | Property | 建议必填 | MBOM项目ID(Transitional) |
| **L8-扩展属性** |
| | `capabilities` | Property(Array) | 可选 | 能力标签集合 |
| | `specifications` | Property(Object) | 可选 | 技术规格参数 |
| | `vendor` | Property | 可选 | 制造厂商 |
| | `model` | Property | 可选 | 设备型号 |
| | `serialNumber` | Property | 可选 | 序列号 |
| | `notes` | Property | 可选 | 备注信息 |

---

### 12.2 快速决策树

#### 如何确定twinType?

```
对象是否随工艺流程移动?
├─ 是 → Transitional
│   └─ 使用locatedIn字段
└─ 否 → Constituent
    └─ 使用installPosition字段(Person除外)
```

#### 如何选择subType?

```
Constituent?
├─ 设备类
│   ├─ 执行加工? → Robot/Welder/Positioner
│   ├─ 辅助搬运? → Crane
│   ├─ 检测测量? → Scanner/QC_Tool
│   └─ 夹持定位? → Fixture
├─ 空间类
│   ├─ 作业工位? → Station
│   ├─ 暂存区域? → BufferZone
│   └─ 工位细分? → Position
└─ 人员类 → Person

Transitional?
├─ 未加工原料? → Material
├─ 加工中半成品? → Workpiece
└─ 完成加工产品? → Product
```

#### 如何选择functionCategory?

```
Constituent?
└─ F1系
    ├─ 电气系统 → F1.1.x
    ├─ 机械系统 → F1.2.x
    │   ├─ 加工设备 → F1.2.1
    │   ├─ 装配设备 → F1.2.2
    │   ├─ 检测设备 → F1.2.3
    │   └─ 辅助设备 → F1.2.4
    ├─ 物流系统 → F1.3.x
    └─ 空间设施 → F1.4.x

Transitional?
└─ F2系
    ├─ 原料 → F2.1.x
    ├─ 在制品 → F2.2.x
    └─ 成品 → F2.3.x
```

---

### 12.3 JSON Schema验证示例

使用[Ajv](https://ajv.js.org/)验证TwinObject实例:

```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

// 加载核心Schema
const coreSchema = require('./twinobject_core_schema.json');
const validate = ajv.compile(coreSchema);

// 验证实例
const twinObjectInstance = {
  "@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"],
  "id": "urn:ngsi-ld:TwinObject:Robot:ROBOT-R01",
  "type": "TwinObject",
  "twinType": {"type": "Property", "value": "Constituent"},
  "subType": {"type": "Property", "value": "Robot"},
  "functionCategory": {"type": "Property", "value": "F1.2.1"}
};

const valid = validate(twinObjectInstance);
if (!valid) {
  console.log(validate.errors);
}
```

---

### 12.4 相关文档索引

| 文档 | 文件名 | 说明 |
|------|--------|------|
| 核心Schema | `twinobject_core_schema.json` | JSON Schema定义 |
| Station/Position扩展 | `twinobject_station_position.schema.json` | 工位/台位特有字段 |
| Robot扩展 | `twinobject_robot.schema.json` | 机器人特有字段(待补充) |
| Workpiece扩展 | `twinobject_workpiece.schema.json` | 在制品特有字段(待补充) |
| Modality规范 | `modality_specification.md` | 模态定义规范 |
| ModalityBinding规范 | `modality_binding_specification.md` | 数据绑定规范 |
| Scene规范 | `scene_specification.md` | 场景建模规范 |
| MBOM规范 | `mbom_specification.md` | 制造BOM规范 |

---

### 12.5 术语表

| 术语 | 英文 | 说明 |
|------|------|------|
| 孪生对象 | TwinObject | 物理或逻辑实体的数字化表达 |
| 构成性 | Constituent | 固定存在的系统资源 |
| 流转性 | Transitional | 流动加工的对象 |
| 模态 | Modality | 数据采集的类型/维度 |
| 模态绑定 | ModalityBinding | 数据采集的具体配置 |
| 场景 | Scene | 生产活动的时空切片 |
| 功能分类 | Function Category | F1/F2标准分类体系 |
| 能力标签 | Capability | CAP.*格式的能力声明 |
| 接口 | Interface | 信息交互的输入/输出/控制点 |

---

### 12.6 变更日志

| 版本 | 日期 | 变更内容 | 责任人 |
|------|------|----------|--------|
| V1.0 | 2025-10-16 | 初始版本发布 | 数字孪生架构组 |

---

### 12.7 审核与批准

| 角色 | 姓名 | 日期 | 签名 |
|------|------|------|------|
| 编制 | - | 2025-10-16 | - |
| 审核 | - | - | - |
| 批准 | - | - | - |

---

## 结语

本文档定义了TwinObject统一元模型的核心规范,是整个数字孪生系统的建模基础。所有子类型的特有字段设计都应遵循本文档定义的核心字段和建模原则。

**设计理念回顾**:
1. 统一抽象: 一个元模型表达所有对象
2. 分层扩展: 核心简洁,特有字段独立
3. 语义驱动: 基于NGSI-LD标准
4. 能力与度量分离: TwinObject描述能力,Modality描述数据

**下一步工作**:
- [ ] 完善各子类型的扩展Schema(Robot, Welder, Workpiece等)
- [ ] 建立Schema版本管理机制
- [ ] 开发自动化验证工具
- [ ] 编写实施指南和培训材料

---

**文档版本**: V1.0  
**发布日期**: 2025-10-16  
**维护部门**: 数字孪生架构组  
**联系方式**: digitaltwin-arch@example.com

---

**版权声明**: 本文档为内部技术规范,未经授权不得外传。