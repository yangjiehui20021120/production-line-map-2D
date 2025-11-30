import { moduleLinks, specializedViews } from '../config/viewConfigs'
import { layerDefinitions, alwaysOnLayerIds } from '../config/mapLayers'
import { useLayerStore } from '../stores/layerStore'
import { useAppStore } from '../stores/appStore'

const MODULE_MODE_MAP = {
  实况监控: 'live',
  路线仿真: 'simulation',
  历史回放: 'history',
} as const

export function Sidebar() {
  const { viewMode, switchView, activeLayers, toggleLayer } = useLayerStore()
  const mode = useAppStore((state) => state.mode)
  const setMode = useAppStore((state) => state.setMode)
  const showDeveloping = (name: string) => {
    window.alert(`${name} 功能开发中，敬请期待！`)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p className="sidebar-title">动车组侧墙产线</p>
        <p className="sidebar-subtitle">数字孪生地图</p>
      </div>

      <nav className="sidebar-section">
        <p className="sidebar-section-title">模块</p>
        <ul>
          {moduleLinks.map((item) => {
            const targetMode = MODULE_MODE_MAP[item.label as keyof typeof MODULE_MODE_MAP] ?? 'live'
            const isActive = mode === targetMode
            return (
              <li
                key={item.label}
                className={isActive ? 'active' : ''}
                onClick={() => {
                  if (targetMode === 'history') {
                    setMode('history')
                    return
                  }
                  if (targetMode === 'live') {
                    setMode('live')
                    return
                  }
                  showDeveloping(item.label)
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-section">
        <p className="sidebar-section-title">专题视图</p>
        <ul className="view-list">
          {specializedViews.map((view) => (
            <li
              key={view.id}
              className={viewMode === view.id ? 'active' : ''}
              onClick={() => switchView(view.id)}
            >
              <span className="view-dot" style={{ backgroundColor: view.color }} />
              <div>
                <p className="view-name">{view.name}</p>
                <p className="view-desc">{view.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-title">图层控制</p>
        <ul className="layer-list">
          {layerDefinitions.map((layer) => {
            const checked = activeLayers.includes(layer.id)
            const locked = alwaysOnLayerIds.includes(layer.id)
            const classNames = [checked ? 'active' : '', !layer.enabled ? 'disabled' : '', locked ? 'locked' : '']
              .filter(Boolean)
              .join(' ')
            return (
              <li
                key={layer.id}
                className={classNames}
                onClick={() => {
                  if (locked) return
                  if (!layer.enabled) {
                    showDeveloping(layer.label)
                  } else {
                    toggleLayer(layer.id)
                  }
                }}
              >
                <span>{layer.icon}</span>
                <span>{layer.label}</span>
                <span className="layer-dot" style={{ backgroundColor: layer.color }} />
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

