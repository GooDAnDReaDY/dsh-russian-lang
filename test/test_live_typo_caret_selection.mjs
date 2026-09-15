import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const clientCode = fs.readFileSync(clientPath, 'utf-8')

test('Issue #198: typoNode исключает contenteditable и composer-элементы', () => {
  assert.ok(
    clientCode.includes('[contenteditable="true"]') &&
    clientCode.includes('[data-composer-input]') &&
    clientCode.includes('[role="textbox"]'),
    'typoNode должен проверять contenteditable и data-composer-input в closest'
  )
})

test('Issue #198: typoNode исключает активные контейнеры стриминга', () => {
  assert.ok(
    clientCode.includes('[data-chat-flow-status="running"]') ||
    clientCode.includes('[data-streaming="true"]') ||
    clientCode.includes('[data-turn-tail]'),
    'typoNode должен проверять маркеры стриминга чтобы не портить выделение'
  )
})

test('Issue #198: typoNode защищает активное выделение пользователя (getSelection)', () => {
  assert.ok(
    clientCode.includes('intersectsNode') || clientCode.includes('containsNode'),
    'typoNode должен проверять пересечение с активным Selection/Range'
  )
})

test('Issue #198: typoObserver не слушает characterData во избежание шторма мутаций при стриминге', () => {
  assert.ok(
    clientCode.includes("typoObserver.observe(document.body, { childList: true, subtree: true })"),
    'typoObserver должен наблюдать только за childList: true, без characterData: true'
  )
})

test('Issue #198: setComposerText больше не содержит setTimeout(apply, 15)', () => {
  assert.ok(
    !clientCode.includes('setTimeout(apply, 15)') && !clientCode.includes('setTimeout(apply,15)'),
    'setComposerText не должен откладывать повторное применение через setTimeout(15)'
  )
})

test('Issue #198: layoutOnInput не перезаписывает весь composer на каждый ввод', () => {
  const inputHandlerIdx = clientCode.indexOf('const layoutOnInput = (ev) => {')
  assert.ok(inputHandlerIdx !== -1, 'layoutOnInput найден')
  const nextHandlerIdx = clientCode.indexOf('const layoutOnKeydown = (ev) => {', inputHandlerIdx)
  assert.ok(nextHandlerIdx !== -1, 'layoutOnKeydown найден')
  const layoutOnInputBody = clientCode.slice(inputHandlerIdx, nextHandlerIdx)

  assert.ok(
    !layoutOnInputBody.includes('formatInputLive(value)'),
    'layoutOnInput НЕ должен вызывать formatInputLive(value) для перезаписи всего документа'
  )
  assert.ok(
    !layoutOnInputBody.includes('setComposerText(el, formatted'),
    'layoutOnInput НЕ должен вызывать setComposerText на каждом событии input'
  )
})

test('Issue #198: layoutOnKeydown содержит локальную замену тире, кавычек и NBSP у каретки', () => {
  const keydownIdx = clientCode.indexOf('const layoutOnKeydown = (ev) => {')
  assert.ok(keydownIdx !== -1, 'layoutOnKeydown найден')
  const effectIdx = clientCode.indexOf('ctx.effect(() => {', keydownIdx)
  const keydownBody = clientCode.slice(keydownIdx, effectIdx)

  // Замена двойного дефиса на тире
  assert.ok(keydownBody.includes("ev.key === '-'"), 'обработка дефиса')
  assert.ok(keydownBody.includes("'—'"), 'вставка длинного тире')

  // Замена кавычек на елочки
  assert.ok(keydownBody.includes("ev.key === '\"'"), 'обработка кавычек')
  assert.ok(keydownBody.includes("'«'") && keydownBody.includes("'»'"), 'кавычки-елочки')

  // Неразрывный пробел
  assert.ok(keydownBody.includes("ev.key === ' '"), 'обработка пробела')
  assert.ok(keydownBody.includes('\\u00A0'), 'вставка неразрывного пробела')

  // Защита блоков кода
  assert.ok(keydownBody.includes('isCaretInCode'), 'проверка каретки внутри блоков кода')
})

test('Issue #198: Alt+L поддерживает замену только выделенного фрагмента текста', () => {
  const keydownIdx = clientCode.indexOf('const layoutOnKeydown = (ev) => {')
  const effectIdx = clientCode.indexOf('ctx.effect(() => {', keydownIdx)
  const keydownBody = clientCode.slice(keydownIdx, effectIdx)

  assert.ok(
    keydownBody.includes('selectedText') && keydownBody.includes('!sel.isCollapsed'),
    'Alt+L должен проверять и конвертировать только выделенный фрагмент'
  )
})
