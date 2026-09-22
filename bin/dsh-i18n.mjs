#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function getPkgVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
    return pkg.version || '0.0.0'
  } catch (_) {
    return '0.0.0'
  }
}

function printHelp() {
  console.log(`
dsh-i18n (v${getPkgVersion()}) — Инструмент локализации для плагинов DeepSeek Harness (DSH)

Использование:
  dsh-i18n <команда> [опции]

Команды:
  extract <каталог>            Извлечь ключи локализации (t('...'), translate('...')) из исходников
  validate <файл.json>         Проверить файл словаря на синтаксис, плейсхолдеры и глоссарий
  scaffold <имя-плагина>       Создать структуру и стартовый шаблон локализации для плагина

Опции:
  -o, --out <путь>             Путь для сохранения результата
  -n, --namespace <имя>        Пространство имён по умолчанию (для extract)
  -g, --glossary <путь>        Пользовательский файл глоссария (для validate)
  -h, --help                   Справка по командам
  -v, --version                Версия утилиты

Примеры:
  dsh-i18n extract src/ -n my-plugin -o ru/my-plugin.json
  dsh-i18n validate ru/my-plugin.json
  dsh-i18n scaffold dsh-my-plugin --out ru/
`)
}

function extractKeys(targetDir, defaultNs = 'common') {
  const result = { [defaultNs]: {} }
  const extensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx'])

  function walk(dir) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (['node_modules', '.git', 'dist', 'build', '.worktrees'].includes(entry.name)) continue
        walk(fullPath)
      } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
        const code = fs.readFileSync(fullPath, 'utf8')
        const tMatches = code.matchAll(/\bt\(\s*['"`]([a-zA-Z0-9_.-]+)['"`]\s*\)/g)
        for (const m of tMatches) {
          result[defaultNs][m[1]] = result[defaultNs][m[1]] || ''
        }
        const transMatches = code.matchAll(/\btranslate\(\s*['"`]([a-zA-Z0-9_.-]+)['"`]\s*,\s*['"`]([a-zA-Z0-9_.-]+)['"`]/g)
        for (const m of transMatches) {
          const ns = m[1]
          const key = m[2]
          if (!result[ns]) result[ns] = {}
          result[ns][key] = result[ns][key] || ''
        }
      }
    }
  }

  walk(targetDir)
  return result
}

function validateDict(filePath, glossaryPath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Ошибка: Файл не найден: ${filePath}`)
    return false
  }

  let data
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (err) {
    console.error(`Ошибка синтаксиса JSON в ${filePath}: ${err.message}`)
    return false
  }

  let errors = []
  let warnings = []
  let totalKeys = 0

  let glossary = null
  const gPath = glossaryPath || path.join(ROOT, 'glossary.json')
  if (fs.existsSync(gPath)) {
    try {
      glossary = JSON.parse(fs.readFileSync(gPath, 'utf8')).terms || {}
    } catch (_) {}
  }

  function checkString(ns, key, val) {
    totalKeys++
    if (typeof val !== 'string') {
      errors.push(`[${ns}:${key}] Значение должно быть строкой, получено: ${typeof val}`)
      return
    }

    if (/\{[\s]*\}/.test(val)) {
      errors.push(`[${ns}:${key}] Обнаружен пустой плейсхолдер: "{}"`)
    }
    const openCount = (val.match(/\{/g) || []).length
    const closeCount = (val.match(/\}/g) || []).length
    if (openCount !== closeCount) {
      errors.push(`[${ns}:${key}] Несовпадение количества открывающих и закрывающих фигурных скобок ({: ${openCount}, }: ${closeCount})`)
    }

    if (glossary) {
      const lower = val.toLowerCase()
      for (const [term, info] of Object.entries(glossary)) {
        if (Array.isArray(info.forbidden)) {
          for (const forbidden of info.forbidden) {
            const fLow = forbidden.toLowerCase()
            const re = new RegExp(`\\b${fLow}\\b`, 'i')
            if (re.test(lower)) {
              warnings.push(`[${ns}:${key}] Запрещённый термин по глоссарию "${forbidden}" (рекомендуется: "${info.canonical}")`)
            }
          }
        }
      }
    }
  }

  for (const ns of Object.keys(data)) {
    const section = data[ns]
    if (typeof section === 'object' && section !== null) {
      for (const [k, v] of Object.entries(section)) {
        checkString(ns, k, v)
      }
    }
  }

  console.log(`Проверено ключей: ${totalKeys}`)
  if (warnings.length) {
    console.warn(`Предупреждения (${warnings.length}):`)
    for (const w of warnings) console.warn(`  ⚠️  ${w}`)
  }
  if (errors.length) {
    console.error(`Ошибки (${errors.length}):`)
    for (const e of errors) console.error(`  ❌ ${e}`)
    return false
  }

  console.log(`✓ Файл ${filePath} прошёл проверку валидности!`)
  return true
}

function scaffoldPlugin(pluginName, outDir = '.') {
  const cleanName = pluginName.replace(/^@goodandready\//, '').replace(/^dsh-/, '')
  const ns = cleanName
  const template = {
    [ns]: {
      title: 'Название плагина',
      description: 'Описание назначения и возможностей плагина',
      settings: 'Настройки',
      status: 'Статус',
      save: 'Сохранить',
      cancel: 'Отмена'
    }
  }

  const dir = path.resolve(outDir)
  fs.mkdirSync(dir, { recursive: true })
  const targetFile = path.join(dir, `${cleanName}.json`)

  fs.writeFileSync(targetFile, JSON.stringify(template, null, 2) + '\n', 'utf8')
  console.log(`✓ Шаблон локализации создан: ${targetFile}`)
  console.log(`
Пример подключения в коде плагина (Cordis / DSH):

import dictRu from './ru/${cleanName}.json' assert { type: 'json' }

export function apply(ctx) {
  ctx.effect(() => {
    return ctx.locale.register('${ns}', 'ru', dictRu['${ns}'])
  })
}
`)
}

const args = process.argv.slice(2)
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  printHelp()
  process.exit(0)
}

if (args.includes('-v') || args.includes('--version')) {
  console.log(getPkgVersion())
  process.exit(0)
}

const command = args[0]
if (command === 'extract') {
  const target = args[1] || '.'
  let ns = 'common'
  let out = null
  for (let i = 2; i < args.length; i++) {
    if ((args[i] === '-n' || args[i] === '--namespace') && args[i + 1]) ns = args[++i]
    if ((args[i] === '-o' || args[i] === '--out') && args[i + 1]) out = args[++i]
  }
  const extracted = extractKeys(path.resolve(target), ns)
  const jsonStr = JSON.stringify(extracted, null, 2)
  if (out) {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true })
    fs.writeFileSync(path.resolve(out), jsonStr + '\n', 'utf8')
    console.log(`✓ Извлечено ключей: ${Object.keys(extracted[ns] || {}).length} -> ${out}`)
  } else {
    console.log(jsonStr)
  }
} else if (command === 'validate') {
  const file = args[1]
  if (!file) {
    console.error('Ошибка: Укажите путь к JSON файлу словаря (dsh-i18n validate <file.json>)')
    process.exit(1)
  }
  let glossary = null
  for (let i = 2; i < args.length; i++) {
    if ((args[i] === '-g' || args[i] === '--glossary') && args[i + 1]) glossary = args[++i]
  }
  const ok = validateDict(path.resolve(file), glossary ? path.resolve(glossary) : null)
  process.exit(ok ? 0 : 1)
} else if (command === 'scaffold') {
  const name = args[1]
  if (!name) {
    console.error('Ошибка: Укажите имя плагина (dsh-i18n scaffold <plugin-name>)')
    process.exit(1)
  }
  let out = '.'
  for (let i = 2; i < args.length; i++) {
    if ((args[i] === '-o' || args[i] === '--out') && args[i + 1]) out = args[++i]
  }
  scaffoldPlugin(name, out)
} else {
  console.error(`Неизвестная команда: "${command}". Запустите "dsh-i18n --help" для справки.`)
  process.exit(1)
}
