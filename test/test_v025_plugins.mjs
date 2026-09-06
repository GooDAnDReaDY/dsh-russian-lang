import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const BUNDLE = readFileSync(join(HERE, '..', 'lib', 'client.js'), 'utf8')

test('бандл v0.2.5 содержит словари новых плагинов (pluginConsole, better-input, autoReview, session-control, memory-brain, llm-wiki, task-tracker, usage-guard, automode, plugin-guard)', () => {
  assert.match(BUNDLE, /"settings\.pluginConsole":/)
  assert.match(BUNDLE, /"better-input":/)
  assert.match(BUNDLE, /"settings\.autoReview":/)
  assert.match(BUNDLE, /"dsh-session-control":/)
  assert.match(BUNDLE, /"@goodandready-private\/dsh-memory-brain":/)
  assert.match(BUNDLE, /"dsh-llm-wiki":/)
  assert.match(BUNDLE, /"dsh-task-tracker":/)
  assert.match(BUNDLE, /"dsh-usage-guard":/)
  assert.match(BUNDLE, /"dsh-auto-mode\.permission":/)
  assert.match(BUNDLE, /"dsh-plugin-guard":/)
})

test('бандл v0.2.5 содержит обновлённые переводы context, context-lens, shadow-auditor', () => {
  assert.match(BUNDLE, /"dsh-context":/)
  assert.match(BUNDLE, /"@goodandready\/dsh-context-lens":/)
  assert.match(BUNDLE, /"@goodandready\/dsh-shadow-auditor":/)
})

test('словари v0.2.5 сохраняют корректные плейсхолдеры', () => {
  assert.match(BUNDLE, /dsh-context поддерживает DeepSeek Harness версии \{minimum\} или новее\./)
  assert.match(BUNDLE, /Включать последние N реплик как контекст для оптимизации\./)
  assert.match(BUNDLE, /ИИ выполняет развёртывание…/)
  assert.match(BUNDLE, /Оптимизировать промпт/)
  assert.match(BUNDLE, /Порог срабатывания предохранителя/)
  assert.match(BUNDLE, /Управление сессиями \(Session Control\)/)
  assert.match(BUNDLE, /Разрешение автономного режима/)
})
