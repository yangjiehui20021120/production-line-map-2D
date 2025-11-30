import type { EquipmentEntity, WorkpieceEntity, PersonnelEntity } from '../types/realtime'
import type { BottleneckStation, QualityIssue, EfficiencyIssue } from '../services/analysisService'

const STATION_DISTANCE_THRESHOLD = 10

function calculateDistance(
  coord1: [number, number],
  coord2: [number, number],
): number {
  const dx = coord1[0] - coord2[0]
  const dy = coord1[1] - coord2[1]
  return Math.sqrt(dx * dx + dy * dy)
}

export function filterWorkpiecesByStations(
  workpieces: WorkpieceEntity[],
  stationIds: Set<string>,
  stationLocations: Map<string, [number, number]> | StationCoordLookup,
): WorkpieceEntity[] {
  if (stationIds.size === 0) {
    return []
  }
  
  return workpieces.filter((w) => {
    if (w.attributes.currentStation && stationIds.has(w.attributes.currentStation)) {
      return true
    }
    const wpCoord = w.location.coordinates as [number, number]
    if (stationLocations instanceof Map) {
      for (const [stationId, stationCoord] of stationLocations.entries()) {
        if (stationIds.has(stationId)) {
          const distance = calculateDistance(wpCoord, stationCoord)
          if (distance <= STATION_DISTANCE_THRESHOLD) {
            return true
          }
        }
      }
    } else {
      for (const [stationId, stationCoord] of Object.entries(stationLocations)) {
        if (stationIds.has(stationId)) {
          const distance = calculateDistance(wpCoord, stationCoord)
          if (distance <= STATION_DISTANCE_THRESHOLD) {
            return true
          }
        }
      }
    }
    return false
  })
}

export function filterEquipmentByStations(
  equipment: EquipmentEntity[],
  stationIds: Set<string>,
): EquipmentEntity[] {
  return equipment.filter((e) => {
    const assigned = e.attributes.assignedStation
    return assigned && stationIds.has(assigned)
  })
}

export function filterPersonnelByStations(
  personnel: PersonnelEntity[],
  stationIds: Set<string>,
): PersonnelEntity[] {
  return personnel.filter((p) => {
    const assigned = p.attributes.assignedStation
    return assigned && stationIds.has(assigned)
  })
}

export function getStationIdsFromBottlenecks(
  bottlenecks: BottleneckStation[],
): Set<string> {
  return new Set(bottlenecks.map((b) => b.id))
}

export function getStationIdsFromEfficiencyIssues(
  efficiencyIssues: EfficiencyIssue[],
): Set<string> {
  return new Set(efficiencyIssues.map((e) => e.id))
}

export function getStationIdsFromQualityIssues(
  qualityIssues: QualityIssue[],
  equipment: EquipmentEntity[],
): Set<string> {
  const stationIds = new Set<string>()
  const qualityEquipmentIds = new Set(qualityIssues.map((q) => q.id))
  
  equipment.forEach((e) => {
    if (qualityEquipmentIds.has(e.id) && e.attributes.assignedStation) {
      stationIds.add(e.attributes.assignedStation)
    }
  })
  
  qualityIssues.forEach((q) => {
    if (q.id.startsWith('ST-') || q.id.startsWith('urn:ngsi-ld:Station:')) {
      stationIds.add(q.id)
    }
  })
  
  return stationIds
}

export function parseStationLocationsFromGeoJSON(geojson: any): Map<string, [number, number]> {
  const locations = new Map<string, [number, number]>()
  
  geojson.features?.forEach((feature: any) => {
    if (feature.properties?.type === 'Station' && feature.geometry?.coordinates) {
      const id = feature.id || feature.properties?.name
      const coords = feature.geometry.coordinates as [number, number]
      if (id && coords) {
        locations.set(id, coords)
      }
    }
  })
  
  return locations
}

export function getStationLocationsFromBottlenecks(
  bottlenecks: BottleneckStation[],
): Map<string, [number, number]> {
  const locations = new Map<string, [number, number]>()
  bottlenecks.forEach((b) => {
    if (b.location?.coordinates) {
      locations.set(b.id, b.location.coordinates)
    }
  })
  return locations
}

export function getStationLocationsFromEfficiencyIssues(
  efficiencyIssues: EfficiencyIssue[],
): Map<string, [number, number]> {
  const locations = new Map<string, [number, number]>()
  efficiencyIssues.forEach((e) => {
    if (e.location?.coordinates) {
      locations.set(e.id, e.location.coordinates)
    }
  })
  return locations
}

export type StationCoordLookup = Record<string, [number, number]>

export function filterPlanEntities(
  workpieces: WorkpieceEntity[],
  equipment: EquipmentEntity[],
  personnel: PersonnelEntity[],
  stationCoords: StationCoordLookup,
): {
  wips: WorkpieceEntity[]
  eq: EquipmentEntity[]
  ppl: PersonnelEntity[]
} {
  const stationIds = new Set<string>()
  
  workpieces.forEach((w) => {
    if (w.attributes.currentStation) {
      stationIds.add(w.attributes.currentStation)
    } else {
      const wpCoord = w.location.coordinates as [number, number]
      for (const [stationId, stationCoord] of Object.entries(stationCoords)) {
        const distance = calculateDistance(wpCoord, stationCoord)
        if (distance <= STATION_DISTANCE_THRESHOLD) {
          stationIds.add(stationId)
          break
        }
      }
    }
  })
  
  return {
    wips: workpieces,
    eq: filterEquipmentByStations(equipment, stationIds),
    ppl: filterPersonnelByStations(personnel, stationIds),
  }
}

export function filterSpaghettiEntities(
  workpieces: WorkpieceEntity[],
  equipment: EquipmentEntity[],
  personnel: PersonnelEntity[],
): {
  wips: WorkpieceEntity[]
  eq: EquipmentEntity[]
  ppl: PersonnelEntity[]
} {
  // Spaghetti视图显示所有工件路径，以及相关的人员和设备
  // 人员显示在工位附近，设备显示在路径沿线
  return {
    wips: workpieces,
    eq: equipment,
    ppl: personnel,
  }
}
