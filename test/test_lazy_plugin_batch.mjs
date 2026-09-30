import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const clientCode = fs.readFileSync(clientPath, 'utf-8')

test('Issue #413: client.js defines separate queuedPluginNames and inFlightPluginNames', () => {
  assert.ok(
    clientCode.includes('const inFlightPluginNames = new Set()'),
    'client.js must define inFlightPluginNames'
  )
  assert.ok(
    clientCode.includes('const queuedPluginNames = new Set()'),
    'client.js must define queuedPluginNames'
  )
  assert.ok(
    clientCode.includes('if (toLoad.length === 0) return'),
    'loadPluginDictionaries must return early if selective toLoad is empty, never downloading all'
  )
})

test('Issue #413: Simulation of plugin batching, failure retry, and empty batch guard', async () => {
  const loadedPluginNames = new Set()
  const inFlightPluginNames = new Set()
  const queuedPluginNames = new Set()
  let pluginBatchTimer = null

  const requestsMade = []
  let shouldFail = false

  const fakeFetchCachedResource = async (url, cacheKey, onData) => {
    requestsMade.push({ url, cacheKey })
    if (shouldFail) {
      throw new Error('503 Service Unavailable')
    }
    // Return mock plugin data matching the requested names
    const plugins = {}
    if (url.includes('?names=')) {
      const names = decodeURIComponent(url.split('?names=')[1]).split(',')
      for (const n of names) plugins[n] = { testKey: `translated_${n}` }
    } else {
      plugins['allPlugin'] = { key: 'all' }
    }
    onData({ plugins })
  }

  const loadPluginDictionaries = async (names) => {
    const isSelective = Array.isArray(names) && names.length > 0
    const toLoad = []
    if (isSelective) {
      for (const raw of names) {
        const n = String(raw).trim()
        if (!n || loadedPluginNames.has(n) || inFlightPluginNames.has(n)) continue
        toLoad.push(n)
        inFlightPluginNames.add(n)
      }
      if (toLoad.length === 0) return
    }

    const qs = toLoad.length > 0 ? ('?names=' + encodeURIComponent(toLoad.join(','))) : ''
    const url = '/api/dsh-russian-lang/dict/plugins' + qs
    const cacheKey = toLoad.length > 0 ? ('plugins_' + toLoad.slice().sort().join('_')) : 'plugins_all'

    try {
      await fakeFetchCachedResource(url, cacheKey, (data) => {
        if (data && data.plugins) {
          if (toLoad.length > 0) {
            for (const n of toLoad) loadedPluginNames.add(n)
          } else {
            for (const n of Object.keys(data.plugins)) loadedPluginNames.add(n)
          }
        }
      })
    } catch (_e) {
      // ignore in test
    } finally {
      for (const n of toLoad) inFlightPluginNames.delete(n)
    }
  }

  const flushQueue = async () => {
    if (pluginBatchTimer) {
      clearTimeout(pluginBatchTimer)
      pluginBatchTimer = null
    }
    const batch = Array.from(queuedPluginNames)
    queuedPluginNames.clear()
    if (batch.length > 0) await loadPluginDictionaries(batch)
  }

  const schedulePluginLoad = (name) => {
    if (!name) return
    const n = String(name).trim()
    if (!n || loadedPluginNames.has(n) || inFlightPluginNames.has(n) || queuedPluginNames.has(n)) return
    queuedPluginNames.add(n)
  }

  // 1. Two namespaces scheduled in batch produce a single request with both names
  schedulePluginLoad('pluginA')
  schedulePluginLoad('pluginB')
  await flushQueue()

  assert.equal(requestsMade.length, 1)
  assert.equal(requestsMade[0].url, '/api/dsh-russian-lang/dict/plugins?names=pluginA%2CpluginB')
  assert.ok(loadedPluginNames.has('pluginA'))
  assert.ok(loadedPluginNames.has('pluginB'))

  // 2. Already loaded names are never requested again
  schedulePluginLoad('pluginA')
  await flushQueue()
  assert.equal(requestsMade.length, 1, 'Already loaded pluginA must not generate another request')

  // 3. Failure clears in-flight and allows retry
  shouldFail = true
  schedulePluginLoad('pluginFail')
  await flushQueue()
  assert.equal(requestsMade.length, 2)
  assert.equal(requestsMade[1].url, '/api/dsh-russian-lang/dict/plugins?names=pluginFail')
  assert.equal(inFlightPluginNames.size, 0, 'inFlight must be cleared after failure')
  assert.equal(loadedPluginNames.has('pluginFail'), false)

  // Retry after failure succeeds
  shouldFail = false
  schedulePluginLoad('pluginFail')
  await flushQueue()
  assert.equal(requestsMade.length, 3, 'Retry must generate a new request')
  assert.ok(loadedPluginNames.has('pluginFail'))

  // 4. Selective call with already loaded names does NOT download all
  await loadPluginDictionaries(['pluginA', 'pluginB'])
  assert.equal(requestsMade.length, 3, 'Empty selective batch must return early without downloading all')
})
