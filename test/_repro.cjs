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
    querySelector: () => null, getElementById: () => null,
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
    const slotEntries = []
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
      configForms: { get() { return { getSnapshot: () => ({ status: "ready", value: { enabled: true, overrides: {}, typography: {} } }), subscribe() { return () => {} }, set() {} } } },
      settingsScope: { bind() { return { getSnapshot: () => ({ status: 'ready', value: { enabled: true, overrides: {}, typography: {} } }), subscribe() { return () => {} }, set() {} } } },
      effect(cb) { const d = cb(); void d; return d },
      emit() {},
      slots: {
        inject(name, fn) {
          if (name !== 'settings.plugin.item' && name !== 'plugins.row.config' && name !== 'plugins.item' && name !== 'conversation.session.header.utilities' && name !== 'conversation.chat.assistant-actions') {
            throw new Error('slot "' + name + '" is not declared')
          }
          return fn()
        },
        register(entry, Component) {
          slotsRegistered.push(entry.name)
          slotEntries.push({ entry, Component })
        },
      },
    }

    let customUseState = null
    const exp = def.factory((name) => {
      if (name === 'react') {
        return {
          useState: (init) => {
            if (customUseState) return customUseState(init)
            return [typeof init === 'function' ? init() : init, () => {}]
          },
          useEffect: () => {},
          createElement: (type, props, ...children) => {
            if (typeof type === 'function') {
              return type(Object.assign({}, props, { children }))
            }
            return { type, props, children }
          },
        }
      }
      return {}
    })
    exp.apply(ctx)
    const dicts = registered.length
    const coreHasRu = registered.some(r => r.ns === 'common' && r.loc === 'ru')
    const cardSlotted = slotsRegistered.includes('settings.plugin.item') || slotsRegistered.includes('plugins.row.config') || slotsRegistered.includes('plugins.item')
    console.log('apply OK; dicts:', dicts, '| core-ru:', coreHasRu, '| card slot:', cardSlotted)
    if (!coreHasRu) fail('core namespace did not register ru')
    if (dicts < 4) fail('too few dictionaries registered: ' + dicts)
    if (!cardSlotted) fail('settings card slot not registered')

    // #354 Регрессионный тест: рендерим каждую зарегистрированную карточку в свёрнутом И РАСКРЫТОМ состоянии
    console.log('Testing slots render (guard against #354 upStatus ReferenceError)...')
    for (const { entry, Component } of slotEntries) {
      if (typeof Component !== 'function') continue
      const props = Object.assign({}, entry, { inject: entry.inject })

      // 1. Collapsed render
      customUseState = (init) => [typeof init === 'function' ? init() : init, () => {}]
      const collapsed = Component(props)
      if (!collapsed) fail('Collapsed render returned empty for ' + entry.name)

      // 2. Expanded render (force open = true)
      customUseState = (init) => {
        if (typeof init === 'boolean') return [true, () => {}]
        return [typeof init === 'function' ? init() : init, () => {}]
      }
      const expanded = Component(props)
      if (!expanded) fail('Expanded render returned empty for ' + entry.name)
      console.log('  OK slot render:', entry.name)
    }
    console.log('All slot components rendered successfully in expanded state!')
  }
} catch (e) {
  fail(e.message)
  if (e.stack) console.error(e.stack.split('\n').slice(1, 6).join('\n'))
}
