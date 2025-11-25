# TwinObject Product子类型特有字段设计说明

## 版本: V1.0 | 发布日期: 2025-10-19

---

## 文档摘要

本文档是TwinObject统一元模型中**Product(产品/成品)**子类型的特有字段扩展规范。Product代表已完成生产流程的成品对象,是流转性(Transitional)孪生对象的重要类别。本规范定义了Product对象在核心字段基础上的专有属性,涵盖产品分类、质量管理、工艺追溯、包装发运、质保认证等全生命周期信息。

**适用对象**: 产品工程师、质量工程师、数据建模工程师  
**前置文档**: `twinobject_core_guide.md`, `twinobject_core_schema.json`  
**配套文件**: `twinobject_product.schema.json`

---

## 目录

1. [设计理念](#1-设计理念)
2. [Product对象定位](#2-product对象定位)
3. [特有字段详解](#3-特有字段详解)
4. [字段分层架构](#4-字段分层架构)
5. [建模约束与规则](#5-建模约束与规则)
6. [典型场景应用](#6-典型场景应用)
7. [完整示例](#7-完整示例)
8. [与Workpiece的区别](#8-与workpiece的区别)
9. [常见问题FAQ](#9-常见问题faq)
10. [附录](#10-附录)

---

## 1. 设计理念

### 1.1 核心设计原则

Product子类型特有字段设计遵循以下原则:

1. **全生命周期覆盖**
   - 从生产完工到质检、包装、发运、质保的完整链路
   - 记录产品从"下线"到"交付"的全过程

2. **质量可追溯**
   - 完整的检验记录和质量状态跟踪
   - 支持缺陷分析和返工历史管理
   - 关键物料谱系追溯

3. **契合业务流程**
   - 字段设计与实际业务流程(质检→包装→发运)对齐
   - 支持多次检验、返工等真实场景

4. **合规与认证**
   - 支持产品认证、质保文档等合规要求
   - 附带文档管理

### 1.2 与核心模型的关系

Product对象**继承**TwinObject核心模型的所有字段,并在此基础上扩展。关键继承字段包括:

| 核心字段 | Product中的使用 |
|---------|----------------|
| `twinType` | 固定为`"Transitional"` |
| `subType` | 固定为`"Product"` |
| `locatedIn` | 指向当前所在位置(仓库/发运区等) |
| `basedOnMBOM` | 关联产品的制造BOM |
| `mbomItemId` | MBOM中的产品项ID |
| `serialNumber` | 产品序列号 |
| `functionCategory` | 建议使用`F2.3.2`(最终产品) |

---

## 2. Product对象定位

### 2.1 什么是Product?

**Product(产品/成品)**是指已完成所有或大部分制造工序、达到可交付状态的产出物。

**典型特征**:
- ✅ 已通过最终质检(或至少完成主要工序)
- ✅ 具有明确的质量状态(合格/不合格/返工等)
- ✅ 可能已包装、待发运或已发运
- ✅ 有完整的工艺履历和检验记录

### 2.2 Product的业务生命周期

```
生产完工 → 质量检验 → [返工循环] → 合格判定 → 包装 → 发运 → 交付客户 → 质保期
    ↓          ↓                        ↓       ↓
  完工日期   检验记录              包装信息  发运信息
```

### 2.3 Product vs Workpiece vs Material

| 维度 | Material(原料) | Workpiece(在制品) | Product(成品) |
|------|---------------|------------------|--------------|
| 定义 | 未加工的原材料/采购件 | 加工过程中的半成品 | 完成品/可交付产品 |
| 工艺状态 | 待投产 | 加工中 | 已完工 |
| 质量状态 | 来料检验 | 过程检验 | 最终检验 |
| 位置特征 | 原料仓库/待料区 | 工位/缓存区流转 | 成品仓库/发运区 |
| 关键属性 | 来料批次、供应商 | 当前工序、完成进度 | 质量等级、包装发运 |
| `functionCategory` | `F2.1.x` | `F2.2.x` | `F2.3.x` |

---

## 3. 特有字段详解

### 3.1 产品基本信息层

#### `productType` (必填)
- **类型**: Property
- **值枚举**: `"FinalProduct"` | `"SemiFinished"` | `"Assembly"` | `"Component"`
- **说明**: 产品类型细分
  - **FinalProduct**: 最终产品,可直接交付客户
  - **SemiFinished**: 半成品,需进一步加工但已可独立管理
  - **Assembly**: 总成,由多个组件装配而成
  - **Component**: 单一组件/零件
- **示例**:
```json
"productType": {
  "type": "Property",
  "value": "FinalProduct"
}
```

#### `productModel` (必填)
- **类型**: Property
- **值类型**: String
- **说明**: 产品型号,唯一标识产品类型
- **约束**: 应与MBOM中的产品型号一致
- **示例**: `"SideWall-V2.0"`, `"Chassis-Model-A"`

#### `productVersion` (可选)
- **类型**: Property
- **值类型**: String
- **说明**: 产品设计版本号
- **用途**: 
  - 追溯设计变更
  - 区分不同版本的同型号产品
- **示例**: `"V1.2"`, `"2024Q3-Rev02"`

#### `batchNumber` (建议必填)
- **类型**: Property
- **值类型**: String
- **说明**: 生产批次号
- **用途**: 
  - 批次质量管理
  - 批量召回追溯
- **命名规则建议**: `{产品代码}-{年月日}-{批次序号}`
- **示例**: `"SW-20250115-B001"`

#### `productionDate` (建议必填)
- **类型**: Property
- **值类型**: String (ISO 8601 Date格式)
- **说明**: 生产日期(通常指投产日期)
- **示例**: `"2025-01-15"`

#### `completionDate` (建议必填)
- **类型**: Property
- **值类型**: String (ISO 8601 DateTime格式)
- **说明**: 完工时间戳
- **语义**: 产品完成最后一道工序的时间
- **示例**: `"2025-01-16T14:30:00Z"`

---

### 3.2 质量管理层

#### `qualityStatus` (必填)
- **类型**: Property
- **值枚举**: `"Qualified"` | `"UnderInspection"` | `"Rework"` | `"Scrapped"` | `"Quarantine"`
- **说明**: 当前质量状态
  - **Qualified**: 合格,可放行
  - **UnderInspection**: 检验中
  - **Rework**: 需要返工
  - **Scrapped**: 报废
  - **Quarantine**: 隔离待处理
- **状态流转**:
```
UnderInspection → Qualified (检验通过)
                → Rework (需返工)
                → Scrapped (直接报废)
                → Quarantine (需隔离观察)

Rework → UnderInspection (返工后重新检验)
```

#### `qualityGrade` (可选)
- **类型**: Property
- **值枚举**: `"A"` | `"B"` | `"C"` | `"NG"`
- **说明**: 质量等级分类
  - **A级**: 优等品
  - **B级**: 合格品(有轻微瑕疵)
  - **C级**: 勉强合格
  - **NG**: 不合格品
- **用途**: 
  - 差异化定价
  - 客户分级配送

#### `inspectionRecords` (建议必填)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  inspectionId: string,           // 检验单号
  inspectionType: enum,           // 检验类型
  inspectorId: string,            // 检验员ID
  inspectionTime: datetime,       // 检验时间
  result: enum,                   // 检验结果
  defects?: Array<{               // 缺陷列表
    defectCode: string,
    defectDesc: string,
    severity: enum                // 严重程度
  }>,
  remarks?: string                // 备注
}
```
- **检验类型枚举**:
  - `FirstArticle`: 首件检验
  - `ProcessInspection`: 过程检验
  - `FinalInspection`: 最终检验
  - `RandomSampling`: 抽检
- **检验结果枚举**:
  - `Pass`: 通过
  - `Fail`: 不通过
  - `ConditionalPass`: 有条件通过
- **示例**:
```json
"inspectionRecords": {
  "type": "Property",
  "value": [
    {
      "inspectionId": "INS-20250116-001",
      "inspectionType": "FinalInspection",
      "inspectorId": "EMP-QC-01",
      "inspectionTime": "2025-01-16T15:00:00Z",
      "result": "Pass",
      "defects": [],
      "remarks": "外观良好,尺寸合格"
    }
  ]
}
```

#### `reworkHistory` (可选)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  reworkId: string,              // 返工单号
  reworkReason: string,          // 返工原因
  reworkDate: datetime,          // 返工日期
  originalDefect: string,        // 原始缺陷描述
  reworkProcCode: string,        // 返工工序代码
  reworkOperator: string,        // 返工操作员
  reworkResult: enum             // 返工结果
}
```
- **返工结果枚举**: `"Success"` | `"Failed"`
- **用途**: 
  - 返工成本统计
  - 质量问题追溯
  - 返工效果分析

---

### 3.3 工艺履历层

#### `processRoute` (建议必填)
- **类型**: Property (Array)
- **说明**: 产品已完成的工艺路线实际履历
- **元素结构**:
```typescript
{
  stepSeq: number,              // 工步序号
  procCode: string,             // 工序代码
  stationCode: string,          // 执行工位
  startTime: datetime,          // 开始时间
  endTime?: datetime,           // 结束时间
  operatorId: string,           // 操作员ID
  sceneId: string               // 关联场景ID
}
```
- **用途**:
  - 完整的工艺追溯
  - 工时统计
  - 异常工序定位
- **示例**:
```json
"processRoute": {
  "type": "Property",
  "value": [
    {
      "stepSeq": 1,
      "procCode": "PROC-CUT-01",
      "stationCode": "ST-CUT-01",
      "startTime": "2025-01-15T08:00:00Z",
      "endTime": "2025-01-15T08:45:00Z",
      "operatorId": "EMP-20250101",
      "sceneId": "urn:ngsi-ld:Scene:CUT-20250115-001"
    },
    {
      "stepSeq": 2,
      "procCode": "PROC-WELD-01",
      "stationCode": "ST-GZ-03",
      "startTime": "2025-01-15T09:00:00Z",
      "endTime": "2025-01-15T10:30:00Z",
      "operatorId": "EMP-20250102",
      "sceneId": "urn:ngsi-ld:Scene:WELD-20250115-002"
    }
  ]
}
```

---

### 3.4 包装与发运层

#### `packagingInfo` (建议必填)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  packageType: string,           // 包装类型
  packageDate: datetime,         // 包装日期
  packageOperator: string,       // 包装员
  containerCode: string,         // 包装容器编号
  grossWeight: number,           // 毛重(kg)
  netWeight: number,             // 净重(kg)
  dimensions: {                  // 包装尺寸
    length: number,
    width: number,
    height: number,
    unit: string                 // 默认"mm"
  }
}
```
- **示例**:
```json
"packagingInfo": {
  "type": "Property",
  "value": {
    "packageType": "木箱包装",
    "packageDate": "2025-01-16T16:00:00Z",
    "packageOperator": "EMP-PKG-01",
    "containerCode": "CTN-20250116-001",
    "grossWeight": 52.5,
    "netWeight": 48.0,
    "dimensions": {
      "length": 2000,
      "width": 1300,
      "height": 500,
      "unit": "mm"
    }
  }
}
```

#### `shippingInfo` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  shipmentId: string,            // 发运单号
  shipmentDate: datetime,        // 发运日期
  destination: string,           // 目的地
  carrier: string,               // 承运商
  trackingNumber: string,        // 物流单号
  deliveryStatus: enum           // 配送状态
}
```
- **配送状态枚举**: `"Pending"` | `"InTransit"` | `"Delivered"` | `"Returned"`
- **示例**:
```json
"shippingInfo": {
  "type": "Property",
  "value": {
    "shipmentId": "SHIP-20250117-001",
    "shipmentDate": "2025-01-17T08:00:00Z",
    "destination": "客户A工厂",
    "carrier": "XX物流",
    "trackingNumber": "SF1234567890",
    "deliveryStatus": "InTransit"
  }
}
```

---

### 3.5 质保与认证层

#### `warrantyInfo` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  warrantyPeriod: number,        // 质保期(月)
  warrantyStartDate: date,       // 质保起始日期
  warrantyEndDate: date,         // 质保结束日期
  warrantyTerms: string          // 质保条款
}
```
- **示例**:
```json
"warrantyInfo": {
  "type": "Property",
  "value": {
    "warrantyPeriod": 12,
    "warrantyStartDate": "2025-01-17",
    "warrantyEndDate": "2026-01-17",
    "warrantyTerms": "免费维修,不包含人为损坏"
  }
}
```

#### `certifications` (可选)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  certType: string,              // 认证类型
  certNumber: string,            // 认证编号
  certAuthority: string,         // 认证机构
  certDate: date,                // 认证日期
  expiryDate?: date              // 有效期
}
```
- **典型认证类型**: 
  - ISO质量认证
  - CE认证
  - 3C认证
  - 行业特定认证(如TS16949)
- **示例**:
```json
"certifications": {
  "type": "Property",
  "value": [
    {
      "certType": "ISO9001",
      "certNumber": "ISO-2025-001234",
      "certAuthority": "XX认证中心",
      "certDate": "2025-01-10",
      "expiryDate": "2028-01-10"
    }
  ]
}
```

#### `attachedDocuments` (可选)
- **类型**: Property (Array)
- **元素结构**:
```typescript
{
  docType: enum,                 // 文档类型
  docId: string,                 // 文档编号
  docUrl: string,                // 文档URL/路径
  issueDate: date                // 签发日期
}
```
- **文档类型枚举**:
  - `QualityCertificate`: 质量合格证
  - `TestReport`: 检测报告
  - `UserManual`: 使用手册
  - `Warranty`: 质保卡
  - `Other`: 其他

---

### 3.6 客户与追溯层

#### `customerInfo` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  customerId: string,            // 客户ID
  customerName: string,          // 客户名称
  orderNumber: string,           // 订单号
  contractNumber: string         // 合同号
}
```
- **用途**: 
  - 订单追溯
  - 客户服务
  - 销售统计

#### `traceabilityCode` (建议必填)
- **类型**: Property
- **值类型**: String
- **说明**: 产品追溯码,通常为二维码/条形码内容
- **格式建议**: 包含序列号、批次、生产日期等关键信息的编码串
- **示例**: `"TR-ZQ-20250116-00123-SW-V2.0"`

#### `genealogy` (建议必填)
- **类型**: Property (Array)
- **说明**: 产品谱系,记录关键组件/物料的来源追溯
- **元素结构**:
```typescript
{
  componentType: string,         // 组件类型
  componentSN: string,           // 组件序列号
  supplierBatch: string,         // 供应商批次
  usageTimestamp: datetime       // 使用时间
}
```
- **用途**:
  - 关键物料追溯
  - 质量问题定位到具体批次
  - 供应商质量管理
- **示例**:
```json
"genealogy": {
  "type": "Property",
  "value": [
    {
      "componentType": "焊丝",
      "componentSN": "WW-20250110-A001",
      "supplierBatch": "SUP-A-20250105",
      "usageTimestamp": "2025-01-15T09:15:00Z"
    },
    {
      "componentType": "钢板",
      "componentSN": "SP-20250108-B002",
      "supplierBatch": "SUP-B-20250103",
      "usageTimestamp": "2025-01-15T08:00:00Z"
    }
  ]
}
```

---

## 4. 字段分层架构

Product特有字段按功能分为**6个层级**:

```
L1: 产品基本信息
    ├─ productType (必填)
    ├─ productModel (必填)
    ├─ productVersion
    ├─ batchNumber
    ├─ productionDate
    └─ completionDate
    
L2: 质量管理
    ├─ qualityStatus (必填)
    ├─ qualityGrade
    ├─ inspectionRecords
    └─ reworkHistory
    
L3: 工艺履历
    └─ processRoute
    
L4: 包装与发运
    ├─ packagingInfo
    └─ shippingInfo
    
L5: 质保与认证
    ├─ warrantyInfo
    ├─ certifications
    └─ attachedDocuments
    
L6: 客户与追溯
    ├─ customerInfo
    ├─ traceabilityCode
    └─ genealogy
```

---

## 5. 建模约束与规则

### 5.1 必填字段约束

| 字段 | 必填性 | 约束说明 |
|------|--------|----------|
| `productType` | 必填 | 必须明确产品类型 |
| `productModel` | 必填 | 必须与MBOM一致 |
| `qualityStatus` | 必填 | 任何时刻都有明确质量状态 |
| `batchNumber` | 建议必填 | 用于批次管理 |
| `completionDate` | 建议必填 | 完工时间追溯 |
| `inspectionRecords` | 建议必填 | 至少有一条最终检验记录 |
| `processRoute` | 建议必填 | 完整工艺履历 |
| `traceabilityCode` | 建议必填 | 产品追溯 |
| `genealogy` | 建议必填 | 关键物料追溯 |

### 5.2 条件约束规则

| 规则ID | 条件 | 约束 |
|--------|------|------|
| R1 | `qualityStatus="Qualified"` | 必须至少有一条`result="Pass"`的检验记录 |
| R2 | `reworkHistory`非空 | 至少有一条`result="Fail"`或`"ConditionalPass"`的检验记录 |
| R3 | `shippingInfo`存在 | `qualityStatus`必须为`"Qualified"` |
| R4 | `productType="FinalProduct"` | 建议有`packagingInfo`和`traceabilityCode` |

### 5.3 状态流转规则

**qualityStatus状态机**:
```
[初始] → UnderInspection
         ↓
    Qualified ←→ Rework (返工后可再次合格)
         ↓
    Quarantine → Scrapped (隔离后可能报废)
```

**合法状态转换矩阵**:
| 当前状态 | 可转换到 |
|---------|---------|
| UnderInspection | Qualified, Rework, Scrapped, Quarantine |
| Qualified | - (终态,除非后续发现问题转Quarantine) |
| Rework | UnderInspection |
| Quarantine | Scrapped, Rework |
| Scrapped | - (终态) |

---

## 6. 典型场景应用

### 6.1 场景1: 成品下线质检

**业务流程**:
1. 产品完成最后工序 → 创建Product实例
2. 送检 → `qualityStatus="UnderInspection"`
3. 检验完成 → 添加`inspectionRecords`
4. 判定合格 → `qualityStatus="Qualified"`

**关键字段更新**:
```json
{
  "completionDate": {"value": "2025-01-16T14:30:00Z"},
  "qualityStatus": {"value": "UnderInspection"},
  "inspectionRecords": {"value": [
    {
      "inspectionId": "INS-001",
      "inspectionType": "FinalInspection",
      "result": "Pass",
      ...
    }
  ]},
  "qualityStatus": {"value": "Qualified"}  // 最终更新
}
```

### 6.2 场景2: 不合格品返工

**业务流程**:
1. 检验发现缺陷 → `qualityStatus="Rework"`, 记录缺陷
2. 执行返工 → 添加`reworkHistory`
3. 返工完成 → `qualityStatus="UnderInspection"`
4. 复检通过 → `qualityStatus="Qualified"`

**关键字段**:
```json
{
  "inspectionRecords": {"value": [
    {
      "inspectionId": "INS-001",
      "result": "Fail",
      "defects": [
        {
          "defectCode": "WELD-CRACK",
          "defectDesc": "焊缝裂纹",
          "severity": "Major"
        }
      ]
    }
  ]},
  "qualityStatus": {"value": "Rework"},
  "reworkHistory": {"value": [
    {
      "reworkId": "RW-001",
      "reworkReason": "焊缝裂纹",
      "reworkProcCode": "PROC-REWELD-01",
      "reworkResult": "Success"
    }
  ]},
  "qualityStatus": {"value": "Qualified"}  // 复检后
}
```

### 6.3 场景3: 产品包装发运

**业务流程**:
1. 合格产品 → 包装
2. 包装完成 → 填写`packagingInfo`
3. 发运 → 填写`shippingInfo`
4. 客户签收 → 更新`deliveryStatus="Delivered"`

**关键字段**:
```json
{
  "packagingInfo": {
    "value": {
      "packageDate": "2025-01-16T16:00:00Z",
      "containerCode": "CTN-001",
      ...
    }
  },
  "shippingInfo": {
    "value": {
      "shipmentId": "SHIP-001",
      "shipmentDate": "2025-01-17T08:00:00Z",
      "deliveryStatus": "Delivered"
    }
  }
}
```

---

## 7. 完整示例

### 示例1: 侧墙成品

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:Product:ZQ-2025-00123",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "侧墙成品-ZQ-2025-00123"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Transitional"
  },
  
  "subType": {
    "type": "Property",
    "value": "Product"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F2.3.2"
  },
  
  "locatedIn": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:BufferZone:WAREHOUSE-FG"
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
    "value": "ZQ-2025-00123"
  },
  
  "productType": {
    "type": "Property",
    "value": "FinalProduct"
  },
  
  "productModel": {
    "type": "Property",
    "value": "SideWall-V2.0"
  },
  
  "productVersion": {
    "type": "Property",
    "value": "V2.0"
  },
  
  "batchNumber": {
    "type": "Property",
    "value": "SW-20250115-B001"
  },
  
  "productionDate": {
    "type": "Property",
    "value": "2025-01-15"
  },
  
  "completionDate": {
    "type": "Property",
    "value": "2025-01-16T14:30:00Z"
  },
  
  "qualityStatus": {
    "type": "Property",
    "value": "Qualified"
  },
  
  "qualityGrade": {
    "type": "Property",
    "value": "A"
  },
  
  "inspectionRecords": {
    "type": "Property",
    "value": [
      {
        "inspectionId": "INS-20250116-001",
        "inspectionType": "FinalInspection",
        "inspectorId": "EMP-QC-01",
        "inspectionTime": "2025-01-16T15:00:00Z",
        "result": "Pass",
        "defects": [],
        "remarks": "外观良好,尺寸合格,焊缝质量优秀"
      }
    ]
  },
  
  "processRoute": {
    "type": "Property",
    "value": [
      {
        "stepSeq": 1,
        "procCode": "PROC-CUT-01",
        "stationCode": "ST-CUT-01",
        "startTime": "2025-01-15T08:00:00Z",
        "endTime": "2025-01-15T08:45:00Z",
        "operatorId": "EMP-20250101",
        "sceneId": "urn:ngsi-ld:Scene:CUT-20250115-001"
      },
      {
        "stepSeq": 2,
        "procCode": "PROC-WELD-FRONT",
        "stationCode": "ST-GZ-03",
        "startTime": "2025-01-15T09:00:00Z",
        "endTime": "2025-01-15T10:30:00Z",
        "operatorId": "EMP-20250102",
        "sceneId": "urn:ngsi-ld:Scene:WELD-20250115-002"
      },
      {
        "stepSeq": 3,
        "procCode": "PROC-WELD-BACK",
        "stationCode": "ST-GZ-04",
        "startTime": "2025-01-15T11:00:00Z",
        "endTime": "2025-01-15T12:30:00Z",
        "operatorId": "EMP-20250102",
        "sceneId": "urn:ngsi-ld:Scene:WELD-20250115-003"
      },
      {
        "stepSeq": 4,
        "procCode": "PROC-POLISH",
        "stationCode": "ST-POLISH-01",
        "startTime": "2025-01-16T08:00:00Z",
        "endTime": "2025-01-16T09:30:00Z",
        "operatorId": "EMP-20250103",
        "sceneId": "urn:ngsi-ld:Scene:POLISH-20250116-001"
      }
    ]
  },
  
  "packagingInfo": {
    "type": "Property",
    "value": {
      "packageType": "木箱包装",
      "packageDate": "2025-01-16T16:00:00Z",
      "packageOperator": "EMP-PKG-01",
      "containerCode": "CTN-20250116-001",
      "grossWeight": 52.5,
      "netWeight": 48.0,
      "dimensions": {
        "length": 2000,
        "width": 1300,
        "height": 500,
        "unit": "mm"
      }
    }
  },
  
  "shippingInfo": {
    "type": "Property",
    "value": {
      "shipmentId": "SHIP-20250117-001",
      "shipmentDate": "2025-01-17T08:00:00Z",
      "destination": "客户A总装车间",
      "carrier": "XX物流",
      "trackingNumber": "SF1234567890",
      "deliveryStatus": "InTransit"
    }
  },
  
  "customerInfo": {
    "type": "Property",
    "value": {
      "customerId": "CUST-A-001",
      "customerName": "A汽车制造有限公司",
      "orderNumber": "ORD-2025-0115-001",
      "contractNumber": "CNT-2024-001"
    }
  },
  
  "traceabilityCode": {
    "type": "Property",
    "value": "TR-ZQ-20250116-00123-SW-V2.0"
  },
  
  "genealogy": {
    "type": "Property",
    "value": [
      {
        "componentType": "焊丝",
        "componentSN": "WW-20250110-A001",
        "supplierBatch": "SUP-A-20250105",
        "usageTimestamp": "2025-01-15T09:15:00Z"
      },
      {
        "componentType": "钢板-外板",
        "componentSN": "SP-20250108-B002",
        "supplierBatch": "SUP-B-20250103",
        "usageTimestamp": "2025-01-15T08:00:00Z"
      },
      {
        "componentType": "钢板-内板",
        "componentSN": "SP-20250108-B003",
        "supplierBatch": "SUP-B-20250103",
        "usageTimestamp": "2025-01-15T08:00:00Z"
      }
    ]
  },
  
  "specifications": {
    "type": "Property",
    "value": {
      "length_mm": 1800,
      "width_mm": 1200,
      "thickness_mm": 3,
      "weight_kg": 48.0,
      "material": "Q235B"
    }
  },
  
  "notes": {
    "type": "Property",
    "value": "优质品,已发往客户A工厂"
  }
}
```

---

## 8. 与Workpiece的区别

### 核心差异对比

| 维度 | Workpiece(在制品) | Product(成品) |
|------|------------------|--------------|
| **定义** | 加工过程中的半成品 | 已完工的成品 |
| **质量状态** | `process_status`(加工中/待加工/已完成) | `qualityStatus`(合格/不合格/返工等) |
| **位置特征** | 在工位间流转 | 在成品库/发运区 |
| **关键属性** | `current_route_step`, `completion_rate` | `inspectionRecords`, `packagingInfo` |
| **业务流程** | 工序流转 → 工序执行 → 下一工序 | 质检 → 包装 → 发运 → 交付 |
| **生命周期** | 投产 → 完工(转为Product) | 下线 → 交付 → 质保期 |

### 转换关系

```
Workpiece (在制品)
    ↓ 完成最后工序
    ↓ completion_rate = 100%
    ↓
Product (成品)
    ↓ 创建时继承:
    - serialNumber
    - basedOnMBOM
    - mbomItemId
    - specifications
```

**转换时机**: 当Workpiece的`completion_rate`达到100%且通过最终工序验收时,系统可自动或手动创建对应的Product实例。

---

## 9. 常见问题FAQ

### Q1: Product何时创建?

**A**: 通常在以下时机创建Product实例:
1. **自动创建**: Workpiece完成最后工序时,系统自动转换为Product
2. **手动创建**: 质检环节人工创建Product并关联Workpiece历史
3. **直接创建**: 对于简单产品,可能直接创建Product而不经过Workpiece阶段

### Q2: qualityStatus和qualityGrade有什么区别?

**A**: 
- **qualityStatus**: 质量**状态**(过程性),表示产品当前处于质量管理的哪个阶段
- **qualityGrade**: 质量**等级**(结果性),表示最终的质量分级

例如: `qualityStatus="Qualified"` + `qualityGrade="B"` 表示"已合格,但属于B级品"

### Q3: inspectionRecords可以有多条吗?

**A**: **可以且应该**。典型场景:
- 首件检验 → 过程检验 → 最终检验
- 不合格 → 返工 → 复检

每次检验都应记录为独立的`inspectionRecords`条目。

### Q4: processRoute和Scene的关系?

**A**: 
- **processRoute**: Product中记录的**工艺履历**,是已完成工序的**摘要**
- **Scene**: 实际执行工序时的**详细场景记录**,包含完整的现场数据

关系: `processRoute[i].sceneId` → 引用对应的Scene实例,可通过Scene获取更详细的执行数据。

### Q5: 如何处理批量生产的Product?

**A**: 
- **方案1**(推荐): 每个产品一个Product实例,通过`batchNumber`关联
- **方案2**: 仅记录批次级Product,通过`serialNumber`列表管理个体

建议采用方案1,以支持单件追溯。批次级分析可通过查询相同`batchNumber`的Product集合实现。

### Q6: Product的locatedIn如何更新?

**A**: 随产品物理位置变化而更新:
- 下线后 → `locatedIn: "成品缓存区"`
- 包装后 → `locatedIn: "成品仓库"`
- 发运后 → `locatedIn: "发运区"` 或 `null`(已离厂)

### Q7: reworkHistory和inspectionRecords的关系?

**A**: 
- **inspectionRecords**: 记录**所有检验**,包括导致返工的检验
- **reworkHistory**: 记录**返工执行**,与触发它的检验记录通过时间戳或ID关联

关系: 检验发现问题 → 创建返工记录 → 返工完成 → 重新检验

---

## 10. 附录

### 10.1 字段总览表

| 层级 | 字段名 | 必填性 | 业务语义 |
|------|--------|--------|----------|
| **L1-产品基本信息** |
| | `productType` | 必填 | 产品类型细分 |
| | `productModel` | 必填 | 产品型号 |
| | `productVersion` | 可选 | 设计版本号 |
| | `batchNumber` | 建议必填 | 生产批次号 |
| | `productionDate` | 建议必填 | 生产日期 |
| | `completionDate` | 建议必填 | 完工时间戳 |
| **L2-质量管理** |
| | `qualityStatus` | 必填 | 当前质量状态 |
| | `qualityGrade` | 可选 | 质量等级 |
| | `inspectionRecords` | 建议必填 | 检验记录列表 |
| | `reworkHistory` | 可选 | 返工历史 |
| **L3-工艺履历** |
| | `processRoute` | 建议必填 | 已完成工艺路线 |
| **L4-包装与发运** |
| | `packagingInfo` | 建议必填 | 包装信息 |
| | `shippingInfo` | 可选 | 发运信息 |
| **L5-质保与认证** |
| | `warrantyInfo` | 可选 | 质保信息 |
| | `certifications` | 可选 | 产品认证 |
| | `attachedDocuments` | 可选 | 附带文档 |
| **L6-客户与追溯** |
| | `customerInfo` | 可选 | 客户信息 |
| | `traceabilityCode` | 建议必填 | 追溯码 |
| | `genealogy` | 建议必填 | 产品谱系 |

### 10.2 状态枚举值汇总

**qualityStatus**:
- `Qualified`: 合格
- `UnderInspection`: 检验中
- `Rework`: 需返工
- `Scrapped`: 报废
- `Quarantine`: 隔离

**qualityGrade**:
- `A`: 优等品
- `B`: 合格品
- `C`: 勉强合格
- `NG`: 不合格

**inspectionType**:
- `FirstArticle`: 首件检验
- `ProcessInspection`: 过程检验
- `FinalInspection`: 最终检验
- `RandomSampling`: 抽检

**inspectionResult**:
- `Pass`: 通过
- `Fail`: 不通过
- `ConditionalPass`: 有条件通过

**defectSeverity**:
- `Critical`: 致命缺陷
- `Major`: 严重缺陷
- `Minor`: 轻微缺陷

**deliveryStatus**:
- `Pending`: 待发运
- `InTransit`: 运输中
- `Delivered`: 已送达
- `Returned`: 退货

### 10.3 相关文档索引

| 文档 | 文件名 | 说明 |
|------|--------|------|
| 核心指南 | `twinobject_core_guide.md` | TwinObject统一元模型核心规范 |
| 核心Schema | `twinobject_core_schema.json` | 核心字段JSON Schema |
| Product Schema | `twinobject_product.schema.json` | Product特有字段Schema |
| Workpiece规范 | `twinobject_workpiece_guide.md` | 在制品特有字段规范(待编写) |
| MBOM规范 | `mbom_specification.md` | 制造BOM规范 |
| Scene规范 | `scene_specification.md` | 场景建模规范 |

### 10.4 变更日志

| 版本 | 日期 | 变更内容 | 责任人 |
|------|------|----------|--------|
| V1.0 | 2025-10-19 | 初始版本发布 | 数字孪生架构组 |

---

## 结语

本文档定义了Product(成品)子类型的完整特有字段规范,覆盖了产品从下线到交付的全生命周期管理需求。设计遵循TwinObject统一元模型的核心原则,在保持模型一致性的同时,充分支持制造业成品管理的实际业务场景。

**核心设计亮点**:
1. **全生命周期**: 质检→包装→发运→交付→质保
2. **质量追溯**: 完整的检验记录和返工历史
3. **物料谱系**: 关键组件来源追溯
4. **业务契合**: 字段设计贴合实际流程

**下一步工作**:
- [ ] 编写Workpiece子类型特有字段规范
- [ ] 编写Material子类型特有字段规范
- [ ] 开发Product实例自动生成工具
- [ ] 建立Product与Workpiece转换机制

---

**文档版本**: V1.0  
**发布日期**: 2025-10-19  
**维护部门**: 数字孪生架构组  
**联系方式**: digitaltwin-arch@example.com

---

**版权声明**: 本文档为内部技术规范,未经授权不得外传。