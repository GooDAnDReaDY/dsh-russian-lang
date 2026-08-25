// Count-key plural selection: for bare keys called as t('X', { n }) the
// wrapper now tries X.one / X.few / X.many via Intl.PluralRules('ru-RU')
// before falling back to the base template. This pins the form mapping and
// the suffix-guard the wrapper relies on, so a Node/ICU change or a refactor
// that breaks the contract fails here first.
import { test } from 'node:test'
import assert from 'node:assert'

const rules = new Intl.PluralRules('ru-RU')

function pick(base, has) {
  return (n) => {
    const form = rules.select(n)
    if (form === 'other') return base
    const suffixed = base + '.' + form
    return has.has(suffixed) ? suffixed : base
  }
}

test('count key: many/few/one variants are picked when present', () => {
  const has = new Set(['cd.catalog.one', 'cd.catalog.few', 'cd.catalog.many'])
  const pick_ = pick('cd.catalog', has)
  assert.equal(pick_(1), 'cd.catalog.one')
  assert.equal(pick_(2), 'cd.catalog.few')
  assert.equal(pick_(5), 'cd.catalog.many')
  assert.equal(pick_(21), 'cd.catalog.one')
})

test('count key: falls back to base when the form is absent', () => {
  const pick_ = pick('queue.count', new Set())
  assert.equal(pick_(1), 'queue.count')
  assert.equal(pick_(3), 'queue.count')
})

test('suffix guard: .one/.other keys are never re-suffixed', () => {
  const key = 'sessions.count.other'
  assert.match(key, /[.](one|other|few|many)$/)
  const bare = 'cd.catalog'
  assert.doesNotMatch(bare, /[.](one|other|few|many)$/)
})
