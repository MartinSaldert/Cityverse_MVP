import { z } from 'zod'
import { loadConfig, searchDocs } from '../../../cityverse-operator/dist/index.js'
import type { CityverseConfig } from '../../../cityverse-operator/dist/index.js'
import { errorEnvelope } from '../envelope.js'
import type { ToolEnvelope } from '../envelope.js'

const DocsSearchInput = z.object({
  query: z.string().min(1, 'query must be a non-empty string'),
})

export async function handleDocsSearch(
  input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const parsed = DocsSearchInput.safeParse(input)
  if (!parsed.success) {
    return errorEnvelope(
      'cityverse.docs.search',
      'docs_search',
      'docs',
      parsed.error.message,
    )
  }

  const cfg = config ?? loadConfig()
  const results = await searchDocs(cfg.docsRoot, parsed.data.query)

  return {
    success: true,
    tool: 'cityverse.docs.search',
    source: 'docs',
    action: 'docs_search',
    timestampUtc: new Date().toISOString(),
    result: { query: parsed.data.query, matches: results, totalFiles: results.length },
    errors: [],
  }
}
