import { create } from 'zustand'
import type {
  BottleneckStation,
  EfficiencyIssue,
  QualityIssue,
  SpaghettiPathsData,
} from '../services/analysisService'

interface AnalysisState {
  bottlenecks: BottleneckStation[]
  qualityIssues: QualityIssue[]
  efficiencyIssues: EfficiencyIssue[]
  spaghettiPaths: SpaghettiPathsData | null
  isLoading: boolean
  error: string | null
  setBottlenecks: (bottlenecks: BottleneckStation[]) => void
  setQualityIssues: (issues: QualityIssue[]) => void
  setEfficiencyIssues: (issues: EfficiencyIssue[]) => void
  setSpaghettiPaths: (paths: SpaghettiPathsData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearAnalysis: () => void
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  bottlenecks: [],
  qualityIssues: [],
  efficiencyIssues: [],
  spaghettiPaths: null,
  isLoading: false,
  error: null,
  setBottlenecks: (bottlenecks) => set({ bottlenecks }),
  setQualityIssues: (issues) => set({ qualityIssues: issues }),
  setEfficiencyIssues: (issues) => set({ efficiencyIssues: issues }),
  setSpaghettiPaths: (paths) => set({ spaghettiPaths: paths }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearAnalysis: () =>
    set({
      bottlenecks: [],
      qualityIssues: [],
      efficiencyIssues: [],
      spaghettiPaths: null,
      error: null,
    }),
}))






