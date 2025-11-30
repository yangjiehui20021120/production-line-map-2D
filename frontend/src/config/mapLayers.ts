import type { LayerId } from '../stores/layerStore'

export interface LayerDefinition {
  id: LayerId
  label: string
  color: string
  icon: string
  description?: string
  enabled: boolean
  alwaysOn?: boolean
}

export const layerDefinitions: LayerDefinition[] = [
  {
    id: 'stations',
    label: '工位状态层',
    color: '#3b82f6',
    icon: '🏭',
    enabled: true,
    alwaysOn: true,
    description: '产线底图 + 区域框',
  },
  { id: 'mainFlow', label: '路径流量监控', color: '#8b5cf6', icon: '➡️', enabled: true },
  { id: 'wip', label: '在制品位置', color: '#10b981', icon: '📦', enabled: true },
  { id: 'bottleneck', label: '瓶颈标识', color: '#ef4444', icon: '⚠️', enabled: true },
  { id: 'andon', label: '安灯层', color: '#f59e0b', icon: '🚨', enabled: true },
  { id: 'oee', label: '设备OEE层', color: '#10b981', icon: '📊', enabled: true },
  { id: 'equipment', label: '设备状态', color: '#6b7280', icon: '⚙️', enabled: true },
  { id: 'personnel', label: '人员层', color: '#38bdf8', icon: '🧑‍🏭', enabled: true },
  { id: 'crane', label: '天车系统', color: '#fbbf24', icon: '🏗️', enabled: true },
  { id: 'orders', label: '订单位置', color: '#8b5cf6', icon: '📋', enabled: true },
  { id: 'spaghetti', label: '意面图路径', color: '#ef4444', icon: '🍝', enabled: true },
  { id: 'quality', label: '品质层', color: '#ef4444', icon: '✅', enabled: true },
  { id: 'rework', label: '返工路径', color: '#9ca3af', icon: '🔄', enabled: false },
  { id: 'waterSpider', label: '水蜘蛛路线', color: '#9ca3af', icon: '🕷️', enabled: false },
]

export const layerDefinitionMap: Record<LayerId, LayerDefinition> = layerDefinitions.reduce(
  (acc, def) => {
    acc[def.id] = def
    return acc
  },
  {} as Record<LayerId, LayerDefinition>,
)

export const enabledLayerIds: LayerId[] = layerDefinitions
  .filter((layer) => layer.enabled)
  .map((layer) => layer.id)

export const alwaysOnLayerIds: LayerId[] = layerDefinitions
  .filter((layer) => layer.alwaysOn)
  .map((layer) => layer.id)

