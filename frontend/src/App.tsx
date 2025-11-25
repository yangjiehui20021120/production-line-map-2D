import './App.css'
import { KPIBar } from './components/kpi/KPIBar'
import { MapContainer } from './components/map/MapContainer'
import { Sidebar } from './components/Sidebar'
import { FilterPanel } from './components/FilterPanel'

function App() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-panel">
        <section className="hero">
          <p className="eyebrow">Phase 1 · 基础能力</p>
          <h1>动车组侧墙产线 · 数字孪生地图</h1>
          <p>基于 OpenLayers 的 GeoJSON 底图, 支持图层控制与 KPI 看板。</p>
        </section>
        <KPIBar />
        <FilterPanel />
        <MapContainer />
      </main>
    </div>
  )
}

export default App
