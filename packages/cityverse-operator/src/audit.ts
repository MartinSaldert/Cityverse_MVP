import type { AuditEntry } from './types.js'

const MAX_AUDIT_ENTRIES = 1000
const auditLog: AuditEntry[] = []

export function recordAuditEntry(entry: AuditEntry): void {
  if (auditLog.length >= MAX_AUDIT_ENTRIES) {
    auditLog.shift()
  }
  auditLog.push(entry)
  process.stderr.write(JSON.stringify({ level: 'audit', ...entry }) + '\n')
}

export function getAuditLog(): readonly AuditEntry[] {
  return auditLog
}

export function clearAuditLog(): void {
  auditLog.length = 0
}
