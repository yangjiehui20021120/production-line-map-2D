"""NGSI-LD契约数据模型定义。

基于数字孪生实体数据契约文档定义所有实体类型的契约规范。
参考文档：孪生建模/孪生建模/契约/
"""

from __future__ import annotations

from enum import Enum
from typing import Literal


# ============================================================================
# TwinObject 契约定义
# ============================================================================

class TwinObjectSubType(str, Enum):
    """TwinObject子类型枚举 - 11种"""
    ORG_UNIT = "OrgUnit"
    STATION = "Station"
    POSITION = "Position"
    AUTO_EQUIPMENT = "AutoEquipment"
    TRANSPORT_EQUIPMENT = "TransportEquipment"  # 对齐shared/types/twinobject.ts
    QC_TOOL = "QCTool"
    PERSON = "Person"
    MATERIAL = "Material"
    PRODUCT = "Product"
    WORKPIECE = "Workpiece"


class TwinType(str, Enum):
    """TwinObject顶层分类枚举"""
    CONSTITUENT = "Constituent"  # 构成性
    TRANSITIONAL = "Transitional"  # 流转性


class OrgUnitType(str, Enum):
    """组织单元类型枚举"""
    FACTORY = "Factory"
    WORKSHOP = "Workshop"
    PRODUCTION_LINE = "ProductionLine"
    TEAM = "Team"
    DEPARTMENT = "Department"
    DIVISION = "Division"


class OrgStatus(str, Enum):
    """组织状态枚举"""
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    RESTRUCTURING = "Restructuring"


class StationCategory(str, Enum):
    """工位类别枚举"""
    PRODUCTION_STATION = "ProductionStation"
    INSPECTION_STATION = "InspectionStation"
    ASSEMBLY_STATION = "AssemblyStation"
    BUFFER_ZONE = "BufferZone"
    HANDLING_STATION = "HandlingStation"


class PositionType(str, Enum):
    """台位类型枚举"""
    WORK_TABLE = "WorkTable"
    LOADING_POINT = "LoadingPoint"
    UNLOADING_POINT = "UnloadingPoint"
    INSPECTION_POINT = "InspectionPoint"
    FIXTURE_POINT = "FixturePoint"
    BUFFER_POINT = "BufferPoint"
    HANDOVER_POINT = "HandoverPoint"


class EquipmentType(str, Enum):
    """自动化设备类型枚举"""
    WELDING_ROBOT = "WeldingRobot"
    WELDER = "Welder"
    POSITIONER = "Positioner"
    CNC = "CNC"
    PRESS_MACHINE = "PressMachine"
    LASER = "Laser"
    OTHER = "Other"


# ============================================================================
# MBOM 契约定义
# ============================================================================

class MBOMType(str, Enum):
    """MBOM子类型枚举 - 5种"""
    MBOM_ROOT = "MBOMRoot"  # L1层
    ROUTE = "Route"  # L2层
    TAKT = "Takt"  # L3层
    PROCESS = "Process"  # L4层
    STEP = "Step"  # L5层


class MBOMStatus(str, Enum):
    """MBOM状态枚举"""
    ACTIVE = "active"
    DRAFT = "draft"
    RETIRED = "retired"
    DEPRECATED = "deprecated"


# ============================================================================
# Scene 契约定义
# ============================================================================

class SceneLevel(str, Enum):
    """Scene场景层级枚举 - 4种"""
    ROUTE = "Route"
    TAKT = "Takt"
    PROCESS = "Process"
    STEP = "Step"


class SceneStatus(str, Enum):
    """Scene执行状态枚举"""
    PENDING = "Pending"  # 待执行
    IN_PROGRESS = "InProgress"  # 执行中
    COMPLETED = "Completed"  # 已完成
    FAILED = "Failed"  # 失败
    CANCELLED = "Cancelled"  # 已取消
    ON_HOLD = "OnHold"  # 暂停


# ============================================================================
# Modality 契约定义
# ============================================================================

class ModalityCategory(str, Enum):
    """Modality数据类别枚举（维度1）- 对齐shared/types/modality.ts"""
    PROCESS_PARAMETER = "ProcessParameter"  # 工艺参数
    QUALITY_CHARACTERISTIC = "QualityCharacteristic"  # 质量特性
    GEOMETRY = "Geometry"  # 几何参数
    ENVIRONMENT = "Environment"  # 环境参数
    ENERGY = "Energy"  # 能耗
    STATE = "State"  # 状态
    EVENT = "Event"  # 事件
    OTHER = "Other"


class ModalitySource(str, Enum):
    """Modality数据来源方式枚举（维度2）- 对齐shared/types/modality.ts"""
    SENSOR = "Sensor"  # 传感器自动采集
    MANUAL = "Manual"  # 人工录入
    CALCULATED = "Calculated"  # 计算得出
    SIMULATED = "Simulated"  # 仿真生成
    INFERRED = "Inferred"  # 推断得出
    OTHER = "Other"  # 其他


class ModalityValueType(str, Enum):
    """Modality数据值类型枚举 - 对齐shared/types/modality.ts"""
    NUMBER = "Number"
    INTEGER = "Integer"
    BOOLEAN = "Boolean"
    TEXT = "Text"
    OBJECT = "Object"
    ARRAY = "Array"
    TIMESTAMP = "Timestamp"


# ============================================================================
# Role 契约定义
# ============================================================================

class RoleCategory(str, Enum):
    """Role角色类别枚举"""
    MANAGEMENT = "Management"  # 管理类
    PRODUCTION = "Production"  # 生产类
    QUALITY = "Quality"  # 质量类
    MAINTENANCE = "Maintenance"  # 维护类
    LOGISTICS = "Logistics"  # 物流类
    ENGINEERING = "Engineering"  # 工程类
    OTHER = "Other"


# ============================================================================
# Assignment 契约定义
# ============================================================================

class AssignmentStatus(str, Enum):
    """Assignment岗位指派状态枚举 - 对齐shared/types/roleAssignment.ts"""
    ACTIVE = "Active"  # 在岗
    SUSPENDED = "Suspended"  # 暂停
    REVOKED = "Revoked"  # 已撤销
    EXPIRED = "Expired"  # 已过期


# ============================================================================
# 通用契约常量
# ============================================================================

# NGSI-LD标准上下文
NGSI_LD_CORE_CONTEXT = "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"

# URN命名规范前缀
URN_PREFIX_TWIN_OBJECT = "urn:ngsi-ld:TwinObject"
URN_PREFIX_MBOM = "urn:ngsi-ld:MBOM"
URN_PREFIX_SCENE = "urn:ngsi-ld:Scene"
URN_PREFIX_MODALITY = "urn:ngsi-ld:Modality"
URN_PREFIX_MODALITY_BINDING = "urn:ngsi-ld:ModalityBinding"
URN_PREFIX_MODAL_DATA = "urn:ngsi-ld:ModalData"
URN_PREFIX_ROLE = "urn:ngsi-ld:Role"
URN_PREFIX_ASSIGNMENT = "urn:ngsi-ld:Assignment"

# 实体类型常量
ENTITY_TYPE_TWIN_OBJECT = "TwinObject"
ENTITY_TYPE_MBOM = "MBOM"
ENTITY_TYPE_SCENE = "Scene"
ENTITY_TYPE_MODALITY = "Modality"
ENTITY_TYPE_MODALITY_BINDING = "ModalityBinding"
ENTITY_TYPE_MODAL_DATA = "ModalData"
ENTITY_TYPE_ROLE = "Role"
ENTITY_TYPE_ASSIGNMENT = "Assignment"

