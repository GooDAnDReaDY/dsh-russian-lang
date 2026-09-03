// Детектор неверной раскладки: транслитерация по клавишам и решение
// «похоже ли это на русский». Импорт из lib/pure.js — проверяется код,
// который уезжает в бандл, а не копия карт и порогов в тесте (#133).
import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { translit, makeLayout, LAYOUT_LAT_TO_CYR, LAYOUT_CYR_TO_LAT } from '../lib/pure.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const FREQ = new Set(JSON.parse(readFileSync(join(HERE, '..', 'tools', 'ru-freq.json'), 'utf-8')))
const layout = makeLayout(FREQ)
const candidate = (v) => {
  const c = layout.candidate(v, 'lat2cyr')
  return c ? c.converted : null
}

test('translit: ghbdtn rfr ltkf -> привет как дела', () => {
  assert.equal(translit('ghbdtn', LAYOUT_LAT_TO_CYR), 'привет')
  assert.equal(translit('rfr', LAYOUT_LAT_TO_CYR), 'как')
  assert.equal(translit('ltkf', LAYOUT_LAT_TO_CYR), 'дела')
})

test('translit: обратная карта возвращает исходную латиницу', () => {
  assert.equal(translit(translit('ghbdtn', LAYOUT_LAT_TO_CYR), LAYOUT_CYR_TO_LAT), 'ghbdtn')
})

test('candidate: латинская абракадабра, дающая русские слова, срабатывает', () => {
  assert.equal(candidate('ghbdtn rfr ltkf'), 'привет как дела')
})

test('candidate: настоящие английские слова отвергаются', () => {
  // "hello world" переводится в бессмыслицу, которой нет в частотном словаре
  assert.equal(candidate('hello world'), null)
})

test('candidate: слова, выученные за сессию, поднимают долю распознанного', () => {
  const learned = makeLayout(new Set())
  assert.equal(learned.candidate('ghbdtn', 'lat2cyr'), null)
  learned.learnWords('привет')
  assert.deepEqual(learned.candidate('ghbdtn', 'lat2cyr'), { converted: 'привет' })
})

test('candidate: cyr2lat срабатывает только на команде со слешем', () => {
  // «/help», набранное в русской раскладке, выглядит как «.рудз»
  assert.deepEqual(layout.candidate('.рудз', 'cyr2lat'), { converted: '/help' })
  assert.equal(layout.candidate('привет', 'cyr2lat'), null)
})

test('частотный словарь достаточно покрывает русский', () => {
  assert.ok(FREQ.size > 3000)
  for (const w of ['привет', 'как', 'дела']) assert.ok(FREQ.has(w), w)
})
