import type { PointGeometry } from '@shared/types'

export type TrajectoryKind = 'equipment' | 'workpiece' | 'personnel'

export interface TrajectoryPoint {
  timestamp: string
  location: PointGeometry
  status?: string
}

export interface TrajectoryMeta {
  start: string
  end: string
  durationSec: number
  totalPoints: number
}

export interface TrajectorySummary {
  id: string
  name: string
  kind: TrajectoryKind
  processGroup?: string | null
  layer?: string | null
  availableRange: {
    start: string
    end: string
  }
  totalPoints: number
}

export interface TrajectorySeries {
  id: string
  name: string
  kind: TrajectoryKind
  processGroup?: string | null
  layer?: string | null
  points: TrajectoryPoint[]
  meta: TrajectoryMeta
}



