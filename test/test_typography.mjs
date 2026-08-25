// Typography transform contract: quotes -> «», spaced dash/hyphen -> em dash,
// nbsp after single-letter prepositions, idempotency. The rules live inside
// the generated client bundle; this file mirrors them to pin the intended
// behaviour (a change here means the bundle rules changed on purpose).
import { test } from 'node:test'
import assert from 'node:assert'

const NBSP = '\u00A0'
const TYPO_SHORT = new Set(['в', 'с', 'к', 'о', 'у', 'а', 'и', 'но', 'не', 'ни', 'на', 'по', 'до', 'из', 'за', 'от', 'об'])

const typoQuotes = (text) => text.replace(/"([^"\n]{1,200})"/g, '«$1»')
const typoDash = (text) => text
  .replace(/(^|[\s(\[\u00AB])--(?=\s|$)/g, '$1\u2014')
  .replace(/(^|[\s(\[\u00AB])-(?=\s)/g, '$1\u2014')
const typoNbsp = (text) => text.replace(/(^|[\s(\[\u00AB])([а-яё]{1,2})(\s+)/g, (match, lead, word) => (
  TYPO_SHORT.has(word) ? lead + word + NBSP : match
))

test('quotes: paired double quotes become guillemets', () => {
  assert.equal(typoQuotes('сказал "привет" и ушёл'), 'сказал «привет» и ушёл')
})

test('quotes: unterminated quote is left alone', () => {
  assert.equal(typoQuotes('он сказал "привет'), 'он сказал "привет')
})

test('dash: spaced hyphen and -- become em dash', () => {
  assert.equal(typoDash('два - три'), 'два \u2014 три')
  assert.equal(typoDash('ну -- смотри'), 'ну \u2014 смотри')
})

test('dash: hyphenated words and ranges untouched', () => {
  assert.equal(typoDash('чёрным-белым'), 'чёрным-белым')
  assert.equal(typoDash('2019-2020'), '2019-2020')
  assert.equal(typoDash('-5 градусов'), '-5 градусов')
})

test('nbsp: inserted after single-letter prepositions only', () => {
  assert.equal(typoNbsp('гулял в парк'), 'гулял в' + NBSP + 'парк')
  assert.equal(typoNbsp('дом у моря'), 'дом у' + NBSP + 'моря')
  assert.equal(typoNbsp('очень хорошо'), 'очень хорошо')
})

test('typography: transforms are idempotent', () => {
  const once = typoNbsp(typoDash(typoQuotes('он сказал "стоп - хватит" и вышел из дома')))
  const twice = typoNbsp(typoDash(typoQuotes(once)))
  assert.equal(once, twice)
})
