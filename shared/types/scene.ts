import type { NGSIContext, NGSIProperty, NGSIRelationship } from './ngsi'

export type SceneLevel = 'Route' | 'Takt' | 'Process' | 'Step'
export type SceneStatus =
  | 'Pending'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'OnHold'

export interface SceneTimeFrame {
  start: string
  end?: string | null
  actualDuration?: number
}

export interface SceneLocation {
  lineCode?: string
  zoneId?: string
  stationCode?: string
  bufferId?: string
  coordinates?: [number, number]
}

export interface MaterialUsage {
  materialId: string
  materialName?: string
  quantity?: number
  unit?: string
  batchNo?: string
}

export interface SceneStepResult {
  status?: 'Pass' | 'Fail' | 'Skip' | string
  qualityScore?: number
  remarks?: string
}

export interface SceneStepLogEntry {
  stepId: string
  performedBy: {
    personId: string
    roleId?: string
  }
  observedAt: string
  duration?: number
  resultData?: SceneStepResult
}

export interface SceneException {
  exceptionType: string
  timestamp: string
  severity: 'Info' | 'Warning' | 'Minor' | 'Major' | 'Critical' | string
  description?: string
  resolvedBy?: string
}

export interface SceneEntity {
  id: string
  type: 'Scene'
  '@context': NGSIContext
  sceneLevel: NGSIProperty<SceneLevel>
  sceneCode: NGSIProperty<string>
  sceneName: NGSIProperty<string>
  refMBOM: NGSIRelationship
  refMBOMVersion: NGSIProperty<string>
  timeFrame: NGSIProperty<SceneTimeFrame>
  status: NGSIProperty<SceneStatus>
  location?: NGSIProperty<SceneLocation>
  partOf?: NGSIRelationship
  includesSubScenes?: NGSIRelationship[]
  refFinalProduct?: NGSIRelationship
  involvesAsset?: NGSIRelationship[]
  inputWorkpiece?: NGSIRelationship
  outputWorkpiece?: NGSIRelationship
  inputMaterials?: NGSIProperty<MaterialUsage[]>
  stepLog?: NGSIProperty<SceneStepLogEntry[]>
  qualityResult?: NGSIProperty<{ overallStatus: string; score?: number }>
  exceptionLog?: NGSIProperty<SceneException[]>
  refRouteScene?: NGSIRelationship
}




