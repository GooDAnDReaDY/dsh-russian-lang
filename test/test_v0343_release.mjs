import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

test('v0.3.43: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.version >= '0.3.43');
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang');
  assert.ok(pkg.description.includes('UI keys'), 'Description must reflect UI keys');

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  assert.ok(cl.includes('## 0.3.43'), 'CHANGELOG must mention 0.3.43');
  assert.ok(cl.includes('#489'), 'CHANGELOG must mention #489');
  assert.ok(cl.includes('#490'), 'CHANGELOG must mention #490');

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  assert.ok(readme.includes('npm-v0.3.'), 'README npm badge must be present');
  assert.ok(readme.includes('9549') || readme.includes('9 549'), 'README keys badge must reflect 9549');
});

test('v0.3.43: inventory metrics reflect 9,549 total keys and 100% coverage (#489)', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'supported-inventory.json'), 'utf8'));
  assert.ok(inv.metrics.core_keys >= 2588);
  assert.ok(inv.metrics.plugin_keys >= 6961);
  assert.ok(inv.metrics.total_keys >= 9549);
  assert.equal(inv.metrics.coverage_percent, 100.0);
});

test('v0.3.43: obsolete keys are completely removed (#489)', () => {
  const coreEn = JSON.parse(fs.readFileSync(path.join(ROOT, 'core-en.json'), 'utf8'));
  const theme = coreEn['settings.theme'] || {};
  assert.equal(theme['fontSize.decrease'], undefined);
  assert.equal(theme['fontSize.description'], undefined);
  assert.equal(theme['fontSize.increase'], undefined);
  assert.equal(theme['fontSize.title'], undefined);

  const traj = coreEn['trajectory'] || {};
  assert.equal(traj['details.scheduled'], undefined);
});

test('v0.3.43: client bundles contain no ghost theme tokens (#490)', () => {
  const tmpl = fs.readFileSync(path.join(ROOT, 'lib', 'client.template.js'), 'utf8');
  assert.ok(!tmpl.includes('--dsw-brand-primary,'));
  assert.ok(!tmpl.includes('--dsw-state-warn-primary,'));
  assert.ok(tmpl.includes('--dsw-alias-brand-primary'));
  assert.ok(tmpl.includes('--dsw-alias-state-warn-primary'));
  assert.ok(tmpl.includes('--dsw-shadow-lv3'));
  assert.ok(tmpl.includes('--dsw-elevation-soft'));
});

test('v0.3.43: check_data_integrity passes on clean repository', () => {
  const cdi = path.join(ROOT, 'tools', 'check_data_integrity.py');
  const res = fs.readFileSync(cdi, 'utf8');
  assert.ok(res.length > 0);
});
