# TwinObject OrgUnit子类型特有字段设计指南

## 版本: V1.0 | 发布日期: 2025-10-17

---

## 文档摘要

本文档定义TwinObject统一元模型中**OrgUnit(组织单元)**子类型的特有字段规范。OrgUnit表达企业的组织结构,从工厂到车间到产线再到班组,形成完整的管理层级,为责任分配、资源管理和绩效考核提供组织框架。

**适用对象**: 组织管理员、HR管理员、生产管理者、数字孪生建模工程师  
**配套文件**: `twinobject_orgunit.schema.json`, `twinobject_person.schema.json`, `专题三:Role&Assignment`

---

## 目录

1. [OrgUnit在数字孪生中的定位](#1-orgunit在数字孪生中的定位)
2. [核心设计理念](#2-核心设计理念)
3. [典型组织层级结构](#3-典型组织层级结构)
4. [特有字段详解](#4-特有字段详解)
5. [完整示例](#5-完整示例)
6. [常见问题FAQ](#6-常见问题faq)

---

## 1. OrgUnit在数字孪生中的定位

### 1.1 组织单元的作用

**OrgUnit(组织单元)**是企业组织结构的数字化表达,承担以下核心职能:

| 职能 | 说明 | 体现字段 |
|------|------|----------|
| **层级管理** | 建立清晰的组织层级 | `parentOrg`, `childOrgs`, `orgLevel` |
| **责任归属** | 明确管理责任和范围 | `manager`, `responsibilities` |
| **资源管理** | 管理人员、设备等资产 | `headcount`, `managedAssets` |
| **绩效考核** | 设定和追踪KPI目标 | `kpiTargets` |
| **成本核算** | 成本中心和预算管理 | `costCenter`, `budgetInfo` |

### 1.2 与其他实体的关系

```
OrgUnit (组织框架)
    ├─ Person → department (人员归属)
    ├─ Assignment → orgId (岗位指派范围)
    ├─ Role → orgScope (角色适用范围)
    ├─ Station → partOf (工位归属)
    └─ Scene → 场景执行的组织范围
```

### 1.3 典型应用场景

**场景1: 责任追溯**
```
质量问题发生 → Scene记录 → 追溯到工位 → 归属到班组(OrgUnit) 
              → 找到班组长 → 落实责任
```

**场景2: 资源调度**
```
生产任务下达 → 分配到产线(OrgUnit) → 产线分配到班组 
            → 班组安排人员(Assignment) → 执行
```

**场景3: 绩效分析**
```
采集生产数据 → 按OrgUnit聚合 → 计算KPI → 与target对比 
            → 生成绩效报告 → 持续改进
```

---

## 2. 核心设计理念

### 2.1 设计原则

**P1: 层级清晰**
- 通过`parentOrg`/`childOrgs`构建树形结构
- 通过`orgLevel`标识层级深度
- 避免循环引用和孤立节点

**P2: 职责明确**
- 每个OrgUnit有明确的`manager`
- `responsibilities`定义职责范围
- `kpiTargets`设定考核目标

**P3: 动态灵活**
- 支持组织重组(`orgStatus`: Restructuring)
- 支持临时组织单元(项目组)
- 人员与组织动态关联

**P4: 数据驱动**
- KPI目标数字化
- 实时状态追踪
- 支持绩效分析

### 2.2 建模边界

**建模为OrgUnit**:
- ✅ 有明确管理职能的单元(工厂、车间、产线、班组)
- ✅ 有独立KPI考核的单元
- ✅ 有人员编制的单元

**不建模为OrgUnit**:
- ❌ 纯技术分类(不涉及管理)
- ❌ 临时工作组(无固定编制)
- ❌ 虚拟概念(无实际管理职能)

---

## 3. 典型组织层级结构

### 3.1 侧墙产线组织架构

```
Level 1: 工厂 (Factory)
    └─ 某汽车制造厂
        ↓
Level 2: 车间 (Workshop)
    └─ 车体车间
        ↓
Level 3: 产线 (ProductionLine)
    └─ 侧墙产线
        ↓
Level 4: 班组 (Team)
    ├─ 早班班组
    ├─ 中班班组
    └─ 晚班班组
```

### 3.2 层级对应关系

| 层级 | orgUnitType | orgLevel | 典型名称 | 负责人 |
|------|-------------|----------|---------|--------|
| 1 | Factory | 1 | 某汽车制造厂 | 厂长 |
| 2 | Workshop | 2 | 车体车间 | 车间主任 |
| 3 | ProductionLine | 3 | 侧墙产线 | 产线经理 |
| 4 | Team | 4 | 早班班组 | 班组长 |

### 3.3 partOf vs parentOrg

**关键区别**:

| 字段 | 用途 | 适用对象 | 关系类型 |
|------|------|---------|---------|
| `partOf` | 物理/空间归属 | Station, Equipment | 固定的从属关系 |
| `parentOrg` | 组织/管理归属 | OrgUnit | 可调整的层级关系 |

**示例**:
```json
// Station使用partOf
{
  "id": "...Station:ST-GZ-03",
  "partOf": "...ProductionLine:SideWall"  // 物理归属产线
}

// OrgUnit使用parentOrg
{
  "id": "...OrgUnit:Team-A",
  "parentOrg": "...OrgUnit:SideWallLine"  // 管理归属产线
}
```

---

## 4. 特有字段详解

### 4.1 核心必填字段

#### `orgUnitType` (必填)
- **类型**: Property
- **枚举值**:
  - `"Factory"`: 工厂
  - `"Workshop"`: 车间
  - `"ProductionLine"`: 产线
  - `"Team"`: 班组/小组
  - `"Department"`: 部门(职能部门)
  - `"Division"`: 事业部
- **说明**: 组织单元类型分类

**示例**:
```json
"orgUnitType": {
  "type": "Property",
  "value": "ProductionLine"
}
```

#### `orgLevel` (必填)
- **类型**: Property (Integer)
- **说明**: 组织层级深度
- **约定**:
  - Level 1: 最高层(工厂/公司)
  - Level 2: 二级(车间/事业部)
  - Level 3: 三级(产线/部门)
  - Level 4+: 更细粒度(班组等)

**示例**:
```json
"orgLevel": {
  "type": "Property",
  "value": 3
}
```

#### `orgStatus` (必填)
- **类型**: Property
- **枚举值**:
  - `"Active"`: 运营中
  - `"Inactive"`: 暂停
  - `"Restructuring"`: 重组中
  - `"Dissolving"`: 撤销中
- **说明**: 当前组织状态

**示例**:
```json
"orgStatus": {
  "type": "Property",
  "value": "Active"
}
```

---

### 4.2 层级关系字段

#### `parentOrg` (建议必填,顶层除外)
- **类型**: Relationship
- **说明**: 上级组织单元引用
- **约束**:
  - 顶层(Level 1)可为空
  - 其他层级建议必填
  - 不允许循环引用

**示例**:
```json
"parentOrg": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:OrgUnit:BodyWorkshop"
}
```

#### `childOrgs` (可选)
- **类型**: Relationship (Array)
- **说明**: 下级组织单元清单
- **用途**: 
  - 快速查询子单元
  - 构建组织树
  - 级联操作

**示例**:
```json
"childOrgs": [
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:OrgUnit:Team-MorningShift"
  },
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:OrgUnit:Team-AfternoonShift"
  }
]
```

**自动维护**: 创建子OrgUnit时自动更新父OrgUnit的`childOrgs`。

---

### 4.3 人员与管理字段

#### `headcount` (建议必填)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  total: number,         // 总编制
  current: number,       // 当前人数
  managers?: number,     // 管理人员
  operators?: number,    // 操作人员
  technicians?: number   // 技术人员
}
```
- **说明**: 人员编制情况
- **用途**: 
  - 人力资源规划
  - 缺编提醒
  - 人员配比分析

**示例**:
```json
"headcount": {
  "type": "Property",
  "value": {
    "total": 60,
    "current": 58,
    "managers": 5,
    "operators": 48,
    "technicians": 5
  }
}
```

#### `manager` (建议必填)
- **类型**: Relationship
- **说明**: 负责人(引用Person实体)
- **用途**: 
  - 责任归属
  - 审批流程
  - 沟通联系

**示例**:
```json
"manager": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:Person:EMP-2024-050"
}
```

#### `shiftTeams` (可选,适用于Team类型)
- **类型**: Property (Array)
- **说明**: 班组配置
- **用途**: 排班管理

**示例**:
```json
"shiftTeams": {
  "type": "Property",
  "value": [
    {
      "teamId": "TEAM-A-MORNING",
      "teamName": "A班早班",
      "shiftId": "早班",
      "teamLeader": "EMP-001",
      "memberCount": 15
    }
  ]
}
```

---

### 4.4 运营与绩效字段

#### `operatingSchedule` (建议必填)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  shiftPattern: "TwoShift"|"ThreeShift"|"FourShift"|"Continuous"|"DayOnly",
  shiftsPerDay: number,
  workingDays: number[],      // 1-7 (周一到周日)
  annualWorkingDays: number
}
```
- **说明**: 运营时间安排
- **用途**: 
  - 产能计算
  - 排班规划
  - OEE基准

**示例**:
```json
"operatingSchedule": {
  "type": "Property",
  "value": {
    "shiftPattern": "ThreeShift",
    "shiftsPerDay": 3,
    "workingDays": [1,2,3,4,5,6],
    "annualWorkingDays": 310
  }
}
```

#### `kpiTargets` (建议必填)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  oee?: number,              // OEE目标(%)
  qualityRate?: number,      // 合格率目标(%)
  throughput?: number,       // 产量目标
  cycleTime?: number,        // 节拍目标(秒)
  customKPIs?: [
    {kpiCode, kpiName, target, unit}
  ]
}
```
- **说明**: KPI目标设定
- **用途**: 
  - 绩效考核基准
  - 实时对比分析
  - 持续改进目标

**示例**:
```json
"kpiTargets": {
  "type": "Property",
  "value": {
    "oee": 85,
    "qualityRate": 99.5,
    "throughput": 12000,
    "customKPIs": [
      {
        "kpiCode": "ENERGY_CONSUMPTION",
        "kpiName": "单位能耗",
        "target": 5.2,
        "unit": "kWh/件"
      }
    ]
  }
}
```

#### `responsibilities` (建议必填)
- **类型**: Property (Array)
- **说明**: 职责范围列表
- **用途**: 明确管理边界

**示例**:
```json
"responsibilities": {
  "type": "Property",
  "value": [
    "负责侧墙产线日常生产组织",
    "确保产线安全和质量",
    "完成月度生产计划",
    "人员培训与绩效管理"
  ]
}
```

---

### 4.5 资产与资源字段

#### `managedAssets` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  stations?: string[],    // 工位ID列表
  equipment?: string[],   // 设备ID列表
  tools?: string[]        // 工具ID列表
}
```
- **说明**: 管理的资产清单
- **用途**: 
  - 资产盘点
  - 维护责任
  - 成本分摊

**示例**:
```json
"managedAssets": {
  "type": "Property",
  "value": {
    "stations": [
      "ST-GZ-01", "ST-GZ-02", "ST-GZ-03"
    ],
    "equipment": [
      "ROBOT-R01", "WELDER-W01"
    ]
  }
}
```

#### `productScope` (可选)
- **类型**: Property (Array)
- **说明**: 负责生产的产品类型
- **用途**: 产品归属管理

**示例**:
```json
"productScope": {
  "type": "Property",
  "value": [
    "SideWall-TypeA",
    "SideWall-TypeB"
  ]
}
```

---

### 4.6 财务与联系字段

#### `costCenter` (可选)
- **类型**: Property
- **说明**: 成本中心编码
- **用途**: 财务核算

**示例**:
```json
"costCenter": {
  "type": "Property",
  "value": "CC-BODY-SW-001"
}
```

#### `budgetInfo` (可选)
- **类型**: Property (Object)
- **说明**: 预算信息
- **用途**: 成本控制

**示例**:
```json
"budgetInfo": {
  "type": "Property",
  "value": {
    "annualBudget": 5000000,
    "currency": "CNY",
    "fiscalYear": "2025"
  }
}
```

#### `contactInfo` (建议必填)
- **类型**: Property (Object)
- **说明**: 联系信息
- **用途**: 沟通协调

**示例**:
```json
"contactInfo": {
  "type": "Property",
  "value": {
    "phone": "010-12345678",
    "email": "sidewall.line@factory.com",
    "location": "车体车间二楼西侧",
    "officeNumber": "B2-W-201"
  }
}
```

---

## 5. 完整示例

### 5.1 产线级OrgUnit

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:OrgUnit:SideWallLine",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "侧墙产线"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "OrgUnit"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.4.1"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 3
  },
  
  "orgUnitType": {
    "type": "Property",
    "value": "ProductionLine"
  },
  
  "orgLevel": {
    "type": "Property",
    "value": 3
  },
  
  "orgStatus": {
    "type": "Property",
    "value": "Active"
  },
  
  "parentOrg": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:OrgUnit:BodyWorkshop"
  },
  
  "childOrgs": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:OrgUnit:Team-MorningShift"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:OrgUnit:Team-AfternoonShift"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:OrgUnit:Team-NightShift"
    }
  ],
  
  "headcount": {
    "type": "Property",
    "value": {
      "total": 60,
      "current": 58,
      "managers": 5,
      "operators": 48,
      "technicians": 5
    }
  },
  
  "manager": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Person:EMP-2024-050"
  },
  
  "operatingSchedule": {
    "type": "Property",
    "value": {
      "shiftPattern": "ThreeShift",
      "shiftsPerDay": 3,
      "workingDays": [1,2,3,4,5,6],
      "annualWorkingDays": 310
    }
  },
  
  "kpiTargets": {
    "type": "Property",
    "value": {
      "oee": 85,
      "qualityRate": 99.5,
      "throughput": 12000,
      "cycleTime": 180,
      "customKPIs": [
        {
          "kpiCode": "ENERGY_CONSUMPTION",
          "kpiName": "单位能耗",
          "target": 5.2,
          "unit": "kWh/件"
        }
      ]
    }
  },
  
  "responsibilities": {
    "type": "Property",
    "value": [
      "负责侧墙产线日常生产组织",
      "确保产线安全和质量",
      "完成月度生产计划12000件",
      "人员培训与绩效管理",
      "设备维护与改善提案"
    ]
  },
  
  "managedAssets": {
    "type": "Property",
    "value": {
      "stations": [
        "ST-GZ-01", "ST-GZ-02", "ST-GZ-03",
        "ST-GZ-04", "ST-GZ-05"
      ],
      "equipment": [
        "ROBOT-R01", "ROBOT-R02", "ROBOT-R03",
        "WELDER-W01", "WELDER-W02"
      ],
      "tools": [
        "FIX-001", "FIX-002", "QC-CMM-01"
      ]
    }
  },
  
  "productScope": {
    "type": "Property",
    "value": [
      "SideWall-TypeA",
      "SideWall-TypeB",
      "SideWall-TypeC"
    ]
  },
  
  "costCenter": {
    "type": "Property",
    "value": "CC-BODY-SW-001"
  },
  
  "budgetInfo": {
    "type": "Property",
    "value": {
      "annualBudget": 5000000,
      "currency": "CNY",
      "fiscalYear": "2025"
    }
  },
  
  "contactInfo": {
    "type": "Property",
    "value": {
      "phone": "010-12345678-801",
      "email": "sidewall.line@factory.com",
      "location": "车体车间二楼西侧",
      "officeNumber": "B2-W-201"
    }
  },
  
  "effectiveDate": {
    "type": "Property",
    "value": "2020-01-01"
  },
  
  "stateAttr": {
    "type": "Property",
    "value": [
      {"name": "current_shift", "value": "早班"},
      {"name": "current_headcount", "value": 58},
      {"name": "mtd_output", "value": 8543},
      {"name": "mtd_oee", "value": 87.2}
    ]
  }
}
```

### 5.2 班组级OrgUnit

```json
{
  "id": "urn:ngsi-ld:TwinObject:OrgUnit:Team-MorningShift",
  "type": "TwinObject",
  
  "name": {"value": "侧墙产线早班班组"},
  "orgUnitType": {"value": "Team"},
  "orgLevel": {"value": 4},
  "orgStatus": {"value": "Active"},
  
  "parentOrg": {
    "object": "urn:ngsi-ld:TwinObject:OrgUnit:SideWallLine"
  },
  
  "headcount": {
    "value": {
      "total": 20,
      "current": 19,
      "managers": 1,
      "operators": 16,
      "technicians": 2
    }
  },
  
  "manager": {
    "object": "urn:ngsi-ld:TwinObject:Person:EMP-2023-012"
  },
  
  "operatingSchedule": {
    "value": {
      "shiftPattern": "DayOnly",
      "shiftsPerDay": 1,
      "workingDays": [1,2,3,4,5,6]
    }
  },
  
  "shiftTeams": {
    "value": [
      {
        "teamId": "TEAM-A-MORNING",
        "teamName": "A班早班",
        "shiftId": "早班",
        "teamLeader": "EMP-2023-012",
        "memberCount": 19
      }
    ]
  },
  
  "kpiTargets": {
    "value": {
      "qualityRate": 99.6,
      "throughput": 4000
    }
  },
  
  "responsibilities": {
    "value": [
      "完成早班生产任务",
      "确保班次质量和安全",
      "交接班记录维护"
    ]
  }
}
```

---

## 6. 常见问题FAQ

### Q1: OrgUnit与Station有什么区别?

**A**: 

| 维度 | OrgUnit | Station |
|------|---------|---------|
| 性质 | 组织管理单元 | 物理空间单元 |
| 层级 | 工厂→车间→产线→班组 | 产线→区域→工位 |
| 包含 | 人员编制 | 设备资产 |
| 关系字段 | `parentOrg` | `partOf` |
| 绩效 | KPI目标 | 产出追踪 |

### Q2: 组织重组时如何处理?

**A**: 使用`orgStatus`标识+保留历史:

```json
// 旧组织
{
  "id": "...OrgUnit:OldDept",
  "orgStatus": "Dissolving",
  "stateAttr": [
    {"name": "dissolved_date", "value": "2025-06-30"},
    {"name": "merged_into", "value": "...OrgUnit:NewDept"}
  ]
}

// 新组织
{
  "id": "...OrgUnit:NewDept",
  "orgStatus": "Active",
  "effectiveDate": "2025-07-01"
}
```

### Q3: 如何查询某人所属组织?

**A**: 通过Person.department:

```json
// Person实体
{
  "id": "...Person:EMP-001",
  "department": {
    "object": "urn:ngsi-ld:TwinObject:OrgUnit:Team-A"
  }
}

// 查询
SELECT p.id, p.name, o.name as org_name
FROM Person p
JOIN OrgUnit o ON o.id = p.department
WHERE p.id = 'EMP-001'
```

### Q4: KPI实际值存哪里?

**A**: `kpiTargets`存目标,实际值在`stateAttr`:

```json
{
  "kpiTargets": {
    "value": {"oee": 85}  // 目标
  },
  "stateAttr": [
    {"name": "mtd_oee", "value": 87.2},  // 月度实际
    {"name": "ytd_oee", "value": 85.8}   // 年度实际
  ]
}
```

### Q5: childOrgs需要手动维护吗?

**A**: 建议自动维护:

```javascript
// 创建子OrgUnit时
function createChildOrg(childData) {
  // 1. 创建子单元
  const child = createOrgUnit(childData);
  
  // 2. 自动更新父单元
  const parent = getOrgUnit(childData.parentOrg);
  parent.childOrgs.push(child.id);
  updateOrgUnit(parent);
  
  return child;
}
```

### Q6: 如何构建完整组织树?

**A**: 递归查询:

```javascript
function buildOrgTree(rootId) {
  const root = getOrgUnit(rootId);
  
  function expand(node) {
    if (node.childOrgs) {
      node.children = node.childOrgs.map(childId => {
        const child = getOrgUnit(childId);
        return expand(child);
      });
    }
    return node;
  }
  
  return expand(root);
}
```

### Q7: 矩阵式组织如何建模?

**A**: 一人多OrgUnit归属:

```json
// Person可属于多个OrgUnit
{
  "id": "...Person:EMP-001",
  "department": "...OrgUnit:ProductionLine",  // 主部门
  "secondaryOrgs": [                          // 兼职部门
    "...OrgUnit:QualityDept",
    "...OrgUnit:ProjectTeam-A"
  ]
}
```

---

**文档版本**: V1.0  
**发布日期**: 2025-10-17  
**维护部门**: 组织管理部 & 数字孪生架构组

---

**版权声明**: 本文档为内部技术规范,未经授权不得外传。