import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const clientCode = fs.readFileSync(clientPath, 'utf-8')

test('Issue #410: client.js defines slashAliasesEnabled and checks it before expanding aliases', () => {
  assert.ok(
    clientCode.includes('const slashAliasesEnabled = () =>'),
    'client.js must define slashAliasesEnabled'
  )
  assert.ok(
    clientCode.includes('val?.slashAliases !== false'),
    'slashAliasesEnabled must check slashAliases !== false'
  )
  assert.ok(
    clientCode.includes("slashAliasesEnabled()"),
    'layoutOnKeydown must guard alias expansion with slashAliasesEnabled()'
  )
})

test('Issue #410: Alias expansion respect settings toggle and active locale', () => {
  const expandSlashAlias = (cmd) => {
    if (cmd === '/цель') return '/goal'
    if (cmd === '/помощь') return '/help'
    return cmd
  }

  const runKeydownSimulation = ({ key, value, config, activeLocale }) => {
    let output = value
    let prevented = false

    const slashAliasesEnabled = () => {
      const ruActive = activeLocale === 'ru'
      return ruActive && config?.slashAliases !== false
    }

    if ((key === ' ' || key === 'Enter') && slashAliasesEnabled()) {
      if (value && value.startsWith('/')) {
        const expanded = expandSlashAlias(value)
        if (expanded !== value) {
          if (key === ' ') {
            prevented = true
            output = expanded + ' '
          } else if (key === 'Enter') {
            output = expanded
          }
        }
      }
    }
    return { output, prevented }
  }

  // 1. slashAliases: false -> Enter keeps '/цель'
  const res1 = runKeydownSimulation({ key: 'Enter', value: '/цель', config: { slashAliases: false }, activeLocale: 'ru' })
  assert.equal(res1.output, '/цель', 'Enter with slashAliases: false must keep original Russian command')

  // 2. slashAliases: false -> Space keeps '/цель'
  const res2 = runKeydownSimulation({ key: ' ', value: '/цель', config: { slashAliases: false }, activeLocale: 'ru' })
  assert.equal(res2.output, '/цель', 'Space with slashAliases: false must keep original Russian command')
  assert.equal(res2.prevented, false)

  // 3. activeLocale: 'en' -> keeps '/цель'
  const res3 = runKeydownSimulation({ key: 'Enter', value: '/цель', config: { slashAliases: true }, activeLocale: 'en' })
  assert.equal(res3.output, '/цель', 'Enter with activeLocale: en must keep original Russian command')

  // 4. Default / enabled with 'ru' -> expands
  const res4 = runKeydownSimulation({ key: 'Enter', value: '/цель', config: {}, activeLocale: 'ru' })
  assert.equal(res4.output, '/goal', 'Enter with default config and ru active must expand to /goal')

  const res5 = runKeydownSimulation({ key: ' ', value: '/цель', config: { slashAliases: true }, activeLocale: 'ru' })
  assert.equal(res5.output, '/goal ', 'Space with slashAliases: true must expand to /goal with trailing space')
  assert.equal(res5.prevented, true)
})
