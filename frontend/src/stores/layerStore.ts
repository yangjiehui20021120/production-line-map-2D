import { create } from 'zustand'

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
  flow: ['stations', 'mainFlow', 'wip', 'bottleneck'],
  quality: ['stations', 'quality', 'rework', 'andon'],
  efficiency: ['stations', 'oee', 'equipment'],
  plan: ['stations', 'orders', 'crane'],
  spaghetti: ['stations', 'mainFlow', 'rework', 'waterSpider', 'spaghetti'],
}

interface LayerState {
  activeLayers: LayerId[]
  viewMode: ViewMode
  toggleLayer: (layerId: LayerId) => void
  switchView: (mode: ViewMode) => void
}

const DEFAULT_VIEW: ViewMode = 'flow'

export const useLayerStore = create<LayerState>((set) => ({
  activeLayers: VIEW_LAYER_MAP[DEFAULT_VIEW],
  viewMode: DEFAULT_VIEW,
  toggleLayer: (layerId: LayerId) =>
    set((state) => {
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
      activeLayers: VIEW_LAYER_MAP[mode],
    }),
}))

