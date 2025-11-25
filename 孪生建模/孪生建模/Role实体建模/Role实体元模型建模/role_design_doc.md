# Role角色实体元模型设计说明文档

## 1. 概述

### 1.1 背景与定位

Role(角色)实体是数字孪生系统中用于定义岗位职责、权限和技能要求的标准化数字抽象,相当于一份**数字化的"岗位说明书"**。Role实体是实现"职责与个体解耦"这一核心建模公理的关键机制,它将业务流程中的责任主体从具体人员抽象为岗位角色,使组织结构与业务流程实现解耦。

**核心价值**:
- **模型稳定性**: 人员变动时无需修改流程模板,只需更新人员指派关系
- **语义一致性**: 不同系统对同一岗位有统一理解和定义
- **责任清晰性**: 每个流程环节都有明确的岗位责任主体
- **权限管理**: 作为基于角色的访问控制(RBAC)的基础
- **可审计性**: 支持完整的责任链追溯和问责

### 1.2 Role在责任链中的位置

```
┌─────────────────────────────────────────┐
│  MBOM/Scene Template (流程设计)         │
│  - 定义需要哪些Role                      │
│  - 使用RACI矩阵分配职责                  │
│  - 不硬编码具体人员                      │
└──────────────┬──────────────────────────┘
               ↓ 引用
┌─────────────────────────────────────────┐
│  Role (岗位定义 - 静态蓝图)              │
│  - 职责清单 (responsibilities)          │
│  - 权限集合 (permissionSet)             │
│  - 资质要求 (qualificationReq)          │
└──────────────┬──────────────────────────┘
               ↓ 映射 (通过Assignment)
┌─────────────────────────────────────────┐
│  Assignment (人岗指派 - 动态契约)        │
│  - 谁(personId)在何时(validFrom/To)     │
│  - 担任什么角色(roleId)                  │
└──────────────┬──────────────────────────┘
               ↓ 执行
┌─────────────────────────────────────────┐
│  Scene.stepLog (执行日志 - 追溯证据)    │
│  - 记录personId + roleId                │
│  - 支持责任链审计                        │
└─────────────────────────────────────────┘
```

### 1.3 设计原则

1. **职责与个体解耦**: Role定义"岗位需要做什么",不关心"具体谁来做"
2. **静态稳定性**: Role作为静态蓝图,相对稳定,不频繁变更
3. **标准化可复用**: 同一Role定义可被多个流程、多个场景复用
4. **完整性约束**: 必须完整列举岗位职责,不能遗漏
5. **可验证性**: 通过qualificationReq确保只有合格人员可被指派

## 2. 核心属性详解

### 2.1 必填属性

#### **id (唯一标识符)**
```json
{
  "id": "urn:ngsi-ld:Role:WeldingTeamLeader"
}
```
- **格式**: `urn:ngsi-ld:Role:{RoleName}`
- **命名建议**: 使用英文,包含岗位语义信息
- **唯一性**: 全局唯一,建议采用驼峰命名法
- **示例**: WeldingTeamLeader(焊接班组长), IEEngineer(IE工程师), QualitySupervisor(质量主管)

#### **type (实体类型)**
```json
{
  "type": "Role"
}
```
- 固定值,标识实体类型为Role
- 用于NGSI-LD系统的实体识别和路由

#### **name (角色名称)**
```json
{
  "name": {
    "type": "Property",
    "value": "焊接班组长"
  }
}
```
- **人类可读**: 中文岗位名称,便于业务人员理解
- **长度限制**: 1-100字符
- **对应关系**: 通常与id的名称部分对应

#### **responsibilities (职责清单)**
```json
{
  "responsibilities": {
    "type": "Property",
    "value": [
      "落实工序质量检查与自检互检",
      "响应处置焊接异常并组织5Why分析",
      "协调人员保障产线节拍与异常支援"
    ]
  }
}
```
- **核心字段**: Role模型中最重要的业务属性
- **必须完整**: 完整列举岗位的核心职责,不能遗漏
- **最小数量**: 至少包含1项职责
- **描述规范**: 每项职责应清晰、具体、可操作
- **业务价值**: 明确"岗位需要做什么",为后续问责提供依据

### 2.2 权限与资质属性

#### **permissionSet (系统权限集合)**
```json
{
  "permissionSet": {
    "type": "Property",
    "value": [
      "MES_ResolveAndon",
      "MES_ConfirmProcess",
      "MES_ApproveQualityIssue"
    ]
  }
}
```
- **用途**: 定义IT系统中授予该角色的操作权限码
- **格式**: 大写字母+下划线,如`SYSTEM_ACTION`
- **RBAC基础**: 用于基于角色的访问控制
- **唯一性**: 数组元素不重复
- **应用场景**: MES系统、ERP系统、数字孪生平台等的功能权限控制

#### **qualificationReq (资质要求)**
```json
{
  "qualificationReq": {
    "type": "Relationship",
    "object": [
      "urn:ngsi-ld:Qualification:SeniorWelderCert",
      "urn:ngsi-ld:Qualification:ISO9001Auditor"
    ]
  }
}
```
- **关系类型**: Relationship,引用Qualification实体
- **作用**: 确保只有具备相应资质的人员才可被指派
- **验证机制**: Assignment创建时,系统自动校验人员是否持有所需资质
- **资质过期处理**: 如人员资质过期,Assignment自动变为Suspended状态
- **合规保障**: 防止无资质人员执行关键操作

### 2.3 绩效与组织属性

#### **kpiOwnership (KPI归属)**
```json
{
  "kpiOwnership": {
    "type": "Property",
    "value": [
      "CycleTimeVariance",
      "LaborUtilization",
      "FirstTimeYield"
    ]
  }
}
```
- **明确责任**: 该角色负责监控或改进的KPI指标
- **绩效考核**: 为岗位绩效评估提供量化依据
- **持续改进**: 明确各岗位的改进目标和方向

#### **orgScope (适用组织范围)**
```json
{
  "orgScope": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:OrgUnit:ProductionDept"
  }
}
```
- **范围限定**: 限定该Role在哪些组织单元内有效
- **多组织支持**: 大型企业中同名岗位在不同部门可能有不同定义
- **权限边界**: 配合Assignment的orgId实现组织级权限控制

#### **relatedFunctions (关联功能单元)**
```json
{
  "relatedFunctions": {
    "type": "Relationship",
    "object": [
      "urn:ngsi-ld:Function:F2.3.1",
      "urn:ngsi-ld:Function:F2.3.2"
    ]
  }
}
```
- **功能映射**: 将岗位职责映射到企业功能架构
- **架构对齐**: 使人力资源与组织功能体系相对应
- **战略一致**: 支持组织战略分解到岗位层面

### 2.4 治理与溯源属性

#### **effectiveFrom / effectiveTo (有效期)**
```json
{
  "effectiveFrom": {
    "type": "Property",
    "value": "2025-01-01T00:00:00Z"
  },
  "effectiveTo": {
    "type": "Property",
    "value": "2025-12-31T23:59:59Z"
  }
}
```
- **时间管理**: 标注角色定义的有效时间范围
- **版本演进**: 支持Role定义的历史版本管理
- **effectiveTo为空**: 表示当前仍然有效
- **应用场景**: 组织架构调整、岗位合并拆分等

#### **ownerOrg (归口管理部门)**
```json
{
  "ownerOrg": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:OrgUnit:IE-Team"
  }
}
```
- **管理责任**: 明确哪个部门负责该Role的定义和维护
- **治理需要**: 支持岗位管理的责任归属
- **变更流程**: Role定义变更需由归口部门审批

#### **policyRef (策略引用)**
```json
{
  "policyRef": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Policy:HR-RoleStd-V1"
  }
}
```
- **政策依据**: 引用该Role设定所依据的政策或制度文件
- **合规追溯**: 为Role定义提供制度依据
- **审计支持**: 证明Role定义符合公司规范

## 3. 典型应用场景

### 3.1 场景模板设计

在MBOM或Scene模板中定义职责时,使用RACI矩阵引用Role:

```json
{
  "responsibilityFlow": [
    {
      "stepId": "WeldingStage01",
      "responsible": "urn:ngsi-ld:Role:Welder",
      "accountable": "urn:ngsi-ld:Role:WeldingTeamLeader"
    },
    {
      "stepId": "QualityCheck01",
      "responsible": "urn:ngsi-ld:Role:Inspector",
      "accountable": "urn:ngsi-ld:Role:QualitySupervisor"
    }
  ]
}
```

**关键约束**:
- 每个步骤必须有唯一的Accountable(A)
- 每个步骤必须至少有一个Responsible(R)
- 绝不允许硬编码具体人员ID

### 3.2 人员指派与执行

**场景启动前检查**:
1. 系统检查Scene所需的每个Role
2. 验证是否有有效的Assignment覆盖
3. 确保"一岗一人"(不允许空岗或多人)
4. 验证被指派人员的资质是否满足Role要求

**执行过程**:
1. 系统根据Assignment找到具体人员
2. 按Role自动派发任务到对应人员客户端
3. 人员以Role身份执行任务
4. stepLog同时记录personId和roleId

### 3.3 责任链审计

通过SQL查询验证责任链完整性:

```sql
-- 检查是否存在未授权执行
SELECT l.sceneId, l.performedBy_personId, l.performedBy_roleId
FROM StepLog l
LEFT JOIN Assignment a 
  ON a.assigneeId = l.performedBy_personId
  AND a.roleId = l.performedBy_roleId
  AND l.timestamp BETWEEN a.validFrom AND COALESCE(a.validTo, '9999-12-31')
WHERE a.assigneeId IS NULL;
```

发现无匹配Assignment的记录即为未授权操作,需要问责。

## 4. 三个典型Role示例

### 4.1 焊接班组长 (现场管理角色)

```json
{
  "id": "urn:ngsi-ld:Role:WeldingTeamLeader",
  "type": "Role",
  "name": {"type": "Property", "value": "焊接班组长"},
  "responsibilities": {
    "type": "Property",
    "value": [
      "落实工序质量检查与自检互检",
      "响应处置焊接异常并组织5Why分析",
      "协调人员保障产线节拍与异常支援",
      "主持班前会传达生产质量指标"
    ]
  },
  "permissionSet": {
    "type": "Property",
    "value": ["MES_ResolveAndon", "MES_ConfirmProcess"]
  },
  "qualificationReq": {
    "type": "Relationship",
    "object": ["urn:ngsi-ld:Qualification:SeniorWelderCert"]
  },
  "kpiOwnership": {
    "type": "Property",
    "value": ["WeldingQualityRate", "AndonResponseTime"]
  }
}
```

### 4.2 IE工程师 (效率改进角色)

```json
{
  "id": "urn:ngsi-ld:Role:IEEngineer",
  "type": "Role",
  "name": {"type": "Property", "value": "IE工程师"},
  "responsibilities": {
    "type": "Property",
    "value": [
      "分析产线瓶颈并设计流程优化方案",
      "优化工位布局与物流以减少等待浪费",
      "测定标准工时并评估改进成效"
    ]
  },
  "permissionSet": {
    "type": "Property",
    "value": ["MES_AdjustPlan", "MES_ModifyWorkflow"]
  },
  "qualificationReq": {
    "type": "Relationship",
    "object": ["urn:ngsi-ld:Qualification:IE-Level2"]
  },
  "kpiOwnership": {
    "type": "Property",
    "value": ["CycleTimeVariance", "LaborUtilization"]
  }
}
```

### 4.3 质量主管 (质量审核角色)

```json
{
  "id": "urn:ngsi-ld:Role:QualitySupervisor",
  "type": "Role",
  "name": {"type": "Property", "value": "质量主管"},
  "responsibilities": {
    "type": "Property",
    "value": [
      "审批生产过程中的质量问题并确定处置措施",
      "签发返工或让步放行指令并监督执行",
      "分析质量数据以推动持续改进"
    ]
  },
  "permissionSet": {
    "type": "Property",
    "value": ["MES_ApproveQualityIssue", "MES_IssueReworkOrder"]
  },
  "qualificationReq": {
    "type": "Relationship",
    "object": ["urn:ngsi-ld:Qualification:QualityMgrCert"]
  },
  "kpiOwnership": {
    "type": "Property",
    "value": ["FirstTimeYield", "CustomerComplaintRate"]
  }
}
```

## 5. 约束规则与合规检查

### 5.1 设计阶段约束

1. **RACI唯一性**: Scene的每个步骤必须有唯一A和至少一个R
2. **禁止硬编码人员**: MBOM/Scene中不得出现personId,只能引用roleId
3. **职责完整性**: responsibilities数组不能为空,必须至少包含1项
4. **权限码格式**: permissionSet中的权限码必须符合`^[A-Z_]+$`正则

### 5.2 运行时检查

1. **一岗一人**: Scene启动时检查每个Role是否有且仅有一个有效Assignment
2. **资质验证**: Assignment的人员必须满足Role的qualificationReq
3. **日志完整性**: stepLog必须同时记录personId和roleId
4. **角色匹配**: stepLog中的roleId必须与流程定义的Role一致

### 5.3 审计检查

1. **未授权操作检测**: 通过SQL关联stepLog和Assignment,找出无匹配指派的执行记录
2. **资质过期检测**: 定期检查Assignment中人员的资质是否在有效期内
3. **权限越权检测**: 检查stepLog中的操作是否超出Role的permissionSet范围

## 6. 与其他实体的关系

### 6.1 与MBOM/Scene的关系
- **MBOM定义需要**: 在responsibilityFlow中引用Role
- **Scene继承使用**: Scene实例继承MBOM的Role需求
- **不可硬编码**: 绝不在模板中直接指定人员

### 6.2 与Assignment的关系
- **Role是静态蓝图**: 定义"需要什么岗位"
- **Assignment是动态映射**: 定义"谁在何时担任该岗位"
- **一一对应**: 执行时每个Role必须有唯一Assignment

### 6.3 与TwinObject:Person的关系
- **间接关系**: Role不直接引用Person
- **通过Assignment桥接**: Role→Assignment→Person
- **实现解耦**: 人员变动不影响Role定义

### 6.4 与Qualification的关系
- **资质约束**: qualificationReq引用Qualification实体
- **准入控制**: 只有持有所需资质的人员才可被指派
- **动态验证**: Assignment创建时自动校验资质

## 7. 实施建议

### 7.1 Role定义建议
1. **粒度适中**: 不要过细(如"焊接工-正面焊")或过粗(如"生产人员")
2. **职责清晰**: responsibilities描述要具体、可操作、可考核
3. **权限最小化**: permissionSet只授予必要权限,遵循最小权限原则
4. **资质合理**: qualificationReq设置要符合实际,不过高也不过低

### 7.2 模型校验建议
1. **Schema校验**: 使用AJV等工具在CI/CD中自动校验Role定义
2. **业务规则校验**: 检查RACI矩阵完整性、禁止硬编码人员等
3. **定期审计**: 通过SQL审计检查责任链完整性

### 7.3 变更管理建议
1. **版本化**: 重大Role变更时创建新版本,保留旧版本
2. **影响分析**: 变更前分析影响哪些MBOM、Scene和Assignment
3. **逐步迁移**: 给予过渡期,逐步从旧Role迁移到新Role

## 8. 总结

Role实体元模型通过将岗位职责数字化、标准化,实现了"职责与个体解耦"的核心设计理念。它是数字孪生责任链的静态基础,与Assignment的动态映射相结合,构建了完整的、可追溯的责任体系。

**核心价值**:
- ✅ 模型稳定性 - 人员变动不影响流程定义
- ✅ 责任清晰性 - 每个环节都有明确岗位负责
- ✅ 权限可控性 - 基于角色的访问控制(RBAC)
- ✅ 过程可追溯 - 完整的责任链审计能力
- ✅ 组织灵活性 - 支持组织架构调整和优化

通过严格遵循本元模型的设计规范和约束规则,企业可以构建起可信、可控、可审计的数字孪生责任管理体系,为生产过程的持续改进和质量管理提供坚实的数据基础。