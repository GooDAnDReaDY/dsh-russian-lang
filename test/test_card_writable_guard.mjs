import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const bundle = fs.readFileSync(clientPath, 'utf-8')

function createClientHarness(initialSnap = { status: 'ready', writable: true, value: {} }, onScopeSet = async () => true) {
  let loadedDef = null
  let promptReturn = null
  let alertMessage = null

  const mockWindow = {
    __ModuleLoader__: {
      load(def) { loadedDef = def }
    },
    prompt: () => promptReturn,
    alert: (msg) => { alertMessage = msg }
  }

  function createMockElement(tag, attrs = {}) {
    const el = {
      nodeType: 1,
      tagName: tag.toUpperCase(),
      attributes: { ...attrs },
      style: {},
      dataset: {},
      classList: {
        add() {},
        remove() {},
        contains() { return false }
      },
      childNodes: [],
      children: [],
      innerHTML: '',
      textContent: '',
      value: '',
      disabled: false,
      title: '',
      onclick: null,
      focus() {},
      remove() {
        if (this.parentElement) {
          const idx = this.parentElement.children.indexOf(this)
          if (idx >= 0) this.parentElement.children.splice(idx, 1)
          const cIdx = this.parentElement.childNodes.indexOf(this)
          if (cIdx >= 0) this.parentElement.childNodes.splice(cIdx, 1)
        }
      },
      appendChild(child) {
        child.parentElement = this
        this.children.push(child)
        this.childNodes.push(child)
        return child
      },
      querySelector(sel) {
        return this.querySelectorAll(sel)[0] || null
      },
      querySelectorAll(sel) {
        const results = []
        function walk(node) {
          if (!node) return
          if (sel.startsWith('.')) {
            const cls = sel.slice(1)
            if ((node.className || '').split(/\s+/).includes(cls)) results.push(node)
          } else if (sel.startsWith('#')) {
            const id = sel.slice(1)
            if (node.id === id) results.push(node)
          } else if (node.tagName === sel.toUpperCase()) {
            results.push(node)
          }
          if (node.children) {
            for (const c of node.children) walk(c)
          }
        }
        walk(this)
        return results
      },
      closest(sel) {
        let cur = this
        while (cur) {
          if (sel.startsWith('.')) {
            const cls = sel.slice(1)
            if ((cur.className || '').split(/\s+/).includes(cls)) return cur
          } else if (sel.startsWith('#')) {
            const id = sel.slice(1)
            if (cur.id === id) return cur
          } else if (cur.tagName === sel.toUpperCase()) {
            return cur
          }
          cur = cur.parentElement
        }
        return null
      }
    }

    let _html = ''
    Object.defineProperty(el, 'innerHTML', {
      get() { return _html },
      set(val) {
        _html = val
        const btnClasses = [
          'rl-btn-close', 'rl-copy-key-btn', 'rl-copy-report-btn',
          'rl-reset-override-btn', 'rl-cancel-btn', 'rl-save-btn'
        ]
        const otherClasses = [
          'rl-modal-box', 'rl-badge-dim', 'rl-modal-key',
          'rl-modal-orig-row', 'rl-orig-text', 'rl-raw-text', 'rl-edit-val'
        ]
        for (const cls of btnClasses) {
          if (val.includes(cls)) {
            const btn = createMockElement('button')
            btn.className = cls
            el.appendChild(btn)
          }
        }
        for (const cls of otherClasses) {
          if (val.includes(cls)) {
            const t = cls === 'rl-edit-val' ? 'textarea' : 'div'
            const sub = createMockElement(t)
            sub.className = cls
            el.appendChild(sub)
          }
        }
      }
    })

    return el
  }

  const bodyEl = createMockElement('body')
  const headEl = createMockElement('head')

  const mockDoc = {
    head: headEl,
    body: bodyEl,
    documentElement: { getAttribute: () => 'ru-RU', lang: 'ru' },
    createElement(tag) { return createMockElement(tag) },
    getElementById(id) {
      if (id === 'dsh-ru-inspector-modal') {
        return bodyEl.querySelector('#dsh-ru-inspector-modal')
      }
      return null
    },
    querySelector(sel) { return bodyEl.querySelector(sel) },
    querySelectorAll(sel) { return bodyEl.querySelectorAll(sel) },
    addEventListener() {},
    removeEventListener() {}
  }

  // Evaluate the real production bundle
  new Function('window', 'document', bundle)(mockWindow, mockDoc)
  const def = mockWindow.__DEF__ || loadedDef
  assert.ok(def && typeof def.factory === 'function', 'Bundle must register module definition')

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

  let currentSnap = initialSnap
  const scopeListeners = []
  const scope = {
    getSnapshot() { return currentSnap },
    setSnapshot(next) {
      currentSnap = next
      for (const fn of scopeListeners) fn()
    },
    subscribe(fn) {
      scopeListeners.push(fn)
      return () => {
        const i = scopeListeners.indexOf(fn)
        if (i >= 0) scopeListeners.splice(i, 1)
      }
    },
    set: onScopeSet
  }

  let registeredSettingsCard = null
  const runtime = {
    translate: (ns, key) => key,
    getLocale: () => ({ active: 'ru', locales: [{ id: 'ru', label: 'Russian' }], revision: 1 }),
    lookup: () => undefined,
    register: () => () => {},
    subscribe: () => () => {},
    addLanguage: () => () => {},
    setLocale: () => {},
    host: { getSnapshot: () => ({ value: {} }), subscribe: () => () => {}, set: () => Promise.resolve(), unset: () => Promise.resolve() }
  }

  const ctx = {
    locale: runtime,
    configForms: { get: () => scope },
    slots: {
      inject: (name, fn) => fn(),
      register(entry, comp) {
        if (entry.name === 'plugins.row.config') {
          registeredSettingsCard = comp
        }
      }
    },
    effect: (cb) => cb(),
    emit: () => {}
  }

  mod.apply(ctx)

  return {
    mod,
    runtime,
    scope,
    mockDoc,
    mockWindow,
    setPrompt(val) { promptReturn = val },
    getAlert() { return alertMessage },
    SettingsCard: registeredSettingsCard || mod.SettingsCard,
    createMockElement,
    resetHooks() { hookIdx = 0; hookState = [] }
  }
}

function findInTree(tree, predicate) {
  if (!tree) return null
  if (predicate(tree)) return tree
  if (tree.props && tree.props.children) {
    const ch = Array.isArray(tree.props.children) ? tree.props.children : [tree.props.children]
    for (const c of ch) {
      const found = findInTree(c, predicate)
      if (found) return found
    }
  }
  return null
}

test('Issue #439 / #417 / #437: Actual built runtime.openInspector guards writable states', async () => {
  // 1. Read-only snapshot (writable: false) disables save and reset buttons in production inspector modal
  const hReadOnly = createClientHarness({ status: 'ready', writable: false, value: { overrides: { 'common.cancel': 'Отмена' } } })
  hReadOnly.runtime.openInspector({ key: 'common.cancel', value: 'Отмена', source: 'override' }, 'Отмена')

  const modal = hReadOnly.mockDoc.body.children[0]
  assert.ok(modal, 'Inspector modal must be added to document.body')
  const saveBtn = modal.querySelector('.rl-save-btn')
  const resetBtn = modal.querySelector('.rl-reset-override-btn')

  assert.ok(saveBtn, 'Save button (.rl-save-btn) must exist in inspector modal')
  assert.equal(saveBtn.disabled, true, 'Save button must be disabled when writable is false')
  assert.equal(saveBtn.title, 'Настройки доступны только для чтения')
  assert.ok(resetBtn, 'Reset button (.rl-reset-override-btn) must exist for override source')
  assert.equal(resetBtn.disabled, true, 'Reset button must be disabled when writable is false')

  // 2. Writable snapshot: saving calls actual scope.set and updates button status
  let savedData = null
  const hWritable = createClientHarness({ status: 'ready', writable: true, value: {} }, async (key, val) => {
    savedData = { key, val }
    return true
  })

  const targetEl = hWritable.createMockElement('span')
  targetEl.textContent = 'Оригинал'
  hWritable.runtime.openInspector({ key: 'common.cancel', value: 'Отмена' }, 'Оригинал', targetEl)

  const wModal = hWritable.mockDoc.body.children[0]
  const wSaveBtn = wModal.querySelector('.rl-save-btn')
  const wTextarea = wModal.querySelector('.rl-edit-val')
  assert.equal(wSaveBtn.disabled, false, 'Save button must be enabled when writable is true')

  wTextarea.value = 'Моя отмена'
  await wSaveBtn.onclick()

  assert.deepEqual(savedData, { key: 'overrides', val: { 'common.cancel': 'Моя отмена' } })
  assert.equal(wSaveBtn.textContent, '✓ Применено')
  assert.equal(targetEl.textContent, 'Моя отмена')

  // 3. Writable snapshot: save rejection sets error status and does not crash
  const hFailing = createClientHarness({ status: 'ready', writable: true, value: {} }, async () => false)
  hFailing.runtime.openInspector({ key: 'common.cancel', value: 'Отмена' }, 'Отмена')

  const fModal = hFailing.mockDoc.body.children[0]
  const fSaveBtn = fModal.querySelector('.rl-save-btn')
  const fTextarea = fModal.querySelector('.rl-edit-val')
  fTextarea.value = 'Сбойный текст'
  await fSaveBtn.onclick()

  assert.equal(fSaveBtn.textContent, 'Ошибка сохранения')
  assert.equal(fSaveBtn.disabled, false, 'Save button must be re-enabled after error')
})

test('Issue #439 / #417: Actual SettingsCard component disables JSON import when writable: false', async () => {
  // 1. Readonly SettingsCard
  let setInvoked = false
  const hReadOnly = createClientHarness({ status: 'ready', writable: false, value: {} }, async () => {
    setInvoked = true
    return true
  })

  const vdom = hReadOnly.SettingsCard({ view: 'page', inject: () => ({ scope: hReadOnly.scope, runtime: hReadOnly.runtime }) })
  assert.ok(vdom, 'SettingsCard must render JSX tree')

  const isImportBtn = (node) => {
    if (node && node.type === 'button' && node.props && node.props.children) {
      const ch = Array.isArray(node.props.children) ? node.props.children[0] : node.props.children
      return ch === 'importJsonBtn' || ch === '📥 Импорт JSON' || ch === '📥 Import JSON'
    }
    return false
  }

  const importBtn = findInTree(vdom, isImportBtn)
  assert.ok(importBtn, 'Import JSON button must be rendered in SettingsCard')
  assert.equal(importBtn.props.disabled, true, 'Import JSON button must have disabled: true when snap.writable is false')

  // Calling onClick on disabled button must not invoke scope.set
  hReadOnly.setPrompt('{"common.cancel": "Тест"}')
  await importBtn.props.onClick()
  assert.equal(setInvoked, false, 'Disabled Import button must NOT call scope.set')

  // 2. Writable SettingsCard
  const hWritable = createClientHarness({ status: 'ready', writable: true, value: { overrides: { a: '1' } } }, async () => {
    setInvoked = true
    return true
  })

  const wVdom = hWritable.SettingsCard({ view: 'page', inject: () => ({ scope: hWritable.scope, runtime: hWritable.runtime }) })
  const wImportBtn = findInTree(wVdom, isImportBtn)
  assert.ok(wImportBtn, 'Import JSON button must be rendered')
  assert.equal(wImportBtn.props.disabled, false, 'Import JSON button must be enabled when writable is true')

  hWritable.setPrompt('{"b": "2"}')
  await wImportBtn.props.onClick()
  assert.equal(setInvoked, true, 'Enabled Import button must call scope.set on valid JSON')
})
