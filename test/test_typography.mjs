// Typography transform contract: quotes -> «», spaced dash/hyphen -> em dash,
// nbsp after single-letter prepositions, Chinese quotes/punctuation normalization, idempotency.
import { test } from 'node:test'
import assert from 'node:assert'

const NBSP = '\u00A0'
const TYPO_SHORT = new Set(['в', 'с', 'к', 'о', 'у', 'а', 'и', 'но', 'не', 'ни', 'на', 'по', 'до', 'из', 'за', 'от', 'об'])

const typoQuotes = (text) => text
  .replace(/"([^"\n]{1,200})"/g, '«$1»')
  .replace(/[“„]([^“”\n]{1,200})[”"]/g, '«$1»')
  .replace(/[『「]([^』」\n]{1,200})[』」]/g, '«$1»')

const typoDash = (text) => text
  .replace(/(^|[\s(\[\u00AB])--(?=\s|$)/g, '$1\u2014')
  .replace(/(^|[\s(\[\u00AB])-(?=\s)/g, '$1\u2014')

const typoPunct = (text) => text.replace(/\s+([,.:;!?])(?=\s|$)/g, '$1')

const typoNbsp = (text) => text.replace(/(^|[\s(\[\u00AB])([а-яё]{1,2})(\s+)/g, (match, lead, word) => (
  TYPO_SHORT.has(word) ? lead + word + NBSP : match
))

test('quotes: paired double quotes and Chinese quotes become guillemets', () => {
  assert.equal(typoQuotes('сказал "привет" и ушёл'), 'сказал «привет» и ушёл')
  assert.equal(typoQuotes('модель “DeepSeek” ответила'), 'модель «DeepSeek» ответила')
  assert.equal(typoQuotes('раздел 『Инструкция』 открыт'), 'раздел «Инструкция» открыт')
})

test('quotes: unterminated quote is left alone', () => {
  assert.equal(typoQuotes('он сказал "привет'), 'он сказал "привет')
})

test('punctuation: spaces before punctuation marks are cleaned up', () => {
  assert.equal(typoPunct('Привет , как дела ? Все отлично !'), 'Привет, как дела? Все отлично!')
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
  const once = typoNbsp(typoPunct(typoDash(typoQuotes('он сказал "стоп - хватит" , и вышел из дома'))))
  const twice = typoNbsp(typoPunct(typoDash(typoQuotes(once))))
  assert.equal(once, twice)
})
