import { test } from 'node:test'
import assert from 'node:assert'

const numberFormat = new Intl.NumberFormat('ru-RU')
const relativeTimeFormat = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' })

const formatNumber = (val) => {
  const n = typeof val === 'number' ? val : Number(val)
  return isNaN(n) ? String(val) : numberFormat.format(n)
}

const formatRelativeTime = (val, unit) => {
  if (typeof val === 'number' && typeof unit === 'string') {
    return relativeTimeFormat.format(val, unit)
  }
  const ts = val instanceof Date ? val.getTime() : (typeof val === 'number' ? (val < 1e12 ? val * 1000 : val) : Number(val))
  if (isNaN(ts)) return String(val)
  const diffSec = Math.round((ts - Date.now()) / 1000)
  const absSec = Math.abs(diffSec)
  if (absSec < 45) return 'только что'
  if (absSec < 3600) return relativeTimeFormat.format(Math.round(diffSec / 60), 'minute')
  if (absSec < 86400) return relativeTimeFormat.format(Math.round(diffSec / 3600), 'hour')
  if (absSec < 2592000) return relativeTimeFormat.format(Math.round(diffSec / 86400), 'day')
  if (absSec < 31536000) return relativeTimeFormat.format(Math.round(diffSec / 2592000), 'month')
  return relativeTimeFormat.format(Math.round(diffSec / 31536000), 'year')
}

const formatCurrency = (val, cur = 'RUB') => {
  const n = typeof val === 'number' ? val : Number(val)
  if (isNaN(n)) return String(val)
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: cur.toUpperCase() }).format(n)
}

const fill = (template, params) => template.replace(/\{(\w+)(?::(\w+))?\}/g, (match, name, spec) => {
  if (!(name in params)) return match
  const val = params[name]
  if (spec === 'number') return formatNumber(val)
  if (spec === 'reltime') return formatRelativeTime(val)
  if (spec === 'currency') return formatCurrency(val, params.currency || 'RUB')
  return String(val)
})

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
