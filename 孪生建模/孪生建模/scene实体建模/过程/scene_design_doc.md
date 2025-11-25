# Scene场景实体元模型设计说明文档

## 1. 概述

### 1.1 背景与目的

Scene场景实体元模型是智能制造系统中用于定义生产执行过程时空容器的核心数据模型。该模型基于NGSI-LD标准构建,旨在实现生产过程的数字化表达、执行追溯和智能分析。

Scene与MBOM(制造物料清单)的关键区别在于:
- **MBOM**: 通用的工艺模板和蓝图,定义"如何制造"
- **Scene**: 具体产品实例的执行容器,记录"实际如何制造的"

每个产品在生产过程中会创建自己的Scene实例序列,这些Scene实例绑定具体的工件对象、实际的时间窗口、真实的执行位置和参与资源,形成完整的生产执行追溯链。

### 1.2 设计原则

1. **时空容器理念**: Scene作为时空容器,通过时间维度(timeFrame)和空间维度(location)锚定生产执行的上下文
2. **五层级灵活创建**: 支持Route(路线)、Takt(节拍)、Process(工序)、Step(工步)、SubStep(子步骤)五个层级的灵活组合
3. **强溯源性**: 通过derivedFrom机制实现结果到原始数据的一跳回溯
4. **责任可追溯**: 结合RACI模型和stepLog实现完整的责任链追溯
5. **语义互操作**: 基于NGSI-LD标准,支持跨系统的语义互操作

## 2. 核心架构

### 2.1 标识符规范

Scene实例采用统一的URN格式标识符:

```
urn:ngsi-ld:Scene:{sceneLevel}:{workpieceCode}:{mbomRef}:{timestamp}
```

**组成部分说明**:
- `sceneLevel`: 场景层级标识(Route/Takt/Process/Step/SubStep)
- `workpieceCode`: 工件编码,标识具体产品实例
- `mbomRef`: MBOM引用代码,标识遵循的工艺节点
- `timestamp`: 创建时间戳(YYYYMMDDHHmmss),确保唯一性

**示例**:
```
urn:ngsi-ld:Scene:Process:PO123-001:T01-P0010:20250108150000
```
表示订单PO123-001在2025年1月8日15:00创建的工序P0010执行场景。

### 2.2 层级关系模型

Scene支持五层级结构,通过关系属性实现层级间的灵活关联:

```
Route Scene (路线级)
  ├── Takt Scene (节拍级)
  │     ├── Process Scene (工序级)
  │     │     ├── Step Scene (工步级)
  │     │     │     └── SubStep Scene (子步骤级)
```

**层级关系属性**:
- `partOfScene`: 反向关系,指向父场景(N:1)
- `includesSubScenes`: 正向关系,指向子场景列表(1:N)

**设计特点**:
- 支持层级嵌套但非强制,可以创建孤立的Scene
- 允许跨层级引用,如直接从Route跳到Step
- 子Scene创建后可动态添加到父Scene的includesSubScenes列表

## 3. 核心属性详解

### 3.1 基础标识属性

**sceneLevel** (场景层级)
- 类型: Property枚举值
- 可选值: Route/Takt/Process/Step/SubStep
- 作用: 决定该Scene对应MBOM的哪一层,直接影响refMBOM应引用的MBOM实例层级

**sceneCode & sceneName** (场景编码与名称)
- sceneCode: 业务编码,通常继承自MBOM或组合生成,便于业务系统引用
- sceneName: 业务友好的描述性名称,支持多语言和可读性

### 3.2 时空容器属性

**timeFrame** (时间框架)

定义场景执行的时间范围,是Scene作为时空容器的时间维度锚点:

```json
{
  "type": "Property",
  "value": {
    "start": "2025-01-08T14:30:20Z",      // 必填,Scene创建时确定
    "end": "2025-01-08T18:05:15Z",        // 可选,完成时更新
    "actualDuration": 13495                // 实际执行时长(秒)
  }
}
```

**关键设计**:
- start在Scene创建时必须指定,标记场景开始
- end在Scene完成时更新,执行中为null
- actualDuration可自动计算或手动填充,用于绩效分析

**location** (位置信息)

定义场景执行的空间位置,是Scene作为时空容器的空间维度锚点:

```json
{
  "type": "Property",
  "value": {
    "lineCode": "TS361202",              // 产线编码
    "stationCode": "ST-HJ-01",           // 工位编码(Step级必填)
    "zoneId": "ZONE-WELD-A",             // 区域标识
    "coordinates": {                      // 地理坐标(可选)
      "latitude": 39.9042,
      "longitude": 116.4074
    }
  }
}
```

**粒度策略**:
- TaktScene: 可能只有lineCode
- ProcessScene: 通常包含lineCode和zoneId
- StepScene: 必须精确到stationCode(模式约束)

### 3.3 核心关联属性

**refMBOM** (引用MBOM)

这是Scene最关键的关联之一,定义该场景遵循的工艺蓝图:

```json
{
  "type": "Relationship",
  "object": "urn:ngsi-ld:MBOM:M000004670327:T01:P0010"
}
```

**匹配规则**:
- sceneLevel=Takt时,应引用MBOM.Takt实例
- sceneLevel=Process时,应引用MBOM.Process实例
- 以此类推,确保层级对应

**refWorkpiece** (引用工件)

这是Scene与MBOM的核心区别所在:

```json
{
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:Workpiece.PO123-001"
}
```

**关键意义**:
- MBOM是通用模板,不绑定具体产品
- Scene绑定具体产品实例,记录该产品的实际执行过程
- 每个产品在生产中创建自己的Scene实例链

**involvesAsset** (涉及资产)

记录场景涉及的所有孪生体对象,用于LLM分析时确定上下文边界:

```json
{
  "type": "Relationship",
  "object": [
    "urn:ngsi-ld:TwinObject:Workpiece.PO123-001",     // 工件
    "urn:ngsi-ld:TwinObject:Robot.WELD-R01",          // 执行设备
    "urn:ngsi-ld:TwinObject:Person.Zhang_San",        // 操作人员
    "urn:ngsi-ld:TwinObject:Fixture.FIX-HJ-01"        // 辅助工装
  ]
}
```

**应用场景**:
- 为AI分析提供完整的资源上下文
- 支持资源使用率分析
- 实现设备-工件-人员的关联追溯

### 3.4 状态管理

**status** (执行状态)

```json
{
  "type": "Property",
  "value": "Running"  // Planned/Running/Paused/Completed/Failed/Aborted
}
```

**状态机转换**:
```
Planned → Running → (Paused → Running) → Completed/Failed/Aborted
```

- **Planned**: 已创建未开始
- **Running**: 执行中
- **Paused**: 暂停(可恢复)
- **Completed**: 正常完成
- **Failed**: 失败终止
- **Aborted**: 人工中止

## 4. 责任追溯机制

### 4.1 RACI责任分配

**responsibilityAssignment** 定义步骤级的角色责任:

```json
{
  "type": "Property",
  "value": [
    {
      "stepId": "urn:ngsi-ld:MBOM:M000004670327:T01:P0010:S01",
      "responsible": "urn:ngsi-ld:Role:Welder",           // R-执行者
      "accountable": "urn:ngsi-ld:Role:WeldingSupervisor", // A-最终负责人(唯一)
      "consulted": ["urn:ngsi-ld:Role:QualityEngineer"],  // C-咨询者
      "informed": ["urn:ngsi-ld:Role:ProductionManager"]  // I-知会者
    }
  ]
}
```

**设计原则**:
- 通常继承自MBOM的responsibilityFlow定义
- Scene创建时可根据实际情况覆盖或调整
- 每步骤必须有唯一accountable(A)和至少一个responsible(R)

### 4.2 执行日志

**stepLog** 记录每个步骤的实际执行情况:

```json
{
  "type": "Property",
  "value": [
    {
      "stepId": "urn:ngsi-ld:MBOM:M000004670327:T01:P0010:S01",
      "performedBy": {
        "personId": "urn:ngsi-ld:TwinObject:Person.Zhang_San",
        "roleId": "urn:ngsi-ld:Role:Welder"
      },
      "observedAt": "2025-01-08T14:35:00Z",
      "approvedBy": {
        "personId": "urn:ngsi-ld:TwinObject:Person.Li_Si",
        "roleId": "urn:ngsi-ld:Role:WeldingSupervisor"
      },
      "duration": 125,
      "resultData": {
        "status": "Pass",
        "qualityScore": 98
      }
    }
  ]
}
```

**责任链追溯能力**:
- 记录"谁"(personId)以"什么角色"(roleId)在"何时"(observedAt)执行了该步骤
- 支持审批者追溯(approvedBy)
- 结合RACI定义,形成计划与实际的对照

## 5. 结果溯源机制

### 5.1 结果数据结构

**result** 是Scene最关键的输出,必须包含derivedFrom实现溯源:

```json
{
  "type": "Property",
  "value": {
    "overallStatus": "Pass",  // Pass/Fail/PartialPass/Inconclusive/Pending
    "kpi": {
      "cycleTime": 214,
      "qualityScore": 98.5,
      "firstTimeYield": 1.0
    },
    "defects": [
      {
        "defectCode": "WELD-001",
        "severity": "Minor",
        "description": "焊缝表面轻微气孔",
        "detectedAt": "2025-01-08T17:30:00Z"
      }
    ],
    "deviations": [
      {
        "type": "TimeOverrun",
        "description": "工序耗时超出标准时间15%",
        "severity": "Minor"
      }
    ],
    "derivedFrom": [
      "urn:ngsi-ld:ModalData:WeldCurrent:20250108143500:001",
      "urn:ngsi-ld:ModalData:WeldSeamWidth:20250108180000:001",
      "urn:ngsi-ld:Scene:Step:PO123-001:T01-P0010-S01:20250108151200"
    ],
    "computedAt": "2025-01-08T18:05:15Z",
    "computedBy": "DataProduct_QualityCheck_V2.0"
  }
}
```

### 5.2 溯源链设计

**derivedFrom的核心价值**:

1. **一跳回溯**: 必须包含所有支撑该结果判定的数据源ID
2. **多源融合**: 可引用ModalData(模态数据)、子Scene、Event等多种实体
3. **可追溯性**: 从结果可直接定位到原始数据,无需多级查询
4. **透明性**: 明确结果的计算依据和来源

**溯源示例场景**:

假设ProcessScene的result.overallStatus="Fail",通过derivedFrom可追溯到:
- 3条焊接电流ModalData超出工艺范围
- 1条焊缝宽度ModalData不合格
- 2个子StepScene的result.overallStatus="Fail"

这种设计支持AI系统快速定位问题根因,无需遍历整个数据库。

### 5.3 KPI设计策略

不同层级Scene的KPI设计应体现层级差异:

**Route级KPI**:
- 总体OEE(设备综合效率)
- 整体合格率
- 订单完成率

**Takt级KPI**:
- 节拍时间符合率
- 节拍内质量合格率
- 节拍切换效率

**Process级KPI**:
- 工序周期时间
- 工序首次合格率
- 工序返工率

**Step级KPI**:
- 工步执行时间
- 工步质量分数
- 工步设备利用率

## 6. 场景序列关系

### 6.1 同层级序列

**predecessorScene & successorScene** 构建同层级的执行序列:

```json
{
  "predecessorScene": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Scene:Process:PO123-001:T01-P0005:20250108140000"
  },
  "successorScene": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Scene:Process:PO123-001:T01-P0015:20250108160000"
  }
}
```

**应用场景**:
- 同一产品的工序执行序列追溯
- 支持工艺路线的实际执行路径分析
- 便于AI分析工序间的传递关系

### 6.2 跨层级引用

Scene设计允许灵活的跨层级引用:

1. **跳层创建**: 可以直接创建StepScene而不创建上层ProcessScene
2. **跨层关联**: predecessorScene可以指向不同层级的Scene
3. **聚合分析**: 高层级Scene的result可derivedFrom多个低层级Scene

## 7. 元数据与扩展

### 7.1 元数据管理

**metadata** 提供实例级的管理信息:

```json
{
  "type": "Property",
  "value": {
    "createdAt": "2025-01-08T14:30:00Z",
    "createdBy": "MES_System_V3.2",
    "modifiedAt": "2025-01-08T18:05:15Z",
    "tags": ["urgent", "rework", "inspection"],
    "notes": "因设备故障返工,已加急处理"
  }
}
```

### 7.2 扩展性设计

虽然schema设置了`"additionalProperties": false`,但通过以下机制支持扩展:

1. **result.kpi对象**: 允许自定义KPI字段
2. **stepLog.resultData对象**: 支持步骤级自定义数据
3. **metadata.tags数组**: 支持自定义标签
4. **description属性**: 支持任意文本描述

## 8. 约束规则

### 8.1 条件约束

Schema使用`allOf`定义了条件约束:

**约束1**: StepScene必须指定精确的stationCode
```json
{
  "if": {"sceneLevel": {"value": "Step"}},
  "then": {"location.value.stationCode": "required"}
}
```

**约束2**: Process和Step层级Scene建议填充stepLog
```json
{
  "if": {"sceneLevel": {"value": ["Process", "Step"]}},
  "then": "建议填充stepLog字段"
}
```

### 8.2 数据质量规则

1. **时间合理性**: timeFrame.end必须晚于start
2. **层级匹配**: sceneLevel与refMBOM的层级必须一致
3. **结果完整性**: result.derivedFrom至少包含1个数据源
4. **RACI唯一性**: 每步骤的accountable必须唯一
5. **状态一致性**: status与timeFrame应保持逻辑一致

## 9. 应用场景

### 9.1 生产执行追溯

通过Scene实例链,可以追溯产品PO123-001的完整生产过程:
1. 从Workpiece.PO123-001查询所有refWorkpiece引用
2. 获得该产品的所有Scene实例(Route→Takt→Process→Step)
3. 通过timeFrame排序,重建时间轴
4. 通过location定位,重建空间路径
5. 通过stepLog和result,还原每步执行细节

### 9.2 质量问题根因分析

当发现质量问题时:
1. 从不合格产品的Scene.result.overallStatus="Fail"开始
2. 查看result.derivedFrom,定位相关ModalData和子Scene
3. 递归查看子Scene的result和derivedFrom,层层追溯
4. 结合stepLog,确定责任人和执行时间
5. 分析involvesAsset,确定涉及的设备和工装
6. 形成完整的问题根因链

### 9.3 AI智能分析

Scene为AI提供了结构化的分析基础:
- **上下文边界**: involvesAsset明确分析范围
- **时空锚点**: timeFrame和location提供时空坐标
- **因果链条**: derivedFrom提供数据溯源路径
- **责任映射**: RACI+stepLog提供人员-角色映射
- **结果标注**: result提供监督学习的标签

## 10. 实施建议

### 10.1 创建策略

1. **按需创建**: 根据业务需要选择创建层级,不必全部创建
2. **时机控制**: 在工序开始时创建Scene,完成时更新result
3. **批量优化**: 对于重复性高的工序,可以模板化创建
4. **异步更新**: stepLog和result可以异步填充,不阻塞生产

### 10.2 查询优化

1. **索引设计**: 为workpieceCode、sceneLevel、status建立索引
2. **时间分区**: 按timeFrame.start进行时间分区
3. **图数据库**: 考虑使用图数据库存储Scene关系网络
4. **缓存策略**: 对正在执行的Scene进行内存缓存

### 10.3 数据治理

1. **归档策略**: 已完成Scene定期归档到历史库
2. **清理规则**: 定义失败Scene的保留周期
3. **版本管理**: 通过timestamp实现Scene的版本追溯
4. **权限控制**: 基于sceneLevel和location实施访问控制

## 11. 总结

Scene场景实体元模型通过以下特性实现了生产执行的全面数字化:

1. **时空容器理念**: 将生产过程抽象为时空容器,提供统一的时空锚点
2. **五层级灵活性**: 支持从粗粒度到细粒度的灵活建模
3. **强溯源能力**: derivedFrom机制实现一跳数据溯源
4. **责任可追溯**: RACI+stepLog实现完整责任链追溯
5. **AI友好设计**: 结构化数据为AI分析提供坚实基础

该模型与MBOM模型配合,形成"计划-执行"的闭环:MBOM定义"应该如何做",Scene记录"实际如何做的",两者的对比分析为持续改进提供依据。

通过Scene模型,企业可以实现从订单到产品的全生命周期追溯,为质量管理、工艺优化、AI分析提供统一的数据基础。