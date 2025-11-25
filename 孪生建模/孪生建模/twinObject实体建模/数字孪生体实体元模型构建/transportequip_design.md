# TransportEquipment特有字段设计文档
## 版本: V1.0 | 发布日期: 2025-10-16

---

## 文档说明

本文档定义**TransportEquipment**(转运设备)子类型的特有字段。TransportEquipment涵盖天车、AGV、输送线等物料搬运和转运设备。

**重要**: 本文档仅定义**特有字段**,实际创建实例时需同时包含:
- **核心字段**: 来自`twinobject_core_schema.json`
- **特有字段**: 来自本文档

---

## 目录

1. [子类型定位](#1-子类型定位)
2. [transportType细分类型](#2-transporttype细分类型)
3. [特有字段分类](#3-特有字段分类)
4. [字段详解](#4-字段详解)
5. [使用示例](#5-使用示例)
6. [实施指南](#6-实施指南)

---

## 1. 子类型定位

### 1.1 定义

**TransportEquipment**(转运设备)是指专门用于物料搬运、转运和输送的设备,具有以下特征:
- 承载与移动物料
- 连接工位间的物流
- 支持自动化或半自动化调度
- 关键性能指标: 载重、速度、精度

### 1.2 涵盖范围

| transportType | 中文名 | 典型实例 |
|---------------|--------|----------|
| Crane | 天车/行车 | 桥式起重机、门式起重机 |
| AGV | 自动导引车 | 激光导航AGV、磁条AGV |
| RGV | 有轨制导车 | 轨道穿梭车 |
| Conveyor | 输送线 | 皮带线、辊道线、链条线 |
| Hoist | 起重机 | 电动葫芦、手动葫芦 |
| Forklift | 叉车 | 电动叉车、内燃叉车 |
| Shuttle | 穿梭车 | 立体库穿梭车 |
| Other | 其他 | 其他转运设备 |

### 1.3 与AutoEquipment的区别

| 维度 | AutoEquipment | TransportEquipment |
|------|---------------|---------------------|
| 主要功能 | 生产加工 | 物料转运 |
| 关键参数 | 精度、轴数、工艺能力 | 载重、速度、导航 |
| 工作特征 | 固定位置作业 | 移动/搬运 |
| 典型场景 | 焊接、加工、装配 | 上料、下料、转运 |

---

## 2. transportType细分类型

### 2.1 必填字段

**`transportType`** (必填)
- **用途**: 区分TransportEquipment的具体设备类型
- **枚举值**: `Crane | AGV | RGV | Conveyor | Hoist | Forklift | Shuttle | Other`
- **示例**:
```json
"transportType": {
  "type": "Property",
  "value": "Crane"
}
```

### 2.2 字段适用矩阵

| 字段 | Crane | AGV | RGV | Conveyor | 通用 |
|------|-------|-----|-----|----------|------|
| liftingCapacity | ✓ | | | | |
| spanLength | ✓ | | | | |
| loadCapacity | | ✓ | ✓ | | |
| navigationMethod | | ✓ | ✓ | | |
| batteryType | | ✓ | | | |
| conveyorType | | | | ✓ | |
| conveyorLength | | | | ✓ | |
| travelSpeed | ✓ | ✓ | ✓ | | ✓ |
| safetyFeatures | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 3. 特有字段分类

TransportEquipment特有字段按功能分为**9类**:

### 3.1 设备类型标识 (必填)
- `transportType` - 转运设备细分类型

### 3.2 载重与起重参数
- `liftingCapacity` - 额定起重量(天车/吊车)
- `loadCapacity` - 载重能力(AGV/RGV/叉车)
- `liftingHeight` - 起升高度
- `spanLength` - 跨度(天车)

### 3.3 运动性能
- `liftingSpeed` - 起升速度
- `travelSpeed` - 运行速度
- `crossSpeed` - 横移速度(天车)
- `conveyorSpeed` - 输送速度

### 3.4 导航与定位(AGV/RGV)
- `navigationMethod` - 导航方式
- `positioningAccuracy` - 定位精度
- `obstacleDetection` - 障碍物检测
- `routePoints` - 路径节点定义

### 3.5 能源系统(AGV/叉车)
- `batteryType` - 电池类型
- `batteryCapacity` - 电池容量
- `chargingTime` - 充电时长
- `operatingRange` - 续航里程

### 3.6 输送线特定
- `conveyorType` - 输送机类型
- `conveyorLength` - 输送线长度
- `conveyorWidth` - 输送线宽度
- `conveyorSpeed` - 输送速度

### 3.7 控制与通信
- `controlMode` - 控制模式
- `communicationProtocols` - 通信协议
- `taskManagementSystem` - 任务管理系统
- `fleetManagementSystem` - 车队管理系统

### 3.8 安全功能
- `safetyFeatures` - 安全功能清单
- `protectionLevel` - 防护等级

### 3.9 物理参数与资产
- `platformSize` - 平台尺寸
- `workingArea` - 作业区域
- `dimensions` - 外形尺寸
- `weight` - 设备自重
- `powerRating` - 额定功率

---

## 4. 字段详解

### 4.1 载重与起重参数

#### `liftingCapacity` (额定起重量)
- **适用**: Crane, Hoist
- **类型**: Property (number)
- **单位**: kg / ton
- **说明**: 起重设备的最大安全起重量
- **示例**:
```json
"liftingCapacity": {
  "type": "Property",
  "value": 10,
  "unitCode": "ton"
}
```

#### `spanLength` (跨度)
- **适用**: Crane
- **类型**: Property (number)
- **单位**: m
- **说明**: 桥式起重机的跨度长度
- **示例**:
```json
"spanLength": {
  "type": "Property",
  "value": 20,
  "unitCode": "m"
}
```

#### `loadCapacity` (载重能力)
- **适用**: AGV, RGV, Forklift
- **类型**: Property (number)
- **单位**: kg
- **说明**: 运输设备的最大载重量
- **示例**:
```json
"loadCapacity": {
  "type": "Property",
  "value": 500,
  "unitCode": "kg"
}
```

---

### 4.2 运动性能

#### `liftingSpeed` (起升速度)
- **适用**: Crane, Hoist
- **类型**: Property (number)
- **单位**: m/min
- **说明**: 垂直方向的提升速度
- **示例**:
```json
"liftingSpeed": {
  "type": "Property",
  "value": 8,
  "unitCode": "m/min"
}
```

#### `travelSpeed` (运行速度)
- **适用**: Crane, AGV, RGV, Forklift
- **类型**: Property (number)
- **单位**: m/min, m/s, km/h
- **说明**: 水平移动速度
- **示例**:
```json
"travelSpeed": {
  "type": "Property",
  "value": 60,
  "unitCode": "m/min"
}
```

#### `crossSpeed` (横移速度)
- **适用**: Crane
- **类型**: Property (number)
- **单位**: m/min
- **说明**: 天车小车横向移动速度
- **示例**:
```json
"crossSpeed": {
  "type": "Property",
  "value": 40,
  "unitCode": "m/min"
}
```

---

### 4.3 导航与定位

#### `navigationMethod` (导航方式)
- **适用**: AGV, RGV
- **类型**: Property (enum)
- **枚举值**:
  - `MagneticTape` - 磁条导航
  - `LaserSLAM` - 激光SLAM
  - `VisualSLAM` - 视觉SLAM
  - `QRCode` - 二维码导航
  - `RailGuided` - 轨道导引
  - `InductiveWire` - 感应线导航
  - `NaturalNavigation` - 自然导航
- **示例**:
```json
"navigationMethod": {
  "type": "Property",
  "value": "LaserSLAM"
}
```

#### `positioningAccuracy` (定位精度)
- **适用**: AGV, RGV
- **类型**: Property (number)
- **单位**: mm
- **说明**: 到达目标位置的精度
- **示例**:
```json
"positioningAccuracy": {
  "type": "Property",
  "value": 10,
  "unitCode": "mm"
}
```

#### `obstacleDetection` (障碍物检测方式)
- **适用**: AGV, RGV, Forklift
- **类型**: Property (array)
- **枚举值**: `LaserScanner`, `UltrasonicSensor`, `Camera`, `LiDAR`, `Radar`, `BumperSwitch`
- **示例**:
```json
"obstacleDetection": {
  "type": "Property",
  "value": ["LaserScanner", "Camera"]
}
```

#### `routePoints` (路径节点定义)
- **适用**: AGV, RGV
- **类型**: Property (array)
- **用途**: 定义AGV的工作站点和路径
- **示例**:
```json
"routePoints": {
  "type": "Property",
  "value": [
    {
      "pointId": "P001",
      "pointName": "焊接工位上料点",
      "x": 125.5,
      "y": 80.3,
      "stationType": "Loading"
    },
    {
      "pointId": "P002",
      "pointName": "检验工位下料点",
      "x": 145.2,
      "y": 85.7,
      "stationType": "Unloading"
    },
    {
      "pointId": "C001",
      "pointName": "充电桩01",
      "x": 100.0,
      "y": 50.0,
      "stationType": "Charging"
    }
  ]
}
```

---

### 4.4 能源系统

#### `batteryType` (电池类型)
- **适用**: AGV, Forklift
- **类型**: Property (enum)
- **枚举值**: `LithiumIon`, `LeadAcid`, `NickelMetal`, `Supercapacitor`
- **示例**:
```json
"batteryType": {
  "type": "Property",
  "value": "LithiumIon"
}
```

#### `batteryCapacity` (电池容量)
- **适用**: AGV, Forklift
- **类型**: Property (number)
- **单位**: Ah
- **示例**:
```json
"batteryCapacity": {
  "type": "Property",
  "value": 200,
  "unitCode": "Ah"
}
```

#### `operatingRange` (续航里程)
- **适用**: AGV
- **类型**: Property (number)
- **单位**: km
- **示例**:
```json
"operatingRange": {
  "type": "Property",
  "value": 50,
  "unitCode": "km"
}
```

---

### 4.5 输送线特定参数

#### `conveyorType` (输送机类型)
- **适用**: Conveyor
- **类型**: Property (enum)
- **枚举值**: `Belt`, `Roller`, `Chain`, `Slat`, `Overhead`, `Pneumatic`
- **示例**:
```json
"conveyorType": {
  "type": "Property",
  "value": "Roller"
}
```

#### `conveyorLength` / `conveyorWidth`
- **适用**: Conveyor
- **类型**: Property (number)
- **单位**: m / mm
- **示例**:
```json
"conveyorLength": {
  "type": "Property",
  "value": 50,
  "unitCode": "m"
},
"conveyorWidth": {
  "type": "Property",
  "value": 800,
  "unitCode": "mm"
}
```

---

### 4.6 控制与通信

#### `controlMode` (控制模式)
- **适用**: 所有类型
- **类型**: Property (enum)
- **枚举值**: `Manual`, `SemiAutomatic`, `FullyAutomatic`, `RemoteControl`, `AutonomousNavigation`
- **示例**:
```json
"controlMode": {
  "type": "Property",
  "value": "FullyAutomatic"
}
```

#### `communicationProtocols` (通信协议)
- **适用**: 所有类型
- **类型**: Property (array)
- **枚举值**: `WiFi`, `5G`, `PROFINET`, `EtherCAT`, `Modbus-TCP`, `OPC-UA`, `Proprietary`
- **示例**:
```json
"communicationProtocols": {
  "type": "Property",
  "value": ["WiFi", "OPC-UA"]
}
```

#### `taskManagementSystem` (任务管理系统)
- **适用**: AGV, RGV, Crane
- **类型**: Property (string)
- **说明**: 对接的上层调度系统
- **示例**: `"WMS"`, `"MES"`, `"TMS"`, `"Standalone"`

---

### 4.7 安全功能

#### `safetyFeatures` (安全功能)
- **适用**: 所有类型
- **类型**: Property (array)
- **枚举值**:
  - `EmergencyStop` - 急停
  - `OverloadProtection` - 过载保护
  - `CollisionAvoidance` - 防碰撞
  - `AntiSwaySystem` - 防摇摆
  - `SafetyLightCurtain` - 安全光栅
  - `SpeedLimiting` - 速度限制
  - `ZoneRestriction` - 区域限制
  - `AutomaticBraking` - 自动制动
- **示例**:
```json
"safetyFeatures": {
  "type": "Property",
  "value": [
    "EmergencyStop",
    "OverloadProtection",
    "CollisionAvoidance"
  ]
}
```

---

## 5. 使用示例

### 5.1 完整示例: 桥式起重机

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:TransportEquipment:CRANE-01",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "侧墙产线桥式起重机01"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "TransportEquipment"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.3.2"
  },
  
  "transportType": {
    "type": "Property",
    "value": "Crane"
  },
  
  "vendor": {
    "type": "Property",
    "value": "科尼起重机"
  },
  
  "model": {
    "type": "Property",
    "value": "KONE-QD-10t-20m"
  },
  
  "liftingCapacity": {
    "type": "Property",
    "value": 10,
    "unitCode": "ton"
  },
  
  "spanLength": {
    "type": "Property",
    "value": 20,
    "unitCode": "m"
  },
  
  "liftingHeight": {
    "type": "Property",
    "value": 12,
    "unitCode": "m"
  },
  
  "liftingSpeed": {
    "type": "Property",
    "value": 8,
    "unitCode": "m/min"
  },
  
  "travelSpeed": {
    "type": "Property",
    "value": 60,
    "unitCode": "m/min"
  },
  
  "crossSpeed": {
    "type": "Property",
    "value": 40,
    "unitCode": "m/min"
  },
  
  "hoistType": {
    "type": "Property",
    "value": "Electric"
  },
  
  "controlMode": {
    "type": "Property",
    "value": "RemoteControl"
  },
  
  "safetyFeatures": {
    "type": "Property",
    "value": [
      "EmergencyStop",
      "OverloadProtection",
      "AntiSwaySystem",
      "ZoneRestriction"
    ]
  },
  
  "powerRating": {
    "type": "Property",
    "value": 45,
    "unitCode": "kW"
  },
  
  "protectionLevel": {
    "type": "Property",
    "value": "IP54"
  },
  
  "installationDate": {
    "type": "Property",
    "value": "2024-01-10"
  },
  
  "certifications": {
    "type": "Property",
    "value": ["GB/T 3811-2008", "CE"]
  }
}
```

### 5.2 示例: 激光导航AGV

```json
{
  "id": "urn:ngsi-ld:TwinObject:TransportEquipment:AGV-01",
  "subType": {"value": "TransportEquipment"},
  "transportType": {"value": "AGV"},
  
  "loadCapacity": {
    "type": "Property",
    "value": 500,
    "unitCode": "kg"
  },
  
  "navigationMethod": {
    "type": "Property",
    "value": "LaserSLAM"
  },
  
  "positioningAccuracy": {
    "type": "Property",
    "value": 10,
    "unitCode": "mm"
  },
  
  "travelSpeed": {
    "type": "Property",
    "value": 1.5,
    "unitCode": "m/s"
  },
  
  "batteryType": {
    "type": "Property",
    "value": "LithiumIon"
  },
  
  "batteryCapacity": {
    "type": "Property",
    "value": 200,
    "unitCode": "Ah"
  },
  
  "operatingRange": {
    "type": "Property",
    "value": 50,
    "unitCode": "km"
  },
  
  "obstacleDetection": {
    "type": "Property",
    "value": ["LaserScanner", "Camera"]
  },
  
  "communicationProtocols": {
    "type": "Property",
    "value": ["WiFi", "5G"]
  },
  
  "controlMode": {
    "type": "Property",
    "value": "AutonomousNavigation"
  },
  
  "fleetManagementSystem": {
    "type": "Property",
    "value": "AGV_FMS_V3.0"
  },
  
  "routePoints": {
    "type": "Property",
    "value": [
      {
        "pointId": "P001",
        "pointName": "焊接工位上料点",
        "x": 125.5,
        "y": 80.3,
        "stationType": "Loading"
      }
    ]
  }
}
```

---

## 6. 实施指南

### 6.1 必填字段检查

创建TransportEquipment实例时,必须包含:

**核心模型必填**:
- `@context`, `id`, `type`
- `twinType`, `subType`, `functionCategory`

**特有字段必填**:
- `transportType`

### 6.2 字段选择建议

#### Crane (天车)
**必填**: liftingCapacity, spanLength  
**建议**: liftingHeight, liftingSpeed, travelSpeed, crossSpeed

#### AGV (自动导引车)
**必填**: loadCapacity, navigationMethod  
**建议**: positioningAccuracy, batteryType, routePoints, obstacleDetection

#### Conveyor (输送线)
**必填**: conveyorType, conveyorLength  
**建议**: conveyorWidth, conveyorSpeed

### 6.3 与核心字段的协同

| 核心字段 | TransportEquipment使用 |
|---------|----------------------|
| `functionCategory` | 通常为`F1.3.x`(物流系统) |
| `capabilities` | 用CAP标签,如`CAP.Transport.Heavy` |
| `installPosition` | 天车/输送线填写固定位置 |
| `location` | AGV使用动态位置更新 |

---

**文档版本**: V1.0  
**制定人**: 数字孪生架构组  
**下一步**: Workpiece/Product/Material特有字段设计