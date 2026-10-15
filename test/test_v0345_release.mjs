import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { getPluginsLocalizationOverview } from '../lib/locales.js'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.45: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.45')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('UI keys'), 'Description must reflect UI keys')
  assert.ok(pkg.files.includes('supported-inventory.json'), 'files must include supported-inventory.json')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.45'), 'CHANGELOG must mention 0.3.45')
  assert.ok(cl.includes('#11'), 'CHANGELOG must mention GitHub #11')
  assert.ok(cl.includes('#496'), 'CHANGELOG must mention Gitea #496')
  assert.ok(cl.includes('#497'), 'CHANGELOG must mention Gitea #497')
  assert.ok(cl.includes('#498'), 'CHANGELOG must mention Gitea #498')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v'), 'README npm badge must be present')
  assert.ok(readme.includes('10400') || readme.includes('10368') || readme.includes('9850'), 'README keys badge must be present')
  assert.ok(readme.includes('Ограничение системного меню Electron'), 'README must mention Electron limitation')
})

test('v0.3.45: core trajectory namespace Russian translation (GH-11, #496)', () => {
  const core = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'locales', 'core.json'), 'utf8'))
  const traj = core.trajectory
  assert.ok(traj, 'trajectory namespace must exist in core.json')
  assert.equal(traj['view.trajectory'], 'Трассировка')
  assert.equal(traj['details.assistantMessage'], 'Сообщение ассистента')
  assert.equal(traj['details.event'], 'Сведения о событии')
  assert.equal(traj['details.close'], 'Закрыть подробности')
  assert.equal(traj['details.model'], 'Модель')
  assert.equal(traj['details.provider'], 'Провайдер')
  assert.equal(traj['details.purpose'], 'Назначение')
  assert.equal(traj['toolbar.search'], 'Поиск по трассировке')
  assert.equal(traj['tab.usage'], 'Использование')
  assert.equal(traj['tab.diff'], 'Различия')
  assert.equal(traj['status.pending'], 'Ожидание')
  assert.equal(traj['unit.milliseconds'], '{value} мс')
  assert.equal(traj['unit.seconds'], '{value} с')
  assert.equal(traj['unit.tokens'], '{value} токенов')
  assert.equal(traj['unit.tokensPerSecond'], '{value} ток/с')
  assert.equal(traj['kind.assistant'], 'АССИСТЕНТ')
  assert.equal(traj['kind.tool'], 'ИНСТРУМЕНТ')
  assert.equal(traj['kind.system'], 'СИСТЕМА')
  assert.equal(traj['kind.user'], 'ПОЛЬЗОВАТЕЛЬ')

  // ru/06-rest.json must not have duplicate trajectory
  const rest = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru', '06-rest.json'), 'utf8'))
  assert.equal(rest.trajectory, undefined, 'ru/06-rest.json must not overwrite trajectory')
})

test('v0.3.45: DOM_EN_TEXT covers Trajectory and Chat tabs in client bundle (GH-11)', () => {
  const clientJs = fs.readFileSync(path.join(ROOT, 'lib', 'client.js'), 'utf8')
  assert.ok(clientJs.includes("'Trajectory': 'Трассировка'"), "DOM_EN_TEXT must have Trajectory")
  assert.ok(clientJs.includes("'Chat': 'Чат'"), "DOM_EN_TEXT must have Chat")
  assert.ok(clientJs.includes("'Search trajectory': 'Поиск по трассировке'"), "DOM_EN_TEXT must have Search trajectory")
})

test('v0.3.45: npm pack includes supported-inventory and lib/locales/plugins-en (GH-11)', () => {
  const packRes = spawnSync('npm', ['pack', '--dry-run', '--json'], { cwd: ROOT, encoding: 'utf8' })
  assert.equal(packRes.status, 0)
  const data = JSON.parse(packRes.stdout)[0]
  const filePaths = data.files.map(f => f.path)

  assert.ok(filePaths.includes('supported-inventory.json'), 'supported-inventory.json must be in npm pack')
  const enFiles = filePaths.filter(f => f.startsWith('lib/locales/plugins-en/'))
  assert.ok(enFiles.length > 30, `Expected > 30 plugins-en files in pack, got ${enFiles.length}`)

  // All files in pack <= 256 KiB
  for (const f of data.files) {
    assert.ok(f.size <= 262144, `File ${f.path} exceeded 256 KiB limit: ${f.size} bytes`)
  }
})

test('v0.3.45: getPluginsLocalizationOverview fallback works without root plugins-en.json (GH-11)', () => {
  const rootEnPath = path.join(ROOT, 'plugins-en.json')
  const bakPath = path.join(ROOT, 'plugins-en.json.testbak')
  fs.renameSync(rootEnPath, bakPath)
  try {
    const overview = getPluginsLocalizationOverview()
    assert.ok(overview.totalPlugins > 0, 'totalPlugins must be > 0 in fallback mode')
    assert.ok(overview.fullCount > 0, 'fullCount must be > 0 in fallback mode')
    const sample = overview.plugins.find(p => p.namespace === 'dsh-messenger-gateway')
    assert.ok(sample, 'dsh-messenger-gateway must be present')
    assert.equal(sample.status, 'full', 'dsh-messenger-gateway must be full')
  } finally {
    fs.renameSync(bakPath, rootEnPath)
  }
})

test('v0.3.45: dsh-messenger-gateway new settings keys translated (#497)', () => {
  const mgRu = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '33-messenger-gateway.json'), 'utf8'))['dsh-messenger-gateway']
  assert.equal(mgRu['proxyUrl'], 'URL прокси (HTTP, HTTPS, SOCKS5)')
  assert.equal(mgRu['apiRoot'], 'Пользовательский базовый URL Telegram Bot API')

  const mgLib = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'locales', 'plugins', '33-messenger-gateway.json'), 'utf8'))['dsh-messenger-gateway']
  assert.equal(mgLib['proxyUrl'], 'URL прокси (HTTP, HTTPS, SOCKS5)')
  assert.equal(mgLib['apiRoot'], 'Пользовательский базовый URL Telegram Bot API')
})

test('v0.3.45: check_data_integrity passes on clean repository', () => {
  const res = spawnSync('python3', [path.join(ROOT, 'tools', 'check_data_integrity.py')], {
    cwd: ROOT,
    encoding: 'utf8'
  })
  assert.equal(res.status, 0, `check_data_integrity failed: ${res.stderr || res.stdout}`)
  assert.ok(res.stdout.includes('OK: Все снапшоты и корпусы данных прошли проверку целостности'))
})
