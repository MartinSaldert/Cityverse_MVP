import { type CityLocation, CITY_CATALOG } from './catalog.js'

export class LocationService {
  private current: CityLocation = CITY_CATALOG[0]

  getCurrent(): CityLocation {
    return this.current
  }

  getOptions(): CityLocation[] {
    return CITY_CATALOG
  }

  select(locationId: string): CityLocation | null {
    const found = CITY_CATALOG.find(c => c.id === locationId) ?? null
    if (found) this.current = found
    return found
  }
}
