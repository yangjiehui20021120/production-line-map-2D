import type { TrajectoryKind, TrajectorySeries, TrajectorySummary } from '../types/trajectory'
import { apiClient } from './apiClient'

interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface TrajectorySearchParams {
  entityType?: TrajectoryKind
  start?: string
  end?: string
}

export interface TrajectoryDetailParams {
  start?: string
  end?: string
  maxPoints?: number
}

export async function fetchTrajectoryEntities(
  params: TrajectorySearchParams = {},
): Promise<TrajectorySummary[]> {
  try {
    const query = {
      entityType: params.entityType,
      start: params.start,
      end: params.end,
    }
    const { data } = await apiClient.get<ApiResponse<TrajectorySummary[]>>('/api/v1/trajectory/search', {
      params: query,
    })
    return data.data
  } catch (error) {
    console.error('[TrajectoryService] Failed to fetch trajectory entities:', error)
    return []
  }
}

export async function fetchTrajectorySeries(
  entityId: string,
  params: TrajectoryDetailParams = {},
): Promise<TrajectorySeries> {
  try {
    const query = {
      start: params.start,
      end: params.end,
      max_points: params.maxPoints,
    }
    const { data } = await apiClient.get<ApiResponse<TrajectorySeries>>(
      `/api/v1/trajectory/${encodeURIComponent(entityId)}`,
      { params: query },
    )
    return normalizeSeries(data.data)
  } catch (error) {
    console.error('[TrajectoryService] Failed to fetch trajectory series:', error)
    // 返回空轨迹数据
    return {
      id: entityId,
      kind: 'workpiece',
      name: '',
      points: [],
    }
  }
}

function normalizeSeries(series: TrajectorySeries): TrajectorySeries {
  // 兼容后端若返回旧字段(ts/position)的情况，转换为 timestamp/location 结构
  const points = series.points.map((pt: any) => ({
    timestamp: pt.timestamp ?? pt.ts,
    location:
      pt.location ??
      (pt.position
        ? { type: 'Point', coordinates: pt.position.coordinates }
        : pt.x !== undefined && pt.y !== undefined
          ? { type: 'Point', coordinates: [pt.x, pt.y] }
          : undefined),
    status: pt.status,
  }))
  return {
    ...series,
    points,
  }
}



