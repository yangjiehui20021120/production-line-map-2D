# TwinObject Position子类型特有字段设计指南

## 版本: V1.0 | 发布日期: 2025-10-17

---

## 文档摘要

本文档定义TwinObject统一元模型中**Position(台位)**子类型的特有字段规范。Position是Station工位内的精细化空间单元,用于表达工位内部的作业点、上下料点、检验点等具体位置,是实现精准追踪和精细化管理的关键。

**适用对象**: 工艺工程师、IE工程师、数字孪生建模工程师  
**配套文件**: `twinobject_position.schema.json`, `twinobject_station.schema.json`, `twinobject_core_guide.md`

---

## 目录

1. [Position定位与设计理念](#1-position定位与设计理念)
2. [与Station的关系与区别](#2-与station的关系与区别)
3. [核心特有字段详解](#3-核心特有字段详解)
4. [建模场景与决策](#4-建模场景与决策)
5. [完整示例](#5-完整示例)
6. [常见问题FAQ](#6-常见问题faq)

---

## 1. Position定位与设计理念

### 1.1 什么是Position

**Position(台位)**是工位(Station)内部的**细分作业单元**,表示具体的:
- 作业点: 焊接台位、装配台位
- 物料点: 上料点、下料点
- 检验点: 检测台位、测量点
- 暂存点: 工位内缓存位

### 1.2 核心设计理念

**理念1: 空间精细化**
```
产线 (Level 1)
  └─ 区域 (Level 2)
      └─ 工位 Station (Level 3)  ← 粗粒度单元
          └─ 台位 Position (Level 4)  ← 精细化单元
              └─ 设备安装点 (Level 5)
```

**理念2: 相对定位**
- Station使用**绝对坐标**(产线坐标系)
- Position使用**相对偏移**(相对Station原点)
- 便于工位整体移动而不影响内部布局

**理念3: 最小追踪单元**
- Position是在制品位置追踪的**最小粒度**
- `locatedIn`字段可精确到Position级别
- 支持工位内物流精准管理

**理念4: 按需建模**
- **简单工位**: 无需建Position
- **复杂工位**: 必须建Position
- 避免过度建模,保持模型简洁

### 1.3 建模价值

| 价值维度 | 说明 |
|---------|------|
| **精准追踪** | 工件位置精确到具体台位,而非笼统的"在某工位" |
| **精细排程** | 工位内并行作业,多台位独立调度 |
| **瓶颈识别** | 识别工位内哪个台位是瓶颈点 |
| **布局优化** | 工位内布局调整,减少搬运浪费 |
| **人机工程** | 作业姿势、疲劳度评估的基础 |

---

## 2. 与Station的关系与区别

### 2.1 核心区别对比

| 维度 | Station | Position |
|------|---------|----------|
| **层级** | Level 3 (工位级) | Level 4 (台位级) |
| **定位** | 绝对坐标 | 相对偏移 |
| **独立性** | 独立的生产单元 | 依附于Station |
| **必填性** | 产线必有 | 按需建模 |
| **partOf** | 指向产线/区域 | 不使用partOf |
| **belongsToStation** | 不使用 | 必填,指向Station |
| **人员配置** | 有`requiredRoles` | 无(继承Station) |
| **工序执行** | 可执行完整工序 | 执行工序内的工步 |
| **容量** | 工位总容量 | 台位容量(细分) |

### 2.2 关系示意图

```
Station: ST-GZ-03 (侧墙焊接工位03)
│
├─ Position: P1 (上料台位)
│   ├─ 功能: 上料、定位
│   ├─ 偏移: (X:0, Y:0)
│   └─ 容量: 1件
│
├─ Position: P2 (焊接台位)
│   ├─ 功能: 焊接作业
│   ├─ 偏移: (X:2000, Y:0)
│   └─ 设备: Robot-R01, Welder-W01
│
└─ Position: P3 (下料台位)
    ├─ 功能: 检验、下料
    ├─ 偏移: (X:4000, Y:0)
    └─ 容量: 1件
```

### 2.3 字段继承与覆盖

**继承自Station**:
- 人员角色要求
- 安全要求
- 环境规格
- 运行排班

**Position特有**:
- 相对位置偏移
- 台位类型
- 物流连接
- 人机工程学

**覆盖Station**:
- 容量(细分到台位级)
- 安装设备(精确到台位)

---

## 3. 核心特有字段详解

### 3.1 必填字段(4个)

#### `belongsToStation` (必填)
- **类型**: Relationship
- **说明**: 所属工位的引用,建立Position与Station的强制归属关系
- **约束**: 
  - 必须引用已存在的Station
  - Position不能独立存在
- **用途**: 
  - 查询工位内所有台位
  - 级联删除(删除Station时清理Position)

**示例**:
```json
"belongsToStation": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
}
```

#### `positionIndex` (必填)
- **类型**: Property
- **格式**: `P[0-9]+` 或 `[A-Z][0-9]+`
- **说明**: 台位编号,在所属工位内唯一
- **命名规则**:
  - 数字编号: `P1`, `P2`, `P3`...
  - 字母+数字: `A1`, `B1`, `C1`...
  - 功能化命名: `LOAD`, `WELD`, `UNLOAD`

**示例**:
```json
"positionIndex": {
  "type": "Property",
  "value": "P1"
}
```

**ID组合规则**:
```
Position ID = Station ID + "-" + positionIndex
例: urn:ngsi-ld:TwinObject:Position:ST-GZ-03-P1
```

#### `positionType` (必填)
- **类型**: Property
- **枚举值**:
  - `"WorkTable"`: 作业台(焊接、装配等)
  - `"LoadingPoint"`: 上料点
  - `"UnloadingPoint"`: 下料点
  - `"InspectionPoint"`: 检验点
  - `"FixturePoint"`: 夹具定位点
  - `"BufferPoint"`: 工位内缓存点
  - `"HandoverPoint"`: 交接点
- **说明**: 台位的功能分类
- **用途**: 
  - 工艺规划时匹配合适台位
  - 物流路径规划的节点类型
  - 自动化调度的决策依据

**示例**:
```json
"positionType": {
  "type": "Property",
  "value": "WorkTable"
}
```

#### `relativeOffset` (必填)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  offsetX: number,    // X轴偏移(mm)
  offsetY: number,    // Y轴偏移(mm)
  offsetZ?: number,   // Z轴偏移(mm,可选)
  unit: string        // 单位(默认mm)
}
```
- **说明**: 相对于Station原点的坐标偏移
- **坐标系**: 使用Station的局部坐标系
- **用途**: 
  - 3D可视化渲染
  - 机器人路径规划
  - 碰撞检测

**示例**:
```json
"relativeOffset": {
  "type": "Property",
  "value": {
    "offsetX": 2000,
    "offsetY": 500,
    "offsetZ": 800,
    "unit": "mm"
  }
}
```

**计算Position绝对坐标**:
```javascript
positionAbsX = station.location.coordinates[0] + position.relativeOffset.offsetX;
positionAbsY = station.location.coordinates[1] + position.relativeOffset.offsetY;
```

---

### 3.2 容量与设备字段

#### `capacityWip` (建议必填)
- **类型**: Property (Integer)
- **说明**: 台位可容纳的在制品数量
- **关系**: `Sum(Position.capacityWip) ≤ Station.capacityWip`
- **用途**: 细粒度库存控制

**示例**:
```json
"capacityWip": {
  "type": "Property",
  "value": 1
}
```

#### `physicalDimension` (可选)
- **类型**: Property (Object)
- **说明**: 台位物理尺寸
- **用途**: 碰撞检测、空间规划

**示例**:
```json
"physicalDimension": {
  "type": "Property",
  "value": {
    "length": 1500,
    "width": 1000,
    "height": 800,
    "unit": "mm"
  }
}
```

#### `mountedEquipment` (可选)
- **类型**: Relationship (Array)
- **说明**: 安装在该台位的设备/工装
- **细化**: 比Station.deployedEquipment更精确

**示例**:
```json
"mountedEquipment": [
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Fixture:FIX-001"
  }
]
```

---

### 3.3 操作与约束字段

#### `supportedOperations` (建议必填)
- **类型**: Property (Array)
- **枚举值**:
  - `"Loading"`: 上料
  - `"Unloading"`: 下料
  - `"Welding"`: 焊接
  - `"Assembly"`: 装配
  - `"Inspection"`: 检验
  - `"Clamping"`: 夹紧
  - `"Positioning"`: 定位
  - `"Waiting"`: 等待
- **说明**: 该台位支持的操作类型
- **用途**: 工步分配到台位的匹配规则

**示例**:
```json
"supportedOperations": {
  "type": "Property",
  "value": ["Loading", "Positioning", "Clamping"]
}
```

#### `accessDirection` (可选)
- **类型**: Property (Array)
- **说明**: 可接近方向
- **用途**: 机器人路径规划、人员动线设计

**示例**:
```json
"accessDirection": {
  "type": "Property",
  "value": ["Front", "Left"]
}
```

#### `workpieceConstraint` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  allowedTypes?: string[],   // 允许的工件类型
  maxWeight?: number,        // 最大承重(kg)
  maxDimension?: {           // 最大尺寸
    length, width, height, unit
  }
}
```
- **说明**: 工件约束条件
- **用途**: 验证工件是否可放置在该台位

**示例**:
```json
"workpieceConstraint": {
  "type": "Property",
  "value": {
    "allowedTypes": ["SideWall"],
    "maxWeight": 500,
    "maxDimension": {
      "length": 2000,
      "width": 1500,
      "height": 1000,
      "unit": "mm"
    }
  }
}
```

---

### 3.4 状态与流转字段

#### `occupancyStatus` (建议必填)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  trackOccupancy: boolean,        // 是否追踪占用
  allowMultipleWip: boolean,      // 是否允许多件
  defaultStatus: "Empty"|"Occupied"|"Reserved"|"Blocked"
}
```
- **说明**: 占用状态追踪配置
- **用途**: 
  - 实时显示台位空闲/占用
  - 防止重复分配
  - 产能计算

**示例**:
```json
"occupancyStatus": {
  "type": "Property",
  "value": {
    "trackOccupancy": true,
    "allowMultipleWip": false,
    "defaultStatus": "Empty"
  }
}
```

**运行时状态**(存储在`stateAttr`):
```json
"stateAttr": [
  {"name": "current_status", "value": "Occupied"},
  {"name": "current_wip", "value": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00123"},
  {"name": "occupied_since", "value": "2025-10-17T08:30:00Z"}
]
```

#### `sequenceInStation` (可选)
- **类型**: Property (Integer)
- **说明**: 在工位内的工序顺序
- **用途**: 定义台位之间的逻辑顺序

**示例**:
```json
"sequenceInStation": {
  "type": "Property",
  "value": 1
}
```

#### `transferConnections` (建议必填,当有物流流转时)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  upstreamPositions?: string[],    // 上游台位ID
  downstreamPositions?: string[],  // 下游台位ID
  transferMethod?: "Manual"|"Robot"|"Conveyor"|"Crane"|"AGV",
  transferTime?: number            // 标准转运时间(秒)
}
```
- **说明**: 台位间物流连接关系
- **用途**: 
  - 物流路径规划
  - 节拍时间计算
  - 瓶颈分析

**示例**:
```json
"transferConnections": {
  "type": "Property",
  "value": {
    "upstreamPositions": ["urn:ngsi-ld:TwinObject:Position:ST-GZ-03-P1"],
    "downstreamPositions": ["urn:ngsi-ld:TwinObject:Position:ST-GZ-03-P3"],
    "transferMethod": "Robot",
    "transferTime": 15
  }
}
```

---

### 3.5 人机工程与标识字段

#### `ergonomics` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  workingHeight?: number,              // 作业高度(mm)
  reachDistance?: number,              // 可及距离(mm)
  posture?: "Standing"|"Sitting"|"Bending"|"Mixed",
  fatigueLevel?: "Low"|"Medium"|"High"
}
```
- **说明**: 人机工程学信息
- **用途**: 
  - 作业姿势评估
  - 疲劳度分析
  - 工位优化设计

**示例**:
```json
"ergonomics": {
  "type": "Property",
  "value": {
    "workingHeight": 900,
    "reachDistance": 600,
    "posture": "Standing",
    "fatigueLevel": "Low"
  }
}
```

#### `visualMarking` (可选)
- **类型**: Property (Object)
- **说明**: 视觉标识信息
- **用途**: 现场5S管理

**示例**:
```json
"visualMarking": {
  "type": "Property",
  "value": {
    "floorMarking": "黄色边框",
    "labelText": "P1-上料台位",
    "colorCode": "#FFFF00",
    "signageRef": "标识牌-ST03-P1"
  }
}
```

#### `safetyZone` (可选)
- **类型**: Property (Object)
- **说明**: 安全区域定义
- **用途**: 协作机器人安全规划

**示例**:
```json
"safetyZone": {
  "type": "Property",
  "value": {
    "radius": 1500,
    "height": 2000,
    "restrictedAccess": true
  }
}
```

---

### 3.6 性能目标字段

#### `cycleTimeTarget` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  standard?: number,   // 标准时间(秒)
  target?: number,     // 目标时间(秒)
  tolerance?: number   // 容差(±秒)
}
```
- **说明**: 台位级节拍时间目标
- **用途**: 
  - 性能考核
  - 瓶颈识别
  - 改善基准

**示例**:
```json
"cycleTimeTarget": {
  "type": "Property",
  "value": {
    "standard": 120,
    "target": 110,
    "tolerance": 10
  }
}
```

---

## 4. 建模场景与决策

### 4.1 何时需要建Position?

**决策树**:
```
工位是否有多个作业点?
├─ 否 → 不建Position,直接在Station建模
└─ 是 → 继续判断
    ├─ 作业点是否并行工作?
    │   └─ 是 → 必须建Position
    └─ 是否需要精确追踪工件位置?
        └─ 是 → 必须建Position
```

### 4.2 典型建模场景

#### 场景1: 简单工位(不建Position)

**特征**:
- 单一作业点
- 串行工作
- 不需要精确位置追踪

**示例**: 手工装配工位
```json
{
  "id": "urn:ngsi-ld:TwinObject:Station:ST-ASM-01",
  "subType": "Station",
  "capacityWip": 1,
  "deployedEquipment": []
  // 无hasPositions字段
}
```

#### 场景2: 并行作业工位(必建Position)

**特征**:
- 多个作业点
- 可同时作业
- 需要独立追踪

**示例**: 双工位焊接站
```json
{
  "id": "urn:ngsi-ld:TwinObject:Station:ST-WELD-02",
  "subType": "Station",
  "capacityWip": 2,
  "hasPositions": [
    "urn:ngsi-ld:TwinObject:Position:ST-WELD-02-P1",
    "urn:ngsi-ld:TwinObject:Position:ST-WELD-02-P2"
  ]
}
```

每个Position独立:
- P1: 焊接左侧总成
- P2: 焊接右侧总成

#### 场景3: 流程式工位(必建Position)

**特征**:
- 上料→加工→下料流程
- 顺序流转
- 需要追踪工件在哪个环节

**示例**: 涂装工位
```
P1(上料) → P2(喷涂) → P3(烘干) → P4(下料)
```

#### 场景4: 复杂装配工位(必建Position)

**特征**:
- 多组件装配
- 多台位协作
- 复杂物流

**示例**: 车身总装工位
```
      ┌─ P2(左门装配)
P1 ───┤
(主体)├─ P3(右门装配)
      │
      └─ P4(总检) → P5(下线)
```

---

## 5. 完整示例

### 5.1 上料台位

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:Position:ST-GZ-03-P1",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "侧墙焊接工位03-上料台位"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "Position"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.4.1"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 4
  },
  
  "belongsToStation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
  },
  
  "positionIndex": {
    "type": "Property",
    "value": "P1"
  },
  
  "positionType": {
    "type": "Property",
    "value": "LoadingPoint"
  },
  
  "relativeOffset": {
    "type": "Property",
    "value": {
      "offsetX": 0,
      "offsetY": 0,
      "offsetZ": 800,
      "unit": "mm"
    }
  },
  
  "capacityWip": {
    "type": "Property",
    "value": 1
  },
  
  "physicalDimension": {
    "type": "Property",
    "value": {
      "length": 2000,
      "width": 1500,
      "height": 1000,
      "unit": "mm"
    }
  },
  
  "mountedEquipment": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:Fixture:FIX-LOAD-01"
    }
  ],
  
  "supportedOperations": {
    "type": "Property",
    "value": ["Loading", "Positioning", "Clamping"]
  },
  
  "accessDirection": {
    "type": "Property",
    "value": ["Front", "Left"]
  },
  
  "occupancyStatus": {
    "type": "Property",
    "value": {
      "trackOccupancy": true,
      "allowMultipleWip": false,
      "defaultStatus": "Empty"
    }
  },
  
  "workpieceConstraint": {
    "type": "Property",
    "value": {
      "allowedTypes": ["SideWall"],
      "maxWeight": 500,
      "maxDimension": {
        "length": 1800,
        "width": 1200,
        "height": 800,
        "unit": "mm"
      }
    }
  },
  
  "sequenceInStation": {
    "type": "Property",
    "value": 1
  },
  
  "transferConnections": {
    "type": "Property",
    "value": {
      "upstreamPositions": [],
      "downstreamPositions": [
        "urn:ngsi-ld:TwinObject:Position:ST-GZ-03-P2"
      ],
      "transferMethod": "Robot",
      "transferTime": 15
    }
  },
  
  "ergonomics": {
    "type": "Property",
    "value": {
      "workingHeight": 900,
      "reachDistance": 600,
      "posture": "Standing",
      "fatigueLevel": "Low"
    }
  },
  
  "visualMarking": {
    "type": "Property",
    "value": {
      "floorMarking": "黄色边框-上料区",
      "labelText": "P1",
      "colorCode": "#FFFF00"
    }
  },
  
  "cycleTimeTarget": {
    "type": "Property",
    "value": {
      "standard": 60,
      "target": 50,
      "tolerance": 5
    }
  },
  
  "stateAttr": {
    "type": "Property",
    "value": [
      {"name": "current_status", "value": "Empty"},
      {"name": "last_occupied", "value": "2025-10-17T08:15:00Z"}
    ]
  }
}
```

---

## 6. 常见问题FAQ

### Q1: Position必须使用partOf吗?

**A**: **不使用**`partOf`,而是使用`belongsToStation`。

**原因**:
- `partOf`是通用的层级关系
- `belongsToStation`是Position特有的强制归属
- 语义更明确,约束更强

### Q2: 如何计算Position的绝对坐标?

**A**: 
```javascript
// Station绝对坐标
stationX = station.location.coordinates[0];
stationY = station.location.coordinates[1];

// Position相对偏移
offsetX = position.relativeOffset.offsetX;
offsetY = position.relativeOffset.offsetY;

// Position绝对坐标
positionX = stationX + offsetX;
positionY = stationY + offsetY;
```

### Q3: 工件的locatedIn应指向Station还是Position?

**A**: **优先指向Position**(如果存在),否则指向Station。

**规则**:
```javascript
if (station.hasPositions && station.hasPositions.length > 0) {
  workpiece.locatedIn = positionId;  // 精确到台位
} else {
  workpiece.locatedIn = stationId;   // 粗略到工位
}
```

### Q4: 如何处理Position与设备的关系?

**A**: 
- **Position.mountedEquipment**: 固定安装在台位的设备
- **Station.deployedEquipment**: 工位所有设备的总和

**关系**:
```
Station.deployedEquipment = 
  ∪(Position[i].mountedEquipment) + 工位级共享设备
```

### Q5: Position能否跨Station引用?

**A**: **严格禁止**。Position必须且只能属于一个Station。

**验证**:
```javascript
assert(position.belongsToStation !== null);
assert(只有一个belongsToStation);
```

### Q6: 如何设计台位间的转运时间?

**A**: 在`transferConnections`中配置:

```json
"transferConnections": {
  "transferMethod": "Robot",
  "transferTime": 15,  // 基准时间(秒)
  ...
}
```

**总转运时间** = `transferTime` + 设备动作时间 + 等待时间

---

**文档版本**: V1.0  
**发布日期**: 2025-10-17  
**维护部门**: 工艺工程部 & 数字孪生架构组

---

**版权声明**: 本文档为内部技术规范,未经授权不得外传。