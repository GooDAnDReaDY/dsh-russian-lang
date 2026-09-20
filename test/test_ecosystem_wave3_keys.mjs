import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPluginDictionariesByNames } from '../lib/locales.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('v0.3.1 (#316): Wave 3 ecosystem keys are loaded and translated', () => {
  const plugins = getPluginDictionariesByNames([
    'dsh-cron',
    'dsh-image-gen',
    'dsh-server-monitor',
    'dsh-voice',
    'dsh-lanmode',
    'dsh-model-search',
    'dsh-task-tracker',
    'dsh-issue-reporter',
    'dsh-model-sync',
    'dsh-agent-orchestrator',
    'dsh-grok-xsearch'
  ])

  // dsh-cron
  assert.equal(plugins['dsh-cron']['updater.title'], 'Автообновление плагина')
  assert.equal(plugins['dsh-cron']['updater.upToDate'], 'Актуальная версия')

  // dsh-image-gen
  assert.equal(plugins['dsh-image-gen']['settings.navLabel'], 'Студия изображений')
  assert.equal(plugins['dsh-image-gen']['f.provider'], 'Провайдер изображений')

  // dsh-server-monitor
  assert.equal(plugins['dsh-server-monitor']['guideDescription'], 'Мониторинг статуса Linux-серверов (только чтение)')
  assert.equal(plugins['dsh-server-monitor']['add'], 'Добавить сервер')
  assert.equal(plugins['dsh-server-monitor']['generateKey'], 'Сгенерировать SSH-ключ')

  // dsh-voice
  assert.equal(plugins['dsh-voice']['jargonFrom'], 'Разговорный сленг')
  assert.equal(plugins['dsh-voice']['jargonTo'], 'Корректное написание')

  // dsh-lanmode
  assert.equal(plugins['dsh-lanmode']['deviceSetNickname'], 'Задать псевдоним')
  assert.equal(plugins['dsh-lanmode']['updaterTitle'], 'Обновления плагина')

  // dsh-model-search
  assert.equal(plugins['dsh-model-search']['title'], 'Поиск моделей')
  assert.equal(plugins['dsh-model-search']['updater_up_to_date'], 'Актуальная версия')

  // dsh-task-tracker
  assert.equal(plugins['dsh-task-tracker']['board.back'], 'В чат')
  assert.equal(plugins['dsh-task-tracker']['tasks.taskDetails'], 'Детали задачи')

  // dsh-issue-reporter
  assert.equal(plugins['dsh-issue-reporter']['copyCodeFailed'], 'Не удалось скопировать код верификации.')

  // dsh-model-sync
  assert.equal(plugins['dsh-model-sync']['checkForUpdates'], 'Проверить обновления')

  // dsh-agent-orchestrator
  assert.equal(plugins['dsh-agent-orchestrator']['badge.accepted'], '🟢 Результат субагента принят оркестратором')

  // dsh-grok-xsearch
  assert.equal(plugins['dsh-grok-xsearch']['updater_current'], 'Текущая версия')
})
