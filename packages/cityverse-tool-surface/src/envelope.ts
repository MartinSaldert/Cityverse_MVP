import type { ReadResult, CommandResult } from '../../cityverse-operator/dist/index.js'

export interface ToolEnvelope<T = unknown> {
  success: boolean
  tool: string
  source: string
  action: string
  timestampUtc: string
  result: T | null
  errors: string[]
  meta?: Record<string, unknown>
}

export function fromReadResult<T>(tool: string, r: ReadResult<T>): ToolEnvelope<T> {
  return {
    success: r.success,
    tool,
    source: r.source,
    action: r.action,
    timestampUtc: r.timestampUtc,
    result: r.data,
    errors: r.error ? [r.error] : [],
  }
}

export function fromCommandResult<T>(tool: string, r: CommandResult<T>): ToolEnvelope<T> {
  return {
    success: r.success,
    tool,
    source: r.target.service,
    action: r.action,
    timestampUtc: r.timestampUtc,
    result: r.result,
    errors: r.errors.map(e => e.message),
    meta: { commandId: r.commandId, actor: r.actor },
  }
}

export function errorEnvelope(tool: string, action: string, source: string, message: string): ToolEnvelope {
  return {
    success: false,
    tool,
    source,
    action,
    timestampUtc: new Date().toISOString(),
    result: null,
    errors: [message],
  }
}
