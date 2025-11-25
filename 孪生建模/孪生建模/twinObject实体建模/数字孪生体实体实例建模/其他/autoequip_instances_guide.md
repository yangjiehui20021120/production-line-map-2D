# 侧墙产线自动化设备实例建模说明
## 版本: V1.0 | 创建日期: 2025-10-16

---

## 1. 设备清单概览

| 序号 | twin_code | 中文名称 | deviceType | 所在工位 | 厂商 |
|------|-----------|----------|------------|----------|------|
| 1 | ROBOT-R01 | 机文名 | Robot | 工位工-DX | 雅浦 |
| 2 | IGM-WELDER-A01 | IGM焊接机器人A01 | Welder | ST-HJ | IGM |
| 3 | IGM-WELDER-A02 | IGM焊接机器人A02 | Welder | ST-HJ | IGM |
| 4 | IGM-WELDER-A03 | IGM焊接机器人A03 | Welder | ST-HJ | IGM |
| 5 | IGM-WELDER-A04 | IGM焊接机器人A04 | Welder | ST-HJ | IGM |
| 6 | WELD-ROBOT-A01 | 大线订做机器人A01 | Robot | ST-DX | 雅浦 |
| 7 | FOOKE-ROBOT-01 | 数控加工中心01 | Robot | ST-JG-A | FOOKE |
| 8 | FOOKE-ROBOT-02 | 数控加工中心02 | Robot | ST-JG-B | FOOKE |
| 9 | ABB-ROBOT-A01 | 侧摆窗口封闭机器人A01 | Robot | ST-JX | ABB |
| 10 | ABB-ROBOT-A02 | 侧摆窗口封闭机器人A02 | Robot | ST-JX | ABB |

**注**: 实际清单显示10个设备(您说9个可能是笔误)

---

## 2. 建模策略

### 2.1 设备分类

#### Welder (焊机) - 4台
- IGM-WELDER-A01~A04: IGM品牌焊接设备

#### Robot (机器人) - 6台
- ROBOT-R01: 雅浦机器人(工位工-DX)
- WELD-ROBOT-A01: 雅浦焊接机器人
- FOOKE-ROBOT-01/02: FOOKE数控加工中心
- ABB-ROBOT-A01/02: ABB侧摆窗口封闭机器人

### 2.2 字段补充策略

**必填字段**:
- 核心模型: id, type, twinType, subType, functionCategory
- 特有字段: deviceType

**推荐补充字段** (基于设备类型):
- **Welder**: currentRange, weldingProcessTypes, powerRating
- **Robot**: axes, payload, reach, repeatability

**合理假设** (用于演示):
- 技术参数: 基于厂商典型规格
- 安装位置: 基于工位编码
- 日期: 2024年投产

---

## 3. 文件命名规范

```
实例文件命名: {twin_code}_instance.json
配置文件: autoequip_instances_config.json (汇总配置)
```

---

## 4. 实例文件结构

每个JSON文件包含:
1. **NGSI-LD基础**: @context, id, type
2. **核心模型字段**: name, twinType, subType, functionCategory等
3. **特有字段**: deviceType及设备特定参数
4. **扩展字段**: vendor, model, serialNumber等

---

## 5. 关键设计说明

### 5.1 ID生成规则
```
urn:ngsi-ld:TwinObject:AutoEquipment:{twin_code}
```

### 5.2 functionCategory分配
- 焊接设备: F1.2.1 (加工设备-焊接)
- 加工中心: F1.2.1 (加工设备-切削)
- 封闭机器人: F1.2.2 (装配设备)

### 5.3 工位关联
通过核心模型的`partOf`字段关联到所属工位:
```json
"partOf": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:Station:ST-HJ"
}
```

### 5.4 技术参数说明

#### IGM焊机参数 (假设)
- 电流范围: 50-500A
- 焊接工艺: MIG, MAG
- 额定功率: 45kW

#### 雅浦机器人参数 (假设)
- 轴数: 6轴
- 负载: 根据型号150-210kg
- 工作半径: 2400-2800mm

#### FOOKE加工中心参数 (假设)
- 轴数: 5轴
- 主轴转速: 8000rpm
- 定位精度: 0.01mm

#### ABB机器人参数 (假设)
- 轴数: 6轴
- 负载: 150kg
- 工作半径: 2400mm

---

## 6. 实例创建清单

| 文件名 | 设备 | 状态 |
|--------|------|------|
| ROBOT-R01_instance.json | 雅浦机器人 | ✓ 已创建 |
| IGM-WELDER-A01_instance.json | IGM焊机01 | ✓ 已创建 |
| IGM-WELDER-A02_instance.json | IGM焊机02 | ✓ 已创建 |
| IGM-WELDER-A03_instance.json | IGM焊机03 | ✓ 已创建 |
| IGM-WELDER-A04_instance.json | IGM焊机04 | ✓ 已创建 |
| WELD-ROBOT-A01_instance.json | 雅浦焊接机器人 | ✓ 已创建 |
| FOOKE-ROBOT-01_instance.json | FOOKE加工中心01 | ✓ 已创建 |
| FOOKE-ROBOT-02_instance.json | FOOKE加工中心02 | ✓ 已创建 |
| ABB-ROBOT-A01_instance.json | ABB封闭机器人01 | ✓ 已创建 |
| ABB-ROBOT-A02_instance.json | ABB封闭机器人02 | ✓ 已创建 |

---

## 7. 验证要点

### 7.1 Schema验证
使用JSON Schema验证工具检查:
```bash
ajv validate -s twinobject_core_schema.json -d ROBOT-R01_instance.json
ajv validate -s twinobject_autoequipment.schema.json -d ROBOT-R01_instance.json
```

### 7.2 必填字段检查
- ✓ 所有核心必填字段存在
- ✓ deviceType已填写
- ✓ URN格式正确

### 7.3 一致性检查
- ✓ vendor字段与清单一致
- ✓ located_in_station_code与清单一致
- ✓ deviceType与设备功能匹配

---

## 8. 后续工作

1. **补充实际参数**: 将假设参数替换为真实技术规格
2. **关联工位实例**: 确保partOf引用的Station实例存在
3. **配置ModalityBinding**: 为每台设备配置数据采集点
4. **建立维护档案**: 补充保养记录、故障历史等

---

## 9. 使用说明

### 9.1 导入实例
```javascript
// Node.js示例
const fs = require('fs');
const instance = JSON.parse(
  fs.readFileSync('ROBOT-R01_instance.json', 'utf8')
);
// 导入到数字孪生平台
await platform.createTwinObject(instance);
```

### 9.2 查询设备
```javascript
// 查询所有焊机
const welders = await platform.query({
  type: "TwinObject",
  subType: "AutoEquipment",
  deviceType: "Welder"
});
```

### 9.3 更新状态
```javascript
// 更新设备状态
await platform.updateProperty(
  "urn:ngsi-ld:TwinObject:AutoEquipment:ROBOT-R01",
  "stateAttr",
  [
    {name: "operating_mode", value: "auto"},
    {name: "cycle_count", value: 1523}
  ]
);
```

---

**文档版本**: V1.0  
**创建人**: 数字孪生实施团队  
**审核状态**: 待审核