import test from 'node:test'
import assert from 'node:assert/strict'
import { findTranslationKey, generateBugReportSnippet } from '../lib/pure.js'

test('Issue #330: findTranslationKey bidirectional lookups and untranslated detection', () => {
  const dicts = {
    common: { save: 'Сохранить', cancel: 'Отмена' },
    plugins: { refresh: 'Обновить' }
  }
  const overrides = {
    'cancel': 'Отменить действие',
    'custom.hello': 'Приветствие'
  }
  const zhRu = {
    '重试': 'Повторить',
    '设置': 'Настройки'
  }
  const domEn = {
    'Full access': 'Полный доступ',
    'Auto mode': 'Автоматический режим'
  }

  // 1. Direct override by key
  const byKey = findTranslationKey('cancel', dicts, overrides, zhRu, domEn)
  assert.ok(byKey)
  assert.equal(byKey.source, 'override')
  assert.equal(byKey.value, 'Отменить действие')

  // 2. Override by value
  const byVal = findTranslationKey('Отменить действие', dicts, overrides, zhRu, domEn)
  assert.ok(byVal)
  assert.equal(byVal.source, 'override')
  assert.equal(byVal.key, 'cancel')

  // 3. Dictionary lookup
  const dictMatch = findTranslationKey('Сохранить', dicts, overrides, zhRu, domEn)
  assert.ok(dictMatch)
  assert.equal(dictMatch.source, 'dictionary')
  assert.equal(dictMatch.ns, 'common')
  assert.equal(dictMatch.key, 'save')

  // 4. zhRu lookup by Russian translation
  const zhMatchRu = findTranslationKey('Повторить', dicts, overrides, zhRu, domEn)
  assert.ok(zhMatchRu)
  assert.equal(zhMatchRu.source, 'dom_zh')
  assert.equal(zhMatchRu.zh, '重试')

  // 5. zhRu lookup by Chinese original
  const zhMatchOrig = findTranslationKey('设置', dicts, overrides, zhRu, domEn)
  assert.ok(zhMatchOrig)
  assert.equal(zhMatchOrig.source, 'dom_zh_original')
  assert.equal(zhMatchOrig.value, 'Настройки')

  // 6. domEn lookup by Russian translation
  const enMatchRu = findTranslationKey('Полный доступ', dicts, overrides, zhRu, domEn)
  assert.ok(enMatchRu)
  assert.equal(enMatchRu.source, 'dom_en')
  assert.equal(enMatchRu.en, 'Full access')

  // 7. domEn lookup by English original
  const enMatchOrig = findTranslationKey('Auto mode', dicts, overrides, zhRu, domEn)
  assert.ok(enMatchOrig)
  assert.equal(enMatchOrig.source, 'dom_en_original')
  assert.equal(enMatchOrig.value, 'Автоматический режим')

  // 8. Untranslated Chinese detection
  const unZh = findTranslationKey('未知功能测试', dicts, overrides, zhRu, domEn, { detectUntranslated: true })
  assert.ok(unZh)
  assert.equal(unZh.source, 'untranslated_zh')
  assert.equal(unZh.key, '未知功能测试')

  // 9. Untranslated English detection
  const unEn = findTranslationKey('Unknown English Action', dicts, overrides, zhRu, domEn, { detectUntranslated: true })
  assert.ok(unEn)
  assert.equal(unEn.source, 'untranslated_en')
  assert.equal(unEn.key, 'Unknown English Action')

  // 10. Without detectUntranslated, unknown phrase returns null (backward compatibility)
  assert.equal(findTranslationKey('Unknown English Action', dicts, overrides, zhRu, domEn), null)
})

test('Issue #330: generateBugReportSnippet formats markdown for Gitea/GitHub issues', () => {
  const snippet = generateBugReportSnippet({
    key: 'cron.interval',
    ns: 'dsh-cron',
    original: 'Interval',
    current: 'Интервал',
    override: 'Периодичность',
    pkgVersion: '0.3.1'
  })

  assert.ok(snippet.includes('@goodandready/dsh-russian-lang@v0.3.1'))
  assert.ok(snippet.includes('dsh-cron'))
  assert.ok(snippet.includes('cron.interval'))
  assert.ok(snippet.includes('Периодичность'))
})
