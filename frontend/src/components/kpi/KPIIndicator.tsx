import type { KPIItem } from '../../types/kpi'

const STATUS_COLOR: Record<KPIItem['status'], string> = {
  green: 'var(--accent-green)',
  yellow: 'var(--accent-yellow)',
  red: 'var(--accent-red)',
}

const TREND_SYMBOL: Record<KPIItem['trend'], string> = {
  up: '↑',
  down: '↓',
  stable: '→',
}

interface Props {
  item: KPIItem
}

export function KPIIndicator({ item }: Props) {
  return (
    <article className="kpi-card">
      <header className="kpi-card__header">
        <h3>{item.name}</h3>
        <span
          className="kpi-status-dot"
          style={{ backgroundColor: STATUS_COLOR[item.status] }}
        />
      </header>
      <p className="kpi-card__value">
        {item.value}
        <span>{item.unit}</span>
      </p>
      <footer className="kpi-card__footer">
        <span>目标: {item.target}</span>
        <span>{TREND_SYMBOL[item.trend]}</span>
      </footer>
    </article>
  )
}

