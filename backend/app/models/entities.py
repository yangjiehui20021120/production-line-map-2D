"""实体Pydantic模型定义。

基于NGSI-LD规范和契约文档定义所有实体类型的Pydantic模型。
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional, Union

from pydantic import BaseModel, Field

from shared.types.ngsi import GeoPoint, GeoPolygon, Property, GeoProperty, Relationship
from app.models.contracts import (
    TwinObjectSubType,
    TwinType,
    OrgUnitType,
    OrgStatus,
    StationCategory,
    PositionType,
    EquipmentType,
    MBOMType,
    MBOMStatus,
    SceneLevel,
    SceneStatus,
    ModalityCategory,
    ModalitySource,
    ModalityValueType,
    RoleCategory,
    AssignmentStatus,
    NGSI_LD_CORE_CONTEXT,
)


# ============================================================================
# NGSI-LD基础类型扩展
# ============================================================================

class PropertyArray(BaseModel):
    """Property数组类型"""
    type: Literal["Property"] = "Property"
    value: list[Any]


class PropertyObject(BaseModel):
    """Property对象类型"""
    type: Literal["Property"] = "Property"
    value: dict[str, Any]


class RelationshipArray(BaseModel):
    """Relationship数组类型"""
    type: Literal["Relationship"] = "Relationship"
    object: list[str]


# ============================================================================
# TwinObject 实体模型
# ============================================================================

class TwinObjectBase(BaseModel):
    """TwinObject基类 - 所有子类型共享的字段"""
    id: str = Field(..., description="全局唯一标识符(URN)")
    type: Literal["TwinObject"] = "TwinObject"
    context: Optional[Union[str, list[str]]] = Field(
        default=[NGSI_LD_CORE_CONTEXT],
        alias="@context",
        description="NGSI-LD上下文"
    )
    subType: Property = Field(..., description="子类型标识")
    twinType: Property = Field(..., description="顶层分类")
    functionCategory: Property = Field(..., description="生产功能分类")
    name: Optional[Property] = Field(None, description="对象名称")
    location: Optional[GeoProperty] = Field(None, description="地理位置坐标")
    capabilities: Optional[PropertyArray] = Field(None, description="能力标签集合")
    specifications: Optional[PropertyObject] = Field(None, description="技术规格参数")
    vendor: Optional[Property] = Field(None, description="制造厂商")
    model: Optional[Property] = Field(None, description="设备型号")
    serialNumber: Optional[Property] = Field(None, description="序列号")


class OrgUnitEntity(TwinObjectBase):
    """OrgUnit实体 - 组织单元"""
    orgUnitType: Property = Field(..., description="组织类型")
    orgLevel: Property = Field(..., description="组织层级(>=1)")
    orgStatus: Optional[Property] = Field(None, description="组织状态")
    parentOrg: Optional[Relationship] = Field(None, description="上级组织")
    childOrgs: Optional[RelationshipArray] = Field(None, description="下级组织列表")


class StationEntity(TwinObjectBase):
    """Station实体 - 工位"""
    stationCategory: Property = Field(..., description="工位类别")
    capacityWip: Optional[Property] = Field(None, description="在制品容量")
    stationLocation: Optional[Relationship] = Field(None, description="所属组织单元")
    hasPositions: Optional[RelationshipArray] = Field(None, description="包含的台位")
    deployedEquipments: Optional[RelationshipArray] = Field(None, description="部署的设备")


class PositionEntity(TwinObjectBase):
    """Position实体 - 台位"""
    belongsToStation: Relationship = Field(..., description="所属工位")
    positionIndex: Optional[Property] = Field(None, description="台位编号")
    positionType: Optional[Property] = Field(None, description="台位类型")
    relativeOffset: Optional[PropertyObject] = Field(None, description="相对工位的坐标偏移")


class AutoEquipmentEntity(TwinObjectBase):
    """AutoEquipment实体 - 自动化设备"""
    equipmentType: Property = Field(..., description="设备细分类型")
    controllerType: Optional[Property] = Field(None, description="控制器类型")
    controllerVersion: Optional[Property] = Field(None, description="控制器软件版本")
    axes: Optional[Property] = Field(None, description="轴数")
    maxPayload: Optional[Property] = Field(None, description="最大负载(kg)")
    reach: Optional[Property] = Field(None, description="工作半径(mm)")
    manufacturer: Optional[Property] = Field(None, description="制造商")
    commissionDate: Optional[Property] = Field(None, description="投产日期")
    deployedAt: Optional[Relationship] = Field(None, description="部署位置")
    supportedProcesses: Optional[PropertyArray] = Field(None, description="支持的工艺类型")


class PersonEntity(TwinObjectBase):
    """Person实体 - 人员"""
    employeeId: Property = Field(..., description="员工编号")
    department: Optional[Property] = Field(None, description="所属部门")
    position: Optional[Relationship] = Field(None, description="所属岗位")
    assignedRole: Optional[Relationship] = Field(None, description="分配的角色")
    qualifications: Optional[PropertyArray] = Field(None, description="资质证书列表")


class WorkpieceEntity(TwinObjectBase):
    """Workpiece实体 - 工件"""
    workpieceCode: Property = Field(..., description="工件编码")
    productType: Relationship = Field(..., description="产品类型")
    currentStatus: Optional[Property] = Field(None, description="当前状态")
    currentLocation: Optional[Relationship] = Field(None, description="当前位置")
    currentScene: Optional[Relationship] = Field(None, description="当前场景")


class ProductEntity(TwinObjectBase):
    """Product实体 - 产品"""
    productCode: Property = Field(..., description="产品编码")
    productName: Property = Field(..., description="产品名称")
    productVersion: Optional[Property] = Field(None, description="产品版本")


class MaterialEntity(TwinObjectBase):
    """Material实体 - 物料"""
    materialCode: Property = Field(..., description="物料编码")
    materialName: Property = Field(..., description="物料名称")
    materialType: Optional[Property] = Field(None, description="物料类型")


class TransportEquipEntity(TwinObjectBase):
    """TransportEquip实体 - 运输设备 - 对齐shared/types/twinobject.ts"""
    transportType: Property = Field(..., description="运输设备类型")
    payloadCapacity: Optional[Property] = Field(None, alias="maxLoad", description="最大载重")
    refOrgUnit: Optional[Relationship] = Field(None, description="所属组织单元")


class QCToolEntity(TwinObjectBase):
    """QCTool实体 - 检具"""
    toolType: Property = Field(..., description="检具类型")
    measurementRange: Optional[PropertyObject] = Field(None, description="测量范围")
    accuracy: Optional[Property] = Field(None, description="精度")


# ============================================================================
# MBOM 实体模型
# ============================================================================

class MBOMBase(BaseModel):
    """MBOM基类"""
    id: str = Field(..., description="全局唯一标识符(URN)")
    type: Literal["MBOM"] = "MBOM"
    context: Optional[Union[str, list[str]]] = Field(
        default=[NGSI_LD_CORE_CONTEXT],
        alias="@context",
        description="NGSI-LD上下文"
    )
    mbomType: Property = Field(..., description="子类型标识")
    status: Property = Field(..., description="状态")
    metadata: Optional[PropertyObject] = Field(None, description="元数据信息")


class MBOMRootEntity(MBOMBase):
    """MBOMRoot实体 - MBOM根节点(L1)"""
    mbomCode: Property = Field(..., description="MBOM业务编码")
    mbomName: Property = Field(..., description="MBOM名称")
    mbomVersion: Property = Field(..., description="版本号")
    productCode: Property = Field(..., description="关联产品代码")
    effectiveFrom: Optional[Property] = Field(None, description="生效起始时间")
    effectiveTo: Optional[Property] = Field(None, description="生效结束时间")
    hasRoute: Relationship = Field(..., description="MBOM根指向路线")
    totalProcesses: Optional[Property] = Field(None, description="总工序数")
    totalSteps: Optional[Property] = Field(None, description="总工步数")


class RouteEntity(MBOMBase):
    """Route实体 - 工艺路线(L2)"""
    routeCode: Property = Field(..., description="路线业务编码")
    routeName: Property = Field(..., description="路线名称")
    lineCode: Property = Field(..., description="产线代码")
    partOfMBOM: Relationship = Field(..., description="所属MBOM根")
    consistsOfTakts: RelationshipArray = Field(..., description="包含的节拍列表")
    taktCount: Optional[Property] = Field(None, description="节拍总数")
    totalCycleTime: Optional[PropertyObject] = Field(None, description="总周期时间")


class TaktEntity(MBOMBase):
    """Takt实体 - 节拍/工段(L3) - 对齐shared/types/mbom.ts"""
    taktSeq: Property = Field(..., alias="taktCode", description="节拍序号")
    taktName: Property = Field(..., description="节拍名称")
    targetCT: Optional[Property] = Field(None, alias="targetCycleTime", description="目标周期时间")
    defaultTimeWindow: Optional[Property] = Field(None, description="默认时间窗口")
    partOfRoute: Relationship = Field(..., description="所属路线")
    includesProcesses: RelationshipArray = Field(..., alias="consistsOfProcesses", description="包含的工序列表")
    processCount: Optional[Property] = Field(None, description="工序数量")
    estimatedDuration: Optional[Property] = Field(None, description="预估时长")
    requiredMeasurements: Optional[PropertyArray] = Field(None, description="测量要求")


class ProcessEntity(MBOMBase):
    """Process实体 - 工序(L4) - 对齐shared/types/mbom.ts"""
    procCode: Property = Field(..., alias="processCode", description="工序编码")
    procName: Property = Field(..., alias="processName", description="工序名称")
    stationCode: Optional[Property] = Field(None, description="工位代码")
    processKind: Optional[Property] = Field(None, description="工序类型")
    partOfTakt: Relationship = Field(..., description="所属节拍")
    composedOfSteps: Optional[RelationshipArray] = Field(None, alias="composedOfSteps", description="包含的工步列表")
    nextProcess: Optional[Relationship] = Field(None, description="下一工序")
    stdTime: Optional[Property] = Field(None, description="标准工时")
    stepCount: Optional[Property] = Field(None, description="工步数量")
    requiredResources: Optional[PropertyArray] = Field(None, description="所需资源")
    requiredMeasurements: Optional[PropertyArray] = Field(None, description="测量要求")


class StepEntity(MBOMBase):
    """Step实体 - 工步(L5) - 对齐shared/types/mbom.ts"""
    stepSeq: Property = Field(..., alias="stepCode", description="工步序号")
    stepName: Property = Field(..., description="工步名称")
    stationCode: Optional[Property] = Field(None, description="工位代码")
    stdTime: Property = Field(..., alias="standardTime", description="标准工时")
    stepDescription: Optional[Property] = Field(None, description="工步描述")
    processKind: Optional[Property] = Field(None, description="工序类型")
    partOfProcess: Relationship = Field(..., description="所属工序")
    predecessorStep: Optional[Relationship] = Field(None, description="前驱工步")
    successorStep: Optional[Relationship] = Field(None, alias="nextStep", description="后继工步")
    isOptional: Optional[Property] = Field(None, description="是否可选")
    canRunInParallel: Optional[Property] = Field(None, description="是否可并行")
    requiredResources: Optional[PropertyArray] = Field(None, description="所需资源")
    requiredMeasurements: Optional[PropertyArray] = Field(None, description="测量要求")


# ============================================================================
# Scene 实体模型
# ============================================================================

class SceneEntity(BaseModel):
    """Scene实体 - 生产场景"""
    id: str = Field(..., description="全局唯一标识符(URN)")
    type: Literal["Scene"] = "Scene"
    context: Optional[Union[str, list[str]]] = Field(
        default=[NGSI_LD_CORE_CONTEXT],
        alias="@context",
        description="NGSI-LD上下文"
    )
    sceneLevel: Property = Field(..., description="场景层级标识")
    sceneCode: Property = Field(..., description="场景业务编码")
    sceneName: Property = Field(..., description="场景名称")
    refMBOM: Relationship = Field(..., description="引用MBOM节点")
    refMBOMVersion: Property = Field(..., description="MBOM版本号")
    timeFrame: PropertyObject = Field(..., description="时间区间")
    status: Property = Field(..., description="执行状态")
    location: Optional[PropertyObject] = Field(None, description="执行位置信息")
    partOf: Optional[Relationship] = Field(None, description="所属上级Scene")
    includesSubScenes: Optional[RelationshipArray] = Field(None, description="包含的下级Scene列表")
    refFinalProduct: Optional[Relationship] = Field(None, description="引用最终产品")
    involvesAsset: Optional[RelationshipArray] = Field(None, description="涉及的资产列表")
    inputWorkpiece: Optional[Relationship] = Field(None, description="输入工件")
    outputWorkpiece: Optional[Relationship] = Field(None, description="输出工件")
    inputMaterials: Optional[PropertyArray] = Field(None, description="输入物料列表")
    stepLog: Optional[PropertyArray] = Field(None, description="工步执行日志")
    qualityResult: Optional[PropertyObject] = Field(None, description="质量检验结果")
    exceptionLog: Optional[PropertyArray] = Field(None, description="异常记录")


# ============================================================================
# Modality 实体模型
# ============================================================================

class ModalityEntity(BaseModel):
    """Modality实体 - 数据模态"""
    id: str = Field(..., description="全局唯一标识符(URN)")
    type: Literal["Modality"] = "Modality"
    context: Optional[Union[str, list[str]]] = Field(
        default=[NGSI_LD_CORE_CONTEXT],
        alias="@context",
        description="NGSI-LD上下文"
    )
    name: Property = Field(..., description="模态名称")
    category: Property = Field(..., description="数据类别(维度1)")
    valueType: Property = Field(..., description="数据值类型")
    source: Property = Field(..., description="数据来源方式(维度2)")
    description: Optional[Property] = Field(None, description="详细描述")
    unit: Optional[Property] = Field(None, description="计量单位")
    allowedRange: Optional[PropertyArray] = Field(None, description="正常值域")
    precision: Optional[Property] = Field(None, description="精度要求")


# ============================================================================
# ModalityBinding 实体模型
# ============================================================================

class ModalityBindingEntity(BaseModel):
    """ModalityBinding实体 - 模态绑定 - 对齐shared/types/modality.ts"""
    id: str = Field(..., description="全局唯一标识符(URN)")
    type: Literal["ModalityBinding"] = "ModalityBinding"
    context: Optional[Union[str, list[str]]] = Field(
        default=[NGSI_LD_CORE_CONTEXT],
        alias="@context",
        description="NGSI-LD上下文"
    )
    twinId: Relationship = Field(..., description="关联的TwinObject")
    modalityId: Relationship = Field(..., description="关联的Modality")
    pointRef: Property = Field(..., description="点位引用")
    bindingVersion: Optional[Property] = Field(None, description="绑定版本")
    changeId: Optional[Property] = Field(None, description="变更ID")
    effectiveFrom: Optional[Property] = Field(None, description="生效起始时间")
    effectiveTo: Optional[Property] = Field(None, description="生效结束时间")
    unit: Optional[Property] = Field(None, description="单位")
    sampleRate: Optional[Property] = Field(None, description="采样率")
    allowedRange: Optional[PropertyArray] = Field(None, description="允许范围")
    discriminator: Optional[PropertyObject] = Field(None, description="区分器")


# ============================================================================
# ModalData 实体模型
# ============================================================================

class ModalDataEntity(BaseModel):
    """ModalData实体 - 运行数据 - 对齐shared/types/modalData.ts"""
    id: str = Field(..., description="全局唯一标识符(URN)")
    type: Literal["ModalData"] = "ModalData"
    context: Optional[Union[str, list[str]]] = Field(
        default=[NGSI_LD_CORE_CONTEXT],
        alias="@context",
        description="NGSI-LD上下文"
    )
    refTwin: Relationship = Field(..., description="关联的TwinObject")
    refScene: Relationship = Field(..., description="关联的Scene")
    refModality: Relationship = Field(..., description="关联的Modality")
    value: Property = Field(..., description="数据值")
    observedAt: str = Field(..., description="观测时间戳")
    qualityTag: Property = Field(..., description="数据质量标签")
    qualityScore: Optional[Property] = Field(None, description="数据质量分数")
    sequenceNumber: Optional[Property] = Field(None, description="序列号")
    provenance: PropertyObject = Field(..., description="数据来源信息")
    isDerived: Optional[Property] = Field(None, description="是否派生数据")
    derivedFrom: Optional[RelationshipArray] = Field(None, description="派生来源")
    computationRule: Optional[Property] = Field(None, description="计算规则")
    metadata: Optional[PropertyObject] = Field(None, description="元数据")


# ============================================================================
# Role 实体模型
# ============================================================================

class RoleEntity(BaseModel):
    """Role实体 - 角色 - 对齐shared/types/roleAssignment.ts"""
    id: str = Field(..., description="全局唯一标识符(URN)")
    type: Literal["Role"] = "Role"
    context: Optional[Union[str, list[str]]] = Field(
        default=[NGSI_LD_CORE_CONTEXT],
        alias="@context",
        description="NGSI-LD上下文"
    )
    name: Property = Field(..., description="角色名称")
    responsibilities: Property = Field(..., description="主要工作职责列表")
    description: Optional[Property] = Field(None, description="角色描述")
    permissionSet: Optional[Property] = Field(None, alias="permissions", description="系统权限列表")
    qualificationReq: Optional[RelationshipArray] = Field(None, description="资质要求列表")
    kpiOwnership: Optional[Property] = Field(None, description="KPI归属")
    effectiveFrom: Optional[Property] = Field(None, description="生效起始时间")
    effectiveTo: Optional[Property] = Field(None, description="生效结束时间")
    orgScope: Optional[Relationship] = Field(None, description="组织范围")
    relatedFunctions: Optional[RelationshipArray] = Field(None, description="相关功能")
    ownerOrg: Optional[Relationship] = Field(None, description="所属组织")
    policyRef: Optional[Relationship] = Field(None, description="政策引用")


# ============================================================================
# Assignment 实体模型
# ============================================================================

class AssignmentEntity(BaseModel):
    """Assignment实体 - 岗位指派 - 对齐shared/types/roleAssignment.ts"""
    id: str = Field(..., description="全局唯一标识符(URN)")
    type: Literal["Assignment"] = "Assignment"
    context: Optional[Union[str, list[str]]] = Field(
        default=[NGSI_LD_CORE_CONTEXT],
        alias="@context",
        description="NGSI-LD上下文"
    )
    assigneeId: Relationship = Field(..., description="被指派人员")
    roleId: Relationship = Field(..., description="分配的角色")
    orgId: Relationship = Field(..., description="所属组织单元")
    validFrom: Property = Field(..., alias="effectiveFrom", description="生效起始时间")
    validTo: Property = Field(..., alias="effectiveTo", description="生效结束时间")
    assignmentStatus: Property = Field(..., alias="status", description="指派状态")
    shiftId: Optional[Property] = Field(None, description="班次ID")
    qualificationRef: Optional[RelationshipArray] = Field(None, description="资质引用")
    approvalRef: Optional[Relationship] = Field(None, description="审批引用")
    createdBy: Optional[Relationship] = Field(None, description="创建者")
    notes: Optional[Property] = Field(None, description="备注")
    sceneId: Optional[Relationship] = Field(None, description="场景ID")

