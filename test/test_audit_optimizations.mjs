import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isTrustedTranslatorRequest } from '../lib/translator.js'
import { makeTypoYo } from '../lib/pure.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('Issue #325 / #359: isTrustedTranslatorRequest protects translator endpoints', () => {
  // 1. Valid local request (loopback, same-origin, custom header)
  assert.equal(isTrustedTranslatorRequest({
    socket: { remoteAddress: '127.0.0.1' },
    headers: {
      'x-dsh-translator': '1',
      'sec-fetch-site': 'same-origin',
      origin: 'http://127.0.0.1:3000',
      host: '127.0.0.1:3000'
    }
  }), true)

  // 2. IPv6 loopback
  assert.equal(isTrustedTranslatorRequest({
    socket: { remoteAddress: '::1' },
    headers: {
      'x-dsh-translator': '1',
      'sec-fetch-site': 'same-origin',
      origin: 'http://localhost:3000',
      host: 'localhost:3000'
    }
  }), true)

  // 3. Rejected: missing x-dsh-translator header
  assert.equal(isTrustedTranslatorRequest({
    socket: { remoteAddress: '127.0.0.1' },
    headers: {
      'sec-fetch-site': 'same-origin',
      origin: 'http://127.0.0.1:3000',
      host: '127.0.0.1:3000'
    }
  }), false)

  // 4. Allowed: external remote IP but Origin matches Host (LAN/Tailscale)
  assert.equal(isTrustedTranslatorRequest({
    socket: { remoteAddress: '198.51.100.150' },
    headers: {
      'x-dsh-translator': '1',
      'sec-fetch-site': 'same-origin',
      origin: 'http://127.0.0.1:3000',
      host: '127.0.0.1:3000'
    }
  }), true)

  // 4b. Allowed: LAN IP in Origin matching Host (Tailscale/LAN use case)
  assert.equal(isTrustedTranslatorRequest({
    socket: { remoteAddress: '198.51.100.50' },
    headers: {
      'x-dsh-translator': '1',
      'sec-fetch-site': 'same-origin',
      origin: 'http://192.168.1.100:3000',
      host: '192.168.1.100:3000'
    }
  }), true)

  // 4c. Rejected: Origin host doesn't match Host header
  assert.equal(isTrustedTranslatorRequest({
    socket: { remoteAddress: '198.51.100.50' },
    headers: {
      'x-dsh-translator': '1',
      'sec-fetch-site': 'same-origin',
      origin: 'http://192.168.1.100:3000',
      host: '192.168.1.200:3000'
    }
  }), false)

  // 5. Rejected: cross-site request (CSRF)
  assert.equal(isTrustedTranslatorRequest({
    socket: { remoteAddress: '127.0.0.1' },
    headers: {
      'x-dsh-translator': '1',
      'sec-fetch-site': 'cross-site',
      origin: 'http://evil-site.com',
      host: '127.0.0.1:3000'
    }
  }), false)

  // 6. Rejected: cross-origin with external origin
  assert.equal(isTrustedTranslatorRequest({
    socket: { remoteAddress: '127.0.0.1' },
    headers: {
      'x-dsh-translator': '1',
      origin: 'http://malicious.org',
      host: '127.0.0.1:3000'
    }
  }), false)

  // 7. Rejected: missing origin or host (#359)
  assert.equal(isTrustedTranslatorRequest({
    socket: { remoteAddress: '127.0.0.1' },
    headers: { 'x-dsh-translator': '1' }
  }), false)
})

test('Issue #327: lib/index.js contains 405 Method Not Allowed checks on dict routes', () => {
  const indexPath = path.join(__dirname, '..', 'lib', 'index.js')
  const indexCode = fs.readFileSync(indexPath, 'utf-8')

  assert.ok(indexCode.includes("request.method !== 'GET' && request.method !== 'HEAD'"), 'проверяет метод GET и HEAD')
  assert.ok(indexCode.includes("allow: 'GET, HEAD'"), 'передаёт заголовок allow')
  assert.ok(indexCode.includes("405"), 'возвращает статус 405 Method Not Allowed')
})

test('Issue #326: zhObserver avoids characterData observation and debounces walks', () => {
  const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
  const clientCode = fs.readFileSync(clientPath, 'utf-8')

  assert.doesNotMatch(clientCode, /characterData:\s*true/, 'zhObserver не подписан на characterData')
  assert.ok(clientCode.includes('queueZhWalk'), 'zhObserver использует queueZhWalk с троттлингом')
  assert.ok(clientCode.includes('.chat-message'), 'zhObserver игнорирует стриминг сообщений чата')
})

test('Issue #328: lib/client.js size is well below 160 KiB safe target', () => {
  const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
  const stat = fs.statSync(clientPath)

  const SAFE_LIMIT = 163840 // 160 KiB
  const STORE_LIMIT = 262144 // 256 KiB

  assert.ok(stat.size < SAFE_LIMIT, `client.js (${stat.size} bytes) превышает safe target 160 KiB (${SAFE_LIMIT} bytes)`)
  assert.ok(stat.size < STORE_LIMIT, `client.js (${stat.size} bytes) превышает Store limit 256 KiB`)
  assert.ok(SAFE_LIMIT - stat.size > 10000, `Запас безопасной зоны (${SAFE_LIMIT - stat.size} bytes) должен быть > 10 KiB`)
})

test('Issue #328: makeTypoYo works with both array and pipe-delimited string format', () => {
  const fromArray = makeTypoYo([['еще', 'ещё'], ['плагин', 'плагён']])
  assert.equal(fromArray('еще плагин'), 'ещё плагён')

  const fromString = makeTypoYo('еще:ещё|плагин:плагён')
  assert.equal(fromString('еще плагин'), 'ещё плагён')
})
