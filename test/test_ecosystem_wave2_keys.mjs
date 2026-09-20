import test from 'node:test'
import assert from 'node:assert/strict'
import { getAllDictionaries } from '../lib/locales.js'

test('v0.3.1 ecosystem wave 2: dsh-task-tracker UI keys translated', () => {
  const all = getAllDictionaries()
  const tt = all['dsh-task-tracker']
  assert.ok(tt, 'dsh-task-tracker must exist')
  assert.equal(tt['tasks.addTask'], '+ Добавить задачу')
  assert.equal(tt['tasks.createFolder'], 'Создать папку')
  assert.equal(tt['tasks.startChatWithAgent'], '💬 Начать чат с агентом')
  assert.equal(tt['tasks.priority.high'], 'Высокий')
  assert.equal(tt['updater.available'], 'Доступно обновление: v{v}')
})

test('v0.3.1 ecosystem wave 2: dsh-subscriptions connect/OAuth keys translated', () => {
  const all = getAllDictionaries()
  const subs = all['dsh-subscriptions']
  assert.ok(subs, 'dsh-subscriptions must exist')
  assert.equal(subs['connect'], 'Подключить')
  assert.equal(subs['disconnect'], 'Отключить')
  assert.equal(subs['coolingDown'], 'Остывание (cooldown)')
  assert.ok(subs['missingClientIdAntigravity'].includes('Google OAuth'))
  assert.equal(subs['verifyLink'], 'Открыть ссылку для подтверждения')
})

test('v0.3.1 ecosystem wave 2: dsh-clinebot, dsh-gitea, dsh-messenger-gateway translated', () => {
  const all = getAllDictionaries()
  const cb = all['dsh-clinebot']
  assert.equal(cb['update.available'], 'Доступно обновление: v{latestVersion} (текущая: v{currentVersion})')
  assert.equal(cb['update.done'], 'Успешно обновлено до v{version}! Перезапустите DSH для применения.')

  const gt = all['dsh-gitea']
  assert.equal(gt['eventsEmptyHint'], 'Вебхуки не настроены или событий пока нет. Настройте вебхук на адрес {url}.')

  const msg = all['dsh-messenger-gateway']
  assert.equal(msg['badge.api_degraded'], 'Сбои Telegram API ({count})')
})
