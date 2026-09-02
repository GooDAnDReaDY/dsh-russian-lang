import { test } from 'node:test'
import assert from 'node:assert'

const mockRU = {
  'dsh-kanban': { 'card.title': 'Карточка', 'board.name': 'Доска' },
  'dsh-market': { 'title': 'Маркетплейс' },
  'empty-plugin': {}
}

const getPluginLocalizationStatus = (ns, ruDicts = mockRU) => {
  if (!ns) return { status: 'none', count: 0, label: 'RU отсутствует' }
  const dict = ruDicts[ns] || {}
  const count = Object.keys(dict).length
  if (count > 0) {
    return { status: 'full', count, label: `RU: ${count} строк` }
  }
  return { status: 'none', count: 0, label: 'RU отсутствует' }
}

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
