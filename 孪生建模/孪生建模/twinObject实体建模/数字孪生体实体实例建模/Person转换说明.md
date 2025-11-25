# Person实体数据转换报告

## 任务概述

将 `person.xlsx` 中的69条人员数据转换为符合 `person_schema.json` 规范的NGSI-LD格式JSON实体实例。

## 转换结果

✅ **成功转换: 69条人员记录**

- **输出文件**: `person_instances.json`
- **文件大小**: 186KB
- **生成时间**: 2025-10-27
- **Schema版本**: V1.0

## 数据映射关系

### 1. 核心字段映射

| Excel列名 | JSON字段 | 映射规则 |
|-----------|---------|---------|
| person_code | id, employeeId | `urn:ngsi-ld:TwinObject:Person:EMP-{8位补零编号}` |
| display_name | name, specifications | 完全脱敏显示为"员工编号EMP-XXXXXXXX" |
| eligible_roles | hasRole | 通过角色映射表转换为Role URN |
| shift_group | workgroup, orgUnit | 直接使用,同时生成组织单元URN |
| status | stateAttr.attendance_status | active→在岗, 其他→离岗 |

### 2. 角色映射表

| 原始角色(中文) | 标准Role URN | 功能分类 |
|---------------|-------------|---------|
| 产线管理 | urn:ngsi-ld:Role:ProductionLineManager | F1.1.1 |
| 铝电焊工 | urn:ngsi-ld:Role:AluminumWelder | F1.2.1 |
| 焊接机械手操作工 | urn:ngsi-ld:Role:RobotWeldOperator | F1.2.2 |
| 车体装配工 | urn:ngsi-ld:Role:BodyAssembler | F1.2.3 |
| 加工中心操作工 | urn:ngsi-ld:Role:CNCOperator | F1.3.1 |

### 3. 技能标签推断

根据角色自动分配标准技能标签:

- **产线管理**: `Skill.Management.L2`, `Skill.Safety.Expert`
- **铝电焊工**: `Skill.Welder.L2`, `Skill.Safety.L2`
- **焊接机械手操作工**: `Skill.RobotOperation.L2`, `Skill.Welder.L1`
- **车体装配工**: `Skill.Assembly.L2`, `Skill.Safety.L1`
- **加工中心操作工**: `Skill.CNCOperation.L2`, `Skill.Machining.L2`

### 4. 默认值填充

以下字段使用了合理的默认值:

| 字段 | 默认值 | 说明 |
|------|--------|------|
| twinType | Constituent | 人员属于构成性对象 |
| twinLevel | 4 | 人员孪生层级为4 |
| employmentType | FullTime | 假设所有人员为全职 |
| hireDate | 2024-01-01 | 使用统一默认入职日期 |
| personalDataMask | Full | 完全脱敏 |
| consentLevel | Essential | 基本授权级别 |
| qualificationLevel | 根据角色推断 | Senior/Intermediate/Junior |
| shiftPattern | 根据班组推断 | 有"班"字样为Rotating-3Shift,否则Fixed-Day |

## 数据统计

### 角色分布
```
车体装配工 (BodyAssembler)         : 20人 (29.0%)
铝电焊工 (AluminumWelder)          : 16人 (23.2%)
加工中心操作工 (CNCOperator)        : 15人 (21.7%)
产线管理 (ProductionLineManager)    : 10人 (14.5%)
焊接机械手操作工 (RobotWeldOperator) :  8人 (11.6%)
```

### 班组分布
```
侧墙附件班         : 31人 (44.9%)
侧墙组装班-组焊    : 14人 (20.3%)
侧墙加工班         : 12人 (17.4%)
产线管理           : 10人 (14.5%)
侧墙组装班-调修    :  2人 ( 2.9%)
```

### 资格等级分布
```
Intermediate (中级): 39人 (56.5%)
Junior (初级)      : 20人 (29.0%)
Senior (高级)      : 10人 (14.5%)
```

## 数据质量验证

✅ **所有验证项通过**

### 验证项清单

1. ✅ **必填字段完整性**: 所有69个实体包含全部必填字段
   - 核心字段: id, type, name, twinType, subType, functionCategory, twinLevel, hasRole
   - Person特有字段: employeeId, department, orgUnit, employmentType

2. ✅ **字段格式正确性**: 
   - employeeId格式: `EMP-[8位数字]` (69/69)
   - 技能标签格式: `Skill.[Domain].[Level]` (69/69)
   - URN格式: `urn:ngsi-ld:[EntityType]:[ID]` (69/69)

3. ✅ **NGSI-LD封装规范**:
   - Property类型字段正确封装为 `{type: "Property", value: ...}`
   - Relationship类型字段正确封装为 `{type: "Relationship", object: "urn:..."}`

## 隐私保护措施

本转换严格遵循数据脱敏要求:

1. **姓名脱敏**: 
   - `name.value` 字段使用 "员工编号EMP-XXXXXXXX" 替代真实姓名
   - 真实姓名经过加密存储在 `specifications.real_name_encrypted`
   - 同时保留姓名哈希值用于唯一性校验

2. **脱敏级别**: 
   - 所有实体设置 `personalDataMask = "Full"` (完全脱敏)
   - 符合GDPR和个人信息保护法要求

3. **数据授权**:
   - 所有实体设置 `consentLevel = "Essential"` (基本授权)
   - 限定数据仅用于必要的生产管理场景

## 文件结构

生成的JSON文件采用以下结构:

```json
{
  "entities": [
    { ... Person实体1 ... },
    { ... Person实体2 ... },
    ...
  ],
  "metadata": {
    "total_count": 69,
    "generated_at": "2025-10-27T13:36:05.339964",
    "schema_version": "V1.0",
    "source_file": "person.xlsx"
  }
}
```

## 使用说明

### 1. 导入数字孪生平台

```bash
# 批量导入所有实体
POST /ngsi-ld/v1/entityOperations/upsert
Content-Type: application/json

{导入person_instances.json中的entities数组}
```

### 2. 单个实体查询

```bash
# 按ID查询
GET /ngsi-ld/v1/entities/urn:ngsi-ld:TwinObject:Person:EMP-00005979

# 按员工编号查询
GET /ngsi-ld/v1/entities?type=TwinObject&q=employeeId.value=="EMP-00005979"
```

### 3. 按角色筛选

```bash
# 查询所有焊工
GET /ngsi-ld/v1/entities?type=TwinObject&q=hasRole.object=="urn:ngsi-ld:Role:AluminumWelder"
```

## 注意事项

1. **入职日期**: 当前使用统一默认值 `2024-01-01`,实际使用时建议从HR系统补充真实数据

2. **证书信息**: 原始Excel中 `certifications` 列为空,未生成证书数据。如需补充,请更新Excel后重新转换

3. **上级关系**: 未设置 `supervisor` 字段,如需建立汇报关系,请补充组织架构数据

4. **团队角色**: 未设置 `teamRole` 字段,如需标识组长等特殊角色,请额外标注

## 后续优化建议

1. **数据补充**:
   - 从HR系统同步真实入职日期
   - 补充员工证书信息
   - 建立组织层级和汇报关系

2. **动态更新**:
   - 定期同步人员状态(离职、调岗)
   - 更新证书有效期
   - 维护技能认证记录

3. **集成应用**:
   - 与排班系统集成,更新实时班次信息
   - 与考勤系统集成,更新在岗状态
   - 与培训系统集成,更新技能等级

## 联系方式

如有问题或需要进一步定制,请联系数字孪生架构团队。

---

**文档版本**: V1.0  
**生成日期**: 2025-10-27  
**转换工具**: convert_person_data.py
