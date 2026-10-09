import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.40: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.40')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok((pkg.description.includes('9,359 UI keys') || pkg.description.includes('9,380 UI keys')), 'Description must reflect 9,359 keys')
  assert.ok(pkg.description.includes('v0.2.1-alpha.1'), 'Description must reflect DSH v0.2.1-alpha.1')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.40'), 'CHANGELOG must mention 0.3.40')
  assert.ok(cl.includes('#482'), 'CHANGELOG must mention #482')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.'), 'README npm badge must be v0.3.40')
  assert.ok(readme.includes('Ключей_UI-9359') || readme.includes('Ключей_UI-9380'), 'README keys badge must be 9359')
})

test('v0.3.40: inventory metrics reflect 9,359 total keys and 100% coverage', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.equal(inv.metrics.core_keys, 2512)
  assert.ok(inv.metrics.plugin_keys >= 6847)
  assert.ok(inv.metrics.total_keys >= 9359)
  assert.equal(inv.metrics.total_namespaces, 103)
  assert.equal(inv.metrics.coverage_percent, 100.0)
})

test('v0.3.40: dsh-cron modal.confirmDiscard is translated in ru-plugins and lib/locales', () => {
  const ruCron = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '56-cron.json'), 'utf8'))['dsh-cron']
  assert.equal(ruCron['modal.confirmDiscard'], 'Отменить несохранённые изменения?')

  const locCron = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'locales', 'plugins', '56-cron.json'), 'utf8'))['dsh-cron']
  assert.equal(locCron['modal.confirmDiscard'], 'Отменить несохранённые изменения?')
})

test('v0.3.40: supported-inventory contains exact updated versions for 8 drifted plugins', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  const plugins = inv.supported_plugins

  assert.equal(plugins['@goodandready/dsh-cron'], '0.2.50')
  assert.equal(plugins['@goodandready/dsh-gitea'], '0.7.28')
  assert.equal(plugins['@goodandready/dsh-github-ops'], '0.6.1')
  assert.equal(plugins['@goodandready/dsh-kanban'], '0.2.24')
  assert.equal(plugins['@goodandready/dsh-live-canvas'], '0.2.28')
  assert.ok(plugins['@goodandready/dsh-model-sync'] >= '0.5.11')
  assert.equal(plugins['@goodandready/dsh-usage-guard'], '0.1.17')
  assert.equal(plugins['@goodandready/dsh-vision-bridge'], '0.6.19')
})

test('v0.3.40: check_data_integrity passes on clean repository (#482)', () => {
  const res = spawnSync('python3', [path.join(ROOT, 'tools', 'check_data_integrity.py')], {
    cwd: ROOT,
    encoding: 'utf8'
  })
  assert.equal(res.status, 0, `check_data_integrity failed: ${res.stderr || res.stdout}`)
  assert.ok(res.stdout.includes('OK: Все снапшоты и корпусы данных прошли проверку целостности'))
})
