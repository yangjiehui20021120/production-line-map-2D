import { useQuery } from '@tanstack/react-query'
import type { KPIItem, KPIResponse } from '../types/kpi'
import { apiClient } from './apiClient'
import { appConfig, KPI_REFRESH_INTERVAL } from '../config/appConfig'
import { mockKpiResponse } from '../mocks/kpiMock'

const KPI_QUERY_KEY = ['kpi-summary']

async function fetchKPIFromApi(): Promise<KPIItem[]> {
  const { data } = await apiClient.get<KPIResponse>('/api/map/kpi')
  return data.data
}

async function fetchKPI(): Promise<KPIItem[]> {
  if (appConfig.useMock || !appConfig.apiBaseUrl) {
    return mockKpiResponse.data
  }
  return fetchKPIFromApi()
}

export function useKPIQuery() {
  return useQuery({
    queryKey: KPI_QUERY_KEY,
    queryFn: fetchKPI,
    refetchInterval: KPI_REFRESH_INTERVAL,
  })
}

