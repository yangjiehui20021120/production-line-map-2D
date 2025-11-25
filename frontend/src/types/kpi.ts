export type KPIStatus = 'green' | 'yellow' | 'red'
export type KPITrend = 'up' | 'down' | 'stable'

export interface KPIItem {
  id: string
  name: string
  value: number
  unit: string
  target: number
  threshold: {
    green: number
    yellow: number
  }
  status: KPIStatus
  trend: KPITrend
  observedAt: string
}

export interface KPIResponse {
  success: boolean
  data: KPIItem[]
  lastUpdated: string
}

