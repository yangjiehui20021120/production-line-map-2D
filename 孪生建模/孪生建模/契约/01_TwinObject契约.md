# TwinObject实体数据契约

**Entity Data Contract - TwinObject**

---

## 契约元信息

| 项目 | 内容 |
|-----|------|
| **契约版本** | v1.0.0 |
| **所属总契约** | 00_总契约.md v1.0.0 |
| **生效日期** | 2025-11-10 |
| **实体类型** | TwinObject (含11种子类型) |
| **所属层级** | 资源配置层 (Resource Configuration Layer) |
| **契约状态** | 🟢 生效中 |

---

## 1. 实体概述

### 1.1 实体定义

**TwinObject** (孪生对象) 是资源配置层的统一基类,代表数字孪生系统中所有物理或逻辑资源的数字化表示。

通过`subType`属性区分11种具体子类型:
- 组织资源: OrgUnit, Station, Position
- 设备资源: AutoEquipment, TransportEquip, QCTool
- 人力资源: Person
- 物料资源: Material, Product, Workpiece

### 1.2 实体用途

| 子类型 | 用途 | 典型实例数 |
|-------|------|-----------|
| OrgUnit | 组织层级结构定义 | 4 |
| Station | 生产工位配置 | 28 |
| Position | 工位内作业位置 | - |
| AutoEquipment | 自动化设备配置 | 33 |
| TransportEquip | 运输设备配置 | - |
| QCTool | 质检工具配置 | - |
| Person | 人员信息管理 | - |
| Material | 物料定义 | - |
| Product | 产品定义 | 2 |
| Workpiece | 工件追踪 | 10 |

### 1.3 典型URN示例

```
urn:ngsi-ld:TwinObject:OrgUnit:SideWallLine
urn:ngsi-ld:TwinObject:Station:FrontWelding
urn:ngsi-ld:TwinObject:AutoEquipment:361-01173
urn:ngsi-ld:TwinObject:Person:EMP001
urn:ngsi-ld:TwinObject:Product:M000004670327
urn:ngsi-ld:Workpiece:M670-SN001
```

---

## 2. 核心字段契约

### 2.1 必填字段 (所有子类型)

| 字段名 | NGSI-LD类型 | 数据类型 | 约束 | 说明 | 示例 |
|-------|------------|---------|------|------|------|
| **id** | - | URN | 必填,唯一 | 全局唯一标识符 | `urn:ngsi-ld:TwinObject:AutoEquipment:361-01173` |
| **type** | - | String | 必填,固定值 | 固定为"TwinObject" | `"TwinObject"` |
| **@context** | - | Array | 必填 | NGSI-LD上下文 | `["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]` |
| **subType** | Property | String | 必填,枚举 | 子类型标识 | `"AutoEquipment"` |
| **twinType** | Property | String | 必填,枚举 | 顶层分类 | `"Constituent"` or `"Transitional"` |
| **functionCategory** | Property | String | 必填,格式 | 生产功能分类 | `"F1.AutoWelding"` |

### 2.2 推荐字段 (所有子类型)

| 字段名 | NGSI-LD类型 | 数据类型 | 约束 | 说明 | 示例 |
|-------|------------|---------|------|------|------|
| **name** | Property | String | 推荐 | 对象名称(人类可读) | `"前围焊接机器人"` |
| **location** | GeoProperty | GeoJSON | 可选 | 地理位置坐标 | `{"type": "Point", "coordinates": [116.4, 39.9, 10]}` |

### 2.3 可选字段 (所有子类型)

| 字段名 | NGSI-LD类型 | 数据类型 | 说明 | 示例 |
|-------|------------|---------|------|------|
| **capabilities** | Property | Array[String] | 能力标签集合 | `["MIG焊接", "点焊"]` |
| **specifications** | Property | Object | 技术规格参数 | `{"maxLoad": 500, "reach": 2800}` |
| **vendor** | Property | String | 制造厂商 | `"ABB"` |
| **model** | Property | String | 设备型号 | `"IRB 6700-200/2.80"` |
| **serialNumber** | Property | String | 序列号 | `"SN-2023-001173"` |

---

## 3. 子类型契约

### 3.1 枚举值: subType

```
OrgUnit           - 组织单元
Station           - 工位
Position          - 台位
AutoEquipment     - 自动化设备
TransportEquipment- 运输设备
QCTool            - 检具
Person            - 人员
Material          - 物料
Product           - 产品
Workpiece         - 工件
```

**验证规则**:
- ✅ 必须从上述枚举值中选择
- ❌ 不允许自定义subType值

---

### 3.2 OrgUnit (组织单元) 特有字段

| 字段名 | NGSI-LD类型 | 数据类型 | 必填 | 枚举值/约束 | 说明 |
|-------|------------|---------|-----|------------|------|
| **orgUnitType** | Property | String | ✓ | `Factory`, `Workshop`, `ProductionLine`, `Team`, `Department`, `Division` | 组织类型 |
| **orgLevel** | Property | Integer | ✓ | >= 1 | 组织层级(1=工厂, 2=车间, 3=产线, 4=班组) |
| **orgStatus** | Property | String | - | `Active`, `Inactive`, `Restructuring` | 组织状态 |
| **parentOrg** | Relationship | URN | - | 指向OrgUnit | 上级组织 |
| **childOrgs** | Relationship[] | URN[] | - | 指向OrgUnit列表 | 下级组织列表 |

**关系约束**:
- `parentOrg` ↔ `childOrgs` 互为反向关系
- 不允许循环引用 (如A的parentOrg是B, B的parentOrg又是A)

**示例**:
```json
{
  "@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"],
  "id": "urn:ngsi-ld:TwinObject:OrgUnit:SideWallLine",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "OrgUnit"},
  "twinType": {"type": "Property", "value": "Constituent"},
  "functionCategory": {"type": "Property", "value": "F1"},
  "name": {"type": "Property", "value": "侧墙产线"},
  "orgUnitType": {"type": "Property", "value": "ProductionLine"},
  "orgLevel": {"type": "Property", "value": 3},
  "orgStatus": {"type": "Property", "value": "Active"},
  "parentOrg": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:OrgUnit:BodyWorkshop"
  }
}
```

---

### 3.3 Station (工位) 特有字段

| 字段名 | NGSI-LD类型 | 数据类型 | 必填 | 枚举值/约束 | 说明 |
|-------|------------|---------|-----|------------|------|
| **stationCategory** | Property | String | ✓ | `ProductionStation`, `InspectionStation`, `AssemblyStation`, `BufferZone`, `HandlingStation` | 工位类别 |
| **capacityWip** | Property | Integer | - | >= 0 | 在制品容量(件数) |
| **stationLocation** | Relationship | URN | - | 指向OrgUnit | 所属组织单元 |
| **hasPositions** | Relationship[] | URN[] | - | 指向Position列表 | 包含的台位 |
| **deployedEquipments** | Relationship[] | URN[] | - | 指向AutoEquipment列表 | 部署的设备 |

**关系约束**:
- `hasPositions`: Position的`belongsToStation`必须反向指向此Station
- `deployedEquipments`: AutoEquipment的`deployedAt`必须反向指向此Station

**示例**:
```json
{
  "id": "urn:ngsi-ld:TwinObject:Station:FrontWelding",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "Station"},
  "name": {"type": "Property", "value": "前围焊接工位"},
  "stationCategory": {"type": "Property", "value": "ProductionStation"},
  "capacityWip": {"type": "Property", "value": 2},
  "stationLocation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:OrgUnit:SideWallLine"
  },
  "deployedEquipments": [
    {"type": "Relationship", "object": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"},
    {"type": "Relationship", "object": "urn:ngsi-ld:TwinObject:AutoEquipment:361-900A"}
  ]
}
```

---

### 3.4 Position (台位) 特有字段

| 字段名 | NGSI-LD类型 | 数据类型 | 必填 | 枚举值/约束 | 说明 |
|-------|------------|---------|-----|------------|------|
| **belongsToStation** | Relationship | URN | ✓ | 指向Station | 所属工位 |
| **positionIndex** | Property | String | - | 格式: `P[0-9]+` or `[A-Z][0-9]+` | 台位编号 |
| **positionType** | Property | String | - | `WorkTable`, `LoadingPoint`, `UnloadingPoint`, `InspectionPoint`, `FixturePoint`, `BufferPoint`, `HandoverPoint` | 台位类型 |
| **relativeOffset** | Property | Object | - | `{x, y, z}` (单位:mm) | 相对工位的坐标偏移 |

**示例**:
```json
{
  "id": "urn:ngsi-ld:TwinObject:Position:ST-HJ-P01",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "Position"},
  "name": {"type": "Property", "value": "焊接工位1号台位"},
  "belongsToStation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:FrontWelding"
  },
  "positionIndex": {"type": "Property", "value": "P01"},
  "positionType": {"type": "Property", "value": "WorkTable"},
  "relativeOffset": {"type": "Property", "value": {"x": 1200, "y": 500, "z": 0}}
}
```

---

### 3.5 AutoEquipment (自动化设备) 特有字段

| 字段名 | NGSI-LD类型 | 数据类型 | 必填 | 枚举值/约束 | 说明 |
|-------|------------|---------|-----|------------|------|
| **equipmentType** | Property | String | ✓ | `WeldingRobot`, `Welder`, `Positioner`, `CNC`, `PressMachine`, `Laser`, `Other` | 设备细分类型 |
| **controllerType** | Property | String | - | - | 控制器类型 (如`ABB_IRC5`) |
| **controllerVersion** | Property | String | - | - | 控制器软件版本 |
| **axes** | Property | Integer | - | 1-9 | 轴数(机器人/CNC) |
| **maxPayload** | Property | Number | - | > 0, 单位:kg | 最大负载 |
| **reach** | Property | Number | - | > 0, 单位:mm | 工作半径 |
| **manufacturer** | Property | String | - | - | 制造商 |
| **model** | Property | String | - | - | 型号 |
| **serialNumber** | Property | String | - | - | 序列号 |
| **commissionDate** | Property | Date | - | ISO 8601格式 | 投产日期 |
| **deployedAt** | Relationship | URN | - | 指向Station | 部署位置 |
| **supportedProcesses** | Property | Array[String] | - | - | 支持的工艺类型 |

**示例**:
```json
{
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "AutoEquipment"},
  "name": {"type": "Property", "value": "前围焊接机器人"},
  "equipmentType": {"type": "Property", "value": "WeldingRobot"},
  "manufacturer": {"type": "Property", "value": "ABB"},
  "model": {"type": "Property", "value": "IRB 6700-200/2.80"},
  "controllerType": {"type": "Property", "value": "ABB_IRC5"},
  "controllerVersion": {"type": "Property", "value": "7.5.1"},
  "axes": {"type": "Property", "value": 6},
  "maxPayload": {"type": "Property", "value": 200, "unitCode": "kg"},
  "reach": {"type": "Property", "value": 2800, "unitCode": "mm"},
  "serialNumber": {"type": "Property", "value": "SN-2023-001173"},
  "commissionDate": {"type": "Property", "value": "2024-03-15"},
  "deployedAt": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:FrontWelding"
  },
  "supportedProcesses": {"type": "Property", "value": ["MIG焊接", "点焊"]}
}
```

---

### 3.6 Person (人员) 特有字段

| 字段名 | NGSI-LD类型 | 数据类型 | 必填 | 约束 | 说明 |
|-------|------------|---------|-----|------|------|
| **employeeId** | Property | String | ✓ | 格式: `EMP-[0-9]{8,}` | 员工编号 |
| **department** | Property | String | - | - | 所属部门 |
| **workgroup** | Property | String | - | - | 班组 |
| **skills** | Property | Array[String] | - | 格式: `Skill.{Category}.{Name}` | 技能标签 |
| **certifications** | Property | Array[String] | - | - | 资格证书 |
| **shiftSchedule** | Property | String | - | `TwoShift`, `ThreeShift`, `Fixed` | 排班模式 |
| **holdsPosition** | Relationship | URN | - | 指向Position | 任职岗位 |
| **assignedRole** | Relationship[] | URN[] | - | 指向Role | 分配角色 |

**敏感数据处理**:
- ⚠️ 真实姓名、身份证号等敏感信息不应存储在数字孪生实体中
- ✅ 使用`employeeId`作为唯一标识
- ✅ 个人隐私信息应存储在独立的HR系统中

**示例**:
```json
{
  "id": "urn:ngsi-ld:TwinObject:Person:EMP001",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "Person"},
  "employeeId": {"type": "Property", "value": "EMP-20250101"},
  "department": {"type": "Property", "value": "车身车间"},
  "workgroup": {"type": "Property", "value": "侧墙产线A班"},
  "skills": {
    "type": "Property",
    "value": ["Skill.Welding.MIG", "Skill.Robot.Programming"]
  },
  "certifications": {
    "type": "Property",
    "value": ["焊工证-高级", "特种设备操作证"]
  },
  "shiftSchedule": {"type": "Property", "value": "TwoShift"},
  "assignedRole": [
    {"type": "Relationship", "object": "urn:ngsi-ld:Role:Welder"},
    {"type": "Relationship", "object": "urn:ngsi-ld:Role:TeamLeader"}
  ]
}
```

---

### 3.7 Product (产品) 特有字段

| 字段名 | NGSI-LD类型 | 数据类型 | 必填 | 说明 |
|-------|------------|---------|-----|------|
| **productCode** | Property | String | ✓ | 产品编号 |
| **productName** | Property | String | - | 产品名称 |
| **productFamily** | Property | String | - | 产品族 |
| **version** | Property | String | - | 版本号 |
| **mbomRef** | Relationship | URN | - | 关联的MBOM |

**示例**:
```json
{
  "id": "urn:ngsi-ld:TwinObject:Product:M000004670327",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "Product"},
  "productCode": {"type": "Property", "value": "M000004670327"},
  "productName": {"type": "Property", "value": "M670型侧墙"},
  "productFamily": {"type": "Property", "value": "侧墙总成"},
  "version": {"type": "Property", "value": "V3.2"},
  "mbomRef": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:MBOM:M000004670327"
  }
}
```

---

### 3.8 Workpiece (工件) 特有字段

| 字段名 | NGSI-LD类型 | 数据类型 | 必填 | 枚举值/约束 | 说明 |
|-------|------------|---------|-----|------------|------|
| **workpieceCode** | Property | String | ✓ | - | 工件批次号/序列号 |
| **productType** | Relationship | URN | ✓ | 指向Product | 所属产品类型 |
| **productionOrder** | Property | String | - | - | 生产订单号 |
| **batchNumber** | Property | String | - | - | 批次号 |
| **currentStatus** | Property | String | - | `InProduction`, `QualityCheck`, `Completed`, `Scrapped` | 当前状态 |
| **currentLocation** | Relationship | URN | - | 指向Station | 当前位置 |
| **startTime** | Property | DateTime | - | ISO 8601格式 | 生产开始时间 |

**示例**:
```json
{
  "id": "urn:ngsi-ld:Workpiece:M670-SN001",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "Workpiece"},
  "twinType": {"type": "Property", "value": "Transitional"},
  "workpieceCode": {"type": "Property", "value": "M670-SN001"},
  "productType": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Product:M000004670327"
  },
  "productionOrder": {"type": "Property", "value": "PO-2025-08-001"},
  "batchNumber": {"type": "Property", "value": "BATCH-202508-001"},
  "currentStatus": {"type": "Property", "value": "InProduction"},
  "currentLocation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:FrontWelding"
  },
  "startTime": {"type": "Property", "value": "2025-08-08T08:00:00Z"}
}
```

---

## 4. 关系契约

### 4.1 TwinObject参与的关系清单

| 关系名 | 源实体(subType) | 目标实体 | 基数 | 必填 | 说明 |
|-------|---------------|---------|------|-----|------|
| parentOrg | OrgUnit | OrgUnit | N:1 | 否 | 上级组织 |
| childOrgs | OrgUnit | OrgUnit | 1:N | 否 | 下级组织 |
| stationLocation | Station | OrgUnit | N:1 | 否 | 工位所属组织 |
| hasPositions | Station | Position | 1:N | 否 | 工位包含台位 |
| belongsToStation | Position | Station | N:1 | ✓ | 台位所属工位 |
| deployedEquipments | Station | AutoEquipment | 1:N | 否 | 工位部署设备 |
| deployedAt | AutoEquipment | Station | N:1 | 否 | 设备部署位置 |
| holdsPosition | Person | Position | N:1 | 否 | 人员任职岗位 |
| assignedRole | Person | Role | N:M | 否 | 人员分配角色 |
| productType | Workpiece | Product | N:1 | ✓ | 工件的产品类型 |
| currentLocation | Workpiece | Station | N:1 | 否 | 工件当前位置 |
| mbomRef | Product | MBOM_Root | 1:1 | 否 | 产品关联MBOM |

### 4.2 关系完整性约束

**双向关系一致性**:
- 如果 Station A 的 `hasPositions` 包含 Position B
- 则 Position B 的 `belongsToStation` 必须指向 Station A

**悬空引用检查**:
- 所有Relationship的`object`必须指向有效的实体URN
- 不允许指向不存在的实体

**循环引用检查**:
- `parentOrg` 不允许形成循环 (如 A→B→C→A)

---

## 5. 业务规则

### 5.1 字段验证规则

#### id (URN)
```python
# 正则表达式
pattern = r"^urn:ngsi-ld:TwinObject:[A-Za-z]+:[A-Za-z0-9_-]+$"

# 或者对于Workpiece (简化格式)
pattern_workpiece = r"^urn:ngsi-ld:Workpiece:[A-Za-z0-9_-]+$"
```

#### subType
```python
allowed_values = [
    "OrgUnit", "Station", "Position",
    "AutoEquipment", "TransportEquipment", "QCTool",
    "Person", "Material", "Product", "Workpiece"
]
```

#### twinType
```python
allowed_values = ["Constituent", "Transitional"]

# 约束:
# - OrgUnit, Station, Position, AutoEquipment, Person, Material, QCTool
#   → 必须是 "Constituent"
# - Product, Workpiece
#   → 必须是 "Transitional"
```

#### functionCategory
```python
# 格式: F1 或 F2 + 可选的点号分隔子类别
pattern = r"^F[12](\.[A-Za-z0-9]+)*$"

# 示例:
# "F1"
# "F1.AutoWelding"
# "F2.Workpiece"
```

### 5.2 数据一致性约束

**约束1: orgLevel与parentOrg的一致性**
```python
if entity.subType == "OrgUnit":
    if entity.parentOrg is not None:
        parent = get_entity(entity.parentOrg.object)
        assert parent.orgLevel < entity.orgLevel, "子组织的orgLevel必须大于父组织"
```

**约束2: Station的capacityWip与实际工件数的一致性**
```python
if entity.subType == "Station":
    workpieces_count = count_workpieces(currentLocation == entity.id)
    if entity.capacityWip is not None:
        # 警告: 实际工件数不应超过容量
        if workpieces_count > entity.capacityWip:
            log_warning(f"Station {entity.id} 超容: {workpieces_count}/{entity.capacityWip}")
```

**约束3: Person的skills格式**
```python
if entity.subType == "Person":
    for skill in entity.skills:
        assert skill.startswith("Skill."), "技能标签必须以'Skill.'开头"
        parts = skill.split(".")
        assert len(parts) >= 2, "技能标签格式: Skill.{Category}.{Name}"
```

---

## 6. 示例数据

### 6.1 最小示例 (AutoEquipment)

仅包含必填字段:

```json
{
  "@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"],
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:TEST-001",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "AutoEquipment"},
  "twinType": {"type": "Property", "value": "Constituent"},
  "functionCategory": {"type": "Property", "value": "F1"},
  "equipmentType": {"type": "Property", "value": "WeldingRobot"}
}
```

### 6.2 完整示例 (AutoEquipment)

包含所有推荐和可选字段:

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/twinobject-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "AutoEquipment"},
  "twinType": {"type": "Property", "value": "Constituent"},
  "functionCategory": {"type": "Property", "value": "F1.AutoWelding"},
  "name": {"type": "Property", "value": "前围焊接机器人"},
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [116.407526, 39.904989, 10]
    }
  },
  "equipmentType": {"type": "Property", "value": "WeldingRobot"},
  "manufacturer": {"type": "Property", "value": "ABB"},
  "model": {"type": "Property", "value": "IRB 6700-200/2.80"},
  "controllerType": {"type": "Property", "value": "ABB_IRC5"},
  "controllerVersion": {"type": "Property", "value": "7.5.1"},
  "axes": {"type": "Property", "value": 6},
  "maxPayload": {"type": "Property", "value": 200, "unitCode": "kg"},
  "reach": {"type": "Property", "value": 2800, "unitCode": "mm"},
  "serialNumber": {"type": "Property", "value": "SN-2023-001173"},
  "commissionDate": {"type": "Property", "value": "2024-03-15"},
  "deployedAt": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:FrontWelding"
  },
  "supportedProcesses": {"type": "Property", "value": ["MIG焊接", "点焊"]},
  "capabilities": {"type": "Property", "value": ["MIG焊接", "机械手搬运"]},
  "specifications": {
    "type": "Property",
    "value": {
      "maxLoad": 500,
      "reach": 2800,
      "repeatability": 0.05
    }
  }
}
```

### 6.3 边界示例 (OrgUnit循环引用检测)

❌ **错误示例** - 不允许的循环引用:

```json
// OrgUnit A
{
  "id": "urn:ngsi-ld:TwinObject:OrgUnit:A",
  "parentOrg": {"type": "Relationship", "object": "urn:ngsi-ld:TwinObject:OrgUnit:B"}
}

// OrgUnit B
{
  "id": "urn:ngsi-ld:TwinObject:OrgUnit:B",
  "parentOrg": {"type": "Relationship", "object": "urn:ngsi-ld:TwinObject:OrgUnit:A"}
}
```

✅ **正确示例**:
```json
// OrgUnit A (顶层)
{
  "id": "urn:ngsi-ld:TwinObject:OrgUnit:A",
  "parentOrg": null  // 顶层组织无上级
}

// OrgUnit B (下级)
{
  "id": "urn:ngsi-ld:TwinObject:OrgUnit:B",
  "parentOrg": {"type": "Relationship", "object": "urn:ngsi-ld:TwinObject:OrgUnit:A"}
}
```

---

## 7. JSON Schema验证规则

### 7.1 基础Schema (适用所有子类型)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TwinObject Base Schema",
  "type": "object",
  "required": ["id", "type", "@context", "subType", "twinType", "functionCategory"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^urn:ngsi-ld:(TwinObject:[A-Za-z]+:[A-Za-z0-9_-]+|Workpiece:[A-Za-z0-9_-]+)$"
    },
    "type": {
      "type": "string",
      "const": "TwinObject"
    },
    "@context": {
      "type": "array",
      "minItems": 1
    },
    "subType": {
      "type": "object",
      "required": ["type", "value"],
      "properties": {
        "type": {"const": "Property"},
        "value": {
          "enum": [
            "OrgUnit", "Station", "Position",
            "AutoEquipment", "TransportEquipment", "QCTool",
            "Person", "Material", "Product", "Workpiece"
          ]
        }
      }
    },
    "twinType": {
      "type": "object",
      "required": ["type", "value"],
      "properties": {
        "type": {"const": "Property"},
        "value": {"enum": ["Constituent", "Transitional"]}
      }
    },
    "functionCategory": {
      "type": "object",
      "required": ["type", "value"],
      "properties": {
        "type": {"const": "Property"},
        "value": {
          "type": "string",
          "pattern": "^F[12](\\.[A-Za-z0-9]+)*$"
        }
      }
    }
  }
}
```

### 7.2 AutoEquipment扩展Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TwinObject AutoEquipment Schema",
  "allOf": [
    {"$ref": "#/definitions/TwinObjectBase"},
    {
      "properties": {
        "subType": {
          "properties": {
            "value": {"const": "AutoEquipment"}
          }
        },
        "equipmentType": {
          "type": "object",
          "required": ["type", "value"],
          "properties": {
            "type": {"const": "Property"},
            "value": {
              "enum": ["WeldingRobot", "Welder", "Positioner", "CNC", "PressMachine", "Laser", "Other"]
            }
          }
        }
      },
      "required": ["equipmentType"]
    }
  ]
}
```

---

## 8. 四项任务使用指南

### 8.1 任务1: 数字孪生管理平台

**职责**:
- ✅ TwinObject实体的CRUD操作
- ✅ 关系完整性校验
- ✅ URN唯一性保证
- ✅ 契约验证集成

**关键操作**:
```python
# 创建实体时
entity = create_twinobject(data)
validation_result = validate_twinobject(entity)
if validation_result.is_valid:
    db.insert(entity)
else:
    raise ValidationError(validation_result.errors)

# 更新关系时
station.deployedEquipments.append(new_equipment_urn)
# 同时更新反向关系
equipment.deployedAt = station.id
```

---

### 8.2 任务2: 产线2D地图

**关注字段**:
- ✅ `location` - 显示实体位置
- ✅ `deployedAt` / `currentLocation` - 显示部署和流转关系
- ✅ 通过ModalData查询设备状态显示颜色

**查询示例**:
```
1. 查询所有Station (获取工位布局)
2. 查询Station的deployedEquipments (获取设备位置)
3. 查询Workpiece的currentLocation (获取工件位置)
4. 订阅ModalData更新 (实时状态刷新)
```

---

### 8.3 任务3: 业务优化智能应用

**不同业务方向的TwinObject使用**:

| 业务方向 | 关注的子类型 | 关键字段 |
|---------|------------|---------|
| 生产计划可行性 | Station, AutoEquipment, Person | capacityWip, skills, shiftSchedule |
| 价值流分析 | Station, Workpiece | currentLocation, startTime |
| 库存控制 | Station, Workpiece | capacityWip, currentStatus, currentLocation |
| 质量改进 | AutoEquipment, Workpiece | model, serialNumber, currentStatus |

---

### 8.4 任务4: 生产系统仿真

**使用场景**:
- 读取Station、AutoEquipment配置作为仿真环境
- 读取Product、MBOM作为仿真输入
- 生成Workpiece作为仿真对象
- 更新Workpiece的currentLocation模拟流转

**注意事项**:
- ⚠️ 仿真生成的Workpiece应标注特殊标识(如在metadata中)
- ⚠️ 仿真数据应与真实生产数据区分

---

## 9. 变更历史

| 版本 | 日期 | 变更内容 | 影响范围 |
|-----|------|---------|---------|
| v1.0.0 | 2025-11-10 | 初始版本,定义TwinObject及11种子类型完整契约 | 所有任务 |

---

## 10. 参考文档

- 00_总契约.md - 实体数据契约总体规范
- 数字孪生实体数据目录 - 完整字段说明
- NGSI-LD规范 - https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/

---

**契约维护**: 数字孪生项目组  
**联系方式**: digital-twin-team@example.com
