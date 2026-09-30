import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

test('v0.3.25: package.json and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.25')
  assert.ok(pkg.engines && pkg.engines.dsh === '^0.2.0-rc.2', 'engines.dsh must be declared for DSH Market')

  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(changelog.includes('## 0.3.25'), 'CHANGELOG must mention 0.3.25')
})

test('v0.3.25: Config schema exports layoutConversion', async () => {
  const mod = await import('../lib/index.js')
  assert.ok(mod.Config, 'Config schema must be exported')
  assert.ok(mod.Config.dict, 'Config schema must have dict property')
  assert.ok('layoutConversion' in mod.Config.dict, 'Config must contain layoutConversion')
})

test('v0.3.25: client.js contains optional UI feature controls and slot disposer', () => {
  const clientJs = fs.readFileSync(path.join(ROOT, 'lib/client.js'), 'utf8')
  assert.ok(clientJs.includes('quickSwitch'), 'client.js must reference quickSwitch')
  assert.ok(clientJs.includes('layoutConversion'), 'client.js must reference layoutConversion')
  assert.ok(clientJs.includes('badgeSmartUxOff'), 'client.js must contain badgeSmartUxOff')
  assert.ok(clientJs.includes('smartUxActive'), 'client.js must contain smartUxActive logic')
  assert.ok(clientJs.includes('return () =>'), 'registerPluginsItem must return slot disposer')
})
