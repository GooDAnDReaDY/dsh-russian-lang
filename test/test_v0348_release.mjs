import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.48: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.48')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('10,432'), 'Description must reflect 10,432 keys')
  assert.ok(pkg.files.includes('supported-inventory.json'), 'files must include supported-inventory.json')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('0.3.48'), 'CHANGELOG must mention 0.3.48')
  assert.ok(cl.includes('#504'), 'CHANGELOG must mention issue #504')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.48') || readme.includes('npm-v0.3.49'), 'README npm badge must be v0.3.48 or v0.3.49')
  assert.ok(readme.includes('10432'), 'README keys badge must be 10432')
})

test('v0.3.48: supported-inventory has 10,432 total keys, 111 namespaces and 7 headless plugins', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.equal(inv.metrics.total_keys, 10432)
  assert.equal(inv.metrics.core_keys, 2619)
  assert.equal(inv.metrics.plugin_keys, 7813)
  assert.equal(inv.metrics.total_namespaces, 111)
  assert.equal(inv.metrics.plugin_namespaces, 50)
  assert.equal(inv.core.supported_version, '0.2.1-alpha.3')
  assert.equal(Object.keys(inv.supported_plugins).length, 83)
  assert.ok(Array.isArray(inv.headless_plugins), 'headless_plugins must be an array')
  assert.equal(inv.headless_plugins.length, 7)
  assert.ok(inv.headless_plugins.includes('@goodandready-private/dsh-scrapling-fast'))
})

test('v0.3.48: modsearch and navbar translations integrity', () => {
  const ms = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '89-modsearch.json'), 'utf8'))
  assert.ok(ms.modsearch, 'modsearch namespace must exist')
  assert.equal(Object.keys(ms.modsearch).length, 32)
  assert.equal(ms.modsearch.title, 'Поисковая система (ModSearch)')
  assert.equal(ms.modsearch.save, 'Сохранить')
  assert.equal(ms.modsearch.retry, 'Повторить')

  const nb = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '52-navbar.json'), 'utf8'))
  assert.ok(nb.pin, 'pin namespace must exist')
  assert.equal(nb.pin['action.pin'], 'Закрепить')
  assert.equal(nb.pin['action.unpin'], 'Открепить')

  const clientTemplate = fs.readFileSync(path.join(ROOT, 'lib', 'client.template.js'), 'utf8')
  assert.ok(clientTemplate.includes("'Search engine (ModSearch)': 'Поисковая система (ModSearch)'"), 'client.template.js must include modsearch DOM_EN_TEXT')
})

test('v0.3.48: getPluginsLocalizationOverview covers all 83 plugins (76 full, 7 headless, 0 unmapped)', async () => {
  const { getPluginsLocalizationOverview, getPluginDictionariesByNames } = await import('../lib/locales.js')
  const overview = getPluginsLocalizationOverview()

  assert.equal(overview.totalPlugins, 83)
  assert.equal(overview.fullCount, 76)
  assert.equal(overview.headlessCount, 7)
  assert.equal(overview.partialCount, 0)
  assert.equal(overview.noneCount, 0)

  // Verify the 8 plugins from issues #12 - #19
  const pMap = new Map(overview.plugins.map((p) => [p.packageName, p]))

  // GH-12
  const p12 = pMap.get('@goodandready-private/dsh-scrapling-fast')
  assert.ok(p12, '@goodandready-private/dsh-scrapling-fast must be in overview')
  assert.equal(p12.status, 'headless')
  assert.equal(p12.label, 'Серверный плагин (без UI)')
  assert.equal(p12.missingKeys.length, 0)

  // GH-13
  const p13 = pMap.get('@linxin666/dsh-client-ui-skill-explorer')
  assert.ok(p13)
  assert.equal(p13.status, 'full')
  assert.equal(p13.namespace, 'dsh-skill-explorer')
  assert.equal(p13.count, 75)

  // GH-14
  const p14 = pMap.get('@liustack/modsearch')
  assert.ok(p14)
  assert.equal(p14.status, 'full')
  assert.equal(p14.namespace, 'modsearch')
  assert.equal(p14.count, 32)

  // GH-15
  const p15 = pMap.get('@log.li/dsh-automode')
  assert.ok(p15)
  assert.equal(p15.status, 'full')
  assert.equal(p15.namespace, 'dsh-auto-mode.permission')
  assert.equal(p15.count, 8)

  // GH-16
  const p16 = pMap.get('@mars-sea/dsh-commandcode-provider')
  assert.ok(p16)
  assert.equal(p16.status, 'full')
  assert.equal(p16.namespace, 'settings.commandcode')
  assert.equal(p16.count, 176)

  // GH-17
  const p17 = pMap.get('@michengai/dsh-skills-manager')
  assert.ok(p17)
  assert.equal(p17.status, 'full')
  assert.equal(p17.namespace, 'skills-manager')
  assert.equal(p17.count, 218)

  // GH-18
  const p18 = pMap.get('@opencode2dsh/dsh-plugin')
  assert.ok(p18)
  assert.equal(p18.status, 'full')
  assert.equal(p18.namespace, 'settings.ip-pool')
  assert.equal(p18.count, 99)

  // GH-19
  const p19 = pMap.get('@vlln/dsh-navbar')
  assert.ok(p19)
  assert.equal(p19.status, 'full')
  assert.equal(p19.namespace, 'pin')
  assert.equal(p19.count, 2)

  // Test getPluginDictionariesByNames resolution
  const dictsByName = getPluginDictionariesByNames(['@vlln/dsh-navbar', '@liustack/modsearch', '@michengai/dsh-skills-manager'])
  assert.ok(dictsByName.pin, 'pin dictionary must be resolved by package name')
  assert.ok(dictsByName.modsearch, 'modsearch dictionary must be resolved by package name')
  assert.ok(dictsByName['skills-manager'], 'skills-manager dictionary must be resolved by package name')
})

test('v0.3.48: makeIssueUrl does not generate empty missing-key template for 0 keys', async () => {
  const { makeIssueUrl } = await import('../lib/pure.js')
  const urlEmpty = makeIssueUrl({
    plugin: '@goodandready-private/dsh-scrapling-fast',
    missingKeys: []
  }, '0.3.48')
  assert.ok(!urlEmpty.includes('Недостающих+ключей%3A+%600%60'), 'Must not generate 0 missing keys body')
})
