# 工位数据转换结果

## 📋 文件说明

本目录包含从Excel文件转换而来的工位(Station)实体数据:

- **stations_output.json** - 主输出文件,包含9个工位实体的JSON数组
- **conversion_report.md** - 详细的转换报告,包含统计信息和质量分析
- **README.md** - 本说明文件

## ✅ 转换质量

- ✓ **100%成功率**: 9/9条数据成功转换
- ✓ **Schema合规**: 完全符合NGSI-LD标准和Station Schema V1.0规范
- ✓ **必填字段**: 所有实体都包含必需的stationCategory字段
- ✓ **枚举值验证**: 所有枚举值都在Schema定义的范围内
- ✓ **结构完整**: 所有实体包含完整的核心字段

## 📊 数据概览

### 工位类型分布
- **生产工位 (ProductionStation)**: 8个
  - 侧墙组焊工位 (ST-HJ)
  - 侧墙补焊工位 (ST-BH)
  - 侧墙调修工位 (ST-TX)
  - 侧墙大线打磨工位 (ST-DX)
  - 侧墙加工工位A (ST-JG-A)
  - 侧墙加工工位B (ST-JG-B)
  - 侧墙精细打磨工位 (ST-JX)
  - 侧墙附件工位 (ST-FJ)

- **缓存区 (BufferZone)**: 1个
  - 定置区 (BF)

### 容量统计
- 最小容量: 1件 (ST-JX 精细打磨工位)
- 最大容量: 24件 (BF 定置区)
- 平均容量: ~5.4件

### 安全特征
- 6个工位标识有危险作业(Lifting - 起重)
- 2个工位无危险作业标识

## 🔧 使用方式

### 1. 导入数字孪生平台

```bash
# 直接使用JSON文件
curl -X POST https://your-platform/api/entities \
  -H "Content-Type: application/json" \
  -d @stations_output.json
```

### 2. 单个实体访问

JSON文件是一个数组,每个元素都是独立的NGSI-LD实体:

```python
import json

with open('stations_output.json') as f:
    stations = json.load(f)

# 访问第一个工位
first_station = stations[0]
print(first_station['code']['value'])  # ST-HJ
print(first_station['name']['value'])  # 侧墙组焊工位
```

### 3. 查询和过滤

```python
# 查找生产工位
production_stations = [
    s for s in stations 
    if s['stationCategory']['value'] == 'ProductionStation'
]

# 查找有危险作业的工位
hazard_stations = [
    s for s in stations 
    if 'hazardFlags' in s
]

# 按容量排序
sorted_stations = sorted(
    stations, 
    key=lambda s: s['capacityWip']['value'], 
    reverse=True
)
```

## 📖 字段说明

### 核心字段 (所有工位都有)
- `id`: NGSI-LD唯一标识符
- `code`: 工位代码
- `name`: 工位中文名称
- `twinType`: 固定为"Constituent"
- `subType`: 固定为"Station"
- `functionCategory`: 功能类别(F1.4.x)
- `twinLevel`: 层级,固定为3
- `partOf`: 所属产线(TS361202)
- `stationCategory`: 工位类别
- `capacityWip`: 在制品容量
- `statusTracking`: 状态追踪配置

### 可选字段
- `hazardFlags`: 危险作业标记(数组)
- `aliasCode`: 别名/旧编码(数组)
- `description`: 备注说明
- `location`: 坐标位置(GeoProperty)
- `areaCode`: 区域代码
- `zoneId`: 分区ID

## 🎯 后续改进建议

1. **补充空间信息**
   - 添加区域(areaCode)和分区(zoneId)
   - 从CAD图纸提取坐标信息

2. **关联设备和人员**
   - 补充deployedEquipment(部署设备清单)
   - 补充requiredRoles(所需岗位)
   - 补充compatibleProcCodes(可执行工序)

3. **增强环境信息**
   - layoutInfo(布局信息)
   - environmentalSpec(环境规格)
   - utilityConnections(公用工程接口)

4. **完善安全管理**
   - 对有hazardFlags的工位补充safetyRequirements
   - 详细说明PPE要求和安全规程

## 📞 技术支持

如有问题,请查看:
- `conversion_report.md` - 详细转换报告
- `station_guide.md` - Station设计文档
- `station_schema.json` - Schema规范

---

**生成日期**: 2025-10-27  
**Schema版本**: V1.0  
**数据来源**: station.xlsx (TS361202侧墙产线)
