import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../../..')
const wrapperScript = path.resolve(projectRoot, 'scripts/syntra-avatar-turn.mjs')

export interface SyntraPromptResult {
  replyText: string
  bridgeResult: unknown | null
}

function tryParseBridgeResult(stderr: string): unknown | null {
  const jsonStart = stderr.indexOf('{')
  if (jsonStart === -1) return null

  try {
    return JSON.parse(stderr.slice(jsonStart))
  } catch {
    return null
  }
}

export function runSyntraPrompt(prompt: string): Promise<SyntraPromptResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [wrapperScript, prompt], {
      cwd: projectRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8')
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8')
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Syntra wrapper exited with code ${code ?? 'unknown'}`))
        return
      }

      const replyText = stdout.trim()
      if (!replyText) {
        reject(new Error(`Syntra wrapper returned no reply text. STDERR:\n${stderr}`))
        return
      }

      resolve({
        replyText,
        bridgeResult: tryParseBridgeResult(stderr),
      })
    })
  })
}
