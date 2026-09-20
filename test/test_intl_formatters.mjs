import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatDate, formatCompactNumber, formatTokens, fill } from '../lib/pure.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('v0.3.1 (#292): formatDate() форматирует даты по русским правилам', () => {
  const d = new Date(2026, 8, 20, 15, 30, 0) // 20 сентября 2026

  assert.equal(formatDate(d, 'short'), '20.09.2026')
  assert.equal(formatDate(d, 'long'), '20 сентября 2026 г.')
  assert.ok(formatDate(d, 'medium').includes('2026'), 'medium содержит год')
  assert.ok(formatDate(d, 'time').includes('30'), 'time содержит минуты')

  // Timestamp number
  assert.equal(formatDate(d.getTime(), 'short'), '20.09.2026')
})

test('v0.3.1 (#292): formatCompactNumber() компактно сокращает числа на русском', () => {
  assert.equal(formatCompactNumber(500), '500')
  assert.ok(formatCompactNumber(12500).includes('тыс'), 'содержит тыс.')
  assert.ok(formatCompactNumber(1500000).includes('млн'), 'содержит млн')
})

test('v0.3.1 (#292): formatTokens() выводит число и русскую форму токена', () => {
  assert.equal(formatTokens(1), '1 токен')
  assert.equal(formatTokens(2), '2 токена')
  assert.equal(formatTokens(5), '5 токенов')
  assert.equal(formatTokens(21), '21 токен')
  assert.equal(formatTokens(1234), '1\u00A0234 токена')

  const compactLarge = formatTokens(1500000, true)
  assert.ok(compactLarge.includes('млн'), 'содержит млн')
  assert.ok(compactLarge.includes('токенов'), 'содержит форму токенов')
})

test('v0.3.1 (#292): fill() поддерживает плейсхолдеры date, compact, tokens', () => {
  const d = new Date(2026, 8, 20)
  assert.equal(fill('Дата: {d:date}', { d }), 'Дата: 20.09.2026')
  assert.equal(fill('Расход: {t:tokens}', { t: 4 }), 'Расход: 4 токена')
  assert.equal(fill('Расход: {t:tokens}', { t: 25 }), 'Расход: 25 токенов')

  const compactStr = fill('Всего: {c:compact}', { c: 2500000 })
  assert.ok(compactStr.includes('млн'), 'fill compact содержит млн')
})

test('v0.3.1 (#292): client.js экспортирует форматировщики в runtime', () => {
  const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
  const clientSrc = fs.readFileSync(clientPath, 'utf-8')
  assert.ok(clientSrc.includes('runtime.formatDate = formatDate'))
  assert.ok(clientSrc.includes('runtime.formatCompactNumber = formatCompactNumber'))
  assert.ok(clientSrc.includes('runtime.formatTokens = formatTokens'))
})
