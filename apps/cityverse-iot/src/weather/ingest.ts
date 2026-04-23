import mqtt from 'mqtt'
import { WeatherTelemetrySchema, mqttTopics } from '@cityverse/contracts'
import { setLatestTelemetry } from './state.js'
import { recordFlowIngest, recordBrokerConnected, recordBrokerDisconnected } from '../ops/flowRegistry.js'
import { appendHistoryRecord } from '../history/store.js'
import type { FastifyBaseLogger } from 'fastify'

export function startWeatherIngest(log: FastifyBaseLogger): mqtt.MqttClient {
  const brokerUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883'
  const client = mqtt.connect(brokerUrl)

  client.on('connect', () => {
    recordBrokerConnected('weather')
    log.info({ brokerUrl }, 'MQTT connected')
    client.subscribe(mqttTopics.weatherTelemetry, (err) => {
      if (err) {
        log.error({ err }, 'Failed to subscribe to weather telemetry topic')
      } else {
        log.info({ topic: mqttTopics.weatherTelemetry }, 'Subscribed to weather telemetry')
      }
    })
  })

  client.on('message', (topic, message) => {
    if (topic !== mqttTopics.weatherTelemetry) return

    let raw: unknown
    try {
      raw = JSON.parse(message.toString())
    } catch {
      log.warn('Received non-JSON MQTT message on weather topic')
      return
    }

    const result = WeatherTelemetrySchema.safeParse(raw)
    if (!result.success) {
      log.warn({ issues: result.error.issues }, 'Weather telemetry validation failed')
      return
    }

    setLatestTelemetry(result.data)
    recordFlowIngest('weather', result.data.timestamp)
    appendHistoryRecord('weather', result.data.timestamp, {
      temperatureC: result.data.temperatureC,
      cloudCover: result.data.cloudCover,
      precipitationMmH: result.data.precipitationMmH,
      windSpeedMs: result.data.windSpeedMs,
    })
    log.debug({ timestamp: result.data.timestamp }, 'Weather telemetry ingested')
  })

  client.on('offline', () => { recordBrokerDisconnected('weather') })

  client.on('error', (err) => {
    log.error({ err }, 'MQTT client error')
  })

  return client
}
