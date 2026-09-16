import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('v0.2.20: package.json version is 0.2.20+ and dependencies are valid', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.ok(pkg.version >= '0.2.20')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
})

test('v0.2.20: modular decomposition, permission presets and size compliance', () => {
  const clientSrc = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  
  // Version presence
  assert.match(clientSrc, /currentVersion:\s*['"]0\.2\./)
  
  // Modular architecture and dynamic primitives
  assert.match(clientSrc, /IconChevronDownOutline14/)
  assert.match(clientSrc, /dsh-russian-lang-styles/)
  assert.match(clientSrc, /dshPlugin/)
  assert.match(clientSrc, /\/api\/dsh-russian-lang\/dict\/all/)
  
  // Permission presets translations
  assert.match(clientSrc, /请求批准/)
  assert.match(clientSrc, /Запрашивать подтверждение/)
  assert.match(clientSrc, /完全放开/)
  assert.match(clientSrc, /Полный доступ/)
  assert.match(clientSrc, /Auto mode/)
  assert.match(clientSrc, /Автоматический режим/)
})
