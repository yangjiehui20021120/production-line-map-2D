import { useRealtimeStore } from '../../stores/realtimeStore'

export function FeaturePopup() {
  const { selected, equipment, workpieces, personnel, selectEntity } = useRealtimeStore()

  if (!selected) return null

  const close = () => selectEntity(null)

  if (selected.type === 'basemap') {
    return (
      <div className="feature-popup">
        <div className="feature-popup__header">
          <strong>{selected.name ?? selected.id}</strong>
          <button type="button" onClick={close}>
            ×
          </button>
        </div>
        <div className="feature-popup__body">
          {selected.featureType && (
            <p>
              <span>类型:</span>
              <span>{selected.featureType}</span>
            </p>
          )}
          {selected.layer && (
            <p>
              <span>图层:</span>
              <span>{selected.layer}</span>
            </p>
          )}
          {selected.processGroup && (
            <p>
              <span>工序区:</span>
              <span>{selected.processGroup}</span>
            </p>
          )}
          {selected.status && (
            <p>
              <span>状态:</span>
              <span>{selected.status}</span>
            </p>
          )}
          {typeof selected.ct !== 'undefined' && (
            <p>
              <span>CT:</span>
              <span>{selected.ct} min</span>
            </p>
          )}
          <p>
            <span>ID:</span>
            <span>{selected.id}</span>
          </p>
        </div>
      </div>
    )
  }

  const dataset =
    selected.entityKind === 'equipment'
      ? equipment
      : selected.entityKind === 'workpiece'
        ? workpieces
        : personnel
  const entity = dataset.find((item) => item.id === selected.id)
  if (!entity) return null

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

