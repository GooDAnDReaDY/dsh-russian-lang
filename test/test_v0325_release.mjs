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
  assert.equal(pkg.version, '0.3.25')
  assert.ok(pkg.engines && pkg.engines.dsh === '^0.2.0-rc.2', 'engines.dsh must be declared for DSH Market')

  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  const head = changelog.split('\n').find((line) => line.startsWith('## ')) || ''
  assert.ok(head.includes('0.3.25'), `CHANGELOG head must mention 0.3.25, got: ${head}`)
})

test('v0.3.25: Config schema exports layoutConversion', async () => {
  const mod = await import('../lib/index.js')
  assert.ok(mod.Config, 'Config schema must be exported')
  assert.ok(mod.Config.dict, 'Config schema must have dict property')
  assert.ok('layoutConversion' in mod.Config.dict, 'Config must contain layoutConversion')
  assert.ok('quickSwitch' in mod.Config.dict, 'Config must contain quickSwitch')
})

test('v0.3.25: client.js contains optional UI feature controls and slot disposer', () => {
  const clientJs = fs.readFileSync(path.join(ROOT, 'lib/client.js'), 'utf8')

  // 1. Quick language switch optional check
  assert.ok(clientJs.includes("snap.value?.quickSwitch === false"), 'QuickLangSwitch must check quickSwitch setting')

  // 2. Layout conversion optional check
  assert.ok(clientJs.includes("layoutConversion !== false"), 'Layout conversion must check layoutConversion setting')

  // 3. Smart UX dynamic badge
  assert.ok(clientJs.includes("smartUxActive ? 'badgeSmartUx' : 'badgeSmartUxOff'"), 'Smart UX badge must toggle active/off')

  // 4. Slot disposer return
  assert.ok(clientJs.includes("return ctx.slots.inject('plugins.item'"), 'registerPluginsItem must return injection disposer')
})
