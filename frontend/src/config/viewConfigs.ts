import type { ViewMode } from '../stores/layerStore'
export { layerDefinitions } from './mapLayers'

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

