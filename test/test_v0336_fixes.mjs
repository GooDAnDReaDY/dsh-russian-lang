import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { isLoopback } from '../lib/translator.js'
import { exportSessionToMarkdown } from '../lib/pure.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const indexSrc = readFileSync(join(HERE, '..', 'lib', 'index.js'), 'utf-8')
const updaterSrc = readFileSync(join(HERE, '..', 'lib', 'plugin-updater.js'), 'utf-8')
const translatorSrc = readFileSync(join(HERE, '..', 'lib', 'translator.js'), 'utf-8')
const imagegenRu = JSON.parse(readFileSync(join(HERE, '..', 'ru-plugins', '68-image-gen.json'), 'utf-8'))

test('Fix #458: isLoopback exported and validates loopback addresses', () => {
  assert.strictEqual(typeof isLoopback, 'function')
  assert.strictEqual(isLoopback('127.0.0.1'), true)
  assert.strictEqual(isLoopback('::1'), true)
  assert.strictEqual(isLoopback('localhost'), true)
  assert.strictEqual(isLoopback('::ffff:127.0.0.1'), true)
  assert.strictEqual(isLoopback('192.168.1.111'), false)
  assert.strictEqual(isLoopback('10.0.0.1'), false)
  assert.strictEqual(isLoopback(null), false)
  assert.strictEqual(isLoopback(undefined), false)

  // Verify setup route enforces loopback
  assert.ok(
    translatorSrc.includes('!isLoopback(request?.socket?.remoteAddress)'),
    'translator.js setup route must check socket loopback'
  )
})

test('Fix #459: Google fallback translation is batched and capped', () => {
  assert.ok(translatorSrc.includes('MAX_REQUESTS'), 'translator.js must define MAX_REQUESTS cap')
  assert.ok(translatorSrc.includes('MAX_CHUNK_LEN'), 'translator.js must define MAX_CHUNK_LEN for batching')
})

test('Fix #461: updater does not pass --config.minimumReleaseAge=0', () => {
  assert.strictEqual(
    updaterSrc.includes('--config.minimumReleaseAge=0'),
    false,
    'lib/plugin-updater.js must NOT pass --config.minimumReleaseAge=0'
  )
})

test('Fix #455 & #460: settings listener handles settings/document-updated', () => {
  assert.ok(
    indexSrc.includes("ctx.on('settings/document-updated'"),
    'lib/index.js must listen on settings/document-updated'
  )
  assert.ok(
    indexSrc.includes("id === 'dsh-russian-lang'"),
    'lib/index.js must handle dsh-russian-lang identifier'
  )
})

test('Fix #462: HTTP catch handlers do not echo raw internal error traces', () => {
  assert.strictEqual(
    indexSrc.includes('JSON.stringify({ error: String(err) })'),
    false,
    'lib/index.js must not echo raw String(err)'
  )
  assert.ok(
    indexSrc.includes("JSON.stringify({ error: 'Internal server error' })"),
    'lib/index.js must return sanitized error'
  )
  assert.ok(
    translatorSrc.includes("JSON.stringify({ error: 'Translator setup failed' })"),
    'translator setup route must return sanitized error'
  )
})

test('Fix #463: exportSessionToMarkdown supports options parameter', () => {
  const session = {
    title: 'Тестовый сеанс',
    createdAt: '2026-10-05T00:00:00.000Z',
    model: 'test-model',
    workspace: 'test-workspace',
    messages: [
      {
        role: 'user',
        content: 'Привет!',
      },
      {
        role: 'assistant',
        content: 'Здравствуйте! Чем помочь?',
        toolCalls: [{ name: 'testTool', arguments: { q: 1 } }]
      }
    ]
  }

  // 1. Default output has tool calls and timestamps
  const defaultMd = exportSessionToMarkdown(session)
  assert.ok(defaultMd.includes('testTool'), 'default includes tool calls')
  assert.ok(defaultMd.includes('Дата экспорта:'), 'default includes export date')

  // 2. includeToolCalls = false
  const noToolsMd = exportSessionToMarkdown(session, { includeToolCalls: false })
  assert.strictEqual(noToolsMd.includes('testTool'), false, 'includeToolCalls: false removes tools')
  assert.ok(noToolsMd.includes('Здравствуйте! Чем помочь?'), 'content preserved')

  // 3. includeTimestamps = false
  const noTimeMd = exportSessionToMarkdown(session, { includeTimestamps: false })
  assert.strictEqual(noTimeMd.includes('Дата экспорта:'), false, 'includeTimestamps: false removes date')

  // 4. Custom title and footer
  const customMd = exportSessionToMarkdown(session, { title: 'Кастомный заголовок', footer: 'КОНЕЦ' })
  assert.ok(customMd.includes('# 💬 Кастомный заголовок'))
  assert.ok(customMd.endsWith('КОНЕЦ'))
})

test('Fix #453: dsh-image-gen RU dictionary contains translated form and remix fields', () => {
  const ig = imagegenRu['dsh-image-gen']
  assert.strictEqual(ig['f.needFal'], 'Требуется API-ключ FAL')
  assert.strictEqual(ig['f.localKind'], 'Архитектура локального движка')
  assert.strictEqual(ig['f.historyLimit'], 'Лимит истории')
  assert.strictEqual(ig['f.autoEnhancePrompt'], 'Автоулучшение промпта')
  assert.strictEqual(ig['f.cacheBySeed'], 'Кэширование по сиду и промпту')
  assert.strictEqual(ig['remix.drawer_title'], 'Панель вариаций и ремикса стилей')
  assert.strictEqual(ig['remix.copied'], '✓ Скопировано!')
  assert.strictEqual(ig['updater.title'], 'Обновление плагина')
  assert.strictEqual(ig['card.seedPrefix'], 'Сид')
  assert.strictEqual(ig['card.unknownError'], 'Произошла неизвестная ошибка во время генерации.')
})
