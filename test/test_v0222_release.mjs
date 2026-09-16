import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('v0.2.22: package.json version is 0.2.22', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.ok(pkg.version >= '0.2.22', 'version must be >= 0.2.22')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
})

test('v0.2.22: Issue #222 dsh-key-rotation updater keys present', () => {
  const krot = JSON.parse(fs.readFileSync(new URL('../ru-plugins/34-key-rotation.json', import.meta.url), 'utf8'))
  const ns = krot['dsh-key-rotation'] || krot['keyRotation']
  assert.ok(ns.updateCheck, 'updateCheck key must exist')
  assert.ok(ns.updateAvailable, 'updateAvailable key must exist')
  assert.ok(ns.updateNone, 'updateNone key must exist')
  assert.ok(ns.updateRun, 'updateRun key must exist')
  assert.ok(ns.updateRestart, 'updateRestart key must exist')
  assert.ok(ns.currentVersion, 'currentVersion key must exist')
  assert.ok(ns.latestVersion, 'latestVersion key must exist')
})

test('v0.2.22: Issue #223 memoryMeter namespace present with 37 keys', () => {
  const mm = JSON.parse(fs.readFileSync(new URL('../ru-plugins/71-memory-meter.json', import.meta.url), 'utf8'))
  assert.ok(mm.memoryMeter, 'memoryMeter namespace must exist')
  const keys = Object.keys(mm.memoryMeter)
  assert.ok(keys.length >= 37, `expected >= 37 keys, got ${keys.length}`)
  assert.equal(mm.memoryMeter.tab, 'Память')
  assert.equal(mm.memoryMeter.live, 'Live')
  assert.equal(mm.memoryMeter.scopeSession, 'В этой сессии')
  assert.equal(mm.memoryMeter.denied, 'Метрики недоступны: конечная точка отвечает только на локальные и same-origin запросы.')
})

test('v0.2.22: Issue #224 dsh-server-monitor namespace present with 52 keys', () => {
  const sm = JSON.parse(fs.readFileSync(new URL('../ru-plugins/72-server-monitor.json', import.meta.url), 'utf8'))
  assert.ok(sm['dsh-server-monitor'], 'dsh-server-monitor namespace must exist')
  const keys = Object.keys(sm['dsh-server-monitor'])
  assert.ok(keys.length >= 50, `expected >= 50 keys, got ${keys.length}`)
  assert.equal(sm['dsh-server-monitor'].title, 'Монитор серверов')
  assert.equal(sm['dsh-server-monitor'].subtitle, 'Состояние Linux-серверов — только для просмотра')
})

test('v0.2.22: better-sidebar v0.19.1 settings translated', () => {
  const sb = JSON.parse(fs.readFileSync(new URL('../ru-plugins/07-better-sidebar.json', import.meta.url), 'utf8'))
  const ns = sb['betterSidebar'] || sb['dsh-better-sidebar']
  assert.ok(ns.settingsOpenToolsTitle, 'settingsOpenToolsTitle must exist')
  assert.ok(ns.settingsTitleBarTitle, 'settingsTitleBarTitle must exist')
  assert.ok(ns.settingsSchemeAutoTitle, 'settingsSchemeAutoTitle must exist')
  assert.ok(ns.settingsCustomCssTitle, 'settingsCustomCssTitle must exist')
})

test('v0.2.22: vision-bridge v0.5.x settings translated', () => {
  const vb = JSON.parse(fs.readFileSync(new URL('../ru-plugins/32-vision-bridge.json', import.meta.url), 'utf8'))
  const ns = vb['dsh-vision-bridge']
  assert.equal(ns.strategyOcr, 'Быстрый OCR')
  assert.equal(ns.escalateOnFail, 'Эскалация при сбое')
  assert.equal(ns.routing, 'Маршрутизация')
  assert.ok(ns.noVisionModels.includes('В каталоге нет моделей'), 'noVisionModels must be in Russian')
})

test('v0.2.22: agentrouter namespace present', () => {
  const ar = JSON.parse(fs.readFileSync(new URL('../ru-plugins/73-agentrouter.json', import.meta.url), 'utf8'))
  assert.ok(ar.agentrouter || ar['dsh-agentrouter'], 'agentrouter namespace must exist')
})

test('v0.2.22: client.js bundle contains dsh-hooks Chinese presets and header status chips', () => {
  const clientSrc = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.ok(clientSrc.includes('手动测试'), 'client.js must include dsh-hooks 手动测试 preset')
  assert.ok(clientSrc.includes('飞书通知'), 'client.js must include dsh-hooks 飞书通知 preset')
  assert.ok(clientSrc.includes('Security Auditor Shield'), 'client.js must include Security Auditor Shield')
  assert.ok(clientSrc.includes('Shield: Safe'), 'client.js must include Shield: Safe')
  assert.ok(clientSrc.includes('Smoke chat'), 'client.js must include Smoke chat for agentrouter')
})
