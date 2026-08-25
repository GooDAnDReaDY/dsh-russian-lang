// Plural-form selection for Russian, as used by the plugin's translate wrapper.
// The core picks .one/.other by `n === 1`; Russian needs one/few/many. This
// test pins the Intl.PluralRules('ru') mapping the wrapper relies on, so a
// Node/ICU change that breaks the assumption fails here first.
import { test } from 'node:test'
import assert from 'node:assert'

const rules = new Intl.PluralRules('ru')

function form(n) {
  return rules.select(n)
}

test('ru plural: one for 1 and 21', () => {
  assert.equal(form(1), 'one')
  assert.equal(form(21), 'one')
})

test('ru plural: few for 2-4 and 22-24', () => {
  assert.equal(form(2), 'few')
  assert.equal(form(3), 'few')
  assert.equal(form(4), 'few')
  assert.equal(form(22), 'few')
  assert.equal(form(24), 'few')
})

test('ru plural: many for 5-20 and 25', () => {
  assert.equal(form(5), 'many')
  assert.equal(form(10), 'many')
  assert.equal(form(20), 'many')
  assert.equal(form(25), 'many')
})

test('ru plural: many for 0', () => {
  assert.equal(form(0), 'many')
})
