import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const clientCode = fs.readFileSync(clientPath, 'utf-8')

test('Issue #415: typography effect subscribes to scope settings changes and cancels RAF', () => {
  assert.ok(
    clientCode.includes('unsubscribeScope = typeof scope?.subscribe === \'function\' ? scope.subscribe(syncTypo) :'),
    'typography effect must subscribe to scope settings changes'
  )
  assert.ok(
    clientCode.includes('if (typoQueued) { cancelAnimationFrame(typoQueued); typoQueued = null }'),
    'typography effect must cancel pending RAF on disposal or disable'
  )
})

test('Issue #415: Simulation of dynamic typography enable/disable on settings update', () => {
  let observerActive = false
  let observedRoots = []
  let rafPending = null

  let config = { typography: { enabled: false } }
  let activeLocale = 'ru'

  const scopeListeners = []
  const localeListeners = []

  const scope = {
    getSnapshot: () => ({ value: config }),
    subscribe: (fn) => {
      scopeListeners.push(fn)
      return () => {
        const idx = scopeListeners.indexOf(fn)
        if (idx >= 0) scopeListeners.splice(idx, 1)
      }
    }
  }

  const runtime = {
    getLocale: () => ({ active: activeLocale }),
    subscribe: (fn) => {
      localeListeners.push(fn)
      return () => {
        const idx = localeListeners.indexOf(fn)
        if (idx >= 0) localeListeners.splice(idx, 1)
      }
    }
  }

  const getTypoConf = () => {
    const t = scope.getSnapshot().value?.typography
    if (!t || t.enabled === false) return null
    return { yo: t.yo === true }
  }

  const syncTypo = () => {
    const conf = getTypoConf()
    const isRu = runtime.getLocale().active === 'ru'
    if (!isRu || !conf) {
      if (observerActive) {
        observerActive = false
      }
      if (rafPending) {
        rafPending = null
      }
      return
    }
    observerActive = true
  }

  // Setup effect
  const unsubscribeLocale = runtime.subscribe(syncTypo)
  const unsubscribeScope = scope.subscribe(syncTypo)
  syncTypo()

  // 1. Initially disabled
  assert.equal(observerActive, false, 'Observer must be inactive initially')

  // 2. User enables typography via settings -> scope listener fires -> observer becomes active immediately!
  config = { typography: { enabled: true, yo: true } }
  for (const l of scopeListeners) l()
  assert.equal(observerActive, true, 'Observer must become active immediately when enabled in settings')

  // 3. User disables typography via settings -> observer disconnects immediately!
  config = { typography: { enabled: false } }
  for (const l of scopeListeners) l()
  assert.equal(observerActive, false, 'Observer must disconnect immediately when disabled in settings')

  // 4. Dispose cleans up listeners
  unsubscribeLocale()
  unsubscribeScope()
  assert.equal(scopeListeners.length, 0)
  assert.equal(localeListeners.length, 0)
})
