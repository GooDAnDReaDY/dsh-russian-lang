import { getPluginDictionaries } from '../lib/locales.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { isTrustedUpdateRequest, isNewerVersion } from '../lib/plugin-updater.js'

test('v0.2.17: isNewerVersion compares semantic versions correctly', () => {
  assert.equal(isNewerVersion('0.2.16', '0.2.17'), true)
  assert.equal(isNewerVersion('0.2.17', '0.2.17'), false)
  assert.equal(isNewerVersion('0.2.17', '0.2.16'), false)
  assert.equal(isNewerVersion('0.2.17', '0.3.0'), true)
  assert.equal(isNewerVersion('0.2.17', '1.0.0'), true)
  assert.equal(isNewerVersion('0.2.17-rc.1', '0.2.17'), true)
})

test('v0.2.17: isTrustedUpdateRequest validates headers and loopback', () => {
  const untrusted = {
    headers: {},
    socket: { remoteAddress: '192.168.1.50' }
  }
  assert.equal(isTrustedUpdateRequest(untrusted), false)

  const missingHeader = {
    headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' },
    socket: { remoteAddress: '127.0.0.1' }
  }
  assert.equal(isTrustedUpdateRequest(missingHeader), false)

  const trusted = {
    headers: {
      'x-dsh-plugin-update': '1',
      'sec-fetch-site': 'same-origin',
      host: '127.0.0.1:3000',
      origin: 'http://127.0.0.1:3000'
    },
    socket: { remoteAddress: '127.0.0.1' }
  }
  assert.equal(isTrustedUpdateRequest(trusted), true)
})

test('v0.2.17: client.js bundle contains updated plugin translations and updater UI', () => {
  const clientSrc = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8') + JSON.stringify(getPluginDictionaries())
  
  // Plugin namespaces
  assert.match(clientSrc, /dsh-moa/)
  assert.match(clientSrc, /Оркестрация Mixture of Agents \(MoA\)/)
  assert.match(clientSrc, /dsh-messenger-gateway/)
  assert.match(clientSrc, /Шлюз Telegram и мессенджеров/)
  assert.match(clientSrc, /dsh-gitea/)
  assert.match(clientSrc, /Инспектор Git и Worktree/)
  assert.match(clientSrc, /dsh-lanmode/)
  assert.match(clientSrc, /Локальный доступ \(LAN Mode\)/)
  assert.match(clientSrc, /dsh-usage-guard/)
  assert.match(clientSrc, /Лимит сглаживания всплесков токенов/)
  assert.match(clientSrc, /dsh-cron/)
  assert.match(clientSrc, /ID постоянной сессии \(Target Session ID\)/)
  assert.match(clientSrc, /dsh-issue-reporter/)
  assert.match(clientSrc, /Сменить аккаунт/)
  assert.match(clientSrc, /dsh-agent-orchestrator/)
  assert.match(clientSrc, /Мульти-агентный оркестратор/)
  
  // Updater UI in SettingsCard
  assert.match(clientSrc, /secUpdater/)
  assert.match(clientSrc, /updaterCurrent/)
  assert.match(clientSrc, /\/api\/dsh-russian-lang\/update/)
})
