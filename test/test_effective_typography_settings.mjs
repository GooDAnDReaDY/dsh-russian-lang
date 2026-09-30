import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const clientCode = fs.readFileSync(clientPath, 'utf-8')

test('Issue #416: client.js defines unified resolveTypography with opt-in defaults', () => {
  assert.ok(
    clientCode.includes('const resolveTypography = (val) =>'),
    'client.js must define resolveTypography'
  )
  assert.ok(
    clientCode.includes('enabled: t.enabled === true'),
    'resolveTypography must treat enabled as opt-in (enabled === true)'
  )
  assert.ok(
    clientCode.includes('liveInput: t.liveInput === true'),
    'resolveTypography must treat liveInput as opt-in (liveInput === true)'
  )
  assert.ok(
    clientCode.includes('checkbox(effectiveTypo.liveInput && ruActive'),
    'liveInput checkbox must use effectiveTypo.liveInput'
  )
})

test('Issue #416: Empty and partial settings resolve to consistent disabled state in UI and runtime', () => {
  const resolveTypography = (val) => {
    const t = (val && val.typography) || {}
    return {
      enabled: t.enabled === true,
      liveInput: t.liveInput === true,
      yo: t.yo === true
    }
  }

  // 1. Empty config {} -> all false
  const empty = resolveTypography({})
  assert.equal(empty.enabled, false)
  assert.equal(empty.liveInput, false)
  assert.equal(empty.yo, false)

  // 2. Partial config { typography: { enabled: true } } -> only enabled is true
  const partial = resolveTypography({ typography: { enabled: true } })
  assert.equal(partial.enabled, true)
  assert.equal(partial.liveInput, false)
  assert.equal(partial.yo, false)

  // 3. Explicit { typography: { liveInput: true } }
  const live = resolveTypography({ typography: { liveInput: true } })
  assert.equal(live.enabled, false)
  assert.equal(live.liveInput, true)
  assert.equal(live.yo, false)
})
