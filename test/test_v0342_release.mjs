import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.42: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.3.42')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('9,554 UI keys'), 'Description must reflect 9,554 keys')
  assert.ok(pkg.description.includes('v0.2.1-alpha.2'), 'Description must reflect DSH v0.2.1-alpha.2')
  assert.ok(pkg.description.includes('87 plugins'), 'Description must reflect 87 plugins supported')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.42'), 'CHANGELOG must mention 0.3.42')
  assert.ok(cl.includes('#487'), 'CHANGELOG must mention #487')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.42'), 'README npm badge must be v0.3.42')
  assert.ok(readme.includes('DSH-v0.2.1--alpha.2'), 'README DSH badge must be v0.2.1-alpha.2')
  assert.ok(readme.includes('Ключей_UI-9554'), 'README keys badge must be 9554')
})

test('v0.3.42: inventory metrics reflect 9,554 total keys and 100% coverage', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.equal(inv.metrics.core_keys, 2593)
  assert.equal(inv.metrics.plugin_keys, 6961)
  assert.equal(inv.metrics.total_keys, 9554)
  assert.equal(inv.metrics.core_namespaces, 60)
  assert.equal(inv.metrics.plugin_namespaces, 45)
  assert.equal(inv.metrics.total_namespaces, 105)
  assert.equal(inv.metrics.coverage_percent, 100.0)
})

test('v0.3.42: core v0.2.1-alpha.2 cotTranslation namespace translated (#487)', () => {
  const cot = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru', '14-cot-translation.json'), 'utf8'))['cotTranslation']
  assert.ok(cot, 'cotTranslation must exist in ru/14-cot-translation.json')
  assert.equal(cot['original'], 'Показать оригинал')
  assert.equal(cot['provider'], 'Сервис перевода')

  const coreJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'locales', 'core.json'), 'utf8'))
  assert.ok(coreJson['cotTranslation'], 'cotTranslation must exist in lib/locales/core.json')
  assert.equal(coreJson['cotTranslation']['original'], 'Показать оригинал')
  assert.equal(coreJson['cotTranslation']['provider'], 'Сервис перевода')
})

test('v0.3.42: core v0.2.1-alpha.2 new keys translated (#487)', () => {
  const coreJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'locales', 'core.json'), 'utf8'))
  assert.equal(coreJson['settings.theme']['fontFamily.code.title'], 'Шрифт кода')
  assert.equal(coreJson['settings.theme']['fontFamily.terminal.title'], 'Шрифт терминала')
  assert.equal(coreJson['settings.theme']['fontFamily.text.title'], 'Шрифт текста')
  assert.equal(coreJson['voice-input']['inputDevice'], 'Устройство ввода')
  assert.equal(coreJson['voice-input']['inputLevel'], 'Уровень входного сигнала микрофона')
  assert.equal(coreJson['chat']['settings.collapse.title'], 'Когда сворачивать детали работы')
  assert.equal(coreJson['chat']['settings.collapse.completion'], 'По завершении')
})

test('v0.3.42: ecosystem billion-context plugin translated (#487)', () => {
  const bili = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '87-billion-context.json'), 'utf8'))['bili']
  assert.ok(bili, 'bili must exist in ru-plugins/87-billion-context.json')
  assert.equal(bili['title'], 'Прокси сжатия billion-context')
  assert.equal(bili['open'], 'Открыть веб-интерфейс')

  const biliLib = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'locales', 'plugins', '87-billion-context.json'), 'utf8'))['bili']
  assert.ok(biliLib, 'bili must exist in lib/locales/plugins/87-billion-context.json')
  assert.equal(biliLib['title'], 'Прокси сжатия billion-context')
  assert.equal(biliLib['open'], 'Открыть веб-интерфейс')
})

test('v0.3.42: dsh-better-sidebar v0.25.0 new keys translated (#487)', () => {
  const sb = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '07-better-sidebar.json'), 'utf8'))['betterSidebar']
  assert.equal(sb['commitModelTitle'], 'Модель сообщений коммитов')
  assert.equal(sb['commit'], 'Закоммитить')
  assert.ok(sb['settingsEditorGitGutterDesc'].includes('blame'))
})

test('v0.3.42: check_data_integrity passes on clean repository', () => {
  const res = spawnSync('python3', [path.join(ROOT, 'tools', 'check_data_integrity.py')], {
    cwd: ROOT,
    encoding: 'utf8'
  })
  assert.equal(res.status, 0, `check_data_integrity failed: ${res.stderr || res.stdout}`)
  assert.ok(res.stdout.includes('OK: Все снапшоты и корпусы данных прошли проверку целостности'))
})
