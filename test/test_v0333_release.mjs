import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.33: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.33')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('8,595 UI keys'), 'package.json description must have 8,595 UI keys')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.33'), 'CHANGELOG must mention 0.3.33')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.'), 'README npm badge must be v0.3.x')
})

test('v0.3.33: SemVer 2.0.0 leading zeroes and numeric prerelease (§2, §9, §11)', () => {
  const script = `
import sys
sys.path.insert(0, '${path.join(ROOT, 'tools').replace(/\\/g, '/')}')
import check_data_integrity as cdi

assert cdi.parse_semver('0.02.0') is None, 'Leading zero in minor must be rejected'
assert cdi.parse_semver('01.0.0') is None, 'Leading zero in major must be rejected'
assert cdi.parse_semver('0.2.0-rc.01') is None, 'Leading zero in prerelease num must be rejected'

v_rc10 = cdi.parse_semver('0.2.0-rc.10')
v_rc2 = cdi.parse_semver('0.2.0-rc.2')
assert cdi.semver_cmp(v_rc10, v_rc2) == 1, 'rc.10 must be > rc.2 per SemVer §11.4'
assert cdi.satisfies_range('0.2.0-rc.10', '>=0.2.0-rc.2 <0.3.0') is True, '0.2.0-rc.10 must satisfy range'
print('OK')
`
  const res = spawnSync('python3', ['-c', script], { encoding: 'utf8' })
  assert.equal(res.status, 0, `Python SemVer test failed: ${res.stderr}`)
  assert.ok(res.stdout.includes('OK'))
})

test('v0.3.33: Issue #432 resolved inventory drift updated for key-rotation, subscriptions, billion-context', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.ok(inv.supported_plugins['@goodandready/dsh-key-rotation'] >= '0.8.46')
  assert.ok(inv.supported_plugins['@goodandready/dsh-subscriptions'] >= '0.6.49')
  assert.ok(inv.supported_plugins['billion-context'] >= '0.1.180')
})

test('v0.3.33: check_data_integrity passes all checks on clean repository', () => {
  const res = spawnSync('python3', ['tools/check_data_integrity.py'], { cwd: ROOT, encoding: 'utf8' })
  assert.equal(res.status, 0, `check_data_integrity failed: ${res.stderr}`)
  assert.ok(res.stdout.includes('Все снапшоты и корпусы данных прошли проверку целостности'))
})
