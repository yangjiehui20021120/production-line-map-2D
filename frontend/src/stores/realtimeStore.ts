import { create } from 'zustand'
import type {
  EquipmentEntity,
  PersonnelEntity,
  RealtimeEntity,
  WorkpieceEntity,
} from '../types/realtime'

export type EntityKind = 'equipment' | 'workpiece' | 'personnel'

interface FilterState {
  statuses: Record<EntityKind, string[]>
}

export type RealtimeFilters = FilterState

interface RealtimeState {
  equipment: EquipmentEntity[]
  workpieces: WorkpieceEntity[]
  personnel: PersonnelEntity[]
  filters: FilterState
  selected: { id: string; kind: EntityKind } | null
  setInitialData: (payload: {
    equipment: EquipmentEntity[]
    workpieces: WorkpieceEntity[]
    personnel: PersonnelEntity[]
  }) => void
  applyUpdate: (entities: RealtimeEntity[]) => void
  updateFilter: (kind: EntityKind, statuses: string[]) => void
  selectEntity: (entity: { id: string; kind: EntityKind } | null) => void
}

const DEFAULT_FILTERS: FilterState = {
  statuses: {
    equipment: ['Running', 'Idle', 'Fault', 'Maintenance'],
    workpiece: ['InProcess', 'Delayed', 'Completed'],
    personnel: ['Working', 'Break', 'Idle'],
  },
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  equipment: [],
  workpieces: [],
  personnel: [],
  filters: DEFAULT_FILTERS,
  selected: null,
  setInitialData: (payload) =>
    set({
      equipment: payload.equipment,
      workpieces: payload.workpieces,
      personnel: payload.personnel,
    }),
  applyUpdate: (entities) =>
    set((state) => {
      const next = { ...state }
      for (const entity of entities) {
        switch (entity.entityType) {
          case 'Equipment':
            next.equipment = replaceEntity(state.equipment, entity)
            break
          case 'Workpiece':
            next.workpieces = replaceEntity(state.workpieces, entity)
            break
          case 'Person':
            next.personnel = replaceEntity(state.personnel, entity)
            break
          default:
            break
        }
      }
      return next
    }),
  updateFilter: (kind, statuses) =>
    set((state) => ({
      filters: {
        statuses: { ...state.filters.statuses, [kind]: statuses },
      },
    })),
  selectEntity: (entity) => set({ selected: entity }),
}))

function replaceEntity<T extends RealtimeEntity>(collection: T[], entity: T): T[] {
  const index = collection.findIndex((item) => item.id === entity.id)
  if (index === -1) {
    return [...collection, entity]
  }
  const next = [...collection]
  next[index] = entity
  return next
}

