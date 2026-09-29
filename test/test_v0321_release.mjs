import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

test('v0.3.21: package.json and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.3.21')
  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  const head = changelog.split('\n').find((line) => line.startsWith('## ')) || ''
  assert.ok(head.includes('0.3.21'), `CHANGELOG head must mention 0.3.21, got: ${head}`)
})

test('v0.3.21: hero.headline translation updated to Навстречу неизведанному (#7)', () => {
  const conv = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru/02-conversation.json'), 'utf8'))
  assert.equal(conv.conversation['hero.headline'], 'Навстречу неизведанному')

  const core = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/core.json'), 'utf8'))
  assert.equal(core.conversation['hero.headline'], 'Навстречу неизведанному')
})
