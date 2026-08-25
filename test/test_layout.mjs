// Layout-fix candidate logic as mirrored in the client bundle: translit a
// latin string to cyrillic via the QWERTY<->ЙЦУКЕН map and require that a
// large fraction of the converted words are in the bundled Russian frequency
// list before the hint fires. Pins the mapping + dictionary coverage so a
// change in the wordlist or the map is caught here.
import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const FREQ = new Set(JSON.parse(readFileSync(join(HERE, '..', 'tools', 'ru-freq.json'), 'utf-8')))

const LAT_TO_CYR = {
  q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш', o: 'щ', p: 'з', '[': 'х', ']': 'ъ',
  a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о', k: 'л', l: 'д', ';': 'ж', "'": 'э',
  z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и', n: 'т', m: 'ь', ',': 'б', '.': 'ю', '/': '.',
  '`': 'ё'
}

function translit(word, map) {
  let out = ''
  for (const ch of word.toLowerCase()) out += map[ch] !== undefined ? map[ch] : ch
  return out
}

function ruFraction(text) {
  const words = text.toLowerCase().split(/[^а-яё]+/).filter(Boolean)
  if (!words.length) return 0
  const hit = words.filter((w) => FREQ.has(w)).length
  return hit / words.length
}

function candidate(value) {
  const converted = translit(value, LAT_TO_CYR)
  if (!/[а-яё]{2}/.test(converted)) return null
  if (ruFraction(converted) < 0.7) return null
  return converted
}

test('translit: ghbdtn rfr ltkf -> привет как дела', () => {
  assert.equal(translit('ghbdtn', LAT_TO_CYR), 'привет')
  assert.equal(translit('rfr', LAT_TO_CYR), 'как')
  assert.equal(translit('ltkf', LAT_TO_CYR), 'дела')
})

test('candidate: gibberish latin that maps to Russian words fires', () => {
  const c = candidate('ghbdtn rfr ltkf')
  assert.ok(c !== null)
  assert.equal(c, 'привет как дела')
})

test('candidate: real English words are rejected', () => {
  // "hello world" maps to nonsense cyrillic that is not in the freq list
  assert.equal(candidate('hello world'), null)
})

test('freq dictionary has enough Russian coverage to be useful', () => {
  assert.ok(FREQ.size > 3000)
  assert.ok(FREQ.has('привет'))
  assert.ok(FREQ.has('как'))
  assert.ok(FREQ.has('дела'))
})
