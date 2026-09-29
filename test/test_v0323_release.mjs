import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

test('v0.3.23: package.json and CHANGELOG version consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.version >= '0.3.23')
  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')
  const head = changelog.split('\n').find((line) => line.startsWith('## ')) || ''
  assert.ok(changelog.includes('## 0.3.23'), `CHANGELOG head must mention 0.3.23, got: ${head}`)
})

test('v0.3.23: core dictionaries contain new DSH 0.2.0-rc.2 keys', () => {
  const core = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/core.json'), 'utf8'))
  assert.ok(core.question, 'question namespace must exist in core')
  assert.equal(typeof core.question, 'object')
  assert.ok(Object.keys(core.question).length >= 16, 'question namespace must have >= 16 keys')
  assert.equal(core.question['action.next'], 'Дальше')
  assert.equal(core.question['action.skip'], 'Пропустить вопрос')
  assert.equal(core.question['option.recommended'], 'Рекомендуем')
  assert.equal(core.question['plan.approve'], 'Утвердить')

  assert.equal(core.chat['message.turnProcess.took'], 'Выполнено за ')
  assert.equal(core.conversation['hero.headline'], 'Навстречу неизведанному')
})

test('v0.3.23: plugin dictionaries contain new ecosystem keys and valid placeholders', () => {
  const tm = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/37-time-machine.json'), 'utf8'))
  const tmDict = tm['dsh-time-machine'] || tm['@goodandready/dsh-time-machine']
  assert.ok(tmDict, 'time-machine namespace must exist')
  assert.equal(tmDict.updaterCurrent, 'Текущая версия')
  assert.equal(tmDict.updaterLatest, 'Последняя версия')
  assert.equal(tmDict.updaterSuccess, 'Плагин успешно обновлён! Пожалуйста, перезапустите сервис DSH.')

  const cl = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/38-context-lens.json'), 'utf8'))
  assert.ok(cl['dsh-context-lens'], 'dsh-context-lens must exist')
  assert.equal(cl['dsh-context-lens'].title, 'Линза контекста')
  assert.equal(cl['dsh-context-lens'].sub, 'Скелеты кода по AST и сжатие логов тестов')

  const dm = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/locales/plugins/03-dshmarket.json'), 'utf8'))
  assert.ok(dm['dsh-market'], 'dsh-market must exist')
  assert.equal(dm['dsh-market'].installedBadge, '✓ Установлен')
  assert.equal(dm['dsh-market'].notInstalled, 'Не установлен')
})

test('v0.3.23: hero banner exists and is valid', () => {
  const bannerPath = path.join(ROOT, 'docs/media/banner.jpg')
  assert.ok(fs.existsSync(bannerPath), 'banner.jpg exists')
  const stat = fs.statSync(bannerPath)
  assert.ok(stat.size > 80000, `banner.jpg size ${stat.size} is valid`)
})
