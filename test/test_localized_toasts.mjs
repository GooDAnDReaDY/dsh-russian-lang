import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { humanizeError, formatErrorToast } from '../lib/pure.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientJsPath = path.resolve(__dirname, '../lib/client.js')

test('humanizeError: локализует сетевые сбои (fetch, CORS, WebSocket)', () => {
  const eFetch = humanizeError(new TypeError('Failed to fetch'))
  assert.equal(eFetch.code, 'FETCH_FAILED')
  assert.equal(eFetch.title, 'Сетевой запрос не удался')
  assert.ok(eFetch.hint.includes('сетевое подключение'))

  const eCors = humanizeError('Cross-Origin Request Blocked: CORS request did not succeed')
  assert.equal(eCors.code, 'CORS_ERROR')
  assert.equal(eCors.title, 'Ошибка CORS')

  const eWs = humanizeError('WebSocket connection to wss://... failed')
  assert.equal(eWs.code, 'WS_CLOSED')
  assert.equal(eWs.title, 'Разрыв WebSocket')
})

test('humanizeError: локализует ошибки LLM API (квота, контекст, модель)', () => {
  const eQuota = humanizeError({ message: 'You exceeded your current quota, please check your plan (insufficient_quota)' })
  assert.equal(eQuota.code, 'QUOTA_EXCEEDED')
  assert.equal(eQuota.title, 'Исчерпана квота API')

  const eCtx = humanizeError('Error: maximum context length exceeded (token count exceeds model window)')
  assert.equal(eCtx.code, 'CONTEXT_OVERFLOW')
  assert.equal(eCtx.title, 'Превышен контекст')

  const eModel = humanizeError('The model deepseek-v9 does not exist (model_not_found)')
  assert.equal(eModel.code, 'MODEL_NOT_FOUND')
  assert.equal(eModel.title, 'Модель не найдена')
})

test('formatErrorToast: формирует структурированный объект тоста для UI', () => {
  const toast = formatErrorToast('connect ECONNREFUSED 127.0.0.1:8080')
  assert.ok(toast)
  assert.equal(toast.type, 'error')
  assert.equal(toast.title, 'Соединение отклонено')
  assert.ok(toast.description.includes('сервис запущен'))

  assert.equal(formatErrorToast(null), null)
  assert.equal(formatErrorToast(undefined), null)
})

test('client.js: экспортирует humanizeError, formatErrorToast и перехватывает тосты', () => {
  const clientJs = fs.readFileSync(clientJsPath, 'utf8')
  assert.ok(clientJs.includes('runtime.humanizeError'), 'runtime.humanizeError экспортирован')
  assert.ok(clientJs.includes('runtime.formatErrorToast'), 'runtime.formatErrorToast экспортирован')
  assert.ok(clientJs.includes('toastObserver'), 'toastObserver присутствует в client.js')
})
