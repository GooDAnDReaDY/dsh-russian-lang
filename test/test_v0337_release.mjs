import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.37: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.equal(pkg.version, '0.3.37')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('8,708 UI keys'), 'Description must reflect 8,708 keys')
  assert.ok(pkg.description.includes('v0.2.1-alpha.1'), 'Description must reflect DSH v0.2.1-alpha.1')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.37'), 'CHANGELOG must mention 0.3.37')
  assert.ok(cl.includes('#466'), 'CHANGELOG must mention #466')
  assert.ok(cl.includes('#467'), 'CHANGELOG must mention #467')
  assert.ok(cl.includes('#468'), 'CHANGELOG must mention #468')
  assert.ok(cl.includes('#469'), 'CHANGELOG must mention #469')
  assert.ok(cl.includes('#470'), 'CHANGELOG must mention #470')
  assert.ok(cl.includes('#471'), 'CHANGELOG must mention #471')
  assert.ok(cl.includes('#472'), 'CHANGELOG must mention #472')
  assert.ok(cl.includes('#473'), 'CHANGELOG must mention #473')
  assert.ok(cl.includes('#474'), 'CHANGELOG must mention #474')
  assert.ok(cl.includes('#475'), 'CHANGELOG must mention #475')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.37'), 'README npm badge must be v0.3.37')
  assert.ok(readme.includes('Ключей_UI-8708'), 'README keys badge must be 8708')
})

test('v0.3.37: core-en.json and upstream/core-en.json are identical (#469)', () => {
  const rootCore = fs.readFileSync(path.join(ROOT, 'core-en.json'), 'utf8')
  const upCore = fs.readFileSync(path.join(ROOT, 'upstream', 'core-en.json'), 'utf8')
  assert.equal(rootCore, upCore, 'Dual core-en.json snapshots must be strictly identical')
})

test('v0.3.37: notify Web Push keys are present and translated (#467)', () => {
  const notifyRu = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '69-plugin-notify.json'), 'utf8'))
  const dict = notifyRu['@goodandready/dsh-plugin-notify']
  assert.ok(dict['webpush.section'], 'webpush.section must be present')
  assert.ok(dict['field.enableWebPush'], 'field.enableWebPush must be present')
  assert.ok(dict['webpush.state.subscribed'], 'webpush.state.subscribed must be present')
})

test('v0.3.37: client.template.js contains registration logging (#472) and modern theme tokens (#473)', () => {
  const tmpl = fs.readFileSync(path.join(ROOT, 'lib', 'client.template.js'), 'utf8')
  assert.ok(tmpl.includes('[dsh-russian-lang] Failed to register core locale'), 'Must log core locale registration failure')
  assert.ok(tmpl.includes('--dsw-elevation-2'), 'Must use canonical --dsw-elevation-2')
  assert.ok(tmpl.includes('--dsw-elevation-3'), 'Must use canonical --dsw-elevation-3')
  assert.ok(tmpl.includes('--dsw-brand-primary'), 'Must use canonical --dsw-brand-primary')
  assert.ok(tmpl.includes('--dsw-state-warn-primary'), 'Must use canonical --dsw-state-warn-primary')
})

test('v0.3.37: check_data_integrity passes on clean repository (#468)', () => {
  const res = spawnSync('python3', ['tools/check_data_integrity.py'], { cwd: ROOT, encoding: 'utf8' })
  assert.equal(res.status, 0, `check_data_integrity failed: ${res.stderr}`)
  assert.ok(res.stdout.includes('Все снапшоты и корпусы данных прошли проверку целостности'))
})
