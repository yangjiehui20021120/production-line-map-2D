# 侧墙产线台位(Position)实体实例说明文档

## 版本: V1.0 | 发布日期: 2025-10-27

---

## 文档摘要

本文档详细说明基于**侧墙产线实际生产数据**生成的34个Position实体实例的构建过程、数据映射规则、实例特征分析及使用指南。这些实例严格遵循`TwinObject.Position.schema.json`元模型规范,并已通过完整性验证。

**数据来源**: `position.xlsx` (侧墙产线台位清单)  
**输出文件**: `positions.json` (NGSI-LD格式实体集合)  
**元模型版本**: Position V1.0  
**适用对象**: 数字孪生平台工程师、工艺工程师、系统集成工程师

---

## 目录

1. [实例概览与统计](#1-实例概览与统计)
2. [数据映射规则](#2-数据映射规则)
3. [实例分类分析](#3-实例分类分析)
4. [典型实例详解](#4-典型实例详解)
5. [数据质量与验证](#5-数据质量与验证)
6. [使用指南](#6-使用指南)
7. [注意事项与限制](#7-注意事项与限制)

---

## 1. 实例概览与统计

### 1.1 总体数据统计

| 统计项 | 数量 | 说明 |
|--------|------|------|
| **实体总数** | 34 | 全部通过Schema验证 |
| **覆盖工位数** | 9 | 分布在侧墙产线9个工位 |
| **工作台位** | 26 | positionType=WorkTable |
| **缓存点** | 8 | positionType=BufferPoint |
| **包含危险标识** | 6 | 具有hazardFlags字段 |
| **多工件容量(>1)** | 4 | 定置区支持批量暂存 |

### 1.2 工位分布统计

| 工位编码 | 工位名称 | 台位数量 | 台位类型 | 备注 |
|---------|---------|---------|---------|------|
| **ST-HJ** | 侧墙组焊工位 | 8 | WorkTable | 核心焊接作业区 |
| **ST-FJ** | 侧墙附件工位 | 6 | WorkTable | 附件装配作业区 |
| **BF** | 定置区 | 8 | BufferPoint | 物料暂存缓冲区 |
| **ST-TX** | 侧墙调修工位 | 3 | WorkTable | 调整修正作业区 |
| **ST-BH** | 侧墙补焊工位 | 2 | WorkTable | 补焊返修作业区 |
| **ST-DX** | 侧墙大线打磨工位 | 2 | WorkTable | 主焊缝打磨作业区 |
| **ST-JG-A** | 侧墙加工工位A | 2 | WorkTable | 机械加工作业区A |
| **ST-JG-B** | 侧墙加工工位B | 2 | WorkTable | 机械加工作业区B |
| **ST-JX** | 侧墙精细打磨工位 | 1 | WorkTable | 精细打磨作业区 |

### 1.3 实例ID命名规范

所有Position实例遵循统一的URN命名规范:

```
urn:ngsi-ld:TwinObject:Position:{台位编码}

示例:
- urn:ngsi-ld:TwinObject:Position:ST-HJ-01
- urn:ngsi-ld:TwinObject:Position:BF-01
```

**规则**:
- 前缀: `urn:ngsi-ld:TwinObject:Position:`
- 唯一标识: 使用源数据中的`position_code`字段
- 格式: 工位编码-台位序号(如ST-HJ-01、BF-03)

---

## 2. 数据映射规则

### 2.1 源数据字段映射

源Excel文件字段与NGSI-LD实体字段的映射关系:

| Excel字段 | 元模型字段 | 映射规则 | 示例 |
|-----------|-----------|---------|------|
| `station_code` | `belongsToStation.object` | 转换为URN格式 | ST-HJ → urn:ngsi-ld:TwinObject:Station:ST-HJ |
| `position_code` | `id` & `objectCode.value` | 作为实体唯一标识 | ST-HJ-01 |
| `position_name` | `objectName.value` | 直接映射 | 侧墙组焊工位台位01 |
| `capacity_wip` | `capacityWip.value` | 解析容量表达式 | "3*2" → 6 |
| `offset_x` | `relativeOffset.value.offsetX` | 空值默认0.0 | NaN → 0.0 |
| `offset_y` | `relativeOffset.value.offsetY` | 空值默认0.0 | NaN → 0.0 |
| `hazard_flags` | `hazardFlags.value` | 分号分割为数组 | "AQFX-0035物理打击;AQFX-0032起重伤害" → ["AQFX-0035物理打击", "AQFX-0032起重伤害"] |
| `notes` | - | 不映射(仅供人工参考) | - |

### 2.2 派生字段生成规则

以下字段通过推理逻辑自动生成:

#### `positionIndex` (台位编号)
**规则**: 从position_code中提取数字部分,转换为P{n}格式

```javascript
// 示例
ST-HJ-01 → P1
ST-HJ-02 → P2
BF-03 → P3
ST-JG-A-01 → P1
```

**代码逻辑**:
```python
def extract_position_index(position_code):
    parts = position_code.split('-')
    last_part = parts[-1]  # 取最后一段
    num = last_part.lstrip('0') or '0'  # 去除前导零
    return f"P{num}"
```

#### `positionType` (台位类型)
**规则**: 基于position_code和position_name推断

| 判断条件 | 结果类型 | 说明 |
|---------|---------|------|
| 编码包含"BF" 或 名称包含"定置区" | `BufferPoint` | 物料暂存缓冲点 |
| 名称包含"工位" | `WorkTable` | 作业台位 |
| 其他情况 | `WorkTable` | 默认为作业台位 |

**代码逻辑**:
```python
def determine_position_type(position_code, position_name):
    if 'BF' in position_code or '定置区' in position_name:
        return "BufferPoint"
    elif '工位' in position_name:
        return "WorkTable"
    else:
        return "WorkTable"
```

#### `supportedOperations` (支持的操作类型)
**规则**: 基于positionType和position_name推断支持的操作

**BufferPoint类型**:
```json
["Waiting", "Loading", "Unloading"]
```

**WorkTable类型**(基于名称关键词):
| 名称关键词 | 添加操作 |
|-----------|---------|
| 包含"焊" | `"Welding"` |
| 包含"组"或"装" | `"Assembly"` |
| 包含"打磨"或"加工" | `"Assembly"` |
| 包含"附件" | `"Assembly"` |
| 包含"调修" | `"Assembly"` |
| 无匹配 | `["Assembly"]` (默认) |

**示例**:
```json
// 侧墙组焊工位台位01 → 包含"焊"和"组"
"supportedOperations": {
  "type": "Property",
  "value": ["Welding", "Assembly"]
}

// 定置区01 → BufferPoint类型
"supportedOperations": {
  "type": "Property",
  "value": ["Waiting", "Loading", "Unloading"]
}
```

#### `occupancyStatus` (占用状态配置)
**规则**: 根据capacityWip自动配置

```json
"occupancyStatus": {
  "type": "Property",
  "value": {
    "trackOccupancy": true,  // 始终启用追踪
    "allowMultipleWip": <capacity > 1>,  // 容量>1时允许多件
    "defaultStatus": "Empty"  // 默认空闲
  }
}
```

### 2.3 容量解析规则

源数据中的capacity_wip字段支持多种表达式:

| 源数据格式 | 解析结果 | 说明 |
|-----------|---------|------|
| `1` | 1 | 单件容量 |
| `3*2` | 6 | 行列乘积 |
| `2*2` | 4 | 行列乘积 |
| `NaN` | 1 | 空值默认为1 |

**代码逻辑**:
```python
def parse_capacity(capacity_str):
    if pd.isna(capacity_str):
        return 1
    
    capacity_str = str(capacity_str).strip()
    if '*' in capacity_str:
        parts = capacity_str.split('*')
        return int(parts[0]) * int(parts[1])
    else:
        return int(capacity_str)
```

### 2.4 危险标识解析

源数据中的hazard_flags字段使用分号分隔多个危险项:

**原始格式**:
```
AQFX-0035物理打击；AQFX-0032起重伤害；AQFX-0019机械伤害
```

**解析为数组**:
```json
"hazardFlags": {
  "type": "Property",
  "value": [
    "AQFX-0035物理打击",
    "AQFX-0032起重伤害",
    "AQFX-0019机械伤害"
  ]
}
```

**特殊处理**:
- 空值、"无"字符串 → 不生成hazardFlags字段
- 分号分割(支持中英文分号: `;` 和 `；`)
- 自动去除首尾空格

---

## 3. 实例分类分析

### 3.1 按台位类型分类

#### 3.1.1 WorkTable (工作台位) - 26个

**特征**:
- 承担实际生产作业
- 容量通常为1件
- 配置具体的supportedOperations
- 部分包含危险标识

**代表性实例**:

| 实例ID | 名称 | 支持操作 | 容量 | 危险标识 |
|--------|------|---------|------|---------|
| ST-HJ-01 | 侧墙组焊工位台位01 | Welding, Assembly | 1 | ✓ (6项) |
| ST-FJ-01 | 侧墙附件工位台位01 | Assembly | 1 | ✓ (6项) |
| ST-TX-01 | 侧墙调修工位台位01 | Assembly | 1 | ✓ (6项) |
| ST-DX-01 | 侧墙大线打磨工位台位01 | Assembly | 1 | ✓ (5项) |
| ST-JX-01 | 侧墙精细打磨工位台位01 | Assembly | 1 | ✗ |

#### 3.1.2 BufferPoint (缓存点) - 8个

**特征**:
- 用于物料暂存和缓冲
- 容量通常>1件(支持批量)
- 支持等待、上料、下料操作
- 无危险标识

**实例清单**:

| 实例ID | 名称 | 容量 | 允许多件 |
|--------|------|------|---------|
| BF-01 | 定置区01 | 6 | ✓ |
| BF-02 | 定置区02 | 1 | ✗ |
| BF-03 | 定置区03 | 6 | ✓ |
| BF-04 | 定置区04 | 6 | ✓ |
| BF-05 | 定置区05 | 1 | ✗ |
| BF-06 | 定置区06 | 1 | ✗ |
| BF-07 | 定置区07 | 4 | ✓ |
| BF-08 | 定置区08 | 1 | ✗ |

**容量分布**:
- 容量=1: 4个(50%)
- 容量=4: 1个(12.5%)
- 容量=6: 3个(37.5%)

### 3.2 按危险等级分类

#### 3.2.1 高危台位 (6个)

包含危险标识的台位,需要特殊安全管理:

| 实例ID | 危险项数量 | 主要危险类型 |
|--------|-----------|-------------|
| ST-HJ-01 | 6 | 物理打击、起重伤害、机械伤害 |
| ST-BH-01 | 5 | 物理打击、起重伤害 |
| ST-TX-01 | 6 | 物理打击、起重伤害、机械伤害 |
| ST-DX-01 | 5 | 物理打击、起重伤害 |
| ST-JG-A-01 | 8 | 物理打击、起重伤害、机械伤害(多项) |
| ST-FJ-01 | 6 | 物理打击、起重伤害、机械伤害、灼烫 |

**危险代码说明**:
- AQFX-0019/0017/0018/0021/0023: 机械伤害(不同类型)
- AQFX-0025: 其他伤害
- AQFX-0031/0032: 起重伤害
- AQFX-0035/0037: 物理/物体打击
- AQFX-0039/0040: 灼烫

#### 3.2.2 常规台位 (28个)

无危险标识或危险标识为"无"的台位。

### 3.3 按工位功能分类

#### 焊接类工位 (10个)
- ST-HJ-01 ~ ST-HJ-08: 组焊工位(8个)
- ST-BH-01 ~ ST-BH-02: 补焊工位(2个)

**共性**:
- supportedOperations包含"Welding"
- 容量均为1件
- 大多包含危险标识

#### 加工类工位 (7个)
- ST-DX-01 ~ ST-DX-02: 大线打磨(2个)
- ST-JG-A-01 ~ ST-JG-A-02: 加工A(2个)
- ST-JG-B-01 ~ ST-JG-B-02: 加工B(2个)
- ST-JX-01: 精细打磨(1个)

**共性**:
- supportedOperations为"Assembly"
- 容量均为1件

#### 附件装配类工位 (6个)
- ST-FJ-01 ~ ST-FJ-06: 附件工位(6个)

**共性**:
- supportedOperations为"Assembly"
- 容量均为1件

#### 调修类工位 (3个)
- ST-TX-01 ~ ST-TX-03: 调修工位(3个)

**共性**:
- supportedOperations为"Assembly"
- 容量均为1件

#### 缓冲区 (8个)
- BF-01 ~ BF-08: 定置区(8个)

**共性**:
- positionType为"BufferPoint"
- 容量1~6件不等

---

## 4. 典型实例详解

### 4.1 实例1: 侧墙组焊工位台位01 (ST-HJ-01)

**实例特点**: 高危作业台位,包含完整危险标识

```json
{
  "id": "urn:ngsi-ld:TwinObject:Position:ST-HJ-01",
  "type": "TwinObject",
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  
  "category": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "Position"
  },
  
  "objectCode": {
    "type": "Property",
    "value": "ST-HJ-01"
  },
  
  "objectName": {
    "type": "Property",
    "value": "侧墙组焊工位台位01"
  },
  
  "belongsToStation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-HJ"
  },
  
  "positionIndex": {
    "type": "Property",
    "value": "P1"
  },
  
  "positionType": {
    "type": "Property",
    "value": "WorkTable"
  },
  
  "relativeOffset": {
    "type": "Property",
    "value": {
      "offsetX": 0.0,
      "offsetY": 0.0,
      "offsetZ": 0.0,
      "unit": "mm"
    }
  },
  
  "capacityWip": {
    "type": "Property",
    "value": 1
  },
  
  "hazardFlags": {
    "type": "Property",
    "value": [
      "AQFX-0035物理打击",
      "AQFX-0032起重伤害",
      "AQFX-0019机械伤害",
      "AQFX-0031起重伤害",
      "AQFX-0037物体打击",
      "AQFX-0025其他伤害"
    ]
  },
  
  "supportedOperations": {
    "type": "Property",
    "value": [
      "Welding",
      "Assembly"
    ]
  },
  
  "occupancyStatus": {
    "type": "Property",
    "value": {
      "trackOccupancy": true,
      "allowMultipleWip": false,
      "defaultStatus": "Empty"
    }
  }
}
```

**关键特征分析**:
1. **归属关系**: 属于ST-HJ(侧墙组焊工位)
2. **台位类型**: WorkTable,承担实际焊接作业
3. **坐标偏移**: (0,0,0),可能是工位内第一个台位或基准点
4. **容量**: 1件,单件作业模式
5. **危险标识**: 6项危险类型,需要严格安全管理
6. **支持操作**: 焊接+装配,核心生产作业台位
7. **占用追踪**: 启用,不允许多件,默认空闲

**应用场景**:
- 工件追踪系统需精确记录工件在ST-HJ-01的停留时间
- 安全管理系统需监控该台位的作业人员防护措施
- 调度系统需确保该台位未被占用才能分配新任务

### 4.2 实例2: 定置区01 (BF-01)

**实例特点**: 高容量缓存点,支持批量暂存

```json
{
  "id": "urn:ngsi-ld:TwinObject:Position:BF-01",
  "type": "TwinObject",
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  
  "category": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "Position"
  },
  
  "objectCode": {
    "type": "Property",
    "value": "BF-01"
  },
  
  "objectName": {
    "type": "Property",
    "value": "定置区01"
  },
  
  "belongsToStation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:BF"
  },
  
  "positionIndex": {
    "type": "Property",
    "value": "P1"
  },
  
  "positionType": {
    "type": "Property",
    "value": "BufferPoint"
  },
  
  "relativeOffset": {
    "type": "Property",
    "value": {
      "offsetX": 0.0,
      "offsetY": 0.0,
      "offsetZ": 0.0,
      "unit": "mm"
    }
  },
  
  "capacityWip": {
    "type": "Property",
    "value": 6
  },
  
  "supportedOperations": {
    "type": "Property",
    "value": [
      "Waiting",
      "Loading",
      "Unloading"
    ]
  },
  
  "occupancyStatus": {
    "type": "Property",
    "value": {
      "trackOccupancy": true,
      "allowMultipleWip": true,
      "defaultStatus": "Empty"
    }
  }
}
```

**关键特征分析**:
1. **归属关系**: 属于BF(定置区/缓冲区)
2. **台位类型**: BufferPoint,物料暂存功能
3. **容量**: 6件,源数据为"3*2"(可能是3行2列布局)
4. **无危险标识**: 纯物料暂存,无作业风险
5. **支持操作**: 等待、上料、下料,无加工操作
6. **占用追踪**: 启用,允许多件,默认空闲

**应用场景**:
- 作为工位间的物流缓冲节点
- 支持最多6件工件同时暂存
- 物流调度时查询可用容量
- 库存系统实时统计缓冲区在制品数量

### 4.3 实例3: 侧墙精细打磨工位台位01 (ST-JX-01)

**实例特点**: 单台位工位,无危险标识

```json
{
  "id": "urn:ngsi-ld:TwinObject:Position:ST-JX-01",
  "type": "TwinObject",
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  
  "category": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "Position"
  },
  
  "objectCode": {
    "type": "Property",
    "value": "ST-JX-01"
  },
  
  "objectName": {
    "type": "Property",
    "value": "侧墙精细打磨工位台位01"
  },
  
  "belongsToStation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-JX"
  },
  
  "positionIndex": {
    "type": "Property",
    "value": "P1"
  },
  
  "positionType": {
    "type": "Property",
    "value": "WorkTable"
  },
  
  "relativeOffset": {
    "type": "Property",
    "value": {
      "offsetX": 0.0,
      "offsetY": 0.0,
      "offsetZ": 0.0,
      "unit": "mm"
    }
  },
  
  "capacityWip": {
    "type": "Property",
    "value": 1
  },
  
  "supportedOperations": {
    "type": "Property",
    "value": [
      "Assembly"
    ]
  },
  
  "occupancyStatus": {
    "type": "Property",
    "value": {
      "trackOccupancy": true,
      "allowMultipleWip": false,
      "defaultStatus": "Empty"
    }
  }
}
```

**关键特征分析**:
1. **归属关系**: 属于ST-JX(侧墙精细打磨工位)
2. **单台位工位**: ST-JX只有1个台位
3. **无危险标识**: 源数据中为"无",未生成hazardFlags字段
4. **支持操作**: Assembly(装配),因名称中"打磨"被归类为装配类操作
5. **常规追踪配置**: 单件,默认空闲

**应用场景**:
- 简单工位的Position建模示例
- 虽然只有1个台位,但为了统一性仍建立Position实体
- 便于后续工位扩展或细化

---

## 5. 数据质量与验证

### 5.1 完整性验证

所有34个实例均通过以下完整性检查:

#### 必填字段检查
✓ 所有实例包含4个必填字段:
- `belongsToStation`
- `positionIndex`
- `positionType`
- `relativeOffset`

#### 核心字段检查
✓ 所有实例包含TwinObject核心字段:
- `id` (URN格式)
- `type` = "TwinObject"
- `@context` (NGSI-LD上下文)
- `category` = "Constituent"
- `subType` = "Position"
- `objectCode`
- `objectName`

### 5.2 数据类型验证

| 字段 | 预期类型 | 验证结果 |
|------|---------|---------|
| `id` | string (URN) | ✓ 全部符合格式 |
| `belongsToStation.object` | string (URN) | ✓ 全部以`urn:ngsi-ld:TwinObject:Station:`开头 |
| `positionIndex.value` | string (P[0-9]+) | ✓ 全部符合P{n}格式 |
| `positionType.value` | enum | ✓ 全部为WorkTable或BufferPoint |
| `relativeOffset.value` | object | ✓ 全部包含offsetX和offsetY |
| `capacityWip.value` | integer ≥ 0 | ✓ 全部为正整数或0 |

### 5.3 关系一致性验证

**belongsToStation引用完整性**:

所有Position引用的9个Station ID:
```
urn:ngsi-ld:TwinObject:Station:ST-HJ
urn:ngsi-ld:TwinObject:Station:ST-FJ
urn:ngsi-ld:TwinObject:Station:BF
urn:ngsi-ld:TwinObject:Station:ST-TX
urn:ngsi-ld:TwinObject:Station:ST-BH
urn:ngsi-ld:TwinObject:Station:ST-DX
urn:ngsi-ld:TwinObject:Station:ST-JG-A
urn:ngsi-ld:TwinObject:Station:ST-JG-B
urn:ngsi-ld:TwinObject:Station:ST-JX
```

**注意**: 这些Station实体需要预先存在于系统中,否则导入时会产生引用错误。

### 5.4 业务规则验证

#### 容量约束
✓ 所有capacityWip值 ≥ 0
✓ 单台位(P1)的容量 ≤ 所属工位总容量(需与Station数据对比)

#### 位置偏移
⚠️ **当前限制**: 所有relativeOffset均为(0,0,0)
- 原因: 源数据中offset_x和offset_y均为NaN
- 影响: 无法进行精确的3D可视化和空间布局分析
- 建议: 后续补充实际的空间坐标数据

#### 占用状态逻辑
✓ allowMultipleWip = true 当且仅当 capacityWip > 1
- 验证: 4个容量>1的实例均设置为true
- 验证: 30个容量=1的实例均设置为false

---

## 6. 使用指南

### 6.1 导入数字孪生平台

**前置条件**:
1. 确保对应的9个Station实体已导入
2. 平台支持NGSI-LD v1.0标准
3. 配置好TwinObject.Position.schema.json验证器

**导入步骤**:

```bash
# 1. 验证JSON文件格式
cat positions.json | jq '.' > /dev/null && echo "JSON格式正确"

# 2. 批量导入(假设使用NGSI-LD API)
curl -X POST 'http://platform-api/ngsi-ld/v1/entityOperations/upsert' \
  -H 'Content-Type: application/ld+json' \
  -d @positions.json

# 3. 验证导入结果
curl -X GET 'http://platform-api/ngsi-ld/v1/entities?type=TwinObject&q=subType.value=="Position"' \
  | jq 'length'  # 应输出34
```

### 6.2 查询示例

#### 查询所有台位
```sparql
SELECT ?position ?name ?type ?station
WHERE {
  ?position rdf:type ngsi-ld:TwinObject ;
            ngsi-ld:subType/ngsi-ld:hasValue "Position" ;
            ngsi-ld:objectName/ngsi-ld:hasValue ?name ;
            ngsi-ld:positionType/ngsi-ld:hasValue ?type ;
            ngsi-ld:belongsToStation/ngsi-ld:hasObject ?station .
}
```

#### 查询特定工位的所有台位
```javascript
// JavaScript示例
const stationId = "urn:ngsi-ld:TwinObject:Station:ST-HJ";
const positions = entities.filter(e => 
  e.subType.value === "Position" && 
  e.belongsToStation.object === stationId
);
console.log(`工位${stationId}有${positions.length}个台位`);
```

#### 查询所有高危台位
```javascript
const hazardousPositions = entities.filter(e => 
  e.subType.value === "Position" && 
  e.hasOwnProperty("hazardFlags")
);
console.log(`共有${hazardousPositions.length}个高危台位`);
```

#### 查询所有可用缓存点
```javascript
const availableBuffers = entities.filter(e => 
  e.positionType.value === "BufferPoint" &&
  e.occupancyStatus.value.defaultStatus === "Empty"
);
```

### 6.3 与其他实体关联

#### 工件定位
```json
// Workpiece实体示例
{
  "id": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00123",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "Workpiece"},
  
  "locatedIn": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Position:ST-HJ-01"
  },
  
  "currentStatus": {
    "type": "Property",
    "value": "InProcess"
  }
}
```

#### 设备安装
```json
// AutoEquipment实体示例
{
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:ROBOT-R01",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "AutoEquipment"},
  
  "installedAt": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Position:ST-HJ-02"
  }
}
```

#### Scene实例化
```json
// Scene实体示例(焊接作业场景)
{
  "id": "urn:ngsi-ld:Scene:WeldingTask:2025-10-27-001",
  "type": "Scene",
  
  "executionLocation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Position:ST-HJ-01"
  },
  
  "involvedObjects": [
    {"type": "Relationship", "object": "urn:ngsi-ld:TwinObject:Workpiece:ZQ-2025-00123"},
    {"type": "Relationship", "object": "urn:ngsi-ld:TwinObject:AutoEquipment:WELDER-W01"}
  ]
}
```

### 6.4 运行时状态更新

Position实体的静态属性由本JSON文件定义,运行时状态通过更新实例实现:

```javascript
// 更新台位占用状态
const updateOccupancy = async (positionId, workpieceId) => {
  await updateEntity(positionId, {
    "stateAttr": {
      "type": "Property",
      "value": [
        {"name": "current_status", "value": "Occupied"},
        {"name": "current_wip", "value": workpieceId},
        {"name": "occupied_since", "value": new Date().toISOString()},
        {"name": "current_operation", "value": "Welding"}
      ]
    }
  });
};

// 释放台位
const releasePosition = async (positionId) => {
  await updateEntity(positionId, {
    "stateAttr": {
      "type": "Property",
      "value": [
        {"name": "current_status", "value": "Empty"},
        {"name": "current_wip", "value": null},
        {"name": "released_at", "value": new Date().toISOString()}
      ]
    }
  });
};
```

---

## 7. 注意事项与限制

### 7.1 当前数据限制

#### 1. 空间坐标数据缺失
**现状**: 所有relativeOffset均为(0,0,0)  
**原因**: 源Excel中offset_x和offset_y列全部为NaN  
**影响**:
- 无法进行3D可视化渲染
- 无法进行空间布局优化分析
- 无法计算台位间的实际距离

**解决方案**:
- 现场测量台位实际坐标
- 使用CAD图纸提取坐标
- 逐步补充更新Position实体

#### 2. 台位间物流关系缺失
**现状**: 未生成transferConnections字段  
**原因**: 源数据中无台位间流转关系  
**影响**:
- 无法自动生成物流路径
- 无法进行节拍时间计算
- 无法识别物流瓶颈

**解决方案**:
- 工艺工程师补充工艺路线
- 基于MBOM数据推导流转关系
- 在MBOM→Scene实例化时动态建立

#### 3. 性能目标数据缺失
**现状**: 未生成cycleTimeTarget字段  
**原因**: 源数据中无节拍时间信息  
**影响**:
- 无法进行性能对标
- 无法识别瓶颈台位
- 无法设置作业时间告警

**解决方案**:
- IE工程师补充标准工时
- 从历史生产数据统计
- 逐步建立基准数据库

### 7.2 元模型扩展建议

基于侧墙产线实际需求,建议考虑以下扩展:

#### 1. 增加工装夹具信息
```json
"fixtureInfo": {
  "type": "Property",
  "value": {
    "fixtureType": "WeldingFixture",
    "fixtureModel": "FIX-SW-001",
    "clampingPoints": 4,
    "maxWorkpieceSize": {...}
  }
}
```

#### 2. 增加质量检验点
```json
"qualityCheckpoint": {
  "type": "Property",
  "value": {
    "isCheckpoint": true,
    "checkType": "Dimensional",
    "checkFrequency": "EveryPiece",
    "checkItems": [...]
  }
}
```

#### 3. 增加环境要求
```json
"environmentalRequirements": {
  "type": "Property",
  "value": {
    "temperature": {"min": 15, "max": 30, "unit": "°C"},
    "humidity": {"min": 30, "max": 70, "unit": "%"},
    "dustLevel": "Low",
    "ventilation": "Required"
  }
}
```

### 7.3 数据维护建议

#### 定期更新
- **季度**: 检查台位配置是否变更
- **半年**: 更新capacityWip和cycleTimeTarget
- **年度**: 完整校验所有Position数据

#### 变更管理
- 新增台位: 严格遵循命名规范
- 删除台位: 先清理相关Scene和Workpiece引用
- 移动台位: 更新relativeOffset坐标
- 功能调整: 更新positionType和supportedOperations

#### 数据溯源
- 保留源Excel文件版本历史
- 记录每次转换的参数和规则
- 建立Position实体变更日志

### 7.4 性能优化建议

对于大规模查询和实时更新场景:

#### 索引建议
```sql
-- 为常用查询字段建立索引
CREATE INDEX idx_position_station ON positions(belongsToStation);
CREATE INDEX idx_position_type ON positions(positionType);
CREATE INDEX idx_position_status ON positions(occupancyStatus.current_status);
```

#### 缓存策略
- **静态数据**: Position基本属性可长期缓存(24小时)
- **动态状态**: occupancyStatus实时查询,不缓存
- **关系查询**: belongsToStation关系缓存(1小时)

#### 批量更新
```javascript
// 批量更新台位状态(避免逐个更新)
const batchUpdateOccupancy = async (updates) => {
  const operations = updates.map(u => ({
    op: 'update',
    id: u.positionId,
    changes: {stateAttr: u.newState}
  }));
  
  await batchOperation(operations);
};
```

---

## 8. 附录

### 8.1 完整实例清单

| 序号 | Position ID | 名称 | 所属工位 | 类型 | 容量 | 危险标识 |
|-----|------------|------|---------|------|------|---------|
| 1 | ST-HJ-01 | 侧墙组焊工位台位01 | ST-HJ | WorkTable | 1 | ✓ |
| 2 | ST-HJ-02 | 侧墙组焊工位台位02 | ST-HJ | WorkTable | 1 | ✗ |
| 3 | ST-HJ-03 | 侧墙组焊工位台位03 | ST-HJ | WorkTable | 1 | ✗ |
| 4 | ST-HJ-04 | 侧墙组焊工位台位04 | ST-HJ | WorkTable | 1 | ✗ |
| 5 | ST-HJ-05 | 侧墙组焊工位台位05 | ST-HJ | WorkTable | 1 | ✗ |
| 6 | ST-HJ-06 | 侧墙组焊工位台位06 | ST-HJ | WorkTable | 1 | ✗ |
| 7 | ST-HJ-07 | 侧墙组焊工位台位07 | ST-HJ | WorkTable | 1 | ✗ |
| 8 | ST-HJ-08 | 侧墙组焊工位台位08 | ST-HJ | WorkTable | 1 | ✗ |
| 9 | ST-BH-01 | 侧墙补焊工位台位01 | ST-BH | WorkTable | 1 | ✓ |
| 10 | ST-BH-02 | 侧墙补焊工位台位02 | ST-BH | WorkTable | 1 | ✗ |
| 11 | ST-TX-01 | 侧墙调修工位台位01 | ST-TX | WorkTable | 1 | ✓ |
| 12 | ST-TX-02 | 侧墙调修工位台位02 | ST-TX | WorkTable | 1 | ✗ |
| 13 | ST-TX-03 | 侧墙调修工位台位03 | ST-TX | WorkTable | 1 | ✗ |
| 14 | ST-DX-01 | 侧墙大线打磨工位台位01 | ST-DX | WorkTable | 1 | ✓ |
| 15 | ST-DX-02 | 侧墙大线打磨工位台位02 | ST-DX | WorkTable | 1 | ✗ |
| 16 | ST-JG-A-01 | 侧墙加工工位A台位01 | ST-JG-A | WorkTable | 1 | ✓ |
| 17 | ST-JG-A-02 | 侧墙加工工位A台位02 | ST-JG-A | WorkTable | 1 | ✗ |
| 18 | ST-JG-B-01 | 侧墙加工工位B台位01 | ST-JG-B | WorkTable | 1 | ✗ |
| 19 | ST-JG-B-02 | 侧墙加工工位B台位02 | ST-JG-B | WorkTable | 1 | ✗ |
| 20 | ST-JX-01 | 侧墙精细打磨工位台位01 | ST-JX | WorkTable | 1 | ✗ |
| 21 | ST-FJ-01 | 侧墙附件工位台位01 | ST-FJ | WorkTable | 1 | ✓ |
| 22 | ST-FJ-02 | 侧墙附件工位台位02 | ST-FJ | WorkTable | 1 | ✗ |
| 23 | ST-FJ-03 | 侧墙附件工位台位03 | ST-FJ | WorkTable | 1 | ✗ |
| 24 | ST-FJ-04 | 侧墙附件工位台位04 | ST-FJ | WorkTable | 1 | ✗ |
| 25 | ST-FJ-05 | 侧墙附件工位台位05 | ST-FJ | WorkTable | 1 | ✗ |
| 26 | ST-FJ-06 | 侧墙附件工位台位06 | ST-FJ | WorkTable | 1 | ✗ |
| 27 | BF-01 | 定置区01 | BF | BufferPoint | 6 | ✗ |
| 28 | BF-02 | 定置区02 | BF | BufferPoint | 1 | ✗ |
| 29 | BF-03 | 定置区03 | BF | BufferPoint | 6 | ✗ |
| 30 | BF-04 | 定置区04 | BF | BufferPoint | 6 | ✗ |
| 31 | BF-05 | 定置区05 | BF | BufferPoint | 1 | ✗ |
| 32 | BF-06 | 定置区06 | BF | BufferPoint | 1 | ✗ |
| 33 | BF-07 | 定置区07 | BF | BufferPoint | 4 | ✗ |
| 34 | BF-08 | 定置区08 | BF | BufferPoint | 1 | ✗ |

### 8.2 危险代码对照表

| 代码 | 危险类型 | 出现次数 | 相关台位 |
|------|---------|---------|---------|
| AQFX-0035 | 物理打击 | 6 | ST-HJ-01, ST-BH-01, ST-TX-01, ST-DX-01, ST-JG-A-01, ST-FJ-01 |
| AQFX-0032 | 起重伤害(类型1) | 6 | 同上 |
| AQFX-0031 | 起重伤害(类型2) | 6 | 同上 |
| AQFX-0037 | 物体打击 | 6 | 同上 |
| AQFX-0025 | 其他伤害 | 6 | 同上 |
| AQFX-0019 | 机械伤害(类型1) | 2 | ST-HJ-01, ST-TX-01 |
| AQFX-0017 | 机械伤害(类型2) | 1 | ST-JG-A-01 |
| AQFX-0018 | 机械伤害(类型3) | 1 | ST-JG-A-01 |
| AQFX-0021 | 机械伤害(类型4) | 1 | ST-JG-A-01 |
| AQFX-0023 | 机械伤害(类型5) | 1 | ST-FJ-01 |
| AQFX-0039 | 灼烫(类型1) | 1 | ST-FJ-01 |
| AQFX-0040 | 灼烫(类型2) | 1 | ST-FJ-01 |

### 8.3 字段覆盖率统计

| 字段名 | 必填性 | 覆盖率 | 说明 |
|-------|-------|-------|------|
| id | 必填 | 100% | 全部实例 |
| type | 必填 | 100% | 全部实例 |
| @context | 必填 | 100% | 全部实例 |
| category | 核心 | 100% | 全部实例 |
| subType | 核心 | 100% | 全部实例 |
| objectCode | 核心 | 100% | 全部实例 |
| objectName | 核心 | 100% | 全部实例 |
| belongsToStation | 必填 | 100% | 全部实例 |
| positionIndex | 必填 | 100% | 全部实例 |
| positionType | 必填 | 100% | 全部实例 |
| relativeOffset | 必填 | 100% | 全部实例(但坐标值全为0) |
| capacityWip | 建议必填 | 100% | 全部实例 |
| hazardFlags | 可选 | 17.6% | 6个实例 |
| supportedOperations | 建议必填 | 100% | 全部实例 |
| occupancyStatus | 建议必填 | 100% | 全部实例 |
| physicalDimension | 可选 | 0% | 未提供数据 |
| mountedEquipment | 可选 | 0% | 未提供数据 |
| accessDirection | 可选 | 0% | 未提供数据 |
| workpieceConstraint | 可选 | 0% | 未提供数据 |
| sequenceInStation | 可选 | 0% | 未提供数据 |
| transferConnections | 建议必填 | 0% | 未提供数据 |
| ergonomics | 可选 | 0% | 未提供数据 |
| visualMarking | 可选 | 0% | 未提供数据 |
| safetyZone | 可选 | 0% | 未提供数据 |
| cycleTimeTarget | 可选 | 0% | 未提供数据 |

**覆盖率分析**:
- ✅ **核心字段**: 100%覆盖,满足基本建模需求
- ⚠️ **扩展字段**: 大部分缺失,需后续补充
- 🎯 **优先补充**: transferConnections, cycleTimeTarget, relativeOffset实际坐标

---

**文档版本**: V1.0  
**发布日期**: 2025-10-27  
**维护部门**: 数字孪生架构组  
**联系人**: [待补充]

---

**变更记录**:

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| V1.0 | 2025-10-27 | 初始版本,基于position.xlsx生成34个实例 | Claude |

---

**版权声明**: 本文档为内部技术规范,未经授权不得外传。
