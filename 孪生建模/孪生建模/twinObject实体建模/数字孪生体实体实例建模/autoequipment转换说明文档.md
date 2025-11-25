# AutoEquipment实例数据转换说明文档

## 文档信息
- **版本**: V1.0
- **生成日期**: 2025-10-28
- **源文件**: 生产设备.xls
- **目标文件**: autoequipment_instances.json
- **符合标准**: NGSI-LD v1.0
- **符合Schema**: autoequipment_schema.json

---

## 1. 转换概览

### 1.1 数据统计

| 指标 | 数值 |
|------|------|
| 源数据记录数 | 33 |
| 成功转换数量 | 33 |
| 跳过记录数 | 0 |
| 转换成功率 | 100% |

### 1.2 设备类型分布

| deviceType | 数量 | 占比 | 说明 |
|------------|------|------|------|
| Welder | 18 | 54.5% | 电弧焊接机 |
| Other | 10 | 30.3% | 起重机、打磨设备、隔音房等 |
| Robot | 3 | 9.1% | 焊接机械手 |
| CNC | 2 | 6.1% | 加工中心 |

---

## 2. 字段映射规则

### 2.1 核心字段映射

| 目标字段 | 源字段 | 转换规则 |
|----------|--------|----------|
| `id` | 资产编号 | 格式: `urn:ngsi-ld:TwinObject:AutoEquipment:{资产编号}` |
| `name` | 设备名称 | 直接映射 |
| `twinType` | - | 固定值: `"Constituent"` |
| `subType` | - | 固定值: `"AutoEquipment"` |
| `functionCategory` | - | 固定值: `"F1.2.1"` (加工设备) |

### 2.2 AutoEquipment特有字段映射

| 目标字段 | 源字段 | 转换规则 |
|----------|--------|----------|
| `deviceType` | 设备名称 + 工艺分类 | 通过规则检测设备类型 |
| `vendor` | 厂商 | 直接映射 |
| `model` | 规格型号 | 直接映射,过滤"否"值 |
| `serialNumber` | 出厂编号 | 直接映射 |
| `assetNumber` | 资产编号 | 直接映射 |
| `operationalStatus` | 状态 | 直接映射 |
| `powerRating` | 设备功率 | 提取数字,单位kW |
| `weight` | 重量 | 提取数字(如"20000KG"),单位kg |
| `dimensions` | 大小尺寸 | 解析"长*宽*高"格式,单位mm |
| `manufactureDate` | 出厂年份 + 出厂月份 | 组合为ISO日期格式 |
| `installationDate` | 购置日期 | 转换为ISO日期格式 |
| `lastMaintenanceDate` | 上次定检日期 | 转换为ISO日期格式 |
| `nextMaintenanceDate` | 下次定检日期 | 转换为ISO日期格式 |
| `location` | 工位 + 工位描述 | 组合为"{工位描述} ({工位编号})" |
| `materialCode` | 物料号 | 直接映射(扩展字段) |

### 2.3 设备类型特定字段

#### Robot (机器人)
| 字段 | 数据来源 | 说明 |
|------|---------|------|
| `axes` | 固定值 | 6轴 |
| `reach` | 型号推断 | R350型号为2650mm |
| `payload` | 型号推断 | R350型号为210kg |
| `repeatability` | 型号推断 | R350型号为±0.08mm |
| `safetyFeatures` | 默认配置 | EmergencyStop, SafetyZone, CollisionDetection |

#### Welder (焊机)
| 字段 | 数据来源 | 说明 |
|------|---------|------|
| `currentRange` | 型号推断 | TPS5000: 50-500A, 其他: 30-300A |
| `weldingProcessTypes` | 默认配置 | MIG, MAG |

#### CNC (数控机床)
| 字段 | 数据来源 | 说明 |
|------|---------|------|
| `axes` | 固定值 | 3轴 |

---

## 3. deviceType识别规则

转换工具使用以下规则自动识别设备类型:

```python
def detect_device_type(equipment_name, equipment_class):
    if '机械手' in equipment_name or '机器人' in equipment_name:
        return 'Robot'
    
    if '焊接机' in equipment_name and '专机' not in equipment_name:
        return 'Welder'
    
    if '变位机' in equipment_name:
        return 'Positioner'
    
    if '加工中心' in equipment_name or '数控' in equipment_name:
        return 'CNC'
    
    if '压机' in equipment_name:
        return 'PressMachine'
    
    if '激光' in equipment_name:
        return 'Laser'
    
    return 'Other'
```

---

## 4. 字段完整性报告

### 4.1 必填字段 (100%覆盖)

所有33个实例均包含以下必填字段:
- ✓ `@context` - NGSI-LD上下文
- ✓ `id` - 实例唯一标识符
- ✓ `type` - 固定为"TwinObject"
- ✓ `name` - 设备名称
- ✓ `twinType` - 孪生体类型
- ✓ `subType` - 子类型(AutoEquipment)
- ✓ `functionCategory` - 功能分类
- ✓ `deviceType` - 设备细分类型

### 4.2 可选字段覆盖率

| 字段 | 覆盖率 | 说明 |
|------|--------|------|
| `vendor` | 100.0% (33/33) | 所有设备均有供应商信息 |
| `model` | 100.0% (33/33) | 所有设备均有型号信息 |
| `serialNumber` | 90.9% (30/33) | 3个设备缺少出厂编号 |
| `powerRating` | 90.9% (30/33) | 3个设备缺少功率信息 |
| `weight` | 100.0% (33/33) | 所有设备均有重量信息 |
| `dimensions` | 100.0% (33/33) | 所有设备均有尺寸信息 |
| `manufactureDate` | 100.0% (33/33) | 所有设备均有出厂日期 |
| `installationDate` | 100.0% (33/33) | 所有设备均有安装日期 |
| `location` | 100.0% (33/33) | 所有设备均有工位信息 |

---

## 5. 使用示例

### 5.1 示例1: 焊接机器人 (Robot)

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-900A",
  "type": "TwinObject",
  "name": {
    "type": "Property",
    "value": "焊接机械手"
  },
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  "subType": {
    "type": "Property",
    "value": "AutoEquipment"
  },
  "functionCategory": {
    "type": "Property",
    "value": "F1.2.1"
  },
  "deviceType": {
    "type": "Property",
    "value": "Robot"
  },
  "vendor": {
    "type": "Property",
    "value": "德国克鲁斯焊接技术公司"
  },
  "model": {
    "type": "Property",
    "value": "R350"
  },
  "axes": {
    "type": "Property",
    "value": 6,
    "unitCode": "axes"
  },
  "reach": {
    "type": "Property",
    "value": 2650,
    "unitCode": "mm"
  },
  "payload": {
    "type": "Property",
    "value": 210,
    "unitCode": "kg"
  },
  "repeatability": {
    "type": "Property",
    "value": 0.08,
    "unitCode": "mm"
  },
  "safetyFeatures": {
    "type": "Property",
    "value": [
      "EmergencyStop",
      "SafetyZone",
      "CollisionDetection"
    ]
  }
}
```

**特点说明**:
- 包含机器人特有字段: `axes`, `reach`, `payload`, `repeatability`
- 自动配置安全功能: `safetyFeatures`
- 基于R350型号推断技术规格

### 5.2 示例2: 电弧焊接机 (Welder)

```json
{
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:361-01156",
  "deviceType": {
    "type": "Property",
    "value": "Welder"
  },
  "vendor": {
    "type": "Property",
    "value": "珠海市福尼斯焊接技术有限公司"
  },
  "model": {
    "type": "Property",
    "value": "TPS5000"
  },
  "currentRange": {
    "type": "Property",
    "value": {
      "min": 50,
      "max": 500,
      "unit": "A"
    }
  },
  "weldingProcessTypes": {
    "type": "Property",
    "value": [
      "MIG",
      "MAG"
    ]
  }
}
```

**特点说明**:
- 包含焊机特有字段: `currentRange`, `weldingProcessTypes`
- 基于TPS5000型号推断电流范围: 50-500A
- 默认配置支持MIG/MAG焊接工艺

### 5.3 示例3: 加工中心 (CNC)

```json
{
  "id": "urn:ngsi-ld:TwinObject:AutoEquipment:046-4",
  "deviceType": {
    "type": "Property",
    "value": "CNC"
  },
  "vendor": {
    "type": "Property",
    "value": "德国FOOKE公司"
  },
  "model": {
    "type": "Property",
    "value": "ENDURA8LB"
  },
  "axes": {
    "type": "Property",
    "value": 3,
    "unitCode": "axes"
  },
  "powerRating": {
    "type": "Property",
    "value": 100.0,
    "unitCode": "kW"
  }
}
```

**特点说明**:
- 包含CNC特有字段: `axes`
- 默认配置3轴联动
- 大型设备,重量160吨,占地面积大

---

## 6. 数据质量说明

### 6.1 高质量字段 (100%完整)
- ✓ 设备基本信息(名称、供应商、型号)
- ✓ 物理属性(重量、尺寸)
- ✓ 时间信息(出厂、安装、维护日期)
- ✓ 位置信息(工位)

### 6.2 需要补充的信息

虽然转换成功,但以下信息在源数据中缺失,建议后续补充:

#### 控制系统信息
- `controllerType` - 控制器类型(如ABB_IRC5)
- `controllerVersion` - 控制器软件版本
- `programmingLanguages` - 编程语言
- `communicationProtocols` - 通信协议(用于数据采集)

#### 性能参数
- 机器人的实际`reach`、`payload`、`repeatability`(当前基于型号推断)
- 焊机的实际`currentRange`(当前基于型号推断)
- CNC的`toolMagazineCapacity`、`spindleSpeedRange`

#### 安全与认证
- `protectionLevel` - 防护等级(如IP54)
- `certifications` - 认证标准(如CE、ISO9001)
- `mountingType` - 安装方式

#### 维护管理
- `maintenanceInterval` - 保养周期
- `maintenanceProvider` - 维保服务商
- `warrantyExpiration` - 质保到期日

---

## 7. 验证与使用

### 7.1 Schema验证

生成的JSON文件符合`autoequipment_schema.json`定义的规范:
- ✓ 所有必填字段完整
- ✓ 字段类型正确(Property/Relationship)
- ✓ 枚举值合法(deviceType等)
- ✓ 数据格式规范(日期、数值、单位)

### 7.2 导入数字孪生平台

生成的JSON文件可以直接导入支持NGSI-LD标准的数字孪生平台:

```bash
# 批量导入示例
POST /ngsi-ld/v1/entityOperations/create
Content-Type: application/ld+json

[文件内容]
```

### 7.3 查询示例

```bash
# 查询所有焊接机器人
GET /ngsi-ld/v1/entities?type=TwinObject&q=subType=="AutoEquipment";deviceType=="Robot"

# 查询特定工位的设备
GET /ngsi-ld/v1/entities?type=TwinObject&q=location~="TS36120201"

# 查询需要维护的设备
GET /ngsi-ld/v1/entities?type=TwinObject&q=nextMaintenanceDate<"2026-01-01"
```

---

## 8. 转换工具信息

### 8.1 工具特性
- 自动识别设备类型
- 智能解析复杂格式(尺寸、重量、日期)
- 基于型号推断技术规格
- 完整的数据验证和统计

### 8.2 转换脚本
位置: `convert_autoequipment.py`
版本: V1.0
语言: Python 3

### 8.3 运行方式
```bash
python3 convert_autoequipment.py
```

---

## 9. 注意事项

### 9.1 ID唯一性
所有设备ID基于资产编号生成,确保了唯一性。如果资产编号重复,需要在源数据中修正。

### 9.2 日期逻辑
注意到个别设备的`nextMaintenanceDate`早于`lastMaintenanceDate`,这可能是源数据录入错误,建议核查。

### 9.3 设备分类
"Other"类型的设备(如起重机、隔音房)可能需要创建专门的子类型,或归入TransportEquipment等其他类别。

### 9.4 扩展建议
- 建议为每种设备类型补充更详细的技术规格
- 建议建立设备与ModalityBinding的关联,配置数据采集
- 建议为设备配置数字化模型(3D模型、工作包络等)

---

## 10. 联系与支持

如有疑问或需要定制化转换规则,请联系:
- 数字孪生架构组
- 文档版本: V1.0
- 生成日期: 2025-10-28

---

**结论**: 数据转换成功完成,所有33个设备实例均符合NGSI-LD标准和AutoEquipment元模型规范,可直接用于数字孪生平台。
