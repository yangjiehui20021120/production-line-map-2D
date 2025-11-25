# MBOM Context 新增属性速查表

## 新增属性汇总 (17个)

| 序号 | 属性名 | 类型 | 来源Schema | 中文说明 |
|-----|--------|------|-----------|---------|
| 1 | `taktCount` | Property | route | 节拍总数 |
| 2 | `routeConstraints` | Property | route | 路线级约束条件 |
| 3 | `processCount` | Property | takt | 工序总数 |
| 4 | `estimatedDuration` | Property | takt, process | 估计持续时间 |
| 5 | `allowedStations` | Relationship | route, takt | 允许使用的工位列表 |
| 6 | `allowedBuffers` | Relationship | route, takt | 允许使用的缓冲区列表 |
| 7 | `taktConstraints` | Property | takt | 节拍级约束条件 |
| 8 | `transferPoint` | Property | takt | 转运点定义 |
| 9 | `stepCount` | Property | process | 工步总数 |
| 10 | `requiredTooling` | Relationship | process | 所需工装列表 |
| 11 | `processVersion` | Property | process | 工序版本号 |
| 12 | `criticality` | Property | process | 关键程度等级 |
| 13 | `qualityGateRequired` | Property | process | 是否需要质量门 |
| 14 | `requiredRoles` | Relationship | root, process | 所需人员角色列表 |
| 15 | `requiredEquipmentTypes` | Relationship | root, process | 所需设备类型列表 |
| 16 | `isOptional` | Property | step | 是否为可选工步 |
| 17 | `canRunInParallel` | Property | step | 是否可并行执行 |

---

## 按来源Schema分类

### mbom_route_schema.json (2个)
- ✅ `taktCount` (Property) - 节拍总数
- ✅ `routeConstraints` (Property) - 路线级约束条件

### mbom_takt_schema.json (5个)
- ✅ `processCount` (Property) - 工序总数
- ✅ `estimatedDuration` (Property) - 估计持续时间
- ✅ `allowedStations` (Relationship) - 允许使用的工位列表
- ✅ `allowedBuffers` (Relationship) - 允许使用的缓冲区列表
- ✅ `taktConstraints` (Property) - 节拍级约束条件
- ✅ `transferPoint` (Property) - 转运点定义

### mbom_process_schema.json (7个)
- ✅ `stepCount` (Property) - 工步总数
- ✅ `requiredTooling` (Relationship) - 所需工装列表
- ✅ `processVersion` (Property) - 工序版本号
- ✅ `criticality` (Property) - 关键程度等级
- ✅ `qualityGateRequired` (Property) - 是否需要质量门
- ✅ `requiredRoles` (Relationship) - 所需人员角色列表
- ✅ `requiredEquipmentTypes` (Relationship) - 所需设备类型列表

### mbom_step_schema.json (2个)
- ✅ `isOptional` (Property) - 是否为可选工步
- ✅ `canRunInParallel` (Property) - 是否可并行执行

### mbom_root_schema.json (0个新增)
注: root schema中的属性在之前版本中已完整定义

---

## 按类型分类

### Property类型 (11个)
1. taktCount
2. routeConstraints
3. processCount
4. estimatedDuration
5. taktConstraints
6. transferPoint
7. stepCount
8. processVersion
9. criticality
10. qualityGateRequired
11. isOptional
12. canRunInParallel

### Relationship类型 (6个)
1. allowedStations
2. allowedBuffers
3. requiredTooling
4. requiredRoles
5. requiredEquipmentTypes

---

## Context定义格式示例

### Property类型示例
```json
"taktCount": {
  "@id": "mbom:taktCount",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "节拍总数"
}
```

### Relationship类型示例
```json
"allowedStations": {
  "@id": "mbom:allowedStations",
  "@type": "ngsi-ld:Relationship",
  "rdfs:comment": "允许使用的工位列表"
}
```

---

## 统计信息

| 项目 | 数量 |
|-----|------|
| 修改前定义总数 | 78 |
| 新增定义数 | 17 |
| 修改后定义总数 | 95 |
| Property类型 | 58 |
| Relationship类型 | 31 |
| 其他类型 | 6 |
| 总行数 | 551 |

---

## 质量检查清单

- [x] 所有Schema中的业务属性已包含
- [x] 无重复定义
- [x] JSON格式验证通过
- [x] @id命名规范统一 (mbom:propertyName)
- [x] @type类型正确 (Property/Relationship)
- [x] 所有定义包含rdfs:comment
- [x] 与NGSI-LD规范兼容
