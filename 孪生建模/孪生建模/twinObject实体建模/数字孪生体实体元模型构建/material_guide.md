# TwinObject Material子类型特有字段设计说明

## 版本: V1.0 | 发布日期: 2025-10-19

---

## 文档摘要

本文档是TwinObject统一元模型中**Material(原料/物料)**子类型的特有字段扩展规范。Material代表生产所需的原材料、辅料、采购件等,是流转性(Transitional)孪生对象的重要类别。本规范的核心创新在于**统一处理外部采购和内部来源两种物料类型**,支持完整的供应链追溯和库存管理。

**适用对象**: 供应链管理人员、采购工程师、库存管理员、质量工程师  
**前置文档**: `twinobject_core_guide.md`, `twinobject_workpiece_guide.md`, `twinobject_product_guide.md`  
**配套文件**: `twinobject_material.schema.json`

---

## 目录

1. [设计理念](#1-设计理念)
2. [Material对象定位](#2-material对象定位)
3. [核心设计决策](#3-核心设计决策)
4. [特有字段详解](#4-特有字段详解)
5. [典型场景应用](#5-典型场景应用)
6. [完整示例](#6-完整示例)
7. [常见问题FAQ](#7-常见问题faq)
8. [附录](#8-附录)

---

## 1. 设计理念

### 1.1 核心设计原则

Material子类型特有字段设计遵循以下原则:

1. **双源统一**
   - 统一建模外部采购和内部来源两类物料
   - 通过`materialSourceType`清晰区分
   - 条件必填字段适配不同来源

2. **供应链追溯**
   - 外部物料:供应商→批次→来料检验
   - 内部物料:工序→Scene→Workpiece/Product
   - 完整的上下游追溯链

3. **库存导向**
   - 强化库存管理字段
   - 支持库存状态跟踪
   - 安全库存预警

4. **质量合规**
   - 来料检验记录
   - 质量证书管理
   - 危险品分类

### 1.2 Material的双重属性

**Material的两种来源**:

```
外部采购 (External)              内部生产 (Internal)
    ↓                               ↓
供应商发货                      上一工序输出
    ↓                               ↓
来料检验                        质量检验
    ↓                               ↓
入库 → Material实例 ← 入库
    ↓                               
投入生产使用
```

---

## 2. Material对象定位

### 2.1 什么是Material?

**Material(原料/物料)**是指用于生产加工、尚未投入或正在等待投入工序的物资对象。

**典型特征**:
- ✅ 待投产或投产中
- ✅ 有明确的库存位置和数量
- ✅ 可能来自外部采购或内部生产
- ✅ 需要质量检验

### 2.2 Material vs Workpiece vs Product

| 维度 | Material | Workpiece | Product |
|------|----------|-----------|---------|
| 定义 | 待投产物料 | 加工中半成品 | 完成品 |
| 来源 | 采购/内部生产 | 工序执行 | 全Route完成 |
| 状态 | 库存状态 | 加工状态 | 质量状态 |
| 位置 | 仓库/料区 | 工位流转 | 成品库 |
| 关键属性 | 供应商/批次/库存 | 完成度/工序 | 质量等级/发运 |
| `functionCategory` | `F2.1.x` | `F2.2.x` | `F2.3.x` |

---

## 3. 核心设计决策

### 3.1 决策1: 双源统一建模

**问题**: 外部采购和内部来源的物料差异很大,如何统一建模?

**方案**: 使用`materialSourceType`标识 + 条件必填字段

```json
{
  "materialSourceType": "External" | "Internal",
  
  // External时必填
  "supplierInfo": { ... },
  "supplierBatch": "...",
  "incomingInspection": { ... },
  
  // Internal时必填
  "sourceWorkpiece": "urn:...",
  "sourceScene": "urn:...",
  "outputFromProcess": { ... }
}
```

**优势**:
- 避免创建两个子类型(复杂化)
- 字段复用(库存、质量管理通用)
- 清晰的条件约束

### 3.2 决策2: 库存优先设计

**核心字段**:
- `stockLocation`: 库存位置(仓库→货架→货位)
- `stockQuantity` + `stockUnit`: 数量和单位
- `stockStatus`: 库存状态(可用/预留/在途等)
- `minimumStock` / `maximumStock`: 安全库存

**理由**: Material的主要特征是"待用",库存管理是核心需求

### 3.3 决策3: 质量证书可选

**设计**:
- `incomingInspection`: 来料检验(建议必填)
- `qualityCertificate`: 质量证书(可选)

**理由**:
- 不是所有物料都有质量证书(如标准件)
- 但来料检验是必须的(质量门禁)

### 3.4 决策4: 使用记录追溯

**设计**: `usageRecords`数组记录每次使用

```json
"usageRecords": [
  {
    "usageDate": "2025-01-16T09:00:00Z",
    "usageScene": "urn:ngsi-ld:Scene:WELD-...",
    "targetWorkpiece": "urn:...Workpiece:ZQ-2025-00123-T2",
    "quantityUsed": 2.5,
    "operatorId": "EMP-20250102"
  }
]
```

**用途**:
- 物料消耗分析
- 追溯到具体产品
- 库存扣减记录

---

## 4. 特有字段详解

### 4.1 来源分类层

#### `materialSourceType` (必填)
- **值枚举**: `"External"` | `"Internal"`
- **说明**: 物料来源类型
  - **External**: 外部采购(供应商)
  - **Internal**: 内部生产(上一工序输出)

#### `materialCategory` (必填)
- **值枚举**: `"RawMaterial"` | `"Auxiliary"` | `"PurchasedPart"` | `"SemiFinished"` | `"Consumable"`
- **说明**: 物料分类
  - **RawMaterial**: 原材料(钢板、型材等)
  - **Auxiliary**: 辅料(焊丝、涂料等)
  - **PurchasedPart**: 采购件(标准件、外协件)
  - **SemiFinished**: 半成品(内部生产的中间品)
  - **Consumable**: 消耗品(工具、耗材)

#### `materialGrade` (可选)
- **类型**: String
- **说明**: 物料等级/牌号
- **示例**: `"Q235B"`, `"ER50-6"`, `"Grade A"`

---

### 4.2 外部采购层(External时建议必填)

#### `supplierInfo` (条件必填)
- **结构**:
```typescript
{
  supplierId: string,
  supplierName: string,
  supplierCode: string,
  supplierContact: string
}
```
- **约束**: `materialSourceType="External"`时建议必填

#### `supplierBatch` (条件必填)
- **类型**: String
- **说明**: 供应商批次号
- **用途**: 批次追溯,质量问题定位
- **约束**: `materialSourceType="External"`时建议必填

#### `purchaseOrder` (可选)
- **结构**:
```typescript
{
  poNumber: string,
  poDate: date,
  poLineItem: string,
  purchasePrice: number,
  currency: string
}
```

#### `incomingInspection` (建议必填)
- **结构**:
```typescript
{
  inspectionId: string,
  inspectionDate: datetime,
  inspectorId: string,
  inspectionResult: "Pass" | "Fail" | "ConditionalAccept" | "Quarantine",
  samplingPlan: string,
  sampledQuantity: number,
  defectCount: number,
  defects: Array<{
    defectCode: string,
    defectDesc: string,
    severity: "Critical" | "Major" | "Minor"
  }>,
  remarks: string
}
```
- **检验结果**:
  - `Pass`: 合格,可入库
  - `Fail`: 不合格,退货
  - `ConditionalAccept`: 让步接收
  - `Quarantine`: 隔离待处理

#### `qualityCertificate` (可选)
- **结构**:
```typescript
{
  certificateId: string,
  certificateType: "MillCertificate" | "QualityCertificate" | "TestReport" | "ComplianceCert",
  issueDate: date,
  issuingAuthority: string,
  certificateUrl: string,
  testResults: object
}
```

---

### 4.3 内部来源层(Internal时必填)

#### `sourceWorkpiece` (条件必填)
- **类型**: Relationship
- **引用**: Workpiece URN
- **说明**: 来源在制品
- **约束**: `materialSourceType="Internal"`时,`sourceWorkpiece`或`sourceProduct`二选一必填

#### `sourceProduct` (条件必填)
- **类型**: Relationship
- **引用**: Product URN
- **说明**: 来源成品(作为下游工序的物料)

#### `sourceScene` (建议必填)
- **类型**: Relationship
- **引用**: Scene URN
- **说明**: 创建此Material的Scene(内部生产)

#### `outputFromProcess` (建议必填)
- **结构**:
```typescript
{
  routeCode: string,
  taktSeq: number,
  procCode: string,
  stepSeq: number
}
```
- **说明**: 输出自哪个工序

**示例**:
```json
{
  "materialSourceType": {"value": "Internal"},
  "sourceWorkpiece": {
    "object": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00120-T3"
  },
  "sourceScene": {
    "object": "urn:ngsi-ld:Scene:CUT-20250115-008"
  },
  "outputFromProcess": {
    "value": {
      "routeCode": "ROUTE-SW-001",
      "taktSeq": 3,
      "procCode": "PROC-CUT-PANEL",
      "stepSeq": 2
    }
  }
}
```

---

### 4.4 库存管理层

#### `receivingDate` (建议必填)
- **类型**: DateTime
- **说明**: 收货/入库日期

#### `stockLocation` (建议必填)
- **结构**:
```typescript
{
  warehouseCode: string,
  areaCode: string,
  rackId: string,
  binLocation: string
}
```
- **示例**: `{"warehouseCode": "WH-01", "areaCode": "AREA-A", "rackId": "R-05", "binLocation": "B-03-02"}`

#### `stockQuantity` + `stockUnit` (必填)
- **类型**: Number + Enum
- **单位枚举**: `"piece"` | `"kg"` | `"ton"` | `"meter"` | `"liter"` | `"box"` | `"roll"` | `"sheet"`

#### `stockStatus` (必填)
- **值枚举**: `"Available"` | `"Reserved"` | `"InTransit"` | `"Quarantine"` | `"Expired"` | `"Depleted"`
- **状态流转**:
```
InTransit → Available (收货入库)
Available → Reserved (生产预留)
Available → Quarantine (质量问题)
Reserved → Depleted (使用完毕)
```

#### `minimumStock` / `maximumStock` (可选)
- **类型**: Number
- **说明**: 安全库存上下限
- **用途**: 库存预警

#### `expiryDate` (可选)
- **类型**: Date
- **说明**: 有效期(适用于有时效性的物料,如化工品、焊丝等)

---

### 4.5 物料特性层

#### `materialSpec` (可选)
- **结构**:
```typescript
{
  dimensions: {
    length: number,
    width: number,
    thickness: number,
    diameter: number,
    unit: string
  },
  weight: number,
  weight_unit: string,
  chemicalComposition: object,
  mechanicalProperties: object,
  tolerance: string,
  surfaceFinish: string
}
```

#### `storageConditions` (可选)
- **结构**:
```typescript
{
  temperatureMin: number,
  temperatureMax: number,
  humidityMin: number,
  humidityMax: number,
  specialRequirements: string,
  storageInstructions: string
}
```

#### `hazardClass` (可选)
- **结构**:
```typescript
{
  isHazardous: boolean,
  unNumber: string,
  hazardClass: string,
  packingGroup: string,
  msdsUrl: string
}
```

---

### 4.6 使用与追溯层

#### `usageRecords` (建议记录)
- **结构**:
```typescript
Array<{
  usageId: string,
  usageDate: datetime,
  usageScene: string,
  targetWorkpiece: string,
  quantityUsed: number,
  operatorId: string,
  remarks: string
}>
```
- **用途**: 物料消耗追溯,关联到产品

#### `disposalRecords` (可选)
- **结构**:
```typescript
Array<{
  disposalId: string,
  disposalType: "Scrap" | "Return" | "Rework" | "Donation",
  disposalDate: datetime,
  disposalReason: string,
  quantityDisposed: number,
  approvedBy: string
}>
```

#### `traceabilityLinks` (可选)
- **结构**:
```typescript
{
  upstreamMaterials: Array<string>,      // 上游物料
  downstreamWorkpieces: Array<string>,   // 下游在制品
  relatedProducts: Array<string>         // 相关产品
}
```

---

## 5. 典型场景应用

### 5.1 场景1: 外部采购钢板入库

```json
{
  "id": "urn:ngsi-ld:TwinObject:Material:SP-20250115-B001",
  "subType": {"value": "Material"},
  "materialSourceType": {"value": "External"},
  "materialCategory": {"value": "RawMaterial"},
  "materialGrade": {"value": "Q235B"},
  
  "supplierInfo": {
    "value": {
      "supplierId": "SUP-001",
      "supplierName": "XX钢铁有限公司",
      "supplierCode": "STEEL-001"
    }
  },
  "supplierBatch": {"value": "SUP-B-20250103"},
  
  "incomingInspection": {
    "value": {
      "inspectionId": "INS-IN-20250115-001",
      "inspectionDate": "2025-01-15T08:00:00Z",
      "inspectorId": "EMP-QC-03",
      "inspectionResult": "Pass",
      "samplingPlan": "AQL-2.5",
      "sampledQuantity": 5
    }
  },
  
  "receivingDate": {"value": "2025-01-15T07:30:00Z"},
  "stockLocation": {
    "value": {
      "warehouseCode": "WH-RAW",
      "areaCode": "STEEL-AREA",
      "rackId": "R-12",
      "binLocation": "B-12-05"
    }
  },
  "stockQuantity": {"value": 50},
  "stockUnit": {"value": "sheet"},
  "stockStatus": {"value": "Available"},
  
  "materialSpec": {
    "value": {
      "dimensions": {
        "length": 6000,
        "width": 2000,
        "thickness": 3,
        "unit": "mm"
      },
      "weight": 282,
      "weight_unit": "kg"
    }
  }
}
```

### 5.2 场景2: 内部生产的切割板料

```json
{
  "id": "urn:ngsi-ld:TwinObject:Material:CUT-PANEL-20250116-003",
  "subType": {"value": "Material"},
  "materialSourceType": {"value": "Internal"},
  "materialCategory": {"value": "SemiFinished"},
  
  "sourceWorkpiece": {
    "object": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00120-T1"
  },
  "sourceScene": {
    "object": "urn:ngsi-ld:Scene:CUT-20250116-005"
  },
  "outputFromProcess": {
    "value": {
      "routeCode": "ROUTE-SW-001",
      "taktSeq": 1,
      "procCode": "PROC-CUT-PANEL"
    }
  },
  
  "receivingDate": {"value": "2025-01-16T10:30:00Z"},
  "stockLocation": {
    "value": {
      "warehouseCode": "WH-WIP",
      "areaCode": "PANEL-BUFFER",
      "binLocation": "TRAY-05"
    }
  },
  "stockQuantity": {"value": 2},
  "stockUnit": {"value": "piece"},
  "stockStatus": {"value": "Available"},
  
  "traceabilityLinks": {
    "value": {
      "upstreamMaterials": ["urn:...Material:SP-20250115-B001"],
      "downstreamWorkpieces": []
    }
  }
}
```

### 5.3 场景3: 焊丝使用记录

```json
{
  "id": "urn:ngsi-ld:TwinObject:Material:WW-20250110-A001",
  "materialCategory": {"value": "Auxiliary"},
  "materialGrade": {"value": "ER50-6"},
  
  "stockQuantity": {"value": 15.5},
  "stockUnit": {"value": "kg"},
  "stockStatus": {"value": "Available"},
  
  "usageRecords": {
    "value": [
      {
        "usageDate": "2025-01-16T08:30:00Z",
        "usageScene": "urn:ngsi-ld:Scene:WELD-T2-P1-20250116-001",
        "targetWorkpiece": "urn:...Workpiece:ZQ-2025-00123-T2",
        "quantityUsed": 1.8,
        "operatorId": "EMP-20250102"
      },
      {
        "usageDate": "2025-01-16T10:45:00Z",
        "usageScene": "urn:ngsi-ld:Scene:WELD-T2-P2-20250116-002",
        "targetWorkpiece": "urn:...Workpiece:ZQ-2025-00123-T2",
        "quantityUsed": 2.1,
        "operatorId": "EMP-20250103"
      }
    ]
  },
  
  "traceabilityLinks": {
    "value": {
      "downstreamWorkpieces": [
        "urn:...Workpiece:ZQ-2025-00123-T2"
      ],
      "relatedProducts": [
        "urn:...Product:ZQ-2025-00123"
      ]
    }
  }
}
```

---

## 6. 完整示例(省略,见场景应用)

---

## 7. 常见问题FAQ

### Q1: External和Internal物料有什么本质区别?

**A**: 
- **External**: 来自外部供应链,关键是**供应商追溯**
- **Internal**: 来自内部工序,关键是**工艺追溯**

两者的质量管理、库存管理方式相同,但追溯链不同。

### Q2: 半成品应该建模为Material还是Workpiece?

**A**: 看**当前状态**:
- 如果**正在加工中** → Workpiece
- 如果**已完成某阶段,等待下一阶段** → Material(SemiFinished)

例如: Takt1完成的板料,暂存等待Takt2使用 → Material

### Q3: Material的库存数量如何更新?

**A**: 两种方式:
1. **使用时扣减**: 通过`usageRecords`记录,累计扣减`stockQuantity`
2. **盘点更新**: 定期库存盘点,直接更新`stockQuantity`

建议: 使用时记录,定期盘点校正

### Q4: 来料检验不合格怎么处理?

**A**: 
```json
{
  "incomingInspection": {
    "inspectionResult": "Fail"
  },
  "stockStatus": "Quarantine",  // 隔离
  
  "disposalRecords": [
    {
      "disposalType": "Return",
      "disposalReason": "质量不合格",
      "approvedBy": "MANAGER-01"
    }
  ]
}
```

### Q5: 如何追溯某个产品使用了哪些物料?

**A**: 两种方式:
1. 从Product查Workpiece的`materialGenealogy`
2. 从Material的`usageRecords`反向查询

建议: 在Workpiece/Product中记录,Material中补充记录

### Q6: Material何时转换为Workpiece?

**A**: Material**不直接转换**为Workpiece。正确流程:
```
Material(待用) → 投入Scene → Scene产出Workpiece
```

Material是"输入",Workpiece是"输出",通过Scene连接。

### Q7: 库存安全预警如何实现?

**A**: 
```python
if material.stockQuantity < material.minimumStock:
    trigger_alert("库存不足预警")
elif material.stockQuantity > material.maximumStock:
    trigger_alert("库存积压预警")
```

### Q8: 危险品物料需要特殊处理吗?

**A**: 是的,通过`hazardClass`标识:
```json
{
  "hazardClass": {
    "isHazardous": true,
    "unNumber": "UN1093",
    "hazardClass": "3",
    "msdsUrl": "https://..."
  },
  "storageConditions": {
    "specialRequirements": "防火防爆,通风良好"
  }
}
```

---

## 8. 附录

### 8.1 字段总览表

| 层级 | 字段名 | 必填性 | 适用来源 |
|------|--------|--------|---------|
| **L1-来源分类** |
| | `materialSourceType` | 必填 | All |
| | `materialCategory` | 必填 | All |
| | `materialGrade` | 可选 | All |
| **L2-外部采购** |
| | `supplierInfo` | 条件必填 | External |
| | `supplierBatch` | 条件必填 | External |
| | `purchaseOrder` | 可选 | External |
| | `incomingInspection` | 建议必填 | External |
| | `qualityCertificate` | 可选 | External |
| **L3-内部来源** |
| | `sourceWorkpiece` | 条件必填 | Internal |
| | `sourceProduct` | 条件必填 | Internal |
| | `sourceScene` | 建议必填 | Internal |
| | `outputFromProcess` | 建议必填 | Internal |
| **L4-库存管理** |
| | `receivingDate` | 建议必填 | All |
| | `stockLocation` | 建议必填 | All |
| | `stockQuantity` | 必填 | All |
| | `stockUnit` | 必填 | All |
| | `stockStatus` | 必填 | All |
| | `minimumStock/maximumStock` | 可选 | All |
| | `expiryDate` | 可选 | All |
| **L5-物料特性** |
| | `materialSpec` | 可选 | All |
| | `storageConditions` | 可选 | All |
| | `hazardClass` | 可选 | All |
| **L6-使用追溯** |
| | `usageRecords` | 建议记录 | All |
| | `disposalRecords` | 可选 | All |
| | `traceabilityLinks` | 可选 | All |

### 8.2 相关文档索引

| 文档 | 说明 |
|------|------|
| `twinobject_core_guide.md` | 核心规范 |
| `twinobject_material.schema.json` | Material Schema |
| `twinobject_workpiece_guide.md` | Workpiece规范 |
| `twinobject_product_guide.md` | Product规范 |

---

**文档版本**: V1.0  
**发布日期**: 2025-10-19  
**维护部门**: 数字孪生架构组

---

**版权声明**: 本文档为内部技术规范,未经授权不得外传。