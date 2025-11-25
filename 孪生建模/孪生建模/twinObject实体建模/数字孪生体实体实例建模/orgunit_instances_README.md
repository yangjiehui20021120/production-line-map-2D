# OrgUnit实例数据说明文档

**文档版本**: V1.0  
**生成日期**: 2025-10-27  
**配套文件**: `orgunit_instances.json`  
**数据来源**: `ORGUNIT_REGISTRY.xlsx`  
**技术规范**: NGSI-LD v1.0 + TwinObject OrgUnit子类型元模型

---

## 文档目录

1. [文档概述](#1-文档概述)
2. [数据集基本信息](#2-数据集基本信息)
3. [组织架构详解](#3-组织架构详解)
4. [实体详细说明](#4-实体详细说明)
5. [使用指南](#5-使用指南)
6. [数据验证清单](#6-数据验证清单)
7. [常见问题FAQ](#7-常见问题faq)

---

## 1. 文档概述

### 1.1 文档目的

本文档为`orgunit_instances.json`实例数据文件提供完整的技术说明和使用指导,包括:
- 组织架构的层级关系
- 每个实体的详细字段说明
- 数据导入和使用方法
- 质量验证清单

### 1.2 适用对象

- **数字孪生平台开发者**: 导入和集成OrgUnit数据
- **系统管理员**: 维护组织架构数据
- **数据建模工程师**: 理解数据结构和关系
- **质量保证人员**: 验证数据完整性和正确性

### 1.3 技术框架

本数据集基于以下技术标准:

| 标准/规范 | 版本 | 作用 |
|-----------|------|------|
| NGSI-LD | v1.0 | 数据建模基础标准 |
| TwinObject统一元模型 | V1.2 | 核心实体类型定义 |
| OrgUnit子类型规范 | V1.0 | 组织单元特有字段 |
| JSON Schema | Draft-07 | 数据结构验证 |

---

## 2. 数据集基本信息

### 2.1 数据统计

```
实体总数: 6个
组织层级: 4层
顶层组织: 1个 (唐山主机厂)
中间层级: 2个 (车体事业部、侧墙产线)
底层班组: 3个 (A班、B班、C班)
```

### 2.2 文件信息

```json
{
  "文件名": "orgunit_instances.json",
  "格式": "JSON数组",
  "编码": "UTF-8",
  "文件大小": "约5.5KB",
  "实体数量": 6,
  "生成工具": "Python 3.x + pandas",
  "生成时间": "2025-10-27"
}
```

### 2.3 数据来源追溯

```
原始数据: ORGUNIT_REGISTRY.xlsx (侧墙产线组织架构)
转换脚本: CSV-to-NGSI-LD转换器
验证标准: orgunit_schema.json (JSON Schema)
参考文档: orgunit_guide.md (设计指南)
```

---

## 3. 组织架构详解

### 3.1 四层组织架构图

```
Level 1 - 工厂层 (Factory)
    urn:ngsi-ld:OrgUnit:CRRC-Tangshan
    [唐山主机厂]
    │
    ├─ orgUnitType: Factory
    ├─ orgLevel: 1
    └─ parentOrg: [无上级]
         │
         ↓
Level 2 - 车间层 (Workshop)
    urn:ngsi-ld:OrgUnit:BodyWorkshop
    [车体事业部]
    │
    ├─ orgUnitType: Workshop
    ├─ orgLevel: 2
    └─ parentOrg: CRRC-Tangshan
         │
         ↓
Level 3 - 产线层 (ProductionLine)
    urn:ngsi-ld:OrgUnit:SideWallLine
    [侧墙产线]
    │
    ├─ orgUnitType: ProductionLine
    ├─ orgLevel: 3
    └─ parentOrg: BodyWorkshop
         │
         ├────────────┬────────────┐
         ↓            ↓            ↓
Level 4 - 班组层 (Team)
    TeamA           TeamB          TeamC
    [侧墙产线A班]   [侧墙产线B班]   [侧墙产线C班]
    │               │              │
    ├─ orgLevel: 4  ├─ orgLevel: 4 ├─ orgLevel: 4
    └─ parentOrg:   └─ parentOrg:  └─ parentOrg:
       SideWallLine    SideWallLine   SideWallLine
```

### 3.2 层级关系矩阵

| 实体ID | 中文名称 | 类型 | 层级 | 上级组织 | 下级组织数 |
|--------|---------|------|------|---------|-----------|
| CRRC-Tangshan | 唐山主机厂 | Factory | 1 | - | 1 |
| BodyWorkshop | 车体事业部 | Workshop | 2 | CRRC-Tangshan | 1 |
| SideWallLine | 侧墙产线 | ProductionLine | 3 | BodyWorkshop | 3 |
| SideWallLine-TeamA | 侧墙产线A班 | Team | 4 | SideWallLine | 0 |
| SideWallLine-TeamB | 侧墙产线B班 | Team | 4 | SideWallLine | 0 |
| SideWallLine-TeamC | 侧墙产线C班 | Team | 4 | SideWallLine | 0 |

### 3.3 业务含义说明

**Level 1 - 工厂层**
- **职责范围**: 整个制造基地的运营管理
- **管理对象**: 多个车间/事业部
- **典型KPI**: 整体OEE、年度产量、成本控制

**Level 2 - 车间层**
- **职责范围**: 特定产品类型的生产管理(如车体)
- **管理对象**: 多条生产线
- **典型KPI**: 车间产能、质量合格率、交付准时率

**Level 3 - 产线层**
- **职责范围**: 单一产品线的日常生产执行(如侧墙)
- **管理对象**: 多个班组、设备、工位
- **典型KPI**: 产线OEE、节拍时间、单位能耗

**Level 4 - 班组层**
- **职责范围**: 班次内的生产操作和质量控制
- **管理对象**: 班组人员、班次任务
- **典型KPI**: 班次产量、班次质量、安全记录

---

## 4. 实体详细说明

### 4.1 实体#1: 唐山主机厂 (顶层工厂)

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/orgunit-context.jsonld"
  ],
  "id": "urn:ngsi-ld:OrgUnit:CRRC-Tangshan",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "OrgUnit"},
  "twinType": {"type": "Property", "value": "Constituent"},
  "name": {"type": "Property", "value": "唐山主机厂"},
  "orgUnitType": {"type": "Property", "value": "Factory"},
  "orgLevel": {"type": "Property", "value": 1},
  "orgStatus": {"type": "Property", "value": "Active"}
}
```

**字段说明**:
- `id`: 唯一标识符,使用URN格式
- `@context`: NGSI-LD上下文引用
- `type`: 固定值"TwinObject",表示这是数字孪生对象
- `subType`: "OrgUnit"表示这是组织单元子类型
- `twinType`: "Constituent"表示这是构成型实体(相对于过渡型)
- `name`: 组织单元的中文名称
- `orgUnitType`: "Factory"表示工厂级组织
- `orgLevel`: 1表示最高层级
- `orgStatus`: "Active"表示当前运营中
- **特殊说明**: 作为顶层组织,无`parentOrg`字段

**业务角色**:
- 整个制造基地的最高管理单元
- 负责战略规划和资源配置
- 统筹所有下属车间和产线

---

### 4.2 实体#2: 车体事业部 (车间层)

```json
{
  "@context": [...],
  "id": "urn:ngsi-ld:OrgUnit:BodyWorkshop",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "OrgUnit"},
  "twinType": {"type": "Property", "value": "Constituent"},
  "name": {"type": "Property", "value": "车体事业部"},
  "orgUnitType": {"type": "Property", "value": "Workshop"},
  "orgLevel": {"type": "Property", "value": 2},
  "orgStatus": {"type": "Property", "value": "Active"},
  "parentOrg": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:OrgUnit:CRRC-Tangshan"
  }
}
```

**字段说明**:
- `orgUnitType`: "Workshop"表示车间级组织
- `orgLevel`: 2表示第二层级
- `parentOrg`: Relationship类型,指向上级组织"CRRC-Tangshan"

**业务角色**:
- 负责车体相关产品的生产管理
- 管理多条产线(包括侧墙产线)
- 协调车间内资源和生产计划

**关系说明**:
- 上级: 唐山主机厂
- 下级: 侧墙产线(以及其他可能的产线)

---

### 4.3 实体#3: 侧墙产线 (产线层)

```json
{
  "@context": [...],
  "id": "urn:ngsi-ld:OrgUnit:SideWallLine",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "OrgUnit"},
  "twinType": {"type": "Property", "value": "Constituent"},
  "name": {"type": "Property", "value": "侧墙产线"},
  "orgUnitType": {"type": "Property", "value": "ProductionLine"},
  "orgLevel": {"type": "Property", "value": 3},
  "orgStatus": {"type": "Property", "value": "Active"},
  "parentOrg": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:OrgUnit:BodyWorkshop"
  }
}
```

**字段说明**:
- `orgUnitType`: "ProductionLine"表示产线级组织
- `orgLevel`: 3表示第三层级
- `parentOrg`: 指向上级组织"BodyWorkshop"

**业务角色**:
- 负责侧墙零件的专业化生产
- 管理产线内的所有设备、工位和班组
- 执行日常生产计划和质量控制

**关系说明**:
- 上级: 车体事业部
- 下级: A班、B班、C班三个班组

**典型扩展字段**(本数据集未包含,但设计支持):
- `headcount`: 人员编制(总编制60人)
- `operatingSchedule`: 三班倒运营安排
- `kpiTargets`: OEE目标85%、质量目标99.5%
- `managedAssets`: 管理的工位和设备清单

---

### 4.4 实体#4-6: 班组层 (TeamA/B/C)

**共同特征**:
```json
{
  "@context": [...],
  "id": "urn:ngsi-ld:OrgUnit:SideWallLine-Team{A/B/C}",
  "type": "TwinObject",
  "subType": {"type": "Property", "value": "OrgUnit"},
  "twinType": {"type": "Property", "value": "Constituent"},
  "name": {"type": "Property", "value": "侧墙产线{A/B/C}班"},
  "orgUnitType": {"type": "Property", "value": "Team"},
  "orgLevel": {"type": "Property", "value": 4},
  "orgStatus": {"type": "Property", "value": "Active"},
  "parentOrg": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:OrgUnit:SideWallLine"
  }
}
```

**实体清单**:

| 实体ID | 名称 | 典型班次 |
|--------|------|---------|
| SideWallLine-TeamA | 侧墙产线A班 | 早班 (08:00-16:00) |
| SideWallLine-TeamB | 侧墙产线B班 | 中班 (16:00-00:00) |
| SideWallLine-TeamC | 侧墙产线C班 | 晚班 (00:00-08:00) |

**业务角色**:
- 执行班次内的生产任务
- 负责设备操作和日常维护
- 记录生产数据和质量问题
- 完成班次交接和记录

**关系说明**:
- 上级: 侧墙产线
- 下级: 无(最底层组织)

**典型扩展字段**(本数据集未包含,但设计支持):
- `headcount`: 班组人员编制(约20人/班)
- `manager`: 班组长引用
- `shiftTeams`: 班次配置信息
- `kpiTargets`: 班次产量目标

---

## 5. 使用指南

### 5.1 数据导入步骤

**步骤1: 验证文件完整性**
```bash
# 检查JSON文件格式
cat orgunit_instances.json | jq '.' > /dev/null
echo "JSON格式验证: $?"

# 检查实体数量
cat orgunit_instances.json | jq 'length'
# 预期输出: 6
```

**步骤2: Schema验证(可选)**
```bash
# 使用jsonschema工具验证
jsonschema -i orgunit_instances.json orgunit_schema.json
```

**步骤3: 导入到数字孪生平台**

根据不同平台,选择对应的导入方法:

**方法A: RESTful API导入**
```python
import requests
import json

# 读取JSON文件
with open('orgunit_instances.json', 'r', encoding='utf-8') as f:
    entities = json.load(f)

# 批量导入
platform_url = "https://your-platform.com/api/v1/entities"
headers = {"Content-Type": "application/ld+json"}

for entity in entities:
    response = requests.post(
        platform_url,
        json=entity,
        headers=headers
    )
    print(f"导入 {entity['id']}: {response.status_code}")
```

**方法B: 批量导入接口**
```python
# 整个数组作为批量请求
response = requests.post(
    f"{platform_url}/batch",
    json=entities,
    headers=headers
)
```

**步骤4: 验证导入结果**
```python
# 查询验证
for entity in entities:
    entity_id = entity['id']
    response = requests.get(f"{platform_url}/{entity_id}")
    assert response.status_code == 200
    print(f"✓ {entity_id} 导入成功")
```

### 5.2 数据查询示例

**查询1: 获取所有组织单元**
```python
# NGSI-LD查询
GET /entities?type=TwinObject&q=subType.value=="OrgUnit"
```

**查询2: 获取特定层级的组织**
```python
# 获取所有产线(Level 3)
GET /entities?type=TwinObject&q=subType.value=="OrgUnit";orgLevel.value==3
```

**查询3: 查询某个组织的下级单元**
```python
# 获取侧墙产线的所有班组
GET /entities?type=TwinObject&q=parentOrg.object=="urn:ngsi-ld:OrgUnit:SideWallLine"
```

**查询4: 构建组织树**
```python
def build_org_tree(root_id, platform_url):
    """递归构建组织树"""
    # 获取根节点
    root = requests.get(f"{platform_url}/{root_id}").json()
    
    # 查询子节点
    children_response = requests.get(
        f"{platform_url}",
        params={"q": f'parentOrg.object=="{root_id}"'}
    ).json()
    
    root['children'] = [
        build_org_tree(child['id'], platform_url) 
        for child in children_response
    ]
    
    return root

# 构建完整组织树
org_tree = build_org_tree("urn:ngsi-ld:OrgUnit:CRRC-Tangshan", platform_url)
```

### 5.3 数据更新和维护

**更新实体属性**
```python
# PATCH请求更新orgStatus
PATCH /entities/urn:ngsi-ld:OrgUnit:SideWallLine-TeamA/attrs/orgStatus
Content-Type: application/json

{
  "type": "Property",
  "value": "Inactive"
}
```

**添加扩展字段**
```python
# 为产线添加人员编制信息
PATCH /entities/urn:ngsi-ld:OrgUnit:SideWallLine/attrs
Content-Type: application/json

{
  "headcount": {
    "type": "Property",
    "value": {
      "total": 60,
      "current": 58,
      "managers": 5,
      "operators": 48,
      "technicians": 5
    }
  }
}
```

**更新层级关系**
```python
# 变更组织归属
PATCH /entities/urn:ngsi-ld:OrgUnit:SideWallLine-TeamA/attrs/parentOrg
Content-Type: application/json

{
  "type": "Relationship",
  "object": "urn:ngsi-ld:OrgUnit:NewParentOrg"
}
```

### 5.4 数据扩展指南

本数据集仅包含必填的核心字段,在实际使用中可以根据业务需求添加以下扩展字段:

**产线层扩展示例**:
```json
{
  "id": "urn:ngsi-ld:OrgUnit:SideWallLine",
  // ... 核心字段 ...
  
  // 扩展字段
  "headcount": {
    "type": "Property",
    "value": {"total": 60, "current": 58}
  },
  "manager": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Person:EMP-2024-050"
  },
  "operatingSchedule": {
    "type": "Property",
    "value": {
      "shiftPattern": "ThreeShift",
      "shiftsPerDay": 3,
      "workingDays": [1,2,3,4,5,6]
    }
  },
  "kpiTargets": {
    "type": "Property",
    "value": {
      "oee": 85,
      "qualityRate": 99.5,
      "throughput": 12000
    }
  },
  "managedAssets": {
    "type": "Property",
    "value": {
      "stations": ["ST-GZ-01", "ST-GZ-02", "ST-GZ-03"],
      "equipment": ["ROBOT-R01", "WELDER-W01"]
    }
  }
}
```

**班组层扩展示例**:
```json
{
  "id": "urn:ngsi-ld:OrgUnit:SideWallLine-TeamA",
  // ... 核心字段 ...
  
  // 扩展字段
  "shiftTeams": {
    "type": "Property",
    "value": [{
      "teamId": "TEAM-A-MORNING",
      "teamName": "A班早班",
      "shiftId": "早班",
      "teamLeader": "EMP-001",
      "memberCount": 19
    }]
  }
}
```

---

## 6. 数据验证清单

### 6.1 结构验证

- [ ] JSON格式正确,可被解析器读取
- [ ] 文件包含6个实体对象
- [ ] 每个实体都是有效的JSON对象
- [ ] 所有实体都包含在顶层数组中

### 6.2 必填字段验证

针对每个实体,检查以下字段:

- [ ] `@context`: 包含NGSI-LD核心上下文
- [ ] `id`: 符合URN格式,唯一且不重复
- [ ] `type`: 值为"TwinObject"
- [ ] `subType.type`: 值为"Property"
- [ ] `subType.value`: 值为"OrgUnit"
- [ ] `twinType.type`: 值为"Property"
- [ ] `twinType.value`: 值为"Constituent"
- [ ] `name`: Property结构,包含中文名称
- [ ] `orgUnitType`: Property结构,值在枚举范围内
- [ ] `orgLevel`: Property结构,值为正整数
- [ ] `orgStatus`: Property结构,值为"Active"

### 6.3 关系字段验证

- [ ] 顶层组织(CRRC-Tangshan)无`parentOrg`字段
- [ ] 其他5个实体都包含`parentOrg`字段
- [ ] 所有`parentOrg`都是Relationship结构
- [ ] 所有`parentOrg.object`引用的ID在数据集中存在

### 6.4 层级逻辑验证

- [ ] Level 1只有1个实体(工厂)
- [ ] Level 2实体的parentOrg指向Level 1
- [ ] Level 3实体的parentOrg指向Level 2
- [ ] Level 4实体的parentOrg都指向同一个Level 3实体
- [ ] 不存在循环引用
- [ ] 不存在孤立节点(除顶层外都有上级)

### 6.5 数据类型验证

- [ ] `orgLevel.value`是整数类型(1, 2, 3, 4)
- [ ] `orgUnitType.value`是字符串类型
- [ ] 所有`type`字段值为"Property"或"Relationship"
- [ ] 所有ID以"urn:ngsi-ld:OrgUnit:"开头

### 6.6 枚举值验证

- [ ] `orgUnitType`值在以下范围:
  - Factory ✓
  - Workshop ✓
  - ProductionLine ✓
  - Team ✓
  - Department (未使用)
  - Division (未使用)

- [ ] `orgStatus`值为"Active" ✓

### 6.7 完整性验证清单

```python
# 自动化验证脚本
import json

def validate_orgunit_instances(filepath):
    """验证OrgUnit实例数据"""
    with open(filepath, 'r', encoding='utf-8') as f:
        entities = json.load(f)
    
    issues = []
    
    # 检查1: 数量
    if len(entities) != 6:
        issues.append(f"预期6个实体,实际{len(entities)}个")
    
    # 检查2: ID唯一性
    ids = [e['id'] for e in entities]
    if len(ids) != len(set(ids)):
        issues.append("存在重复的ID")
    
    # 检查3: 必填字段
    required_fields = ['@context', 'id', 'type', 'subType', 'twinType', 
                      'name', 'orgUnitType', 'orgLevel', 'orgStatus']
    for entity in entities:
        for field in required_fields:
            if field not in entity:
                issues.append(f"{entity['id']}缺少字段{field}")
    
    # 检查4: parentOrg引用完整性
    for entity in entities:
        if 'parentOrg' in entity:
            parent_id = entity['parentOrg']['object']
            if parent_id not in ids:
                issues.append(f"{entity['id']}引用了不存在的上级{parent_id}")
    
    # 检查5: 层级逻辑
    level_counts = {}
    for entity in entities:
        level = entity['orgLevel']['value']
        level_counts[level] = level_counts.get(level, 0) + 1
    
    if level_counts.get(1, 0) != 1:
        issues.append(f"Level 1应有1个实体,实际{level_counts.get(1, 0)}个")
    
    if issues:
        print("❌ 验证失败:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print("✅ 所有验证项通过!")
        return True

# 运行验证
validate_orgunit_instances('orgunit_instances.json')
```

---

## 7. 常见问题FAQ

### Q1: 为什么顶层组织没有parentOrg字段?

**A**: 根据NGSI-LD和JSON Schema规范,`parentOrg`字段是可选的。对于顶层组织(orgLevel=1),由于没有上级组织,因此不包含此字段。这是设计上的正确做法,而非数据遗漏。

```json
// 正确:顶层组织
{
  "id": "urn:ngsi-ld:OrgUnit:CRRC-Tangshan",
  "orgLevel": {"value": 1}
  // 无parentOrg字段
}

// 正确:非顶层组织
{
  "id": "urn:ngsi-ld:OrgUnit:BodyWorkshop",
  "orgLevel": {"value": 2},
  "parentOrg": {"object": "urn:ngsi-ld:OrgUnit:CRRC-Tangshan"}
}
```

---

### Q2: 如何查询某个组织的所有下级单元?

**A**: 使用NGSI-LD查询,通过`parentOrg.object`进行过滤:

```python
# 查询侧墙产线的所有班组
GET /entities?type=TwinObject&q=parentOrg.object=="urn:ngsi-ld:OrgUnit:SideWallLine"

# 预期返回:
# - SideWallLine-TeamA
# - SideWallLine-TeamB
# - SideWallLine-TeamC
```

或者使用递归方式构建完整的组织树(参见5.2节示例)。

---

### Q3: 可以在现有实体上添加更多字段吗?

**A**: 可以!本数据集仅包含核心必填字段,可以通过PATCH请求添加Schema中定义的任何扩展字段:

```python
# 示例:为产线添加KPI目标
PATCH /entities/urn:ngsi-ld:OrgUnit:SideWallLine/attrs
{
  "kpiTargets": {
    "type": "Property",
    "value": {
      "oee": 85,
      "qualityRate": 99.5,
      "throughput": 12000
    }
  }
}
```

所有可用的扩展字段请参考`orgunit_schema.json`和`orgunit_guide.md`。

---

### Q4: 如何处理组织重组或调整?

**A**: 组织调整有多种方式:

**方式1: 更新orgStatus**
```json
// 标记旧组织
PATCH /entities/urn:ngsi-ld:OrgUnit:OldDept/attrs/orgStatus
{
  "type": "Property",
  "value": "Dissolving"
}

// 创建新组织
POST /entities
{
  "id": "urn:ngsi-ld:OrgUnit:NewDept",
  "orgStatus": {"value": "Active"},
  // ...
}
```

**方式2: 变更上级关系**
```json
// 将某个班组转移到新产线
PATCH /entities/urn:ngsi-ld:OrgUnit:SideWallLine-TeamA/attrs/parentOrg
{
  "type": "Relationship",
  "object": "urn:ngsi-ld:OrgUnit:NewProductionLine"
}
```

**方式3: 使用时间戳追溯历史**
```json
// 在stateAttr中记录变更历史
{
  "stateAttr": [
    {"name": "org_change_date", "value": "2025-07-01"},
    {"name": "previous_parent", "value": "urn:ngsi-ld:OrgUnit:OldParent"}
  ]
}
```

---

### Q5: orgLevel和orgUnitType的关系是什么?

**A**: 它们是相关但独立的字段:

| orgLevel | 典型orgUnitType | 说明 |
|----------|----------------|------|
| 1 | Factory, Division | 最高层级 |
| 2 | Workshop, Department | 二级单元 |
| 3 | ProductionLine | 产线级 |
| 4+ | Team | 班组及更细粒度 |

**重要**: 同一orgLevel可以有不同的orgUnitType。例如:
- Level 2可以是Workshop(生产车间)或Department(职能部门)
- Level 3可以是ProductionLine或其他中层单元

orgLevel表示层级深度,orgUnitType表示组织性质。

---

### Q6: 如何批量更新多个实体?

**A**: 使用批量操作API:

```python
# 批量更新所有班组的状态
PATCH /entityOperations/update
[
  {
    "id": "urn:ngsi-ld:OrgUnit:SideWallLine-TeamA",
    "type": "TwinObject",
    "orgStatus": {"type": "Property", "value": "Active"}
  },
  {
    "id": "urn:ngsi-ld:OrgUnit:SideWallLine-TeamB",
    "type": "TwinObject",
    "orgStatus": {"type": "Property", "value": "Active"}
  },
  {
    "id": "urn:ngsi-ld:OrgUnit:SideWallLine-TeamC",
    "type": "Property",
    "orgStatus": {"type": "Property", "value": "Inactive"}
  }
]
```

---

### Q7: 数据导入后如何验证完整性?

**A**: 执行以下验证查询:

```python
# 1. 检查数量
GET /entities?type=TwinObject&q=subType.value=="OrgUnit"&count=true
# 预期: count=6

# 2. 检查每个层级的数量
for level in [1, 2, 3, 4]:
    GET /entities?type=TwinObject&q=orgLevel.value=={level}&count=true

# 3. 检查关系完整性
for entity_id in all_entity_ids:
    entity = GET /entities/{entity_id}
    if 'parentOrg' in entity:
        parent_id = entity['parentOrg']['object']
        parent = GET /entities/{parent_id}
        assert parent is not None

# 4. 检查无循环引用
def has_cycle(entity_id, visited):
    if entity_id in visited:
        return True
    visited.add(entity_id)
    entity = get_entity(entity_id)
    if 'parentOrg' in entity:
        return has_cycle(entity['parentOrg']['object'], visited)
    return False
```

---

### Q8: 如何与Person实体关联?

**A**: 通过Person实体的`department`字段建立关联:

```json
// Person实体示例
{
  "id": "urn:ngsi-ld:TwinObject:Person:EMP-001",
  "type": "TwinObject",
  "subType": {"value": "Person"},
  "name": {"value": "张三"},
  "department": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:OrgUnit:SideWallLine-TeamA"
  }
}

// 查询某个组织的所有人员
GET /entities?type=TwinObject&q=department.object=="urn:ngsi-ld:OrgUnit:SideWallLine-TeamA"
```

反向查询(从OrgUnit查Person)需要额外的查询:
```python
org_id = "urn:ngsi-ld:OrgUnit:SideWallLine-TeamA"
persons = GET /entities?type=TwinObject&q=subType.value=="Person";department.object=="{org_id}"
```

---

### Q9: childOrgs字段在哪里?

**A**: 本数据集未包含`childOrgs`字段,因为它是可选的且可以通过查询自动计算:

```python
# 自动计算子组织
def get_children(org_id):
    return GET /entities?q=parentOrg.object=="{org_id}"

# 如需显式维护,可以添加:
PATCH /entities/urn:ngsi-ld:OrgUnit:SideWallLine/attrs
{
  "childOrgs": [
    {"type": "Relationship", "object": "urn:ngsi-ld:OrgUnit:SideWallLine-TeamA"},
    {"type": "Relationship", "object": "urn:ngsi-ld:OrgUnit:SideWallLine-TeamB"},
    {"type": "Relationship", "object": "urn:ngsi-ld:OrgUnit:SideWallLine-TeamC"}
  ]
}
```

建议:对于大型组织架构,通过查询计算更灵活;对于频繁读取的场景,显式维护`childOrgs`可提高性能。

---

### Q10: 如何导出组织架构报表?

**A**: 使用查询API获取数据后,在应用层进行格式化:

```python
import json
import requests

def export_org_report(platform_url):
    """导出组织架构报表"""
    # 获取所有组织单元
    response = requests.get(
        f"{platform_url}/entities",
        params={"type": "TwinObject", "q": "subType.value==OrgUnit"}
    )
    orgunits = response.json()
    
    # 按层级分组
    by_level = {}
    for org in orgunits:
        level = org['orgLevel']['value']
        by_level.setdefault(level, []).append(org)
    
    # 生成报表
    report = []
    report.append("组织架构报表")
    report.append("=" * 60)
    
    for level in sorted(by_level.keys()):
        report.append(f"\n层级 {level}:")
        for org in by_level[level]:
            report.append(f"  - {org['name']['value']} ({org['id']})")
            if 'parentOrg' in org:
                report.append(f"    上级: {org['parentOrg']['object']}")
    
    return "\n".join(report)

# 导出并保存
report = export_org_report("https://platform-url/api/v1")
with open('org_report.txt', 'w', encoding='utf-8') as f:
    f.write(report)
```

---

## 附录A: 字段速查表

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| @context | Array | ✓ | NGSI-LD上下文 | [...] |
| id | String | ✓ | 实体唯一标识 | urn:ngsi-ld:OrgUnit:... |
| type | String | ✓ | 实体类型 | TwinObject |
| subType | Property | ✓ | 子类型 | OrgUnit |
| twinType | Property | ✓ | 孪生类型 | Constituent |
| name | Property | ✓ | 名称 | 侧墙产线 |
| orgUnitType | Property | ✓ | 组织类型 | ProductionLine |
| orgLevel | Property | ✓ | 组织层级 | 3 |
| orgStatus | Property | ✓ | 组织状态 | Active |
| parentOrg | Relationship | 条件 | 上级组织 | urn:ngsi-ld:OrgUnit:... |

---

## 附录B: ID命名规范

本数据集使用的ID遵循以下命名规范:

```
格式: urn:ngsi-ld:OrgUnit:{组织标识}

示例:
- urn:ngsi-ld:OrgUnit:CRRC-Tangshan       (公司简称)
- urn:ngsi-ld:OrgUnit:BodyWorkshop        (业务领域)
- urn:ngsi-ld:OrgUnit:SideWallLine        (产品+Line)
- urn:ngsi-ld:OrgUnit:SideWallLine-TeamA  (产线+班组)
```

**命名建议**:
- 使用有意义的英文标识
- 避免使用纯数字编码
- 保持命名一致性
- 考虑层级关系的可读性

---

## 附录C: 版本历史

| 版本 | 日期 | 变更说明 | 作者 |
|------|------|---------|------|
| V1.0 | 2025-10-27 | 初始版本,包含6个基础OrgUnit实体 | 数字孪生团队 |

---

## 附录D: 相关文档

- **设计规范**: `orgunit_guide.md` - OrgUnit子类型设计指南
- **Schema定义**: `orgunit_schema.json` - JSON Schema验证规范
- **源数据**: `ORGUNIT_REGISTRY.xlsx` - 原始组织架构数据
- **NGSI-LD规范**: [ETSI GS CIM 009](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_CIM009v010801p.pdf)

---

**文档维护**: 数字孪生架构组  
**联系方式**: digitaltwin-support@company.com  
**最后更新**: 2025-10-27

---

**免责声明**: 本文档仅供内部技术参考,未经授权不得外传。文档内容基于V1.0数据集,后续版本可能有所调整。