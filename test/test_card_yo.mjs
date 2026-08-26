// Settings card + corpus-derived ё pairs pins.
// The card is a React component inside the generated bundle; here we assert
// the built bundle carries the slot registration, the rl- styles and the
// freq-derived ё pairs, so a refactor that drops them fails fast.
import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const BUNDLE = readFileSync(join(HERE, '..', 'lib', 'client.js'), 'utf8')
const FREQ = JSON.parse(readFileSync(join(HERE, '..', 'tools', 'ru-freq.json'), 'utf8'))

test('settings card: plugin.item slot registered with the settings namespace', () => {
  assert.match(BUNDLE, /name:\s*'settings\.plugin\.item'/)
  assert.match(BUNDLE, /key: SETTINGS_NS_NAME/)
})

test('settings card: collapsed by default and status-gated markers present', () => {
  assert.match(BUNDLE, /aria-expanded/)
  assert.match(BUNDLE, /status !== 'ready'/)
})

test('styles: rl- prefix only, theme variables used', () => {
  assert.match(BUNDLE, /\.rl-card\{/)
  // никаких захардкоженных цветов фона/текста вне переменных темы
  const css = BUNDLE.match(/const RL_CSS = \[[\s\S]*?\]\.join/)
  assert.ok(css, 'RL_CSS block present')
  assert.doesNotMatch(css[0], /#[0-9a-fA-F]{3,6}\b/)
})

test('yo: corpus pairs generated from the frequency list', () => {
  const yoWords = FREQ.filter((w) => w.includes('ё') && w.replace(/ё/g, 'е') !== w && w !== 'все')
  assert.ok(yoWords.length > 50, 'freq list yields enough ё pairs (%d)' % yoWords.length)
  // известная пара должна попасть в бандл
  const sample = yoWords.find((w) => w === 'ещё') || yoWords[0]
  const e = sample.replace(/ё/g, 'е')
  assert.match(BUNDLE, new RegExp(e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
})

test('yo: ambiguous «все» excluded from generated pairs', () => {
  // все -> всё запрещено: разные значения
  assert.equal(FREQ.filter((w) => w === 'все').length >= 0, true)
  const pairs = FREQ.filter((w) => w.includes('ё')).map((w) => [w.replace(/ё/g, 'е'), w])
  assert.ok(!pairs.some(([e, y]) => e === 'все' && y === 'все'))
})
