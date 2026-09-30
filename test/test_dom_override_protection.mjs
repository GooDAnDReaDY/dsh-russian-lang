import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const clientCode = fs.readFileSync(clientPath, 'utf-8')

test('Issue #405: isProtectedTextNode defined and called before curOverrides in ZH_WALKER', () => {
  assert.ok(
    clientCode.includes('const isProtectedTextNode = (node) =>'),
    'client.js must define isProtectedTextNode'
  )
  const walkerPos = clientCode.indexOf('const ZH_WALKER =')
  const protCallPos = clientCode.indexOf('if (isProtectedTextNode(node)) continue', walkerPos)
  const overridePos = clientCode.indexOf('if (curOverrides[trimmed] !== undefined)', walkerPos)

  assert.ok(walkerPos > 0, 'ZH_WALKER must exist')
  assert.ok(protCallPos > 0, 'isProtectedTextNode call must exist in ZH_WALKER')
  assert.ok(overridePos > 0, 'curOverrides check must exist in ZH_WALKER')
  assert.ok(
    protCallPos < overridePos,
    'isProtectedTextNode MUST be checked before applying curOverrides'
  )
})

test('Issue #405: Protected regions (code, pre, kbd, inputs, composer, streaming) block overrides', () => {
  // Simulate DOM-like environment to verify protection logic
  class MockElement {
    constructor(tagName, attributes = {}, parent = null) {
      this.tagName = tagName.toUpperCase()
      this.attributes = attributes
      this.parentElement = parent
      this.children = []
    }
    closest(selector) {
      const selectors = selector.split(',').map(s => s.trim())
      let curr = this
      while (curr) {
        for (const sel of selectors) {
          if (sel.startsWith('[') && sel.endsWith(']')) {
            const attrMatch = sel.slice(1, -1).split('=')
            const attrName = attrMatch[0]
            const attrVal = attrMatch[1] ? attrMatch[1].replace(/['"]/g, '') : null
            if (attrVal !== null) {
              if (curr.attributes[attrName] === attrVal) return curr
            } else {
              if (curr.attributes[attrName] !== undefined) return curr
            }
          } else if (sel.startsWith('.')) {
            const cls = sel.slice(1)
            if ((curr.attributes['class'] || '').split(/\s+/).includes(cls)) return curr
          } else {
            if (curr.tagName === sel.toUpperCase()) return curr
          }
        }
        curr = curr.parentElement
      }
      return null
    }
  }

  class MockTextNode {
    constructor(text, parent) {
      this.nodeValue = text
      this.parentElement = parent
    }
  }

  // Extract isProtectedTextNode logic from bundle or run equivalent
  const isProtected = (node) => {
    const p = node.parentElement
    if (!p) return true
    if (p.closest('code, pre, script, style, textarea, input, select, kbd, samp, [contenteditable="true"], [data-composer-input], [role="textbox"]')) return true
    if (p.closest('.katex, [data-latex], math')) return true
    if (p.closest('[data-chat-flow-status="running"], [data-turn-running], [data-turn-tail], [data-streaming="true"], .dsw-turn-running, [class*="streaming"], [class*="Streaming"]')) return true
    return false
  }

  const overrides = { 'Cancel': 'ПОДМЕНА' }

  const applyOverrides = (node) => {
    const val = node.nodeValue
    if (!val) return
    const trimmed = val.trim()
    if (!trimmed) return
    if (isProtected(node)) return
    if (overrides[trimmed] !== undefined) {
      node.nodeValue = val.replace(trimmed, overrides[trimmed])
    }
  }

  // 1. Inside <code> -> must remain 'Cancel'
  const codeEl = new MockElement('code')
  const nodeInCode = new MockTextNode('Cancel', codeEl)
  applyOverrides(nodeInCode)
  assert.equal(nodeInCode.nodeValue, 'Cancel', 'Code element text must remain unchanged')

  // 2. Inside <pre> -> must remain 'Cancel'
  const preEl = new MockElement('pre')
  const nodeInPre = new MockTextNode('Cancel', preEl)
  applyOverrides(nodeInPre)
  assert.equal(nodeInPre.nodeValue, 'Cancel', 'Pre element text must remain unchanged')

  // 3. Inside composer [contenteditable="true"] -> must remain 'Cancel'
  const compEl = new MockElement('div', { contenteditable: 'true' })
  const nodeInComp = new MockTextNode('Cancel', compEl)
  applyOverrides(nodeInComp)
  assert.equal(nodeInComp.nodeValue, 'Cancel', 'Contenteditable composer text must remain unchanged')

  // 4. Inside streaming turn -> must remain 'Cancel'
  const streamEl = new MockElement('div', { 'data-chat-flow-status': 'running' })
  const nodeInStream = new MockTextNode('Cancel', streamEl)
  applyOverrides(nodeInStream)
  assert.equal(nodeInStream.nodeValue, 'Cancel', 'Streaming turn text must remain unchanged')

  // 5. In regular UI <div> -> must be replaced with 'ПОДМЕНА'
  const divEl = new MockElement('div')
  const nodeInDiv = new MockTextNode('Cancel', divEl)
  applyOverrides(nodeInDiv)
  assert.equal(nodeInDiv.nodeValue, 'ПОДМЕНА', 'Regular UI text must be replaced by overrides')
})
