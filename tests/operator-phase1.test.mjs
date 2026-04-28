import test from 'node:test'
import assert from 'node:assert/strict'

import { loadConfig, searchDocs } from '../packages/cityverse-operator/dist/index.js'

test('operator config resolves docs root to Cityverse_MVP/docs by default', () => {
  const previous = process.env.CITYVERSE_DOCS_ROOT
  delete process.env.CITYVERSE_DOCS_ROOT

  try {
    const config = loadConfig()
    assert.match(config.docsRoot, /Cityverse_MVP\/docs$/)
  } finally {
    if (previous === undefined) delete process.env.CITYVERSE_DOCS_ROOT
    else process.env.CITYVERSE_DOCS_ROOT = previous
  }
})

test('operator docs search finds Cityverse docs from default config', async () => {
  const previous = process.env.CITYVERSE_DOCS_ROOT
  delete process.env.CITYVERSE_DOCS_ROOT

  try {
    const config = loadConfig()
    const results = await searchDocs(config.docsRoot, 'IOT')
    assert.ok(results.length > 0, 'expected docs search results for IOT')
    assert.ok(results.some(r => r.filename === 'CURRENT_IMPLEMENTATION_STATUS.md'))
  } finally {
    if (previous === undefined) delete process.env.CITYVERSE_DOCS_ROOT
    else process.env.CITYVERSE_DOCS_ROOT = previous
  }
})
