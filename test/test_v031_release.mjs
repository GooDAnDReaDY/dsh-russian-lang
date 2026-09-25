import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
  plural,
  formatDate,
  formatCompactNumber,
  formatTokens,
  bilingualCommandMatch,
  filterCommands,
  findTranslationKey,
  ERROR_MAP,
  SYSTEM_PROMPT_PRESETS,
  fill
} from '../lib/pure.js'

test('release v0.3.1: package.json and CHANGELOG consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.version, '0.3.11')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.bin && pkg.bin['dsh-i18n'] === './bin/dsh-i18n.mjs')

  const changelog = fs.readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8')
  const head = changelog.split('\n').find((line) => line.startsWith('## ')) || ''
  assert.ok(head.includes('0.3.11'), `CHANGELOG head must mention 0.3.3, got: ${head}`)
})

test('release v0.3.1: pure.js linguistics and formatters', () => {
  // Pluralization
  assert.equal(plural(1, 'файл', 'файла', 'файлов', true), '1 файл')
  assert.equal(plural(2, 'файл', 'файла', 'файлов', true), '2 файла')
  assert.equal(plural(5, 'файл', 'файла', 'файлов', true), '5 файлов')

  // Formatters (Intl uses non-breaking space \u00A0)
  assert.equal(formatCompactNumber(1500), '1,5\u00A0тыс.')
  assert.equal(formatCompactNumber(1200000), '1,2\u00A0млн')
  assert.equal(formatTokens(1500), '1\u00A0500 токенов')
  assert.equal(formatTokens(1500, true), '1,5\u00A0тыс. токенов')

  // Template tags
  assert.equal(fill('{n} {n:plural:файл,файла,файлов}', { n: 3 }), '3 файла')
  assert.equal(fill('{v:compact}', { v: 2500000 }), '2,5\u00A0млн')
  assert.equal(fill('{t:tokens}', { t: 42 }), '42 токена')
})

test('release v0.3.1: bilingual command palette search', () => {
  const item = { id: 'cmd.deploy', title: 'Развернуть проект', enTitle: 'Deploy Project' }
  assert.equal(bilingualCommandMatch('развер', item).matched, true)
  assert.equal(bilingualCommandMatch('deploy', item).matched, true)
  assert.equal(bilingualCommandMatch('hfpdthyenm', item).matched, true) // layout switch
})

test('release v0.3.1: error map and agent presets', () => {
  assert.ok(ERROR_MAP.FETCH_FAILED)
  assert.ok(ERROR_MAP.CORS_ERROR)
  assert.ok(ERROR_MAP.WS_CLOSED)
  assert.ok(ERROR_MAP.QUOTA_EXCEEDED)
  assert.ok(ERROR_MAP.CONTEXT_OVERFLOW)
  assert.ok(ERROR_MAP.MODEL_NOT_FOUND)

  assert.ok(SYSTEM_PROMPT_PRESETS.code_reviewer)
  assert.ok(SYSTEM_PROMPT_PRESETS.architect)
  assert.ok(SYSTEM_PROMPT_PRESETS.tutor)
})

test('release v0.3.1: ecosystem and bin tools exist', () => {
  const eco = JSON.parse(fs.readFileSync(new URL('../ecosystem-plugins.json', import.meta.url), 'utf8'))
  assert.ok(Array.isArray(eco))
  assert.ok(eco.length >= 60)

  assert.ok(fs.existsSync(new URL('../bin/dsh-i18n.mjs', import.meta.url)))
  assert.ok(fs.existsSync(new URL('../lefthook.yml', import.meta.url)))
})
