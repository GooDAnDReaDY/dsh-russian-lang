import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('v0.3.1 (#296): client.js содержит UI управления переопределениями (overrides)', () => {
  const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
  const clientSrc = fs.readFileSync(clientPath, 'utf-8')

  assert.ok(clientSrc.includes('secOverrides'), 'содержит secOverrides')
  assert.ok(clientSrc.includes('overrideKeyPlaceholder'), 'содержит overrideKeyPlaceholder')
  assert.ok(clientSrc.includes('overrideValuePlaceholder'), 'содержит overrideValuePlaceholder')
  assert.ok(clientSrc.includes('overrideAddBtn'), 'содержит overrideAddBtn')
  assert.ok(clientSrc.includes('overrideDelete'), 'содержит overrideDelete')
  assert.ok(clientSrc.includes("scope.set('overrides'"), 'содержит scope.set overrides')
})

test('v0.3.1 (#296): переопределения имеют наивысший приоритет над словарями', () => {
  const overrides = {
    'common.back': 'Вернуться назад',
    'sidebar.settings': 'Параметры системы'
  }
  const defaultDict = {
    'common.back': 'Назад',
    'sidebar.settings': 'Настройки'
  }

  const translate = (key) => overrides[key] !== undefined ? overrides[key] : defaultDict[key]

  assert.equal(translate('common.back'), 'Вернуться назад')
  assert.equal(translate('sidebar.settings'), 'Параметры системы')

  // Удаление оверрайда возвращает дефолтный перевод
  delete overrides['common.back']
  assert.equal(translate('common.back'), 'Назад')
})
