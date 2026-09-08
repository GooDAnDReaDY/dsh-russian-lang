import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const BUNDLE = readFileSync(join(HERE, '..', 'lib', 'client.js'), 'utf8')

test('бандл v0.2.7 содержит новые пространства имён ядра DSH (sidebarRight, sidebarFiles, sidebarTextpreview, open-in-app)', () => {
  assert.match(BUNDLE, /"sidebarRight":/)
  assert.match(BUNDLE, /"sidebarFiles":/)
  assert.match(BUNDLE, /"sidebarTextpreview":/)
  assert.match(BUNDLE, /"open-in-app":/)
})

test('бандл v0.2.7 содержит обновлённые переводы для ClineBot, BetterSidebar, Kanban, PluginConsole', () => {
  assert.match(BUNDLE, /Провайдер ClineBot \(ClinePass\)/)
  assert.match(BUNDLE, /Маскирование выключено/)
  assert.match(BUNDLE, /Автосинхронизация внешних сессий чата/)
  assert.match(BUNDLE, /Объединять все источники индекса/)
})

test('словари v0.2.7 сохраняют корректные плейсхолдеры', () => {
  assert.match(BUNDLE, /Открыть рабочую область в \{app\}/)
  assert.match(BUNDLE, /Показаны первые \{lines\} строк из \{total\}/)
  assert.match(BUNDLE, /Охлаждение: \{s\}с/)
  assert.match(BUNDLE, /Выбрано моделей: \{count\}/)
  assert.match(BUNDLE, /Нет навыков, соответствующих «\{query\}»/)
  assert.match(BUNDLE, /Текущая рабочая область \(\{name\}\)/)
  assert.match(BUNDLE, /Файлы ×\{count\}/)
})

