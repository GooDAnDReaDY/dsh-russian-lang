import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { getZhRuMap } from '../lib/locales.js'

test('v0.3.16: getZhRuMap correctly loads zh-ru pairs', () => {
  const map = getZhRuMap()
  assert.ok(map && typeof map === 'object', 'zhRuMap should be an object')
  const count = Object.keys(map).length
  assert.ok(count >= 300, 'zhRuMap should contain at least 300 entries (actual: ' + count + ')')
})

test('v0.3.16: lib/client.template.js and lib/client.js do not reference retired settings.plugin.item (#389)', () => {
  const tmpl = fs.readFileSync(new URL('../lib/client.template.js', import.meta.url), 'utf8')
  const bundle = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.doesNotMatch(tmpl, /name:\s*['"]settings\.plugin\.item['"]/)
  assert.doesNotMatch(bundle, /name:\s*['"]settings\.plugin\.item['"]/)
})

test('v0.3.16: ROW_CONFIG_KEY matches bundle rowId format (#387)', () => {
  const bundle = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.match(bundle, /ROW_CONFIG_KEY\s*=\s*['"]@goodandready\/dsh-russian-lang#['"]\s*\+\s*FORM_NS/)
})

test('v0.3.16: plugins.item registered with FORM_NS (#388)', () => {
  const bundle = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.match(bundle, /name:\s*['"]plugins\.item['"],\s*id:\s*FORM_NS/)
  assert.match(bundle, /locale:\s*SETTINGS_NS_NAME/)
})

test('v0.3.16: SettingsCard inspector button and import prompt safe execution', () => {
  const clientSrc = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  let loaded = null
  const mockWindow = {
    __ModuleLoader__: { load(d) { loaded = d } },
    prompt: () => '{"key":"val"}',
    alert: () => {}
  }
  const mockDoc = {
    querySelector: () => null,
    getElementById: () => null,
    createElement: () => ({ style: {}, dataset: {}, setAttribute() {}, appendChild() {}, querySelector: () => ({ onclick: null }), classList: { add() {} } }),
    head: { appendChild() {} },
    addEventListener() {},
    removeEventListener() {},
    body: { appendChild: () => {}, querySelectorAll: () => [] },
    documentElement: { getAttribute: () => 'ru-RU', lang: '' }
  }
  new Function('window', 'document', clientSrc)(mockWindow, mockDoc)

  let settingsComp = null
  const mod = loaded.factory((pkg) => {
    if (pkg === 'react') {
      return {
        useState: (init) => [(typeof init === 'boolean') ? true : (typeof init === 'function' ? init() : init), () => {}],
        useEffect: () => {},
        useRef: () => ({ current: null }),
        useCallback: (fn) => fn,
        createElement: (type, props, ...children) => ({ type, props, children })
      }
    }
    return {}
  })

  mod.apply({
    locale: {
      register: () => () => {},
      getLocale: () => ({ active: 'ru', locales: [{ id: 'ru', label: 'Russian' }], revision: 1 }),
      translate: (ns, k) => k,
      lookup: () => '',
      subscribe: () => () => {},
      addLanguage: () => {},
      setLocale: () => {},
      host: { getSnapshot: () => ({ value: {} }), subscribe: () => () => {}, set: () => Promise.resolve(), unset: () => Promise.resolve() }
    },
    slots: { inject: (name, fn) => fn(), register: (entry, comp) => { if (entry.name === 'plugins.item') settingsComp = comp } },
    configForms: { get: () => ({ getSnapshot: () => ({ status: 'ready', value: {} }), subscribe: () => () => {}, set: () => Promise.resolve() }), whileServed: (ns, fn) => fn() },
    effect: (fn) => fn()
  })

  assert.ok(typeof settingsComp === 'function', 'SettingsCard must be registered for plugins.item')
  const tree = settingsComp({ scope: { getSnapshot: () => ({ value: { overrides: {} } }), set: () => {} }, runtime: { getLocale: () => ({ active: 'ru' }), subscribe: () => () => {} }, t: (k) => k })

  function findButtons(node, acc = []) {
    if (!node) return acc
    if (node.type === 'button') acc.push(node)
    if (node.children) { for (const c of node.children) findButtons(c, acc) }
    return acc
  }

  const buttons = findButtons(tree)
  for (const b of buttons) {
    if (b.props && b.props.onClick) {
      assert.doesNotThrow(() => { b.props.onClick() }, 'Button onClick should not throw')
    }
  }
})
