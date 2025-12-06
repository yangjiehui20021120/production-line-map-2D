import { create } from 'zustand'
import type {
  EquipmentEntity,
  PersonnelEntity,
  RealtimeEntity,
  WorkpieceEntity,
} from '../types/realtime'

export type EntityKind = 'equipment' | 'workpiece' | 'personnel'

const STATUS_CANONICAL: Record<EntityKind, string[]> = {
  equipment: ['Running', 'Idle', 'Fault', 'Maintenance'],
  workpiece: ['InProcess', 'Delayed', 'Completed'],
  personnel: ['Working', 'Break', 'Idle'],
}

function normalizeStatuses(kind: EntityKind, statuses: string[]): string[] {
  const allowed = STATUS_CANONICAL[kind]
  const set = new Set<string>()
  statuses.forEach((s) => {
    const hit = allowed.find((item) => item.toLowerCase() === s.toLowerCase())
    if (hit) set.add(hit)
  })
  // 保持原始顺序，过滤掉无效值
  return allowed.filter((item) => set.has(item))
}

interface FilterState {
  statuses: Record<EntityKind, string[]>
}

export type RealtimeFilters = FilterState

export type SelectedFeature =
  | { type: 'realtime'; entityKind: EntityKind; id: string }
  | {
      type: 'basemap'
      id: string
      name?: string
      featureType?: string
      status?: string
      processGroup?: string
      ct?: number
      layer?: string
    }

interface RealtimeState {
  equipment: EquipmentEntity[]
  workpieces: WorkpieceEntity[]
  personnel: PersonnelEntity[]
  filters: FilterState
  selected: SelectedFeature | null
  setInitialData: (payload: {
    equipment: EquipmentEntity[]
    workpieces: WorkpieceEntity[]
    personnel: PersonnelEntity[]
  }) => void
  applyUpdate: (entities: RealtimeEntity[]) => void
  updateFilter: (kind: EntityKind, statuses: string[]) => void
  selectEntity: (entity: SelectedFeature | null) => void
}

const DEFAULT_FILTERS: FilterState = {
  statuses: {
    equipment: STATUS_CANONICAL.equipment,
    workpiece: STATUS_CANONICAL.workpiece,
    personnel: STATUS_CANONICAL.personnel,
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
        statuses: { ...state.filters.statuses, [kind]: normalizeStatuses(kind, statuses) },
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

