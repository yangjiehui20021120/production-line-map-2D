import { create } from 'zustand'

export type AppMode = 'live' | 'history' | 'simulation'

interface AppState {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'live',
  setMode: (mode) => set({ mode }),
}))



