# Station和Position特有字段设计说明
## 版本: V1.0 | 更新日期: 2025-10-16

---

## 一、设计原则

### 1.1 继承TwinObject核心模型
Station和Position作为TwinObject的子类型(**subType**),完全继承核心Schema中定义的所有字段:
- 必填核心字段: `id`, `type`, `twinType`, `subType`, `functionCategory`
- 通用字段: `name`, `location`, `partOf`, `capabilities`, `supportedModalities`等
- 接口字段: `inputAttr`, `outputAttr`, `controlAttr`, `stateAttr`

### 1.2 空间实体的特殊性
Station和Position是**生产空间的物理或逻辑单元**,具有以下特点:
- **固定性**: 不会移动,有明确的`location`(地理坐标)或`installPosition`
- **容器性**: 可以容纳其他对象(设备、在制品、人员)
- **层级性**: Station可包含多个Position
- **连接性**: Station之间有物流连接关系(上下游)

### 1.3 与核心字段的关系

| 核心字段 | 在Station/Position中的使用 |
|---------|---------------------------|
| `twinType` | 固定为`"Constituent"`(构成性对象) |
| `subType` | `"Station"` / `"BufferZone"` / `"Position"` |
| `functionCategory` | 使用F1体系,如`"F1.2.1"`(加工工位) |
| `installPosition` | Station填写产线位置描述,Position可为空 |
| `location` | 必填,使用GeoProperty存储平面坐标 |
| `partOf` | Position必须引用其父Station |
| `twinLevel` | Station通常为2-3级,Position为3-4级 |

---

## 二、Station特有字段详解

### 2.1 核心区分字段

#### `isBuffer` (必填)
- **类型**: Property (boolean)
- **用途**: 区分普通工位和缓存区
- **规则**: 
  - 普通工位: `false` - 有人员和设备执行作业
  - 缓存区: `true` - 仅用于暂存在制品
- **示例**:
```json
"isBuffer": {
  "type": "Property",
  "value": false
}
```

#### `lineCode` / `areaCode` / `zoneId`
- **用途**: 表达空间层级关系(产线→区域→分区→工位)
- **来源**: 从VALIDATION表的枚举清单选择
- **示例**:
```json
"lineCode": {"type": "Property", "value": "侧墙产线"},
"areaCode": {"type": "Property", "value": "焊接区"},
"zoneId": {"type": "Property", "value": "ZONE-A"}
```

### 2.2 容量与尺寸

#### `capacityWIP`
- **类型**: Property (integer)
- **单位**: pieces(件)
- **用途**: 
  - 普通工位: 同时在制品数量上限
  - 缓存区: **强烈建议填写**,用于物流仿真
- **示例**: `"value": 5` (最多5件在制品)

#### `layoutArea`
- **类型**: Property (number)
- **单位**: m²
- **用途**: 占地面积,用于空间规划和可视化

### 2.3 安全与约束

#### `hazardFlags`
- **类型**: Property (array[enum])
- **枚举值**: 
  - `WELDING` - 焊接作业
  - `LIFTING` - 起重作业
  - `HIGH_TEMP` - 高温环境
  - `HIGH_VOLTAGE` - 高压电
  - `CONFINED_SPACE` - 受限空间
  - `CHEMICAL` - 化学品
  - `RADIATION` - 辐射
  - `NOISE` - 噪音
- **用途**: 安全管理、人员资质匹配、PPE要求
- **示例**:
```json
"hazardFlags": {
  "type": "Property",
  "value": ["WELDING", "HIGH_TEMP"]
}
```

#### `accessControl`
- **用途**: 定义进入该工位的资质要求
- **包含**:
  - `requiredQualifications`: 必需证书清单
  - `restrictedAccess`: 是否需要特殊授权
  - `maxOccupancy`: 最大同时在场人数
- **示例**:
```json
"accessControl": {
  "type": "Property",
  "value": {
    "requiredQualifications": ["焊工证", "安全培训证"],
    "restrictedAccess": false,
    "maxOccupancy": 3
  }
}
```

### 2.4 工序与能力

#### `allowedProcessTypes`
- **类型**: Property (array[enum])
- **枚举值**: `process`, `handling`, `inspection`, `andon`, `rework`
- **用途**: 限定该工位可执行的工序类型白名单
- **关联**: 与PROC_IN_TAKT表中的`allowed_station_codes`配合使用

#### `requiredEquipmentTypes`
- **用途**: 该工位必须配备的设备类型
- **示例**: `["Robot", "Welder", "Fixture"]`

### 2.5 物流连接

#### `upstreamStations` / `downstreamStations`
- **类型**: Relationship (array)
- **用途**: 定义物流流转的上下游关系
- **格式**: 引用其他Station的URN
- **示例**:
```json
"upstreamStations": [
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-02"
  }
],
"downstreamStations": [
  {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-04"
  }
]
```

#### `associatedBuffers`
- **用途**: 工位关联的可用缓存区
- **场景**: 当工位繁忙时,在制品可暂存于关联缓存区

### 2.6 环境与运营

#### `environmentalConditions`
- **用途**: 环境条件要求(温度、湿度、洁净度)
- **应用**: 质量管理、设备保护
- **示例**:
```json
"environmentalConditions": {
  "type": "Property",
  "value": {
    "temperature": {"min": 15, "max": 28, "unit": "Celsius"},
    "humidity": {"min": 30, "max": 70, "unit": "percent"},
    "cleanlinessLevel": "ISO7"
  }
}
```

#### `operatingSchedule`
- **用途**: 工位运营时间表
- **包含**: 班次信息、是否仅工作日运行
- **应用**: 排班管理、产能计算

### 2.7 兼容性字段

#### `aliasStationCodes`
- **类型**: Property (array[string])
- **用途**: 历史编码兼容,便于数据迁移
- **示例**: `["TS36120201", "老3号位"]`

---

## 三、Position特有字段详解

### 3.1 必填关系字段

#### `parentStation` (必填)
- **类型**: Relationship
- **用途**: 引用所属的Station或BufferZone
- **格式**: URN引用
- **验证**: 必须指向存在的Station实体
- **示例**:
```json
"parentStation": {
  "type": "Relationship",
  "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
}
```

#### `positionCode` (必填)
- **类型**: Property (string)
- **格式**: `POS-{AlphaNum}`
- **唯一性**: 在同一Station内唯一
- **示例**: `"POS-A1"`, `"POS-B2"`

### 3.2 空间定位

#### `relativeOffset`
- **类型**: GeoProperty
- **用途**: 相对于父Station的坐标偏移
- **格式**: `[offsetX, offsetY]` 单位:米
- **计算**: Position绝对坐标 = Station.location + relativeOffset
- **示例**:
```json
"relativeOffset": {
  "type": "GeoProperty",
  "value": {
    "type": "Point",
    "coordinates": [2.5, 1.0]
  }
}
```

#### `orientationAngle`
- **类型**: Property (number)
- **单位**: 度(degrees)
- **范围**: 0-360
- **用途**: 台位朝向,用于机器人路径规划、可视化

### 3.3 功能与类型

#### `positionType`
- **枚举值**:
  - `MainWorkPosition` - 主作业台位
  - `AuxiliaryPosition` - 辅助台位
  - `InspectionPosition` - 检验台位
  - `LoadingPosition` - 上料台位
  - `UnloadingPosition` - 下料台位
  - `BufferPosition` - 缓存台位
- **用途**: 台位功能分类,用于工艺路线设计

#### `capacityWIP`
- **用途**: 台位级别的在制品容量
- **通常**: 1-2件(比Station粒度更细)

### 3.4 设备与工装

#### `dedicatedEquipment`
- **类型**: Relationship (array)
- **用途**: 固定安装在该台位的设备
- **示例**: 固定式焊机、专用夹具、检测设备
- **关联**: 这些设备的`installPosition`应指向该Position

#### `supportedFixtures`
- **类型**: Property (array[string])
- **用途**: 该台位支持使用的夹具类型清单
- **应用**: 工艺规划、设备配置验证

### 3.5 作业空间

#### `workEnvelope`
- **类型**: Property (object)
- **字段**: `length`, `width`, `height` (单位:mm)
- **用途**: 定义该台位的有效作业空间包络
- **应用**: 
  - 机器人可达性分析
  - 工件尺寸验证
  - 干涉检查

### 3.6 安全标记

#### `hazardFlags`
- **继承**: 可从父Station继承hazardFlags
- **覆盖**: Position级别可有更细粒度的风险标记
- **新增枚举**: 
  - `PINCH_POINT` - 夹点
  - `ROTATING_MACHINERY` - 旋转机械

---

## 四、与核心字段的协同使用

### 4.1 functionCategory的推荐值

#### Station的F1分类
```
F1 - 构成性系统/设备
  F1.1 - 电气系统
  F1.2 - 机械系统
    F1.2.1 - 加工工位 (焊接、切割等)
    F1.2.2 - 装配工位
    F1.2.3 - 检测工位
  F1.3 - 物流系统
    F1.3.1 - 运输缓存区
    F1.3.2 - 周转缓存区
```

#### Position的F1分类
- 通常继承父Station的分类,并增加小数位细化
- 示例: `F1.2.1.1` (焊接工位的A1台位)

### 4.2 capabilities的建议标签

#### Station级能力
```
CAP.Weld.Station - 焊接工位能力
CAP.Assembly.Station - 装配工位能力
CAP.Inspect.Station - 检测工位能力
CAP.Buffer.Storage - 缓存存储能力
```

#### Position级能力
```
CAP.Weld.FrontSide - 正面焊接台位
CAP.Weld.BackSide - 反面焊接台位
CAP.Load.Manual - 人工上料台位
CAP.Unload.Auto - 自动下料台位
```

### 4.3 supportedModalities的典型配置

#### Station常见模态
- 对于Station本身,通常不直接采集数据
- 但可声明支持的模态类型,由其内的设备实现
- 示例: `["TEMP", "CURRENT", "PRESSURE", "STATUS"]`

#### Position常见模态
- Position可能关联传感器(如到位检测、压力传感)
- 示例: `["OCCUPANCY", "PRESENCE", "LOCK_STATUS"]`

### 4.4 modalityBindings的使用

对于有数据采集需求的Station/Position:
```json
"modalityBindings": [
  {
    "type": "Property",
    "value": {
      "modalityId": "urn:ngsi-ld:Modality:OCCUPANCY",
      "pointRef": "ns=2;s=Station.ST-GZ-03.Occupied",
      "bindingVersion": "V1.0",
      "changeId": "CHG-2025-001",
      "effectiveFrom": "2025-01-01T00:00:00Z"
    }
  }
]
```

---

## 五、完整示例

### 5.1 Station示例 (焊接工位)

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "侧墙焊接工位03"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "Station"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.2.1"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 3
  },
  
  "installPosition": {
    "type": "Property",
    "value": "侧墙产线-焊接区-A区-03号位"
  },
  
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [125.5, 80.3]
    }
  },
  
  "partOf": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:ProductionLine:SideWall"
  },
  
  "capabilities": {
    "type": "Property",
    "value": ["CAP.Weld.Station", "CAP.Robot.Support"]
  },
  
  "supportedModalities": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Modality:OCCUPANCY"
    }
  ],
  
  "isBuffer": {
    "type": "Property",
    "value": false
  },
  
  "lineCode": {
    "type": "Property",
    "value": "侧墙产线"
  },
  
  "areaCode": {
    "type": "Property",
    "value": "焊接区"
  },
  
  "zoneId": {
    "type": "Property",
    "value": "ZONE-A"
  },
  
  "capacityWIP": {
    "type": "Property",
    "value": 2,
    "unitCode": "pieces"
  },
  
  "layoutArea": {
    "type": "Property",
    "value": 25.0,
    "unitCode": "m2"
  },
  
  "hazardFlags": {
    "type": "Property",
    "value": ["WELDING", "HIGH_TEMP", "HIGH_VOLTAGE"]
  },
  
  "allowedProcessTypes": {
    "type": "Property",
    "value": ["process", "inspection"]
  },
  
  "maxConcurrentTasks": {
    "type": "Property",
    "value": 2
  },
  
  "aliasStationCodes": {
    "type": "Property",
    "value": ["TS36120203", "3号焊接位"]
  },
  
  "upstreamStations": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-02"
    }
  ],
  
  "downstreamStations": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-04"
    }
  ],
  
  "associatedBuffers": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:BufferZone:BUF-03"
    }
  ],
  
  "requiredEquipmentTypes": {
    "type": "Property",
    "value": ["Robot", "Welder", "Fixture"]
  },
  
  "accessControl": {
    "type": "Property",
    "value": {
      "requiredQualifications": ["焊工证", "特种作业证"],
      "restrictedAccess": false,
      "maxOccupancy": 3
    }
  },
  
  "environmentalConditions": {
    "type": "Property",
    "value": {
      "temperature": {"min": 15, "max": 30, "unit": "Celsius"},
      "humidity": {"min": 30, "max": 70, "unit": "percent"}
    }
  }
}
```

### 5.2 Position示例 (焊接台位A1)

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:Position:POS-A1",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "焊接工位03-A1台位"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "Position"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.2.1.1"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 4
  },
  
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [128.0, 81.3]
    }
  },
  
  "partOf": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
  },
  
  "capabilities": {
    "type": "Property",
    "value": ["CAP.Weld.FrontSide"]
  },
  
  "parentStation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
  },
  
  "positionCode": {
    "type": "Property",
    "value": "POS-A1"
  },
  
  "relativeOffset": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [2.5, 1.0]
    }
  },
  
  "capacityWIP": {
    "type": "Property",
    "value": 1,
    "unitCode": "pieces"
  },
  
  "dedicatedEquipment": [
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:Robot:ROBOT-R03-A1"
    },
    {
      "type": "Relationship",
      "object": "urn:ngsi-ld:TwinObject:Fixture:FIX-WELD-A1"
    }
  ],
  
  "positionType": {
    "type": "Property",
    "value": "MainWorkPosition"
  },
  
  "orientationAngle": {
    "type": "Property",
    "value": 45,
    "unitCode": "degrees"
  },
  
  "workEnvelope": {
    "type": "Property",
    "value": {
      "length": 2000,
      "width": 1500,
      "height": 1800
    }
  },
  
  "supportedFixtures": {
    "type": "Property",
    "value": ["FIX-WELD-STD", "FIX-WELD-A1"]
  },
  
  "hazardFlags": {
    "type": "Property",
    "value": ["WELDING", "PINCH_POINT"]
  }
}
```

### 5.3 BufferZone示例

```json
{
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
  ],
  "id": "urn:ngsi-ld:TwinObject:BufferZone:BUF-03",
  "type": "TwinObject",
  
  "name": {
    "type": "Property",
    "value": "焊接区缓存区03"
  },
  
  "twinType": {
    "type": "Property",
    "value": "Constituent"
  },
  
  "subType": {
    "type": "Property",
    "value": "BufferZone"
  },
  
  "functionCategory": {
    "type": "Property",
    "value": "F1.3.2"
  },
  
  "twinLevel": {
    "type": "Property",
    "value": 3
  },
  
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [122.0, 85.0]
    }
  },
  
  "isBuffer": {
    "type": "Property",
    "value": true
  },
  
  "lineCode": {
    "type": "Property",
    "value": "侧墙产线"
  },
  
  "areaCode": {
    "type": "Property",
    "value": "焊接区"
  },
  
  "capacityWIP": {
    "type": "Property",
    "value": 10,
    "unitCode": "pieces"
  },
  
  "layoutArea": {
    "type": "Property",
    "value": 15.0,
    "unitCode": "m2"
  },
  
  "allowedProcessTypes": {
    "type": "Property",
    "value": ["handling"]
  }
}
```

---

## 六、实施要点

### 6.1 数据采集清单

从Excel模板采集时的映射关系:

| Excel列名 | Station字段 | Position字段 |
|----------|------------|-------------|
| station_code | → id生成 | - |
| station_name_cn | → name.value | - |
| is_buffer | → isBuffer.value | - |
| line_code | → lineCode.value | - |
| area_code | → areaCode.value | - |
| zone_id | → zoneId.value | - |
| capacity_wip | → capacityWIP.value | → capacityWIP.value |
| coordinate_x/y | → location.value.coordinates | - |
| hazard_flags | → hazardFlags.value | → hazardFlags.value |
| alias_codes | → aliasStationCodes.value | - |
| position_code | - | → positionCode.value |
| offset_x/y | - | → relativeOffset.value.coordinates |

### 6.2 校验规则

#### Station校验
1. `isBuffer`必须为true或false
2. 如果`isBuffer=true`,建议填写`capacityWIP`
3. `location`必填
4. `lineCode`, `areaCode`应从VALIDATION表选择
5. `hazardFlags`的枚举值必须合法

#### Position校验
1. `parentStation`必须引用存在的Station
2. `positionCode`在同一Station内不能重复
3. `relativeOffset`建议填写,用于精确定位
4. `dedicatedEquipment`引用的设备应存在

### 6.3 ID生成规则

根据ID_RULES表:

#### Station的URN
```
urn:ngsi-ld:TwinObject:Station:{station_code}
```
示例: `urn:ngsi-ld:TwinObject:Station:ST-GZ-03`

#### BufferZone的URN
```
urn:ngsi-ld:TwinObject:BufferZone:{buffer_code}
```
示例: `urn:ngsi-ld:TwinObject:BufferZone:BUF-03`

#### Position的URN
```
urn:ngsi-ld:TwinObject:Position:{position_code}
```
示例: `urn:ngsi-ld:TwinObject:Position:POS-A1`

### 6.4 与Scene的关联

在Scene中引用Station/Position:
```json
{
  "id": "urn:ngsi-ld:Scene:...",
  "executionLocation": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Station:ST-GZ-03"
  },
  "positionDetail": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:TwinObject:Position:POS-A1"
  }
}
```

---

## 七、常见问题

### Q1: Station和BufferZone应该用不同的subType吗?
**A**: 建议用不同的subType以便区分:
- `subType.value = "Station"` - 普通工位
- `subType.value = "BufferZone"` - 缓存区

也可以都用`"Station"`,通过`isBuffer`字段区分。

### Q2: Position一定要有relativeOffset吗?
**A**: 不是必填,但强烈建议填写。如果没有相对偏移,Position的location可以直接复制Station的location,或者根据其他信息推算。

### Q3: Station的capabilities和functionCategory有什么区别?
**A**: 
- `functionCategory`: 标准化的功能分类码(F1/F2体系),用于统一分类
- `capabilities`: 灵活的能力标签(CAP.*),用于详细描述实际能力

建议两者都填写,互为补充。

### Q4: 如何处理一个Station有多个Position的情况?
**A**: 
1. 创建1个Station实体
2. 创建N个Position实体,每个都通过`parentStation`引用该Station
3. Position的`positionCode`在该Station内唯一
4. Position的绝对坐标 = Station.location + Position.relativeOffset

### Q5: Station的上下游关系必须填吗?
**A**: 不是必填,但对于物流仿真和排产优化非常重要。建议至少填写主要的上下游连接关系。

---

**文档版本**: V1.0  
**制定人**: 数字孪生架构组  
**审核状态**: 待审核  
**下一步**: 
1. 补充Robot、Welder等设备类型的特有字段
2. 完善Workpiece(在制件)的特有字段
3. 建立子类型字段的完整索引
