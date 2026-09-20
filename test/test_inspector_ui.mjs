import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { findTranslationKey } from '../lib/pure.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientJsPath = path.resolve(__dirname, '../lib/client.js')

test('findTranslationKey: находит ключ в оверрайдах с наивысшим приоритетом', () => {
  const dicts = { common: { save: 'Сохранить', back: 'Назад' } }
  const overrides = { back: 'Вернуться обратно' }
  const match = findTranslationKey('Вернуться обратно', dicts, overrides)
  assert.ok(match, 'матч найден')
  assert.equal(match.key, 'back')
  assert.equal(match.source, 'override')
})

test('findTranslationKey: находит ключ в словарях неймспейсов', () => {
  const dicts = {
    common: { save: 'Сохранить' },
    settings: { title: 'Параметры системы' }
  }
  const match = findTranslationKey('Параметры системы', dicts, {})
  assert.ok(match, 'матч найден')
  assert.equal(match.ns, 'settings')
  assert.equal(match.key, 'title')
  assert.equal(match.value, 'Параметры системы')
  assert.equal(match.source, 'dictionary')
})

test('findTranslationKey: находит китайский оригинал в zhRu парах', () => {
  const zhRu = { '重试': 'Повторить' }
  const match = findTranslationKey('Повторить', {}, {}, zhRu)
  assert.ok(match, 'матч найден')
  assert.equal(match.zh, '重试')
  assert.equal(match.source, 'dom_zh')
})

test('findTranslationKey: возвращает null для ненайденных или пустых строк', () => {
  assert.equal(findTranslationKey('', {}, {}), null)
  assert.equal(findTranslationKey('   ', {}, {}), null)
  assert.equal(findTranslationKey('Неизвестная фраза 12345', {}, {}), null)
})

test('client.js: содержит реализацию инспектора переводов и Alt+Click', () => {
  const clientJs = fs.readFileSync(clientJsPath, 'utf8')
  assert.ok(clientJs.includes('dsh-ru-inspector-modal'), 'модалка инспектора присутствует')
  assert.ok(clientJs.includes('openInspectorModal'), 'функция openInspectorModal присутствует')
  assert.ok(clientJs.includes('translationRegistry'), 'реестр переводов на клиенте присутствует')
  assert.ok(clientJs.includes('altKey'), 'обработчик клика с altKey присутствует')
  assert.ok(clientJs.includes('rl-modal-mask'), 'CSS класс маски инспектора присутствует')
})
