import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.4.0: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.4.0')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('10,898'), 'Description must reflect 10,898 keys')
  assert.ok(pkg.files.includes('supported-inventory.json'), 'files must include supported-inventory.json')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('0.4.0'), 'CHANGELOG must mention 0.4.0')
  assert.ok(cl.includes('#508'), 'CHANGELOG must mention issue #508')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.4.0'), 'README npm badge must be v0.4.0')
  assert.ok(readme.includes('10898'), 'README keys badge must be 10898')
  assert.ok(readme.includes('rc.2'), 'README must mention rc.2')
})

test('v0.4.0: supported-inventory has 10,898 total keys, 115 namespaces and 7 headless plugins', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.equal(inv.core.supported_version, '0.2.1-rc.2')
  assert.equal(inv.metrics.total_keys, 10898)
  assert.equal(inv.metrics.core_keys, 2728)
  assert.equal(inv.metrics.plugin_keys, 8170)
  assert.equal(inv.metrics.total_namespaces, 115)
  assert.equal(inv.metrics.core_namespaces, 63)
  assert.equal(inv.metrics.plugin_namespaces, 52)
  assert.equal(inv.headless_plugins.length, 7)
})

test('v0.4.0: DSH v0.2.1-rc.2 core translations (+109 keys, 63 namespaces)', () => {
  const coreRu = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/core.json'), 'utf8'))

  // 1. pluginMarket (78 keys)
  assert.ok(coreRu.pluginMarket, 'pluginMarket namespace must exist')
  assert.equal(coreRu.pluginMarket.title, 'Витрина')
  assert.equal(coreRu.pluginMarket.sourcesTitle, 'Источники индексов')
  assert.equal(coreRu.pluginMarket.manageSources, 'Управление источниками индексов…')

  // 2. deepseek-model-label-1017 (1 key)
  assert.ok(coreRu['deepseek-model-label-1017'], 'deepseek-model-label-1017 namespace must exist')
  assert.equal(coreRu['deepseek-model-label-1017']['badge.label'], '1017')

  // 3. pluginManager (+4 keys)
  assert.equal(coreRu.pluginManager.tabsLabel, 'Вкладки плагинов')
  assert.equal(coreRu.pluginManager.installedTab, 'Установленные')
  assert.equal(coreRu.pluginManager.installConfirmedTitle, 'Установить плагин')
  assert.equal(coreRu.pluginManager.installConfirmedRefused, 'Этот плагин невозможно установить')

  // 4. settings.models reasoning (+10 keys)
  assert.ok(coreRu['settings.models']['modelReasoning'])
  assert.ok(coreRu['settings.models']['modelReasoningHelp'])

  // 5. settings.webSearch (+9 keys)
  assert.ok(coreRu['settings.webSearch']['useSearchApi'])
  assert.ok(coreRu['settings.webSearch']['count'])

  // 6. settings.hostRelease (+7 keys)
  assert.ok(coreRu.settings['hostRelease.title'])
})

test('v0.4.0: Ecosystem plugin translations (+357 keys)', () => {
  // Check key files in ru-plugins
  const p34 = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/34-key-rotation.json'), 'utf8'))
  assert.equal(p34['dsh-key-rotation'].showChatHeaderChipLabel, 'Плашка статуса в заголовке чата')
  assert.equal(p34['dsh-key-rotation'].matrixModalTitle, '⚡ Матрица тестирования ключей')
  assert.equal(p34['dsh-key-rotation'].keyAuthPaused, 'Авторизация приостановлена (401/403)')

  const p15 = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/15-commandcode.json'), 'utf8'))
  assert.equal(p15['settings.commandcode'].contextWindow, 'Размер контекстного окна')
  assert.equal(p15['settings.commandcode'].maxOutputTokens, 'Лимит генерации на ход')

  const p42 = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/42-plugin-console.json'), 'utf8'))
  assert.equal(p42['settings.pluginConsole'].diskTitle, 'Использование диска (plugin-console)')

  const p07 = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/07-better-sidebar.json'), 'utf8'))
  assert.equal(p07.betterSidebar.gitChanges, 'Изменения')
  assert.equal(p07.betterSidebar.gitGraph, 'Граф')

  const p55 = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/55-skin-center.json'), 'utf8'))
  assert.equal(p55.skinCenter.title, 'Центр тем')
  assert.equal(p55.skinCenter.wallpaperTitle, 'Wallpaper Engine')

  const p03 = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/03-dshmarket.json'), 'utf8'))
  assert.equal(p03['dsh-market'].setSidebar, 'Ярлык в боковой панели')
  assert.equal(p03['dsh-market'].setIndexSource, 'Индекс каталога Discover')
})

test('v0.4.0: banner image exists and is non-empty', () => {
  const bannerPath = path.join(ROOT, 'docs/media/banner.jpg')
  assert.ok(fs.existsSync(bannerPath), 'Banner image must exist')
  const stat = fs.statSync(bannerPath)
  assert.ok(stat.size > 50000, 'Banner image size must be > 50 KB')
})
