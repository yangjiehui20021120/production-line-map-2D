import { useRealtimeStore, type EntityKind } from '../stores/realtimeStore'

const FILTER_DEFS: { kind: EntityKind; label: string; options: string[] }[] = [
  { kind: 'equipment', label: '设备状态', options: ['Running', 'Idle', 'Fault', 'Maintenance'] },
  { kind: 'workpiece', label: '在制品状态', options: ['InProcess', 'Delayed', 'Completed'] },
  { kind: 'personnel', label: '人员状态', options: ['Working', 'Break', 'Idle'] },
]

export function FilterPanel() {
  const { filters, updateFilter } = useRealtimeStore()

  const handleToggle = (kind: EntityKind, option: string) => {
    const current = filters.statuses[kind]
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]
    updateFilter(kind, next)
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <span>🎚 状态筛选</span>
      </header>
      <div className="panel-body filter-panel">
        {FILTER_DEFS.map((group) => (
          <div key={group.kind}>
            <p className="filter-label">{group.label}</p>
            <div className="filter-chips">
              {group.options.map((option) => {
                const active = filters.statuses[group.kind].includes(option)
                return (
                  <button
                    type="button"
                    key={option}
                    className={active ? 'chip chip--active' : 'chip'}
                    onClick={() => handleToggle(group.kind, option)}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

