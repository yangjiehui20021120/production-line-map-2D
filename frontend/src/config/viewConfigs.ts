import type { LayerId, ViewMode } from '../stores/layerStore'

export interface SpecializedView {
  id: ViewMode
  name: string
  description: string
  color: string
}

export interface LegendItem {
  name: string
  color: string
}

export const specializedViews: SpecializedView[] = [
  {
    id: 'flow',
    name: 'Flow 流动视图',
    description: '生产节奏与物流瓶颈',
    color: '#a855f7',
  },
  {
    id: 'quality',
    name: 'Quality 质量视图',
    description: '质量异常与缺陷',
    color: '#22d3ee',
  },
  {
    id: 'efficiency',
    name: 'Efficiency 效率视图',
    description: '设备效率与成本',
    color: '#facc15',
  },
  {
    id: 'plan',
    name: '计划与柔性视图',
    description: '订单排产与交付',
    color: '#c084fc',
  },
  {
    id: 'spaghetti',
    name: 'Spaghetti 意面图',
    description: '物流路径综合分析',
    color: '#22c55e',
  },
]

export const legendItems: LegendItem[] = [
  { name: '主物流线路', color: '#a855f7' },
  { name: '水蜘蛛路线', color: '#0ea5e9' },
  { name: '返工路径', color: '#f97316' },
  { name: '天车系统', color: '#facc15' },
]

export interface ModuleLink {
  icon: string
  label: string
  active?: boolean
}

export const moduleLinks: ModuleLink[] = [
  { icon: '📊', label: '实况监控', active: true },
  { icon: '🧭', label: '路线仿真' },
  { icon: '📈', label: '历史回放' },
]

export interface LayerDefinition {
  id: LayerId
  label: string
  color: string
  icon: string
  enabled: boolean
}

export const layerDefinitions: LayerDefinition[] = [
  { id: 'stations', label: '工位状态层', color: '#3b82f6', icon: '🏭', enabled: true },
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
  { id: 'quality', label: '品质层', color: '#9ca3af', icon: '✅', enabled: false },
  { id: 'rework', label: '返工路径', color: '#9ca3af', icon: '🔄', enabled: false },
  { id: 'waterSpider', label: '水蜘蛛路线', color: '#9ca3af', icon: '🕷️', enabled: false },
]

