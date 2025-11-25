# 角色数据转换说明文档

## 转换概览

本次转换成功将Excel格式的角色目录转换为符合NGSI-LD规范的JSON格式。

### 转换统计
- **源文件**: ROLE_CATALOG.xlsx
- **输出文件**: roles_ngsi_ld.json
- **转换数量**: 26个角色实体
- **验证状态**: ✅ 100%通过JSON Schema验证

## 数据映射规则

### 1. 必填字段映射

| Excel字段 | NGSI-LD字段 | 类型 | 处理方式 |
|-----------|-------------|------|----------|
| - | `@context` | 固定值 | 自动添加NGSI-LD上下文 |
| - | `id` | URN | 基于角色名称生成英文URN |
| - | `type` | 固定值 | 恒等于"Role" |
| `role_name_cn` | `name` | Property | 中文角色名称 |
| `responsibilities` | `responsibilities` | Property | 职责列表(如缺失则自动生成) |

### 2. 可选字段处理

| 字段 | 处理方式 |
|------|----------|
| `description` | 自动生成为"{角色名称}岗位职责定义" |
| `qualificationReq` | 如有资质要求,转换为Relationship数组 |
| `effectiveFrom` | 统一设置为"2025-01-01T00:00:00Z" |

### 3. 特殊处理逻辑

#### 角色ID生成
Excel中没有提供英文role_code,因此使用映射表将中文名称转换为驼峰式英文ID:

```python
中文: "焊接机械手操作工"
英文: "RoboticWeldingOperator"
URN: "urn:ngsi-ld:Role:RoboticWeldingOperator"
```

#### 职责自动生成
由于Excel中responsibilities字段为空,系统为每个角色生成了3条合理的默认职责。例如:

- **工具专员**: 
  - 管理和维护生产工具
  - 负责工具的发放和回收
  - 确保工具完好可用

#### 资质要求处理
唯一包含资质要求的角色是"焊接机械手操作工"(自动焊证书):

```json
"qualificationReq": [
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Qualification:AutomaticWeldingCert"
  }
]
```

## 转换后的数据结构

每个角色实体包含以下字段:

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/role-context.jsonld"
  ],
  "id": "urn:ngsi-ld:Role:{RoleID}",
  "type": "Role",
  "name": {
    "type": "Property",
    "value": "{中文角色名称}"
  },
  "description": {
    "type": "Property",
    "value": "{角色名称}岗位职责定义"
  },
  "responsibilities": {
    "type": "Property",
    "value": [
      "职责1",
      "职责2",
      "职责3"
    ]
  },
  "qualificationReq": [  // 可选,仅在有资质要求时出现
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Qualification:{QualificationID}"
    }
  ],
  "effectiveFrom": {
    "type": "Property",
    "value": "2025-01-01T00:00:00Z"
  }
}
```

## 转换的26个角色清单

| 序号 | 中文名称 | 英文ID | 是否有资质要求 |
|------|----------|--------|----------------|
| 1 | 工具专员 | ToolSpecialist | ❌ |
| 2 | 培训专员 | TrainingSpecialist | ❌ |
| 3 | 计工事务专员 | TimekeepingSpecialist | ❌ |
| 4 | 定额计工工程师 | QuotaEngineer | ❌ |
| 5 | 设备专员 | EquipmentSpecialist | ❌ |
| 6 | 调度主管 | SchedulingSupervisor | ❌ |
| 7 | 材料专员 | MaterialSpecialist | ❌ |
| 8 | 安全专员 | SafetySpecialist | ❌ |
| 9 | 铝电焊工 | AluminumWelder | ❌ |
| 10 | 焊接机械手操作工 | RoboticWeldingOperator | ✅ |
| 11 | 车体装配工 | BodyAssembler | ❌ |
| 12 | 加工中心操作工 | MachiningCenterOperator | ❌ |
| 13 | 天车司机 | OverheadCraneOperator | ❌ |
| 14 | 叉车司机 | ForkliftOperator | ❌ |
| 15 | 牵引车司机 | TractorOperator | ❌ |
| 16 | 机械钳工 | Fitter | ❌ |
| 17 | 维修电工 | MaintenanceElectrician | ❌ |
| 18 | 报工员 | ProductionReporter | ❌ |
| 19 | 探伤工 | NDTInspector | ❌ |
| 20 | 巡守工 | PatrolWorker | ❌ |
| 21 | 管理工 | ManagementWorker | ❌ |
| 22 | 主任 | Director | ❌ |
| 23 | 副厂长 | DeputyPlantManager | ❌ |
| 24 | 厂长 | PlantManager | ❌ |
| 25 | 工艺技术 | ProcessTechnician | ❌ |
| 26 | 中层助理 | MiddleManagementAssistant | ❌ |

## Schema验证结果

✅ **所有26个角色实体均通过JSON Schema验证**

验证项目包括:
- 必填字段完整性检查
- 数据类型验证
- URN格式验证(正则表达式匹配)
- 数组元素唯一性验证
- 字段值约束验证

## 数据质量说明

### 已处理的问题
1. **缺失的role_code**: 通过映射表生成英文ID
2. **空的responsibilities**: 为每个角色生成了合理的默认职责
3. **中文资质名称**: 转换为符合URN格式的英文标识符

### 建议改进
虽然当前数据已符合NGSI-LD规范,但为了提高数据质量,建议:

1. **补充真实的职责描述**: 当前使用的是自动生成的通用职责,建议由业务部门提供实际的岗位职责
2. **完善资质要求**: 仅1个角色有资质要求,建议补充其他关键岗位的资质要求
3. **添加其他可选字段**: 如permissionSet(系统权限)、kpiOwnership(KPI归属)等
4. **补充组织范围**: 添加orgScope和ownerOrg字段,明确角色的组织归属

## 使用说明

### 导入到系统
生成的JSON文件可以直接导入到支持NGSI-LD的系统中:

```bash
# 使用NGSI-LD API批量导入
curl -X POST \
  'http://your-context-broker/ngsi-ld/v1/entityOperations/create' \
  -H 'Content-Type: application/json' \
  -d @roles_ngsi_ld.json
```

### 查询示例
导入后可以使用NGSI-LD查询:

```bash
# 查询所有角色
GET /ngsi-ld/v1/entities?type=Role

# 查询特定角色
GET /ngsi-ld/v1/entities/urn:ngsi-ld:Role:RoboticWeldingOperator
```

## 附录:完整示例

### 示例1:基础角色(无资质要求)
```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/role-context.jsonld"
  ],
  "id": "urn:ngsi-ld:Role:ToolSpecialist",
  "type": "Role",
  "name": {
    "type": "Property",
    "value": "工具专员"
  },
  "description": {
    "type": "Property",
    "value": "工具专员岗位职责定义"
  },
  "responsibilities": {
    "type": "Property",
    "value": [
      "管理和维护生产工具",
      "负责工具的发放和回收",
      "确保工具完好可用"
    ]
  },
  "effectiveFrom": {
    "type": "Property",
    "value": "2025-01-01T00:00:00Z"
  }
}
```

### 示例2:包含资质要求的角色
```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/role-context.jsonld"
  ],
  "id": "urn:ngsi-ld:Role:RoboticWeldingOperator",
  "type": "Role",
  "name": {
    "type": "Property",
    "value": "焊接机械手操作工"
  },
  "description": {
    "type": "Property",
    "value": "焊接机械手操作工岗位职责定义"
  },
  "responsibilities": {
    "type": "Property",
    "value": [
      "操作自动焊接机械手",
      "监控焊接过程",
      "处理设备异常"
    ]
  },
  "qualificationReq": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Qualification:AutomaticWeldingCert"
    }
  ],
  "effectiveFrom": {
    "type": "Property",
    "value": "2025-01-01T00:00:00Z"
  }
}
```
