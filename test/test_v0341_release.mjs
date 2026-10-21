import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  extractPlaceholders,
  validatePlaceholders,
  makeIssueUrl,
  makePluginLocalizationStatus
} from '../lib/pure.js'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.41: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.41')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('9,380 UI keys') || pkg.description.includes('9,554 UI keys') || pkg.description.includes('10,898') || pkg.description.includes('11,598'), 'Description must reflect keys count')
  assert.ok(pkg.description.includes('v0.2.1'), 'Description must reflect DSH version')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.41'), 'CHANGELOG must mention 0.3.41')
  assert.ok(cl.includes('#484'), 'CHANGELOG must mention #484')
  assert.ok(cl.includes('#485'), 'CHANGELOG must mention #485')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.') || readme.includes('npm-v0.4.'), 'README npm badge')
  assert.ok(readme.includes('Ключей_UI-') || readme.includes('11598'), 'README keys badge')
})

test('v0.3.41: inventory metrics reflect 9,380 total keys and 100% coverage', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.ok(inv.metrics.core_keys >= 2512)
  assert.ok(inv.metrics.plugin_keys >= 6868)
  assert.ok(inv.metrics.total_keys >= 9380)
  assert.ok(inv.metrics.total_namespaces >= 103)
  assert.equal(inv.metrics.coverage_percent, 100.0)
})

test('v0.3.41: pure function extractPlaceholders & validatePlaceholders (#485)', () => {
  assert.deepEqual(extractPlaceholders('Hello {name}, you have {count} messages (%s)'), ['{name}', '{count}', '%s'])
  
  const okVal = validatePlaceholders('Hello {name} %d', 'Привет {name} %d!')
  assert.equal(okVal.valid, true)
  assert.deepEqual(okVal.missing, [])

  const badVal = validatePlaceholders('Hello {name} %d', 'Привет!')
  assert.equal(badVal.valid, false)
  assert.deepEqual(badVal.missing, ['{name}', '%d'])
})

test('v0.3.41: pure function makeIssueUrl supports proposal and missing keys (#484, #485)', () => {
  const proposalUrl = makeIssueUrl({
    isProposal: true,
    original: 'Discard unsaved changes?',
    current: 'Отменить изменения?',
    override: 'Сбросить несохранённое?',
    proposal: 'Отменить несохранённые изменения?',
    comment: 'Тестовый комментарий',
    ns: 'dsh-cron',
    key: 'modal.confirmDiscard',
    plugin: '@goodandready/dsh-cron',
    pluginVersion: '0.2.50',
    dshVersion: '0.2.1-alpha.1'
  }, '0.3.41')
  assert.ok(proposalUrl.includes('github.com'))
  assert.ok(proposalUrl.includes('modal.confirmDiscard'))
  const decodedProposal = decodeURIComponent(proposalUrl)
  assert.ok(decodedProposal.includes('Предложение') || decodedProposal.includes('proposal'))

  const missingUrl = makeIssueUrl({
    plugin: '@goodandready/dsh-goal',
    ns: 'dsh-goal',
    missingKeys: [{ key: 'goal.demo', en: 'Demo goal' }]
  }, '0.3.41')
  const decodedMissing = decodeURIComponent(missingUrl)
  assert.ok(decodedMissing.includes('@goodandready/dsh-goal'))
  assert.ok(decodedMissing.includes('goal.demo'))
})

test('v0.3.41: makePluginLocalizationStatus formats overview correctly (#484)', () => {
  const dicts = { 'dsh-test': { a: '1' } }
  const enCatalog = { 'dsh-test': { a: '1', b: '2' } }
  const inv = { supported_plugins: { '@goodandready/dsh-test': '1.0.0' } }
  const getStatus = makePluginLocalizationStatus(dicts, enCatalog, inv)
  const st = getStatus('dsh-test', '@goodandready/dsh-test', '1.0.0')
  assert.equal(st.status, 'partial')
  assert.equal(st.percent, 50)
  assert.equal(st.total, 2)
  assert.equal(st.count, 1)
})

test('v0.3.41: endpoint /api/dsh-russian-lang/status/plugins and getPluginsLocalizationOverview (#484)', async () => {
  const { getPluginsLocalizationOverview } = await import('../lib/locales.js')
  assert.equal(typeof getPluginsLocalizationOverview, 'function')
  const overview = getPluginsLocalizationOverview()
  assert.ok(overview)
  assert.ok(Array.isArray(overview.plugins))
  assert.ok(overview.totalPlugins > 0)
  assert.ok(overview.plugins.length > 0)
  assert.ok(overview.plugins[0].packageName)

  const indexContent = fs.readFileSync(path.join(ROOT, 'lib', 'index.js'), 'utf8')
  assert.ok(indexContent.includes('/api/dsh-russian-lang/status/plugins'))
})

test('v0.3.41: check_data_integrity passes on clean repository', () => {
  const res = spawnSync('python3', [path.join(ROOT, 'tools', 'check_data_integrity.py')], {
    cwd: ROOT,
    encoding: 'utf8'
  })
  assert.equal(res.status, 0, `check_data_integrity failed: ${res.stderr || res.stdout}`)
  assert.ok(res.stdout.includes('OK: Все снапшоты и корпусы данных прошли проверку целостности'))
})
