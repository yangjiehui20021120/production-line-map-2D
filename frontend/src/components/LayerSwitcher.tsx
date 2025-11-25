import type { LayerId } from '../stores/layerStore'
import { useLayerStore } from '../stores/layerStore'

const LAYERS: { id: LayerId; name: string; description: string }[] = [
  { id: 'basemap', name: '底图', description: 'Zone + Station 布局' },
  { id: 'equipment', name: '设备层', description: '机器人/设备状态' },
  { id: 'workpiece', name: '在制品层', description: 'WIP 位置' },
  { id: 'personnel', name: '人员层', description: '人员定位' },
  { id: 'paths', name: '路径层', description: '主物流/Spaghetti' },
  { id: 'annotations', name: '标注层', description: '用户标注' },
]

export function LayerSwitcher() {
  const { activeLayers, toggleLayer } = useLayerStore()

  return (
    <section className="panel">
      <header className="panel-header">
        <span>📋 图层控制</span>
      </header>
      <div className="panel-body layer-grid">
        {LAYERS.map((layer) => {
          const checked = activeLayers.includes(layer.id)
          return (
            <label
              key={layer.id}
              className={`layer-chip ${checked ? 'layer-chip--active' : ''}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleLayer(layer.id)}
              />
              <div>
                <p className="layer-name">{layer.name}</p>
                <p className="layer-desc">{layer.description}</p>
              </div>
            </label>
          )
        })}
      </div>
    </section>
  )
}

