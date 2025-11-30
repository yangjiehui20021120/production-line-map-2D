import type { NGSIContext, NGSIProperty, NGSIRelationship } from './ngsi'

export type ModalityCategory =
  | 'ProcessParameter'
  | 'QualityCharacteristic'
  | 'Geometry'
  | 'Environment'
  | 'Energy'
  | 'State'
  | 'Event'
  | 'Other'

export type ModalityValueType =
  | 'Number'
  | 'Integer'
  | 'Boolean'
  | 'Text'
  | 'Object'
  | 'Array'
  | 'Timestamp'

export type ModalitySource =
  | 'Sensor'
  | 'Manual'
  | 'Calculated'
  | 'Simulated'
  | 'Inferred'
  | 'Other'

export type ModalitySampleModel =
  | 'continuous'
  | 'perStep'
  | 'perPiece'
  | 'onEvent'
  | 'byStep'
  | 'other'

export type ModalityValueFormat =
  | 'scalar'
  | 'timeseries'
  | 'profile'
  | 'image'
  | 'pointcloud'
  | 'matrix'
  | 'other'

export type ModalityDomain =
  | 'process'
  | 'quality'
  | 'geometry'
  | 'environment'
  | 'energy'
  | 'safety'
  | 'other'

export interface ModalityEntity {
  id: string
  type: 'Modality'
  '@context': NGSIContext
  name: NGSIProperty<string>
  category: NGSIProperty<ModalityCategory>
  valueType: NGSIProperty<ModalityValueType>
  source: NGSIProperty<ModalitySource>
  description?: NGSIProperty<string>
  unit?: NGSIProperty<string>
  allowedRange?: NGSIProperty<[number, number]>
  accuracy?: NGSIProperty<string>
  sampleModel?: NGSIProperty<ModalitySampleModel>
  valueFormat?: NGSIProperty<ModalityValueFormat>
  domain?: NGSIProperty<ModalityDomain>
  version?: NGSIProperty<string>
  isDerived?: NGSIProperty<boolean>
  derivedFrom?: NGSIRelationship[]
  derivationRule?: NGSIProperty<string>
  relatedModalities?: NGSIRelationship[]
  businessNote?: NGSIProperty<string>
}

export interface ModalityBindingEntity {
  id: string
  type: 'ModalityBinding'
  '@context': NGSIContext
  twinId: NGSIRelationship
  modalityId: NGSIRelationship
  pointRef: NGSIProperty<string>
  bindingVersion?: NGSIProperty<string>
  changeId?: NGSIProperty<string>
  effectiveFrom?: NGSIProperty<string>
  effectiveTo?: NGSIProperty<string>
  unit?: NGSIProperty<string>
  sampleRate?: NGSIProperty<string>
  allowedRange?: NGSIProperty<[number, number]>
  discriminator?: NGSIProperty<Record<string, string>>
}




