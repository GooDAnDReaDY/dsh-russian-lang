// Ссылка «сообщить о проблеме перевода». Импорт из lib/pure.js —
// проверяется отгружаемый код (#133).
import { test } from 'node:test'
import assert from 'node:assert'
import { makeIssueUrl } from '../lib/pure.js'

test('makeIssueUrl generates valid GitHub new issue link for translation mistake', () => {
  const url = makeIssueUrl({
    ns: 'conversation',
    key: 'composer.placeholder',
    en: 'Send a message...',
    ru: 'Отправить сообщение...'
  })
  assert.ok(url.startsWith('https://github.com/GooDAnDReaDY/dsh-russian-lang/issues/new?'))
  const parsed = new URL(url)
  assert.equal(parsed.searchParams.get('title'), '[Ошибка перевода] Неточный перевод фразы')
  const body = parsed.searchParams.get('body')
  assert.ok(body.includes('composer.placeholder'))
  assert.ok(body.includes('conversation'))
})

test('makeIssueUrl generates valid GitHub link for plugin localization request', () => {
  const url = makeIssueUrl({
    plugin: 'dsh-custom-plugin'
  })
  const parsed = new URL(url)
  assert.equal(parsed.searchParams.get('title'), '[Перевод] Запрос локализации для плагина dsh-custom-plugin')
  assert.ok(parsed.searchParams.get('body').includes('dsh-custom-plugin'))
})
