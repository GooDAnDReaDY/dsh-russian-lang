import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

test('v0.3.22: package.json and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.3.22')
  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  const head = changelog.split('\n').find((line) => line.startsWith('## ')) || ''
  assert.ok(head.includes('0.3.22'), `CHANGELOG head must mention 0.3.22, got: ${head}`)
})

test('v0.3.22: lib/index.js imports cleanly without throwing volatile error', async () => {
  const mod = await import('../lib/index.js')
  assert.ok(mod, 'lib/index.js must export an object')
  assert.equal(typeof mod.apply, 'function')
  assert.equal(typeof mod.plainConfig, 'function')
  assert.equal(mod.name, '@goodandready/dsh-russian-lang')
  assert.ok(mod.Config, 'Config schema must be exported')
  assert.ok(mod.Config.dict, 'Config schema must have dict property')

  const expectedKeys = [
    'enabled',
    'overrides',
    'typography',
    'agentPrompt',
    'agentPromptPreset',
    'slashAliases',
    'quickSwitch',
    'translateEngine',
    'localApiUrl'
  ]
  for (const k of expectedKeys) {
    assert.ok(k in mod.Config.dict, `Config must contain ${k}`)
  }
})
