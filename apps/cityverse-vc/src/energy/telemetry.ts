import mqtt from 'mqtt'
import type { FastifyBaseLogger } from 'fastify'
import { EnergySummarySchema, mqttTopics } from '@cityverse/contracts'
import type { EnergyService } from './service.js'

export class EnergyTelemetryPublisher {
  private client?: mqtt.MqttClient
  private timer?: NodeJS.Timeout

  constructor(
    private readonly logger: FastifyBaseLogger,
    private readonly energy: EnergyService,
  ) {}

  start(): void {
    const brokerUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883'
    const intervalMs = Number(process.env.ENERGY_PUBLISH_INTERVAL_MS ?? 2000)

    this.client = mqtt.connect(brokerUrl)

    this.client.on('connect', () => {
      this.logger.info({ brokerUrl }, 'VC energy MQTT publisher connected')
      this.publishOnce()
      this.timer = setInterval(() => this.publishOnce(), intervalMs)
    })

    this.client.on('error', (err: Error) => {
      this.logger.error({ err }, 'VC energy MQTT publisher error')
    })
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    if (this.client) this.client.end(true)
  }

  private publishOnce(): void {
    if (!this.client || !this.client.connected) return
    const payload = JSON.stringify(EnergySummarySchema.parse(this.energy.getSummary()))
    this.client.publish(mqttTopics.energyTelemetry, payload)
  }
}
