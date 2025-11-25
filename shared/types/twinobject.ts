import type { Point, Polygon } from 'geojson'
export type TwinObjectType =
  | 'Zone'
  | 'Station'
  | 'Robot'
  | 'Person'
  | 'Workpiece'
  | 'Buffer'

export interface BaseTwinObject {
  id: string
  type: TwinObjectType
  name: {
    type: 'Property'
    value: string
  }
  location: {
    type: 'GeoProperty'
    value: Point | Polygon
  }
  status?: {
    type: 'Property'
    value: 'Running' | 'Idle' | 'Fault' | 'Maintenance'
  }
  '@context': string[] | string
}

export interface StationTwinObject extends BaseTwinObject {
  type: 'Station'
  processStep?: { type: 'Property'; value: string }
  stdCycleTime?: { type: 'Property'; value: number }
}

export type TwinObject = BaseTwinObject | StationTwinObject

