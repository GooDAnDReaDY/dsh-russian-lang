import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const bundle = fs.readFileSync(clientPath, 'utf-8')

test('Issue #439 / #415: Actual typography effect in client.js subscribes to scope settings and toggles observer/RAF', () => {
  let loadedDef = null
  const mockWindow = {
    __ModuleLoader__: { load(def) { loadedDef = def } }
  }

  const allObservers = []

  class MockMutationObserver {
    constructor(cb) {
      this.cb = cb
      this.active = false
      this.target = null
      allObservers.push(this)
    }
    observe(target) {
      this.active = true
      this.target = target
    }
    disconnect() {
      this.active = false
      this.target = null
    }
  }

  global.MutationObserver = MockMutationObserver
  let rafPending = null
  global.requestAnimationFrame = (fn) => {
    rafPending = fn
    return 123
  }
  global.cancelAnimationFrame = () => {
    rafPending = null
  }

  const mockBody = { nodeType: 1, tagName: 'BODY', childNodes: [], querySelectorAll: () => [] }
  const mockDoc = {
    head: { appendChild() {} },
    body: mockBody,
    documentElement: { getAttribute: () => 'ru-RU', lang: 'ru' },
    createElement: () => ({ style: {}, dataset: {}, appendChild() {} }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {},
    createTreeWalker: () => ({ nextNode: () => null })
  }

  global.NodeFilter = { SHOW_TEXT: 4 }

  new Function('window', 'document', bundle)(mockWindow, mockDoc)
  const def = mockWindow.__DEF__ || loadedDef
  assert.ok(def && typeof def.factory === 'function')

  const mod = def.factory(() => ({}))

  let currentConfig = { typography: { enabled: false } }
  const scopeListeners = []
  const localeListeners = []

  const scope = {
    getSnapshot: () => ({ status: 'ready', value: currentConfig }),
    subscribe: (fn) => {
      scopeListeners.push(fn)
      return () => {
        const idx = scopeListeners.indexOf(fn)
        if (idx >= 0) scopeListeners.splice(idx, 1)
      }
    },
    set: async () => true
  }

  const runtime = {
    translate: (ns, key) => key,
    getLocale: () => ({ active: 'ru', locales: [{ id: 'ru', label: 'Russian' }] }),
    lookup: () => undefined,
    register: () => () => {},
    subscribe: (fn) => {
      localeListeners.push(fn)
      return () => {
        const idx = localeListeners.indexOf(fn)
        if (idx >= 0) localeListeners.splice(idx, 1)
      }
    },
    addLanguage: () => () => {},
    setLocale: () => {},
    host: { getSnapshot: () => ({ value: {} }), subscribe: () => () => {}, set: () => Promise.resolve(), unset: () => Promise.resolve() }
  }

  let typoDisposer = null
  const ctx = {
    locale: runtime,
    configForms: { get: () => scope },
    slots: { inject: (n, f) => f(), register: () => {} },
    effect: (cb, name) => {
      if (name === 'dsh-russian-lang: typography') {
        typoDisposer = cb()
        return typoDisposer
      }
      return cb()
    },
    emit: () => {}
  }

  // 1. Initial execution with typography: { enabled: false }
  mod.apply(ctx)

  assert.ok(typeof typoDisposer === 'function', 'Typography effect must return disposer function')

  // Baseline observers exist on startup (spellcheck, zhDom), but typoObserver is NOT yet created
  const baselineCount = allObservers.length
  assert.ok(baselineCount > 0, 'Baseline observers exist on apply')

  // 2. User enables typography via settings -> trigger scope listeners
  currentConfig = { typography: { enabled: true, yo: true } }
  for (const fn of scopeListeners) fn()

  assert.equal(allObservers.length, baselineCount + 1, 'Enabling typography must create a new typoObserver instance')
  const typoObserver = allObservers[allObservers.length - 1]
  assert.equal(typoObserver.active, true, 'typoObserver must be active')
  assert.equal(typoObserver.target, mockBody, 'typoObserver must observe document.body')

  // 3. User disables typography via settings -> trigger scope listeners
  currentConfig = { typography: { enabled: false } }
  for (const fn of scopeListeners) fn()

  assert.equal(typoObserver.active, false, 'typoObserver must be disconnected immediately when disabled')

  // 4. Dispose effect cleans up all listeners and cancels pending work
  const scopeCountBefore = scopeListeners.length
  const localeCountBefore = localeListeners.length

  typoDisposer()

  // Listener cleanup
  assert.equal(scopeListeners.length, scopeCountBefore - 1, 'Typography scope listener must be unsubscribed on disposal')
  assert.equal(localeListeners.length, localeCountBefore - 1, 'Typography locale listener must be unsubscribed on disposal')
})
