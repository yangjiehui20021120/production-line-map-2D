# 动车侧墙产线 - Modality 实体抽象分析报告

> 基于真实产线数据的模态字典设计
> 
> 日期：2025-10-22

---

## 一、总体概况

### 1.1 数据统计

| 维度 | 数量 |
|------|------|
| **模态总数** | 91 个 |
| **设备类型** | 7 种 |
| **数据领域** | 5 类 (process, quality, geometry, environment, enum) |
| **数据类型** | 3 类 (scalar, timeseries, profile) |
| **采样模式** | 3 类 (continuous, perPiece, perStep) |

### 1.2 设备类型分布

| 设备类型 | 模态数量 | 占比 | 主要特征 |
|---------|---------|------|---------|
| **IGM焊接机器人** | 9 | 9.9% | 焊接工艺参数为主，时序数据居多 |
| **大线打磨机器人** | 9 | 9.9% | 位姿控制参数，标量数据为主 |
| **窗口打磨机器人** | 17 | 18.7% | 双机协同，位姿参数最丰富 |
| **数控加工中心** | 26 | 28.6% | 最复杂设备，涵盖温度、力、速度等 |
| **手工焊机** | 15 | 16.5% | 工艺参数+环境参数，统计值较多 |
| **侧墙轮廓测量设备** | 9 | 9.9% | 质量检测数据，按件采集 |
| **能源采集箱** | 6 | 6.6% | 能耗和时长统计数据 |

### 1.3 数据领域分布

| 数据领域 | 模态数量 | 占比 | 典型模态 |
|---------|---------|------|---------|
| **process** (工艺参数) | 45 | 49.5% | 焊接电流、进给速度、主轴转速 |
| **quality** (质量特性) | 33 | 36.3% | 驱动温度、测量偏差、极值统计 |
| **geometry** (几何参数) | 5 | 5.5% | 刀补、轴角度、传感器实际值 |
| **environment** (环境参数) | 7 | 7.7% | 湿度、温度、能耗、时长 |
| **enum** (枚举状态) | 1 | 1.1% | 开动时长（归类可能有误） |

### 1.4 数据类型分布

| 数据类型 | 模态数量 | 占比 | 说明 |
|---------|---------|------|------|
| **scalar** (标量) | 62 | 68.1% | 单一数值，如温度、速度、统计值 |
| **timeseries** (时序) | 28 | 30.8% | 连续采样曲线，如电流波形 |
| **profile** (轮廓) | 1 | 1.1% | 传感器扫描轮廓数据 |

### 1.5 采样模式分布

| 采样模式 | 模态数量 | 占比 | 说明 |
|---------|---------|------|------|
| **continuous** (连续采样) | 68 | 74.7% | 实时监控，高频采样 |
| **perPiece** (按件采样) | 19 | 20.9% | 每个工件采集一次 |
| **perStep** (按步采样) | 4 | 4.4% | 每个工序步骤采集一次 |

---

## 二、按设备类型的Modality分类

### 2.1 IGM焊接机器人（9个模态）

#### 核心工艺参数（时序数据）
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `TCPPose` | TCP位姿 | mm; deg | timeseries | continuous | process | 6自由度位姿 {X,Y,Z,A,B,C} |
| `MotorSpeed` | 电机速度 | rpm | timeseries | continuous | process | 可降维为标量用于设定值 |
| `WeldingCurrent` | 焊接电流 | A | timeseries | continuous | process | **需与送丝速度同步标定** |
| `WeldingVoltage` | 焊接电压 | V | timeseries | continuous | process | 需匹配保护气体类型 |
| `WireFeedingSpeed` | 送丝速度 | m/min | timeseries | continuous | process | 需与焊接电流动态匹配(1:0.8~1.2) |

#### 监控参数（标量数据）
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `WireFeedingCurrent` | 送丝电流 | A | scalar | continuous | process | 仅需监控负载，无波形分析需求 |
| `CoolingWaterFlow` | 水流量 | L/min | scalar | continuous | process | 阈值报警(<10L/min) |
| `ShieldingGasFlow` | 保护气流量 | L/min | scalar | continuous | process | 建议15-20L/min，防焊缝氧化 |
| `WeldingSpeed` | 焊接速度 | mm/s | scalar | continuous | process | CRH侧墙标准3-8mm/s |

#### 关键观察
1. **时序vs标量的选择逻辑**：
   - 核心质量参数（电流、电压）→ timeseries（需要波形分析）
   - 辅助监控参数（水流量、气流量）→ scalar（仅需阈值判断）

2. **参数间耦合关系**：
   - 焊接电流 ↔ 送丝速度（1:0.8~1.2比例）
   - 焊接速度 ↔ 电流/电压（协同控制）

3. **质量关卡映射**：
   - 这些模态对应MBOM中"正面焊接"工序的requiredMeasurements

---

### 2.2 大线打磨机器人（9个模态）

#### 工艺参数
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `MillingSpeed` | 铣刀速度 | m/min | scalar | continuous | process | 标准200-300m/min（硬质合金刀片） |
| `RobotSpeed` | 机器人速度 | mm/s | scalar | continuous | process | 标准50-300mm/s，拐角自动降速30% |

#### 位姿参数（6自由度）
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `RobotXPose` | 机器人X姿态 | mm | scalar | continuous | process | 绕X轴旋转(Roll)，范围±180° |
| `RobotYPose` | 机器人Y姿态 | mm | scalar | continuous | process | 绕Y轴旋转(Pitch)，影响工具垂直度 |
| `RobotZPose` | 机器人Z姿态 | mm | scalar | continuous | process | 绕Z轴旋转(Yaw)，与轨迹切线对齐 |
| `RobotEXPose` | 机器人EX姿态 | deg | scalar | continuous | process | 工具绕自身X轴旋转(砂轮倾角) |
| `RobotEYPose` | 机器人EY姿态 | deg | scalar | continuous | process | 工具绕自身Y轴旋转(压力分布) |
| `RobotEZPose` | 机器人EZ姿态 | deg | scalar | continuous | process | 工具绕自身Z轴旋转(焊枪摆动) |
| `RobotRailPosition` | 机器人导轨位置 | mm | scalar | continuous | process | 行程0-15000mm，定位精度±0.2mm |

#### 关键观察
1. **位姿建模方式**：
   - 6个独立的scalar模态 vs 1个包含6元组的timeseries模态
   - 当前采用独立模态，便于单独监控和告警

2. **单位不一致问题**：
   - RobotXPose/YPose/ZPose单位标注为"mm"，但描述是旋转角度
   - **建议修正**：应为"deg"

---

### 2.3 窗口打磨机器人（17个模态）

#### 特点：双机协同（Robot1 + Robot2）

#### 速度参数
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `Robot1Speed` | 机器人1打磨速度 | mm/s | scalar | continuous | process | 粗磨200-500，精磨50-150 |
| `Robot2Speed` | 机器人2打磨速度 | mm/s | scalar | continuous | process | 同步速度=Robot1×0.3 |
| `Robot2Speed（Sec.）` | 机器人2速度（从） | mm/s | scalar | continuous | process | 工件定位速度30-100，与主机比1:2 |

#### 位姿参数（双机各6自由度）
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `Robot1XPose` ~ `Robot1EZPose` | 机器人1六轴姿态 | mm/deg | scalar | continuous | process | 砂轮控制 |
| `Robot2XPose` ~ `Robot2EZPose` | 机器人2六轴姿态 | mm/deg | scalar | continuous | process | 工件夹具控制 |
| `Robot1RailPose` | 机器人1导轨位置 | mm | scalar | continuous | process | 行程0-12m，定位±0.5mm |
| `Robot2RailPose` | 机器人2导轨位置 | mm | scalar | continuous | process | 行程0-10m，安全间距≥2m |

#### 关键观察
1. **协同控制逻辑**：
   - Robot2速度受Robot1速度约束（比例关系）
   - 双机导轨位置需保持安全间距

2. **命名冲突**：
   - `Robot2Speed（Sec.）`与`Robot2Speed`可能指不同含义
   - 需要明确区分"打磨速度"和"定位速度"

---

### 2.4 数控加工中心（26个模态）- 最复杂设备

#### 几何参数
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `ToolCompensation` | 刀补 | mm | scalar | perPiece | geometry | 包含长度补偿与半径补偿 |
| `SpindleAngle` | 主轴角度 | deg | timeseries | continuous | process | 主轴旋转角度 |
| `A1AxisAngle` | A1轴角度 | deg | timeseries | continuous | geometry | 回转工作台转动角度 |
| `BAxisAngle` | B轴角度 | deg | timeseries | continuous | geometry | B轴转动角度 |
| `CAxisAngle` | C轴角度 | deg | timeseries | continuous | geometry | C轴转动角度 |

#### 工艺参数
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `FeedRate` | 进给速度 | mm/min | timeseries | continuous | process | 影响效率和表面质量（重复定义） |
| `SpindleSpeed` | 主轴转速 | rpm | timeseries | continuous | process | 主轴旋转速度 |
| `SpindlePower` | 主轴功率 | kW | timeseries | continuous | process | 负载监控 |

#### 温度参数（7个驱动器）
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `DriveTempX` | 驱动温度X | °C | scalar | continuous | quality | X轴驱动器温度 |
| `DriveTempXF` | 驱动器温度XF | °C | scalar | continuous | quality | X轴正限位端 |
| `DriveTempXFS` | 驱动器温度XFS | °C | scalar | continuous | quality | X轴正端从站（命名混乱） |
| `DriveTempY/Z/A/C` | 驱动器温度Y/Z/A/C | °C | scalar | continuous | quality | 其他轴驱动器 |

#### 驱动力参数（7个驱动器）
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `DriveForceX` | 驱动力X | N | timeseries | continuous | quality | X轴伺服输出力 |
| `DriveForceXF/XS/XFS` | 驱动力XF/XS/XFS | N | timeseries | continuous | quality | X轴不同段 |
| `DriveForceY/Z/A/C` | 驱动力Y/Z/A/C | N | timeseries | continuous | quality | 其他轴输出力 |

#### 质量参数
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `WorkpieceDeflection` | 部件挠度 | mm | timeseries | continuous | quality | 切削力导致的弹性变形 |

#### 关键观察
1. **命名规范问题**：
   - `DriveTempXF`的描述在两处不一致（"XF"和"XS"）
   - `FeedRate`重复定义（进给 vs 进给速度）

2. **多点采集典型案例**：
   - X轴有4个驱动器温度/力采集点（X, XF, XS, XFS）
   - 这正是我们讨论的"一个模态多个采集点"场景
   - **建议**：抽象为1个`DriveTemp`模态，通过location区分

3. **温度vs驱动力的建模**：
   - 温度：scalar + continuous（仅需阈值监控）
   - 驱动力：timeseries + continuous（需要波形分析，诊断异常振动）

---

### 2.5 手工焊机（15个模态）

#### 工艺参数（实时监测）
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `CurrentActual` | 电流实际值 | A | timeseries | continuous | process | 实时电流曲线 |
| `VoltageActual` | 电压实际值 | V | timeseries | continuous | process | 实时电压曲线 |
| `WireFeedSpeed` | 送丝速度 | m/min | timeseries | continuous | process | 关键工艺参数 |
| `GasFlowRate` | 气体流量 | L/min | timeseries | continuous | process | 保护气体流量 |

#### 统计值（按件采集）
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `CurrentMin/Max` | 电流最小/最大值 | A | scalar | perPiece | quality | 工作周期内峰值 |
| `VoltageMin/Max` | 电压最小/最大值 | V | scalar | perPiece | quality | 过载判断 |
| `TemperatureMin/Max` | 温度最小/最大值 | °C | scalar | perPiece | quality | 过热预警 |
| `HumidityMin/Max` | 湿度最小/最大值 | %RH | scalar | perPiece | quality | 环境监控 |

#### 环境参数（实时监测）
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `TemperatureActual` | 温度实际值 | °C | timeseries | continuous | environment | 实时温度 |
| `HumidityActual` | 湿度实际值 | %RH | timeseries | continuous | environment | 实时湿度 |

#### 其他
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `Timestamp` | 时间戳 | ISO 8601 | scalar | perPiece | quality | 数据记录时间标识 |

#### 关键观察
1. **"Actual + Min/Max"模式**：
   - 既有实时连续采样（timeseries, continuous）
   - 又有按件统计值（scalar, perPiece）
   - **这是衍生数据的典型案例**：Max/Min可以从Actual计算得出

2. **建模建议**：
   - `CurrentActual`是原始模态
   - `CurrentMin/Max`可以作为Scene.result的衍生字段，而非独立模态
   - 或者：定义为独立模态，但在provenance中标注derivedFrom

---

### 2.6 侧墙轮廓测量设备（9个模态）

#### 测量值
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `TestValue` | 测试值 | mm | scalar | perPiece | quality | 设备实际测得的原始值 |
| `SubmittedValue` | 提交值 | mm | scalar | perPiece | quality | 经确认后最终提交的值 |
| `SensorActualValue` | 传感器实际值 | mm | timeseries/profile | continuous | geometry | 原始模拟量或轮廓段 |
| `SensorDeviation` | 传感器偏差值 | mm | scalar | perPiece | quality | 实测值与标准值差异 |

#### 规格参数
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `TargetValue` | 目标值/期望值 | mm | scalar | perPiece | quality | 理论理想尺寸 |
| `UpperLimit` | 上限值(上偏差) | mm | scalar | perPiece | quality | 最大允许值 |
| `LowerLimit` | 下限值(下偏差) | mm | scalar | perPiece | quality | 最小允许值 |

#### 时间参数
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `MeasurementTime` | 测量时间 | ISO 8600 | scalar | perPiece | quality | 执行测量的时刻 |
| `SubmissionTime` | 提交时间 | ISO 8601 | scalar | perPiece | quality | 数据提交到系统的时刻 |

#### 关键观察
1. **质量判定逻辑**：
   - TestValue（原始测量）→ SubmittedValue（人工确认）
   - 与 TargetValue/UpperLimit/LowerLimit 比对判定合格性

2. **轮廓数据的特殊性**：
   - `SensorActualValue`是唯一的**profile**类型模态
   - 包含整段轮廓曲线，而非单点值
   - 建议在ModalData中value字段存储为数组或Base64编码

3. **规格参数的归属**：
   - UpperLimit/LowerLimit/TargetValue 更像是MBOM中的工艺规范
   - **疑问**：是否应该作为Modality？还是应该在MBOM的requiredMeasurements中定义？

---

### 2.7 能源采集箱（6个模态）

#### 时长参数
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `PowerOnDuration` | 上电时长 | h | scalar | perStep | environment | 通电到断电的总时长 |
| `OperationDuration` | 开动时长 | h | scalar | perStep | enum | 设备可运行状态总时长（领域标注疑似错误） |
| `ActualProcessingTime` | 实际加工时长 | h | scalar | perPiece | process | 有效加工时间 |
| `CumulativeDuration` | 累计时长 | h | scalar | perStep | environment | 设备使用以来的累计时长 |

#### 能耗参数
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `TotalEnergyConsumption` | 整机能耗 | kWh | scalar | perStep | environment | 统计周期内总电能 |

#### 时间参数
| Code | 中文名 | 单位 | 类型 | 采样 | 领域 | 关键备注 |
|------|--------|------|------|------|------|----------|
| `StatisticsTime` | 统计时间 | ISO 8601 | scalar | continuous | quality | 能耗数据统计周期终点 |

#### 关键观察
1. **时长的层次关系**：
   - PowerOnDuration（上电时长）≥ OperationDuration（开动时长）≥ ActualProcessingTime（实际加工时长）
   - 存在包含关系，是否需要独立建模？

2. **采样模式的差异**：
   - PowerOnDuration, OperationDuration: perStep（工序级）
   - ActualProcessingTime: perPiece（工件级）
   - TotalEnergyConsumption: perStep（工序级）

3. **OEE计算的基础数据**：
   - 这些模态是计算设备综合效率(OEE)的关键输入
   - 建议在Scene.result中衍生出OEE指标

---

## 三、Modality设计模式总结

### 3.1 数据类型选择规律

| 使用场景 | 数据类型 | 采样模式 | 典型案例 |
|---------|---------|---------|---------|
| **需要波形分析** | timeseries | continuous | 焊接电流、驱动力、主轴功率 |
| **仅需阈值判断** | scalar | continuous | 水流量、气流量、驱动温度 |
| **统计结果** | scalar | perPiece | 电流最大值、测量偏差 |
| **轮廓扫描** | profile | continuous | 传感器轮廓数据 |
| **按工序汇总** | scalar | perStep | 能耗、上电时长 |

### 3.2 命名规范建议

#### 当前问题
1. **单位不一致**：RobotXPose标注"mm"但实为角度
2. **命名冲突**：FeedRate重复定义，Robot2Speed有歧义
3. **后缀混乱**：DriveTempXF/XFS含义不明确

#### 建议规范
```
基本格式：{物理量}{位置/方向}{统计类型}
示例：
- WeldingCurrentActual  (焊接电流实际值)
- WeldingCurrentMax     (焊接电流最大值)
- DriveTempX_Front      (X轴正端驱动温度)
- DriveTempX_Rear       (X轴从端驱动温度)
- Robot1_Speed_Grinding (机器人1打磨速度)
- Robot2_Speed_Feeding  (机器人2送料速度)
```

### 3.3 多点采集的建模策略

#### 案例1：数控加工中心的X轴驱动温度
**当前方式**：4个独立Modality
- DriveTempX, DriveTempXF, DriveTempXS, DriveTempXFS

**建议方式**：1个Modality + 4个ModalityBinding
```
Modality: DriveTemp (驱动器温度)
├─ ModalityBinding: Robot01:DriveTemp:X_Main:v1
├─ ModalityBinding: Robot01:DriveTemp:X_Forward:v1
├─ ModalityBinding: Robot01:DriveTemp:X_Slave:v1
└─ ModalityBinding: Robot01:DriveTemp:X_ForwardSlave:v1
```

#### 案例2：手工焊机的环境温度
**可能情况**：5个温度传感器分布在不同位置

**建议方式**：1个Modality + 5个ModalityBinding
```
Modality: AmbientTemp (环境温度)
├─ ModalityBinding: WeldStation01:AmbientTemp:TopLeft:v1
├─ ModalityBinding: WeldStation01:AmbientTemp:TopRight:v1
├─ ModalityBinding: WeldStation01:AmbientTemp:BottomLeft:v1
├─ ModalityBinding: WeldStation01:AmbientTemp:BottomRight:v1
└─ ModalityBinding: WeldStation01:AmbientTemp:Center:v1
```

### 3.4 衍生数据的建模选择

#### 场景：手工焊机的电流统计值
- CurrentActual (实时值) → timeseries, continuous
- CurrentMin/Max (统计值) → scalar, perPiece

#### 方案A：都作为Modality（当前方式）
```
Modality: CurrentActual
Modality: CurrentMin
Modality: CurrentMax
```
✅ 优点：MBOM可直接引用统计值
❌ 缺点：数据冗余，增加模态字典复杂度

#### 方案B：仅原始值为Modality，统计值在Scene.result中衍生
```
Modality: CurrentActual (原始)

Scene.result = {
  "currentMin": 185.2,    // 从CurrentActual计算
  "currentMax": 195.8,    // 从CurrentActual计算
  "derivedFrom": ["ModalData:CurrentActual..."]
}
```
✅ 优点：模态字典简洁，血缘清晰
❌ 缺点：MBOM无法直接引用统计值

#### 推荐方案C：混合方式
- 定义统计值Modality（Min/Max）
- 但在ModalData的provenance中标注derivedFrom
- MBOM可引用，但数据血缘可追溯

### 3.5 特殊模态类型

#### 1. 时间戳类模态
- `Timestamp`, `MeasurementTime`, `SubmissionTime`, `StatisticsTime`
- **疑问**：时间是否应作为Modality？还是应该统一使用ModalData.observedAt？

#### 2. 规格参数类模态
- `TargetValue`, `UpperLimit`, `LowerLimit`
- **疑问**：这些更像是MBOM中的规范定义，是否需要作为Modality？

#### 3. 状态枚举类模态
- 数据中有大量描述性文本（如"驱动已打开"、"操作模式"）未赋予modality_code
- **建议**：补充定义状态类模态，如`DriveStatus`, `OperationMode`

---

## 四、元模型设计建议

基于以上分析，Modality实体的元模型应包含以下核心字段：

### 4.1 必填字段

| 字段名 | 类型 | 说明 | 示例 |
|-------|------|------|------|
| `id` | URN | 全局唯一标识 | `urn:ngsi-ld:Modality:WeldingCurrent` |
| `type` | String | 固定为"Modality" | `"Modality"` |
| `code` | String | 模态代码（业务标识） | `"WeldingCurrent"` |
| `name` | String | 中文名称 | `"焊接电流"` |
| `category` | Enum | 数据类别 | `"ProcessParameter"` |
| `valueType` | Enum | 数据类型 | `"timeseries"` / `"scalar"` / `"profile"` |
| `sampleModel` | Enum | 采样模式 | `"continuous"` / `"perPiece"` / `"perStep"` |
| `domain` | Enum | 数据领域 | `"process"` / `"quality"` / `"geometry"` / `"environment"` |

### 4.2 可选字段

| 字段名 | 类型 | 说明 | 示例 |
|-------|------|------|------|
| `description` | String | 详细描述 | `"焊接过程电流信号（安培）"` |
| `unit` | String | 计量单位 | `"A"` / `"mm"` / `"°C"` |
| `source` | Enum | 数据来源方式 | `"Sensor"` / `"Manual"` / `"Calculated"` |
| `allowedRange` | Array | 正常值域范围 | `[0.0, 500.0]` |
| `accuracy` | String | 测量精度要求 | `"±0.5%"` / `"±0.1mm"` |
| `relatedModalities` | Array | 相关联的模态 | `["WireFeedingSpeed"]` （焊接电流与送丝速度关联） |
| `businessNotes` | String | 业务备注 | `"需与送丝速度同步标定"` |

### 4.3 新增建议字段

| 字段名 | 类型 | 说明 | 示例 |
|-------|------|------|------|
| `isDerived` | Boolean | 是否为衍生数据 | `true` (如CurrentMax从CurrentActual衍生) |
| `derivationRule` | String | 衍生计算规则 | `"max(CurrentActual)"` |
| `aggregationMethod` | Enum | 聚合方法（多点采集） | `"mean"` / `"max"` / `"none"` |
| `qualityLevel` | Enum | 质量等级 | `"critical"` / `"important"` / `"normal"` （影响采样频率和存储策略） |

---

## 五、建模疑问与决策点

### 5.1 时间戳的建模
**问题**：`Timestamp`, `MeasurementTime`等是否应该作为Modality？

**分析**：
- 每条ModalData已有observedAt元属性
- 但某些业务场景需要区分"测量时间"和"提交时间"

**建议决策**：
- [ ] A. 不作为Modality，统一使用observedAt
- [ ] B. 作为独立Modality，用于特殊业务场景
- [ ] C. 作为ModalData的扩展字段（如additionalTimestamps）

### 5.2 规格参数的建模
**问题**：`TargetValue`, `UpperLimit`, `LowerLimit`是否应该作为Modality？

**分析**：
- 这些更像是MBOM中的规范定义
- 但在测量设备中，它们作为数据被采集

**建议决策**：
- [ ] A. 不作为Modality，仅在MBOM.requiredMeasurements中定义规范
- [ ] B. 作为Modality，因为测量设备会读取和记录这些值
- [ ] C. 区分：目标值在MBOM中定义，实测值作为ModalData记录

### 5.3 统计值的建模
**问题**：`CurrentMin/Max`等统计值是否应该作为独立Modality？

**建议决策**：
- [ ] A. 仅定义原始值Modality（如CurrentActual），统计值在Scene.result中计算
- [ ] B. 定义为独立Modality，但标注isDerived=true和derivationRule
- [ ] C. 都定义，让MBOM和应用根据需要选择引用

### 5.4 多点采集的抽象粒度
**问题**：X轴的4个驱动温度，是定义为4个Modality还是1个Modality+4个Binding？

**建议决策**：
- [x] **推荐方案**：1个Modality（`DriveTemp`）+ 多个ModalityBinding（区分位置）
- 理由：语义统一、便于扩展、符合数据契约原则

### 5.5 领域分类的规范化
**问题**：`OperationDuration`的domain标注为"enum"显然错误

**建议决策**：
- [ ] 重新审查所有91个模态的domain分类
- [ ] 统一为：`process`, `quality`, `geometry`, `environment`四类
- [ ] 移除"enum"分类（enum应该是valueType的一种）

---

## 六、下一步行动

### 6.1 清洗和规范化数据
1. [ ] 修正单位标注错误（如RobotXPose的mm→deg）
2. [ ] 解决命名冲突（如FeedRate重复、Robot2Speed歧义）
3. [ ] 统一命名规范（后缀含义清晰化）
4. [ ] 修正domain分类错误

### 6.2 抽象合并同类模态
1. [ ] DriveTemp系列 → 1个Modality + 多个Binding
2. [ ] DriveForce系列 → 1个Modality + 多个Binding
3. [ ] RobotPose系列 → 考虑是否合并为1个6元组Modality

### 6.3 补充缺失的状态类模态
1. [ ] 识别所有未定义code的描述性状态
2. [ ] 定义状态枚举类模态（如DriveStatus, OperationMode等）

### 6.4 明确衍生数据策略
1. [ ] 决策：Min/Max统计值是否作为独立Modality
2. [ ] 如果保留，需在元模型中增加isDerived和derivationRule字段

### 6.5 构建Modality元模型JSON Schema
基于本分析，创建：
- `Modality.schema.json` - 定义字段结构和约束
- `ModalityBinding.schema.json` - 包含location、sensorId等扩展字段
- 示例实例文件

---

## 七、附录

### 7.1 完整的91个模态清单
详见：`modalities_analysis.json`

### 7.2 设备类型-模态映射表
可用于TwinObject注册时的`supports_modalities`字段填充

### 7.3 MBOM工序-模态关联示例
- 正面焊接工序 → WeldingCurrent, WeldingVoltage, WireFeedingSpeed等
- 打磨工序 → MillingSpeed, RobotSpeed, RobotPose系列等
- 质检工序 → TestValue, SensorDeviation等

---

**报告完成日期**：2025-10-22  
**下一步**：等待决策点确认，然后开始构建元模型JSON Schema
