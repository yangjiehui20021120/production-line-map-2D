# AutoEquipment实例数据 - 交付包

## 📦 文件清单

### 1. 核心输出文件
- **autoequipment_instances.json** - 33个设备实例的完整JSON数据
- **转换说明文档.md** - 详细的转换说明和使用指南

### 2. 源文件(参考)
- 生产设备.xls - 原始数据源
- autoequipment_schema.json - JSON Schema规范
- autoequipment_design.md - AutoEquipment设计文档

## 🎯 快速开始

### 查看生成的数据
```bash
# 使用jq查看格式化的JSON
cat autoequipment_instances.json | jq '.[0]'

# 查看所有设备名称
cat autoequipment_instances.json | jq '.[].name.value'

# 按设备类型筛选
cat autoequipment_instances.json | jq '.[] | select(.deviceType.value=="Robot")'
```

### 导入数字孪生平台
```bash
# NGSI-LD批量创建
curl -X POST 'http://your-platform/ngsi-ld/v1/entityOperations/create' \
  -H 'Content-Type: application/ld+json' \
  -d @autoequipment_instances.json
```

## 📊 数据概览

| 项目 | 数值 |
|------|------|
| 设备总数 | 33 |
| 机器人 (Robot) | 3 |
| 焊机 (Welder) | 18 |
| 数控机床 (CNC) | 2 |
| 其他设备 (Other) | 10 |

### 供应商分布TOP3
1. 珠海市福尼斯焊接技术有限公司 (14台)
2. 北京起重设备厂 (4台)
3. 德国FOOKE公司 (2台)

### 工位分布
- 侧墙组焊工位 (TS36120201): 13台
- 动车侧墙辅生产线 (TS361202): 9台
- 侧墙附件组焊工位 (TS36120204): 7台
- 侧墙加工工位 (TS36120203): 4台

## ✅ 数据质量

### 必填字段完整性: 100%
所有33个实例均包含完整的NGSI-LD必填字段和AutoEquipment必填字段。

### 可选字段覆盖率
- 供应商信息: 100%
- 型号信息: 100%
- 序列号: 90.9%
- 功率: 90.9%
- 重量: 100%
- 尺寸: 100%
- 出厂日期: 100%
- 安装日期: 100%
- 工位信息: 100%

## ⚠️ 注意事项

1. **维护提醒**: 5台设备维护已逾期,12台设备30天内需维护
2. **数据异常**: 部分设备的nextMaintenanceDate早于lastMaintenanceDate,需核查
3. **供应商数据**: 发现1条疑似错误的供应商记录("2025.07.02")

## 📖 详细文档

完整的转换规则、字段映射、使用示例请参考 **转换说明文档.md**

## 🔧 技术规范

- **标准**: NGSI-LD v1.0
- **Schema**: autoequipment_schema.json
- **上下文**: https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld
- **编码**: UTF-8
- **格式**: JSON

## 📞 联系方式

数字孪生架构组
版本: V1.0
日期: 2025-10-28

---

**状态**: ✅ 数据转换成功,已通过Schema验证,可直接使用
