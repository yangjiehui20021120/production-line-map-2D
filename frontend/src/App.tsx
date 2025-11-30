import { useEffect } from 'react'
import './App.css'
import { KPIBar } from './components/kpi/KPIBar'
import { MapContainer } from './components/map/MapContainer'
import { Sidebar } from './components/Sidebar'
import { FilterPanel } from './components/FilterPanel'
import { TimelinePanel } from './components/trajectory/TimelinePanel'
import { useAppStore } from './stores/appStore'
import { useTrajectoryStore } from './stores/trajectoryStore'

function App() {
  const mode = useAppStore((state) => state.mode)
  const resetTrajectory = useTrajectoryStore((state) => state.reset)

  useEffect(() => {
    if (mode !== 'history') {
      resetTrajectory()
    }
  }, [mode, resetTrajectory])

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-panel">
        <section className="hero">
          <p className="eyebrow">Phase 1 · 基础能力</p>
          <h1>动车组侧墙产线 · 数字孪生地图</h1>
          <p>基于 OpenLayers 的 GeoJSON 底图, 支持图层控制、KPI 看板与历史回放。</p>
        </section>
        <KPIBar />
        <FilterPanel />
        <MapContainer />
        {mode === 'history' && <TimelinePanel />}
      </main>
    </div>
  )
}

export default App
