# TwinObject QC_Tool子类型特有字段设计指南

## 版本: V1.0 | 发布日期: 2025-10-17

---

## 文档摘要

本文档是TwinObject统一元模型中**QC_Tool(质检工具)**子类型的特有字段设计规范,定义了质检工具对象在核心字段基础上的扩展属性。QC_Tool涵盖各类测量工具、量具、检测设备和视觉系统,是制造质量保障的关键资源。

**适用对象**: 质量工程师、计量管理员、数据建模工程师  
**相关标准**: ISO 10012(测量管理体系), MSA手册第4版, ISO/IEC 17025(校准和检测实验室能力)  
**配套文件**: `twinobject_qctool.schema.json`, `twinobject_core_guide.md`

---

## 目录

1. [设计理念与原则](#1-设计理念与原则)
2. [QC_Tool子类型概述](#2-qc_tool子类型概述)
3. [特有字段详解](#3-特有字段详解)
4. [校准与MSA管理](#4-校准与msa管理)
5. [建模约束与验证规则](#5-建模约束与验证规则)
6. [完整示例](#6-完整示例)
7. [常见问题FAQ](#7-常见问题faq)
8. [附录](#8-附录)

---

## 1. 设计理念与原则

### 1.1 核心设计理念

QC_Tool子类型的设计遵循**"测量可信、可追溯、可控制"**三大原则:

1. **测量可信** (Measurement Reliability)
   - 明确测量能力边界(范围、精度、分辨率)
   - 强制校准与MSA状态管理
   - 质量数据与计量状态联动

2. **全程可追溯** (Full Traceability)
   - 校准历史可查询
   - MSA结果可验证
   - 测量数据溯源到工具状态

3. **过程可控制** (Process Control)
   - 自动校准到期预警
   - MSA失效阻断数据使用
   - 使用权限与资质关联

### 1.2 与统一元模型的关系

QC_Tool子类型**完全继承**TwinObject核心字段,并在以下层级进行扩展:

| 核心层级 | QC_Tool扩展重点 |
|---------|----------------|
| L1-类型分类 | `subType="QC_Tool"`, `twinType="Constituent"` |
| L2-功能维度 | `functionCategory="F1.2.3"` (检测设备) |
| L6-数据模态 | `supportedModalities` 映射到 `measurableModalities` |
| L8-扩展属性 | 大量计量专有字段(本文档定义) |

**关键约束**:
- QC_Tool必须为`Constituent`类型(固定安装或有明确存放位置)
- 必须声明`measurableModalities`(能测什么)
- 校准状态直接影响`modalityBindings`的有效性

---

## 2. QC_Tool子类型概述

### 2.1 适用对象范围

QC_Tool涵盖所有用于**质量测量与检验**的工具和设备:

| 类别 | 典型实例 | qcToolCategory |
|------|---------|----------------|
| 测量工具 | 卡尺、千分尺、高度尺 | MeasuringTool |
| 量具 | 量规、块规、样板 | Gauge |
| 仪器 | 三坐标测量机、激光测距仪 | Instrument |
| 视觉系统 | 视觉检测相机、扫描仪 | VisionSystem |
| 试验设备 | 拉力试验机、硬度计 | TestEquipment |
| 扫描器 | 3D扫描仪、激光轮廓仪 | Scanner |

**不包括**:
- ❌ 生产设备(如焊机、机器人) → 归入AutoEquipment
- ❌ 在线检测传感器 → 通过Modality建模
- ❌ 软件算法 → 不建模为TwinObject

### 2.2 核心能力表达

QC_Tool的核心能力通过以下字段组合表达:

```
测量能力 = measurableModalities (能测什么)
           + measurementRange (测量范围)
           + accuracy (精度)
           + resolution (分辨率)

可靠性保障 = calibrationStatus (校准状态)
             + msaStatus (MSA状态)

适用性约束 = compatibleProcCodes (适用工序)
             + compatibleWorkpieceTypes (适用工件)
             + usageRestrictions (使用限制)
```

### 2.3 生命周期管理

QC_Tool的生命周期特点:

```
采购入库 → 首次校准 → 投入使用 → 周期校准/MSA → 维护保养 → 报废退出
          ↑__________________________|
                (闭环管理)
```

**关键节点**:
1. **首次校准**: 入库后必须完成首次校准才能投用
2. **周期校准**: 按`calibrationRequirement.interval`自动触发
3. **MSA验证**: 关键工具需定期进行测量系统分析
4. **状态同步**: 校准/MSA失效时自动阻断数据采集

---

## 3. 特有字段详解

### 3.1 分类与测量能力字段

#### `qcToolCategory` (必填)
- **NGSI-LD类型**: Property
- **值枚举**: 
  - `"MeasuringTool"`: 测量工具(卡尺、千分尺等)
  - `"Gauge"`: 量具(量规、块规等)
  - `"Instrument"`: 仪器(三坐标、测距仪等)
  - `"VisionSystem"`: 视觉系统
  - `"TestEquipment"`: 试验设备
  - `"Scanner"`: 扫描器
- **说明**: 质检工具的一级分类
- **用途**: 
  - 用于资源检索("找所有三坐标测量机")
  - 决定后续管理流程(不同类别校准要求不同)
- **示例**:
```json
"qcToolCategory": {
  "type": "Property",
  "value": "Instrument"
}
```

#### `measurementType` (必填)
- **NGSI-LD类型**: Property
- **值枚举**:
  - `"Dimensional"`: 尺寸测量(长宽高、直径等)
  - `"Geometric"`: 几何测量(平面度、垂直度等)
  - `"Surface"`: 表面测量(粗糙度、涂层厚度等)
  - `"Functional"`: 功能测试(强度、密封性等)
  - `"Visual"`: 视觉检测(外观、缺陷等)
  - `"Destructive"`: 破坏性检测
  - `"NonDestructive"`: 无损检测
- **说明**: 测量类型分类
- **约束**: 
  - 一个工具可有多种测量类型(通过`capabilities`补充)
  - 主要类型用此字段标识
- **示例**:
```json
"measurementType": {
  "type": "Property",
  "value": "Dimensional"
}
```

#### `measurableModalities` (必填)
- **NGSI-LD类型**: Property (Array)
- **值类型**: Array[String], 元素为Modality URN
- **说明**: 可测量的模态类型清单,声明该工具能产生哪些类型的测量数据
- **关系**: 
  - 与核心字段`supportedModalities`对应
  - `supportedModalities`声明能力,`measurableModalities`列举具体
- **约束**: 
  - 必须至少包含1个模态
  - 引用的Modality必须在系统中已定义
- **示例**:
```json
"measurableModalities": {
  "type": "Property",
  "value": [
    "urn:ngsi-ld:Modality:Length",
    "urn:ngsi-ld:Modality:Width",
    "urn:ngsi-ld:Modality:Height",
    "urn:ngsi-ld:Modality:Diameter"
  ]
}
```

**最佳实践**: 在MBOM的`requiredMeasurements`中引用这些模态时,系统会自动匹配能测量对应模态的QC_Tool。

---

### 3.2 测量性能参数

#### `measurementRange` (建议必填)
- **NGSI-LD类型**: Property (Object)
- **结构**:
```typescript
{
  min: number,    // 最小值
  max: number,    // 最大值
  unit: string    // 单位
}
```
- **说明**: 测量范围,定义工具的测量上下限
- **用途**: 
  - 工艺规划: 确定工具是否适用于特定尺寸工件
  - 数据验证: 超出范围的数据标记为Error
- **示例**:
```json
"measurementRange": {
  "type": "Property",
  "value": {
    "min": 0,
    "max": 300,
    "unit": "mm"
  }
}
```

#### `accuracy` (建议必填)
- **NGSI-LD类型**: Property (Object)
- **结构**:
```typescript
{
  value: number,       // 精度数值
  unit: string,        // 单位
  standard?: string    // 精度标准(如ISO 3599)
}
```
- **说明**: 测量精度,表示工具的准确度
- **表示方法**:
  - 绝对精度: `±0.02mm`
  - 相对精度: `±0.02% + 0.01mm`
  - 分级精度: `"ISO Grade 2"`
- **示例**:
```json
"accuracy": {
  "type": "Property",
  "value": {
    "value": 0.02,
    "unit": "mm",
    "standard": "ISO 3599-2001"
  }
}
```

#### `resolution` (可选)
- **NGSI-LD类型**: Property (Object)
- **结构**:
```typescript
{
  value: number,    // 分辨率数值
  unit: string      // 单位
}
```
- **说明**: 分辨率,工具能分辨的最小刻度
- **与精度的区别**: 
  - 分辨率: 最小显示值(如0.01mm)
  - 精度: 测量误差范围(如±0.02mm)
  - 通常精度≥分辨率
- **示例**:
```json
"resolution": {
  "type": "Property",
  "value": {
    "value": 0.01,
    "unit": "mm"
  }
}
```

#### `repeatability` (可选)
- **NGSI-LD类型**: Property (Object)
- **结构**: 同`resolution`
- **说明**: 重复性精度,同一条件下重复测量的一致性
- **用途**: MSA分析的关键指标
- **示例**:
```json
"repeatability": {
  "type": "Property",
  "value": {
    "value": 0.015,
    "unit": "mm"
  }
}
```

---

### 3.3 校准管理字段

#### `calibrationRequirement` (建议必填)
- **NGSI-LD类型**: Property (Object)
- **结构**:
```typescript
{
  required: boolean,        // 是否需要定期校准
  interval?: number,        // 校准周期(天)
  standard?: string,        // 校准标准
  authority?: string        // 校准机构
}
```
- **说明**: 校准要求定义
- **决策逻辑**:
```javascript
if (qcToolCategory === "Gauge" && measurementType === "Dimensional") {
  required = true;
  interval = 180; // 半年
} else if (qcToolCategory === "VisionSystem") {
  required = false; // 视觉系统通常不需要传统校准
}
```
- **示例**:
```json
"calibrationRequirement": {
  "type": "Property",
  "value": {
    "required": true,
    "interval": 180,
    "standard": "ISO/IEC 17025:2017",
    "authority": "国家认可的第三方校准机构"
  }
}
```

#### `calibrationStatus` (条件必填)
- **NGSI-LD类型**: Property (Object)
- **条件**: 当`calibrationRequirement.required=true`时必填
- **结构**:
```typescript
{
  status: "Valid"|"Expired"|"Pending"|"Failed"|"NotRequired",
  lastCalibrationDate?: string,      // ISO日期
  nextCalibrationDue?: string,       // ISO日期
  certificateNumber?: string,        // 证书编号
  calibratedBy?: string              // 校准单位
}
```
- **状态说明**:
  - `Valid`: 校准有效,可正常使用
  - `Expired`: 校准过期,**禁止使用**
  - `Pending`: 校准中,暂停使用
  - `Failed`: 校准失败,**禁止使用**
  - `NotRequired`: 不需要校准
- **自动触发**: 
  - 每日定时任务检查`nextCalibrationDue`
  - 到期自动改状态为`Expired`并发送告警
- **示例**:
```json
"calibrationStatus": {
  "type": "Property",
  "value": {
    "status": "Valid",
    "lastCalibrationDate": "2024-10-01",
    "nextCalibrationDue": "2025-04-01",
    "certificateNumber": "CAL-2024-10-001",
    "calibratedBy": "北京计量院"
  }
}
```

**关键业务规则**:
```javascript
// 数据采集前验证
if (calibrationStatus.status !== "Valid" && calibrationStatus.status !== "NotRequired") {
  throw new Error("工具校准状态无效,禁止采集数据");
  // 同时将采集到的数据标记qualityTag="CalFail"
}
```

---

### 3.4 MSA管理字段

#### `msaStatus` (建议必填)
- **NGSI-LD类型**: Property (Object)
- **结构**:
```typescript
{
  status: "Pass"|"Fail"|"Pending"|"NotApplicable",
  grr?: number,                  // GR&R百分比
  lastMSADate?: string,          // ISO日期
  nextMSADue?: string,           // ISO日期
  reportReference?: string       // 报告文件链接
}
```
- **说明**: 测量系统分析(MSA)状态
- **GR&R判定标准** (参考MSA手册第4版):
  - GR&R < 10%: 测量系统优秀(Pass)
  - 10% ≤ GR&R < 30%: 可接受,需改进(Pass with Warning)
  - GR&R ≥ 30%: 测量系统不可接受(Fail)
- **触发条件**:
  - 关键工序的测量工具必须进行MSA
  - 新工具投用前必须进行MSA
  - 定期(如每年)重新验证
- **示例**:
```json
"msaStatus": {
  "type": "Property",
  "value": {
    "status": "Pass",
    "grr": 8.5,
    "lastMSADate": "2024-09-15",
    "nextMSADue": "2025-09-15",
    "reportReference": "file://quality/msa/CMM-01-MSA-2024-Q3.pdf"
  }
}
```

**业务规则**:
```javascript
// 数据质量标签判定
if (msaStatus.status === "Fail") {
  qualityTag = "CalFail"; // 即使校准有效,MSA失败也不可信
}
```

---

### 3.5 适用性与使用控制

#### `compatibleProcCodes` (可选)
- **NGSI-LD类型**: Property (Array)
- **值类型**: Array[String]
- **说明**: 适用工序代码清单
- **用途**: 
  - 工艺规划: "这个工具可以用在哪些工序"
  - 资源调度: 限制工具跨工序使用
- **示例**:
```json
"compatibleProcCodes": {
  "type": "Property",
  "value": [
    "PROC-WELD-01",
    "PROC-WELD-02",
    "PROC-FINAL-QC"
  ]
}
```

#### `compatibleWorkpieceTypes` (可选)
- **NGSI-LD类型**: Property (Array)
- **值类型**: Array[String]
- **说明**: 适用在制品类型清单
- **用途**: 限制工具仅用于特定产品
- **示例**:
```json
"compatibleWorkpieceTypes": {
  "type": "Property",
  "value": [
    "SideWall",
    "RoofPanel"
  ]
}
```

#### `measurementMode` (可选)
- **NGSI-LD类型**: Property
- **值枚举**:
  - `"Manual"`: 人工手动测量
  - `"SemiAutomatic"`: 半自动(人工定位,自动读数)
  - `"FullyAutomatic"`: 全自动
  - `"Remote"`: 远程测量
- **说明**: 测量模式
- **影响**: 决定数据采集方式和人员要求
- **示例**:
```json
"measurementMode": {
  "type": "Property",
  "value": "SemiAutomatic"
}
```

#### `usageRestrictions` (可选)
- **NGSI-LD类型**: Property (Object)
- **结构**:
```typescript
{
  requiresCertification?: boolean,    // 是否需要操作资质
  requiredSkills?: string[],          // 所需技能清单
  safetyRequirements?: string[],      // 安全要求
  maxUsagePerDay?: number             // 每日最大使用次数
}
```
- **说明**: 使用限制条件
- **用途**: 
  - 人员资质验证
  - 使用频次控制
  - 安全管理
- **示例**:
```json
"usageRestrictions": {
  "type": "Property",
  "value": {
    "requiresCertification": true,
    "requiredSkills": [
      "Skill.QC.CMM.L2",
      "Skill.SafetyTraining.Laser"
    ],
    "safetyRequirements": [
      "必须佩戴激光防护眼镜",
      "确保工作区域无人员"
    ],
    "maxUsagePerDay": 20
  }
}
```

---

### 3.6 环境与维护

#### `operatingEnvironment` (可选)
- **NGSI-LD类型**: Property (Object)
- **结构**:
```typescript
{
  temperatureRange?: {min, max, unit},
  humidityRange?: {min, max, unit},
  vibrationLevel?: "Low"|"Medium"|"High"|"NotSensitive",
  dustProtection?: string
}
```
- **说明**: 使用环境要求
- **用途**: 
  - 安装位置验证
  - 环境监控告警
- **示例**:
```json
"operatingEnvironment": {
  "type": "Property",
  "value": {
    "temperatureRange": {
      "min": 18,
      "max": 24,
      "unit": "°C"
    },
    "humidityRange": {
      "min": 40,
      "max": 60,
      "unit": "%RH"
    },
    "vibrationLevel": "Low",
    "dustProtection": "IP54"
  }
}
```

#### `storageRequirement` (可选)
- **NGSI-LD类型**: Property (Object)
- **结构**: 同`operatingEnvironment`
- **说明**: 存储条件要求
- **用途**: 闲置工具的存放管理

#### `maintenanceSchedule` (可选)
- **NGSI-LD类型**: Property (Object)
- **结构**:
```typescript
{
  routineInterval?: number,        // 日常维护周期(天)
  majorInterval?: number,          // 大修周期(天)
  maintenanceItems?: [
    {item: string, frequency: string, responsible: string}
  ]
}
```
- **说明**: 维护保养计划
- **示例**:
```json
"maintenanceSchedule": {
  "type": "Property",
  "value": {
    "routineInterval": 7,
    "majorInterval": 365,
    "maintenanceItems": [
      {
        "item": "清洁光学镜头",
        "frequency": "每周",
        "responsible": "操作员"
      },
      {
        "item": "更换滤芯",
        "frequency": "每季度",
        "responsible": "设备维护组"
      }
    ]
  }
}
```

---

### 3.7 数据接口

#### `dataOutputFormat` (可选)
- **NGSI-LD类型**: Property (Object)
- **结构**:
```typescript
{
  formats: ("Analog"|"Digital"|"RS232"|"USB"|"Ethernet"|"Wireless"|"Manual")[],
  protocol?: string,           // 通信协议
  dataStructure?: string       // 数据结构说明
}
```
- **说明**: 数据输出格式
- **用途**: 
  - 数据采集配置
  - 接口集成规划
- **示例**:
```json
"dataOutputFormat": {
  "type": "Property",
  "value": {
    "formats": ["Ethernet", "USB"],
    "protocol": "Modbus TCP",
    "dataStructure": "JSON格式,包含测量值、时间戳、状态码"
  }
}
```

**与modalityBindings的关系**:
```json
// QC_Tool定义输出能力
"dataOutputFormat": {..., "formats": ["Ethernet"], "protocol": "Modbus TCP"}

// modalityBindings定义具体采集配置
"modalityBindings": [{
  "modalityId": "urn:ngsi-ld:Modality:Length",
  "pointRef": "modbus://192.168.1.100:502/register/40001",
  "bindingVersion": "V1.0",
  ...
}]
```

---

### 3.8 文档管理

#### `documentReferences` (可选)
- **NGSI-LD类型**: Property (Object)
- **结构**:
```typescript
{
  operatingManual?: string,        // 操作手册链接
  calibrationProcedure?: string,   // 校准规程链接
  msaGuideline?: string,           // MSA指导文件链接
  sopCodes?: string[]              // 关联SOP编码
}
```
- **说明**: 相关文档引用
- **用途**: 
  - 快速访问操作指导
  - 培训材料索引
- **示例**:
```json
"documentReferences": {
  "type": "Property",
  "value": {
    "operatingManual": "file://docs/CMM-ZEISS-Manual-CN.pdf",
    "calibrationProcedure": "file://qms/calibration/CMM-CAL-PROC-001.pdf",
    "msaGuideline": "file://qms/msa/MSA-Guideline-2024.pdf",
    "sopCodes": ["SOP-QC-001", "SOP-QC-005"]
  }
}
```

---

## 4. 校准与MSA管理

### 4.1 校准生命周期

```
[新工具入库]
    ↓
[首次校准] → 校准状态: Pending
    ↓ (校准通过)
[投入使用] → 校准状态: Valid
    ↓
[周期使用]
    ↓ (到期前30天)
[预警提醒] → 通知计量管理员
    ↓ (到期当天)
[自动过期] → 校准状态: Expired, 禁止使用
    ↓
[重新校准]
    ↓ (校准通过)
[恢复使用] → 校准状态: Valid
    ↓ (校准失败)
[停用隔离] → 校准状态: Failed
```

### 4.2 校准数据联动

**关键规则**: 校准状态直接影响数据质量标签

```javascript
// 数据采集时验证
function validateToolStatus(qcTool, modalData) {
  // 1. 检查校准状态
  if (qcTool.calibrationStatus.status === "Expired") {
    modalData.qualityTag = "CalFail";
    modalData.provenance.validationNote = "工具校准过期";
    throw new Error("禁止使用校准过期工具采集数据");
  }
  
  if (qcTool.calibrationStatus.status === "Failed") {
    modalData.qualityTag = "CalFail";
    throw new Error("禁止使用校准失败工具采集数据");
  }
  
  // 2. 检查MSA状态
  if (qcTool.msaStatus.status === "Fail") {
    modalData.qualityTag = "CalFail";
    modalData.provenance.validationNote = "工具MSA不合格";
    throw new Error("禁止使用MSA失败工具采集数据");
  }
  
  // 3. 检查校准到期预警(30天内)
  const daysToExpire = calculateDays(
    qcTool.calibrationStatus.nextCalibrationDue
  );
  if (daysToExpire <= 30 && daysToExpire > 0) {
    modalData.qualityTag = "Warn";
    modalData.provenance.validationNote = `工具校准即将到期(剩余${daysToExpire}天)`;
  }
  
  // 通过所有验证
  return true;
}
```

### 4.3 MSA集成

**典型MSA流程**:

1. **数据收集**: 10个零件×3个操作员×3次重复 = 90个数据点
2. **统计分析**: 计算GR&R
3. **结果判定**: 
   - GR&R < 10%: Pass
   - GR&R ≥ 30%: Fail
4. **状态更新**: 更新`msaStatus`字段
5. **系统联动**: 
   - Pass: 允许正常使用
   - Fail: 阻断数据采集,触发改进流程

**MSA结果存储**:
```json
"msaStatus": {
  "type": "Property",
  "value": {
    "status": "Pass",
    "grr": 8.5,
    "lastMSADate": "2024-09-15",
    "nextMSADue": "2025-09-15",
    "reportReference": "file://quality/msa/CMM-01-MSA-2024-Q3.pdf"
  },
  "observedAt": "2024-09-15T14:30:00Z",
  "metadata": {
    "measuredBy": "质量工程师-李明",
    "analysisMethod": "ANOVA Method",
    "sampleSize": 90,
    "components": {
      "repeatability": 5.2,
      "reproducibility": 3.3,
      "partVariation": 91.5
    }
  }
}
```

---

## 5. 建模约束与验证规则

### 5.1 字段依赖关系

| 条件字段 | 条件值 | 依赖字段 | 约束 |
|---------|--------|---------|------|
| `calibrationRequirement.required` | `true` | `calibrationStatus` | 必填 |
| `calibrationStatus.status` | `"Valid"` | `lastCalibrationDate`, `nextCalibrationDue` | 必填 |
| `msaStatus.status` | `"Pass"` | `grr`, `lastMSADate` | 必填 |
| `usageRestrictions.requiresCertification` | `true` | `requiredSkills` | 建议必填 |

### 5.2 业务验证规则

#### R1: 校准周期合理性
```javascript
if (calibrationRequirement.required) {
  assert(
    calibrationRequirement.interval >= 30 && 
    calibrationRequirement.interval <= 1095, // 3年
    "校准周期应在30天至3年之间"
  );
}
```

#### R2: 校准到期日期一致性
```javascript
if (calibrationStatus.status === "Valid") {
  const nextDue = new Date(calibrationStatus.nextCalibrationDue);
  const lastCal = new Date(calibrationStatus.lastCalibrationDate);
  const interval = calibrationRequirement.interval;
  
  const expectedDue = new Date(lastCal);
  expectedDue.setDate(expectedDue.getDate() + interval);
  
  assert(
    Math.abs(nextDue - expectedDue) <= 86400000, // 1天容差
    "校准到期日期与周期不匹配"
  );
}
```

#### R3: MSA GR&R范围
```javascript
if (msaStatus.grr !== undefined) {
  assert(
    msaStatus.grr >= 0 && msaStatus.grr <= 100,
    "GR&R百分比应在0-100之间"
  );
}
```

#### R4: 测量范围逻辑性
```javascript
if (measurementRange) {
  assert(
    measurementRange.min < measurementRange.max,
    "最小值必须小于最大值"
  );
}
```

#### R5: 精度分辨率关系
```javascript
if (accuracy && resolution) {
  assert(
    accuracy.value >= resolution.value,
    "精度应大于等于分辨率"
  );
}
```

### 5.3 数据质量门禁

**采集前验证**:
```javascript
function canUseForMeasurement(qcTool) {
  // 1. 校准状态检查
  if (qcTool.calibrationRequirement?.required) {
    if (qcTool.calibrationStatus.status !== "Valid") {
      return {
        allowed: false,
        reason: "校准状态无效",
        qualityTag: "CalFail"
      };
    }
  }
  
  // 2. MSA状态检查
  if (qcTool.msaStatus?.status === "Fail") {
    return {
      allowed: false,
      reason: "MSA不合格",
      qualityTag: "CalFail"
    };
  }
  
  // 3. 环境条件检查(如果有环境监控)
  if (qcTool.operatingEnvironment) {
    const envOk = checkEnvironment(qcTool.installPosition);
    if (!envOk) {
      return {
        allowed: false,
        reason: "环境条件不满足",
        qualityTag: "Error"
      };
    }
  }
  
  // 4. 使用频次检查
  if (qcTool.usageRestrictions?.maxUsagePerDay) {
    const todayUsage = getTodayUsageCount(qcTool.id);
    if (todayUsage >= qcTool.usageRestrictions.maxUsagePerDay) {
      return {
        allowed: false,
        reason: "超出每日使用次数限制",
        qualityTag: "Warn"
      };
    }
  }
  
  return {allowed: true, qualityTag: "OK"};
}
```

---

## 6. 完整示例

### 6.1 示例1: 三坐标测量机

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:QC_Tool:CMM-01",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "蔡司三坐标测量机CMM-01"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "QC_Tool"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.2.3"
  },
  
  "functionDesc": {
    "type": "Property",
    "value": "执行精密尺寸和几何形位公差测量,用于关键零部件质量检验"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 3
  },
  
  "partOf": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:QC-Room"
  },
  
  "installPosition": {
    "type": "Property",
    "value": "侧墙产线-质检室-恒温区-01号测量台"
  },
  
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [150.2, 95.8]
    }
  },
  
  "vendor": {
    "type": "Property",
    "value": "蔡司(ZEISS)"
  },
  
  "model": {
    "type": "Property",
    "value": "CONTURA G2 7/10/6"
  },
  
  "serialNumber": {
    "type": "Property",
    "value": "ZEISS-CMM-2023-001"
  },
  
  "qcToolCategory": {
    "type": "Property",
    "value": "Instrument"
  },
  
  "measurementType": {
    "type": "Property",
    "value": "Dimensional"
  },
  
  "measurableModalities": {
    "type": "Property",
    "value": [
      "urn:ngsi-ld:Modality:Length",
      "urn:ngsi-ld:Modality:Width",
      "urn:ngsi-ld:Modality:Height",
      "urn:ngsi-ld:Modality:Diameter",
      "urn:ngsi-ld:Modality:Flatness",
      "urn:ngsi-ld:Modality:Parallelism",
      "urn:ngsi-ld:Modality:Perpendicularity"
    ]
  },
  
  "measurementRange": {
    "type": "Property",
    "value": {
      "min": 0,
      "max": 1000,
      "unit": "mm"
    }
  },
  
  "accuracy": {
    "type": "Property",
    "value": {
      "value": 0.0025,
      "unit": "mm",
      "standard": "ISO 10360-2:2009"
    }
  },
  
  "resolution": {
    "type": "Property",
    "value": {
      "value": 0.0001,
      "unit": "mm"
    }
  },
  
  "repeatability": {
    "type": "Property",
    "value": {
      "value": 0.002,
      "unit": "mm"
    }
  },
  
  "calibrationRequirement": {
    "type": "Property",
    "value": {
      "required": true,
      "interval": 365,
      "standard": "ISO/IEC 17025:2017",
      "authority": "中国计量科学研究院"
    }
  },
  
  "calibrationStatus": {
    "type": "Property",
    "value": {
      "status": "Valid",
      "lastCalibrationDate": "2024-09-01",
      "nextCalibrationDue": "2025-09-01",
      "certificateNumber": "NIM-CAL-2024-CMM-00123",
      "calibratedBy": "中国计量科学研究院"
    }
  },
  
  "msaStatus": {
    "type": "Property",
    "value": {
      "status": "Pass",
      "grr": 8.5,
      "lastMSADate": "2024-09-15",
      "nextMSADue": "2025-09-15",
      "reportReference": "file://quality/msa/CMM-01-MSA-2024-Q3.pdf"
    }
  },
  
  "compatibleProcCodes": {
    "type": "Property",
    "value": [
      "PROC-FINAL-QC",
      "PROC-IQC",
      "PROC-FAI"
    ]
  },
  
  "compatibleWorkpieceTypes": {
    "type": "Property",
    "value": [
      "SideWall",
      "RoofPanel",
      "DoorFrame"
    ]
  },
  
  "measurementMode": {
    "type": "Property",
    "value": "SemiAutomatic"
  },
  
  "operatingEnvironment": {
    "type": "Property",
    "value": {
      "temperatureRange": {
        "min": 19,
        "max": 21,
        "unit": "°C"
      },
      "humidityRange": {
        "min": 45,
        "max": 55,
        "unit": "%RH"
      },
      "vibrationLevel": "Low",
      "dustProtection": "IP54"
    }
  },
  
  "dataOutputFormat": {
    "type": "Property",
    "value": {
      "formats": ["Ethernet", "USB"],
      "protocol": "Modbus TCP",
      "dataStructure": "JSON格式,包含测量点坐标、偏差值、时间戳"
    }
  },
  
  "usageRestrictions": {
    "type": "Property",
    "value": {
      "requiresCertification": true,
      "requiredSkills": [
        "Skill.QC.CMM.L2",
        "Skill.GD&T.Advanced"
      ],
      "safetyRequirements": [
        "操作前检查气压系统",
        "确保测量台清洁无杂物"
      ],
      "maxUsagePerDay": 50
    }
  },
  
  "maintenanceSchedule": {
    "type": "Property",
    "value": {
      "routineInterval": 7,
      "majorInterval": 365,
      "maintenanceItems": [
        {
          "item": "清洁导轨和测头",
          "frequency": "每周",
          "responsible": "测量室组长"
        },
        {
          "item": "更换空气过滤器",
          "frequency": "每季度",
          "responsible": "设备维护组"
        },
        {
          "item": "全面检修校准",
          "frequency": "每年",
          "responsible": "厂商服务工程师"
        }
      ]
    }
  },
  
  "documentReferences": {
    "type": "Property",
    "value": {
      "operatingManual": "file://docs/ZEISS-CONTURA-G2-Manual-CN.pdf",
      "calibrationProcedure": "file://qms/calibration/CMM-CAL-PROC-001.pdf",
      "msaGuideline": "file://qms/msa/MSA-Guideline-2024.pdf",
      "sopCodes": ["SOP-QC-001", "SOP-QC-005", "SOP-QC-010"]
    }
  },
  
  "supportedModalities": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:Length"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:Flatness"
    }
  ],
  
  "modalityBindings": [
    {
      "type": "Property",
      "value": {
        "modalityId": "urn:ngsi-ld:Modality:Length",
        "pointRef": "modbus://192.168.10.50:502/register/40001",
        "bindingVersion": "V1.0",
        "changeId": "CHG-2024-QC-001",
        "effectiveFrom": "2024-09-01T00:00:00Z"
      }
    }
  ],
  
  "capabilities": {
    "type": "Property",
    "value": [
      "CAP.Measure.3D",
      "CAP.Measure.Dimensional",
      "CAP.Measure.Geometric",
      "CAP.Report.AutoGenerate"
    ]
  },
  
  "specifications": {
    "type": "Property",
    "value": {
      "measuring_volume_x": 700,
      "measuring_volume_y": 1000,
      "measuring_volume_z": 600,
      "measuring_volume_unit": "mm",
      "max_measuring_speed": 500,
      "max_measuring_speed_unit": "mm/s",
      "probe_system": "VAST XXT",
      "software": "ZEISS CALYPSO 2024"
    }
  },
  
  "notes": {
    "type": "Property",
    "value": "2023年采购投产,主要用于侧墙关键尺寸测量。需严格控制恒温环境。"
  }
}
```

### 6.2 示例2: 游标卡尺

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:QC_Tool:CALIPER-005",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "数显游标卡尺-005"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "QC_Tool"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.2.3"
  },
  
  "functionDesc": {
    "type": "Property",
    "value": "用于工位现场快速测量工件长度、外径、内径、深度"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 4
  },
  
  "partOf": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
  },
  
  "installPosition": {
    "type": "Property",
    "value": "侧墙产线-焊接区-03号工位-工具柜"
  },
  
  "vendor": {
    "type": "Property",
    "value": "三丰(Mitutoyo)"
  },
  
  "model": {
    "type": "Property",
    "value": "500-196-30"
  },
  
  "serialNumber": {
    "type": "Property",
    "value": "MIT-CAL-2024-005"
  },
  
  "qcToolCategory": {
    "type": "Property",
    "value": "MeasuringTool"
  },
  
  "measurementType": {
    "type": "Property",
    "value": "Dimensional"
  },
  
  "measurableModalities": {
    "type": "Property",
    "value": [
      "urn:ngsi-ld:Modality:Length",
      "urn:ngsi-ld:Modality:Diameter",
      "urn:ngsi-ld:Modality:Depth"
    ]
  },
  
  "measurementRange": {
    "type": "Property",
    "value": {
      "min": 0,
      "max": 300,
      "unit": "mm"
    }
  },
  
  "accuracy": {
    "type": "Property",
    "value": {
      "value": 0.02,
      "unit": "mm",
      "standard": "GB/T 21389-2008"
    }
  },
  
  "resolution": {
    "type": "Property",
    "value": {
      "value": 0.01,
      "unit": "mm"
    }
  },
  
  "calibrationRequirement": {
    "type": "Property",
    "value": {
      "required": true,
      "interval": 180,
      "standard": "JJG 30-2012",
      "authority": "企业内部计量室"
    }
  },
  
  "calibrationStatus": {
    "type": "Property",
    "value": {
      "status": "Valid",
      "lastCalibrationDate": "2024-08-15",
      "nextCalibrationDue": "2025-02-15",
      "certificateNumber": "CAL-INNER-2024-08-005",
      "calibratedBy": "计量室"
    }
  },
  
  "msaStatus": {
    "type": "Property",
    "value": {
      "status": "NotApplicable"
    }
  },
  
  "compatibleProcCodes": {
    "type": "Property",
    "value": [
      "PROC-WELD-01",
      "PROC-WELD-02",
      "PROC-ASSEMBLE-01"
    ]
  },
  
  "measurementMode": {
    "type": "Property",
    "value": "Manual"
  },
  
  "operatingEnvironment": {
    "type": "Property",
    "value": {
      "temperatureRange": {
        "min": 0,
        "max": 40,
        "unit": "°C"
      },
      "vibrationLevel": "NotSensitive"
    }
  },
  
  "dataOutputFormat": {
    "type": "Property",
    "value": {
      "formats": ["Digital", "Manual"],
      "dataStructure": "LCD显示,可通过USB导出"
    }
  },
  
  "storageRequirement": {
    "type": "Property",
    "value": {
      "temperatureRange": {
        "min": -10,
        "max": 50,
        "unit": "°C"
      },
      "specialRequirements": [
        "保持干燥",
        "避免碰撞",
        "定期涂防锈油"
      ]
    }
  },
  
  "usageRestrictions": {
    "type": "Property",
    "value": {
      "requiresCertification": false,
      "requiredSkills": [
        "Skill.QC.BasicMeasurement"
      ],
      "safetyRequirements": [
        "轻拿轻放",
        "测量前清洁工件表面"
      ]
    }
  },
  
  "maintenanceSchedule": {
    "type": "Property",
    "value": {
      "routineInterval": 30,
      "maintenanceItems": [
        {
          "item": "清洁擦拭,涂防锈油",
          "frequency": "每月",
          "responsible": "操作员"
        }
      ]
    }
  },
  
  "documentReferences": {
    "type": "Property",
    "value": {
      "operatingManual": "file://docs/Mitutoyo-Digital-Caliper-Manual.pdf",
      "calibrationProcedure": "file://qms/calibration/CALIPER-CAL-PROC.pdf",
      "sopCodes": ["SOP-QC-020"]
    }
  },
  
  "capabilities": {
    "type": "Property",
    "value": [
      "CAP.Measure.Length",
      "CAP.Measure.Diameter",
      "CAP.Measure.Depth",
      "CAP.Measure.StepHeight"
    ]
  },
  
  "notes": {
    "type": "Property",
    "value": "工位常备测量工具,用于过程检验和首检"
  }
}
```

### 6.3 示例3: 视觉检测系统

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:QC_Tool:VISION-02",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "焊缝视觉检测系统-02"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "QC_Tool"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.2.3"
  },
  
  "functionDesc": {
    "type": "Property",
    "value": "自动检测焊缝外观质量,识别气孔、裂纹、未焊透等缺陷"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 3
  },
  
  "partOf": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-05"
  },
  
  "installPosition": {
    "type": "Property",
    "value": "侧墙产线-焊接区-05号工位-检测台"
  },
  
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [128.5, 82.0]
    }
  },
  
  "vendor": {
    "type": "Property",
    "value": "康耐视(Cognex)"
  },
  
  "model": {
    "type": "Property",
    "value": "In-Sight 9912"
  },
  
  "serialNumber": {
    "type": "Property",
    "value": "COGNEX-VIS-2024-002"
  },
  
  "qcToolCategory": {
    "type": "Property",
    "value": "VisionSystem"
  },
  
  "measurementType": {
    "type": "Property",
    "value": "Visual"
  },
  
  "measurableModalities": {
    "type": "Property",
    "value": [
      "urn:ngsi-ld:Modality:WeldDefect",
      "urn:ngsi-ld:Modality:WeldAppearance",
      "urn:ngsi-ld:Modality:SurfaceQuality"
    ]
  },
  
  "accuracy": {
    "type": "Property",
    "value": {
      "value": 95.5,
      "unit": "%",
      "standard": "缺陷识别准确率≥95%"
    }
  },
  
  "resolution": {
    "type": "Property",
    "value": {
      "value": 0.1,
      "unit": "mm"
    }
  },
  
  "calibrationRequirement": {
    "type": "Property",
    "value": {
      "required": false
    }
  },
  
  "calibrationStatus": {
    "type": "Property",
    "value": {
      "status": "NotRequired"
    }
  },
  
  "msaStatus": {
    "type": "Property",
    "value": {
      "status": "Pass",
      "grr": 12.5,
      "lastMSADate": "2024-09-01",
      "nextMSADue": "2025-09-01",
      "reportReference": "file://quality/msa/VISION-02-MSA-2024-Q3.pdf"
    }
  },
  
  "compatibleProcCodes": {
    "type": "Property",
    "value": [
      "PROC-WELD-QC",
      "PROC-FINAL-INSPECTION"
    ]
  },
  
  "compatibleWorkpieceTypes": {
    "type": "Property",
    "value": [
      "SideWall"
    ]
  },
  
  "measurementMode": {
    "type": "Property",
    "value": "FullyAutomatic"
  },
  
  "operatingEnvironment": {
    "type": "Property",
    "value": {
      "temperatureRange": {
        "min": 0,
        "max": 45,
        "unit": "°C"
      },
      "vibrationLevel": "Medium",
      "dustProtection": "IP67"
    }
  },
  
  "dataOutputFormat": {
    "type": "Property",
    "value": {
      "formats": ["Ethernet"],
      "protocol": "TCP/IP, REST API",
      "dataStructure": "JSON格式,包含缺陷类型、位置坐标、置信度、图像链接"
    }
  },
  
  "usageRestrictions": {
    "type": "Property",
    "value": {
      "requiresCertification": false,
      "requiredSkills": [],
      "safetyRequirements": [
        "确保光源正常工作",
        "避免强光直射镜头"
      ]
    }
  },
  
  "maintenanceSchedule": {
    "type": "Property",
    "value": {
      "routineInterval": 7,
      "majorInterval": 180,
      "maintenanceItems": [
        {
          "item": "清洁镜头和光源",
          "frequency": "每周",
          "responsible": "设备维护员"
        },
        {
          "item": "校验识别算法准确率",
          "frequency": "每月",
          "responsible": "视觉工程师"
        },
        {
          "item": "更新缺陷识别模型",
          "frequency": "每半年",
          "responsible": "算法工程师"
        }
      ]
    }
  },
  
  "documentReferences": {
    "type": "Property",
    "value": {
      "operatingManual": "file://docs/Cognex-InSight-9912-Manual.pdf",
      "msaGuideline": "file://qms/msa/Vision-MSA-Guideline.pdf",
      "sopCodes": ["SOP-QC-030", "SOP-VIS-001"]
    }
  },
  
  "supportedModalities": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:WeldDefect"
    }
  ],
  
  "modalityBindings": [
    {
      "type": "Property",
      "value": {
        "modalityId": "urn:ngsi-ld:Modality:WeldDefect",
        "pointRef": "http://192.168.10.80/api/v1/inspection/result",
        "bindingVersion": "V2.0",
        "changeId": "CHG-2024-VIS-003",
        "effectiveFrom": "2024-09-01T00:00:00Z"
      }
    }
  ],
  
  "capabilities": {
    "type": "Property",
    "value": [
      "CAP.Vision.DefectDetection",
      "CAP.Vision.Pattern Recognition",
      "CAP.AI.DeepLearning",
      "CAP.Report.AutoGenerate"
    ]
  },
  
  "specifications": {
    "type": "Property",
    "value": {
      "resolution": "12MP",
      "frame_rate": 30,
      "frame_rate_unit": "fps",
      "detection_speed": 1.5,
      "detection_speed_unit": "s/piece",
      "ai_model": "YOLOv8-Weld-Defect-V2.0",
      "supported_defects": [
        "气孔",
        "裂纹",
        "未焊透",
        "咬边",
        "焊瘤"
      ]
    }
  },
  
  "notes": {
    "type": "Property",
    "value": "2024年升级到AI深度学习模型,识别准确率显著提升"
  }
}
```

---

## 7. 常见问题FAQ

### Q1: QC_Tool与AutoEquipment有什么区别?

**A**: 

| 维度 | QC_Tool | AutoEquipment |
|------|---------|---------------|
| 主要功能 | **测量、检验、检测** | **加工、装配、处理** |
| 数据性质 | 产生**质量数据** | 产生**过程数据** |
| 管理重点 | **校准、MSA** | 性能、效率 |
| 典型对象 | 卡尺、三坐标、视觉系统 | 焊机、机器人、压机 |

**关键判断**: 如果对象的主要作用是"评价产品质量"而非"改变产品状态",应归为QC_Tool。

---

### Q2: 在线检测传感器应该建模为QC_Tool吗?

**A**: **不应该**。遵循核心元模型的**A4公理:传感器边界**:

- ✅ 独立的检测设备(如三坐标、拉力机) → QC_Tool
- ❌ 集成在生产设备上的传感器 → Modality + ModalityBinding

**原因**:
1. 传感器是数据采集手段,不是独立资源
2. 通过Modality建模更符合数据契约思想
3. 避免TwinObject数量爆炸

**例外**: 如果是可移动、独立管理的便携式检测设备,可以建模为QC_Tool。

---

### Q3: 如何处理一个工具支持多种测量类型?

**A**: 使用组合方式:

1. `measurementType`: 选择**主要**类型
2. `measurableModalities`: 列出**所有**能测的模态
3. `capabilities`: 补充能力标签

**示例**: 三坐标测量机
```json
{
  "measurementType": {"value": "Dimensional"},  // 主要类型
  "measurableModalities": [
    "urn:ngsi-ld:Modality:Length",      // 尺寸测量
    "urn:ngsi-ld:Modality:Flatness",    // 几何测量
    "urn:ngsi-ld:Modality:Roughness"    // 表面测量
  ],
  "capabilities": [
    "CAP.Measure.Dimensional",
    "CAP.Measure.Geometric",
    "CAP.Measure.Surface"
  ]
}
```

---

### Q4: 校准过期了但还在使用怎么办?

**A**: **严格禁止**。系统应自动阻断:

```javascript
// 数据采集时验证
if (calibrationStatus.status === "Expired") {
  // 1. 拒绝采集
  throw new Error("工具校准过期,禁止采集数据");
  
  // 2. 已采集数据标记为无效
  modalData.qualityTag = "CalFail";
  
  // 3. 触发告警
  sendAlert({
    level: "CRITICAL",
    message: `工具${qcTool.id}校准过期,已阻断数据采集`
  });
  
  // 4. 锁定工具状态
  qcTool.stateAttr.push({
    name: "locked_reason",
    value: "calibration_expired"
  });
}
```

**应急处理**:
1. 立即停用工具
2. 联系计量管理员安排紧急校准
3. 追溯期间采集的数据,标记为可疑
4. 校准通过后解锁并恢复使用

---

### Q5: MSA和校准有什么区别?

**A**: 

| 维度 | 校准 (Calibration) | MSA (测量系统分析) |
|------|-------------------|-------------------|
| 目的 | 确定测量值的**准确性** | 评估测量系统的**可靠性** |
| 评价对象 | **工具本身** | **整个测量系统**(工具+人+方法+环境) |
| 评价指标 | 精度、误差 | GR&R、偏倚、线性、稳定性 |
| 执行方 | 第三方计量机构 | 企业质量部门 |
| 周期 | 通常较长(半年/1年) | 通常较短(季度/半年) |
| 证明 | 校准证书 | MSA报告 |

**关系**: 
- 校准是MSA的**前提**(工具必须先校准合格)
- MSA是对校准合格工具的**进一步验证**
- 两者都不合格,工具不可用

---

### Q6: 如何管理共享工具(多工位使用)?

**A**: 两种策略:

**策略1: 固定归属,临时借用**
```json
{
  "id": "urn:ngsi-ld:TwinObject:QC_Tool:CALIPER-001",
  "installPosition": "工具室-A柜-3层",  // 固定存放位置
  "partOf": "urn:ngsi-ld:TwinObject:BufferZone:TOOL-ROOM",
  
  "stateAttr": [
    {
      "name": "current_borrower",
      "value": "urn:ngsi-ld:TwinObject:Person:EMP-001"
    },
    {
      "name": "borrowed_at",
      "value": "2024-10-17T08:30:00Z"
    },
    {
      "name": "expected_return",
      "value": "2024-10-17T12:00:00Z"
    }
  ]
}
```

**策略2: 流动归属,状态追踪**
```json
{
  "installPosition": "当前位置动态更新",
  "stateAttr": [
    {
      "name": "current_location",
      "value": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
    },
    {
      "name": "usage_history",
      "value": [
        {"station": "ST-GZ-01", "from": "08:00", "to": "09:30"},
        {"station": "ST-GZ-03", "from": "09:45", "to": "current"}
      ]
    }
  ]
}
```

**建议**: 
- 高价值工具(如三坐标) → 策略1
- 通用工具(如卡尺) → 策略2或每工位配备

---

### Q7: 视觉检测系统需要校准吗?

**A**: **视情况而定**:

**不需要传统校准** (calibrationRequirement.required = false):
- 原因: 没有物理刻度,无法用标准件校准
- 替代: 通过**MSA验证**和**模型验证**

**需要其他形式验证**:
1. **MSA**: 用已知缺陷样本验证识别准确率
2. **模型验证**: 定期用测试集评估AI模型性能
3. **基准件验证**: 用标准缺陷样本进行周期性验证

**示例配置**:
```json
{
  "calibrationRequirement": {
    "required": false
  },
  "calibrationStatus": {
    "status": "NotRequired"
  },
  "msaStatus": {
    "status": "Pass",
    "grr": 12.5,  // 视觉系统的GR&R评估方法不同
    "lastMSADate": "2024-09-01",
    ...
  },
  "maintenanceSchedule": {
    "maintenanceItems": [
      {
        "item": "基准件验证",
        "frequency": "每月",
        "responsible": "视觉工程师"
      },
      {
        "item": "AI模型性能评估",
        "frequency": "每季度",
        "responsible": "算法工程师"
      }
    ]
  }
}
```

---

### Q8: 如何处理工具报废?

**A**: **不要删除**TwinObject,而是更新状态:

```json
{
  "stateAttr": [
    {
      "name": "lifecycle_status",
      "value": "Retired"
    },
    {
      "name": "retired_date",
      "value": "2024-10-17"
    },
    {
      "name": "retire_reason",
      "value": "精度下降无法修复"
    }
  ],
  
  "calibrationStatus": {
    "status": "Expired"  // 保持过期状态
  },
  
  "replacedBy": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:QC_Tool:CMM-02"
  }
}
```

**原因**: 保留历史记录,历史数据仍关联旧工具ID,实现可追溯。

---

### Q9: measurableModalities与supportedModalities有什么区别?

**A**: 

| 字段 | 所属 | 说明 | 示例 |
|------|------|------|------|
| `supportedModalities` | 核心字段(L6) | 通用的模态支持声明 | 机器人也可以有 |
| `measurableModalities` | QC_Tool特有 | 明确的测量能力清单 | 只用于QC_Tool |

**关系**: 
- QC_Tool应**同时填写**两个字段
- `measurableModalities`是`supportedModalities`的**具体化**
- 两者内容应**一致**

**建议实践**:
```json
{
  "measurableModalities": {  // QC_Tool特有,必填
    "type": "Property",
    "value": [
      "urn:ngsi-ld:Modality:Length",
      "urn:ngsi-ld:Modality:Width"
    ]
  },
  
  "supportedModalities": [  // 核心字段,可选
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:Length"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:Width"
    }
  ]
}
```

---

### Q10: 如何实现自动校准预警?

**A**: 通过定时任务+事件驱动:

```javascript
// 定时任务(每日运行)
async function checkCalibrationDue() {
  const tools = await db.query({
    type: "TwinObject",
    subType: "QC_Tool",
    "calibrationRequirement.required": true,
    "calibrationStatus.status": "Valid"
  });
  
  const today = new Date();
  
  for (const tool of tools) {
    const dueDate = new Date(tool.calibrationStatus.nextCalibrationDue);
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    // 30天预警
    if (daysRemaining === 30) {
      sendNotification({
        level: "WARNING",
        recipient: "计量管理员",
        message: `工具${tool.name}校准将在30天后到期,请安排校准`
      });
    }
    
    // 7天紧急预警
    if (daysRemaining === 7) {
      sendNotification({
        level: "URGENT",
        recipient: ["计量管理员", "质量经理"],
        message: `工具${tool.name}校准将在7天后到期,请立即安排校准!`
      });
    }
    
    // 到期当天自动锁定
    if (daysRemaining <= 0) {
      await db.update(tool.id, {
        "calibrationStatus.status": "Expired",
        "stateAttr": [
          ...tool.stateAttr,
          {
            "name": "auto_locked",
            "value": true,
            "timestamp": today.toISOString()
          }
        ]
      });
      
      sendAlert({
        level: "CRITICAL",
        message: `工具${tool.name}校准已过期,已自动锁定禁止使用!`
      });
    }
  }
}
```

---

## 8. 附录

### 8.1 字段总览表

| 字段名 | 类型 | 必填性 | 说明 |
|--------|------|--------|------|
| **分类与能力** |
| `qcToolCategory` | Property | 必填 | 质检工具类别 |
| `measurementType` | Property | 必填 | 测量类型 |
| `measurableModalities` | Property(Array) | 必填 | 可测量模态清单 |
| **测量性能** |
| `measurementRange` | Property(Object) | 建议必填 | 测量范围 |
| `accuracy` | Property(Object) | 建议必填 | 测量精度 |
| `resolution` | Property(Object) | 可选 | 分辨率 |
| `repeatability` | Property(Object) | 可选 | 重复性精度 |
| **校准管理** |
| `calibrationRequirement` | Property(Object) | 建议必填 | 校准要求 |
| `calibrationStatus` | Property(Object) | 条件必填 | 当前校准状态 |
| **MSA管理** |
| `msaStatus` | Property(Object) | 建议必填 | MSA状态 |
| **适用性** |
| `compatibleProcCodes` | Property(Array) | 可选 | 适用工序 |
| `compatibleWorkpieceTypes` | Property(Array) | 可选 | 适用工件类型 |
| `measurementMode` | Property | 可选 | 测量模式 |
| `usageRestrictions` | Property(Object) | 可选 | 使用限制 |
| **环境与维护** |
| `operatingEnvironment` | Property(Object) | 可选 | 使用环境要求 |
| `storageRequirement` | Property(Object) | 可选 | 存储条件 |
| `maintenanceSchedule` | Property(Object) | 可选 | 维护保养计划 |
| **接口与文档** |
| `dataOutputFormat` | Property(Object) | 可选 | 数据输出格式 |
| `documentReferences` | Property(Object) | 可选 | 文档引用 |

### 8.2 与核心元模型的集成

```
TwinObject Core (L0-L8)
    ↓
QC_Tool Extension
    ├─ 继承所有核心字段
    ├─ subType固定为"QC_Tool"
    ├─ twinType固定为"Constituent"
    ├─ functionCategory建议"F1.2.3"
    └─ 新增本文档定义的所有特有字段
```

### 8.3 相关标准索引

| 标准 | 名称 | 适用范围 |
|------|------|----------|
| ISO 10012 | 测量管理体系 | 校准体系 |
| ISO/IEC 17025 | 校准和检测实验室能力 | 校准机构资质 |
| MSA手册第4版 | 测量系统分析 | MSA方法 |
| GB/T 21389 | 游标卡尺 | 卡尺规范 |
| JJG 30 | 通用卡尺检定规程 | 卡尺校准 |
| ISO 10360-2 | 坐标测量机验收检测 | 三坐标校准 |

### 8.4 术语表

| 术语 | 英文 | 说明 |
|------|------|------|
| 校准 | Calibration | 确定测量值准确性的过程 |
| MSA | Measurement System Analysis | 测量系统分析 |
| GR&R | Gage Repeatability & Reproducibility | 量具重复性与再现性 |
| 精度 | Accuracy | 测量值接近真值的程度 |
| 分辨率 | Resolution | 能分辨的最小刻度 |
| 重复性 | Repeatability | 同一条件下重复测量的一致性 |
| 再现性 | Reproducibility | 不同操作员测量的一致性 |

### 8.5 变更日志

| 版本 | 日期 | 变更内容 | 责任人 |
|------|------|----------|--------|
| V1.0 | 2025-10-17 | 初始版本发布 | QC_Tool建模组 |

---

## 结语

本文档定义了QC_Tool子类型的完整特有字段规范,强调**测量可信、可追溯、可控制**的核心理念。通过严格的校准和MSA管理机制,确保质量数据的可靠性,为数字孪生系统的质量闭环提供坚实基础。

**核心要点回顾**:
1. **强制校准管理**: 校准状态直接影响数据采集
2. **MSA验证**: 评估整个测量系统的可靠性
3. **模态能力声明**: 明确工具能测什么
4. **自动化控制**: 到期自动锁定,阻断不合格工具使用

**后续工作**:
- [ ] 建立校准预警自动化流程
- [ ] 开发MSA分析工具集
- [ ] 完善视觉检测系统的验证方法
- [ ] 编写操作培训材料

---

**文档版本**: V1.0  
**发布日期**: 2025-10-17  
**维护部门**: 质量管理部 & 数字孪生架构组  
**联系方式**: quality-metrology@example.com

---

**版权声明**: 本文档为内部技术规范,未经授权不得外传。