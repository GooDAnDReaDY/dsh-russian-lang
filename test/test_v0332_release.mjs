import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.32: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.3.32')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('8,595 UI keys'), 'package.json description must have 8,595 UI keys')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.32'), 'CHANGELOG must mention 0.3.32')
  assert.ok(cl.includes('DSH v0.2.0-rc.2'), 'CHANGELOG head must mention DSH v0.2.0-rc.2')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.32'), 'README npm badge must be v0.3.32')
  assert.ok(readme.includes('8 595'), 'README must mention 8 595 total keys')
  assert.ok(readme.includes('6 153'), 'README must mention 6 153 plugin keys')
})

test('v0.3.32: Issue #429 generic git wrapper in openwiki', () => {
  const wf = fs.readFileSync(path.join(ROOT, 'openwiki/workflows.md'), 'utf8')
  assert.ok(!wf.includes('только через авторизованный враппер `/home/vadim/.ssh/bin/git-antigravity`'), 'Must not hardcode git-antigravity only')
  assert.ok(wf.includes('GIT_BIN'), 'Must document GIT_BIN')
  assert.ok(wf.includes('git-codex'), 'Must document git-codex and agent wrappers')

  const qs = fs.readFileSync(path.join(ROOT, 'openwiki/quickstart.md'), 'utf8')
  assert.ok(qs.includes('sudo systemctl restart dsh-web.service'), 'Must document system service restart')
})

test('v0.3.32: Issue #432 11 new keys Russian translations present', () => {
  const p15 = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/15-commandcode.json'), 'utf8'))
  const cc = p15['settings.commandcode']
  assert.ok(cc.durationTooSmall.includes('0,001 с'))
  assert.ok(cc.durationTooLarge.includes('3600'))
  assert.ok(cc.durationInvalid.includes('секунды'))
  assert.ok(cc.accountCleanupPending.includes('Аккаунт удалён'))
  assert.ok(cc.accountCleanupRetry.includes('Повторить'))

  const p42 = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/42-plugin-console.json'), 'utf8'))
  const pc = p42['settings.pluginConsole']
  assert.ok(pc.adoptableRescinded.includes('Критерии обновлены'))
  assert.ok(pc.compatRescindedTag.includes('Вердикт отозван'))
  assert.ok(pc.compatRescindedHint.includes('ложного срабатывания'))

  const p17 = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/17-dsh-context.json'), 'utf8'))
  assert.ok(p17['dsh-context']['timing.strip'].includes('Шкала времени'))

  const p03 = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/03-dshmarket.json'), 'utf8'))
  assert.ok(p03['dsh-market'].queuedRunBusy.includes('остаётся в очереди'))
  assert.ok(p03['dsh-market'].stateIncompatible.includes('несовместим'))
})

test('v0.3.32: Issue #432 multi-drift reporting in check_data_integrity.py', () => {
  const cdi = fs.readFileSync(path.join(ROOT, 'tools/check_data_integrity.py'), 'utf8')
  assert.ok(cdi.includes('drift_errors = []'), 'Must accumulate drift errors')
  assert.ok(cdi.includes('for err in drift_errors:'), 'Must report all drift errors')

  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.equal(inv.metrics.total_keys, 8595)
  assert.equal(inv.metrics.plugin_keys, 6153)
  assert.equal(inv.metrics.core_keys, 2442)
  assert.equal(inv.supported_plugins['@goodandready/dsh-lanmode'], '0.8.17')
  assert.equal(inv.supported_plugins['@goodandready/dsh-clinebot'], '0.5.11')
})
