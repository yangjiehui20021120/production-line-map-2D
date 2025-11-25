#  Modality 元模型设计说明 

**版本**: 1.0.0   **日期**: 2025-10-22   **适用范围**: 动车侧墙产线数字孪生系统 --- 

## 一、设计目标

 Modality元模型旨在为数字孪生系统建立统一的**数据字典**，解决以下核心问题： 

1. **消除数据语义歧义**：确保同一物理量在不同设备、不同团队中的理解一致 

2. **明确采集方式**：区分自动采集、人工录入、计算得出等不同来源的数据 

3. 支持MBOM引用**：制造BOM可以明确指定所需的数据类型及质量要求 **实现数据溯源**：每条数据都能追溯到其定义和规范 **支持多点采集**：同一Modality可被多个设备通过ModalityBinding实例化 --- **

   ## 二、核心设计原则

   ### 原则1：双维度定义（物理量 + 采集方式） 

   Modality基于两个维度进行抽象： 

   **维度1：物理量/业务概念** - 例如：焊接电流、驱动器温度、机器人速度 

   **维度2：采集方式（source字段）** - Sensor（自动传感器采集） - Manual（人工录入） - Calculated（计算得出） - Simulated（仿真生成） - Inferred（推断得出） 

   **判断规则**： ``` 相同物理量 + 不同采集方式 → 不同的Modality 相同物理量 + 相同采集方式 + 不同位置/设备 → 同一Modality（通过ModalityBinding区分）

**示例**：

- `WeldingCurrent_Auto`（焊接电流-自动采集，source: Sensor）
- `WeldingCurrent_Stat`（焊接电流-统计值，source: Calculated）
- 这是两个不同的Modality，因为source不同

------

### 原则2：字典性质（定义"what"而非"how to implement"）

Modality是**数据字典条目**，定义：

- 观测什么（name, description）
- 如何观测（source, sampleModel）
- 数据特征（valueType, unit, allowedRange, accuracy）
- 业务分类（category, domain）

Modality **不包含**：

- 具体的采集点位（由ModalityBinding定义）
- 具体的设备信息（由TwinObject持有）
- 实时数据值（由ModalData承载）

------

### 原则3：支持衍生数据建模

通过`isDerived`、`derivedFrom`、`derivationRule`字段，Modality可以明确标识衍生数据：

**示例**：

{
  "id": "urn:ngsi-ld:Modality:WeldingCurrent_Stat",
  "source": {"value": "Calculated"},
  "isDerived": {"value": true},
  "derivedFrom": {"object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"},
  "derivationRule": {"value": "min/max over scene duration"}
}

这样可以建立数据之间的血缘关系，支持数据溯源。

------

### 原则4：版本化管理

每个Modality实体包含`version`字段（语义化版本号），支持模态定义的演进：

- 修改描述/业务说明 → 补丁版本（1.0.0 → 1.0.1）
- 新增可选字段 → 次版本（1.0.0 → 1.1.0）
- 修改核心字段（source, category等）→ 主版本（1.0.0 → 2.0.0）

------

## 三、字段详细说明

### 3.1 必填字段（6个）

```
字段名类型说明示例
idstring全局唯一标识符，格式：urn:ngsi-ld:Modality:{Name}urn:ngsi-ld:Modality:WeldingCurrent_Auto
typeconst固定为"Modality""Modality"
nameProperty模态名称，建议格式：{物理量}_{采集方式}"焊接电流(自动采集)"
categoryProperty数据类别枚举"ProcessParameter"
valueTypeProperty数据值类型枚举"Number"
sourceProperty采集方式枚举（核心维度）"Sensor"
```

------

### 3.2 强烈推荐字段（7个）

```
字段名说明为什么重要
description详细描述帮助理解业务含义
unit计量单位数值型数据必需
allowedRange正常值域用于质量判定
accuracy测量精度不同采集方式的精度不同
sampleModel采样模式明确数据产生频率
valueFormat数据格式scalar/timeseries/profile等
domain应用领域数据分类和查询
```

------

### 3.3 衍生数据字段（3个）

```
字段名使用场景
isDerived标识是否为计算得出的数据
derivedFrom指向源Modality（可以是单个或多个）
derivationRule描述计算公式或规则
```

**典型场景**：统计值（Min/Max/Avg）

- 原始数据：`WeldingCurrent_Auto`（source: Sensor, timeseries）
- 衍生数据：`WeldingCurrent_Stat`（source: Calculated, scalar, derivedFrom: WeldingCurrent_Auto）

------

### 3.4 关联字段（1个）

```
字段名说明
relatedModalities需要协同监控的其他模态列表
```

**示例**：焊接电流需要与送丝速度、焊接电压协同监控

json

```json
{
  "relatedModalities": {
    "type": "Relationship",
    "object": [
      "urn:ngsi-ld:Modality:WireFeedSpeed_Auto",
      "urn:ngsi-ld:Modality:WeldingVoltage_Auto"
    ]
  }
}
```

------

## 四、典型应用场景

### 场景1：MBOM引用Modality

MBOM工艺步骤通过`requiredMeasurements`引用所需的Modality：

{
  "id": "urn:ngsi-ld:MBOMStep:SideWall:FrontWeld",
  "requiredMeasurements": [{
    "modalityId": "urn:ngsi-ld:Modality:WeldingCurrent_Auto",
    "spec": {
      "lower": 180.0,
      "upper": 200.0,
      "unit": "A"
    },
    "acceptanceRule": "pctInRange >= 0.95"
  }]
}

**优势**：
- MBOM只需指定"需要什么数据"（Modality）
- 不关心"用哪个设备采集"（由ModalityBinding实现）
- 实现了需求与实现的解耦

---

### 场景2：多点采集（1个Modality → 多个Binding）

**案例**：数控加工中心有8个驱动器温度传感器



1个Modality: DriveTemp
├─ Binding: CNCMachine01:DriveTemp:X_Main
├─ Binding: CNCMachine01:DriveTemp:X_Forward
├─ Binding: CNCMachine01:DriveTemp:X_Slave
├─ Binding: CNCMachine01:DriveTemp:X_ForwardSlave
├─ Binding: CNCMachine01:DriveTemp:Y
├─ Binding: CNCMachine01:DriveTemp:Z
├─ Binding: CNCMachine01:DriveTemp:A
└─ Binding: CNCMachine01:DriveTemp:C

**优势**：
- 统一的语义定义（都是驱动器温度）
- 每个Binding记录具体的轴和位置
- 便于统一分析和异常检测

---

### 场景3：区分自动采集与统计值

**IGM焊接机器人 vs 手工焊机**

手工焊机有三组数据：
- `CurrentActual`（实时值）→ 自动采集
- `CurrentMin`（最小值）→ 计算得出
- `CurrentMax`（最大值）→ 计算得出

**抽象结果**：



WeldingCurrent_Auto (source: Sensor, valueFormat: timeseries)
├─ IGM焊接机器人 - WeldingCurrent
└─ 手工焊机 - CurrentActual

WeldingCurrent_Stat (source: Calculated, valueFormat: scalar, isDerived: true)
├─ 手工焊机 - CurrentMin
└─ 手工焊机 - CurrentMax

因为source不同（Sensor vs Calculated），所以是两个不同的Modality。

---

## 五、与其他实体的关系

### 5.1 Modality → ModalityBinding（1:N）

- 1个Modality可以被多个TwinObject绑定
- 每个绑定是一个ModalityBinding实例
- ModalityBinding记录具体的采集点位和配置

### 5.2 Modality → ModalData（1:N）

- 1个Modality对应多条ModalData记录
- 每条ModalData通过`refModality`引用Modality
- ModalData是运行时的实际数据

### 5.3 MBOM → Modality（N:N）

- MBOM工艺步骤通过`requiredMeasurements`引用Modality
- 1个工艺步骤可引用多个Modality
- 1个Modality可被多个工艺步骤引用

---

## 六、命名规范

### 6.1 Modality ID命名

**格式**: `urn:ngsi-ld:Modality:{PhysicalQuantity}_{Source}`

**示例**：
- `urn:ngsi-ld:Modality:WeldingCurrent_Auto`（自动采集的焊接电流）
- `urn:ngsi-ld:Modality:WeldingCurrent_Stat`（统计值）
- `urn:ngsi-ld:Modality:DriveTemp`（驱动器温度，默认Sensor）
- `urn:ngsi-ld:Modality:TotalEnergyConsumption`（总能耗，Calculated）

### 6.2 name字段命名

**中文格式**: `{物理量}({采集方式})`

**示例**：
- `"焊接电流(自动采集)"`
- `"焊接电流(统计值)"`
- `"驱动器温度"`
- `"总能耗"`

---

## 七、实施要点

### 7.1 何时创建新的Modality

**决策树**：

1. 物理量是否相同？
   否 → 创建新Modality
   是 → 继续

2. source是否相同？
   否 → 创建新Modality
   是 → 继续

3. 精度要求/采样模式/数据类型是否相同？
   否 → 考虑创建新Modality
   是 → 使用同一Modality，通过ModalityBinding区分设备/位置

### 7.2 何时使用isDerived

当满足以下条件时，应标记为衍生数据：

- source = "Calculated"
- 数据由其他Modality的数据计算得出
- 需要标注derivedFrom和derivationRule

**典型场景**：

- 统计值（Min/Max/Avg）
- 偏差值（实测值 - 目标值）
- 计算参数（电流 = 功率 / 电压）

### 7.3 版本管理策略

- 新建Modality时，version = "1.0.0"
- 修改非核心字段（description, businessNote）→ 补丁版本
- 新增可选字段 → 次版本
- 修改核心字段（source, category, valueType）→ 主版本，需评估影响

------

## 八、常见问题

### Q1: 为什么同一物理量有多个Modality？

**A**: 因为采集方式不同。例如：

- `WeldingCurrent_Auto`（自动采集，source: Sensor，timeseries）
- `WeldingCurrent_Stat`（统计值，source: Calculated，scalar）

虽然都是焊接电流，但source不同，用途不同，应该定义为不同的Modality。

### Q2: ModalityBinding和Modality有什么区别？

**A**:

- **Modality**: 字典，定义"观测什么、如何观测"
- **ModalityBinding**: 实例，定义"在此设备上怎么观测"

类比：

- Modality = "焊接电流"的定义
- ModalityBinding = 焊接机器人01上的具体电流采集点配置

### Q3: 多个传感器测量同一物理量，如何建模？

**A**:

- 如果采集方式相同（都是Sensor） → 1个Modality + 多个ModalityBinding
- 如果采集方式不同（Sensor vs Manual） → 多个Modality

------

## 九、总结

Modality元模型通过**物理量+采集方式**的双维度设计，实现了：

1. ✅ 数据语义的统一定义
2. ✅ 采集方式的明确区分
3. ✅ 多点采集的灵活支持
4. ✅ 衍生数据的血缘追溯
5. ✅ MBOM需求与实现的解耦

这为动车侧墙产线的数字孪生系统提供了坚实的数据契约基础。
