import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

test('карточка: паритет ключей RU и EN (85/85)', () => {
  const buildPy = fs.readFileSync(path.join(ROOT, 'build.py'), 'utf-8')
  const start = buildPy.indexOf('card_ru = {')
  const end = buildPy.indexOf('\n}', start)
  const block = buildPy.slice(start, end + 2)
  const ruKeys = [...block.matchAll(/^\s*'([a-zA-Z0-9_]+)':/gm)].map(m => m[1])

  const templateJs = fs.readFileSync(path.join(ROOT, 'lib', 'client.template.js'), 'utf-8')
  const enStart = templateJs.indexOf('const CARD_EN = {')
  const enEnd = templateJs.indexOf('\n    }', enStart)
  const enBlock = templateJs.slice(enStart, enEnd + 6)
  const enObj = new Function(enBlock + '; return CARD_EN;')()
  const enKeys = Object.keys(enObj)

  assert.strictEqual(ruKeys.length, 85, `Ожидалось 85 RU-ключей, получено ${ruKeys.length}`)
  assert.strictEqual(enKeys.length, 85, `Ожидалось 85 EN-ключей, получено ${enKeys.length}`)

  const ruSet = new Set(ruKeys)
  const enSet = new Set(enKeys)

  for (const k of ruSet) {
    assert.ok(enSet.has(k), `Ключ ${k} отсутствует в CARD_EN`)
  }
  for (const k of enSet) {
    assert.ok(ruSet.has(k), `Ключ ${k} отсутствует в card_ru`)
  }
})

test('карточка: регистрация EN фолбэка и перевод при не-RU локали', () => {
  const clientJs = fs.readFileSync(path.join(ROOT, 'lib', 'client.js'), 'utf-8')
  assert.ok(clientJs.includes("ctx.locale.register(SETTINGS_NS_NAME, 'en', CARD_EN)"), 'Отсутствует вызов ctx.locale.register для CARD_EN')

  // Проверяем, что в кнопках оверрайдов используются t()-вызовы
  assert.ok(clientJs.includes("t('inspectorToggleOn')"), 'Кнопка инспектора не использует t()')
  assert.ok(clientJs.includes("t('exportJsonBtn')"), 'Кнопка экспорта не использует t()')
  assert.ok(clientJs.includes("t('importJsonBtn')"), 'Кнопка импорта не использует t()')
  assert.ok(clientJs.includes("t('overridesCopied')"), 'Alert копирования не использует t()')
  assert.ok(clientJs.includes("t('overridesImportPrompt')"), 'Prompt импорта не использует t()')
  assert.ok(clientJs.includes("t('overridesImportError')"), 'Alert ошибки импорта не использует t()')
})
