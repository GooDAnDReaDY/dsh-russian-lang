// ---------------------------------------------------------------- форматы

const numberFormat = new Intl.NumberFormat('ru-RU')
const compactNumberFormat = new Intl.NumberFormat('ru-RU', { notation: 'compact', compactDisplay: 'short' })
const relativeTimeFormat = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' })

const datePresetFormats = {
  short: new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  shortDateTime: new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  medium: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  long: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
  time: new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
}

export const formatDate = (val, style = 'short') => {
  if (val === null || val === undefined || val === '') return ''
  const d = val instanceof Date ? val : new Date(typeof val === 'number' && val < 1e12 ? val * 1000 : val)
  if (isNaN(d.getTime())) return String(val)
  if (typeof style === 'string' && datePresetFormats[style]) {
    return datePresetFormats[style].format(d)
  }
  if (typeof style === 'object' && style !== null) {
    try {
      return new Intl.DateTimeFormat('ru-RU', style).format(d)
    } catch (_) {
      return datePresetFormats.short.format(d)
    }
  }
  return datePresetFormats.short.format(d)
}

export const formatCompactNumber = (val) => {
  if (val === null || val === undefined || val === '') return ''
  const n = typeof val === 'number' ? val : Number(val)
  return isNaN(n) ? String(val) : compactNumberFormat.format(n)
}

export const formatTokens = (count, compact = false) => {
  if (count === null || count === undefined || count === '') return ''
  const n = typeof count === 'number' ? count : Number(count)
  if (isNaN(n)) return String(count)
  const tokenWord = plural(n, ['токен', 'токена', 'токенов'])
  if (compact && n >= 1000) {
    return `${compactNumberFormat.format(n)} токенов`
  }
  return `${numberFormat.format(n)} ${tokenWord}`
}
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
  if (val === null || val === undefined || val === '') return ''
  const n = typeof val === 'number' ? val : Number(val)
  return isNaN(n) ? String(val) : numberFormat.format(n)
}

export const formatCurrency = (val, cur) => {
  if (val === null || val === undefined || val === '') return ''
  const n = typeof val === 'number' ? val : Number(val)
  if (isNaN(n)) return String(val)
  return getCurrencyFormat(cur).format(n)
}

export const formatRelativeTime = (val, unit) => {
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

const pluralRules = new Intl.PluralRules('ru-RU')

/** Русская форма числительного: one | few | many | other. */
export const pluralForm = (n) => pluralRules.select(n)

/**
 * Универсальная русская плюрализация 1, 2-4, 5+
 * @param {number|string} count - Число элементов
 * @param {string[]|string} forms - Массив [one, few, many] или строка первого варианта
 * @param {boolean} [withCount=false] - Включать ли число в результат ("5 задач" vs "задач")
 */
export function plural(count, forms, withCount = false) {
  const n = typeof count === 'number' ? count : (Number(count) || 0)
  let one = '', few = '', many = ''
  if (Array.isArray(forms)) {
    one = forms[0] || ''
    few = forms[1] || one
    many = forms[2] || few || one
  } else if (typeof forms === 'string') {
    one = forms
    few = arguments[2] || one
    many = arguments[3] || few || one
    withCount = arguments[4] || false
  } else {
    return ''
  }
  const form = pluralRules.select(n)
  let word = many
  if (form === 'one') word = one
  else if (form === 'few') word = few
  else if (form === 'many') word = many

  return withCount ? `${formatNumber(n)} ${word}` : word
}

export const fill = (template, params) => {
  if (!params || typeof params !== 'object') return String(template)
  return String(template).replace(/\{(\w+)(?::([^}]+))?\}/g, (match, name, spec) => {
    if (!(name in params)) return match
    const val = params[name]
    if (!spec) return String(val)
    if (spec === 'number') return formatNumber(val)
    if (spec === 'compact') return formatCompactNumber(val)
    if (spec === 'tokens') return formatTokens(val)
    if (spec === 'tokens:compact') return formatTokens(val, true)
    if (spec === 'reltime') return formatRelativeTime(val)
    if (spec === 'currency') return formatCurrency(val, params.currency || 'RUB')
    if (spec === 'date') return formatDate(val)
    if (spec.startsWith('date:')) return formatDate(val, spec.slice(5))
    if (spec.startsWith('plural:')) {
      const parts = spec.slice(7).split(',')
      return plural(val, parts)
    }
    if (INFLECT_CASES.has(spec)) return inflect(String(val), spec)
    return String(val)
  })
}

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
    if (tStems.some((ts) => ts.startsWith(qs) || qs.startsWith(ts))) matched++;
  }
  if (matched === qStems.length && qStems.length > 0) return 80
  if (matched > 0) return 50
  return 0
}

