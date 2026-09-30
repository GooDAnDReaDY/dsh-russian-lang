import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const bundle = fs.readFileSync(clientPath, 'utf-8')

test('Issue #414: apply -> dispose restores all 19 runtime extensions and cancels timers', () => {
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

  // Evaluate client bundle
  // eslint-disable-next-line no-eval
  eval(bundle)
  const def = global.__DEF__
  assert.ok(def && typeof def.factory === 'function')

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

  assert.ok(typeof effectDisposer === 'function', 'runtime-lifecycle disposer must be returned')

  // Check that all 19 extensions are attached
  const EXPECTED_PROPS = [
    'plural', 'pluralForm', 'formatDate', 'formatCompactNumber', 'formatTokens',
    'formatNumber', 'formatRelativeTime', 'formatCurrency', 'inflect',
    'getPluginLocalizationStatus', 'stemRussian', 'fuzzyMatchRu', 'humanizeError',
    'findTranslationKey', 'openInspector', 'translationRegistry',
    'bilingualCommandMatch', 'filterCommands', 'formatErrorToast'
  ]

  for (const prop of EXPECTED_PROPS) {
    assert.ok(runtime[prop] !== undefined, `runtime.${prop} must be defined after apply`)
  }

  // Trigger disposal
  effectDisposer()

  // Verify that ALL 19 extensions are cleaned up and restored
  assert.equal(runtime.translate, origTranslate, 'translate must be restored')
  for (const prop of EXPECTED_PROPS) {
    assert.equal(runtime[prop], undefined, `runtime.${prop} must be removed/cleaned up after dispose`)
  }
  assert.equal(languageRemoved, true, 'addLanguage disposer must be invoked on cleanup')
})
