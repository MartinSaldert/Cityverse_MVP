import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import type { CityverseConfig } from './types.js'

export function loadConfig(): CityverseConfig {
  return {
    vcBaseUrl: process.env.CITYVERSE_VC_BASE_URL ?? 'http://localhost:3001',
    iotBaseUrl: process.env.CITYVERSE_IOT_BASE_URL ?? 'http://localhost:3002',
    dtBaseUrl: process.env.CITYVERSE_DT_BASE_URL ?? 'http://localhost:3003',
    docsRoot: process.env.CITYVERSE_DOCS_ROOT ?? defaultDocsRoot(),
    profile: process.env.CITYVERSE_PROFILE ?? 'local',
    enableDangerousCommands: process.env.CITYVERSE_ENABLE_DANGEROUS_COMMANDS === 'true',
  }
}

// Resolves docs/ relative to this package's position in the monorepo.
// dist/config.js → packages/cityverse-operator/dist → packages/cityverse-operator → packages → repo root → docs
function defaultDocsRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'docs')
}
