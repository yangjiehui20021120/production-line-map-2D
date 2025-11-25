import { moduleLinks, specializedViews, layerDefinitions } from '../config/viewConfigs'
import { useLayerStore } from '../stores/layerStore'

export function Sidebar() {
  const { viewMode, switchView, activeLayers, toggleLayer } = useLayerStore()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p className="sidebar-title">动车组侧墙产线</p>
        <p className="sidebar-subtitle">数字孪生地图</p>
      </div>

      <nav className="sidebar-section">
        <p className="sidebar-section-title">模块</p>
        <ul>
          {moduleLinks.map((item) => (
            <li key={item.label} className={item.active ? 'active' : ''}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
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
            const classNames = [
              checked ? 'active' : '',
              !layer.enabled ? 'disabled' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <li
                key={layer.id}
                className={classNames}
                onClick={() => layer.enabled && toggleLayer(layer.id)}
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

