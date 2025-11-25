# TwinObject Station子类型特有字段设计指南

## 版本: V1.0 | 发布日期: 2025-10-17

---

## 文档摘要

本文档定义TwinObject统一元模型中**Station(工位)**子类型的特有字段规范。Station是生产制造中的核心空间设施,承载工序执行、设备部署和人员作业,是物理流、信息流、控制流、行为流和责任流的交汇点。

**适用对象**: 工艺工程师、产线规划师、数字孪生建模工程师  
**配套文件**: `twinobject_station.schema.json`, `twinobject_core_guide.md`

---

## 目录

1. [Station子类型定位](#1-station子类型定位)
2. [核心设计理念](#2-核心设计理念)
3. [特有字段详解](#3-特有字段详解)
4. [建模约束与规则](#4-建模约束与规则)
5. [完整建模示例](#5-完整建模示例)
6. [常见问题FAQ](#6-常见问题faq)

---

## 1. Station子类型定位

### 1.1 什么是Station

**Station(工位)**是制造系统中具有明确边界的**作业空间单元**,特点:
- **固定性**: 位置固定,不随生产流程移动
- **功能性**: 承载特定工序的执行
- **容器性**: 包含设备、台位、在制品等子对象
- **责任性**: 明确的人员和角色归属

### 1.2 Station在数字孪生中的角色

Station是连接**蓝本(MBOM)**与**实例(Scene)**的关键节点:

```
MBOM工序 → 指定可用Station白名单 → 运行时选择具体Station → 生成Scene实例
```

**五流交汇点**:
- **物理流**: 在制品进出工位
- **信息流**: 设备数据采集节点
- **控制流**: 工序指令下发目标
- **行为流**: 设备状态机运行载体
- **责任流**: 人员岗位分配单元

### 1.3 与其他子类型的关系

| 对比 | Station | BufferZone | Position |
|------|---------|------------|----------|
| 层级 | 工位级(Level 3) | 工位级(Level 3) | 台位级(Level 4) |
| 功能 | 执行工序 | 临时存放 | 工位内细分 |
| 人员 | 有 | 无 | 视情况 |
| 设备 | 有 | 通常无 | 可能有 |
| `subType` | `Station` | `BufferZone` | `Position` |

---

## 2. 核心设计理念

### 2.1 设计原则

**P1: 空间容器抽象**
- Station是逻辑空间,包含台位(Position)和设备
- 通过`hasPositions`和`deployedEquipment`关系表达

**P2: 能力显式声明**
- 通过`compatibleProcCodes`声明可执行工序
- 通过`requiredRoles`声明所需岗位
- 不隐含,全部显式配置

**P3: 安全第一**
- 通过`hazardFlags`标识危险作业类型
- 通过`safetyRequirements`详细说明安全要求
- 支撑安全管理闭环

**P4: 数据驱动运维**
- 通过`statusTracking`配置追踪维度
- 支持占用率、产出、质量等多维监控
- 为优化决策提供数据基础

### 2.2 字段分层

```
L1: 基础分类
    ├─ stationCategory (工位类别)
    ├─ areaCode (区域)
    └─ zoneId (分区)

L2: 容量与结构
    ├─ capacityWip (容量)
    ├─ hasPositions (台位清单)
    └─ deployedEquipment (设备清单)

L3: 能力与安全
    ├─ compatibleProcCodes (可执行工序)
    ├─ requiredRoles (所需岗位)
    ├─ hazardFlags (危险标记)
    └─ safetyRequirements (安全要求)

L4: 环境与设施
    ├─ layoutInfo (布局信息)
    ├─ environmentalSpec (环境规格)
    └─ utilityConnections (公用工程)

L5: 运维管理
    ├─ statusTracking (状态追踪)
    ├─ operatingSchedule (运行排班)
    └─ maintenanceAccess (维护通道)
```

---

## 3. 特有字段详解

### 3.1 基础分类字段

#### `stationCategory` (必填)
- **类型**: Property
- **枚举值**:
  - `"ProductionStation"`: 生产工位(加工、装配等)
  - `"InspectionStation"`: 检验工位(质检、测量)
  - `"AssemblyStation"`: 装配工位(组装专用)
  - `"BufferZone"`: 缓存区(暂存专用)
  - `"HandlingStation"`: 搬运工位(转运节点)
- **说明**: 工位的一级功能分类
- **用途**: 
  - 快速过滤特定类型工位
  - 决定后续管理流程
  - 影响MBOM匹配规则

**示例**:
```json
"stationCategory": {
  "type": "Property",
  "value": "ProductionStation"
}
```

#### `areaCode` / `zoneId` (建议必填)
- **类型**: Property
- **说明**: 工位所属的区域和分区编码
- **层级关系**: 产线 → 区域(Area) → 分区(Zone) → 工位(Station)
- **用途**: 构建空间层级,支持区域化管理

**示例**:
```json
"areaCode": {
  "type": "Property",
  "value": "WELD-AREA"
},
"zoneId": {
  "type": "Property",
  "value": "ZONE-A"
}
```

---

### 3.2 容量与结构字段

#### `capacityWip` (建议必填)
- **类型**: Property (Integer)
- **说明**: 工位可同时容纳的在制品数量
- **约束**: ≥0
- **用途**: 
  - 生产排程参考
  - 防止工位过载
  - 计算在制品库存

**示例**:
```json
"capacityWip": {
  "type": "Property",
  "value": 2
}
```

#### `hasPositions` (可选)
- **类型**: Relationship (Array)
- **说明**: 工位包含的台位清单
- **引用**: Position子类型的TwinObject URN
- **用途**: 表达工位内部精细化布局

**示例**:
```json
"hasPositions": [
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Position:ST-GZ-03-P1"
  },
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Position:ST-GZ-03-P2"
  }
]
```

#### `deployedEquipment` (建议必填)
- **类型**: Relationship (Array)
- **说明**: 部署在工位的设备清单
- **引用**: 各类设备TwinObject URN
- **用途**: 
  - 资源盘点
  - 能力计算
  - 故障诊断

**示例**:
```json
"deployedEquipment": [
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Robot:ROBOT-R01"
  },
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Welder:WELDER-W01"
  }
]
```

---

### 3.3 能力与安全字段

#### `compatibleProcCodes` (建议必填)
- **类型**: Property (Array)
- **说明**: 工位可执行的工序代码白名单
- **用途**: 
  - MBOM匹配: 工序指定`allowed_station_codes`
  - 排程约束: 只能调度兼容工序
  - 能力验证: 确保工位有能力执行

**示例**:
```json
"compatibleProcCodes": {
  "type": "Property",
  "value": [
    "PROC-WELD-01",
    "PROC-WELD-02",
    "PROC-SPOT-WELD"
  ]
}
```

#### `requiredRoles` (建议必填)
- **类型**: Property (Array)
- **说明**: 工位运行所需的岗位角色清单
- **用途**: 
  - 人员排班参考
  - 检查是否有Assignment覆盖
  - 责任流完整性验证

**示例**:
```json
"requiredRoles": {
  "type": "Property",
  "value": [
    "ROLE_WELDER",
    "ROLE_QC_INSPECTOR"
  ]
}
```

#### `hazardFlags` (可选)
- **类型**: Property (Array)
- **枚举值**:
  - `"Welding"`: 焊接作业
  - `"Lifting"`: 起重作业
  - `"HighVoltage"`: 高压电作业
  - `"HighTemperature"`: 高温作业
  - `"ConfinedSpace"`: 受限空间
  - `"Chemical"`: 化学品
  - `"Radiation"`: 辐射
  - `"Noise"`: 噪声
- **说明**: 危险作业类型标记
- **用途**: 
  - 安全培训提示
  - 作业许可管理
  - 应急预案匹配

**示例**:
```json
"hazardFlags": {
  "type": "Property",
  "value": ["Welding", "Lifting"]
}
```

#### `safetyRequirements` (建议必填,当有hazardFlags时)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  ppe?: string[],              // 个人防护装备
  certifications?: string[],   // 所需安全资质
  procedures?: string[],       // 安全操作规程
  emergencyProtocol?: string   // 应急预案
}
```
- **说明**: 详细的安全要求说明
- **用途**: 
  - 作业前安全检查清单
  - 新人培训材料
  - 安全审计依据

**示例**:
```json
"safetyRequirements": {
  "type": "Property",
  "value": {
    "ppe": [
      "焊接面罩",
      "防护手套",
      "安全鞋",
      "防尘口罩"
    ],
    "certifications": [
      "焊工证",
      "安全培训证"
    ],
    "procedures": [
      "SOP-SAFETY-001: 焊接作业安全规程",
      "SOP-SAFETY-005: 起重作业安全规程"
    ],
    "emergencyProtocol": "发生火灾立即使用CO2灭火器,疏散至安全区域"
  }
}
```

---

### 3.4 环境与设施字段

#### `layoutInfo` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  dimension?: {length, width, height, unit},
  accessDirection?: ("Front"|"Back"|"Left"|"Right"|"Top")[],
  floorMarking?: string
}
```
- **说明**: 工位布局信息
- **用途**: 
  - 3D可视化
  - 物流路径规划
  - 设备安装验证

**示例**:
```json
"layoutInfo": {
  "type": "Property",
  "value": {
    "dimension": {
      "length": 6000,
      "width": 4000,
      "height": 3000,
      "unit": "mm"
    },
    "accessDirection": ["Front", "Left"],
    "floorMarking": "黄色边界线,地面编码ST-GZ-03"
  }
}
```

#### `environmentalSpec` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  temperatureRange?: {min, max, unit},
  humidityRange?: {min, max, unit},
  ventilation?: "Natural"|"Forced"|"LocalExhaust"|"None",
  lighting?: {level, type}
}
```
- **说明**: 环境规格要求
- **用途**: 
  - 设备安装条件验证
  - 环境监控告警阈值
  - 质量追溯环境因素

**示例**:
```json
"environmentalSpec": {
  "type": "Property",
  "value": {
    "temperatureRange": {"min": 15, "max": 30, "unit": "°C"},
    "humidityRange": {"min": 30, "max": 70, "unit": "%RH"},
    "ventilation": "LocalExhaust",
    "lighting": {"level": 500, "type": "LED"}
  }
}
```

#### `utilityConnections` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  power?: {voltage, capacity},
  compressed_air?: {pressure, flow},
  gas?: string[],
  water?: boolean
}
```
- **说明**: 公用工程接口配置
- **用途**: 
  - 设备安装可行性验证
  - 能源消耗统计
  - 故障诊断参考

**示例**:
```json
"utilityConnections": {
  "type": "Property",
  "value": {
    "power": {"voltage": "380V", "capacity": "50kW"},
    "compressed_air": {"pressure": "0.6MPa", "flow": "100L/min"},
    "gas": ["Ar", "CO2"],
    "water": false
  }
}
```

---

### 3.5 运维管理字段

#### `statusTracking` (建议必填)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  trackOccupancy?: boolean,    // 占用状态
  trackThroughput?: boolean,   // 产出统计
  trackCycleTime?: boolean,    // 节拍时间
  trackQuality?: boolean       // 质量指标
}
```
- **说明**: 状态追踪配置开关
- **用途**: 
  - 决定需要采集哪些运营数据
  - 配置看板显示维度
  - 优化分析数据源

**示例**:
```json
"statusTracking": {
  "type": "Property",
  "value": {
    "trackOccupancy": true,
    "trackThroughput": true,
    "trackCycleTime": true,
    "trackQuality": true
  }
}
```

#### `operatingSchedule` (可选)
- **类型**: Property (Object)
- **结构**:
```typescript
{
  shifts?: [{shiftId, startTime, endTime, requiredStaff}],
  daysOfWeek?: number[]
}
```
- **说明**: 工位运行排班计划
- **用途**: 
  - 人员排班参考
  - 计算可用产能
  - OEE计算基准

**示例**:
```json
"operatingSchedule": {
  "type": "Property",
  "value": {
    "shifts": [
      {"shiftId": "A", "startTime": "08:00", "endTime": "16:00", "requiredStaff": 2},
      {"shiftId": "B", "startTime": "16:00", "endTime": "00:00", "requiredStaff": 2}
    ],
    "daysOfWeek": [1,2,3,4,5]
  }
}
```

#### `maintenanceAccess` (可选)
- **类型**: Property (Object)
- **说明**: 维护通道信息
- **用途**: 维护作业安全与可行性评估

**示例**:
```json
"maintenanceAccess": {
  "type": "Property",
  "value": {
    "accessible": true,
    "clearanceRequired": "停产后方可进入",
    "restrictions": ["需起重机配合", "需断电作业"]
  }
}
```

#### `aliasCode` (可选)
- **类型**: Property (Array)
- **说明**: 别名或旧编码
- **用途**: 支持编码迁移,历史数据兼容

**示例**:
```json
"aliasCode": {
  "type": "Property",
  "value": ["TS36120201", "OLD-ST-03"]
}
```

---

## 4. 建模约束与规则

### 4.1 核心约束

**C1: Station必须属于Constituent**
```javascript
assert(twinType === "Constituent");
```

**C2: 必须有明确的功能分类**
```javascript
assert(functionCategory.startsWith("F1.4"));
```

**C3: 必须声明工位类别**
```javascript
assert(stationCategory !== null);
```

**C4: 危险作业必须有安全要求**
```javascript
if (hazardFlags && hazardFlags.length > 0) {
  assert(safetyRequirements !== null);
}
```

**C5: 部署设备必须在同一产线**
```javascript
for (equipment of deployedEquipment) {
  assert(equipment.partOf === station.partOf);
}
```

### 4.2 最佳实践

**BP1: 容量配置**
- 生产工位: `capacityWip = 1~3`
- 缓存区: `capacityWip = 5~20`
- 检验工位: `capacityWip = 1~5`

**BP2: 台位使用**
- 当工位有多个作业点时,使用Position细化
- 简单工位可不建Position

**BP3: 安全管理**
- 所有有`hazardFlags`的工位必须配置`safetyRequirements`
- 定期审查安全要求的有效性

**BP4: 状态追踪**
- 瓶颈工位: 全部追踪维度开启
- 普通工位: 至少开启`trackOccupancy`

---

## 5. 完整建模示例

### 5.1 焊接工位

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "侧墙焊接工位03"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "Station"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.4.1"
  },
  
  "functionDesc": {
    "type": "Property",
    "value": "执行侧墙骨架的点焊和连续焊作业"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 3
  },
  
  "partOf": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:ProductionLine:SideWall"
  },
  
  "installPosition": {
    "type": "Property",
    "value": "侧墙产线-焊接区-A区-03号工位"
  },
  
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [125.5, 80.3]
    }
  },
  
  "stationCategory": {
    "type": "Property",
    "value": "ProductionStation"
  },
  
  "areaCode": {
    "type": "Property",
    "value": "WELD-AREA"
  },
  
  "zoneId": {
    "type": "Property",
    "value": "ZONE-A"
  },
  
  "capacityWip": {
    "type": "Property",
    "value": 2
  },
  
  "hasPositions": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:Position:ST-GZ-03-P1"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:Position:ST-GZ-03-P2"
    }
  ],
  
  "deployedEquipment": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:Robot:ROBOT-R01"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:Welder:WELDER-W01"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:Positioner:POS-01"
    }
  ],
  
  "compatibleProcCodes": {
    "type": "Property",
    "value": [
      "PROC-WELD-01",
      "PROC-WELD-02",
      "PROC-SPOT-WELD"
    ]
  },
  
  "requiredRoles": {
    "type": "Property",
    "value": [
      "ROLE_WELDER",
      "ROLE_QC_INSPECTOR"
    ]
  },
  
  "hazardFlags": {
    "type": "Property",
    "value": ["Welding", "Lifting"]
  },
  
  "safetyRequirements": {
    "type": "Property",
    "value": {
      "ppe": [
        "焊接面罩",
        "防护手套",
        "安全鞋",
        "防尘口罩"
      ],
      "certifications": [
        "焊工证",
        "安全培训证"
      ],
      "procedures": [
        "SOP-SAFETY-001",
        "SOP-SAFETY-005"
      ],
      "emergencyProtocol": "发生火灾立即使用CO2灭火器"
    }
  },
  
  "layoutInfo": {
    "type": "Property",
    "value": {
      "dimension": {
        "length": 6000,
        "width": 4000,
        "height": 3000,
        "unit": "mm"
      },
      "accessDirection": ["Front", "Left"],
      "floorMarking": "黄色边界线"
    }
  },
  
  "environmentalSpec": {
    "type": "Property",
    "value": {
      "temperatureRange": {"min": 15, "max": 30, "unit": "°C"},
      "ventilation": "LocalExhaust",
      "lighting": {"level": 500, "type": "LED"}
    }
  },
  
  "utilityConnections": {
    "type": "Property",
    "value": {
      "power": {"voltage": "380V", "capacity": "50kW"},
      "compressed_air": {"pressure": "0.6MPa", "flow": "100L/min"},
      "gas": ["Ar", "CO2"]
    }
  },
  
  "statusTracking": {
    "type": "Property",
    "value": {
      "trackOccupancy": true,
      "trackThroughput": true,
      "trackCycleTime": true,
      "trackQuality": true
    }
  },
  
  "operatingSchedule": {
    "type": "Property",
    "value": {
      "shifts": [
        {"shiftId": "A", "startTime": "08:00", "endTime": "16:00", "requiredStaff": 2},
        {"shiftId": "B", "startTime": "16:00", "endTime": "00:00", "requiredStaff": 2}
      ],
      "daysOfWeek": [1,2,3,4,5]
    }
  },
  
  "stateAttr": {
    "type": "Property",
    "value": [
      {"name": "current_status", "value": "Running"},
      {"name": "current_wip_count", "value": 1},
      {"name": "current_shift", "value": "A"}
    ]
  },
  
  "capabilities": {
    "type": "Property",
    "value": [
      "CAP.Weld.Spot",
      "CAP.Weld.Seam",
      "CAP.Handle.Rotate"
    ]
  }
}
```

---

## 6. 常见问题FAQ

### Q1: Station与BufferZone如何区分?

**A**: 通过`stationCategory`字段:
- **Station**: `stationCategory != "BufferZone"`,执行工序,有人员和设备
- **BufferZone**: `stationCategory = "BufferZone"`,仅暂存,通常无人员

**判断标准**: 是否执行加工/检验等工序?是→Station,否→BufferZone

---

### Q2: Station与Position如何选择?

**A**: 取决于精细化程度需求:

| 场景 | 建议 |
|------|------|
| 简单工位(单作业点) | 只建Station |
| 复杂工位(多作业点) | Station + Position |
| 需要精确追踪工件位置 | Station + Position |
| 粗粒度管理 | 只建Station |

**示例**: 
- 一个工位有"上料台位"和"焊接台位" → 建Position
- 一个工位只有一个机器人 → 不建Position

---

### Q3: compatibleProcCodes如何确定?

**A**: 基于工位能力匹配工序要求:

```
工序要求 (MBOM):
  - 需要焊接机器人
  - 需要6轴变位机
  - 需要CO2保护气体

工位能力 (Station):
  - deployedEquipment: [Robot, Welder, Positioner]
  - utilityConnections.gas: ["CO2"]
  → 匹配成功,加入compatibleProcCodes
```

**原则**: 工位能力 ⊇ 工序要求

---

### Q4: 如何处理工位临时停用?

**A**: 通过`stateAttr`动态管理:

```json
"stateAttr": [
  {
    "name": "operational_status",
    "value": "Maintenance"
  },
  {
    "name": "unavailable_until",
    "value": "2025-10-20T16:00:00Z"
  },
  {
    "name": "reason",
    "value": "设备大修"
  }
]
```

**不要**修改`compatibleProcCodes`,保持配置稳定。

---

### Q5: 如何实现工位负载均衡?

**A**: 结合多个字段:

1. **容量检查**: `capacityWip - current_wip_count`
2. **排班检查**: `operatingSchedule`当前班次人员是否足够
3. **状态检查**: `stateAttr.operational_status`是否可用
4. **能力匹配**: `compatibleProcCodes`是否包含目标工序

**调度算法**:
```javascript
function selectStation(procCode, stations) {
  const candidates = stations.filter(s => 
    s.compatibleProcCodes.includes(procCode) &&
    s.stateAttr.operational_status === "Running" &&
    s.stateAttr.current_wip_count < s.capacityWip
  );
  
  return candidates.sort((a, b) => 
    a.stateAttr.current_wip_count - b.stateAttr.current_wip_count
  )[0];
}
```

---

### Q6: 如何追踪工位性能?

**A**: 通过`statusTracking`配置+ModalData采集:

```
配置追踪维度 (statusTracking):
  trackThroughput: true
  trackCycleTime: true
  trackQuality: true

数据采集 (ModalityBinding):
  - Modality: Throughput → 每班次产出件数
  - Modality: CycleTime → 每件平均时间
  - Modality: DefectRate → 不良率

分析计算:
  - OEE = Availability × Performance × Quality
  - 瓶颈识别
  - 改善机会
```

---

**文档版本**: V1.0  
**发布日期**: 2025-10-17  
**维护部门**: 工艺工程部 & 数字孪生架构组

---

**版权声明**: 本文档为内部技术规范,未经授权不得外传。