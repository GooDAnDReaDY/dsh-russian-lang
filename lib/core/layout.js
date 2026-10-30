import { EN_RU_KEYS } from './format.js'
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


// ---------------------------------------------------- живая типографика инпута

// Предлоги и союзы, после которых ставится неразрывный пробел (U+00A0)
const SHORT_WORDS_RE = /(^|[\s(«])([вВнНсСпПоОкКуУиИаА]|из|от|до|за|по|со|во|ко|об|на|под|над|при|про|без|для|не|ни|но)( )/g

/**
 * Живая типографика для поля ввода DSH.
 * Заменяет кавычки "" на «», дефисы -- на тире —, многоточие ... на …,
 * и добавляет неразрывные пробелы после коротких предлогов.
 * ИГНОРИРУЕТ код внутри обратных кавычек `...` и блоков ```...```.
 */
export const formatInputLive = (text) => {
  if (!text || typeof text !== 'string') return text
  const parts = text.split(/(```[\s\S]*?```|`[^`\n]*`)/g)
  for (let i = 0; i < parts.length; i += 2) {
    let s = parts[i]
    if (!s) continue
    const lq = [], cf = []
    s = s.replace(/"([^"\n]*[a-zA-Z][^"\n]*)"/g, (m) => `\x01L${lq.push(m) - 1}\x01`)
    s = s.replace(/(^|\s)(--[a-zA-Z0-9_\u0400-\u04FF-]+)/g, (m, p1, p2) => `${p1}\x01C${cf.push(p2) - 1}\x01`)
    s = s.replace(/(^|\s)(--)(?=\s|$)/g, (m, p1, p2) => /[a-zA-Z]/.test(text) ? `${p1}\x01C${cf.push(p2) - 1}\x01` : m)
    s = s.replace(/--/g, '—')
    s = s.replace(/(^|[\s([{-])"/g, '$1«').replace(/"/g, '»')
    s = s.replace(SHORT_WORDS_RE, '$1$2\u00A0')
    s = s.replace(/\x01C(\d+)\x01/g, (_, j) => cf[+j]).replace(/\x01L(\d+)\x01/g, (_, j) => lq[+j])
    parts[i] = s
  }
  return parts.join('')
}

// ------------------------------------------------------- алиасы слэш-команд

export const RUSSIAN_SLASH_ALIASES = {
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
export const expandSlashAlias = (input) => {
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

// --------------------------------------------------- фонетический транслит

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

export const phoneticTranslit = (text, direction = 'lat2cyr') => {
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

// ---------------------------------------------------- детектор раскладки

/**
 * Определяет преобладающий язык ввода в тексте: 'RU', 'EN' или null.
 */
export const detectInputLayout = (text) => {
  if (!text || typeof text !== 'string') return null
  const clean = text.replace(/`[^`]*`/g, '').replace(/https?:\/\/\S+/g, '')
  let cyr = 0
  let lat = 0
  for (const ch of clean) {
    const code = ch.charCodeAt(0)
    if ((code >= 0x0400 && code <= 0x04FF) || code === 0x0500) cyr++;
    else if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) lat++;
  }
  if (cyr > lat && cyr >= 2) return 'RU'
  if (lat > cyr && lat >= 2) return 'EN'
  return null
}

