import mqtt from 'mqtt'
import type { FastifyBaseLogger } from 'fastify'
import { mqttTopics, WeatherTelemetrySchema } from '@cityverse/contracts'
import type { WeatherState } from './types.js'
import { toWeatherSummary } from './summary.js'

export function toWeatherTelemetry(state: WeatherState) {
  const summary = toWeatherSummary(state)
  return WeatherTelemetrySchema.parse({
    timestamp: summary.updatedAt,
    temperatureC: summary.temperatureC,
    humidity: summary.humidity,
    pressureHpa: summary.pressureHpa,
    windSpeedMs: summary.windSpeedMs,
    windDirectionDeg: summary.windDirectionDeg,
    cloudCover: summary.cloudCover,
    precipitationMmH: summary.precipitationMmH,
  })
}

export class WeatherTelemetryPublisher {
  private client?: mqtt.MqttClient
  private timer?: NodeJS.Timeout

  constructor(
    private readonly logger: FastifyBaseLogger,
    private readonly getState: () => WeatherState,
  ) {}

  start(): void {
    const brokerUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883'
    const intervalMs = Number(process.env.WEATHER_PUBLISH_INTERVAL_MS ?? 2000)

    this.client = mqtt.connect(brokerUrl)

    this.client.on('connect', () => {
      this.logger.info({ brokerUrl }, 'VC MQTT publisher connected')
      this.publishOnce()
      this.timer = setInterval(() => this.publishOnce(), intervalMs)
    })

    this.client.on('error', (err: Error) => {
      this.logger.error({ err }, 'VC MQTT publisher error')
    })
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    if (this.client) this.client.end(true)
  }

  private publishOnce(): void {
    if (!this.client || !this.client.connected) return
    const payload = JSON.stringify(toWeatherTelemetry(this.getState()))
    this.client.publish(mqttTopics.weatherTelemetry, payload)
  }
}
