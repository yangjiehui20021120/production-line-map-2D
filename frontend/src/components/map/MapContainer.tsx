import { useEffect, useRef, useState } from 'react'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Fill, Stroke, Style, Text } from 'ol/style'

import { useLayerStore, type LayerId } from '../../stores/layerStore'
import {
  registerWorkshopProjection,
  transformWorkshopToMap,
} from '../../utils/coordinateTransform'
import { LegendPanel } from './LegendPanel'
import { layerDefinitions } from '../../config/viewConfigs'
import { FeaturePopup } from './FeaturePopup'
import { fetchRealtimeEntities } from '../../services/realtimeService'
import { RealtimeWebSocket } from '../../services/websocketService'
import { useRealtimeStore, type EntityKind, type RealtimeFilters } from '../../stores/realtimeStore'
import type {
  EquipmentEntity,
  WorkpieceEntity,
  PersonnelEntity,
  RealtimeEntity,
} from '../../types/realtime'

const WORKSHOP_CENTER: [number, number] = [350, 180]

export function MapContainer() {
  const mapRef = useRef<Map | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)
  const vectorSourcesRef = useRef<Record<LayerId, VectorSource>>({} as Record<
    LayerId,
    VectorSource
  >)
  const { activeLayers } = useLayerStore()
  const { equipment, workpieces, personnel, setInitialData, applyUpdate, filters, selectEntity } =
    useRealtimeStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    registerWorkshopProjection()
    if (!targetRef.current) return

    const view = new View({
      center: transformWorkshopToMap(WORKSHOP_CENTER),
      zoom: 18,
      minZoom: 16,
      maxZoom: 22,
    })

    const sources: Record<LayerId, VectorSource> = {} as Record<LayerId, VectorSource>
    const layers = layerDefinitions.map((def) => {
      const source = new VectorSource()
      sources[def.id] = source
      return new VectorLayer({
        source,
        visible: def.enabled,
        properties: { layerId: def.id, disabled: !def.enabled },
      })
    })
    vectorSourcesRef.current = sources

    const map = new Map({
      target: targetRef.current,
      view,
      layers,
    })

    const clickHandler = (event: any) => {
      let found: { id: string; kind: EntityKind } | null = null
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const kind = feature.get('entityKind') as EntityKind | undefined
        const id = feature.get('entityId') as string | undefined
        if (kind && id) {
          found = { id, kind }
          return true
        }
        return false
      })
      selectEntity(found)
    }

    map.on('singleclick', clickHandler)
    mapRef.current = map

    fetch('/basemap/production-line.geojson')
      .then((resp) => resp.json())
      .then((geojson) => {
        const format = new GeoJSON({
          dataProjection: 'EPSG:10001',
          featureProjection: 'EPSG:3857',
        })
        const features = format.readFeatures(geojson)
        features.forEach((feature) => {
          const layerId = resolveLayerId(feature)
          const source = vectorSourcesRef.current[layerId]
          if (!source) return
          feature.getGeometry()?.transform('EPSG:10001', 'EPSG:3857')
          feature.setStyle(createBaseStyle(feature))
          source.addFeature(feature)
        })
      })
      .catch(() => setError('无法加载 basemap GeoJSON'))
      .finally(() => setLoading(false))

    return () => {
      map.un('singleclick', clickHandler)
      map.setTarget(undefined)
    }
  }, [selectEntity])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.getLayers().forEach((layer) => {
      const id = layer.get('layerId') as LayerId | undefined
      if (!id) return
      const def = layerDefinitions.find((item) => item.id === id)
      const enabled = def?.enabled ?? true
      layer.setVisible(enabled && activeLayers.includes(id))
    })
  }, [activeLayers])

  useEffect(() => {
    let ws: RealtimeWebSocket | null = null
    const bootstrap = async () => {
      try {
        const payload = await fetchRealtimeEntities()
        setInitialData(payload)
      } catch (err) {
        console.error('初始化实时数据失败', err)
      }
      ws = new RealtimeWebSocket((message) => applyUpdate(message.entities))
    }
    bootstrap()
    return () => ws?.close()
  }, [setInitialData, applyUpdate])

  useEffect(() => {
    const sources = vectorSourcesRef.current
    updateEntitySource(sources.equipment, equipment, 'equipment', filters)
    updateEntitySource(sources.wip, workpieces, 'workpiece', filters)
    updateEntitySource(sources.personnel, personnel, 'personnel', filters)
  }, [equipment, workpieces, personnel, filters])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const isKnownLayer = (layerId: string): layerId is LayerId =>
      layerDefinitions.some((layer) => layer.id === layerId)

    map.getLayers().forEach((layer) => {
      const id = layer.get('layerId')
      if (!id) return
      if (id === 'composite-base') {
        layer.setVisible(true)
        return
      }
      if (!isKnownLayer(id)) return
      layer.setVisible(activeLayers.includes(id))
    })
  }, [activeLayers])

  return (
    <section className="panel map-panel">
      <header className="panel-header">
        <span>🗺️ 地图预览</span>
        <span className="panel-subtitle">
          basemap/production-line.geojson (EPSG:10001)
        </span>
      </header>
      <div className="panel-body no-padding">
        <div className="map-container" ref={targetRef} />
        <LegendPanel />
        <FeaturePopup />
      </div>
      {loading && <div className="map-overlay">加载底图...</div>}
      {error && <div className="map-overlay error">{error}</div>}
    </section>
  )
}

function resolveLayerId(feature: Feature): LayerId {
  const type = feature.get('type')
  const name = feature.get('name')
  if (type === 'Path') {
    if (name === '主物流路径') return 'mainFlow'
    if (name === '水蜘蛛路线') return 'waterSpider'
    if (name === '返工路径') return 'rework'
    return 'spaghetti'
  }
  return 'stations'
}

function createBaseStyle(feature: Feature): Style {
  const type = feature.get('type')
  if (type === 'Zone') {
    return new Style({
      stroke: new Stroke({
        color: '#2d2f3e',
        width: 1.5,
        lineDash: [8, 6],
      }),
      fill: new Fill({ color: 'rgba(255,255,255,0.01)' }),
      text: new Text({
        text: feature.get('name'),
        font: '700 14px "Segoe UI"',
        fill: new Fill({ color: '#fbbf24' }),
        offsetY: -10,
      }),
    })
  }

  if (type === 'Path') {
    const name = feature.get('name')
    const color =
      name === '主物流路径'
        ? '#a855f7'
        : name === '水蜘蛛路线'
          ? '#0ea5e9'
          : name === '返工路径'
            ? '#f97316'
            : '#5c7cfa'
    const dash =
      name === '水蜘蛛路线' ? [8, 4] : name === '返工路径' ? [4, 6] : undefined
    return new Style({
      stroke: new Stroke({
        color,
        width: 3,
        lineDash: dash,
      }),
    })
  }

  const status = feature.get('status')
  const name = feature.get('name')
  const ct = feature.get('ct')
  const textLines = type === 'Buffer' ? `${name}` : `${name}\nCT:${ct ?? '--'}min`

  return new Style({
    text: new Text({
      text: textLines,
      font: '600 12px "Segoe UI"',
      fill: new Fill({ color: '#e6e6f0' }),
      textAlign: 'center',
      textBaseline: 'middle',
      padding: [6, 12, 6, 12],
      backgroundFill: new Fill({ color: '#1e222f' }),
      backgroundStroke: new Stroke({
        color: statusColorMap[status] ?? '#4a4f63',
        width: 1.2,
      }),
    }),
  })
}

const statusColorMap: Record<string, string> = {
  Running: 'var(--accent-green)',
  Idle: '#a0aec0',
  Maintenance: 'var(--accent-yellow)',
  Fault: '#ea5455',
}

const equipmentStatusColor: Record<string, string> = {
  Running: 'var(--accent-green)',
  Idle: '#a0aec0',
  Fault: '#ea5455',
  Maintenance: '#ffb200',
}

const workpieceStatusColor: Record<string, string> = {
  InProcess: 'var(--accent-green)',
  Delayed: '#ffb200',
  Completed: '#5c7cfa',
}

const personnelStatusColor: Record<string, string> = {
  Working: 'var(--accent-green)',
  Break: '#ffb200',
  Idle: '#a0aec0',
}

function updateEntitySource(
  source: VectorSource | undefined,
  entities: RealtimeEntity[],
  kind: EntityKind,
  filters: RealtimeFilters,
) {
  if (!source) return
  source.clear()
  const allowed = filters.statuses[kind]
  entities
    .filter((entity) => allowed.includes(entity.status))
    .forEach((entity) => {
      const geometry = new Point(transformWorkshopToMap(entity.location.coordinates as [number, number]))
      const feature = new Feature({ geometry })
      feature.set('entityKind', kind)
      feature.set('entityId', entity.id)
      const label =
        kind === 'equipment'
          ? `${entity.name}\nOEE:${(entity as EquipmentEntity).attributes.oee * 100}%`
          : kind === 'workpiece'
            ? `${entity.name}\n进度:${Math.round((entity as WorkpieceEntity).attributes.progress * 100)}%`
            : `${entity.name}\n${(entity as PersonnelEntity).attributes.role}`
      feature.setStyle(getEntityStyle(kind, entity.status, label))
      source.addFeature(feature)
    })
}

function getEntityStyle(kind: EntityKind, status: string, label: string) {
  const color =
    kind === 'equipment'
      ? equipmentStatusColor[status] ?? '#4a4f63'
      : kind === 'workpiece'
        ? workpieceStatusColor[status] ?? '#4a4f63'
        : personnelStatusColor[status] ?? '#4a4f63'

  return new Style({
    text: new Text({
      text: label,
      font: '600 11px "Segoe UI"',
      fill: new Fill({ color: '#e2e8f0' }),
      padding: [4, 8, 4, 8],
      textAlign: 'center',
      textBaseline: 'middle',
      backgroundFill: new Fill({ color: 'rgba(20,20,25,0.9)' }),
      backgroundStroke: new Stroke({ color, width: 1.4 }),
    }),
  })
}

