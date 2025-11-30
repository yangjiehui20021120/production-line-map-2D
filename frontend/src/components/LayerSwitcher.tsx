import type { LayerId } from '../stores/layerStore'
import { useLayerStore } from '../stores/layerStore'

const LAYERS: { id: LayerId; name: string; description: string }[] = [
  { id: 'stations', name: '工位状态层', description: 'Zone + Station 底图' },
  { id: 'equipment', name: '设备层', description: '机器人/设备状态' },
  { id: 'wip', name: '在制品层', description: 'WIP 位置' },
  { id: 'personnel', name: '人员层', description: '人员定位' },
  { id: 'mainFlow', name: '路径层', description: '主物流/Spaghetti' },
  { id: 'spaghetti', name: '意面图层', description: '路径分析' },
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

