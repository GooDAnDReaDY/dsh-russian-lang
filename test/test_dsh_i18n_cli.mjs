import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const binPath = path.join(rootDir, 'bin', 'dsh-i18n.mjs')

test('dsh-i18n CLI: --help выводит справку по использованию', () => {
  const out = execFileSync(process.execPath, [binPath, '--help'], { encoding: 'utf8' })
  assert.ok(out.includes('dsh-i18n'))
  assert.ok(out.includes('extract'))
  assert.ok(out.includes('validate'))
  assert.ok(out.includes('scaffold'))
})

test('dsh-i18n CLI: --version выводит версию из package.json', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'))
  const out = execFileSync(process.execPath, [binPath, '--version'], { encoding: 'utf8' }).trim()
  assert.equal(out, pkg.version)
})

test('dsh-i18n CLI: scaffold создаёт шаблон словаря плагина', () => {
  const tmpDir = path.join(rootDir, 'test', '_tmp_scaffold')
  fs.mkdirSync(tmpDir, { recursive: true })
  try {
    const out = execFileSync(process.execPath, [binPath, 'scaffold', 'demo-feature', '--out', tmpDir], { encoding: 'utf8' })
    assert.ok(out.includes('demo-feature.json'))

    const filePath = path.join(tmpDir, 'demo-feature.json')
    assert.ok(fs.existsSync(filePath))
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    assert.ok(parsed['demo-feature'])
    assert.ok(parsed['demo-feature'].title)
    assert.ok(parsed['demo-feature'].settings)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('dsh-i18n CLI: validate проверяет валидные и невалидные словари', () => {
  const validFile = path.join(rootDir, 'ru-plugins', '77-github-ops.json')
  const outValid = execFileSync(process.execPath, [binPath, 'validate', validFile], { encoding: 'utf8' })
  assert.ok(outValid.includes('прошёл проверку валидности'))

  const tmpInvalid = path.join(rootDir, 'test', '_tmp_broken.json')
  fs.writeFileSync(tmpInvalid, JSON.stringify({ broken: { err: 'Привет {} мир' } }), 'utf8')
  try {
    assert.throws(() => {
      execFileSync(process.execPath, [binPath, 'validate', tmpInvalid], { encoding: 'utf8', stdio: 'pipe' })
    })
  } finally {
    fs.rmSync(tmpInvalid, { force: true })
  }
})

test('dsh-i18n CLI: extract извлекает ключи локализации из кода', () => {
  const tmpSrc = path.join(rootDir, 'test', '_tmp_src')
  fs.mkdirSync(tmpSrc, { recursive: true })
  const sampleCode = `
    function render() {
      const a = t('header.title')
      const b = translate('custom-ns', 'btn.submit')
    }
  `
  fs.writeFileSync(path.join(tmpSrc, 'index.js'), sampleCode, 'utf8')
  try {
    const out = execFileSync(process.execPath, [binPath, 'extract', tmpSrc, '-n', 'my-ns'], { encoding: 'utf8' })
    const parsed = JSON.parse(out)
    assert.ok('header.title' in parsed['my-ns'])
    assert.ok('btn.submit' in parsed['custom-ns'])
  } finally {
    fs.rmSync(tmpSrc, { recursive: true, force: true })
  }
})
