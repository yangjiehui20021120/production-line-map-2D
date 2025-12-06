export interface StationEfficiencyData {
  id: string
  actualOEE: number
  targetOEE: number
}

export function isLowEfficiency(station: StationEfficiencyData): boolean {
  return station.actualOEE < station.targetOEE * 0.9
}

export function getLowEfficiencyStationIds(issues: Array<{ id: string }>): Set<string> {
  return new Set(issues.map((issue) => issue.id))
}






