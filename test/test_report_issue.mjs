import { test } from 'node:test'
import assert from 'node:assert'

const makeIssueUrl = (opts = {}) => {
  const repo = 'GooDAnDReaDY/dsh-russian-lang'
  const title = opts.title || (opts.plugin ? `[Перевод] Запрос локализации для плагина ${opts.plugin}` : '[Ошибка перевода] Неточный перевод фразы')
  const bodyLines = [
    '### Описание проблемы',
    opts.description || (opts.plugin ? `Просьба добавить русскую локализацию для плагина \`${opts.plugin}\`.` : 'Обнаружена неточность в переводе интерфейса.'),
    '',
    '### Технический контекст',
    opts.ns ? `- **Namespace**: \`${opts.ns}\`` : null,
    opts.key ? `- **Ключ**: \`${opts.key}\`` : null,
    opts.en ? `- **Оригинал (EN)**: ${opts.en}` : null,
    opts.ru ? `- **Текущий перевод (RU)**: ${opts.ru}` : null,
    opts.plugin ? `- **Плагин**: \`${opts.plugin}\`` : null,
    `- **Версия dsh-russian-lang**: \`0.1.29\``,
    opts.userAgent ? `- **User Agent**: \`${opts.userAgent}\`` : null,
    '',
    '### Предлагаемый вариант перевода',
    opts.proposal || '_Опишите ваш вариант перевода..._'
  ].filter(Boolean)

  const params = new URLSearchParams()
  params.set('title', title)
  params.set('body', bodyLines.join('\n'))
  return `https://github.com/${repo}/issues/new?` + params.toString()
}

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
