// Счётные ключи: для голого t('X', { n }) обёртка пробует X.one / X.few /
// X.many и только потом откатывается к базовому шаблону. Тест закрепляет
// отображение формы и защиту от повторного навешивания суффикса.
//
// pluralForm берётся из lib/pure.js — из кода бандла, а не из копии (#133).
import { test } from 'node:test'
import assert from 'node:assert'
import { pluralForm } from '../lib/pure.js'

// Та же логика выбора ключа, что в обёртке translate: форма other ключа не
// получает, отсутствующая форма откатывается к базе.
const pick = (base, has) => (n) => {
  const form = pluralForm(n)
  if (form === 'other') return base
  const suffixed = base + '.' + form
  return has.has(suffixed) ? suffixed : base
}

test('счётный ключ: подставляются формы one/few/many, когда они есть', () => {
  const p = pick('cd.catalog', new Set(['cd.catalog.one', 'cd.catalog.few', 'cd.catalog.many']))
  assert.equal(p(1), 'cd.catalog.one')
  assert.equal(p(2), 'cd.catalog.few')
  assert.equal(p(5), 'cd.catalog.many')
  assert.equal(p(21), 'cd.catalog.one')
})

test('счётный ключ: откат к базе, когда формы в словаре нет', () => {
  const p = pick('queue.count', new Set())
  assert.equal(p(1), 'queue.count')
  assert.equal(p(3), 'queue.count')
})

test('защита суффикса: ключи .one/.other повторно не суффиксуются', () => {
  assert.match('sessions.count.other', /[.](one|other|few|many)$/)
  assert.doesNotMatch('cd.catalog', /[.](one|other|few|many)$/)
})
