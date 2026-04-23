import type { BuildingTelemetryPayload } from '@cityverse/contracts'

let latestBuildings: BuildingTelemetryPayload | null = null

export function setLatestBuildings(payload: BuildingTelemetryPayload): void {
  latestBuildings = payload
}

export function getLatestBuildings(): BuildingTelemetryPayload | null {
  return latestBuildings
}

export function resetLatestBuildings(): void {
  latestBuildings = null
}
