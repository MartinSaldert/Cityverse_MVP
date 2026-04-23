import type { EnergySummary } from '@cityverse/contracts'

let latestEnergy: EnergySummary | null = null

export function setLatestEnergy(summary: EnergySummary): void {
  latestEnergy = summary
}

export function getLatestEnergy(): EnergySummary | null {
  return latestEnergy
}

export function resetLatestEnergy(): void {
  latestEnergy = null
}
