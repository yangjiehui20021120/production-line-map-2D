# ModalityBinding 实例生成说明文档

**版本**: 1.0.0  
**生成日期**: 2025-10-28  
**适用范围**: 动车侧墙产线数字孪生系统 - 自动化设备数据采集绑定配置  
**数据来源**: autoequipment_instances.json (33台自动化设备)

---

## 一、生成概述

### 1.1 生成统计

| 统计项 | 数值 | 说明 |
|--------|------|------|
| **总绑定数** | 352 | 为所有设备的所有支持模态生成的绑定实例总数 |
| **涉及设备数** | 33 | 参与绑定配置的自动化设备总数 |
| **涉及模态数** | 33 | 使用的不同Modality类型数量 |
| **平均绑定数/设备** | 10.7 | 每台设备平均配置的数据采集点数 |

### 1.2 按设备类型分布

| 设备类型 | 设备数量 | 每设备模态数 | 生成绑定数 | 典型设备 |
|---------|---------|-------------|-----------|----------|
| **Robot** (焊接机器人) | 3 | 22 | 66 | 德国克鲁斯焊接机械手 |
| **Welder** (焊接机) | 18 | 12 | 216 | 福尼斯电弧焊接机 |
| **CNC** (加工中心) | 2 | 15 | 30 | FOOKE加工中心 |
| **Other** (其他设备) | 10 | 4 | 40 | 电弧焊接专机、起重机、隔音房等 |

---

## 二、设备类型与模态映射策略

### 2.1 Robot (焊接机器人) - 22个模态

**核心功能**: 自动化焊接作业，需要监控运动、焊接工艺、环境和能耗参数

#### 运动与位姿模态 (9个)
- `RobotLinearSpeed` - 机器人线速度
- `RobotTCPPose` - 机器人TCP位姿
- `RobotBaseX/Y/Z` - 机器人基座坐标系姿态(Roll/Pitch/Yaw)
- `RobotToolEX/Y/Z` - 工具坐标系姿态
- `RobotRailPosition` - 机器人导轨位置

#### 焊接工艺模态 (8个)
- `WeldingCurrent_Auto` - 焊接电流(自动采集)
- `WeldingCurrent_Stat` - 焊接电流(统计值)
- `WeldingVoltage_Auto` - 焊接电压(自动采集)
- `WeldingVoltage_Stat` - 焊接电压(统计值)
- `WeldingSpeed` - 焊接速度
- `WireFeedSpeed_Auto` - 送丝速度
- `CoolingWaterFlow` - 冷却水流量
- `ShieldingGasFlow` - 保护气流量

#### 环境与能耗模态 (5个)
- `AmbientTemp_Auto` - 环境温度
- `TotalEnergyConsumption` - 总能耗
- `PowerOnDuration` - 上电时长
- `OperationDuration` - 开动时长
- `CumulativeRuntime` - 累计运行时长

**业务说明**: 焊接机器人是最复杂的设备类型，需要全方位监控其运动轨迹、焊接质量和设备状态。

---

### 2.2 Welder (焊接机) - 12个模态

**核心功能**: 提供焊接能量，监控焊接工艺参数

#### 焊接工艺模态 (8个)
- `WeldingCurrent_Auto` - 焊接电流(自动采集)
- `WeldingCurrent_Stat` - 焊接电流(统计值)
- `WeldingVoltage_Auto` - 焊接电压(自动采集)
- `WeldingVoltage_Stat` - 焊接电压(统计值)
- `WireFeedSpeed_Auto` - 送丝速度
- `SendWireCurrent` - 送丝电流
- `CoolingWaterFlow` - 冷却水流量
- `ShieldingGasFlow` - 保护气流量

#### 环境与能耗模态 (4个)
- `AmbientTemp_Auto` - 环境温度
- `TotalEnergyConsumption` - 总能耗
- `PowerOnDuration` - 上电时长
- `OperationDuration` - 开动时长

**业务说明**: 焊接机作为独立设备，重点监控其输出的焊接工艺参数和设备运行状态。

---

### 2.3 CNC (加工中心) - 15个模态

**核心功能**: 精密加工，监控运动、刀具、质量和能耗参数

#### 运动与刀具模态 (5个)
- `MotorRotationSpeed` - 电机转速
- `ToolLinearSpeed` - 刀具线速度
- `FeedRate` - 进给速度
- `AxisAngle` - 轴旋转角度
- `ToolCompensation` - 刀具补偿值

#### 设备状态模态 (3个)
- `DriveTemp` - 驱动器温度
- `DriveForce` - 驱动力
- `WorkpieceDeflection` - 工件挠度

#### 质量模态 (1个)
- `DimensionMeasurement_Auto` - 尺寸测量(自动)

#### 环境与能耗模态 (6个)
- `AmbientTemp_Auto` - 环境温度
- `TotalEnergyConsumption` - 总能耗
- `PowerOnDuration` - 上电时长
- `OperationDuration` - 开动时长
- `SpindlePower` - 主轴功率
- `CumulativeRuntime` - 累计运行时长

**业务说明**: 加工中心需要精密监控加工过程的各项参数，特别是驱动器状态和加工质量。

---

### 2.4 Other (其他设备) - 4个模态

**核心功能**: 基础监控，涵盖环境和能耗参数

#### 基础监控模态 (4个)
- `AmbientTemp_Auto` - 环境温度
- `TotalEnergyConsumption` - 总能耗
- `PowerOnDuration` - 上电时长
- `OperationDuration` - 开动时长

**业务说明**: 对于电弧焊接专机、起重机、隔音房等辅助设备，提供基础的运行状态和能耗监控。

---

## 三、使用最多的模态TOP10

| 排名 | 模态名称 | 使用次数 | 适用设备类型 | 业务重要性 |
|-----|---------|---------|-------------|-----------|
| 1 | AmbientTemp_Auto | 33 | 所有设备 | ⭐⭐⭐⭐⭐ 环境温度影响焊接质量和工件尺寸稳定性 |
| 1 | TotalEnergyConsumption | 33 | 所有设备 | ⭐⭐⭐⭐ 能耗管理和成本核算 |
| 1 | PowerOnDuration | 33 | 所有设备 | ⭐⭐⭐⭐ 设备利用率分析 |
| 1 | OperationDuration | 33 | 所有设备 | ⭐⭐⭐⭐⭐ OEE计算的关键指标 |
| 5 | WeldingCurrent_Auto | 21 | Robot + Welder | ⭐⭐⭐⭐⭐ 焊接质量的核心参数 |
| 5 | WeldingCurrent_Stat | 21 | Robot + Welder | ⭐⭐⭐⭐⭐ 质量判定依据 |
| 5 | WeldingVoltage_Auto | 21 | Robot + Welder | ⭐⭐⭐⭐⭐ 焊接质量的核心参数 |
| 5 | WeldingVoltage_Stat | 21 | Robot + Welder | ⭐⭐⭐⭐⭐ 质量判定依据 |
| 5 | WireFeedSpeed_Auto | 21 | Robot + Welder | ⭐⭐⭐⭐ 焊接工艺控制 |
| 5 | CoolingWaterFlow | 21 | Robot + Welder | ⭐⭐⭐ 设备保护 |

---

## 四、关键字段说明

### 4.1 ID命名规则

**格式**: `urn:ngsi-ld:ModalityBinding:{TwinName}:{ModalityName}:v{Version}`

**示例**:
```
urn:ngsi-ld:ModalityBinding:361-900A:RobotLinearSpeed:v1
urn:ngsi-ld:ModalityBinding:361-01156:WeldingCurrent_Auto:v1
urn:ngsi-ld:ModalityBinding:046-4:MotorRotationSpeed:v1
```

**组成说明**:
- **TwinName**: 设备资产编号（从设备ID中提取最后一段）
- **ModalityName**: 模态名称（从模态ID中提取最后一段）
- **Version**: 版本号，初始版本统一为`v1`

---

### 4.2 pointRef (数据点引用)

**格式**: `ns=2;s={TwinName}.{ModalityName}`

**说明**: 
- 这是一个**占位符格式**，符合OPC UA节点命名规范
- 实际部署时需要替换为真实的数据采集地址
- 支持的协议包括: OPC UA, Modbus, MQTT, HTTP等

**实际部署示例**:
```json
// 占位符（当前生成）
"pointRef": {
  "type": "Property",
  "value": "ns=2;s=361-900A.WeldingCurrent_Auto"
}

// 实际地址（部署时替换）
"pointRef": {
  "type": "Property",
  "value": "opc.tcp://10.0.0.5:4840/ns=2;s=Robot01/Process/WeldCurrent"
}
```

---

### 4.3 固定配置字段

所有生成的绑定实例使用统一的配置参数:

| 字段 | 值 | 说明 |
|-----|---|------|
| `bindingVersion` | "1.0.0" | 绑定配置的语义化版本号 |
| `changeId` | "CHG-INITIAL-SETUP-2025" | 变更标识，表示初始配置 |
| `effectiveFrom` | "2025-01-01T00:00:00Z" | 配置生效时间 |
| `@context` | 标准NGSI-LD上下文 | 包含核心上下文和自定义上下文 |

---

## 五、典型绑定实例示例

### 5.1 焊接机器人绑定示例

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/binding-context.jsonld"
  ],
  "id": "urn:ngsi-ld:ModalityBinding:361-900A:WeldingCurrent_Auto:v1",
  "type": "ModalityBinding",
  "twinId": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:AutoEquipment:361-900A"
  },
  "modalityId": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"
  },
  "pointRef": {
    "type": "Property",
    "value": "ns=2;s=361-900A.WeldingCurrent_Auto"
  },
  "bindingVersion": {
    "type": "Property",
    "value": "1.0.0"
  },
  "changeId": {
    "type": "Property",
    "value": "CHG-INITIAL-SETUP-2025"
  },
  "effectiveFrom": {
    "type": "Property",
    "value": "2025-01-01T00:00:00Z"
  }
}
```

**说明**: 
- 设备: 361-900A (德国克鲁斯焊接机械手)
- 模态: WeldingCurrent_Auto (焊接电流自动采集)
- 数据点: 占位符格式，待替换为实际OPC UA地址

---

### 5.2 焊接机绑定示例

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/binding-context.jsonld"
  ],
  "id": "urn:ngsi-ld:ModalityBinding:361-01156:WeldingVoltage_Auto:v1",
  "type": "ModalityBinding",
  "twinId": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01156"
  },
  "modalityId": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:WeldingVoltage_Auto"
  },
  "pointRef": {
    "type": "Property",
    "value": "ns=2;s=361-01156.WeldingVoltage_Auto"
  },
  "bindingVersion": {
    "type": "Property",
    "value": "1.0.0"
  },
  "changeId": {
    "type": "Property",
    "value": "CHG-INITIAL-SETUP-2025"
  },
  "effectiveFrom": {
    "type": "Property",
    "value": "2025-01-01T00:00:00Z"
  }
}
```

**说明**: 
- 设备: 361-01156 (珠海福尼斯电弧焊接机)
- 模态: WeldingVoltage_Auto (焊接电压自动采集)

---

### 5.3 加工中心绑定示例

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/binding-context.jsonld"
  ],
  "id": "urn:ngsi-ld:ModalityBinding:046-4:DriveTemp:v1",
  "type": "ModalityBinding",
  "twinId": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:AutoEquipment:046-4"
  },
  "modalityId": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Modality:DriveTemp"
  },
  "pointRef": {
    "type": "Property",
    "value": "ns=2;s=046-4.DriveTemp"
  },
  "bindingVersion": {
    "type": "Property",
    "value": "1.0.0"
  },
  "changeId": {
    "type": "Property",
    "value": "CHG-INITIAL-SETUP-2025"
  },
  "effectiveFrom": {
    "type": "Property",
    "value": "2025-01-01T00:00:00Z"
  }
}
```

**说明**: 
- 设备: 046-4 (德国FOOKE加工中心)
- 模态: DriveTemp (驱动器温度)
- **注意**: DriveTemp是典型的多点采集模态，实际应为每个驱动器创建独立绑定并使用axis和location字段区分

---

## 六、后续实施步骤

### 6.1 数据点地址映射 (必须)

**任务**: 将占位符pointRef替换为实际数据采集地址

**方法**:
1. 与设备供应商或现场工程师确认每台设备的数据接口
2. 获取OPC UA服务器地址、节点ID或其他协议的连接信息
3. 批量替换或逐条更新pointRef字段

**示例映射表**:
| 设备编号 | 模态 | 占位符 | 实际地址 |
|---------|------|--------|---------|
| 361-900A | WeldingCurrent_Auto | ns=2;s=361-900A.WeldingCurrent_Auto | opc.tcp://10.0.0.5:4840/ns=2;s=Robot/WeldCurrent |
| 361-01156 | WeldingVoltage_Auto | ns=2;s=361-01156.WeldingVoltage_Auto | opc.tcp://10.0.0.8:4840/ns=2;s=Welder/Voltage |

---

### 6.2 多点采集配置细化 (推荐)

**适用场景**: 
- 加工中心的DriveTemp (8个驱动器)
- 加工中心的DriveForce (8个驱动器)
- 工位的AmbientTemp_Auto (多个传感器)

**当前状态**: 每台设备只有1个绑定
**建议优化**: 为每个测点创建独立绑定

**示例**:
```json
// 当前（简化版）
{
  "id": "urn:ngsi-ld:ModalityBinding:046-4:DriveTemp:v1",
  "pointRef": {"value": "ns=2;s=046-4.DriveTemp"}
}

// 优化后（为每个驱动器创建绑定）
{
  "id": "urn:ngsi-ld:ModalityBinding:046-4:DriveTemp:X_Main:v1",
  "pointRef": {"value": "opc.tcp://.../Drive/X/Main/Temp"},
  "axis": {"value": "X"},
  "location": {"value": "Main"}
},
{
  "id": "urn:ngsi-ld:ModalityBinding:046-4:DriveTemp:X_Forward:v1",
  "pointRef": {"value": "opc.tcp://.../Drive/X/Forward/Temp"},
  "axis": {"value": "X"},
  "location": {"value": "Forward"}
}
// ... 其他6个驱动器
```

---

### 6.3 采样频率配置 (推荐)

**任务**: 为每个绑定添加sampleRate字段

**推荐配置**:
| 模态类型 | 推荐采样率 | 理由 |
|---------|-----------|------|
| 焊接电流/电压 (Auto) | 100ms | 高频采集以捕捉工艺波动 |
| 焊接电流/电压 (Stat) | byStep | 每个焊接场景结束后计算一次 |
| 机器人位姿/速度 | 50-100ms | 轨迹跟踪需要较高频率 |
| 驱动器温度 | 10s | 温度变化较慢 |
| 环境温度/湿度 | 1s-10s | 环境参数变化较慢 |
| 能耗数据 | 1s | 实时监控能耗变化 |

**添加示例**:
```json
{
  "id": "urn:ngsi-ld:ModalityBinding:361-900A:WeldingCurrent_Auto:v1",
  // ... 其他字段 ...
  "sampleRate": {
    "type": "Property",
    "value": "100ms"
  }
}
```

---

### 6.4 数据验证与测试

**步骤**:
1. **连通性测试**: 验证每个pointRef是否可访问
2. **数据类型验证**: 确认返回的数据类型与Modality定义一致
3. **数据质量检查**: 检查数据合理性（如数值范围、更新频率）
4. **负载测试**: 验证系统能否承受352个并发数据采集点

---

## 七、数据使用指南

### 7.1 导入数字孪生平台

**方法1: 批量导入**
```bash
# 使用平台提供的批量导入API
curl -X POST https://dt-platform.example.com/api/v1/bindings/batch \
  -H "Content-Type: application/json" \
  -d @ModalityBinding_Instances.json
```

**方法2: 逐条导入**
```python
import json
import requests

with open('ModalityBinding_Instances.json', 'r') as f:
    bindings = json.load(f)

for binding in bindings:
    response = requests.post(
        'https://dt-platform.example.com/api/v1/bindings',
        json=binding,
        headers={'Content-Type': 'application/json'}
    )
    print(f"导入 {binding['id']}: {response.status_code}")
```

---

### 7.2 查询特定设备的绑定

**按设备查询**:
```python
import json

with open('ModalityBinding_Instances.json', 'r') as f:
    bindings = json.load(f)

device_id = "urn:ngsi-ld:TwinObject:AutoEquipment:361-900A"
device_bindings = [b for b in bindings if b['twinId']['object'] == device_id]

print(f"设备 {device_id} 有 {len(device_bindings)} 个绑定:")
for binding in device_bindings:
    modality = binding['modalityId']['object'].split(':')[-1]
    print(f"  - {modality}")
```

---

### 7.3 查询特定模态的绑定

**按模态查询**:
```python
modality_id = "urn:ngsi-ld:Modality:WeldingCurrent_Auto"
modality_bindings = [b for b in bindings if b['modalityId']['object'] == modality_id]

print(f"模态 {modality_id} 绑定到 {len(modality_bindings)} 台设备:")
for binding in modality_bindings:
    device = binding['twinId']['object'].split(':')[-1]
    print(f"  - {device}")
```

---

## 八、注意事项与最佳实践

### 8.1 占位符替换

⚠️ **重要**: 当前所有的pointRef都是占位符格式，必须在实际部署前替换为真实地址。

**验证方法**:
```bash
# 检查是否还有占位符格式
grep -c "ns=2;s=" ModalityBinding_Instances.json
# 如果返回非0，说明还有占位符需要替换
```

---

### 8.2 版本管理

✓ **推荐实践**:
- 配置变更时创建新版本 (v2, v3, ...)
- 使用changeId追踪变更原因
- 保留历史版本以便回溯

**示例**:
```json
// v1 (初始配置)
{
  "id": "urn:ngsi-ld:ModalityBinding:361-900A:WeldingCurrent:v1",
  "bindingVersion": {"value": "1.0.0"},
  "changeId": {"value": "CHG-INITIAL-SETUP-2025"}
}

// v2 (传感器更换)
{
  "id": "urn:ngsi-ld:ModalityBinding:361-900A:WeldingCurrent:v2",
  "bindingVersion": {"value": "2.0.0"},
  "changeId": {"value": "CHG-2025-03-15-SENSOR-UPGRADE"}
}
```

---

### 8.3 多点采集扩展

对于支持多点采集的模态（如DriveTemp），建议后续扩展:

**当前**: 1个设备 × 1个模态 = 1个绑定  
**扩展后**: 1个设备 × 1个模态 × 8个测点 = 8个绑定

**需要添加的字段**:
- `axis`: 轴标识 (X, Y, Z, A, C等)
- `location`: 位置标识 (Main, Forward, Slave等)
- 更新`id`的Discriminator部分

---

### 8.4 数据质量监控

建议建立数据质量监控机制:

| 监控项 | 检查方法 | 预期结果 |
|-------|---------|---------|
| 连通性 | 定期ping pointRef | 99%以上在线率 |
| 数据更新 | 检查timestamp | 按sampleRate正常更新 |
| 数值范围 | 比对Modality的allowedRange | 95%以上在合理范围内 |
| 异常值 | 统计学方法检测outlier | <1%异常值比例 |

---

## 九、文件清单

| 文件名 | 说明 | 记录数 |
|-------|------|--------|
| `ModalityBinding_Instances.json` | 生成的绑定实例JSON文件 | 352条 |
| `ModalityBinding实例生成说明文档.md` | 本说明文档 | - |

---

## 十、联系与支持

如有任何问题或需要进一步定制，请联系数字孪生架构团队。

**常见问题**:
1. **Q: 为什么没有为所有模态生成绑定?**  
   A: 基于设备类型进行了合理推断。某些模态可能不适用于某些设备类型。

2. **Q: 如何添加新的绑定?**  
   A: 参考现有绑定的格式，按照ID命名规范创建新的JSON对象。

3. **Q: pointRef占位符何时替换?**  
   A: 在实际部署前，与设备供应商确认真实地址后替换。

4. **Q: 是否需要为每个测点创建独立绑定?**  
   A: 推荐。对于多点采集场景(如8个驱动器温度)，应创建8个独立绑定并使用axis/location字段区分。

---

**文档结束**
