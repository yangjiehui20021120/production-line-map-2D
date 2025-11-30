import { create } from 'zustand'
import type { TrajectorySeries } from '../types/trajectory'

interface TimelineBounds {
  start: number
  end: number
}

export interface RequestedWindow {
  start?: string
  end?: string
}

interface TrajectoryState {
  series: TrajectorySeries[]
  timeline: TimelineBounds | null
  requestedWindow: RequestedWindow
  currentTs: number
  playing: boolean
  playSpeed: number
  loop: boolean
  setSeries: (series: TrajectorySeries[]) => void
  setRequestedWindow: (window: RequestedWindow) => void
  setPlaySpeed: (speed: number) => void
  togglePlay: () => void
  setLoop: (loop: boolean) => void
  seek: (ratioOrTs: number | string | Date) => void
  tick: (deltaMs: number) => void
  stop: () => void
  reset: () => void
}

const DEFAULT_SPEED = 1

function extractBounds(series: TrajectorySeries): { start?: number; end?: number } {
  const metaStart = Date.parse(series.meta?.start ?? '')
  const metaEnd = Date.parse(series.meta?.end ?? '')
  const pointTimes = (series.points ?? []).map((pt) => Date.parse(pt.timestamp)).filter((t) => !Number.isNaN(t))
  const start = !Number.isNaN(metaStart) ? metaStart : Math.min(...pointTimes)
  const end = !Number.isNaN(metaEnd) ? metaEnd : Math.max(...pointTimes)
  return { start: Number.isFinite(start) ? start : undefined, end: Number.isFinite(end) ? end : undefined }
}

function computeTimeline(seriesList: TrajectorySeries[]): TimelineBounds | null {
  if (!seriesList.length) return null
  const bounds = seriesList.map(extractBounds).filter((b) => b.start !== undefined && b.end !== undefined) as {
    start: number
    end: number
  }[]
  if (!bounds.length) return null
  const start = Math.min(...bounds.map((b) => b.start))
  const end = Math.max(...bounds.map((b) => b.end))
  if (Number.isNaN(start) || Number.isNaN(end) || start === end) {
    return null
  }
  return { start, end }
}

function clampToTimeline(ts: number, bounds: TimelineBounds | null): number {
  if (!bounds) return ts
  return Math.min(bounds.end, Math.max(bounds.start, ts))
}

export const useTrajectoryStore = create<TrajectoryState>((set) => ({
  series: [],
  timeline: null,
  requestedWindow: {},
  currentTs: 0,
  playing: false,
  playSpeed: DEFAULT_SPEED,
  loop: false,
  setSeries: (series) =>
    set((state) => {
      const normalized = series.map(normalizeSeries)
      const timeline = computeTimeline(normalized)
      const initialTs = timeline ? timeline.start : state.currentTs
      return {
        series: normalized,
        timeline,
        currentTs: initialTs,
        playing: false,
      }
    }),
  setRequestedWindow: (window) => set({ requestedWindow: window }),
  setPlaySpeed: (speed) => set({ playSpeed: Math.max(0.1, speed) }),
  togglePlay: () => set((state) => ({ playing: !state.playing })),
  setLoop: (loop) => set({ loop }),
  seek: (ratioOrTs) =>
    set((state) => {
      if (!state.timeline) {
        return state
      }
      let targetTs: number
      if (typeof ratioOrTs === 'number') {
        const clampedRatio = Math.min(1, Math.max(0, ratioOrTs))
        targetTs = state.timeline.start + clampedRatio * (state.timeline.end - state.timeline.start)
      } else {
        const parsed =
          ratioOrTs instanceof Date ? ratioOrTs.getTime() : Date.parse(ratioOrTs as string)
        targetTs = Number.isNaN(parsed) ? state.timeline.start : parsed
      }
      return { currentTs: clampToTimeline(targetTs, state.timeline) }
    }),
  tick: (deltaMs) =>
    set((state) => {
      if (!state.playing || !state.timeline) return state
      const delta = deltaMs * state.playSpeed
      const nextTs = state.currentTs + delta
      if (nextTs >= state.timeline.end) {
        if (state.loop) {
          return { currentTs: state.timeline.start }
        }
        return { currentTs: state.timeline.end, playing: false }
      }
      return { currentTs: nextTs }
    }),
  stop: () => set({ playing: false }),
  reset: () =>
    set((state) => ({
      series: [],
      timeline: null,
      currentTs: 0,
      playing: false,
      playSpeed: DEFAULT_SPEED,
      requestedWindow: {},
      loop: state.loop,
    })),
}))

function normalizeSeries(series: TrajectorySeries): TrajectorySeries {
  const sortedPoints = (series.points ?? [])
    .map((pt) => ({
      ...pt,
      timestamp: pt.timestamp,
    }))
    .filter((pt) => !Number.isNaN(Date.parse(pt.timestamp)) && Array.isArray(pt.location?.coordinates))
  sortedPoints.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
  const pointTimes = sortedPoints.map((pt) => Date.parse(pt.timestamp))
  const metaStart = !Number.isNaN(Date.parse(series.meta?.start ?? ''))
    ? series.meta.start
    : sortedPoints[0]?.timestamp ?? series.meta.start
  const metaEnd = !Number.isNaN(Date.parse(series.meta?.end ?? ''))
    ? series.meta.end
    : sortedPoints[sortedPoints.length - 1]?.timestamp ?? series.meta.end
  const durationSec =
    series.meta?.durationSec && Number.isFinite(series.meta.durationSec)
      ? series.meta.durationSec
      : pointTimes.length >= 2
        ? Math.max(0, Math.round((Math.max(...pointTimes) - Math.min(...pointTimes)) / 1000))
        : 0
  const totalPoints =
    series.meta?.totalPoints && Number.isFinite(series.meta.totalPoints)
      ? series.meta.totalPoints
      : sortedPoints.length

  return {
    ...series,
    points: sortedPoints,
    meta: {
      ...series.meta,
      start: metaStart ?? '',
      end: metaEnd ?? metaStart ?? '',
      durationSec,
      totalPoints,
    },
  }
}




