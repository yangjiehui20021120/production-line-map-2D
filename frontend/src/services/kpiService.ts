import { useQuery } from '@tanstack/react-query'
import type { KPIItem, KPIResponse } from '../types/kpi'
import { apiClient } from './apiClient'
import { KPI_REFRESH_INTERVAL } from '../config/appConfig'

const KPI_QUERY_KEY = ['kpi-summary']

async function fetchKPI(): Promise<KPIItem[]> {
  try {
    const { data } = await apiClient.get<KPIResponse>('/api/v1/map/kpi')
    return data.data
  } catch (error) {
    console.error('[KPIService] Failed to fetch KPI data:', error)
    // 返回空数组，避免UI崩溃
    return []
  }
}

export function useKPIQuery() {
  return useQuery({
    queryKey: KPI_QUERY_KEY,
    queryFn: fetchKPI,
    refetchInterval: KPI_REFRESH_INTERVAL,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

