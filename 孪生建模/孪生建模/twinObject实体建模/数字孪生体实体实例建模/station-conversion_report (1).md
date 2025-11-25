# 工位数据转换报告

## 转换概要

**转换时间**: 2025-10-27  
**源数据**: station.xlsx - Sheet1  
**目标格式**: NGSI-LD标准JSON  
**Schema版本**: V1.0

---

## 数据统计

### 总体统计
- **输入记录数**: 9条有效工位数据
- **成功转换数**: 9个工位实体
- **转换成功率**: 100%

### 工位类别分布
| 工位类别 | 数量 | 百分比 |
|---------|------|--------|
| ProductionStation (生产工位) | 8 | 88.9% |
| BufferZone (缓存区) | 1 | 11.1% |

### 工位详细列表
| 序号 | 工位代码 | 工位名称 | 类别 | 容量 | 危险作业 | 别名 |
|------|----------|----------|------|------|----------|------|
| 1 | ST-HJ | 侧墙组焊工位 | ProductionStation | 5 | ✓ | TS36120201 |
| 2 | ST-BH | 侧墙补焊工位 | ProductionStation | 2 | ✓ | TS36120201 |
| 3 | ST-TX | 侧墙调修工位 | ProductionStation | 3 | ✓ | TS36120202 |
| 4 | ST-DX | 侧墙大线打磨工位 | ProductionStation | 2 | ✓ | TS36120204 |
| 5 | ST-JG-A | 侧墙加工工位A | ProductionStation | 2 | - | TS36120203 |
| 6 | ST-JG-B | 侧墙加工工位B | ProductionStation | 2 | - | TS36120203 |
| 7 | ST-JX | 侧墙精细打磨工位 | ProductionStation | 1 | ✓ | TS36120204 |
| 8 | ST-FJ | 侧墙附件工位 | ProductionStation | 6 | ✓ | TS36120204 |
| 9 | BF | 定置区 | BufferZone | 24 | - | - |

---

## 转换规则说明

### 1. 字段映射规则

#### 核心字段
- `station_code` → `code` (Property)
- `station_name_cn` → `name` (Property)
- `line_code` → `partOf` (Relationship, 引用产线URN)
- `capacity_wip` → `capacityWip` (Property)
- `is_buffer` → 用于判断`stationCategory`

#### 自动生成字段
- `id`: 格式为 `urn:ngsi-ld:TwinObject:Station:{station_code}`
- `type`: 固定为 `TwinObject`
- `twinType`: 固定为 `Constituent`
- `subType`: 固定为 `Station`
- `twinLevel`: 固定为 `3` (工位级)
- `functionCategory`: 根据工位类别自动映射到F1.4.x系列

#### 可选字段
- `area_code` → `areaCode` (Property, 如果CSV中有值)
- `zone_id` → `zoneId` (Property, 如果CSV中有值)
- `coordinate_x`, `coordinate_y` → `location` (GeoProperty, 如果两者都有值)
- `hazard_flags` → `hazardFlags` (Property, 解析后的枚举值)
- `alias_codes` → `aliasCode` (Property, 解析为数组)
- `notes` → `description` (Property, 如果有备注)

### 2. 工位类别判断逻辑

```
IF is_buffer == TRUE:
    stationCategory = "BufferZone"
ELSE IF 名称包含 ['检验', '检测', '质检', '测量']:
    stationCategory = "InspectionStation"
ELSE IF 名称包含 ['装配', '组装', '总装']:
    stationCategory = "AssemblyStation"
ELSE IF 名称包含 ['搬运', '转运', '上下料']:
    stationCategory = "HandlingStation"
ELSE:
    stationCategory = "ProductionStation"  # 默认
```

### 3. 危险标记映射

原始CSV中的危险标记使用中文描述(如"AQFX-0035物理打击"),转换时映射到Schema定义的英文枚举值:

| 中文关键词 | Schema枚举值 |
|-----------|-------------|
| 焊接 | Welding |
| 起重/起吊 | Lifting |
| 物理打击/物体打击 | Lifting |
| 机械伤害 | Lifting |
| 高压 | HighVoltage |
| 高温 | HighTemperature |
| 受限空间 | ConfinedSpace |
| 化学 | Chemical |
| 辐射 | Radiation |
| 噪声 | Noise |

**注意**: 本次数据中所有危险作业都被映射为`Lifting`(起重),因为原始数据主要涉及物理打击、起重伤害、机械伤害等。

### 4. 功能类别映射

| 工位类别 | 功能类别代码 | 说明 |
|---------|-------------|------|
| ProductionStation | F1.4.1 | 生产加工 |
| InspectionStation | F1.4.2 | 质量检验 |
| AssemblyStation | F1.4.3 | 装配组装 |
| BufferZone | F1.4.4 | 缓存暂存 |
| HandlingStation | F1.4.5 | 物料搬运 |

### 5. 状态追踪配置

所有工位自动添加`statusTracking`配置:

```json
{
  "trackOccupancy": true,        // 所有工位追踪占用状态
  "trackThroughput": true,       // 所有工位追踪产出
  "trackCycleTime": true/false,  // 仅生产工位追踪节拍
  "trackQuality": true/false     // 仅生产和检验工位追踪质量
}
```

---

## Schema合规性

### 必填字段检查
✓ 所有实体都包含以下必填字段:
- `@context`
- `id`
- `type`
- `twinType`
- `subType`
- `stationCategory` (Station特有必填字段)

### 数据类型检查
✓ 所有字段的`type`属性符合NGSI-LD规范:
- Property字段使用 `"type": "Property"`
- Relationship字段使用 `"type": "Relationship"`
- GeoProperty字段使用 `"type": "GeoProperty"`

### 枚举值检查
✓ 所有枚举字段的值都在Schema定义的范围内:
- `stationCategory`: ProductionStation, BufferZone
- `hazardFlags`: Lifting

---

## 数据质量说明

### 完整度
- **工位代码**: 100% (9/9)
- **工位名称**: 100% (9/9)
- **产线编码**: 100% (9/9)
- **容量**: 100% (9/9)
- **区域代码**: 0% (0/9) - CSV中未提供
- **分区ID**: 0% (0/9) - CSV中未提供
- **坐标信息**: 0% (0/9) - CSV中未提供
- **危险标记**: 66.7% (6/9)
- **别名**: 88.9% (8/9)

### 数据特点
1. **所有工位隶属同一产线**: TS361202 (侧墙产线)
2. **容量范围**: 1-24件,缓存区容量最大(24件)
3. **危险作业**: 6个工位有危险作业标识,主要为起重相关
4. **别名系统**: 8个工位有历史编码别名

---

## 输出文件

### 文件信息
- **文件名**: `stations_output.json`
- **文件大小**: ~12KB
- **编码格式**: UTF-8
- **格式化**: 2空格缩进,便于阅读

### JSON结构
```
[
  {Station实体1},
  {Station实体2},
  ...
  {Station实体9}
]
```

### 使用方式
该JSON数组可直接导入数字孪生平台,每个对象都是独立的NGSI-LD实体,可单独或批量使用。

---

## 建议与后续工作

### 数据补充建议
1. **区域和分区信息**: 建议补充`areaCode`和`zoneId`,以支持空间层级管理
2. **坐标信息**: 建议从CAD图纸中提取坐标,支持3D可视化
3. **部署设备**: 建议补充`deployedEquipment`关系,关联工位上的设备
4. **可执行工序**: 建议补充`compatibleProcCodes`,用于工序分配
5. **所需岗位**: 建议补充`requiredRoles`,用于人员排班

### 扩展字段建议
对于生产环境,可考虑补充以下可选字段:
- `layoutInfo`: 工位布局信息(尺寸、方向)
- `environmentalSpec`: 环境规格要求(温度、湿度)
- `utilityConnections`: 公用工程接口(电、气、水)
- `operatingSchedule`: 运行排班计划
- `safetyRequirements`: 安全要求详细说明

---

## 技术说明

### 转换工具
- **语言**: Python 3.12
- **主要库**: pandas, openpyxl, json
- **脚本**: `convert_station_data.py`

### 转换流程
1. 读取Excel文件(跳过前4行元数据)
2. 清洗数据(移除空行)
3. 逐行转换为NGSI-LD格式
4. 应用映射规则和业务逻辑
5. 验证必填字段
6. 输出JSON数组

### 可维护性
转换脚本采用模块化设计,主要函数包括:
- `parse_hazard_flags()`: 危险标记解析
- `parse_alias_codes()`: 别名解析
- `determine_station_category()`: 工位类别判断
- `determine_function_category()`: 功能类别映射
- `create_station_json()`: 单个工位转换

---

**报告生成时间**: 2025-10-27  
**版本**: V1.0
