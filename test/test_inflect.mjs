// Склонение сущностей и имён по падежам. Импорт из lib/pure.js — тест ест
// тот же код, что уезжает в бандл (#133).
import { test } from 'node:test'
import assert from 'node:assert'
import { inflect, inflectWord, INFLECT_CUSTOM } from '../lib/pure.js'

test('inflect handles Russian masculine nouns and names', () => {
  assert.equal(inflect('Иван', 'gen'), 'Ивана')
  assert.equal(inflect('Иван', 'dat'), 'Ивану')
  assert.equal(inflect('Иван', 'ins'), 'Иваном')
  assert.equal(inflect('Иван', 'pre'), 'Иване')

  assert.equal(inflect('сервер', 'gen'), 'сервера')
  assert.equal(inflect('пользователь', 'gen'), 'пользователя')
  assert.equal(inflect('пользователь', 'ins'), 'пользователем')
  assert.equal(inflect('агент', 'dat'), 'агенту')
})

test('inflect handles Russian feminine and neuter nouns', () => {
  assert.equal(inflect('модель', 'gen'), 'модели')
  assert.equal(inflect('модель', 'ins'), 'моделью')
  assert.equal(inflect('сессия', 'gen'), 'сессии')
  assert.equal(inflect('сессия', 'acc'), 'сессию')
  assert.equal(inflect('ветка', 'dat'), 'ветке')
  assert.equal(inflect('папка', 'gen'), 'папки')
})

test('inflect safely preserves Latin, acronyms, and numbers', () => {
  assert.equal(inflect('DeepSeek-V3', 'gen'), 'DeepSeek-V3')
  assert.equal(inflect('GPT-4', 'dat'), 'GPT-4')
  assert.equal(inflect('API', 'gen'), 'API')
  assert.equal(inflect('123', 'gen'), '123')
})
