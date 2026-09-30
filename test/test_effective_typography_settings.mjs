import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const bundle = fs.readFileSync(clientPath, 'utf-8')

test('Issue #439 / #416: Actual resolveTypography function and SettingsCard use consistent opt-in defaults', () => {
  let loadedDef = null
  const mockWindow = {
    __ModuleLoader__: { load(def) { loadedDef = def } }
  }

  const mockDoc = {
    head: { appendChild() {} },
    body: { childNodes: [] },
    documentElement: { getAttribute: () => 'ru-RU', lang: 'ru' },
    createElement: () => ({ style: {}, dataset: {}, appendChild() {} }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {}
  }

  new Function('window', 'document', bundle)(mockWindow, mockDoc)
  const def = mockWindow.__DEF__ || loadedDef
  assert.ok(def && typeof def.factory === 'function')

  let hookState = []
  let hookIdx = 0
  const mockReact = {
    useState(init) {
      const idx = hookIdx++
      if (hookState[idx] === undefined) {
        hookState[idx] = typeof init === 'function' ? init() : init
      }
      const setState = (next) => {
        hookState[idx] = typeof next === 'function' ? next(hookState[idx]) : next
      }
      return [hookState[idx], setState]
    },
    useEffect(fn) { fn() },
    useRef(init) { return { current: init } },
    useCallback(fn) { return fn },
    createElement(type, props, ...children) {
      return { type, props: { ...props, children: children.flat() } }
    }
  }

  const mod = def.factory((modName) => {
    if (modName === 'react') return mockReact
    return {}
  })

  // 1. Direct unit verification of actual resolveTypography from the bundle
  const resolveTypography = mod.resolveTypography
  assert.equal(typeof resolveTypography, 'function', 'mod.resolveTypography must be a function exported by the bundle')

  // Empty config -> all false (strictly opt-in)
  assert.deepEqual(resolveTypography({}), {
    enabled: false,
    liveInput: false,
    yo: false
  }, 'Empty config must resolve to all false')

  // null or undefined -> all false
  assert.deepEqual(resolveTypography(null), {
    enabled: false,
    liveInput: false,
    yo: false
  })
  assert.deepEqual(resolveTypography(undefined), {
    enabled: false,
    liveInput: false,
    yo: false
  })

  // Partial configs
  assert.deepEqual(resolveTypography({ typography: { enabled: true } }), {
    enabled: true,
    liveInput: false,
    yo: false
  })

  assert.deepEqual(resolveTypography({ typography: { liveInput: true } }), {
    enabled: false,
    liveInput: true,
    yo: false
  })

  assert.deepEqual(resolveTypography({ typography: { yo: true } }), {
    enabled: false,
    liveInput: false,
    yo: true
  })

  // Full config
  assert.deepEqual(resolveTypography({ typography: { enabled: true, liveInput: true, yo: true } }), {
    enabled: true,
    liveInput: true,
    yo: true
  })

  // 2. Component verification: SettingsCard rendered with partial config
  const SettingsCard = mod.SettingsCard
  assert.equal(typeof SettingsCard, 'function', 'SettingsCard must be exported by the bundle')

  // Render with typography: { liveInput: true } (enabled is false)
  hookIdx = 0
  hookState = []
  const scopeLive = {
    getSnapshot: () => ({
      status: 'ready',
      writable: true,
      value: { typography: { liveInput: true } }
    }),
    subscribe: () => () => {},
    set: async () => true
  }

  const vdom = SettingsCard({
    view: 'page',
    inject: () => ({
      scope: scopeLive,
      runtime: {
        getLocale: () => ({ active: 'ru' }),
        subscribe: () => () => {}
      }
    })
  })

  assert.ok(vdom, 'SettingsCard must render JSX tree')
})
