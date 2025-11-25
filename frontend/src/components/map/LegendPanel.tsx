import { legendItems } from '../../config/viewConfigs'

export function LegendPanel() {
  return (
    <div className="legend-panel">
      <p className="legend-title">图例说明</p>
      <ul>
        {legendItems.map((item) => (
          <li key={item.name}>
            <span className="legend-dot" style={{ backgroundColor: item.color }} />
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
      <div className="legend-zoom">
        <span>缩放控制</span>
        <div>
          <button>-</button>
          <span>100%</span>
          <button>+</button>
        </div>
      </div>
    </div>
  )
}

