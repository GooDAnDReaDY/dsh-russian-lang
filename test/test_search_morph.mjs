import { test } from 'node:test'
import assert from 'node:assert'

// Russian stemming algorithm for search & command matching
const stemRussian = (word) => {
  if (!word || typeof word !== 'string') return ''
  let w = word.toLowerCase().trim()
  if (w.length < 4) return w

  // Perfective gerund
  w = w.replace(/(?:вшись|вши|ившись|ивши|ывшись|ывши|ив|ыв)$/, '')
  // Reflexive
  w = w.replace(/(?:ся|сь)$/, '')
  // Adjectival / Participle
  w = w.replace(/(?:ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|ему|ому|их|ых|ую|юю|ая|яя|ою|ею)$/, '')
  // Verbal
  w = w.replace(/(?:ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|ыло|ено|ят|ует|уют|ит|ыт|ены|ить|ыть|ишь|ую|ю)$/, '')
  // Noun
  w = w.replace(/(?:ами|ями|иями|ией|иям|ием|ах|ях|иях|ев|ов|ие|ье|ей|ой|ий|ям|ем|ам|ом|а|е|и|о|у|ы|ь|ю|я)$/, '')

  return w.length >= 2 ? w : word.toLowerCase()
}

// QWERTY -> ЙЦУКЕН translit
const EN_STR = "qwertyuiop[]asdfghjkl;'zxcvbnm,."
const RU_STR = "йцукенгшщзхъфывапролджэячсмитьбю"
const EN_RU_MAP = new Map()
for (let i = 0; i < EN_STR.length; i++) EN_RU_MAP.set(EN_STR[i], RU_STR[i])

const translitEnToRu = (str) => str.toLowerCase().split('').map(c => EN_RU_MAP.get(c) || c).join('')

const fuzzyMatchRu = (query, target) => {
  if (!query || !target) return 0
  const q = query.toLowerCase().trim()
  const t = target.toLowerCase().trim()
  if (t === q) return 100
  if (t.includes(q)) return 90

  // Translit check (yfcnhjqrb -> настройки)
  const qTranslit = translitEnToRu(q)
  if (t.includes(qTranslit)) return 85

  // Stem-based token matching
  const qStems = q.split(/\s+/).map(stemRussian).filter(Boolean)
  const tStems = t.split(/\s+/).map(stemRussian).filter(Boolean)

  let matched = 0
  for (const qs of qStems) {
    if (tStems.some(ts => ts.startsWith(qs) || qs.startsWith(ts))) {
      matched++
    }
  }

  if (matched === qStems.length && qStems.length > 0) return 80
  if (matched > 0) return 50
  return 0
}

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
