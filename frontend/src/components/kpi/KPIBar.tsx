import { useKPIQuery } from '../../services/kpiService'
import { KPIIndicator } from './KPIIndicator'

export function KPIBar() {
  const { data, isLoading, isError } = useKPIQuery()

  return (
    <section className="panel">
      <header className="panel-header">
        <span>📊 核心 KPI</span>
      </header>
      <div className="panel-body kpi-grid">
        {isLoading && <p>正在加载 KPI...</p>}
        {isError && <p>获取 KPI 失败, 使用 Mock 数据.</p>}
        {!isLoading &&
          data?.map((item) => <KPIIndicator key={item.id} item={item} />)}
      </div>
    </section>
  )
}

