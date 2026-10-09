import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractPlaceholders, validatePlaceholders, makeIssueUrl } from '../lib/pure.js'

test('extractPlaceholders extracts curly and printf-style placeholders', () => {
  assert.deepEqual(extractPlaceholders('Hello {name}, you have {count} messages.'), ['{name}', '{count}'])
  assert.deepEqual(extractPlaceholders('Uploaded %d of %d files (%s)'), ['%d', '%s'])
  assert.deepEqual(extractPlaceholders('No placeholders here'), [])
  assert.deepEqual(extractPlaceholders(null), [])
})

test('validatePlaceholders verifies placeholder integrity between original and translation', () => {
  const orig = 'Model {model} completed turn in {timeMs} ms (%s).'
  
  // Valid translation containing all placeholders
  const validTrans = 'Модель {model} завершила шаг за {timeMs} мс (%s).'
  const res1 = validatePlaceholders(orig, validTrans)
  assert.equal(res1.valid, true)
  assert.deepEqual(res1.missing, [])

  // Missing one placeholder
  const missingTrans = 'Модель {model} завершила шаг за 100 мс (%s).'
  const res2 = validatePlaceholders(orig, missingTrans)
  assert.equal(res2.valid, false)
  assert.deepEqual(res2.missing, ['{timeMs}'])
  assert.ok(res2.error.includes('{timeMs}'))

  // Text with no placeholders in original
  const res3 = validatePlaceholders('Simple text', 'Простой текст')
  assert.equal(res3.valid, true)
  assert.deepEqual(res3.missing, [])
})

test('makeIssueUrl generates valid proposal URL with Before/After preview and context (#485)', () => {
  const url = makeIssueUrl({
    isProposal: true,
    original: 'Discard unsaved changes?',
    current: 'Отменить изменения?',
    override: 'Сбросить несохранённое?',
    proposal: 'Отменить несохранённые изменения?',
    comment: 'В оригинале есть слово unsaved, это важный контекст.',
    ns: 'dsh-cron',
    key: 'modal.confirmDiscard',
    plugin: '@goodandready/dsh-cron',
    pluginVersion: '0.2.50',
    dshVersion: '0.2.1-alpha.1'
  }, '0.3.41')

  assert.ok(url.startsWith('https://github.com/GooDAnDReaDY/dsh-russian-lang/issues/new?'))
  const parsed = new URL(url)
  const title = parsed.searchParams.get('title')
  const body = parsed.searchParams.get('body')

  assert.ok(title.includes('[Предложение перевода]'))
  assert.ok(title.includes('@goodandready/dsh-cron'))
  assert.ok(title.includes('modal.confirmDiscard'))

  assert.ok(body.includes('Discard unsaved changes?'))
  assert.ok(body.includes('Отменить изменения?'))
  assert.ok(body.includes('Сбросить несохранённое?'))
  assert.ok(body.includes('Отменить несохранённые изменения?'))
  assert.ok(body.includes('В оригинале есть слово unsaved'))
  assert.ok(body.includes('dsh-cron'))
  assert.ok(body.includes('0.2.50'))
  assert.ok(body.includes('0.3.41'))
})

test('makeIssueUrl handles proposal with DOM/fallback context when key is unknown (#485)', () => {
  const url = makeIssueUrl({
    isProposal: true,
    original: 'Quick Launch',
    current: 'Быстрый пуск',
    proposal: 'Быстрый запуск',
    ns: '',
    key: ''
  }, '0.3.41')

  const parsed = new URL(url)
  const body = parsed.searchParams.get('body')

  assert.ok(body.includes('(DOM узел)'))
  assert.ok(body.includes('Quick Launch'))
  assert.ok(body.includes('Быстрый запуск'))
})
