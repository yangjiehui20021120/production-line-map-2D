import type { PointGeometry } from '@shared/types'

export type EquipmentStatus = 'Running' | 'Idle' | 'Fault' | 'Maintenance'
export type WorkpieceStatus = 'InProcess' | 'Delayed' | 'Completed'
export type PersonnelStatus = 'Working' | 'Break' | 'Idle'

export interface BaseRealtimeEntity {
  id: string
  name: string
  location: PointGeometry
  status: string
}

export interface EquipmentEntity extends BaseRealtimeEntity {
  entityType: 'Equipment'
  status: EquipmentStatus
  attributes: {
    type: string
    oee: number
    temperature: number
    assignedStation?: string
  }
}

export interface WorkpieceEntity extends BaseRealtimeEntity {
  entityType: 'Workpiece'
  status: WorkpieceStatus
  attributes: {
    progress: number
    queueTime: number
    currentStation?: string
  }
}

export interface PersonnelEntity extends BaseRealtimeEntity {
  entityType: 'Person'
  status: PersonnelStatus
  attributes: {
    role: string
    assignedStation?: string
  }
}

export type RealtimeEntity = EquipmentEntity | WorkpieceEntity | PersonnelEntity

export interface RealtimeResponse {
  success: boolean
  data: {
    equipment?: EquipmentEntity[]
    workpieces?: WorkpieceEntity[]
    personnel?: PersonnelEntity[]
  }
}

export interface RealtimeUpdateMessage {
  type: 'entityUpdate'
  timestamp: string
  entities: RealtimeEntity[]
}
