import { useEffect, useMemo, useState } from 'react'
import { fetchTrajectoryEntities, fetchTrajectorySeries } from '../../services/trajectoryService'
import type { TrajectorySummary } from '../../types/trajectory'
import { useTrajectoryStore } from '../../stores/trajectoryStore'

const SPEED_OPTIONS = [0.5, 1, 2, 4]
const SEEK_STEP_SECONDS = 10

export function TimelinePanel() {
  const [available, setAvailable] = useState<TrajectorySummary[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingSeries, setLoadingSeries] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const series = useTrajectoryStore((state) => state.series)
  const timeline = useTrajectoryStore((state) => state.timeline)
  const currentTs = useTrajectoryStore((state) => state.currentTs)
  const playing = useTrajectoryStore((state) => state.playing)
  const playSpeed = useTrajectoryStore((state) => state.playSpeed)
  const loop = useTrajectoryStore((state) => state.loop)
  const togglePlay = useTrajectoryStore((state) => state.togglePlay)
  const setPlaySpeed = useTrajectoryStore((state) => state.setPlaySpeed)
  const setLoop = useTrajectoryStore((state) => state.setLoop)
  const setSeries = useTrajectoryStore((state) => state.setSeries)
  const setRequestedWindow = useTrajectoryStore((state) => state.setRequestedWindow)
  const seek = useTrajectoryStore((state) => state.seek)
  const stop = useTrajectoryStore((state) => state.stop)
  const reset = useTrajectoryStore((state) => state.reset)

  useEffect(() => {
    loadAvailable()
  }, [])

  const progress = useMemo(() => {
    if (!timeline) return 0
    const span = Math.max(1, timeline.end - timeline.start)
    return Math.min(100, Math.max(0, ((currentTs - timeline.start) / span) * 100))
  }, [timeline, currentTs])

  async function loadAvailable() {
    setLoadingList(true)
    setError(null)
    try {
      const items = await fetchTrajectoryEntities()
      setAvailable(items)
      if (items.length && !selectedId) {
        setSelectedId(items[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '无法加载轨迹列表')
    } finally {
      setLoadingList(false)
    }
  }

  function stepBySeconds(deltaSeconds: number) {
    if (!timeline) return
    const span = Math.max(1, timeline.end - timeline.start)
    const nextTs = Math.min(timeline.end, Math.max(timeline.start, currentTs + deltaSeconds * 1000))
    const ratio = (nextTs - timeline.start) / span
    seek(ratio)
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        stepBySeconds(SEEK_STEP_SECONDS)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        stepBySeconds(-SEEK_STEP_SECONDS)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [togglePlay, timeline, currentTs])

  async function loadSeries() {
    if (!selectedId) {
      setError('请选择需要回放的对象')
      return
    }
    setLoadingSeries(true)
    setError(null)
    try {
      const seriesData = await fetchTrajectorySeries(selectedId)
      setSeries([seriesData])
      setRequestedWindow({ start: seriesData.meta.start, end: seriesData.meta.end })
      seek(0)
      stop()
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载轨迹失败')
    } finally {
      setLoadingSeries(false)
    }
  }

  const currentLabel = timeline ? formatDate(currentTs) : '--'

  return (
    <section className="panel timeline-panel">
      <header className="panel-header">
        <span>⏱️ 历史回放</span>
        <div className="panel-actions">
          <button className="ghost" onClick={loadAvailable} disabled={loadingList}>
            刷新列表
          </button>
          <button className="ghost" onClick={reset}>
            清除轨迹
          </button>
        </div>
      </header>
      <div className="panel-body timeline-body">
        <div className="timeline-row">
          <label htmlFor="trajectorySelect">轨迹对象</label>
          <select
            id="trajectorySelect"
            value={selectedId ?? ''}
            onChange={(event) => setSelectedId(event.target.value)}
          >
        {available.length === 0 && <option value="">暂无可用轨迹</option>}
            {available.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.kind}
              </option>
            ))}
          </select>
          <button className="primary" onClick={loadSeries} disabled={loadingSeries}>
            {loadingSeries ? '加载中...' : '载入轨迹'}
          </button>
        </div>
        <div className="timeline-row controls">
          <button className="primary" onClick={togglePlay} disabled={!timeline}>
            {playing ? '暂停' : '播放'}
          </button>
          <div className="ff-group">
            <button onClick={() => stepBySeconds(-SEEK_STEP_SECONDS)} disabled={!timeline}>
              -{SEEK_STEP_SECONDS}s
            </button>
            <button onClick={() => stepBySeconds(SEEK_STEP_SECONDS)} disabled={!timeline}>
              +{SEEK_STEP_SECONDS}s
            </button>
          </div>
          <div className="speed-group">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                className={speed === playSpeed ? 'active' : ''}
                onClick={() => setPlaySpeed(speed)}
                disabled={!timeline}
              >
                {speed}x
              </button>
            ))}
          </div>
          <label className="loop-toggle">
            <input
              type="checkbox"
              checked={loop}
              onChange={(event) => setLoop(event.target.checked)}
            />
            循环播放
          </label>
        </div>
        <div className="timeline-slider">
          <span>{timeline ? formatDate(timeline.start) : '--'}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            disabled={!timeline}
            onChange={(event) => seek(Number(event.target.value) / 100)}
          />
          <span>{timeline ? formatDate(timeline.end) : '--'}</span>
        </div>
        <div className="timeline-status">
          <span>当前时间：{currentLabel}</span>
          {!!series.length && <span>已加载对象：{series.map((item) => item.name).join(', ')}</span>}
        </div>
        {error && <p className="timeline-error">{error}</p>}
      </div>
    </section>
  )
}

function formatDate(value: number | string | undefined) {
  if (!value) return '--'
  const date = typeof value === 'number' ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
