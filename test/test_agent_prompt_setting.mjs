// Тест настройки agentPrompt (#148).
//
// Проверяет:
// 1. Клиентская карточка настроек пишет в top-level поле 'agentPrompt' через scope.set('agentPrompt', ...),
//    а не в overrides.agentPrompt (#148).
// 2. Схема настроек на сервере (lib/index.js) объявляет agentPrompt как top-level boolean.
// 3. Серверная часть подписывается на settings/updated и читает value.agentPrompt.

import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const CLIENT_BUNDLE = readFileSync(join(HERE, '..', 'lib', 'client.js'), 'utf8')
const SERVER_INDEX = readFileSync(join(HERE, '..', 'lib', 'index.js'), 'utf8')

test('клиентская карточка: agentPrompt читается из value.agentPrompt', () => {
  assert.match(CLIENT_BUNDLE, /checkbox\(value\.agentPrompt === true/)
  assert.doesNotMatch(CLIENT_BUNDLE, /value\.overrides && value\.overrides\.agentPrompt/)
})

test('клиентская карточка: agentPrompt сохраняется через scope.set(\'agentPrompt\', ...)', () => {
  assert.match(CLIENT_BUNDLE, /scope\.set\(['"]agentPrompt['"],\s*ev\.target\.checked\)/)
  assert.doesNotMatch(CLIENT_BUNDLE, /scope\.set\(['"]overrides['"],\s*next\).*agentPrompt/s)
})

test('серверная схема: agentPrompt объявлен в схеме верхнего уровня', () => {
  assert.match(SERVER_INDEX, /agentPrompt:\s*z\.boolean\(\)\.required\(false\)/)
})

test('серверная подписка: sync() читает value.agentPrompt', () => {
  assert.match(SERVER_INDEX, /const want = !!\(value && value\.agentPrompt\)/)
})
