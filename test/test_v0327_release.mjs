import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.27: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.27')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.27'), 'CHANGELOG must mention 0.3.27')
  assert.ok(cl.includes('DSH v0.2.0-rc.2'), 'CHANGELOG must mention DSH v0.2.0-rc.2')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(/npm-v0\.3\.\d+/.test(readme), 'README npm badge must be valid')
  assert.ok(/8[, ]5\d\d UI keys/.test(pkg.description), 'package.json description must have 8,5xx UI keys')
})

test('v0.3.27: Block 1 audit invariants (#405-#408)', () => {
  const clientJs = fs.readFileSync(path.join(ROOT, 'lib/client.js'), 'utf8')
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(clientJs.includes(pkg.version), 'client.js must include package version')

  // DOM override protection for code & composer (#405)
  assert.ok(clientJs.includes('isProtectedTextNode'), 'client.js must define isProtectedTextNode')

  // Import i18n --dry-run support (#406)
  const importI18nPy = fs.readFileSync(path.join(ROOT, 'tools/import_i18n.py'), 'utf8')
  assert.ok(importI18nPy.includes('--dry-run'), 'import_i18n.py must support --dry-run')
})

test('v0.3.27: Block 2 audit invariants (#409-#417)', () => {
  const clientJs = fs.readFileSync(path.join(ROOT, 'lib/client.js'), 'utf8')

  // Fallback to /dict/all (#412)
  assert.ok(clientJs.includes('/dict/all'), 'client.js must contain fallback to /dict/all')

  // Slash aliases toggle (#410)
  assert.ok(clientJs.includes('slashAliases'), 'client.js must handle slashAliases setting')

  // Typography settings reactive updates (#415)
  assert.ok(clientJs.includes('cancelAnimationFrame'), 'client.js must cancel pending typo raf')

  // Settings writable guard (#417)
  assert.ok(clientJs.includes('writable === false'), 'client.js must check writable === false before saving')
})

test('v0.3.27: Block 3 audit invariants (#418-#426, #431, #432)', () => {
  // Glossary packaged in files and exists (#422)
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.files.includes('glossary.json'), 'package.json files must include glossary.json')
  assert.ok(fs.existsSync(path.join(ROOT, 'glossary.json')), 'glossary.json must exist in root')

  // CLI supports Cyrillic word boundaries (#422)
  const cliJs = fs.readFileSync(path.join(ROOT, 'bin/dsh-i18n.mjs'), 'utf8')
  assert.ok(cliJs.includes('\\p{L}'), 'bin/dsh-i18n.mjs must support Unicode Cyrillic word boundaries')

  // Systemd template uses __REPO__ (#426)
  const systemdService = fs.readFileSync(path.join(ROOT, 'tools/systemd/dsh-upstream-check.service.template'), 'utf8')
  assert.ok(systemdService.includes('__REPO__'), 'systemd template must use __REPO__ placeholder')

  // Import i18n validates placeholders via ph_ok (#418)
  const importI18nPy = fs.readFileSync(path.join(ROOT, 'tools/import_i18n.py'), 'utf8')
  assert.ok(importI18nPy.includes('ph_ok'), 'import_i18n.py must validate placeholders via ph_ok')
})

test('v0.3.27: Block 4 audit invariants (#427-#430)', () => {
  // Packaging files exclude client.template.js (#430)
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.files.includes('!lib/client.template.js'), 'package files must exclude client.template.js')

  // Design contract exists (#429)
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/design/DESIGN.md')), 'docs/design/DESIGN.md must exist')

  // README coverage metrics (#428)
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('58 пространств имён, 2 442 ключа'), 'README must mention 58 core namespaces and 2 442 keys')
  assert.ok(/6[ ,]1\d\d ключ/.test(readme), 'README must mention 6 1xx plugin keys')
  assert.ok(/8[ ,]5\d\d ключ/.test(readme), 'README must mention 8 5xx total keys')
  assert.ok(readme.includes('100%'), 'README must mention 100% coverage')
})
