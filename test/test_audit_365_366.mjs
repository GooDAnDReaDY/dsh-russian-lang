import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readJsonBody } from '../lib/translator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const bundle = fs.readFileSync(path.join(__dirname, '..', 'lib', 'client.js'), 'utf8')

// ==========================================
// Issue #366: readJsonBody payload limit & 413
// ==========================================
test('Issue #366: readJsonBody rejects with 413 on Content-Length exceeding limit', async () => {
  const req = new EventEmitter()
  req.headers = { 'content-length': '600000' }

  await assert.rejects(
    async () => {
      await readJsonBody(req, 500_000)
    },
    (err) => {
      assert.equal(err.statusCode, 413)
      assert.match(err.message, /Payload too large/)
      return true
    }
  )
})

test('Issue #366: readJsonBody aborts chunked stream and rejects with 413 on limit overflow', async () => {
  const req = new EventEmitter()
  req.headers = {}
  let destroyed = false
  req.destroy = () => {
    destroyed = true
  }

  const promise = readJsonBody(req, 100)

  // Send chunk within limit
  req.emit('data', Buffer.from('{"key":"'))
  // Send chunk that overflows limit
  req.emit('data', Buffer.alloc(120, 'a'))

  await assert.rejects(
    async () => {
      await promise
    },
    (err) => {
      assert.equal(err.statusCode, 413)
      assert.equal(destroyed, true, 'request.destroy() must be called on overflow')
      return true
    }
  )
})

test('Issue #366: readJsonBody parses valid JSON within limit', async () => {
  const req = new EventEmitter()
  req.headers = { 'content-length': '23' }

  const promise = readJsonBody(req, 1000)
  req.emit('data', Buffer.from('{"text":"hello","target"'))
  req.emit('data', Buffer.from(':"ru"}'))
  req.emit('end')

  const res = await promise
  assert.deepEqual(res, { text: 'hello', target: 'ru' })
})

test('Issue #366: readJsonBody rejects invalid JSON with 400', async () => {
  const req = new EventEmitter()
  req.headers = {}

  const promise = readJsonBody(req, 1000)
  req.emit('data', Buffer.from('not valid json'))
  req.emit('end')

  await assert.rejects(
    async () => {
      await promise
    },
    (err) => {
      assert.equal(err.statusCode, 400)
      return true
    }
  )
})

// ==========================================
// Issue #365: LocaleRuntime patches & addLanguage lifecycle
// ==========================================
test('Issue #365: LocaleRuntime patches and addLanguage disposer cleanup via effect', () => {
  global.window = { __ModuleLoader__: { load(def) { global.__DEF__ = def } } }
  global.document = {
    querySelector: () => null,
    getElementById: () => null,
    createElement: () => ({ style: {}, dataset: {}, setAttribute() {}, appendChild() {} }),
    head: { appendChild() {} },
    addEventListener() {},
    removeEventListener() {},
    body: null,
    documentElement: { getAttribute: () => 'ru-RU', lang: '' },
  }
  global.requestAnimationFrame = (f) => 1

  // Evaluate client bundle
  // eslint-disable-next-line no-eval
  eval(bundle)
  const def = global.__DEF__
  assert.ok(def && typeof def.factory === 'function', 'ModuleLoader factory must be defined')

  const origTranslate = function (ns, key) { return 'orig:' + key }
  let languageRemoved = false
  const localeState = { active: 'en', locales: [{ id: 'en', label: 'English' }], revision: 1 }

  const runtime = {
    translate: origTranslate,
    getLocale: () => JSON.parse(JSON.stringify(localeState)),
    lookup: () => undefined,
    register: () => () => {},
    subscribe: () => () => {},
    addLanguage(input) {
      localeState.locales.push(input)
      return () => {
        languageRemoved = true
        localeState.locales = localeState.locales.filter(l => l.id !== input.id)
      }
    },
    setLocale(l) { localeState.active = l },
    host: { getSnapshot: () => ({ value: {} }), subscribe: () => () => {}, set: () => Promise.resolve(), unset: () => Promise.resolve() },
  }

  let effectDisposer = null
  const ctx = {
    locale: runtime,
    configForms: { get: () => ({ getSnapshot: () => ({ status: 'ready', value: { enabled: true, overrides: {}, typography: {} } }), subscribe: () => () => {}, set() {} }) },
    settingsScope: { bind: () => ({ getSnapshot: () => ({ status: 'ready', value: { enabled: true, overrides: {}, typography: {} } }), subscribe: () => () => {}, set() {} }) },
    effect(cb, name) {
      if (name === 'dsh-russian-lang: runtime-lifecycle') {
        effectDisposer = cb()
      } else {
        cb()
      }
      return effectDisposer
    },
    emit() {},
    slots: {
      inject: (name, fn) => fn(),
      register: () => {},
    },
  }

  const exp = def.factory(() => ({}))
  exp.apply(ctx)

  // Verify effect registered and ran
  assert.ok(typeof effectDisposer === 'function', 'runtime-lifecycle effect disposer must be returned')
  assert.notEqual(runtime.translate, origTranslate, 'translate must be patched')
  assert.equal(typeof runtime.plural, 'function', 'plural must be attached')
  assert.equal(typeof runtime.pluralForm, 'function', 'pluralForm must be attached')
  assert.equal(typeof runtime.formatDate, 'function', 'formatDate must be attached')
  assert.equal(typeof runtime.formatCompactNumber, 'function', 'formatCompactNumber must be attached')
  assert.equal(typeof runtime.formatTokens, 'function', 'formatTokens must be attached')
  assert.ok(localeState.locales.some(l => l.id === 'ru'), 'ru language must be added')

  // Trigger effect cleanup
  effectDisposer()

  // Verify all patches restored
  assert.equal(runtime.translate, origTranslate, 'translate must be restored to original')
  assert.equal(runtime.plural, undefined, 'runtime.plural should be removed')
  assert.equal(runtime.pluralForm, undefined, 'runtime.pluralForm should be removed')
  assert.equal(runtime.formatDate, undefined, 'runtime.formatDate should be removed')
  assert.equal(runtime.formatCompactNumber, undefined, 'runtime.formatCompactNumber should be removed')
  assert.equal(runtime.formatTokens, undefined, 'runtime.formatTokens should be removed')
  assert.equal(languageRemoved, true, 'addLanguage disposer must be invoked on cleanup')
  assert.ok(!localeState.locales.some(l => l.id === 'ru'), 'ru locale must be removed on cleanup')
})
