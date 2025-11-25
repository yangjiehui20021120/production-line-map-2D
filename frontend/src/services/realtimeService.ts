import { appConfig } from '../config/appConfig'
import { mockEquipment, mockPersonnel, mockWorkpieces } from '../mocks/realtimeMock'
import type {
  EquipmentEntity,
  PersonnelEntity,
  RealtimeResponse,
  WorkpieceEntity,
} from '../types/realtime'
import { apiClient } from './apiClient'

export interface RealtimeEntitiesPayload {
  equipment: EquipmentEntity[]
  workpieces: WorkpieceEntity[]
  personnel: PersonnelEntity[]
}

export async function fetchRealtimeEntities(): Promise<RealtimeEntitiesPayload> {
  if (appConfig.useMock || !appConfig.apiBaseUrl) {
    return {
      equipment: mockEquipment,
      workpieces: mockWorkpieces,
      personnel: mockPersonnel,
    }
  }
  const { data } = await apiClient.get<RealtimeResponse>('/api/v1/realtime/entities')
  return {
    equipment: data.data.equipment ?? [],
    workpieces: data.data.workpieces ?? [],
    personnel: data.data.personnel ?? [],
  }
}

