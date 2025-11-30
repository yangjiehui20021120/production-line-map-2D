# 数字孪生平台数据服务接口技术规范 (NGSI-LD)

**Digital Twin Platform Data Service API Technical Specification**

版本: v1.0  
日期: 2025-11-10  
标准: ETSI GS CIM 009 (NGSI-LD API)  
平台: FIWARE-based Digital Twin Platform

---

## 1. 概述 (Overview)

### 1.1 规范目的

本技术规范定义了数字孪生平台对外提供的数据服务接口标准,作为业务优化智能应用设计和开发的基础。该规范遵循ETSI NGSI-LD标准,基于FIWARE生态组件实现。

### 1.2 适用范围

- **目标用户**: 业务优化智能应用开发者(使用AI系统如Gemini/ChatGPT等)
- **数据范围**: 侧墙生产线数字孪生实体数据(组织、物理、工艺、资源、运行数据)
- **技术栈**: FIWARE Orion-LD Context Broker + NGSI-LD API

### 1.3 数字孪生架构概览

```
┌─────────────────────────────────────────────────────────┐
│         业务优化智能应用层                                  │
│   (生产计划验证 | 价值流分析 | 库存控制 | 质量改进)           │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ NGSI-LD API
                          │
┌─────────────────────────────────────────────────────────┐
│              数字孪生平台数据服务层                          │
│         (FIWARE Orion-LD Context Broker)                │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
┌─────────────────────────────────────────────────────────┐
│               数字孪生实体数据存储层                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │配置层实体 │  │工艺层实体 │  │场景层实体 │  │运行层数据│ │
│  │Resource │  │Process  │  │ Scene   │  │ModalData│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 1.4 四层架构映射

| 架构层级 | 主要实体类型 | 数据特征 |
|---------|------------|---------|
| **Runtime Data Layer** | ModalData, Scene(stepLog) | 高频更新、时序性强 |
| **Execution Scenario Layer** | Scene, ModalityBinding | 执行定义、中频变更 |
| **Process Definition Layer** | MBOM (Process/Route/Step/Takt) | 工艺稳定、低频变更 |
| **Resource Configuration Layer** | TwinObject (OrgUnit/Station/AutoEquipment/Person/Position/Role) | 资源配置、低频变更 |

---

## 2. NGSI-LD基础规范 (NGSI-LD Foundation)

### 2.1 API基础路径

```
基础URL: https://{platform-host}/ngsi-ld/v1
```

所有API端点均基于此路径。

### 2.2 标准HTTP方法

| 方法 | 用途 | 幂等性 |
|-----|------|-------|
| GET | 查询实体或属性 | 是 |
| POST | 创建实体或批量操作 | 否 |
| PATCH | 部分更新实体属性 | 否 |
| DELETE | 删除实体 | 是 |

### 2.3 标准请求头

```http
Content-Type: application/ld+json
Accept: application/ld+json
Link: <https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"
```

### 2.4 @context处理

所有实体使用标准的@context结构:

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/{domain}-context.jsonld"
  ]
}
```

### 2.5 URN标识符规范

所有实体使用URN作为唯一标识符:

```
urn:ngsi-ld:{EntityType}:{UniqueIdentifier}
```

示例:
- `urn:ngsi-ld:TwinObject:AutoEquipment:361-01173`
- `urn:ngsi-ld:Scene:FrontWelding_20250808_093512`
- `urn:ngsi-ld:ModalData:WeldingCurrent.FrontWelding_20250808.0001`

---

## 3. 核心实体查询服务 (Core Entity Query Services)

### 3.1 单实体精确查询

**端点**: `GET /entities/{entityId}`

**功能**: 根据URN精确获取单个实体的完整信息

**参数**:
- `entityId` (路径参数, 必需): 实体的完整URN
- `attrs` (查询参数, 可选): 逗号分隔的属性列表,用于返回部分属性
- `options` (查询参数, 可选): `keyValues` | `sysAttrs`

**示例请求**:

```http
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:AutoEquipment:361-01173
Accept: application/ld+json
```

**示例响应**:

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/autoequipment-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173",
  "type": "TwinObject",
  "subType": {
    "type": "Property",
    "value": "AutoEquipment"
  },
  "name": {
    "type": "Property",
    "value": "前围焊接机器人"
  },
  "equipmentType": {
    "type": "Property",
    "value": "WeldingRobot"
  },
  "deployedAt": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:FrontWelding"
  }
}
```

**返回部分属性示例**:

```http
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:AutoEquipment:361-01173?attrs=name,equipmentType
```

---

### 3.2 实体类型查询

**端点**: `GET /entities`

**功能**: 按实体类型查询,获取某一类型的所有实体

**核心参数**:
- `type` (查询参数, 必需): 实体类型名称
- `limit` (查询参数, 可选): 返回数量限制,默认20,最大1000
- `offset` (查询参数, 可选): 分页偏移量
- `options` (查询参数, 可选): `keyValues` | `count`

**支持的核心实体类型**:

| 实体类型 | 说明 | 典型用途 |
|---------|------|---------|
| `TwinObject` | 孪生对象基类 | 需配合subType属性过滤 |
| `Scene` | 生产场景 | 获取执行场景定义 |
| `ModalData` | 模态数据 | 获取运行时数据 |
| `Modality` | 数据模态 | 获取数据类型定义 |
| `ModalityBinding` | 模态绑定 | 获取数据绑定关系 |
| `Role` | 角色定义 | 获取角色职责 |

**示例: 查询所有设备**

```http
GET /ngsi-ld/v1/entities?type=TwinObject&q=subType.value=="AutoEquipment"&limit=100
Accept: application/ld+json
```

**示例: 查询所有工位**

```http
GET /ngsi-ld/v1/entities?type=TwinObject&q=subType.value=="Station"
```

**分页查询示例**:

```http
GET /ngsi-ld/v1/entities?type=Scene&limit=50&offset=0
```

---

### 3.3 属性条件查询

**端点**: `GET /entities`

**功能**: 根据属性值条件过滤查询实体

**查询参数 `q`**: 支持的查询语法

**操作符**:
- `==`: 等于
- `!=`: 不等于
- `>`, `<`, `>=`, `<=`: 数值比较
- `~=`: 模式匹配
- `;`: AND逻辑
- `|`: OR逻辑

**示例1: 查询特定类型的设备**

```http
GET /ngsi-ld/v1/entities?type=TwinObject&q=subType.value=="AutoEquipment";equipmentType.value=="WeldingRobot"
```

**示例2: 查询特定产品的场景**

```http
GET /ngsi-ld/v1/entities?type=Scene&q=workpieceId.object=="urn:ngsi-ld:Workpiece:M670-SN001"
```

**示例3: 查询活跃的组织单元**

```http
GET /ngsi-ld/v1/entities?type=TwinObject&q=subType.value=="OrgUnit";orgStatus.value=="Active"
```

---

### 3.4 地理空间查询

**端点**: `GET /entities`

**功能**: 基于地理位置的查询(如果实体包含location属性)

**参数**:
- `geometry`: `Point` | `Polygon` | `LineString`
- `coordinates`: 坐标数组
- `georel`: 地理关系 (`near`, `within`, `contains`, 等)
- `geoproperty`: 默认为`location`

**示例: 查询某区域内的设备** (如果设备实体包含location属性)

```http
GET /ngsi-ld/v1/entities?type=TwinObject&geometry=Polygon&coordinates=[[[x1,y1],[x2,y2],[x3,y3],[x1,y1]]]&georel=within
```

> **注**: 地理空间查询取决于实体是否配置了location属性

---

## 4. 关系导航服务 (Relationship Navigation Services)

### 4.1 关系类型概览

数字孪生实体间存在以下关键关系:

| 关系属性 | 源实体类型 | 目标实体类型 | 关系语义 |
|---------|-----------|------------|---------|
| `parentOrg` | OrgUnit | OrgUnit | 组织层级关系 |
| `deployedAt` | AutoEquipment | Station | 设备部署位置 |
| `assignedTo` | Position | OrgUnit | 岗位归属组织 |
| `holdsPosition` | Person | Position | 人员任职岗位 |
| `assignedRole` | Person | Role | 人员分配角色 |
| `rootProcess` | MBOM_Root | MBOM_Process | MBOM根指向首工序 |
| `nextProcess` | MBOM_Process | MBOM_Process | 工序流转 |
| `route` | MBOM_Process | MBOM_Route | 工序包含路线 |
| `nextRoute` | MBOM_Route | MBOM_Route | 路线流转 |
| `step` | MBOM_Route | MBOM_Step | 路线包含工步 |
| `nextStep` | MBOM_Step | MBOM_Step | 工步流转 |
| `takt` | MBOM_Step | MBOM_Takt | 工步关联节拍 |
| `usedStation` | MBOM_Takt | Station | 节拍使用工位 |
| `usedEquipment` | MBOM_Takt | AutoEquipment | 节拍使用设备 |
| `usedQCTool` | MBOM_Takt | QCTool | 节拍使用检具 |
| `workpieceId` | Scene | Workpiece | 场景关联工件 |
| `taktRef` | Scene | MBOM_Takt | 场景关联节拍 |
| `twinId` | ModalityBinding | TwinObject | 绑定关联孪生体 |
| `modalityId` | ModalityBinding | Modality | 绑定关联模态 |
| `twinId` | ModalData | TwinObject | 数据关联孪生体 |
| `sceneId` | ModalData | Scene | 数据关联场景 |
| `modalityId` | ModalData | Modality | 数据关联模态 |

### 4.2 正向关系导航

**功能**: 从源实体出发,获取其关系指向的目标实体

**方法1: 实体查询时直接展开关系**

```http
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:AutoEquipment:361-01173?options=keyValues
```

响应中的关系属性直接包含目标实体URN:

```json
{
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173",
  "type": "TwinObject",
  "deployedAt": "urn:ngsi-ld:TwinObject:Station:FrontWelding"
}
```

**方法2: 链式查询目标实体**

先获取源实体,再查询关系指向的目标实体:

```bash
# Step 1: 获取设备实体
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:AutoEquipment:361-01173

# Step 2: 从响应中提取 deployedAt.object 的URN
# deployedAt.object = "urn:ngsi-ld:TwinObject:Station:FrontWelding"

# Step 3: 查询目标工位实体
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:Station:FrontWelding
```

### 4.3 反向关系导航

**功能**: 查询指向某个实体的所有源实体

**端点**: `GET /entities`

**核心技巧**: 使用`q`参数查询关系属性值

**示例1: 查询部署在某工位的所有设备**

```http
GET /ngsi-ld/v1/entities?type=TwinObject&q=deployedAt.object=="urn:ngsi-ld:TwinObject:Station:FrontWelding"
```

**示例2: 查询某工件的所有生产场景**

```http
GET /ngsi-ld/v1/entities?type=Scene&q=workpieceId.object=="urn:ngsi-ld:Workpiece:M670-SN001"
```

**示例3: 查询某孪生体的所有模态绑定**

```http
GET /ngsi-ld/v1/entities?type=ModalityBinding&q=twinId.object=="urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"
```

### 4.4 多层级关系遍历

**场景**: 需要沿关系链进行多跳查询

**方法**: 客户端实现递归查询逻辑

**示例: 查询某设备的完整组织层级链**

```bash
# Step 1: 获取设备实体
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:AutoEquipment:361-01173
# 提取 deployedAt → urn:ngsi-ld:TwinObject:Station:FrontWelding

# Step 2: 获取工位实体
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:Station:FrontWelding
# 提取 stationLocation → urn:ngsi-ld:TwinObject:OrgUnit:SideWallLine

# Step 3: 获取产线实体
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:OrgUnit:SideWallLine
# 提取 parentOrg → urn:ngsi-ld:TwinObject:OrgUnit:BodyWorkshop

# Step 4: 继续向上遍历...
```

**示例: 查询MBOM工艺流转链**

```bash
# Step 1: 获取MBOM根
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Root:M000004670327
# 提取 rootProcess → urn:ngsi-ld:MBOM_Process:M000004670327-10

# Step 2: 获取首工序
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Process:M000004670327-10
# 提取 nextProcess → urn:ngsi-ld:MBOM_Process:M000004670327-20

# Step 3: 获取后续工序
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Process:M000004670327-20
# 继续遍历 nextProcess 直到为空
```

---

## 5. 三锚点运行数据查询服务 (Three-Anchor Runtime Data Services)

### 5.1 三锚点定位机制

**核心概念**: TwinObject × Scene × Modality

运行数据(ModalData)通过三个锚点精确定位:
1. **TwinObject** (twinId): 数据产生的孪生对象(设备/工位/人员)
2. **Scene** (sceneId): 数据产生的生产场景(工件在某工序的执行)
3. **Modality** (modalityId): 数据的模态类型(电流/温度/位置等)

```
ModalData = f(TwinObject, Scene, Modality)
```

### 5.2 场景执行日志查询

**端点**: `GET /entities/{sceneId}`

**功能**: 获取某个生产场景的完整执行信息,包括stepLog

**示例请求**:

```http
GET /ngsi-ld/v1/entities/urn:ngsi-ld:Scene:FrontWelding_20250808_093512
```

**响应示例**:

```json
{
  "@context": [...],
  "id": "urn:ngsi-ld:Scene:FrontWelding_20250808_093512",
  "type": "Scene",
  "workpieceId": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Workpiece:M670-SN001"
  },
  "taktRef": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:MBOM_Takt:M000004670327-10-10-10-01"
  },
  "sceneStartTime": {
    "type": "Property",
    "value": "2025-08-08T09:35:12Z"
  },
  "sceneEndTime": {
    "type": "Property",
    "value": "2025-08-08T09:42:18Z"
  },
  "stepLog": {
    "type": "Property",
    "value": [
      {
        "stepId": "urn:ngsi-ld:MBOM_Step:M000004670327-10-10-10",
        "stepName": "前围焊接",
        "actualDuration": 426,
        "startTime": "2025-08-08T09:35:12Z",
        "endTime": "2025-08-08T09:42:18Z",
        "operators": [
          {
            "personId": "urn:ngsi-ld:TwinObject:Person:EMP001",
            "roleId": "urn:ngsi-ld:Role:Welder"
          }
        ]
      }
    ]
  }
}
```

### 5.3 按孪生对象查询模态数据

**端点**: `GET /entities`

**功能**: 查询某个孪生对象在特定时间范围内的所有模态数据

**查询逻辑**:
1. 指定`type=ModalData`
2. 通过`q`参数过滤`twinId.object`
3. (可选)过滤时间范围

**示例: 查询某设备的所有数据**

```http
GET /ngsi-ld/v1/entities?type=ModalData&q=twinId.object=="urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"&limit=1000
```

**示例: 查询某设备在特定场景的数据**

```http
GET /ngsi-ld/v1/entities?type=ModalData&q=twinId.object=="urn:ngsi-ld:TwinObject:AutoEquipment:361-01173";sceneId.object=="urn:ngsi-ld:Scene:FrontWelding_20250808_093512"
```

### 5.4 按模态类型查询数据

**端点**: `GET /entities`

**功能**: 查询特定模态类型的所有数据记录

**示例: 查询所有焊接电流数据**

```http
GET /ngsi-ld/v1/entities?type=ModalData&q=modalityId.object=="urn:ngsi-ld:Modality:WeldingCurrent_Auto"&limit=500
```

**示例: 组合查询 - 某设备的某模态数据**

```http
GET /ngsi-ld/v1/entities?type=ModalData&q=twinId.object=="urn:ngsi-ld:TwinObject:AutoEquipment:361-01173";modalityId.object=="urn:ngsi-ld:Modality:WeldingCurrent_Auto"
```

### 5.5 时序数据查询

**端点**: `GET /temporal/entities`

**功能**: 查询实体属性的时序变化历史(如果平台启用了时序存储)

**参数**:
- `timerel`: `before` | `after` | `between`
- `timeAt`: 时间点(ISO 8601格式)
- `endTimeAt`: 结束时间(用于`between`)
- `timeproperty`: 时间属性名,默认`observedAt`

**示例: 查询某时间段内的模态数据**

```http
GET /ngsi-ld/v1/temporal/entities?type=ModalData&q=twinId.object=="urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"&timerel=between&timeAt=2025-08-08T09:00:00Z&endTimeAt=2025-08-08T10:00:00Z
```

> **注**: 时序查询功能依赖于平台是否配置了时序数据库(如QuantumLeap)

---

## 6. 模态绑定关系查询 (Modality Binding Query Services)

### 6.1 模态绑定概念

**ModalityBinding实体**定义了:
- 哪个孪生对象(twinId)
- 绑定了哪个数据模态(modalityId)
- 对应的数据采集点引用(pointRef)
- 绑定生效时间(effectiveFrom)

### 6.2 查询孪生对象的模态绑定列表

**功能**: 查询某个孪生对象绑定了哪些数据模态

**示例请求**:

```http
GET /ngsi-ld/v1/entities?type=ModalityBinding&q=twinId.object=="urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"
```

**响应示例**:

```json
[
  {
    "id": "urn:ngsi-ld:ModalityBinding:361-01173:WeldingCurrent_Auto:v1",
    "type": "ModalityBinding",
    "twinId": {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"
    },
    "modalityId": {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:WeldingCurrent_Auto"
    },
    "pointRef": {
      "type": "Property",
      "value": "ns=2;s=361-01173.WeldingCurrent_Auto"
    }
  },
  {
    "id": "urn:ngsi-ld:ModalityBinding:361-01173:ShieldingGasFlow:v1",
    "type": "ModalityBinding",
    "twinId": {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"
    },
    "modalityId": {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:ShieldingGasFlow"
    },
    "pointRef": {
      "type": "Property",
      "value": "ns=2;s=361-01173.ShieldingGasFlow"
    }
  }
]
```

### 6.3 查询模态的绑定对象列表

**功能**: 查询某个数据模态绑定到了哪些孪生对象

**示例请求**:

```http
GET /ngsi-ld/v1/entities?type=ModalityBinding&q=modalityId.object=="urn:ngsi-ld:Modality:WeldingCurrent_Auto"
```

---

## 7. 工艺流程查询服务 (Process Flow Query Services)

### 7.1 MBOM结构概览

MBOM(Manufacturing Bill of Materials)采用四层结构:

```
MBOM_Root (产品根)
    └─> rootProcess
         MBOM_Process (工序)
             └─> route
                  MBOM_Route (路线)
                      └─> step
                           MBOM_Step (工步)
                               └─> takt
                                    MBOM_Takt (节拍)
```

各层通过`next*`关系形成链式流转:
- `nextProcess`: 工序流转
- `nextRoute`: 路线流转
- `nextStep`: 工步流转

### 7.2 查询产品MBOM根

**功能**: 获取某产品的MBOM根实体

**示例请求**:

```http
GET /ngsi-ld/v1/entities?type=MBOM_Root&q=productId.object=="urn:ngsi-ld:Product:M000004670327"
```

或直接查询:

```http
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Root:M000004670327
```

### 7.3 遍历工序链

**功能**: 从根工序开始,沿`nextProcess`关系遍历所有工序

**算法逻辑**:

```python
# 伪代码
def traverse_process_chain(root_urn):
    root = GET(f"/entities/{root_urn}")
    current_process_urn = root["rootProcess"]["object"]
    
    process_chain = []
    while current_process_urn:
        process = GET(f"/entities/{current_process_urn}")
        process_chain.append(process)
        
        # 获取下一工序
        if "nextProcess" in process:
            current_process_urn = process["nextProcess"]["object"]
        else:
            break
    
    return process_chain
```

**起始请求示例**:

```http
# Step 1: 获取根
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Root:M000004670327

# Step 2: 获取首工序
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Process:M000004670327-10

# Step 3: 获取后续工序
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Process:M000004670327-20

# 继续直到 nextProcess 为空
```

### 7.4 查询工序的路线列表

**功能**: 查询某个工序包含的所有路线

**方法1: 通过工序实体的route属性**

```http
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Process:M000004670327-10
```

响应中包含`route`关系数组:

```json
{
  "id": "urn:ngsi-ld:MBOM_Process:M000004670327-10",
  "type": "MBOM_Process",
  "route": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:MBOM_Route:M000004670327-10-10"
    }
  ]
}
```

**方法2: 反向查询**

```http
GET /ngsi-ld/v1/entities?type=MBOM_Route&q=processRef.object=="urn:ngsi-ld:MBOM_Process:M000004670327-10"
```

(注: 需要MBOM_Route实体中存在`processRef`反向关系)

### 7.5 查询节拍的资源配置

**功能**: 查询某个节拍使用的工位、设备、检具等资源

**示例请求**:

```http
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Takt:M000004670327-10-10-10-01
```

**响应示例**:

```json
{
  "id": "urn:ngsi-ld:MBOM_Takt:M000004670327-10-10-10-01",
  "type": "MBOM_Takt",
  "usedStation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:FrontWelding"
  },
  "usedEquipment": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:AutoEquipment:361-900A"
    }
  ],
  "usedQCTool": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:QCTool:JG-FW-001"
    }
  ]
}
```

---

## 8. 批量查询与高级操作 (Batch Query & Advanced Operations)

### 8.1 批量实体查询

**端点**: `POST /entityOperations/query`

**功能**: 一次性查询多个实体(通过ID列表或复杂条件)

**请求体示例**:

```json
{
  "entities": [
    {
      "id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"
    },
    {
      "id": "urn:ngsi-ld:TwinObject:Station:FrontWelding"
    },
    {
      "id": "urn:ngsi-ld:Scene:FrontWelding_20250808_093512"
    }
  ]
}
```

**请求方式**:

```http
POST /ngsi-ld/v1/entityOperations/query
Content-Type: application/ld+json

{
  "entities": [...]
}
```

### 8.2 实体类型批量查询

**端点**: `POST /entityOperations/query`

**功能**: 按实体类型批量查询,支持复杂过滤条件

**请求体示例**:

```json
{
  "type": "TwinObject",
  "q": "subType.value=='AutoEquipment';equipmentType.value=='WeldingRobot'",
  "attrs": ["name", "equipmentType", "deployedAt"]
}
```

### 8.3 聚合查询(需扩展支持)

**功能**: 统计、分组、聚合查询

> **注**: 标准NGSI-LD API不直接支持聚合操作,需要:
> 1. 客户端自行实现聚合逻辑
> 2. 或使用FIWARE生态的扩展组件(如Cygnus + 大数据平台)

**客户端实现示例场景**:

**场景: 统计每个工位部署的设备数量**

```python
# 伪代码
stations = GET("/entities?type=TwinObject&q=subType.value=='Station'")

equipment_count = {}
for station in stations:
    station_urn = station["id"]
    equipment_list = GET(f"/entities?type=TwinObject&q=deployedAt.object=='{station_urn}'")
    equipment_count[station_urn] = len(equipment_list)

return equipment_count
```

---

## 9. 实时订阅与通知服务 (Subscription & Notification Services)

### 9.1 订阅机制概述

NGSI-LD支持订阅(Subscription)机制,当满足条件的实体发生变化时,平台主动推送通知到指定端点。

**适用场景**:
- 实时监控设备状态变化
- 实时接收生产场景完成通知
- 实时获取模态数据更新

### 9.2 创建订阅

**端点**: `POST /subscriptions`

**订阅结构**:

```json
{
  "id": "urn:ngsi-ld:Subscription:equipment-status-monitor",
  "type": "Subscription",
  "description": "监控设备状态变化",
  "entities": [
    {
      "type": "TwinObject"
    }
  ],
  "watchedAttributes": ["equipmentStatus"],
  "q": "subType.value=='AutoEquipment'",
  "notification": {
    "endpoint": {
      "uri": "https://your-app.com/api/notifications",
      "accept": "application/json"
    }
  }
}
```

**示例: 订阅某设备的模态数据变化**

```json
{
  "id": "urn:ngsi-ld:Subscription:modaldata-361-01173",
  "type": "Subscription",
  "entities": [
    {
      "type": "ModalData"
    }
  ],
  "q": "twinId.object=='urn:ngsi-ld:TwinObject:AutoEquipment:361-01173'",
  "notification": {
    "endpoint": {
      "uri": "https://your-analytics-app.com/api/receive-data",
      "accept": "application/ld+json"
    }
  }
}
```

**创建订阅请求**:

```http
POST /ngsi-ld/v1/subscriptions
Content-Type: application/ld+json

{
  "id": "urn:ngsi-ld:Subscription:...",
  ...
}
```

### 9.3 查询订阅列表

**端点**: `GET /subscriptions`

```http
GET /ngsi-ld/v1/subscriptions
```

### 9.4 删除订阅

**端点**: `DELETE /subscriptions/{subscriptionId}`

```http
DELETE /ngsi-ld/v1/subscriptions/urn:ngsi-ld:Subscription:equipment-status-monitor
```

### 9.5 通知回调格式

当订阅条件触发时,平台会向指定端点POST通知:

**通知结构示例**:

```json
{
  "id": "urn:ngsi-ld:Notification:...",
  "type": "Notification",
  "subscriptionId": "urn:ngsi-ld:Subscription:equipment-status-monitor",
  "notifiedAt": "2025-08-08T10:15:30Z",
  "data": [
    {
      "id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173",
      "type": "TwinObject",
      "equipmentStatus": {
        "type": "Property",
        "value": "Running"
      }
    }
  ]
}
```

---

## 10. 错误处理与状态码 (Error Handling & Status Codes)

### 10.1 标准HTTP状态码

| 状态码 | 含义 | 典型场景 |
|-------|------|---------|
| 200 OK | 成功 | 查询成功返回数据 |
| 201 Created | 创建成功 | 创建订阅成功 |
| 204 No Content | 成功无返回体 | 删除成功 |
| 400 Bad Request | 请求错误 | 参数格式错误 |
| 404 Not Found | 未找到 | 实体不存在 |
| 409 Conflict | 冲突 | 实体已存在(创建时) |
| 500 Internal Server Error | 服务器错误 | 平台内部错误 |

### 10.2 NGSI-LD错误响应格式

```json
{
  "type": "https://uri.etsi.org/ngsi-ld/errors/BadRequestData",
  "title": "Invalid entity data",
  "detail": "Missing required property 'type'",
  "status": 400
}
```

### 10.3 常见错误类型

| 错误类型 | 描述 |
|---------|------|
| `BadRequestData` | 请求数据格式错误 |
| `AlreadyExists` | 实体已存在 |
| `ResourceNotFound` | 资源未找到 |
| `InternalError` | 内部错误 |
| `InvalidRequest` | 无效请求 |

---

## 11. 性能优化建议 (Performance Optimization Guidelines)

### 11.1 查询优化

**1. 使用`attrs`参数减少返回字段**

```http
# 不推荐: 返回所有属性
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:AutoEquipment:361-01173

# 推荐: 只返回需要的属性
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:AutoEquipment:361-01173?attrs=name,equipmentStatus
```

**2. 合理使用`limit`参数**

```http
# 避免一次性查询大量数据
GET /ngsi-ld/v1/entities?type=ModalData&limit=50
```

**3. 使用批量查询代替多次单独查询**

```http
# 不推荐: 多次单独查询
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:AutoEquipment:361-01173
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:AutoEquipment:361-01309
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:AutoEquipment:361-900A

# 推荐: 批量查询
POST /ngsi-ld/v1/entityOperations/query
{
  "entities": [
    {"id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"},
    {"id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01309"},
    {"id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-900A"}
  ]
}
```

### 11.2 客户端缓存策略

- 对于低频变更的配置层实体(OrgUnit, Station, Equipment),客户端可缓存
- 对于高频变更的运行数据(ModalData),避免缓存或设置短TTL
- 利用HTTP缓存头(ETag, Last-Modified)

### 11.3 订阅 vs 轮询

- **实时性要求高**: 使用订阅机制(Subscription)
- **数据量大、频率低**: 使用定时轮询
- **混合策略**: 关键数据订阅,统计数据轮询

---

## 12. 安全与认证 (Security & Authentication)

### 12.1 认证机制

FIWARE平台通常集成Keyrock(身份管理)或其他OAuth2/OIDC服务。

**典型认证流程**:

1. 客户端向认证服务请求Access Token
2. 在API请求中携带Token

**请求头示例**:

```http
GET /ngsi-ld/v1/entities/...
Authorization: Bearer {access_token}
```

### 12.2 授权与访问控制

- 基于角色的访问控制(RBAC)
- 不同智能应用可分配不同权限(只读/读写)
- 敏感数据(如人员信息)可设置访问限制

### 12.3 API密钥管理

- 为每个智能应用分配独立API Key
- 定期轮换密钥
- 记录API调用日志用于审计

---

## 13. 实体类型速查表 (Entity Type Quick Reference)

| 实体类型 | 所属层级 | 主要用途 | 关键关系 |
|---------|---------|---------|---------|
| **TwinObject** | 所有层 | 孪生对象基类 | 通过subType区分子类 |
| **OrgUnit** (subType) | Resource | 组织单元 | parentOrg |
| **Station** (subType) | Resource | 工位 | stationLocation |
| **AutoEquipment** (subType) | Resource | 自动化设备 | deployedAt |
| **Person** (subType) | Resource | 人员 | holdsPosition, assignedRole |
| **Position** (subType) | Resource | 岗位 | assignedTo |
| **Role** | Resource | 角色 | - |
| **QCTool** (subType) | Resource | 检具 | - |
| **TransportEquip** (subType) | Resource | 运输设备 | - |
| **Material** (subType) | Resource | 物料 | - |
| **Product** (subType) | Resource | 产品 | - |
| **Workpiece** (subType) | Resource | 工件 | productType |
| **MBOM_Root** | Process | MBOM根 | rootProcess |
| **MBOM_Process** | Process | 工序 | route, nextProcess |
| **MBOM_Route** | Process | 路线 | step, nextRoute |
| **MBOM_Step** | Process | 工步 | takt, nextStep |
| **MBOM_Takt** | Process | 节拍 | usedStation, usedEquipment, usedQCTool |
| **Scene** | Execution | 生产场景 | workpieceId, taktRef |
| **Modality** | Execution | 数据模态定义 | - |
| **ModalityBinding** | Execution | 模态绑定 | twinId, modalityId |
| **ModalData** | Runtime | 运行数据 | twinId, sceneId, modalityId |

---

## 14. 典型查询场景示例 (Typical Query Scenarios)

### 场景1: 获取某工件的完整生产场景链

```http
# Step 1: 查询工件的所有场景
GET /ngsi-ld/v1/entities?type=Scene&q=workpieceId.object=="urn:ngsi-ld:Workpiece:M670-SN001"

# Step 2: 对每个场景,获取详细信息(包括stepLog)
GET /ngsi-ld/v1/entities/urn:ngsi-ld:Scene:FrontWelding_20250808_093512
GET /ngsi-ld/v1/entities/urn:ngsi-ld:Scene:RoofWelding_20250808_101234
...
```

### 场景2: 获取某设备在特定时间段的所有运行数据

```http
# 查询某设备的模态数据,按时间过滤
GET /ngsi-ld/v1/entities?type=ModalData&q=twinId.object=="urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"&limit=1000

# 客户端按 createdAt 或 observedAt 时间戳过滤
# 或使用时序API (如果平台支持)
GET /ngsi-ld/v1/temporal/entities?type=ModalData&q=twinId.object=="urn:ngsi-ld:TwinObject:AutoEquipment:361-01173"&timerel=between&timeAt=2025-08-08T09:00:00Z&endTimeAt=2025-08-08T10:00:00Z
```

### 场景3: 查询某工序的完整资源配置(工位+设备+人员)

```http
# Step 1: 获取工序实体
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Process:M000004670327-10

# Step 2: 遍历其路线
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Route:M000004670327-10-10

# Step 3: 遍历其工步
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Step:M000004670327-10-10-10

# Step 4: 获取节拍及其资源
GET /ngsi-ld/v1/entities/urn:ngsi-ld:MBOM_Takt:M000004670327-10-10-10-01
# 提取 usedStation, usedEquipment, usedQCTool

# Step 5: 查询工位配置的人员
GET /ngsi-ld/v1/entities?type=TwinObject&q=subType.value=='Person';holdsPosition.object.stationRef.object=="urn:ngsi-ld:TwinObject:Station:FrontWelding"
```

### 场景4: 查询某模态的所有绑定设备及其最新数据

```http
# Step 1: 查询模态绑定
GET /ngsi-ld/v1/entities?type=ModalityBinding&q=modalityId.object=="urn:ngsi-ld:Modality:WeldingCurrent_Auto"

# Step 2: 提取所有 twinId.object

# Step 3: 查询每个设备的最新数据
GET /ngsi-ld/v1/entities?type=ModalData&q=twinId.object=="urn:ngsi-ld:TwinObject:AutoEquipment:361-01173";modalityId.object=="urn:ngsi-ld:Modality:WeldingCurrent_Auto"&limit=1&options=temporalValues

# 按 createdAt 降序排序,取第一条(最新)
```

### 场景5: 获取完整MBOM树(工序→路线→工步→节拍)

```http
# 客户端实现递归遍历逻辑
# 伪代码:
root = GET("/entities/urn:ngsi-ld:MBOM_Root:M000004670327")
process_urn = root["rootProcess"]["object"]

mbom_tree = []
while process_urn:
    process = GET(f"/entities/{process_urn}")
    
    # 获取路线
    route_urns = [r["object"] for r in process["route"]]
    routes = [GET(f"/entities/{rurn}") for rurn in route_urns]
    
    # 对每个路线获取工步
    for route in routes:
        step_urns = [s["object"] for s in route["step"]]
        steps = [GET(f"/entities/{surn}") for surn in step_urns]
        
        # 对每个工步获取节拍
        for step in steps:
            takt_urns = [t["object"] for t in step["takt"]]
            takts = [GET(f"/entities/{turn}") for turn in takt_urns]
    
    mbom_tree.append({...})
    
    # 下一工序
    process_urn = process.get("nextProcess", {}).get("object")

return mbom_tree
```

---

## 15. 数据契约与版本管理 (Data Contract & Version Management)

### 15.1 实体Schema版本

每种实体类型都有对应的JSON Schema定义文件,如:
- `twinobject_core_schema.json`
- `mbom_process_schema.json`
- `modaldata_schema.json`

智能应用应参考这些Schema文件了解实体结构。

### 15.2 @context版本

实体的`@context`包含版本信息:

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/v1.0/autoequipment-context.jsonld"
  ]
}
```

### 15.3 向后兼容性

- **新增属性**: 不影响现有应用
- **废弃属性**: 保留但标记为deprecated
- **破坏性变更**: 升级context版本号(v1.0 → v2.0)

---

## 16. 最佳实践总结 (Best Practices Summary)

### 16.1 查询设计原则

1. **最小化数据传输**: 使用`attrs`参数只获取需要的属性
2. **合理分页**: 避免一次性查询大量数据,使用`limit`和`offset`
3. **缓存静态数据**: 配置层实体变化频率低,可在客户端缓存
4. **优先批量查询**: 减少HTTP请求次数

### 16.2 关系导航建议

1. **预先规划查询路径**: 了解实体关系图,避免冗余查询
2. **使用批量查询**: 查询关系链中的多个实体时,使用`POST /entityOperations/query`
3. **客户端实现遍历逻辑**: 对于链式结构(如MBOM流程链),客户端实现递归遍历

### 16.3 订阅策略

1. **关键数据订阅**: 设备状态、场景完成等关键事件使用订阅
2. **统计数据轮询**: 大批量历史数据分析使用定时轮询
3. **订阅管理**: 及时清理不再使用的订阅,避免资源浪费

### 16.4 错误处理

1. **健壮的错误处理**: 客户端应妥善处理404、500等错误
2. **重试机制**: 对于临时性网络错误,实现指数退避重试
3. **日志记录**: 记录API调用日志,便于问题排查

---

## 17. 附录 (Appendix)

### 17.1 NGSI-LD标准参考

- ETSI GS CIM 009: NGSI-LD API规范
- FIWARE Orion-LD文档: https://fiware-orion.readthedocs.io/

### 17.2 实体URN命名规范

```
urn:ngsi-ld:{EntityType}:{DomainPrefix}:{UniqueID}[:{Version}]
```

示例:
- `urn:ngsi-ld:TwinObject:AutoEquipment:361-01173`
- `urn:ngsi-ld:ModalityBinding:361-01173:WeldingCurrent_Auto:v1`

### 17.3 常用时间格式

所有时间属性使用ISO 8601格式:
- `2025-08-08T09:35:12Z` (UTC时间)
- `2025-08-08T17:35:12+08:00` (带时区)

### 17.4 Contact & Support

如有技术问题或需求变更,请联系数字孪生平台团队。

---

**文档结束**

版本历史:
- v1.0 (2025-11-10): 初始版本,基于FIWARE NGSI-LD标准
