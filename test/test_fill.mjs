// fill(): parameter substitution used by the translate wrapper (overrides and
// plural forms). Pins the {name} -> params[name] behaviour the wrapper relies on.
import { test } from 'node:test'
import assert from 'node:assert'

function fill(template, params) {
  return template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match)
}

test('fill substitutes known params', () => {
  assert.equal(fill('{n} сессия', { n: 1 }), '1 сессия')
  assert.equal(fill('{count} участника', { count: 3 }), '3 участника')
})

test('fill leaves unknown params as-is', () => {
  assert.equal(fill('{n} сессий', {}), '{n} сессий')
  assert.equal(fill('{n} сессий', { other: 5 }), '{n} сессий')
})

test('fill handles multiple params', () => {
  assert.equal(fill('{a} и {b}', { a: 'x', b: 'y' }), 'x и y')
})
