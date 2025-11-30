import { legendItems } from '../../config/viewConfigs'

interface LegendPanelProps {
  onZoomIn: () => void
  onZoomOut: () => void
  zoomLabel: string
  canZoomIn?: boolean
  canZoomOut?: boolean
}

export function LegendPanel({
  onZoomIn,
  onZoomOut,
  zoomLabel,
  canZoomIn = true,
  canZoomOut = true,
}: LegendPanelProps) {
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
          <button onClick={onZoomOut} disabled={!canZoomOut}>
            -
          </button>
          <span>{zoomLabel}</span>
          <button onClick={onZoomIn} disabled={!canZoomIn}>
            +
          </button>
        </div>
      </div>
    </div>
  )
}

