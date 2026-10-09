import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makePluginLocalizationStatus, makeIssueUrl } from '../lib/pure.js'
import { getPluginsLocalizationOverview } from '../lib/locales.js'

test('makePluginLocalizationStatus accurately computes full, partial, none, and unverified (#484)', () => {
  const dicts = {
    'dsh-full': { 'title': 'Заголовок', 'desc': 'Описание' },
    'dsh-partial': { 'title': 'Заголовок' },
    'dsh-none': {},
    'dsh-extra': { 'title': 'Заголовок', 'legacy': 'Старое' }
  }

  const enCatalog = {
    'dsh-full': { 'title': 'Title', 'desc': 'Description' },
    'dsh-partial': { 'title': 'Title', 'desc': 'Description', 'hint': 'Hint' },
    'dsh-none': { 'item1': 'Item 1', 'item2': 'Item 2' },
    'dsh-extra': { 'title': 'Title' }
  }

  const inventory = {
    supported_plugins: {
      '@goodandready/dsh-full': '1.0.0',
      '@goodandready/dsh-partial': '0.5.0',
      '@goodandready/dsh-none': '0.1.0'
    }
  }

  const getStatus = makePluginLocalizationStatus(dicts, enCatalog, inventory)

  // 1. Full 100%
  const stFull = getStatus('dsh-full', '@goodandready/dsh-full', '1.0.0')
  assert.equal(stFull.status, 'full')
  assert.equal(stFull.percent, 100)
  assert.equal(stFull.count, 2)
  assert.equal(stFull.total, 2)
  assert.deepEqual(stFull.missingKeys, [])
  assert.equal(stFull.verifiedVersion, '1.0.0')

  // 2. Partial 33% (1 translated out of 3 EN keys)
  const stPartial = getStatus('dsh-partial', '@goodandready/dsh-partial', '0.5.2')
  assert.equal(stPartial.status, 'partial')
  assert.equal(stPartial.percent, 33)
  assert.equal(stPartial.count, 1)
  assert.equal(stPartial.total, 3)
  assert.equal(stPartial.missingKeys.length, 2)
  assert.equal(stPartial.missingKeys[0].key, 'desc')
  assert.equal(stPartial.missingKeys[0].en, 'Description')
  assert.equal(stPartial.verifiedVersion, '0.5.0')
  assert.equal(stPartial.installedVersion, '0.5.2')

  // 3. None 0%
  const stNone = getStatus('dsh-none', '@goodandready/dsh-none', '0.1.0')
  assert.equal(stNone.status, 'none')
  assert.equal(stNone.percent, 0)
  assert.equal(stNone.count, 0)
  assert.equal(stNone.total, 2)
  assert.equal(stNone.missingKeys.length, 2)

  // 4. Unverified (no EN baseline and not in inventory)
  const stUnverified = getStatus('unknown-plugin', 'some-random-plugin', '1.2.3')
  assert.equal(stUnverified.status, 'unverified')
  assert.equal(stUnverified.percent, 0)
  assert.equal(stUnverified.label, 'Не проверено')

  // 5. Extra keys handled (only EN keys define total denominator)
  const stExtra = getStatus('dsh-extra', '@goodandready/dsh-extra', '1.0.0')
  assert.equal(stExtra.status, 'full')
  assert.equal(stExtra.percent, 100)
  assert.equal(stExtra.total, 1)
})

test('makeIssueUrl generates valid pre-filled link for missing keys request (#484)', () => {
  const missingKeys = [
    { key: 'interveneTitle', en: 'Pause & Intervene' },
    { key: 'interveneDesc', en: 'Goal is paused. Steer agent behavior.' }
  ]

  const url = makeIssueUrl({
    plugin: '@goodandready/dsh-goal',
    ns: 'dsh-goal',
    installedVersion: '0.2.23',
    verifiedVersion: '0.2.23',
    coveragePercent: 86,
    totalKeys: 96,
    missingKeys,
    dshVersion: '0.2.1-alpha.1'
  }, '0.3.41')

  assert.ok(url.startsWith('https://github.com/GooDAnDReaDY/dsh-russian-lang/issues/new?'))
  const parsed = new URL(url)
  const title = parsed.searchParams.get('title')
  const body = parsed.searchParams.get('body')

  assert.ok(title.includes('[Перевод] Запрос локализации для плагина @goodandready/dsh-goal (v0.2.23)'))
  assert.ok(body.includes('0.2.23'))
  assert.ok(body.includes('86%'))
  assert.ok(body.includes('96'))
  assert.ok(body.includes('interveneTitle'))
  assert.ok(body.includes('Pause & Intervene'))
  assert.ok(body.includes('0.3.41'))
})

test('makeIssueUrl safely truncates very large missing keys list to fit within URL limits (#484)', () => {
  const largeMissingList = []
  for (let i = 0; i < 100; i++) {
    largeMissingList.push({ key: `key_${i}`, en: `English string description number ${i}` })
  }

  const url = makeIssueUrl({
    plugin: 'giant-plugin',
    missingKeys: largeMissingList
  }, '0.3.41')

  const parsed = new URL(url)
  const body = parsed.searchParams.get('body')

  // Truncation note present
  assert.ok(body.includes('список сокращён для ограничения длины URL'))
  assert.ok(body.includes('и ещё 65 ключей'))
  // URL length stays well within reasonable limits
  assert.ok(url.length < 5000)
})

test('getPluginsLocalizationOverview returns overview of supported plugins from backend (#484)', () => {
  const overview = getPluginsLocalizationOverview()
  assert.ok(overview)
  assert.ok(Array.isArray(overview.plugins))
  assert.ok(overview.totalPlugins >= 50)
  assert.ok(overview.fullCount > 0)
  assert.equal(typeof overview.dshVersion, 'string')
  assert.ok(overview.dshRussianLangVersion)

  const goal = overview.plugins.find(p => p.packageName === '@goodandready/dsh-goal')
  assert.ok(goal)
  assert.equal(goal.status, 'full')
  assert.equal(goal.percent, 100)
  assert.deepEqual(goal.missingKeys, [])
})
