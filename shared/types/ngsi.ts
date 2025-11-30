export type Coordinate = [number, number]

export interface PointGeometry {
  type: 'Point'
  coordinates: Coordinate
}

export interface LineStringGeometry {
  type: 'LineString'
  coordinates: Coordinate[]
}

export interface MultiLineStringGeometry {
  type: 'MultiLineString'
  coordinates: Coordinate[][]
}

export interface PolygonGeometry {
  type: 'Polygon'
  coordinates: Coordinate[][]
}

export interface MultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: Coordinate[][][]
}

export type NGSIPrimitive = string | number | boolean | null
export type NGSIAny = NGSIPrimitive | NGSIPrimitive[] | Record<string, unknown>

export interface NGSIProperty<T = NGSIAny> {
  type: 'Property'
  value: T
  observedAt?: string
  unitCode?: string
}

export interface NGSIRelationship {
  type: 'Relationship'
  object: string
  observedAt?: string
}

export interface NGSIGeoProperty<
  T extends TwinObjectGeometry = TwinObjectGeometry,
> {
  type: 'GeoProperty'
  value: T
  observedAt?: string
}

export type TwinObjectGeometry =
  | PointGeometry
  | PolygonGeometry
  | MultiPolygonGeometry
  | LineStringGeometry
  | MultiLineStringGeometry

export type NGSIContext = string | string[]




