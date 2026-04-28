import type { CityverseConfig, CommandResult, ReadResult } from './types.js'

const NOT_IMPLEMENTED = 'DT service is not yet implemented. This stub documents the intended interface for Phase 1 DT integration.'

function dtStub(action: string): ReadResult {
  return {
    success: false,
    source: 'dt',
    action,
    timestampUtc: new Date().toISOString(),
    data: null,
    error: NOT_IMPLEMENTED,
  }
}

function dtCommandStub(action: string, actor: string): CommandResult {
  return {
    success: false,
    commandId: `cmd-dt-stub-${Date.now()}`,
    timestampUtc: new Date().toISOString(),
    action,
    actor,
    target: { service: 'dt', entityId: null },
    payload: {},
    result: null,
    errors: [{ code: 'not_implemented', message: NOT_IMPLEMENTED }],
  }
}

// --- Reads (stubs pending DT service) ---

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getDtSceneState(_config: CityverseConfig): Promise<ReadResult> {
  return dtStub('get_scene_state')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getDtViewState(_config: CityverseConfig): Promise<ReadResult> {
  return dtStub('get_view_state')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getDtEntityTwin(_config: CityverseConfig, _entityId: string): Promise<ReadResult> {
  return dtStub('get_entity_twin')
}

// --- Commands (stubs pending DT service) ---

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function focusDtEntity(_config: CityverseConfig, _entityId: string, actor: string): Promise<CommandResult> {
  return dtCommandStub('focus_entity', actor)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function setDtViewMode(_config: CityverseConfig, _mode: string, actor: string): Promise<CommandResult> {
  return dtCommandStub('set_view_mode', actor)
}
