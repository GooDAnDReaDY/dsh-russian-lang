import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.4.1: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.4.1')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('11,598'), 'Description must reflect 11,598 keys')
  assert.ok(pkg.files.includes('supported-inventory.json'), 'files must include supported-inventory.json')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('0.4.1'), 'CHANGELOG must mention 0.4.1')
  assert.ok(cl.includes('#510'), 'CHANGELOG must mention issue #510')
  assert.ok(cl.includes('#27'), 'CHANGELOG must mention GitHub issue #27')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.4.1'), 'README npm badge must be v0.4.1')
  assert.ok(readme.includes('11598'), 'README keys badge must be 11598')
})

test('v0.4.1: supported-inventory has 11,598 total keys, 117 namespaces and 85 supported plugins', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.equal(inv.core.supported_version, '0.2.1-rc.2')
  assert.equal(inv.metrics.total_keys, 11598)
  assert.equal(inv.metrics.core_keys, 2728)
  assert.equal(inv.metrics.plugin_keys, 8870)
  assert.equal(inv.metrics.total_namespaces, 117)
  assert.equal(inv.metrics.core_namespaces, 63)
  assert.equal(inv.metrics.plugin_namespaces, 54)
  assert.equal(Object.keys(inv.supported_plugins).length, 85)
  assert.equal(inv.headless_plugins.length, 7)
})

test('v0.4.1: Issue #510 - plugin enabled by default in schema and client template', () => {
  const indexJs = fs.readFileSync(path.join(ROOT, 'lib/index.js'), 'utf8')
  assert.ok(indexJs.includes('z.boolean().default(true)'), 'Schema must default enabled to true')

  const clientTpl = fs.readFileSync(path.join(ROOT, 'lib/client.template.js'), 'utf8')
  assert.ok(clientTpl.includes('value.enabled !== false'), 'Client tryBoot must treat undefined enabled as true')
  assert.ok(clientTpl.includes('value.enabled !== undefined ? value.enabled : true'), 'Client syncFlag must default to true')
})

test('v0.4.1: Issue GH-27 - branch and fork actions naturally translated', () => {
  const conv = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru/02-conversation.json'), 'utf8')).conversation
  assert.equal(conv['message.branch'], 'Создать ветку в новом диалоге')
  assert.equal(conv['action.fork'], 'Создать ветку диалога с этой реплики')

  // Verified in ru/02-conversation.json
})

test('v0.4.1: OpenCode and Ollama Cloud desktop provider translations present and valid', () => {
  const opencode = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/90-opencode.json'), 'utf8'))['settings.opencode']
  assert.ok(opencode, 'settings.opencode must exist in ru-plugins/90-opencode.json')
  assert.equal(opencode.nav, 'OpenCode')
  assert.equal(opencode.title, 'OpenCode')
  assert.ok(Object.keys(opencode).length >= 180, 'Must have >= 180 keys for opencode')

  const ollama = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/91-ollama.json'), 'utf8'))['settings.ollama']
  assert.ok(ollama, 'settings.ollama must exist in ru-plugins/91-ollama.json')
  assert.equal(ollama.nav, 'Ollama Cloud')
  assert.equal(ollama.title, 'Ollama Cloud')
  assert.ok(Object.keys(ollama).length >= 150, 'Must have >= 150 keys for ollama')

  // Also check built lib locales
  const opencodeLib = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/90-opencode.json'), 'utf8'))['settings.opencode']
  assert.equal(opencodeLib.nav, 'OpenCode')
  const ollamaLib = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/91-ollama.json'), 'utf8'))['settings.ollama']
  assert.equal(ollamaLib.nav, 'Ollama Cloud')
})

test('v0.4.1: banner image exists and reflects 11,598 keys', () => {
  const bannerPath = path.join(ROOT, 'docs/media/banner.jpg')
  assert.ok(fs.existsSync(bannerPath), 'Banner image must exist')
  const stat = fs.statSync(bannerPath)
  assert.ok(stat.size > 50000, 'Banner image size must be > 50 KB')
})
