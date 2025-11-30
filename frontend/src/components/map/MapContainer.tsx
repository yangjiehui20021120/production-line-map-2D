import { type MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import 'ol/ol.css'
import OlMap from 'ol/Map'
import View from 'ol/View'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import type { Geometry } from 'ol/geom'
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style'

import { useLayerStore, type LayerId, type ViewMode } from '../../stores/layerStore'
import {
  registerWorkshopProjection,
  transformWorkshopToMap,
} from '../../utils/coordinateTransform'
import { LegendPanel } from './LegendPanel'
import { layerDefinitions } from '../../config/mapLayers'
import { FeaturePopup } from './FeaturePopup'
import { fetchRealtimeEntities } from '../../services/realtimeService'
import { RealtimeWebSocket } from '../../services/websocketService'
import {
  useRealtimeStore,
  type EntityKind,
  type RealtimeFilters,
  type SelectedFeature,
} from '../../stores/realtimeStore'
import { useTrajectoryStore } from '../../stores/trajectoryStore'
import { useAppStore } from '../../stores/appStore'
import { useAnalysisStore } from '../../stores/analysisStore'
import {
  fetchBottlenecks,
  fetchQualityIssues,
  fetchEfficiencyIssues,
  fetchSpaghettiPaths,
  type BottleneckStation,
  type QualityIssue,
  type EfficiencyIssue,
} from '../../services/analysisService'
import { getBottleneckStationIds } from '../../utils/bottleneckAnalysis'
import { getQualityIssueIds } from '../../utils/qualityAnalysis'
import { getLowEfficiencyStationIds } from '../../utils/efficiencyAnalysis'
import {
  filterWorkpiecesByStations,
  filterEquipmentByStations,
  filterPersonnelByStations,
  getStationIdsFromBottlenecks,
  getStationIdsFromEfficiencyIssues,
  getStationIdsFromQualityIssues,
  filterPlanEntities,
  filterSpaghettiEntities,
  type StationCoordLookup,
} from '../../utils/viewFiltering'
import type { TrajectorySeries } from '../../types/trajectory'
import type {
  EquipmentEntity,
  WorkpieceEntity,
  PersonnelEntity,
  RealtimeEntity,
} from '../../types/realtime'

const WORKSHOP_CENTER: [number, number] = [350, 180]
type BaseLayerKey = 'baseZones' | 'basePaths' | 'baseStations'
const MIN_ZOOM = 16
const MAX_ZOOM = 21
const BASE_ZOOM = 18
const ZOOM_FACTOR = 1.1 // 每次缩放按 10% 调整

interface TrajectoryCacheEntry {
  timestamps: number[]
  coordinates: [number, number][]
  marker: Feature<Point>
  series: TrajectorySeries
}

export function MapContainer() {
  const mapRef = useRef<OlMap | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<View | null>(null)
  const vectorSourcesRef = useRef<Record<LayerId, VectorSource>>({} as Record<
    LayerId,
    VectorSource
  >)
  const baseSourcesRef = useRef<Record<BaseLayerKey, VectorSource>>({} as Record<
    BaseLayerKey,
    VectorSource
  >)
  const baseLayersRef = useRef<Record<BaseLayerKey, VectorLayer>>({} as Record<
    BaseLayerKey,
    VectorLayer
  >)
  const layerRegistryRef = useRef<Record<LayerId, VectorLayer>>({} as Record<
    LayerId,
    VectorLayer
  >)
  const trajectoryLineSourceRef = useRef<VectorSource | null>(null)
  const trajectoryTailSourceRef = useRef<VectorSource | null>(null)
  const trajectoryMarkerSourceRef = useRef<VectorSource | null>(null)
  const trajectoryCacheRef = useRef<Map<string, TrajectoryCacheEntry>>(new Map())
  const stationCoordsRef = useRef<StationCoordLookup>({})
  const spaghettiSourceRef = useRef<VectorSource | null>(null)
  const spaghettiLayerRef = useRef<VectorLayer | null>(null)
  const { activeLayers, viewMode } = useLayerStore()
  const { equipment, workpieces, personnel, setInitialData, applyUpdate, filters, selectEntity } =
    useRealtimeStore()
  const trajectorySeries = useTrajectoryStore((state) => state.series)
  const currentTrajectoryTs = useTrajectoryStore((state) => state.currentTs)
  const trajectoryPlaying = useTrajectoryStore((state) => state.playing)
  const tickTrajectory = useTrajectoryStore((state) => state.tick)
  const appMode = useAppStore((state) => state.mode)
  const {
    bottlenecks,
    qualityIssues,
    efficiencyIssues,
    spaghettiPaths,
    setBottlenecks,
    setQualityIssues,
    setEfficiencyIssues,
    setSpaghettiPaths,
    setLoading: setAnalysisLoading,
    setError: setAnalysisError,
  } = useAnalysisStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(0)
  const [canZoomIn, setCanZoomIn] = useState(true)
  const [canZoomOut, setCanZoomOut] = useState(true)
  const hasTrajectorySeries = trajectorySeries.length > 0

  const updateBaseLayerStyles = useCallback(() => {
    const bases = baseSourcesRef.current
    Object.values(bases).forEach((source) => {
      source
        .getFeatures()
        .forEach((feature) =>
          feature.setStyle(
            createBaseStyle(feature, viewMode, bottlenecks, qualityIssues, efficiencyIssues),
          ),
        )
    })
  }, [viewMode, bottlenecks, qualityIssues, efficiencyIssues])

  useEffect(() => {
    registerWorkshopProjection()
    if (!targetRef.current) return

    const view = new View({
      center: transformWorkshopToMap(WORKSHOP_CENTER),
      zoom: 18,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    })
    viewRef.current = view
    const syncZoomState = () => {
      const currentZoom = view.getZoom() ?? 0
      setZoomLevel(currentZoom)
      setCanZoomIn(currentZoom < MAX_ZOOM - 0.01)
      setCanZoomOut(currentZoom > MIN_ZOOM + 0.01)
    }
    syncZoomState()
    const handleViewZoom = () => syncZoomState()
    view.on('change:resolution', handleViewZoom)

    const sources: Record<LayerId, VectorSource> = {} as Record<LayerId, VectorSource>
    const registry: Record<LayerId, VectorLayer> = {} as Record<LayerId, VectorLayer>
    const baseSources: Record<BaseLayerKey, VectorSource> = {
      baseZones: new VectorSource(),
      basePaths: new VectorSource(),
      baseStations: new VectorSource(),
    }
    const baseLayers: Record<BaseLayerKey, VectorLayer> = {
      baseZones: new VectorLayer({
        source: baseSources.baseZones,
        properties: { layerId: 'baseZones' },
      }),
      basePaths: new VectorLayer({
        source: baseSources.basePaths,
        properties: { layerId: 'basePaths' },
      }),
      baseStations: new VectorLayer({
        source: baseSources.baseStations,
        properties: { layerId: 'baseStations' },
      }),
    }
    const initialActive = new Set(activeLayers)
    const dynamicLayers = layerDefinitions.map((def) => {
      const source = new VectorSource()
      sources[def.id] = source
      const layer = new VectorLayer({
        source,
        visible: def.enabled && initialActive.has(def.id),
        properties: { layerId: def.id, disabled: !def.enabled },
      })
      registry[def.id] = layer
      return layer
    })
    vectorSourcesRef.current = sources
    baseSourcesRef.current = baseSources
    baseLayersRef.current = baseLayers
    layerRegistryRef.current = registry
    const trajectoryLineSource = new VectorSource()
    const trajectoryMarkerSource = new VectorSource()
    const trajectoryTailSource = new VectorSource()
    const spaghettiSource = new VectorSource()
    trajectoryLineSourceRef.current = trajectoryLineSource
    trajectoryTailSourceRef.current = trajectoryTailSource
    trajectoryMarkerSourceRef.current = trajectoryMarkerSource
    spaghettiSourceRef.current = spaghettiSource
    const trajectoryLineLayer = new VectorLayer({
      source: trajectoryLineSource,
      properties: { layerId: 'trajectoryLine' },
    })
    const trajectoryTailLayer = new VectorLayer({
      source: trajectoryTailSource,
      properties: { layerId: 'trajectoryTail' },
    })
    const trajectoryMarkerLayer = new VectorLayer({
      source: trajectoryMarkerSource,
      properties: { layerId: 'trajectoryMarker' },
    })
    const spaghettiLayer = new VectorLayer({
      source: spaghettiSource,
      properties: { layerId: 'spaghettiOverlay' },
      visible: false,
    })
    spaghettiLayerRef.current = spaghettiLayer

    const map = new OlMap({
      target: targetRef.current,
      view,
      layers: [
        baseLayers.baseZones,
        baseLayers.basePaths,
        baseLayers.baseStations,
        spaghettiLayer,
        trajectoryLineLayer,
        trajectoryTailLayer,
        trajectoryMarkerLayer,
        ...dynamicLayers,
      ],
    })

    const clickHandler = (event: any) => {
      let best: { selection: SelectedFeature; score: number } | null = null
      map.forEachFeatureAtPixel(event.pixel, (featureLike) => {
        const feature = featureLike as Feature<Geometry>
        const kind = feature.get('entityKind') as EntityKind | undefined
        const id = feature.get('entityId') as string | undefined

        let selection: SelectedFeature | null = null
        let score = 0

        if (kind && id) {
          selection = { type: 'realtime', entityKind: kind, id }
          score = 3
        } else {
          const baseSelection = buildBasemapSelection(feature)
          if (baseSelection) {
            selection = baseSelection
            // 站点 > 路径 > 区域
            const ft = baseSelection.featureType
            score = ft === 'Station' ? 2 : ft === 'Path' ? 1 : 0
          }
        }

        if (selection && (!best || score > best.score)) {
          best = { selection, score }
        }
        return false
      })
      selectEntity(best?.selection ?? null)
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
          const baseKey = resolveBaseLayerKey(feature)
          const source = baseSourcesRef.current[baseKey]
          if (!source) return
          if (feature.get('type') === 'Station') {
            const coord = feature.getGeometry()?.getCoordinates()
            if (coord && Array.isArray(coord)) {
              const id = (typeof feature.getId === 'function' ? feature.getId() : null) ?? feature.get('id')
              if (id) {
                stationCoordsRef.current[id as string] = feature.getGeometry()?.getCoordinates() as [number, number]
              }
            }
          }
          feature.setStyle(
            createBaseStyle(feature, viewMode, bottlenecks, qualityIssues, efficiencyIssues),
          )
          source.addFeature(feature)
        })
        updateBaseLayerStyles()
      })
      .catch(() => setError('无法加载 basemap GeoJSON'))
      .finally(() => setLoading(false))

    return () => {
      map.un('singleclick', clickHandler)
      map.setTarget(undefined)
      view.un('change:resolution', handleViewZoom)
    }
  }, [selectEntity, updateBaseLayerStyles, viewMode, bottlenecks, qualityIssues, efficiencyIssues]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateBaseLayerStyles()
  }, [updateBaseLayerStyles])

  useEffect(() => {
    const source = spaghettiSourceRef.current
    const layer = spaghettiLayerRef.current
    if (!source || !layer) return
    source.clear()
    if (viewMode !== 'spaghetti' || appMode !== 'live' || !spaghettiPaths) {
      layer.setVisible(false)
      return
    }
    layer.setVisible(true)
    const maxFreq = Math.max(1, spaghettiPaths.maxFrequency)
    spaghettiPaths.paths.forEach((path) => {
      if (!path.path.length) return
      const coords = path.path
        .map((p) => {
          if (!p.coordinates) return null
          return transformWorkshopToMap(p.coordinates as [number, number])
        })
        .filter(Boolean) as [number, number][]
      if (coords.length < 2) return
      const line = new Feature({ geometry: new LineString(coords) })
      line.setStyle(createSpaghettiStyle(path.frequency, maxFreq))
      source.addFeature(line)
    })
  }, [viewMode, appMode, spaghettiPaths])

  useEffect(() => {
    const registry = layerRegistryRef.current
    if (!registry) return
    layerDefinitions.forEach((def) => {
      const layer = registry[def.id]
      if (!layer) return
      const visible = def.enabled && (def.alwaysOn || activeLayers.includes(def.id))
      layer.setVisible(visible)
    })
  }, [activeLayers])

  useEffect(() => {
    if (appMode !== 'live') return
    const loadAnalysisData = async () => {
      setAnalysisLoading(true)
      setAnalysisError(null)
      try {
        if (viewMode === 'flow') {
          const data = await fetchBottlenecks()
          setBottlenecks(data)
        } else if (viewMode === 'quality') {
          const data = await fetchQualityIssues()
          setQualityIssues(data)
        } else if (viewMode === 'efficiency') {
          const data = await fetchEfficiencyIssues()
          setEfficiencyIssues(data)
        } else if (viewMode === 'spaghetti') {
          const data = await fetchSpaghettiPaths(24)
          setSpaghettiPaths(data)
        }
      } catch (err) {
        setAnalysisError(err instanceof Error ? err.message : '加载分析数据失败')
      } finally {
        setAnalysisLoading(false)
      }
    }
    loadAnalysisData()
  }, [viewMode, appMode, setBottlenecks, setQualityIssues, setEfficiencyIssues, setSpaghettiPaths, setAnalysisLoading, setAnalysisError])

  useEffect(() => {
    if (appMode !== 'live') return () => undefined
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
  }, [appMode, setInitialData, applyUpdate])

  useEffect(() => {
    const sources = vectorSourcesRef.current
    if (appMode !== 'live' || hasTrajectorySeries) {
      sources.equipment?.clear()
      sources.wip?.clear()
      sources.personnel?.clear()
      return
    }
    let filteredEquipment = equipment
    let filteredWorkpieces = workpieces
    let filteredPersonnel = personnel

    const stationCoords = stationCoordsRef.current

    if (viewMode === 'flow') {
      const bottleneckIds = getStationIdsFromBottlenecks(bottlenecks)
      filteredEquipment = filterEquipmentByStations(equipment, bottleneckIds)
      filteredWorkpieces = filterWorkpiecesByStations(workpieces, bottleneckIds, stationCoords)
      filteredPersonnel = filterPersonnelByStations(personnel, bottleneckIds)
      // 如果没有瓶颈工位，显示所有人员
      if (bottleneckIds.size === 0) {
        filteredPersonnel = personnel
      }
    } else if (viewMode === 'quality') {
      const qualityIssueIds = getQualityIssueIds(qualityIssues)
      filteredEquipment = equipment.filter((e) => qualityIssueIds.has(e.id))
      const qualityStationIds = getStationIdsFromQualityIssues(qualityIssues, equipment)
      filteredWorkpieces = filterWorkpiecesByStations(workpieces, qualityStationIds, stationCoords)
      // 质量视图显示相关工位的人员
      filteredPersonnel = filterPersonnelByStations(personnel, qualityStationIds)
      if (qualityStationIds.size === 0) {
        filteredPersonnel = personnel
      }
    } else if (viewMode === 'efficiency') {
      const efficiencyStationIds = getStationIdsFromEfficiencyIssues(efficiencyIssues)
      filteredEquipment = filterEquipmentByStations(equipment, efficiencyStationIds)
      filteredWorkpieces = filterWorkpiecesByStations(workpieces, efficiencyStationIds, stationCoords)
      filteredPersonnel = filterPersonnelByStations(personnel, efficiencyStationIds)
      // 如果没有效率问题工位，显示所有人员
      if (efficiencyStationIds.size === 0) {
        filteredPersonnel = personnel
      }
    } else if (viewMode === 'plan') {
      const planFiltered = filterPlanEntities(workpieces, equipment, personnel, stationCoords)
      filteredWorkpieces = planFiltered.wips
      filteredEquipment = planFiltered.eq
      filteredPersonnel = planFiltered.ppl
    } else if (viewMode === 'spaghetti') {
      const spaghettiFiltered = filterSpaghettiEntities(workpieces, equipment, personnel)
      filteredWorkpieces = spaghettiFiltered.wips
      filteredEquipment = spaghettiFiltered.eq
      filteredPersonnel = spaghettiFiltered.ppl
    } else {
      // 默认视图显示所有实体
      filteredEquipment = equipment
      filteredWorkpieces = workpieces
      filteredPersonnel = personnel
    }

    updateEntitySource(sources.equipment, filteredEquipment, 'equipment', filters)
    updateEntitySource(sources.wip, filteredWorkpieces, 'workpiece', filters)
    updateEntitySource(sources.personnel, filteredPersonnel, 'personnel', filters)
    
    // 调试日志
    if (filteredPersonnel.length > 0) {
      console.log(`[MapContainer] 更新人员图层: ${filteredPersonnel.length}个人员`, {
        viewMode,
        activeLayers: activeLayers.includes('personnel'),
        personnelIds: filteredPersonnel.map(p => p.id)
      })
    }
  }, [equipment, workpieces, personnel, filters, hasTrajectorySeries, appMode, viewMode, qualityIssues, efficiencyIssues, bottlenecks, activeLayers])

  useEffect(() => {
    const lineSource = trajectoryLineSourceRef.current
    const tailSource = trajectoryTailSourceRef.current
    const markerSource = trajectoryMarkerSourceRef.current
    if (!lineSource || !markerSource || !tailSource) return
    if (appMode !== 'history') {
      lineSource.clear()
      tailSource.clear()
      markerSource.clear()
      // 直接重置缓存对象，避免对可能被覆盖的 Map 实例调用 clear()
      trajectoryCacheRef.current = new Map<string, TrajectoryCacheEntry>()
      return
    }
    drawTrajectorySeries(trajectorySeries, lineSource, markerSource, tailSource, trajectoryCacheRef)
  }, [trajectorySeries, appMode])

  useEffect(() => {
    if (!hasTrajectorySeries || appMode !== 'history') return
    const cache = trajectoryCacheRef.current
    if (!cache.size) return
    const map = mapRef.current
    cache.forEach((entry) => {
      const coord = interpolateCoordinate(entry.timestamps, entry.coordinates, currentTrajectoryTs)
      if (!coord) {
        // 如果插值失败，使用最后一个有效坐标
        const lastCoord = entry.coordinates[entry.coordinates.length - 1]
        if (lastCoord) {
          const geometry = entry.marker.getGeometry()
          if (geometry) {
            geometry.setCoordinates(lastCoord)
            geometry.changed()
          }
        }
        return
      }
      const geometry = entry.marker.getGeometry()
      if (geometry) {
        geometry.setCoordinates(coord)
        geometry.changed() // 触发几何体变化事件，通知地图重绘
      }
      updateTail(entry, currentTrajectoryTs, trajectoryTailSourceRef.current)
    })
    // 触发地图重绘
    if (map) {
      map.render()
    }
  }, [currentTrajectoryTs, hasTrajectorySeries, appMode])

  useEffect(() => {
    if (!trajectoryPlaying || !hasTrajectorySeries || appMode !== 'history') return
    let frame: number
    let last = performance.now()
    const loop = (now: number) => {
      const delta = now - last
      last = now
      tickTrajectory(delta)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame((now) => {
      last = now
      loop(now)
    })
    return () => cancelAnimationFrame(frame)
  }, [trajectoryPlaying, tickTrajectory, hasTrajectorySeries, appMode])

  const handleZoomStep = (direction: 'in' | 'out') => {
    const view = viewRef.current
    if (!view) return
    const current = view.getZoom() ?? 0
    const delta = Math.log2(direction === 'in' ? ZOOM_FACTOR : 1 / ZOOM_FACTOR)
    const constrained = view.getConstrainedZoom(current + delta) ?? current + delta
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, constrained))
    view.animate({ zoom: next, duration: 220, easing: (t) => 1 - Math.pow(1 - t, 3) })
  }

  useEffect(() => {
    if (appMode !== 'live') return
    const source = vectorSourcesRef.current.bottleneck
    if (!source) return
    const visible = activeLayers.includes('bottleneck') || viewMode === 'flow'
    updateBottleneckSource(source, bottlenecks, visible)
  }, [bottlenecks, activeLayers, appMode, viewMode])

  useEffect(() => {
    if (appMode !== 'live') return
    const source = vectorSourcesRef.current.quality
    if (!source) return
    const visible = activeLayers.includes('quality') || viewMode === 'quality'
    updateQualitySource(source, qualityIssues, visible)
  }, [qualityIssues, activeLayers, appMode, viewMode])

  useEffect(() => {
    if (appMode !== 'live') return
    const source = vectorSourcesRef.current.oee
    if (!source) return
    const visible = activeLayers.includes('oee') || viewMode === 'efficiency'
    updateEfficiencySource(source, efficiencyIssues, visible)
  }, [efficiencyIssues, activeLayers, appMode, viewMode])

  return (
    <section className="panel map-panel">
      <header className="panel-header">
        <span>🗺️ 地图预览</span>
        <span className="panel-subtitle">
          basemap/production-line.geojson (EPSG:10001)
        </span>
      </header>
      <div className="panel-body no-padding">
        <div className="map-container" ref={targetRef} style={{ position: 'relative' }}>
        </div>
        <LegendPanel
          zoomLabel={`${(Math.pow(2, zoomLevel - BASE_ZOOM) * 100).toFixed(0)}%`}
          onZoomIn={() => handleZoomStep('in')}
          onZoomOut={() => handleZoomStep('out')}
          canZoomIn={canZoomIn}
          canZoomOut={canZoomOut}
        />
        <FeaturePopup />
      </div>
      {loading && <div className="map-overlay">加载底图...</div>}
      {error && <div className="map-overlay error">{error}</div>}
    </section>
  )
}

function resolveBaseLayerKey(feature: Feature): BaseLayerKey {
  const type = feature.get('type')
  if (type === 'Zone') return 'baseZones'
  if (type === 'Path') return 'basePaths'
  return 'baseStations'
}

function buildBasemapSelection(feature: Feature): SelectedFeature | null {
  const featureType = feature.get('type') as string | undefined
  const name = feature.get('name') as string | undefined
  const processGroup = feature.get('processGroup') as string | undefined
  const status = feature.get('status') as string | undefined
  const ct = feature.get('ct') as number | undefined
  const layer = feature.get('layer') as string | undefined
  const rawId = (typeof feature.getId === 'function' ? feature.getId() : null) ?? feature.get('id')
  const id = (rawId ?? name) as string | undefined
  if (!id && !featureType) return null
  return {
    type: 'basemap',
    id: id ?? '',
    name,
    featureType,
    processGroup,
    status,
    ct,
    layer,
  }
}

function createBaseStyle(
  feature: Feature,
  viewMode: ViewMode = 'flow',
  bottlenecks: BottleneckStation[] = [],
  qualityIssues: QualityIssue[] = [],
  efficiencyIssues: EfficiencyIssue[] = [],
): Style {
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
  const featureId = (typeof feature.getId === 'function' ? feature.getId() : null) ?? feature.get('id') ?? name

  let isHighlighted = false
  let opacity = 1.0
  let borderColor = statusColorMap[status] ?? '#4a4f63'
  let borderWidth = 1.2
  let textLines = type === 'Buffer' ? `${name}` : `${name}\nCT:${ct ?? '--'}min`

    if (type === 'Station') {
      if (viewMode === 'flow') {
        const bottleneckIds = getBottleneckStationIds(bottlenecks)
        isHighlighted = bottleneckIds.has(featureId as string)
        if (!isHighlighted) {
          opacity = 0.22
          borderWidth = 0.8
        } else {
          borderColor = '#ea5455'
          borderWidth = 3
          const bottleneck = bottlenecks.find((b) => b.id === featureId)
          const queue = bottleneck?.queueLength ?? '--'
          textLines = `${name}\n瓶颈 队列:${queue}`
        }
      } else if (viewMode === 'quality') {
        const qualityIssueIds = getQualityIssueIds(qualityIssues)
        isHighlighted = qualityIssueIds.has(featureId as string)
        if (!isHighlighted) {
          opacity = 0.3
        } else {
          borderColor = '#ea5455'
          borderWidth = 2.5
        }
      } else if (viewMode === 'efficiency') {
        const efficiencyIssueIds = getLowEfficiencyStationIds(efficiencyIssues)
        isHighlighted = efficiencyIssueIds.has(featureId as string)
        if (!isHighlighted) {
          opacity = 0.3
        } else {
          borderColor = '#ffb200'
          borderWidth = 2.5
          const issue = efficiencyIssues.find((e) => e.id === featureId)
          const actual = issue && 'actualOEE' in issue ? (issue as EfficiencyIssue).actualOEE : undefined
          textLines = `${name}\nOEE:${typeof actual === 'number' ? actual.toFixed(1) : '--'}%`
        }
      }
    }

  return new Style({
    text: new Text({
      text: textLines,
      font: '600 12px "Segoe UI"',
      fill: new Fill({ color: `rgba(230, 230, 240, ${opacity})` }),
      textAlign: 'center',
      textBaseline: 'middle',
      padding: [6, 12, 6, 12],
      backgroundFill: new Fill({ color: `rgba(30, 34, 47, ${opacity})` }),
      backgroundStroke: new Stroke({
        color: borderColor,
        width: borderWidth,
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
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: 'rgba(12,12,15,0.9)' }),
      stroke: new Stroke({ color, width: 1.6 }),
    }),
    text: new Text({
      text: label,
      font: '600 10px "Segoe UI"',
      fill: new Fill({ color: '#e2e8f0' }),
      padding: [3, 6, 3, 6],
      textAlign: 'center',
      textBaseline: 'middle',
      offsetY: -12,
      backgroundFill: new Fill({ color: 'rgba(16,16,20,0.8)' }),
      backgroundStroke: new Stroke({ color, width: 1 }),
    }),
  })
}

function updateBottleneckSource(
  source: VectorSource,
  items: BottleneckStation[],
  visible: boolean,
) {
  source.clear()
  if (!visible) return
  items.forEach((item) => {
    const feature = new Feature({
      geometry: new Point(transformWorkshopToMap(item.location.coordinates)),
    })
    const queueLabel = `队列:${item.queueLength ?? '--'}`
    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 12,
          fill: new Fill({ color: 'rgba(234,84,85,0.2)' }),
          stroke: new Stroke({ color: '#ea5455', width: 3 }),
        }),
        text: new Text({
          text: `${item.name}\n${queueLabel}`,
          font: '600 11px "Segoe UI"',
          fill: new Fill({ color: '#f8fafc' }),
          backgroundFill: new Fill({ color: 'rgba(20,20,26,0.95)' }),
          backgroundStroke: new Stroke({ color: '#ea5455', width: 1.5 }),
          padding: [6, 8, 6, 8],
          offsetY: -16,
        }),
      }),
    )
    source.addFeature(feature)
  })
}

function updateQualitySource(
  source: VectorSource,
  items: QualityIssue[],
  visible: boolean,
) {
  source.clear()
  if (!visible) return
  items.forEach((item) => {
    const feature = new Feature({
      geometry: new Point(transformWorkshopToMap(item.location.coordinates)),
    })
    const defectRateLabel = `缺陷率:${item.recentDefectRate24h}%`
    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 12,
          fill: new Fill({ color: 'rgba(234,84,85,0.2)' }),
          stroke: new Stroke({ color: '#ea5455', width: 3 }),
        }),
        text: new Text({
          text: `${item.name}\n${defectRateLabel}`,
          font: '600 11px "Segoe UI"',
          fill: new Fill({ color: '#f8fafc' }),
          backgroundFill: new Fill({ color: 'rgba(20,20,26,0.95)' }),
          backgroundStroke: new Stroke({ color: '#ea5455', width: 1.5 }),
          padding: [6, 8, 6, 8],
          offsetY: -16,
        }),
      }),
    )
    source.addFeature(feature)
  })
}

function updateEfficiencySource(
  source: VectorSource,
  items: EfficiencyIssue[],
  visible: boolean,
) {
  source.clear()
  if (!visible) return
  items.forEach((item) => {
    const feature = new Feature({
      geometry: new Point(transformWorkshopToMap(item.location.coordinates)),
    })
    const oeeLabel = `OEE:${item.actualOEE.toFixed(1)}%`
    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 12,
          fill: new Fill({ color: 'rgba(255,165,0,0.2)' }),
          stroke: new Stroke({ color: '#ffa500', width: 3 }),
        }),
        text: new Text({
          text: `${item.name}\n${oeeLabel}`,
          font: '600 11px "Segoe UI"',
          fill: new Fill({ color: '#f8fafc' }),
          backgroundFill: new Fill({ color: 'rgba(20,20,26,0.95)' }),
          backgroundStroke: new Stroke({ color: '#ffa500', width: 1.5 }),
          padding: [6, 8, 6, 8],
          offsetY: -16,
        }),
      }),
    )
    source.addFeature(feature)
  })
}

function createSpaghettiStyle(frequency: number, maxFrequency: number) {
  const normalized = maxFrequency > 0 ? Math.min(1, frequency / maxFrequency) : 0
  const color =
    normalized >= 0.8
      ? '#ea5455'
      : normalized >= 0.6
        ? '#ffb200'
        : normalized >= 0.4
          ? '#0ea5e9'
          : normalized >= 0.2
            ? '#5c7cfa'
            : '#a855f7'
  const opacity = 0.3 + normalized * 0.7
  const width = 1 + normalized * 3
  return new Style({
    stroke: new Stroke({
      color,
      width,
      opacity,
    }),
  })
}

const trajectoryKindColors: Record<TrajectorySeries['kind'], string> = {
  equipment: '#38bdf8',
  workpiece: '#f97316',
  personnel: '#a855f7',
}

const TRAJECTORY_TAIL_WINDOW_MS = 5_000

function drawTrajectorySeries(
  seriesList: TrajectorySeries[],
  lineSource: VectorSource,
  markerSource: VectorSource,
  tailSource: VectorSource,
  cacheRef: MutableRefObject<Map<string, TrajectoryCacheEntry>>,
) {
  lineSource.clear()
  tailSource.clear()
  markerSource.clear()
  const nextCache = new Map<string, TrajectoryCacheEntry>()
  seriesList.forEach((series) => {
    const entry = buildTrajectoryEntry(series)
    if (!entry) {
      return
    }
    lineSource.addFeature(entry.line)
    markerSource.addFeature(entry.marker)
    nextCache.set(series.id, {
      timestamps: entry.timestamps,
      coordinates: entry.coordinates,
      marker: entry.marker,
      series,
    })
  })
  cacheRef.current = nextCache
}

function buildTrajectoryEntry(series: TrajectorySeries) {
  if (!series.points.length) return null
  const timestamps: number[] = []
  const coordinates: [number, number][] = []
  series.points.forEach((pt) => {
    const parsed = Date.parse(pt.timestamp)
    if (Number.isNaN(parsed) || !pt.location?.coordinates) return
    timestamps.push(parsed)
    coordinates.push(transformWorkshopToMap(pt.location.coordinates as [number, number]) as [number, number])
  })
  if (!timestamps.length) return null
  const color = trajectoryKindColors[series.kind] ?? '#f4d35e'
  const line = new Feature({
    geometry: new LineString(coordinates),
  })
  line.setStyle(createTrajectoryLineStyle(color, series.kind))
  const marker = new Feature({
    geometry: new Point(coordinates[0]),
  })
  marker.set('trajectoryEntityId', series.id)
  marker.setStyle(createTrajectoryMarkerStyle(series, color))
  return { line, marker, timestamps, coordinates }
}

function updateTail(
  entry: TrajectoryCacheEntry,
  targetTs: number,
  tailSource: VectorSource | null,
) {
  if (!tailSource || !entry.timestamps.length) return
  const windowStart = targetTs - TRAJECTORY_TAIL_WINDOW_MS
  const coords: [number, number][] = []

  for (let i = 0; i < entry.timestamps.length - 1; i += 1) {
    const startTs = entry.timestamps[i]
    const endTs = entry.timestamps[i + 1]
    const startCoord = entry.coordinates[i]
    const endCoord = entry.coordinates[i + 1]

    if (endTs < windowStart || startTs > targetTs) {
      continue
    }

    const segStart =
      startTs >= windowStart ? startCoord : interpolateCoordinate([startTs, endTs], [startCoord, endCoord], windowStart)
    const segEnd =
      endTs <= targetTs ? endCoord : interpolateCoordinate([startTs, endTs], [startCoord, endCoord], targetTs)

    if (segStart && segEnd) {
      if (coords.length === 0) {
        coords.push(segStart as [number, number])
      }
      coords.push(segEnd as [number, number])
    }
  }

  tailSource.removeFeature(entry.marker.get('tailFeature'))
  if (coords.length < 2) return
  const tail = new Feature({ geometry: new LineString(coords) })
  tail.setStyle(createTrajectoryTailStyle(trajectoryKindColors[entry.series.kind] ?? '#f4d35e'))
  tailSource.addFeature(tail)
  entry.marker.set('tailFeature', tail)
}

function interpolateCoordinate(
  timestamps: number[],
  coordinates: [number, number][],
  targetTs: number,
): [number, number] | null {
  if (!timestamps.length) return null
  if (targetTs <= timestamps[0]) return coordinates[0]
  for (let i = 0; i < timestamps.length - 1; i += 1) {
    const startTs = timestamps[i]
    const endTs = timestamps[i + 1]
    if (targetTs <= endTs) {
      const ratio = (targetTs - startTs) / Math.max(1, endTs - startTs)
      const [x1, y1] = coordinates[i]
      const [x2, y2] = coordinates[i + 1]
      return [x1 + (x2 - x1) * ratio, y1 + (y2 - y1) * ratio]
    }
  }
  return coordinates[coordinates.length - 1]
}

function createTrajectoryLineStyle(color: string, kind: TrajectorySeries['kind']) {
  return new Style({
    stroke: new Stroke({
      color,
      width: 2.5,
      lineDash: kind === 'personnel' ? [6, 6] : undefined,
    }),
  })
}

function createTrajectoryMarkerStyle(series: TrajectorySeries, color: string) {
  return new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color }),
      stroke: new Stroke({ color: '#111827', width: 1 }),
    }),
    text: new Text({
      text: series.name,
      font: '600 11px "Segoe UI"',
      fill: new Fill({ color: '#e0f2fe' }),
      backgroundFill: new Fill({ color: 'rgba(8,8,12,0.9)' }),
      padding: [3, 6, 3, 6],
      offsetY: -14,
    }),
  })
}

function createTrajectoryTailStyle(color: string) {
  return new Style({
    stroke: new Stroke({
      color,
      width: 4,
      lineCap: 'round',
      lineJoin: 'round',
      lineDash: [10, 6],
    }),
  })
}
