# Modality 双维度建模分析

> 基于建模指南要求和"物理量+采集方式"双维度理解

---

## 一、建模指南的核心定义

### 来自建模指南7.2节的关键表述

> **Modality 定义了"观测什么、如何观测"的静态约定**

这句话明确指出Modality包含**两个维度**：
1. **"观测什么"** → 物理量/业务概念
2. **"如何观测"** → 采集方式/来源类型

### 关键字段：`source` (来源类型)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `source` | Property | **是** | 枚举描述数据从何而来 | `"Sensor"` (自动采集)<br>`"Manual"` (人工录入)<br>`"Calculated"` (计算推测) |

**注意**：`source`是**必填字段**，这意味着Modality定义中必须明确数据的来源方式。

---

## 二、你的理解分析

### 场景：设备运行电流

你提出的三种情况：

1. **通过设备控制系统采集设备运行电流** 
   - source: "Sensor" (自动采集)
   - 直接从PLC/控制器读取

2. **通过外加传感器采集设备运行电流**
   - source: "Sensor" (自动采集)
   - 独立的电流互感器

3. **通过计算推测设备运行电流**
   - source: "Calculated" (计算)
   - 根据功率、电压等参数计算

### 关键问题

**这应该是三种不同的Modality吗？**

---

## 三、两种建模方案对比

### 方案A：三种不同的Modality（支持你的理解）

```json
// Modality 1: 通过控制系统采集的电流
{
  "id": "urn:ngsi-ld:Modality:MotorCurrent_PLC",
  "name": "电机电流(PLC采集)",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "A",
  "source": "Sensor",
  "description": "从设备控制系统直接读取的电机电流",
  "accuracy": "±2%",  // PLC精度相对较低
  "allowedRange": [0, 100]
}

// Modality 2: 通过外加传感器采集的电流
{
  "id": "urn:ngsi-ld:Modality:MotorCurrent_Sensor",
  "name": "电机电流(高精度传感器)",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "A",
  "source": "Sensor",
  "description": "通过外接电流互感器采集的高精度电流",
  "accuracy": "±0.5%",  // 专业传感器精度高
  "allowedRange": [0, 100]
}

// Modality 3: 通过计算得到的电流
{
  "id": "urn:ngsi-ld:Modality:MotorCurrent_Calculated",
  "name": "电机电流(计算值)",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "A",
  "source": "Calculated",
  "description": "根据功率和电压计算得到的电机电流",
  "accuracy": "±5%",  // 计算值精度最低
  "derivationRule": "I = P / (U * cosφ)",
  "allowedRange": [0, 100]
}
```

**优势**：
- ✅ 明确区分不同采集方式的语义差异
- ✅ 可以针对不同采集方式设置不同的精度要求
- ✅ MBOM可以明确要求使用哪种采集方式
- ✅ 数据质量可追溯到采集方式

**劣势**：
- ❌ Modality数量激增（每个物理量×采集方式）
- ❌ 三者测量的本质上是同一个物理量

---

### 方案B：一种Modality + ModalityBinding区分（我之前的理解）

```json
// Modality: 统一的电机电流定义
{
  "id": "urn:ngsi-ld:Modality:MotorCurrent",
  "name": "电机电流",
  "category": "ProcessParameter",
  "valueType": "Number",
  "unit": "A",
  "source": "Sensor",  // 默认为传感器采集
  "description": "电机运行电流",
  "allowedRange": [0, 100]
}

// ModalityBinding 1: PLC采集
{
  "id": "urn:ngsi-ld:ModalityBinding:Motor01:MotorCurrent:PLC:v1",
  "twinId": "urn:ngsi-ld:TwinObject:Motor01",
  "modalityId": "urn:ngsi-ld:Modality:MotorCurrent",
  "pointRef": "opc.tcp://10.0.0.5:4840/ns=2;s=Motor/Current",
  "method": "PLC_Direct",
  "accuracy": "±2%",
  "sampleRate": "1000ms"
}

// ModalityBinding 2: 外加传感器采集
{
  "id": "urn:ngsi-ld:ModalityBinding:Motor01:MotorCurrent:HighPrecision:v1",
  "twinId": "urn:ngsi-ld:TwinObject:Motor01",
  "modalityId": "urn:ngsi-ld:Modality:MotorCurrent",
  "pointRef": "opc.tcp://10.0.0.6:4840/ns=2;s=Sensor/CurrentTransformer",
  "method": "External_Sensor",
  "accuracy": "±0.5%",
  "sampleRate": "100ms"
}

// ModalityBinding 3: 计算方式
{
  "id": "urn:ngsi-ld:ModalityBinding:Motor01:MotorCurrent:Calculated:v1",
  "twinId": "urn:ngsi-ld:TwinObject:Motor01",
  "modalityId": "urn:ngsi-ld:Modality:MotorCurrent",
  "source": "Calculated",  // 覆盖Modality的默认source
  "derivationRule": "I = P / (U * cosφ)",
  "inputModalities": [
    "urn:ngsi-ld:Modality:MotorPower",
    "urn:ngsi-ld:Modality:MotorVoltage"
  ],
  "accuracy": "±5%"
}
```

**优势**：
- ✅ Modality数量少，语义清晰
- ✅ 三者测量的是同一个物理量，模型统一

**劣势**：
- ❌ MBOM无法明确要求使用哪种采集方式
- ❌ `source`字段在Modality层面无法区分不同采集方式
- ❌ 违背了建模指南中"`source`是必填字段"的强语义

---

## 四、建模指南的深入解读

### 关键证据1：`source`是必填字段

建模指南表7-1明确指出：

| 字段名 | 必填 | 业务语义 | 说明 |
|-------|------|---------|------|
| `source` | **是** | 数据来源方式 | 枚举描述数据从何而来 |

这说明：**采集方式是Modality语义定义的核心组成部分**，而不是可以在Binding层面随意覆盖的属性。

### 关键证据2：Modality定义"如何观测"

> **Modality 定义了"观测什么、如何观测"的静态约定**

"如何观测"明确包括：
- 采集方式（Sensor/Manual/Calculated）
- 精度要求（accuracy）
- 正常值域（allowedRange）

### 关键证据3：MBOM引用Modality时不关心设备

建模指南7.5节示例：

```json
{
  "requiredMeasurements": [{
    "modalityId": "urn:ngsi-ld:Modality:WeldingCurrent",
    "spec": { "lower": 180.0, "upper": 200.0 }
  }]
}
```

**分析**：
- MBOM引用的是**Modality**，不是ModalityBinding
- 这意味着MBOM需要在Modality层面就能区分不同的采集方式
- 如果同一个物理量有多种采集方式，MBOM应该能够指定要求哪一种

---

## 五、结论：方案A更符合建模指南

### 核心判断

**不同的采集方式应该定义为不同的Modality**，原因如下：

1. **`source`是Modality的必填核心字段**
   - 不是可选属性，不应该在Binding层覆盖

2. **采集方式影响数据的业务语义**
   - PLC采集的电流：精度±2%，适用于过程监控
   - 高精度传感器采集的电流：精度±0.5%，适用于质量判定
   - 计算得到的电流：精度±5%，适用于估算和预测
   
   这三种数据的**可信度、用途、质量要求都不同**

3. **MBOM需要在Modality层面区分**
   - 质量关键工序要求："必须使用高精度传感器采集的电流"
   - 普通监控工序："PLC采集的电流即可"
   - 如果只有一个Modality，MBOM无法表达这种区分

4. **数据血缘需要追溯到采集方式**
   - 事后审计时需要知道："这个数据是怎么来的？"
   - 采集方式应该在Modality定义中明确，而不是buried in Binding

---

## 六、修正后的Modality抽象原则

### 原则1：物理量是第一维度

相同物理意义 → 可能是同一个Modality

### 原则2：采集方式是第二维度（你的理解是正确的！）

相同物理量 + 不同采集方式 → **不同的Modality**

### 原则3：判断是否需要拆分的决策树

```
是否测量相同的物理量？
├─ 否 → 不同的Modality
└─ 是 → 采集方式是否相同？
    ├─ 是 → 同一个Modality（不同设备用Binding区分）
    └─ 否 → 不同的Modality
```

---

## 七、真实案例重新分析

### 案例1：焊接电流

#### 情况A：IGM焊接机器人和手工焊机

```
IGM焊接机器人: WeldingCurrent (焊接电流, 从PLC采集, timeseries)
手工焊机:      CurrentActual   (电流实际值, 从焊机采集, timeseries)
```

**分析**：
- 物理量相同：都是焊接电流
- 采集方式相同：都是Sensor自动采集
- 数据类型相同：都是timeseries
- **结论**：应该是**同一个Modality**，通过ModalityBinding区分设备

#### 情况B：如果手工焊机的电流是人工记录的

```
IGM焊接机器人: WeldingCurrent_Auto (焊接电流, Sensor)
手工焊机:      WeldingCurrent_Manual (焊接电流, Manual)
```

**结论**：应该是**两个不同的Modality**
- source不同：Sensor vs Manual
- 精度不同：自动采集精度高，人工记录精度低
- 用途不同：自动采集用于过程控制，人工记录用于工艺记录

---

### 案例2：环境温度（你之前提到的5个传感器）

#### 情况A：5个传感器都是同类型自动采集

```
Modality: AmbientTemp (环境温度, source: Sensor)
├─ ModalityBinding: Station01:AmbientTemp:TopLeft:v1
├─ ModalityBinding: Station01:AmbientTemp:TopRight:v1
├─ ModalityBinding: Station01:AmbientTemp:BottomLeft:v1
├─ ModalityBinding: Station01:AmbientTemp:BottomRight:v1
└─ ModalityBinding: Station01:AmbientTemp:Center:v1
```

**结论**：**同一个Modality**，因为：
- 物理量相同
- 采集方式相同（都是Sensor）
- 仅位置不同（位置在Binding中区分）

#### 情况B：如果还有人工测温

```
Modality 1: AmbientTemp_Auto (环境温度自动采集, source: Sensor)
Modality 2: AmbientTemp_Manual (环境温度人工测量, source: Manual)
```

**结论**：**两个不同的Modality**

---

### 案例3：驱动器温度（数控加工中心）

#### 实际情况：都是从PLC自动读取

```
DriveTempX, DriveTempY, DriveTempZ, DriveTempA, DriveTempC
```

**分析**：
- 物理量相同：都是驱动器温度
- 采集方式相同：都是Sensor (从PLC读取)
- 仅位置/轴不同

**结论**：应该是**同一个Modality: DriveTemp**
- 通过ModalityBinding区分不同的轴（X/Y/Z/A/C）

---

## 八、修正后的Modality清单（考虑采集方式维度）

### 从你的真实数据重新分析

#### 1. 需要拆分的案例（如果存在不同采集方式）

**焊接电流**：
- 如果IGM机器人和手工焊机的采集方式不同 → 拆分
- 如果都是自动采集 → 不拆分

**环境温度**：
- 如果有自动采集+人工测量 → 拆分为两个Modality
- 如果都是自动采集 → 不拆分

**测量值**：
```
现有数据：
- TestValue (测试值) - 设备实测
- SubmittedValue (提交值) - 人工确认
- SensorActualValue (传感器实际值) - 自动采集
```

**分析**：这三者采集方式可能不同
- SensorActualValue: source = "Sensor"
- TestValue: source = "Sensor" (自动测量)
- SubmittedValue: source = "Manual" (人工确认后提交)

如果source不同 → **应该是不同的Modality**

#### 2. 统计值的特殊情况

```
CurrentActual (电流实际值, source: Sensor)
CurrentMin    (电流最小值, source: Calculated, derivedFrom: CurrentActual)
CurrentMax    (电流最大值, source: Calculated, derivedFrom: CurrentActual)
```

**分析**：
- source不同：Sensor vs Calculated
- **结论**：应该是**不同的Modality**（我之前的建议是正确的）

---

## 九、需要补充的信息

为了完成正确的抽象，我需要你确认：

### 问题1：手工焊机的数据采集方式

```
手工焊机的CurrentActual、VoltageActual、TemperatureActual
```

这些数据是：
- [ ] A. 从焊机控制器自动读取（source: Sensor）
- [ ] B. 人工记录（source: Manual）
- [ ] C. 混合（部分自动、部分人工）

### 问题2：测量设备的数据提交方式

```
侧墙轮廓测量设备：
- TestValue (测试值)
- SubmittedValue (提交值)
```

这两者是：
- [ ] A. 都是自动采集（source: Sensor），只是TestValue是原始值，SubmittedValue是确认值
- [ ] B. TestValue自动采集（Sensor），SubmittedValue人工确认（Manual）
- [ ] C. 其他

### 问题3：能源采集箱的时长数据

```
PowerOnDuration (上电时长)
OperationDuration (开动时长)
ActualProcessingTime (实际加工时长)
```

这些数据是：
- [ ] A. 从能源采集箱自动计算（source: Calculated）
- [ ] B. 从PLC自动读取（source: Sensor）
- [ ] C. 人工记录（source: Manual）

---

## 十、最终建议

### 建议1：采纳"物理量+采集方式"双维度

**你的理解是正确的！** 应该在Modality定义中明确区分不同的采集方式。

### 建议2：修正Modality元模型Schema

在Modality.schema.json中强化`source`字段：

```json
{
  "source": {
    "type": "string",
    "enum": ["Sensor", "Manual", "Calculated", "Simulated", "Other"],
    "description": "数据来源方式，这是Modality定义的核心维度之一",
    "required": true
  }
}
```

### 建议3：制定命名规范

当同一物理量有多种采集方式时：

```
格式：{PhysicalQuantity}_{Source}
示例：
- MotorCurrent_Sensor (传感器采集的电机电流)
- MotorCurrent_Calculated (计算得到的电机电流)
- AmbientTemp_Auto (自动采集的环境温度)
- AmbientTemp_Manual (人工测量的环境温度)
```

### 建议4：在MBOM中明确引用特定采集方式的Modality

```json
{
  "requiredMeasurements": [
    {
      "modalityId": "urn:ngsi-ld:Modality:WeldingCurrent_Sensor",
      "note": "质量关键工序，必须使用自动传感器采集"
    }
  ]
}
```

---

## 十一、下一步行动

1. [ ] 你确认三个关键问题的答案
2. [ ] 基于你的确认，我重新抽象Modality清单
3. [ ] 制定完整的Modality命名规范
4. [ ] 构建包含`source`强约束的Modality.schema.json

---

**版本**：V3.0 (双维度理解版本)  
**日期**：2025-10-22  
**核心结论**：**采集方式是Modality定义的第二维度，你的理解是正确的！**
