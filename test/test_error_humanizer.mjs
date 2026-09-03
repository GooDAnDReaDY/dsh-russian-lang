// Человекочитаемые системные и сетевые ошибки. Импорт из lib/pure.js —
// проверяется отгружаемый код (#133).
import { test } from 'node:test'
import assert from 'node:assert'
import { humanizeError, ERROR_MAP } from '../lib/pure.js'

test('humanizeError translates Node.js POSIX errors', () => {
  const e1 = humanizeError({ code: 'ENOENT', message: 'ENOENT: no such file or directory, open /app/config.json' })
  assert.equal(e1.code, 'ENOENT')
  assert.equal(e1.title, 'Файл не найден')
  assert.ok(e1.hint.includes('пути к файлу'))

  const e2 = humanizeError('Error: connect ECONNREFUSED 127.0.0.1:8080')
  assert.equal(e2.code, 'ECONNREFUSED')
  assert.equal(e2.title, 'Соединение отклонено')
})

test('humanizeError translates HTTP and API errors', () => {
  const e1 = humanizeError({ status: 429, message: 'Request rate limit exceeded' })
  assert.equal(e1.code, '429')
  assert.equal(e1.title, 'Превышен лимит запросов')

  const e2 = humanizeError('401 Unauthorized: Invalid API key')
  assert.equal(e2.code, '401')
  assert.equal(e2.title, 'Требуется авторизация')
})

test('humanizeError provides graceful fallback for unknown errors', () => {
  const e = humanizeError('Something unusual happened')
  assert.equal(e.code, 'UNKNOWN')
  assert.equal(e.title, 'Ошибка операции')
  assert.equal(e.raw, 'Something unusual happened')
})
