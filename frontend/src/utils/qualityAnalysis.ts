export interface EquipmentQualityData {
  id: string
  recentDefectRate24h: number
  qualityThreshold: number
}

export function hasQualityIssue(equipment: EquipmentQualityData): boolean {
  return equipment.recentDefectRate24h > equipment.qualityThreshold
}

export function getQualityIssueIds(issues: Array<{ id: string }>): Set<string> {
  return new Set(issues.map((issue) => issue.id))
}



