// Форматы чисел, валют и относительного времени в ru-RU, плюс спецификаторы
// {param:number} / {param:currency} в fill(). Импорт из lib/pure.js —
// проверяется отгружаемый код, а не копия в тесте (#133).
import { test } from 'node:test'
import assert from 'node:assert'
import { formatNumber, formatRelativeTime, formatCurrency, fill } from '../lib/pure.js'

test('formatNumber formats thousands and decimals in ru-RU', () => {
  assert.equal(formatNumber(10000).replace(/\s/g, ' '), '10 000')
  assert.equal(formatNumber(1234567.89).replace(/\s/g, ' '), '1 234 567,89')
  assert.equal(formatNumber('invalid'), 'invalid')
})

test('formatRelativeTime formats units and timestamps in ru-RU', () => {
  assert.equal(formatRelativeTime(-2, 'minute'), '2 минуты назад')
  assert.equal(formatRelativeTime(1, 'day'), 'завтра')
  assert.equal(formatRelativeTime(-1, 'day'), 'вчера')
  assert.equal(formatRelativeTime(Date.now()), 'только что')
})

test('fill supports format specifiers {param:number} and {param:currency}', () => {
  const res1 = fill('Итого: {total:number} токенов', { total: 50000 })
  assert.equal(res1.replace(/\s/g, ' '), 'Итого: 50 000 токенов')

  const res2 = fill('Баланс: {amount:currency}', { amount: 1500, currency: 'RUB' })
  const norm2 = res2.replace(/\s/g, ' ')
  assert.ok(norm2.includes('1 500') || norm2.includes('1500'))
  assert.ok(norm2.includes('₽') || norm2.includes('руб'))

  const res3 = fill('Обычный {param}', { param: 'текст' })
  assert.equal(res3, 'Обычный текст')
})

test('formatNumber, formatRelativeTime, formatCurrency обрабатывают null и пустые строки', () => {
  assert.equal(formatNumber(null), '')
  assert.equal(formatNumber(undefined), '')
  assert.equal(formatNumber(''), '')

  assert.equal(formatRelativeTime(null), '')
  assert.equal(formatRelativeTime(undefined), '')
  assert.equal(formatRelativeTime(''), '')

  assert.equal(formatCurrency(null), '')
  assert.equal(formatCurrency(undefined), '')
  assert.equal(formatCurrency(''), '')
})
