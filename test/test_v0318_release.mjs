import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

test('v0.3.18: package.json version is 0.3.18', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.strictEqual(pkg.version, '0.3.18');
});

test('v0.3.18: core dictionaries contain new DSH 0.2.0-rc.1 keys', () => {
  const core = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/core.json'), 'utf8'));
  assert.strictEqual(core.chat['chat.deepDivingFor'], 'Глубокий анализ: {duration}...');
  assert.strictEqual(core.pluginManager['infoLabel'], 'О плагинах');
  assert.strictEqual(core.workspace['session.untitled'], 'Новый чат');
  assert.strictEqual(core['settings.sessionLog']['title'], 'Отправлять журнал сессий при использовании официального API моделей');
});

test('v0.3.18: plugin dictionaries contain new ecosystem keys', () => {
  const bs = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/07-better-sidebar.json'), 'utf8'));
  assert.strictEqual(bs.betterSidebar.changesClean, 'Рабочее дерево чисто');
  assert.strictEqual(bs.betterSidebar.deleteSelected, 'Удалить выбранное');

  const cm = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/26-config-manager.json'), 'utf8'));
  assert.strictEqual(cm['config-manager']['backupSchedule.hour'], 'Час');
  assert.strictEqual(cm['config-manager']['about.copyEnv'], 'Скопировать сведения об окружении (версия плагина / DSH, платформа)');

  const kr = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/34-key-rotation.json'), 'utf8'));
  assert.strictEqual(kr['dsh-key-rotation'].addModel, '+ Добавить модель');

  const pc = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/42-plugin-console.json'), 'utf8'));
  assert.strictEqual(pc['settings.pluginConsole'].actionAllowLabel, 'Разрешить скрипты сборки');
  assert.strictEqual(pc['settings.pluginConsole'].diagKindMissingTool, 'Отсутствует локальный инструмент (corepack/pnpm/git): установите его и повторите попытку');
});

test('v0.3.18: hero banner exists and is valid', () => {
  const bannerPath = path.join(ROOT, 'docs/media/banner.jpg');
  assert.ok(fs.existsSync(bannerPath), 'banner.jpg exists');
  const stat = fs.statSync(bannerPath);
  assert.ok(stat.size > 80000, `banner.jpg size ${stat.size} is valid`);
});
