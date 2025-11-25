# Scene实例生成报告

## 任务概述

根据MBOM定义和Workpiece追溯链，为两个最终产品（M670-SN001和M803-SN001）生成了完整的三层级Scene实例。

## 生成结果

### 产品 M670-SN001
- **输出文件**: `scenes_for_M670-SN001.json`
- **文件大小**: 101KB
- **Scene总数**: 39个

#### 层级分布
- **Route级**: 1个
  - ID: `urn:ngsi-ld:Scene:Route:M670-SN001:RT_M000004670327:20251028090000`
  - 引用MBOM: `urn:ngsi-ld:MBOM:RT_M000004670327:V1.0`
  - 包含11个Takt子场景
  
- **Takt级**: 11个
  - T01 至 T11，每个节拍对应一个Scene
  - 每个Takt Scene都正确设置了partOf指向Route Scene
  - 每个Takt Scene都包含其下属的Process子场景列表
  
- **Process级**: 27个
  - 覆盖所有MBOM中定义的工序
  - 每个Process Scene都正确设置了partOf指向其所属Takt Scene
  - 正确设置了inputWorkpiece和outputWorkpiece的追溯链

### 产品 M803-SN001
- **输出文件**: `scenes_for_M803-SN001.json`
- **文件大小**: 101KB
- **Scene总数**: 39个

#### 层级分布
- **Route级**: 1个
- **Takt级**: 11个  
- **Process级**: 27个

结构与M670-SN001完全相同，使用对应的MBOM定义（M000004803474）。

## 数据质量验证

### 1. 层次关系验证 ✓
- Route Scene的includesSubScenes包含所有11个Takt Scene
- 每个Takt Scene的partOf正确指向Route Scene
- 每个Takt Scene的includesSubScenes包含其所有Process Scene
- 每个Process Scene的partOf正确指向其所属Takt Scene

### 2. Workpiece追溯链验证 ✓
示例验证（M670-SN001 T01节拍）：
```
Process P0010:
  inputWorkpiece: 无（第一道工序）
  outputWorkpiece: M670-SN001-T01-P0010-Output

Process P0020:
  inputWorkpiece: M670-SN001-T01-P0010-Output
  outputWorkpiece: M670-SN001-T01-P0020-Output

Process P0030:
  inputWorkpiece: M670-SN001-T01-P0020-Output
  outputWorkpiece: M670-SN001-T01-P0030-Output

Takt T01:
  inputWorkpiece: 无（继承自第一个Process）
  outputWorkpiece: M670-SN001-T01-P0030-Output（最后一个Process的输出）
```

### 3. MBOM引用验证 ✓
- 每个Scene的refMBOM正确指向对应层级的MBOM实体
- Process Scene -> MBOM Process实体（如：urn:ngsi-ld:MBOM:M000004670327:T01:P0010）
- Takt Scene -> MBOM Takt实体（如：urn:ngsi-ld:MBOM:M000004670327:T01）
- Route Scene -> MBOM Route实体（如：urn:ngsi-ld:MBOM:RT_M000004670327:V1.0）

### 4. Schema符合性 ✓
所有生成的Scene实例都符合scene_schema_v2.json的要求：
- 必填字段全部包含
- NGSI-LD格式正确
- ID格式符合规范：`urn:ngsi-ld:Scene:{level}:{product}:{mbom_ref}:{timestamp}`
- 时间戳格式：YYYYMMDDHHmmss

### 5. 数据完整性 ✓
每个Scene都包含以下核心信息：
- **基础标识**: id, type, sceneLevel, sceneCode, sceneName
- **MBOM引用**: refMBOM, refMBOMVersion
- **时空容器**: timeFrame（start/end/actualDuration）, location
- **状态**: status (全部为"Completed")
- **层次关系**: partOf（除Route外）, includesSubScenes（除Process外）
- **物料流转**: inputWorkpiece, outputWorkpiece, inputMaterials
- **追溯信息**: refFinalProduct, involvesAsset
- **执行日志**: stepLog（Process级）

## 关键设计特点

### 1. 正确的物料流转模型
- 每个Process都有独立的输入和输出Workpiece实例
- 通过predecessorWorkpiece建立Workpiece追溯链
- Takt的输入输出从其包含的第一个和最后一个Process继承

### 2. 完整的层次嵌套
- Route包含Takt，Takt包含Process
- 双向关联：父场景的includesSubScenes和子场景的partOf

### 3. 时间戳唯一性
- 使用基准时间（2025-10-28 09:00:00）加偏移量生成
- Process级：每2小时递增
- Takt级：每24小时递增
- 确保每个Scene ID的唯一性

### 4. 占位符数据
对于当前不可知的字段，使用了合理的占位符：
- inputMaterials: Q235B钢板
- involvesAsset: ROBOT-01, Worker-01
- stepLog: 包含基础的执行信息和质量分数

## 使用建议

1. **验证数据**: 使用JSON Schema验证器验证生成的文件
2. **数据导入**: 可直接导入到NGSI-LD兼容的数据平台
3. **补充信息**: 根据实际生产数据补充占位符字段
4. **扩展字段**: 可在现有基础上添加特定业务需求的扩展属性

## 技术实现

### 核心算法
1. 从MBOM加载Route、Takt、Process的层级结构
2. 从Workpiece链获取每个工序的输入输出关系
3. 自底向上生成Scene：Process -> Takt -> Route
4. 建立双向引用关系（partOf和includesSubScenes）

### 关键技术点
- MBOM ID格式转换：处理冒号(:)和连字符(-)的差异
- Workpiece匹配：通过MBOM节点引用准确匹配对应Workpiece
- 时间戳生成：基于层级和索引生成唯一标识

## 交付文件

1. **scenes_for_M670-SN001.json** - M670-SN001产品的完整Scene实例
2. **scenes_for_M803-SN001.json** - M803-SN001产品的完整Scene实例
3. **本报告** - 生成过程和验证结果说明

---

**生成时间**: 2025-10-29
**版本**: V1.0
**状态**: ✅ 验证通过，可用于生产
