// Comprehensive stability and edge-case unit test suite for lib/pure.js
import { test } from 'node:test'
import assert from 'node:assert'
import {
  humanizeError,
  ERROR_MAP,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  inflectWord,
  inflect,
  INFLECT_CUSTOM,
  fuzzyMatchRu,
  translitEnToRu,
  stemRussian,
  makeIssueUrl,
  exportSessionToMarkdown
} from '../lib/pure.js'

test('humanizeError: handles all declared POSIX and HTTP error codes', () => {
  const codes = [
    'ENOENT', 'EACCES', 'EPERM', 'ECONNREFUSED', 'ECONNRESET',
    'ETIMEDOUT', 'ENOTFOUND', 'EADDRINUSE', 'ENOSPC',
    '400', '401', '403', '404', '429', '500', '502', '503', '504'
  ]
  for (const c of codes) {
    assert.ok(ERROR_MAP[c], `ERROR_MAP must define ${c}`)
    const errObj = isNaN(Number(c)) ? { code: c } : { status: Number(c) }
    const res = humanizeError(errObj)
    assert.strictEqual(res.code, c)
    assert.ok(res.title.length > 0)
    assert.ok(res.hint.length > 0)
  }
})

test('humanizeError: extracts error status from Axios/Fetch response object', () => {
  const axiosErr = {
    message: 'Request failed with status code 504',
    response: { status: 504, statusText: 'Gateway Timeout' }
  }
  const res = humanizeError(axiosErr)
  assert.strictEqual(res.code, '504')
  assert.strictEqual(res.title, 'Шлюз не отвечает (Gateway Timeout)')

  const axios400 = {
    name: 'AxiosError',
    response: { status: 400 }
  }
  const res400 = humanizeError(axios400)
  assert.strictEqual(res400.code, '400')
  assert.strictEqual(res400.title, 'Некорректный запрос (Bad Request)')
})

test('humanizeError: extracts status and codes from raw string messages', () => {
  const r1 = humanizeError('Error: ECONNRESET: connection reset by peer')
  assert.strictEqual(r1.code, 'ECONNRESET')
  assert.strictEqual(r1.title, 'Сброс соединения')

  const r2 = humanizeError('ENOSPC: no space left on device, write')
  assert.strictEqual(r2.code, 'ENOSPC')
  assert.strictEqual(r2.title, 'Недостаточно места на диске')

  const r3 = humanizeError('HTTP 502 Bad Gateway while connecting upstream')
  assert.strictEqual(r3.code, '502')
  assert.strictEqual(r3.title, 'Ошибочный шлюз (Bad Gateway)')

  const r4 = humanizeError('API Error: 403 Forbidden')
  assert.strictEqual(r4.code, '403')
  assert.strictEqual(r4.title, 'Доступ запрещен')
})

test('humanizeError: pattern fallbacks for rate limiting and unauthorized', () => {
  const r1 = humanizeError('Error: Rate limit exceeded, please retry later')
  assert.strictEqual(r1.code, '429')

  const r2 = humanizeError('Failed: invalid api key provided')
  assert.strictEqual(r2.code, '401')
})

test('humanizeError: null, undefined and unknown error fallbacks', () => {
  assert.strictEqual(humanizeError(null), null)
  assert.strictEqual(humanizeError(undefined), null)

  const unk = humanizeError('Some random unhandled exception')
  assert.strictEqual(unk.code, 'UNKNOWN')
  assert.strictEqual(unk.title, 'Ошибка операции')
  assert.strictEqual(unk.message, 'Some random unhandled exception')
})

test('formatCurrency: formats currency properly in Russian locale', () => {
  const rub = formatCurrency(1500, 'RUB').replace(/\s/g, ' ')
  assert.ok(rub.includes('1 500') || rub.includes('1500'))
  assert.ok(rub.includes('₽') || rub.includes('руб'))

  const usd = formatCurrency(99.5, 'USD').replace(/\s/g, ' ')
  assert.ok(usd.includes('99,5') || usd.includes('99.5'))
  assert.ok(usd.includes('$'))

  assert.strictEqual(formatCurrency(null), '')
  assert.strictEqual(formatCurrency(''), '')
  assert.strictEqual(formatCurrency('abc'), 'abc')
})

test('formatRelativeTime: handles units, timestamps and edge cases', () => {
  assert.strictEqual(formatRelativeTime(-10, 'minute'), '10 минут назад')
  assert.strictEqual(formatRelativeTime(2, 'hour'), 'через 2 часа')
  assert.strictEqual(formatRelativeTime(1, 'month'), 'в следующем месяце')

  const nowMs = Date.now()
  assert.strictEqual(formatRelativeTime(nowMs), 'только что')
  assert.strictEqual(formatRelativeTime(new Date(nowMs)), 'только что')

  // Past 2 hours timestamp
  const twoHoursAgo = nowMs - (2 * 3600 * 1000)
  const pastRes = formatRelativeTime(twoHoursAgo)
  assert.strictEqual(pastRes, '2 часа назад')

  assert.strictEqual(formatRelativeTime(null), '')
  assert.strictEqual(formatRelativeTime(undefined), '')
  assert.strictEqual(formatRelativeTime('not-a-number'), 'not-a-number')
})

test('inflectWord: covers all custom nouns across all cases', () => {
  const cases = ['gen', 'dat', 'acc', 'ins', 'pre']
  for (const word of Object.keys(INFLECT_CUSTOM)) {
    for (const c of cases) {
      const form = inflectWord(word, c)
      assert.ok(form, `inflectWord('${word}', '${c}') should return form`)
      assert.strictEqual(form, INFLECT_CUSTOM[word][c])

      // Test title case preservation
      const titleWord = word[0].toUpperCase() + word.slice(1)
      const titleForm = inflectWord(titleWord, c)
      assert.strictEqual(titleForm[0], titleForm[0].toUpperCase())
    }
  }
})

test('inflectWord: generic morphology and immutable tokens', () => {
  // -ия
  assert.strictEqual(inflectWord('конфигурация', 'gen'), 'конфигурации')
  assert.strictEqual(inflectWord('конфигурация', 'dat'), 'конфигурации')
  assert.strictEqual(inflectWord('конфигурация', 'acc'), 'конфигурацию')
  assert.strictEqual(inflectWord('конфигурация', 'ins'), 'конфигурацией')

  // -а
  assert.strictEqual(inflectWord('команда', 'gen'), 'команды')
  assert.strictEqual(inflectWord('строка', 'gen'), 'строки')
  assert.strictEqual(inflectWord('кнопка', 'acc'), 'кнопку')

  // -й
  assert.strictEqual(inflectWord('сценарий', 'gen'), 'сценария')
  assert.strictEqual(inflectWord('сценарий', 'ins'), 'сценарием')

  // Latin, acronyms, and numbers
  assert.strictEqual(inflectWord('ClineBot', 'gen'), 'ClineBot')
  assert.strictEqual(inflectWord('DSH', 'ins'), 'DSH')
  assert.strictEqual(inflectWord('404', 'gen'), '404')
})

test('inflect: inflects multi-word Russian phrases', () => {
  const res = inflect('пользователь агент сессия', 'gen')
  assert.strictEqual(res, 'пользователя агента сессии')
  assert.strictEqual(inflect('', 'gen'), '')
  assert.strictEqual(inflect('тест', 'invalid_case'), 'тест')
})

test('fuzzyMatchRu & translitEnToRu: covers transliteration and morphology', () => {
  assert.strictEqual(fuzzyMatchRu('настройки', 'настройки'), 100)
  assert.strictEqual(fuzzyMatchRu('настройки', 'Все настройки системы'), 90)
  assert.strictEqual(fuzzyMatchRu('yfcnhjqrb', 'Все настройки системы'), 85)
  assert.strictEqual(fuzzyMatchRu('настройками', 'Все настройки системы'), 80)
  assert.strictEqual(fuzzyMatchRu('неизвестное', 'Все настройки системы'), 0)
  assert.strictEqual(fuzzyMatchRu('', 'test'), 0)
  assert.strictEqual(fuzzyMatchRu('test', null), 0)

  assert.strictEqual(translitEnToRu('ghbdtn'), 'привет')
})

test('makeIssueUrl: builds valid GitHub URL with encoded params and version', () => {
  const url = makeIssueUrl({
    ns: 'conversation',
    key: 'chat.send',
    en: 'Send',
    ru: 'Отправить',
    proposal: 'Отправить сообщение'
  }, '0.2.12')

  assert.ok(url.startsWith('https://github.com/GooDAnDReaDY/dsh-russian-lang/issues/new?'))
  const parsed = new URL(url)
  assert.strictEqual(parsed.searchParams.get('title'), '[Ошибка перевода] Неточный перевод фразы')
  const body = parsed.searchParams.get('body')
  assert.ok(body.includes('0.2.12'))
  assert.ok(body.includes('conversation'))
  assert.ok(body.includes('chat.send'))
  assert.ok(body.includes('Отправить сообщение'))
})

test('exportSessionToMarkdown: handles tool calls, roles and metadata', () => {
  const session = {
    title: 'Тест инструментов',
    model: 'deepseek-coder',
    workspace: '/home/project',
    createdAt: 1788891234000,
    messages: [
      { role: 'user', content: 'Выполни команду' },
      {
        role: 'assistant',
        content: 'Запускаю инструмент.',
        toolCalls: [
          { name: 'bash', arguments: { command: 'ls -la' } }
        ]
      },
      { role: 'tool', content: 'total 0' }
    ]
  }

  const md = exportSessionToMarkdown(session)
  assert.ok(md.includes('# 💬 Тест инструментов'))
  assert.ok(md.includes('> **Модель:** `deepseek-coder`'))
  assert.ok(md.includes('> **Рабочая область:** `/home/project`'))
  assert.ok(md.includes('👤 Пользователь'))
  assert.ok(md.includes('🤖 Ассистент'))
  assert.ok(md.includes('🔧 Инструмент (tool)'))
  assert.ok(md.includes('ls -la'))
})
