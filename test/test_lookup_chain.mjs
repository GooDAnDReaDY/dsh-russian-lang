// Lookup-adaptation for the translate wrapper: DSH 0.1.2 lookup(ns, key, chain)
// requires a third argument (the locale chain); older cores take two. The
// wrapper must ask the method's arity (lookup.length) and pass the chain only
// when the core expects it. A bare 2-arg call on 0.1.2 crashed the whole
// sidebar.workspaces slot (chain is not iterable) — this pins the contract.
import { test } from 'node:test'
import assert from 'node:assert'

// Mirrors the helper emitted by build.py into lib/client.js.
function makeLookup(runtime) {
  const lookupChain = () => {
    try {
      const chain = runtime.fallbackChain && runtime.fallbackChain(runtime.getLocale().active)
      if (Array.isArray(chain) && chain.length) return chain
    } catch (err) { /* ignore */ }
    return [runtime.getLocale().active]
  }
  return (ns, key) => {
    const chain = lookupChain()
    return runtime.lookup.length >= 3 ? runtime.lookup(ns, key, chain) : runtime.lookup(ns, key)
  }
}

// Fake core runtime: 3-arg lookup (DSH 0.1.2). Throws if chain is missing.
function runtime3() {
  const dicts = {
    'sessions': { ru: { 'sessions.count.one': '1 беседа', 'sessions.count.few': '{n} беседы', 'sessions.count.many': '{n} бесед' } },
  }
  return {
    getLocale: () => ({ active: 'ru' }),
    fallbackChain: (start) => [start, 'en'],
    lookup: function (ns, key, chain) {
      assert.ok(Array.isArray(chain), 'chain must be passed on 3-arg core')
      return dicts[ns]?.['ru']?.[key]
    },
  }
}

// Fake core runtime: 2-arg lookup (pre-0.1.2). Extra arg is harmless.
function runtime2() {
  const dicts = {
    'sessions': { ru: { 'sessions.count.one': '1 беседа', 'sessions.count.few': '{n} беседы', 'sessions.count.many': '{n} бесед' } },
  }
  return {
    getLocale: () => ({ active: 'ru' }),
    lookup: function (ns, key) { return dicts[ns]?.['ru']?.[key] },
  }
}

const rules = new Intl.PluralRules('ru-RU')
function form(n) { return rules.select(n) }

test('3-arg core: count-key lookup passes chain and returns correct forms', () => {
  const lookup = makeLookup(runtime3())
  const key = 'sessions.count'
  assert.equal(lookup('sessions', key + '.' + form(1)), '1 беседа')
  assert.equal(lookup('sessions', key + '.' + form(2)), '{n} беседы')
  assert.equal(lookup('sessions', key + '.' + form(5)), '{n} бесед')
})

test('3-arg core: common fallback also passes chain', () => {
  const lookup = makeLookup(runtime3())
  assert.equal(lookup('common', 'sessions.count.few'), undefined)
})

test('2-arg core: count-key lookup still works (old path)', () => {
  const lookup = makeLookup(runtime2())
  const key = 'sessions.count'
  assert.equal(lookup('sessions', key + '.' + form(1)), '1 беседа')
  assert.equal(lookup('sessions', key + '.' + form(2)), '{n} беседы')
  assert.equal(lookup('sessions', key + '.' + form(5)), '{n} бесед')
})

test('2-arg core: no fallbackChain -> falls back to [active]', () => {
  const rt = runtime2()
  delete rt.fallbackChain
  const lookup = makeLookup(rt)
  assert.equal(lookup('sessions', 'sessions.count.one'), '1 беседа')
})
