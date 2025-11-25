# Modality 实体快速索引表

**版本**: 1.0.0  
**日期**: 2025-10-27

---

## 完整清单 (按编号排序)

| 编号 | Modality ID | 中文名称 | Source | Category | Unit | ValueFormat |
|------|------------|---------|--------|----------|------|-------------|
| M001 | RobotLinearSpeed | 机器人线速度 | Sensor | ProcessParameter | mm/s | timeseries |
| M002 | MotorRotationSpeed | 电机转速 | Sensor | ProcessParameter | rpm | timeseries |
| M003 | WireFeedSpeed_Auto | 送丝速度(自动采集) | Sensor | ProcessParameter | m/min | timeseries |
| M004 | WeldingSpeed | 焊接速度 | Sensor | ProcessParameter | mm/s | scalar |
| M005 | ToolLinearSpeed | 刀具线速度 | Sensor | ProcessParameter | m/min | scalar |
| M006 | FeedRate | 进给速度 | Sensor | ProcessParameter | mm/min | timeseries |
| M007 | RobotTCPPose | 机器人TCP位姿 | Sensor | Geometry | Position:mm; Orientation:deg | timeseries |
| M008 | RobotBaseX | 机器人X轴姿态 | Sensor | Geometry | deg | scalar |
| M009 | RobotBaseY | 机器人Y轴姿态 | Sensor | Geometry | deg | scalar |
| M010 | RobotBaseZ | 机器人Z轴姿态 | Sensor | Geometry | deg | scalar |
| M011 | RobotToolEX | 工具坐标系X姿态 | Sensor | Geometry | deg | scalar |
| M012 | RobotToolEY | 工具坐标系Y姿态 | Sensor | Geometry | deg | scalar |
| M013 | RobotToolEZ | 工具坐标系Z姿态 | Sensor | Geometry | deg | scalar |
| M014 | RobotRailPosition | 机器人导轨位置 | Sensor | Geometry | mm | scalar |
| M015 | AxisAngle | 轴旋转角度 | Sensor | Geometry | deg | timeseries |
| M016 | WeldingCurrent_Auto | 焊接电流(自动采集) | Sensor | ProcessParameter | A | timeseries |
| M017 | WeldingCurrent_Stat | 焊接电流(统计值) | Calculated | QualityCharacteristic | A | scalar |
| M018 | WeldingVoltage_Auto | 焊接电压(自动采集) | Sensor | ProcessParameter | V | timeseries |
| M019 | WeldingVoltage_Stat | 焊接电压(统计值) | Calculated | QualityCharacteristic | V | scalar |
| M020 | DriveTemp | 驱动器温度 | Sensor | QualityCharacteristic | °C | scalar |
| M021 | AmbientTemp_Auto | 环境温度(自动采集) | Sensor | Environment | °C | timeseries |
| M022 | AmbientTemp_Stat | 环境温度(统计值) | Calculated | Environment | °C | scalar |
| M023 | SendWireCurrent | 送丝电流 | Sensor | ProcessParameter | A | timeseries |
| M024 | DriveForce | 驱动力 | Sensor | QualityCharacteristic | N | timeseries |
| M025 | WorkpieceDeflection | 工件挠度 | Sensor | QualityCharacteristic | mm | timeseries |
| M026 | CoolingWaterFlow | 冷却水流量 | Sensor | ProcessParameter | L/min | scalar |
| M027 | ShieldingGasFlow | 保护气流量 | Sensor | ProcessParameter | L/min | timeseries |
| M028 | AmbientHumidity_Auto | 环境湿度(自动采集) | Sensor | Environment | %RH | timeseries |
| M029 | AmbientHumidity_Stat | 环境湿度(统计值) | Calculated | Environment | %RH | scalar |
| M030 | ToolCompensation | 刀具补偿值 | Sensor | Geometry | mm | scalar |
| M031 | DimensionMeasurement_Auto | 尺寸测量(自动) | Sensor | QualityCharacteristic | mm | scalar |
| M032 | DimensionMeasurement_Manual | 尺寸测量(人工确认) | Manual | QualityCharacteristic | mm | scalar |
| M033 | DimensionDeviation | 尺寸偏差 | Calculated | QualityCharacteristic | mm | scalar |
| M034 | ProfileScan | 轮廓扫描 | Sensor | Geometry | mm | profile |
| M035 | TotalEnergyConsumption | 总能耗 | Calculated | Energy | kWh | scalar |
| M036 | PowerOnDuration | 上电时长 | Calculated | Energy | h | scalar |
| M037 | OperationDuration | 开动时长 | Calculated | Energy | h | scalar |
| M038 | ActualProcessingTime | 实际加工时长 | Calculated | Energy | h | scalar |
| M039 | CumulativeRuntime | 累计运行时长 | Calculated | Energy | h | scalar |
| M040 | SpindlePower | 主轴功率 | Sensor | Energy | kW | timeseries |

---

## 按Source分类索引

### Sensor (24个)

| 编号 | Modality ID | 中文名称 | Category |
|------|------------|---------|----------|
| M001 | RobotLinearSpeed | 机器人线速度 | ProcessParameter |
| M002 | MotorRotationSpeed | 电机转速 | ProcessParameter |
| M003 | WireFeedSpeed_Auto | 送丝速度(自动采集) | ProcessParameter |
| M004 | WeldingSpeed | 焊接速度 | ProcessParameter |
| M005 | ToolLinearSpeed | 刀具线速度 | ProcessParameter |
| M006 | FeedRate | 进给速度 | ProcessParameter |
| M007 | RobotTCPPose | 机器人TCP位姿 | Geometry |
| M008 | RobotBaseX | 机器人X轴姿态 | Geometry |
| M009 | RobotBaseY | 机器人Y轴姿态 | Geometry |
| M010 | RobotBaseZ | 机器人Z轴姿态 | Geometry |
| M011 | RobotToolEX | 工具坐标系X姿态 | Geometry |
| M012 | RobotToolEY | 工具坐标系Y姿态 | Geometry |
| M013 | RobotToolEZ | 工具坐标系Z姿态 | Geometry |
| M014 | RobotRailPosition | 机器人导轨位置 | Geometry |
| M015 | AxisAngle | 轴旋转角度 | Geometry |
| M016 | WeldingCurrent_Auto | 焊接电流(自动采集) | ProcessParameter |
| M018 | WeldingVoltage_Auto | 焊接电压(自动采集) | ProcessParameter |
| M020 | DriveTemp | 驱动器温度 | QualityCharacteristic |
| M021 | AmbientTemp_Auto | 环境温度(自动采集) | Environment |
| M023 | SendWireCurrent | 送丝电流 | ProcessParameter |
| M024 | DriveForce | 驱动力 | QualityCharacteristic |
| M025 | WorkpieceDeflection | 工件挠度 | QualityCharacteristic |
| M026 | CoolingWaterFlow | 冷却水流量 | ProcessParameter |
| M027 | ShieldingGasFlow | 保护气流量 | ProcessParameter |
| M028 | AmbientHumidity_Auto | 环境湿度(自动采集) | Environment |
| M030 | ToolCompensation | 刀具补偿值 | Geometry |
| M031 | DimensionMeasurement_Auto | 尺寸测量(自动) | QualityCharacteristic |
| M034 | ProfileScan | 轮廓扫描 | Geometry |
| M040 | SpindlePower | 主轴功率 | Energy |

### Calculated (11个)

| 编号 | Modality ID | 中文名称 | DerivedFrom |
|------|------------|---------|-------------|
| M017 | WeldingCurrent_Stat | 焊接电流(统计值) | WeldingCurrent_Auto |
| M019 | WeldingVoltage_Stat | 焊接电压(统计值) | WeldingVoltage_Auto |
| M022 | AmbientTemp_Stat | 环境温度(统计值) | AmbientTemp_Auto |
| M029 | AmbientHumidity_Stat | 环境湿度(统计值) | AmbientHumidity_Auto |
| M033 | DimensionDeviation | 尺寸偏差 | DimensionMeasurement_Auto |
| M035 | TotalEnergyConsumption | 总能耗 | - |
| M036 | PowerOnDuration | 上电时长 | - |
| M037 | OperationDuration | 开动时长 | - |
| M038 | ActualProcessingTime | 实际加工时长 | - |
| M039 | CumulativeRuntime | 累计运行时长 | - |

### Manual (1个)

| 编号 | Modality ID | 中文名称 | Category |
|------|------------|---------|----------|
| M032 | DimensionMeasurement_Manual | 尺寸测量(人工确认) | QualityCharacteristic |

---

## 按Category分类索引

### ProcessParameter (11个)

M001, M002, M003, M004, M005, M006, M016, M018, M023, M026, M027

### QualityCharacteristic (8个)

M017, M019, M020, M024, M025, M031, M032, M033

### Geometry (9个)

M007, M008, M009, M010, M011, M012, M013, M014, M015, M030, M034

### Environment (4个)

M021, M022, M028, M029

### Energy (6个)

M035, M036, M037, M038, M039, M040

---

## 按设备类型索引

### IGM焊接机器人 (9个)

| Modality | 原始字段名 |
|----------|-----------|
| M002 | MotorSpeed |
| M003 | WireFeedingSpeed |
| M004 | WeldingSpeed |
| M007 | TCPPose |
| M016 | WeldingCurrent |
| M018 | WeldingVoltage |
| M023 | SendWireCurrent |
| M026 | CoolingWaterFlow |
| M027 | ShieldingGasFlow |

### 手工焊机 (12个)

包含Auto和Stat配对:

| Modality | 原始字段名 |
|----------|-----------|
| M003 | WireFeedSpeed |
| M016 | CurrentActual |
| M017 | CurrentMin/Max |
| M018 | VoltageActual |
| M019 | VoltageMin/Max |
| M021 | TemperatureActual |
| M022 | TemperatureMin/Max |
| M027 | GasFlowRate |
| M028 | HumidityActual |
| M029 | HumidityMin/Max |

### 数控加工中心 (11个)

| Modality | 原始字段名 |
|----------|-----------|
| M002 | SpindleSpeed |
| M006 | FeedRate |
| M015 | SpindleAngle/A1AxisAngle/BAxisAngle/CAxisAngle |
| M020 | DriveTemp系列 (8个传感器) |
| M024 | DriveForce系列 (8个传感器) |
| M025 | WorkpieceDeflection |
| M030 | ToolCompensation |
| M040 | SpindlePower |

### 打磨机器人 (10个)

| Modality | 设备 | 原始字段名 |
|----------|------|-----------|
| M001 | 大线/窗口 | RobotSpeed/Robot1Speed/Robot2Speed |
| M005 | 大线 | MillingSpeed |
| M008-M013 | 大线/窗口 | 姿态系列 |
| M014 | 大线/窗口 | RobotRailPosition |

### 侧墙轮廓测量设备 (5个)

| Modality | 原始字段名 |
|----------|-----------|
| M031 | TestValue |
| M032 | SubmittedValue |
| M033 | SensorDeviation |
| M034 | SensorActualValue |

### 能源采集箱 (5个)

| Modality | 原始字段名 |
|----------|-----------|
| M035 | TotalEnergyConsumption |
| M036 | PowerOnDuration |
| M037 | OperationDuration |
| M038 | ActualProcessingTime |
| M039 | CumulativeRuntime |

---

## 衍生数据关系图

```
WeldingCurrent_Auto (M016)
  └─> WeldingCurrent_Stat (M017)

WeldingVoltage_Auto (M018)
  └─> WeldingVoltage_Stat (M019)

AmbientTemp_Auto (M021)
  └─> AmbientTemp_Stat (M022)

AmbientHumidity_Auto (M028)
  └─> AmbientHumidity_Stat (M029)

DimensionMeasurement_Auto (M031)
  └─> DimensionDeviation (M033)
```

---

## 关联模态网络

### 焊接参数组

- M016: WeldingCurrent_Auto
- M018: WeldingVoltage_Auto
- M003: WireFeedSpeed_Auto
- M004: WeldingSpeed

**关系**: 需要协同监控,共同保证焊接质量

---

## 多点采集Modality

以下Modality对应多个物理传感器点:

### M020: DriveTemp (8个测点)

- X_Main, X_Forward, X_Slave, X_ForwardSlave
- Y, Z, A, C

### M024: DriveForce (8个测点)

- X, XF, XS, XFS
- Y, Z, A, C

### M015: AxisAngle (4个测点)

- Spindle, A1, B, C

### M001: RobotLinearSpeed (4个测点)

- GrindingRobot, WindowRobot1, WindowRobot2, WindowRobot2_Slave

### M008-M014: 机器人姿态 (各3个测点)

- GrindingRobot, WindowRobot1, WindowRobot2

---

## 优先级标记

### P0 - 核心工艺参数 (立即实施)

- M016: WeldingCurrent_Auto
- M018: WeldingVoltage_Auto
- M003: WireFeedSpeed_Auto
- M004: WeldingSpeed
- M027: ShieldingGasFlow

### P1 - 质量特性 (第二批)

- M031: DimensionMeasurement_Auto
- M033: DimensionDeviation
- M034: ProfileScan
- M020: DriveTemp
- M024: DriveForce

### P2 - 完整覆盖 (第三批)

- 所有剩余Modality

---

**使用说明**:
1. 本索引表配合《Modality实体实例清单_V1_0.md》使用
2. 查找特定Modality时,可按编号、名称、设备类型等维度检索
3. 实施时建议按优先级P0→P1→P2顺序进行
