// Выбор формы числительного для русского — как это делает обёртка translate.
// Ядро выбирает .one/.other по n === 1, русскому нужны one/few/many. Тест
// закрепляет отображение Intl.PluralRules('ru-RU'), на которое опирается
// обёртка: смена ICU в Node сломает сначала этот тест, а не интерфейс.
//
// pluralForm импортируется из lib/pure.js — из кода, который уезжает в бандл.
import { test } from 'node:test'
import assert from 'node:assert'
import { pluralForm } from '../lib/pure.js'

test('ru plural: one для 1 и 21', () => {
  assert.equal(pluralForm(1), 'one')
  assert.equal(pluralForm(21), 'one')
})

test('ru plural: few для 2–4 и 22–24', () => {
  for (const n of [2, 3, 4, 22, 24]) assert.equal(pluralForm(n), 'few', 'n=' + n)
})

test('ru plural: many для 5–20 и 25', () => {
  for (const n of [5, 10, 20, 25]) assert.equal(pluralForm(n), 'many', 'n=' + n)
})

test('ru plural: many для 0', () => {
  assert.equal(pluralForm(0), 'many')
})
