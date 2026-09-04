import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const clientCode = readFileSync(join(HERE, '..', 'lib', 'client.js'), 'utf-8')

test('бандл v0.2.1 содержит словари subagent-director, moa, personal-directive', () => {
  assert.ok(clientCode.includes('settings.subagentDirector'), 'subagentDirector missing')
  assert.ok(clientCode.includes('Директор субагентов'), 'Subagent Director Russian title missing')

  assert.ok(clientCode.includes('dsh-moa'), 'dsh-moa missing')
  assert.ok(clientCode.includes('Смесь агентов (MoA)'), 'MoA Russian title missing')

  assert.ok(clientCode.includes('personalDirective'), 'personalDirective missing')
  assert.ok(clientCode.includes('Директива: Вкл'), 'Personal Directive Russian label missing')
})

test('бандл v0.2.1 содержит обновлённые ключи dshmarket, better-sidebar, dsh-context, skill-hub', () => {
  assert.ok(clientCode.includes('Ускорение GitHub'), 'dshmarket GitHub acceleration missing')
  assert.ok(clientCode.includes('В этой сессии пока не было операций с файлами'), 'better-sidebar changesSessionEmpty missing')
  assert.ok(clientCode.includes('Статистика таймингов'), 'dsh-context timing.title missing')
  assert.ok(clientCode.includes('Переключить отслеживаемую версию'), 'skill-hub versionTitle missing')
})

test('бандл v0.2.1 содержит DOM-переводчик для dsh-hooks', () => {
  assert.ok(clientCode.includes('+ Добавить hook'), 'dsh-hooks addHook translation missing')
  assert.ok(clientCode.includes('Текущие хуки'), 'dsh-hooks currentHooks translation missing')
})
