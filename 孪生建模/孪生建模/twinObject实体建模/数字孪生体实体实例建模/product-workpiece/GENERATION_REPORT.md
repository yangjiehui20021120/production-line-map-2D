# 数字孪生实体实例生成报告

## 执行日期
2025-10-28

## 生成概要

本次任务成功生成了**11个JSON文件**,包含:
- **1个** `products.json` 文件 (包含10个Product实例)
- **10个** `workpiece_chain_*.json` 文件 (每个包含完整的Workpiece追溯链)

---

## 文件清单

### 1. products.json
- **路径**: `/mnt/user-data/outputs/products.json`
- **大小**: 8.7KB
- **内容**: 10个Product实体实例 (JSON数组)
- **产品分布**:
  - M670型号: 5个产品 (M670-SN001 至 M670-SN005)
  - M803型号: 5个产品 (M803-SN001 至 M803-SN005)

### 2. Workpiece追溯链文件 (10个)

每个文件对应一个最终产品的完整在制品追溯链:

| 文件名 | 大小 | Workpiece数量 | 对应Product |
|--------|------|--------------|-------------|
| workpiece_chain_M670-SN001.json | 65KB | 38 | M670-SN001 |
| workpiece_chain_M670-SN002.json | 65KB | 38 | M670-SN002 |
| workpiece_chain_M670-SN003.json | 65KB | 38 | M670-SN003 |
| workpiece_chain_M670-SN004.json | 65KB | 38 | M670-SN004 |
| workpiece_chain_M670-SN005.json | 65KB | 38 | M670-SN005 |
| workpiece_chain_M803-SN001.json | 66KB | 38 | M803-SN001 |
| workpiece_chain_M803-SN002.json | 66KB | 38 | M803-SN002 |
| workpiece_chain_M803-SN003.json | 66KB | 38 | M803-SN003 |
| workpiece_chain_M803-SN004.json | 66KB | 38 | M803-SN004 |
| workpiece_chain_M803-SN005.json | 66KB | 38 | M803-SN005 |

**总计**: 380个Workpiece实例 (38个 × 10个产品)

---

## Product实体结构说明

### 核心字段
每个Product实例包含以下关键字段:

```json
{
  "@context": [...],
  "id": "urn:ngsi-ld:TwinObject:Product:M670-SN001",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "Product"},
  "twinType": {"type": "Property", "value": "Transitional"},
  "name": {"type": "Property", "value": "侧墙组成-M670-SN001"},
  "productType": {"type": "Property", "value": "Assembly"},
  "productModel": {"type": "Property", "value": "M000004670327"},
  "qualityStatus": {"type": "Property", "value": "Qualified"},
  "originatingWorkpiece": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Workpiece:M670-SN001-T11-Output"
  }
}
```

### 字段说明
- **id**: Product的唯一标识符
- **name**: 人类可读的产品名称
- **productType**: 产品类型 (统一为"Assembly"总成)
- **productModel**: 产品型号 (M000004670327或M000004803474)
- **qualityStatus**: 质量状态 (统一为"Qualified"合格)
- **originatingWorkpiece**: 指向追溯链中的最后一个Workpiece (即完工态)

---

## Workpiece实体结构说明

### 核心字段
每个Workpiece实例包含以下关键字段:

```json
{
  "@context": [...],
  "id": "urn:ngsi-ld:TwinObject:Workpiece:M670-SN001-T03-P0010-Output",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "Workpiece"},
  "twinType": {"type": "Property", "value": "Transitional"},
  "name": {"type": "Property", "value": "侧墙组成-M670-SN001-T03-P0010"},
  "basedOnMBOM": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:MBOM:M000004670327:T03-P0010"
  },
  "mbomItemId": {"type": "Property", "value": "item_T03_P0010"},
  "finalProductId": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Product:M670-SN001"
  },
  "granularityLevel": {"type": "Property", "value": "Process"},
  "granularityContext": {
    "type": "Property",
    "value": {
      "routeCode": "ROUTE_M000004670327",
      "mbomNode": "T03-P0010"
    }
  },
  "createdByScene": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Scene:Scene_M670-SN001-T03-P0010_T03-P0010"
  },
  "creationTimestamp": {"type": "Property", "value": "2025-10-29T02:00:00Z"},
  "completionRate": {"type": "Property", "value": 26},
  "processStatus": {"type": "Property", "value": "InProgress"},
  "predecessorWorkpiece": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Workpiece:M670-SN001-T02-Output"
  },
  "successorWorkpiece": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Workpiece:M670-SN001-T03-P0020-Output"
  }
}
```

### 关键字段说明

#### 1. 基础标识
- **id**: Workpiece的唯一标识符,包含产品序列号和MBOM节点信息
- **name**: 人类可读的在制品名称

#### 2. MBOM关联 (必填)
- **basedOnMBOM**: 关联的MBOM节点URN
- **mbomItemId**: MBOM项目ID (从节点编码生成)

#### 3. 追溯链关系 (核心!)
- **finalProductId**: 指向最终产品 (所有追溯链成员共享同一个Product ID)
- **predecessorWorkpiece**: 指向前一个Workpiece (第1个为null)
- **successorWorkpiece**: 指向下一个Workpiece (最后一个为null)

#### 4. 工艺颗粒度
- **granularityLevel**: 颗粒度级别
  - "Process": 工序级 (如T01-P0010)
  - "Takt": 节拍级 (如T01)
- **granularityContext**: 颗粒度上下文,包含路线代码和MBOM节点

#### 5. 场景关联
- **createdByScene**: 创建此Workpiece的Scene (场景)实例

#### 6. 状态信息
- **creationTimestamp**: 创建时间戳 (模拟生产时间序列)
- **completionRate**: 完成度百分比 (0-100)
  - 计算公式: `(当前位置索引 + 1) × 100 / 总追溯链长度`
  - 示例: 38个Workpiece的追溯链中,第10个的完成度为 26%
- **processStatus**: 加工状态
  - "InProgress": 进行中 (completionRate < 100%)
  - "Completed": 已完成 (completionRate = 100%, 即最后一个)

---

## 追溯链设计

### 链式结构
每个产品的Workpiece追溯链是一个**单向链表**结构:

```
第1个 Workpiece (T01-P0010)
  ↓ predecessorWorkpiece = null
  ↓ successorWorkpiece = 第2个
第2个 Workpiece (T01-P0020)
  ↓ predecessorWorkpiece = 第1个
  ↓ successorWorkpiece = 第3个
第3个 Workpiece (T01-P0030)
  ↓ predecessorWorkpiece = 第2个
  ↓ successorWorkpiece = 第4个
...
最后 Workpiece (T11-Output)
  ↓ predecessorWorkpiece = 倒数第2个
  ↓ successorWorkpiece = null
```

### 验证结果
✓ 第1个Workpiece没有前驱 (predecessorWorkpiece不存在)
✓ 最后一个Workpiece没有后继 (successorWorkpiece不存在)
✓ 中间所有Workpiece都有前驱和后继
✓ 所有Workpiece的finalProductId都指向同一个Product

---

## 工艺节点结构 (M670和M803通用)

每个产品的追溯链包含11个Takt(节拍)和38个工艺节点:

### Takt节拍分布
- **T01**: 4个节点 (P0010, P0020, P0030, T01总成)
- **T02**: 5个节点 (P0010, P0020, P0030, P0040, T02总成)
- **T03**: 3个节点 (P0010, P0020, T03总成)
- **T04**: 3个节点 (P0010, P0020, T04总成)
- **T05**: 3个节点 (P0010, P0020, T05总成)
- **T06**: 3个节点 (P0010, P0020, T06总成)
- **T07**: 2个节点 (P0010, T07总成)
- **T08**: 6个节点 (P0010, P0020, P0030, P0040, P0050, T08总成)
- **T09**: 3个节点 (P0010, P0020, T09总成)
- **T10**: 3个节点 (P0010, P0020, T10总成)
- **T11**: 3个节点 (P0010, P0020, T11总成)

**总计**: 38个Workpiece节点

---

## 数据规范遵循情况

### Product Schema遵循 ✓
- ✓ 所有必填字段已填充 (productType, productModel, qualityStatus)
- ✓ @context使用标准NGSI-LD格式
- ✓ subType固定为"Product"
- ✓ twinType固定为"Transitional"
- ✓ originatingWorkpiece正确指向最后一个Workpiece

### Workpiece Schema遵循 ✓
- ✓ 所有必填字段已填充 (finalProductId, basedOnMBOM, mbomItemId, granularityLevel, granularityContext, createdByScene, creationTimestamp, completionRate, processStatus)
- ✓ @context使用标准NGSI-LD格式
- ✓ subType固定为"Workpiece"
- ✓ twinType固定为"Transitional"
- ✓ 前驱/后继关系正确构建
- ✓ finalProductId一致性验证通过

---

## 文件访问

所有生成的文件位于: `/mnt/user-data/outputs/`

### 下载链接
- [products.json](computer:///mnt/user-data/outputs/products.json)
- [workpiece_chain_M670-SN001.json](computer:///mnt/user-data/outputs/workpiece_chain_M670-SN001.json)
- [workpiece_chain_M670-SN002.json](computer:///mnt/user-data/outputs/workpiece_chain_M670-SN002.json)
- [workpiece_chain_M670-SN003.json](computer:///mnt/user-data/outputs/workpiece_chain_M670-SN003.json)
- [workpiece_chain_M670-SN004.json](computer:///mnt/user-data/outputs/workpiece_chain_M670-SN004.json)
- [workpiece_chain_M670-SN005.json](computer:///mnt/user-data/outputs/workpiece_chain_M670-SN005.json)
- [workpiece_chain_M803-SN001.json](computer:///mnt/user-data/outputs/workpiece_chain_M803-SN001.json)
- [workpiece_chain_M803-SN002.json](computer:///mnt/user-data/outputs/workpiece_chain_M803-SN002.json)
- [workpiece_chain_M803-SN003.json](computer:///mnt/user-data/outputs/workpiece_chain_M803-SN003.json)
- [workpiece_chain_M803-SN004.json](computer:///mnt/user-data/outputs/workpiece_chain_M803-SN004.json)
- [workpiece_chain_M803-SN005.json](computer:///mnt/user-data/outputs/workpiece_chain_M803-SN005.json)

---

## 生成统计

| 类型 | 数量 | 文件数 |
|------|------|--------|
| Product实例 | 10 | 1 |
| Workpiece实例 | 380 (38×10) | 10 |
| **总计** | **390** | **11** |

---

## 质量验证

### ✓ 结构验证
- JSON格式正确,可解析
- 所有必填字段已填充
- 字段类型符合Schema定义

### ✓ 关系验证
- Product的originatingWorkpiece指向正确
- Workpiece的finalProductId一致性
- 追溯链的前驱/后继关系完整

### ✓ 数据一致性
- MBOM节点编码提取正确
- 产品型号映射准确
- 时间戳序列合理

---

## 使用建议

### 1. 导入数据库
这些JSON文件可直接导入支持NGSI-LD格式的数字孪生平台或图数据库。

### 2. 追溯查询示例
```javascript
// 查询某个产品的完整追溯链
// 从finalProductId反向查询所有Workpiece

// 正向遍历追溯链
// 从第一个Workpiece开始,通过successorWorkpiece递归访问

// 反向遍历追溯链
// 从最后一个Workpiece开始,通过predecessorWorkpiece递归访问
```

### 3. 数据扩展
如需添加更多字段 (如质量检查点、物料谱系等),可在现有结构基础上扩展。

---

**生成时间**: 2025-10-28 09:32 UTC
**生成工具**: 数字孪生实体实例生成器 v1.0
**符合规范**: Product Schema v1.0, Workpiece Schema v1.0
