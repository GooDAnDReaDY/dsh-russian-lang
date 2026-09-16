window.__ModuleLoader__.load({
  id: '@goodandready/dsh-russian-lang',
  factory: (require) => {
    var module = { exports: {} }
    var React = null
    try { React = require('react') } catch (e) { /* карточка настроек необязательна */ }



const numberFormat = new Intl.NumberFormat('ru-RU')
const relativeTimeFormat = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' })
const currencyFormats = new Map()

const getCurrencyFormat = (cur) => {
  const c = (cur || 'RUB').toUpperCase()
  if (!currencyFormats.has(c)) {
    try {
      currencyFormats.set(c, new Intl.NumberFormat('ru-RU', { style: 'currency', currency: c }))
    } catch (e) {
      currencyFormats.set(c, numberFormat)
    }
  }
  return currencyFormats.get(c)
}

const formatNumber = (val) => {
  if (val === null || val === undefined || val === '') return ''
  const n = typeof val === 'number' ? val : Number(val)
  return isNaN(n) ? String(val) : numberFormat.format(n)
}

const formatCurrency = (val, cur) => {
  if (val === null || val === undefined || val === '') return ''
  const n = typeof val === 'number' ? val : Number(val)
  if (isNaN(n)) return String(val)
  return getCurrencyFormat(cur).format(n)
}

const formatRelativeTime = (val, unit) => {
  if (val === null || val === undefined || val === '') return ''
  if (typeof val === 'number' && typeof unit === 'string') {
    return relativeTimeFormat.format(val, unit)
  }
  const ts = val instanceof Date ? val.getTime() : (typeof val === 'number' ? (val < 1e12 ? val * 1000 : val) : Number(val))
  if (isNaN(ts)) return String(val)
  const diffSec = Math.round((ts - Date.now()) / 1000)
  const absSec = Math.abs(diffSec)
  if (absSec < 45) return 'только что'
  if (absSec < 3600) return relativeTimeFormat.format(Math.round(diffSec / 60), 'minute')
  if (absSec < 86400) return relativeTimeFormat.format(Math.round(diffSec / 3600), 'hour')
  if (absSec < 2592000) return relativeTimeFormat.format(Math.round(diffSec / 86400), 'day')
  if (absSec < 31536000) return relativeTimeFormat.format(Math.round(diffSec / 2592000), 'month')
  return relativeTimeFormat.format(Math.round(diffSec / 31536000), 'year')
}


const INFLECT_CUSTOM = {
  'пользователь': { gen: 'пользователя', dat: 'пользователю', acc: 'пользователя', ins: 'пользователем', pre: 'пользователе' },
  'агент': { gen: 'агента', dat: 'агенту', acc: 'агента', ins: 'агентом', pre: 'агенте' },
  'субагент': { gen: 'субагента', dat: 'субагенту', acc: 'субагента', ins: 'субагентом', pre: 'субагенте' },
  'модель': { gen: 'модели', dat: 'модели', acc: 'модель', ins: 'моделью', pre: 'модели' },
  'промпт': { gen: 'промпта', dat: 'промпту', acc: 'промпт', ins: 'промптом', pre: 'промпте' },
  'инструмент': { gen: 'инструмента', dat: 'инструменту', acc: 'инструмент', ins: 'инструментом', pre: 'инструменте' },
  'сессия': { gen: 'сессии', dat: 'сессии', acc: 'сессию', ins: 'сессией', pre: 'сессии' },
  'ветка': { gen: 'ветки', dat: 'ветке', acc: 'ветку', ins: 'веткой', pre: 'ветке' },
  'файл': { gen: 'файла', dat: 'файлу', acc: 'файл', ins: 'файлом', pre: 'файле' },
  'папка': { gen: 'папки', dat: 'папке', acc: 'папку', ins: 'папкой', pre: 'папке' }
}

const keepCase = (src, out) => (src[0] === src[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out)

const inflectWord = (word, cName) => {
  if (!word || typeof word !== 'string') return word
  const lower = word.toLowerCase()
  if (INFLECT_CUSTOM[lower] && INFLECT_CUSTOM[lower][cName]) {
    return keepCase(word, INFLECT_CUSTOM[lower][cName])
  }
  if (/[a-zA-Z0-9_-]/.test(word) || /^[А-ЯЁ]{2,}$/.test(word)) return word
  if (/[оеиую]$/i.test(word) && !/(ко|ло|но|то|во|ро|до|по|со|мо|го)$/i.test(word)) return word

  const w = lower
  const endings = [
    ['ия', 2, (s) => ({ gen: s + 'ии', dat: s + 'ии', acc: s + 'ию', ins: s + 'ией', pre: s + 'ии' })],
    ['а', 1, (s) => {
      const genEnd = /[гкхжшчщ]/.test(s.slice(-1)) ? 'и' : 'ы'
      return { gen: s + genEnd, dat: s + 'е', acc: s + 'у', ins: s + 'ой', pre: s + 'е' }
    }],
    ['я', 1, (s) => ({ gen: s + 'и', dat: s + 'е', acc: s + 'ю', ins: s + 'ей', pre: s + 'е' })],
    ['ь', 1, (s) => ({ gen: s + 'и', dat: s + 'и', acc: s + 'ь', ins: s + 'ью', pre: s + 'и' })],
    ['й', 1, (s) => ({ gen: s + 'я', dat: s + 'ю', acc: s + 'я', ins: s + 'ем', pre: s + 'е' })]
  ]
  for (const [suffix, cut, build] of endings) {
    if (w.endsWith(suffix)) return keepCase(word, build(w.slice(0, -cut))[cName] || w)
  }
  if (/[бвгджзклмнпрстфхцчшщ]$/.test(w)) {
    const map = { gen: w + 'а', dat: w + 'у', acc: w, ins: w + 'ом', pre: w + 'е' }
    return keepCase(word, map[cName] || w)
  }
  return word
}

const INFLECT_CASES = new Set(['gen', 'dat', 'acc', 'ins', 'pre'])

const inflect = (phrase, cName) => {
  if (!phrase || typeof phrase !== 'string') return phrase
  if (!INFLECT_CASES.has(cName)) return phrase
  return phrase.split(' ').map((w) => inflectWord(w, cName)).join(' ')
}


const fill = (template, params) => {
  if (!params || typeof params !== 'object') return String(template)
  return String(template).replace(/\{(\w+)(?::(\w+))?\}/g, (match, name, spec) => {
    if (!(name in params)) return match
    const val = params[name]
    if (spec === 'number') return formatNumber(val)
    if (spec === 'reltime') return formatRelativeTime(val)
    if (spec === 'currency') return formatCurrency(val, params.currency || 'RUB')
    if (INFLECT_CASES.has(spec)) return inflect(String(val), spec)
    return String(val)
  })
}

const pluralRules = new Intl.PluralRules('ru-RU')

/** Русская форма числительного: one | few | many | other. */
const pluralForm = (n) => pluralRules.select(n)


const stemRussian = (word) => {
  if (!word || typeof word !== 'string') return ''
  let w = word.toLowerCase().trim()
  if (w.length < 4) return w
  w = w.replace(/(?:вшись|вши|ившись|ивши|ывшись|ывши|ив|ыв)$/, '')
  w = w.replace(/(?:ся|сь)$/, '')
  w = w.replace(/(?:ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|ему|ому|их|ых|ую|юю|ая|яя|ою|ею)$/, '')
  w = w.replace(/(?:ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|ыло|ено|ят|ует|уют|ит|ыт|ены|ить|ыть|ишь|ую|ю)$/, '')
  w = w.replace(/(?:ами|ями|иями|ией|иям|ием|ах|ях|иях|ев|ов|ие|ье|ей|ой|ий|ям|ем|ам|ом|а|е|и|о|у|ы|ь|ю|я)$/, '')
  return w.length >= 2 ? w : word.toLowerCase()
}

const EN_RU_KEYS = {
  'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ',
  'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'э',
  'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю'
}

const translitEnToRu = (str) => str.toLowerCase().split('').map((c) => EN_RU_KEYS[c] || c).join('')

const fuzzyMatchRu = (query, target) => {
  if (!query || !target) return 0
  const q = query.toLowerCase().trim()
  const t = target.toLowerCase().trim()
  if (t === q) return 100
  if (t.includes(q)) return 90
  if (t.includes(translitEnToRu(q))) return 85
  const qStems = q.split(/\s+/).map(stemRussian).filter(Boolean)
  const tStems = t.split(/\s+/).map(stemRussian).filter(Boolean)
  let matched = 0
  for (const qs of qStems) {
    if (tStems.some((ts) => ts.startsWith(qs) || qs.startsWith(ts))) matched++
  }
  if (matched === qStems.length && qStems.length > 0) return 80
  if (matched > 0) return 50
  return 0
}


const ERROR_MAP = {
  ENOENT: { title: 'Файл не найден', message: 'Указанный файл или директория не существуют', hint: 'Проверьте правильность указанного пути к файлу.' },
  EACCES: { title: 'Отказано в доступе', message: 'Недостаточно прав для чтения или записи', hint: 'Проверьте права доступа к файлу или директории (chmod/chown).' },
  EPERM: { title: 'Операция запрещена', message: 'Недостаточно системных привилегий', hint: 'Запустите процесс с соответствующими правами.' },
  ECONNREFUSED: { title: 'Соединение отклонено', message: 'Целевой сервер или сервис не отвечает', hint: 'Убедитесь, что локальный или удаленный сервис запущен и слушает порт.' },
  ECONNRESET: { title: 'Сброс соединения', message: 'Соединение было принудительно разорвано удаленной стороной', hint: 'Проверьте стабильность сети и работу целевого сервера.' },
  ETIMEDOUT: { title: 'Таймаут соединения', message: 'Превышено время ожидания ответа', hint: 'Проверьте стабильность сети или увеличьте лимит ожидания.' },
  ENOTFOUND: { title: 'Хост не найден', message: 'Не удалось разрешить сетевой адрес', hint: 'Проверьте правильность URL или настройки DNS.' },
  EADDRINUSE: { title: 'Порт уже занят', message: 'Сетевой порт используется другим процессом', hint: 'Остановите конфликтующий процесс или выберите другой порт.' },
  ENOSPC: { title: 'Недостаточно места на диске', message: 'На устройстве закончилось свободное пространство', hint: 'Освободите место на диске и повторите операцию.' },
  400: { title: 'Некорректный запрос (Bad Request)', message: 'Параметры запроса не соответствуют ожидаемому формату', hint: 'Проверьте синтаксис команды или переданные аргументы.' },
  401: { title: 'Требуется авторизация', message: 'API-ключ или токен отсутствуют или недействительны', hint: 'Проверьте настройки учетных данных и актуальность токена.' },
  403: { title: 'Доступ запрещен', message: 'Недостаточно прав для выполнения операции', hint: 'Проверьте область действия токена или права роли.' },
  404: { title: 'Ресурс не найден', message: 'Запрошенный адрес или объект не существует', hint: 'Проверьте правильность пути или идентификатора ресурса.' },
  429: { title: 'Превышен лимит запросов', message: 'Слишком много запросов (Rate Limit)', hint: 'Подождите несколько минут перед повторным запросом.' },
  500: { title: 'Внутренняя ошибка сервера', message: 'На стороне сервера произошел сбой', hint: 'Попробуйте повторить запрос позже или проверьте серверные логи.' },
  502: { title: 'Ошибочный шлюз (Bad Gateway)', message: 'Промежуточный прокси не получил корректный ответ', hint: 'Проверьте работу нижележащей службы или upstream-сервера.' },
  503: { title: 'Служба временно недоступна', message: 'Сервер перегружен или находится на обслуживании', hint: 'Попробуйте повторить операцию через некоторое время.' },
  504: { title: 'Шлюз не отвечает (Gateway Timeout)', message: 'Превышено время ожидания ответа от upstream-сервера', hint: 'Попробуйте повторить запрос позже.' }
}

const fromMap = (key, rawMsg) => ({
  code: String(key), title: ERROR_MAP[key].title, message: ERROR_MAP[key].message, hint: ERROR_MAP[key].hint, raw: rawMsg
})

const humanizeError = (err) => {
  if (!err) return null
  const rawMsg = typeof err === 'string' ? err : (err.message || String(err))
  const code = err.code || (rawMsg.match(/\b(E[A-Z]{2,20})\b/) || [])[1]
  const status = err.status || err.statusCode || (err.response && err.response.status) || (rawMsg.match(/\b([45]\d{2})\b/) || [])[1]
  const lookupKey = code || status
  if (lookupKey && ERROR_MAP[lookupKey]) return fromMap(lookupKey, rawMsg)
  if (/rate limit|too many requests/i.test(rawMsg)) return fromMap(429, rawMsg)
  if (/unauthorized|invalid token|invalid api key/i.test(rawMsg)) return fromMap(401, rawMsg)
  return { code: 'UNKNOWN', title: 'Ошибка операции', message: rawMsg, hint: 'Проверьте параметры операции и логи.', raw: rawMsg }
}


/** Версию передаёт вызывающий: в бандл её подставляет build.py из package.json,
 *  чтобы строка не устаревала руками (в 0.1.31 здесь стояло «0.1.29»). */
const makeIssueUrl = (opts = {}, version = '') => {
  const repo = 'GooDAnDReaDY/dsh-russian-lang'
  const title = opts.title || (opts.plugin
    ? `[Перевод] Запрос локализации для плагина ${opts.plugin}`
    : '[Ошибка перевода] Неточный перевод фразы')
  const bodyLines = [
    '### Описание проблемы',
    opts.description || (opts.plugin
      ? `Просьба добавить русскую локализацию для плагина \`${opts.plugin}\`.`
      : 'Обнаружена неточность в переводе интерфейса.'),
    '',
    '### Технический контекст',
    opts.ns ? `- **Namespace**: \`${opts.ns}\`` : null,
    opts.key ? `- **Ключ**: \`${opts.key}\`` : null,
    opts.en ? `- **Оригинал (EN)**: ${opts.en}` : null,
    opts.ru ? `- **Текущий перевод (RU)**: ${opts.ru}` : null,
    opts.plugin ? `- **Плагин**: \`${opts.plugin}\`` : null,
    version ? `- **Версия dsh-russian-lang**: \`${version}\`` : null,
    typeof navigator !== 'undefined' ? `- **User Agent**: \`${navigator.userAgent}\`` : null,
    '',
    '### Предлагаемый вариант перевода',
    opts.proposal || '_Опишите ваш вариант перевода..._'
  ].filter(Boolean)
  const params = new URLSearchParams()
  params.set('title', title)
  params.set('body', bodyLines.join('\n'))
  return `https://github.com/${repo}/issues/new?` + params.toString()
}

/** Словари приходят параметром — в бандле это RU, в тесте фикстура. */
const makePluginLocalizationStatus = (dicts) => (ns) => {
  const none = { status: 'none', count: 0, label: 'RU отсутствует' }
  if (!ns) return none
  const count = Object.keys((dicts && dicts[ns]) || {}).length
  return count > 0 ? { status: 'full', count, label: `RU: ${count} строк` } : none
}


const typoQuotes = (text) => text
  .replace(/"([^"\n]{1,200})"/g, '«$1»')
  .replace(/[“„]([^“”\n]{1,200})[”"]/g, '«$1»')
  .replace(/[『「]([^』」\n]{1,200})[』」]/g, '«$1»')

const typoDash = (text) => text
  .replace(/(^|[\s(\[«])--(?=\s|$)/g, '$1—')
  .replace(/(^|[\s(\[«])-(?=\s)/g, '$1—')

const typoPunct = (text) => text.replace(/\s+([,.:;!?])(?=\s|$)/g, '$1')

const TYPO_SHORT = new Set(['в', 'с', 'к', 'о', 'у', 'а', 'и', 'но', 'не', 'ни', 'на', 'по', 'до', 'из', 'за', 'от', 'об'])

const typoNbsp = (text) => text.replace(/(^|[\s(\[«])([а-яё]{1,2})(\s+)/g, (match, lead, word) => (
  TYPO_SHORT.has(word) ? lead + word + ' ' : match
))

const YO_EDGE_L = '(?<![а-яёА-ЯЁ])'
const YO_EDGE_R = '(?![а-яёА-ЯЁ])'

/** Восстанавливает регистр совпадения: «ЕЩЕ» -> «ЕЩЁ», «Еще» -> «Ещё». */
const yoCase = (src, repl) => {
  if (src === src.toUpperCase() && src !== src.toLowerCase()) return repl.toUpperCase()
  if (src[0] === src[0].toUpperCase()) return repl[0].toUpperCase() + repl.slice(1)
  return repl
}

/** pairs — [[«еще», «ещё»], ...] из build.py (ручные + корпусные, за вычетом
 *  омографов). Регистр разбирает yoCase, поэтому пара нужна одна на слово. */
const makeTypoYo = (pairs) => {
  const compiled = pairs.map((p) => [new RegExp(YO_EDGE_L + p[0] + YO_EDGE_R, 'gi'), p[1]])
  return (text) => {
    for (const [re, repl] of compiled) text = text.replace(re, (match) => yoCase(match, repl))
    return text
  }
}


const LAYOUT_LAT_TO_CYR = { ...EN_RU_KEYS, '/': '.', '`': 'ё' }

const LAYOUT_CYR_TO_LAT = (() => {
  const out = {}
  for (const k in LAYOUT_LAT_TO_CYR) out[LAYOUT_LAT_TO_CYR[k]] = k
  return out
})()

const translit = (word, map) => {
  let out = ''
  for (const ch of word.toLowerCase()) out += map[ch] !== undefined ? map[ch] : ch
  return out
}

/** freq — частотный корпус, localDict — выученные за сессию слова (#67).
 *  Оба приходят снаружи: в бандле это встроенный список и Set в памяти,
 *  в тесте — фикстуры. */
const makeLayout = (freq, localDict = new Set()) => {
  const ruWordFraction = (text) => {
    const words = text.toLowerCase().split(/[^а-яё]+/).filter(Boolean)
    if (!words.length) return 0
    return words.filter((w) => freq.has(w) || localDict.has(w)).length / words.length
  }
  const candidate = (value, direction) => {
    if (direction === 'lat2cyr') {
      const converted = translit(value, LAYOUT_LAT_TO_CYR)
      if (!/[а-яё]{2}/.test(converted)) return null
      if (ruWordFraction(converted) < 0.7) return null
      return { converted }
    }
    const converted = translit(value, LAYOUT_CYR_TO_LAT)
    return converted.startsWith('/') ? { converted } : null
  }
  const learnWords = (text) => {
    for (const w of text.toLowerCase().split(/[^а-яё]+/).filter(Boolean)) {
      if (w.length >= 3) localDict.add(w)
    }
  }
  return { ruWordFraction, candidate, learnWords, localDict }
}



const SHORT_WORDS_RE = /(^|[\s(«])([вВнНсСпПоОкКуУиИаА]|из|от|до|за|по|со|во|ко|об|на|под|над|при|про|без|для|не|ни|но)( )/g

/**
 * Живая типографика для поля ввода DSH.
 * Заменяет кавычки "" на «», дефисы -- на тире —, многоточие ... на …,
 * и добавляет неразрывные пробелы после коротких предлогов.
 * ИГНОРИРУЕТ код внутри обратных кавычек `...` и блоков ```...```.
 */
const formatInputLive = (text) => {
  if (!text || typeof text !== 'string') return text

  const parts = text.split(/(```[\s\S]*?```|`[^`\n]*`)/g)
  for (let i = 0; i < parts.length; i += 2) {
    let s = parts[i]
    if (!s) continue

    s = s.replace(/--/g, '—')

    s = s.replace(/(^|[\s([{-])"/g, '$1«')
    s = s.replace(/"/g, '»')

    s = s.replace(SHORT_WORDS_RE, '$1$2\u00A0')

    parts[i] = s
  }
  return parts.join('')
}


const RUSSIAN_SLASH_ALIASES = {
  '/цель': '/goal',
  '/справка': '/help',
  '/задача': '/task',
  '/контекст': '/context',
  '/сжать': '/compact',
  '/план': '/plan',
  '/экспорт': '/export',
  '/отзыв': '/feedback',
  '/разрешение': '/permission',
  '/разрешения': '/permission',
  '/память': '/memory',
  '/помощь': '/help',
  '/очистить': '/clear',
  '/сессия': '/session',
  '/модель': '/model'
}

/**
 * Разворачивает русский алиас слэш-команды в каноническую команду DSH.
 * Например: "/цель сделать тесты" -> "/goal сделать тесты"
 */
const expandSlashAlias = (input) => {
  if (!input || typeof input !== 'string' || !input.startsWith('/')) return input
  const match = input.match(/^(\s*\/[^\s]+)(.*)$/)
  if (!match) return input
  const [, cmd, rest] = match
  const lowerCmd = cmd.trim().toLowerCase()
  if (RUSSIAN_SLASH_ALIASES[lowerCmd]) {
    return RUSSIAN_SLASH_ALIASES[lowerCmd] + rest
  }
  return input
}


const PHONETIC_LAT_TO_CYR = [
  ['shch', 'щ'], ['yo', 'ё'], ['zh', 'ж'], ['ch', 'ч'], ['sh', 'ш'],
  ['yu', 'ю'], ['ya', 'я'], ['ts', 'ц'],
  ['a', 'а'], ['b', 'б'], ['v', 'в'], ['g', 'г'], ['d', 'д'], ['e', 'е'],
  ['z', 'з'], ['i', 'и'], ['j', 'й'], ['k', 'к'], ['l', 'л'], ['m', 'м'],
  ['n', 'н'], ['o', 'о'], ['p', 'п'], ['r', 'р'], ['s', 'с'], ['t', 'т'],
  ['u', 'у'], ['f', 'ф'], ['h', 'х'], ['c', 'ц'], ['y', 'ы'], ['x', 'кс']
]

const PHONETIC_CYR_TO_LAT = [
  ['щ', 'shch'], ['ё', 'yo'], ['ж', 'zh'], ['ч', 'ch'], ['ш', 'sh'],
  ['ю', 'yu'], ['я', 'ya'], ['ц', 'ts'],
  ['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'], ['е', 'e'],
  ['з', 'z'], ['и', 'i'], ['й', 'j'], ['к', 'k'], ['л', 'l'], ['м', 'm'],
  ['н', 'n'], ['о', 'o'], ['п', 'p'], ['р', 'r'], ['с', 's'], ['т', 't'],
  ['у', 'u'], ['ф', 'f'], ['х', 'h'], ['ы', 'y'], ['э', 'e'], ['ъ', ''], ['ь', '']
]

const phoneticTranslit = (text, direction = 'lat2cyr') => {
  if (!text || typeof text !== 'string') return text
  let res = text
  const pairs = direction === 'lat2cyr' ? PHONETIC_LAT_TO_CYR : PHONETIC_CYR_TO_LAT
  for (const [from, to] of pairs) {
    const fromUpper = from.toUpperCase()
    const fromTitle = from[0].toUpperCase() + from.slice(1)
    const toUpper = to.toUpperCase()
    const toTitle = to[0] ? to[0].toUpperCase() + to.slice(1) : ''

    if (from.length > 1) {
      res = res.replaceAll(fromUpper, toUpper)
      res = res.replaceAll(fromTitle, toTitle)
    }
    res = res.replaceAll(from, to)
    if (from.length === 1) {
      res = res.replaceAll(fromUpper, toUpper)
    }
  }
  return res
}


/**
 * Определяет преобладающий язык ввода в тексте: 'RU', 'EN' или null.
 */
const detectInputLayout = (text) => {
  if (!text || typeof text !== 'string') return null
  const clean = text.replace(/`[^`]*`/g, '').replace(/https?:\/\/\S+/g, '')
  let cyr = 0
  let lat = 0
  for (const ch of clean) {
    const code = ch.charCodeAt(0)
    if ((code >= 0x0400 && code <= 0x04FF) || code === 0x0500) cyr++
    else if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) lat++
  }
  if (cyr > lat && cyr >= 2) return 'RU'
  if (lat > cyr && lat >= 2) return 'EN'
  return null
}


const SYSTEM_PROMPT_PRESETS = {
  technical_expert: {
    id: 'technical_expert',
    label: 'Технический эксперт',
    desc: 'Строгая русская инженерная терминология, чистый код и русские комментарии',
    text: 'Отвечай пользователю на русском языке. Используй точную русскую инженерную терминологию, пиши чистый, идиоматичный код с русскими комментариями и следуй лучшим практикам разработки. Если пользователь пишет на другом языке, отвечай на его языке.'
  },
  tech_writer: {
    id: 'tech_writer',
    label: 'Технический писатель',
    desc: 'Структурированные тексты, Markdown, ГОСТ/RFC и выверенная типографика',
    text: 'Отвечай пользователю на русском языке. Оформляй документацию и пояснения в структурированном виде (Markdown, списки, таблицы), строго соблюдай правила русской типографики («кавычки-ёлочки», длинное тире, буква «ё») и требования к техническим текстам.'
  },
  concise: {
    id: 'concise',
    label: 'Лаконичный режим',
    desc: 'Краткие ёмкие ответы без лишней вводной воды и повторов',
    text: 'Отвечай пользователю на русском языке максимально кратко и ёмко. Без лишних вводных слов, повторов и пространных рассуждений. Сразу переходи к сути, коду или прямому решению задачи.'
  }
}


/**
 * Генерирует локализованный Markdown-отчёт по сессии диалога.
 */
const exportSessionToMarkdown = (session, options = {}) => {
  if (!session) return ''
  const title = session.title || session.name || 'Диалог DSH'
  const date = session.createdAt ? new Date(session.createdAt) : new Date()
  const dateStr = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'full',
    timeStyle: 'medium'
  }).format(date)

  const messages = Array.isArray(session.messages) ? session.messages : []
  let md = `# 💬 ${title}\n\n`
  md += `> **Дата экспорта:** ${dateStr}\n`
  if (session.model) md += `> **Модель:** \`${session.model}\`\n`
  if (session.workspace) md += `> **Рабочая область:** \`${session.workspace}\`\n`
  md += `> **Всего сообщений:** ${messages.length}\n\n---\n\n`

  for (let idx = 0; idx < messages.length; idx++) {
    const msg = messages[idx]
    const role = msg.role || 'unknown'
    const roleName = role === 'user' ? '👤 Пользователь' :
                     role === 'assistant' ? '🤖 Ассистент' :
                     role === 'system' ? '⚙️ Система' : `🔧 Инструмент (${role})`

    md += `### ${roleName}\n\n`
    if (msg.content) {
      md += `${msg.content}\n\n`
    }
    if (Array.isArray(msg.toolCalls) && msg.toolCalls.length) {
      md += `*Вызовы инструментов:*\n`
      for (const tc of msg.toolCalls) {
        md += `- **${tc.name || 'tool'}**: \`${JSON.stringify(tc.arguments || {})}\`\n`
      }
      md += `\n`
    }
    md += `---\n\n`
  }

  md += `*Сгенерировано с помощью [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) и @goodandready/dsh-russian-lang*\n`
  return md
}


    /** namespace -> { ключ: перевод } */
    const RU = {"approval":{"allowOnce":"Разрешить один раз","detail.aria":"Сведения о подтверждении","escalation":"Инструмент {toolName} запрашивает привилегированное выполнение","reject":"Отклонить","waiting":"Ожидание подтверждения"},"chat":{"chat.deepDiving":"Глубокий анализ…","chat.loadError":"Не удалось загрузить историю: {message} ({code})","chat.loadOlder":"Загрузить более ранние","chat.loadingHistory":"Загрузка истории…","chat.toBottom":"Вниз к началу","chat.turnNavigation.jump":"Перейти к шагу {turn}","chat.turnNavigation.jumpLoad":"Загрузить и перейти к шагу {turn}","chat.turnNavigation.label":"Навигация по шагам диалога","chat.turnNavigation.turn":"Шаг {turn}","clock.md":"{m}/{d}","clock.ymd":"{y}-{m}-{d}","command.done":"Завершено","command.failed":"Команда завершилась с ошибкой","command.running":"Выполняется…","command.title":"Команда","details.close":"Закрыть детали","details.empty":"Нет дополнительных сведений","details.input":"Входные данные","details.notInWindow":"Реплика за пределами текущего окна контекста","details.output":"Результат","details.running":"Выполняется…","details.title":"Детали выполнения","duration.compactMinutes":"{minutes}м {seconds}с","duration.compactSeconds":"{seconds}с","duration.hours":"{hours} ч {minutes} мин {seconds} с","duration.milliseconds":"{milliseconds}мс","duration.minutes":"{minutes}м {seconds}с","duration.seconds":"{seconds}с","fileOpen.folderTitle":"Открыть папку","fileOpen.folderUnknown":"Не удалось открыть эту папку","fileOpen.title":"Не удалось открыть файл","fileOpen.unknown":"Не удалось открыть этот файл","json.truncated":"… обрезано, всего {total} символов","message.branch":"Ответвить в новый диалог","message.branchUnavailable":"Доступно только для последнего сообщения завершённого шага","message.compaction":"Контекст сжат","message.compaction.commandTitle":"сжатие","message.compaction.completed":"Сжато {items} элементов истории (~{tokens} токенов)","message.compaction.expand":"Посмотреть сводку сжатия","message.compaction.running":"Сжатие контекста…","message.compaction.unavailable":"Сводка сжатия недоступна","message.context.catalog.more":"… ещё {count}","message.context.catalog.replaced":"Заменяющий каталог","message.context.instructions.added":"добавлено","message.context.instructions.loaded":"загружено","message.context.instructions.removed":"удалено","message.context.instructions.updated":"обновлено","message.context.recall.counts":"сохранено {retained} • пропущено {omitted}","message.context.recall.truncated":"обрезано","message.context.relay.from":"Из сессии {session}","message.context.snapshot.supersedes":"Заменяет более ранние снимки","message.contextInjection":"Внедрение контекста","message.contextRecall":"Вспоминание сессии","message.extraBlock":"Дополнительный блок содержимого","message.failure.auth":"Недействительный ключ API","message.maxTokens":"Достигнут лимит токенов вывода","message.maxTokens.hint":"Ответ был прерван; предыдущий вывод сохранён в диалоге. Отправьте «продолжить», чтобы модель возобновила генерацию.","message.ranFor":"Время работы: {duration}","message.referenceSeparator":", ","message.referenceSummary":"Упомянутая сессия • {labels}","message.retry.active":"Повторный запрос к модели","message.retry.cancelled":"Повтор запроса к модели отменён","message.retry.delay":"Задержка перед повтором: ","message.retry.failure":"Причина сбоя: ","message.retry.scheduled":"Ожидание повторного запроса к модели","message.retry.started":"Повторный запрос к модели выполнен","message.retry.status":"{label} ({retry}/{maximum}) • {seconds}с","message.stopped":"Остановлено","message.systemPrompt":"Системный промпт","message.systemPromptUpdate":"Обновление системного промпта","message.think":"Рассуждения","message.tokensPerSecond":"{tps} ток./с","message.turnError":"Этот шаг завершился с ошибкой","message.turnProcess.messages.one":"{count} сообщение","message.turnProcess.messages.other":"{count} сообщений","message.turnProcess.separator":" • ","message.turnProcess.subagents.one":"{count} субагент","message.turnProcess.subagents.other":"{count} субагентов","message.turnProcess.thoughtForAWhile":"Рассуждал некоторое время","message.turnProcess.toolCalls.one":"{count} вызов инструмента","message.turnProcess.toolCalls.other":"{count} вызовов инструментов","message.turnTime.duration":"Общее время выполнения","message.turnTime.speed":"Токенов в секунду (TPS)","message.turnTime.title":"Время и скорость шага","message.turnTime.ttft":"Время до первого токена (TTFT)","message.turnUsage.cacheHit":"Попадание в кэш","message.turnUsage.cacheRead":"Вход из кэша","message.turnUsage.cacheWrite":"Запись в кэш","message.turnUsage.consumed":"Использовано {total}","message.turnUsage.count":"{count} ток.","message.turnUsage.input":"Вход без кэша","message.turnUsage.model":"Провайдер / модель","message.turnUsage.output":"Вывод","message.turnUsage.reasoning":" ({tokens} рассуждения)","message.turnUsage.title":"Расход токенов на шаг","message.unknownBlock":"Неизвестный блок содержимого","message.unknownSurface":"Неизвестное событие интерфейса: {type}","number.groupSeparator":" ","row.failed":"Ошибка","row.running":"Выполняется","settings.transcript.compact":"Компактный","settings.transcript.description":"Управляет отображением процесса выполнения в завершённых шагах","settings.transcript.normal":"Обычный","settings.transcript.title":"Отображение диалога","stats.cacheHit":"Кэш {percent}%","stats.counts":"{turns} шагов • {steps} действий","stats.dialog.llmTime":"Время LLM","stats.dialog.speed":"Токенов в секунду (TPS)","stats.dialog.title":"Статистика сессии","stats.dialog.toolTime":"Время инструментов","stats.dialog.ttft":"Среднее время до первого токена (TTFT)","stats.dialog.usageTitle":"Использование токенов","stats.llm":"LLM {duration}","stats.tokens":"Вход {input} ток. • Выход {output} ток.","stats.tokensPerSecond":"{throughput} ток./с","stats.toolCall":"Инструмент {duration}","stats.ttftAverage":"TTFT ср. {duration}","view.chat":"Чат"},"command":{"cancelled":"Команда отменена","completed":"Команда завершена","description.compact":"Сжать раннюю историю диалога","description.export":"Скачать журнал сессии в формате ZIP-архива","description.feedback":"Оставить отзыв о текущей сессии","description.goal":"Установить или просмотреть цель для длительной задачи","description.permission":"Переключить пресет разрешений (режим песочницы и политики подтверждений)","description.plan":"Войти или выйти из режима планирования","executing":"Выполнение команды…","failed":"Сбой выполнения команды","label.compact":"Сжатие","label.export":"Экспорт","label.feedback":"Обратная связь","label.goal":"Цель","label.permission":"Режим доступа","label.plan":"План","listbox.aria":"Совпадения /{command}","notice.attachmentsUnsupported":"/{command} не принимает вложения; сначала удалите их","notice.imagesUnsupported":"/{command} не принимает изображения; сначала удалите их","overlay.aria":"Параметры /{command}","running":"Выполняется","search.aria":"Фильтр параметров","search.placeholder":"Поиск…","section.add":"Добавить","section.commands":"Команды","status.applying":"Применение…","status.empty":"Нет параметров","status.loading":"Загрузка параметров…","timeout":"Превышено время ожидания команды","token.compact":"сжатие","token.export":"экспорт","token.feedback":"отзыв","token.goal":"цель","token.permission":"доступ","token.plan":"план"},"common":{"back":"Назад","brand.localBuild":"Локальная сборка DSH","cancel":"Отмена","close":"Закрыть","collapse":"Свернуть","copied":"Скопировано","copy":"Копировать","copy.compactJson":"Копировать компактный JSON","copy.failed":"Не удалось скопировать","copy.json":"Копировать JSON","copy.optionsHint":"{action}; правый клик для вариантов копирования","copy.path":"Копировать путь к свойству","copy.prettyJson":"Копировать форматированный JSON","copy.value":"Копировать значение","delete":"Удалить","edit":"Изменить","expand":"Развернуть","json.collapseNode":"Свернуть узел JSON","json.expandNode":"Развернуть узел JSON","json.label":"JSON","load.failed":"Не удалось загрузить","loading":"Загрузка…","markdown.footnotes":"Сноски","markdown.truncatedCharacters":"… обрезано на {total} символах","more":"Ещё","next":"Дальше","none":"Нет","number.million":"{value}M","number.thousand":"{value}K","ok":"ОК","previous":"Назад","retry":"Повторить","save":"Сохранить","search":"Поиск","skip":"Пропустить","submit":"Отправить","submitting":"Отправка…","truncated":"Обрезано","unknown":"Неизвестно"},"conversation":{"access.confirm.acknowledge":"Я понимаю риски и хочу продолжить","access.confirm.cancel":"Отмена","access.confirm.description":"Полный доступ убирает часть подтверждений и позволяет агенту действовать напрямую, включая чувствительные операции, изменение файлов и внешние команды. Включайте, только если доверяете текущей задаче.","access.confirm.enable":"Включить полный доступ","access.confirm.title":"Включить полный доступ?","access.preset.fullAccess":"Полный доступ","access.preset.readOnly":"Только чтение","access.preset.workspaceWrite":"Запись в рабочую область","action.copy":"Копировать сообщение","action.delete":"Удалить сообщение","action.edit":"Редактировать сообщение","action.fork":"Ответвить диалог с этой реплики","action.quote":"Цитировать","action.retry":"Повторить генерацию","approval.allowOnce":"Разрешить один раз","approval.detail.aria":"Подробности запроса","approval.escalation":"Инструмент {toolName} просит повышенных прав","approval.reject":"Отклонить","approval.waiting":"Ожидание подтверждения","ask.answered":"{answered}/{total} отвечено","ask.cancelled":"отменено","ask.cancelledDetail":"Этот набор вопросов был отменён до отправки ответов.","ask.interrupted":"прервано","ask.interruptedDetail":"Этот набор вопросов был прерван до отправки ответов.","ask.rowTitle":"Вопрос","ask.skipped":"Без ответа","ask.waiting":"ожидание","attachment.dropBlocked":"В настоящий момент добавление файлов и изображений заблокировано","attachment.dropDesc":"Лимит изображений: до {count} шт., до {size} каждое","attachment.dropTitle":"Перетащите файлы или изображения сюда для добавления","attachment.pending":"Ожидающие вложения","attachment.scrollLeft":"Прокрутить вложения влево","attachment.scrollRight":"Прокрутить вложения вправо","bash.failed":"Ошибка","bash.running":"Выполняется","bash.stopped":"Остановлено","chat.loadError":"Не удалось загрузить историю: {message} ({code})","chat.loadOlder":"Загрузить раньше","chat.loadingHistory":"Загрузка истории…","chat.toBottom":"Вниз","clock.md":"{d}.{m}","clock.ymd":"{d}.{m}.{y}","command.attachmentsUnsupported":"/{command} не принимает вложения; сначала удалите их","command.done":"Готово","command.failed":"Команда не выполнена","command.imagesUnsupported":"/{command} не принимает вложения-изображения — сначала удалите их","command.running":"Выполняется…","command.title":"Команда","context.aria":"{percent} контекста занято","context.messages":"Сообщения","context.system":"Системный промпт","context.tools":"Инструменты","context.used":"контекста занято","contextWindow":"Окно контекста: {percent}%","costEstimate":"Оценочная стоимость: ${cost}","details.close":"Закрыть подробности","details.empty":"Выберите строку инструмента в переписке, чтобы увидеть подробности","details.input":"Вход","details.notInWindow":"Этот вызов вне текущего окна","details.output":"Выход","details.running":"Выполняется…","details.title":"Подробности","diff.collapseAria":"Свернуть diff","diff.expandAria":"Развернуть ещё {count} строк diff","diff.expandRest":"… ещё {count} строк","diff.files.one":"{count} файл","diff.files.other":"{count} файлов","duration.minutes":"{minutes} мин {seconds} с","duration.seconds":"{seconds} с","export.json":"Экспорт в JSON","export.markdown":"Экспорт в Markdown","export.title":"Экспорт диалога","file.attach":"Прикрепить файл","file.label":"Файл","file.notStaged":"Загрузка файла не завершена; прикрепите заново и повторите попытку","file.pending":"Ожидающие файлы","file.remove":"Удалить файл {name}","file.retry":"Повторить загрузку {name}","file.sessionUnavailable":"Сессия недоступна; загрузка файлов невозможна","file.stillUploading":"Файлы всё ещё загружаются; отправьте сообщение после завершения загрузки","file.uploadFailed":"Сбой загрузки; нажмите для повтора","file.uploading":"Загрузка…","fileOpen.folderTitle":"Не удалось открыть папку","fileOpen.folderUnknown":"Не удалось открыть эту папку","fileOpen.title":"Не удалось открыть файл","fileOpen.unknown":"Не удалось открыть этот файл","hero.chooseWorkspace":"Выбрать рабочую папку","hero.headline":"Навстречу неизвестному","hero.preview":"Предпросмотр","hint.goal":"опишите цель длительной задачи","hint.goal.active":"цель активна — изменить / пауза / продолжить / снять","image.closePreview":"Закрыть просмотр оригинала","image.dimensionTooLarge":"Стороны изображения не больше {size}px — уменьшите его и попробуйте снова","image.dropBlocked":"Сейчас картинки добавить нельзя","image.dropDesc":"До {count} изображений, каждое до {size}","image.dropTitle":"Перетащите изображения сюда","image.fileTooLarge":"Каждое изображение должно быть меньше {size}","image.label":"Изображение","image.loadFailed":"Изображение не загрузилось, нажмите для повтора","image.loading":"Загрузка изображения…","image.modelUnsupported":"Текущая модель не принимает изображения; выберите подходящую","image.openOriginal":"Открыть оригинал","image.openOriginalLabel":"{label}, нажмите, чтобы открыть оригинал","image.original":"Оригинал","image.pending":"Изображения к отправке","image.preview":"Просмотр оригинала","image.remove":"Убрать изображение {name}","image.scrollLeft":"Прокрутить изображения влево","image.scrollRight":"Прокрутить изображения вправо","image.sendFailed":"Не удалось отправить изображения ({reason}); добавьте заново и повторите","image.serviceUnavailable":"Служба загрузки изображений недоступна","image.subagentUnsupported":"Сессии субагентов пока не поддерживают изображения","image.tooMany":"В одно сообщение помещается до {count} изображений","image.tooManyPixels":"Слишком большое разрешение; сожмите изображение и повторите","image.totalTooLarge":"Изображения весят больше {size}; уберите часть и повторите","image.unsupportedType":"Поддерживаются только PNG, JPG, WebP и GIF","input.accessMode":"Режим доступа, сейчас: {name}","input.commands":"Команды","input.file":"Файл","input.send":"Отправить сообщение","input.send.queue":"Поставить в очередь","input.send.steer":"Направить сообщение","input.stop":"Остановить генерацию","json.truncated":"… обрезано, всего символов: {total}","message.branch":"Ответвить новый диалог","message.branchUnavailable":"Доступно только на последнем сообщении завершённого хода","message.compaction":"Контекст сжат","message.compaction.completed":"Сжато элементов истории: {items} (~{tokens} токенов)","message.compaction.expand":"Показать итог сжатия","message.compaction.running":"Сжатие контекста…","message.compaction.unavailable":"Итог сжатия недоступен","message.context.catalog.more":"… ещё {count}","message.context.catalog.replaced":"Каталог заменён","message.context.instructions.added":"добавлено","message.context.instructions.loaded":"загружено","message.context.instructions.removed":"удалено","message.context.instructions.updated":"обновлено","message.context.recall.counts":"{retained} оставлено · {omitted} пропущено","message.context.recall.truncated":"обрезано","message.context.relay.from":"Из сессии {session}","message.context.snapshot.supersedes":"Заменяет прежние снимки","message.contextInjection":"Инъекция контекста","message.contextRecall":"Напоминание из сессии","message.extraBlock":"Дополнительный блок","message.maxTokens":"Достигнут лимит выходных токенов","message.maxTokens.hint":"Ответ обрезан; написанное ранее сохранено в переписке. Отправьте «продолжай», чтобы модель дописала.","message.ranFor":"Заняло {duration}","message.referenceSeparator":", ","message.referenceSummary":"Упомянутая сессия · {labels}","message.retry.active":"Повтор запроса к модели","message.retry.cancelled":"Повтор запроса отменён","message.retry.delay":"Задержка перед повтором: ","message.retry.failure":"Причина сбоя: ","message.retry.scheduled":"Ожидание повтора запроса","message.retry.started":"Запрос к модели повторён","message.retry.status":"{label} ({retry}/{maximum}) · {seconds} с","message.stopped":"Остановлено","message.tokensPerSecond":"{tps} ток/с","message.ttft":"Первый токен {seconds} с","message.turnError":"Ход не удался","message.unknownBlock":"Неизвестный блок содержимого","message.unknownSurface":"Неизвестное событие: {type}","modelChanged":"Модель переключена на {model}","placeholder.default":"Напишите агенту","placeholder.hero":"Опишите, что хотите сделать","placeholder.parentOffline":"Родительская сессия офлайн: отправка недоступна, но остановить выполнение можно","placeholder.steerQueue":"Cmd/Ctrl+Enter направит все сообщения из очереди","placeholder.unavailable":"Сессия недоступна","placeholder.workspace":"Выберите рабочую папку, чтобы начать","presetApplied":"Применён пресет: {preset}","queue.cancelEdit":"Отменить правку","queue.count":"Сообщений в очереди: {n}","queue.edit":"Изменить сообщение в очереди","queue.edit.unsupported":"Содержит не только текст; правка пока не поддерживается","queue.editFailed":"Не удалось изменить: сообщение, возможно, уже отправляется.","queue.file":"Файл в очереди: {name}","queue.image":"Изображение сообщения в очереди","queue.remove":"Убрать из очереди","queue.removeFailed":"Не удалось убрать: сообщение, возможно, уже отправляется.","queue.save":"Сохранить сообщение","queue.sending":"Отправка…","queue.steer":"Направить сообщение","queue.steer.unavailable":"Направлять можно только пока агент работает","queue.steerFailed":"Не удалось направить. Попробуйте ещё раз.","read.collapseAria":"Свернуть содержимое","read.expandAria":"Развернуть ещё {count} строк","read.expandRest":"… ещё {count} строк","read.window":"Показано {shown} из {total} строк","row.failed":"Ошибка","row.input":"ВХОД","row.inspect":"Инспектировать","row.output":"ВЫХОД","row.running":"Выполняется","row.stopped":"Остановлено","sandboxActive":"Песочница: {mode}","search.collapseAria":"Свернуть результаты","search.expandAria":"Развернуть ещё {count} строк результатов","search.expandRest":"… ещё {count} строк","search.matches":"{shown} совпадений • {files} файлов","search.matches.truncated":"Показано {shown} из {total} совпадений • {files} файлов","search.noResults":"Нет результатов","search.paths":"{shown} путей","search.paths.truncated":"Показано {shown} из {total} путей","session.hierarchy":"Иерархия сессий","settings.enter.description":"Только когда агент занят; Cmd/Ctrl+Enter даёт другое поведение","settings.enter.queue":"В очередь","settings.enter.steer":"Направить","settings.enter.title":"Enter, когда агент занят","stats.cacheHit":"Попаданий в кэш {percent}%","stats.counts":"ходов: {turns} · шагов: {steps}","stats.llm":"Модель {duration}","stats.tokens":"Вход {input} ток · выход {output} ток","stats.tokensPerSecond":"{throughput} ток/с","stats.toolCall":"Инструменты {duration}","stats.ttftAverage":"Первый токен в среднем {duration}","status.generating":"Генерация ответа…","status.interrupted":"Генерация прервана пользователем","status.thinking":"Рассуждение…","status.toolRunning":"Вызов инструмента: {name}","terminal.collapseAria":"Свернуть вывод","terminal.done":"Готово","terminal.exitCode":"код возврата {code}","terminal.expandAria":"Показать оставшиеся строки вывода: {n}","terminal.expandRest":"… ещё строк: {n}","terminal.failed":"Ошибка","terminal.noOutput":"Вывода нет","terminal.running":"Выполняется","terminal.sendInput":"(отправить ввод)","terminal.session":"Терминал {sessionId}","terminal.signal":"сигнал {signal}","timeElapsed":"Затрачено времени: {time}","todo.completed":"{done}/{total} выполнено","todo.progress.active":"{active} в работе","todo.progress.done":"{done} выполнено","todo.progress.pending":"{pending} в очереди","todo.rowTitle":"Обновить список задач","todo.title":"Задачи","tokenUsage":"Токены: {used} / {limit}","tool.autoReviewNotExecuted":"Инструмент не был выполнен. Причина: {reason}","tool.autoReviewReasonFallback":"Автопроверка не разрешила это действие","tool.autoReviewRejected":"Отклонено автопроверкой","tool.title.bash":"Bash","tool.title.code":"Код","tool.title.edit":"Правка","tool.title.generic":"Вызов инструмента","tool.title.glob":"Поиск по маске (Glob)","tool.title.grep":"Поиск текста (Grep)","tool.title.inspect":"Инспектировать","tool.title.pwsh":"Pwsh","tool.title.read":"Чтение","tool.title.readImage":"Просмотр изображения","tool.title.removeCordis":"Удалить плагин Cordis","tool.title.runCordis":"Запустить плагин Cordis","tool.title.search":"Поиск","tool.title.stopCordis":"Остановить плагин Cordis","tool.title.webFetch":"Загрузка страницы","tool.title.webSearch":"Поиск в вебе","tool.title.write":"Запись","turn.details":"Сведения о реплике","turn.number":"Реплика #{n}","view.chat":"Чат","web.contentTruncated":"Содержимое обрезано","web.http":"HTTP","web.noResults":"Ничего не найдено","web.sourcesTruncated":"Список источников обрезан"},"cordis":{"a11y.defining":"Определение плагина","a11y.failed":"Определить не удалось","a11y.stopped":"Определение прервано","action.approve":"Разрешить","action.approveOnce":"Разрешить только эту версию","action.approvePlugin":"Разрешить будущие версии этого плагина","action.decline":"Отклонить","action.inspect":"Инспектировать","action.remove":"Удалить","action.retry":"Повторить","action.rollback":"Откатить","action.run":"Запустить","action.stop":"Остановить","body.clientCode":"Клиент","body.copied":"Скопировано","body.copy":"Копировать","body.hostCode":"Хост","body.output":"Результат","body.source":"Исходник плагина","panel.approvals.aria":"Подтверждения Cordis","panel.current":"Текущая: {packageId}","panel.empty":"Плагинов пока нет","panel.group.current":"Эта сессия","panel.group.others":"Другие сессии","panel.hint":"Управление запуском — в панели Cordis над настройками","panel.loading":"Чтение…","panel.next":"Следующая: {packageId}","panel.plugins.aria":"Плагины Cordis","panel.readFailed":"Не удалось прочитать список плагинов: {message}","panel.runningCount":"работает: {count}","panel.title":"Плагины Cordis","panel.trigger":"Плагин Cordis","panel.version":"Версия","purpose.missing":"(назначение не указано)","render.failedAbdicated":"Отрисовка в {slot} не удалась, вернули стандартный интерфейс:","render.failedHeld":"Отрисовка в {slot} не удалась:","row.defineTitle":"Зарегистрировать плагин Cordis","row.removeTitle":"Удалить плагин Cordis","row.runTitle":"Запустить плагин Cordis","row.stopTitle":"Остановить плагин Cordis","row.updateTitle":"Обновить плагин Cordis","run.removed":"Этого пакета больше нет","run.superseded":"Ниже есть более свежая карточка запуска","status.awaitingApproval":"Ждёт подтверждения","status.clientPending":"Клиент готов к активации","status.failed":"Запуск не удался","status.idle":"Готов","status.removed":"Удалён","status.running":"Работает","status.superseded":"Есть более свежий запуск"},"deliverables":{"presented.action":"Открыть","presented.all":"Все {count} файлов","presented.collapse":"Свернуть","presented.collapseAria":"Свернуть файлы результатов","presented.defaultApp":"Открыть в приложении по умолчанию","presented.directory":"Открыть папку с файлом","presented.directoryError":"Не удалось открыть папку с файлом. Попробуйте снова.","presented.directoryOpened":"Запрошено открытие папки с файлом","presented.directoryOpening":"Открытие папки с файлом…","presented.error":"Не удалось открыть. Нажмите для повтора.","presented.expandAria":"Показать все {count} файлов результатов","presented.explorer":"Показать в Проводнике","presented.file":"Файл","presented.finder":"Показать в Finder","presented.hostError":"Не удалось прочитать сведения о рабочем столе хоста","presented.more":"Другие действия с файлом {name}","presented.nativeUnavailable":"Для этого файла нет доступного пути на хосте. Просмотрите его на боковой панели.","presented.open":"Открыть {name} в приложении по умолчанию","presented.opened":"Открыто в приложении по умолчанию","presented.opening":"Открытие…","presented.preview":"Предпросмотр на боковой панели","presented.previewButton":"Открыть {name} на боковой панели","presented.previewCard":"Предпросмотр {name} на боковой панели","presented.retry":"Повторить","presented.revealError":"Не удалось показать в файловом менеджере. Попробуйте снова.","presented.revealed":"Запрошен показ в файловом менеджере","presented.revealing":"Отображение в файловом менеджере…","presented.unavailable":"На этом хосте нет доступного рабочего стола для открытия файлов или папок","produced.label":"Создано","produced.more":"+ {count} файлов","produced.moreOne":"+ 1 файл","produced.open":"Открыть {name}","produced.showInFolder":"Показать в папке","row.error":"Сбой создания результатов","row.inspect":"Инспектировать вызов","row.ok":"Результаты подготовлены","row.running":"Подготовка результатов","row.stopped":"Прервано","row.title":"Предоставление файлов"},"directory-browser":{"browser.cancel":"Отмена","browser.create":"Создать","browser.createIn":"Новая папка в «{name}»","browser.editPath":"Изменить путь","browser.folderName":"Имя папки","browser.home":"Домашняя папка","browser.loading":"Загрузка…","browser.newFolder":"Новая папка","browser.open":"Открыть","browser.showHidden":"Показывать скрытые файлы","browser.title":"Выбор рабочей папки","browser.truncated":"Слишком много папок; показано только начало.","browser.untitledFolder":"Без имени"},"documentHtml":{"failed":"Не удалось отобразить предпросмотр этого HTML-документа.","frame":"Предпросмотр HTML-документа","loading":"Подготовка предпросмотра HTML…","title":"HTML"},"documentMarkdown":{"code.copied":"Скопировано","code.copy":"Копировать","footnotes":"Сноски","viewer.label":"Markdown"},"feedback":{"action.dislike":"Плохой ответ","action.dislikeActive":"Убрать оценку","action.like":"Хороший ответ","action.likeActive":"Убрать оценку","category.instruction-following":"Понимание и следование инструкциям","category.other":"Другое","category.product-interaction":"Возможности продукта и взаимодействие","category.resource-cost":"Использование ресурсов и стоимость","category.security-privacy-permission":"Безопасность, конфиденциальность и разрешения","category.service-stability":"Стабильность работы сервиса","category.task-result":"Результат выполнения задачи","dialog.categories":"Категория отзыва","dialog.detail":"Подробности отзыва","dialog.hint":"Добавьте детали, чтобы помочь нам стать лучше. Ваше сообщение будет включать журнал текущей беседы.","dialog.title":"Отправить отзыв","error.conflict":"Эту оценку изменили в другом месте; показано актуальное состояние","error.generic":"Не удалось сохранить оценку","error.load":"Не удалось загрузить оценку","error.noteTooLarge":"Описание слишком длинное; сократите его и отправьте снова","note.aria":"Комментарий к оценке","note.cancel":"Отмена","note.dialog":"Отзыв","note.open":"Добавить комментарий","note.placeholder":"Что получилось хорошо, а что нет? (необязательно)","note.save":"Сохранить","toast.recorded":"Спасибо за ваш отзыв"},"goal":{"action.cancel":"Отменить правку","action.clear":"Снять цель","action.edit":"Изменить цель","action.pause":"Приостановить цель","action.resume":"Продолжить цель","action.save":"Сохранить цель","commandInput.aria":"Ввод команды","objective.aria":"Формулировка цели","phase.active":"Цель в работе","phase.active.disarmed":"Неактивная цель","phase.blocked":"Цель заблокирована","phase.paused":"Цель на паузе","title":"Цели диалога"},"job":{"count.idle.few":"{count} фоновые задачи","count.idle.many":"{count} фоновых задач","count.idle.one":"{count} фоновая задача","count.idle.other":"{count} фоновых задач","count.live.few":"{count} фоновые задачи выполняется","count.live.many":"{count} фоновых задач выполняется","count.live.one":"{count} фоновая задача выполняется","count.live.other":"{count} фоновых задач выполняется","duration.hours":"{hours} ч {minutes} мин","duration.minutes":"{minutes} мин {seconds} с","duration.seconds":"{seconds} с","duration.title.done":"Заняло {duration}","duration.title.live":"Выполняется {duration}","list.aria":"Фоновые задачи","status.completed":"завершена","status.failed":"ошибка","status.killed":"отменена","status.running":"выполняется","status.stopping":"останавливается"},"model":{"action.reload":"Обновить","blocked.composer":"Эта модель недоступна — выберите другую, чтобы продолжить","command.description":"Выбрать модель для этого диалога","command.label":"Модель","effort.providerDefault":"По умолчанию","empty.efforts":"У этой модели нет уровней рассуждения.","empty.models":"Доступных моделей нет.","error.action":"Операция с моделью не удалась: {message}","menu.aria":"Модель и уровень рассуждения","menu.effort":"Уровень рассуждений","menu.model":"Модель","option.deepseekV4Flash.description":"Быстрая, эффективная и экономичная; подходит для типовых, повседневных или параллельных задач.","option.deepseekV4Pro.description":"Улучшенное агентное написание кода, глубокие знания и сложное мышление; подходит для комплексных задач с высокими требованиями к качеству при более высокой стоимости.","option.loadError":"Каталог не загрузился: {message}","status.loading":"Обновление списка моделей…","trigger.aria":"Выбор модели, сейчас {model}","trigger.ariaEffort":"Выбор модели, сейчас {model}, уровень рассуждения {effort}","trigger.fallback":"Выбрать модель","trigger.loading":"Загрузка моделей…","trigger.selectAria":"Выбрать модель","warning.groupLoad":"{name} не загрузился: {message}"},"open-in-app":{"app.explorer":"Проводник Windows","app.filemanager":"Файлы","app.finder":"Finder","app.terminal":"Терминал","cursor":"Открыть в Cursor","custom":"Открыть в {app}","default":"Открыть в системном приложении","failed":"Не удалось открыть файл в {app}: {error}","menu.aria":"Открыть в","menu.toggle":"Выберите приложение для открытия","open.error":"Не удалось открыть","open.title":"Открыть рабочую область в {app}","open.tooltip":"Открыть локально","sublime":"Открыть в Sublime Text","title":"Открыть в приложении","vsc":"Открыть в VSCode","vscInsiders":"Открыть в VSCode Insiders","windsurf":"Открыть в Windsurf"},"permission.access":{"auto.badge":"ЭКСП","auto.confirm.acknowledge":"Я понимаю эти риски и хочу продолжить","auto.confirm.description":"Автопроверка работает без песочницы. Перед каждым вызовом нативного инструмента и внутренним вызовом PTC та же модель, что и текущий агент, проверяет, разрешить ли его. Эта функция экспериментальная, может ошибочно разрешать или блокировать действия и расходует дополнительные токены.","auto.confirm.enable":"Включить автопроверку","auto.confirm.title":"Включить автопроверку (экспериментально)?","auto.description":"Запуск без песочницы с экспериментальной проверкой каждого вызова инструментов и внутренних вызовов PTC той же моделью.","auto.label":"Автопроверка","close":"Закрыть","confirm.acknowledge":"Я понимаю риски и хочу продолжить","confirm.cancel":"Отмена","confirm.description":"Полный доступ убирает часть подтверждений и позволяет агенту действовать напрямую, включая чувствительные операции, изменение файлов и внешние команды. Включайте, только если доверяете текущей задаче.","confirm.enable":"Включить полный доступ","confirm.title":"Включить полный доступ?","mode":"Режим доступа, текущий: {name}","preset.fullAccess":"Полный доступ","preset.readOnly":"Только чтение","preset.workspaceWrite":"Запись в рабочую область"},"plan":{"chip.exitFailed":"Не удалось выйти из режима планирования","chip.label":"План","chip.off.aria":"Режим плана выключен, нажмите, чтобы включить","chip.off.title":"Режим плана выключен — нажмите, чтобы включить (/plan)","chip.on.aria":"Режим плана включён, нажмите, чтобы выключить","chip.on.title":"Режим плана включён — нажмите, чтобы выключить (/plan off)"},"question":{"action.next":"Дальше","action.skip":"Пропустить вопрос","custom.placeholder":"Впишите свой ответ","error.incomplete":"Сначала ответьте на этот вопрос.","error.unanswered":"Выберите вариант или впишите свой ответ.","nav.cancel":"Закрыть все вопросы","nav.maximize":"Развернуть карточку вопроса","nav.minimize":"Свернуть карточку вопроса","nav.next":"Следующий вопрос","nav.prev":"Предыдущий вопрос","option.recommended":"Рекомендуем","plan.approve":"Утвердить","plan.decline":"Отклонить","plan.discuss":"Обсудить","plan.header":"Проверка плана"},"reference":{"candidate.file":"Файл","candidate.folder":"Папка","candidate.noCwd":"(нет cwd)","candidate.session":"Сессия","crumb.root":"Рабочая область","section.files":"Файлы и папки","section.sessions":"Диалоги сессий","time.days":"{n} дн.","time.hours":"{n} ч","time.minutes":"{n} мин","time.months":"{n} мес.","time.now":"сейчас","time.years":"{n} г."},"schedule.catalog":{"frequency.every":"Каждые {value} {unit}","frequency.once":"Однократно","list.aria":"Активные напоминания","relative.future":"через {value} {unit}","relative.now":"Срок наступил","relative.overdue":"просрочено на {value} {unit}","status.overdue":"Просрочено","status.scheduled":"Запланировано","trigger.one":"{count} напоминание","trigger.other":"{count} напоминаний","unit.day.one":"день","unit.day.other":"дней","unit.hour.one":"час","unit.hour.other":"часов","unit.minute.one":"минуту","unit.minute.other":"минут","unit.second.one":"секунду","unit.second.other":"секунд"},"session-log-download":{"dialog.close":"Закрыть","dialog.commandFailed":"Не удалось запустить экспорт сессии.","dialog.errorTitle":"Экспорт сессии не удался","dialog.preparingDescription":"Готовится ZIP с этой сессией, её подсессиями и вложениями.","dialog.preparingTitle":"Экспорт сессии","dialog.successDescription":"Браузер загружает ZIP с сессией.","dialog.successTitle":"Загрузка сессии началась","header.action":"Журнал сессии","header.more":"Другие действия","menu.download":"Скачать журнал сессии"},"settings":{"close":"Закрыть","connection.connected":"Подключено","connection.connecting":"Подключение","connection.error":"Отключено","connection.reconnect":"Отключено, переподключиться сейчас","connection.restart":"Подключение, перезапустить сейчас","connection.retry":"Переподключиться сейчас","general.nav":"Общие","openDocument":"Открыть файл настроек","openDocument.error":"Не удалось открыть файл настроек","title":"Настройки","trigger":"Настройки"},"settings.agentPreset":{"brokenBadge":"Не загрузился","brokenNoCopy":"Пресет, который не загрузился, скопировать нельзя","builtIn":"Встроенный","builtInGroup":"Встроенные","cancel":"Отмена","close":"Закрыть","composition":"Композиция (agent.cordis.yml)","copyIntro":"Пресет копируется целиком на этой машине. Идентификатор станет именем каталога и позже не меняется; всё остальное правится в файлах самого пресета.","copyOf":"Скопирован с","copyTitle":"Скопировать пресет","create":"Создать","creating":"Создание…","creatorDraft":"Набросать свой пресет в режиме «Конструктор»","customGroup":"Свои","delete":"Удалить","deleteConfirm":"Удалить","deleteDescription":"Каталог пресета будет удалён. Уже запущенные на нём сессии продолжат работать, но выбрать его для новых нельзя.","deleteTitle":"Удалить этот пресет?","deleting":"Удаление…","description":"Действует на сессии, запущенные с этого момента. Работающие сессии остаются на своём пресете.","displayName":"Название","displayNamePlaceholder":"Показывается в списке; по умолчанию — идентификатор","duplicate":"Скопировать","duplicateUnavailable":"В этой установке нет каталога пресетов с правом записи","enablePickerToCreate":"Включите выбор режимов агента, чтобы запустить режим Creator","enablePickerToSetDefault":"Включите выбор режимов агента, чтобы задать режим по умолчанию","error":"Не удалось загрузить пресеты агента.","headerHint":"Пресет агента, на котором идёт сессия; зафиксирован при запуске","idInvalid":"Строчные буквы, цифры и дефисы, начиная с буквы или цифры.","idRequired":"Задайте пресету идентификатор.","idTaken":"Пресет с таким идентификатором уже есть.","inUse":"Используется","loading":"Загрузка пресетов…","nav":"Пресеты агента","noDescription":"Без описания.","openLocation":"Открыть папку","presetCodeDescription":"Всё, что умеет обычный режим, но инструменты отдаются через Code Mode SDK: модель собирает многошаговые операции в одну программу на TypeScript.","presetCodeName":"Режим кода","presetCordisDescription":"Для создания своих пресетов: всё из обычного режима плюс инспекция рантайма, опыты с плагинами и подсказки по авторству пресетов.","presetCordisName":"Конструктор","presetId":"Идентификатор","presetIdPlaceholder":"my-agent","presetMinimalDescription":"Агент из двух инструментов: постоянный bash и str_replace_editor.","presetMinimalName":"Минимальный режим","presetPtcDescription":"Полноценный агент разработки без инструмента рабочих процессов; остальные инструменты доступны через SDK режима PTC, что позволяет модели объединять многоэтапные операции в одну программу TypeScript.","presetPtcName":"Режим PTC","presetStandardDescription":"Полноценный кодинг-агент: правка файлов, консоль, поиск по файлам и в вебе, скиллы, планирование, цели, субагенты и воркфлоу.","presetStandardName":"Обычный режим","retry":"Повторить","revealedPathLabel":"Файлы пресета:","seatHint":"Пресет агента для сессии, которую вы собираетесь запустить","sectionIntro":"Пресет — это состав плагинов, на котором работает агент сессии: его инструменты, промпт и возможности. Скопируйте готовый и допилите под себя или попросите агента набросать свой в режиме «Конструктор».","selectionOffDefault":"По умолчанию","setDefault":"Сделать основным","showLocation":"Показать расположение","showPicker":"Разрешить выбор режимов агента","showPickerBeta":"Бета","showPickerDescription":"Если включено, для новых задач можно выбирать режимы: Стандартный, PTC, Creator, Минимальный и пользовательские. Если выключено, все новые задачи используют режим по умолчанию (по умолчанию Стандартный; настраивается). Влияет только на новые задачи.","switchRefused":"Не удалось переключиться на {name}: {reason}","title":"Пресет агента","userTrust":"Свой","view":"Посмотреть"},"settings.archivedSessions":{"empty":"Нет архивных сессий.","emptySearch":"Нет подходящих сессий.","loading":"Чтение сессий…","nav":"Архив сессий","search":"Поиск по архивным сессиям","time.days":"{n} дн","time.hours":"{n} ч","time.minutes":"{n} мин","time.months":"{n} мес","time.now":"сейчас","time.years":"{n} г","unarchive":"Разархивировать","unarchiveNamed":"Разархивировать «{title}»","unavailable":"Здесь нет архивных сессий, доступных для восстановления.","ungrouped":"Без группы"},"settings.locale":{"language.title":"Язык"},"settings.models":{"add":"Добавить провайдера","addModel":"Добавить модель","advancedHint":"Остальные поля живут в settings.yaml — правьте этот раздел напрямую.","apply":"Применить","applying":"Применение…","baseUrl":"Базовый URL","baseUrlDefault":"По умолчанию у провайдера","cancel":"Отмена","close":"Закрыть","conflict":"Пока карточка была открыта, настройки изменил кто-то ещё. Закройте и откройте заново, чтобы править актуальные значения.","contextWindow":"Окно контекста","contextWindowPlaceholder":"Как у провайдера по умолчанию","create":"Создать провайдера","creating":"Создание…","credentialConfigured":"API-ключ задан","credentialMissing":"API-ключ не задан","customAdd":"Добавить своего провайдера","customApi":"Протокол API","customApiUnset":"Не выбран","customBaseUrlInvalid":"Введите корректный URL (HTTP или HTTPS).","customBaseUrlPlaceholder":"https://gateway.example/v1","customDisplayName":"Отображаемое имя","customNeedsBaseUrl":"Своему провайдеру нужен базовый URL.","customNeedsModels":"Своему провайдеру нужна хотя бы одна модель.","customRoute":"Идентификатор провайдера","customRouteHint":"Идентификатор в нижнем регистре, начинается с буквы. По нему провайдер адресуется в запросах, и так же называется его ключ.","customRouteInvalid":"Начните со строчной буквы, дальше строчные буквы, цифры и дефисы.","customRouteTaken":"Такой идентификатор уже занят другим провайдером.","customTag":"Свой","customTitle":"Свой провайдер","customized":"Настройки изменены","deepSeekChatBaseUrl":"https://api.deepseek.com","deepSeekEndpointHint":"Используйте эндпоинт, совместимый с настроенным подключением.","deepSeekMessagesBaseUrl":"https://api.deepseek.com/anthropic","deleteConfirm":"Удалить {provider}","deleteDescription":"Удаление {provider} убирает его настройки. Ключ, которым он пользовался, хранится отдельно и останется.","deleteDescriptionWithCredential":"Удаление {provider} убирает его настройки и сохранённый API-ключ.","deleteTitle":"Удалить {provider}?","deleting":"Удаление {provider}…","edit":"Изменить","editProvider":"Изменить {provider}","fetchAdopt":"Добавить выбранные","fetchDescription":"Вот модели, доступные у этого провайдера. Отметьте те, что нужно добавить.","fetchDeselectAll":"Снять выбор","fetchEmpty":"Провайдер не вернул ни одной модели. Добавьте их вручную.","fetchModels":"Запросить список моделей","fetchNeedsBaseUrl":"Сначала укажите базовый URL, потом запрашивайте.","fetchNoMatches":"Нет подходящих моделей.","fetchSearch":"Поиск моделей","fetchSelectAll":"Выбрать все","fetchTitle":"Выберите модели","fetching":"Запрос к провайдеру…","intro":"Введите свои API-ключи, чтобы пользоваться моделями этих провайдеров.","keyBlank":"Введите API-ключ или оставьте поле пустым, чтобы сохранить прежний.","keyBlankNew":"Введите API-ключ или оставьте поле пустым, если провайдер авторизуется иначе.","keyEnvLocked":"Задан переменной окружения (только чтение)","keyIllegalCharacters":"Ключ в недопустимом формате. Проверьте его.","keyInput":"API-ключ","keyPlaceholder":"Введите API-ключ","keyPlaceholderNative":"Введите API-ключ или оставьте пустым для авторизации из окружения","keyRequired":"Чтобы продолжить, введите API-ключ.","keyStored":"Задан — введите новое значение, чтобы заменить","loadFailed":"Не удалось загрузить список провайдеров","maxTokens":"Максимум выходных токенов","maxTokensPlaceholder":"Как у провайдера по умолчанию","model":"Модель","modelAdvanced":"Ёмкости","modelCapacityInvalid":"Ёмкость задаётся числом, можно с суффиксом K или M.","modelContextInvalid":"Окно контекста — положительное число, например 131072, 256K или 1M.","modelContextWindow":"Окно контекста","modelDuplicate":"Каждый идентификатор модели встречается один раз.","modelId":"Идентификатор модели","modelIdDuplicate":"Идентификатор модели должен быть уникальным.","modelIdRequired":"Нужен идентификатор модели.","modelMaxTokens":"Максимум выходных токенов","modelMaxTokensInvalid":"Максимум выходных токенов — положительное число, например 8192, 64K или 1M.","modelName":"Отображаемое имя","modelNameInvalid":"Отображаемое имя не может быть пустым.","modelNamePlaceholder":"Пусто — возьмётся идентификатор модели","models":"Модели","modelsCustomized":"Каталог моделей изменён","modelsEmpty":"В выборе моделей не будет ничего. Неуказанные идентификаторы всё равно можно отправлять напрямую.","modelsInherited":"По умолчанию, как в адаптере","nav":"Модели","onboardingDescription":"Настройте официального провайдера DeepSeek, чтобы начать.","onboardingLater":"Настроить позже","onboardingSave":"Сохранить и продолжить","onboardingSaving":"Сохранение…","onboardingTitle":"Добавьте API-ключ, чтобы начать","provider":"Провайдер","readOnly":"В этой установке файл настроек доступен только для чтения.","remove":"Удалить","removeModel":"Удалить модель","removeProvider":"Удалить {provider}","resetModels":"Вернуть значения по умолчанию","retry":"Повторить","savedProvider":"{provider} сохранён.","settingsPathUnresolvable":"неразрешимый путь настроек","title":"Модели","welcomeBody":"DeepSeek Harness 0.1 находится на стадии тестирования для разработчиков Harness. Многие компоненты требуют дальнейшего улучшения, и мы приветствуем обратную связь от сообщества. Базовые плагины и системные API DeepSeek Harness продолжат активно развиваться в ближайшие месяцы.\n\nМы с нетерпением ждём возможности исследовать границы искусственного интеллекта вместе с разработчиками по всему миру на базе открытой, модульной и повторно используемой инфраструктуры. Приглашаем разработчиков присоединиться к экосистеме плагинов DSH.","welcomeContinue":"Продолжить","welcomeError":"Не удалось сохранить подтверждение. Попробуйте ещё раз.","welcomeTitle":"Уведомление о внутреннем тестировании"},"settings.permission":{"confirm.acknowledge":"Я понимаю риски и хочу продолжить","confirm.cancel":"Отмена","confirm.description":"Полный доступ позволяет новым сессиям реже спрашивать подтверждение и действовать напрямую, включая чувствительные операции, изменение файлов и внешние команды. Включайте, только если доверяете будущим задачам.","confirm.enable":"Включить полный доступ","confirm.title":"Включить полный доступ?","description":"Режим разрешений по умолчанию для новых сессий","loading":"Загрузка","preset.fullAccess":"Полный доступ","preset.readOnly":"Только чтение","preset.workspaceWrite":"Запись в рабочую область","title":"Разрешения","unavailable":"Недоступно"},"settings.pluginInventory":{"active":"Подключён","catalog":"Список плагинов","condition":"Отключено, когда","conditionalTag":"Условный","configuration":"Настройки","cordis":"Состояние Cordis","countUnit":"плагинов","disabledTag":"Выключен","empty":"Плагинов нет.","emptySearch":"Подходящих плагинов нет.","enabledIn":"Включено в","enabledTag":"Включён","error":"Плагины временно недоступны.","failed":"Не удалось подключить","failedCountLabel":"с ошибкой","failedTag":"Ошибка","fromPreset":"Из","globalSubtitle":"Общие для системы и каждой сессии","globalTitle":"Глобальные плагины","loading":"Чтение плагинов…","loadingPhase":"Загрузка","matchesInOtherPresets":"ещё {count} совпадений в других пресетах: ","moduleLabel":"Модуль","pending":"Ожидает зависимости","presetEnabledTag":"Включено через пресеты","presetOptionBroken":"{name} (не удалось загрузить)","presetOptionDefault":"{name} (по умолчанию)","presetProvidedDetail":"Отключено глобально; предоставляется пресетами агента для каждой сессии","presetSubtitle":"Формируются для каждой сессии пресетами агента","presetTitle":"Плагины сессии","retry":"Повторить","runtime":"Статус","search":"Поиск плагинов","switcherLabel":"Выберите пресет агента для просмотра","tab":"Список плагинов","unloading":"Выгружается","unobserved":"Не подключён","viewInPreset":"Посмотреть в группе пресетов"},"settings.plugins":{"agentLoopDescription":"Как агент раздаёт вызовы инструментов.","agentLoopMaxParallel":"Параллельных вызовов","agentLoopMaxParallelHint":"Сколько безопасных для параллели вызовов идёт одновременно в пределах шага.","agentLoopTitle":"Цикл агента","bashDescription":"Ограничения для каждой команды, которую запускает агент.","bashMaxOutputBytes":"Предел вывода на поток (байт)","bashMaxOutputBytesHint":"Всё сверх предела уходит во временный файл, а не теряется.","bashTimeoutMs":"Таймаут команды (мс)","bashTimeoutMsHint":"Сколько команда может выполняться до принудительного завершения.","bashTitle":"Консоль","collapse":"Скрыть настройки","configurableTab":"Настройки плагинов","discard":"Отменить","empty":"В этой установке настройки плагинов не выведены.","expand":"Показать настройки","intro":"Настройка и просмотр плагинов, установленных в этой сборке.","invalidNumber":"Введите число или оставьте пустым, чтобы взять значение по умолчанию.","nav":"Плагины","overridden":"Переопределено","readOnly":"В этой установке настройки доступны только для чтения.","reset":"Вернуть по умолчанию","save":"Сохранить","saveFailed":"Установка не приняла эти значения; они оставлены, чтобы вы их поправили.","saving":"Сохранение…","subagentModelSelectionAllowed":"Модели, доступные агентам","subagentModelSelectionChoose":"Если включено, агенты могут выбирать провайдера, модель и уровень рассуждений для каждого субагента из списка разрешённых моделей ниже. Применяется только к новым сессиям.","subagentModelSelectionConflict":"Настройки изменены в другом месте. Сбросьте черновик и попробуйте снова.","subagentModelSelectionDescription":"Управление моделями, которые агенты могут выбирать для субагентов.","subagentModelSelectionEmpty":"В данный момент ни один провайдер не предоставляет моделей.","subagentModelSelectionLoadFailed":"Не удалось загрузить модели.","subagentModelSelectionLoading":"Загрузка моделей…","subagentModelSelectionOff":"Субагенты используют настроенные значения по умолчанию или наследуют модель родительского агента. Сохранённые выборы моделей сохраняются.","subagentModelSelectionPartial":"Часть провайдеров моделей не удалось загрузить; сохранённые выборы остаются доступными для удаления.","subagentModelSelectionRequired":"Выберите хотя бы одну модель перед сохранением.","subagentModelSelectionRetry":"Повторить","subagentModelSelectionTitle":"Субагент","subagentModelSelectionToggle":"Разрешить агентам выбирать модели для субагентов","subagentModelSelectionUnavailable":"В данный момент недоступно","subagentModelSelectionUnavailableGroup":"Сохранены, но в данный момент недоступны","tabs":"Разделы плагинов","title":"Плагины","unsaved":"Не сохранено","webSearchApiKey":"API-ключ","webSearchApiKeyHint":"Хранится вне файла настроек. Оставьте пустым, чтобы сохранить текущий ключ.","webSearchApiKeySet":"Ключ задан.","webSearchApiKeyUnset":"Ключ не задан; без него поиск недоступен.","webSearchBaseUrl":"Адрес сервиса","webSearchBaseUrlHint":"Оставьте пустым, чтобы взять адрес провайдера по умолчанию.","webSearchDescription":"Поисковый провайдер DeepSeek.","webSearchMaxUses":"Максимум поисков на запрос","webSearchMaxUsesHint":"Сколько раз в рамках одного запроса можно искать, прежде чем придётся отвечать.","webSearchTitle":"Поиск в вебе"},"settings.theme":{"appearance.dark":"Тёмная","appearance.light":"Светлая","appearance.system":"Как в системе","appearance.title":"Оформление","fontSize.decrease":"Уменьшить размер шрифта","fontSize.description":"Влияет только на содержимое диалога","fontSize.increase":"Увеличить размер шрифта","fontSize.title":"Размер шрифта","fontSize.unit":"пкс"},"sidebar":{"panels.label":"Глобальные панели","session.new":"Новая сессия","session.new.label":"Новая сессия","toggle.collapse":"Свернуть панель","toggle.open":"Открыть панель"},"sidebarCodePreview":{"copied":"Скопировано","copy":"Копировать","title":"Код"},"sidebarDocumentPreview":{"changed":"Файл изменился, показано предыдущее содержимое.","error.notFound":"Файл не найден. Возможно, он был перемещён или удалён.","error.notRegularFile":"Не является обычным файлом, нечего отобразить.","error.notText":"Не текстовый файл, предпросмотр пока недоступен.","error.tooLarge":"Размер страницы превышает лимит {limit} и не может быть прочитан.","error.unavailable":"Сбой чтения: {message}","loadMore":"Загрузить ещё","loading":"Чтение…","openWith":"Открыть с помощью","reload":"Перечитать файл","reloadNow":"Обновить","rendererUnavailable":"Предпросмотр {name} недоступен.","resourceUnavailable":"Служба файловых ресурсов недоступна.","retry":"Повторить","unsupportedFile":"Предпросмотр для этого типа файлов пока недоступен.","viewer.text":"Простой текст","wrap.aria":"Перенос строк","wrap.disable":"Отключить перенос строк","wrap.enable":"Включить перенос строк"},"sidebarFiles":{"empty":"Файлы не найдены","entry.other":"Не является файлом или папкой и не может быть открыт.","error.notDirectory":"Указанный путь не является каталогом.","error.notFound":"Каталог больше не существует. Возможно, он был перемещён или удалён.","error.outsideWorkspace":"Каталог находится за пределами рабочей области, чтение заблокировано.","error.unavailable":"Ошибка чтения: {message}","filter.all":"Все файлы","filter.changed":"Изменённые","filter.placeholder":"Фильтр файлов…","guide.description":"Просматривайте файлы в рабочей области сессии и открывайте любой из них.","guide.title":"Файлы","loading":"Чтение…","menu.copyFullPath":"Копировать полный путь","menu.copyPath":"Копировать относительный путь","menu.delete":"Удалить","menu.openInEditor":"Открыть в редакторе","menu.rename":"Переименовать","menu.reveal":"Показать в проводнике","noWorkspace":"У этой сессии нет каталога рабочей области.","refresh":"Обновить дерево файлов","reload":"Перезагрузить","title":"Файлы рабочей области","tree.root":"Корень проекта","truncated":"Слишком много записей; показана только часть.","type.label":"Файлы"},"sidebarImage":{"failed":"Не удалось отобразить изображение.","loading":"Открытие изображения…","preview":"Предпросмотр изображения: {name}","title":"Изображение","unsupported":"Для предпросмотра изображения требуется полное содержимое файла."},"sidebarPdf":{"failed":"Не удалось отобразить PDF: {message}","loading":"Открытие PDF…","pageImage":"Страница PDF {page}","password":"Этот PDF защищён паролем; предпросмотр документов с паролем не поддерживается.","rendering":"Рендеринг страницы…","retry":"Повторить","title":"PDF","unsupported":"Для предпросмотра PDF требуется полное содержимое файла.","workerFailed":"Процесс рендеринга PDF не смог продолжить работу. Попробуйте снова."},"sidebarRight":{"chrome.collapse":"Свернуть панель","chrome.collapseAria":"Свернуть правую боковую панель","chrome.exitFullscreen":"Выйти из полноэкранного режима","chrome.expand":"Развернуть панель","chrome.expandAria":"Открыть правую боковую панель","chrome.toFullscreen":"На весь экран","dock.addTab":"Добавить вкладку","dock.closeFloat":"Закрыть плавающее окно","dock.closeTab":"Закрыть вкладку","dock.dockFloat":"Закрепить в панели","dock.drop.bottom":"Разделить по горизонтали снизу","dock.drop.center":"Переместить сюда","dock.drop.left":"Разделить по вертикали слева","dock.drop.right":"Разделить по вертикали справа","dock.drop.top":"Разделить по горизонтали сверху","dock.emptyPane":"Пустая панель","dock.float":"Открепить в окно","dock.moreTabs":"Ещё вкладки","dock.nextTab":"Следующая вкладка","dock.prevTab":"Предыдущая вкладка","dock.reopenClosed":"Открыть закрытую вкладку","dock.splitHoriz":"Разделить по горизонтали","dock.splitPane":"Разделить вправо","dock.splitPaneDisabled":"Максимум две панели","dock.splitPaneNarrow":"Недостаточно ширины для разделения; увеличьте боковую панель","dock.splitVert":"Разделить по вертикали","dock.tabMenu":"Меню вкладки","guide.body":"Файлы и артефакты из диалога открываются в этой колонке; элементы ниже открывают больше возможностей.","guide.lead":"В боковой панели отображается то, к чему вам нужен постоянный доступ.","tab.guide.title":"Начало","tab.unavailable":"Пока нет средств для отображения данного типа содержимого."},"sidebarTerminal":{"attachmentEnded":"Подключение к терминалу завершено. Переподключитесь для продолжения.","cleanupFailed":"Не удалось завершить терминал «{title}»: {message}","closed":"Терминал закрыт.","connecting":"Подключение…","control":"Перехватить управление","creating":"Запуск…","description":"Выполнение команд в рабочей области сессии","disconnected":"Отключено.","exited":"Процесс завершился с кодом {code}","failed":"Ошибка терминала: {message}","inputFull":"Буфер ввода переполнен. Переподключитесь и повторите попытку.","invalidOutput":"Не удалось получить экран терминала. Переподключитесь для восстановления.","loading":"Чтение окружения терминала…","missingTerminal":"Этот терминал больше не существует. Откройте новый терминал.","new":"Новый терминал","readonly":"Этот вид доступен только для чтения.","reconnect":"Переподключиться","recoveryFailed":"Не удалось восстановить терминал: {message}","rename":"Название терминала","retry":"Повторить","retryRecovery":"Повторить восстановление терминала","shell":"Выбрать командную оболочку","shellEmpty":"Нет доступных оболочек","shellLoading":"Загрузка оболочек…","terminalLimit":"Достигнут лимит терминалов. Закройте неиспользуемые терминалы и повторите попытку. Завершённые терминалы также учитываются в лимите.","title":"Терминал","unavailable":"Недоступно"},"sidebarTextpreview":{"changed":"Изменено","error.notFound":"Файл не найден на диске","error.notRegularFile":"Объект не является обычным файлом","error.notText":"Двоичный файл не может быть отображён как текст","error.outsideWorkspace":"Файл находится за пределами рабочей области","error.tooLarge":"Файл слишком велик; боковая панель не читает файлы более {limit}.","error.unavailable":"Ошибка чтения: {message}","loadMore":"Загрузить больше строк","loading":"Загрузка предпросмотра…","readonly":"Только чтение","reload":"Перечитать файл","reloadNow":"Перезагрузить","retry":"Повторить","title":"Предпросмотр файла","truncated":"Показаны первые {lines} строк из {total}","wrap":"Перенос строк"},"skill":{"menu.userOnly":"только вручную","row.failed":"Не удалось загрузить скилл","row.inspect":"Инспектировать","row.instructions":"Инструкции","row.running":"Загрузка скилла","row.stopped":"Загрузка скилла остановлена","row.title":"Навык"},"slash.menu":{"command":"Команды","crumbs.aria":"Навигация по папкам","drill.aria":"Открыть папку","drill.hint":"Открыть папку","drill.key":"Tab","loading":"Загрузка…","skill":"Скиллы","subagent":"Субагенты","suggestions.aria":"Подсказки по вводу"},"subagent":{"activity.inactive":"не работает","activity.running":"работает","branch.collapse":"Свернуть потомков {label}","branch.expand":"Развернуть потомков {label}","count.running.few":"{count} субагента работает","count.running.many":"{count} субагентов работает","count.running.one":"{count} субагент работает","count.running.other":"{count} субагентов работает","count.total.few":"{count} субагента","count.total.many":"{count} субагентов","count.total.one":"{count} субагент","count.total.other":"{count} субагентов","diagnostic.corrupt":"запись сессии повреждена","diagnostic.unavailable":"запись сессии временно недоступна","diagnostic.unsupported":"неподдерживаемая версия записи субагента","duration.days":"{days} дн","duration.daysHours":"{days} дн {hours} ч","duration.exactDays":"{days} дн {hours} ч {minutes} мин {seconds} с","duration.exactTitle":"Всего активного времени: {duration}","duration.hours":"{hours} ч {minutes} мин {seconds} с","duration.minutes":"{minutes} мин {seconds} с","duration.months":"~{months} мес","duration.monthsDays":"~{months} мес {days} дн","duration.seconds":"{seconds} с","duration.years":"~{years} г","duration.yearsMonths":"~{years} г {months} мес","load.error":"Не удалось загрузить субагентов","loading.aria":"Загрузка субагентов","loading.label":"Загрузка субагентов…","mode.continuable":"с продолжением","mode.oneShot":"разовый","readonly.body":"Родительская сессия офлайн; откройте её заново, чтобы продолжить переписку.","readonly.oneShot.body":"Разовые задачи не принимают продолжения; здесь можно изучить полную запись выполнения.","readonly.oneShot.title":"Запись разового субагента","readonly.title":"Пока этот субагент доступен только для чтения","retry":"Повторить","switcher.aria":"Переключить субагента: {title}","tokens.million":"{value}M","tokens.thousand":"{value}K","tokens.total":"{value} ток.","tree.aria":"Сессии субагентов"},"trajectory":{"block.label":"Блок #{index} {type}","block.openSummary":"Открыть сводку вызова инструмента блока #{index}","block.openSummaryTitle":"Открыть сводку вызова инструмента","code.copyOutput":"Скопировать вывод","code.copySource":"Скопировать код","code.originalJson":"Оригинальный JSON","code.output":"Вывод","code.running":"Выполняется…","code.source":"Код","column.input":"Входные данные","column.model":"Модель","column.output":"Вывод","column.think":"Рассуждения","column.time":"Время","column.tools":"Инструменты","details.assistantMessage":"Сообщение ассистента","details.blockType":"Тип блока","details.callId":"ID вызова","details.cancelled":"Отменено","details.close":"Закрыть сведения","details.compacted":"Сжато","details.completed":"Завершено","details.cost":"Примерная стоимость","details.duration":"Длительность","details.error":"Ошибка","details.event":"Сведения о событии","details.failed":"Сбой","details.failure.auth":"Недействительный ключ API","details.finishReason":"Причина завершения","details.hierarchy":"Иерархия","details.input":"Вход","details.inputTokens":"Входные токены","details.latency":"Задержка","details.messageId":"ID сообщения","details.model":"Модель","details.noCalls":"Нет вызовов инструментов","details.noData":"Нет данных для отображения","details.output":"Вывод","details.outputTokens":"Выходные токены","details.parameters":"Параметры","details.provider":"Провайдер","details.purpose":"Назначение","details.raw":"Исходные данные","details.reasoningTokens":"Токены рассуждений","details.request":"Запрос","details.resize":"Изменение размера панели сведений","details.resizeTitle":"Потяните для изменения размера. Двойной клик — сброс.","details.response":"Ответ","details.result":"Результат","details.retry":"Повтор","details.retryDelay":"Задержка повтора","details.running":"Выполняется","details.scheduled":"Запланировано","details.sessionId":"ID сессии","details.source":"Источник","details.status":"Статус","details.step":"Шаг #{index}","details.stepTitle":"Сведения о шаге","details.subtoolCalls":"Вложенные вызовы инструментов","details.summary":"Сводка","details.systemPrompt":"Системный промпт","details.thinking":"Ход мыслей","details.time":"Метка времени","details.title":"Детали траектории","details.tokens":"Токены","details.toolCall":"Вызов инструмента","details.toolCalls":"Вызовы инструментов","details.toolName":"Имя инструмента","details.totalTokens":"Всего токенов","details.tps":"Токенов/сек (TPS)","details.ttft":"Время до первого токена (TTFT)","details.turn":"Шаг диалога #{turn}","details.type":"Тип","details.unknown":"Неизвестно","details.userMessage":"Сообщение пользователя","details.viewJson":"Посмотреть JSON","empty.noData":"Траектория рассуждений пуста.","empty.subtitle":"Здесь появятся шаги, вызовы инструментов и метрики работы модели.","empty.title":"Нет записей траектории","export.json":"Экспорт в JSON","export.success":"Траектория экспортирована","filter.all":"Все","filter.errors":"Только ошибки","filter.model":"Модель","filter.search":"Поиск по траектории…","filter.status":"Статус","filter.tools":"Инструменты","filter.type":"Тип события","group.compaction":"Сжатие {seq}","group.message":"Сообщение","group.step":"Шаг {step}","group.turn":"Шаг диалога {turn}","header.actions":"Действия","header.blocks":"Блоки","header.duration":"Время","header.metrics":"Метрики","header.model":"Модель","header.step":"Шаг","header.title":"Траектория рассуждений","header.tokens":"Токены","header.tool":"Инструмент","history.clickToLoadEarlier":"Нажмите, чтобы загрузить более ранние шаги","history.loadEarlier":"Загрузить более ранние","history.loadingEarlier":"Загрузка более ранней истории…","history.loadingEarlierAria":"Загрузка более ранней истории","history.loadingTrajectory":"Загрузка траектории…","kind.assistant":"Ассистент","kind.compacted":"Сжатие","kind.context":"Контекст","kind.message":"Message","kind.sub":"Sub","kind.subtool":"SUBTOOL","kind.system":"Система","kind.tool":"Инструмент","kind.user":"Пользователь","layout.compacted":"Context compacted","layout.compacting":"Compacting context…","layout.compactionFailed":"Сжатие контекста failed","layout.compactionInterrupted":"Сжатие контекста was interrupted before completion.","layout.fileAttachments":"Файлы ×{count}","layout.imageOnly":"Images ×{count}","layout.initialSystemPrompt":"Initial System Prompt","layout.systemPromptAndToolsUpdated":"System Prompt and Tools Updated","layout.systemPromptUpdated":"System Prompt Updated","layout.toolCallOnly":"Вызов инструмента only","layout.toolsUpdated":"Tools Updated","legend.assistant":"Ответ ассистента","legend.call":"Вызов инструмента","legend.error":"Ошибка выполнения","legend.event":"Событие","legend.reasoning":"Рассуждения модели","legend.system":"Системное событие","legend.user":"Запрос пользователя","meta.active":"Активно","meta.calls":"{count} вызовов","meta.cancelled":"Отменено","meta.depth":"Глубина {depth}","meta.done":"Готово","meta.duration":"{duration}","meta.error":"Ошибка","meta.failed":"Сбой","meta.input":"Вход","meta.items":"{count} элементов","meta.model":"Модель","meta.output":"Выход","meta.pending":"В очереди","meta.reasoning":"Рассуждения","meta.retry":"Повтор","meta.running":"Выполняется","meta.speed":"{speed} ток./с","meta.status":"Статус","meta.step":"Шаг {step}","meta.time":"{time}","meta.tokens":"{tokens} ток.","meta.tools":"Инструменты","meta.ttft":"TTFT {ttft}","meta.turn":"Шаг {turn}","meta.type":"Тип","metrics.avgLatency":"Средняя задержка: {value}мс","metrics.avgTps":"Средний TPS: {value} ток./с","metrics.avgTtft":"Средний TTFT: {value}мс","metrics.cacheHitRate":"Попадание в кэш: {value}%","metrics.cacheTokens":"Кэшировано: {value}","metrics.inputTokens":"Вход: {value}","metrics.outputTokens":"Выход: {value}","metrics.reasoningTokens":"Рассуждения: {value}","metrics.summary":"Итого: {tokens} токенов за {duration} ({cost})","metrics.title":"Метрики шага","metrics.totalCalls":"Вызовов инструментов: {value}","metrics.totalCost":"Стоимость: {value}","metrics.totalDuration":"Общее время: {value}","metrics.totalSteps":"Всего шагов: {value}","metrics.totalTokens":"Всего токенов: {value}","nav.back":"Назад","nav.next":"Следующий шаг","nav.prev":"Предыдущий шаг","node.args":"Аргументы","node.branch":"Ветка {name}","node.call":"Вызов: {name}","node.chat":"Диалог","node.code":"Код","node.collapse":"Свернуть блок","node.compaction":"Сжатие контекста","node.decision":"Решение","node.done":"Завершено","node.duration":"{duration}мс","node.error":"Ошибка: {message}","node.escalation":"Эскалация прав","node.eval":"Оценка","node.event":"Событие","node.execution":"Выполнение","node.expand":"Развернуть блок","node.fallback":"Резервный путь","node.file":"Файл {path}","node.finish":"Финиш","node.generator":"Генерация","node.guard":"Защитный фильтр","node.hook":"Хук {name}","node.http":"HTTP {method} {url}","node.index":"Индекс","node.info":"Инфо","node.init":"Инициализация","node.injection":"Внедрение контекста","node.input":"Входные данные","node.inspect":"Инспекция","node.instruction":"Инструкция","node.intent":"Намерение","node.interrupted":"Прервано","node.iteration":"Итерация {n}","node.kernel":"Ядро","node.log":"Журнал","node.loop":"Цикл","node.mcp":"MCP {server}/{tool}","node.message":"Сообщение","node.model":"Модель {name}","node.modify":"Изменение","node.mutation":"Мутация","node.operation":"Операция {name}","node.output":"Результат","node.parser":"Парсер","node.patch":"Патч","node.plan":"План","node.plugin":"Плагин {name}","node.process":"Процесс","node.prompt":"Промпт","node.proxy":"Прокси","node.query":"Запрос","node.queue":"Очередь","node.raw":"Сырые данные","node.read":"Чтение {path}","node.reasoning":"Рассуждения","node.recall":"Вспоминание","node.reflection":"Рефлексия","node.regex":"Регулярное выражение","node.replay":"Воспроизведение","node.request":"Запрос","node.reset":"Сброс","node.resource":"Ресурс","node.response":"Ответ","node.result":"Результат","node.retry":"Повтор","node.rollback":"Откат","node.root":"Корень","node.route":"Маршрут","node.runner":"Исполнитель","node.sandbox":"Песочница","node.schema":"Схема","node.script":"Скрипт","node.search":"Поиск","node.section":"Секция","node.security":"Безопасность","node.segment":"Сегмент","node.select":"Выбор","node.session":"Сессия","node.shell":"Оболочка","node.signal":"Сигнал","node.skill":"Навык {name}","node.snapshot":"Снимок","node.spawn":"Запуск","node.start":"Старт","node.state":"Состояние","node.status":"Статус: {status}","node.step":"Шаг","node.stop":"Стоп","node.stream":"Поток","node.subagent":"Субагент {name}","node.summary":"Сводка","node.switch":"Переключение","node.sync":"Синхронизация","node.system":"Система","node.task":"Задача","node.terminal":"Терминал","node.test":"Тест","node.think":"Мысли","node.thought":"Мысли","node.time":"{time}","node.timeout":"Таймаут","node.token":"Токен","node.tokens":"{count} ток.","node.tool":"Инструмент {name}","node.trace":"Трассировка","node.transform":"Преобразование","node.trigger":"Триггер","node.turn":"Шаг","node.type":"Тип","node.unknown":"Неизвестный узел","node.update":"Обновление","node.user":"Пользователь","node.validation":"Валидация","node.variable":"Переменная","node.verification":"Верификация","node.view":"Вид","node.wait":"Ожидание","node.warning":"Предупреждение","node.watch":"Наблюдение","node.webhook":"Вебхук","node.worker":"Воркер","node.workspace":"Рабочая область","node.write":"Запись {path}","node.yield":"Возврат","options.json":"Request options JSON","options.notRecorded":"Options not recorded","record.json":"JSON","record.namedParametersJson":"{name} parameters JSON","record.noContent":"No content","record.noOutput":"No output","record.noPayload":"No payload captured","record.noResult":"No result captured","record.outputJson":"Result JSON","record.parameters":"Parameters","record.parametersJson":"parameters JSON","record.payloadJson":"Payload JSON","record.resultJson":"Result JSON","record.schemaUnavailable":"Schema unavailable","record.systemPrompt":"System Prompt","record.systemPromptMissing":"No system prompt in this request","record.thinking":"Thinking","record.toolCallOnly":"(tool call only)","record.tools":"Tools","record.toolsMissing":"No tools in this request","record.wrapLines":"Переносить строки","request.collapsedAssistant":"assistant","request.collapsedSummary":"Collapsed {kind} summary, {summary}","request.collapsedTurn":"turn","request.compaction":"Сжатие контекста · {section}","request.compactionPurpose":"Сжатие контекста","request.label":"Request #{request}","request.labelCompaction":"Request #{request} · Сжатие контекста","request.noContent":"no content","request.retryProgress":"{retry} of {maximum}","request.rowAria":"{request}{kind}, {content}","request.rowAriaCompaction":"Request {request}, compaction","request.rowPrefix":"Request {request}, ","section.betweenTurns":"Between turns","source.goal":"Goal","source.goalRound":"Goal · Round {round}","source.messageJson":"Message source JSON","source.notRecorded":"Source not recorded","source.plugin":"Plugin","source.pluginNamed":"Plugin · {plugin}","source.unknown":"Unknown","source.user":"User","status.aborted":"Прервано","status.active":"Активно","status.cancelled":"Отменено","status.completed":"Завершено","status.error":"Ошибка","status.failed":"Сбой","status.idle":"Ожидание","status.interrupted":"Прервано","status.paused":"Приостановлено","status.pending":"В очереди","status.rejected":"Отклонено","status.retry":"Повтор","status.running":"Выполняется","status.skipped":"Пропущено","status.stopped":"Остановлено","status.success":"Успешно","status.timeout":"Таймаут","status.waiting":"Ожидание","summary.steps.one":"{count} step","summary.steps.other":"{count} steps","summary.toolCalls.one":"{count} tool call","summary.toolCalls.other":"{count} tool calls","tab.diff":"Diff","tab.options":"Options","tab.payload":"Payload","tab.preview":"Preview","tab.raw":"Raw","tab.rawOutput":"Raw Output","tab.result":"Result","tab.schema":"Schema","tab.source":"Source","tab.summary":"Summary","tab.systemPrompt":"System Prompt","tab.timing":"Timing","tab.tools":"Tools","tab.usage":"Usage","timeline.aria":"Trajectory timeline","timeline.collapse":"Свернуть таймлайн","timeline.expand":"Развернуть таймлайн","timeline.noTimingData":"No timing data","timeline.now":"Текущий момент","timeline.overviewAria":"Времяline overview; drag horizontally to focus events","timeline.start":"Старт","timeline.started":"Started {time}","timeline.step":"Шаг #{step}","timeline.title":"Хронология выполнения","timeline.total":"Общее время: {duration}","timeline.ttftDecoding":"TTFT {ttft} · Decoding {decoding}","timing.duration":"Длительность","timing.durationTooShort":"Длительность too short","timing.firstTokenUnavailable":"First token unavailable","timing.generation":"Generation","timing.notAvailable":"Not available","timing.notRecorded":"Not recorded","timing.outputTokensUnavailable":"Output tokens unavailable","timing.request":"Request Timing","timing.sessionTimestamps":"Session timestamps","timing.sessionTimestampsRunning":"Session timestamps (running)","timing.showLocalTime":"Show local time","timing.showUnixTimestamp":"Show Unix timestamp","timing.source":"Timing source","timing.started":"Started","timing.stepStartUnavailable":"Шаг start unavailable","timing.throughput":"Throughput","timing.totalDuration":"Total duration","timing.ttft":"TTFT","timing.usageUnavailable":"Usage unavailable","toolbar.actualTime":"Реальное время","toolbar.aria":"Панель траектории","toolbar.calls":"Вызовы","toolbar.collapseCalls":"Свернуть вызовы","toolbar.collapseTurns":"Свернуть ходы","toolbar.duration":"Длительность","toolbar.expandCalls":"Развернуть вызовы","toolbar.expandTurns":"Развернуть ходы","toolbar.search":"Поиск по траектории","toolbar.searchPlaceholder":"Поиск","toolbar.turns":"Ходы","toolbar.useActualDuration":"По реальной длительности","toolbar.useEqualWidth":"Операции равной ширины","turn.label":"Turn {turn}","unit.milliseconds":"{value} ms","unit.seconds":"{value} s","unit.tokens":"{value} tok","unit.tokensPerSecond":"{value} tok/s","usage.cacheCreated":"Cache created","usage.cached":"Cached","usage.content":"Content","usage.input":"Input","usage.notReported":"Usage not reported","usage.other":"Other","usage.output":"Output","usage.reasoning":"Рассуждения","usage.sessionCumulative":"Session cumulative","usage.thisRequest":"This request","usage.tokens":"Токены","view.blocks":"Блоки","view.details":"Подробности","view.flow":"Поток","view.graph":"Граф","view.json":"JSON","view.metrics":"Метрики","view.raw":"Исходный вид","view.table":"Таблица","view.timeline":"Таймлайн","view.trajectory":"Траектория","view.tree":"Дерево"},"workflowRun":{"member.empty":"Пустое имя участника","member.open":"Открыть {name}","phase.empty":"Пустое имя фазы","phase.unassigned":"Вне фаз","run.empty":"Ни один участник не запущен","run.members.few":"{count} участника","run.members.many":"{count} участников","run.members.one":"{count} участник","run.members.other":"{count} участников","run.title":"{name}","status.cancelled":"Отменено","status.completed":"Завершено","status.failed":"Ошибка","status.interrupted":"Прервано","status.running":"Работает","statusCount.cancelled":"Отменено: {count}","statusCount.completed":"Завершено: {count}","statusCount.failed":"Ошибок: {count}","statusCount.interrupted":"Прервано: {count}","statusCount.running":"Работает: {count}"},"workspace":{"actions.newSession.aria":"Новая сессия в {name}","actions.session.aria":"Действия с сессией {name}","actions.workspace.aria":"Действия с рабочей папкой {name}","conflict.named":"Рабочая папка «{name}» уже есть.","date.ymd":"{d}.{m}.{y}","delete.desc":"Уберёт «{name}» из списка рабочих папок. Сама папка и журналы сессий останутся, а её сессии переедут в «Без папки».","delete.pending":"Удаление рабочей папки…","delete.workspace":"Удалить рабочую папку","empty.noMatches":"Ничего не найдено","empty.none":"Сессий пока нет","field.sessionName":"Название сессии","field.workspaceName":"Название рабочей папки","folderError.retry":"Выбрать снова","folderError.title":"Не удалось открыть папку","group.ungrouped":"Без папки","groupBy.flat":"Одним списком","groupBy.label":"Группировать","groupBy.workspace":"По рабочим папкам","hover.copied":"Скопировано","hover.created":"Создано {time}","menu.addWorkspace":"Добавить рабочую папку…","menu.archiveSession":"Убрать сессию в архив","menu.fork":"Ответвить сессию","orderBy.label":"Сортировать","orderBy.manual":"Вручную","orderBy.updated":"По изменению","picker.loading":"Загрузка рабочих папок…","rename":"Переименовать","rename.session.title":"Переименовать сессию","rename.workspace.title":"Переименовать рабочую папку","schedule.active":"Есть активная запланированная задача","search.clear":"Очистить поиск","search.hasMore":"Показаны первые {n} результатов. Уточните запрос.","search.hasMore.few":"Показаны первые {n} результата. Уточните запрос.","search.hasMore.one":"Найден один подходящий результат.","search.noMatches":"Подходящих сессий нет","search.pending":"Поиск по истории сессий…","search.placeholder":"Поиск по сессиям...","search.results.aria":"Результаты поиска","search.sessions.aria":"Поиск сессий","search.unavailable":"Поиск по содержимому временно недоступен. Показаны совпадения по названию.","section.sessions":"Сессии","section.workspaces":"Рабочие папки","session.new":"Новая сессия","sessions.collapse":"Показать меньше","sessions.count.few":"{n} сессии","sessions.count.many":"{n} сессий","sessions.count.one":"{n} сессия","sessions.count.other":"{n} сессий","sessions.expand":"Показать ещё {n}","status.completed":"Завершено","status.idle":"Простаивает","status.planReview":"План ждёт проверки","status.running":"Работает","status.subagentsRunning.few":"{n} субагента работает","status.subagentsRunning.many":"{n} субагентов работает","status.subagentsRunning.one":"{n} субагент работает","status.subagentsRunning.other":"{n} субагентов работает","status.waitingAnswer":"Ждёт ответа","status.waitingApproval":"Ждёт подтверждения","time.ago":"{t} назад","time.days":"{n} дн","time.hours":"{n} ч","time.minutes":"{n} мин","time.months":"{n} мес","time.now":"только что","time.years":"{n} г","viewOptions.label":"Параметры отображения","workspace.add":"Добавить рабочую папку"}}

    /** zh-строка -> ru-строка для DOM-перевода панелей вне locale-ядра. */
    const ZH_RU = {}

    RU['russian-lang'] = {"cardTitle": "Русская локализация", "cardSub": "Язык интерфейса, типографика, раскладка", "badgeRu": "🟢 RU активен", "badgeEn": "⚪ EN активен", "badgeCoverage": "🟢 100% (7,902 ключа)", "badgeSmartUx": "⚡ Smart UX активен", "secLanguage": "🌐 Язык интерфейса", "secLanguageDesc": "Нативное переключение языка интерфейса DSH на русский без перезагрузки страницы.", "enabled": "Русский язык включён", "enabledDesc": "Переключает язык интерфейса DeepSeek Harness на русский.", "quickSwitchNote": "Быстрый переключатель RU ⇄ EN доступен в шапке сессии рядом с кнопками диалога.", "secTypography": "✍️ Умная типографика и ввод (Smart UX)", "secTypographyDesc": "Автоматическое улучшение текстов по нормам русской типографики во время диалога и набора.", "typography": "Типографика вывода", "typographyDesc": "Исправляет типографику ответов модели: кавычки-«ёлочки», тире («—») вместо дефисов, неразрывные пробелы после предлогов.", "yo": "Буква «ё»", "yoDesc": "Восстанавливать «ё» в частых словах (ещё, чёрный, идёт и др.), написанных через «е». Неоднозначные слова (все/всё) не трогаются.", "liveInput": "Живая типографика инпута", "liveInputDesc": "Автоматически заменять \"\" на «» и -- на — прямо во время набора промпта (код в бэктиках игнорируется).", "slashAliases": "Русские алиасы команд", "slashAliasesDesc": "Поддержка русских команд: /цель -> /goal, /сжать -> /compact, /план -> /plan, /справка -> /help, /память -> /memory.", "altLHintText": "Мгновенная конвертация раскладки текущего поля (ghbdtn ⇄ привет, /vjltkm ⇄ /model). В углу поля ввода также отображается метка раскладки.", "secAgentPrompt": "🤖 Системный промпт агента", "secAgentPromptDesc": "Официальная секция расширения DSH systemPrompt для ведения диалога на русском языке.", "agentPrompt": "Русский промпт агента", "agentPromptDesc": "Добавляет в системный промпт инструкцию отвечать по-русски в выбранном стиле.", "agentPromptPreset": "Стиль ответов агента", "presetExpert": "Технический эксперт (строгая терминология, чистый код)", "presetWriter": "Технический писатель (Markdown, таблицы, ГОСТ)", "presetConcise": "Лаконичный режим (кратко, без лишней воды)", "secUpdater": "🔄 Обновление языкового пакета", "secUpdaterDesc": "Проверка наличия новых релизов в реестре npm и обновление в один клик.", "updaterCurrent": "Текущая версия: v{version}", "updaterLatest": "Доступна новая версия: v{version}", "updaterUpToDate": "Установлена актуальная версия", "updaterChecking": "Проверка…", "updaterCheckBtn": "Проверить обновления", "updaterBtn": "Обновить до v{version} в 1 клик", "updaterUpdating": "Установка обновления…", "updaterSuccess": "✅ Плагин успешно обновлён! Перезапустите DSH для применения.", "updaterFailed": "❌ Не удалось проверить/обновить плагин. Проверьте сеть или логи сервера.", "badgeUpdateAvailable": "Доступно обновление", "badgeUpToDate": "Актуальная версия", "secSupport": "📊 Покрытие экосистемы и поддержка", "secSupportDesc": "Словари синхронизированы с DSH v0.1.6-alpha.1. 100.0% UI-покрытие ядра и всех установленных плагинов (7,902 ключа) без черновых машинных переводов.", "statNamespaces": "Пространств имён", "statCoreKeys": "Ключей ядра", "statPluginKeys": "Ключей плагинов", "overridesCount": "Своих переопределений", "statusLoading": "Настройки загружаются…", "statusUnavailable": "Настройки недоступны на этом хосте", "translateTurn": "Перевести на русский", "reportIssue": "Сообщить о неточности перевода", "exportMdHint": "Экспорт диалога в Markdown доступен по кнопке [ 📥 MD ] в шапке сессии.", "translateTurnHint": "Перевод ответов ассистента на русский доступен по кнопке [ RU ↗ ] на блоках сообщений."}

    const SETTINGS_NS_NAME = 'russian-lang'

    function apply(ctx) {
      const runtime = ctx.locale
      const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS_NAME })

      for (const ns of Object.keys(RU)) {
        ctx.effect(() => {
          try { return ctx.locale.register(ns, 'ru', RU[ns]) }
          catch (err) { return () => {} }
        }, 'dsh-russian-lang: ' + ns)
      }

      if (typeof fetch === 'function') {
        fetch('/api/dsh-russian-lang/dict/all', { headers: { 'Accept': 'application/json' } })
          .then((res) => res.ok ? res.json() : null)
          .then((data) => {
            if (!data) return
            const pluginDicts = data.plugins || data
            if (data.zhRu && typeof ZH_RU === 'object') {
              Object.assign(ZH_RU, data.zhRu)
              if (typeof updateZhRu === 'function') updateZhRu(data.zhRu)
            }
            for (const ns of Object.keys(pluginDicts)) {
              if (ns === 'zhRu' || ns === 'plugins' || RU[ns]) continue
              RU[ns] = pluginDicts[ns]
              ctx.effect(() => {
                try { return ctx.locale.register(ns, 'ru', pluginDicts[ns]) }
                catch (err) { return () => {} }
              }, 'dsh-russian-lang: ' + ns)
            }
          })
          .catch(() => {})
      }

      const origTranslate = runtime.translate.bind(runtime)
      const getOverrides = () => {
        try {
          const value = scope.getSnapshot().value
          return value && value.overrides ? value.overrides : {}
        } catch (err) { return {} }
      }
      const getPluginLocalizationStatus = makePluginLocalizationStatus(RU)
      try {
        runtime.formatNumber = formatNumber
        runtime.formatRelativeTime = formatRelativeTime
        runtime.formatCurrency = formatCurrency
        runtime.inflect = inflect
        runtime.getPluginLocalizationStatus = getPluginLocalizationStatus
        runtime.stemRussian = stemRussian
        runtime.fuzzyMatchRu = fuzzyMatchRu
        runtime.humanizeError = humanizeError
      } catch (err) { /* ignore */ }
      const lookupChain = () => {
        try {
          const chain = runtime.fallbackChain && runtime.fallbackChain(runtime.getLocale().active)
          if (Array.isArray(chain) && chain.length) return chain
        } catch (err) { /* ignore */ }
        return [runtime.getLocale().active]
      }
      const lookup = (ns, key) => {
        const chain = lookupChain()
        return runtime.lookup.length >= 3 ? runtime.lookup(ns, key, chain) : runtime.lookup(ns, key)
      }
      runtime.translate = function (ns, key, params) {
        const overrides = getOverrides()
        if (overrides[key] !== undefined) {
          return params ? fill(overrides[key], params) : overrides[key]
        }
        if (runtime.getLocale().active === 'ru' && params) {
          const n = params.n ?? params.count
          if (typeof n === 'number') {
            const form = pluralForm(n)
            const m = /^(.*)[.](one|other)$/.exec(key)
            if (m) {
              if (form === 'few' || form === 'many') {
                const pluralKey = m[1] + '.' + form
                const template = lookup(ns, pluralKey) ?? lookup('common', pluralKey)
                if (template !== undefined) {
                  return fill(template, params)
                }
              }
            } else if (form !== 'other' && !/[.](one|other|few|many)$/.test(key)) {
              const pluralKey = key + '.' + form
              const template = lookup(ns, pluralKey) ?? lookup('common', pluralKey)
              if (template !== undefined) {
                return fill(template, params)
              }
            }
          }
        }
        return origTranslate(ns, key, params)
      }

      const syncLang = () => {
        try {
          if (typeof document !== 'undefined' && document.documentElement
              && runtime.getLocale().active === 'ru') {
            document.documentElement.lang = 'ru-RU'
          }
        } catch (err) { /* ignore */ }
      }

      const native = runtime.getLocale().locales.some((l) => l.id === 'ru')

      if (!native) {
        runtime.addLanguage({ id: 'ru', label: 'Русский', fallback: 'en' })
        syncLang()

      }

      const syncFlag = () => {
        try {
          const wantRu = runtime.getLocale().active === 'ru'
          const value = scope.getSnapshot().value || {}
          if (!!value.enabled !== wantRu) {
            const r = scope.set('enabled', wantRu)
            if (r && typeof r.catch === 'function') {
              r.catch((err) => {
                console.warn('dsh-russian-lang: scope.set enabled failed', err && err.message || err)
              })
            }
          }
        } catch (err) {
          /* snapshot ещё не готов, либо scope.set синхронно бросил */
        }
      }
      ctx.effect(() => {
        try { return runtime.subscribe(syncFlag) }
        catch (err) { return undefined }
      }, 'dsh-russian-lang: sync-flag')

      const activate = () => {
        try {
          if (runtime.getLocale().active === 'ru') return
          runtime.setLocale('ru')
        } catch (err) { console.warn('dsh-russian-lang: activate failed', err) }
      }
      let booted = false
      const tryBoot = () => {
        if (booted) return
        try {
          const value = scope.getSnapshot().value
          if (value && value.enabled === true) { booted = true; activate() }
        } catch (err) { /* ignore */ }
      }
      ctx.effect(() => scope.subscribe(tryBoot), 'dsh-russian-lang: boot')
      tryBoot()

      const unsubscribeLang = runtime.subscribe(syncLang)
      ctx.effect(() => unsubscribeLang, 'dsh-russian-lang: html-lang')
      syncLang()

      const SPELL_ON = 'data-russian-lang-spell-on'
      const SPELL_WAS = 'data-russian-lang-spell-was'
      const LANG_WAS = 'data-russian-lang-lang-was'
      const EDITABLE = 'textarea, input[type=text], input[type=search], [contenteditable=""], [contenteditable="true"]'
      const MONO_RE = /mono|consol|courier/i
      const isMonoField = (el) => {
        try { return MONO_RE.test(getComputedStyle(el).fontFamily || '') }
        catch (err) { return false }
      }
      const spellOn = (el) => {
        if (el.hasAttribute(SPELL_ON) || isMonoField(el)) return
        el.setAttribute(SPELL_ON, '1')
        el.setAttribute(SPELL_WAS, el.getAttribute('spellcheck') ?? '')
        el.setAttribute(LANG_WAS, el.getAttribute('lang') ?? '')
        el.setAttribute('spellcheck', 'true')
        el.setAttribute('lang', 'ru-RU')
      }
      const spellOff = (el) => {
        if (!el.hasAttribute(SPELL_ON)) return
        const was = el.getAttribute(SPELL_WAS)
        if (was === '') el.removeAttribute('spellcheck')
        else el.setAttribute('spellcheck', was)
        const lang = el.getAttribute(LANG_WAS)
        if (lang === '') el.removeAttribute('lang')
        else el.setAttribute('lang', lang)
        el.removeAttribute(SPELL_ON)
        el.removeAttribute(SPELL_WAS)
        el.removeAttribute(LANG_WAS)
      }
      let spellObserver = null
      const syncSpell = () => {
        try {
          if (typeof document === 'undefined') return
          const ru = runtime.getLocale().active === 'ru'
          if (!ru) {
            if (spellObserver) { spellObserver.disconnect(); spellObserver = null }
            document.querySelectorAll('[' + SPELL_ON + ']').forEach(spellOff)
            return
          }
          document.querySelectorAll(EDITABLE).forEach(spellOn)
          if (spellObserver) return
          spellObserver = new MutationObserver((records) => {
            for (const record of records) {
              for (const node of record.addedNodes) {
                if (node.nodeType !== 1) continue
                if (node.matches(EDITABLE)) spellOn(node)
                node.querySelectorAll ? node.querySelectorAll(EDITABLE).forEach(spellOn) : null
              }
            }
          })
          spellObserver.observe(document.body, { childList: true, subtree: true })
        } catch (err) { /* ignore */ }
      }
      const unsubscribeSpell = runtime.subscribe(syncSpell)
      ctx.effect(() => {
        return () => {
          unsubscribeSpell()
          if (spellObserver) spellObserver.disconnect()
          try { document.querySelectorAll('[' + SPELL_ON + ']').forEach(spellOff) } catch (err) { /* ignore */ }
        }
      }, 'dsh-russian-lang: spellcheck')
      syncSpell()

      const ZH_CJK = /[\u3400-\u9fff\uf900-\ufaff]/
      const ZH_RE_ESC = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const ZH_EXACT = new Map()
      const ZH_PATTERNS = []

      const CORE_ZH_PRESETS = {
        '请求批准': 'Запрашивать подтверждение',
        '完全放开': 'Полный доступ',
        '只读': 'Только чтение',
        '只能读，任何写入都需要审批。': 'Только чтение, любая запись требует подтверждения.',
        '工作区内可写；工作区外的操作请求人工审批。': 'Запись в рабочей области разрешена; операции вне рабочей области требуют подтверждения.',
        '全放行，不弹审批。': 'Полный доступ, запросы на подтверждение не выводятся.',
        '确定性规则 + 两阶段分类器自动决定；危险或故障时 fail-closed。': 'Детерминированные правила + двухэтапный классификатор; при рисках — безопасная блокировка.'
      }
      for (const [k, v] of Object.entries(CORE_ZH_PRESETS)) ZH_EXACT.set(k, v)

      const updateZhRu = (entries) => {
        if (!entries || typeof entries !== 'object') return
        for (const [zhText, ruText] of Object.entries(entries)) {
          if (typeof zhText !== 'string' || !ZH_CJK.test(zhText) || !ruText) continue
          if (/\{[a-zA-Z_]\w*\}/.test(zhText)) {
            const parts = zhText.split(/\{[a-zA-Z_]\w*\}/g)
            if (parts.some((p) => p.length === 0)) continue
            ZH_PATTERNS.push({ re: new RegExp(parts.map(ZH_RE_ESC).join('([\\s\\S]*?)')), ruParts: ruText.split(/\{[a-zA-Z_]\w*\}/g) })
          } else {
            ZH_EXACT.set(zhText, ruText)
          }
        }
        ZH_PATTERNS.sort((a, b) => b.re.source.length - a.re.source.length)
      }
      updateZhRu(ZH_RU)
      const zhTranslateText = (text) => {
        if (!ZH_CJK.test(text)) return null
        const exact = ZH_EXACT.get(text)
        if (exact !== undefined) return exact
        for (const p of ZH_PATTERNS) {
          const m = p.re.exec(text)
          if (m && m[0] === text) {
            let out = p.ruParts[0]
            for (let i = 1; i < p.ruParts.length; i++) out += m[i] + p.ruParts[i]
            return out
          }
        }
        return null
      }
      const DOM_EN_ATTRS = {
        'Streaming preview': 'Предпросмотр стриминга',
        'Visualization streaming preview': 'Предпросмотр визуализации'
      }
      const DOM_EN_TEXT = {
        'Low': 'Низкий',
        'Medium': 'Средний',
        'High': 'Высокий',
        'Effort': 'Рассуждения',
        'Search engine (ModSearch)': 'Поисковая система (ModSearch)',
        'Search engine provider configuration.': 'Настройка провайдера поисковой системы.',
        'X search only': 'Только поиск в X',
        'Auto mode': 'Автоматический режим',
        'Full access': 'Полный доступ',
        'Read only': 'Только чтение'
      }
      const ZH_WALKER = (root) => {
        try {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
          const hits = []
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (node.nodeValue && node.nodeValue.length >= 2 && ZH_CJK.test(node.nodeValue)) {
              hits.push(node)
            } else if (node.nodeValue) {
              const trimmed = node.nodeValue.trim()
              if (DOM_EN_TEXT[trimmed]) {
                const p = node.parentElement
                if (p && (p.closest('[class*="effort"], [class*="slider"], [class*="reasoning"], [class*="selector"], [class*="Menu"], [class*="menu"], [role="menu"]') || p.getAttribute('role') === 'option' || p.getAttribute('role') === 'menuitem')) {
                  node.nodeValue = node.nodeValue.replace(trimmed, DOM_EN_TEXT[trimmed])
                }
              }
            }
          }
          for (const node of hits) {
            const next = zhTranslateText(node.nodeValue)
            if (next) node.nodeValue = next
          }
          for (const el of root.querySelectorAll ? root.querySelectorAll('[title],[placeholder],[aria-label]') : []) {
            for (const attr of ['title', 'placeholder', 'aria-label']) {
              const v = el.getAttribute && el.getAttribute(attr)
              if (v) {
                if (DOM_EN_ATTRS[v]) {
                  el.setAttribute(attr, DOM_EN_ATTRS[v])
                } else if (v.length >= 2 && ZH_CJK.test(v)) {
                  const next = zhTranslateText(v)
                  if (next) el.setAttribute(attr, next)
                }
              }
            }
          }
          if (root.getAttribute) {
            for (const attr of ['title', 'placeholder', 'aria-label']) {
              const v = root.getAttribute(attr)
              if (v && DOM_EN_ATTRS[v]) root.setAttribute(attr, DOM_EN_ATTRS[v])
            }
          }
        } catch (err) { /* ignore */ }
      }
      let zhObserver = null
      const syncZhDom = () => {
        try {
          if (typeof document === 'undefined') return
          const ru = runtime.getLocale().active === 'ru'
          if (!ru) {
            if (zhObserver) { zhObserver.disconnect(); zhObserver = null }
            return
          }
          if (!zhObserver) {
            zhObserver = new MutationObserver(() => {
              queueMicrotask(() => { try { ZH_WALKER(document.body) } catch (err) { /* ignore */ } })
            })
            zhObserver.observe(document.body, { childList: true, subtree: true, characterData: true })
          }
          ZH_WALKER(document.body)
        } catch (err) { /* ignore */ }
      }
      const unsubscribeZh = runtime.subscribe(syncZhDom)
      ctx.effect(() => {
        return () => {
          unsubscribeZh()
          if (zhObserver) zhObserver.disconnect()
        }
      }, 'dsh-russian-lang: zh-dom')
      syncZhDom()

      const TYPO_YO_PAIRS = [["еще", "ещё"], ["ее", "её"], ["черный", "чёрный"], ["черная", "чёрная"], ["черные", "чёрные"], ["зеленый", "зелёный"], ["желтый", "жёлтый"], ["легкий", "лёгкий"], ["тяжелый", "тяжёлый"], ["надежный", "надёжный"], ["дешевый", "дешёвый"], ["идет", "идёт"], ["дает", "даёт"], ["ведет", "ведёт"], ["несет", "несёт"], ["живет", "живёт"], ["привел", "привёл"], ["шел", "шёл"], ["нее", "неё"], ["мое", "моё"], ["серьезно", "серьёзно"], ["придется", "придётся"], ["насчет", "насчёт"], ["твое", "твоё"], ["свое", "своё"], ["пойдем", "пойдём"], ["пришел", "пришёл"], ["нашел", "нашёл"], ["идем", "идём"], ["вперед", "вперёд"], ["пошел", "пошёл"], ["ребенка", "ребёнка"], ["ребенок", "ребёнок"], ["счет", "счёт"], ["своем", "своём"], ["придет", "придёт"], ["ушел", "ушёл"], ["ждет", "ждёт"], ["мертв", "мёртв"], ["твоем", "твоём"], ["вернется", "вернётся"], ["днем", "днём"], ["найдем", "найдём"], ["пойдет", "пойдёт"], ["начнем", "начнём"], ["вернемся", "вернёмся"], ["остается", "остаётся"], ["принес", "принёс"], ["идешь", "идёшь"], ["трех", "трёх"], ["ребенком", "ребёнком"], ["самолет", "самолёт"], ["определенно", "определённо"], ["пойдешь", "пойдёшь"], ["умрет", "умрёт"], ["прием", "приём"], ["прошел", "прошёл"], ["убьет", "убьёт"], ["тетя", "тётя"], ["провел", "провёл"], ["произойдет", "произойдёт"], ["семьей", "семьёй"], ["пойдемте", "пойдёмте"], ["пройдет", "пройдёт"], ["возьмем", "возьмём"], ["вернешься", "вернёшься"], ["найдешь", "найдёшь"], ["живешь", "живёшь"], ["отчет", "отчёт"], ["займет", "займёт"], ["ждем", "ждём"], ["сошел", "сошёл"], ["вдвоем", "вдвоём"], ["найдет", "найдёт"], ["вел", "вёл"], ["живем", "живём"], ["зашел", "зашёл"], ["начнется", "начнётся"], ["путем", "путём"], ["подойдет", "подойдёт"], ["режиссер", "режиссёр"], ["уйдет", "уйдёт"], ["придешь", "придёшь"], ["идемте", "идёмте"], ["ведешь", "ведёшь"], ["пес", "пёс"], ["умрешь", "умрёшь"], ["ждешь", "ждёшь"], ["найдете", "найдёте"], ["найдется", "найдётся"], ["клево", "клёво"], ["поймешь", "поймёшь"], ["разберемся", "разберёмся"], ["времен", "времён"], ["введен", "введён"], ["включен", "включён"], ["включенных", "включённых"], ["возьмется", "возьмётся"], ["завершен", "завершён"], ["завершенного", "завершённого"], ["задает", "задаёт"], ["задается", "задаётся"], ["заменен", "заменён"], ["звезд", "звёзд"], ["звезды", "звёзды"], ["изменен", "изменён"], ["истек", "истёк"], ["незавершенная", "незавершённая"], ["неподтвержденные", "неподтверждённые"], ["несохраненные", "несохранённые"], ["обновлен", "обновлён"], ["обновленные", "обновлённые"], ["определен", "определён"], ["отклонен", "отклонён"], ["отменен", "отменён"], ["очередность", "очерёдность"], ["поврежден", "повреждён"], ["повторен", "повторён"], ["подключен", "подключён"], ["подтвержденные", "подтверждённые"], ["приемки", "приёмки"], ["раздает", "раздаёт"], ["разрешенная", "разрешённая"], ["разрешенные", "разрешённые"], ["создаем", "создаём"], ["сойдется", "сойдётся"], ["сохранен", "сохранён"], ["сохраненный", "сохранённый"], ["счету", "счёту"], ["тяжелые", "тяжёлые"], ["темная", "тёмная"], ["уберет", "уберёт"], ["удален", "удалён"], ["учетные", "учётные"], ["учетных", "учётных"], ["емкости", "ёмкости"], ["емкость", "ёмкость"]]
      const typoYo = makeTypoYo(TYPO_YO_PAIRS)
      const getTypoConf = () => {
        try {
          const t = scope.getSnapshot().value && scope.getSnapshot().value.typography
          if (!t || t.enabled === false) return null
          return { yo: t.yo === true }
        } catch (err) { return null }
      }
      const typoNode = (node, conf) => {
        const before = node.nodeValue
        if (!before || !before.match || (before.match(/[\u0400-\u04FF]/g) || []).length < 3) return
        
        if (node.parentElement && node.parentElement.closest('code, pre, a, script, style, textarea, input, select, button, kbd, samp, [contenteditable="true"], [data-composer-input], [role="textbox"]')) return
        if (node.parentElement && node.parentElement.closest('.katex, [data-latex], math')) return
        if (/\$[^$\n]+\$/.test(before)) return

        if (node.parentElement && node.parentElement.closest('[data-chat-flow-status="running"], [data-turn-running], [data-turn-tail], [data-streaming="true"], .dsw-turn-running, [class*="streaming"], [class*="Streaming"]')) {
          return
        }

        const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          try {
            const range = sel.getRangeAt(0)
            if (range.intersectsNode ? range.intersectsNode(node) : (sel.containsNode && sel.containsNode(node, true))) {
              return
            }
          } catch (e) {}
        }

        let after = typoQuotes(before)
        after = typoDash(after)
        after = typoPunct(after)
        after = typoNbsp(after)
        if (conf.yo) after = typoYo(after)
        if (after !== before) node.nodeValue = after
      }
      const typoWalk = (root, conf) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
        for (let node = walker.nextNode(); node; node = walker.nextNode()) typoNode(node, conf)
      }
      let typoObserver = null
      let typoQueued = null
      const flushTypo = () => {
        typoQueued = null
        try {
          const conf = getTypoConf()
          if (!conf || !typoPending.size) return
          for (const root of typoPending) {
            if (root.nodeType === 3) typoNode(root, conf)
            else typoWalk(root, conf)
          }
          typoPending.clear()
        } catch (err) { /* ignore */ }
      }
      const typoPending = new Set()
      const queueTypo = (roots) => {
        for (const r of roots) typoPending.add(r)
        if (!typoQueued) typoQueued = requestAnimationFrame(flushTypo)
      }
      const syncTypo = () => {
        try {
          if (typeof document === 'undefined') return
          if (runtime.getLocale().active !== 'ru' || !getTypoConf()) {
            if (typoObserver) { typoObserver.disconnect(); typoObserver = null }
            return
          }
          if (typoObserver) return
          typoWalk(document.body, getTypoConf())
          typoObserver = new MutationObserver((records) => {
            const roots = []
            for (const record of records) {
              if (record.type === 'childList') {
                for (const added of record.addedNodes) {
                  if (added.nodeType === 3 || added.nodeType === 1) roots.push(added)
                }
              }
            }
            if (roots.length > 0) queueTypo(roots)
          })
          typoObserver.observe(document.body, { childList: true, subtree: true })
        } catch (err) { /* ignore */ }
      }
      const unsubscribeTypo = runtime.subscribe(syncTypo)
      ctx.effect(() => {
        return () => {
          unsubscribeTypo()
          if (typoObserver) typoObserver.disconnect()
        }
      }, 'dsh-russian-lang: typography')
      syncTypo()

      const layout = makeLayout(new Set(["не", "что", "ты", "это", "на", "он", "мы", "как", "вы", "да", "мне", "нет", "меня", "так", "но", "его", "все", "она", "тебя", "если", "за", "бы", "тебе", "они", "чтобы", "же", "есть", "просто", "из", "для", "ну", "когда", "хорошо", "здесь", "по", "был", "знаю", "то", "только", "всё", "было", "вас", "может", "нас", "вот", "от", "быть", "кто", "будет", "почему", "вам", "их", "очень", "могу", "уже", "спасибо", "или", "нам", "еще", "там", "нужно", "сейчас", "где", "чем", "хочу", "ничего", "этого", "была", "мой", "ее", "ладно", "знаешь", "до", "этом", "потому", "теперь", "думаю", "больше", "её", "со", "раз", "ему", "надо", "время", "этот", "ли", "ещё", "пока", "даже", "привет", "сказал", "себя", "должен", "тоже", "хочешь", "давай", "никогда", "эй", "того", "тогда", "него", "ни", "тут", "были", "конечно", "правда", "об", "моя", "пожалуйста", "тобой", "сказать", "сегодня", "один", "лучше", "можешь", "сюда", "мной", "значит", "сделать", "всегда", "дело", "можно", "ей", "должны", "порядке", "без", "день", "том", "буду", "делать", "хотел", "чего", "эти", "много", "после", "этим", "всего", "во", "твой", "ним", "лет", "боже", "них", "сэр", "ведь", "мистер", "жизнь", "потом", "ней", "такой", "который", "всех", "через", "им", "возможно", "немного", "такое", "слишком", "себе", "зачем", "должна", "моей", "люди", "знаете", "этой", "думаешь", "свою", "точно", "человек", "твоя", "под", "сказала", "назад", "эту", "можем", "случилось", "мама", "мог", "вместе", "отец", "сделал", "мои", "кажется", "друг", "куда", "никто", "поэтому", "эта", "которые", "два", "тот", "сколько", "понимаю", "снова", "жизни", "нравится", "людей", "помочь", "видел", "люблю", "хочет", "место", "знать", "прости", "отлично", "похоже", "парень", "домой", "всем", "деньги", "иди", "времени", "дома", "именно", "доктор", "думал", "говорил", "делаешь", "будем", "прямо", "стоит", "поговорить", "найти", "разве", "слушай", "своей", "лишь", "ага", "можете", "простите", "хотела", "сам", "тем", "будешь", "прошу", "три", "деле", "хотите", "говорить", "давайте", "совсем", "знал", "знает", "какой", "моего", "скажи", "дом", "дела", "вами", "свои", "говорит", "несколько", "должно", "про", "ваш", "происходит", "жаль", "туда", "действительно", "папа", "завтра", "оно", "черт", "одна", "перед", "наш", "уверен", "отсюда", "нужна", "самом", "тех", "нужен", "свой", "мою", "кого", "верно", "работу", "каждый", "твоей", "будут", "хватит", "понял", "нее", "уж", "имя", "против", "пор", "чём", "раньше", "говорю", "более", "надеюсь", "итак", "при", "ваша", "вообще", "пошли", "мать", "нельзя", "наверное", "нами", "твои", "могли", "дай", "ради", "всю", "ребята", "ко", "хотя", "понимаешь", "идти", "этих", "откуда", "такая", "ясно", "другой", "извините", "вижу", "видеть", "над", "могут", "равно", "мисс", "скоро", "будто", "зовут", "виду", "наши", "думала", "послушай", "между", "своего", "вопрос", "этому", "почти", "года", "человека", "которая", "подожди", "руки", "нормально", "такие", "возьми", "минут", "извини", "вещи", "могла", "смотри", "хоть", "работа", "пару", "сын", "ваше", "дня", "пора", "неё", "жить", "видишь", "достаточно", "господи", "быстро", "твою", "весь", "убить", "ночь", "говоришь", "собой", "скажу", "готов", "слышал", "какая", "посмотри", "первый", "самое", "видела", "пусть", "месте", "нашли", "сказали", "плохо", "смогу", "ваши", "отца", "детей", "знаем", "рад", "прав", "никаких", "имею", "миссис", "иногда", "смерти", "своих", "пойду", "брат", "вроде", "рядом", "мир", "произошло", "которую", "сделала", "говорила", "знала", "мое", "одного", "таким", "помощь", "такого", "кем", "насчет", "вчера", "случае", "увидеть", "нашей", "говорят", "правильно", "убил", "одно", "пойти", "друга", "сама", "долго", "работать", "дверь", "делает", "женщина", "важно", "кроме", "будь", "собираюсь", "вашей", "нужны", "здорово", "номер", "проблема", "проблемы", "денег", "чёрт", "хороший", "твоего", "одну", "дальше", "вернуться", "давно", "последний", "ночи", "узнать", "уверена", "машину", "права", "пять", "моих", "также", "тому", "вечером", "дети", "опять", "серьезно", "работает", "своим", "сначала", "две", "одной", "моим", "те", "жена", "думаете", "помнишь", "глаза", "ними", "чувак", "ночью", "чувствую", "взять", "сразу", "утром", "часть", "придется", "стать", "идея", "дорогая", "прекрасно", "слова", "сделали", "видели", "наша", "сердце", "помню", "парня", "момент", "утро", "здравствуйте", "стал", "скорее", "ох", "большой", "часов", "год", "друзья", "сильно", "говори", "смысле", "которой", "уйти", "которого", "капитан", "работы", "любовь", "дочь", "новый", "боюсь", "имеет", "стой", "дней", "той", "голову", "ах", "столько", "понятно", "дать", "девушка", "довольно", "доме", "вечер", "оба", "пойдем", "увидимся", "шанс", "хорошая", "прежде", "сделаю", "какого", "быстрее", "понять", "рассказать", "вашего", "бог", "интересно", "затем", "умер", "обо", "никого", "парни", "самый", "твое", "вон", "пришел", "чтоб", "поверить", "слово", "будете", "нашел", "милая", "странно", "какие", "ой", "та", "однажды", "сможешь", "получить", "обычно", "ума", "полагаю", "алло", "посмотреть", "иначе", "наших", "тело", "хотели", "свое", "пришли", "моё", "другие", "выглядит", "подумал", "лицо", "приятно", "мам", "говорите", "обратно", "нашего", "телефон", "мире", "честь", "господин", "доброе", "план", "другом", "час", "джон", "пути", "делал", "типа", "посмотрим", "насколько", "пытался", "правду", "решил", "поздно", "нем", "работе", "любит", "хотят", "кому", "сестра", "места", "скажешь", "следующий", "других", "получил", "кстати", "говорили", "пришла", "безопасности", "рада", "город", "внимание", "кофе", "которое", "вся", "семья", "конец", "позже", "дал", "думать", "спать", "вернулся", "остаться", "некоторые", "кровь", "оружие", "пришлось", "хуже", "дорогой", "полиция", "сможем", "понимаете", "четыре", "которых", "ужасно", "ждать", "способ", "делаю", "готовы", "совершенно", "смотреть", "вернусь", "большое", "единственный", "вперед", "часа", "муж", "идет", "таких", "ребенка", "машина", "стороны", "смог", "сына", "играть", "сами", "верю", "честно", "нашла", "звучит", "угодно", "руку", "начала", "перевод", "какое", "взял", "станет", "пытаюсь", "внутри", "знали", "новости", "добрый", "подождите", "скажите", "ребенок", "вашу", "мальчик", "осталось", "делаете", "году", "мере", "поняла", "отношения", "далеко", "вокруг", "хотим", "слышала", "двух", "приятель", "никому", "мужчина", "неделю", "вернуть", "смерть", "сих", "ту", "сможет", "дайте", "двое", "видите", "долларов", "крови", "решение", "путь", "следует", "неужели", "около", "готова", "семьи", "идем", "смотрите", "круто", "история", "вдруг", "спросить", "твоих", "второй", "вина", "джек", "женщины", "нашу", "заткнись", "минуту", "собираешься", "твоим", "шоу", "прощения", "больно", "машины", "пап", "трудно", "постоянно", "поможет", "проблем", "например", "дерьмо", "полиции", "начать", "знают", "лучший", "добро", "спасти", "рождения", "оставить", "чарли", "любишь", "конце", "забыл", "месяцев", "часто", "мило", "комнате", "нему", "матери", "милый", "полностью", "школе", "леди", "серьёзно", "убили", "случай", "джо", "убийство", "послушайте", "посмотрите", "пошел", "никакого", "сделаем", "говоря", "неплохо", "использовать", "прошлой", "иду", "узнал", "прекрати", "чуть", "держи", "невозможно", "господа", "слушайте", "наше", "машине", "сэм", "свет", "образом", "иметь", "другое", "другого", "шесть", "людям", "погоди", "имени", "детка", "недели", "меньше", "легко", "крайней", "девочка", "придётся", "мало", "ненавижу", "последние", "насчёт", "выглядишь", "сообщение", "думает", "друзей", "обещаю", "агент", "вместо", "последнее", "самого", "настолько", "ответ", "детектив", "понятия", "родители", "показать", "поехали", "стало", "мэм", "своими", "всей", "очевидно", "помогите", "маленький", "школу", "пожаловать", "твоё", "либо", "забрать", "прошло", "особенно", "имеешь", "истории", "эм", "вопросы", "большая", "минутку", "пол", "остановить", "чему", "свидания", "обязательно", "городе", "убийца", "сделай", "ваших", "любви", "спокойной", "своё", "мадам", "идите", "выйти", "делают", "немедленно", "делай", "возможность", "человеком", "бывает", "ужин", "моем", "купить", "позвонить", "наконец", "стала", "любой", "клянусь", "смешно", "абсолютно", "всему", "переводчики", "забудь", "секунду", "выбор", "тысяч", "потерял", "майкл", "волнуйся", "ноги", "таком", "настоящий", "означает", "встретиться", "известно", "работаю", "замечательно", "любом", "оставь", "связи", "боль", "выпить", "представить", "убийства", "малыш", "умерла", "воды", "окей", "речь", "хорошие", "поводу", "перестань", "увидел", "повезло", "президент", "мужик", "которым", "прошлом", "дам", "десять", "умереть", "поговорим", "отцом", "искать", "тихо", "оставил", "пистолет", "начал", "сложно", "города", "неделе", "хотелось", "принять", "историю", "босс", "держать", "пойдём", "подумала", "фильм", "слышишь", "рано", "удачи", "еду", "словно", "причина", "пришёл", "компании", "спокойно", "работал", "подумать", "вести", "вещь", "брата", "конца", "получится", "блин", "право", "ввиду", "бога", "подарок", "комнату", "мира", "успокойся", "позволить", "моему", "идёт", "самая", "рассказал", "курсе", "намного", "мистера", "женщин", "тяжело", "ух", "предложение", "одним", "счет", "улице", "другим", "уходи", "майк", "среди", "помоги", "получилось", "месяц", "проверить", "генри", "голос", "позвольте", "стороне", "вероятно", "случится", "уверены", "мужа", "питер", "провести", "людьми", "неважно", "нашёл", "доктора", "месяца", "игра", "идём", "нём", "джордж", "познакомиться", "возьму", "слышали", "пошла", "корабль", "чувствуешь", "позволь", "сторону", "игры", "согласен", "письмо", "вниз", "молодец", "наверняка", "утра", "вашим", "нечего", "встречи", "вид", "никакой", "связь", "список", "такую", "весело", "сидеть", "гораздо", "собирался", "впервые", "находится", "объяснить", "полицию", "решили", "семью", "свидание", "отличная", "остальные", "прийти", "руках", "фбр", "чувство", "котором", "решила", "понадобится", "сынок", "найду", "фрэнк", "школы", "чувства", "дядя", "стали", "ушла", "первым", "поверь", "расскажи", "хочется", "девушки", "сон", "имел", "каким", "парнем", "многие", "части", "ехать", "считаю", "никуда", "голове", "старый", "оттуда", "называется", "вопросов", "фото", "пройти", "заниматься", "другу", "вернулась", "пара", "никак", "девочки", "благодарю", "своем", "недавно", "приехал", "глаз", "могло", "становится", "пыталась", "является", "брось", "богу", "нашим", "помощи", "волосы", "невероятно", "одном", "ушел", "джейн", "тела", "недель", "собирается", "защитить", "всеми", "существует", "жив", "первая", "позвоню", "благодаря", "вперёд", "навсегда", "помните", "земле", "делу", "вполне", "пытается", "будущее", "семь", "своему", "ок", "идиот", "слава", "стоило", "удалось", "делаем", "команда", "главное", "огонь", "дэнни", "замуж", "начали", "мужчины", "силы", "семье", "шеф", "суд", "слышу", "тюрьме", "попробовать", "друзьями", "алекс", "вашем", "новая", "маленькая", "черта", "придет", "страшно", "услышать", "новые", "общем", "звонил", "купил", "понравится", "близко", "самой", "смысл", "хорошее", "любил", "сара", "единственная", "делали", "макс", "мэри", "жду", "получается", "хорошего", "эми", "дамы", "жену", "гарри", "неправильно", "стоять", "плевать", "ключ", "верить", "лично", "слышать", "взяли", "поздравляю", "пить", "заставить", "получили", "рот", "делала", "преступления", "двери", "землю", "разумеется", "очередь", "первой", "разговор", "видимо", "звонок", "джеймс", "менее", "нового", "получила", "хм", "подальше", "сможете", "похож", "состоянии", "необходимо"]), new Set())
      const layoutFixCandidate = layout.candidate
      const learnWords = layout.learnWords

      function setNativeInputValue(el, value, cursorStart, cursorEnd) {
        if (!el) return
        const oldVal = el.value || ''
        if (oldVal === value) return

        const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
        const desc = Object.getOwnPropertyDescriptor(proto, 'value')
        if (desc && desc.set) {
          desc.set.call(el, value)
        } else {
          el.value = value
        }

        if (el._valueTracker) {
          el._valueTracker.setValue(value === '' ? '__force__' : '')
        }

        try {
          const propsKey = Object.keys(el).find((k) => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'))
          if (propsKey && el[propsKey] && typeof el[propsKey].onChange === 'function') {
            el[propsKey].onChange({ target: el, currentTarget: el })
          }
        } catch (e) {}

        try {
          el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
        } catch (e) {
          el.dispatchEvent(new Event('input', { bubbles: true }))
        }
        el.dispatchEvent(new Event('change', { bubbles: true }))

        if (typeof cursorStart === 'number' && typeof el.setSelectionRange === 'function') {
          const end = typeof cursorEnd === 'number' ? cursorEnd : cursorStart
          try { el.setSelectionRange(cursorStart, end) } catch (e) {}
        }
      }

      let layoutHintEl = null
      const layoutCurrentInput = (ev) => {
        if (ev && ev.target) {
          const t = ev.target
          if (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && (t.type === 'text' || !t.type))) {
            return t
          }
          const c = t.closest ? t.closest('[data-composer-input], [contenteditable="true"], [role="textbox"]') : null
          if (c) return c
        }
        const el = document.activeElement
        if (el) {
          if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && (el.type === 'text' || !el.type))) {
            return el
          }
          const c = el.closest ? el.closest('[data-composer-input], [contenteditable="true"], [role="textbox"]') : null
          if (c) return c
        }
        const focused = document.querySelector('[data-composer-input], [contenteditable="true"][role="textbox"], textarea:focus, textarea')
        if (focused) return focused
        return null
      }

      function getCaretCharacterOffset(root) {
        if (!root) return -1
        const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
        if (!sel || !sel.rangeCount) return -1
        try {
          const range = sel.getRangeAt(0)
          if (!root.contains(range.startContainer)) return -1
          const preCaretRange = range.cloneRange()
          preCaretRange.selectNodeContents(root)
          preCaretRange.setEnd(range.startContainer, range.startOffset)
          return preCaretRange.toString().length
        } catch (e) {
          return -1
        }
      }

      function setCaretCharacterOffset(root, offset) {
        if (!root || offset < 0) return
        const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
        if (!sel) return
        try {
          let current = 0
          let targetNode = null
          let targetOffset = 0
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
          let node = walker.nextNode()
          while (node) {
            const len = node.nodeValue.length
            if (current + len >= offset) {
              targetNode = node
              targetOffset = Math.max(0, offset - current)
              break
            }
            current += len
            node = walker.nextNode()
          }
          if (targetNode) {
            const range = document.createRange()
            range.setStart(targetNode, targetOffset)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
          }
        } catch (e) {}
      }

      const isCaretInCode = (el, value, caretOffset) => {
        if (!el) return false
        if (caretOffset == null || caretOffset < 0) caretOffset = (value || '').length
        const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
        if (sel && sel.anchorNode && sel.anchorNode.parentElement) {
          if (sel.anchorNode.parentElement.closest('code, pre, .katex, [data-latex], math')) return true
        }
        const textBefore = (value || '').slice(0, caretOffset)
        const triple = textBefore.match(/```/g)
        if (triple && triple.length % 2 === 1) return true
        const lastLine = textBefore.split('\n').pop()
        const single = lastLine.match(/`/g)
        if (single && single.length % 2 === 1) return true
        return false
      }

      const getComposerText = (el) => {
        if (!el) return ''
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
          return el.value || ''
        }
        const host = (el.closest && el.closest('[data-composer-input], [contenteditable="true"]')) || el
        const raw = host.innerText !== undefined ? host.innerText : (host.textContent || '')
        return raw.replace(/\r/g, '').replace(/[\u200B\uFEFF]/g, '').replace(/\n+$/, '')
      }

      const setComposerText = (el, value, cursorStart, cursorEnd) => {
        if (!el) return
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
          setNativeInputValue(el, value, cursorStart, cursorEnd)
          return
        }

        const host = (el.closest && el.closest('[data-composer-input], [contenteditable="true"]')) || el
        const initialOffset = typeof cursorStart === 'number' ? cursorStart : getCaretCharacterOffset(host)

        try {
          host.focus()
          const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
          if (sel) {
            const range = document.createRange()
            range.selectNodeContents(host)
            sel.removeAllRanges()
            sel.addRange(range)
          }
          document.execCommand('insertText', false, value)

          const targetOffset = typeof cursorStart === 'number' ? cursorStart : (initialOffset >= 0 ? Math.min(initialOffset, value.length) : value.length)
          setCaretCharacterOffset(host, targetOffset)
        } catch (e) {}
      }

      const layoutDismiss = () => {
        if (layoutHintEl) { layoutHintEl.remove(); layoutHintEl = null }
      }
      const layoutShowHint = (inputEl, converted, direction) => {
        layoutDismiss()
        layoutHintEl = document.createElement('div')
        layoutHintEl.dataset.russianLangLayout = '1'
        Object.assign(layoutHintEl.style, {
          position: 'fixed', zIndex: '99999', background: '#fff', color: '#000',
          border: '1px solid #888', borderRadius: '8px', padding: '6px 10px',
          fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,.2)', cursor: 'pointer'
        })
        const label = direction === 'cyr2lat' ? 'Команда, не та раскладка' : 'Не та раскладка'
        layoutHintEl.textContent = label + ': ' + converted
        layoutHintEl.addEventListener('mousedown', (ev) => {
          ev.preventDefault()
          setComposerText(inputEl, converted)
          learnWords(converted) // #67: запомнить принятые слова
          layoutDismiss()
        })
        document.body.appendChild(layoutHintEl)
        const r = inputEl.getBoundingClientRect()
        layoutHintEl.style.left = (r.left + 8) + 'px'
        layoutHintEl.style.bottom = (window.innerHeight - r.top + 6) + 'px'
      }

      let layoutBadgeEl = null
      const layoutBadge = (el) => {
        const value = getComposerText(el)
        const last = value.trim().slice(-1)
        const isCyr = /[\u0430-\u044f\u0451]/.test(last)
        const isLat = /[a-z]/i.test(last)
        const label = isCyr ? 'RU' : (isLat ? 'EN' : '')
        if (!label) { layoutBadgeHide(); return }
        if (!layoutBadgeEl) {
          layoutBadgeEl = document.createElement('button')
          layoutBadgeEl.type = 'button'
          layoutBadgeEl.dataset.russianLangLayoutBadge = '1'
          Object.assign(layoutBadgeEl.style, {
            position: 'fixed', zIndex: '99998', background: 'var(--dsw-alias-bg-layer-3, #fff)',
            color: 'var(--dsw-alias-label-secondary, #666)', border: '1px solid var(--dsw-alias-border-l2, #888)',
            borderRadius: '6px', padding: '1px 6px', fontSize: '11px', cursor: 'pointer',
            fontFamily: 'monospace', lineHeight: '1.4', fontWeight: '600'
          })
          layoutBadgeEl.title = 'Раскладка — клик: конвертировать (Alt+L)'
          layoutBadgeEl.addEventListener('mousedown', (ev) => {
            ev.preventDefault()
            const v = getComposerText(el)
            const c = layoutFixCandidate(v, 'lat2cyr') || layoutFixCandidate(v, 'cyr2lat')
            if (c) {
              setComposerText(el, c.converted)
              learnWords(c.converted)
            }
          })
          document.body.appendChild(layoutBadgeEl)
        }
        layoutBadgeEl.textContent = label
        const r = el.getBoundingClientRect()
        layoutBadgeEl.style.left = (r.right - 36) + 'px'
        layoutBadgeEl.style.top = (r.top - 22) + 'px'
      }
      const layoutBadgeHide = () => {
        if (layoutBadgeEl) { layoutBadgeEl.remove(); layoutBadgeEl = null }
      }

      let isFormatting = false
      const layoutOnInput = (ev) => {
        if (isFormatting) return
        try {
          const el = layoutCurrentInput(ev)
          if (!el) { layoutDismiss(); layoutBadgeHide(); return }
          layoutBadge(el) // #66: метка раскладки
          const value = getComposerText(el)


          if (value.trim().length < 4) { layoutDismiss(); return }
          const latCount = (value.match(/[a-z]/g) || []).length
          const cyrCount = (value.match(/[\u0430-\u044f\u0451]/g) || []).length
          if (latCount > cyrCount && cyrCount === 0) {
            const c = layoutFixCandidate(value, 'lat2cyr')
            if (c) { layoutShowHint(el, c.converted, 'ru'); return }
          }
          if (cyrCount > 0 && latCount === 0 && value.trim().startsWith('/')) {
            const c = layoutFixCandidate(value, 'cyr2lat')
            if (c) { layoutShowHint(el, c.converted, 'cmd'); return }
          }
          layoutDismiss()
        } catch (err) { /* ignore */ }
      }
      const unsubscribeLayout = runtime.subscribe(layoutOnInput)

      const layoutOnKeydown = (ev) => {
        const el = layoutCurrentInput(ev)
        if (!el) return

        const value = getComposerText(el)

        const isL = ev.code === 'KeyL' || ev.key.toLowerCase() === 'l' || ev.key.toLowerCase() === 'д'
        if (ev.altKey && !ev.ctrlKey && !ev.metaKey && isL) {
          const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
          const selectedText = (sel && !sel.isCollapsed) ? sel.toString() : ''

          if (selectedText) {
            const c = layoutFixCandidate(selectedText, 'lat2cyr') || layoutFixCandidate(selectedText, 'cyr2lat')
            if (c) {
              ev.preventDefault()
              isFormatting = true
              try {
                if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                  const sStart = el.selectionStart || 0
                  const sEnd = el.selectionEnd || sStart
                  const nextVal = value.slice(0, sStart) + c.converted + value.slice(sEnd)
                  setNativeInputValue(el, nextVal, sStart, sStart + c.converted.length)
                } else {
                  document.execCommand('insertText', false, c.converted)
                }
                learnWords(c.converted)
              } finally {
                isFormatting = false
              }
              return
            }
          }

          const c = layoutFixCandidate(value, 'lat2cyr') || layoutFixCandidate(value, 'cyr2lat')
          if (c) {
            ev.preventDefault()
            isFormatting = true
            try {
              if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                const sStart = el.selectionStart || 0
                const sEnd = el.selectionEnd || sStart
                setNativeInputValue(el, c.converted, sStart, sEnd)
              } else {
                const host = (el.closest && el.closest('[data-composer-input], [contenteditable="true"]')) || el
                const offset = getCaretCharacterOffset(host)
                setComposerText(el, c.converted, offset, offset)
              }
              learnWords(c.converted) // #67
            } finally {
              isFormatting = false
            }
          }
          return
        }

        if (ev.key === ' ' || ev.key === 'Enter') {
          if (value && value.startsWith('/') && typeof expandSlashAlias === 'function') {
            const expanded = expandSlashAlias(value)
            if (expanded !== value) {
              if (ev.key === ' ') {
                ev.preventDefault()
                isFormatting = true
                try {
                  const nextVal = expanded + ' '
                  setComposerText(el, nextVal, nextVal.length, nextVal.length)
                } finally {
                  isFormatting = false
                }
                return
              } else if (ev.key === 'Enter') {
                isFormatting = true
                try {
                  setComposerText(el, expanded, expanded.length, expanded.length)
                } finally {
                  isFormatting = false
                }
              }
            }
          }
        }

        try {
          const snapVal = scope ? (scope.getSnapshot().value || {}) : {}
          const typoLive = snapVal.typography ? snapVal.typography.liveInput !== false : true
          if (typoLive && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
            const isTextarea = el.tagName === 'TEXTAREA' || el.tagName === 'INPUT'

            if (isTextarea) {
              const caretPos = el.selectionStart || 0
              if (!isCaretInCode(el, value, caretPos)) {
                const textBefore = caretPos >= 0 ? value.slice(0, caretPos) : value

                if (ev.key === '-' && textBefore.endsWith('-')) {
                  ev.preventDefault()
                  isFormatting = true
                  try {
                    const nextVal = value.slice(0, caretPos - 1) + '—' + value.slice(el.selectionEnd || caretPos)
                    setNativeInputValue(el, nextVal, caretPos, caretPos)
                  } finally {
                    isFormatting = false
                  }
                  return
                }

                if (ev.key === '"') {
                  ev.preventDefault()
                  isFormatting = true
                  try {
                    const prevChar = textBefore.slice(-1)
                    const isOpening = !textBefore || /[\s([{-]/.test(prevChar)
                    const quoteChar = isOpening ? '«' : '»'
                    const nextVal = value.slice(0, caretPos) + quoteChar + value.slice(el.selectionEnd || caretPos)
                    setNativeInputValue(el, nextVal, caretPos + 1, caretPos + 1)
                  } finally {
                    isFormatting = false
                  }
                  return
                }
              }
            }
          }
        } catch (e) {}
      }
      ctx.effect(() => {
        document.addEventListener('input', layoutOnInput, true)
        document.addEventListener('keydown', layoutOnKeydown, true)
        return () => {
          unsubscribeLayout()
          document.removeEventListener('input', layoutOnInput, true)
          document.removeEventListener('keydown', layoutOnKeydown, true)
          layoutDismiss()
          layoutBadgeHide()
        }
      }, 'dsh-russian-lang: layout')

      if (!ctx.slots || !React) return
      const toggleRu = (wantRu) => {
        try {
          if (runtime.getLocale().active === wantRu) return
          runtime.setLocale(wantRu ? 'ru' : 'en')
        } catch (err) { console.warn('dsh-russian-lang: toggle failed', err) }
      }
      try {
        ctx.slots.inject('settings.plugin.item', () =>
          ctx.slots.register({
            name: 'settings.plugin.item',
            key: SETTINGS_NS_NAME,
            locale: SETTINGS_NS_NAME,
            inject: () => ({ scope, runtime, toggleRu }),
          }, SettingsCard),
        )
      } catch (err) { console.warn('dsh-russian-lang: settings slot unavailable', err) }

      try {
        ctx.slots.inject('conversation.session.header.utilities', () =>
          ctx.slots.register({
            name: 'conversation.session.header.utilities',
            id: 'dsh-russian-lang-quick-switch',
            order: 100,
            locale: SETTINGS_NS_NAME,
            inject: () => ({ runtime, toggleRu }),
          }, QuickLangSwitch),
        )
      } catch (err) { /* ignore if slot not declared */ }

      try {
        ctx.slots.inject('conversation.chat.assistant-actions', () =>
          ctx.slots.register({
            name: 'conversation.chat.assistant-actions',
            id: 'dsh-russian-lang-translate-action',
            order: 50,
            locale: SETTINGS_NS_NAME,
            inject: () => ({ runtime }),
          }, TranslateTurnAction),
        )
      } catch (err) { /* ignore if slot not declared */ }

      try {
        ctx.slots.inject('conversation.session.header.utilities', () =>
          ctx.slots.register({
            name: 'conversation.session.header.utilities',
            id: 'dsh-russian-lang-md-export',
            order: 101,
            locale: SETTINGS_NS_NAME,
            inject: () => ({ runtime }),
          }, ExportMarkdownButton),
        )
      } catch (err) { /* ignore if slot not declared */ }
    }

    function QuickLangSwitch(props) {
      const inj = typeof props.inject === 'function' ? (props.inject() || {}) : (props.inject || {})
      const runtime = props.runtime || inj.runtime
      const toggleRu = props.toggleRu || inj.toggleRu
      const [locale, setLocaleState] = React.useState(runtime ? (runtime.getLocale().active || 'en') : 'ru')
      React.useEffect(() => {
        if (!runtime) return
        return runtime.subscribe(() => {
          try { setLocaleState(runtime.getLocale().active || 'en') } catch (e) { /* ignore */ }
        })
      }, [runtime])
      const isRu = locale === 'ru'
      return React.createElement('button', {
        type: 'button',
        className: 'rl-lang-chip' + (isRu ? ' rl-lang-chip-active' : ''),
        title: isRu ? 'Интерфейс: Русский (нажмите для переключения на EN)' : 'Interface: English (click for RU)',
        onClick: () => { if (toggleRu) toggleRu(!isRu) },
      }, React.createElement('span', { className: 'rl-lang-text' }, isRu ? 'RU' : 'EN'))
    }

    function ExportMarkdownButton(props) {
      const [done, setDone] = React.useState(false)
      const onExport = () => {
        try {
          const titleEl = document.querySelector('.dsw-session-title, [data-session-title], header h1, header h2, [class*="title"]')
          const rawTitle = (titleEl && titleEl.textContent.trim()) || document.title || 'Диалог DSH'
          const title = rawTitle.replace(/\s*—\s*DeepSeek Harness\s*$/, '').trim() || 'Диалог DSH'

          const flow = document.querySelector('[data-chat-flow]') || document.querySelector('[data-chat-flow-scroll]') || document.body
          const flowItems = Array.from(flow.querySelectorAll('[data-chat-flow-kind]'))
          const messages = []

          if (flowItems.length > 0) {
            flowItems.forEach((node) => {
              const kind = node.getAttribute('data-chat-flow-kind')
              if (kind === 'user' || kind === 'steering') {
                const bubble = node.querySelector('[class*="bubble"]') || node
                const clone = bubble.cloneNode(true)
                clone.querySelectorAll('button, svg, [class*="actions"], [class*="Actions"]').forEach((b) => b.remove())
                const text = clone.innerText.trim()
                if (text) messages.push({ role: 'user', content: text })
              } else if (kind === 'assistant-step') {
                const clone = node.cloneNode(true)
                clone.querySelectorAll('button, svg, [class*="actions"], [class*="Actions"], .rl-turn-translation').forEach((b) => b.remove())
                const text = clone.innerText.trim()
                if (text) messages.push({ role: 'assistant', content: text })
              }
            })
          }

          if (messages.length === 0) {
            const allElements = Array.from(document.querySelectorAll('[class*="userRow"], [class*="UserRow"], [class*="assistant-step"], [class*="AssistantMarkdown"], .dsw-turn-node, [data-role]'))
            const seen = new Set()
            allElements.forEach((node) => {
              const isUser = node.matches('[class*="userRow"], [class*="UserRow"], [data-role="user"]') || !!node.querySelector('[data-role="user"]')
              const role = isUser ? 'user' : 'assistant'
              const clone = node.cloneNode(true)
              clone.querySelectorAll('button, svg, [class*="actions"], [class*="Actions"], .rl-turn-translation, [data-turn-tail]').forEach((b) => b.remove())
              const text = clone.innerText.trim()
              if (!text || seen.has(text)) return
              seen.add(text)
              messages.push({ role, content: text })
            })
          }

          const session = {
            title,
            createdAt: new Date().toISOString(),
            messages
          }
          const md = exportSessionToMarkdown(session)
          const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          const safeTitle = (title || 'dialog').replace(/[/\\?%*:|"<>]/g, '-').slice(0, 50)
          a.style.display = 'none'
          a.href = url
          a.download = safeTitle + '-' + new Date().toISOString().slice(0, 10) + '.md'
          document.body.appendChild(a)
          a.click()
          setDone(true)
          setTimeout(() => {
            try { document.body.removeChild(a); URL.revokeObjectURL(url) } catch (e) {}
          }, 30000)
          setTimeout(() => setDone(false), 2000)
        } catch (err) {
          console.warn('dsh-russian-lang: export md failed', err)
        }
      }

      return React.createElement('button', {
        type: 'button',
        className: 'rl-lang-chip rl-export-md-btn',
        title: 'Экспорт диалога в Markdown (.md)',
        onClick: onExport,
      }, React.createElement('span', { className: 'rl-lang-text' }, done ? '✓ MD' : '📥 MD'))
    }

    async function translateTurnContent(text) {
      if (!text || typeof text !== 'string') return ''
      const cyr = (text.match(/[\u0430-\u044f\u0451]/gi) || []).length
      const lat = (text.match(/[a-z]/gi) || []).length
      if (cyr > lat && cyr > 15) return text

      const parts = text.split(/(```[\s\S]*?```)/g)
      for (let i = 0; i < parts.length; i += 2) {
        const chunk = parts[i].trim()
        if (!chunk) continue
        const paragraphs = chunk.split(/\n\n+/)
        const translatedParas = []
        for (const para of paragraphs) {
          const pTrim = para.trim()
          if (!pTrim) continue

          const sentences = pTrim.match(/[^.!?\n]+[.!?\n]*/g) || [pTrim]
          const translatedSentences = []

          for (const s of sentences) {
            let translated = ''

            try {
              const gurl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ru&dt=t&q=' + encodeURIComponent(s)
              const gres = await fetch(gurl)
              if (gres.ok) {
                const gdata = await gres.json()
                if (Array.isArray(gdata) && Array.isArray(gdata[0])) {
                  translated = gdata[0].map((it) => it[0]).join('')
                }
              }
            } catch (e1) {}

            if (!translated) {
              try {
                const isZh = /[\u3400-\u9fff]/.test(s)
                const langPair = isZh ? 'zh-CN|ru' : 'en|ru'
                const murl = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(s.slice(0, 450)) + '&langpair=' + langPair
                const mres = await fetch(murl)
                if (mres.ok) {
                  const mdata = await mres.json()
                  if (mdata && mdata.responseData && mdata.responseData.translatedText) {
                    const txtEl = document.createElement('textarea')
                    txtEl.innerHTML = mdata.responseData.translatedText
                    translated = txtEl.value
                  }
                }
              } catch (e2) {}
            }

            translatedSentences.push(translated || s)
          }
          translatedParas.push(translatedSentences.join(' '))
        }
        parts[i] = translatedParas.join('\n\n')
      }
      return parts.join('\n\n')
    }

    function TranslateTurnAction(props) {
      const t = typeof props.t === 'function' ? props.t : ((k) => k)
      const [loading, setLoading] = React.useState(false)
      const [open, setOpen] = React.useState(false)
      const [upStatus, setUpStatus] = React.useState({
        currentVersion: '0.2.20',
        latestVersion: undefined,
        updateAvailable: false
      })
      const [upLoading, setUpLoading] = React.useState(false)
      const [upMsg, setUpMsg] = React.useState(null)

      const checkUpdate = () => {
        setUpLoading(true)
        setUpMsg(null)
        fetch('/api/dsh-russian-lang/update')
          .then((r) => r.json())
          .then((data) => {
            setUpStatus(data)
            setUpLoading(false)
          })
          .catch(() => {
            setUpLoading(false)
            setUpMsg({ type: 'err', text: t('updaterFailed') })
          })
      }

      const triggerUpdate = () => {
        setUpLoading(true)
        setUpMsg(null)
        fetch('/api/dsh-russian-lang/update', {
          method: 'POST',
          headers: { 'x-dsh-plugin-update': '1' }
        })
          .then((r) => r.json())
          .then((data) => {
            setUpLoading(false)
            if (data.restartRequired || data.updatedVersion) {
              setUpStatus(data)
              setUpMsg({ type: 'ok', text: t('updaterSuccess') })
            } else if (data.error) {
              setUpMsg({ type: 'err', text: data.error })
            }
          })
          .catch(() => {
            setUpLoading(false)
            setUpMsg({ type: 'err', text: t('updaterFailed') })
          })
      }

      React.useEffect(() => {
        if (open) checkUpdate()
      }, [open])


      return React.createElement('button', {
        type: 'button',
        className: 'rl-action-btn' + (open ? ' rl-action-btn-active' : ''),
        title: t('translateTurn'),
        disabled: loading,
        onClick: async (ev) => {
          ev.stopPropagation()
          const btn = ev.currentTarget
          const tailFlowItem = btn.closest('[data-chat-flow-kind="turn-tail"]') || btn.closest('[data-chat-flow-kind]') || btn.closest('[data-turn-tail]')?.closest('[data-chat-flow-kind]') || btn.closest('[data-turn-tail]')
          if (!tailFlowItem) return

          const parentContainer = tailFlowItem.parentElement
          let box = parentContainer ? parentContainer.querySelector('.rl-turn-translation[data-tail-key="' + (tailFlowItem.getAttribute('data-chat-flow-key') || '') + '"]') : null
          if (!box) {
            box = tailFlowItem.querySelector('.rl-turn-translation')
          }
          if (box) {
            box.style.display = box.style.display === 'none' ? 'block' : 'none'
            setOpen(box.style.display !== 'none')
            return
          }

          setLoading(true)
          try {
            const assistantNodes = []
            let prev = tailFlowItem.previousElementSibling
            while (prev && prev.getAttribute('data-chat-flow-kind') !== 'user') {
              if (prev.getAttribute('data-chat-flow-kind') === 'assistant-step') {
                assistantNodes.unshift(prev)
              }
              prev = prev.previousElementSibling
            }

            let rawText = ''
            if (assistantNodes.length > 0) {
              rawText = assistantNodes.map((node) => {
                const clone = node.cloneNode(true)
                clone.querySelectorAll('button, svg, [class*="actions"], [class*="Actions"]').forEach((b) => b.remove())
                return clone.innerText.trim()
              }).filter(Boolean).join('\n\n')
            } else if (parentContainer) {
              const allSteps = Array.from(parentContainer.querySelectorAll('[data-chat-flow-kind="assistant-step"]'))
              if (allSteps.length > 0) {
                const beforeTail = allSteps.filter((s) => (s.compareDocumentPosition(tailFlowItem) & Node.DOCUMENT_POSITION_FOLLOWING))
                const targetSteps = beforeTail.length > 0 ? [beforeTail[beforeTail.length - 1]] : [allSteps[allSteps.length - 1]]
                rawText = targetSteps.map((s) => {
                  const clone = s.cloneNode(true)
                  clone.querySelectorAll('button, svg, [class*="actions"], [class*="Actions"]').forEach((b) => b.remove())
                  return clone.innerText.trim()
                }).filter(Boolean).join('\n\n')
              }
            }

            if (!rawText) {
              const prose = tailFlowItem.querySelector('.dsw-prose, [data-block-kind="text"], .dsw-markdown-view, p')
              if (prose) rawText = prose.innerText.trim()
            }

            const translated = rawText ? await translateTurnContent(rawText) : 'Не удалось обнаружить текст сообщения ассистента для перевода.'

            box = document.createElement('div')
            box.className = 'rl-turn-translation'
            const key = tailFlowItem.getAttribute('data-chat-flow-key')
            if (key) box.dataset.tailKey = key
            box.innerHTML = '<div class="rl-trans-head">' +
              '<span class="rl-trans-title">🌐 Перевод на русский</span>' +
              '<div class="rl-trans-tools">' +
                '<button type="button" class="rl-trans-btn rl-btn-copy" title="Скопировать перевод">📋 Копировать</button>' +
                '<button type="button" class="rl-trans-btn rl-btn-close" title="Закрыть">✕</button>' +
              '</div>' +
            '</div>' +
            '<div class="rl-trans-body"></div>'
            box.querySelector('.rl-trans-body').textContent = translated

            const copyBtn = box.querySelector('.rl-btn-copy')
            copyBtn.addEventListener('click', (e) => {
              e.stopPropagation()
              try { navigator.clipboard.writeText(translated) } catch (err) {}
              copyBtn.textContent = '✓ Скопировано'
              setTimeout(() => { copyBtn.textContent = '📋 Копировать' }, 2000)
            })

            const closeBtn = box.querySelector('.rl-btn-close')
            closeBtn.addEventListener('click', (e) => {
              e.stopPropagation()
              box.style.display = 'none'
              setOpen(false)
            })

            if (parentContainer) {
              parentContainer.insertBefore(box, tailFlowItem)
            } else {
              tailFlowItem.appendChild(box)
            }
            setOpen(true)
          } catch (err) {
            console.warn('dsh-russian-lang: translate turn failed', err)
          } finally {
            setLoading(false)
          }
        },
      }, React.createElement('span', null, loading ? '...' : (open ? 'RU ✓' : 'RU ↗')))
    }

    function SettingsCard(props) {
      const inj = typeof props.inject === 'function'
        ? (props.inject() || {})
        : (props.inject || {})
      const scope = props.scope || inj.scope
      const runtime = props.runtime || inj.runtime
      const toggleRu = props.toggleRu || inj.toggleRu
      const t = typeof props.t === 'function' ? props.t : ((k) => k)

      const [open, setOpen] = React.useState(false)
      const [snap, setSnap] = React.useState(
        () => (scope && scope.getSnapshot ? scope.getSnapshot() : { status: 'loading', value: {} }))
      const [ruActive, setRuActive] = React.useState(
        () => { try { return runtime.getLocale().active === 'ru' } catch (e) { return false } })
      const [typo, setTypoState] = React.useState(() =>
        (snap.value && snap.value.typography) || {})

      React.useEffect(() => {
        if (!scope || !scope.subscribe) return undefined
        const un = scope.subscribe(() => {
          const s = scope.getSnapshot()
          setSnap(s)
          if (s.value && s.value.typography) setTypoState(s.value.typography)
        })
        setSnap(scope.getSnapshot())
        return un
      }, [scope])
      React.useEffect(() => {
        try {
          const un = runtime.subscribe(() => {
            try { setRuActive(runtime.getLocale().active === 'ru') } catch (e) { /* ignore */ }
          })
          return un
        } catch (e) { return undefined }
      }, [runtime])

      const status = snap.status || 'loading'
      const value = snap.value || {}
      const typography = typo
      const overridesCount = Object.keys(value.overrides || {}).length

      const setTypo = (patch) => {
        const next = Object.assign({}, typo, patch)
        setTypoState(next)
        try {
          const r = scope.set('typography', next)
          if (r && typeof r.catch === 'function') r.catch((err) => {
            console.warn('dsh-russian-lang: scope.set typography failed', err && err.message || err)
          })
        } catch (err) {
          console.warn('dsh-russian-lang: scope.set typography sync threw', err && err.message || err)
        }
      }
      const onEnabled = (ev) => { if (toggleRu) toggleRu(ev.target.checked) }

      const checkbox = (checked, onChange, disabled) =>
        React.createElement('input', {
          type: 'checkbox', checked: !!checked, disabled: !!disabled,
          className: 'rl-check', onChange: (ev) => onChange(ev),
        })

      const disabled = status !== 'ready'
      const statusLine = status === 'ready'
        ? ''
        : (status === 'unavailable' ? t('statusUnavailable') : t('statusLoading'))

      let ChevronIcon = null
      try {
        const primitives = require('@deepseek-ai/dsh-client-ui-primitives')
        ChevronIcon = primitives && primitives.IconChevronDownOutline14
      } catch (_) { ChevronIcon = null }

      const FallbackChevron = () => React.createElement('svg', {
        width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none',
        'aria-hidden': 'true',
      }, React.createElement('path', {
        d: 'M3.5 5.25 7 8.75l3.5-3.5', stroke: 'currentColor',
        strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
      }))

      const Chevron = ChevronIcon || FallbackChevron

      const presetKey = value.agentPromptPreset || 'technical_expert'
      const presetInfo = typeof SYSTEM_PROMPT_PRESETS !== 'undefined' ? SYSTEM_PROMPT_PRESETS[presetKey] : null

      return React.createElement('div', { className: 'rl-card' },
        React.createElement('button', {
          type: 'button',
          className: 'rl-head',
          'aria-expanded': String(open),
          onClick: () => setOpen(!open),
        },
          React.createElement('span', { className: 'rl-head-main' },
            React.createElement('div', { className: 'rl-title' },
              '🇷🇺 ' + t('cardTitle'),
              React.createElement('span', { className: 'rl-badge ' + (ruActive ? 'rl-badge-ok' : 'rl-badge-warn') },
                ruActive ? t('badgeRu') : t('badgeEn')),
              React.createElement('span', { className: 'rl-badge rl-badge-ok' }, t('badgeCoverage'))
            ),
            React.createElement('div', { className: 'rl-sub' },
              statusLine || t('cardSub'))),
          React.createElement('span', {
            className: 'rl-chev' + (open ? ' rl-chev-open' : ''),
          }, React.createElement(Chevron, null))),
        open && React.createElement('div', { className: 'rl-body' },
          React.createElement('div', { className: 'rl-page' },

            React.createElement('div', { className: 'rl-section-card' },
              React.createElement('div', { className: 'rl-section-title' },
                React.createElement('span', null, t('secLanguage')),
                React.createElement('span', { className: 'rl-badge ' + (ruActive ? 'rl-badge-ok' : 'rl-badge-dim') },
                  ruActive ? t('badgeRu') : t('badgeEn'))
              ),
              React.createElement('div', { className: 'rl-section-desc' }, t('secLanguageDesc')),
              React.createElement('div', { className: 'rl-item-card' },
                React.createElement('div', { className: 'rl-item-head' },
                  React.createElement('label', { className: 'rl-item-label' },
                    checkbox(ruActive, onEnabled, disabled),
                    t('enabled')
                  )
                ),
                React.createElement('div', { className: 'rl-item-desc' }, t('enabledDesc'))
              ),
              React.createElement('div', { className: 'rl-hint-text' }, t('quickSwitchNote')),
              overridesCount > 0 ? React.createElement('div', { className: 'rl-badge rl-badge-dim', style: { alignSelf: 'flex-start' } },
                t('overridesCount') + ': ' + overridesCount) : null
            ),

            React.createElement('div', { className: 'rl-section-card' },
              React.createElement('div', { className: 'rl-section-title' },
                React.createElement('span', null, t('secTypography')),
                React.createElement('span', { className: 'rl-badge rl-badge-ok' }, t('badgeSmartUx'))
              ),
              React.createElement('div', { className: 'rl-section-desc' }, t('secTypographyDesc')),
              React.createElement('div', { className: 'rl-grid-2' },
                React.createElement('div', { className: 'rl-item-card' },
                  React.createElement('div', { className: 'rl-item-head' },
                    React.createElement('label', { className: 'rl-item-label' },
                      checkbox(typography.enabled !== false && ruActive,
                        (ev) => setTypo({ enabled: ev.target.checked }), !ruActive || disabled),
                      t('typography')
                    )
                  ),
                  React.createElement('div', { className: 'rl-item-desc' }, t('typographyDesc'))
                ),
                React.createElement('div', { className: 'rl-item-card' },
                  React.createElement('div', { className: 'rl-item-head' },
                    React.createElement('label', { className: 'rl-item-label' },
                      checkbox(typography.liveInput !== false && ruActive,
                        (ev) => setTypo({ liveInput: ev.target.checked }), !ruActive || disabled),
                      t('liveInput')
                    )
                  ),
                  React.createElement('div', { className: 'rl-item-desc' }, t('liveInputDesc'))
                ),
                React.createElement('div', { className: 'rl-item-card' },
                  React.createElement('div', { className: 'rl-item-head' },
                    React.createElement('label', { className: 'rl-item-label' },
                      checkbox(typography.yo === true && ruActive,
                        (ev) => setTypo({ yo: ev.target.checked }), !ruActive || disabled),
                      t('yo')
                    )
                  ),
                  React.createElement('div', { className: 'rl-item-desc' }, t('yoDesc'))
                ),
                React.createElement('div', { className: 'rl-item-card' },
                  React.createElement('div', { className: 'rl-item-head' },
                    React.createElement('label', { className: 'rl-item-label' },
                      checkbox(value.slashAliases !== false && ruActive,
                        (ev) => {
                          try { scope.set('slashAliases', ev.target.checked) } catch (err) {}
                        }, !ruActive || disabled),
                      t('slashAliases')
                    )
                  ),
                  React.createElement('div', { className: 'rl-item-desc' }, t('slashAliasesDesc'))
                )
              ),
              React.createElement('div', { className: 'rl-hotkey-box' },
                React.createElement('span', { className: 'rl-hotkey-tag' }, '⌨️ Alt+L'),
                React.createElement('span', null, t('altLHintText'))
              )
            ),

            React.createElement('div', { className: 'rl-section-card' },
              React.createElement('div', { className: 'rl-section-title' },
                React.createElement('span', null, t('secAgentPrompt')),
                React.createElement('span', { className: 'rl-badge ' + (value.agentPrompt ? 'rl-badge-ok' : 'rl-badge-dim') },
                  value.agentPrompt ? 'Активен' : 'Выключен')
              ),
              React.createElement('div', { className: 'rl-section-desc' }, t('secAgentPromptDesc')),
              React.createElement('div', { className: 'rl-item-card' },
                React.createElement('div', { className: 'rl-item-head' },
                  React.createElement('label', { className: 'rl-item-label' },
                    checkbox(value.agentPrompt === true,
                      (ev) => {
                        try {
                          const r = scope.set('agentPrompt', ev.target.checked)
                          if (r && typeof r.catch === 'function') r.catch((err) => {
                            console.warn('dsh-russian-lang: scope.set agentPrompt failed', err && err.message || err)
                          })
                        } catch (err) {
                          console.warn('dsh-russian-lang: scope.set agentPrompt sync threw', err && err.message || err)
                        }
                      }, false),
                    t('agentPrompt')
                  )
                ),
                React.createElement('div', { className: 'rl-item-desc' }, t('agentPromptDesc'))
              ),
              value.agentPrompt ? React.createElement(React.Fragment, null,
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
                  React.createElement('label', { className: 'rl-item-label', style: { fontWeight: 500 } }, t('agentPromptPreset')),
                  React.createElement('select', {
                    className: 'rl-select',
                    value: value.agentPromptPreset || 'technical_expert',
                    onChange: (ev) => {
                      try {
                        const val = ev.target.value
                        scope.set('agentPromptPreset', val)
                      } catch (err) { console.warn('dsh-russian-lang: set agentPromptPreset failed', err) }
                    }
                  },
                    React.createElement('option', { value: 'technical_expert' }, t('presetExpert')),
                    React.createElement('option', { value: 'tech_writer' }, t('presetWriter')),
                    React.createElement('option', { value: 'concise' }, t('presetConcise'))
                  )
                ),
                presetInfo ? React.createElement('div', { className: 'rl-preview-box' },
                  React.createElement('div', { style: { fontWeight: 600, marginBottom: '4px', color: 'var(--dsw-alias-label-primary)' } }, '💬 ' + presetInfo.label + ':'),
                  presetInfo.text
                ) : null
              ) : null
            ),

            React.createElement('div', { className: 'rl-section-card' },
              React.createElement('div', { className: 'rl-section-title' },
                React.createElement('span', null, t('secUpdater')),
                React.createElement('span', { className: 'rl-badge ' + (upStatus.updateAvailable ? 'rl-badge-warn' : 'rl-badge-ok') },
                  upStatus.updateAvailable ? t('badgeUpdateAvailable') : t('badgeUpToDate'))
              ),
              React.createElement('div', { className: 'rl-section-desc' }, t('secUpdaterDesc')),
              React.createElement('div', { className: 'rl-item-card' },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' } },
                  React.createElement('div', null,
                    React.createElement('div', { style: { fontWeight: 600, color: 'var(--dsw-alias-label-primary)' } },
                      t('updaterCurrent').replace('{version}', upStatus.currentVersion || '0.2.20')),
                    upStatus.updateAvailable
                      ? React.createElement('div', { style: { color: 'var(--dsw-alias-color-warning, #eab308)', marginTop: '2px', fontWeight: 500 } },
                          t('updaterLatest').replace('{version}', upStatus.latestVersion || ''))
                      : React.createElement('div', { style: { color: 'var(--dsw-alias-label-secondary)', marginTop: '2px' } },
                          t('updaterUpToDate'))
                  ),
                  upStatus.updateAvailable
                    ? React.createElement('button', {
                        type: 'button',
                        className: 'rl-btn rl-btn-primary',
                        disabled: upLoading,
                        onClick: triggerUpdate,
                      }, upLoading ? t('updaterUpdating') : t('updaterBtn').replace('{version}', upStatus.latestVersion || ''))
                    : React.createElement('button', {
                        type: 'button',
                        className: 'rl-btn',
                        disabled: upLoading,
                        onClick: checkUpdate,
                      }, upLoading ? t('updaterChecking') : t('updaterCheckBtn'))
                ),
                upMsg ? React.createElement('div', {
                  style: {
                    marginTop: '10px', padding: '8px 12px', borderRadius: '8px',
                    background: upMsg.type === 'ok' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: upMsg.type === 'ok' ? '#16a34a' : '#dc2626', fontSize: '12px', fontWeight: 500
                  }
                }, upMsg.text) : null
              )
            ),

            React.createElement('div', { className: 'rl-section-card' },
              React.createElement('div', { className: 'rl-section-title' },
                React.createElement('span', null, t('secSupport')),
                React.createElement('span', { className: 'rl-badge rl-badge-ok' }, '🟢 100.0%')
              ),
              React.createElement('div', { className: 'rl-section-desc' }, t('secSupportDesc')),
              React.createElement('div', { className: 'rl-grid-3' },
                React.createElement('div', { className: 'rl-stat-box' },
                  React.createElement('div', { className: 'rl-stat-val' }, '113'),
                  React.createElement('div', { className: 'rl-stat-label' }, t('statNamespaces'))
                ),
                React.createElement('div', { className: 'rl-stat-box' },
                  React.createElement('div', { className: 'rl-stat-val' }, '1 225'),
                  React.createElement('div', { className: 'rl-stat-label' }, t('statCoreKeys'))
                ),
                React.createElement('div', { className: 'rl-stat-box' },
                  React.createElement('div', { className: 'rl-stat-val' }, '5 924'),
                  React.createElement('div', { className: 'rl-stat-label' }, t('statPluginKeys'))
                )
              ),
              React.createElement('div', { className: 'rl-actions-row' },
                React.createElement('a', {
                  href: makeIssueUrl({}, '0.2.20'),
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'rl-btn rl-btn-primary'
                }, '💬 ' + t('reportIssue')),
                React.createElement('div', { className: 'rl-hint-text', style: { flex: 1 } },
                  t('exportMdHint')
                )
              )
            )
          )
        )
      )
    }

    const RL_CSS = [
      '.rl-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;overflow:hidden;transition:border-color .15s ease}',
      '.rl-head{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;display:flex;align-items:center;gap:12px;padding:14px 18px}',
      '.rl-head:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.rl-head-main{flex:1;display:flex;flex-direction:column;gap:4px}',
      '.rl-title{color:var(--dsw-alias-label-primary);font-size:16px;font-weight:600;line-height:1.4;display:flex;align-items:center;flex-wrap:wrap;gap:8px}',
      '.rl-sub{color:var(--dsw-alias-label-secondary);font-size:13px}',
      '.rl-chev{margin-left:auto;flex:none;color:var(--dsw-alias-label-tertiary);display:inline-flex;transition:transform .16s}',
      '.rl-chev-open{transform:rotate(180deg)}',
      '.rl-body{border-top:1px solid var(--dsw-alias-border-l2);padding:18px}',
      '.rl-page{display:flex;flex-direction:column;gap:16px;max-width:960px}',
      '.rl-section-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:10px;padding:16px 18px;display:flex;flex-direction:column;gap:12px}',
      '.rl-section-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.rl-section-desc{font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:-4px;line-height:1.4}',
      '.rl-grid-2{display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:10px}',
      '.rl-grid-3{display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px}',
      '.rl-badge{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);display:inline-flex;align-items:center;gap:4px;font-weight:500}',
      '.rl-badge-ok{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary);background:rgba(16,185,129,0.08)}',
      '.rl-badge-warn{border-color:var(--dsw-alias-state-warning-primary);color:var(--dsw-alias-state-warning-primary);background:rgba(245,158,11,0.08)}',
      '.rl-badge-dim{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-3)}',
      '.rl-item-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:4px}',
      '.rl-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.rl-item-label{font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:8px;cursor:pointer}',
      '.rl-item-desc{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4}',
      '.rl-stat-box{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:2px}',
      '.rl-stat-val{font-size:16px;font-weight:700;color:var(--dsw-alias-label-primary)}',
      '.rl-stat-label{font-size:11px;color:var(--dsw-alias-label-secondary);letter-spacing:0.3px}',
      '.rl-hotkey-box{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.4;display:flex;align-items:flex-start;gap:10px}',
      '.rl-hotkey-tag{font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);white-space:nowrap}',
      '.rl-preview-box{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.4}',
      '.rl-btn{appearance:none;font:inherit;cursor:pointer;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:6px 12px;font-size:12px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:all .15s ease;text-decoration:none}',
      '.rl-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-label-secondary)}',
      '.rl-btn-primary{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);border-color:transparent}',
      '.rl-btn-primary:hover:not(:disabled){opacity:0.9}',
      '.rl-select{height:32px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:6px;padding:0 8px;font-size:12px;outline:none;width:100%;max-width:380px}',
      '.rl-select:focus{border-color:var(--dsw-alias-state-brand-primary)}',
      '.rl-check{width:16px;height:16px;accent-color:var(--dsw-alias-label-primary);cursor:pointer;flex-shrink:0}',
      '.rl-hint-text{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4}',
      '.rl-actions-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding-top:4px}',
      '.rl-lang-chip{appearance:none;cursor:pointer;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;display:inline-flex;align-items:center;transition:all .15s;margin:0 4px}',
      '.rl-lang-chip:hover{border-color:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary)}',
      '.rl-lang-chip-active{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}',
      '.rl-action-btn{appearance:none;background:0 0;border:1px solid transparent;border-radius:4px;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:11px;padding:2px 5px;display:inline-flex;align-items:center;transition:all .15s}',
      '.rl-action-btn:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3)}',
      '.rl-action-btn-active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}',
      '.rl-turn-translation{margin:8px 0;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:8px;font-size:13px;line-height:1.5}',
      '.rl-trans-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;border-bottom:1px solid var(--dsw-alias-border-l2);padding-bottom:4px}',
      '.rl-trans-title{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);text-transform:uppercase;letter-spacing:0.5px}',
      '.rl-trans-tools{display:flex;gap:4px}',
      '.rl-trans-btn{appearance:none;background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:2px 7px;border-radius:4px;font-size:11px}',
      '.rl-trans-btn:hover{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}',
      '.rl-trans-body{color:var(--dsw-alias-label-primary);white-space:pre-wrap;word-break:break-word;user-select:text}',
      '.rl-export-md-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);height:32px;color:var(--dsw-alias-label-primary);cursor:pointer;background:transparent;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:6px 12px;font-size:13px;font-weight:500;display:inline-flex;white-space:nowrap;margin-left:6px;transition:all .15s ease}',
      '.rl-export-md-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}',
    ].join('\n')
    const STYLE_ID = 'dsh-russian-lang-styles'
    if (typeof document !== 'undefined' && (document.getElementById && !document.getElementById(STYLE_ID))) {
      const tag = document.createElement('style')
      tag.id = STYLE_ID
      tag.dataset.dshPlugin = 'dsh-russian-lang'
      tag.dataset.plugin = '@goodandready/dsh-russian-lang'
      tag.dataset.pluginCss = 'rl-card'
      tag.textContent = RL_CSS
      document.head.appendChild(tag)
    }

    module.exports = { apply, inject: ['locale', 'connection', 'remote', 'settingsScope', 'slots'] }
    return module.exports
  },
})
