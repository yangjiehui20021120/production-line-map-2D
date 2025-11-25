# ModalityBinding 元模型设计说明（简化版）

**版本**: 2.0.0 (简化版)
 **日期**: 2025-10-22
 **适用范围**: 动车侧墙产线数字孪生系统
 **设计理念**: 最小化核心字段，聚焦本质功能

------

## 一、设计目标

ModalityBinding元模型旨在实现**Modality数据字典的实例化**，核心目标：

1. **连接设备与数据类型**：明确"哪个设备采集什么数据"
2. **指定数据来源**：定义数据从何处获取（采集点位）
3. **配置采样参数**：设定采样频率等基本参数
4. **支持多点区分**：同一设备同一Modality的多个采集点

**设计哲学**：

> **"大道至简"** - 只保留最核心、最必要的字段，将复杂的功能留给专门的系统处理

------

## 二、简化原则

### 原则1：单一职责

ModalityBinding **只负责**：

- 将Modality绑定到TwinObject
- 指定具体的采集点位（pointRef）
- 配置基本采样参数（sampleRate）

ModalityBinding **不负责**：

- ❌ 数据处理（滤波、转换） → 由数据处理管道负责
- ❌ 数据质量控制 → 由质量管理系统负责
- ❌ 存储策略 → 由数据管理策略负责
- ❌ 变更管理 → 由工程变更系统负责

------

### 原则2：最小可行配置

**核心问题**：配置一个数据采集点，最少需要什么信息？

**答案**：5个必填字段

json

```json
{
  "id": "唯一标识",
  "type": "ModalityBinding",
  "twinId": "哪个设备",
  "modalityId": "什么数据",
  "pointRef": "从哪里获取"
}
```

加上3个强烈推荐字段（sampleRate, bindingVersion）和2个可选字段（axis, location），共10个字段即可覆盖绝大多数场景。

------

### 原则3：按需扩展

简化不等于削弱功能，而是**将复杂性延后**：

**第一阶段**：使用10个核心字段快速部署 **第二阶段**：根据实际需求，通过以下方式扩展：

1. 添加自定义属性（NGSI-LD允许）
2. 关联专门的配置实体（如DataProcessingConfig）
3. 利用外部系统（如变更管理系统、质量管理系统）

------

## 三、字段详细说明

### 3.1 必填字段（5个）

```
字段名类型说明示例
idstring全局唯一标识符urn:ngsi-ld:ModalityBinding:Robot01:Current:v1
typeconst固定为"ModalityBinding""ModalityBinding"
twinIdRelationship关联的TwinObject URNurn:ngsi-ld:TwinObject:WeldingRobot01
modalityIdRelationship关联的Modality URNurn:ngsi-ld:Modality:WeldingCurrent_Auto
pointRefProperty数据采集点位引用（核心）opc.tcp://10.0.0.5:4840/ns=2;s=WeldCurrent
```

#### pointRef字段详解

**支持的协议**：

- **OPC UA**: `opc.tcp://host:port/ns=X;s=NodeId`
- **Modbus**: `modbus://host:port/holding/address`
- **MQTT**: `mqtt://broker/topic/path`
- **HTTP**: `http://api.host/endpoint`
- **其他**: 自定义协议字符串

**示例**：

json

```json
{
  "pointRef": {
    "type": "Property",
    "value": "opc.tcp://10.0.0.5:4840/ns=2;s=Robot/Process/WeldCurrent"
  }
}
```

------

### 3.2 强烈推荐字段（2个）

```
字段名说明典型值为什么重要
sampleRate采样频率"100ms", "1s", "byStep"控制数据采集频率
bindingVersion版本号"1.0.0", "2.0.0"配置变更追踪
```

#### sampleRate字段详解

**支持的格式**：

- **时间间隔**: `"100ms"`, `"1s"`, `"10s"`, `"1min"`
- **特殊值**:
  - `"byStep"` - 按工步触发（如每次焊接完成后采集一次）
  - `"onEvent"` - 事件触发（如温度超阈值时采集）
  - `"continuous"` - 连续采集（尽可能快）

**示例**：

json

```json
{
  "sampleRate": {
    "type": "Property",
    "value": "100ms"
  }
}
```

------

### 3.3 可选字段（3个）

```
字段名使用场景示例
unit单位与Modality默认值不同时"mA" (Modality定义为"A")
axis多轴设备区分"X", "Y", "Z", "A", "B", "C"
location多点采集位置区分"Main", "TopLeft", "Center"
```

#### unit字段：何时使用

**场景1**：传感器返回毫安，但标准单位是安培

json

```json
// Modality定义
{
  "id": "urn:ngsi-ld:Modality:WeldingCurrent_Auto",
  "unit": {"value": "A"}  // 标准单位：安培
}

// ModalityBinding覆盖
{
  "modalityId": {"object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"},
  "unit": {"value": "mA"},  // 设备实际单位：毫安
  "pointRef": {"value": "opc.tcp://.../CurrentMilliAmps"}
}
```

**注意**：应该在数据处理层进行单位转换，而不是在Binding层。unit字段仅用于**记录实际单位**，便于后续处理。

#### axis和location字段：多点采集

**场景2**：数控加工中心8个驱动器温度

json

```json
// 共享同一个Modality: DriveTemp
// 通过axis和location字段区分8个采集点

// X轴主驱动器
{
  "id": "urn:ngsi-ld:ModalityBinding:CNC01:DriveTemp:X_Main:v1",
  "modalityId": {"object": "urn:ngsi-ld:Modality:DriveTemp"},
  "axis": {"value": "X"},
  "location": {"value": "Main"}
}

// X轴正向驱动器
{
  "id": "urn:ngsi-ld:ModalityBinding:CNC01:DriveTemp:X_Forward:v1",
  "modalityId": {"object": "urn:ngsi-ld:Modality:DriveTemp"},
  "axis": {"value": "X"},
  "location": {"value": "Forward"}
}

// Y轴驱动器
{
  "id": "urn:ngsi-ld:ModalityBinding:CNC01:DriveTemp:Y:v1",
  "modalityId": {"object": "urn:ngsi-ld:Modality:DriveTemp"},
  "axis": {"value": "Y"}
  // location可省略（Y轴只有一个驱动器）
}
```

------

## 四、典型应用场景

### 场景1：单点采集（最简配置）

**案例**：IGM焊接机器人的焊接电流

json

```json
{
  "id": "urn:ngsi-ld:ModalityBinding:WeldingRobot01:WeldingCurrent:v1",
  "type": "ModalityBinding",
  "twinId": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:WeldingRobot01"
  },
  "modalityId": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"
  },
  "pointRef": {
    "type": "Property",
    "value": "opc.tcp://10.0.0.5:4840/ns=2;s=Robot/Process/WeldCurrent"
  },
  "sampleRate": {
    "type": "Property",
    "value": "100ms"
  },
  "bindingVersion": {
    "type": "Property",
    "value": "1.0.0"
  }
}
```

**说明**：6个字段即可完成配置，清晰简洁。

------

### 场景2：多点采集（使用axis/location区分）

**案例**：工位环境温度5个传感器

json

```json
// 5个Binding共享同一个Modality: AmbientTemp_Auto
// 通过location字段区分

{
  "id": "urn:ngsi-ld:ModalityBinding:Station01:AmbientTemp:TopLeft:v1",
  "twinId": {"object": "urn:ngsi-ld:TwinObject:Station01"},
  "modalityId": {"object": "urn:ngsi-ld:Modality:AmbientTemp_Auto"},
  "pointRef": {"value": "opc.tcp://.../Env/Temp/TopLeft"},
  "sampleRate": {"value": "1s"},
  "location": {"value": "TopLeft"}
}

// 其他4个Binding类似：TopRight, BottomLeft, BottomRight, Center
```

------

### 场景3：配置升级（版本演进）

**案例**：激光扫描仪传感器更换

**原配置（v1）**：

json

```json
{
  "id": "urn:ngsi-ld:ModalityBinding:LaserScanner01:ProfileOffset:v1",
  "twinId": {"object": "urn:ngsi-ld:TwinObject:LaserScanner01"},
  "modalityId": {"object": "urn:ngsi-ld:Modality:ProfileOffset"},
  "pointRef": {"value": "opc.tcp://.../Scanner/Result/ProfileOffset"},
  "sampleRate": {"value": "byStep"},
  "bindingVersion": {"value": "1.0.0"}
}
```

**新配置（v2）**：

json

```json
{
  "id": "urn:ngsi-ld:ModalityBinding:LaserScanner01:ProfileOffset:v2",
  "twinId": {"object": "urn:ngsi-ld:TwinObject:LaserScanner01"},
  "modalityId": {"object": "urn:ngsi-ld:Modality:ProfileOffset"},
  "pointRef": {"value": "opc.tcp://.../Scanner/Result/NewProfileOffset"},  // 新传感器
  "sampleRate": {"value": "byStep"},
  "bindingVersion": {"value": "2.0.0"}  // 版本递增
}
```

**管理策略**：

1. 创建v2配置（新传感器地址）
2. 部署v2后观察数据质量
3. 确认稳定后删除v1配置
4. 或保留v1作为历史记录（通过ID中的版本号区分）

------

### 场景4：单位覆盖

**案例**：传感器返回毫安

json

~~~json
{
  "id": "urn:ngsi-ld:ModalityBinding:Sensor01:Current:v1",
  "twinId": {"object": "urn:ngsi-ld:TwinObject:Sensor01"},
  "modalityId": {"object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"},
  "pointRef": {"value": "modbus://192.168.1.100:502/holding/1001"},
  "sampleRate": {"value": "100ms"},
  "unit": {"value": "mA"},  // 覆盖Modality的默认单位"A"
  "bindingVersion": {"value": "1.0.0"}
}
```

**注意**：数据处理管道应该将mA转换为A后再存储，保持与Modality定义一致。

---

## 五、与其他实体的关系

### 5.1 三角关系
```
        Modality (数据字典)
           ↑
           |
           | modalityId
           |
    ModalityBinding (绑定配置)
           |
           | twinId
           ↓
       TwinObject (物理设备)
```

**说明**：
- Modality定义"观测什么"
- TwinObject代表"谁在观测"
- ModalityBinding连接两者，定义"怎么观测"

---

### 5.2 运行时数据流
```
【设计阶段】
Modality: WeldingCurrent_Auto (焊接电流，自动采集)

【部署阶段】
ModalityBinding:
- twinId: WeldingRobot01
- modalityId: WeldingCurrent_Auto
- pointRef: opc.tcp://.../WeldCurrent
- sampleRate: 100ms

【运行阶段】
数据采集代理读取Binding配置
↓
按100ms频率从OPC UA点位读取数据
↓
生成ModalData记录:
- refTwin: WeldingRobot01
- refModality: WeldingCurrent_Auto
- value: 185.3 (A)
- timestamp: 2025-10-22T10:15:30.123Z
```

---

## 六、命名规范

### 6.1 Binding ID命名规范

**格式**: `urn:ngsi-ld:ModalityBinding:{TwinName}:{ModalityName}:{Discriminator}:v{Version}`

**组成部分**：
1. **TwinName**: 设备名称（不含`TwinObject:`前缀）
2. **ModalityName**: 模态名称（不含`Modality:`前缀）
3. **Discriminator**: 区分符（可选，用于多点采集）
4. **Version**: 版本号（如v1, v2）

**示例**：

**单点采集**（无Discriminator）：
```
urn:ngsi-ld:ModalityBinding:WeldingRobot01:WeldingCurrent:v1
urn:ngsi-ld:ModalityBinding:LaserScanner01:ProfileOffset:v2
```

**多点采集**（使用axis）：
```
urn:ngsi-ld:ModalityBinding:CNCMachine01:DriveTemp:X:v1
urn:ngsi-ld:ModalityBinding:CNCMachine01:DriveTemp:Y:v1
```

**多点采集**（使用axis+location）：
```
urn:ngsi-ld:ModalityBinding:CNCMachine01:DriveTemp:X_Main:v1
urn:ngsi-ld:ModalityBinding:CNCMachine01:DriveTemp:X_Forward:v1
```

**多点采集**（使用location）：
```
urn:ngsi-ld:ModalityBinding:Station01:AmbientTemp:TopLeft:v1
urn:ngsi-ld:ModalityBinding:Station01:AmbientTemp:Center:v1
```

---

### 6.2 Discriminator命名规则

**格式选择**：

| 场景 | 格式 | 示例 |
|-----|------|------|
| 仅区分轴 | `{Axis}` | `X`, `Y`, `Z` |
| 轴+位置 | `{Axis}_{Location}` | `X_Main`, `X_Forward` |
| 仅区分位置 | `{Location}` | `TopLeft`, `Center` |

**推荐用词**：
- **轴**: X, Y, Z, A, B, C, Spindle, A1
- **位置**: Main, Forward, Slave, ForwardSlave, Top, Bottom, Left, Right, Center, Front, Rear

---

## 七、实施指南

### 7.1 配置流程

**步骤1：准备信息**
```
✓ 确定设备: WeldingRobot01
✓ 确定数据类型: WeldingCurrent_Auto
✓ 确定采集点: opc.tcp://10.0.0.5:4840/ns=2;s=WeldCurrent
✓ 确定采样率: 100ms
~~~

**步骤2：创建Binding**

json

~~~json
{
  "id": "urn:ngsi-ld:ModalityBinding:WeldingRobot01:WeldingCurrent:v1",
  "type": "ModalityBinding",
  "twinId": {"object": "urn:ngsi-ld:TwinObject:WeldingRobot01"},
  "modalityId": {"object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"},
  "pointRef": {"value": "opc.tcp://10.0.0.5:4840/ns=2;s=WeldCurrent"},
  "sampleRate": {"value": "100ms"},
  "bindingVersion": {"value": "1.0.0"}
}
```

**步骤3：验证配置**
```
✓ 检查pointRef是否可访问
✓ 测试数据采集
✓ 验证数据质量
```

**步骤4：部署上线**
```
✓ 将Binding配置加载到数字孪生系统
✓ 启动数据采集代理
✓ 监控ModalData生成情况
~~~

------

### 7.2 多点采集最佳实践

**案例**：数控加工中心8个驱动器温度

**推荐做法**：

1. 创建统一的Modality: `DriveTemp`
2. 创建8个Binding，保持参数一致：
   - sampleRate: 统一为"10s"
   - bindingVersion: 统一为"1.0.0"
3. 通过axis和location字段区分
4. 使用清晰的Discriminator命名

**示例**：

json

~~~json
// Binding 1
{
  "id": "urn:ngsi-ld:ModalityBinding:CNC01:DriveTemp:X_Main:v1",
  "pointRef": {"value": "opc.tcp://.../CNC/Drive/X/Main/Temp"},
  "sampleRate": {"value": "10s"},
  "axis": {"value": "X"},
  "location": {"value": "Main"}
}

// Binding 2
{
  "id": "urn:ngsi-ld:ModalityBinding:CNC01:DriveTemp:X_Forward:v1",
  "pointRef": {"value": "opc.tcp://.../CNC/Drive/X/Forward/Temp"},
  "sampleRate": {"value": "10s"},
  "axis": {"value": "X"},
  "location": {"value": "Forward"}
}

// ... 其他6个Binding类似
```

---

### 7.3 配置变更策略

**原则**：新建版本，保留历史

**流程**：
1. 不修改现有Binding
2. 创建新版本Binding（版本号递增）
3. 验证新版本稳定后，删除或停用旧版本

**示例**：
```
【原配置】
ModalityBinding:LaserScanner01:ProfileOffset:v1
- pointRef: opc.tcp://.../OldSensor

【新配置】
ModalityBinding:LaserScanner01:ProfileOffset:v2
- pointRef: opc.tcp://.../NewSensor
- bindingVersion: 2.0.0

【切换】
1. 部署v2
2. 观察数据质量
3. 确认稳定后删除v1
~~~

------

## 八、扩展机制

虽然简化到10个核心字段，但ModalityBinding仍然支持灵活扩展：

### 8.1 通过自定义属性扩展

NGSI-LD允许添加自定义属性：

json

```json
{
  "id": "urn:ngsi-ld:ModalityBinding:...",
  "type": "ModalityBinding",
  // ... 核心字段 ...
  
  // 自定义属性
  "customFilter": {
    "type": "Property",
    "value": "median3"
  },
  "customDeadband": {
    "type": "Property",
    "value": 0.2
  }
}
```

**注意**：自定义属性不影响核心功能，仅供特定应用使用。

------

### 8.2 通过关联实体扩展

对于复杂需求，可以关联专门的配置实体：

json

~~~json
// ModalityBinding (核心简洁)
{
  "id": "urn:ngsi-ld:ModalityBinding:Robot01:Current:v1",
  "twinId": {...},
  "modalityId": {...},
  "pointRef": {...},
  "sampleRate": {...},
  
  // 关联高级配置
  "dataProcessingConfig": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:DataProcessingConfig:Default_Filter"
  }
}

// DataProcessingConfig (独立管理)
{
  "id": "urn:ngsi-ld:DataProcessingConfig:Default_Filter",
  "type": "DataProcessingConfig",
  "filter": "median3",
  "deadband": 0.2,
  "transformRule": "..."
}
```

---

## 九、常见问题

### Q1: 为什么不包含filter、deadband等字段？

**A**: 这些属于**数据处理**功能，不是数据采集配置的核心关注点。应该由专门的数据处理管道或ETL系统负责。

**理由**：
- 职责分离：Binding只负责"从哪里获取数据"
- 复用性：多个Binding可以共享同一套数据处理规则
- 灵活性：数据处理策略可以独立演进，无需修改Binding

---

### Q2: 如何处理数据单位转换？

**A**: 通过unit字段**记录实际单位**，由数据处理层负责转换。

**流程**：
```
1. Binding记录: unit = "mA" (设备实际单位)
2. 数据采集代理读取原始值: 2500 (mA)
3. 数据处理层转换: 2500 / 1000 = 2.5 (A)
4. ModalData存储: value = 2.5, unit = "A" (符合Modality定义)
```

---

### Q3: 配置变更如何追踪？

**A**: 通过bindingVersion字段和ID中的版本号。

**示例**：
```
v1: urn:ngsi-ld:ModalityBinding:Scanner01:Offset:v1
    bindingVersion: "1.0.0"
    pointRef: opc.tcp://.../OldSensor

v2: urn:ngsi-ld:ModalityBinding:Scanner01:Offset:v2
    bindingVersion: "2.0.0"
    pointRef: opc.tcp://.../NewSensor
```

通过ModalData的时间戳和Binding的版本，可以推导出数据采集时使用的配置版本。

---

### Q4: 同一设备同一Modality有多个Binding，如何区分？

**A**: 通过以下机制：
1. **ID中的Discriminator**: 如`X_Main` vs `X_Forward`
2. **axis字段**: 如`X` vs `Y`
3. **location字段**: 如`TopLeft` vs `Center`

**示例**：
```
Binding 1: CNC01:DriveTemp:X_Main:v1
- axis: X
- location: Main

Binding 2: CNC01:DriveTemp:X_Forward:v1
- axis: X
- location: Forward
~~~

------

## 十、总结

简化版ModalityBinding元模型通过**10个核心字段**实现了：

1. ✅ **简洁易用**：5个必填 + 2个推荐 + 3个可选 = 10个字段
2. ✅ **职责清晰**：只负责连接设备和数据定义，指定采集点位
3. ✅ **快速上手**：工程师可以在5分钟内理解和配置
4. ✅ **灵活扩展**：支持自定义属性和关联实体扩展
5. ✅ **工程实用**：覆盖80%的常见场景
