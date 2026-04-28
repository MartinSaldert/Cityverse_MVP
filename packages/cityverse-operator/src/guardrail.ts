import type { CityverseConfig } from './types.js'

export const GUARDRAIL_POLICY_VERSION = '1.0.0'

export type ActionClass = 'always_allowed' | 'safe_control' | 'blocked'
export type BlockedReason = 'not_implemented' | 'dangerous_commands_disabled' | 'policy_denied'

export interface ActionPolicy {
  toolName: string
  actionClass: ActionClass
  description: string
  requiresService?: 'vc' | 'iot' | 'dt'
  blockedReason?: BlockedReason
  blockedMessage?: string
}

export interface AllowedActionResult {
  allowed: true
  toolName: string
  actionClass: ActionClass
  policyVersion: string
}

export interface BlockedActionResult {
  allowed: false
  toolName: string
  actionClass: 'blocked'
  blockedReason: BlockedReason
  blockedMessage: string
  policyVersion: string
}

export type PolicyCheckResult = AllowedActionResult | BlockedActionResult

export const ACTION_POLICY_TABLE: ActionPolicy[] = [
  // System reads — always allowed
  { toolName: 'cityverse.system.status', actionClass: 'always_allowed', description: 'Read service reachability and capabilities' },

  // VC reads — always allowed
  { toolName: 'cityverse.vc.get_state', actionClass: 'always_allowed', description: 'Read composite VC state', requiresService: 'vc' },
  { toolName: 'cityverse.vc.get_clock', actionClass: 'always_allowed', description: 'Read simulation clock', requiresService: 'vc' },
  { toolName: 'cityverse.vc.get_weather', actionClass: 'always_allowed', description: 'Read VC weather state', requiresService: 'vc' },
  { toolName: 'cityverse.vc.get_energy', actionClass: 'always_allowed', description: 'Read VC energy state', requiresService: 'vc' },
  { toolName: 'cityverse.vc.get_city', actionClass: 'always_allowed', description: 'Read VC city aggregate', requiresService: 'vc' },
  { toolName: 'cityverse.vc.get_buildings', actionClass: 'always_allowed', description: 'Read VC building demand', requiresService: 'vc' },

  // VC controls — safe, gated through policy (allowed by default)
  { toolName: 'cityverse.vc.pause', actionClass: 'safe_control', description: 'Pause VC simulation clock', requiresService: 'vc' },
  { toolName: 'cityverse.vc.resume', actionClass: 'safe_control', description: 'Resume VC simulation clock', requiresService: 'vc' },
  { toolName: 'cityverse.vc.set_speed', actionClass: 'safe_control', description: 'Set VC simulation speed multiplier', requiresService: 'vc' },
  { toolName: 'cityverse.vc.set_time', actionClass: 'safe_control', description: 'Set VC simulation date/time (affects solar output)', requiresService: 'vc' },
  { toolName: 'cityverse.vc.weather_nudge', actionClass: 'safe_control', description: 'Apply VC weather bias nudge — cumulative, use with care', requiresService: 'vc' },

  // IOT reads — always allowed
  { toolName: 'cityverse.iot.get_weather', actionClass: 'always_allowed', description: 'Read IOT projected weather state', requiresService: 'iot' },
  { toolName: 'cityverse.iot.get_energy', actionClass: 'always_allowed', description: 'Read IOT projected energy state', requiresService: 'iot' },
  { toolName: 'cityverse.iot.get_city', actionClass: 'always_allowed', description: 'Read IOT projected city aggregate', requiresService: 'iot' },
  { toolName: 'cityverse.iot.get_buildings', actionClass: 'always_allowed', description: 'Read IOT projected building demand', requiresService: 'iot' },
  { toolName: 'cityverse.iot.get_ops_summary', actionClass: 'always_allowed', description: 'Read IOT ingestion flow health', requiresService: 'iot' },

  // Analysis — always allowed (in-memory, non-live)
  { toolName: 'cityverse.analysis.capture_baseline', actionClass: 'always_allowed', description: 'Snapshot current state into a baseline (non-mutating)' },
  { toolName: 'cityverse.analysis.project_branch', actionClass: 'always_allowed', description: 'Evaluate a scenario branch in memory (no live mutations)' },
  { toolName: 'cityverse.analysis.compare', actionClass: 'always_allowed', description: 'Compare baseline vs projected branch' },

  // Docs — always allowed (local files, no service dependency)
  { toolName: 'cityverse.docs.search', actionClass: 'always_allowed', description: 'Search Cityverse documentation' },

  // DT operations — blocked (DT service not implemented)
  { toolName: 'cityverse.dt.get_scene', actionClass: 'blocked', description: 'Read DT scene state', blockedReason: 'not_implemented', blockedMessage: 'DT service is not implemented. Scene queries are unavailable in Phase 3.' },
  { toolName: 'cityverse.dt.get_view', actionClass: 'blocked', description: 'Read DT view state', blockedReason: 'not_implemented', blockedMessage: 'DT service is not implemented. View queries are unavailable in Phase 3.' },
  { toolName: 'cityverse.dt.focus_entity', actionClass: 'blocked', description: 'Focus a DT entity', blockedReason: 'not_implemented', blockedMessage: 'DT service is not implemented. Entity focus is unavailable in Phase 3.' },
  { toolName: 'cityverse.dt.set_view_mode', actionClass: 'blocked', description: 'Set DT view mode', blockedReason: 'not_implemented', blockedMessage: 'DT service is not implemented. View mode changes are unavailable in Phase 3.' },

  // Generator dispatch — blocked (not implemented in any phase)
  { toolName: 'cityverse.vc.generator_start', actionClass: 'blocked', description: 'Start a backup generator', blockedReason: 'not_implemented', blockedMessage: 'Generator dispatch commands are not supported. Use weather_nudge or set_time to model alternative energy scenarios.' },
  { toolName: 'cityverse.vc.generator_stop', actionClass: 'blocked', description: 'Stop a backup generator', blockedReason: 'not_implemented', blockedMessage: 'Generator dispatch commands are not supported. Use weather_nudge or set_time to model alternative energy scenarios.' },

  // Building and district overrides — blocked (not implemented)
  { toolName: 'cityverse.vc.set_building_override', actionClass: 'blocked', description: 'Override building occupancy or power', blockedReason: 'not_implemented', blockedMessage: 'Building-level overrides are not implemented in the current operator.' },
  { toolName: 'cityverse.vc.set_district_modifier', actionClass: 'blocked', description: 'Apply district-level modifier', blockedReason: 'not_implemented', blockedMessage: 'District modifiers are not implemented in the current operator.' },
]

const POLICY_INDEX = new Map<string, ActionPolicy>(
  ACTION_POLICY_TABLE.map(p => [p.toolName, p])
)

export function checkActionPolicy(toolName: string, _config: CityverseConfig): PolicyCheckResult {
  const policy = POLICY_INDEX.get(toolName)

  if (!policy) {
    return {
      allowed: false,
      toolName,
      actionClass: 'blocked',
      blockedReason: 'policy_denied',
      blockedMessage: `Tool '${toolName}' is not registered in the action policy table. Add it explicitly before use.`,
      policyVersion: GUARDRAIL_POLICY_VERSION,
    }
  }

  if (policy.actionClass === 'blocked') {
    return {
      allowed: false,
      toolName,
      actionClass: 'blocked',
      blockedReason: policy.blockedReason!,
      blockedMessage: policy.blockedMessage!,
      policyVersion: GUARDRAIL_POLICY_VERSION,
    }
  }

  return {
    allowed: true,
    toolName,
    actionClass: policy.actionClass,
    policyVersion: GUARDRAIL_POLICY_VERSION,
  }
}
