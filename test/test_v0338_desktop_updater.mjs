import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isIPv4Loopback,
  isLoopbackAddress,
  isLoopbackHostname,
  isTrustedUpdateRequest,
} from '../lib/plugin-updater.js'
import {
  isTrustedTranslatorRequest,
  TRANSLATOR_HEADER,
} from '../lib/translator.js'
import packageJson from '../package.json' with { type: 'json' }

test('v0.3.38: isIPv4Loopback detects all 127.0.0.0/8 loopback addresses', () => {
  assert.equal(isIPv4Loopback('127.0.0.1'), true)
  assert.equal(isIPv4Loopback('127.0.0.2'), true)
  assert.equal(isIPv4Loopback('127.255.255.255'), true)
  assert.equal(isIPv4Loopback('127.1.2.3'), true)

  assert.equal(isIPv4Loopback('128.0.0.1'), false)
  assert.equal(isIPv4Loopback('192.168.1.1'), false)
  assert.equal(isIPv4Loopback('10.0.0.1'), false)
  assert.equal(isIPv4Loopback('127.0.0.256'), false)
  assert.equal(isIPv4Loopback('127.0.0'), false)
  assert.equal(isIPv4Loopback(''), false)
  assert.equal(isIPv4Loopback(undefined), false)
  assert.equal(isIPv4Loopback(null), false)
})

test('v0.3.38: isLoopbackAddress and isLoopbackHostname support IPv4, IPv6 and localhost', () => {
  assert.equal(isLoopbackAddress('127.0.0.1'), true)
  assert.equal(isLoopbackAddress('localhost'), true)
  assert.equal(isLoopbackAddress('localhost.'), true)
  assert.equal(isLoopbackAddress('::1'), true)
  assert.equal(isLoopbackAddress('[::1]'), true)
  assert.equal(isLoopbackAddress('::ffff:127.0.0.1'), true)
  assert.equal(isLoopbackAddress('::ffff:127.2.3.4'), true)

  assert.equal(isLoopbackAddress('198.51.100.50'), false)
  assert.equal(isLoopbackAddress('::ffff:192.168.1.1'), false)
  assert.equal(isLoopbackAddress(undefined), false)

  assert.equal(isLoopbackHostname('localhost'), true)
  assert.equal(isLoopbackHostname('127.0.0.1'), true)
  assert.equal(isLoopbackHostname('[::1]'), true)
  assert.equal(isLoopbackHostname('::1'), true)
  assert.equal(isLoopbackHostname('attacker.com'), false)
  assert.equal(isLoopbackHostname('localhost.evil.com'), false)
})

test('v0.3.38: isTrustedUpdateRequest supports Electron desktop environments', () => {
  // 1. Electron with no Origin and sec-fetch-site: 'none'
  const electronDirect = {
    headers: {
      'x-dsh-plugin-update': '1',
      'sec-fetch-site': 'none',
      host: '127.0.0.1:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }
  assert.equal(isTrustedUpdateRequest(electronDirect), true)

  // 2. Electron renderer with Origin: 'null'
  const electronNullOrigin = {
    headers: {
      'x-dsh-plugin-update': '1',
      'sec-fetch-site': 'none',
      origin: 'null',
      host: '127.0.0.1:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }
  assert.equal(isTrustedUpdateRequest(electronNullOrigin), true)

  // 3. Electron with file:// origin
  const electronFile = {
    headers: {
      'x-dsh-plugin-update': '1',
      'sec-fetch-site': 'same-site',
      origin: 'file:///C:/Users/app/dist/index.html',
      host: '127.0.0.1:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }
  assert.equal(isTrustedUpdateRequest(electronFile), true)

  // 4. Electron custom protocols (dsh:, app:, vscode-file:)
  for (const scheme of ['dsh://app', 'app://desktop', 'vscode-file://vscode-app']) {
    const customProto = {
      headers: {
        'x-dsh-plugin-update': '1',
        origin: scheme,
        host: '127.0.0.1:3080',
      },
      socket: { remoteAddress: '127.0.0.1' },
    }
    assert.equal(isTrustedUpdateRequest(customProto), true)
  }

  // 5. Inter-loopback match (localhost:3080 vs 127.0.0.1:3080)
  const interLoopback = {
    headers: {
      'x-dsh-plugin-update': '1',
      origin: 'http://localhost:3080',
      host: '127.0.0.1:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }
  assert.equal(isTrustedUpdateRequest(interLoopback), true)

  // 6. IPv6 loopback match
  const ipv6Loopback = {
    headers: {
      'x-dsh-plugin-update': '1',
      origin: 'http://[::1]:3080',
      host: '[::1]:3080',
    },
    socket: { remoteAddress: '::1' },
  }
  assert.equal(isTrustedUpdateRequest(ipv6Loopback), true)
})

test('v0.3.38: isTrustedUpdateRequest strictly rejects attacks and remote calls', () => {
  // Remote socket remoteAddress
  const remoteClient = {
    headers: {
      'x-dsh-plugin-update': '1',
      host: '127.0.0.1:3080',
    },
    socket: { remoteAddress: '198.51.100.50' },
  }
  assert.equal(isTrustedUpdateRequest(remoteClient), false)

  // LAN client trying to invoke updater
  const lanClient = {
    headers: {
      'x-dsh-plugin-update': '1',
      host: '192.168.1.111:3080',
    },
    socket: { remoteAddress: '192.168.1.55' },
  }
  assert.equal(isTrustedUpdateRequest(lanClient), false)

  // DNS rebinding attack: remote address is loopback, but Host is attacker.com
  const dnsRebinding = {
    headers: {
      'x-dsh-plugin-update': '1',
      host: 'attacker.com:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }
  assert.equal(isTrustedUpdateRequest(dnsRebinding), false)

  // Cross-origin attack from external website
  const crossSiteAttack = {
    headers: {
      'x-dsh-plugin-update': '1',
      'sec-fetch-site': 'cross-site',
      origin: 'https://evil-attacker.com',
      host: '127.0.0.1:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }
  assert.equal(isTrustedUpdateRequest(crossSiteAttack), false)

  // Port mismatch between loopbacks
  const portMismatch = {
    headers: {
      'x-dsh-plugin-update': '1',
      origin: 'http://localhost:8080',
      host: '127.0.0.1:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }
  assert.equal(isTrustedUpdateRequest(portMismatch), false)

  // Missing update header
  const missingHeader = {
    headers: {
      host: '127.0.0.1:3080',
    },
    socket: { remoteAddress: '127.0.0.1' },
  }
  assert.equal(isTrustedUpdateRequest(missingHeader), false)
})

test('v0.3.38: isTrustedTranslatorRequest validates desktop and LAN/Tailscale access', () => {
  // Desktop Electron request
  const electronReq = {
    headers: {
      [TRANSLATOR_HEADER]: '1',
      'sec-fetch-site': 'none',
      host: '127.0.0.1:3080',
    },
  }
  assert.equal(isTrustedTranslatorRequest(electronReq), true)

  // Web LAN access
  const lanReq = {
    headers: {
      [TRANSLATOR_HEADER]: '1',
      origin: 'http://192.168.1.111:3080',
      host: '192.168.1.111:3080',
    },
  }
  assert.equal(isTrustedTranslatorRequest(lanReq), true)

  // Tailscale access
  const tailscaleReq = {
    headers: {
      [TRANSLATOR_HEADER]: '1',
      origin: 'http://100.80.20.10:3080',
      host: '100.80.20.10:3080',
    },
  }
  assert.equal(isTrustedTranslatorRequest(tailscaleReq), true)

  // Cross-site malicious attempt
  const attackReq = {
    headers: {
      [TRANSLATOR_HEADER]: '1',
      'sec-fetch-site': 'cross-site',
      origin: 'https://evil.com',
      host: '127.0.0.1:3080',
    },
  }
  assert.equal(isTrustedTranslatorRequest(attackReq), false)
})

test('v0.3.38: package.json version is 0.3.38', () => {
  assert.equal(packageJson.version, '0.3.38')
})
