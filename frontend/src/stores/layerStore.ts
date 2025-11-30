import { create } from 'zustand'
import { alwaysOnLayerIds, enabledLayerIds, layerDefinitionMap } from '../config/mapLayers'

export type LayerId =
  | 'stations'
  | 'mainFlow'
  | 'wip'
  | 'bottleneck'
  | 'andon'
  | 'oee'
  | 'equipment'
  | 'personnel'
  | 'crane'
  | 'orders'
  | 'spaghetti'
  | 'quality'
  | 'rework'
  | 'waterSpider'

export type ViewMode = 'flow' | 'quality' | 'efficiency' | 'plan' | 'spaghetti'

const VIEW_LAYER_MAP: Record<ViewMode, LayerId[]> = {
  flow: ['stations', 'mainFlow', 'wip', 'bottleneck', 'equipment', 'personnel'],
  quality: ['stations', 'quality', 'rework', 'andon', 'equipment', 'personnel'],
  efficiency: ['stations', 'oee', 'equipment', 'personnel'],
  plan: ['stations', 'orders', 'crane', 'personnel', 'equipment', 'wip'],
  spaghetti: ['stations', 'mainFlow', 'rework', 'waterSpider', 'spaghetti', 'wip', 'personnel'],
}

const sanitizeActiveLayers = (layers: LayerId[]): LayerId[] => {
  const unique = Array.from(new Set([...layers, ...alwaysOnLayerIds]))
  const filtered = unique.filter((id) => layerDefinitionMap[id]?.enabled)
  if (filtered.length > 0) return filtered
  return enabledLayerIds.length ? [enabledLayerIds[0]] : []
}

interface LayerState {
  activeLayers: LayerId[]
  viewMode: ViewMode
  toggleLayer: (layerId: LayerId) => void
  switchView: (mode: ViewMode) => void
}

const DEFAULT_VIEW: ViewMode = 'flow'

export const useLayerStore = create<LayerState>((set) => ({
  activeLayers: sanitizeActiveLayers(VIEW_LAYER_MAP[DEFAULT_VIEW]),
  viewMode: DEFAULT_VIEW,
  toggleLayer: (layerId: LayerId) =>
    set((state) => {
      const def = layerDefinitionMap[layerId]
      if (!def?.enabled || def.alwaysOn) {
        return state
      }
      const isActive = state.activeLayers.includes(layerId)
      return {
        activeLayers: isActive
          ? state.activeLayers.filter((id) => id !== layerId)
          : [...state.activeLayers, layerId],
      }
    }),
  switchView: (mode: ViewMode) =>
    set({
      viewMode: mode,
      activeLayers: sanitizeActiveLayers(VIEW_LAYER_MAP[mode]),
    }),
}))
