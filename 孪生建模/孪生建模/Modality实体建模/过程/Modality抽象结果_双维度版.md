# 动车侧墙产线 - Modality 实体抽象结果（双维度版本）

> 基于"物理量+采集方式"双维度原则
> 
> 从91个原始采集项抽象出最终的Modality清单

---

## 抽象原则

### 判断是否为同一个Modality的决策树

```
1. 是否测量相同的物理量？
   ├─ 否 → 不同的Modality
   └─ 是 → 继续

2. 采集方式（source）是否相同？
   ├─ 否 → 不同的Modality
   └─ 是 → 继续

3. 精度要求、采样模式、数据类型是否相同？
   ├─ 否 → 可能需要拆分（根据业务需求判断）
   └─ 是 → 同一个Modality（不同设备/位置用ModalityBinding区分）
```

---

## 一、抽象结果总览

| 类别 | 原始采集项 | 抽象后Modality | 说明 |
|-----|-----------|---------------|------|
| 运动速度类 | 11 | 6 | 区分了旋转速度、线速度、送丝速度等 |
| 位姿/位置类 | 22 | 8 | 区分了TCP位姿、基座姿态、工具姿态、导轨位置、轴角度 |
| 电气参数类 | 9 | 4 | 焊接电流、送丝电流、焊接电压（区分自动/统计值） |
| 温度类 | 11 | 2 | 驱动器温度、环境温度（区分实时/统计值） |
| 力学参数类 | 9 | 2 | 驱动力、工件挠度 |
| 流体参数类 | 3 | 2 | 冷却水流量、保护气流量 |
| 环境参数类 | 3 | 1 | 环境湿度（区分实时/统计值） |
| 几何测量类 | 8 | 4 | 尺寸测量、偏差、刀补、轮廓扫描 |
| 能源管理类 | 7 | 5 | 能耗、各类时长 |
| 其他 | 8 | 0 | 时间戳、规格参数等不建议作为Modality |
| **总计** | **91** | **~34** | **压缩比约2.7:1** |

---

## 二、详细的Modality抽象清单

### 1. 运动速度类（6个Modality）

#### 1.1 RobotLinearSpeed (机器人线速度)

**抽象依据**：
- 物理量相同：都是机器人末端的线性运动速度
- 采集方式相同：都是从机器人控制器自动采集（source: Sensor）
- 单位相同：mm/s
- 数据类型相同：scalar

**覆盖的原始采集项**：
```
✓ 大线打磨机器人 - RobotSpeed (机器人速度, mm/s)
✓ 窗口打磨机器人 - Robot1Speed (机器人1打磨速度, mm/s)
✓ 窗口打磨机器人 - Robot2Speed (机器人2打磨速度, mm/s)
✓ 窗口打磨机器人 - Robot2Speed（Sec.） (机器人2速度（从）, mm/s)
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:RobotLinearSpeed",
  "type": "Modality",
  "name": "机器人线速度",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "mm/s",
  "source": "Sensor",
  "description": "机器人末端执行器的线性运动速度，从机器人控制器自动采集",
  "allowedRange": [0, 500],
  "accuracy": "±1mm/s"
}
```

**ModalityBinding区分**：
- 不同设备：GrindingRobot01, WindowRobot01, WindowRobot02
- 不同用途：打磨速度 vs 定位速度（通过binding的purpose字段区分）

---

#### 1.2 MotorRotationSpeed (电机转速)

**抽象依据**：
- 物理量相同：电机旋转速度
- 采集方式相同：Sensor
- 单位相同：rpm
- 数据类型相同：timeseries

**覆盖的原始采集项**：
```
✓ IGM焊接机器人 - MotorSpeed (电机速度, rpm, timeseries)
✓ 数控加工中心 - SpindleSpeed (主轴转速, rpm, timeseries)
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:MotorRotationSpeed",
  "type": "Modality",
  "name": "电机转速",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "rpm",
  "source": "Sensor",
  "description": "电机或主轴的旋转速度，实时连续采集",
  "allowedRange": [0, 6000],
  "valueFormat": "timeseries"
}
```

---

#### 1.3 WireFeedSpeed_Auto (送丝速度-自动采集)

**抽象依据**：
- 物理量相同：焊接送丝速度
- 采集方式相同：Sensor (自动采集)
- 单位相同：m/min
- 数据类型相同：timeseries

**覆盖的原始采集项**：
```
✓ IGM焊接机器人 - WireFeedingSpeed (送丝速度, m/min, timeseries)
✓ 手工焊机 - WireFeedSpeed (送丝速度, m/min, timeseries)
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:WireFeedSpeed_Auto",
  "type": "Modality",
  "name": "送丝速度(自动采集)",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "m/min",
  "source": "Sensor",
  "description": "焊接过程中的送丝速度，从焊机控制系统自动采集",
  "allowedRange": [0, 20],
  "accuracy": "±0.1 m/min",
  "relatedModalities": ["WeldingCurrent_Auto"]
}
```

**注意**：如果手工焊机的送丝速度是人工记录的，则需要拆分为另一个Modality: `WireFeedSpeed_Manual`

---

#### 1.4 WeldingSpeed (焊接速度)

**抽象依据**：
- 物理量：焊接过程的移动速度
- 采集方式：Sensor
- 单位：mm/s
- 数据类型：scalar

**覆盖的原始采集项**：
```
✓ IGM焊接机器人 - WeldingSpeed (焊接速度, mm/s, scalar)
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:WeldingSpeed",
  "type": "Modality",
  "name": "焊接速度",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "mm/s",
  "source": "Sensor",
  "description": "焊接过程的移动速度，需与电流/电压协同控制",
  "allowedRange": [3, 8],
  "businessNote": "CRH侧墙标准范围3-8mm/s"
}
```

---

#### 1.5 ToolLinearSpeed (刀具线速度)

**抽象依据**：
- 物理量：切削刀具的线速度
- 采集方式：Sensor
- 单位：m/min
- 数据类型：scalar

**覆盖的原始采集项**：
```
✓ 大线打磨机器人 - MillingSpeed (铣刀速度, m/min, scalar)
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:ToolLinearSpeed",
  "type": "Modality",
  "name": "刀具线速度",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "m/min",
  "source": "Sensor",
  "description": "切削刀具的线速度",
  "allowedRange": [200, 300],
  "businessNote": "侧墙加工中心硬质合金刀片标准范围"
}
```

---

#### 1.6 FeedRate (进给速度)

**抽象依据**：
- 物理量：加工进给速度
- 采集方式：Sensor
- 单位：mm/min
- 数据类型：timeseries

**覆盖的原始采集项**：
```
✓ 数控加工中心 - FeedRate (进给, mm/min, timeseries)
✓ 数控加工中心 - FeedRate (进给速度, mm/min, timeseries) [重复定义]
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:FeedRate",
  "type": "Modality",
  "name": "进给速度",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "mm/min",
  "source": "Sensor",
  "description": "加工过程中刀具或工件的移动速度",
  "allowedRange": [0, 5000],
  "businessNote": "直接影响加工效率和表面质量"
}
```

---

### 2. 位姿/位置类（8个Modality）

#### 2.1 RobotTCPPose (机器人TCP位姿)

**抽象依据**：
- 物理量：6自由度TCP位姿
- 采集方式：Sensor
- 单位：Position: mm; Orientation: deg
- 数据类型：timeseries

**覆盖的原始采集项**：
```
✓ IGM焊接机器人 - TCPPose (TCP位姿, timeseries)
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:RobotTCPPose",
  "type": "Modality",
  "name": "机器人TCP位姿",
  "category": "ProcessParameter",
  "valueType": "Object",
  "unit": "Position: mm; Orientation: deg",
  "source": "Sensor",
  "description": "机器人工具中心点的6自由度位姿{X,Y,Z,A,B,C}",
  "valueStructure": {
    "X": "number (mm)",
    "Y": "number (mm)",
    "Z": "number (mm)",
    "A": "number (deg)",
    "B": "number (deg)",
    "C": "number (deg)"
  }
}
```

---

#### 2.2 RobotBaseX (机器人X轴姿态)

**抽象依据**：
- 物理量相同：绕X轴旋转角度（Roll）
- 采集方式相同：Sensor
- 单位应为：deg（原数据标注为mm有误）
- 数据类型相同：scalar

**覆盖的原始采集项**：
```
✓ 大线打磨机器人 - RobotXPose (机器人X姿态, mm→deg, scalar)
✓ 窗口打磨机器人 - Robot1XPose (机器人1X姿态, mm→deg, scalar)
✓ 窗口打磨机器人 - Robot2XPose (机器人2X姿态, mm→deg, scalar)
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:RobotBaseX",
  "type": "Modality",
  "name": "机器人X轴姿态",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "deg",
  "source": "Sensor",
  "description": "机器人基座坐标系绕X轴旋转角度(Roll)",
  "allowedRange": [-180, 180],
  "businessNote": "防线缆缠绕"
}
```

---

#### 2.3~2.5 RobotBaseY, RobotBaseZ (类似RobotBaseX)

**省略详细定义，结构相同**

---

#### 2.6~2.8 RobotToolEX, RobotToolEY, RobotToolEZ (工具姿态)

**抽象依据**：
- 物理量：工具坐标系的旋转角度
- 采集方式：Sensor
- 单位：deg
- 数据类型：scalar

**覆盖的原始采集项**：
```
✓ 大线打磨机器人 - RobotEXPose/EYPose/EZPose
✓ 窗口打磨机器人 - Robot1EXPose/EYPose/EZPose
✓ 窗口打磨机器人 - Robot2EXPose/EYPose/EZPose
```

---

#### 2.9 RobotRailPosition (机器人导轨位置)

**抽象依据**：
- 物理量相同：导轨线性定位坐标
- 采集方式相同：Sensor
- 单位相同：mm
- 数据类型相同：scalar

**覆盖的原始采集项**：
```
✓ 大线打磨机器人 - RobotRailPosition (机器人导轨位置, mm, scalar)
✓ 窗口打磨机器人 - Robot1RailPose (机器人1导轨位置, mm, scalar)
✓ 窗口打磨机器人 - Robot2RailPose (机器人2导轨位置, mm, scalar)
```

---

#### 2.10 AxisAngle (轴旋转角度)

**抽象依据**：
- 物理量：数控机床旋转轴角度
- 采集方式：Sensor
- 单位：deg
- 数据类型：timeseries

**覆盖的原始采集项**：
```
✓ 数控加工中心 - SpindleAngle (主轴角度, deg, timeseries)
✓ 数控加工中心 - A1AxisAngle (A1轴角度, deg, timeseries)
✓ 数控加工中心 - BAxisAngle (B轴角度, deg, timeseries)
✓ 数控加工中心 - CAxisAngle (C轴角度, deg, timeseries)
```

**ModalityBinding区分**：
- 通过axis字段区分：Spindle, A1, B, C

---

### 3. 电气参数类（4个Modality）

#### 3.1 WeldingCurrent_Auto (焊接电流-自动采集)

**抽象依据**：
- 物理量相同：焊接过程电流
- 采集方式相同：Sensor (自动采集)
- 单位相同：A
- 数据类型相同：timeseries

**覆盖的原始采集项**：
```
✓ IGM焊接机器人 - WeldingCurrent (焊接电流, A, timeseries)
✓ 手工焊机 - CurrentActual (电流实际值, A, timeseries)
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:WeldingCurrent_Auto",
  "type": "Modality",
  "name": "焊接电流(自动采集)",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "A",
  "source": "Sensor",
  "description": "焊接过程电流，从焊机控制系统自动采集的实时曲线",
  "allowedRange": [0, 500],
  "accuracy": "±1%",
  "relatedModalities": ["WireFeedSpeed_Auto"]
}
```

---

#### 3.2 WeldingCurrent_Stat (焊接电流-统计值)

**抽象依据**：
- 物理量相同：焊接电流
- **采集方式不同**：Calculated (从WeldingCurrent_Auto计算得出)
- 单位相同：A
- 数据类型不同：scalar
- 采样模式不同：perPiece

**覆盖的原始采集项**：
```
✓ 手工焊机 - CurrentMin (电流最小值, A, scalar, perPiece)
✓ 手工焊机 - CurrentMax (电流最大值, A, scalar, perPiece)
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:WeldingCurrent_Stat",
  "type": "Modality",
  "name": "焊接电流(统计值)",
  "category": "QualityCharacteristic",
  "valueType": "Number",
  "unit": "A",
  "source": "Calculated",
  "description": "焊接过程电流的统计值(Min/Max)，从实时电流计算得出",
  "isDerived": true,
  "derivedFrom": ["WeldingCurrent_Auto"],
  "derivationRule": "min/max over scene duration",
  "allowedRange": [0, 500],
  "sampleModel": "perPiece"
}
```

**关键点**：
- 因为source不同（Sensor vs Calculated），所以是不同的Modality
- 使用isDerived标注为衍生数据
- 在ModalData的provenance中记录derivedFrom引用

---

#### 3.3 WireFeedingCurrent (送丝电流)

**抽象依据**：
- 物理量：送丝机构电流
- 采集方式：Sensor
- 单位：A
- 数据类型：scalar

**覆盖的原始采集项**：
```
✓ IGM焊接机器人 - WireFeedingCurrent (送丝电流, A, scalar)
```

---

#### 3.4 WeldingVoltage_Auto (焊接电压-自动采集)

**抽象依据**：
- 物理量相同：焊接过程电压
- 采集方式相同：Sensor
- 单位相同：V
- 数据类型相同：timeseries

**覆盖的原始采集项**：
```
✓ IGM焊接机器人 - WeldingVoltage (焊接电压, V, timeseries)
✓ 手工焊机 - VoltageActual (电压实际值, V, timeseries)
```

**同样需要WeldingVoltage_Stat**（统计值，source: Calculated）来覆盖：
```
✓ 手工焊机 - VoltageMin (电压最小值, V, scalar, perPiece)
✓ 手工焊机 - VoltageMax (电压最大值, V, scalar, perPiece)
```

---

### 4. 温度类（2个Modality）

#### 4.1 DriveTemp (驱动器温度)

**抽象依据**：
- 物理量相同：伺服驱动器温度
- 采集方式相同：Sensor (从PLC读取)
- 单位相同：°C
- 数据类型相同：scalar

**覆盖的原始采集项**：
```
✓ 数控加工中心 - DriveTempX (驱动温度X, °C, scalar)
✓ 数控加工中心 - DriveTempXF (驱动器温度XF, °C, scalar)
✓ 数控加工中心 - DriveTempXF (驱动器温度XS, °C, scalar) [code重复]
✓ 数控加工中心 - DriveTempXFS (驱动器温度XFS, °C, scalar)
✓ 数控加工中心 - DriveTempY (驱动器温度Y, °C, scalar)
✓ 数控加工中心 - DriveTempZ (驱动器温度Z, °C, scalar)
✓ 数控加工中心 - DriveTempA (驱动器温度A, °C, scalar)
✓ 数控加工中心 - DriveTempC (驱动器温度C, °C, scalar)
```

**Modality定义**：
```json
{
  "id": "urn:ngsi-ld:Modality:DriveTemp",
  "type": "Modality",
  "name": "驱动器温度",
  "category": "QualityCharacteristic",
  "valueType": "Number",
  "unit": "°C",
  "source": "Sensor",
  "description": "伺服驱动器温度，从PLC读取",
  "allowedRange": [0, 80],
  "accuracy": "±1°C"
}
```

**ModalityBinding区分**（典型的多点采集场景）：
```
- CNCMachine01:DriveTemp:X_Main:v1      (axis: X, location: Main)
- CNCMachine01:DriveTemp:X_Forward:v1   (axis: X, location: Forward)
- CNCMachine01:DriveTemp:X_Slave:v1     (axis: X, location: Slave)
- CNCMachine01:DriveTemp:X_ForwardSlave:v1 (axis: X, location: ForwardSlave)
- CNCMachine01:DriveTemp:Y:v1           (axis: Y)
- CNCMachine01:DriveTemp:Z:v1           (axis: Z)
- CNCMachine01:DriveTemp:A:v1           (axis: A)
- CNCMachine01:DriveTemp:C:v1           (axis: C)
```

---

#### 4.2 AmbientTemp_Auto (环境温度-自动采集)

**抽象依据**：
- 物理量相同：环境温度
- 采集方式相同：Sensor (自动采集)
- 单位相同：°C
- 数据类型相同：timeseries

**覆盖的原始采集项**：
```
✓ 手工焊机 - TemperatureActual (温度实际值, °C, timeseries)
```

**同样需要AmbientTemp_Stat**（统计值，source: Calculated）来覆盖：
```
✓ 手工焊机 - TemperatureMin (温度最小值, °C, scalar, perPiece)
✓ 手工焊机 - TemperatureMax (温度最大值, °C, scalar, perPiece)
```

---

### 5. 力学参数类（2个Modality）

#### 5.1 DriveForce (驱动力)

**抽象依据**：
- 物理量相同：伺服驱动器输出力/扭矩
- 采集方式相同：Sensor
- 单位相同：N
- 数据类型相同：timeseries

**覆盖的原始采集项**：
```
✓ 数控加工中心 - DriveForceX (驱动力X, N, timeseries)
✓ 数控加工中心 - DriveForceXF (驱动力XF, N, timeseries)
✓ 数控加工中心 - DriveForceXS (驱动力XS, N, timeseries)
✓ 数控加工中心 - DriveForceXFS (驱动力XFS, N, timeseries)
✓ 数控加工中心 - DriveForceY (驱动力Y, N, timeseries)
✓ 数控加工中心 - DriveForceZ (驱动力Z, N, timeseries)
✓ 数控加工中心 - DriveForceA (驱动力A, N, timeseries)
✓ 数控加工中心 - DriveForceC (驱动力C, N, timeseries)
```

**ModalityBinding区分**（与DriveTemp类似）：
- 通过axis和location字段区分不同的驱动器

---

#### 5.2 WorkpieceDeflection (工件挠度)

**抽象依据**：
- 物理量：加工过程中工件弹性变形量
- 采集方式：Sensor
- 单位：mm
- 数据类型：timeseries

**覆盖的原始采集项**：
```
✓ 数控加工中心 - WorkpieceDeflection (部件挠度, mm, timeseries)
```

---

### 6. 流体参数类（2个Modality）

#### 6.1 CoolingWaterFlow (冷却水流量)

**抽象依据**：
- 物理量：冷却水流量
- 采集方式：Sensor
- 单位：L/min
- 数据类型：scalar

**覆盖的原始采集项**：
```
✓ IGM焊接机器人 - CoolingWaterFlow (水流量, L/min, scalar)
```

---

#### 6.2 ShieldingGasFlow (保护气流量)

**抽象依据**：
- 物理量相同：焊接保护气体流量
- 采集方式相同：Sensor
- 单位相同：L/min
- **数据类型不同**：scalar vs timeseries

**覆盖的原始采集项**：
```
✓ IGM焊接机器人 - ShieldingGasFlow (保护气流量, L/min, scalar)
✓ 手工焊机 - GasFlowRate (气体流量, L/min, timeseries)
```

**分析**：
- IGM机器人：scalar，仅需阈值判断
- 手工焊机：timeseries，实时监测

**建议**：
- 如果业务需求不同，可以拆分为两个Modality
- 如果仅是数据类型差异，可以保持同一个Modality，在Binding中覆盖valueType

**假设采用同一个Modality**：
```json
{
  "id": "urn:ngsi-ld:Modality:ShieldingGasFlow",
  "type": "Modality",
  "name": "保护气流量",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "L/min",
  "source": "Sensor",
  "description": "焊接保护气体流量",
  "allowedRange": [15, 20]
}
```

---

### 7. 环境参数类（1个Modality）

#### 7.1 AmbientHumidity_Auto (环境湿度-自动采集)

**抽象依据**：
- 物理量：环境相对湿度
- 采集方式：Sensor
- 单位：%RH
- 数据类型：timeseries

**覆盖的原始采集项**：
```
✓ 手工焊机 - HumidityActual (湿度实际值, %RH, timeseries)
```

**同样需要AmbientHumidity_Stat**（统计值）来覆盖：
```
✓ 手工焊机 - HumidityMin (湿度最小值, %RH, scalar, perPiece)
✓ 手工焊机 - HumidityMax (湿度最大值, %RH, scalar, perPiece)
```

---

### 8. 几何测量类（4个Modality）

#### 8.1 ToolCompensation (刀具补偿值)

**抽象依据**：
- 物理量：刀具长度/半径补偿
- 采集方式：Sensor (从数控系统读取)
- 单位：mm
- 数据类型：scalar
- 采样模式：perPiece

**覆盖的原始采集项**：
```
✓ 数控加工中心 - ToolCompensation (刀补, mm, scalar, perPiece)
```

---

#### 8.2 DimensionMeasurement_Auto (尺寸测量-自动)

**抽象依据**：
- 物理量：工件尺寸实测值
- 采集方式：Sensor (测量设备自动测量)
- 单位：mm
- 数据类型：scalar
- 采样模式：perPiece

**覆盖的原始采集项**：
```
✓ 侧墙轮廓测量设备 - TestValue (测试值, mm, scalar, perPiece)
```

---

#### 8.3 DimensionMeasurement_Manual (尺寸测量-人工确认)

**抽象依据**：
- 物理量相同：工件尺寸
- **采集方式不同**：Manual (人工确认后提交)
- 单位：mm
- 数据类型：scalar
- 采样模式：perPiece

**覆盖的原始采集项**：
```
✓ 侧墙轮廓测量设备 - SubmittedValue (提交值, mm, scalar, perPiece)
```

**关键判断**：
- 如果SubmittedValue是由操作员确认后手工提交的 → source: Manual → 不同的Modality
- 如果SubmittedValue仅是系统自动提交的确认值 → source: Sensor → 同一个Modality

**建议**：需要你确认实际业务场景

---

#### 8.4 DimensionDeviation (尺寸偏差)

**抽象依据**：
- 物理量：实测值与标准值的偏差
- 采集方式：Calculated (从测量值计算得出)
- 单位：mm
- 数据类型：scalar
- 采样模式：perPiece

**覆盖的原始采集项**：
```
✓ 侧墙轮廓测量设备 - SensorDeviation (传感器偏差值, mm, scalar, perPiece)
```

---

#### 8.5 ProfileScan (轮廓扫描)

**抽象依据**：
- 物理量：传感器扫描的完整轮廓
- 采集方式：Sensor
- 单位：mm
- **数据类型**：profile (特殊类型)
- 采样模式：continuous

**覆盖的原始采集项**：
```
✓ 侧墙轮廓测量设备 - SensorActualValue (传感器实际值, mm, timeseries/profile)
```

---

### 9. 能源管理类（5个Modality）

#### 9.1 TotalEnergyConsumption (总能耗)

**抽象依据**：
- 物理量：统计周期内总电能消耗
- 采集方式：Calculated (从能源采集箱计算)
- 单位：kWh
- 数据类型：scalar
- 采样模式：perStep

**覆盖的原始采集项**：
```
✓ 能源采集箱 - TotalEnergyConsumption (整机能耗, kWh, scalar, perStep)
```

---

#### 9.2 PowerOnDuration (上电时长)

**抽象依据**：
- 物理量：设备通电总时长
- 采集方式：Calculated (从能源采集箱计算)
- 单位：h
- 数据类型：scalar
- 采样模式：perStep

**覆盖的原始采集项**：
```
✓ 能源采集箱 - PowerOnDuration (上电时长, h, scalar, perStep)
```

---

#### 9.3~9.5 OperationDuration, ActualProcessingTime, CumulativeRuntime

**类似的时长统计Modality，source均为Calculated**

---

### 10. 不建议作为Modality的采集项（8个）

#### 10.1 时间戳类（不建议）

**原因**：应统一使用ModalData.observedAt

```
✗ 手工焊机 - Timestamp (时间戳)
✗ 侧墙轮廓测量设备 - MeasurementTime (测量时间)
✗ 侧墙轮廓测量设备 - SubmissionTime (提交时间)
✗ 能源采集箱 - StatisticsTime (统计时间)
```

---

#### 10.2 规格参数类（不建议）

**原因**：这些是工艺规范，应该在MBOM.requiredMeasurements中定义

```
✗ 侧墙轮廓测量设备 - TargetValue (目标值/期望值)
✗ 侧墙轮廓测量设备 - UpperLimit (上限值)
✗ 侧墙轮廓测量设备 - LowerLimit (下限值)
```

**建议**：在MBOM中这样定义：
```json
{
  "requiredMeasurements": [{
    "modalityId": "urn:ngsi-ld:Modality:DimensionMeasurement_Auto",
    "spec": {
      "target": 100.0,
      "upper": 100.5,
      "lower": 99.5,
      "unit": "mm"
    }
  }]
}
```

---

#### 10.3 主轴功率（误分类）

**原因**：PowerOnDuration(上电时长)误分到功率类

```
✓ 数控加工中心 - SpindlePower (主轴功率) → 应该抽象为单独的Modality
✗ 能源采集箱 - PowerOnDuration (上电时长) → 应该归到时长类，不是功率
```

---

## 三、最终的Modality清单汇总

### 按source分类

| Source类型 | Modality数量 | 典型示例 |
|-----------|-------------|---------|
| **Sensor** (自动采集) | 22 | RobotLinearSpeed, DriveTemp, WeldingCurrent_Auto |
| **Calculated** (计算得出) | 12 | WeldingCurrent_Stat, DimensionDeviation, TotalEnergyConsumption |
| **Manual** (人工录入) | 1? | DimensionMeasurement_Manual (需确认) |
| **总计** | **~35** | - |

### 按category分类

| Category | Modality数量 | 说明 |
|---------|-------------|------|
| ProcessParameter (工艺参数) | 16 | 速度、电流、电压、流量等 |
| QualityCharacteristic (质量特性) | 8 | 温度、驱动力、偏差、统计值 |
| Geometry (几何参数) | 5 | 位姿、角度、刀补、轮廓 |
| Environment (环境参数) | 6 | 环境温度、湿度、能耗、时长 |
| **总计** | **~35** | - |

---

## 四、关键决策点

### 需要你确认的问题

#### 问题1：手工焊机的数据采集方式

```
CurrentActual, VoltageActual, TemperatureActual, HumidityActual, GasFlowRate
```

这些数据是：
- [ ] A. 从焊机控制器自动读取（source: Sensor）
- [ ] B. 人工记录（source: Manual）

**影响**：
- 如果是A：与IGM焊机的数据合并为同一个Modality
- 如果是B：需要拆分为不同的Modality（如WeldingCurrent_Manual）

---

#### 问题2：测量设备的数据提交方式

```
TestValue (测试值) vs SubmittedValue (提交值)
```

- [ ] A. 都是自动采集，SubmittedValue只是系统确认值（source: Sensor）
- [ ] B. TestValue自动测量（Sensor），SubmittedValue人工确认后提交（Manual）

**影响**：
- 如果是A：同一个Modality
- 如果是B：两个不同的Modality（DimensionMeasurement_Auto vs _Manual）

---

#### 问题3：能源采集箱的数据来源

```
PowerOnDuration, OperationDuration, ActualProcessingTime, TotalEnergyConsumption
```

- [ ] A. 从能源采集箱自动计算（source: Calculated）
- [ ] B. 从PLC直接读取（source: Sensor）

**影响**：
- 如果是A：source为Calculated
- 如果是B：source为Sensor

---

## 五、下一步工作

### 1. 确认三个关键问题的答案

### 2. 基于你的确认，最终确定Modality清单

### 3. 创建元模型JSON Schema

包含：
- Modality.schema.json
- ModalityBinding.schema.json
- ModalData.schema.json

### 4. 为每个Modality创建完整的JSON-LD实例

### 5. 制定命名规范文档

---

**版本**：V4.0 (双维度抽象最终版)  
**日期**：2025-10-22  
**压缩比**：91个原始采集项 → ~35个Modality (2.6:1)
