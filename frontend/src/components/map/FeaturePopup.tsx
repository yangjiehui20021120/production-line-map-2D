import { useRealtimeStore } from '../../stores/realtimeStore'

export function FeaturePopup() {
  const { selected, equipment, workpieces, personnel, selectEntity } = useRealtimeStore()

  if (!selected) return null
  const dataset =
    selected.kind === 'equipment'
      ? equipment
      : selected.kind === 'workpiece'
        ? workpieces
        : personnel
  const entity = dataset.find((item) => item.id === selected.id)
  if (!entity) return null

  const close = () => selectEntity(null)

  return (
    <div className="feature-popup">
      <div className="feature-popup__header">
        <strong>{entity.name}</strong>
        <button type="button" onClick={close}>
          ×
        </button>
      </div>
      <div className="feature-popup__body">
        <p>
          <span>状态:</span>
          <span>{entity.status}</span>
        </p>
        {'attributes' in entity && (
          <div className="attributes">
            {Object.entries(entity.attributes).map(([key, value]) => (
              <p key={key}>
                <span>{key}:</span>
                <span>{String(value)}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

