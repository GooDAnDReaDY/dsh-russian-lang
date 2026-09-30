import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPluginDictionaries } from '../lib/locales.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

test('Issue #432: dsh-context has DNA mode translations with placeholder parity', () => {
  const plugins = getPluginDictionaries()
  const ru = plugins['dsh-context']
  const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'plugins-en.json'), 'utf8'))['dsh-context']

  assert.equal(ru['trend.dna'], 'Режим ДНК')
  assert.ok(ru['trend.dnaTip'].includes('отпечаток контекста'))
  assert.equal(ru['trend.dnaItem'], '{label}: {n}')

  for (const k of ['trend.dna', 'trend.dnaTip', 'trend.dnaItem']) {
    const enPh = (en[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).sort()
    const ruPh = (ru[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).sort()
    assert.deepEqual(ruPh, enPh, `Placeholder parity failed for ${k}`)
  }
})

test('Issue #432: dsh-key-rotation has TPM and RPM translations with placeholder parity', () => {
  const plugins = getPluginDictionaries()
  const ru = plugins['dsh-key-rotation']
  const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'plugins-en.json'), 'utf8'))['dsh-key-rotation']

  assert.equal(ru['tpmTitle'], 'токенов/мин: использовано {u}, осталось {r}')
  assert.equal(ru['rpmLimitLabel'], 'Лимит частоты (RPM)')
  assert.equal(ru['tpmLimitLabel'], 'Лимит частоты (TPM)')

  for (const k of ['tpmTitle', 'rpmLimitLabel', 'tpmLimitLabel']) {
    const enPh = (en[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).sort()
    const ruPh = (ru[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).sort()
    assert.deepEqual(ruPh, enPh, `Placeholder parity failed for ${k}`)
  }
})

test('Issue #432: config-manager has managed desktop profile translations with placeholder parity', () => {
  const plugins = getPluginDictionaries()
  const ru = plugins['config-manager']
  const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'plugins-en.json'), 'utf8'))['config-manager']

  assert.ok(ru['profiles.launch.managed'].includes('DeepSeek Harness Desktop'))
  assert.ok(ru['profiles.error.managedProfile'].includes('DeepSeek Harness Desktop'))

  for (const k of ['profiles.launch.managed', 'profiles.error.managedProfile']) {
    const enPh = (en[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).sort()
    const ruPh = (ru[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).sort()
    assert.deepEqual(ruPh, enPh, `Placeholder parity failed for ${k}`)
  }
})
