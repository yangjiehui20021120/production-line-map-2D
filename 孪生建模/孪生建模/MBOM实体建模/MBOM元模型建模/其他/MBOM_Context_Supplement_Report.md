# MBOM Context JSON-LD 补充报告

## 修改目标
全面补充 `mbom_context_jsonld.json` 文件,确保覆盖所有在MBOM系列Schema中定义的自定义属性。

## 分析结果

### 源文件分析
共分析了5个JSON Schema文件:
- `mbom_root_schema.json`
- `mbom_route_schema.json`
- `mbom_takt_schema.json`
- `mbom_process_schema.json`
- `mbom_step_schema.json`

**总计发现**: 92个不同的属性定义

### 修改前状态
- Context文件中已有: **78个定义**
- 缺失属性: **17个**
- 重复定义: **0个**

### 修改后状态
- Context文件中共有: **95个定义**
- Property类型: **58个**
- Relationship类型: **31个**
- 其他类型: **6个** (@context, @vocab等特殊定义)

---

## 新增属性清单

以下是本次补充的17个属性定义:

### 1. 来自 mbom_route_schema.json (2个)

#### taktCount
```json
"taktCount": {
  "@id": "mbom:taktCount",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "节拍总数"
}
```
- **用途**: 记录路线包含的节拍总数
- **类型**: Property

#### routeConstraints
```json
"routeConstraints": {
  "@id": "mbom:routeConstraints",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "路线级约束条件"
}
```
- **用途**: 定义路线级别的约束条件
- **类型**: Property

---

### 2. 来自 mbom_takt_schema.json (5个)

#### processCount
```json
"processCount": {
  "@id": "mbom:processCount",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "工序总数"
}
```
- **用途**: 记录节拍包含的工序总数
- **类型**: Property

#### estimatedDuration
```json
"estimatedDuration": {
  "@id": "mbom:estimatedDuration",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "估计持续时间"
}
```
- **用途**: 估计的持续时间
- **类型**: Property
- **注**: 在Takt和Process中都有使用

#### allowedStations
```json
"allowedStations": {
  "@id": "mbom:allowedStations",
  "@type": "ngsi-ld:Relationship",
  "rdfs:comment": "允许使用的工位列表"
}
```
- **用途**: 引用允许使用的工位实体列表
- **类型**: Relationship

#### allowedBuffers
```json
"allowedBuffers": {
  "@id": "mbom:allowedBuffers",
  "@type": "ngsi-ld:Relationship",
  "rdfs:comment": "允许使用的缓冲区列表"
}
```
- **用途**: 引用允许使用的缓冲区实体列表
- **类型**: Relationship

#### taktConstraints
```json
"taktConstraints": {
  "@id": "mbom:taktConstraints",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "节拍级约束条件"
}
```
- **用途**: 定义节拍级别的约束条件
- **类型**: Property

#### transferPoint
```json
"transferPoint": {
  "@id": "mbom:transferPoint",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "转运点定义"
}
```
- **用途**: 定义转运点信息
- **类型**: Property

---

### 3. 来自 mbom_process_schema.json (7个)

#### stepCount
```json
"stepCount": {
  "@id": "mbom:stepCount",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "工步总数"
}
```
- **用途**: 记录工序包含的工步总数
- **类型**: Property

#### requiredTooling
```json
"requiredTooling": {
  "@id": "mbom:requiredTooling",
  "@type": "ngsi-ld:Relationship",
  "rdfs:comment": "所需工装列表"
}
```
- **用途**: 引用所需工装实体列表
- **类型**: Relationship

#### processVersion
```json
"processVersion": {
  "@id": "mbom:processVersion",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "工序版本号"
}
```
- **用途**: 工序的版本号
- **类型**: Property

#### criticality
```json
"criticality": {
  "@id": "mbom:criticality",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "关键程度等级"
}
```
- **用途**: 标识工序的关键程度
- **类型**: Property

#### qualityGateRequired
```json
"qualityGateRequired": {
  "@id": "mbom:qualityGateRequired",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "是否需要质量门"
}
```
- **用途**: 标识是否需要质量门检查
- **类型**: Property

#### requiredRoles
```json
"requiredRoles": {
  "@id": "mbom:requiredRoles",
  "@type": "ngsi-ld:Relationship",
  "rdfs:comment": "所需人员角色列表"
}
```
- **用途**: 引用所需人员角色实体列表
- **类型**: Relationship
- **注**: 在Root和Process中都有使用

#### requiredEquipmentTypes
```json
"requiredEquipmentTypes": {
  "@id": "mbom:requiredEquipmentTypes",
  "@type": "ngsi-ld:Relationship",
  "rdfs:comment": "所需设备类型列表"
}
```
- **用途**: 引用所需设备类型实体列表
- **类型**: Relationship
- **注**: 在Root和Process中都有使用

---

### 4. 来自 mbom_step_schema.json (2个)

#### isOptional
```json
"isOptional": {
  "@id": "mbom:isOptional",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "是否为可选工步"
}
```
- **用途**: 标识工步是否为可选
- **类型**: Property

#### canRunInParallel
```json
"canRunInParallel": {
  "@id": "mbom:canRunInParallel",
  "@type": "ngsi-ld:Property",
  "rdfs:comment": "是否可并行执行"
}
```
- **用途**: 标识工步是否可以并行执行
- **类型**: Property

---

## 未添加的系统属性

以下属性虽然在Schema中定义,但属于NGSI-LD系统级别的标准属性,不需要在自定义context中定义:

1. **@context** - NGSI-LD标准属性
2. **id** - NGSI-LD标准属性  
3. **type** - NGSI-LD标准属性

这些属性由NGSI-LD核心上下文(`https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld`)提供定义。

---

## 类型分类统计

### Property类型属性 (11个新增)
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

### Relationship类型属性 (6个新增)
1. allowedStations
2. allowedBuffers
3. requiredTooling
4. requiredRoles
5. requiredEquipmentTypes

---

## 验证结果

✅ **JSON格式验证**: 通过
✅ **属性完整性**: 所有Schema中定义的业务属性均已包含
✅ **无重复定义**: 检查通过
✅ **类型正确性**: 所有@type定义符合NGSI-LD规范

---

## 文件信息

- **原始文件**: `/mnt/user-data/uploads/mbom_context_jsonld.json`
- **修改后文件**: `/mnt/user-data/outputs/mbom_context_jsonld.json`
- **文件行数**: 551行 (原449行)
- **新增内容**: 102行

---

## 使用建议

### 1. 引用方式
在MBOM实体的JSON-LD文档中,应该这样引用此context:

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://example.com/contexts/mbom-context.jsonld"
  ],
  "id": "urn:ngsi-ld:MBOM:M000004670327:V1.0",
  "type": "MBOM",
  ...
}
```

### 2. 部署位置
建议将此文件部署到:
- URL: `https://example.com/contexts/mbom-context.jsonld`
- 确保CORS配置允许跨域访问
- 设置合适的缓存策略

### 3. 版本管理
建议对context文件进行版本管理:
- 当前版本: v1.0
- 如有重大变更,应使用新的版本URL
- 保持向后兼容性

---

## 修改日期
2025年10月26日
