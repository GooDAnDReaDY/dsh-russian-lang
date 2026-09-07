import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const BUNDLE = readFileSync(join(HERE, '..', 'lib', 'client.js'), 'utf8')

test('бандл v0.2.6 содержит обновлённые словари kanban, session-control, context и pin (navbar)', () => {
  assert.match(BUNDLE, /"dsh-kanban":/)
  assert.match(BUNDLE, /"dsh-session-control":/)
  assert.match(BUNDLE, /"dsh-context":/)
  assert.match(BUNDLE, /"pin":/)
})

test('бандл v0.2.6 содержит новые переводы Acceptance Gate, DoD, Comments и Reports в Kanban', () => {
  assert.match(BUNDLE, /Приёмка и проверка задачи/)
  assert.match(BUNDLE, /Вернуть на доработку/)
  assert.match(BUNDLE, /Критерии готовности \(DoD\)/)
  assert.match(BUNDLE, /Отчёт о выполнении/)
  assert.match(BUNDLE, /Обсуждение и комментарии/)
})

test('бандл v0.2.6 содержит новые переводы для Session Control, Context и Navbar', () => {
  assert.match(BUNDLE, /Режим ДНК/)
  assert.match(BUNDLE, /Ленточная полоса элементов в порядке чтения контекста моделью/)
  assert.match(BUNDLE, /Перейти к диалогу/)
  assert.match(BUNDLE, /Копировать как Markdown/)
  assert.match(BUNDLE, /"action\.pin":"Закрепить"/)
  assert.match(BUNDLE, /"action\.unpin":"Открепить"/)
})

test('словари v0.2.6 сохраняют корректные плейсхолдеры', () => {
  assert.match(BUNDLE, /Возвращено на доработку: \{reason\}/)
  assert.match(BUNDLE, /DoD: \{done\} из \{total\}/)
  assert.match(BUNDLE, /Подтверждение: \{text\}/)
  assert.match(BUNDLE, /Добавить в «\{name\}»/)
  assert.match(BUNDLE, /выбрано: \{n\}/)
  assert.match(BUNDLE, /Отображается только \{cat\}/)
})
