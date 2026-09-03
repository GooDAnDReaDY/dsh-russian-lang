// Контракт типографики: «ёлочки», длинное тире, неразрывные пробелы после
// коротких предлогов, чистка пробелов перед знаками, идемпотентность.
//
// Функции импортируются из lib/pure.js — того самого файла, который build.py
// вставляет в бандл. Раньше тест держал собственные копии регулярок и потому
// не мог заметить расхождение с отгружаемым кодом (#133).
import { test } from 'node:test'
import assert from 'node:assert'
import { typoQuotes, typoDash, typoPunct, typoNbsp, TYPO_SHORT } from '../lib/pure.js'

const NBSP = ' '

test('кавычки: парные прямые и китайские превращаются в ёлочки', () => {
  assert.equal(typoQuotes('сказал "привет" и ушёл'), 'сказал «привет» и ушёл')
  assert.equal(typoQuotes('модель “DeepSeek” ответила'), 'модель «DeepSeek» ответила')
  assert.equal(typoQuotes('раздел 『Инструкция』 открыт'), 'раздел «Инструкция» открыт')
})

test('кавычки: незакрытая кавычка не трогается', () => {
  assert.equal(typoQuotes('он сказал "привет'), 'он сказал "привет')
})

test('пунктуация: пробелы перед знаками убираются', () => {
  assert.equal(typoPunct('Привет , как дела ? Всё отлично !'), 'Привет, как дела? Всё отлично!')
})

test('тире: дефис в окружении пробелов и -- становятся длинным тире', () => {
  assert.equal(typoDash('два - три'), 'два — три')
  assert.equal(typoDash('ну -- смотри'), 'ну — смотри')
})

test('тире: дефисные слова, диапазоны и минус не трогаются', () => {
  assert.equal(typoDash('чёрным-белым'), 'чёрным-белым')
  assert.equal(typoDash('2019-2020'), '2019-2020')
  assert.equal(typoDash('-5 градусов'), '-5 градусов')
})

test('nbsp: ставится только после коротких предлогов из списка', () => {
  assert.equal(typoNbsp('гулял в парк'), 'гулял в' + NBSP + 'парк')
  assert.equal(typoNbsp('дом у моря'), 'дом у' + NBSP + 'моря')
  assert.equal(typoNbsp('очень хорошо'), 'очень хорошо')
})

test('nbsp: список коротких слов не пуст и состоит из кириллицы', () => {
  assert.ok(TYPO_SHORT.size >= 10)
  for (const w of TYPO_SHORT) assert.match(w, /^[а-яё]{1,2}$/)
})

test('типографика идемпотентна: повторный проход ничего не меняет', () => {
  const pass = (s) => typoNbsp(typoPunct(typoDash(typoQuotes(s))))
  const once = pass('он сказал "стоп - хватит" , и вышел из дома')
  assert.equal(pass(once), once)
})
