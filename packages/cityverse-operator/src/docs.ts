import { readdir, readFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import type { DocsSearchResult } from './types.js'

const EXCERPT_CONTEXT_CHARS = 120
const MAX_EXCERPTS_PER_FILE = 5

export async function searchDocs(docsRoot: string, query: string): Promise<DocsSearchResult[]> {
  const pattern = new RegExp(escapeRegex(query), 'gi')

  let filenames: string[]
  try {
    filenames = (await readdir(docsRoot)).filter(f => extname(f) === '.md')
  } catch {
    return []
  }

  const results: DocsSearchResult[] = []

  await Promise.all(
    filenames.map(async (filename) => {
      let content: string
      try {
        content = await readFile(join(docsRoot, filename), 'utf8')
      } catch {
        return
      }

      const excerpts: string[] = []
      let match: RegExpExecArray | null
      pattern.lastIndex = 0

      while ((match = pattern.exec(content)) !== null && excerpts.length < MAX_EXCERPTS_PER_FILE) {
        const start = Math.max(0, match.index - EXCERPT_CONTEXT_CHARS)
        const end = Math.min(content.length, match.index + match[0].length + EXCERPT_CONTEXT_CHARS)
        excerpts.push(content.slice(start, end).replace(/\n+/g, ' ').trim())
      }

      if (excerpts.length > 0) {
        results.push({ filename, matchCount: excerpts.length, excerpts })
      }
    })
  )

  results.sort((a, b) => b.matchCount - a.matchCount)
  return results
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
