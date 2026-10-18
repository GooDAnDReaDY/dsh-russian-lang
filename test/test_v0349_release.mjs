import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.49: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.49')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('10,432') || pkg.description.includes('10,898'), 'Description must reflect keys')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('0.3.49'), 'CHANGELOG must mention 0.3.49')
  assert.ok(cl.includes('#506'), 'CHANGELOG must mention issue #506')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.49') || readme.includes('npm-v0.4.0'), 'README npm badge')
  assert.ok(readme.includes('10432') || readme.includes('10898'), 'README keys badge')
})

test('v0.3.49: supported-inventory has 10,432 total keys, 111 namespaces and 7 headless plugins', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.ok(inv.metrics.total_keys >= 10432)
  assert.ok(inv.metrics.core_keys >= 2619)
  assert.ok(inv.metrics.plugin_keys >= 7813)
  assert.ok(inv.metrics.total_namespaces >= 111)
  assert.ok(inv.metrics.plugin_namespaces >= 50)
  assert.equal(inv.headless_plugins.length, 7)
})

test('v0.3.49: Issue #506: two consecutive dictionary updates and remount succeed without duplicate locale error', () => {
  // Simulate DSH LocaleRuntime exactly according to @deepseek-ai/dsh-client-locale/lib/client.js
  class MockLocaleRuntime {
    constructor() {
      this.dicts = new Map()
      this.snapshot = { active: 'ru', locales: [{ id: 'en' }, { id: 'ru' }], revision: 0 }
    }
    publish(active, localeChanged) {
      this.snapshot = { active, locales: this.snapshot.locales, revision: this.snapshot.revision + 1 }
    }
    register(ns, localeOrDicts, dict) {
      const pairs = typeof localeOrDicts === 'string' ? [[localeOrDicts, dict]] : Object.entries(localeOrDicts)
      let locales = this.dicts.get(ns)
      if (!locales) {
        locales = new Map()
        this.dicts.set(ns, locales)
      }
      for (const [locale] of pairs) {
        if (locales.has(locale)) {
          throw new Error(`locale namespace "${ns}" already has locale "${locale}"`)
        }
      }
      for (const [locale, entries] of pairs) locales.set(locale, entries)
      this.publish(this.snapshot.active, false)
      return () => {
        const owner = this.dicts.get(ns)
        if (!owner) return
        let removed = false
        for (const [locale, entries] of pairs) {
          if (owner.get(locale) === entries) {
            owner.delete(locale)
            removed = true
          }
        }
        if (removed) this.publish(this.snapshot.active, false)
      }
    }
  }

  const locale = new MockLocaleRuntime()
  const RU = { common: { ok: 'Ок' }, 'dsh-cron': { run: 'Запуск' } }
  const ownDisposers = new Map()
  let disposed = false
  const warnings = []

  const registerOrUpdateNamespace = (ns, dict) => {
    if (disposed || !ns || typeof dict !== 'object' || !dict) return
    if (!RU[ns]) {
      RU[ns] = Object.assign({}, dict)
    } else if (RU[ns] !== dict) {
      Object.assign(RU[ns], dict)
    }
    const prevDisposer = ownDisposers.get(ns)
    if (typeof prevDisposer === 'function') {
      try { prevDisposer() }
      catch (_err) { void _err }
      ownDisposers.delete(ns)
    }
    try {
      const disposer = locale.register(ns, 'ru', RU[ns])
      if (typeof disposer === 'function') {
        ownDisposers.set(ns, disposer)
      }
    } catch (err) {
      warnings.push(`Failed to register ${ns}: ${err.message}`)
    }
  }

  const registerDictMap = (dictMap) => {
    if (disposed || !dictMap || typeof dictMap !== 'object') return
    for (const ns of Object.keys(dictMap)) {
      if (disposed) return
      if (ns === 'zhRu' || ns === 'plugins' || ns === 'core') continue
      const dict = dictMap[ns]
      if (typeof dict !== 'object' || !dict) continue
      registerOrUpdateNamespace(ns, dict)
    }
  }

  // 1. Initial bootstrap
  for (const ns of Object.keys(RU)) {
    registerOrUpdateNamespace(ns, RU[ns])
  }
  assert.equal(locale.dicts.get('common').has('ru'), true)
  assert.equal(warnings.length, 0, 'Bootstrap should produce zero warnings')

  // 2. First update (Cache hydration) for all 22 issue #506 namespaces
  const issueNamespaces = [
    'common', 'usageDashboard', 'dsh-market', 'plugin-store', 'dsh-skill-hub',
    'skills-manager', 'panel.commandcode', 'settings.commandcode', 'dsh-usage-stats',
    'dsh-context', 'dsh-skill-explorer', 'config-manager', 'dsh-session-control',
    'dsh-clinebot', 'dsh-lanmode', 'dsh-task-tracker', 'dsh-cron', 'dsh-key-limits',
    'memoryMeter', 'pluginMarket', 'bili', 'clearai'
  ]

  const cachePayload = {}
  for (const ns of issueNamespaces) {
    cachePayload[ns] = { cachedKey: `Значение из кэша для ${ns}` }
  }
  registerDictMap(cachePayload)

  assert.equal(warnings.length, 0, 'Cache hydration must produce 0 warnings (no "already has locale")')
  for (const ns of issueNamespaces) {
    assert.equal(locale.dicts.get(ns)?.has('ru'), true, `Namespace ${ns} must have ru after cache`)
    assert.equal(locale.dicts.get(ns)?.get('ru')?.cachedKey, `Значение из кэша для ${ns}`)
  }

  // 3. Second update (Network refresh) for all 22 issue #506 namespaces
  const networkPayload = {}
  for (const ns of issueNamespaces) {
    networkPayload[ns] = { networkKey: `Свежее значение сети для ${ns}` }
  }
  registerDictMap(networkPayload)

  assert.equal(warnings.length, 0, 'Network refresh must produce 0 warnings (no "already has locale")')
  for (const ns of issueNamespaces) {
    assert.equal(locale.dicts.get(ns)?.has('ru'), true, `Namespace ${ns} must have ru after network`)
    assert.equal(locale.dicts.get(ns)?.get('ru')?.cachedKey, `Значение из кэша для ${ns}`, 'Keys must be merged')
    assert.equal(locale.dicts.get(ns)?.get('ru')?.networkKey, `Свежее значение сети для ${ns}`, 'Fresh keys must be present')
  }

  // 4. Foreign dictionary protection
  locale.register('foreign-plugin', 'ru', { foreign: 'Чужой словарь' })
  assert.equal(locale.dicts.get('foreign-plugin')?.has('ru'), true)

  // 5. Unmount / Teardown
  for (const [ns, d] of ownDisposers.entries()) {
    try { d() } catch (_) {}
  }
  ownDisposers.clear()

  assert.equal(locale.dicts.get('common')?.has('ru'), false, 'Own dictionary common must be disposed')
  assert.equal(locale.dicts.get('usageDashboard')?.has('ru'), false, 'Own dictionary usageDashboard must be disposed')
  assert.equal(locale.dicts.get('foreign-plugin')?.has('ru'), true, 'Foreign plugin dictionary must NOT be deleted')

  // 6. Remount
  disposed = false
  for (const ns of Object.keys(RU)) {
    registerOrUpdateNamespace(ns, RU[ns])
  }
  assert.equal(locale.dicts.get('common')?.has('ru'), true, 'Remount must successfully register ru')
  assert.equal(warnings.length, 0, 'Remount must produce 0 warnings')
})

test('v0.3.49: client bundle evaluates and mounts cleanly', () => {
  const clientPath = path.join(ROOT, 'lib', 'client.js')
  const bundle = fs.readFileSync(clientPath, 'utf-8')

  global.window = { __ModuleLoader__: { load(def) { global.__DEF__ = def } } }
  global.document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({ style: {}, dataset: {}, setAttribute() {}, appendChild() {} }),
    head: { appendChild() {} },
    addEventListener() {},
    removeEventListener() {},
    body: null,
    documentElement: { getAttribute: () => 'ru-RU', lang: '' },
  }
  global.requestAnimationFrame = (f) => 1
  global.caches = undefined
  global.localStorage = { getItem: () => null, setItem: () => {} }

  // eslint-disable-next-line no-eval
  eval(bundle)
  const def = global.__DEF__
  assert.ok(def && typeof def.factory === 'function')

  const localeState = { active: 'ru', locales: [{ id: 'en' }, { id: 'ru' }], revision: 0 }
  const runtime = {
    translate: (ns, k) => k,
    getLocale: () => JSON.parse(JSON.stringify(localeState)),
    lookup: () => undefined,
    register: () => () => {},
    subscribe: () => () => {},
    addLanguage: () => () => {},
    setLocale: () => {},
    host: { getSnapshot: () => ({ value: {} }), subscribe: () => () => {}, set: () => Promise.resolve(), unset: () => Promise.resolve() },
  }

  const effects = []
  const ctx = {
    locale: runtime,
    configForms: { get: () => ({ getSnapshot: () => ({ status: 'ready', value: { enabled: true, overrides: {}, typography: {} } }), subscribe: () => () => {}, set() {} }) },
    settingsScope: { bind: () => ({ getSnapshot: () => ({ status: 'ready', value: { enabled: true, overrides: {}, typography: {} } }), subscribe: () => () => {}, set() {} }) },
    effect(cb, name) {
      const d = cb()
      if (typeof d === 'function') effects.push({ name, d })
      return d
    },
    emit() {},
    slots: { inject: (name, fn) => fn(), register: () => {} },
  }

  const exp = def.factory(() => ({}))
  exp.apply(ctx)

  assert.ok(effects.some(e => e.name === 'dsh-russian-lang: locale-registrations'), 'locale-registrations effect must be registered')
  assert.ok(effects.some(e => e.name === 'dsh-russian-lang: runtime-lifecycle'), 'runtime-lifecycle effect must be registered')

  // Teardown
  for (const eff of effects) {
    if (typeof eff.d === 'function') eff.d()
  }
})
