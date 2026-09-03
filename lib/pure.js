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

// ---------------------------------------------------------------- форматы

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

export const formatNumber = (val) => {
  const n = typeof val === 'number' ? val : Number(val)
  return isNaN(n) ? String(val) : numberFormat.format(n)
}

export const formatCurrency = (val, cur) => {
  const n = typeof val === 'number' ? val : Number(val)
  if (isNaN(n)) return String(val)
  return getCurrencyFormat(cur).format(n)
}

export const formatRelativeTime = (val, unit) => {
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

// -------------------------------------------------------------- склонения

export const INFLECT_CUSTOM = {
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

export const inflectWord = (word, cName) => {
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

export const inflect = (phrase, cName) => {
  if (!phrase || typeof phrase !== 'string') return phrase
  if (!INFLECT_CASES.has(cName)) return phrase
  return phrase.split(' ').map((w) => inflectWord(w, cName)).join(' ')
}

// ------------------------------------------------- подстановка и плюрализация

export const fill = (template, params) => String(template).replace(/\{(\w+)(?::(\w+))?\}/g, (match, name, spec) => {
  if (!(name in params)) return match
  const val = params[name]
  if (spec === 'number') return formatNumber(val)
  if (spec === 'reltime') return formatRelativeTime(val)
  if (spec === 'currency') return formatCurrency(val, params.currency || 'RUB')
  if (INFLECT_CASES.has(spec)) return inflect(String(val), spec)
  return String(val)
})

const pluralRules = new Intl.PluralRules('ru-RU')

/** Русская форма числительного: one | few | many | other. */
export const pluralForm = (n) => pluralRules.select(n)

// ------------------------------------------------------ поисковая морфология

export const stemRussian = (word) => {
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

export const EN_RU_KEYS = {
  'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ',
  'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'э',
  'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю'
}

export const translitEnToRu = (str) => str.toLowerCase().split('').map((c) => EN_RU_KEYS[c] || c).join('')

export const fuzzyMatchRu = (query, target) => {
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

// ------------------------------------------------------------- ошибки

export const ERROR_MAP = {
  ENOENT: { title: 'Файл не найден', message: 'Указанный файл или директория не существуют', hint: 'Проверьте правильность указанного пути к файлу.' },
  EACCES: { title: 'Отказано в доступе', message: 'Недостаточно прав для чтения или записи', hint: 'Проверьте права доступа к файлу или директории (chmod/chown).' },
  EPERM: { title: 'Операция запрещена', message: 'Недостаточно системных привилегий', hint: 'Запустите процесс с соответствующими правами.' },
  ECONNREFUSED: { title: 'Соединение отклонено', message: 'Целевой сервер или сервис не отвечает', hint: 'Убедитесь, что локальный или удаленный сервис запущен и слушает порт.' },
  ETIMEDOUT: { title: 'Таймаут соединения', message: 'Превышено время ожидания ответа', hint: 'Проверьте стабильность сети или увеличьте лимит ожидания.' },
  ENOTFOUND: { title: 'Хост не найден', message: 'Не удалось разрешить сетевой адрес', hint: 'Проверьте правильность URL или настройки DNS.' },
  EADDRINUSE: { title: 'Порт уже занят', message: 'Сетевой порт используется другим процессом', hint: 'Остановите конфликтующий процесс или выберите другой порт.' },
  401: { title: 'Требуется авторизация', message: 'API-ключ или токен отсутствуют или недействительны', hint: 'Проверьте настройки учетных данных и актуальность токена.' },
  403: { title: 'Доступ запрещен', message: 'Недостаточно прав для выполнения операции', hint: 'Проверьте область действия токена или права роли.' },
  404: { title: 'Ресурс не найден', message: 'Запрошенный адрес или объект не существует', hint: 'Проверьте правильность пути или идентификатора ресурса.' },
  429: { title: 'Превышен лимит запросов', message: 'Слишком много запросов (Rate Limit)', hint: 'Подождите несколько минут перед повторным запросом.' },
  500: { title: 'Внутренняя ошибка сервера', message: 'На стороне сервера произошел сбой', hint: 'Попробуйте повторить запрос позже или проверьте серверные логи.' },
  502: { title: 'Ошибочный шлюз (Bad Gateway)', message: 'Промежуточный прокси не получил корректный ответ', hint: 'Проверьте работу нижележащей службы или upstream-сервера.' },
  503: { title: 'Служба временно недоступна', message: 'Сервер перегружен или находится на обслуживании', hint: 'Попробуйте повторить операцию через некоторое время.' }
}

const fromMap = (key, rawMsg) => ({
  code: String(key), title: ERROR_MAP[key].title, message: ERROR_MAP[key].message, hint: ERROR_MAP[key].hint, raw: rawMsg
})

export const humanizeError = (err) => {
  if (!err) return null
  const rawMsg = typeof err === 'string' ? err : (err.message || String(err))
  const code = err.code || (rawMsg.match(/\b(E[A-Z]{2,20})\b/) || [])[1]
  const status = err.status || err.statusCode || (rawMsg.match(/\b([45]\d{2})\b/) || [])[1]
  const lookupKey = code || status
  if (lookupKey && ERROR_MAP[lookupKey]) return fromMap(lookupKey, rawMsg)
  if (/rate limit|too many requests/i.test(rawMsg)) return fromMap(429, rawMsg)
  if (/unauthorized|invalid token|invalid api key/i.test(rawMsg)) return fromMap(401, rawMsg)
  return { code: 'UNKNOWN', title: 'Ошибка операции', message: rawMsg, hint: 'Проверьте параметры операции и логи.', raw: rawMsg }
}

// -------------------------------------------------------- отчёт об ошибке

/** Версию передаёт вызывающий: в бандл её подставляет build.py из package.json,
 *  чтобы строка не устаревала руками (в 0.1.31 здесь стояло «0.1.29»). */
export const makeIssueUrl = (opts = {}, version = '') => {
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
export const makePluginLocalizationStatus = (dicts) => (ns) => {
  const none = { status: 'none', count: 0, label: 'RU отсутствует' }
  if (!ns) return none
  const count = Object.keys((dicts && dicts[ns]) || {}).length
  return count > 0 ? { status: 'full', count, label: `RU: ${count} строк` } : none
}

// ---------------------------------------------------------- типографика

export const typoQuotes = (text) => text
  .replace(/"([^"\n]{1,200})"/g, '«$1»')
  .replace(/[“„]([^“”\n]{1,200})[”"]/g, '«$1»')
  .replace(/[『「]([^』」\n]{1,200})[』」]/g, '«$1»')

export const typoDash = (text) => text
  .replace(/(^|[\s(\[«])--(?=\s|$)/g, '$1—')
  .replace(/(^|[\s(\[«])-(?=\s)/g, '$1—')

export const typoPunct = (text) => text.replace(/\s+([,.:;!?])(?=\s|$)/g, '$1')

export const TYPO_SHORT = new Set(['в', 'с', 'к', 'о', 'у', 'а', 'и', 'но', 'не', 'ни', 'на', 'по', 'до', 'из', 'за', 'от', 'об'])

export const typoNbsp = (text) => text.replace(/(^|[\s(\[«])([а-яё]{1,2})(\s+)/g, (match, lead, word) => (
  TYPO_SHORT.has(word) ? lead + word + ' ' : match
))

// \b здесь не годится: он определён через \w = [A-Za-z0-9_], кириллица в \w не
// входит, поэтому границы слова перед «в» в «все» просто нет и ни одна якорная
// пара не срабатывала — вся ё-замена была мёртвым кодом (#132). Границу задаём
// явным lookaround по кириллице.
export const YO_EDGE_L = '(?<![а-яёА-ЯЁ])'
export const YO_EDGE_R = '(?![а-яёА-ЯЁ])'

/** Восстанавливает регистр совпадения: «ЕЩЕ» -> «ЕЩЁ», «Еще» -> «Ещё». */
export const yoCase = (src, repl) => {
  if (src === src.toUpperCase() && src !== src.toLowerCase()) return repl.toUpperCase()
  if (src[0] === src[0].toUpperCase()) return repl[0].toUpperCase() + repl.slice(1)
  return repl
}

/** pairs — [[«еще», «ещё»], ...] из build.py (ручные + корпусные, за вычетом
 *  омографов). Регистр разбирает yoCase, поэтому пара нужна одна на слово. */
export const makeTypoYo = (pairs) => {
  const compiled = pairs.map((p) => [new RegExp(YO_EDGE_L + p[0] + YO_EDGE_R, 'gi'), p[1]])
  return (text) => {
    for (const [re, repl] of compiled) text = text.replace(re, (match) => yoCase(match, repl))
    return text
  }
}

// ------------------------------------------------------- фикс раскладки

// Раскладочная карта шире поисковой: у конвертера есть «/» (слеш команды) и
// «`» (ё), поисковой транслитерации они не нужны.
export const LAYOUT_LAT_TO_CYR = { ...EN_RU_KEYS, '/': '.', '`': 'ё' }

export const LAYOUT_CYR_TO_LAT = (() => {
  const out = {}
  for (const k in LAYOUT_LAT_TO_CYR) out[LAYOUT_LAT_TO_CYR[k]] = k
  return out
})()

export const translit = (word, map) => {
  let out = ''
  for (const ch of word.toLowerCase()) out += map[ch] !== undefined ? map[ch] : ch
  return out
}

/** freq — частотный корпус, localDict — выученные за сессию слова (#67).
 *  Оба приходят снаружи: в бандле это встроенный список и Set в памяти,
 *  в тесте — фикстуры. */
export const makeLayout = (freq, localDict = new Set()) => {
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
    // cyr2lat — только для команды в инпуте (/...)
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
