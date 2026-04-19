import mqtt from 'mqtt'
import { EnergySummarySchema, mqttTopics } from '@cityverse/contracts'
import { setLatestEnergy } from './state.js'
import type { FastifyBaseLogger } from 'fastify'

export function startEnergyIngest(log: FastifyBaseLogger): mqtt.MqttClient {
  const brokerUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883'
  const client = mqtt.connect(brokerUrl)

  client.on('connect', () => {
    log.info({ brokerUrl }, 'Energy MQTT connected')
    client.subscribe(mqttTopics.energyTelemetry, (err) => {
      if (err) {
        log.error({ err }, 'Failed to subscribe to energy telemetry topic')
      } else {
        log.info({ topic: mqttTopics.energyTelemetry }, 'Subscribed to energy telemetry')
      }
    })
  })

  client.on('message', (topic, message) => {
    if (topic !== mqttTopics.energyTelemetry) return

    let raw: unknown
    try {
      raw = JSON.parse(message.toString())
    } catch {
      log.warn('Received non-JSON MQTT message on energy topic')
      return
    }

    const result = EnergySummarySchema.safeParse(raw)
    if (!result.success) {
      log.warn({ issues: result.error.issues }, 'Energy telemetry validation failed')
      return
    }

    setLatestEnergy(result.data)
    log.debug({ updatedAt: result.data.updatedAt }, 'Energy telemetry ingested')
  })

  client.on('error', (err) => {
    log.error({ err }, 'Energy MQTT client error')
  })

  return client
}
