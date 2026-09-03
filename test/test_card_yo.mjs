// Карточка настроек + восстановление «ё».
//
// Ё-часть проверяется на ПАРАХ ИЗ СОБРАННОГО БАНДЛА и на функции из
// lib/pure.js — то есть на том, что реально уезжает пользователю. Прежняя
// версия теста утверждала «пара „все“ исключена» так:
//
//     assert.ok(!pairs.some(([e, y]) => e === 'все' && y === 'все'))
//
// правая половина пары всегда содержит «ё», поэтому условие истинно
// тождественно: проверка не проверяла ничего, а пара ["все","всё"] при этом
// лежала в бандле (#132, #133).
import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { makeTypoYo } from '../lib/pure.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const BUNDLE = readFileSync(join(HERE, '..', 'lib', 'client.js'), 'utf8')

const pairsMatch = BUNDLE.match(/const TYPO_YO_PAIRS = (\[[\s\S]*?\])\n/)
assert.ok(pairsMatch, 'в бандле нет TYPO_YO_PAIRS — сборка сломана')
const PAIRS = JSON.parse(pairsMatch[1])
const yo = makeTypoYo(PAIRS)

// Омографы: написание через «е» — самостоятельное слово с другим смыслом.
// Замена здесь меняет смысл предложения, поэтому таких пар в бандле быть не
// должно ни одной.
// Фразы подобраны так, чтобы в них не было других заменяемых слов: иначе
// падение теста означало бы законную правку соседа, а не порчу омографа.
const HOMOGRAPHS = [
  ['все пользователи онлайн', 'все'],
  ['всем спасибо за работу', 'всем'],
  ['о чем разговор', 'чем'],
  ['сплошная черта на карте', 'черта'],
  ['он снял берет', 'берет'],
  ['мы моем посуду', 'моем'],
  ['он нем от рождения', 'нем']
]

test('карточка настроек: слот plugin.item зарегистрирован с namespace настроек', () => {
  assert.match(BUNDLE, /name:\s*'settings\.plugin\.item'/)
  assert.match(BUNDLE, /key: SETTINGS_NS_NAME/)
})

test('карточка настроек: свёрнута по умолчанию, форма под статусом снимка', () => {
  assert.match(BUNDLE, /aria-expanded/)
  assert.match(BUNDLE, /status !== 'ready'/)
})

test('стили: только префикс rl- и переменные темы, без хардкода цветов', () => {
  const css = BUNDLE.match(/const RL_CSS = \[[\s\S]*?\]\.join/)
  assert.ok(css, 'блок RL_CSS на месте')
  assert.doesNotMatch(css[0], /#[0-9a-fA-F]{3,6}\b/)
})

test('ё: в бандле нет ни одной омографичной пары', () => {
  const shipped = new Set(PAIRS.map((p) => p[0]))
  const leaked = HOMOGRAPHS.map(([, word]) => word).filter((w) => shipped.has(w))
  assert.deepEqual(leaked, [], 'омографы в бандле: ' + leaked.join(', '))
})

test('ё: омографы не меняются ни отдельным словом, ни во фразе', () => {
  for (const [phrase, word] of HOMOGRAPHS) {
    assert.equal(yo(word), word, 'испорчено слово: ' + word)
    assert.equal(yo(phrase), phrase, 'испорчена фраза: ' + phrase)
  }
})

test('ё: безопасные пары действительно срабатывают', () => {
  assert.equal(yo('еще раз'), 'ещё раз')
  assert.equal(yo('файл сохранен'), 'файл сохранён')
  assert.equal(yo('плагин включен'), 'плагин включён')
  assert.equal(yo('учетные записи'), 'учётные записи')
})

test('ё: граница слова работает на кириллице, а не только на латинице', () => {
  // \b определён через \w = [A-Za-z0-9_] и границы перед кириллицей не даёт —
  // на нём вся замена была мёртвой (#132). Здесь проверяется, что якорь живой:
  // отдельное слово меняется, а то же сочетание внутри слова — нет.
  assert.equal(yo('идет дождь'), 'идёт дождь')
  assert.equal(yo('идетик'), 'идетик')
  assert.equal(yo('поидет'), 'поидет')
})

test('ё: регистр совпадения сохраняется', () => {
  assert.equal(yo('Еще раз'), 'Ещё раз')
  assert.equal(yo('ЕЩЕ РАЗ'), 'ЕЩЁ РАЗ')
  assert.equal(yo('еще'), 'ещё')
})

test('ё: замена идемпотентна', () => {
  const once = yo('еще один файл сохранен и включен')
  assert.equal(yo(once), once)
})

test('ё: список пар не выродился', () => {
  assert.ok(PAIRS.length > 50, 'пар в бандле: ' + PAIRS.length)
  for (const [e, y] of PAIRS) {
    assert.notEqual(e, y)
    assert.ok(y.includes('ё'), 'правая половина без ё: ' + y)
    assert.equal(e, y.replace(/ё/g, 'е'), 'пара не является ё-вариантом: ' + e + '/' + y)
  }
})
