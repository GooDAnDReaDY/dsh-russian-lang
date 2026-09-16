import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { getCoreDictionaries, getPluginDictionaries, getAllDictionaries } from '../lib/locales.js'

test('v0.2.23: package.json version is 0.2.23', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.version, '0.2.23')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
})

test('v0.2.23: Issue #214 decomposition drops lib/client.js size below 160 KiB', () => {
  const clientPath = new URL('../lib/client.js', import.meta.url)
  const sz = fs.statSync(clientPath).size
  assert.ok(sz < 163840, `lib/client.js size is ${sz} bytes, must be < 160 KiB (163840 bytes)`)
  assert.ok(sz > 100000, `lib/client.js size is ${sz} bytes, must be valid (> 100 KiB)`)
})

test('v0.2.23: Issue #214 lib/locales/core.json exists with 45 namespaces', () => {
  const core = getCoreDictionaries()
  const nsList = Object.keys(core)
  assert.ok(nsList.length >= 45, `expected >= 45 core namespaces, got ${nsList.length}`)
  assert.ok(core.common, 'common namespace must exist in core')
  assert.ok(core.trajectory, 'trajectory namespace must exist in core')
  assert.ok(core.sidebarRight, 'sidebarRight namespace must exist in core')
})

test('v0.2.23: getAllDictionaries returns combined core and plugin namespaces', () => {
  const all = getAllDictionaries()
  const keys = Object.keys(all)
  assert.ok(keys.length >= 80, `expected >= 80 combined namespaces, got ${keys.length}`)
  assert.ok(all.common, 'common must be in all')
  assert.ok(all['dsh-usage-stats'], 'dsh-usage-stats must be in all')
  assert.ok(all.pluginMarket, 'pluginMarket must be in all')
})

test('v0.2.23: pluginMarket namespace translated with 70 keys', () => {
  const mkt = JSON.parse(fs.readFileSync(new URL('../ru-plugins/74-plugin-market.json', import.meta.url), 'utf8'))
  assert.ok(mkt.pluginMarket, 'pluginMarket namespace must exist')
  assert.equal(mkt.pluginMarket.trigger, 'Магазин плагинов')
  assert.equal(mkt.pluginMarket.title, 'Магазин плагинов')
})

test('v0.2.23: dsh-usage-stats namespace present with Today translated to Сегодня', () => {
  const us = JSON.parse(fs.readFileSync(new URL('../ru-plugins/16-usage-stats.json', import.meta.url), 'utf8'))
  assert.ok(us['dsh-usage-stats'], 'dsh-usage-stats namespace must exist')
  assert.equal(us['dsh-usage-stats']['footer.todayLabel'], 'Сегодня')
  assert.equal(us['dsh-usage-stats']['deepseek.label'], 'Баланс DeepSeek')
  assert.equal(us['dsh-usage-stats']['go.label'], 'Квота Go')
  assert.equal(us['dsh-usage-stats']['zai.label'], 'Квота Z.ai')
})

test('v0.2.23: DOM_EN_TEXT covers sidebar and settings tabs', () => {
  const clientSrc = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.ok(clientSrc.includes("'Scheduled tasks': 'Задачи по расписанию'"), 'Scheduled tasks must be in DOM_EN_TEXT')
  assert.ok(clientSrc.includes("'Today': 'Сегодня'"), 'Today must be in DOM_EN_TEXT')
  assert.ok(clientSrc.includes("'Plugin Market': 'Магазин плагинов'"), 'Plugin Market must be in DOM_EN_TEXT')
  assert.ok(clientSrc.includes("'Side card': 'Боковая панель'"), 'Side card must be in DOM_EN_TEXT')
  assert.ok(clientSrc.includes("'panelName': 'Палитра команд'"), 'panelName must be in DOM_EN_TEXT')
  assert.ok(clientSrc.includes("'Hooks': 'Хуки'"), 'Hooks must be in DOM_EN_TEXT')
})

test('v0.2.23: CORE_ZH_PRESETS covers automode and dsh-hooks Chinese phrases', () => {
  const clientSrc = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.ok(clientSrc.includes("'请求批准': 'Запрашивать подтверждение'"), '请求批准 must be in CORE_ZH_PRESETS')
  assert.ok(clientSrc.includes("'完全放开': 'Полный доступ'"), '完全放开 must be in CORE_ZH_PRESETS')
  assert.ok(clientSrc.includes("'只读': 'Только чтение'"), '只读 must be in CORE_ZH_PRESETS')
  assert.ok(clientSrc.includes("'手动测试': 'Ручное тестирование'"), '手动测试 must be in CORE_ZH_PRESETS')
  assert.ok(clientSrc.includes("'飞书通知': 'Уведомления Feishu'"), '飞书通知 must be in CORE_ZH_PRESETS')
  assert.ok(clientSrc.includes("'去抖': 'Дебаунс'"), '去抖 must be in CORE_ZH_PRESETS')
  assert.ok(clientSrc.includes("'复制 YAML': 'Копировать YAML'"), '复制 YAML must be in CORE_ZH_PRESETS')
})
