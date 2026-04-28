import { loadConfig, checkSystemStatus } from '../../../cityverse-operator/dist/index.js'
import type { CityverseConfig } from '../../../cityverse-operator/dist/index.js'
import type { ToolEnvelope } from '../envelope.js'

export async function handleSystemStatus(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const status = await checkSystemStatus(cfg)

  const capabilities = {
    vcReachable: status.vc.reachable,
    iotReachable: status.iot.reachable,
    dtReachable: status.dt.reachable,
    // these two are always available: in-memory, no service dependency
    analysisAvailable: true,
    docsSearchAvailable: true,
  }

  return {
    success: true,
    tool: 'cityverse.system.status',
    source: 'system',
    action: 'system_status',
    timestampUtc: status.checkedAt,
    result: { services: status, capabilities, profile: cfg.profile },
    errors: [],
  }
}
