import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const BUNDLE = readFileSync(join(HERE, '..', 'lib', 'client.js'), 'utf8')

test('бандл v0.2.4 содержит словари новых плагинов (@goodandready/dsh-time-machine, context-lens, shadow-auditor, cost-meter, clinebot, lanmode)', () => {
  assert.match(BUNDLE, /"dsh-cost-meter":/)
  assert.match(BUNDLE, /"@goodandready\/dsh-time-machine":/)
  assert.match(BUNDLE, /"@goodandready\/dsh-context-lens":/)
  assert.match(BUNDLE, /"@goodandready\/dsh-shadow-auditor":/)
  assert.match(BUNDLE, /"dsh-clinebot":/)
  assert.match(BUNDLE, /"dsh-lanmode":/)
  assert.match(BUNDLE, /"dsh-kanban":/)
})

test('бандл v0.2.4 содержит новые пространства имён ядра DSH (trajectory, schedule.catalog, settings.pluginInventory)', () => {
  assert.match(BUNDLE, /"trajectory":/)
  assert.match(BUNDLE, /"schedule\.catalog":/)
  assert.match(BUNDLE, /"settings\.pluginInventory":/)
  assert.match(BUNDLE, /"approval":/)
  assert.match(BUNDLE, /"chat":/)
})

test('словари v0.2.4 сохраняют корректные плейсхолдеры', () => {
  assert.match(BUNDLE, /Импортировано \{n\} задач/)
  assert.match(BUNDLE, /Каждые \{value\} \{unit\}/)
  assert.match(BUNDLE, /Инструмент \{toolName\} запрашивает/)
  assert.match(BUNDLE, /Блок #\{index\} \{type\}/)
  assert.match(BUNDLE, /Выбрано моделей: \{count\}/)
})
