export const WEATHER_CONFIG = {
  responseRates: {
    pressure: 0.35,
    humidity: 0.45,
    storminess: 0.4,
    instability: 0.45,
    cloud: 0.5,
    wind: 0.6,
    precipitation: 0.55,
    temperature: 0.35,
  },
  defaults: {
    pressureHpa: 1015,
    humidity01: 0.55,
    cloudCover01: 0.2,
    windSpeedMps: 2.5,
    precipitation01: 0,
    temperatureC: 12,
  },
} as const
