# NGSI-LD 兼容性分析报告

## 📋 执行摘要

**结论**: 当前项目中的实体**不符合**NGSI-LD契约规范。

项目目前使用的是简单的JavaScript对象结构，缺少NGSI-LD规范要求的核心元素（@context、@type、@id等）。

---

## 🔍 当前实体结构分析

### 1. 工位实体 (Workstation)

**当前格式**:
```javascript
{
  id: 'ST-GZ-02',
  name: '组焊台位2',
  x: 60,
  y: 80,
  type: 'process',
  processGroup: '组焊工序区',
  stdCT: 120,
  metrics: {
    ct: 135,
    fpy: 91.5,
    oee: 85.2,
    wip: 3,
    status: 'running'
  }
}
```

**问题**:
- ❌ 缺少 `@context` (JSON-LD上下文)
- ❌ 缺少 `@type` (实体类型URI)
- ❌ 缺少 `@id` (唯一标识符URI)
- ❌ 属性未使用Property类型
- ❌ 关系未使用Relationship类型

### 2. 设备实体 (Equipment)

**当前格式**:
```javascript
{
  id: 'WR-01',
  name: '焊接机器人1',
  type: 'welding_robot',
  processArea: '组焊工序区',
  x: 80,
  y: 100,
  oee: 85.5,
  status: 'running'
}
```

**问题**: 同工位实体，缺少NGSI-LD必需字段

### 3. 订单实体 (Order)

**当前格式**:
```javascript
{
  id: 'SW-2024-001',
  productName: 'CRH380D侧墙-左侧',
  specification: '3200×2800×150mm',
  currentStation: 'ST-GZ-02',
  currentStationName: '组焊台位2',
  progress: 35,
  completedProcesses: ['下料', '预处理', '组焊'],
  currentProcess: '组焊',
  nextProcess: '调修',
  estimatedCompletion: new Date(...),
  priority: 'high',
  customerOrder: 'CO-2024-A001'
}
```

**问题**: 缺少NGSI-LD规范，且关系（如currentStation）未使用Relationship类型

### 4. 天车实体 (Crane)

**当前格式**:
```javascript
{
  id: 'CR-A',
  name: '天车A',
  x: 150,
  y: 175,
  load: '侧墙骨架',
  status: 'moving',
  dailyTrips: 20,
  totalDistance: 3.2,
  currentTask: '运输侧墙骨架至组焊工序区'
}
```

**问题**: 缺少NGSI-LD规范

### 5. 安灯实体 (Andon)

**当前格式**:
```javascript
{
  stationId: 'ST-GZ-03',
  message: '焊接质量异常',
  severity: 'high',
  timestamp: new Date(...)
}
```

**问题**: 缺少NGSI-LD规范，且与工位的关系未使用Relationship类型

---

## 📐 NGSI-LD 规范要求

### 核心要求

1. **@context (必需)**
   - JSON-LD上下文，定义命名空间和术语映射
   - 示例: `"@context": ["https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]`

2. **@type (必需)**
   - 实体类型，使用URI格式
   - 示例: `"@type": "https://uri.fiware.org/ns/data-models#Workstation"`

3. **@id (必需)**
   - 唯一标识符，使用URI格式
   - 示例: `"@id": "urn:ngsi-ld:Workstation:ST-GZ-02"`

4. **属性格式 (Property)**
   ```json
   {
     "name": {
       "type": "Property",
       "value": "组焊台位2",
       "observedAt": "2024-01-27T10:00:00Z"
     }
   }
   ```

5. **关系格式 (Relationship)**
   ```json
   {
     "locatedAt": {
       "type": "Relationship",
       "object": "urn:ngsi-ld:Location:Factory-Area-1"
     }
   }
   ```

---

## ✅ NGSI-LD 兼容格式示例

### 工位实体 (符合NGSI-LD)

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.org/production-line-context.jsonld"
  ],
  "@id": "urn:ngsi-ld:Workstation:ST-GZ-02",
  "@type": "https://uri.fiware.org/ns/data-models#Workstation",
  "name": {
    "type": "Property",
    "value": "组焊台位2"
  },
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [60, 80]
    }
  },
  "processGroup": {
    "type": "Property",
    "value": "组焊工序区"
  },
  "standardCycleTime": {
    "type": "Property",
    "value": 120,
    "unitCode": "MIN"
  },
  "currentStatus": {
    "type": "Property",
    "value": "running",
    "observedAt": "2024-01-27T10:00:00Z"
  },
  "cycleTime": {
    "type": "Property",
    "value": 135,
    "unitCode": "MIN",
    "observedAt": "2024-01-27T10:00:00Z"
  },
  "firstPassYield": {
    "type": "Property",
    "value": 91.5,
    "unitCode": "P1",
    "observedAt": "2024-01-27T10:00:00Z"
  },
  "oee": {
    "type": "Property",
    "value": 85.2,
    "unitCode": "P1",
    "observedAt": "2024-01-27T10:00:00Z"
  },
  "workInProgress": {
    "type": "Property",
    "value": 3,
    "unitCode": "C62",
    "observedAt": "2024-01-27T10:00:00Z"
  },
  "belongsTo": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:ProcessGroup:Assembly-Welding"
  }
}
```

### 订单实体 (符合NGSI-LD)

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.org/production-line-context.jsonld"
  ],
  "@id": "urn:ngsi-ld:Order:SW-2024-001",
  "@type": "https://uri.fiware.org/ns/data-models#ManufacturingOrder",
  "productName": {
    "type": "Property",
    "value": "CRH380D侧墙-左侧"
  },
  "specification": {
    "type": "Property",
    "value": "3200×2800×150mm"
  },
  "progress": {
    "type": "Property",
    "value": 35,
    "unitCode": "P1",
    "observedAt": "2024-01-27T10:00:00Z"
  },
  "priority": {
    "type": "Property",
    "value": "high",
    "observedAt": "2024-01-27T10:00:00Z"
  },
  "currentStation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Workstation:ST-GZ-02"
  },
  "currentProcess": {
    "type": "Property",
    "value": "组焊",
    "observedAt": "2024-01-27T10:00:00Z"
  },
  "nextProcess": {
    "type": "Property",
    "value": "调修"
  },
  "estimatedCompletion": {
    "type": "Property",
    "value": {
      "@type": "DateTime",
      "@value": "2024-01-27T18:00:00Z"
    }
  },
  "customerOrder": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:CustomerOrder:CO-2024-A001"
  }
}
```

### 设备实体 (符合NGSI-LD)

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.org/production-line-context.jsonld"
  ],
  "@id": "urn:ngsi-ld:Equipment:WR-01",
  "@type": "https://uri.fiware.org/ns/data-models#Robot",
  "name": {
    "type": "Property",
    "value": "焊接机器人1"
  },
  "equipmentType": {
    "type": "Property",
    "value": "welding_robot"
  },
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [80, 100]
    }
  },
  "oee": {
    "type": "Property",
    "value": 85.5,
    "unitCode": "P1",
    "observedAt": "2024-01-27T10:00:00Z"
  },
  "status": {
    "type": "Property",
    "value": "running",
    "observedAt": "2024-01-27T10:00:00Z"
  },
  "locatedAt": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Workstation:ST-GZ-02"
  },
  "processArea": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:ProcessGroup:Assembly-Welding"
  }
}
```

---

## 🔄 迁移建议

### 阶段1: 数据模型转换

1. **创建NGSI-LD转换函数**
   - 将现有JavaScript对象转换为NGSI-LD格式
   - 添加@context、@type、@id字段
   - 将属性转换为Property类型
   - 将关系转换为Relationship类型

2. **定义上下文文件**
   - 创建自定义JSON-LD上下文文件
   - 定义命名空间和术语映射
   - 引用FIWARE标准数据模型

### 阶段2: API集成

1. **集成Context Broker**
   - 使用FIWARE Context Broker (Orion-LD)
   - 实现实体创建、更新、查询API
   - 支持订阅和通知机制

2. **实现数据同步**
   - 将前端数据同步到Context Broker
   - 实现双向数据流（读取和写入）

### 阶段3: 标准化

1. **使用标准数据模型**
   - 参考FIWARE Smart Data Models
   - 使用标准实体类型（如ManufacturingOrder、Robot等）
   - 遵循标准属性命名

2. **实现语义互操作性**
   - 使用标准词汇表
   - 实现跨系统数据交换
   - 支持数据融合和推理

---

## 📊 兼容性检查清单

- [ ] 所有实体包含@context字段
- [ ] 所有实体包含@type字段（URI格式）
- [ ] 所有实体包含@id字段（URI格式）
- [ ] 所有属性使用Property类型
- [ ] 所有关系使用Relationship类型
- [ ] 时间戳使用ISO 8601格式
- [ ] 地理位置使用GeoProperty类型
- [ ] 单位使用unitCode属性
- [ ] 实现Context Broker集成
- [ ] 支持NGSI-LD API操作（创建、更新、查询、删除）

---

## 🛠️ 实施优先级

### 高优先级
1. ✅ 添加@context、@type、@id到所有实体
2. ✅ 将属性转换为Property格式
3. ✅ 将关系转换为Relationship格式

### 中优先级
1. ⚠️ 集成Context Broker
2. ⚠️ 实现数据同步机制
3. ⚠️ 创建自定义上下文文件

### 低优先级
1. ⚪ 使用标准FIWARE数据模型
2. ⚪ 实现订阅和通知
3. ⚪ 支持数据融合和推理

---

## 📚 参考资源

- [NGSI-LD规范](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.07.01_60/gs_CIM009v010701p.pdf)
- [FIWARE Context Broker](https://fiware-orion.readthedocs.io/)
- [FIWARE Smart Data Models](https://smartdatamodels.org/)
- [JSON-LD规范](https://www.w3.org/TR/json-ld/)

---

**报告生成时间**: 2024-01-27  
**分析工具**: 代码审查 + NGSI-LD规范对照

