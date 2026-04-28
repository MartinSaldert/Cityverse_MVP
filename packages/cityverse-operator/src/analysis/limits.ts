import type { UnsupportedClaim } from './types.js'

export const KNOWN_LIMITATIONS: string[] = [
  'DT scene impact unavailable — DT service is not implemented.',
  'Generator dispatch changes are unsupported in the current analysis engine.',
  'Building-level entity deltas require per-building data not available in Phase 2.',
  'Relative demand projection is estimated from the current model, not historical replay.',
  'This result reflects a simplified energy and weather model.',
  'Weather nudge is cumulative in the live system; in analysis it is applied once to the captured baseline.',
  'Wind output is projected using a cubic speed approximation (P ∝ v³ below rated speed, capped at 4× baseline). Near-rated or above-rated speeds may still be overestimated. Zero or below-cut-in baseline cases return null output with a limitation note.',
  'Solar output uses a simplified sin-curve daylight model (06:00–20:00 window).',
]

export const UNSUPPORTED_CLAIMS: UnsupportedClaim[] = [
  {
    claim: 'Generator start/stop dispatch changes',
    reason: 'Generator dispatch is not exposed in the Phase 2 analysis engine.',
  },
  {
    claim: 'DT scene and visual projections',
    reason: 'DT service is not implemented. No scene-level or twin-graph impact is available.',
  },
  {
    claim: 'Building-level occupancy and power overrides',
    reason: 'Per-building modifiers are not implemented in the Phase 2 analysis engine.',
  },
  {
    claim: 'District-level modifiers',
    reason: 'District modifiers are not implemented in the Phase 2 analysis engine.',
  },
  {
    claim: 'Historical replay-based demand projection',
    reason: 'Demand is held constant from baseline. Historical replay is a Phase 3+ feature.',
  },
]
