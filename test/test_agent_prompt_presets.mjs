import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SYSTEM_PROMPT_PRESETS } from '../lib/pure.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('v0.3.1 (#294): SYSTEM_PROMPT_PRESETS содержит 6 выверенных пресетов', () => {
  const expectedKeys = ['technical_expert', 'tech_writer', 'concise', 'code_reviewer', 'architect', 'tutor']
  for (const k of expectedKeys) {
    const p = SYSTEM_PROMPT_PRESETS[k]
    assert.ok(p, `пресет ${k} должен существовать`)
    assert.equal(p.id, k)
    assert.ok(p.label && p.label.length > 0)
    assert.ok(p.desc && p.desc.length > 0)
    assert.ok(p.text && p.text.length > 0)
    assert.match(p.text, /[\u0400-\u04FF]/, 'текст промпта должен быть на русском')
    assert.ok(p.text.includes('русском языке'), 'промпт должен требовать русский язык')
  }
})

test('v0.3.1 (#294): client.js содержит опции для всех 6 пресетов в селекторе', () => {
  const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
  const clientSrc = fs.readFileSync(clientPath, 'utf-8')

  assert.ok(clientSrc.includes("value: 'technical_expert'"))
  assert.ok(clientSrc.includes("value: 'tech_writer'"))
  assert.ok(clientSrc.includes("value: 'concise'"))
  assert.ok(clientSrc.includes("value: 'code_reviewer'"))
  assert.ok(clientSrc.includes("value: 'architect'"))
  assert.ok(clientSrc.includes("value: 'tutor'"))
})
