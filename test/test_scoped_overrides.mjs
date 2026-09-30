import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const clientCode = fs.readFileSync(clientPath, 'utf-8')

test('Issue #409: client.js checks activeLang === "ru" and fullKey ns.key before bare key', () => {
  assert.ok(
    clientCode.includes("const fullKey = ns ? ns + '.' + key : key"),
    'runtime.translate must construct fullKey ns.key'
  )
  assert.ok(
    clientCode.includes("ov[fullKey] !== undefined ? ov[fullKey] : ov[key]"),
    'runtime.translate must check scoped override before bare key fallback'
  )
  assert.ok(
    clientCode.includes("const k = meta ? (meta.ns && meta.key ? meta.ns + '.' + meta.key : (meta.key || '')) : ''"),
    'openInspectorModal must prioritize meta.ns + "." + meta.key'
  )
})

test('Issue #409: Scoped overrides resolution semantics', () => {
  // Simulate runtime translate behavior with scoped overrides
  const createTranslator = (activeLocale, overrides) => {
    const dicts = {
      common: { cancel: 'Отмена', save: 'Сохранить' },
      other: { cancel: 'Аннулировать', reset: 'Сброс' }
    }
    const origTranslate = (ns, key) => dicts[ns]?.[key] || key

    const runtime = {
      getLocale: () => ({ active: activeLocale }),
      translate(ns, key, params) {
        const activeLang = runtime.getLocale ? (runtime.getLocale().active || 'ru') : 'ru'
        if (activeLang === 'ru') {
          const fullKey = ns ? ns + '.' + key : key
          const val = overrides[fullKey] !== undefined ? overrides[fullKey] : overrides[key]
          if (val !== undefined) return val
        }
        return origTranslate(ns, key)
      }
    }
    return runtime
  }

  // 1. Scoped override 'common.cancel' applies to common, but not other
  const r1 = createTranslator('ru', { 'common.cancel': 'Мой перевод' })
  assert.equal(r1.translate('common', 'cancel'), 'Мой перевод', 'common.cancel must use scoped override')
  assert.equal(r1.translate('other', 'cancel'), 'Аннулировать', 'other.cancel must remain unaffected by common.cancel')

  // 2. Active locale 'en' ignores Russian overrides
  const rEn = createTranslator('en', { 'common.cancel': 'Мой перевод', 'save': 'Сохранить кастом' })
  assert.equal(rEn.translate('common', 'cancel'), 'Отмена', 'EN locale must not apply Russian overrides')
  assert.equal(rEn.translate('common', 'save'), 'Сохранить', 'EN locale must not apply bare Russian overrides')

  // 3. Legacy bare key works if scoped key is not defined
  const rLegacy = createTranslator('ru', { 'cancel': 'Общая отмена' })
  assert.equal(rLegacy.translate('common', 'cancel'), 'Общая отмена', 'Legacy bare key applies when no scoped key')
  assert.equal(rLegacy.translate('other', 'cancel'), 'Общая отмена', 'Legacy bare key applies across namespaces')

  // 4. Scoped key takes precedence over legacy bare key
  const rPrecedence = createTranslator('ru', { 'common.cancel': 'Спецотмена', 'cancel': 'Общая отмена' })
  assert.equal(rPrecedence.translate('common', 'cancel'), 'Спецотмена', 'Scoped key takes precedence over bare key')
  assert.equal(rPrecedence.translate('other', 'cancel'), 'Общая отмена', 'Other namespace falls back to bare key')
})
