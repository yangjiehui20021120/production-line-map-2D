import type { BottleneckStation } from '../services/analysisService'

export function calculateThreshold(capacity: number): number {
  return Math.max(3, Math.floor(capacity * 0.7))
}

export function isBottleneck(
  wipCount: number,
  avgProcessTime: number,
  standardCT: number,
  threshold: number
): boolean {
  return wipCount > threshold || (standardCT > 0 && avgProcessTime > standardCT * 1.2)
}

export function getBottleneckStationIds(bottlenecks: BottleneckStation[]): Set<string> {
  return new Set(bottlenecks.map((b) => b.id))
}



