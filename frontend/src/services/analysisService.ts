import { apiClient } from './apiClient'

export interface BottleneckStation {
  id: string
  name: string
  processGroup: string
  location: { type: string; coordinates: [number, number] }
  wipCount: number
  avgProcessTime: number
  standardCT: number
  threshold: number
  queueLength: number
}

export interface QualityIssue {
  id: string
  name: string
  location: { type: string; coordinates: [number, number] }
  status: string
  recentDefectRate24h: number
  qualityThreshold: number
  oee: number
}

export interface EfficiencyIssue {
  id: string
  name: string
  processGroup: string
  location: { type: string; coordinates: [number, number] }
  actualOEE: number
  targetOEE: number
  oeeBreakdown: {
    availability: number
    performance: number
    quality: number
  }
}

export interface SpaghettiPath {
  id: string
  workpieceId: string
  path: Array<{
    timestamp: string
    coordinates: [number, number]
  }>
  frequency: number
}

export interface SpaghettiPathsData {
  paths: SpaghettiPath[]
  totalPaths: number
  maxFrequency: number
  pathSegments: Record<string, number>
}

export async function fetchBottlenecks(): Promise<BottleneckStation[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: BottleneckStation[] }>(
      '/api/v1/analysis/bottlenecks'
    )
    return data.data
  } catch (error) {
    console.error('[AnalysisService] Failed to fetch bottlenecks:', error)
    return []
  }
}

export async function fetchQualityIssues(): Promise<QualityIssue[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: QualityIssue[] }>(
      '/api/v1/analysis/quality-issues'
    )
    return data.data
  } catch (error) {
    console.error('[AnalysisService] Failed to fetch quality issues:', error)
    return []
  }
}

export async function fetchEfficiencyIssues(): Promise<EfficiencyIssue[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: EfficiencyIssue[] }>(
      '/api/v1/analysis/efficiency-issues'
    )
    return data.data
  } catch (error) {
    console.error('[AnalysisService] Failed to fetch efficiency issues:', error)
    return []
  }
}

export async function fetchSpaghettiPaths(hours: number = 24): Promise<SpaghettiPathsData> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: SpaghettiPathsData }>(
      `/api/v1/analysis/spaghetti-paths?hours=${hours}`
    )
    return data.data
  } catch (error) {
    console.error('[AnalysisService] Failed to fetch spaghetti paths:', error)
    return {
      paths: [],
      totalPaths: 0,
      maxFrequency: 0,
      pathSegments: {},
    }
  }
}

