import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const bundle = fs.readFileSync(clientPath, 'utf-8')

test('Issue #439 / #405: Actual lib/client.js isProtectedTextNode and ZH_WALKER protect code, pre, inputs and composers', () => {
  let loadedDef = null
  const mockWindow = {
    __ModuleLoader__: { load(def) { loadedDef = def } }
  }

  class MockNode {
    constructor(type, val = '') {
      this.nodeType = type
      this.nodeValue = val
      this.parentElement = null
      this.childNodes = []
      this.children = []
      this.attributes = {}
      this.style = {}
      this.dataset = {}
      this.className = ''
      this.tagName = ''
    }
    appendChild(child) {
      child.parentElement = this
      this.childNodes.push(child)
      if (child.nodeType === 1) this.children.push(child)
      return child
    }
    closest(selector) {
      const selectors = selector.split(',').map(s => s.trim())
      let cur = this
      while (cur) {
        for (const sel of selectors) {
          if (sel.startsWith('[') && sel.endsWith(']')) {
            const inner = sel.slice(1, -1)
            const eqIdx = inner.indexOf('=')
            if (eqIdx >= 0) {
              const attrName = inner.slice(0, eqIdx).trim()
              const attrVal = inner.slice(eqIdx + 1).trim().replace(/['"]/g, '')
              if (cur.attributes[attrName] === attrVal) return cur
            } else {
              if (cur.attributes[inner] !== undefined) return cur
            }
          } else if (sel.startsWith('.')) {
            const cls = sel.slice(1)
            if ((cur.className || '').split(/\s+/).includes(cls)) return cur
          } else {
            if (cur.tagName === sel.toUpperCase()) return cur
          }
        }
        cur = cur.parentElement
      }
      return null
    }
  }

  function createElement(tag, attrs = {}) {
    const el = new MockNode(1)
    el.tagName = tag.toUpperCase()
    el.attributes = { ...attrs }
    el.style = {}
    el.dataset = {}
    if (attrs.class) el.className = attrs.class
    return el
  }

  function createTextNode(text) {
    return new MockNode(3, text)
  }

  const bodyEl = createElement('body')
  const headEl = createElement('head')

  const mockDoc = {
    head: headEl,
    body: bodyEl,
    documentElement: { getAttribute: () => 'ru-RU', lang: 'ru' },
    createElement,
    createTextNode,
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {},
    createTreeWalker(root) {
      const allTextNodes = []
      function walk(node) {
        if (!node) return
        if (node.nodeType === 3) allTextNodes.push(node)
        for (const c of node.childNodes) walk(c)
      }
      walk(root)
      let idx = 0
      return {
        nextNode() {
          if (idx < allTextNodes.length) return allTextNodes[idx++]
          return null
        }
      }
    }
  }

  global.NodeFilter = { SHOW_TEXT: 4 }

  new Function('window', 'document', bundle)(mockWindow, mockDoc)
  const def = mockWindow.__DEF__ || loadedDef
  assert.ok(def && typeof def.factory === 'function')

  const mod = def.factory(() => ({}))

  const runtime = {
    translate: (ns, key) => key,
    getLocale: () => ({ active: 'ru', locales: [{ id: 'ru', label: 'Russian' }] }),
    lookup: () => undefined,
    register: () => () => {},
    subscribe: () => () => {},
    addLanguage: () => () => {},
    setLocale: () => {},
    host: { getSnapshot: () => ({ value: {} }), subscribe: () => () => {}, set: () => Promise.resolve(), unset: () => Promise.resolve() }
  }

  const scope = {
    getSnapshot: () => ({
      status: 'ready',
      writable: true,
      value: { overrides: { 'Cancel': 'ПОДМЕНА' } }
    }),
    subscribe: () => () => {},
    set: async () => true
  }

  const ctx = {
    locale: runtime,
    configForms: { get: () => scope },
    slots: { inject: (n, f) => f(), register: () => {} },
    effect: (cb) => cb(),
    emit: () => {}
  }

  mod.apply(ctx)

  // Verify actual isProtectedTextNode and ZH_WALKER are exported from the bundle
  const isProtectedTextNode = mod.isProtectedTextNode
  const ZH_WALKER = mod.ZH_WALKER
  assert.equal(typeof isProtectedTextNode, 'function', 'mod.isProtectedTextNode must be a function')
  assert.equal(typeof ZH_WALKER, 'function', 'mod.ZH_WALKER must be a function')

  // Setup DOM elements inside body
  const codeEl = createElement('code')
  const nodeInCode = createTextNode('Cancel')
  codeEl.appendChild(nodeInCode)
  bodyEl.appendChild(codeEl)

  const preEl = createElement('pre')
  const nodeInPre = createTextNode('Cancel')
  preEl.appendChild(nodeInPre)
  bodyEl.appendChild(preEl)

  const compEl = createElement('div', { contenteditable: 'true' })
  const nodeInComp = createTextNode('Cancel')
  compEl.appendChild(nodeInComp)
  bodyEl.appendChild(compEl)

  const composerAttrEl = createElement('div', { 'data-composer-input': 'true' })
  const nodeInComposerAttr = createTextNode('Cancel')
  composerAttrEl.appendChild(nodeInComposerAttr)
  bodyEl.appendChild(composerAttrEl)

  const streamEl = createElement('div', { 'data-chat-flow-status': 'running' })
  const nodeInStream = createTextNode('Cancel')
  streamEl.appendChild(nodeInStream)
  bodyEl.appendChild(streamEl)

  const inputEl = createElement('input')
  const nodeInInput = createTextNode('Cancel')
  inputEl.appendChild(nodeInInput)
  bodyEl.appendChild(inputEl)

  const textareaEl = createElement('textarea')
  const nodeInTextarea = createTextNode('Cancel')
  textareaEl.appendChild(nodeInTextarea)
  bodyEl.appendChild(textareaEl)

  const regularDiv = createElement('div')
  const nodeInDiv = createTextNode('Cancel')
  regularDiv.appendChild(nodeInDiv)
  bodyEl.appendChild(regularDiv)

  // 1. Direct unit verification of actual isProtectedTextNode from bundle
  assert.equal(isProtectedTextNode(nodeInCode), true, 'node in <code> must be protected')
  assert.equal(isProtectedTextNode(nodeInPre), true, 'node in <pre> must be protected')
  assert.equal(isProtectedTextNode(nodeInComp), true, 'node in [contenteditable=true] must be protected')
  assert.equal(isProtectedTextNode(nodeInComposerAttr), true, 'node in [data-composer-input] must be protected')
  assert.equal(isProtectedTextNode(nodeInStream), true, 'node in [data-chat-flow-status=running] must be protected')
  assert.equal(isProtectedTextNode(nodeInInput), true, 'node in <input> must be protected')
  assert.equal(isProtectedTextNode(nodeInTextarea), true, 'node in <textarea> must be protected')
  assert.equal(isProtectedTextNode(nodeInDiv), false, 'node in regular <div> must NOT be protected')

  // 2. Execution of actual ZH_WALKER from bundle on document.body
  ZH_WALKER(bodyEl)

  assert.equal(nodeInCode.nodeValue, 'Cancel', 'Code text must remain unchanged')
  assert.equal(nodeInPre.nodeValue, 'Cancel', 'Pre text must remain unchanged')
  assert.equal(nodeInComp.nodeValue, 'Cancel', 'Composer text must remain unchanged')
  assert.equal(nodeInComposerAttr.nodeValue, 'Cancel', 'data-composer-input text must remain unchanged')
  assert.equal(nodeInStream.nodeValue, 'Cancel', 'Streaming text must remain unchanged')
  assert.equal(nodeInInput.nodeValue, 'Cancel', 'Input text must remain unchanged')
  assert.equal(nodeInTextarea.nodeValue, 'Cancel', 'Textarea text must remain unchanged')
  assert.equal(nodeInDiv.nodeValue, 'ПОДМЕНА', 'Regular div text must be replaced with override')
})
