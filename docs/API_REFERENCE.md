# API Reference

## Entities
- `GET /api/v1/entities?type=TwinObject&q=&limit=20&offset=0&options=` → 列表，支持缓存
- `GET /api/v1/entities/{entityId}` → 实体详情
- `GET /api/v1/entities/{entityId}/relationships` → 关系列表

## Map
- `GET /api/v1/map/basemap` → 底图GeoJSON
- `GET /api/v1/map/layers` → 图层配置
- `GET /api/v1/map/kpi` → 6项KPI汇总 `{id,name,value,unit,target,threshold,status,observedAt}`

## Realtime
- `GET /api/v1/realtime/entities?types=equipment&types=workpiece...` → 初始实时实体集（mock）
- `WS /realtime/ws`
  - 心跳: `{type:"ping"}` ↔ `{type:"pong"}`
  - 实体更新: `{type:"entityUpdate",entities:[{id,updateType,status,location,observedAt}]}`
  - 系统: `{type:"systemStatus",status:"ok"|"closing"}`

## Trajectory
- `GET /api/v1/trajectory/search?entityType=equipment|workpiece|personnel&start=&end=` → 可回放对象列表
- `GET /api/v1/trajectory/{entityId}?start=&end=&max_points=500` → 轨迹序列

## Analysis (mock占位)
- `GET /api/v1/analysis/bottlenecks` → 瓶颈工位
- `GET /api/v1/analysis/quality-issues` → 质量异常设备
- `GET /api/v1/analysis/efficiency-issues` → 低效工位
- `GET /api/v1/analysis/spaghetti-paths?hours=24` → 路径统计

## Error Format
- `{"success":false,"error":{code,message,details},timestamp}`
