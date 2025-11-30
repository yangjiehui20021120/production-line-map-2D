import type { NGSIContext, NGSIProperty, NGSIRelationship } from './ngsi'

export type MBOMType = 'MBOMRoot' | 'Route' | 'Takt' | 'Process' | 'Step'
export type MBOMStatus = 'active' | 'draft' | 'retired' | 'deprecated'
export type ProcessKind =
  | 'Manual'
  | 'SemiAuto'
  | 'FullAuto'
  | 'Inspection'
  | 'Transport'
  | 'Other'

export interface MeasurementRequirement {
  modalityCode: string
  ruleId: string
  timing: 'pre' | 'in' | 'post' | string
  aggregator?: 'sum' | 'mean' | 'max' | 'min' | 'avg' | string
  capturedByResourceClass?: string
  description?: string
  targetValue?: number
  tolerance?: number
}

export interface ResourceRequirement {
  resourceClass: 'AutoEquipment' | 'Person' | 'QCTool' | 'TransportEquipment' | 'Other' | string
  resourceId?: string
  roleId?: string
  quantity?: number
  capability?: string
  skillLevel?: string
}

export interface BaseMBOM {
  id: string
  type: 'MBOM'
  '@context': NGSIContext
  mbomType: NGSIProperty<MBOMType>
  status: NGSIProperty<MBOMStatus>
  metadata?: NGSIProperty<Record<string, unknown>>
}

export interface MBOMRootEntity extends BaseMBOM {
  mbomType: NGSIProperty<'MBOMRoot'>
  mbomCode: NGSIProperty<string>
  mbomName: NGSIProperty<string>
  mbomVersion: NGSIProperty<string>
  productCode: NGSIProperty<string>
  hasRoute: NGSIRelationship
  totalProcesses?: NGSIProperty<number>
  totalSteps?: NGSIProperty<number>
  effectiveFrom?: NGSIProperty<string>
  effectiveTo?: NGSIProperty<string>
}

export interface RouteEntity extends BaseMBOM {
  mbomType: NGSIProperty<'Route'>
  routeCode: NGSIProperty<string>
  routeName: NGSIProperty<string>
  lineCode: NGSIProperty<string>
  partOfMBOM: NGSIRelationship
  consistsOfTakts: NGSIRelationship[]
  taktCount?: NGSIProperty<number>
  totalCycleTime?: NGSIProperty<number>
  requiredMeasurements?: NGSIProperty<MeasurementRequirement[]>
}

export type TaktTimeWindow = 'perPiece' | 'perBatch' | 'perShift' | 'perDay'

export interface TaktEntity extends BaseMBOM {
  mbomType: NGSIProperty<'Takt'>
  taktSeq: NGSIProperty<number>
  taktName: NGSIProperty<string>
  targetCT?: NGSIProperty<number>
  defaultTimeWindow?: NGSIProperty<TaktTimeWindow>
  partOfRoute: NGSIRelationship
  includesProcesses: NGSIRelationship[]
  processCount?: NGSIProperty<number>
  estimatedDuration?: NGSIProperty<number>
  requiredMeasurements?: NGSIProperty<MeasurementRequirement[]>
}

export interface ProcessEntity extends BaseMBOM {
  mbomType: NGSIProperty<'Process'>
  procCode: NGSIProperty<string>
  procName: NGSIProperty<string>
  stationCode: NGSIProperty<string>
  processKind?: NGSIProperty<ProcessKind>
  partOfTakt: NGSIRelationship
  composedOfSteps: NGSIRelationship[]
  nextProcess?: NGSIRelationship
  stdTime?: NGSIProperty<number>
  stepCount?: NGSIProperty<number>
  requiredResources?: NGSIProperty<ResourceRequirement[]>
  requiredMeasurements?: NGSIProperty<MeasurementRequirement[]>
}

export interface StepEntity extends BaseMBOM {
  mbomType: NGSIProperty<'Step'>
  stepSeq: NGSIProperty<number>
  stepName: NGSIProperty<string>
  stationCode: NGSIProperty<string>
  stdTime: NGSIProperty<number>
  stepDescription?: NGSIProperty<string>
  processKind?: NGSIProperty<ProcessKind>
  partOfProcess: NGSIRelationship
  predecessorStep?: NGSIRelationship
  successorStep?: NGSIRelationship
  isOptional?: NGSIProperty<boolean>
  canRunInParallel?: NGSIProperty<boolean>
  requiredResources?: NGSIProperty<ResourceRequirement[]>
  requiredMeasurements?: NGSIProperty<MeasurementRequirement[]>
}

export type MBOMEntity =
  | MBOMRootEntity
  | RouteEntity
  | TaktEntity
  | ProcessEntity
  | StepEntity



