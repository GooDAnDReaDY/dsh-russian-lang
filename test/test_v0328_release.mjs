import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.28: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.3.28')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  const head = cl.slice(0, 300)
  assert.ok(head.includes('0.3.28'), `CHANGELOG head must mention 0.3.28, got: ${head}`)
  assert.ok(head.includes('DSH v0.2.0-rc.2'), 'CHANGELOG head must mention DSH v0.2.0-rc.2')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.28'), 'README npm badge must be v0.3.28')
  assert.ok(pkg.description.includes('8,584 UI keys'), 'package.json description must have 8,584 UI keys')
})

test('v0.3.28: Audit fixes #437-#440 invariants', () => {
  const clientJs = fs.readFileSync(path.join(ROOT, 'lib/client.js'), 'utf8')
  assert.ok(clientJs.includes('0.3.28'), 'client.js must include package version 0.3.28')
  assert.ok(clientJs.includes('saveBtn = modal.querySelector'), 'client.js must declare saveBtn (#437)')

  // Python tests exit 1 on fail (#438)
  const testToolsPy = fs.readFileSync(path.join(ROOT, 'test/test_tools.py'), 'utf8')
  assert.ok(testToolsPy.includes('sys.exit(1)'), 'test_tools.py must exit 1 on failure (#438)')

  // Parity in task tracker (%s placeholder #440)
  const ttRu = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins/48-task-tracker.json'), 'utf8'))
  assert.equal(ttRu['dsh-task-tracker']['tasks.emptyInFolder'], 'В папке «%s» нет задач')
})

test('v0.3.28: Audit fixes #407-#432 invariants', () => {
  // Upstream check git dirty check (#407)
  const upCheck = fs.readFileSync(path.join(ROOT, 'tools/upstream_check.py'), 'utf8')
  assert.ok(upCheck.includes('get_dirty_paths'), 'upstream_check.py must check dirty paths (#407)')

  // Supported inventory (#432)
  const invPath = path.join(ROOT, 'supported-inventory.json')
  assert.ok(fs.existsSync(invPath), 'supported-inventory.json must exist')
  const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'))
  assert.equal(inv.core.supported_version, '0.2.0-rc.2')
  assert.equal(inv.metrics.total_keys, 8584)
  assert.equal(inv.metrics.total_namespaces, 101)
  assert.ok(Object.keys(inv.supported_plugins).length >= 50)

  // Root index.md and DESIGN.md (#429)
  assert.ok(fs.existsSync(path.join(ROOT, 'index.md')), 'root index.md must exist (#429)')
  const designMd = fs.readFileSync(path.join(ROOT, 'docs/design/DESIGN.md'), 'utf8')
  assert.ok(designMd.includes('plugins.item'), 'DESIGN.md must document plugins.item (#429)')
  assert.ok(designMd.includes('plugins.row.config'), 'DESIGN.md must document plugins.row.config (#429)')
})
