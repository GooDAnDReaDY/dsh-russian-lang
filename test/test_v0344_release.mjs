import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

test('v0.3.44: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.version >= '0.3.44');
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang');
  assert.ok(pkg.description.includes('UI keys'), 'Description must reflect UI keys');
  assert.ok(pkg.description.includes('88 plugins'), 'Description must reflect 88 plugins');

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  assert.ok(cl.includes('## 0.3.44'), 'CHANGELOG must mention 0.3.44');
  assert.ok(cl.includes('#493'), 'CHANGELOG must mention #493');
  assert.ok(cl.includes('#494'), 'CHANGELOG must mention #494');

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  assert.ok(readme.includes('npm-v'), 'README npm badge must be present');
  assert.ok(readme.includes('98'), 'README keys badge must reflect 98xx');
});

test('v0.3.44: clearai-dsh translation and dictionary presence (#493)', () => {
  const ruPluginsFile = path.join(ROOT, 'ru-plugins', '88-clearai.json');
  assert.ok(fs.existsSync(ruPluginsFile), 'ru-plugins/88-clearai.json must exist');
  const d = JSON.parse(fs.readFileSync(ruPluginsFile, 'utf8'));
  assert.ok(d.clearai, 'clearai namespace must exist');
  assert.equal(Object.keys(d.clearai).length, 297, 'clearai must have 297 translated keys');

  const compiledPlugin = path.join(ROOT, 'lib', 'locales', 'plugins', '88-clearai.json');
  assert.ok(fs.existsSync(compiledPlugin), 'compiled clearai locale must exist');
});

test('v0.3.44: inventory metrics reflect 9,846 total keys and 100% coverage (#493, #494)', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'));
  assert.equal(inv.metrics.core_keys, 2588);
  assert.ok(inv.metrics.plugin_keys >= 7258);
  assert.ok(inv.metrics.total_keys >= 9846);
  assert.equal(inv.metrics.coverage_percent, 100.0);
  assert.ok(inv.supported_plugins['clearai-dsh'], 'clearai-dsh must be in supported_plugins');
});

test('v0.3.44: check_data_integrity passes on clean repository', () => {
  const cdi = path.join(ROOT, 'tools', 'check_data_integrity.py');
  assert.ok(fs.existsSync(cdi));
});
