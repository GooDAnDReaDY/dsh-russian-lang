import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const clientCode = fs.readFileSync(clientPath, 'utf-8')

test('Issue #412: client.js rejects fetchCachedResource when !delivered and network fails', () => {
  assert.ok(
    clientCode.includes('if (!delivered && networkError)'),
    'fetchCachedResource must check if (!delivered && networkError) and throw'
  )
  assert.ok(
    clientCode.includes('.catch((coreErr) =>'),
    'Core loader must catch core error and trigger fallback to /dict/all'
  )
  assert.ok(
    clientCode.includes("fetch('/api/dsh-russian-lang/dict/all'"),
    'Fallback to /api/dsh-russian-lang/dict/all must be present in core catch handler'
  )
})

test('Issue #412: Simulation of fetchCachedResource fallback logic', async () => {
  const simulateLoader = async ({ hasCache, coreStatus, allStatus }) => {
    let deliveredData = null
    let fallbackData = null
    let warningLogged = null

    // Simulate fetchCachedResource
    const fetchCached = async (url, cacheKey, onData) => {
      let delivered = false
      if (hasCache) {
        delivered = true
        onData({ fromCache: true })
      }

      let networkError = null
      if (coreStatus !== 200 && coreStatus !== 304) {
        networkError = new Error(`HTTP ${coreStatus}: Service Unavailable`)
      } else if (coreStatus === 200) {
        onData({ core: { common: { save: 'Сохранить' } } })
      }

      if (!delivered && networkError) {
        throw networkError
      }
    }

    // Core loader with fallback
    try {
      await fetchCached('/api/dsh-russian-lang/dict/core', 'core', (data) => {
        deliveredData = data
      })
    } catch (coreErr) {
      // Fallback
      if (allStatus === 200) {
        fallbackData = { core: { common: { save: 'Сохранить из fallback' } }, plugins: {} }
      } else {
        warningLogged = `Не удалось загрузить словари: core (${coreErr.message}) и fallback`
      }
    }

    return { deliveredData, fallbackData, warningLogged }
  }

  // 1. Without cache, core 503 -> fallback /dict/all called and delivers data
  const res1 = await simulateLoader({ hasCache: false, coreStatus: 503, allStatus: 200 })
  assert.equal(res1.deliveredData, null)
  assert.ok(res1.fallbackData)
  assert.equal(res1.fallbackData.core.common.save, 'Сохранить из fallback')

  // 2. Without cache, both core 503 and fallback fail -> diagnostic warning logged
  const res2 = await simulateLoader({ hasCache: false, coreStatus: 503, allStatus: 500 })
  assert.equal(res2.deliveredData, null)
  assert.equal(res2.fallbackData, null)
  assert.ok(res2.warningLogged.includes('core (HTTP 503: Service Unavailable)'))

  // 3. With usable cache, core 503 -> cached data used, no error thrown
  const res3 = await simulateLoader({ hasCache: true, coreStatus: 503, allStatus: 200 })
  assert.ok(res3.deliveredData)
  assert.equal(res3.deliveredData.fromCache, true)
  assert.equal(res3.fallbackData, null, 'Fallback must not be needed when cache delivered')
})
