import mqtt from 'mqtt'
import type { FastifyBaseLogger } from 'fastify'
import { BuildingTelemetryPayloadSchema, mqttTopics } from '@cityverse/contracts'
import type { BuildingService } from './service.js'

export class BuildingTelemetryPublisher {
  private client?: mqtt.MqttClient
  private timer?: NodeJS.Timeout

  constructor(
    private readonly logger: FastifyBaseLogger,
    private readonly buildings: BuildingService,
  ) {}

  start(): void {
    const brokerUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883'
    const intervalMs = Number(process.env.BUILDING_PUBLISH_INTERVAL_MS ?? 2000)

    this.client = mqtt.connect(brokerUrl)

    this.client.on('connect', () => {
      this.logger.info({ brokerUrl }, 'VC building MQTT publisher connected')
      this.publishOnce()
      this.timer = setInterval(() => this.publishOnce(), intervalMs)
    })

    this.client.on('error', (err: Error) => {
      this.logger.error({ err }, 'VC building MQTT publisher error')
    })
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    if (this.client) this.client.end(true)
  }

  private publishOnce(): void {
    if (!this.client || !this.client.connected) return
    const demands = this.buildings.getCurrentDemands()
    const updatedAt = demands[0]?.updatedAt ?? new Date().toISOString()
    const payload = JSON.stringify(
      BuildingTelemetryPayloadSchema.parse({ updatedAt, buildings: demands }),
    )
    this.client.publish(mqttTopics.buildingTelemetry, payload)
  }
}
