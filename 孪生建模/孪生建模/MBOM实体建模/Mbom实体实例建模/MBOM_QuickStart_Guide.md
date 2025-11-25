# MBOM实体实例 - 快速开始指南

## 📦 生成的文件

本次生成包含以下文件：

### 1. JSON实体文件（2个）
- `mbom_M000004670327_entities.json` - 产品M000004670327的119个实体
- `mbom_M000004803474_entities.json` - 产品M000004803474的115个实体

### 2. 文档文件（2个）
- `MBOM_Entity_Generation_Documentation.md` - 完整的生成说明文档
- `MBOM_QuickStart_Guide.md` - 本快速开始指南

---

## ✅ 验证结果

```
📦 文件1: mbom_M000004670327_entities.json
   - MBOMRoot: 1 个
   - Route: 1 个
   - Takt: 11 个
   - Process: 27 个
   - Step: 79 个
   ✅ 总计: 119 个实体

📦 文件2: mbom_M000004803474_entities.json
   - MBOMRoot: 1 个
   - Route: 1 个
   - Takt: 11 个
   - Process: 27 个
   - Step: 75 个
   ✅ 总计: 115 个实体

🎉 所有实体均符合NGSI-LD标准和Schema规范
```

---

## 🚀 快速使用

### 方式1: 单独导入每个产品

```bash
# 导入产品1
curl -X POST "http://localhost:1026/ngsi-ld/v1/entityOperations/create" \
  -H "Content-Type: application/ld+json" \
  -d @mbom_M000004670327_entities.json

# 导入产品2
curl -X POST "http://localhost:1026/ngsi-ld/v1/entityOperations/create" \
  -H "Content-Type: application/ld+json" \
  -d @mbom_M000004803474_entities.json
```

### 方式2: 合并后批量导入

```bash
# 合并两个文件
jq -s 'add' mbom_M000004670327_entities.json mbom_M000004803474_entities.json > mbom_all_234_entities.json

# 批量导入234个实体
curl -X POST "http://localhost:1026/ngsi-ld/v1/entityOperations/create" \
  -H "Content-Type: application/ld+json" \
  -d @mbom_all_234_entities.json
```

---

## 🔍 关键信息速查

### 实体ID格式

| 层级 | ID格式 | 示例 |
|------|--------|------|
| MBOMRoot | `urn:ngsi-ld:MBOM:{产品代码}:V1.0` | `urn:ngsi-ld:MBOM:M000004670327:V1.0` |
| Route | `urn:ngsi-ld:MBOM:{路线代码}:V1.0` | `urn:ngsi-ld:MBOM:RT_M000004670327:V1.0` |
| Takt | `urn:ngsi-ld:MBOM:{产品}:T{节拍序号:02d}` | `urn:ngsi-ld:MBOM:M000004670327:T01` |
| Process | `urn:ngsi-ld:MBOM:{产品}:T{节拍}:P{工序:04d}` | `urn:ngsi-ld:MBOM:M000004670327:T01:P0010` |
| Step | `urn:ngsi-ld:MBOM:{产品}:T{节拍}:P{工序}:S{工步:02d}` | `urn:ngsi-ld:MBOM:M000004670327:T01:P0010:S01` |

### 自动填充的字段

以下字段在Excel中缺失，已自动生成：

| 字段 | 自动生成规则 | 示例值 |
|------|-------------|--------|
| `mbomCode` | `MBOM_{productCode}` | `MBOM_M000004670327` |
| `mbomName` | `{productCode}侧墙制造BOM` | `M000004670327侧墙制造BOM` |
| `mbomVersion` | 固定 | `V1.0` |
| `routeName` | `{productCode}侧墙工艺路线` | `M000004670327侧墙工艺路线` |
| `effectiveFrom` | 固定 | `2025-01-01T00:00:00Z` |
| `stationCode`（缺失时） | 默认 | `ST-UNKNOWN` |

---

## 📊 常用查询

### 查询某产品的MBOM根实体

```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="MBOMRoot";productCode.value=="M000004670327"
```

### 查询某路线的所有节拍

```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="Takt";partOfRoute.object=="urn:ngsi-ld:MBOM:RT_M000004670327:V1.0"
```

### 查询某节拍的所有工序

```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="Process";partOfTakt.object=="urn:ngsi-ld:MBOM:M000004670327:T01"
```

### 查询特定工位的所有工步

```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="Step";stationCode.value=="BF"
```

### 查询标准工时大于30分钟的工步

```http
GET /ngsi-ld/v1/entities?type=MBOM&q=mbomType=="Step";stdTime.value>30
```

---

## ⚠️ 重要提醒

1. **版本号**: 所有实体当前版本为`V1.0`，如需更新版本，请修改生成脚本
2. **双向关系**: 所有父子关系已正确建立，删除实体时注意维护关系完整性
3. **枚举验证**: 状态字段仅接受`draft`, `active`, `retired`, `deprecated`
4. **时间单位**: 所有时间字段单位统一为`MIN`（分钟）

---

## 📖 详细文档

需要更多信息？请查看：
- **完整文档**: `MBOM_Entity_Generation_Documentation.md`
- **Schema规范**: `/mnt/project/mbom_*_schema.json`
- **架构说明**: `/mnt/project/mbom_schemas_readme.md`

---

## 🎯 下一步建议

1. ✅ 验证JSON格式（已通过）
2. ⬜ 导入到NGSI-LD Context Broker
3. ⬜ 执行查询验证关系完整性
4. ⬜ 根据实际需求调整自动填充字段
5. ⬜ 建立版本管理流程

---

**生成时间**: 2025-01-21  
**总实体数**: 234个  
**文件数量**: 2个JSON + 2个文档
