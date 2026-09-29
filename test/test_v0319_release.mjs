import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { typoDash, typoNbsp } from '../lib/pure.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

test('v0.3.19: package.json and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.3.19')
  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  const head = changelog.split('\n').find((line) => line.startsWith('## ')) || ''
  assert.ok(head.includes('0.3.19'), `CHANGELOG head must mention 0.3.19, got: ${head}`)
})

test('v0.3.19: settings card has English fallback and overrides buttons localized', () => {
  const clientJs = fs.readFileSync(path.join(ROOT, 'lib/client.js'), 'utf8')
  assert.ok(clientJs.includes("ctx.locale.register(SETTINGS_NS_NAME, 'en', CARD_EN)"), 'Must register CARD_EN')
  assert.ok(clientJs.includes("t('exportJsonBtn')"), 'Must use exportJsonBtn')
  assert.ok(clientJs.includes("t('importJsonBtn')"), 'Must use importJsonBtn')
  assert.ok(clientJs.includes("t('inspectorToggleOn')"), 'Must use inspectorToggleOn')
})

test('v0.3.19: smart typography preserves markdown bullets and binds units', () => {
  // Markdown bullet list preservation
  assert.equal(typoDash('- bullet point'), '- bullet point')
  assert.equal(typoDash('line\n- second point'), 'line\n- second point')
  // Spaced hyphen in running text becomes em dash
  assert.equal(typoDash('слово - дело'), 'слово — дело')

  // Unit and symbol non-breaking space
  const NBSP = '\u00A0'
  assert.equal(typoNbsp('10 кг'), '10' + NBSP + 'кг')
  assert.equal(typoNbsp('100 ₽'), '100' + NBSP + '₽')
  assert.equal(typoNbsp('16 ГБ'), '16' + NBSP + 'ГБ')
})
