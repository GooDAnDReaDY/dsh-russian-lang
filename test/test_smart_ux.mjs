import { test } from 'node:test'
import assert from 'node:assert'
import {
  formatInputLive,
  expandSlashAlias,
  phoneticTranslit,
  detectInputLayout,
  SYSTEM_PROMPT_PRESETS,
  exportSessionToMarkdown
} from '../lib/pure.js'

test('formatInputLive: форматирует кавычки, тире, многоточие и неразрывные пробелы', () => {
  const input = 'Тест "кавычек" и -- тире... в коде'
  const formatted = formatInputLive(input)
  assert.match(formatted, /«кавычек»/)
  assert.match(formatted, /—/)
  assert.match(formatted, /…/)
  assert.match(formatted, /в\u00A0коде/)
})

test('formatInputLive: НЕ форматирует код внутри бэктиков', () => {
  const code = 'Текст с кодом `npm run "test" --force ...` и "типографика"'
  const formatted = formatInputLive(code)
  assert.ok(formatted.includes('`npm run "test" --force ...`'))
  assert.ok(formatted.includes('«типографика»'))
})

test('formatInputLive: НЕ форматирует fenced code blocks', () => {
  const block = '```\nconst x = "hello" -- 1;\n```\n"привет"'
  const formatted = formatInputLive(block)
  assert.ok(formatted.includes('const x = "hello" -- 1;'))
  assert.ok(formatted.includes('«привет»'))
})

test('expandSlashAlias: разворачивает русские алиасы команд DSH', () => {
  assert.strictEqual(expandSlashAlias('/цель написать тесты'), '/goal написать тесты')
  assert.strictEqual(expandSlashAlias('/сжать'), '/compact')
  assert.strictEqual(expandSlashAlias('/план проекта'), '/plan проекта')
  assert.strictEqual(expandSlashAlias('/экспорт md'), '/export md')
  assert.strictEqual(expandSlashAlias('/память очистить'), '/memory очистить')
  assert.strictEqual(expandSlashAlias('/неизвестнаякоманда'), '/неизвестнаякоманда')
})

test('phoneticTranslit: преобразует транслит в обе стороны', () => {
  assert.strictEqual(phoneticTranslit('privet', 'lat2cyr'), 'привет')
  assert.strictEqual(phoneticTranslit('shchuka', 'lat2cyr'), 'щука')
  assert.strictEqual(phoneticTranslit('привет', 'cyr2lat'), 'privet')
})

test('detectInputLayout: распознаёт текущую раскладку ввода', () => {
  assert.strictEqual(detectInputLayout('Привет как дела'), 'RU')
  assert.strictEqual(detectInputLayout('Hello world test'), 'EN')
  assert.strictEqual(detectInputLayout(''), null)
})

test('SYSTEM_PROMPT_PRESETS: содержит три выверенных стиля промпта', () => {
  assert.ok(SYSTEM_PROMPT_PRESETS.technical_expert)
  assert.ok(SYSTEM_PROMPT_PRESETS.tech_writer)
  assert.ok(SYSTEM_PROMPT_PRESETS.concise)
  assert.match(SYSTEM_PROMPT_PRESETS.technical_expert.text, /инженерную терминологию/)
  assert.match(SYSTEM_PROMPT_PRESETS.tech_writer.text, /правила русской типографики/)
  assert.match(SYSTEM_PROMPT_PRESETS.concise.text, /максимально кратко/)
})

test('exportSessionToMarkdown: формирует валидный Markdown-документ на русском', () => {
  const session = {
    title: 'Тестовая сессия',
    createdAt: 1788890000000,
    model: 'deepseek-chat',
    workspace: '/project',
    messages: [
      { role: 'user', content: 'Привет' },
      { role: 'assistant', content: 'Здравствуйте! Чем помочь?' }
    ]
  }
  const md = exportSessionToMarkdown(session)
  assert.match(md, /# 💬 Тестовая сессия/)
  assert.match(md, /> \*\*Дата экспорта:\*\*/)
  assert.match(md, /👤 Пользователь/)
  assert.match(md, /🤖 Ассистент/)
  assert.match(md, /Здравствуйте!/)
})
