import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { getCoreDictionaries, getAllDictionaries } from '../lib/locales.js'

test('release: package.json version matches the released line', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  // Pinned to the current release; bump it together with package.json. The head of
  // CHANGELOG.md must name the same version, so a forgotten changelog entry fails here.
  assert.equal(pkg.version, '0.3.2')
  const changelog = fs.readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8')
  const head = changelog.split('\n').find((line) => line.startsWith('## ')) || ''
  assert.ok(head.includes(pkg.version), `CHANGELOG head must mention ${pkg.version}, got: ${head}`)
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
})

test('v0.2.25: DSH Core v0.1.6-alpha.2 namespaces present with translated keys', () => {
  const core = getCoreDictionaries()
  
  // pluginManager (155 keys)
  assert.ok(core.pluginManager, 'pluginManager must exist in core')
  assert.equal(core.pluginManager.title, 'Плагины')
  assert.equal(core.pluginManager.installTitle, 'Добавить плагин')
  assert.equal(core.pluginManager.installRun, 'Установить')

  // agent-team (35 keys)
  assert.ok(core['agent-team'], 'agent-team must exist in core')
  assert.equal(core['agent-team'].trigger, 'Команда агентов')
  assert.equal(core['agent-team'].roster, 'Участники')

  // deliverables (34 keys)
  assert.ok(core.deliverables, 'deliverables must exist in core')
  assert.equal(core.deliverables['changes.title'], 'Изменено файлов: {count}')
  assert.equal(core.deliverables['review.split'], 'Переключить на раздельный вид')

  // sidebarBrowser (22 keys)
  assert.ok(core.sidebarBrowser, 'sidebarBrowser must exist in core')
  assert.equal(core.sidebarBrowser['type.label'], 'Браузер')

  // sidebarOffice (17 keys)
  assert.ok(core.sidebarOffice, 'sidebarOffice must exist in core')
  assert.equal(core.sidebarOffice.title, 'Офисный документ')
})

test('v0.2.25: Updated plugin namespaces translated', () => {
  const all = getAllDictionaries()

  // dsh-context (ov.* Context Insights)
  assert.ok(all['dsh-context'], 'dsh-context must exist')
  assert.equal(all['dsh-context']['ov.title'], 'Аналитика контекста')
  assert.equal(all['dsh-context']['ov.list.title'], 'Сессии')

  // @goodandready/dsh-dsml-artifact-guard
  assert.ok(all['@goodandready/dsh-dsml-artifact-guard'], 'dsml-artifact-guard must exist')
  assert.equal(all['@goodandready/dsh-dsml-artifact-guard'].ready, 'Сохранить настройки')

  // dsh-cost-meter
  assert.ok(all['dsh-cost-meter'], 'dsh-cost-meter must exist')
  assert.equal(all['dsh-cost-meter']['update.btn'], 'Обновить сейчас')

  // dsh-vision-bridge
  assert.ok(all['dsh-vision-bridge'], 'dsh-vision-bridge must exist')
  assert.equal(all['dsh-vision-bridge'].updater_title, 'Версия плагина и обновления')
})
