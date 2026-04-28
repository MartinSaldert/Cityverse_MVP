import type { ServiceStatus } from './types.js'

const REQUEST_TIMEOUT_MS = 5000

export async function httpGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`HTTP ${response.status} from ${url}${body ? `: ${body}` : ''}`)
  }
  return response.json() as Promise<T>
}

export async function httpPost<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`HTTP ${response.status} from ${url}${text ? `: ${text}` : ''}`)
  }
  return response.json() as Promise<T>
}

export async function checkReachable(baseUrl: string, service: string): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    await httpGet(`${baseUrl}/health`)
    return { service, reachable: true, latencyMs: Date.now() - start }
  } catch (err) {
    return { service, reachable: false, error: (err as Error).message }
  }
}
