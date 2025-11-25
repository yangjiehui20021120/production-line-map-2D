# MBOM元模型架构说明

## 📋 概述

本文档定义了基于NGSI-LD标准的MBOM(Manufacturing Bill of Materials)实体模型架构,采用**五层实体网络**设计,通过Relationship关系构建完整的制造工艺知识图谱。

---

## 🏗️ 架构设计理念

### 核心原则

1. **统一类型 + 子类型区分**
   - 所有实体的`type`字段统一为`"MBOM"`
   - 通过`mbomType`属性区分不同层级: `MBOMRoot`, `Route`, `Takt`, `Process`, `Step`
   - 参照TwinObject模式,保持系统内部建模一致性

2. **实体网络 > 深度嵌套**
   - 每个层级都是**独立的NGSI-LD实体**
   - 通过**Relationship关系**连接,而非JSON深度嵌套
   - 支持灵活查询、独立版本管理、实体复用

3. **双向关系建模**
   - 父实体 → 子实体: 正向关系(如Route.consistsOfTakts)
   - 子实体 → 父实体: 反向关系(如Takt.partOfRoute)
   - 支持从任意节点进行上下游追溯

4. **独立完整的元模型**
   - 每个mbomType有独立的Schema定义
   - 不使用继承,避免通用元模型意义不大的问题
   - 每个Schema自包含,清晰明确

---

## 🗂️ 五层实体架构

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: MBOM Root (mbomType=MBOMRoot)            │
│  - 制造BOM的顶层契约                                 │
│  - 定义产品、版本、状态、文档                         │
│  - Relationship: hasRoute → Route                  │
└─────────────────────────────────────────────────────┘
                      ↓ hasRoute (1:1)
┌─────────────────────────────────────────────────────┐
│  Layer 2: Route (mbomType=Route)                   │
│  - 工艺路线定义                                      │
│  - 定义产线、路线编码、总周期时间                      │
│  - Relationship: consistsOfTakts → Takt[]          │
│  - Relationship: partOfMBOM → MBOM (反向)          │
└─────────────────────────────────────────────────────┘
                      ↓ consistsOfTakts (1:N)
┌─────────────────────────────────────────────────────┐
│  Layer 3: Takt (mbomType=Takt)                     │
│  - 节拍定义                                          │
│  - 定义节拍序号、目标CT、时间窗口                      │
│  - Relationship: includesProcesses → Process[]     │
│  - Relationship: partOfRoute → Route (反向)        │
└─────────────────────────────────────────────────────┘
                      ↓ includesProcesses (1:N)
┌─────────────────────────────────────────────────────┐
│  Layer 4: Process (mbomType=Process)               │
│  - 工序定义                                          │
│  - 定义工序编码、名称、类型、允许工位                   │
│  - Relationship: composedOfSteps → Step[]          │
│  - Relationship: partOfTakt → Takt (反向)          │
└─────────────────────────────────────────────────────┘
                      ↓ composedOfSteps (1:N)
┌─────────────────────────────────────────────────────┐
│  Layer 5: Step (mbomType=Step)                     │
│  - 工步定义(最小执行单元)                             │
│  - 定义工步序号、标准工时、质量门、测量要求              │
│  - Relationship: partOfProcess → Process (反向)    │
└─────────────────────────────────────────────────────┘
```

---

## 📄 元模型文件清单

### 第1批 (已完成)

1. **MBOM.Root.schema.json** - MBOMRoot实体元模型
   - 定义MBOM顶层契约实体
   - 包含产品代码、版本、状态、文档、物料需求等
   - 关键关系: hasRoute → Route

2. **MBOM.Route.schema.json** - Route实体元模型
   - 定义工艺路线实体
   - 包含路线编码、产线、总周期时间、Route级测量要求
   - 关键关系: partOfMBOM → MBOM, consistsOfTakts → Takt[]

### 第2批 (待生成)

3. **MBOM.Takt.schema.json** - Takt实体元模型
4. **MBOM.Process.schema.json** - Process实体元模型

### 第3批 (待生成)

5. **MBOM.Step.schema.json** - Step实体元模型
6. **mbom-context.jsonld** - NGSI-LD上下文定义

---

## 🔗 实体ID命名规范

所有实体ID遵循统一的URN格式:

```
urn:ngsi-ld:MBOM:{businessKey}:{version}
```

### 各层级ID示例

| 层级 | ID格式 | 示例 |
|------|--------|------|
| **MBOMRoot** | `urn:ngsi-ld:MBOM:{productCode}:{version}` | `urn:ngsi-ld:MBOM:M000004670327:V1.0` |
| **Route** | `urn:ngsi-ld:MBOM:RT_{routeCode}:{version}` | `urn:ngsi-ld:MBOM:RT_M000004670327:V1.0` |
| **Takt** | `urn:ngsi-ld:MBOM:{productCode}:T{seq}` | `urn:ngsi-ld:MBOM:M000004670327:T01` |
| **Process** | `urn:ngsi-ld:MBOM:{productCode}:T{taktSeq}:P{procCode}` | `urn:ngsi-ld:MBOM:M000004670327:T01:P0010` |
| **Step** | `urn:ngsi-ld:MBOM:{productCode}:T{taktSeq}:P{procCode}:S{stepSeq}` | `urn:ngsi-ld:MBOM:M000004670327:T01:P0010:S01` |

---

## 🔄 双向关系设计

### 示例: MBOM ↔ Route

**MBOM实体 (父)**
```json
{
  "id": "urn:ngsi-ld:MBOM:M000004670327:V1.0",
  "type": "MBOM",
  "mbomType": { "type": "Property", "value": "MBOMRoot" },
  
  "hasRoute": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:MBOM:RT_M000004670327:V1.0"
  }
}
```

**Route实体 (子)**
```json
{
  "id": "urn:ngsi-ld:MBOM:RT_M000004670327:V1.0",
  "type": "MBOM",
  "mbomType": { "type": "Property", "value": "Route" },
  
  "partOfMBOM": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:MBOM:M000004670327:V1.0"
  },
  
  "consistsOfTakts": {
    "type": "Relationship",
    "object": [
      "urn:ngsi-ld:MBOM:M000004670327:T01",
      "urn:ngsi-ld:MBOM:M000004670327:T02"
    ]
  }
}
```

---

## 🎯 NGSI-LD查询示例

### 查询某产品的MBOM

```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="MBOMRoot";productCode.value=="M000004670327"
```

### 查询某MBOM的工艺路线

```http
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM:M000004670327:V1.0?attrs=hasRoute
```

### 查询某Route的所有Takt

```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="Takt";partOfRoute.object=="urn:ngsi-ld:MBOM:RT_M000004670327:V1.0"
```

### 查询所有焊接工序

```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="Process";procKind.value=="welding"
```

---

## 📊 实例数量估算

基于典型产品(如M000004670327侧墙):

| 层级 | 每产品实例数 | 说明 |
|------|------------|------|
| MBOMRoot | 1 | 一个产品一个MBOM |
| Route | 1 | 一个MBOM一条路线 |
| Takt | 11 | 典型侧墙产品 |
| Process | 27 | 平均2-3个/Takt |
| Step | 79 | 平均3个/Process |
| **合计** | **119个实体** | 单产品完整实体网络 |

---

## ✅ 设计优势

### 1. 粒度合理
- 每个实体50-100行,易于维护
- 无10,000行巨型文档问题

### 2. 查询灵活
- 可按type+mbomType查询特定层级
- 支持关系遍历和图查询
- 支持联邦查询和分布式部署

### 3. 版本独立
- 每个实体可独立版本化
- Step修改不影响MBOM版本
- 支持细粒度变更管理

### 4. 复用友好
- 多个MBOM可引用同一个Step模板
- 资源定义独立,跨MBOM复用
- 测量要求引用Catalog,消除冗余

### 5. 符合标准
- 完全符合NGSI-LD规范
- 与TwinObject等模型一致
- 支持标准Context Broker

---

## 🚀 使用指南

### Schema验证

使用JSON Schema验证工具:

```bash
# 验证MBOM Root实例
ajv validate -s MBOM.Root.schema.json -d mbom_instance.json

# 验证Route实例
ajv validate -s MBOM.Route.schema.json -d route_instance.json
```

### 批量导入Context Broker

```bash
# 批量创建实体
curl -X POST "http://localhost:1026/ngsi-ld/v1/entityOperations/create" \
  -H "Content-Type: application/ld+json" \
  -d @mbom_entities_batch.jsonld
```

### 查询完整工艺链

```python
# Python示例: 从MBOM查询完整工艺结构
def get_full_mbom_structure(mbom_id):
    mbom = get_entity(mbom_id)
    route = get_entity(mbom['hasRoute']['object'])
    
    takts = []
    for takt_id in route['consistsOfTakts']['object']:
        takt = get_entity(takt_id)
        
        processes = []
        for proc_id in takt['includesProcesses']['object']:
            proc = get_entity(proc_id)
            
            steps = []
            for step_id in proc['composedOfSteps']['object']:
                step = get_entity(step_id)
                steps.append(step)
            
            proc['steps'] = steps
            processes.append(proc)
        
        takt['processes'] = processes
        takts.append(takt)
    
    return {
        'mbom': mbom,
        'route': route,
        'takts': takts
    }
```

---

## 📝 后续计划

### 第2批元模型
- [ ] MBOM.Takt.schema.json
- [ ] MBOM.Process.schema.json

### 第3批元模型+上下文
- [ ] MBOM.Step.schema.json
- [ ] mbom-context.jsonld

### 实例生成
- [ ] 基于Excel生成完整实体实例
- [ ] 批量导入脚本
- [ ] 验证工具

---

## 📞 联系方式

如有疑问,请参考:
- NGSI-LD规范: https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.06.01_60/gs_CIM009v010601p.pdf
- 设计文档: mbom_design_doc.md

---

**版本**: V1.0  
**更新日期**: 2025-01-21
