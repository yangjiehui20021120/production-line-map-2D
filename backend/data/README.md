# Mock数据目录

本目录包含用于测试的Mock实体数据，即使没有NGSI-LD客户端也能测试所有功能。

## 目录结构

```
backend/data/entities/
├── twinobject/          # TwinObject实体数据
│   ├── orgunit.json     # 组织单元
│   ├── stations.json    # 工位
│   ├── positions.json   # 台位
│   ├── autoequipment.json  # 自动化设备
│   ├── person.json      # 人员
│   ├── products.json    # 产品
│   └── workpieces.json  # 工件（合并了所有workpiece_chain文件）
├── mbom/                # MBOM实体数据
│   ├── mbom_M000004670327.json
│   └── mbom_M000004803474.json
├── scene/               # Scene实体数据
│   ├── scenes_M670-SN001.json
│   └── scenes_M803-SN001.json
├── modality/            # Modality实体数据
│   └── modalities.json
├── modalitybinding/      # ModalityBinding实体数据
│   └── modalitybindings.json
├── modaldata/            # ModalData实体数据（采样）
│   └── modaldata.json   # 采样了1971条记录
├── role/                # Role实体数据
│   └── roles.json
└── assignment/          # Assignment实体数据（自动生成）
    └── assignments.json # 基于Person和Role生成，共92条
```

## 数据来源

所有数据来自 `孪生建模/孪生建模/` 目录中的实体实例建模文件。

## 数据统计

- **TwinObject**: 包含所有子类型（OrgUnit, Station, Position, AutoEquipment, Person, Product, Workpiece）
- **MBOM**: 2个产品的MBOM数据
- **Scene**: 2个产品的场景数据
- **Modality**: 完整的Modality定义
- **ModalityBinding**: 所有绑定关系
- **ModalData**: 采样1971条记录（原始数据约72K行）
- **Role**: 所有角色定义
- **Assignment**: 92条自动生成的岗位指派记录

## 使用方法

Mock数据服务会自动加载这些数据。确保 `USE_MOCK_DATA=True` 在配置中启用。

## 更新数据

运行以下脚本重新准备数据：

```bash
python backend/scripts/prepare_mock_data.py
```

