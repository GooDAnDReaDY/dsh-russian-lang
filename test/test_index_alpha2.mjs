// Тест миграции на DSH alpha.2 (issue #89): серверная половина не должна
// импортировать удалённый settingsNamespace и должна регистрировать namespace
// строкой. Запуск: node --test test/test_index_alpha2.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const here = dirname(fileURLToPath(import.meta.url))
const indexSrc = readFileSync(join(here, '..', 'lib', 'index.js'), 'utf8')

test('lib/index.js не импортирует settingsNamespace (alpha.2)', () => {
  assert.ok(!indexSrc.includes('settingsNamespace'), 'settingsNamespace должен быть удалён')
  assert.ok(!indexSrc.includes('@deepseek-ai/dsh-settings'), 'импорт dsh-settings должен быть удалён')
})

test('lib/index.js регистрирует namespace строкой', () => {
  assert.match(indexSrc, /settings\.register\('russian-lang'/, 'register должен принимать строку')
  assert.match(indexSrc, /const NS = 'russian-lang'/, 'NS должен быть строкой')
})
