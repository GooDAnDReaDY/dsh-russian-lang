import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.34: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.34')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.34'), 'CHANGELOG must mention 0.3.34')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.') || readme.includes('npm-v0.4.'), 'README npm badge')
})

test('v0.3.34: Issue #432 GitHub commit-ish ref validation and node_modules presence', () => {
  const script = `
import sys, json, os, tempfile
sys.path.insert(0, '${path.join(ROOT, 'tools').replace(/\\/g, '/')}')
import check_data_integrity as cdi

inv_file = '${path.join(ROOT, 'supported-inventory.json').replace(/\\/g, '/')}'
with open(inv_file, 'r', encoding='utf-8') as f:
    inv = json.load(f)

# 1. Ref substitution must be rejected
with tempfile.TemporaryDirectory() as tmpweb:
    pkg_json = os.path.join(tmpweb, 'package.json')
    with open(pkg_json, 'w') as f:
        json.dump({"dependencies": {"dsh-effort-slider": "github:2768651338/dsh-effort-slider#AUDIT_UNSUPPORTED_REF"}}, f)
    nm_dir = os.path.join(tmpweb, 'node_modules', 'dsh-effort-slider')
    os.makedirs(nm_dir, exist_ok=True)
    with open(os.path.join(nm_dir, 'package.json'), 'w') as f:
        json.dump({"name": "dsh-effort-slider", "version": "0.4.0"}, f)
    assert cdi.check_supported_inventory(inv, web_pkg_path=pkg_json) is False, 'Must reject altered ref'

# 2. Missing node_modules must be rejected
with tempfile.TemporaryDirectory() as tmpweb2:
    pkg_json2 = os.path.join(tmpweb2, 'package.json')
    with open(pkg_json2, 'w') as f:
        json.dump({"dependencies": {"dsh-effort-slider": "github:2768651338/dsh-effort-slider#main"}}, f)
    assert cdi.check_supported_inventory(inv, web_pkg_path=pkg_json2) is False, 'Must reject missing node_modules'

print('OK')
`
  const res = spawnSync('python3', ['-c', script], { encoding: 'utf8' })
  assert.equal(res.status, 0, `Python test failed: ${res.stderr}`)
  assert.ok(res.stdout.includes('OK'))
})

test('v0.3.34: Issue #441 Russian translations for dsh-clinebot present in lib/locales', () => {
  const dict = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/40-clinebot.json'), 'utf8'))
  const cline = dict['dsh-clinebot']
  assert.ok(cline, 'dsh-clinebot dictionary must exist')

  const expected = [
    'quota.window_monthly',
    'quota.countdown',
    'quota.resetting',
    'quota.warning_low',
    'quota.exhausted_5h',
    'quota.warning_5h',
    'quota.warning_weekly',
    'quota.warning_monthly',
    'models.reasoning_tag',
    'models.effort_low',
    'models.effort_medium',
    'models.effort_high',
    'models.effort_max',
    'models.caps_vision',
    'models.caps_general',
    'models.caps_coding',
    'diag.smoke_result',
    'diag.empty',
    'ui.error_title',
    'ui.retry',
    'update.check_failed',
    'update.retry'
  ]

  for (const k of expected) {
    assert.ok(cline[k], `Missing key: ${k}`)
  }
})

test('v0.3.34: check_data_integrity passes all checks on clean repository', () => {
  const res = spawnSync('python3', ['tools/check_data_integrity.py'], { cwd: ROOT, encoding: 'utf8' })
  assert.equal(res.status, 0, `check_data_integrity failed: ${res.stderr}`)
  assert.ok(res.stdout.includes('Все снапшоты и корпусы данных прошли проверку целостности'))
})
