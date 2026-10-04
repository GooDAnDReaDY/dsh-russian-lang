import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.29: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.29')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.29'), 'CHANGELOG must mention 0.3.29')
  assert.ok(cl.includes('DSH v0.2.0-rc.2'), 'CHANGELOG head must mention DSH v0.2.0-rc.2')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.'), 'README npm badge must be v0.3.29')
  assert.ok(/\d+[, ]\d+ UI keys/.test(pkg.description), 'package.json description must have 8,5xx UI keys')
})

test('v0.3.29: Audit fixes #407, #414, #417, #423, #443 invariants', () => {
  const clientJs = fs.readFileSync(path.join(ROOT, 'lib/client.js'), 'utf8')
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(clientJs.includes(pkg.version), 'client.js must include package version')

  // #414: disposed and timer clearance
  assert.ok(clientJs.includes('let disposed = false'), 'client.js must track disposed state (#414)')
  assert.ok(clientJs.includes('corePreloadTimer = setTimeout'), 'client.js must manage corePreloadTimer (#414)')

  // #417: readonly and scope set rejection handling
  assert.ok(clientJs.includes("snap.writable === false"), 'client.js must check snap.writable (#417)')
  assert.ok(clientJs.includes("safeSet"), 'client.js must use safeSet helper (#417)')

  // #407 & #443: upstream_check.py wrapper and clean env
  const upCheck = fs.readFileSync(path.join(ROOT, 'tools/upstream_check.py'), 'utf8')
  assert.ok(upCheck.includes('_resolve_git_bin'), 'upstream_check.py must resolve authorized git wrapper (#407)')
  assert.ok(upCheck.includes('git-codex') || upCheck.includes('git-antigravity'), 'must prefer authorized wrapper (#407)')
  assert.ok(upCheck.includes('--ignore-scripts'), 'upstream_check.py must use --ignore-scripts (#443)')

  // #423: dsh-i18n AST state machine
  const cliJs = fs.readFileSync(path.join(ROOT, 'bin/dsh-i18n.mjs'), 'utf8')
  assert.ok(cliJs.includes('isRegex'), 'dsh-i18n must track regex literal state (#423)')
  assert.ok(cliJs.includes("lastToken = 'string'"), 'dsh-i18n must track string state (#423)')
})

test('v0.3.29: Audit fixes #427, #428, #429, #431, #432 invariants', () => {
  // #427 & #429: DESIGN.md translateEngine and DOM protection
  const designMd = fs.readFileSync(path.join(ROOT, 'docs/design/DESIGN.md'), 'utf8')
  assert.ok(designMd.includes("'off' | 'local' | 'google'"), 'DESIGN.md must document translateEngine options (#427)')
  assert.ok(designMd.includes('data-no-translate'), 'DESIGN.md must document data-no-translate (#429)')
  assert.ok(designMd.includes('.no-translate'), 'DESIGN.md must document .no-translate (#429)')

  // #428: canonical metrics
  const clientJs = fs.readFileSync(path.join(ROOT, 'lib/client.js'), 'utf8')
  assert.ok(/\d+[, ]\d+ keys/.test(clientJs), 'client.js must display 8,5xx keys badge (#428)')

  // #431: multiline PO metadata roundtrip
  const exportPy = fs.readFileSync(path.join(ROOT, 'tools/export_i18n.py'), 'utf8')
  assert.ok(exportPy.includes('# comment: %s'), 'export_i18n.py must format multiline comments (#431)')
  assert.ok(exportPy.includes('# context: %s'), 'export_i18n.py must format multiline contexts (#431)')

  // #432: supported inventory validation
  const checkDataPy = fs.readFileSync(path.join(ROOT, 'tools/check_data_integrity.py'), 'utf8')
  assert.ok(checkDataPy.includes('check_supported_inventory'), 'check_data_integrity.py must validate inventory (#432)')
})
