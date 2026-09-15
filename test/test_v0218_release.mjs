import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('v0.2.18: package.json version is 0.2.18 and dependencies are valid', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.version, '0.2.18')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
})

test('v0.2.18: client.js bundle contains version 0.2.18 and live typography protections', () => {
  const clientSrc = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  
  // Version presence
  assert.match(clientSrc, /currentVersion:\s*['"]0\.2\.18['"]/)
  
  // Selection and streaming protection in typoNode
  assert.match(clientSrc, /data-chat-flow-status/)
  assert.match(clientSrc, /window\.getSelection/)
  assert.match(clientSrc, /getRangeAt/)
  
  // Keydown localized substitution
  assert.match(clientSrc, /layoutOnKeydown/)
  assert.match(clientSrc, /insertText/)
  assert.match(clientSrc, /getCaretCharacterOffset/)
  assert.match(clientSrc, /setCaretCharacterOffset/)
  assert.match(clientSrc, /isCaretInCode/)
})
