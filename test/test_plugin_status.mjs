// Статус локализации плагина по словарям бандла. Импорт из lib/pure.js —
// проверяется отгружаемый код (#133).
import { test } from 'node:test'
import assert from 'node:assert'
import { makePluginLocalizationStatus } from '../lib/pure.js'

// В бандле фабрика получает словари RU; здесь — фикстуру той же формы.
const getPluginLocalizationStatus = makePluginLocalizationStatus({
  'dsh-kanban': { 'board.title': 'Доска', 'card.add': 'Добавить' },
  'dsh-market': { 'title': 'Маркет' },
  'empty-plugin': {}
})

test('getPluginLocalizationStatus returns full for translated plugins', () => {
  const s1 = getPluginLocalizationStatus('dsh-kanban')
  assert.equal(s1.status, 'full')
  assert.equal(s1.count, 2)
  assert.equal(s1.label, 'RU: 2 строк')

  const s2 = getPluginLocalizationStatus('dsh-market')
  assert.equal(s2.status, 'full')
  assert.equal(s2.count, 1)
})

test('getPluginLocalizationStatus returns none for untranslated plugins', () => {
  const s1 = getPluginLocalizationStatus('unknown-plugin')
  assert.equal(s1.status, 'none')
  assert.equal(s1.count, 0)
  assert.equal(s1.label, 'RU отсутствует')

  const s2 = getPluginLocalizationStatus('empty-plugin')
  assert.equal(s2.status, 'none')
  assert.equal(s2.count, 0)
})
