import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.26: package.json and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.26')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.26'), 'CHANGELOG must mention 0.3.26')
})

test('v0.3.26: glossary.json contains Command Code rule', () => {
  const glossary = JSON.parse(fs.readFileSync(path.join(ROOT, 'glossary.json'), 'utf8'))
  assert.ok(glossary.terms.command_code, 'glossary must contain command_code term')
  assert.equal(glossary.terms.command_code.canonical, 'Command Code')
  assert.deepEqual(glossary.terms.command_code.allowed, ['Command Code'])
  assert.ok(glossary.terms.command_code.forbidden.includes('Код команды'))
  assert.ok(glossary.terms.command_code.forbidden.includes('Командный код'))
})

test('v0.3.26: settings.commandcode uses Command Code brand without literal translation (GitHub #9)', () => {
  const sourcePath = path.join(ROOT, 'ru-plugins/15-commandcode.json')
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
  const scc = source['settings.commandcode']

  assert.equal(scc.nav, 'Command Code')
  assert.equal(scc.title, 'Command Code')
  assert.equal(scc.cardTitle, 'Command Code')
  assert.equal(scc.cardLoadingHint, 'Загрузка конфигурации Command Code…')

  const jsonStr = JSON.stringify(scc)
  assert.ok(!jsonStr.includes('Код команды'), 'settings.commandcode must not contain "Код команды"')
  assert.ok(!jsonStr.includes('командного кода'), 'settings.commandcode must not contain "командного кода"')
})
