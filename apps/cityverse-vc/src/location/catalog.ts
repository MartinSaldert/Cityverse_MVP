export interface CityLocation {
  id: string
  label: string
  latitude: number
  longitude: number
  countryCode: string
}

export const CITY_CATALOG: CityLocation[] = [
  { id: 'stockholm',  label: 'Stockholm',  latitude: 59.3293, longitude:  18.0686, countryCode: 'SE' },
  { id: 'gothenburg', label: 'Gothenburg', latitude: 57.7089, longitude:  11.9746, countryCode: 'SE' },
  { id: 'malmo',      label: 'Malmö',      latitude: 55.6050, longitude:  13.0038, countryCode: 'SE' },
  { id: 'london',     label: 'London',     latitude: 51.5074, longitude:  -0.1278, countryCode: 'GB' },
  { id: 'berlin',     label: 'Berlin',     latitude: 52.5200, longitude:  13.4050, countryCode: 'DE' },
  { id: 'new-york',   label: 'New York',   latitude: 40.7128, longitude: -74.0060, countryCode: 'US' },
  { id: 'tokyo',      label: 'Tokyo',      latitude: 35.6762, longitude: 139.6503, countryCode: 'JP' },
]
