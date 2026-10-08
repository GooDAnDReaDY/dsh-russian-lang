import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.39: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.3.39')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('9,359 UI keys'), 'Description must reflect 9,359 keys')
  assert.ok(pkg.description.includes('v0.2.1-alpha.1'), 'Description must reflect DSH v0.2.1-alpha.1')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.39'), 'CHANGELOG must mention 0.3.39')
  assert.ok(cl.includes('#480'), 'CHANGELOG must mention #480')
  assert.ok(cl.includes('#479'), 'CHANGELOG must mention #479')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.39'), 'README npm badge must be v0.3.39')
  assert.ok(readme.includes('Ключей_UI-9359'), 'README keys badge must be 9359')
})

test('v0.3.39: inventory metrics reflect 9,359 total keys and 100% coverage', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.equal(inv.metrics.core_keys, 2512)
  assert.equal(inv.metrics.plugin_keys, 6847)
  assert.equal(inv.metrics.total_keys, 9359)
  assert.equal(inv.metrics.total_namespaces, 103)
  assert.equal(inv.metrics.coverage_percent, 100.0)
})

test('v0.3.39: all 15 updated plugin namespaces have new keys present in lib/locales', () => {
  // 1. dsh-kanban
  const kb = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '10-kanban.json'), 'utf8'))['dsh-kanban']
  assert.equal(kb['error.timeout'], 'Время ожидания запроса истекло. Пожалуйста, попробуйте снова.')

  // 2. config-manager-market
  const cmm = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '28-config-manager-market.json'), 'utf8'))['config-manager-market']
  assert.equal(cmm['common.infoHint'], 'Показать описание')
  assert.ok(cmm['list.installMissing'].includes('каталоге'))

  // 3. settings.pluginConsole
  const pc = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '42-plugin-console.json'), 'utf8'))['settings.pluginConsole']
  assert.ok(pc['starHint'].includes('GitHub'))

  // 4. dsh-skill-explorer
  const se = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '20-skill-explorer.json'), 'utf8'))['dsh-skill-explorer']
  assert.equal(se['list.noFile'], 'Нет локального файла')

  // 5. dsh-superpower
  const sp = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '86-superpower.json'), 'utf8'))['dsh-superpower']
  assert.equal(sp['build'], 'Сборка панели')
  assert.equal(sp['invocable'], 'Включено')

  // 6. dsh-market
  const dm = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '03-dshmarket.json'), 'utf8'))['dsh-market']
  assert.equal(dm['capGroupFiles'], 'Файлы и окружение')
  assert.equal(dm['capGroupHost'], 'Внутренние механизмы DSH')

  // 7. dsh-github-ops
  const gho = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '77-github-ops.json'), 'utf8'))['dsh-github-ops']
  assert.equal(gho['scmCiRunSuccess'], 'Сборка CI успешно завершена')
  assert.equal(gho['scmGraphTitle'], 'Граф Git')

  // 8. dsh-vision-bridge
  const vb = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '32-vision-bridge.json'), 'utf8'))['dsh-vision-bridge']
  assert.equal(vb['bench_btn'], 'Тест скорости')
  assert.equal(vb['mode_hybrid_title'], 'Зрение: Гибридный режим (автоописание + инструменты)')

  // 9. settings.commandcode (respecting Command Code canonical name)
  const cc = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '15-commandcode.json'), 'utf8'))['settings.commandcode']
  assert.equal(cc['writeConfigSaved'], 'Конфигурация сохранена.')
  assert.ok(cc['writeCleanupPending'].includes('очистка записей'))

  // 10. dsh-context
  const ctx = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '17-dsh-context.json'), 'utf8'))['dsh-context']
  assert.equal(ctx['rich.find'], 'Найти в тексте')
  assert.equal(ctx['stats.subagents'], 'Субагенты')

  // 11. dsh-image-gen
  const ig = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '68-image-gen.json'), 'utf8'))['dsh-image-gen']
  assert.equal(ig['card.draftPreview'], 'Предпросмотр черновика')
  assert.equal(ig['card.dirty'], 'Несохранённые изменения')

  // 12. dsh-subscriptions (Issue #479)
  const sub = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '65-subscriptions.json'), 'utf8'))['dsh-subscriptions']
  assert.equal(sub['backupDownload'], 'Скачать .enc')
  assert.equal(sub['quarantinePark'], 'В карантин')
  assert.equal(sub['toastQuarantined'], 'Аккаунт помещен в карантин')
  assert.equal(sub['enableToasts'], 'Всплывающие уведомления')

  // 13. config-manager-sync
  const cms = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '27-config-manager-sync.json'), 'utf8'))['config-manager-sync']
  assert.equal(cms['channel.clear'], 'Отключить')
  assert.equal(cms['cloud.provider'], 'Провайдер')

  // 14. config-manager
  const cm = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '26-config-manager.json'), 'utf8'))['config-manager']
  assert.ok(cm['about.cli.help'].includes('CLI'))
  assert.equal(cm['foreign.source.antigravity'], 'Google Antigravity')

  // 15. config-manager-recovery
  const rec = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '29-config-manager-recovery.json'), 'utf8'))['config-manager-recovery']
  assert.equal(rec['checkpoint.capture'], 'Создать контрольную точку')
  assert.equal(rec['recovery.safeMode.action'], 'Снять безопасный режим')
  assert.equal(rec['sessions.layout.apply'], 'Запустить исправление структуры')
})

test('v0.3.39: check_data_integrity passes on clean repository (#480)', () => {
  const res = spawnSync('python3', ['tools/check_data_integrity.py'], { cwd: ROOT, encoding: 'utf8' })
  assert.equal(res.status, 0, `check_data_integrity failed: ${res.stderr}`)
  assert.ok(res.stdout.includes('Все снапшоты и корпусы данных прошли проверку целостности'))
})
