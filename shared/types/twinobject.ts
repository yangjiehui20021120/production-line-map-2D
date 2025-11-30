import type { NGSIContext, NGSIGeoProperty, NGSIProperty, NGSIRelationship } from './ngsi'

export type TwinObjectSubType =
  | 'OrgUnit'
  | 'Station'
  | 'Position'
  | 'AutoEquipment'
  | 'TransportEquipment'
  | 'QCTool'
  | 'Person'
  | 'Material'
  | 'Product'
  | 'Workpiece'

export type TwinObjectTwinType = 'Constituent' | 'Transitional'

export type TwinObjectStatus =
  | 'Running'
  | 'Idle'
  | 'Fault'
  | 'Maintenance'
  | 'Active'
  | 'Inactive'
  | 'Restructuring'
  | 'InProduction'
  | 'QualityCheck'
  | 'Completed'
  | 'Scrapped'

export interface BaseTwinObject {
  id: string
  type: 'TwinObject'
  subType: NGSIProperty<TwinObjectSubType>
  twinType: NGSIProperty<TwinObjectTwinType>
  functionCategory: NGSIProperty<string> // 例如 F1.Station.Welding
  name: NGSIProperty<string>
  nameLang?: NGSIProperty<string>
  description?: NGSIProperty<string>
  location: NGSIGeoProperty
  status?: NGSIProperty<TwinObjectStatus>
  refScene?: NGSIRelationship
  refMBOM?: NGSIRelationship
  refRole?: NGSIRelationship
  refAssignments?: NGSIRelationship[]
  tags?: NGSIProperty<string[]>
  '@context': NGSIContext
}

// ---------------------------------------------------------------------------
// OrgUnit
// ---------------------------------------------------------------------------
export type OrgUnitType =
  | 'Factory'
  | 'Workshop'
  | 'ProductionLine'
  | 'Team'
  | 'Department'
  | 'Division'

export interface OrgUnitTwinObject extends BaseTwinObject {
  subType: NGSIProperty<'OrgUnit'>
  twinType: NGSIProperty<'Constituent'>
  orgUnitType: NGSIProperty<OrgUnitType>
  orgLevel: NGSIProperty<number> // >=1
  orgStatus?: NGSIProperty<'Active' | 'Inactive' | 'Restructuring'>
  parentOrg?: NGSIRelationship
}

// ---------------------------------------------------------------------------
// Station & Position
// ---------------------------------------------------------------------------
export type StationCategory =
  | 'ProductionStation'
  | 'InspectionStation'
  | 'AssemblyStation'
  | 'BufferZone'
  | 'HandlingStation'

export interface StationTwinObject extends BaseTwinObject {
  subType: NGSIProperty<'Station'>
  twinType: NGSIProperty<'Constituent'>
  stationCategory: NGSIProperty<StationCategory>
  processStep?: NGSIProperty<string> // 如 T01:P0010
  stdCycleTime?: NGSIProperty<number> // 单位:秒
  capacityWip?: NGSIProperty<number>
  refOrgUnit?: NGSIRelationship
  refPositions?: NGSIRelationship[]
}

export type PositionType =
  | 'WorkTable'
  | 'LoadingPoint'
  | 'UnloadingPoint'
  | 'InspectionPoint'
  | 'FixturePoint'
  | 'BufferPoint'
  | 'HandoverPoint'

export interface PositionTwinObject extends BaseTwinObject {
  subType: NGSIProperty<'Position'>
  twinType: NGSIProperty<'Constituent'>
  positionType?: NGSIProperty<PositionType>
  belongsToStation: NGSIRelationship
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------
export type AutoEquipmentType =
  | 'WeldingRobot'
  | 'Welder'
  | 'Positioner'
  | 'CNC'
  | 'PressMachine'
  | 'Laser'
  | 'Other'

export interface AutoEquipmentTwinObject extends BaseTwinObject {
  subType: NGSIProperty<'AutoEquipment'>
  twinType: NGSIProperty<'Constituent'>
  equipmentType: NGSIProperty<AutoEquipmentType>
  refStation?: NGSIRelationship
  manufacturer?: NGSIProperty<string>
  serialNumber?: NGSIProperty<string>
}

export type TransportEquipmentType =
  | 'Crane'
  | 'AGV'
  | 'RGV'
  | 'Conveyor'
  | 'Hoist'
  | 'Forklift'
  | 'Shuttle'
  | 'Other'

export interface TransportEquipmentTwinObject extends BaseTwinObject {
  subType: NGSIProperty<'TransportEquipment'>
  twinType: NGSIProperty<'Constituent'>
  transportType: NGSIProperty<TransportEquipmentType>
  payloadCapacity?: NGSIProperty<number>
  refOrgUnit?: NGSIRelationship
}

export interface QCToolTwinObject extends BaseTwinObject {
  subType: NGSIProperty<'QCTool'>
  twinType: NGSIProperty<'Constituent'>
  qcCapability?: NGSIProperty<string>
  refStation?: NGSIRelationship
}

// ---------------------------------------------------------------------------
// Personnel
// ---------------------------------------------------------------------------
export type ShiftSchedule = 'TwoShift' | 'ThreeShift' | 'Fixed'

export interface PersonTwinObject extends BaseTwinObject {
  subType: NGSIProperty<'Person'>
  twinType: NGSIProperty<'Constituent'>
  employeeId: NGSIProperty<string>
  roleName?: NGSIProperty<string>
  shiftSchedule?: NGSIProperty<ShiftSchedule>
  refOrgUnit?: NGSIRelationship
}

// ---------------------------------------------------------------------------
// Materials & transitional objects
// ---------------------------------------------------------------------------
export interface MaterialTwinObject extends BaseTwinObject {
  subType: NGSIProperty<'Material'>
  twinType: NGSIProperty<'Constituent'>
  materialCode?: NGSIProperty<string>
  specification?: NGSIProperty<string>
}

export interface ProductTwinObject extends BaseTwinObject {
  subType: NGSIProperty<'Product'>
  twinType: NGSIProperty<'Transitional'>
  productCode: NGSIProperty<string>
  model?: NGSIProperty<string>
  refMBOM?: NGSIRelationship
}

export type WorkpieceCurrentStatus = 'InProduction' | 'QualityCheck' | 'Completed' | 'Scrapped'

export interface WorkpieceTwinObject extends BaseTwinObject {
  subType: NGSIProperty<'Workpiece'>
  twinType: NGSIProperty<'Transitional'>
  workpieceCode: NGSIProperty<string>
  productType: NGSIProperty<string>
  currentStatus?: NGSIProperty<WorkpieceCurrentStatus>
  refProduct?: NGSIRelationship
  refStation?: NGSIRelationship
}

// ---------------------------------------------------------------------------
// Union type,方便前后端共享
// ---------------------------------------------------------------------------
export type TwinObject =
  | OrgUnitTwinObject
  | StationTwinObject
  | PositionTwinObject
  | AutoEquipmentTwinObject
  | TransportEquipmentTwinObject
  | QCToolTwinObject
  | PersonTwinObject
  | MaterialTwinObject
  | ProductTwinObject
  | WorkpieceTwinObject
