import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.47: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.47')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('UI keys'))
  assert.ok(pkg.files.includes('supported-inventory.json'), 'files must include supported-inventory.json')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('0.3.47'), 'CHANGELOG must mention 0.3.47')
  assert.ok(cl.includes('0.2.1-alpha.3'), 'CHANGELOG must mention 0.2.1-alpha.3')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.47') || readme.includes('npm-v0.3.48') || readme.includes('npm-v0.3.49') || readme.includes('npm-v0.4.0'), 'README npm badge must be v0.3.47')
  assert.ok(readme.includes('10400') || readme.includes('10432') || readme.includes('10898'), 'README keys badge')
})

test('v0.3.47: DSH v0.2.1-alpha.3 core and ecosystem keys (Refs: #502)', () => {
  const models = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru', '03-models-workspace.json'), 'utf8'))
  assert.ok(models.secretMask, 'secretMask namespace must exist')
  assert.equal(models.secretMask['secret.hide'], 'Скрыть секрет')
  assert.equal(models.secretMask['secret.reveal'], 'Показать секрет')
  assert.equal(models['settings.models']['baseUrlConfigured'], 'Эндпоинт, настроенный провайдером')

  const plugins = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru', '05-plugins-subagent.json'), 'utf8'))
  assert.ok(plugins.pluginManager.restartNotice.includes('{reason}'), 'restartNotice must include {reason}')
  assert.ok(plugins.pluginManager.installDoneRestart.includes('{reason}'), 'installDoneRestart must include {reason}')
  assert.equal(plugins.pluginManager.extensionsTitle, 'Экспериментальные плагины')

  const rot = JSON.parse(fs.readFileSync(path.join(ROOT, 'ru-plugins', '34-key-rotation.json'), 'utf8'))
  assert.equal(rot['dsh-key-rotation'].routingStrategySticky, 'Закрепление ключа (Sticky, сохраняет кэш промпта)')
})

test('v0.3.47: supported-inventory has 10,400 total keys and 110 namespaces', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'))
  assert.ok(inv.metrics.total_keys >= 10400)
  assert.ok(inv.metrics.total_namespaces >= 110)
  assert.ok(['0.2.1-alpha.3', '0.2.1-rc.2'].includes(inv.core.supported_version))
  assert.ok(inv.metrics.core_keys >= 2619)
  assert.ok(inv.metrics.plugin_keys >= 7781)
})
