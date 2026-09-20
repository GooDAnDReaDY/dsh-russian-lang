import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { bilingualCommandMatch, filterCommands } from '../lib/pure.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientJsPath = path.resolve(__dirname, '../lib/client.js')

const SAMPLE_COMMANDS = [
  { id: 'workbench.action.terminal.new', title: 'Создать терминал', enTitle: 'New Terminal', category: 'Терминал' },
  { id: 'workbench.action.files.save', title: 'Сохранить файл', enTitle: 'Save File', category: 'Файл' },
  { id: 'workbench.action.openSettings', title: 'Параметры системы', enTitle: 'Open Settings', category: 'Настройки' },
  { id: 'dsh.plugins.manage', title: 'Управление плагинами', enTitle: 'Manage Plugins', category: 'Плагины' }
]

test('bilingualCommandMatch: прямой поиск по русскому названию', () => {
  const res = bilingualCommandMatch('терминал', SAMPLE_COMMANDS[0])
  assert.ok(res.matched, 'должен совпасть')
  assert.ok(res.score >= 80, 'высокий скор совпадения')
  assert.equal(res.kind, 'direct')
})

test('bilingualCommandMatch: поиск по английскому оригинальному названию/ID', () => {
  const res = bilingualCommandMatch('terminal', SAMPLE_COMMANDS[0])
  assert.ok(res.matched, 'должен совпасть по enTitle или id')
  assert.ok(res.score >= 80)
})

test('bilingualCommandMatch: автоматическое исправление раскладки клавиатуры (lat -> cyr)', () => {
  // nthvyfk = терминал в русской раскладке
  const res = bilingualCommandMatch('nthvbyfk', SAMPLE_COMMANDS[0])
  assert.ok(res.matched, 'должен распознать ошибочную раскладку')
  assert.equal(res.kind, 'layout')
})

test('bilingualCommandMatch: фонетическая транслитерация (otkryt -> открыть)', () => {
  const cmd = { id: 'file.open', title: 'Открыть файл' }
  const res = bilingualCommandMatch('otkryt', cmd)
  assert.ok(res.matched, 'должен распознать фонетическую транслитерацию')
})

test('filterCommands: фильтрует и ранжирует список команд по релевантности', () => {
  const filtered = filterCommands('файл', SAMPLE_COMMANDS)
  assert.equal(filtered.length, 1)
  assert.equal(filtered[0].id, 'workbench.action.files.save')

  const empty = filterCommands('несуществующая_команда_xyz', SAMPLE_COMMANDS)
  assert.equal(empty.length, 0)

  const all = filterCommands('', SAMPLE_COMMANDS)
  assert.equal(all.length, SAMPLE_COMMANDS.length)
})

test('client.js: экспортирует методы двуязычного поиска в runtime', () => {
  const clientJs = fs.readFileSync(clientJsPath, 'utf8')
  assert.ok(clientJs.includes('bilingualCommandMatch'), 'bilingualCommandMatch экспортирован в client.js')
  assert.ok(clientJs.includes('filterCommands'), 'filterCommands экспортирован в client.js')
})
