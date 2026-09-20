import test from 'node:test'
import assert from 'node:assert/strict'
import { getPluginDictionariesByNames } from '../lib/locales.js'

test('v0.3.1 (#321): Wave 4 ecosystem keys are loaded and translated', () => {
  const plugins = getPluginDictionariesByNames([
    'dsh-web-gateway',
    '@goodandready/dsh-web-gateway',
    'dsh-approval-gate',
    '@goodandready/dsh-approval-gate',
    'dsh-hypotheses',
    '@goodandready/dsh-hypotheses',
    '@goodandready-private/dsh-agentrouter'
  ])

  // dsh-web-gateway
  assert.equal(plugins['dsh-web-gateway']['title'], 'Веб-шлюз (Web Gateway)')
  assert.equal(plugins['dsh-web-gateway']['defaultLimit'], 'Лимит результатов по умолчанию')
  assert.equal(plugins['dsh-web-gateway']['allowInternalUrlsDesc'].includes('loopback'), true)
  assert.equal(plugins['@goodandready/dsh-web-gateway']['title'], 'Веб-шлюз (Web Gateway)')

  // dsh-approval-gate
  assert.equal(plugins['dsh-approval-gate']['blockedPrefix'], 'Заблокировано правилом dsh-approval-gate')
  assert.equal(plugins['dsh-approval-gate']['approvalRequired'], 'Требуется подтверждение')
  assert.equal(plugins['dsh-approval-gate']['ruleGitResetHard'], 'Разрушающий git reset --hard')
  assert.equal(plugins['@goodandready/dsh-approval-gate']['blockedPrefix'], 'Заблокировано правилом dsh-approval-gate')

  // dsh-hypotheses
  assert.equal(plugins['dsh-hypotheses']['title'], 'Гипотезы')
  assert.equal(plugins['dsh-hypotheses']['confidenceHistory'], 'История уверенности')
  assert.equal(plugins['dsh-hypotheses']['notifications'], 'Уведомления о завершении расследования')
  assert.equal(plugins['@goodandready/dsh-hypotheses']['title'], 'Гипотезы')
  assert.equal(plugins['@goodandready/dsh-hypotheses']['recentEvidence'], 'Последние факты')

  // dsh-agentrouter
  assert.equal(plugins['@goodandready-private/dsh-agentrouter']['title'], 'AgentRouter')
  assert.equal(plugins['@goodandready-private/dsh-agentrouter']['enabled'], 'Включено')
})
