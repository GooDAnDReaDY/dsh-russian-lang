import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.36: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.36')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.36'), 'CHANGELOG must mention 0.3.36')
  assert.ok(cl.includes('#458'), 'CHANGELOG must mention #458')
  assert.ok(cl.includes('#459'), 'CHANGELOG must mention #459')
  assert.ok(cl.includes('#461'), 'CHANGELOG must mention #461')
  assert.ok(cl.includes('#462'), 'CHANGELOG must mention #462')
  assert.ok(cl.includes('#453'), 'CHANGELOG must mention #453')
  assert.ok(cl.includes('#463'), 'CHANGELOG must mention #463')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.') || readme.includes('npm-v0.4.'), 'README npm badge')
})

test('v0.3.36: check_data_integrity passes on clean repository', () => {
  const res = spawnSync('python3', ['tools/check_data_integrity.py'], { cwd: ROOT, encoding: 'utf8' })
  assert.equal(res.status, 0, `check_data_integrity failed: ${res.stderr}`)
  assert.ok(res.stdout.includes('Все снапшоты и корпусы данных прошли проверку целостности'))
})
