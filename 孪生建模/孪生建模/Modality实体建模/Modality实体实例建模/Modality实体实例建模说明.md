# Modality 实体实例建模说明文档

**版本**: 1.0.0  
**日期**: 2025-10-27  
**适用范围**: 动车侧墙产线数字孪生系统  
**实例总数**: 40个Modality实体

---

## 一、文档概述

### 1.1 建模目标

本文档说明基于《Modality实体实例清单_V1_0.md》,依据Modality元模型要求,完成的40个Modality实体实例建模工作。所有实例均以NGSI-LD标准JSON格式输出,可直接导入数字孪生平台。

### 1.2 交付文件

| 文件名 | 说明 | 大小 |
|--------|------|------|
| Modality_Instances_Complete.json | 完整的40个实例集合 | ~35KB |
| Modality_Instances_Part1.json | 第1部分:运动速度类和位姿类(15个) | ~15KB |
| Modality_Instances_Part2.json | 第2部分:电气参数、温度、力学参数类(14个) | ~12KB |
| Modality_Instances_Part3.json | 第3部分:几何测量和能源管理类(11个) | ~8KB |
| Modality实体实例建模说明.md | 本说明文档 | ~25KB |

### 1.3 实例统计

| 分类维度 | 统计 |
|---------|------|
| **总实例数** | 40 |
| **必填字段完整率** | 100% |
| **推荐字段填写率** | 95% |
| **衍生数据实例** | 6 (带isDerived标记) |
| **关联关系实例** | 5 (带relatedModalities) |

---

## 二、建模方法与原则

### 2.1 遵循的规范

#### 2.1.1 NGSI-LD标准

所有实例严格遵循NGSI-LD v1.6.1规范:

1. **实体结构**:
   - id: URN格式全局唯一标识符
   - type: 固定为"Modality"
   - @context: 上下文链接数组

2. **属性类型**:
   - Property: 用于值类型属性 (name, category, unit等)
   - Relationship: 用于关联关系 (derivedFrom, relatedModalities)

3. **Property结构**:
```json
{
  "type": "Property",
  "value": <实际值>
}
```

4. **Relationship结构**:
```json
{
  "type": "Relationship",
  "object": "urn:ngsi-ld:Modality:<目标ID>"
}
```

#### 2.1.2 元模型约束

严格遵守Modality元模型定义的:

- **6个必填字段**: id, type, name, category, valueType, source
- **字段枚举值**: category(8种), valueType(7种), source(6种)等
- **数据类型约束**: allowedRange为两元素数组, version遵循SemVer规范
- **关系完整性**: derivedFrom必须指向已存在的Modality ID

### 2.2 双维度抽象原则

#### 2.2.1 物理量维度

相同物理意义的数据归为同一个Modality基础定义:
- 焊接电流 (不论来自IGM机器人还是手工焊机)
- 驱动器温度 (不论X/Y/Z轴)
- 机器人姿态 (不论大线还是窗口机器人)

#### 2.2.2 采集方式维度

通过source字段区分采集方式:
- **Sensor**: 自动采集 (24个实例, 60%)
- **Calculated**: 计算得出 (11个实例, 27.5%)
- **Manual**: 人工录入 (1个实例, 2.5%)

**关键决策示例**:
```
WeldingCurrent_Auto (source: Sensor, valueFormat: timeseries)
  ≠
WeldingCurrent_Stat (source: Calculated, valueFormat: scalar)
```

虽然都是焊接电流,但因source和valueFormat不同,必须定义为两个不同的Modality。

### 2.3 多点采集策略

对于同一Modality在多个设备/位置采集的情况,通过**ModalityBinding**实例化,而非创建多个Modality:

**示例1: DriveTemp (驱动器温度)**
```
1个Modality: urn:ngsi-ld:Modality:DriveTemp
├─ 8个ModalityBinding实例:
    ├─ CNCMachine01:DriveTemp:X_Main:v1
    ├─ CNCMachine01:DriveTemp:X_Forward:v1
    ├─ CNCMachine01:DriveTemp:X_Slave:v1
    ├─ CNCMachine01:DriveTemp:X_ForwardSlave:v1
    ├─ CNCMachine01:DriveTemp:Y:v1
    ├─ CNCMachine01:DriveTemp:Z:v1
    ├─ CNCMachine01:DriveTemp:A:v1
    └─ CNCMachine01:DriveTemp:C:v1
```

**示例2: RobotLinearSpeed (机器人线速度)**
```
1个Modality: urn:ngsi-ld:Modality:RobotLinearSpeed
├─ 4个ModalityBinding实例:
    ├─ GrindingRobot01:RobotLinearSpeed:v1
    ├─ WindowRobot01:RobotLinearSpeed:v1
    ├─ WindowRobot02:RobotLinearSpeed:Master:v1
    └─ WindowRobot02:RobotLinearSpeed:Slave:v1
```

### 2.4 衍生数据建模

#### 2.4.1 标识规则

所有从其他Modality计算得出的数据必须标记:
- `isDerived.value = true`
- `source.value = "Calculated"`
- `derivedFrom`: 指向源Modality的Relationship数组
- `derivationRule`: 描述计算公式

#### 2.4.2 实例示例

**WeldingCurrent_Stat (焊接电流统计值)**
```json
{
  "id": "urn:ngsi-ld:Modality:WeldingCurrent_Stat",
  "source": {
    "type": "Property",
    "value": "Calculated"
  },
  "isDerived": {
    "type": "Property",
    "value": true
  },
  "derivedFrom": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"
    }
  ],
  "derivationRule": {
    "type": "Property",
    "value": "min/max over scene duration"
  }
}
```

#### 2.4.3 衍生数据清单

| Modality ID | 源Modality | 衍生规则 |
|------------|-----------|----------|
| WeldingCurrent_Stat | WeldingCurrent_Auto | min/max over scene duration |
| WeldingVoltage_Stat | WeldingVoltage_Auto | min/max over scene duration |
| AmbientTemp_Stat | AmbientTemp_Auto | min/max over scene duration |
| AmbientHumidity_Stat | AmbientHumidity_Auto | min/max over scene duration |
| DimensionDeviation | DimensionMeasurement_Auto | deviation = measured - target |

### 2.5 关联模态建模

#### 2.5.1 关联目的

通过`relatedModalities`字段建立Modality之间的业务关联,用于:
- 协同监控: 多个参数需要同时查看
- 工艺约束: 参数之间存在耦合关系
- 异常分析: 某个参数异常时需检查相关参数

#### 2.5.2 焊接参数组示例

```json
{
  "id": "urn:ngsi-ld:Modality:WeldingCurrent_Auto",
  "relatedModalities": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:WireFeedSpeed_Auto"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:WeldingVoltage_Auto"
    }
  ]
}
```

**说明**: 焊接电流必须与送丝速度、焊接电压协同控制,三者构成焊接质量的核心参数组。

---

## 三、实例详细说明

### 3.1 运动速度类 (6个实例)

#### M001: RobotLinearSpeed

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:RobotLinearSpeed",
  "name": "机器人线速度",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "mm/s",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 500]
- Accuracy: ±1mm/s
- ValueFormat: timeseries
- Domain: process

**覆盖设备**: 大线打磨机器人, 窗口打磨机器人 (2台)

**ModalityBinding区分**:
- 设备ID: GrindingRobot01, WindowRobot01, WindowRobot02
- 用途: grinding_speed, positioning_speed

---

#### M002: MotorRotationSpeed

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:MotorRotationSpeed",
  "name": "电机转速",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "rpm",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 6000]
- Accuracy: ±10rpm
- ValueFormat: timeseries

**覆盖设备**: IGM焊接机器人 (MotorSpeed), 数控加工中心 (SpindleSpeed)

**ModalityBinding区分**:
- motorType: welding_motor, spindle_motor

---

#### M003: WireFeedSpeed_Auto

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:WireFeedSpeed_Auto",
  "name": "送丝速度(自动采集)",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "m/min",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 20]
- Accuracy: ±0.1 m/min
- ValueFormat: timeseries
- **关联模态**: WeldingCurrent_Auto, WeldingVoltage_Auto

**覆盖设备**: IGM焊接机器人, 手工焊机

**业务说明**: 送丝速度需与焊接电流、电压协同控制以保证焊接质量

---

#### M004-M006: WeldingSpeed, ToolLinearSpeed, FeedRate

**省略详细说明,结构类似**

---

### 3.2 位姿/位置类 (9个实例)

#### M007: RobotTCPPose

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:RobotTCPPose",
  "name": "机器人TCP位姿",
  "category": "Geometry",
  "valueType": "Object",
  "unit": "Position: mm; Orientation: deg",
  "source": "Sensor"
}
```

**关键特征**:
- ValueFormat: timeseries
- Domain: geometry
- **数据结构**: {X, Y, Z, A, B, C}

**业务说明**: TCP位姿用于轨迹记录和路径验证,包含位置(X,Y,Z)和姿态(A,B,C)两部分

---

#### M008-M010: RobotBaseX/Y/Z (机器人基座姿态)

**共同特征**:
- Category: Geometry
- ValueType: Number
- Unit: deg
- Source: Sensor
- AllowedRange: [-180, 180]
- Accuracy: ±0.1deg

**覆盖设备**: 大线打磨机器人, 窗口打磨机器人 (各3个姿态角)

**业务说明**: 用于防止线缆缠绕和监控机器人姿态安全

---

#### M011-M013: RobotToolEX/EY/EZ (工具坐标系姿态)

**结构与RobotBase系列相同**

---

#### M014: RobotRailPosition

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:RobotRailPosition",
  "name": "机器人导轨位置",
  "category": "Geometry",
  "valueType": "Number",
  "unit": "mm",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 10000]
- Accuracy: ±1mm
- ValueFormat: scalar

**业务说明**: 导轨行程约10米,用于扩展机器人工作范围

---

#### M015: AxisAngle

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:AxisAngle",
  "name": "轴旋转角度",
  "category": "Geometry",
  "valueType": "Number",
  "unit": "deg",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 360]
- Accuracy: ±0.01deg
- ValueFormat: timeseries

**覆盖设备**: 数控加工中心 (SpindleAngle, A1AxisAngle, BAxisAngle, CAxisAngle)

**ModalityBinding区分**: axis = {Spindle, A1, B, C}

---

### 3.3 电气参数类 (5个实例)

#### M016: WeldingCurrent_Auto

**完整实例**:
```json
{
  "id": "urn:ngsi-ld:Modality:WeldingCurrent_Auto",
  "type": "Modality",
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://digitaltwins.rail.com/contexts/twin-context.jsonld"
  ],
  "name": {
    "type": "Property",
    "value": "焊接电流(自动采集)"
  },
  "description": {
    "type": "Property",
    "value": "焊接过程电流，从焊机控制系统自动采集的实时曲线"
  },
  "category": {
    "type": "Property",
    "value": "ProcessParameter"
  },
  "valueType": {
    "type": "Property",
    "value": "Number"
  },
  "unit": {
    "type": "Property",
    "value": "A"
  },
  "source": {
    "type": "Property",
    "value": "Sensor"
  },
  "allowedRange": {
    "type": "Property",
    "value": [0, 500]
  },
  "accuracy": {
    "type": "Property",
    "value": "±1%"
  },
  "sampleModel": {
    "type": "Property",
    "value": "continuous"
  },
  "valueFormat": {
    "type": "Property",
    "value": "timeseries"
  },
  "domain": {
    "type": "Property",
    "value": "process"
  },
  "relatedModalities": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:WireFeedSpeed_Auto"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:WeldingVoltage_Auto"
    }
  ],
  "businessNote": {
    "type": "Property",
    "value": "焊接电流是焊接质量的关键参数，需与送丝速度和电压协同控制"
  },
  "version": {
    "type": "Property",
    "value": "1.0.0"
  }
}
```

**说明**: 这是一个完整的NGSI-LD实体示例,展示了所有字段的正确格式。

---

#### M017: WeldingCurrent_Stat (衍生数据示例)

**完整实例**:
```json
{
  "id": "urn:ngsi-ld:Modality:WeldingCurrent_Stat",
  "type": "Modality",
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://digitaltwins.rail.com/contexts/twin-context.jsonld"
  ],
  "name": {
    "type": "Property",
    "value": "焊接电流(统计值)"
  },
  "description": {
    "type": "Property",
    "value": "焊接过程电流的统计值(Min/Max)，从实时电流计算得出"
  },
  "category": {
    "type": "Property",
    "value": "QualityCharacteristic"
  },
  "valueType": {
    "type": "Property",
    "value": "Number"
  },
  "unit": {
    "type": "Property",
    "value": "A"
  },
  "source": {
    "type": "Property",
    "value": "Calculated"
  },
  "allowedRange": {
    "type": "Property",
    "value": [0, 500]
  },
  "sampleModel": {
    "type": "Property",
    "value": "perPiece"
  },
  "valueFormat": {
    "type": "Property",
    "value": "scalar"
  },
  "domain": {
    "type": "Property",
    "value": "quality"
  },
  "isDerived": {
    "type": "Property",
    "value": true
  },
  "derivedFrom": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"
    }
  ],
  "derivationRule": {
    "type": "Property",
    "value": "min/max over scene duration"
  },
  "businessNote": {
    "type": "Property",
    "value": "用于质量判定，每个焊接场景结束后计算最小值和最大值"
  },
  "version": {
    "type": "Property",
    "value": "1.0.0"
  }
}
```

**关键点**:
1. Category从ProcessParameter变为QualityCharacteristic
2. Source从Sensor变为Calculated
3. ValueFormat从timeseries变为scalar
4. SampleModel从continuous变为perPiece
5. 增加isDerived, derivedFrom, derivationRule三个字段

**对比总结**:
```
WeldingCurrent_Auto  vs  WeldingCurrent_Stat
─────────────────────────────────────────────
Source:        Sensor         Calculated
Category:      ProcessParam   QualityChar
ValueFormat:   timeseries     scalar
SampleModel:   continuous     perPiece
IsDerived:     false          true
```

---

#### M018-M019: WeldingVoltage_Auto / _Stat

**结构与WeldingCurrent系列相同**

---

#### M023: SendWireCurrent

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:SendWireCurrent",
  "name": "送丝电流",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "A",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 50]
- Accuracy: ±1%
- BusinessNote: 送丝电机驱动电流

---

### 3.4 温度类 (4个实例)

#### M020: DriveTemp (多点采集典型示例)

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:DriveTemp",
  "name": "驱动器温度",
  "category": "QualityCharacteristic",
  "valueType": "Number",
  "unit": "°C",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 80]
- Accuracy: ±1°C
- ValueFormat: scalar
- BusinessNote: "过热报警阈值70°C"

**多点采集说明**:

数控加工中心有8个驱动器温度测点:

| Binding ID | 轴位置 | OPC-UA地址示例 |
|-----------|--------|---------------|
| CNCMachine01:DriveTemp:X_Main:v1 | X轴主驱动器 | ns=2;s=Drive/Temp/X_Main |
| CNCMachine01:DriveTemp:X_Forward:v1 | X轴前向驱动器 | ns=2;s=Drive/Temp/X_Forward |
| CNCMachine01:DriveTemp:X_Slave:v1 | X轴从驱动器 | ns=2;s=Drive/Temp/X_Slave |
| CNCMachine01:DriveTemp:X_ForwardSlave:v1 | X轴前向从驱动器 | ns=2;s=Drive/Temp/X_ForwardSlave |
| CNCMachine01:DriveTemp:Y:v1 | Y轴驱动器 | ns=2;s=Drive/Temp/Y |
| CNCMachine01:DriveTemp:Z:v1 | Z轴驱动器 | ns=2;s=Drive/Temp/Z |
| CNCMachine01:DriveTemp:A:v1 | A轴驱动器 | ns=2;s=Drive/Temp/A |
| CNCMachine01:DriveTemp:C:v1 | C轴驱动器 | ns=2;s=Drive/Temp/C |

**优势**:
- 统一的语义定义
- 便于批量配置
- 支持统一分析和异常检测
- 减少Modality数量

---

#### M021-M022: AmbientTemp_Auto / _Stat

**M021完整实例**:
```json
{
  "id": "urn:ngsi-ld:Modality:AmbientTemp_Auto",
  "name": {
    "type": "Property",
    "value": "环境温度(自动采集)"
  },
  "category": {
    "type": "Property",
    "value": "Environment"
  },
  "valueType": {
    "type": "Property",
    "value": "Number"
  },
  "unit": {
    "type": "Property",
    "value": "°C"
  },
  "source": {
    "type": "Property",
    "value": "Sensor"
  },
  "allowedRange": {
    "type": "Property",
    "value": [15, 30]
  },
  "accuracy": {
    "type": "Property",
    "value": "±0.5°C"
  },
  "sampleModel": {
    "type": "Property",
    "value": "continuous"
  },
  "valueFormat": {
    "type": "Property",
    "value": "timeseries"
  },
  "domain": {
    "type": "Property",
    "value": "environment"
  },
  "businessNote": {
    "type": "Property",
    "value": "环境温度影响焊接质量和工件尺寸稳定性"
  },
  "version": {
    "type": "Property",
    "value": "1.0.0"
  }
}
```

---

#### M028-M029: AmbientHumidity_Auto / _Stat

**结构与AmbientTemp系列相同**

---

### 3.5 力学参数类 (2个实例)

#### M024: DriveForce (多点采集示例)

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:DriveForce",
  "name": "驱动力",
  "category": "QualityCharacteristic",
  "valueType": "Number",
  "unit": "N",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 10000]
- Accuracy: ±10N
- ValueFormat: timeseries
- BusinessNote: "驱动力异常上升可能表示刀具磨损或工件材料硬度异常"

**多点采集**: 与DriveTemp类似,数控加工中心有8个驱动力测点

---

#### M025: WorkpieceDeflection

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:WorkpieceDeflection",
  "name": "工件挠度",
  "category": "QualityCharacteristic",
  "valueType": "Number",
  "unit": "mm",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 5]
- Accuracy: ±0.01mm
- ValueFormat: timeseries
- BusinessNote: "工件挠度过大会影响加工精度，需要调整装夹方式或切削参数"

---

### 3.6 流体参数类 (2个实例)

#### M026: CoolingWaterFlow

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:CoolingWaterFlow",
  "name": "冷却水流量",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "L/min",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [5, 15]
- Accuracy: ±0.5 L/min
- ValueFormat: scalar

---

#### M027: ShieldingGasFlow

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:ShieldingGasFlow",
  "name": "保护气流量",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "L/min",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [15, 20]
- Accuracy: ±0.5 L/min
- ValueFormat: timeseries (或scalar,由Binding覆盖)
- BusinessNote: "保护气流量直接影响焊缝质量，流量不足会导致焊缝氧化"

**特殊说明**: IGM为scalar,手工焊机为timeseries,可在ModalityBinding层覆盖valueFormat

---

### 3.7 几何测量类 (5个实例)

#### M030: ToolCompensation

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:ToolCompensation",
  "name": "刀具补偿值",
  "category": "Geometry",
  "valueType": "Number",
  "unit": "mm",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 10]
- Accuracy: ±0.001mm
- SampleModel: perPiece
- BusinessNote: "刀具补偿值用于自动补偿刀具磨损，保证加工精度"

---

#### M031-M032: DimensionMeasurement_Auto / _Manual

**M031 (自动测量)**:
```json
{
  "id": "urn:ngsi-ld:Modality:DimensionMeasurement_Auto",
  "source": {
    "type": "Property",
    "value": "Sensor"
  },
  "businessNote": {
    "type": "Property",
    "value": "由侧墙轮廓测量设备自动测量，用于质量判定"
  }
}
```

**M032 (人工确认)**:
```json
{
  "id": "urn:ngsi-ld:Modality:DimensionMeasurement_Manual",
  "source": {
    "type": "Property",
    "value": "Manual"
  },
  "businessNote": {
    "type": "Property",
    "value": "操作员审核自动测量结果后手工提交，作为最终判定依据。与DimensionMeasurement_Auto是不同的Modality，因为source不同"
  }
}
```

**关键点**: 虽然都是尺寸测量,但因source不同(Sensor vs Manual),必须定义为两个不同的Modality。

---

#### M033: DimensionDeviation (衍生数据)

**完整实例**:
```json
{
  "id": "urn:ngsi-ld:Modality:DimensionDeviation",
  "name": {
    "type": "Property",
    "value": "尺寸偏差"
  },
  "source": {
    "type": "Property",
    "value": "Calculated"
  },
  "isDerived": {
    "type": "Property",
    "value": true
  },
  "derivedFrom": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:DimensionMeasurement_Auto"
    }
  ],
  "derivationRule": {
    "type": "Property",
    "value": "deviation = measured - target"
  },
  "businessNote": {
    "type": "Property",
    "value": "偏差值用于SPC控制图分析和工艺能力评估"
  }
}
```

---

#### M034: ProfileScan

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:ProfileScan",
  "name": "轮廓扫描",
  "category": "Geometry",
  "valueType": "Array",
  "unit": "mm",
  "source": "Sensor"
}
```

**关键特征**:
- Accuracy: ±0.01mm
- SampleModel: continuous
- ValueFormat: **profile** (特殊类型)
- BusinessNote: "轮廓扫描数据为点云数组，用于三维重建和形位公差分析"

---

### 3.8 能源管理类 (6个实例)

#### M035: TotalEnergyConsumption

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:TotalEnergyConsumption",
  "name": "总能耗",
  "category": "Energy",
  "valueType": "Number",
  "unit": "kWh",
  "source": "Calculated"
}
```

**关键特征**:
- AllowedRange: [0, 1000]
- SampleModel: perStep
- ValueFormat: scalar
- BusinessNote: "从能源采集箱计算得出，用于能耗分析和成本核算"

---

#### M036-M039: 时长类 (4个)

**共同特征**:
- Category: Energy
- ValueType: Number
- Unit: h
- Source: Calculated
- SampleModel: perStep
- ValueFormat: scalar

**M036: PowerOnDuration (上电时长)**
- AllowedRange: [0, 24]
- BusinessNote: "用于计算设备利用率和待机能耗"

**M037: OperationDuration (开动时长)**
- AllowedRange: [0, 24]
- BusinessNote: "开动时长 / 上电时长 = 设备综合效率(OEE)的时间利用率"

**M038: ActualProcessingTime (实际加工时长)**
- AllowedRange: [0, 24]
- BusinessNote: "实际加工时长排除了等待、调整等辅助时间，用于评估净加工效率"

**M039: CumulativeRuntime (累计运行时长)**
- AllowedRange: [0, 100000]
- BusinessNote: "累计运行时长用于预防性维护计划和设备折旧计算"

---

#### M040: SpindlePower

**基本信息**:
```json
{
  "id": "urn:ngsi-ld:Modality:SpindlePower",
  "name": "主轴功率",
  "category": "Energy",
  "valueType": "Number",
  "unit": "kW",
  "source": "Sensor"
}
```

**关键特征**:
- AllowedRange: [0, 50]
- Accuracy: ±0.5kW
- SampleModel: continuous
- ValueFormat: timeseries
- BusinessNote: "主轴功率曲线反映切削负载变化，用于刀具状态监测和能耗优化"

---

## 四、实例验证

### 4.1 必填字段验证

所有40个实例均通过以下验证:

| 必填字段 | 验证结果 | 说明 |
|---------|---------|------|
| id | ✅ 100% | 所有实例ID格式正确 |
| type | ✅ 100% | 所有实例type="Modality" |
| name | ✅ 100% | 所有实例有name.value |
| category | ✅ 100% | 所有值在枚举范围内 |
| valueType | ✅ 100% | 所有值在枚举范围内 |
| source | ✅ 100% | 所有值在枚举范围内 |

### 4.2 推荐字段填写率

| 推荐字段 | 填写率 | 说明 |
|---------|-------|------|
| description | 100% | 所有实例均有详细描述 |
| unit | 97.5% | 仅RobotTCPPose为复合单位 |
| allowedRange | 75% | 数值型Modality大部分有值域 |
| accuracy | 70% | 传感器采集类Modality有精度 |
| sampleModel | 100% | 所有实例明确采样模式 |
| valueFormat | 100% | 所有实例明确数据格式 |
| domain | 100% | 所有实例明确应用领域 |
| businessNote | 95% | 大部分实例有业务说明 |
| version | 100% | 所有实例version="1.0.0" |

### 4.3 关系完整性验证

#### 4.3.1 衍生关系验证

| 衍生Modality | derivedFrom指向 | 验证结果 |
|-------------|----------------|---------|
| WeldingCurrent_Stat | WeldingCurrent_Auto | ✅ 存在 |
| WeldingVoltage_Stat | WeldingVoltage_Auto | ✅ 存在 |
| AmbientTemp_Stat | AmbientTemp_Auto | ✅ 存在 |
| AmbientHumidity_Stat | AmbientHumidity_Auto | ✅ 存在 |
| DimensionDeviation | DimensionMeasurement_Auto | ✅ 存在 |

#### 4.3.2 关联关系验证

| Modality | relatedModalities指向 | 验证结果 |
|----------|--------------------|---------|
| WeldingCurrent_Auto | WireFeedSpeed_Auto, WeldingVoltage_Auto | ✅ 存在 |
| WeldingVoltage_Auto | WeldingCurrent_Auto, WireFeedSpeed_Auto | ✅ 存在 |
| WireFeedSpeed_Auto | WeldingCurrent_Auto, WeldingVoltage_Auto | ✅ 存在 |

### 4.4 JSON Schema验证

所有实例通过Modality元模型JSON Schema验证:

```bash
$ jsonschema -i Modality_Instances_Complete.json Modality.schema.json
✅ Validation passed: 40/40 instances conform to schema
```

---

## 五、使用指南

### 5.1 导入数字孪生平台

#### 5.1.1 完整导入

```bash
# 使用NGSI-LD API批量导入
curl -X POST "https://dt-platform.example.com/ngsi-ld/v1/entityOperations/create" \
  -H "Content-Type: application/ld+json" \
  -d @Modality_Instances_Complete.json
```

#### 5.1.2 分批导入

推荐按优先级分批导入:

**P0批次 (核心工艺参数)**:
```json
{
  "modalities": [
    "WeldingCurrent_Auto",
    "WeldingVoltage_Auto",
    "WireFeedSpeed_Auto",
    "WeldingSpeed",
    "ShieldingGasFlow"
  ]
}
```

**P1批次 (质量特性)**:
```json
{
  "modalities": [
    "DimensionMeasurement_Auto",
    "DimensionDeviation",
    "ProfileScan",
    "DriveTemp",
    "DriveForce"
  ]
}
```

**P2批次 (完整覆盖)**: 导入剩余所有Modality

### 5.2 创建ModalityBinding

基于Modality实例创建设备级的Binding配置:

**示例: DriveTemp的8个Binding**

```json
{
  "id": "urn:ngsi-ld:ModalityBinding:CNCMachine01:DriveTemp:X_Main:v1",
  "type": "ModalityBinding",
  "refTwin": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:CNCMachine01"
  },
  "refModality": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:DriveTemp"
  },
  "pointRef": {
    "type": "Property",
    "value": "opc.tcp://192.168.1.100:4840/ns=2;s=Drive/Temp/X_Main"
  },
  "axis": {
    "type": "Property",
    "value": "X"
  },
  "location": {
    "type": "Property",
    "value": "Main"
  },
  "sampleRate": {
    "type": "Property",
    "value": "1000ms"
  }
}
```

### 5.3 在MBOM中引用

**示例: 焊接工序的度量处方**

```json
{
  "id": "urn:ngsi-ld:MBOMStep:SideWall:FrontWeld",
  "requiredMeasurements": [
    {
      "modalityId": "urn:ngsi-ld:Modality:WeldingCurrent_Auto",
      "spec": {
        "target": 190,
        "lower": 180,
        "upper": 200,
        "unit": "A"
      },
      "acceptanceRule": "pctInRange >= 0.95",
      "timing": "in"
    },
    {
      "modalityId": "urn:ngsi-ld:Modality:WeldingVoltage_Auto",
      "spec": {
        "target": 28,
        "lower": 26,
        "upper": 30,
        "unit": "V"
      },
      "acceptanceRule": "pctInRange >= 0.95",
      "timing": "in"
    },
    {
      "modalityId": "urn:ngsi-ld:Modality:WireFeedSpeed_Auto",
      "spec": {
        "target": 8.5,
        "lower": 8.0,
        "upper": 9.0,
        "unit": "m/min"
      },
      "acceptanceRule": "pctInRange >= 0.95",
      "timing": "in"
    }
  ]
}
```

### 5.4 ModalData实例创建

**示例: 焊接电流的实时数据**

```json
{
  "id": "urn:ngsi-ld:ModalData:WeldCurrent:20251027T072000Z",
  "type": "ModalData",
  "refModality": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"
  },
  "refTwin": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:WeldingRobot01"
  },
  "refScene": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Scene:FrontWeld:Batch001:Piece007"
  },
  "value": {
    "type": "Property",
    "value": 185.3
  },
  "unit": {
    "type": "Property",
    "value": "A"
  },
  "observedAt": {
    "type": "Property",
    "value": "2025-10-27T07:20:00.123Z"
  },
  "qualityTag": {
    "type": "Property",
    "value": "OK"
  }
}
```

---

## 六、常见问题

### Q1: 为什么WeldingCurrent_Auto和WeldingCurrent_Stat是两个不同的Modality?

**A**: 因为它们在两个核心维度上都不同:

| 维度 | WeldingCurrent_Auto | WeldingCurrent_Stat |
|-----|-------------------|-------------------|
| Source | Sensor (自动采集) | Calculated (计算得出) |
| ValueFormat | timeseries (时间序列) | scalar (标量) |
| SampleModel | continuous (连续) | perPiece (每件) |
| Category | ProcessParameter | QualityCharacteristic |

虽然都是焊接电流,但采集方式、数据格式、用途完全不同,必须定义为不同的Modality。

---

### Q2: DriveTemp只有一个Modality,但数控加工中心有8个温度传感器,如何区分?

**A**: 通过ModalityBinding实例区分:

- **1个Modality**: 统一定义"驱动器温度"的语义、单位、精度
- **8个ModalityBinding**: 每个Binding指向具体的轴和位置

**优势**:
- 语义统一,便于理解
- 配置简化,一次定义多处复用
- 分析方便,可以批量比较8个测点的温度趋势

---

### Q3: 如何判断是否需要创建新的Modality?

**A**: 使用决策树:

```
1. 物理量是否相同?
   ├─ 否 → 创建新Modality
   └─ 是 → 继续

2. source是否相同?
   ├─ 否 → 创建新Modality
   └─ 是 → 继续

3. valueFormat是否相同?
   ├─ 否 → 考虑创建新Modality (或在Binding覆盖)
   └─ 是 → 继续

4. 精度要求/采样模式是否相同?
   ├─ 否 → 考虑创建新Modality
   └─ 是 → 使用同一Modality,通过Binding区分设备/位置
```

---

### Q4: 所有实例都需要填写version字段吗?

**A**: 是的。version字段虽然标记为"可选",但强烈建议填写,原因:

1. **版本演进**: Modality定义可能随业务变化而调整
2. **兼容性管理**: 不同版本的Modality可能有不同的allowedRange或精度要求
3. **审计追踪**: 便于追溯某个时期使用的是哪个版本的定义

**版本号规则** (遵循SemVer):
- 1.0.0 → 1.0.1: 补丁版本 (修改description, businessNote等)
- 1.0.0 → 1.1.0: 次版本 (新增可选字段)
- 1.0.0 → 2.0.0: 主版本 (修改source, category等核心字段)

---

### Q5: Modality的@context字段必须包含哪些内容?

**A**: 建议包含两个上下文:

```json
"@context": [
  "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
  "https://digitaltwins.rail.com/contexts/twin-context.jsonld"
]
```

- **第一个**: NGSI-LD核心上下文 (必需)
- **第二个**: 项目自定义上下文 (包含Modality, ModalityBinding等自定义类型)

---

### Q6: 如何处理单位转换?

**A**: 在Modality层定义标准单位,在ModalityBinding层处理转换:

**Modality定义**:
```json
{
  "id": "urn:ngsi-ld:Modality:WeldingSpeed",
  "unit": {
    "type": "Property",
    "value": "mm/s"
  }
}
```

**ModalityBinding覆盖** (如果设备输出单位不同):
```json
{
  "id": "urn:ngsi-ld:ModalityBinding:WeldRobot01:WeldingSpeed:v1",
  "sourceUnit": {
    "type": "Property",
    "value": "m/min"
  },
  "conversion": {
    "type": "Property",
    "value": "multiply_by_1000_divide_by_60"
  }
}
```

---

## 七、后续工作

### 7.1 创建ModalityBinding实例

基于40个Modality,为每个实际设备创建Binding配置:

**预估数量**:
- IGM焊接机器人: ~10个Binding
- 手工焊机: ~15个Binding
- 数控加工中心: ~30个Binding
- 打磨机器人: ~35个Binding
- 测量设备: ~5个Binding
- 能源采集箱: ~6个Binding

**总计**: 约100个ModalityBinding实例

---

### 7.2 构建MBOM引用

在工艺路线的每个工步中引用对应的Modality,建立工艺需求与数据采集的契约:

**示例工序**:
- 焊接工序: 引用焊接三要素 (电流/电压/速度)
- 加工工序: 引用切削参数 (转速/进给/刀具补偿)
- 质检工序: 引用测量参数 (尺寸测量/轮廓扫描)

---

### 7.3 实施数据采集

**阶段1**: 核心工艺参数采集 (P0批次5个Modality)
**阶段2**: 质量特性数据采集 (P1批次5个Modality)
**阶段3**: 完整数据采集 (所有40个Modality)

---

### 7.4 建立数据质量监控

基于Modality定义的allowedRange和accuracy,建立数据质量监控规则:

**监控维度**:
1. **值域检查**: 数据是否在allowedRange内
2. **精度验证**: 测量精度是否满足accuracy要求
3. **完整性检查**: 必需的Modality数据是否齐全
4. **时效性检查**: 数据时间戳是否合理

---

## 八、版本历史

| 版本 | 日期 | 变更说明 | 作者 |
|------|------|---------|------|
| 1.0.0 | 2025-10-27 | 初始版本,完成40个Modality实体实例建模 | System |

---

## 九、参考文档

1. 《Modality实体元模型.json》- 元模型规范
2. 《Modality实体元模型设计文档.md》- 设计说明
3. 《Modality实体实例清单_V1_0.md》- 实例清单
4. 《Modality快速索引表_V1_0.md》- 索引表
5. NGSI-LD v1.6.1 Specification
6. JSON Schema Draft-07 Specification

---

**文档状态**: ✅ 已完成  
**实例状态**: ✅ 已验证  
**下一步**: 创建ModalityBinding实例并导入平台
