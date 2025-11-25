# TwinObject Workpiece子类型特有字段设计说明

## 版本: V1.0 | 发布日期: 2025-10-19

---

## 文档摘要

本文档是TwinObject统一元模型中**Workpiece(在制品)**子类型的特有字段扩展规范。Workpiece代表生产过程中正在加工的半成品对象,是流转性(Transitional)孪生对象的核心类别。本规范定义了Workpiece对象在核心字段基础上的专有属性,特别强调**多实例追溯链设计**、**工艺颗粒度管理**、**MBOM强关联**等关键特性。

**适用对象**: 工艺工程师、生产管理人员、数据建模工程师  
**前置文档**: `twinobject_core_guide.md`, `twinobject_core_schema.json`  
**配套文件**: `twinobject_workpiece.schema.json`

---

## 目录

1. [设计理念](#1-设计理念)
2. [Workpiece对象定位](#2-workpiece对象定位)
3. [核心设计决策](#3-核心设计决策)
4. [特有字段详解](#4-特有字段详解)
5. [字段分层架构](#5-字段分层架构)
6. [建模约束与规则](#6-建模约束与规则)
7. [典型场景应用](#7-典型场景应用)
8. [完整示例](#8-完整示例)
9. [常见问题FAQ](#9-常见问题faq)
10. [附录](#10-附录)

---

## 1. 设计理念

### 1.1 核心设计原则

Workpiece子类型特有字段设计遵循以下原则:

1. **多实例追溯链**
   - 工艺里程碑创建新实例(Takt/Process/Step完成)
   - 通过追溯链关联到最终Product
   - 避免复杂的父子层级关系

2. **MBOM强关联**
   - MBOM是在制品产生的源头
   - 每个Workpiece必须能追溯到MBOM的特定部分
   - Scene是MBOM实例化的执行载体

3. **工艺颗粒度动态适配**
   - 支持Takt/Process/Step三级颗粒度
   - 同一实例记录不同颗粒度的状态
   - 独立的序列号体系

4. **现场导向**
   - 支持现场修复记录(针对大型工件特点)
   - 质量检查点嵌入工艺流程
   - 暂停/恢复状态管理

### 1.2 与核心模型的关系

Workpiece对象**继承**TwinObject核心模型的所有字段,并在此基础上扩展。关键继承字段包括:

| 核心字段 | Workpiece中的使用 |
|---------|----------------|
| `twinType` | 固定为`"Transitional"` |
| `subType` | 固定为`"Workpiece"` |
| `locatedIn` | 指向当前所在工位/缓存区 |
| `basedOnMBOM` | 关联的制造BOM(必填) |
| `mbomItemId` | MBOM中的项目ID(必填) |
| `serialNumber` | 在制品序列号(必填) |
| `functionCategory` | 建议使用`F2.2.x`(在制品) |

---

## 2. Workpiece对象定位

### 2.1 什么是Workpiece?

**Workpiece(在制品)**是指正在生产过程中、尚未完成全部工序的半成品对象。

**典型特征**:
- ✅ 正在执行工艺路线中的某个阶段
- ✅ 有明确的完成度和进度信息
- ✅ 在工位间流转
- ✅ 受MBOM和Scene驱动

### 2.2 Workpiece的生命周期

```
原料投入 
    ↓ (Scene执行)
Takt1完成 → 创建Workpiece-T1实例
    ↓ (Scene执行)
Takt2完成 → 创建Workpiece-T2实例
    ↓ (Scene执行)
...
    ↓ (Scene执行)
全Route完成 → 自动转换为Product实例
```

### 2.3 Workpiece vs Material vs Product

| 维度 | Material(原料) | Workpiece(在制品) | Product(成品) |
|------|---------------|------------------|--------------|
| 定义 | 未加工的原材料 | 加工中的半成品 | 完成品 |
| 工艺状态 | 待投产 | 加工中(`completionRate` 0-100%) | 已完工(100%) |
| 创建时机 | 来料入库 | 工艺里程碑完成 | 全Route完成 |
| 序列号规则 | 供应商批次号 | 独立序列号体系 | 最终产品编号 |
| 关键属性 | 来料批次、供应商 | 完成度、当前工序 | 质量等级、包装发运 |
| 位置特征 | 原料仓库 | 工位/缓存区流转 | 成品仓库 |
| `functionCategory` | `F2.1.x` | `F2.2.x` | `F2.3.x` |

---

## 3. 核心设计决策

### 3.1 决策1: 多实例策略(最关键!)

**问题**: 如何表达在制品在不同工艺阶段的状态?

**方案A**(❌未采用): 单实例更新
- 同一个Workpiece实例,不断更新状态
- 优点: 实例数量少
- 缺点: 历史状态难追溯,关系复杂

**方案B**(✅采用): 多实例追溯链
- 每个工艺里程碑创建新Workpiece实例
- 通过`predecessorWorkpiece`/`successorWorkpiece`串联
- 通过`finalProductId`关联到最终Product

**设计理念**:
```
ZQ-2025-00123-T1 (Takt1完成态)
    ↓ predecessor/successor链
ZQ-2025-00123-T2 (Takt2完成态)
    ↓
ZQ-2025-00123-T3 (Takt3完成态)
    ↓ 自动转换
ZQ-2025-00123 (最终Product)
```

### 3.2 决策2: 独立序列号体系

**不同颗粒度的Workpiece序列号完全独立**:

| 颗粒度 | 序列号示例 | 说明 |
|-------|----------|------|
| Takt级 | `ZQ-2025-00123-T1` | Takt序号后缀 |
| Process级 | `ZQ-2025-00123-T2-P3` | Takt+Process后缀 |
| Step级 | `ZQ-2025-00123-T2-P3-S5` | Takt+Process+Step后缀 |

**理由**: 避免复杂的层级关系,每个实例独立管理

### 3.3 决策3: 单一完成度百分比

**使用`completionRate`(0-100%)简化进度跟踪**:

```json
{
  "completionRate": 75.5,  // 单一百分比
  
  "routeProgress": {  // 辅助统计信息
    "totalTakts": 5,
    "completedTakts": 3,
    "currentTakt": 4
  }
}
```

**不使用**:分段完成度映射(过于复杂)

### 3.4 决策4: MBOM驱动的创建逻辑

**Workpiece产生的前提条件**:

```
MBOM (定义工艺蓝图)
    ↓
Scene Template (场景模板)
    ↓
Scene Instance (场景执行)
    ↓ 完成时
Workpiece (在制品实例)
```

**关键约束**:
- 只有MBOM中定义的工序/工步,才能产生Workpiece
- Scene执行完成时,自动创建对应颗粒度的Workpiece
- Workpiece必须能追溯到创建它的Scene

---

## 4. 特有字段详解

### 4.1 追溯链管理层

#### `finalProductId` (必填)
- **类型**: Property
- **值类型**: String
- **说明**: 最终产品编号,作为所有中间态Workpiece的追溯锚点
- **用途**: 
  - 从任意Workpiece快速定位到最终Product
  - 支持批量查询同一产品的所有中间态
- **约束**: 
  - 同一产品的所有Workpiece实例必须共享同一`finalProductId`
  - 格式应与Product的`serialNumber`一致
- **示例**:
```json
"finalProductId": {
  "type": "Property",
  "value": "ZQ-2025-00123"
}
```

#### `predecessorWorkpiece` (可选,第一个实例除外)
- **类型**: Relationship
- **引用对象**: 前驱Workpiece的URN
- **说明**: 指向工艺流程中的上一个里程碑实例
- **约束**:
  - 第一个实例(如Takt1完成态)此字段为空
  - 其他实例必须指向前驱
- **示例**:
```json
"predecessorWorkpiece": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00123-T1"
}
```

#### `successorWorkpiece` (可选,最后一个实例除外)
- **类型**: Relationship
- **引用对象**: 后继Workpiece的URN
- **说明**: 指向工艺流程中的下一个里程碑实例
- **约束**:
  - 最后一个实例(转换为Product前)此字段为空
  - 创建时可为空,在下一实例创建时回填
- **示例**:
```json
"successorWorkpiece": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00123-T2"
}
```

**追溯链示意**:
```
Workpiece-T1 <--predecessor-- Workpiece-T2 <--predecessor-- Workpiece-T3
            --successor-->                --successor-->
                                                            
所有实例共享: finalProductId = "ZQ-2025-00123"
```

---

### 4.2 颗粒度管理层

#### `granularityLevel` (必填)
- **类型**: Property
- **值枚举**: `"Takt"` | `"Process"` | `"Step"` | `"Custom"`
- **说明**: 当前实例代表的管理颗粒度级别
- **语义**:
  - **Takt**: 节拍级完成态
  - **Process**: 工序级完成态
  - **Step**: 工步级完成态
  - **Custom**: 自定义颗粒度
- **示例**:
```json
"granularityLevel": {
  "type": "Property",
  "value": "Takt"
}
```

#### `granularityContext` (必填)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  routeCode: string,      // 工艺路线代码(必填)
  taktSeq: number,        // 节拍序号(必填)
  procCode?: string,      // 工序代码(Process/Step级必填)
  stepSeq?: number        // 工步序号(Step级必填)
}
```
- **说明**: 精确定位当前实例在工艺路线中的位置
- **约束**:
  - `Takt`级: 只需`routeCode`和`taktSeq`
  - `Process`级: 需要`routeCode`、`taktSeq`、`procCode`
  - `Step`级: 需要所有字段
- **示例**:
```json
// Takt级
"granularityContext": {
  "type": "Property",
  "value": {
    "routeCode": "ROUTE-SW-001",
    "taktSeq": 2
  }
}

// Process级
"granularityContext": {
  "type": "Property",
  "value": {
    "routeCode": "ROUTE-SW-001",
    "taktSeq": 2,
    "procCode": "PROC-WELD-02"
  }
}

// Step级
"granularityContext": {
  "type": "Property",
  "value": {
    "routeCode": "ROUTE-SW-001",
    "taktSeq": 2,
    "procCode": "PROC-WELD-02",
    "stepSeq": 3
  }
}
```

---

### 4.3 创建溯源层

#### `createdByScene` (必填)
- **类型**: Relationship
- **引用对象**: Scene实例URN
- **说明**: 创建此Workpiece实例的Scene
- **用途**:
  - 追溯创建时的完整执行上下文
  - 关联执行数据(设备、人员、参数等)
- **示例**:
```json
"createdByScene": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:Scene:WELD-T2-20250116-002"
}
```

#### `creationTimestamp` (必填)
- **类型**: Property
- **值类型**: String (ISO 8601 DateTime)
- **说明**: 实例创建的精确时间戳
- **用途**: 工序完成时间记录
- **示例**:
```json
"creationTimestamp": {
  "type": "Property",
  "value": "2025-01-16T10:30:00Z"
}
```

---

### 4.4 进度与状态层

#### `completionRate` (必填)
- **类型**: Property
- **值类型**: Number (0-100)
- **说明**: 当前完成度百分比
- **约束**: 
  - 范围: 0-100
  - 精度: 建议保留1位小数
- **语义**:
  - `0%`: 刚创建,未开始下一阶段
  - `0-100%`: 执行中
  - `100%`: 本阶段完成(创建下一实例的时机)
- **示例**:
```json
"completionRate": {
  "type": "Property",
  "value": 75.5
}
```

#### `processStatus` (必填)
- **类型**: Property
- **值枚举**: `"NotStarted"` | `"InProgress"` | `"Completed"` | `"OnHold"` | `"Scrapped"`
- **说明**: 加工状态
- **状态流转**:
```
NotStarted → InProgress → Completed
                ↓
            OnHold → InProgress (恢复)
                ↓
            Scrapped (终态)
```
- **示例**:
```json
"processStatus": {
  "type": "Property",
  "value": "InProgress"
}
```

#### `currentRouteContext` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  routeCode: string,
  routeVersion: string,
  currentTaktSeq: number,
  currentProcCode: string,
  currentStepSeq: number
}
```
- **说明**: 当前正在执行的工艺位置(动态更新)
- **与`granularityContext`的区别**:
  - `granularityContext`: 静态,表示实例创建时的位置
  - `currentRouteContext`: 动态,表示当前执行到哪里

#### `routeProgress` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  totalTakts: number,
  completedTakts: number,
  totalProcesses: number,
  completedProcesses: number,
  estimatedCompletionTime: datetime
}
```
- **说明**: 路线进度统计信息
- **用途**: 
  - 可视化展示
  - 预估完工时间

---

### 4.5 场景执行层

#### `executedScenes` (建议必填)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  sceneId: string,
  sceneType: string,
  startTime: datetime,
  endTime?: datetime,
  stationCode: string,
  operatorId: string
}
```
- **说明**: 已执行的Scene列表(工艺履历)
- **用途**:
  - 完整的工序执行记录
  - 追溯每个Scene的执行者和时间
- **示例**:
```json
"executedScenes": {
  "type": "Property",
  "value": [
    {
      "sceneId": "urn:ngsi-ld:Scene:CUT-20250115-001",
      "sceneType": "CuttingProcess",
      "startTime": "2025-01-15T08:00:00Z",
      "endTime": "2025-01-15T08:45:00Z",
      "stationCode": "ST-CUT-01",
      "operatorId": "EMP-20250101"
    },
    {
      "sceneId": "urn:ngsi-ld:Scene:WELD-T1-20250115-002",
      "sceneType": "WeldingProcess",
      "startTime": "2025-01-15T09:00:00Z",
      "endTime": "2025-01-15T10:30:00Z",
      "stationCode": "ST-GZ-03",
      "operatorId": "EMP-20250102"
    }
  ]
}
```

#### `sceneResults` (可选)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  sceneId: string,
  result: "Pass" | "Fail" | "ConditionalPass",
  cycleTime: number,
  qualityMetrics: object
}
```
- **说明**: Scene执行结果摘要
- **用途**: 快速查看各工序的执行结果

---

### 4.6 质量管理层

#### `qualityCheckpoints` (建议必填)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  checkpointId: string,
  checkpointType: "PreProcess" | "InProcess" | "PostProcess",
  checkTime: datetime,
  inspectorId: string,
  result: "Pass" | "Fail" | "ConditionalPass",
  measurements?: object,
  remarks?: string
}
```
- **说明**: 质量检查点记录
- **检查点类型**:
  - **PreProcess**: 工序前检查(如来料检验)
  - **InProcess**: 工序中检查(如首件检验)
  - **PostProcess**: 工序后检查(如质量验收)
- **示例**:
```json
"qualityCheckpoints": {
  "type": "Property",
  "value": [
    {
      "checkpointId": "QC-T2-P1-PRE",
      "checkpointType": "PreProcess",
      "checkTime": "2025-01-16T08:50:00Z",
      "inspectorId": "EMP-QC-01",
      "result": "Pass",
      "measurements": {
        "thickness_mm": 3.02,
        "flatness_mm": 0.5
      }
    },
    {
      "checkpointId": "QC-T2-P1-POST",
      "checkpointType": "PostProcess",
      "checkTime": "2025-01-16T10:35:00Z",
      "inspectorId": "EMP-QC-01",
      "result": "Pass",
      "remarks": "焊缝质量良好"
    }
  ]
}
```

#### `currentDefects` (可选)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  defectId?: string,
  defectCode: string,
  defectDesc: string,
  detectedAt: datetime,
  detectionScene: string,
  severity: "Critical" | "Major" | "Minor",
  status: "Open" | "Repairing" | "Repaired" | "Accepted",
  repairRequired: boolean
}
```
- **说明**: 当前缺陷列表(未闭环的缺陷)
- **缺陷状态流转**:
```
Open → Repairing → Repaired
                → Accepted (可接受缺陷)
```
- **示例**:
```json
"currentDefects": {
  "type": "Property",
  "value": [
    {
      "defectCode": "WELD-SPLASH",
      "defectDesc": "焊接飞溅",
      "detectedAt": "2025-01-16T10:00:00Z",
      "detectionScene": "urn:ngsi-ld:Scene:WELD-T2-20250116-002",
      "severity": "Minor",
      "status": "Repairing",
      "repairRequired": true
    }
  ]
}
```

#### `onSiteRepairs` (可选,侧墙产线特色)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  repairId: string,
  relatedDefectId: string,
  repairTime: datetime,
  repairMethod: string,
  repairOperator: string,
  repairDuration: number,
  repairResult: "Success" | "Failed" | "Pending",
  verifiedBy?: string,
  notes?: string
}
```
- **说明**: 现场修复记录(针对大型工件特点)
- **设计理念**: 
  - 侧墙尺寸巨大,不便返工
  - 现场人工修复是常态
  - 记录修复动作,保证可追溯
- **示例**:
```json
"onSiteRepairs": {
  "type": "Property",
  "value": [
    {
      "repairId": "REP-20250116-001",
      "relatedDefectId": "DEF-WELD-SPLASH-001",
      "repairTime": "2025-01-16T11:00:00Z",
      "repairMethod": "手工打磨飞溅",
      "repairOperator": "EMP-20250105",
      "repairDuration": 15,
      "repairResult": "Success",
      "verifiedBy": "EMP-QC-01",
      "notes": "飞溅已清除,表面平整"
    }
  ]
}
```

---

### 4.7 暂停管理层

#### `holdReasons` (可选)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  holdId: string,
  holdReason: string,
  holdTime: datetime,
  releaseTime?: datetime,
  approvedBy: string
}
```
- **说明**: 暂停原因记录
- **用途**: 
  - 记录生产中断事件
  - 分析停线原因
- **示例**:
```json
"holdReasons": {
  "type": "Property",
  "value": [
    {
      "holdId": "HOLD-20250116-001",
      "holdReason": "等待焊丝补料",
      "holdTime": "2025-01-16T14:00:00Z",
      "releaseTime": "2025-01-16T14:30:00Z",
      "approvedBy": "EMP-SUPERVISOR-01"
    }
  ]
}
```

---

### 4.8 物料追溯层

#### `materialGenealogy` (建议必填)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  materialType: string,
  materialId: string,
  supplierBatch: string,
  usageScene: string,
  usageTimestamp: datetime,
  quantity: number,
  unit: string
}
```
- **说明**: 物料谱系,记录关键原料使用情况
- **用途**: 
  - 质量问题追溯到原料批次
  - 供应商质量管理
- **示例**:
```json
"materialGenealogy": {
  "type": "Property",
  "value": [
    {
      "materialType": "焊丝",
      "materialId": "urn:ngsi-ld:TwinObject:Material:WW-20250110-A001",
      "supplierBatch": "SUP-A-20250105",
      "usageScene": "urn:ngsi-ld:Scene:WELD-T2-20250116-002",
      "usageTimestamp": "2025-01-16T09:15:00Z",
      "quantity": 2.5,
      "unit": "kg"
    },
    {
      "materialType": "钢板-外板",
      "materialId": "urn:ngsi-ld:TwinObject:Material:SP-20250108-B002",
      "supplierBatch": "SUP-B-20250103",
      "usageScene": "urn:ngsi-ld:Scene:CUT-20250115-001",
      "usageTimestamp": "2025-01-15T08:00:00Z",
      "quantity": 1,
      "unit": "piece"
    }
  ]
}
```

---

### 4.9 工时统计层

#### `cycleTimeActual` (可选)
- **类型**: Property
- **值类型**: Number
- **单位**: 分钟
- **说明**: 实际周期时间

#### `cycleTimeStandard` (可选)
- **类型**: Property
- **值类型**: Number
- **单位**: 分钟
- **说明**: 标准周期时间(来自MBOM)

**用途**: 工时分析,效率对比

---

### 4.10 状态转换层

#### `transitionEvents` (可选)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  eventTime: datetime,
  fromStatus: string,
  toStatus: string,
  triggeredBy: string,
  reason: string
}
```
- **说明**: 状态转换事件日志
- **用途**: 审计追踪,状态变更历史

---

## 5. 字段分层架构

Workpiece特有字段按功能分为**10个层级**:

```
L1: 追溯链管理
    ├─ finalProductId (必填)
    ├─ predecessorWorkpiece
    └─ successorWorkpiece
    
L2: 颗粒度管理
    ├─ granularityLevel (必填)
    └─ granularityContext (必填)
    
L3: 创建溯源
    ├─ createdByScene (必填)
    └─ creationTimestamp (必填)
    
L4: 进度与状态
    ├─ completionRate (必填)
    ├─ processStatus (必填)
    ├─ currentRouteContext
    └─ routeProgress
    
L5: 场景执行
    ├─ executedScenes
    └─ sceneResults
    
L6: 质量管理
    ├─ qualityCheckpoints
    ├─ currentDefects
    └─ onSiteRepairs
    
L7: 暂停管理
    └─ holdReasons
    
L8: 物料追溯
    └─ materialGenealogy
    
L9: 工时统计
    ├─ cycleTimeActual
    └─ cycleTimeStandard
    
L10: 状态转换
    └─ transitionEvents
```

---

## 6. 建模约束与规则

### 6.1 必填字段约束

| 字段 | 必填性 | 约束说明 |
|------|--------|----------|
| `finalProductId` | 必填 | 追溯锚点 |
| `granularityLevel` | 必填 | 明确颗粒度 |
| `granularityContext` | 必填 | 精确定位 |
| `createdByScene` | 必填 | 创建溯源 |
| `creationTimestamp` | 必填 | 时间戳 |
| `completionRate` | 必填 | 进度追踪 |
| `processStatus` | 必填 | 状态管理 |
| `basedOnMBOM` | 必填(继承) | MBOM关联 |
| `mbomItemId` | 必填(继承) | MBOM项ID |

### 6.2 条件约束规则

| 规则ID | 条件 | 约束 |
|--------|------|------|
| R1 | `granularityLevel="Process"` | `granularityContext`必须包含`procCode` |
| R2 | `granularityLevel="Step"` | `granularityContext`必须包含`procCode`和`stepSeq` |
| R3 | 非第一个实例 | `predecessorWorkpiece`必须有值 |
| R4 | `processStatus="OnHold"` | `holdReasons`必须有至少一条记录 |
| R5 | `currentDefects`非空 | 至少一条缺陷的`status≠"Repaired"`或`"Accepted"` |
| R6 | `completionRate=100` | 应触发创建下一实例或转换为Product |

### 6.3 追溯链完整性规则

**规则**: 同一`finalProductId`的所有Workpiece实例必须形成完整的单向链表

**验证方法**:
```python
def validate_chain(workpieces):
    # 按finalProductId分组
    groups = group_by(workpieces, 'finalProductId')
    
    for product_id, instances in groups.items():
        # 找到链表头(无predecessor)
        head = find(instances, lambda x: x.predecessorWorkpiece is None)
        
        # 遍历链表
        current = head
        visited = set()
        while current:
            if current.id in visited:
                raise Error("检测到环路")
            visited.add(current.id)
            current = current.successorWorkpiece
        
        # 验证所有实例都被访问
        if len(visited) != len(instances):
            raise Error("链表不完整")
```

### 6.4 序列号规则

**建议格式**:
```
Takt级:    {finalProductId}-T{taktSeq}
Process级: {finalProductId}-T{taktSeq}-P{procCode}
Step级:    {finalProductId}-T{taktSeq}-P{procCode}-S{stepSeq}
```

**示例**:
```
ZQ-2025-00123-T1
ZQ-2025-00123-T2-PWELD02
ZQ-2025-00123-T2-PWELD02-S3
```

---

## 7. 典型场景应用

### 7.1 场景1: Takt级在制品创建

**业务流程**:
1. 执行Takt1的最后一个Scene
2. Scene完成时,自动创建Workpiece-T1实例
3. 记录Takt1内所有Scene的执行情况

**关键字段**:
```json
{
  "id": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00123-T1",
  "finalProductId": {"value": "ZQ-2025-00123"},
  "predecessorWorkpiece": null,
  "granularityLevel": {"value": "Takt"},
  "granularityContext": {
    "value": {
      "routeCode": "ROUTE-SW-001",
      "taktSeq": 1
    }
  },
  "createdByScene": {
    "object": "urn:ngsi-ld:Scene:TAKT1-FINAL-20250115-005"
  },
  "completionRate": {"value": 100},
  "processStatus": {"value": "Completed"},
  "executedScenes": {
    "value": [
      /* Takt1内所有Scene */
    ]
  }
}
```

### 7.2 场景2: 工序级细粒度管理

**业务流程**:
1. Takt2包含3个工序,需要工序级追踪
2. 每个工序完成创建一个Workpiece实例

**实例序列**:
```json
// Takt2-Process1完成
{
  "id": "urn:...Workpiece:ZQ-2025-00123-T2-P1",
  "granularityLevel": {"value": "Process"},
  "granularityContext": {
    "value": {
      "routeCode": "ROUTE-SW-001",
      "taktSeq": 2,
      "procCode": "PROC-WELD-01"
    }
  },
  "predecessorWorkpiece": {
    "object": "urn:...Workpiece:ZQ-2025-00123-T1"
  }
}

// Takt2-Process2完成
{
  "id": "urn:...Workpiece:ZQ-2025-00123-T2-P2",
  "granularityContext": {
    "value": {
      "routeCode": "ROUTE-SW-001",
      "taktSeq": 2,
      "procCode": "PROC-WELD-02"
    }
  },
  "predecessorWorkpiece": {
    "object": "urn:...Workpiece:ZQ-2025-00123-T2-P1"
  }
}
```

### 7.3 场景3: 现场缺陷修复

**业务流程**:
1. 质检发现焊接飞溅
2. 现场人工修复
3. 验证通过,继续生产

**关键字段更新**:
```json
{
  // 发现缺陷
  "currentDefects": {
    "value": [
      {
        "defectCode": "WELD-SPLASH",
        "detectedAt": "2025-01-16T10:00:00Z",
        "severity": "Minor",
        "status": "Open"
      }
    ]
  },
  
  // 安排修复
  "currentDefects": {
    "value": [
      {
        "defectCode": "WELD-SPLASH",
        "status": "Repairing"  // 更新状态
      }
    ]
  },
  
  "onSiteRepairs": {
    "value": [
      {
        "repairId": "REP-001",
        "relatedDefectId": "WELD-SPLASH",
        "repairTime": "2025-01-16T11:00:00Z",
        "repairMethod": "手工打磨",
        "repairOperator": "EMP-20250105",
        "repairResult": "Pending"
      }
    ]
  },
  
  // 修复完成
  "currentDefects": {
    "value": [
      {
        "defectCode": "WELD-SPLASH",
        "status": "Repaired"  // 完成
      }
    ]
  },
  
  "onSiteRepairs": {
    "value": [
      {
        "repairResult": "Success",
        "verifiedBy": "EMP-QC-01"
      }
    ]
  }
}
```

### 7.4 场景4: 转换为Product

**业务流程**:
1. 最后一个Takt/Process/Step完成
2. 系统检测`completionRate=100`
3. 自动创建Product实例

**转换逻辑**:
```json
// 最后一个Workpiece
{
  "id": "urn:...Workpiece:ZQ-2025-00123-T5",
  "completionRate": {"value": 100},
  "processStatus": {"value": "Completed"},
  "successorWorkpiece": null
}

// 自动创建Product
{
  "id": "urn:ngsi-ld:TwinObject:Product:ZQ-2025-00123",
  "subType": {"value": "Product"},
  "serialNumber": {"value": "ZQ-2025-00123"},
  
  // 继承关键信息
  "basedOnMBOM": {"object": "urn:...MBOM:SideWall-V2.0"},
  "specifications": { /* 继承自Workpiece */ },
  
  // 新增Product特有字段
  "workpieceHistory": {
    "value": [
      "urn:...Workpiece:ZQ-2025-00123-T1",
      "urn:...Workpiece:ZQ-2025-00123-T2",
      "...",
      "urn:...Workpiece:ZQ-2025-00123-T5"
    ]
  },
  
  "productionDate": {"value": "2025-01-15"},
  "completionDate": {"value": "2025-01-17T16:30:00Z"},
  "qualityStatus": {"value": "UnderInspection"}
}
```

---

## 8. 完整示例

### 示例1: Takt级在制品(侧墙Takt2完成态)

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00123-T2",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "侧墙在制品-ZQ-2025-00123-Takt2完成态"
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
  
  "locatedIn": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:BufferZone:BUF-T2-T3"
  },
  
  "basedOnMBOM": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:MBOM:SideWall-V2.0"
  },
  
  "mbomItemId": {
    "type": "Property",
    "value": "SWP-Panel-001"
  },
  
  "serialNumber": {
    "type": "Property",
    "value": "ZQ-2025-00123-T2"
  },
  
  "finalProductId": {
    "type": "Property",
    "value": "ZQ-2025-00123"
  },
  
  "predecessorWorkpiece": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00123-T1"
  },
  
  "successorWorkpiece": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00123-T3"
  },
  
  "granularityLevel": {
    "type": "Property",
    "value": "Takt"
  },
  
  "granularityContext": {
    "type": "Property",
    "value": {
      "routeCode": "ROUTE-SW-001",
      "taktSeq": 2
    }
  },
  
  "createdByScene": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Scene:WELD-T2-FINAL-20250116-008"
  },
  
  "creationTimestamp": {
    "type": "Property",
    "value": "2025-01-16T14:30:00Z"
  },
  
  "completionRate": {
    "type": "Property",
    "value": 100
  },
  
  "processStatus": {
    "type": "Property",
    "value": "Completed"
  },
  
  "currentRouteContext": {
    "type": "Property",
    "value": {
      "routeCode": "ROUTE-SW-001",
      "routeVersion": "V1.0",
      "currentTaktSeq": 3,
      "currentProcCode": null,
      "currentStepSeq": null
    }
  },
  
  "routeProgress": {
    "type": "Property",
    "value": {
      "totalTakts": 5,
      "completedTakts": 2,
      "totalProcesses": 15,
      "completedProcesses": 6,
      "estimatedCompletionTime": "2025-01-18T16:00:00Z"
    }
  },