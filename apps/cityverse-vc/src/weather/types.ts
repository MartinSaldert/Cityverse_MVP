export type Season = 'winter' | 'spring' | 'summer' | 'autumn'
export type WeatherCategory = 'storm' | 'rain' | 'cloudy' | 'partly_cloudy' | 'clear'

export interface WeatherState {
  simTime: string
  locationId: string
  season: Season
  sunrise: number
  sunset: number
  daylightHours: number
  daylightFactor: number
  solarRadiationWm2: number
  pressureHpa: number
  pressureTrend: number
  temperatureC: number
  feelsLikeC: number
  humidity01: number
  cloudCover01: number
  windSpeedMps: number
  precipitation01: number
  storminess01: number
  instability01: number
  category: WeatherCategory
}

export interface WeatherNudge {
  pressureBias?: number
  cloudBias?: number
  windBias?: number
  tempBias?: number
  humidityBias?: number
}
