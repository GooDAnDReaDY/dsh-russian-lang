// Локальный репро v3: в корне репо
const fs = require('fs')
const path = require('path')
const bundle = fs.readFileSync('/mnt/external/Project/DEV/dhsplugins/dsh-russian-lang/lib/client.js', 'utf8')

global.window = { __ModuleLoader__: { load(def) { global.__DEF__ = def } } }
global.document = {
  querySelector: () => null,
  createElement: () => ({ style: {}, dataset: {}, setAttribute() {}, appendChild() {} }),
  head: { appendChild() {} },
  addEventListener() {}, removeEventListener() {},
  body: null,
  documentElement: { getAttribute: () => 'ru-RU', lang: '' },
}
global.requestAnimationFrame = (f) => 1

eval(bundle)
const def = global.__DEF__
console.log('typeof factory:', typeof (def && def.factory))

const localeState = { active: 'en', locales: [{ id: 'en', label: 'English' }], revision: 1 }
const registered = []
const ctx = {
  locale: {
    register(ns, loc) {
      if (registered.some(r => r.ns === ns && r.loc === loc)) throw new Error('already has locale ' + loc)
      registered.push({ ns, loc }); return () => {}
    },
    getLocale: () => JSON.parse(JSON.stringify(localeState)),
    translate(ns, key) { return key },
    lookup() { return undefined },
    subscribe(fn) { return () => {} },
    publish(lang) { localeState.active = lang },
    setLocale(l) { localeState.active = l },
  },
  settingsScope: { bind() { return { getSnapshot: () => ({ status: 'ready', value: { enabled: true, overrides: {}, typography: {} } }), subscribe() { return () => {} }, set(k, v) { console.log('scope.set', k) } } } },
  effect(cb) { const d = cb(); void d; return d },
  emit() {},
  slots: { register(entry) { console.log('slot:', entry.name, 'key:', entry.key) } },
}
try {
  const exp = def.factory((name) => { if (name === 'react') throw new Error('no react'); return {} })
  exp.apply(ctx)
  console.log('apply OK; dicts:', registered.length)
} catch (e) {
  console.error('APPLY FAILED:', e.message)
  console.error(e.stack.split('\n').slice(1, 6).join('\n'))
}
