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
  try {
    const { data } = await apiClient.get<RealtimeResponse>('/api/v1/realtime/entities')
    return {
      equipment: data.data.equipment ?? [],
      workpieces: data.data.workpieces ?? [],
      personnel: data.data.personnel ?? [],
    }
  } catch (error) {
    console.error('[RealtimeService] Failed to fetch realtime entities:', error)
    // 返回空数组，避免UI崩溃
    return {
      equipment: [],
      workpieces: [],
      personnel: [],
    }
  }
}

