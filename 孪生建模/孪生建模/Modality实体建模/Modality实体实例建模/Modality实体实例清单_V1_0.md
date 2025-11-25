# Modality 实体实例清单

**版本**: 1.0.0  
**日期**: 2025-10-27  
**适用范围**: 动车侧墙产线数字孪生系统  
**文档目的**: 为Modality实体实例建模提供完整、准确的输入清单

---

## 清单说明

### 抽象原则

基于"**物理量 + 采集方式**"双维度:

1. **物理量相同** + **采集方式相同** → **同一个Modality** (不同设备/位置用ModalityBinding区分)
2. **物理量相同** + **采集方式不同** → **不同的Modality** (必须拆分)
3. **物理量不同** → **不同的Modality**

### 命名规范

**Modality ID格式**: `urn:ngsi-ld:Modality:{PhysicalQuantity}[_{Source}]`

- 当source为默认的Sensor时,可省略后缀
- 当source为Calculated/Manual等非默认值时,必须添加后缀

**示例**:
- `urn:ngsi-ld:Modality:WeldingCurrent_Auto` (明确标识自动采集)
- `urn:ngsi-ld:Modality:WeldingCurrent_Stat` (明确标识统计计算)
- `urn:ngsi-ld:Modality:DriveTemp` (默认Sensor,可省略后缀)

### 统计说明

| 指标 | 数值 |
|-----|------|
| 原始采集项 | 91 |
| 抽象后Modality | 36 |
| 压缩比 | 2.5:1 |
| Sensor类型 | 24 |
| Calculated类型 | 11 |
| Manual类型 | 1 |

---

## 一、运动速度类 (6个Modality)

### M001: RobotLinearSpeed (机器人线速度)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:RobotLinearSpeed`
- 名称: 机器人线速度
- Category: ProcessParameter
- ValueType: Number
- Unit: mm/s
- Source: Sensor

**覆盖范围**:
- 大线打磨机器人 - RobotSpeed
- 窗口打磨机器人 - Robot1Speed
- 窗口打磨机器人 - Robot2Speed
- 窗口打磨机器人 - Robot2Speed(Sec.)

**关键属性**:
- AllowedRange: [0, 500]
- Accuracy: ±1mm/s
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: process

**ModalityBinding区分维度**:
- 设备: GrindingRobot01, WindowRobot01, WindowRobot02
- 用途: grinding_speed, positioning_speed

---

### M002: MotorRotationSpeed (电机转速)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:MotorRotationSpeed`
- 名称: 电机转速
- Category: ProcessParameter
- ValueType: Number
- Unit: rpm
- Source: Sensor

**覆盖范围**:
- IGM焊接机器人 - MotorSpeed
- 数控加工中心 - SpindleSpeed

**关键属性**:
- AllowedRange: [0, 6000]
- Accuracy: ±10rpm
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: process

**ModalityBinding区分维度**:
- 电机类型: welding_motor, spindle_motor

---

### M003: WireFeedSpeed_Auto (送丝速度-自动采集)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:WireFeedSpeed_Auto`
- 名称: 送丝速度(自动采集)
- Category: ProcessParameter
- ValueType: Number
- Unit: m/min
- Source: Sensor

**覆盖范围**:
- IGM焊接机器人 - WireFeedingSpeed
- 手工焊机 - WireFeedSpeed

**关键属性**:
- AllowedRange: [0, 20]
- Accuracy: ±0.1 m/min
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: process

**关联模态**:
- WeldingCurrent_Auto
- WeldingVoltage_Auto

---

### M004: WeldingSpeed (焊接速度)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:WeldingSpeed`
- 名称: 焊接速度
- Category: ProcessParameter
- ValueType: Number
- Unit: mm/s
- Source: Sensor

**覆盖范围**:
- IGM焊接机器人 - WeldingSpeed

**关键属性**:
- AllowedRange: [3, 8]
- Accuracy: ±0.5mm/s
- SampleModel: continuous
- ValueFormat: scalar
- Domain: process
- BusinessNote: CRH侧墙标准范围3-8mm/s

---

### M005: ToolLinearSpeed (刀具线速度)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:ToolLinearSpeed`
- 名称: 刀具线速度
- Category: ProcessParameter
- ValueType: Number
- Unit: m/min
- Source: Sensor

**覆盖范围**:
- 大线打磨机器人 - MillingSpeed

**关键属性**:
- AllowedRange: [200, 300]
- Accuracy: ±5 m/min
- SampleModel: continuous
- ValueFormat: scalar
- Domain: process
- BusinessNote: 侧墙加工中心硬质合金刀片标准范围

---

### M006: FeedRate (进给速度)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:FeedRate`
- 名称: 进给速度
- Category: ProcessParameter
- ValueType: Number
- Unit: mm/min
- Source: Sensor

**覆盖范围**:
- 数控加工中心 - FeedRate

**关键属性**:
- AllowedRange: [0, 5000]
- Accuracy: ±10mm/min
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: process
- BusinessNote: 直接影响加工效率和表面质量

---

## 二、位姿/位置类 (8个Modality)

### M007: RobotTCPPose (机器人TCP位姿)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:RobotTCPPose`
- 名称: 机器人TCP位姿
- Category: Geometry
- ValueType: Object
- Unit: Position:mm; Orientation:deg
- Source: Sensor

**覆盖范围**:
- IGM焊接机器人 - TCPPose

**关键属性**:
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: geometry
- ValueStructure: {X, Y, Z, A, B, C}

**说明**: 6自由度位姿数据

---

### M008: RobotBaseX (机器人X轴姿态)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:RobotBaseX`
- 名称: 机器人X轴姿态
- Category: Geometry
- ValueType: Number
- Unit: deg
- Source: Sensor

**覆盖范围**:
- 大线打磨机器人 - RobotXPose
- 窗口打磨机器人 - Robot1XPose
- 窗口打磨机器人 - Robot2XPose

**关键属性**:
- AllowedRange: [-180, 180]
- Accuracy: ±0.1deg
- SampleModel: continuous
- ValueFormat: scalar
- Domain: geometry
- BusinessNote: 绕X轴旋转角度(Roll),防线缆缠绕

---

### M009: RobotBaseY (机器人Y轴姿态)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:RobotBaseY`
- 名称: 机器人Y轴姿态
- Category: Geometry
- ValueType: Number
- Unit: deg
- Source: Sensor

**覆盖范围**:
- 大线打磨机器人 - RobotYPose
- 窗口打磨机器人 - Robot1YPose
- 窗口打磨机器人 - Robot2YPose

**关键属性**:
- AllowedRange: [-180, 180]
- Accuracy: ±0.1deg
- SampleModel: continuous
- ValueFormat: scalar
- Domain: geometry
- BusinessNote: 绕Y轴旋转角度(Pitch)

---

### M010: RobotBaseZ (机器人Z轴姿态)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:RobotBaseZ`
- 名称: 机器人Z轴姿态
- Category: Geometry
- ValueType: Number
- Unit: deg
- Source: Sensor

**覆盖范围**:
- 大线打磨机器人 - RobotZPose
- 窗口打磨机器人 - Robot1ZPose
- 窗口打磨机器人 - Robot2ZPose

**关键属性**:
- AllowedRange: [-180, 180]
- Accuracy: ±0.1deg
- SampleModel: continuous
- ValueFormat: scalar
- Domain: geometry
- BusinessNote: 绕Z轴旋转角度(Yaw)

---

### M011: RobotToolEX (工具坐标系X姿态)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:RobotToolEX`
- 名称: 工具坐标系X姿态
- Category: Geometry
- ValueType: Number
- Unit: deg
- Source: Sensor

**覆盖范围**:
- 大线打磨机器人 - RobotEXPose
- 窗口打磨机器人 - Robot1EXPose
- 窗口打磨机器人 - Robot2EXPose

**关键属性**:
- AllowedRange: [-180, 180]
- Accuracy: ±0.1deg
- SampleModel: continuous
- ValueFormat: scalar
- Domain: geometry

---

### M012: RobotToolEY (工具坐标系Y姿态)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:RobotToolEY`
- 名称: 工具坐标系Y姿态
- Category: Geometry
- ValueType: Number
- Unit: deg
- Source: Sensor

**覆盖范围**:
- 大线打磨机器人 - RobotEYPose
- 窗口打磨机器人 - Robot1EYPose
- 窗口打磨机器人 - Robot2EYPose

**关键属性**:
- AllowedRange: [-180, 180]
- Accuracy: ±0.1deg
- SampleModel: continuous
- ValueFormat: scalar
- Domain: geometry

---

### M013: RobotToolEZ (工具坐标系Z姿态)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:RobotToolEZ`
- 名称: 工具坐标系Z姿态
- Category: Geometry
- ValueType: Number
- Unit: deg
- Source: Sensor

**覆盖范围**:
- 大线打磨机器人 - RobotEZPose
- 窗口打磨机器人 - Robot1EZPose
- 窗口打磨机器人 - Robot2EZPose

**关键属性**:
- AllowedRange: [-180, 180]
- Accuracy: ±0.1deg
- SampleModel: continuous
- ValueFormat: scalar
- Domain: geometry

---

### M014: RobotRailPosition (机器人导轨位置)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:RobotRailPosition`
- 名称: 机器人导轨位置
- Category: Geometry
- ValueType: Number
- Unit: mm
- Source: Sensor

**覆盖范围**:
- 大线打磨机器人 - RobotRailPosition
- 窗口打磨机器人 - Robot1RailPose
- 窗口打磨机器人 - Robot2RailPose

**关键属性**:
- AllowedRange: [0, 10000]
- Accuracy: ±1mm
- SampleModel: continuous
- ValueFormat: scalar
- Domain: geometry
- BusinessNote: 导轨线性定位坐标

---

### M015: AxisAngle (轴旋转角度)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:AxisAngle`
- 名称: 轴旋转角度
- Category: Geometry
- ValueType: Number
- Unit: deg
- Source: Sensor

**覆盖范围**:
- 数控加工中心 - SpindleAngle
- 数控加工中心 - A1AxisAngle
- 数控加工中心 - BAxisAngle
- 数控加工中心 - CAxisAngle

**关键属性**:
- AllowedRange: [0, 360]
- Accuracy: ±0.01deg
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: geometry

**ModalityBinding区分维度**:
- 轴类型: Spindle, A1, B, C

---

## 三、电气参数类 (4个Modality)

### M016: WeldingCurrent_Auto (焊接电流-自动采集)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:WeldingCurrent_Auto`
- 名称: 焊接电流(自动采集)
- Category: ProcessParameter
- ValueType: Number
- Unit: A
- Source: Sensor

**覆盖范围**:
- IGM焊接机器人 - WeldingCurrent
- 手工焊机 - CurrentActual

**关键属性**:
- AllowedRange: [0, 500]
- Accuracy: ±1%
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: process

**关联模态**:
- WireFeedSpeed_Auto
- WeldingVoltage_Auto

---

### M017: WeldingCurrent_Stat (焊接电流-统计值)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:WeldingCurrent_Stat`
- 名称: 焊接电流(统计值)
- Category: QualityCharacteristic
- ValueType: Number
- Unit: A
- Source: Calculated

**覆盖范围**:
- 手工焊机 - CurrentMin
- 手工焊机 - CurrentMax

**关键属性**:
- AllowedRange: [0, 500]
- SampleModel: perPiece
- ValueFormat: scalar
- Domain: quality
- IsDerived: true
- DerivedFrom: [WeldingCurrent_Auto]
- DerivationRule: "min/max over scene duration"

**说明**: 与WeldingCurrent_Auto是不同的Modality,因为source不同

---

### M018: WeldingVoltage_Auto (焊接电压-自动采集)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:WeldingVoltage_Auto`
- 名称: 焊接电压(自动采集)
- Category: ProcessParameter
- ValueType: Number
- Unit: V
- Source: Sensor

**覆盖范围**:
- IGM焊接机器人 - WeldingVoltage
- 手工焊机 - VoltageActual

**关键属性**:
- AllowedRange: [0, 50]
- Accuracy: ±0.5%
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: process

**关联模态**:
- WeldingCurrent_Auto
- WireFeedSpeed_Auto

---

### M019: WeldingVoltage_Stat (焊接电压-统计值)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:WeldingVoltage_Stat`
- 名称: 焊接电压(统计值)
- Category: QualityCharacteristic
- ValueType: Number
- Unit: V
- Source: Calculated

**覆盖范围**:
- 手工焊机 - VoltageMin
- 手工焊机 - VoltageMax

**关键属性**:
- AllowedRange: [0, 50]
- SampleModel: perPiece
- ValueFormat: scalar
- Domain: quality
- IsDerived: true
- DerivedFrom: [WeldingVoltage_Auto]
- DerivationRule: "min/max over scene duration"

---

## 四、温度类 (4个Modality)

### M020: DriveTemp (驱动器温度)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:DriveTemp`
- 名称: 驱动器温度
- Category: QualityCharacteristic
- ValueType: Number
- Unit: °C
- Source: Sensor

**覆盖范围**:
- 数控加工中心 - DriveTempX
- 数控加工中心 - DriveTempXF
- 数控加工中心 - DriveTempXS
- 数控加工中心 - DriveTempXFS
- 数控加工中心 - DriveTempY
- 数控加工中心 - DriveTempZ
- 数控加工中心 - DriveTempA
- 数控加工中心 - DriveTempC

**关键属性**:
- AllowedRange: [0, 80]
- Accuracy: ±1°C
- SampleModel: continuous
- ValueFormat: scalar
- Domain: quality
- BusinessNote: 过热报警阈值70°C

**ModalityBinding区分维度**:
- 轴位置: X_Main, X_Forward, X_Slave, X_ForwardSlave, Y, Z, A, C

**说明**: 典型的多点采集场景,8个传感器共享同一个Modality定义

---

### M021: AmbientTemp_Auto (环境温度-自动采集)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:AmbientTemp_Auto`
- 名称: 环境温度(自动采集)
- Category: Environment
- ValueType: Number
- Unit: °C
- Source: Sensor

**覆盖范围**:
- 手工焊机 - TemperatureActual

**关键属性**:
- AllowedRange: [15, 30]
- Accuracy: ±0.5°C
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: environment

---

### M022: AmbientTemp_Stat (环境温度-统计值)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:AmbientTemp_Stat`
- 名称: 环境温度(统计值)
- Category: Environment
- ValueType: Number
- Unit: °C
- Source: Calculated

**覆盖范围**:
- 手工焊机 - TemperatureMin
- 手工焊机 - TemperatureMax

**关键属性**:
- AllowedRange: [15, 30]
- SampleModel: perPiece
- ValueFormat: scalar
- Domain: environment
- IsDerived: true
- DerivedFrom: [AmbientTemp_Auto]
- DerivationRule: "min/max over scene duration"

---

### M023: SendWireCurrent (送丝电流)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:SendWireCurrent`
- 名称: 送丝电流
- Category: ProcessParameter
- ValueType: Number
- Unit: A
- Source: Sensor

**覆盖范围**:
- IGM焊接机器人 - SendWireCurrent

**关键属性**:
- AllowedRange: [0, 50]
- Accuracy: ±1%
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: process
- BusinessNote: 送丝电机驱动电流

---

## 五、力学参数类 (2个Modality)

### M024: DriveForce (驱动力)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:DriveForce`
- 名称: 驱动力
- Category: QualityCharacteristic
- ValueType: Number
- Unit: N
- Source: Sensor

**覆盖范围**:
- 数控加工中心 - DriveForceX
- 数控加工中心 - DriveForceXF
- 数控加工中心 - DriveForceXS
- 数控加工中心 - DriveForceXFS
- 数控加工中心 - DriveForceY
- 数控加工中心 - DriveForceZ
- 数控加工中心 - DriveForceA
- 数控加工中心 - DriveForceC

**关键属性**:
- AllowedRange: [0, 10000]
- Accuracy: ±10N
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: quality
- BusinessNote: 伺服驱动器输出力/扭矩,用于刀具磨损监测

**ModalityBinding区分维度**:
- 轴位置: X, XF, XS, XFS, Y, Z, A, C

---

### M025: WorkpieceDeflection (工件挠度)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:WorkpieceDeflection`
- 名称: 工件挠度
- Category: QualityCharacteristic
- ValueType: Number
- Unit: mm
- Source: Sensor

**覆盖范围**:
- 数控加工中心 - WorkpieceDeflection

**关键属性**:
- AllowedRange: [0, 5]
- Accuracy: ±0.01mm
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: quality
- BusinessNote: 加工过程中工件弹性变形量

---

## 六、流体参数类 (2个Modality)

### M026: CoolingWaterFlow (冷却水流量)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:CoolingWaterFlow`
- 名称: 冷却水流量
- Category: ProcessParameter
- ValueType: Number
- Unit: L/min
- Source: Sensor

**覆盖范围**:
- IGM焊接机器人 - CoolingWaterFlow

**关键属性**:
- AllowedRange: [5, 15]
- Accuracy: ±0.5 L/min
- SampleModel: continuous
- ValueFormat: scalar
- Domain: process
- BusinessNote: 焊枪冷却水流量

---

### M027: ShieldingGasFlow (保护气流量)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:ShieldingGasFlow`
- 名称: 保护气流量
- Category: ProcessParameter
- ValueType: Number
- Unit: L/min
- Source: Sensor

**覆盖范围**:
- IGM焊接机器人 - ShieldingGasFlow
- 手工焊机 - GasFlowRate

**关键属性**:
- AllowedRange: [15, 20]
- Accuracy: ±0.5 L/min
- SampleModel: continuous
- ValueFormat: timeseries (或scalar,由Binding覆盖)
- Domain: process
- BusinessNote: 焊接保护气体流量

**说明**: IGM为scalar,手工焊机为timeseries,可在Binding层覆盖valueFormat

---

## 七、环境参数类 (2个Modality)

### M028: AmbientHumidity_Auto (环境湿度-自动采集)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:AmbientHumidity_Auto`
- 名称: 环境湿度(自动采集)
- Category: Environment
- ValueType: Number
- Unit: %RH
- Source: Sensor

**覆盖范围**:
- 手工焊机 - HumidityActual

**关键属性**:
- AllowedRange: [30, 70]
- Accuracy: ±2%RH
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: environment

---

### M029: AmbientHumidity_Stat (环境湿度-统计值)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:AmbientHumidity_Stat`
- 名称: 环境湿度(统计值)
- Category: Environment
- ValueType: Number
- Unit: %RH
- Source: Calculated

**覆盖范围**:
- 手工焊机 - HumidityMin
- 手工焊机 - HumidityMax

**关键属性**:
- AllowedRange: [30, 70]
- SampleModel: perPiece
- ValueFormat: scalar
- Domain: environment
- IsDerived: true
- DerivedFrom: [AmbientHumidity_Auto]
- DerivationRule: "min/max over scene duration"

---

## 八、几何测量类 (5个Modality)

### M030: ToolCompensation (刀具补偿值)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:ToolCompensation`
- 名称: 刀具补偿值
- Category: Geometry
- ValueType: Number
- Unit: mm
- Source: Sensor

**覆盖范围**:
- 数控加工中心 - ToolCompensation

**关键属性**:
- AllowedRange: [0, 10]
- Accuracy: ±0.001mm
- SampleModel: perPiece
- ValueFormat: scalar
- Domain: geometry
- BusinessNote: 刀具长度/半径补偿

---

### M031: DimensionMeasurement_Auto (尺寸测量-自动)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:DimensionMeasurement_Auto`
- 名称: 尺寸测量(自动)
- Category: QualityCharacteristic
- ValueType: Number
- Unit: mm
- Source: Sensor

**覆盖范围**:
- 侧墙轮廓测量设备 - TestValue

**关键属性**:
- Accuracy: ±0.01mm
- SampleModel: perPiece
- ValueFormat: scalar
- Domain: quality
- BusinessNote: 测量设备自动测量的工件尺寸实测值

---

### M032: DimensionMeasurement_Manual (尺寸测量-人工确认)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:DimensionMeasurement_Manual`
- 名称: 尺寸测量(人工确认)
- Category: QualityCharacteristic
- ValueType: Number
- Unit: mm
- Source: Manual

**覆盖范围**:
- 侧墙轮廓测量设备 - SubmittedValue

**关键属性**:
- Accuracy: ±0.01mm
- SampleModel: perPiece
- ValueFormat: scalar
- Domain: quality
- BusinessNote: 操作员人工确认后提交的尺寸值

**说明**: 与DimensionMeasurement_Auto是不同的Modality,因为source不同(Manual vs Sensor)

---

### M033: DimensionDeviation (尺寸偏差)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:DimensionDeviation`
- 名称: 尺寸偏差
- Category: QualityCharacteristic
- ValueType: Number
- Unit: mm
- Source: Calculated

**覆盖范围**:
- 侧墙轮廓测量设备 - SensorDeviation

**关键属性**:
- AllowedRange: [-1, 1]
- SampleModel: perPiece
- ValueFormat: scalar
- Domain: quality
- IsDerived: true
- DerivedFrom: [DimensionMeasurement_Auto]
- DerivationRule: "deviation = measured - target"

---

### M034: ProfileScan (轮廓扫描)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:ProfileScan`
- 名称: 轮廓扫描
- Category: Geometry
- ValueType: Array
- Unit: mm
- Source: Sensor

**覆盖范围**:
- 侧墙轮廓测量设备 - SensorActualValue

**关键属性**:
- Accuracy: ±0.01mm
- SampleModel: continuous
- ValueFormat: profile
- Domain: geometry
- BusinessNote: 传感器扫描的完整轮廓数据

---

## 九、能源管理类 (6个Modality)

### M035: TotalEnergyConsumption (总能耗)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:TotalEnergyConsumption`
- 名称: 总能耗
- Category: Energy
- ValueType: Number
- Unit: kWh
- Source: Calculated

**覆盖范围**:
- 能源采集箱 - TotalEnergyConsumption

**关键属性**:
- AllowedRange: [0, 1000]
- SampleModel: perStep
- ValueFormat: scalar
- Domain: energy
- BusinessNote: 统计周期内总电能消耗

---

### M036: PowerOnDuration (上电时长)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:PowerOnDuration`
- 名称: 上电时长
- Category: Energy
- ValueType: Number
- Unit: h
- Source: Calculated

**覆盖范围**:
- 能源采集箱 - PowerOnDuration

**关键属性**:
- AllowedRange: [0, 24]
- SampleModel: perStep
- ValueFormat: scalar
- Domain: energy
- BusinessNote: 设备通电总时长

---

### M037: OperationDuration (开动时长)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:OperationDuration`
- 名称: 开动时长
- Category: Energy
- ValueType: Number
- Unit: h
- Source: Calculated

**覆盖范围**:
- 能源采集箱 - OperationDuration

**关键属性**:
- AllowedRange: [0, 24]
- SampleModel: perStep
- ValueFormat: scalar
- Domain: energy
- BusinessNote: 设备实际运行时长

---

### M038: ActualProcessingTime (实际加工时长)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:ActualProcessingTime`
- 名称: 实际加工时长
- Category: Energy
- ValueType: Number
- Unit: h
- Source: Calculated

**覆盖范围**:
- 能源采集箱 - ActualProcessingTime

**关键属性**:
- AllowedRange: [0, 24]
- SampleModel: perStep
- ValueFormat: scalar
- Domain: energy
- BusinessNote: 实际执行加工任务的时长

---

### M039: CumulativeRuntime (累计运行时长)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:CumulativeRuntime`
- 名称: 累计运行时长
- Category: Energy
- ValueType: Number
- Unit: h
- Source: Calculated

**覆盖范围**:
- 能源采集箱 - CumulativeRuntime

**关键属性**:
- AllowedRange: [0, 100000]
- SampleModel: perStep
- ValueFormat: scalar
- Domain: energy
- BusinessNote: 设备生命周期累计运行时长

---

### M040: SpindlePower (主轴功率)

**基本信息**:
- ID: `urn:ngsi-ld:Modality:SpindlePower`
- 名称: 主轴功率
- Category: Energy
- ValueType: Number
- Unit: kW
- Source: Sensor

**覆盖范围**:
- 数控加工中心 - SpindlePower

**关键属性**:
- AllowedRange: [0, 50]
- Accuracy: ±0.5kW
- SampleModel: continuous
- ValueFormat: timeseries
- Domain: energy
- BusinessNote: 主轴实时功率

---

## 十、不建议作为Modality的数据项

以下数据项不应建模为独立的Modality实体:

### 时间戳类

**原因**: 应统一使用ModalData.observedAt字段

- 手工焊机 - Timestamp (时间戳)
- 侧墙轮廓测量设备 - MeasurementTime (测量时间)
- 侧墙轮廓测量设备 - SubmissionTime (提交时间)
- 能源采集箱 - StatisticsTime (统计时间)

### 规格参数类

**原因**: 这些是工艺规范,应该在MBOM.requiredMeasurements中定义

- 侧墙轮廓测量设备 - TargetValue (目标值/期望值)
- 侧墙轮廓测量设备 - UpperLimit (上限值)
- 侧墙轮廓测量设备 - LowerLimit (下限值)

**正确做法**: 在MBOM中定义:

```json
{
  "requiredMeasurements": [{
    "modalityId": "urn:ngsi-ld:Modality:DimensionMeasurement_Auto",
    "spec": {
      "target": 100.0,
      "upper": 100.5,
      "lower": 99.5,
      "unit": "mm"
    },
    "acceptanceRule": "inRange"
  }]
}
```

---

## 十一、Modality清单汇总表

### 按source分类

| Source类型 | 数量 | Modality列表 |
|-----------|------|------------|
| **Sensor** | 24 | M001-M015, M016, M018, M020, M021, M023-M027, M030, M031, M034, M040 |
| **Calculated** | 11 | M017, M019, M022, M029, M033, M035-M039 |
| **Manual** | 1 | M032 |
| **合计** | **36** | - |

### 按category分类

| Category | 数量 | Modality列表 |
|---------|------|------------|
| **ProcessParameter** | 11 | M001-M006, M016, M018, M023, M026, M027 |
| **QualityCharacteristic** | 8 | M017, M019, M020, M024, M025, M031-M033 |
| **Geometry** | 9 | M007-M015, M030, M034 |
| **Environment** | 4 | M021, M022, M028, M029 |
| **Energy** | 6 | M035-M040 |
| **合计** | **38** | (M040补充后) |

### 按valueFormat分类

| ValueFormat | 数量 | 典型示例 |
|------------|------|---------|
| **timeseries** | 18 | 电流/电压曲线, 速度曲线, 温度曲线 |
| **scalar** | 16 | 统计值, 角度, 流量, 时长 |
| **profile** | 1 | 轮廓扫描 |
| **Object** | 1 | TCP位姿 |

---

## 十二、关键决策记录

### 已确认的设计决策

1. **手工焊机数据采集方式**: 确认为自动采集(Sensor),与IGM焊机合并
2. **统计值与实时值拆分**: 因source不同,拆分为不同Modality
3. **多点采集策略**: 同一物理量、同一采集方式的多个传感器,共用一个Modality
4. **测量设备提交值**: 确认为人工确认(Manual),独立为DimensionMeasurement_Manual

### 待确认的问题

1. **ShieldingGasFlow的valueFormat**: IGM为scalar, 手工焊机为timeseries
   - 建议: 在Binding层覆盖,Modality层保持timeseries
   
2. **能源采集箱数据source**: 确认为Calculated
   - 原因: 从采集箱内部计算得出,不是直接传感器读数

---

## 十三、实施路径

### 第一阶段: 核心工艺参数 (优先级P0)

建议优先实施以下Modality,覆盖关键工艺过程:

- M016: WeldingCurrent_Auto (焊接电流)
- M018: WeldingVoltage_Auto (焊接电压)
- M003: WireFeedSpeed_Auto (送丝速度)
- M004: WeldingSpeed (焊接速度)
- M027: ShieldingGasFlow (保护气流量)

### 第二阶段: 质量特性 (优先级P1)

- M031: DimensionMeasurement_Auto (尺寸测量)
- M033: DimensionDeviation (尺寸偏差)
- M034: ProfileScan (轮廓扫描)
- M020: DriveTemp (驱动器温度)
- M024: DriveForce (驱动力)

### 第三阶段: 完整覆盖 (优先级P2)

实施剩余所有Modality,构建完整的数据字典

---

## 十四、版本历史

| 版本 | 日期 | 变更说明 | 作者 |
|------|------|---------|------|
| 1.0.0 | 2025-10-27 | 初始版本,完整Modality清单 | System |

---

**文档状态**: ✅ 已完成  
**审核状态**: 待审核  
**下一步**: 基于本清单创建Modality实体JSON-LD实例文件
