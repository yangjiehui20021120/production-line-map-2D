import type { NGSIContext, NGSIProperty, NGSIRelationship } from './ngsi'

export type ModalDataQualityTag = 'OK' | 'Warning' | 'Error' | 'Unknown' | 'Invalid'

export type ModalDataValue =
  | number
  | string
  | boolean
  | number[]
  | string[]
  | boolean[]
  | Record<string, unknown>

export interface ModalDataProvenance {
  sourceTwinId?: string
  method?: string
  pipelineStage?: string
  collector?: string
  notes?: string
}

export interface ModalDataEntity {
  id: string
  type: 'ModalData'
  '@context': NGSIContext
  refTwin: NGSIRelationship
  refScene: NGSIRelationship
  refModality: NGSIRelationship
  value: NGSIProperty<ModalDataValue>
  observedAt: string
  qualityTag: NGSIProperty<ModalDataQualityTag>
  qualityScore?: NGSIProperty<number>
  sequenceNumber?: NGSIProperty<number>
  provenance: NGSIProperty<ModalDataProvenance>
  isDerived?: NGSIProperty<boolean>
  derivedFrom?: NGSIRelationship[]
  computationRule?: NGSIProperty<string>
  metadata?: NGSIProperty<Record<string, unknown>>
}




