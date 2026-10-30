export const PACKAGE_ALIASES = {
  '@goodandready/dsh-opencode-provider': 'settings.opencode',
  '@goodandready/dsh-ollama-cloud-provider': 'settings.ollama',
  '@feng0531/dsh-code-review': 'settings.autoReview',
  '@linxin666/dsh-client-ui-skill-explorer': 'dsh-skill-explorer',
  '@liustack/modsearch': 'modsearch',
  '@log.li/dsh-automode': 'dsh-auto-mode.permission',
  '@mars-sea/dsh-commandcode-provider': 'settings.commandcode',
  '@michengai/dsh-agency-agents': 'agency',
  '@michengai/dsh-skills-manager': 'skills-manager',
  '@opencode2dsh/dsh-plugin': 'settings.ip-pool',
  '@vlln/dsh-navbar': 'pin',
  'billion-context': 'bili',
  'clearai-dsh': 'clearai',
  'dsh-opencode-session': 'dsh-session-control',
  'dsh-plugin-subagent-director': 'subagent-director',
  'dsh-plugin-market': 'pluginMarket',
  'dsh-plugins-store': 'plugin-store',
  'dshmarket': 'dsh-market',
  'superpowers-dsh': 'dsh-superpower'
}

export const HEADLESS_PLUGINS = new Set([
  '@goodandready-private/dsh-scrapling-fast',
  'dsh-web',
  'upstream-radar',
  'dsh-find-plugin',
  'dsh-ponytail-skills',
  'humanizer-ru-dsh',
  'github-explore'
])

export const resolvePluginNamespace = (pkgName, dicts) => {
  if (!pkgName) return null
  if (PACKAGE_ALIASES[pkgName]) return PACKAGE_ALIASES[pkgName]
  if (dicts && dicts[pkgName]) return pkgName
  const base = pkgName.replace(/^@[^/]+\//, '')
  if (PACKAGE_ALIASES[base]) return PACKAGE_ALIASES[base]
  if (!dicts) return base
  const candidates = [
    base,
    base.replace(/^dsh-/, ''),
    'dsh-' + base,
    base.replace(/-/g, '.'),
    'settings.' + base.replace(/^dsh-/, ''),
    'plugin.' + base.replace(/^dsh-/, '')
  ]
  for (const c of candidates) {
    if (dicts[c]) return c
  }
  return base
}

// dsh-russian-lang — чистая половина: всё, что не трогает DOM, cordis и сеть.
//
// ФАЙЛ ПРАВИТСЯ РУКАМИ. build.py читает его целиком, снимает `export ` и
// вставляет тело в бандл (lib/client.js) на месте маркера. Тесты импортируют
// этот же файл напрямую.
//
// Смысл разделения — в том, что тесты и бандл едят один исходник. Раньше
// 1069 строк JavaScript лежали внутри питоновского литерала в build.py,
// импортировать оттуда было нечего, и тесты копировали функции к себе. Копии
// расходились с оригиналом молча: правка регулярки в build.py тест не ронял
// (#133). Всё, что сюда переехало, проверяется на том коде, который уезжает
// пользователю.
//
// Правило для новых функций: если функция не обращается к document, ctx,
// runtime или сети — её место здесь, а не в шаблоне.


export const makeIssueUrl = (opts = {}, version = '') => {
  const repo = 'GooDAnDReaDY/dsh-russian-lang'
  let title = opts.title
  let bodyLines = []
  const l = (k, v) => v ? `- **${k}**: \`${v}\`` : null

  if (opts.isProposal) {
    const kLabel = opts.key || (opts.original ? String(opts.original).slice(0, 30) : 'исправление')
    const tLabel = opts.plugin || opts.ns || 'Интерфейс'
    title = title || `[Предложение перевода] ${tLabel}: ${kLabel}`
    bodyLines = [
      '### 💡 Предлагаемое исправление перевода', '',
      '| Поле | Значение |', '|---|---|',
      `| **Оригинал (EN/ZH)** | \`${opts.original || opts.en || '(неизвестен)'}\` |`,
      `| **Текущий перевод** | \`${opts.current || opts.ru || '(нет перевода)'}\` |`,
      opts.override ? `| **Активный оверрайд** | \`${opts.override}\` |` : null,
      `| **Предложенный перевод** | **${opts.proposal || '(не указан)'}** |`, '',
      '### Технический контекст',
      `- **Namespace**: \`${opts.ns || '(DOM узел)'}\``,
      `- **Ключ**: \`${opts.key || '(DOM узел)'}\``,
      l('Плагин', opts.plugin),
      l('Версия плагина', opts.pluginVersion),
      l('Версия DSH', opts.dshVersion),
      l('Версия dsh-russian-lang', version),
      typeof navigator !== 'undefined' ? l('User Agent', navigator.userAgent) : null, '',
      opts.comment ? `### Комментарий автора предложения\n${opts.comment}\n` : null,
      '---', '_Отправлено через Инспектор перевода dsh-russian-lang._'
    ].filter(Boolean)
  } else if (opts.missingKeys && Array.isArray(opts.missingKeys) && opts.missingKeys.length > 0) {
    const pName = opts.plugin || opts.ns || 'плагин'
    title = title || `[Перевод] Запрос локализации для плагина ${pName}${opts.installedVersion ? ` (v${opts.installedVersion})` : ''}`
    const maxK = 35
    const kList = opts.missingKeys.slice(0, maxK).map((it) => {
      const k = typeof it === 'string' ? it : it.key
      const en = typeof it === 'object' && it.en ? ` — "${it.en}"` : ''
      return `- \`${k}\`${en}`
    }).join('\n')
    const trunc = opts.missingKeys.length > maxK ? `\n\n_... и ещё ${opts.missingKeys.length - maxK} ключей (список сокращён для ограничения длины URL)._` : ''

    bodyLines = [
      '### 📊 Запрос локализации плагина',
      `Просьба добавить или дополнить русскую локализацию для плагина \`${pName}\`.`, '',
      '### Состояние покрытия',
      `- **Плагин**: \`${pName}\``,
      opts.ns ? `- **Namespace**: \`${opts.ns}\`` : null,
      l('Установленная версия', opts.installedVersion),
      opts.verifiedVersion ? `- **Проверенная версия базы**: \`${opts.verifiedVersion}\`` : '- **Проверенная версия базы**: `не проверено`',
      opts.coveragePercent !== undefined ? `- **Текущее покрытие**: \`${opts.coveragePercent}%\`` : null,
      opts.totalKeys !== undefined ? `- **Всего ключей в базе**: \`${opts.totalKeys}\`` : null,
      `- **Недостающих ключей**: \`${opts.missingKeys.length}\``,
      l('Версия DSH', opts.dshVersion),
      l('Версия dsh-russian-lang', version),
      typeof navigator !== 'undefined' ? l('User Agent', navigator.userAgent) : null, '',
      '### Список недостающих ключей', kList + trunc, '',
      '---', '_Сгенерировано из Панели состояния локализации dsh-russian-lang._'
    ].filter(Boolean)
  } else {
    title = title || (opts.plugin ? `[Перевод] Запрос локализации для плагина ${opts.plugin}` : '[Ошибка перевода] Неточный перевод фразы')
    bodyLines = [
      '### Описание проблемы',
      opts.description || (opts.plugin ? `Просьба добавить русскую локализацию для плагина \`${opts.plugin}\`.` : 'Обнаружена неточность в переводе интерфейса.'), '',
      '### Технический контекст',
      opts.ns ? `- **Namespace**: \`${opts.ns}\`` : null,
      opts.key ? `- **Ключ**: \`${opts.key}\`` : null,
      opts.en ? `- **Оригинал (EN)**: ${opts.en}` : null,
      opts.ru ? `- **Текущий перевод (RU)**: ${opts.ru}` : null,
      l('Плагин', opts.plugin),
      l('Версия dsh-russian-lang', version),
      typeof navigator !== 'undefined' ? l('User Agent', navigator.userAgent) : null, '',
      '### Предлагаемый вариант перевода',
      opts.proposal || '_Опишите ваш вариант перевода..._'
    ].filter(Boolean)
  }

  const params = new URLSearchParams()
  params.set('title', title)
  params.set('body', bodyLines.join('\n'))
  return `https://github.com/${repo}/issues/new?` + params.toString()
}

export const makePluginLocalizationStatus = (dicts, enCatalog, inventory) => (ns, pkgName, installedVersion) => {
  const supp = inventory && (inventory.supported_plugins || inventory)
  const verifiedVersion = (supp && (supp[pkgName] || (ns && (supp[ns] || supp['@goodandready/' + ns] || supp['@goodandready-private/' + ns])))) || null

  if (pkgName && (HEADLESS_PLUGINS.has(pkgName) || (inventory && Array.isArray(inventory.headless_plugins) && inventory.headless_plugins.includes(pkgName)))) {
    return {
      status: 'headless',
      count: 0,
      total: 0,
      percent: 100,
      missingKeys: [],
      verifiedVersion,
      installedVersion: installedVersion || null,
      label: 'Серверный плагин (без UI)'
    }
  }

  const none = { status: 'none', count: 0, total: 0, percent: 0, missingKeys: [], verifiedVersion, installedVersion: installedVersion || null, label: 'RU отсутствует' }
  if (!ns) return none
  const ruMap = (dicts && dicts[ns]) || {}
  const rawCount = Object.keys(ruMap).length

  const ret = (st, c, tot, pct, mk, lbl) => ({
    status: st, count: c, total: tot, percent: pct, missingKeys: mk, verifiedVersion, installedVersion: installedVersion || null, label: lbl
  })

  const isSemverIncompatible = (v1, v2) => {
    if (!v1 || !v2) return false
    const m1 = String(v1).match(/(\d+)\.(\d+)\.(\d+)/)
    const m2 = String(v2).match(/(\d+)\.(\d+)\.(\d+)/)
    if (!m1 || !m2) return false
    const maj1 = Number(m1[1]), min1 = Number(m1[2])
    const maj2 = Number(m2[1]), min2 = Number(m2[2])
    if (maj1 !== maj2) return true
    if (maj1 === 0 && min1 !== min2) return true
    return false
  }

  const isVersionMismatch = Boolean(
    installedVersion &&
    verifiedVersion &&
    isSemverIncompatible(installedVersion, verifiedVersion)
  )

  // #537: Использование предрассчитанного статуса покрытия из inventory.plugins_coverage
  const pc = inventory?.plugins_coverage?.[pkgName] || (ns ? inventory?.plugins_coverage?.[ns] : null)
  if (pc && (!enCatalog || !Object.keys(enCatalog).length)) {
    if (pc.total === 0 && pc.count > 0) return ret('unverified', pc.count, pc.count, 0, [], `RU: ${pc.count} строк (каталог EN не найден)`)
    if (isVersionMismatch) return ret('unverified', pc.count, pc.total, pc.percent, [], `RU: ${pc.count}/${pc.total} (установлена v${installedVersion} ≠ база v${verifiedVersion})`)
    const st = pc.percent === 100 ? 'full' : (pc.percent > 0 ? 'partial' : 'none')
    const lbl = st === 'full' ? `RU: ${pc.count} строк (100%)` : (st === 'partial' ? `RU: ${pc.count}/${pc.total} (${pc.percent}%)` : 'RU отсутствует (0%)')
    return ret(st, pc.count, pc.total, pc.percent, pc.missingKeys || [], lbl)
  }

  if (enCatalog && typeof enCatalog === 'object') {
    const enMap = enCatalog[ns]
    if (enMap && typeof enMap === 'object') {
      const enKeys = Object.keys(enMap)
      const total = enKeys.length
      const missingKeys = []
      let translated = 0
      for (const k of enKeys) {
        if (ruMap[k] !== undefined) translated++;
        else missingKeys.push({ key: k, en: enMap[k] })
      }
      if (total === 0) {
        return rawCount > 0
          ? ret('unverified', rawCount, rawCount, 0, [], `RU: ${rawCount} строк (каталог EN пуст)`)
          : ret(verifiedVersion ? 'none' : 'unverified', 0, 0, 0, [], verifiedVersion ? 'RU отсутствует' : 'Не проверено')
      }
      const percent = Math.round((translated / total) * 100)
      if (missingKeys.length === 0) {
        if (isVersionMismatch) {
          // #544: При несовпадении версий не утверждаем 100% full
          return ret('unverified', translated, total, percent, [], `RU: ${translated}/${total} (установлена v${installedVersion} ≠ база v${verifiedVersion})`)
        }
        return ret('full', translated, total, 100, [], `RU: ${translated} строк (100%)`)
      }
      const status = translated > 0 ? 'partial' : 'none'
      const label = status === 'partial' ? `RU: ${translated}/${total} (${percent}%)` : 'RU отсутствует (0%)'
      return ret(status, translated, total, percent, missingKeys, label)
    }
    if (rawCount > 0) return ret('unverified', rawCount, rawCount, 0, [], `RU: ${rawCount} строк (каталог EN не найден)`)
    return ret(verifiedVersion ? 'none' : 'unverified', 0, 0, 0, [], verifiedVersion ? 'RU отсутствует' : 'Не проверено')
  }

  // #544: Если передан инвентарь (панель обзора), но EN-каталог отсутствует/null -> unverified
  if (inventory) {
    if (rawCount > 0) return ret('unverified', rawCount, rawCount, 0, [], `RU: ${rawCount} строк (каталог EN не найден)`)
    return none
  }

  // Режим одиночного словаря без каталога EN и инвентаря (обратная совместимость #133)
  if (rawCount > 0) return ret('full', rawCount, rawCount, 100, [], `RU: ${rawCount} строк`)
  return none
}

