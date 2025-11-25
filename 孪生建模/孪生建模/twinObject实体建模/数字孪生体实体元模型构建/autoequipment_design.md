# AutoEquipment特有字段设计文档
## 版本: V1.0 | 发布日期: 2025-10-16

---

## 文档说明

本文档定义**AutoEquipment**(自动化生产设备)子类型的特有字段。AutoEquipment涵盖机器人、焊机、变位机、数控机床等自动化执行生产任务的设备。

**重要**: 本文档仅定义**特有字段**,实际创建实例时需同时包含:
- **核心字段**: 来自`twinobject_core_schema.json`
- **特有字段**: 来自本文档

---

## 目录

1. [子类型定位](#1-子类型定位)
2. [deviceType细分类型](#2-devicetype细分类型)
3. [特有字段分类](#3-特有字段分类)
4. [字段详解](#4-字段详解)
5. [使用示例](#5-使用示例)
6. [实施指南](#6-实施指南)

---

## 1. 子类型定位

### 1.1 定义

**AutoEquipment**(自动化生产设备)是指通过程序控制、自动执行生产任务的设备,具有以下特征:
- 可编程控制
- 自动化执行作业
- 高精度/高重复性
- 集成传感与反馈

### 1.2 涵盖范围

| deviceType | 中文名 | 典型实例 |
|------------|--------|----------|
| Robot | 机器人 | 焊接机器人、装配机器人、搬运机器人 |
| Welder | 焊机 | 焊接电源、送丝机、焊接系统 |
| Positioner | 变位机 | 焊接变位机、工件旋转台 |
| CNC | 数控机床 | 数控铣床、加工中心 |
| PressMachine | 压机 | 冲压机、液压机 |
| Laser | 激光设备 | 激光切割机、激光焊接机 |
| Other | 其他 | 其他自动化设备 |

### 1.3 与核心模型的关系

```
TwinObject (核心模型)
    ↓ subType = "AutoEquipment"
    ↓ 继承所有核心字段
AutoEquipment (特有字段)
    ↓ deviceType 细分
    ├─ Robot (机器人特有字段)
    ├─ Welder (焊机特有字段)
    └─ ... (其他设备类型)
```

---

## 2. deviceType细分类型

### 2.1 必填字段

**`deviceType`** (必填)
- **用途**: 区分AutoEquipment的具体设备类型
- **枚举值**: `Robot | Welder | Positioner | CNC | PressMachine | Laser | Other`
- **示例**:
```json
"deviceType": {
  "type": "Property",
  "value": "Robot"
}
```

### 2.2 字段适用矩阵

不同deviceType适用不同的特有字段组合:

| 字段 | Robot | Welder | Positioner | CNC | 通用 |
|------|-------|--------|------------|-----|------|
| axes | ✓ | | | ✓ | |
| payload | ✓ | | ✓ | | |
| reach | ✓ | | | | |
| currentRange | | ✓ | | | |
| weldingProcessTypes | | ✓ | | | |
| rotationAxisCount | | | ✓ | | |
| tiltAngleRange | | | ✓ | | |
| toolMagazineCapacity | | | | ✓ | |
| controllerType | ✓ | ✓ | ✓ | ✓ | ✓ |
| powerRating | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 3. 特有字段分类

AutoEquipment特有字段按功能分为**7类**:

### 3.1 设备类型标识 (必填)
- `deviceType` - 设备细分类型

### 3.2 控制系统
- `controllerType` - 控制器类型
- `controllerVersion` - 控制器版本
- `programmingLanguages` - 编程语言
- `communicationProtocols` - 通信协议

### 3.3 性能参数
- `axes` - 轴数
- `payload` - 负载
- `reach` - 工作半径
- `repeatability` - 重复精度
- `maxSpeed` - 最大速度
- `workEnvelope` - 工作包络

### 3.4 电气参数
- `powerRating` - 额定功率
- `voltageRating` - 额定电压
- `currentRange` - 电流范围(焊机)

### 3.5 工艺能力
- `weldingProcessTypes` - 焊接工艺类型(焊机)
- `rotationAxisCount` - 旋转轴数(变位机)
- `tiltAngleRange` - 倾斜角度(变位机)
- `tableSize` - 工作台尺寸
- `toolMagazineCapacity` - 刀库容量(CNC)
- `spindleSpeedRange` - 主轴转速(CNC)

### 3.6 安全与环境
- `protectionLevel` - 防护等级
- `safetyFeatures` - 安全功能
- `mountingType` - 安装方式
- `coolingMethod` - 冷却方式
- `operatingTemperatureRange` - 工作温度

### 3.7 资产管理
- `manufactureDate` - 生产日期
- `installationDate` - 安装日期
- `warrantyExpiration` - 质保到期
- `maintenanceInterval` - 保养周期
- `maintenanceProvider` - 维保商
- `certifications` - 认证标准
- `weight` - 设备自重
- `dimensions` - 外形尺寸

---

## 4. 字段详解

### 4.1 核心性能参数

#### `axes` (轴数)
- **适用**: Robot, CNC
- **类型**: Property (integer)
- **单位**: axes
- **范围**: 1-9
- **说明**: 机器人关节轴数或数控机床联动轴数
- **示例**:
```json
"axes": {
  "type": "Property",
  "value": 6,
  "unitCode": "axes"
}
```

#### `payload` (额定负载)
- **适用**: Robot, Positioner
- **类型**: Property (number)
- **单位**: kg / ton
- **说明**: 机器人末端负载能力或变位机承重能力
- **示例**:
```json
"payload": {
  "type": "Property",
  "value": 210,
  "unitCode": "kg"
}
```

#### `reach` (工作半径)
- **适用**: Robot
- **类型**: Property (number)
- **单位**: mm
- **说明**: 机器人最大工作半径
- **示例**:
```json
"reach": {
  "type": "Property",
  "value": 2650,
  "unitCode": "mm"
}
```

#### `repeatability` (重复定位精度)
- **适用**: Robot, CNC
- **类型**: Property (number)
- **单位**: mm
- **说明**: 重复到达同一位置的精度
- **示例**:
```json
"repeatability": {
  "type": "Property",
  "value": 0.08,
  "unitCode": "mm"
}
```

---

### 4.2 控制系统

#### `controllerType` (控制器类型)
- **适用**: 所有设备
- **类型**: Property (string)
- **说明**: 控制器品牌和型号
- **示例**: `"ABB_IRC5"`, `"FANUC_R-30iB"`, `"KUKA_KRC4"`

#### `communicationProtocols` (通信协议)
- **适用**: 所有设备
- **类型**: Property (array)
- **枚举**: `OPC-UA`, `Modbus-TCP`, `EtherNet/IP`, `PROFINET`, `MTConnect`, `Proprietary`
- **用途**: 定义支持的工业通信协议,用于数据采集配置
- **示例**:
```json
"communicationProtocols": {
  "type": "Property",
  "value": ["OPC-UA", "Modbus-TCP"]
}
```

---

### 4.3 工艺特定参数

#### `currentRange` (电流范围)
- **适用**: Welder
- **类型**: Property (object)
- **单位**: A
- **说明**: 焊接电流调节范围
- **示例**:
```json
"currentRange": {
  "type": "Property",
  "value": {
    "min": 50,
    "max": 500,
    "unit": "A"
  }
}
```

#### `weldingProcessTypes` (焊接工艺类型)
- **适用**: Welder
- **类型**: Property (array)
- **枚举**: `MIG`, `MAG`, `TIG`, `Spot`, `Laser`, `Plasma`
- **说明**: 支持的焊接工艺
- **示例**:
```json
"weldingProcessTypes": {
  "type": "Property",
  "value": ["MIG", "Spot"]
}
```

#### `rotationAxisCount` (旋转轴数量)
- **适用**: Positioner
- **类型**: Property (integer)
- **范围**: 1-3
- **说明**: 变位机的旋转自由度数量
- **示例**:
```json
"rotationAxisCount": {
  "type": "Property",
  "value": 2
}
```

#### `tiltAngleRange` (倾斜角度范围)
- **适用**: Positioner
- **类型**: Property (object)
- **单位**: degrees
- **说明**: 变位机倾斜轴的角度范围
- **示例**:
```json
"tiltAngleRange": {
  "type": "Property",
  "value": {
    "min": -135,
    "max": 135,
    "unit": "degrees"
  }
}
```

---

### 4.4 安全功能

#### `safetyFeatures` (安全功能)
- **适用**: 所有设备
- **类型**: Property (array)
- **枚举**:
  - `EmergencyStop` - 急停
  - `SafetyZone` - 安全区域
  - `CollisionDetection` - 碰撞检测
  - `SpeedLimiting` - 速度限制
  - `SafetyPLC` - 安全PLC
  - `LightCurtain` - 光栅
  - `TwoHandControl` - 双手控制
- **示例**:
```json
"safetyFeatures": {
  "type": "Property",
  "value": [
    "EmergencyStop",
    "CollisionDetection",
    "SafetyZone"
  ]
}
```

---

### 4.5 维护管理

#### `maintenanceInterval` (保养周期)
- **适用**: 所有设备
- **类型**: Property (object)
- **单位**: hours / days / cycles
- **用途**: 定义预防性维护的时间间隔
- **示例**:
```json
"maintenanceInterval": {
  "type": "Property",
  "value": {
    "value": 2000,
    "unit": "hours"
  }
}
```

#### `spareParts` (常用备件清单)
- **适用**: 所有设备
- **类型**: Property (array)
- **用途**: 记录常用备件信息,便于维护管理
- **示例**:
```json
"spareParts": {
  "type": "Property",
  "value": [
    {
      "partName": "伺服电机",
      "partNumber": "3HAC17484-1",
      "supplier": "ABB",
      "stockLocation": "备件库A-03"
    }
  ]
}
```

---

## 5. 使用示例

### 5.1 完整示例: 焊接机器人

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:ROBOT-R01",
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
    "value": "AutoEquipment"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.2.1"
  },
  
  "deviceType": {
    "type": "Property",
    "value": "Robot"
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
  
  "controllerType": {
    "type": "Property",
    "value": "ABB_IRC5"
  },
  
  "controllerVersion": {
    "type": "Property",
    "value": "7.8.2"
  },
  
  "axes": {
    "type": "Property",
    "value": 6,
    "unitCode": "axes"
  },
  
  "payload": {
    "type": "Property",
    "value": 210,
    "unitCode": "kg"
  },
  
  "reach": {
    "type": "Property",
    "value": 2650,
    "unitCode": "mm"
  },
  
  "repeatability": {
    "type": "Property",
    "value": 0.08,
    "unitCode": "mm"
  },
  
  "maxSpeed": {
    "type": "Property",
    "value": 2100,
    "unitCode": "mm/s"
  },
  
  "workEnvelope": {
    "type": "Property",
    "value": {
      "type": "cylindrical",
      "radius_mm": 2650,
      "height_mm": 3200
    }
  },
  
  "powerRating": {
    "type": "Property",
    "value": 12.5,
    "unitCode": "kW"
  },
  
  "communicationProtocols": {
    "type": "Property",
    "value": ["OPC-UA", "EtherNet/IP"]
  },
  
  "programmingLanguages": {
    "type": "Property",
    "value": ["RAPID"]
  },
  
  "safetyFeatures": {
    "type": "Property",
    "value": [
      "EmergencyStop",
      "CollisionDetection",
      "SafetyZone",
      "SpeedLimiting"
    ]
  },
  
  "protectionLevel": {
    "type": "Property",
    "value": "IP54"
  },
  
  "mountingType": {
    "type": "Property",
    "value": "floor"
  },
  
  "maintenanceInterval": {
    "type": "Property",
    "value": {
      "value": 2000,
      "unit": "hours"
    }
  },
  
  "manufactureDate": {
    "type": "Property",
    "value": "2024-01-15"
  },
  
  "installationDate": {
    "type": "Property",
    "value": "2024-03-01"
  },
  
  "warrantyExpiration": {
    "type": "Property",
    "value": "2027-03-01"
  },
  
  "certifications": {
    "type": "Property",
    "value": ["CE", "ISO9001"]
  }
}
```

### 5.2 示例: 焊机

```json
{
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:WELDER-W01",
  "subType": {"value": "AutoEquipment"},
  "deviceType": {"value": "Welder"},
  
  "currentRange": {
    "type": "Property",
    "value": {
      "min": 50,
      "max": 500,
      "unit": "A"
    }
  },
  
  "weldingProcessTypes": {
    "type": "Property",
    "value": ["MIG", "MAG"]
  },
  
  "powerRating": {
    "type": "Property",
    "value": 45,
    "unitCode": "kW"
  },
  
  "coolingMethod": {
    "type": "Property",
    "value": "water"
  }
}
```

---

## 6. 实施指南

### 6.1 必填字段检查

创建AutoEquipment实例时,必须包含:

**核心模型必填**:
- `@context`
- `id`
- `type`
- `twinType`
- `subType`
- `functionCategory`

**特有字段必填**:
- `deviceType`

### 6.2 字段选择建议

根据deviceType选择适用字段:

#### Robot (机器人)
**必填**: axes, payload, reach  
**建议**: controllerType, repeatability, safetyFeatures

#### Welder (焊机)
**必填**: currentRange  
**建议**: weldingProcessTypes, powerRating, coolingMethod

#### Positioner (变位机)
**必填**: rotationAxisCount  
**建议**: payload, tiltAngleRange, tableSize

#### CNC (数控机床)
**必填**: axes  
**建议**: toolMagazineCapacity, spindleSpeedRange, workEnvelope

### 6.3 与核心字段的协同

| 核心字段 | AutoEquipment使用 |
|---------|-------------------|
| `functionCategory` | 通常为`F1.2.1`(加工设备) |
| `capabilities` | 用CAP标签补充,如`CAP.Weld.Robot` |
| `specifications` | 与特有字段重复的放特有字段 |
| `supportedModalities` | 声明支持的数据模态 |
| `inputAttr` | 定义控制信号输入 |
| `outputAttr` | 定义状态反馈输出 |

### 6.4 与ModalityBinding的关系

AutoEquipment的数据采集通过ModalityBinding定义:
- `communicationProtocols`声明支持的协议
- ModalityBinding中`protocol`字段必须匹配
- 通过`pointRef`指定具体数据点地址

---

**文档版本**: V1.0  
**制定人**: 数字孪生架构组  
**下一步**: TransportEquipment特有字段设计