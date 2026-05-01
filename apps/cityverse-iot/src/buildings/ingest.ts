import mqtt from 'mqtt'
import { BuildingTelemetryPayloadSchema, mqttTopics } from '@cityverse/contracts'
import { setLatestBuildings } from './state.js'
import { recordBuildingMetrics } from './history.js'
import { recordFlowIngest, recordBrokerConnected, recordBrokerDisconnected } from '../ops/flowRegistry.js'
import { appendHistoryRecord } from '../history/store.js'
import type { FastifyBaseLogger } from 'fastify'

export function startBuildingIngest(log: FastifyBaseLogger): mqtt.MqttClient {
  const brokerUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883'
  const client = mqtt.connect(brokerUrl)

  client.on('connect', () => {
    recordBrokerConnected('buildings')
    log.info({ brokerUrl }, 'Building MQTT connected')
    client.subscribe(mqttTopics.buildingTelemetry, (err) => {
      if (err) {
        log.error({ err }, 'Failed to subscribe to building telemetry topic')
      } else {
        log.info({ topic: mqttTopics.buildingTelemetry }, 'Subscribed to building telemetry')
      }
    })
  })

  client.on('message', (topic, message) => {
    if (topic !== mqttTopics.buildingTelemetry) return

    let raw: unknown
    try {
      raw = JSON.parse(message.toString())
    } catch {
      log.warn('Received non-JSON MQTT message on building topic')
      return
    }

    const result = BuildingTelemetryPayloadSchema.safeParse(raw)
    if (!result.success) {
      log.warn({ issues: result.error.issues }, 'Building telemetry validation failed')
      return
    }

    setLatestBuildings(result.data)
    recordBuildingMetrics(result.data.buildings, result.data.updatedAt)
    recordFlowIngest('buildings', result.data.updatedAt)
    appendHistoryRecord('buildings', result.data.updatedAt, {
      buildingCount: result.data.buildings.length,
      totalDemandKw: result.data.buildings.reduce((sum, b) => sum + b.currentDemandKw, 0),
    })
    log.debug({ updatedAt: result.data.updatedAt }, 'Building telemetry ingested')
  })

  client.on('offline', () => { recordBrokerDisconnected('buildings') })

  client.on('error', (err) => {
    log.error({ err }, 'Building MQTT client error')
  })

  return client
}
