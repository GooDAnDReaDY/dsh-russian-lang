import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')

test('v0.3.35: package.json, README and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.35')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(pkg.description.includes('8,697 UI keys') || pkg.description.includes('8,708 UI keys') || pkg.description.includes('9,359 UI keys') || pkg.description.includes('9,380 UI keys'), 'Description must reflect keys count')
  assert.ok(pkg.description.includes('v0.2.1-alpha.1'), 'Description must reflect DSH v0.2.1-alpha.1')

  const cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  assert.ok(cl.includes('## 0.3.35'), 'CHANGELOG must mention 0.3.35')
  assert.ok(cl.includes('DSH v0.2.1-alpha.1'), 'CHANGELOG must mention DSH v0.2.1-alpha.1')

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
  assert.ok(readme.includes('npm-v0.3.'), 'README npm badge must be v0.3.x')
  assert.ok(readme.includes('Ключей_UI-8697') || readme.includes('Ключей_UI-8708') || readme.includes('Ключей_UI-9359') || readme.includes('Ключей_UI-9380'), 'README keys badge must reflect keys count')
  assert.ok(readme.includes('DSH-v0.2.1--alpha.1'), 'README DSH version badge must be v0.2.1-alpha.1')
})

test('v0.3.35: DSH v0.2.1-alpha.1 Core translations present in lib/locales/core.json', () => {
  const core = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/core.json'), 'utf8'))

  // 1. session-inspector namespace (52 keys)
  const si = core['session-inspector']
  assert.ok(si, 'session-inspector namespace must exist in core')
  assert.equal(Object.keys(si).length, 52, 'session-inspector must contain all 52 keys')
  assert.equal(si['tab.title'], 'Журнал сессии')
  assert.equal(si['picker.pick'], 'Выбрать элемент в чате')
  assert.equal(si['table.latest'], 'Следить за новыми')
  assert.equal(si['object.turn'], 'Ход')
  assert.equal(si['object.step'], 'Шаг')

  // 2. pluginManager additions
  const pm = core['pluginManager']
  assert.ok(pm, 'pluginManager must exist in core')
  assert.ok(pm['chooseAddMethod'], 'chooseAddMethod must exist')
  assert.ok(pm['installDoneOtherVersion'].includes('{installed}'), 'installDoneOtherVersion must have {installed}')
  assert.ok(pm['installDoneOtherVersion'].includes('{version}'), 'installDoneOtherVersion must have {version}')
  assert.ok(pm['installDoneOtherVersion'].includes('{exact}'), 'installDoneOtherVersion must have {exact}')

  // 3. settings.agentPreset Creator mode
  const ap = core['settings.agentPreset']
  assert.ok(ap, 'settings.agentPreset must exist')
  assert.equal(ap['createPlugin'], 'Создать плагин силами агента')
  assert.equal(ap['createPluginDescription'], 'Перейти в режим Создателя и разработать собственный плагин DSH')

  // 4. workspace draft keys
  const ws = core['workspace']
  assert.ok(ws, 'workspace must exist')
  assert.equal(ws['draft.workspaceRequired'], 'Сначала выберите рабочую область.')

  // 5. schedule.manager & settings.account
  assert.equal(core['schedule.manager']['timing.subagentSession'], 'Эта сессия принадлежит субагенту, который не получает доставленные напоминания.')
  assert.equal(core['settings.account']['noResponse'], 'Произошла ошибка. Проверьте сетевое подключение и повторите попытку.')
})

test('v0.3.35: Ecosystem plugins translations present in lib/locales/plugins', () => {
  // 1. dsh-superpower (new namespace, 18 keys)
  const pSuper = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/86-superpower.json'), 'utf8'))
  const sp = pSuper['dsh-superpower']
  assert.ok(sp, 'dsh-superpower dictionary must exist')
  assert.ok(Object.keys(sp).length >= 18, 'dsh-superpower must contain at least 18 keys')
  assert.equal(sp['title'], 'Переключатели навыков')
  assert.equal(sp['modelInvocable'], 'Доступно модели')
  assert.equal(sp['userInvocable'], 'Доступно пользователю')

  // 2. settings.pluginConsole additions
  const pConsole = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/42-plugin-console.json'), 'utf8'))
  const pc = pConsole['settings.pluginConsole']
  assert.ok(pc['actionPersistLabel'], 'actionPersistLabel must exist')
  assert.ok(pc['marketCount'].includes('{total}'), 'marketCount must contain {total}')

  // 3. dsh-context additions
  const pContext = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/17-dsh-context.json'), 'utf8'))
  const ctx = pContext['dsh-context']
  assert.equal(ctx['settings.durationCurve'], 'График динамики · Кривая длительности')
  assert.equal(ctx['trend.duration'], 'Длительность')

  // 4. dsh-image-gen additions
  const pImage = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/68-image-gen.json'), 'utf8'))
  const img = pImage['dsh-image-gen']
  assert.equal(img['f.comfyWorkflowJson'], 'JSON воркфлоу ComfyUI')
  assert.equal(img['p.geminiModel'], 'gemini-3.1-flash-image')
})

test('v0.3.35: Hero banner exists and is valid size', () => {
  const bannerPath = path.join(ROOT, 'docs/media/banner.jpg')
  assert.ok(fs.existsSync(bannerPath), 'banner.jpg must exist')
  const stat = fs.statSync(bannerPath)
  assert.ok(stat.size > 80000, `banner.jpg size too small: ${stat.size}`)
})

test('v0.3.35: check_data_integrity passes all checks on clean repository', () => {
  const res = spawnSync('python3', ['tools/check_data_integrity.py'], { cwd: ROOT, encoding: 'utf8' })
  assert.equal(res.status, 0, `check_data_integrity failed: ${res.stderr}`)
  assert.ok(res.stdout.includes('Все снапшоты и корпусы данных прошли проверку целостности'))
})
