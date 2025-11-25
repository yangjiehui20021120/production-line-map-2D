import proj4 from 'proj4'
import { register } from 'ol/proj/proj4'
import { transform } from 'ol/proj'

const WORKSHOP_PROJECTION = 'EPSG:10001'
const WEB_MERCATOR = 'EPSG:3857'

const definition =
  '+proj=tmerc +lat_0=30 +lon_0=120 +k=1 +x_0=0 +y_0=0 +units=m +no_defs'

let registered = false

export function registerWorkshopProjection() {
  if (registered) return
  proj4.defs(WORKSHOP_PROJECTION, definition)
  register(proj4)
  registered = true
}

export function transformWorkshopToMap(coord: [number, number]) {
  registerWorkshopProjection()
  return transform(coord, WORKSHOP_PROJECTION, WEB_MERCATOR)
}

export function transformMapToWorkshop(coord: [number, number]) {
  registerWorkshopProjection()
  return transform(coord, WEB_MERCATOR, WORKSHOP_PROJECTION)
}

