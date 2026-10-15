import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.46: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.46')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('UI keys'))
  assert.ok(pkg.files.includes('supported-inventory.json'), 'files must include supported-inventory.json')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.46'), 'CHANGELOG must mention 0.3.46')
  assert.ok(cl.includes('#492'), 'CHANGELOG must mention Gitea #492')
  assert.ok(cl.includes('#500'), 'CHANGELOG must mention Gitea #500')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.'), 'README npm badge must be present')
  assert.ok(readme.includes('10400') || readme.includes('10368'), 'README keys badge must be present')
})

test('v0.3.46: memoryMeter settings localization (Refs: #492)', () => {
  const mm = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '71-memory-meter.json'), 'utf8'))
  assert.ok(mm.memoryMeter, 'memoryMeter namespace must exist')
  assert.equal(mm.memoryMeter.cfgTitle, 'Настройки Memory Meter')
  assert.ok(mm.memoryMeter.cfg_trackTools, 'cfg_trackTools must exist')
  assert.ok(mm.memoryMeter.cfgSave, 'cfgSave must exist')
})

test('v0.3.46: supported-inventory has 10,368 total keys and 109 namespaces', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.ok(inv.metrics.total_keys >= 10368)
  assert.ok(inv.metrics.total_namespaces >= 109)
})
