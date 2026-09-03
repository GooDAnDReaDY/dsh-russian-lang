// Поисковая морфология и нечёткий матчинг палитры команд. Импорт из
// lib/pure.js — проверяется отгружаемый код (#133).
import { test } from 'node:test'
import assert from 'node:assert'
import { stemRussian, fuzzyMatchRu, translitEnToRu } from '../lib/pure.js'

test('stemRussian extracts word roots from different grammatical forms', () => {
  assert.equal(stemRussian('настройки'), 'настройк')
  assert.equal(stemRussian('настройками'), 'настройк')
  assert.equal(stemRussian('сессиями'), 'сесс')
  assert.equal(stemRussian('плагинов'), 'плагин')
  assert.equal(stemRussian('управление'), 'управл')
})

test('fuzzyMatchRu matches exact, sub-phrases and morphological variations', () => {
  assert.equal(fuzzyMatchRu('настройки', 'Общие настройки'), 90)
  assert.equal(fuzzyMatchRu('настройк', 'Общие настройки'), 90)
  assert.equal(fuzzyMatchRu('настройками', 'Общие настройки'), 80)
  assert.equal(fuzzyMatchRu('плагином', 'Управление плагинами'), 80)
  assert.equal(fuzzyMatchRu('yfcnhjqrb', 'Общие настройки'), 85)
  assert.equal(fuzzyMatchRu('сервер', 'Управление плагинами'), 0)
})
