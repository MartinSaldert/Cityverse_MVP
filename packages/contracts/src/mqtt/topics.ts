const NAMESPACE = 'cityverse' as const

export const mqttTopics = {
  weatherTelemetry: `${NAMESPACE}/weather/telemetry`,
  weatherCommand: `${NAMESPACE}/weather/command`,
  energyTelemetry: `${NAMESPACE}/energy/telemetry`,
} as const

export type MqttTopicKey = keyof typeof mqttTopics
export type MqttTopicValue = (typeof mqttTopics)[MqttTopicKey]
