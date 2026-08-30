// Локальный репро: грузит собранный бандл с mock-ctx и проверяет apply().
// Возвращает ненулевой код при любой ошибке — CI падает на битой сборке.
// Запуск: node test/_repro.cjs (после python3 build.py)
const fs = require('fs')
const path = require('path')
const bundle = fs.readFileSync(path.join(__dirname, '..', 'lib', 'client.js'), 'utf8')

const fail = (msg) => {
  console.error('REPRO FAIL:', msg)
  process.exitCode = 1
}

try {
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
  if (!def || typeof def.factory !== 'function') {
    fail('factory is not a function')
  } else {
    const localeState = { active: 'en', locales: [{ id: 'en', label: 'English' }], revision: 1 }
    const registered = []
    const slotsRegistered = []
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
        addLanguage(input) {
          if (localeState.locales.some(l => l.id === input.id)) throw new Error('locale "' + input.id + '" is already registered')
          localeState.locales = localeState.locales.concat([{ id: input.id, label: input.label, fallback: input.fallback }])
          localeState.revision++
        },
        setLocale(l) { localeState.active = l },
        host: { getSnapshot: () => ({ value: {} }), subscribe() { return () => {} }, set() { return Promise.resolve() }, unset() { return Promise.resolve() } },
      },
      settingsScope: { bind() { return { getSnapshot: () => ({ status: 'ready', value: { enabled: true, overrides: {}, typography: {} } }), subscribe() { return () => {} }, set() {} } } },
      effect(cb) { const d = cb(); void d; return d },
      emit() {},
      slots: {
        inject(name, fn) {
          if (name !== 'settings.plugin.item') throw new Error('slot "' + name + '" is not declared')
          return fn()
        },
        register(entry) { slotsRegistered.push(entry.name) },
      },
    }
    const exp = def.factory((name) => {
      // Минимальный React-стаб: карточка настроек регистрируется и компонент
      // рендерится без хуков рантайма. В реальном DSH React доступен.
      if (name === 'react') {
        return {
          useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
          useEffect: () => {},
          createElement: (type, props, ...children) => ({ type, props, children }),
        }
      }
      return {}
    })
    exp.apply(ctx)
    const dicts = registered.length
    const coreHasRu = registered.some(r => r.ns === 'common' && r.loc === 'ru')
    const cardSlotted = slotsRegistered.includes('settings.plugin.item')
    console.log('apply OK; dicts:', dicts, '| core-ru:', coreHasRu, '| card slot:', cardSlotted)
    if (!coreHasRu) fail('core namespace did not register ru')
    if (dicts < 30) fail('too few dictionaries registered: ' + dicts)
    if (!cardSlotted) fail('settings card slot not registered')
  }
} catch (e) {
  fail(e.message)
  if (e.stack) console.error(e.stack.split('\n').slice(1, 6).join('\n'))
}
