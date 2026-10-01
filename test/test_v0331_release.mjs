import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.31: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.3.31')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.31'), 'CHANGELOG must mention 0.3.31')
  assert.ok(cl.includes('DSH v0.2.0-rc.2'), 'CHANGELOG head must mention DSH v0.2.0-rc.2')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.31'), 'README npm badge must be v0.3.31')
})

test('v0.3.31: Issue #429 openwiki presence and navigation integrity', () => {
  const openwikiDir = path.join(ROOT, 'openwiki')
  assert.ok(fs.existsSync(openwikiDir), 'openwiki directory must exist in DEV root')

  const mandatoryFiles = [
    'quickstart.md',
    'architecture.md',
    'config.md',
    'testing.md',
    'workflows.md',
    'api.md'
  ]
  for (const f of mandatoryFiles) {
    const p = path.join(openwikiDir, f)
    assert.ok(fs.existsSync(p), `openwiki/${f} must exist`)
    const content = fs.readFileSync(p, 'utf8')
    assert.ok(content.startsWith('---'), `openwiki/${f} must contain frontmatter`)
  }

  const idx = fs.readFileSync(path.join(ROOT, 'index.md'), 'utf8')
  assert.ok(idx.includes('openwiki/'), 'index.md must link to openwiki/')

  const didx = fs.readFileSync(path.join(ROOT, 'docs/index.md'), 'utf8')
  assert.ok(didx.includes('openwiki/'), 'docs/index.md must link to openwiki/')
})

test('v0.3.31: Issue #432 inventory validation and CI integrity gate', () => {
  const ciYml = fs.readFileSync(path.join(ROOT, '.gitea/workflows/ci.yml'), 'utf8')
  assert.ok(ciYml.includes('python3 tools/check_data_integrity.py'), 'CI must run check_data_integrity.py')

  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.equal(inv.supported_plugins['@goodandready/dsh-clinebot'], '0.5.10')
  assert.equal(inv.supported_plugins['@goodandready/dsh-image-gen'], '^0.11.21')
  assert.equal(inv.supported_plugins['@goodandready/dsh-key-rotation'], '0.8.45')
  assert.equal(inv.supported_plugins['@goodandready/dsh-subscriptions'], '0.6.48')
  assert.equal(inv.supported_plugins['@goodandready/dsh-voice'], '0.9.10')
  assert.equal(inv.supported_plugins['billion-context'], '0.1.179')

  const cdi = fs.readFileSync(path.join(ROOT, 'tools/check_data_integrity.py'), 'utf8')
  assert.ok(cdi.includes('satisfies_range'), 'check_data_integrity must implement satisfies_range')
  assert.ok(cdi.includes('compatible_range'), 'check_data_integrity must validate compatible_range')
})

test('v0.3.31: Issue #446 GitHub sanitized publication and leak prevention', () => {
  const pubScript = fs.readFileSync(path.join(ROOT, 'scripts/publish-github.sh'), 'utf8')
  assert.ok(pubScript.includes('"openwiki"'), 'publish-github.sh must forbid openwiki')
  assert.ok(pubScript.includes('"supported-inventory.json"'), 'publish-github.sh must forbid supported-inventory.json')
  assert.ok(pubScript.includes('"docs/design"'), 'publish-github.sh must forbid docs/design')
  assert.ok(pubScript.includes('refs/tags/$tag_name'), 'publish-github.sh must push sanitized tag ref')
  assert.ok(pubScript.includes('forbidden_found'), 'publish-github.sh must verify tree after commit')
})
