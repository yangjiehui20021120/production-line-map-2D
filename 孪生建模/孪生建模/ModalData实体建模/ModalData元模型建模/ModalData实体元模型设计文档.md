# ModalData 元模型设计说明

**版本**: 1.0.0  
**日期**: 2025-10-22  
**适用范围**: 动车侧墙产线数字孪生系统

---

## 一、设计目标

ModalData元模型旨在承载数字孪生系统的**运行时数据**，实现以下核心目标：

1. **三锚点上下文**：每条数据明确关联设备(refTwin)、场景(refScene)、数据类型(refModality)
2. **数据质量保障**：通过qualityTag和qualityScore标识数据可信度
3. **完整血缘追溯**：通过provenance记录数据来源和处理过程
4. **支持衍生计算**：通过isDerived和derivedFrom建立数据依赖关系
5. **结果可回放**：所有字段组合起来，可以完整重现数据产生的上下文

---

## 二、核心设计原则

### 原则1：三锚点必填

每条ModalData必须包含**三个锚点**，提供完整的业务上下文：
```
锚点1: refTwin    → 数据来自哪个设备/对象
锚点2: refScene   → 数据属于哪个业务场景/工序
锚点3: refModality → 数据是什么类型
```

**为什么需要三个锚点？**

```
锚点作用示例问题
refTwin设备定位"这个温度是哪台设备的？"
refScene业务上下文"这个温度是在哪个工序中采集的？"
refModality数据语义"这个温度具体是什么温度（驱动器/环境）？"
```

**完整示例**：

json

```json
{
  "refTwin": {"object": "urn:ngsi-ld:TwinObject:CNCMachine01"},
  "refScene": {"object": "urn:ngsi-ld:Scene:Milling.2025-08-08:001"},
  "refModality": {"object": "urn:ngsi-ld:Modality:DriveTemp"}
}
```

**解读**：这是数控加工中心01在2025年8月8日铣削工序第001次执行时，采集的驱动器温度数据。

------

### 原则2：质量标签必备

每条ModalData应包含质量判定信息，确保数据可信度：

```
字段类型说明
qualityTag枚举质量标签（OK/NG/WARNING/UNKNOWN/UNVERIFIED）
qualityScore数值质量评分（0-1之间，可选）
```

**qualityTag枚举值**：

- **OK**: 数据质量合格，可用于分析和决策
- **NG**: 数据质量不合格，应被过滤或标记
- **WARNING**: 数据可用但存在潜在问题
- **UNKNOWN**: 质量未知
- **UNVERIFIED**: 未经验证

**示例**：

json

```json
{
  "qualityTag": {"value": "OK"},
  "qualityScore": {"value": 0.98}
}
```

------

### 原则3：溯源信息强制

通过provenance字段记录数据血缘：

json

```json
{
  "provenance": {
    "value": {
      "sourceTwinId": "urn:ngsi-ld:TwinObject:WeldingRobot01",
      "method": "OPC-UA",
      "swVersion": "1.4.0",
      "pipelineStage": "ingest"
    }
  }
}
```

**必填子字段**：

- `method`: 采集或生成方法（OPC-UA/Modbus/MQTT/Calculated等）
- `pipelineStage`: 数据处理阶段（ingest/processed/validated/aggregated）

**可选子字段**：

- `sourceTwinId`: 数据源设备（通常与refTwin相同）
- `swVersion`: 采集软件或固件版本

------

### 原则4：时间戳的双重性

ModalData包含两个时间戳：

```
时间戳含义必填
observedAt数据观测时间（实际采集时间）✅
createdAt实体创建时间（进入系统时间）NGSI-LD自动
```

**区别**：

- `observedAt`: 物理世界的时间（传感器读数的时刻）
- `createdAt`: 数字世界的时间（数据写入数据库的时刻）

**示例**：

json

```json
{
  "observedAt": "2025-08-08T20:05:09.123Z",  // 焊接时的采集时刻
  "createdAt": "2025-08-08T20:05:10.456Z"    // 数据入库时刻（延迟1.3秒）
}
```

------

## 三、字段详细说明

### 3.1 必填字段（7个）

```
字段名类型说明
idstring全局唯一标识符
typeconst固定为"ModalData"
refTwinRelationship关联的TwinObject（三锚点之一）
refSceneRelationship关联的Scene（三锚点之二）
refModalityRelationship关联的Modality（三锚点之三）
valueProperty实际的测量值
observedAttimestamp观测时间戳
```

------

### 3.2 强烈推荐字段（2个）

```
字段名说明默认值
qualityTag质量标签应根据业务规则判定
provenance溯源信息记录数据来源和处理过程
```

------

### 3.3 可选字段（5个）

```
字段名使用场景
qualityScore需要更精细的质量评分时
isDerived衍生数据（如统计值）
derivedFrom标注衍生来源
sequenceNumber时序数据排序
metadata扩展元数据
```

------

## 四、典型应用场景

### 场景1：原始传感器数据

**案例**：焊接机器人采集焊接电流

json

```json
{
  "id": "urn:ngsi-ld:ModalData:WeldingCurrent.FrontWelding_20250808.0001",
  "type": "ModalData",
  "refTwin": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:WeldingRobot01"
  },
  "refScene": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Scene:SideWall.FrontWelding.2025-08-08:001"
  },
  "refModality": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"
  },
  "value": {
    "type": "Property",
    "value": 185.3,
    "unitCode": "A"
  },
  "observedAt": "2025-08-08T20:05:09.123Z",
  "qualityTag": {
    "type": "Property",
    "value": "OK"
  },
  "provenance": {
    "type": "Property",
    "value": {
      "sourceTwinId": "urn:ngsi-ld:TwinObject:WeldingRobot01",
      "method": "OPC-UA",
      "swVersion": "1.4.0",
      "pipelineStage": "ingest"
    }
  },
  "sequenceNumber": {
    "type": "Property",
    "value": 1
  }
}
```

**说明**：

- 这是原始传感器数据（pipelineStage: "ingest"）
- 质量标签为OK，表示数据可信
- 序列号为1，表示该场景中的第1条电流数据

------

### 场景2：衍生统计数据

**案例**：从实时电流计算最大值

json

```json
{
  "id": "urn:ngsi-ld:ModalData:WeldingCurrent_Stat.FrontWelding_20250808.Max",
  "type": "ModalData",
  "refTwin": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:WeldingRobot01"
  },
  "refScene": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Scene:SideWall.FrontWelding.2025-08-08:001"
  },
  "refModality": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:WeldingCurrent_Stat"
  },
  "value": {
    "type": "Property",
    "value": 198.5,
    "unitCode": "A"
  },
  "observedAt": "2025-08-08T20:10:00.000Z",
  "qualityTag": {
    "type": "Property",
    "value": "OK"
  },
  "provenance": {
    "type": "Property",
    "value": {
      "sourceTwinId": "urn:ngsi-ld:TwinObject:WeldingRobot01",
      "method": "Calculated",
      "pipelineStage": "aggregated"
    }
  },
  "isDerived": {
    "type": "Property",
    "value": true
  },
  "derivedFrom": {
    "type": "Relationship",
    "object": [
      "urn:ngsi-ld:ModalData:WeldingCurrent.FrontWelding_20250808.0001",
      "urn:ngsi-ld:ModalData:WeldingCurrent.FrontWelding_20250808.0002",
      "urn:ngsi-ld:ModalData:WeldingCurrent.FrontWelding_20250808.0003"
    ]
  }
}
```

**说明**：

- refModality指向WeldingCurrent_Stat（统计值Modality）
- isDerived=true，标识为衍生数据
- derivedFrom列出3条源数据（实际可能更多）
- method为"Calculated"，pipelineStage为"aggregated"

------

### 场景3：多点采集数据

**案例**：数控加工中心X轴主驱动器温度

json

```json
{
  "id": "urn:ngsi-ld:ModalData:DriveTemp.Milling_20250808.X_Main.0123",
  "type": "ModalData",
  "refTwin": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:CNCMachine01"
  },
  "refScene": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Scene:SideWall.Milling.2025-08-08:001"
  },
  "refModality": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:DriveTemp"
  },
  "value": {
    "type": "Property",
    "value": 45.2,
    "unitCode": "°C"
  },
  "observedAt": "2025-08-08T15:23:45.789Z",
  "qualityTag": {
    "type": "Property",
    "value": "OK"
  },
  "provenance": {
    "type": "Property",
    "value": {
      "sourceTwinId": "urn:ngsi-ld:TwinObject:CNCMachine01",
      "method": "OPC-UA",
      "pipelineStage": "ingest"
    }
  },
  "sequenceNumber": {
    "type": "Property",
    "value": 123
  },
  "metadata": {
    "type": "Property",
    "value": {
      "axis": "X",
      "location": "Main",
      "ambientTemp": 22.5
    }
  }
}
```

**说明**：

- refModality指向统一的DriveTemp
- ID中包含"X_Main"，标识具体位置
- metadata记录了axis和location，便于查询和分析

------

### 场景4：质量检测数据

**案例**：侧墙轮廓偏差测量

json

~~~json
{
  "id": "urn:ngsi-ld:ModalData:ProfileOffset.QualityCheck_20250808.0001",
  "type": "ModalData",
  "refTwin": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:SideWallPanel007"
  },
  "refScene": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Scene:SideWall.QualityCheck.2025-08-08:001"
  },
  "refModality": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:ProfileOffset"
  },
  "value": {
    "type": "Property",
    "value": 0.62,
    "unitCode": "mm"
  },
  "observedAt": "2025-08-08T20:15:30.456Z",
  "qualityTag": {
    "type": "Property",
    "value": "OK"
  },
  "provenance": {
    "type": "Property",
    "value": {
      "sourceTwinId": "urn:ngsi-ld:TwinObject:LaserScanner01",
      "method": "OPC-UA",
      "swVersion": "2.1.0",
      "pipelineStage": "validated"
    }
  }
}
```

**说明**：
- refTwin指向工件（Panel007），不是测量设备
- provenance.sourceTwinId指向测量设备（LaserScanner01）
- pipelineStage为"validated"，表示已经过质量验证

---

## 五、数据血缘追溯

### 5.1 三锚点追溯

通过三锚点，可以实现**一跳追溯**：
```
【从ModalData出发】
ModalData
├─ refTwin → TwinObject (设备信息、能力、位置)
├─ refScene → Scene (工序信息、时间、结果)
└─ refModality → Modality (数据定义、规范、单位)

【从Scene结果出发】
Scene.result.derivedFrom → ModalData列表
→ 每条ModalData包含完整的三锚点
→ 可追溯到具体的设备、时间、数据类型
```

---

### 5.2 衍生数据追溯

对于计算得出的数据，通过derivedFrom建立血缘链：
```
【统计值追溯到原始值】
ModalData (WeldingCurrent_Stat: Max=198.5)
└─ derivedFrom
    ├─ ModalData (WeldingCurrent_Auto: 185.3)
    ├─ ModalData (WeldingCurrent_Auto: 192.1)
    └─ ModalData (WeldingCurrent_Auto: 198.5)

【偏差值追溯到测量值和目标值】
ModalData (DimensionDeviation: 0.12mm)
└─ derivedFrom
    ├─ ModalData (DimensionMeasurement_Auto: 100.12)
    └─ ModalData (TargetDimension: 100.00)
```

---

### 5.3 provenance追溯

通过provenance记录数据来源和处理过程：
```
【原始数据】
provenance: {
  sourceTwinId: "WeldingRobot01",
  method: "OPC-UA",
  swVersion: "1.4.0",
  pipelineStage: "ingest"  ← 初始采集
}

【经过滤波处理的数据】
provenance: {
  sourceTwinId: "WeldingRobot01",
  method: "OPC-UA",
  swVersion: "1.4.0",
  pipelineStage: "processed"  ← 已处理
}

【经过验证的数据】
provenance: {
  sourceTwinId: "LaserScanner01",
  method: "OPC-UA",
  swVersion: "2.1.0",
  pipelineStage: "validated"  ← 已验证
}

【统计聚合的数据】
provenance: {
  sourceTwinId: "WeldingRobot01",
  method: "Calculated",
  pipelineStage: "aggregated"  ← 已聚合
}
```

---

## 六、命名规范

### 6.1 ModalData ID命名

**格式**: `urn:ngsi-ld:ModalData:{ModalityName}.{SceneName}.{Discriminator}`

**组成部分**：
1. **ModalityName**: 模态名称（简化，不含前缀）
2. **SceneName**: 场景名称（简化，不含前缀）
3. **Discriminator**: 区分符（序列号或标识）

**示例**：

**时序数据（使用序列号）**：
```
urn:ngsi-ld:ModalData:WeldingCurrent.FrontWelding_20250808.0001
urn:ngsi-ld:ModalData:WeldingCurrent.FrontWelding_20250808.0002
urn:ngsi-ld:ModalData:WeldingCurrent.FrontWelding_20250808.0003
```

**统计数据（使用统计类型）**：
```
urn:ngsi-ld:ModalData:WeldingCurrent_Stat.FrontWelding_20250808.Min
urn:ngsi-ld:ModalData:WeldingCurrent_Stat.FrontWelding_20250808.Max
urn:ngsi-ld:ModalData:WeldingCurrent_Stat.FrontWelding_20250808.Avg
```

**多点数据（使用位置标识）**：
```
urn:ngsi-ld:ModalData:DriveTemp.Milling_20250808.X_Main.0123
urn:ngsi-ld:ModalData:DriveTemp.Milling_20250808.X_Forward.0123
urn:ngsi-ld:ModalData:DriveTemp.Milling_20250808.Y.0123
~~~

------

## 七、质量控制

### 7.1 qualityTag判定规则

**建议规则**：

```
条件qualityTag
数据在allowedRange内，且采集正常OK
数据超出allowedRangeNG
数据在边界附近（如95%范围外）WARNING
传感器故障或通信失败NG
数据未经验证UNVERIFIED
无法判定质量UNKNOWN
```

**示例判定逻辑**：

python

~~~python
def determine_quality_tag(value, modality):
    if modality.allowedRange:
        min_val, max_val = modality.allowedRange
        if min_val <= value <= max_val:
            return "OK"
        elif min_val * 0.9 <= value <= max_val * 1.1:
            return "WARNING"  # 超出10%范围
        else:
            return "NG"
    else:
        return "UNVERIFIED"
```

---


~~~

### 7.2 qualityScore计算

**建议算法**：
```
qualityScore = 综合评分（0-1之间）

影响因素：
1. 是否在allowedRange内（权重40%）
2. 传感器信号强度（权重30%）
3. 采集稳定性（权重20%）
4. 数据完整性（权重10%）
```

**示例**：

json

{
  "qualityTag": {"value": "OK"},
  "qualityScore": {"value": 0.98}
}



解读：质量标签为OK（合格），质量评分为0.98（接近完美）

---

## 八、与其他实体的关系

### 8.1 数据流关系

【设计层】
Modality (数据字典定义)
    ↓
ModalityBinding (采集配置)
    ↓
【运行层】
ModalData (实际数据记录)
    ↓
Scene.result (场景结果)



---

### 8.2 引用关系

ModalData
├─ refTwin (N:1) → TwinObject
├─ refScene (N:1) → Scene
├─ refModality (N:1) → Modality
└─ derivedFrom (N:N) → ModalData (衍生关系)

Scene
└─ result.derivedFrom (1:N) → ModalData (结果依据)

---

## 九、实施要点

### 9.1 数据采集流程



1. 读取ModalityBinding配置
   - twinId: 哪个设备
   - modalityId: 什么数据
   - pointRef: 从哪里获取
   - sampleRate: 多久采集一次

2. 按配置采集数据
   - 从pointRef指定的地址读取原始值
   - 应用滤波和转换（如果配置）

3. 创建ModalData实体
   - 填入三锚点（refTwin, refScene, refModality）
   - 记录value和observedAt
   - 判定qualityTag
   - 填写provenance

4. 存储ModalData
   - 写入时序数据库
   - 更新Scene的关联数据列表



---

### 9.2 数据查询模式

**按场景查询**：

查询: 获取"FrontWelding_20250808:001"场景的所有数据
WHERE refScene = "urn:ngsi-ld:Scene:SideWall.FrontWelding.2025-08-08:001"

```

**按设备查询**：
```
查询: 获取WeldingRobot01的所有焊接电流数据
WHERE refTwin = "urn:ngsi-ld:TwinObject:WeldingRobot01"
  AND refModality = "urn:ngsi-ld:Modality:WeldingCurrent_Auto"
```

**按时间范围查询**：
```
查询: 获取8月8日20:00-21:00的所有数据
WHERE observedAt BETWEEN "2025-08-08T20:00:00Z" AND "2025-08-08T21:00:00Z"



---

## 十、常见问题

### Q1: ModalData的ID如何生成？

**A**: 建议采用`{ModalityName}.{SceneName}.{Sequence}`格式，例如：

urn:ngsi-ld:ModalData:WeldingCurrent.FrontWelding_20250808.0001

```json

```

也可以使用UUID，但上述格式更具可读性和可追溯性。

------

### Q2: observedAt和createdAt有什么区别？

**A**:

- **observedAt**: 数据采集的实际时刻（物理世界时间）
- **createdAt**: 数据入库的时刻（数字世界时间）

通常两者相差很小（几毫秒到几秒），但对于批量导入历史数据，两者可能相差很大。

------

### Q3: 如何处理时序数据？

**A**:

1. 每个采样点创建一个ModalData实体
2. 使用sequenceNumber字段标识序列号
3. 使用observedAt字段排序
4. ID中包含序列号，如`.0001`, `.0002`

**示例**：100Hz采样的焊接电流，每秒产生100个ModalData实体。

------

### Q4: 衍生数据如何建模？

**A**:

1. 创建对应的统计值Modality（如WeldingCurrent_Stat）
2. 创建ModalData，设置isDerived=true
3. 在derivedFrom中列出源数据的URN
4. provenance中method设为"Calculated"

------

## 十一、总结

ModalData元模型通过以下设计实现了运行时数据的规范化管理：

1. ✅ **三锚点上下文**：refTwin + refScene + refModality
2. ✅ **质量保障**：qualityTag + qualityScore
3. ✅ **血缘追溯**：provenance + derivedFrom
4. ✅ **时间准确**：observedAt（采集时间）+ createdAt（入库时间）
5. ✅ **结果回放**：完整记录数据产生的上下文，支持事后审计

**字段统计**：

- 必填字段: 7个
- 强烈推荐: 2个
- 可选字段: 5个
- 总计: 14个字段（适中的复杂度）

这为动车侧墙产线的数字孪生系统提供了**可信、可追溯、可审计**的运行时数据能力。
