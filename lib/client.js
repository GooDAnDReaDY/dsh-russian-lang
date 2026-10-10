window.__ModuleLoader__.load({id: '@goodandready/dsh-russian-lang',factory: (require) => {var module = { exports: {} }
var React = null
try { React = require('react') } catch (e) {  void e; }
const h = (...args) => (React ? React.createElement(...args) : null)
let isInspectorActive = false
let hoverBoxEl = null
let pillEl = null
let updateInspectorPill = () => {}
const numberFormat = new Intl.NumberFormat('ru-RU')
const compactNumberFormat = new Intl.NumberFormat('ru-RU', { notation: 'compact', compactDisplay: 'short' })
const relativeTimeFormat = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' })
const datePresetFormats = {short: new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),shortDateTime: new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),medium: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),long: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),time: new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),}
const formatDate = (val, style = 'short') => {if (val === null || val === undefined || val === '') return ''
const d = val instanceof Date ? val : new Date(typeof val === 'number' && val < 1e12 ? val * 1000 : val)
if (isNaN(d.getTime())) return String(val)
if (typeof style === 'string' && datePresetFormats[style]) {return datePresetFormats[style].format(d)
}
if (typeof style === 'object' && style !== null) {try {return new Intl.DateTimeFormat('ru-RU', style).format(d)
} catch (_) {return datePresetFormats.short.format(d)
}}
return datePresetFormats.short.format(d)
}
const formatCompactNumber = (val) => {if (val === null || val === undefined || val === '') return ''
const n = typeof val === 'number' ? val : Number(val)
return isNaN(n) ? String(val) : compactNumberFormat.format(n)
}
const formatTokens = (count, compact = false) => {if (count === null || count === undefined || count === '') return ''
const n = typeof count === 'number' ? count : Number(count)
if (isNaN(n)) return String(count)
const tokenWord = plural(n, ['токен', 'токена', 'токенов'])
if (compact && n >= 1000) {return `${compactNumberFormat.format(n)} токенов`
}
return `${numberFormat.format(n)} ${tokenWord}`
}
const currencyFormats = new Map()
const getCurrencyFormat = (cur) => {const c = (cur || 'RUB').toUpperCase()
if (!currencyFormats.has(c)) {try {currencyFormats.set(c, new Intl.NumberFormat('ru-RU', { style: 'currency', currency: c }))
} catch (e) {currencyFormats.set(c, numberFormat)
}}
return currencyFormats.get(c)
}
const formatNumber = (val) => {if (val === null || val === undefined || val === '') return ''
const n = typeof val === 'number' ? val : Number(val)
return isNaN(n) ? String(val) : numberFormat.format(n)
}
const formatCurrency = (val, cur) => {if (val === null || val === undefined || val === '') return ''
const n = typeof val === 'number' ? val : Number(val)
if (isNaN(n)) return String(val)
return getCurrencyFormat(cur).format(n)
}
const formatRelativeTime = (val, unit) => {if (val === null || val === undefined || val === '') return ''
if (typeof val === 'number' && typeof unit === 'string') {return relativeTimeFormat.format(val, unit)
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
const INFLECT_CUSTOM = {'пользователь': { gen: 'пользователя', dat: 'пользователю', acc: 'пользователя', ins: 'пользователем', pre: 'пользователе' },'агент': { gen: 'агента', dat: 'агенту', acc: 'агента', ins: 'агентом', pre: 'агенте' },'субагент': { gen: 'субагента', dat: 'субагенту', acc: 'субагента', ins: 'субагентом', pre: 'субагенте' },'модель': { gen: 'модели', dat: 'модели', acc: 'модель', ins: 'моделью', pre: 'модели' },'промпт': { gen: 'промпта', dat: 'промпту', acc: 'промпт', ins: 'промптом', pre: 'промпте' },'инструмент': { gen: 'инструмента', dat: 'инструменту', acc: 'инструмент', ins: 'инструментом', pre: 'инструменте' },'сессия': { gen: 'сессии', dat: 'сессии', acc: 'сессию', ins: 'сессией', pre: 'сессии' },'ветка': { gen: 'ветки', dat: 'ветке', acc: 'ветку', ins: 'веткой', pre: 'ветке' },'файл': { gen: 'файла', dat: 'файлу', acc: 'файл', ins: 'файлом', pre: 'файле' },'папка': { gen: 'папки', dat: 'папке', acc: 'папку', ins: 'папкой', pre: 'папке' }}
const keepCase = (src, out) => (src[0] === src[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out)
const inflectWord = (word, cName) => {if (!word || typeof word !== 'string') return word
const lower = word.toLowerCase()
if (INFLECT_CUSTOM[lower] && INFLECT_CUSTOM[lower][cName]) {return keepCase(word, INFLECT_CUSTOM[lower][cName])
}
if (/[a-zA-Z0-9_-]/.test(word) || /^[А-ЯЁ]{2,}$/.test(word)) return word
if (/[оеиую]$/i.test(word) && !/(ко|ло|но|то|во|ро|до|по|со|мо|го)$/i.test(word)) return word
const w = lower
const endings = [['ия', 2, (s) => ({ gen: s + 'ии', dat: s + 'ии', acc: s + 'ию', ins: s + 'ией', pre: s + 'ии' })],['а', 1, (s) => {const genEnd = /[гкхжшчщ]/.test(s.slice(-1)) ? 'и' : 'ы'
return { gen: s + genEnd, dat: s + 'е', acc: s + 'у', ins: s + 'ой', pre: s + 'е' }}],['я', 1, (s) => ({ gen: s + 'и', dat: s + 'е', acc: s + 'ю', ins: s + 'ей', pre: s + 'е' })],['ь', 1, (s) => ({ gen: s + 'и', dat: s + 'и', acc: s + 'ь', ins: s + 'ью', pre: s + 'и' })],['й', 1, (s) => ({ gen: s + 'я', dat: s + 'ю', acc: s + 'я', ins: s + 'ем', pre: s + 'е' })]
]
for (const [suffix, cut, build] of endings) {if (w.endsWith(suffix)) return keepCase(word, build(w.slice(0, -cut))[cName] || w)
}
if (/[бвгджзклмнпрстфхцчшщ]$/.test(w)) {const map = { gen: w + 'а', dat: w + 'у', acc: w, ins: w + 'ом', pre: w + 'е' }
return keepCase(word, map[cName] || w)
}
return word
}
const INFLECT_CASES = new Set(['gen', 'dat', 'acc', 'ins', 'pre'])
const inflect = (phrase, cName) => {if (!phrase || typeof phrase !== 'string') return phrase
if (!INFLECT_CASES.has(cName)) return phrase
return phrase.split(' ').map((w) => inflectWord(w, cName)).join(' ')
}
const pluralRules = new Intl.PluralRules('ru-RU')
const pluralForm = (n) => pluralRules.select(n)
function plural(count, forms, withCount = false) {const n = typeof count === 'number' ? count : (Number(count) || 0)
let one = '', few = '', many = ''
if (Array.isArray(forms)) {one = forms[0] || ''
few = forms[1] || one
many = forms[2] || few || one
} else if (typeof forms === 'string') {one = forms
few = arguments[2] || one
many = arguments[3] || few || one
withCount = arguments[4] || false
} else {return ''
}
const form = pluralRules.select(n)
let word = many
if (form === 'one') word = one
else if (form === 'few') word = few
else if (form === 'many') word = many
return withCount ? `${formatNumber(n)} ${word}` : word
}
const fill = (template, params) => {if (!params || typeof params !== 'object') return String(template)
return String(template).replace(/\{(\w+)(?::([^}]+))?\}/g, (match, name, spec) => {if (!(name in params)) return match
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
if (spec.startsWith('plural:')) {const parts = spec.slice(7).split(',')
return plural(val, parts)
}
if (INFLECT_CASES.has(spec)) return inflect(String(val), spec)
return String(val)
})
}
const stemRussian = (word) => {if (!word || typeof word !== 'string') return ''
let w = word.toLowerCase().trim()
if (w.length < 4) return w
w = w.replace(/(?:вшись|вши|ившись|ивши|ывшись|ывши|ив|ыв)$/, '')
w = w.replace(/(?:ся|сь)$/, '')
w = w.replace(/(?:ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|ему|ому|их|ых|ую|юю|ая|яя|ою|ею)$/, '')
w = w.replace(/(?:ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|ыло|ено|ят|ует|уют|ит|ыт|ены|ить|ыть|ишь|ую|ю)$/, '')
w = w.replace(/(?:ами|ями|иями|ией|иям|ием|ах|ях|иях|ев|ов|ие|ье|ей|ой|ий|ям|ем|ам|ом|а|е|и|о|у|ы|ь|ю|я)$/, '')
return w.length >= 2 ? w : word.toLowerCase()
}
const EN_RU_KEYS = {'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ','a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'э','z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю'
}
const translitEnToRu = (str) => str.toLowerCase().split('').map((c) => EN_RU_KEYS[c] || c).join('')
const fuzzyMatchRu = (query, target) => {if (!query || !target) return 0
const q = query.toLowerCase().trim()
const t = target.toLowerCase().trim()
if (t === q) return 100
if (t.includes(q)) return 90
if (t.includes(translitEnToRu(q))) return 85
const qStems = q.split(/\s+/).map(stemRussian).filter(Boolean)
const tStems = t.split(/\s+/).map(stemRussian).filter(Boolean)
let matched = 0
for (const qs of qStems) {if (tStems.some((ts) => ts.startsWith(qs) || qs.startsWith(ts))) matched++
}
if (matched === qStems.length && qStems.length > 0) return 80
if (matched > 0) return 50
return 0
}
const ERROR_MAP = {ENOENT: { title: 'Файл не найден', message: 'Указанный файл или директория не существуют', hint: 'Проверьте правильность указанного пути к файлу.' },EACCES: { title: 'Отказано в доступе', message: 'Недостаточно прав для чтения или записи', hint: 'Проверьте права доступа к файлу или директории (chmod/chown).' },EPERM: { title: 'Операция запрещена', message: 'Недостаточно системных привилегий', hint: 'Запустите процесс с соответствующими правами.' },ECONNREFUSED: { title: 'Соединение отклонено', message: 'Целевой сервер или сервис не отвечает', hint: 'Убедитесь, что локальный или удаленный сервис запущен и слушает порт.' },ECONNRESET: { title: 'Сброс соединения', message: 'Соединение было принудительно разорвано удаленной стороной', hint: 'Проверьте стабильность сети и работу целевого сервера.' },ETIMEDOUT: { title: 'Таймаут соединения', message: 'Превышено время ожидания ответа', hint: 'Проверьте стабильность сети или увеличьте лимит ожидания.' },ENOTFOUND: { title: 'Хост не найден', message: 'Не удалось разрешить сетевой адрес', hint: 'Проверьте правильность URL или настройки DNS.' },EADDRINUSE: { title: 'Порт уже занят', message: 'Сетевой порт используется другим процессом', hint: 'Остановите конфликтующий процесс или выберите другой порт.' },ENOSPC: { title: 'Недостаточно места на диске', message: 'На устройстве закончилось свободное пространство', hint: 'Освободите место на диске и повторите операцию.' },400: { title: 'Некорректный запрос (Bad Request)', message: 'Параметры запроса не соответствуют ожидаемому формату', hint: 'Проверьте синтаксис команды или переданные аргументы.' },401: { title: 'Требуется авторизация', message: 'API-ключ или токен отсутствуют или недействительны', hint: 'Проверьте настройки учетных данных и актуальность токена.' },403: { title: 'Доступ запрещен', message: 'Недостаточно прав для выполнения операции', hint: 'Проверьте область действия токена или права роли.' },404: { title: 'Ресурс не найден', message: 'Запрошенный адрес или объект не существует', hint: 'Проверьте правильность пути или идентификатора ресурса.' },429: { title: 'Превышен лимит запросов', message: 'Слишком много запросов (Rate Limit)', hint: 'Подождите несколько минут перед повторным запросом.' },500: { title: 'Внутренняя ошибка сервера', message: 'На стороне сервера произошел сбой', hint: 'Попробуйте повторить запрос позже или проверьте серверные логи.' },502: { title: 'Ошибочный шлюз (Bad Gateway)', message: 'Промежуточный прокси не получил корректный ответ', hint: 'Проверьте работу нижележащей службы или upstream-сервера.' },503: { title: 'Служба временно недоступна', message: 'Сервер перегружен или находится на обслуживании', hint: 'Попробуйте повторить операцию через некоторое время.' },504: { title: 'Шлюз не отвечает (Gateway Timeout)', message: 'Превышено время ожидания ответа от upstream-сервера', hint: 'Попробуйте повторить запрос позже.' },FETCH_FAILED: { title: 'Сетевой запрос не удался', message: 'Не удалось связаться с сервером (Failed to fetch)', hint: 'Проверьте сетевое подключение и доступность адреса.' },CORS_ERROR: { title: 'Ошибка CORS', message: 'Запрос заблокирован политикой безопасности браузера', hint: 'Проверьте заголовки разрешённых источников на сервере.' },WS_CLOSED: { title: 'Разрыв WebSocket', message: 'Связь с сервером по WebSocket прервана', hint: 'Проверьте работу сервера и сетевой статус.' },QUOTA_EXCEEDED: { title: 'Исчерпана квота API', message: 'Превышен лимит запросов или баланс провайдера', hint: 'Проверьте баланс API-ключа в кабинете провайдера.' },CONTEXT_OVERFLOW: { title: 'Превышен контекст', message: 'Объём диалога превышает размер контекстного окна', hint: 'Очистите или сожмите историю сообщений сессии.' },MODEL_NOT_FOUND: { title: 'Модель не найдена', message: 'Указанная модель отсутствует или недоступна', hint: 'Проверьте идентификатор модели в настройках.' }}
const fromMap = (key, rawMsg) => ({code: String(key), title: ERROR_MAP[key].title, message: ERROR_MAP[key].message, hint: ERROR_MAP[key].hint, raw: rawMsg
})
const humanizeError = (err) => {if (!err) return null
const rawMsg = typeof err === 'string' ? err : (err.message || String(err))
const code = err.code || (rawMsg.match(/\b(E[A-Z]{2,20})\b/) || [])[1]
const status = err.status || err.statusCode || (err.response && err.response.status) || (rawMsg.match(/\b([45]\d{2})\b/) || [])[1]
const lookupKey = code || status
if (lookupKey && ERROR_MAP[lookupKey]) return fromMap(lookupKey, rawMsg)
if (/rate limit|too many requests/i.test(rawMsg)) return fromMap(429, rawMsg)
if (/unauthorized|invalid token|invalid api key/i.test(rawMsg)) return fromMap(401, rawMsg)
if (/failed to fetch|network\s*error|load\s*failed|net::err_/i.test(rawMsg)) return fromMap('FETCH_FAILED', rawMsg)
if (/cors|cross-origin/i.test(rawMsg)) return fromMap('CORS_ERROR', rawMsg)
if (/websocket.*(?:closed|failed)/i.test(rawMsg)) return fromMap('WS_CLOSED', rawMsg)
if (/insufficient_quota|quota\s*exceeded/i.test(rawMsg)) return fromMap('QUOTA_EXCEEDED', rawMsg)
if (/context.*(?:exceeded|overflow|length)/i.test(rawMsg)) return fromMap('CONTEXT_OVERFLOW', rawMsg)
if (/model.*not.*found|model.*does not exist/i.test(rawMsg)) return fromMap('MODEL_NOT_FOUND', rawMsg)
return { code: 'UNKNOWN', title: 'Ошибка операции', message: rawMsg, hint: 'Проверьте параметры операции и логи.', raw: rawMsg }}
const formatErrorToast = (err) => {const h = humanizeError(err)
if (!h) return null
return {type: 'error',title: h.title,description: h.message + (h.hint ? ' ' + h.hint : '')
}}
const extractPlaceholders = (text) => {if (!text || typeof text !== 'string') return []
const found = []
const braceMatches = text.match(/\{[a-zA-Z0-9_.-]+\}/g)
if (braceMatches) found.push(...braceMatches)
const printfMatches = text.match(/%(?:\d+\$)?[sdif]/g)
if (printfMatches) found.push(...printfMatches)
return [...new Set(found)]
}
const validatePlaceholders = (orig, trans) => {const origPlaceholders = extractPlaceholders(orig)
if (!origPlaceholders.length) {return { valid: true, missing: [], extra: [], error: null }}
const transPlaceholders = new Set(extractPlaceholders(trans))
const missing = origPlaceholders.filter((ph) => !transPlaceholders.has(ph))
const origSet = new Set(origPlaceholders)
const extra = [...transPlaceholders].filter((ph) => !origSet.has(ph))
return {valid: missing.length === 0,missing,extra,error: missing.length > 0 ? `Отсутствуют обязательные плейсхолдеры: ${missing.join(', ')}` : null
}}
const makeIssueUrl = (opts = {}, version = '') => {const repo = 'GooDAnDReaDY/dsh-russian-lang'
let title = opts.title
let bodyLines = []
const l = (k, v) => v ? `- **${k}**: \`${v}\`` : null
if (opts.isProposal) {const kLabel = opts.key || (opts.original ? String(opts.original).slice(0, 30) : 'исправление')
const tLabel = opts.plugin || opts.ns || 'Интерфейс'
title = title || `[Предложение перевода] ${tLabel}: ${kLabel}`
bodyLines = ['### 💡 Предлагаемое исправление перевода', '','| Поле | Значение |', '|---|---|',`| **Оригинал (EN/ZH)** | \`${opts.original || opts.en || '(неизвестен)'}\` |`,`| **Текущий перевод** | \`${opts.current || opts.ru || '(нет перевода)'}\` |`,opts.override ? `| **Активный оверрайд** | \`${opts.override}\` |` : null,`| **Предложенный перевод** | **${opts.proposal || '(не указан)'}** |`, '','### Технический контекст',`- **Namespace**: \`${opts.ns || '(DOM узел)'}\``,`- **Ключ**: \`${opts.key || '(DOM узел)'}\``,l('Плагин', opts.plugin),l('Версия плагина', opts.pluginVersion),l('Версия DSH', opts.dshVersion),l('Версия dsh-russian-lang', version),typeof navigator !== 'undefined' ? l('User Agent', navigator.userAgent) : null, '',opts.comment ? `### Комментарий автора предложения\n${opts.comment}\n` : null,'---', '_Отправлено через Инспектор перевода dsh-russian-lang._'
].filter(Boolean)
} else if (opts.missingKeys && Array.isArray(opts.missingKeys)) {const pName = opts.plugin || opts.ns || 'плагин'
title = title || `[Перевод] Запрос локализации для плагина ${pName}${opts.installedVersion ? ` (v${opts.installedVersion})` : ''}`
const maxK = 35
const kList = opts.missingKeys.slice(0, maxK).map((it) => {const k = typeof it === 'string' ? it : it.key
const en = typeof it === 'object' && it.en ? ` — "${it.en}"` : ''
return `- \`${k}\`${en}`
}).join('\n')
const trunc = opts.missingKeys.length > maxK ? `\n\n_... и ещё ${opts.missingKeys.length - maxK} ключей (список сокращён для ограничения длины URL)._` : ''
bodyLines = ['### 📊 Запрос локализации плагина',`Просьба добавить или дополнить русскую локализацию для плагина \`${pName}\`.`, '','### Состояние покрытия',`- **Плагин**: \`${pName}\``,opts.ns ? `- **Namespace**: \`${opts.ns}\`` : null,l('Установленная версия', opts.installedVersion),opts.verifiedVersion ? `- **Проверенная версия базы**: \`${opts.verifiedVersion}\`` : '- **Проверенная версия базы**: `не проверено`',opts.coveragePercent !== undefined ? `- **Текущее покрытие**: \`${opts.coveragePercent}%\`` : null,opts.totalKeys !== undefined ? `- **Всего ключей в базе**: \`${opts.totalKeys}\`` : null,`- **Недостающих ключей**: \`${opts.missingKeys.length}\``,l('Версия DSH', opts.dshVersion),l('Версия dsh-russian-lang', version),typeof navigator !== 'undefined' ? l('User Agent', navigator.userAgent) : null, '','### Список недостающих ключей', kList + trunc, '','---', '_Сгенерировано из Панели состояния локализации dsh-russian-lang._'
].filter(Boolean)
} else {title = title || (opts.plugin ? `[Перевод] Запрос локализации для плагина ${opts.plugin}` : '[Ошибка перевода] Неточный перевод фразы')
bodyLines = ['### Описание проблемы',opts.description || (opts.plugin ? `Просьба добавить русскую локализацию для плагина \`${opts.plugin}\`.` : 'Обнаружена неточность в переводе интерфейса.'), '','### Технический контекст',opts.ns ? `- **Namespace**: \`${opts.ns}\`` : null,opts.key ? `- **Ключ**: \`${opts.key}\`` : null,opts.en ? `- **Оригинал (EN)**: ${opts.en}` : null,opts.ru ? `- **Текущий перевод (RU)**: ${opts.ru}` : null,l('Плагин', opts.plugin),l('Версия dsh-russian-lang', version),typeof navigator !== 'undefined' ? l('User Agent', navigator.userAgent) : null, '','### Предлагаемый вариант перевода',opts.proposal || '_Опишите ваш вариант перевода..._'
].filter(Boolean)
}
const params = new URLSearchParams()
params.set('title', title)
params.set('body', bodyLines.join('\n'))
return `https://github.com/${repo}/issues/new?` + params.toString()
}
const makePluginLocalizationStatus = (dicts, enCatalog, inventory) => (ns, pkgName, installedVersion) => {const none = { status: 'none', count: 0, total: 0, percent: 0, missingKeys: [], verifiedVersion: null, installedVersion: installedVersion || null, label: 'RU отсутствует' }
if (!ns) return none
const ruMap = (dicts && dicts[ns]) || {}
const rawCount = Object.keys(ruMap).length
const supp = inventory && (inventory.supported_plugins || inventory)
const verifiedVersion = (supp && (supp[pkgName] || supp[ns] || supp['@goodandready/' + ns] || supp['@goodandready-private/' + ns])) || null
const ret = (st, c, tot, pct, mk, lbl) => ({status: st, count: c, total: tot, percent: pct, missingKeys: mk, verifiedVersion, installedVersion: installedVersion || null, label: lbl
})
if (enCatalog && typeof enCatalog === 'object') {const enMap = enCatalog[ns]
if (enMap && typeof enMap === 'object') {const enKeys = Object.keys(enMap)
const total = enKeys.length
const missingKeys = []
let translated = 0
for (const k of enKeys) {if (ruMap[k] !== undefined) translated++
else missingKeys.push({ key: k, en: enMap[k] })
}
if (total === 0) {return rawCount > 0
? ret('full', rawCount, rawCount, 100, [], `RU: ${rawCount} строк`)
: ret(verifiedVersion ? 'none' : 'unverified', 0, 0, 0, [], verifiedVersion ? 'RU отсутствует' : 'Не проверено')
}
const percent = Math.round((translated / total) * 100)
const status = missingKeys.length === 0 ? 'full' : (translated > 0 ? 'partial' : 'none')
const label = status === 'full' ? `RU: ${translated} строк (100%)` : (status === 'partial' ? `RU: ${translated}/${total} (${percent}%)` : 'RU отсутствует (0%)')
return ret(status, translated, total, percent, missingKeys, label)
}
if (rawCount > 0) return ret('full', rawCount, rawCount, 100, [], `RU: ${rawCount} строк`)
return ret(verifiedVersion ? 'none' : 'unverified', 0, 0, 0, [], verifiedVersion ? 'RU отсутствует' : 'Не проверено')
}
if (rawCount > 0) return ret('full', rawCount, rawCount, 100, [], `RU: ${rawCount} строк`)
return none
}
const typoQuotes = (text) => text
.replace(/"([^"\n]{1,200})"/g, '«$1»').replace(/[“„]([^“”\n]{1,200})[”"]/g, '«$1»').replace(/[『「]([^』」\n]{1,200})[』」]/g, '«$1»')
const typoDash = (text) => text
.replace(/(^|[\s(\[«])--(?=\s|$)/g, '$1—').replace(/(?<=[\p{L}\p{N}»\)]) - (?=[\p{L}\p{N}«\(])/gu, ' — ')
const typoPunct = (text) => text.replace(/\s+([,.:;!?])(?=\s|$)/g, '$1')
const TYPO_SHORT = new Set(['в', 'с', 'к', 'о', 'у', 'а', 'и', 'но', 'не', 'ни', 'на', 'по', 'до', 'из', 'за', 'от', 'об'])
const typoNbsp = (text) => text
.replace(/(^|[\s(\[«])([а-яё]{1,2})(\s+)/g, (match, lead, word) => (TYPO_SHORT.has(word) ? lead + word + ' ' : match
)).replace(/(\d) ([а-яё]{1,24})(?![а-яё])/giu, '$1 $2').replace(/(\d) ([%°₽$€£]|кб|КБ|МБ|ГБ)(?=\s|$)/giu, '$1 $2')
const YO_EDGE_L = '(?<![а-яёА-ЯЁ])'
const YO_EDGE_R = '(?![а-яёА-ЯЁ])'
const yoCase = (src, repl) => {if (src === src.toUpperCase() && src !== src.toLowerCase()) return repl.toUpperCase()
if (src[0] === src[0].toUpperCase()) return repl[0].toUpperCase() + repl.slice(1)
return repl
}
const makeTypoYo = (pairs) => {const list = typeof pairs === 'string'
? pairs.split('|').filter(Boolean).map((s) => s.split(':'))
: (pairs || [])
const compiled = list.map((p) => [new RegExp(YO_EDGE_L + p[0] + YO_EDGE_R, 'gi'), p[1]])
return (text) => {for (const [re, repl] of compiled) text = text.replace(re, (match) => yoCase(match, repl))
return text
}}
const LAYOUT_LAT_TO_CYR = { ...EN_RU_KEYS, '/': '.', '`': 'ё' }
const LAYOUT_CYR_TO_LAT = (() => {const out = {}
for (const k in LAYOUT_LAT_TO_CYR) out[LAYOUT_LAT_TO_CYR[k]] = k
return out
})()
const translit = (word, map) => {let out = ''
for (const ch of word.toLowerCase()) out += map[ch] !== undefined ? map[ch] : ch
return out
}
const makeLayout = (freq, localDict = new Set()) => {const ruWordFraction = (text) => {const words = text.toLowerCase().split(/[^а-яё]+/).filter(Boolean)
if (!words.length) return 0
return words.filter((w) => freq.has(w) || localDict.has(w)).length / words.length
}
const candidate = (value, direction) => {if (direction === 'lat2cyr') {const converted = translit(value, LAYOUT_LAT_TO_CYR)
if (!/[а-яё]{2}/.test(converted)) return null
if (ruWordFraction(converted) < 0.7) return null
return { converted }}
const converted = translit(value, LAYOUT_CYR_TO_LAT)
return converted.startsWith('/') ? { converted } : null
}
const learnWords = (text) => {for (const w of text.toLowerCase().split(/[^а-яё]+/).filter(Boolean)) {if (w.length >= 3) localDict.add(w)
}}
return { ruWordFraction, candidate, learnWords, localDict }}
const SHORT_WORDS_RE = /(^|[\s(«])([вВнНсСпПоОкКуУиИаА]|из|от|до|за|по|со|во|ко|об|на|под|над|при|про|без|для|не|ни|но)( )/g
const formatInputLive = (text) => {if (!text || typeof text !== 'string') return text
const parts = text.split(/(```[\s\S]*?```|`[^`\n]*`)/g)
for (let i = 0; i < parts.length; i += 2) {let s = parts[i]
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
const RUSSIAN_SLASH_ALIASES = {'/цель': '/goal','/справка': '/help','/задача': '/task','/контекст': '/context','/сжать': '/compact','/план': '/plan','/экспорт': '/export','/отзыв': '/feedback','/разрешение': '/permission','/разрешения': '/permission','/память': '/memory','/помощь': '/help','/очистить': '/clear','/сессия': '/session','/модель': '/model'
}
const expandSlashAlias = (input) => {if (!input || typeof input !== 'string' || !input.startsWith('/')) return input
const match = input.match(/^(\s*\/[^\s]+)(.*)$/)
if (!match) return input
const [, cmd, rest] = match
const lowerCmd = cmd.trim().toLowerCase()
if (RUSSIAN_SLASH_ALIASES[lowerCmd]) {return RUSSIAN_SLASH_ALIASES[lowerCmd] + rest
}
return input
}
const PHONETIC_LAT_TO_CYR = [['shch', 'щ'], ['yo', 'ё'], ['zh', 'ж'], ['ch', 'ч'], ['sh', 'ш'],['yu', 'ю'], ['ya', 'я'], ['ts', 'ц'],['a', 'а'], ['b', 'б'], ['v', 'в'], ['g', 'г'], ['d', 'д'], ['e', 'е'],['z', 'з'], ['i', 'и'], ['j', 'й'], ['k', 'к'], ['l', 'л'], ['m', 'м'],['n', 'н'], ['o', 'о'], ['p', 'п'], ['r', 'р'], ['s', 'с'], ['t', 'т'],['u', 'у'], ['f', 'ф'], ['h', 'х'], ['c', 'ц'], ['y', 'ы'], ['x', 'кс']
]
const PHONETIC_CYR_TO_LAT = [['щ', 'shch'], ['ё', 'yo'], ['ж', 'zh'], ['ч', 'ch'], ['ш', 'sh'],['ю', 'yu'], ['я', 'ya'], ['ц', 'ts'],['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'], ['е', 'e'],['з', 'z'], ['и', 'i'], ['й', 'j'], ['к', 'k'], ['л', 'l'], ['м', 'm'],['н', 'n'], ['о', 'o'], ['п', 'p'], ['р', 'r'], ['с', 's'], ['т', 't'],['у', 'u'], ['ф', 'f'], ['х', 'h'], ['ы', 'y'], ['э', 'e'], ['ъ', ''], ['ь', '']
]
const phoneticTranslit = (text, direction = 'lat2cyr') => {if (!text || typeof text !== 'string') return text
let res = text
const pairs = direction === 'lat2cyr' ? PHONETIC_LAT_TO_CYR : PHONETIC_CYR_TO_LAT
for (const [from, to] of pairs) {const fromUpper = from.toUpperCase()
const fromTitle = from[0].toUpperCase() + from.slice(1)
const toUpper = to.toUpperCase()
const toTitle = to[0] ? to[0].toUpperCase() + to.slice(1) : ''
if (from.length > 1) {res = res.replaceAll(fromUpper, toUpper)
res = res.replaceAll(fromTitle, toTitle)
}
res = res.replaceAll(from, to)
if (from.length === 1) {res = res.replaceAll(fromUpper, toUpper)
}}
return res
}
const detectInputLayout = (text) => {if (!text || typeof text !== 'string') return null
const clean = text.replace(/`[^`]*`/g, '').replace(/https?:\/\/\S+/g, '')
let cyr = 0
let lat = 0
for (const ch of clean) {const code = ch.charCodeAt(0)
if ((code >= 0x0400 && code <= 0x04FF) || code === 0x0500) cyr++
else if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) lat++
}
if (cyr > lat && cyr >= 2) return 'RU'
if (lat > cyr && lat >= 2) return 'EN'
return null
}
const SYSTEM_PROMPT_PRESETS = {technical_expert: {id: 'technical_expert',label: 'Технический эксперт',desc: 'Точная терминология, чистый код и русские комментарии',text: 'Отвечай пользователю на русском языке. Используй точную инженерную терминологию, пиши чистый код и русские комментарии.'
},tech_writer: {id: 'tech_writer',label: 'Технический писатель',desc: 'Структурированные тексты, Markdown и выверенная типографика',text: 'Отвечай пользователю на русском языке. Оформляй документацию в Markdown, строго соблюдай правила русской типографики («ёлочки», тире, «ё»).'
},concise: {id: 'concise',label: 'Лаконичный режим',desc: 'Краткие ёмкие ответы без вводных слов и воды',text: 'Отвечай пользователю на русском языке максимально кратко и ёмко. Без вводных слов и воды, сразу код или решение.'
},code_reviewer: {id: 'code_reviewer',label: 'Код-ревьюер',desc: 'Поиск багов, безопасность и архитектурный аудит',text: 'Анализируй код и отвечай на русском языке. Ищи уязвимости, граничные случаи и нарушения контрактов, предлагая исправления.'
},architect: {id: 'architect',label: 'Системный архитектор',desc: 'Контракты API/CLI, модульность и надёжность',text: 'Отвечай на русском языке как архитектор. Проектируй модульные системы, чёткие контракты API/CLI и надёжные решения без лишней сложности.'
},tutor: {id: 'tutor',label: 'Наставник (ментор)',desc: 'Понятные объяснения сложных концепций и пошаговый разбор',text: 'Отвечай на русском языке как наставник. Объясняй сложные темы простыми словами, наглядными аналогиями и пошаговыми примерами.'
}}
const exportSessionToMarkdown = (session, options = {}) => {if (!session) return ''
const {includeToolCalls = true,includeTimestamps = true,title: customTitle,footer: customFooter
} = options
const title = customTitle || session.title || session.name || 'Диалог DSH'
const date = session.createdAt ? new Date(session.createdAt) : new Date()
const dateStr = includeTimestamps ? new Intl.DateTimeFormat('ru-RU', {dateStyle: 'full',timeStyle: 'medium'
}).format(date) : null
const messages = Array.isArray(session.messages) ? session.messages : []
let md = `# 💬 ${title}\n\n`
if (dateStr) md += `> **Дата экспорта:** ${dateStr}\n`
if (session.model) md += `> **Модель:** \`${session.model}\`\n`
if (session.workspace) md += `> **Рабочая область:** \`${session.workspace}\`\n`
md += `> **Всего сообщений:** ${messages.length}\n\n---\n\n`
for (let idx = 0; idx < messages.length; idx++) {const msg = messages[idx]
const role = msg.role || 'unknown'
const roleName = role === 'user' ? '👤 Пользователь' :
role === 'assistant' ? '🤖 Ассистент' :
role === 'system' ? '⚙️ Система' : `🔧 Инструмент (${role})`
md += `### ${roleName}\n\n`
if (msg.content) {md += `${msg.content}\n\n`
}
if (includeToolCalls && Array.isArray(msg.toolCalls) && msg.toolCalls.length) {md += `*Вызовы инструментов:*\n`
for (const tc of msg.toolCalls) {md += `- **${tc.name || 'tool'}**: \`${JSON.stringify(tc.arguments || {})}\`\n`
}
md += `\n`
}
md += `---\n\n`
}
const footer = customFooter !== undefined
? customFooter
: `*Сгенерировано с помощью [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) и @goodandready/dsh-russian-lang*\n`
if (footer) md += footer
return md
}
const findTranslationKey = (text, dicts = {}, overrides = {}, zhRu = {}, domEn = {}, options = {}) => {if (!text || typeof text !== 'string') return null
const trimmed = text.trim()
if (!trimmed) return null
if (overrides && typeof overrides === 'object') {if (overrides[trimmed] !== undefined) {return { key: trimmed, value: overrides[trimmed], source: 'override' }}
for (const [k, v] of Object.entries(overrides)) {if (v === text || (typeof v === 'string' && v.trim() === trimmed)) {return { key: k, value: v, source: 'override' }}}}
if (dicts && typeof dicts === 'object') {for (const [ns, map] of Object.entries(dicts)) {if (!map || typeof map !== 'object') continue
if (map[trimmed] !== undefined) {return { ns, key: trimmed, value: map[trimmed], source: 'dictionary' }}
for (const [k, v] of Object.entries(map)) {if (v === text || (typeof v === 'string' && v.trim() === trimmed)) {return { ns, key: k, value: v, source: 'dictionary' }}}}}
if (zhRu && typeof zhRu === 'object') {for (const [zh, ru] of Object.entries(zhRu)) {if (ru === text || (typeof ru === 'string' && ru.trim() === trimmed)) {return { zh, key: zh, value: ru, source: 'dom_zh' }}}
if (zhRu[trimmed] !== undefined) {return { zh: trimmed, key: trimmed, value: zhRu[trimmed], source: 'dom_zh_original' }}}
if (domEn && typeof domEn === 'object') {for (const [en, ru] of Object.entries(domEn)) {if (ru === text || (typeof ru === 'string' && ru.trim() === trimmed)) {return { en, key: en, value: ru, source: 'dom_en' }}}
if (domEn[trimmed] !== undefined) {return { en: trimmed, key: trimmed, value: domEn[trimmed], source: 'dom_en_original' }}}
if (options && options.detectUntranslated) {const hasRu = /[а-яё]/i.test(trimmed)
const hasZh = /[㐀-鿿豈-﫿]/.test(trimmed)
const hasEn = /[a-z]/i.test(trimmed)
if (!hasRu && hasZh) {return { key: trimmed, value: trimmed, source: 'untranslated_zh' }}
if (!hasRu && hasEn) {return { key: trimmed, value: trimmed, source: 'untranslated_en' }}}
return null
}
const generateBugReportSnippet = (info = {}) => {const { key, ns, original, current, override, pkgVersion = '0.3.1' } = info
const lines = ['### 🌐 Неточность перевода / Пользовательское предложение','- **Пакет:** `@goodandready/dsh-russian-lang@v' + pkgVersion + '`',ns ? '- **Пространство имён:** `' + ns + '`' : null,key ? '- **Ключ:** `' + key + '`' : null,original ? '- **Оригинальный текст:** `' + original + '`' : null,current ? '- **Текущий перевод:** `' + current + '`' : null,override ? '- **Предлагаемый перевод:** `' + override + '`' : null,].filter(Boolean)
return lines.join('\n')
}
const bilingualCommandMatch = (query, command, options = {}) => {if (!query || !command) return { matched: false, score: 0 }
const q = String(query).trim().toLowerCase()
if (!q) return { matched: false, score: 0 }
const cmdObj = typeof command === 'string' ? { title: command } : command
const candidates = [cmdObj.title,cmdObj.label,cmdObj.name,cmdObj.originalTitle,cmdObj.enTitle,cmdObj.id,cmdObj.description,cmdObj.category,...(Array.isArray(cmdObj.keywords) ? cmdObj.keywords : [])
].filter((c) => typeof c === 'string' && c.trim())
if (!candidates.length) return { matched: false, score: 0 }
const queryVariants = [{ text: q, kind: 'direct' }]
const lat2cyr = translit(q, LAYOUT_LAT_TO_CYR)
if (lat2cyr !== q) queryVariants.push({ text: lat2cyr, kind: 'layout' })
const cyr2lat = translit(q, LAYOUT_CYR_TO_LAT)
if (cyr2lat !== q) queryVariants.push({ text: cyr2lat, kind: 'layout' })
const phonLat2Cyr = phoneticTranslit(q, 'lat2cyr')
if (phonLat2Cyr && phonLat2Cyr !== q && phonLat2Cyr !== lat2cyr) {queryVariants.push({ text: phonLat2Cyr, kind: 'phonetic' })
}
const phonCyr2Lat = phoneticTranslit(q, 'cyr2lat')
if (phonCyr2Lat && phonCyr2Lat !== q && phonCyr2Lat !== cyr2lat) {queryVariants.push({ text: phonCyr2Lat, kind: 'phonetic' })
}
let bestScore = 0
let bestVariant = null
let bestCandidate = null
for (const variant of queryVariants) {for (const cand of candidates) {const score = fuzzyMatchRu(variant.text, cand)
if (score > bestScore) {bestScore = score
bestVariant = variant
bestCandidate = cand
}}}
const threshold = options.threshold ?? 50
return {matched: bestScore >= threshold,score: bestScore,matchedText: bestCandidate,variant: bestVariant ? bestVariant.text : q,kind: bestVariant ? bestVariant.kind : 'none'
}}
const filterCommands = (query, commands = [], options = {}) => {if (!Array.isArray(commands)) return []
if (!query || !String(query).trim()) return commands
const results = []
for (const cmd of commands) {const res = bilingualCommandMatch(query, cmd, options)
if (res.matched) {results.push({ item: cmd, ...res })
}}
return results.sort((a, b) => b.score - a.score).map((r) => r.item)
}
const RU = {"common":{"back":"Назад","cancel":"Отмена","close":"Закрыть","collapse":"Свернуть","copied":"Скопировано","copy":"Копировать","delete":"Удалить","edit":"Изменить","expand":"Развернуть","loading":"Загрузка…","more":"Ещё","next":"Дальше","ok":"ОК","retry":"Повторить","save":"Сохранить","search":"Поиск","submit":"Отправить"},"dsh-cron":{"sidebar.label":"Задачи по расписанию"},"dsh-usage-stats":{"footer.todayLabel":"Сегодня"},"pluginMarket":{"trigger":"Магазин плагинов"}}
const ZH_RU = {}
RU['russian-lang'] = {"cardTitle":"Русская локализация","cardSub":"Язык интерфейса, типографика, раскладка","badgeRu":"🟢 RU активен","badgeEn":"⚪ EN активен","badgeCoverage":"🟢 100% (8 595 ключей)","badgeSmartUx":"⚡ Smart UX активен","badgeSmartUxOff":"Smart UX выключен","secLanguage":"🌐 Язык интерфейса","secLanguageDesc":"Нативное переключение языка интерфейса DSH на русский без перезагрузки страницы.","enabled":"Русский язык включён","enabledDesc":"Переключает язык интерфейса DeepSeek Harness на русский.","quickSwitchNote":"Быстрый переключатель RU ⇄ EN доступен в шапке сессии рядом с кнопками диалога.","quickSwitch":"Быстрый переключатель языка","quickSwitchDesc":"Показывать переключатель RU ⇄ EN в шапке сессии.","secTypography":"✍️ Умная типографика и ввод (Smart UX)","secTypographyDesc":"Нормы русской типографики во время диалога и набора.","typography":"Типографика вывода","typographyDesc":"Кавычки «», тире — вместо дефисов, неразрывные пробелы.","yo":"Буква «ё»","yoDesc":"Восстановление «ё» в частых словах (ещё, идёт и др.).","liveInput":"Живая типографика инпута","liveInputDesc":"Кавычки «», тире — и неразрывные пробелы перед отправкой.","slashAliases":"Русские алиасы команд","slashAliasesDesc":"Команды: /цель, /сжать, /план, /справка, /память.","altLHintText":"Подсказки и конвертация раскладки","layoutConversionDesc":"Подсказки при вводе; ⌨ Alt+L и значок RU/EN конвертируют текст текущего поля (ghbdtn ⇄ привет).","secAgentPrompt":"🤖 Системный промпт агента","secAgentPromptDesc":"Официальная секция расширения DSH systemPrompt для ведения диалога на русском языке.","agentPrompt":"Русский промпт агента","agentPromptDesc":"Добавляет в системный промпт инструкцию отвечать по-русски в выбранном стиле.","agentPromptPreset":"Стиль ответов агента","presetExpert":"Технический эксперт (строгая терминология, чистый код)","presetWriter":"Технический писатель (Markdown, таблицы, ГОСТ)","presetConcise":"Лаконичный режим (кратко, без лишней воды)","presetReviewer":"Код-ревьюер (поиск багов, безопасность, аудит)","presetArchitect":"Системный архитектор (контракты, масштабируемость)","presetTutor":"Наставник (понятные объяснения, пошаговый разбор)","secUpdater":"🔄 Обновление языкового пакета","secUpdaterDesc":"Проверка наличия новых релизов в реестре npm и обновление в один клик.","updaterCurrent":"Текущая версия: v{version}","updaterLatest":"Доступна новая версия: v{version}","updaterUpToDate":"Установлена актуальная версия","updaterChecking":"Проверка…","updaterCheckBtn":"Проверить обновления","updaterBtn":"Обновить до v{version} в 1 клик","updaterUpdating":"Установка обновления…","updaterSuccess":"✅ Плагин успешно обновлён! Перезапустите DSH для применения.","updaterFailed":"❌ Не удалось проверить/обновить плагин. Проверьте сеть или логи сервера.","badgeUpdateAvailable":"Доступно обновление","badgeUpToDate":"Актуальная версия","secTranslator":"🌐 Перевод сообщений ассистента","secTranslatorDesc":"Перевод ответов модели в чате на русский язык.","translateEngine":"Движок перевода","engineOff":"Выключен (по умолчанию, без сетевых вызовов)","engineLocal":"Локальный LibreTranslate (приватно, ~600 МБ RAM)","engineGoogle":"Google Translate (онлайн)","googleWarn":"⚠️ Текст сообщений передаётся на публичные серверы Google.","localStatusRunning":"🟢 Контейнер LibreTranslate активен","localStatusStopped":"⚪ Контейнер LibreTranslate не запущен","localStartBtn":"Запустить LibreTranslate в Docker (~600 МБ RAM)","localStarting":"Запуск контейнера…","localInfo":"LibreTranslate в Docker: изолированно, ~600 МБ RAM.","secOverrides":"✍️ Пользовательские переопределения (Custom Overrides)","secOverridesDesc":"Замена любой формулировки интерфейса DSH на собственную.","overrideKeyPlaceholder":"Ключ (например, common.back или settings.title)","overrideValuePlaceholder":"Ваш русский перевод","overrideAddBtn":"Добавить","overrideEmpty":"Переопределений пока нет.","overrideDelete":"Удалить","overrideTip":"💡 Зажмите Alt и кликните на элемент UI для быстрой правки.","secSupport":"📊 Покрытие экосистемы и поддержка","secSupportDesc":"100% UI-покрытие ядра и плагинов DSH.","statNamespaces":"Пространств имён","statCoreKeys":"Ключей ядра","statPluginKeys":"Ключей плагинов","overridesCount":"Своих переопределений","statusLoading":"Настройки загружаются…","statusUnavailable":"Настройки недоступны на этом хосте","translateTurn":"Перевести на русский","reportIssue":"Сообщить о неточности перевода","exportMdHint":"Экспорт диалога в Markdown доступен по кнопке [ 📥 MD ] в шапке сессии.","translateTurnHint":"Перевод ответов ассистента на русский доступен по кнопке [ RU ↗ ] на блоках сообщений.","inspectorToggleOff":"🔍 Включить инспектор перевода (Alt+I)","inspectorToggleOn":"🔍 Инспектор перевода (включён)","exportJsonBtn":"📤 Экспорт JSON","importJsonBtn":"📥 Импорт JSON","overridesCopied":"Оверрайды скопированы в буфер обмена как JSON!","overridesImportPrompt":"Вставьте JSON с оверрайдами:","overridesImportError":"Ошибка разбора JSON: ","secPluginStatus":"📊 Состояние локализации плагинов","secPluginStatusDesc":"Фактические версии установленных плагинов и процент покрытия проверенной базы.","registerMissingIssue":"Зарегистрировать issue на перевод","showMissingKeys":"Показать отсутствующие ключи","hideMissingKeys":"Скрыть отсутствующие ключи","searchPluginPlaceholder":"Поиск плагина…"}
const CARD_EN = {cardTitle: 'Russian localization',cardSub: 'Interface language, typography, keyboard layout',badgeRu: '🟢 RU active',badgeEn: '⚪ EN active',badgeCoverage: '🟢 100% (8,595 keys)',badgeSmartUx: '⚡ Smart UX active',badgeSmartUxOff: 'Smart UX off',secLanguage: '🌐 Interface language',secLanguageDesc: 'Switch the DSH interface language to Russian natively, without reloading the page.',enabled: 'Russian language enabled',enabledDesc: 'Switches the DeepSeek Harness interface to Russian.',quickSwitchNote: 'The RU ⇄ EN quick switch is available in the session header next to the dialog buttons.',quickSwitch: 'Quick language switch',quickSwitchDesc: 'Show the RU ⇄ EN switch in the session header.',secTypography: '✍️ Smart typography & input (Smart UX)',secTypographyDesc: 'Russian typography rules applied while you chat and type.',typography: 'Output typography',typographyDesc: 'Guillemets «», em dashes — instead of hyphens, non-breaking spaces.',yo: 'Letter «ё»',yoDesc: 'Restores «ё» in frequent words (ещё, идёт, etc.).',liveInput: 'Live input typography',liveInputDesc: 'Guillemets «», em dashes — and non-breaking spaces before sending.',slashAliases: 'Russian command aliases',slashAliasesDesc: 'Commands: /цель, /сжать, /план, /справка, /память.',altLHintText: 'Keyboard layout hints and conversion',layoutConversionDesc: 'Hints while typing; ⌨ Alt+L and the RU/EN badge convert the current field (ghbdtn ⇄ привет).',secAgentPrompt: '🤖 Agent system prompt',secAgentPromptDesc: 'An official DSH systemPrompt extension section for conversing in Russian.',agentPrompt: 'Russian agent prompt',agentPromptDesc: 'Adds an instruction to reply in Russian in the selected style to the system prompt.',agentPromptPreset: 'Reply style',presetExpert: 'Technical expert (strict terminology, clean code)',presetWriter: 'Technical writer (Markdown, tables, GOST)',presetConcise: 'Concise mode (brief, no fluff)',presetReviewer: 'Code reviewer (bug hunting, security, audit)',presetArchitect: 'System architect (contracts, scalability)',presetTutor: 'Mentor (clear explanations, step-by-step)',secUpdater: '🔄 Language pack updates',secUpdaterDesc: 'Check for new releases in the npm registry and update in one click.',updaterCurrent: 'Current version: v{version}',updaterLatest: 'New version available: v{version}',updaterUpToDate: 'You are on the latest version',updaterChecking: 'Checking…',updaterCheckBtn: 'Check for updates',updaterBtn: 'Update to v{version} in 1 click',updaterUpdating: 'Installing update…',updaterSuccess: '✅ Plugin updated successfully! Restart DSH to apply.',updaterFailed: '❌ Failed to check or update the plugin. Check your network or server logs.',badgeUpdateAvailable: 'Update available',badgeUpToDate: 'Up to date',secTranslator: '🌐 Assistant message translation',secTranslatorDesc: 'Translate model replies in chat into Russian.',translateEngine: 'Translation engine',engineOff: 'Off (default, no network calls)',engineLocal: 'Local LibreTranslate (private, ~600 MB RAM)',engineGoogle: 'Google Translate (online)',googleWarn: '⚠️ Message text is sent to public Google servers.',localStatusRunning: '🟢 LibreTranslate container is running',localStatusStopped: '⚪ LibreTranslate container is not running',localStartBtn: 'Start LibreTranslate in Docker (~600 MB RAM)',localStarting: 'Starting container…',localInfo: 'LibreTranslate in Docker: isolated, ~600 MB RAM.',secOverrides: '✍️ Custom overrides',secOverridesDesc: 'Replace any DSH interface wording with your own.',overrideKeyPlaceholder: 'Key (e.g. common.back or settings.title)',overrideValuePlaceholder: 'Your translation',overrideAddBtn: 'Add',overrideEmpty: 'No overrides yet.',overrideDelete: 'Delete',overrideTip: '💡 Hold Alt and click a UI element for quick editing.',secSupport: '📊 Ecosystem coverage & support',secSupportDesc: '100% UI coverage of the DSH core and plugins.',inspectorToggleOff: '🔍 Enable translation inspector (Alt+I)',inspectorToggleOn: '🔍 Translation inspector (on)',exportJsonBtn: '📤 Export JSON',importJsonBtn: '📥 Import JSON',overridesCopied: 'Overrides copied to clipboard as JSON!',overridesImportPrompt: 'Paste overrides JSON:',overridesImportError: 'JSON parse error: ',statNamespaces: 'Namespaces',statCoreKeys: 'Core keys',statPluginKeys: 'Plugin keys',overridesCount: 'Custom overrides',statusLoading: 'Loading settings…',statusUnavailable: 'Settings unavailable on this host',translateTurn: 'Translate to Russian',reportIssue: 'Report a translation issue',exportMdHint: 'Export the dialog to Markdown via the [ 📥 MD ] button in the session header.',translateTurnHint: 'Translate assistant replies to Russian via the [ RU ↗ ] button on message blocks.',secPluginStatus: '📊 Plugin localization status',secPluginStatusDesc: 'Installed plugin versions and coverage of the verified translation database.',registerMissingIssue: 'Register translation issue',showMissingKeys: 'Show missing keys',hideMissingKeys: 'Hide missing keys',searchPluginPlaceholder: 'Search plugins…',}
const SETTINGS_NS_NAME = 'russian-lang'
const FORM_NS = 'dsh-russian-lang'
const LEGACY_NS = 'russian-lang'
const ROW_CONFIG_KEY = '@goodandready/dsh-russian-lang#' + FORM_NS
const resolveTypography = (val) => {const t = (val && val.typography) || {}
return {enabled: t.enabled === true,liveInput: t.liveInput === true,yo: t.yo === true
}}
function apply(ctx) {const runtime = ctx.locale
const configForms = ctx && ctx.configForms
const resolveScope = (c) => {try {if (c && c.configForms) return c.configForms.get(FORM_NS)
if (c && c.settingsScope) return c.settingsScope.bind({ namespace: LEGACY_NS })
} catch (err) { void err }
return null
}
const rawScope = resolveScope(ctx)
const scope = (rawScope && typeof rawScope.getSnapshot === 'function') ? rawScope : {getSnapshot: () => ({ status: 'ready', value: {} }),subscribe: () => () => {},set: () => Promise.resolve()
}
const legacyFlagMode = !(ctx && ctx.configForms)
let disposed = false
let corePreloadTimer = null
let pluginBatchTimer = null
let zhDebounceTimer = null
for (const ns of Object.keys(RU)) {ctx.effect(() => {if (disposed) return () => {}
try { return ctx.locale.register(ns, 'ru', RU[ns]) } catch (err) {console.warn('[dsh-russian-lang] Failed to register core locale for namespace:', ns, err)
return () => {}}}, 'dsh-russian-lang: ' + ns)
}
ctx.effect(() => {if (disposed) return () => {}
try { return ctx.locale.register(SETTINGS_NS_NAME, 'en', CARD_EN) } catch (err) {console.warn('[dsh-russian-lang] Failed to register en card fallback:', err)
return () => {}}}, 'dsh-russian-lang: russian-lang-en')
const registerDictMap = (dictMap) => {if (disposed || !dictMap || typeof dictMap !== 'object') return
for (const ns of Object.keys(dictMap)) {if (disposed) return
if (ns === 'zhRu' || ns === 'plugins' || ns === 'core') continue
const dict = dictMap[ns]
if (typeof dict !== 'object' || !dict) continue
if (!RU[ns]) {RU[ns] = dict
ctx.effect(() => {if (disposed) return () => {}
try { return ctx.locale.register(ns, 'ru', dict) } catch (err) {console.warn('[dsh-russian-lang] Failed to register dynamic locale for namespace:', ns, err)
return () => {}}}, 'dsh-russian-lang: ' + ns)
} else {Object.assign(RU[ns], dict)
try { ctx.locale.register(ns, 'ru', RU[ns]) } catch (err) {console.warn('[dsh-russian-lang] Failed to update locale dictionary for namespace:', ns, err)
}}}}
const CACHE_NAME = 'dsh-ru-cache-v1'
const loadLocalDict = (key) => {try {const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('dsh_ru_' + key) : null
return raw ? JSON.parse(raw) : null
} catch (_) { return null }}
const saveLocalDict = (key, etag, data) => {try {if (typeof localStorage !== 'undefined') {localStorage.setItem('dsh_ru_' + key, JSON.stringify({ etag, data }))
}} catch (_e) { void _e }}
try {const cachedCore = loadLocalDict('core')
if (cachedCore && cachedCore.data && cachedCore.data.core) {registerDictMap(cachedCore.data.core)
if (cachedCore.data.zhRu && typeof ZH_RU === 'object') {Object.assign(ZH_RU, cachedCore.data.zhRu)
}}} catch (_e) { void _e }
const fetchCachedResource = async (url, cacheKey, onData) => {if (disposed) return
let etag = null
let delivered = false
if (typeof caches !== 'undefined') {try {const cache = await caches.open(CACHE_NAME)
if (disposed) return
const matched = await cache.match(url)
if (disposed) return
if (matched) {etag = matched.headers.get('etag')
const parsed = await matched.json()
if (disposed) return
if (parsed) {delivered = true
onData(parsed)
}}} catch (_e) { void _e }}
if (disposed) return
if (!delivered && cacheKey) {const local = loadLocalDict(cacheKey)
if (disposed) return
if (local && local.data) {etag = local.etag
delivered = true
onData(local.data)
}}
if (disposed) return
if (typeof fetch !== 'function') {if (!delivered) throw new Error('Fetch API is not available')
return
}
let networkError = null
try {const headers = { 'Accept': 'application/json' }
if (etag) headers['If-None-Match'] = etag
const res = await fetch(url, { headers })
if (disposed) return
if (res.status === 304) return
if (res.ok) {const newEtag = res.headers.get('etag')
const cloned = res.clone()
const data = await res.json()
if (disposed) return
if (data) {onData(data)
if (disposed) return
if (typeof caches !== 'undefined') {try {const cache = await caches.open(CACHE_NAME)
if (!disposed) await cache.put(url, cloned)
} catch (_e) { void _e }}
if (cacheKey && !disposed) saveLocalDict(cacheKey, newEtag, data)
}} else {networkError = new Error(`HTTP ${res.status}: ${res.statusText}`)
}} catch (err) {networkError = err
}
if (!delivered && networkError) {throw networkError
}}
const loadedPluginNames = new Set()
const inFlightPluginNames = new Set()
const queuedPluginNames = new Set()
const loadPluginDictionaries = (names) => {if (disposed || typeof fetch !== 'function') return
const isSelective = Array.isArray(names) && names.length > 0
const toLoad = []
if (isSelective) {for (const raw of names) {const n = String(raw).trim()
if (!n || loadedPluginNames.has(n) || inFlightPluginNames.has(n)) continue
toLoad.push(n)
inFlightPluginNames.add(n)
}
if (toLoad.length === 0) return
}
const qs = toLoad.length > 0 ? ('?names=' + encodeURIComponent(toLoad.join(','))) : ''
const url = '/api/dsh-russian-lang/dict/plugins' + qs
const cacheKey = toLoad.length > 0 ? ('plugins_' + toLoad.slice().sort().join('_')) : 'plugins_all'
fetchCachedResource(url, cacheKey, (data) => {if (data && data.plugins) {registerDictMap(data.plugins)
if (toLoad.length > 0) {for (const n of toLoad) loadedPluginNames.add(n)
} else if (data.plugins) {for (const n of Object.keys(data.plugins)) loadedPluginNames.add(n)
}}}).catch(() => {}).finally(() => {for (const n of toLoad) inFlightPluginNames.delete(n)
})
}
const schedulePluginLoad = (name) => {if (!name) return
const n = String(name).trim()
if (!n || loadedPluginNames.has(n) || inFlightPluginNames.has(n) || queuedPluginNames.has(n)) return
queuedPluginNames.add(n)
if (pluginBatchTimer) clearTimeout(pluginBatchTimer)
pluginBatchTimer = setTimeout(() => {pluginBatchTimer = null
const batch = Array.from(queuedPluginNames)
queuedPluginNames.clear()
if (batch.length > 0) loadPluginDictionaries(batch)
}, 50)
}
fetchCachedResource('/api/dsh-russian-lang/dict/core', 'core', (data) => {if (disposed || !data) return
if (data.core) registerDictMap(data.core)
if (disposed) return
if (data.zhRu && typeof ZH_RU === 'object') {Object.assign(ZH_RU, data.zhRu)
if (typeof updateZhRu === 'function') updateZhRu(data.zhRu)
}
if (typeof syncZhDom === 'function') syncZhDom()
if (!disposed) {corePreloadTimer = setTimeout(() => {corePreloadTimer = null
if (!disposed) loadPluginDictionaries([])
}, 100)
}}).catch((coreErr) => {if (disposed || typeof fetch !== 'function') return
fetch('/api/dsh-russian-lang/dict/all', { headers: { 'Accept': 'application/json' } }).then((res) => {if (disposed) return null
if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
return res.json()
}).then((data) => {if (disposed || !data) return
const allDicts = Object.assign({}, data.core || {}, data.plugins || {}, data)
if (data.zhRu && typeof ZH_RU === 'object') {Object.assign(ZH_RU, data.zhRu)
if (typeof updateZhRu === 'function') updateZhRu(data.zhRu)
}
if (!disposed) registerDictMap(allDicts)
if (typeof syncZhDom === 'function') syncZhDom()
}).catch((allErr) => {if (disposed) return
if (typeof console !== 'undefined' && console.warn) {console.warn('[dsh-russian-lang] Dict fetch error', coreErr, allErr)
}})
})
const getOverrides = () => {try {const value = scope.getSnapshot().value
return value && value.overrides ? value.overrides : {}} catch (err) { return {} }}
const getPluginLocalizationStatus = makePluginLocalizationStatus(RU)
const lookupChain = () => {try {const chain = runtime.fallbackChain && runtime.fallbackChain(runtime.getLocale().active)
if (Array.isArray(chain) && chain.length) return chain
} catch (err) {  void err; }
return [runtime.getLocale().active]
}
const translationRegistry = new Map()
const lookup = (ns, key) => (runtime.lookup.length >= 3 ? runtime.lookup(ns, key, lookupChain()) : runtime.lookup(ns, key))
const syncLang = () => {try {if (typeof document !== 'undefined' && document.documentElement && runtime.getLocale().active === 'ru') document.documentElement.lang = 'ru-RU'
} catch (err) {  void err; }}
const RUNTIME_PROP_NAMES = ['plural', 'pluralForm', 'formatDate', 'formatCompactNumber', 'formatTokens','formatNumber', 'formatRelativeTime', 'formatCurrency', 'inflect','getPluginLocalizationStatus', 'stemRussian', 'fuzzyMatchRu', 'humanizeError','findTranslationKey', 'openInspector', 'translationRegistry','bilingualCommandMatch', 'filterCommands', 'formatErrorToast'
]
ctx.effect(() => {const origTranslate = runtime.translate
const origProps = {}
for (const p of RUNTIME_PROP_NAMES) origProps[p] = runtime[p]
runtime.plural = plural
runtime.pluralForm = pluralForm
runtime.formatDate = formatDate
runtime.formatCompactNumber = formatCompactNumber
runtime.formatTokens = formatTokens
runtime.humanizeError = humanizeError
Object.assign(runtime, {formatNumber, formatRelativeTime, formatCurrency, inflect,getPluginLocalizationStatus, stemRussian, fuzzyMatchRu
})
runtime.findTranslationKey = (text) => (typeof findTranslationKey === 'function' ? findTranslationKey(text, RU, getOverrides(), ZH_RU) : null)
runtime.openInspector = (...args) => (typeof openInspectorModal === 'function' ? openInspectorModal(...args) : null)
runtime.translationRegistry = translationRegistry
runtime.bilingualCommandMatch = (query, cmd, opts) => (typeof bilingualCommandMatch === 'function' ? bilingualCommandMatch(query, cmd, opts) : { matched: false, score: 0 })
runtime.filterCommands = (query, cmds, opts) => (typeof filterCommands === 'function' ? filterCommands(query, cmds, opts) : cmds)
runtime.formatErrorToast = (err) => (typeof formatErrorToast === 'function' ? formatErrorToast(err) : null)
const boundOrig = typeof origTranslate === 'function' ? origTranslate.bind(runtime) : (() => '')
runtime.translate = function (ns, key, params) {if (ns && !RU[ns] && !loadedPluginNames.has(ns)) schedulePluginLoad(ns)
const activeLang = runtime.getLocale ? (runtime.getLocale().active || 'ru') : 'ru'
if (activeLang === 'ru') {const ov = getOverrides()
const fullKey = ns ? ns + '.' + key : key
const val = ov[fullKey] !== undefined ? ov[fullKey] : ov[key]
if (val !== undefined) return params ? fill(val, params) : val
}
if (activeLang === 'ru' && params) {const n = params.n ?? params.count
if (typeof n === 'number') {const form = pluralForm(n)
const m = /^(.*)[.](one|other)$/.exec(key)
if (m) {if (form === 'few' || form === 'many') {const tmpl = lookup(ns, m[1] + '.' + form) ?? lookup('common', m[1] + '.' + form)
if (tmpl !== undefined) return fill(tmpl, params)
}} else if (form !== 'other' && !/[.](one|other|few|many)$/.test(key)) {const tmpl = lookup(ns, key + '.' + form) ?? lookup('common', key + '.' + form)
if (tmpl !== undefined) return fill(tmpl, params)
}}}
const res = boundOrig(ns, key, params)
if (typeof res === 'string' && res && res.length < 300) translationRegistry.set(res.trim(), { ns, key, params, value: res })
return res
}
let removeLang = null
if (!runtime.getLocale().locales.some((l) => l.id === 'ru') && typeof runtime.addLanguage === 'function') {removeLang = runtime.addLanguage({ id: 'ru', label: 'Русский', fallback: 'en' })
syncLang()
}
return () => {disposed = true
if (corePreloadTimer) { clearTimeout(corePreloadTimer); corePreloadTimer = null }
if (pluginBatchTimer) { clearTimeout(pluginBatchTimer); pluginBatchTimer = null }
if (zhDebounceTimer) { clearTimeout(zhDebounceTimer); zhDebounceTimer = null }
runtime.translate = origTranslate
for (const p of RUNTIME_PROP_NAMES) {if (origProps[p] !== undefined) runtime[p] = origProps[p]
else delete runtime[p]
}
if (typeof removeLang === 'function') { try { removeLang() } catch (_) {  void _; } }}}, 'dsh-russian-lang: runtime-lifecycle')
const syncFlag = () => {if (!legacyFlagMode) return
try {const wantRu = runtime.getLocale().active === 'ru'
const value = scope.getSnapshot().value || {}
if (!!value.enabled !== wantRu) {const r = scope.set('enabled', wantRu)
if (r && typeof r.catch === 'function') {r.catch((err) => {console.warn('dsh-russian-lang: scope.set enabled failed', err && err.message || err)
})
}}} catch (err) {void err;
}}
ctx.effect(() => {try { return runtime.subscribe(syncFlag) } catch (err) { return undefined }}, 'dsh-russian-lang: sync-flag')
const activate = () => {try {if (runtime.getLocale().active === 'ru') return
runtime.setLocale('ru')
} catch (err) { console.warn('dsh-russian-lang: activate failed', err) }}
let booted = false
const tryBoot = () => {if (booted) return
try {const value = scope.getSnapshot().value
if (legacyFlagMode && value && value.enabled === true) { booted = true; activate() }} catch (err) {  void err; }}
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
const isMonoField = (el) => {try { return MONO_RE.test(getComputedStyle(el).fontFamily || '') } catch (err) { return false }}
const spellOn = (el) => {if (el.hasAttribute(SPELL_ON) || isMonoField(el)) return
el.setAttribute(SPELL_ON, '1')
el.setAttribute(SPELL_WAS, el.getAttribute('spellcheck') ?? '')
el.setAttribute(LANG_WAS, el.getAttribute('lang') ?? '')
el.setAttribute('spellcheck', 'true')
el.setAttribute('lang', 'ru-RU')
}
const spellOff = (el) => {if (!el.hasAttribute(SPELL_ON)) return
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
const syncSpell = () => {try {if (typeof document === 'undefined') return
const ru = runtime.getLocale().active === 'ru'
if (!ru) {if (spellObserver) { spellObserver.disconnect(); spellObserver = null }
document.querySelectorAll('[' + SPELL_ON + ']').forEach(spellOff)
return
}
document.querySelectorAll(EDITABLE).forEach(spellOn)
if (spellObserver) return
spellObserver = new MutationObserver((records) => {for (const record of records) {for (const node of record.addedNodes) {if (node.nodeType !== 1) continue
if (node.matches(EDITABLE)) spellOn(node)
node.querySelectorAll ? node.querySelectorAll(EDITABLE).forEach(spellOn) : null
}}})
spellObserver.observe(document.body, { childList: true, subtree: true })
} catch (err) {  void err; }}
const unsubscribeSpell = runtime.subscribe(syncSpell)
ctx.effect(() => {return () => {unsubscribeSpell()
if (spellObserver) spellObserver.disconnect()
try { document.querySelectorAll('[' + SPELL_ON + ']').forEach(spellOff) } catch (err) {  void err; }}}, 'dsh-russian-lang: spellcheck')
syncSpell()
const ZH_CJK = /[\u3400-\u9fff\uf900-\ufaff]/
const ZH_RE_ESC = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const ZH_EXACT = new Map()
const ZH_PATTERNS = []
const CORE_ZH_PRESETS = {'请求批准': 'Запрашивать подтверждение','完全放开': 'Полный доступ','只读': 'Только чтение','只能读，任何写入都需要审批。': 'Только чтение, любая запись требует подтверждения.','工作区内可写；工作区外的操作请求人工审批。': 'Запись в рабочей области разрешена; операции вне рабочей области требуют подтверждения.','全放行，不弹审批。': 'Полный доступ, запросы на подтверждение не выводятся.','确定性规则 + 两阶段分类器自动决定；危险或故障时 fail-closed。': 'Детерминированные правила + двухэтапный классификатор; при рисках — безопасная блокировка.','手动测试': 'Ручное тестирование','事件': 'Событие','模拟 (看匹配)': 'Симуляция (проверка)','执行 (真实触发)': 'Выполнение (реальный триггер)','通知渠道测试': 'Тест каналов уведомлений','渠道': 'Канал','Slack 风格单行摘要': 'Сводка в стиле Slack','发送测试通知': 'Отправить тестовое уведомление','飞书通知': 'Уведомления Feishu','扫码连接飞书': 'Подключить Feishu по QR-коду','将创建名为 [DSH 通知机器人] 的飞书应用': 'Будет создано приложение Feishu [DSH 通知机器人]','卡片截断长度': 'Длина обрезки карточки','复制 YAML': 'Копировать YAML','去抖': 'Дебаунс','已断开': 'Отключено','已连接': 'Подключено','已保存': 'Сохранено','保存失败': 'Не удалось сохранить','编辑': 'Редактировать','取消编辑': 'Отмена','启用': 'Включить','停用': 'Отключить','重试': 'Повторить','刷新': 'Обновить','网络请求失败': 'Сетевой запрос не удался','如未立即生效请重启': 'Если изменения не применились, перезапустите DSH','通知机器人': 'Бот уведомлений','飞书扫码授权二维码': 'QR-код авторизации Feishu','在浏览器中打开飞书授权链接': 'Открыть ссылку авторизации Feishu в браузере','重新扫码会覆盖现有应用凭据与本': 'Повторное сканирование перезапишет учётные данные','扫码者本人接收通知卡片': 'Получатель карточки уведомлений — авторизованный пользователь','tool (可选)': 'Инструмент (опц.)','runningSubagents (可选)': 'Подагенты (опц.)','durationMs (可选)': 'Длительность мс (опц.)','usage 输入 (可选)': 'Входные токены (опц.)','usage 输出 (可选)': 'Выходные токены (опц.)','profile (写入哪个 profile 的 cordis.patch.yml)': 'Профиль (куда записать cordis.patch.yml)','URL (留空用 DSH_HOOKS_WEBHOOK_URL)': 'URL (по умолчанию DSH_HOOKS_WEBHOOK_URL)','当前已配置的 Hook 规则列表': 'Список текущих настроенных правил хуков','测试通道': 'Тест канала','专家提示词服务尚未就绪，请稍后重试。': 'Сервис промптов экспертов ещё не готов, повторите попытку позже.','专家提示词服务尚未就绪，请稍后': 'Сервис промптов экспертов ещё не готов, пожалуйста, ','专家团服务不可用，请重新加载插件。': 'Сервис команд экспертов недоступен, перезагрузите плагин.','搜索团队或工作目标': 'Поиск команды или цели работы','专家': 'Эксперт','专家团': 'Команда экспертов'
}
for (const [k, v] of Object.entries(CORE_ZH_PRESETS)) ZH_EXACT.set(k, v)
const zhSortedExact = []
const rebuildZhSorted = () => {zhSortedExact.length = 0
for (const [k, v] of ZH_EXACT.entries()) zhSortedExact.push([k, v])
zhSortedExact.sort((a, b) => b[0].length - a[0].length)
}
rebuildZhSorted()
const updateZhRu = (entries) => {if (!entries || typeof entries !== 'object') return
for (const [zhText, ruText] of Object.entries(entries)) {if (typeof zhText !== 'string' || !ZH_CJK.test(zhText) || !ruText) continue
if (/\{[a-zA-Z_]\w*\}/.test(zhText)) {const parts = zhText.split(/\{[a-zA-Z_]\w*\}/g)
if (parts.some((p) => p.length === 0)) continue
ZH_PATTERNS.push({ re: new RegExp(parts.map(ZH_RE_ESC).join('([\\s\\S]*?)')), ruParts: ruText.split(/\{[a-zA-Z_]\w*\}/g) })
} else {ZH_EXACT.set(zhText, ruText)
}}
ZH_PATTERNS.sort((a, b) => b.re.source.length - a.re.source.length)
rebuildZhSorted()
}
updateZhRu(ZH_RU)
const zhTranslateText = (text) => {const overrides = getOverrides()
if (overrides[text] !== undefined) return overrides[text]
const trimmed = text.trim()
if (overrides[trimmed] !== undefined) return text.replace(trimmed, overrides[trimmed])
if (!ZH_CJK.test(text)) return null
const exact = ZH_EXACT.get(text)
if (exact !== undefined) return exact
if (trimmed !== text) {const exactTrimmed = ZH_EXACT.get(trimmed)
if (exactTrimmed !== undefined) return text.replace(trimmed, exactTrimmed)
}
for (const p of ZH_PATTERNS) {const m = p.re.exec(trimmed)
if (m && m[0] === trimmed) {let out = p.ruParts[0]
for (let i = 1; i < p.ruParts.length; i++) out += m[i] + p.ruParts[i]
return text.replace(trimmed, out)
}}
let replaced = text
let changed = false
for (const [zhPhrase, ruPhrase] of zhSortedExact) {if (zhPhrase.length >= 2 && replaced.includes(zhPhrase)) {replaced = replaced.split(zhPhrase).join(ruPhrase)
changed = true
}}
if (changed) return replaced
return null
}
const DOM_EN_ATTRS = {'Streaming preview': 'Предпросмотр стриминга','Visualization streaming preview': 'Предпросмотр визуализации','Security Auditor Shield': 'Защитный щит аудитора','Shield: Safe': 'Щит: Безопасно','Shield: Alert': 'Щит: Тревога','e.g. Implement report export and cover with unit tests': 'Например: Реализовать экспорт отчёта и покрыть юнит-тестами','e.g. Implement report export and cover with unit tests...': 'Например: Реализовать экспорт отчёта и покрыть юнит-тестами…','e.g. Implement user profile settings card with theme tokens': 'Например: Реализовать карточку настроек профиля с токенами темы','Detailed functional specs, acceptance criteria, constraints...': 'Детальная функциональная спецификация, критерии приёмки, ограничения…','Specific instructions, questions, or requirements for this specialist...': 'Конкретные инструкции, вопросы или требования для данного специалиста…',}
const DOM_EN_TEXT = {'Scheduled tasks': 'Задачи по расписанию','Files': 'Файлы','Back': 'Назад','Hosts': 'Хосты','Containers': 'Контейнеры','Tunnels': 'Туннели','Cluster': 'Кластер','Remote Workspace': 'Удалённое рабочее пространство','Native SSH connections to remote development environments with terminal, sftp, and tunneling.': 'SSH-соединения с удалёнными средами разработки: терминал, SFTP и туннели.','Import ~/.ssh/config': 'Импорт ~/.ssh/config','Terminal font': 'Шрифт терминала','Save Profile': 'Сохранить профиль','Edit Host Profile': 'Редактирование профиля хоста','Add New Host Profile': 'Добавление профиля хоста','Profile Name': 'Название профиля','Host / IP Address': 'Хост / IP-адрес','Port': 'Порт','Username': 'Имя пользователя','Jump hosts': 'Jump-хосты','Proxy command': 'Команда прокси','Environment': 'Окружение','Location': 'Расположение','Tags': 'Теги','Description': 'Описание','Authentication Method': 'Метод аутентификации','SSH Private Key': 'Приватный SSH-ключ','SSH Agent': 'SSH-агент','Password': 'Пароль','Private Key Path': 'Путь к приватному ключу','Key Passphrase (optional)': 'Парольная фраза ключа (опционально)','Remote Workspace Directory': 'Каталог удалённой рабочей области','Browse Remote...': 'Обзор удалённых…','Local Mirror Directory': 'Каталог локального зеркала','Search names, fields or keywords': 'Поиск по имени, сфере или ключевым словам','Search names, f[专家] or keywords': 'Поиск по имени, сфере или ключевым словам','No enabled experts yet. Type a keyword to find one.': 'Нет активных экспертов. Введите ключевое слово для поиска.','Search teams or goals': 'Поиск команды или цели работы','Team service unavailable. Reload the plugin.': 'Сервис команд экспертов недоступен, перезагрузите плагин.','Image Studio & Vault': 'Студия изображений и хранилище','Agent Browser': 'Браузер агента','Request approval': 'Запрашивать подтверждение','Today': 'Сегодня','Plugin Market': 'Магазин плагинов','GitHub ops': 'Операции с GitHub','Auto mode': 'Автоматический режим','Full access': 'Полный доступ','Read only': 'Только чтение','Side card': 'Боковая панель','panelName': 'Палитра команд','Hooks': 'Хуки','Manage what the side card shows and how it behaves': 'Настройка содержимого и поведения боковой панели','Inject the sidebar-open tool for the model': 'Предоставить модели инструмент sidebar-open','Position compatibility mode': 'Режим совместимости расположения','Auto-detect': 'Автоопределение','Sidebar content': 'Содержимое боковой панели','Changes': 'Изменения','Tasks': 'Задачи','Time Machine': 'Машина времени','Live Canvas': 'Живой холст','Side Chat (beta)': 'Боковой чат (бета)','Terminal': 'Терминал','Feature settings': 'Настройки функции','Low': 'Низкий','Medium': 'Средний','High': 'Высокий','Effort': 'Рассуждения','Search engine (ModSearch)': 'Поисковая система (ModSearch)','Search engine provider configuration.': 'Настройка провайдера поисковой системы.','X search only': 'Только поиск в X','Security Auditor Shield': 'Защитный щит аудитора','Shield: Safe': 'Щит: Безопасно','Shield: Alert': 'Щит: Тревога','Lens': 'Линза','Gallery': 'Галерея','SSH: Local': 'SSH: Локально','SSH: Remote': 'SSH: Удалённо','7/7 rot': '7/7 рот.','Smoke chat': 'Тестовый чат','Quick Launch Goal': 'Быстрый запуск цели','Define the objective for the agent in autonomous mode:': 'Сформулируйте задачу для автономной работы агента:','Fix Bug': 'Исправление бага','Refactor (YAGNI)': 'Рефакторинг (YAGNI)','Tests & Coverage': 'Тесты и покрытие','Code Review': 'Ревью кода','New Feature': 'Новая функция','Security Audit': 'Аудит безопасности','Docs & Contract': 'Документация и контракт','Upgrade Deps': 'Обновление зависимостей','Dead Code': 'Мёртвый код','Performance': 'Производительность','Start Goal': 'Запустить цель','Launch Multi-Agent Orchestrator': 'Запуск мультиагентного оркестратора','Full DAG Pipeline': 'Полный DAG-пайплайн','Direct Specialist Subagent': 'Прямой субагент-специалист','Objective Title': 'Название задачи','Scope & Requirements': 'Объём и требования','Topology Scenario': 'Топологический сценарий','Auto (Infer based on prompt complexity)': 'Авто (определить по сложности задачи)','Hotfix (1 Stage: Triage & Minimal Fix)': 'Хотфикс (1 этап: анализ и точечный фикс)','Simple (2 Stages: Spec + Exec)': 'Простой (2 этапа: ТЗ + реализация)','Medium (4 Stages: Spec -> Design -> Code -> QA)': 'Средний (4 этапа: ТЗ -> Дизайн -> Код -> Тестирование)','Complex (6 Stages: Full Engineering Lifecycle)': 'Сложный (6 этапов: полный инженерный цикл)','Enterprise (7 Stages: R&D Spike -> Fullstack -> Gate)': 'Enterprise (7 этапов: R&D исследование -> Фулстек -> Гейт приёмки)','Target Specialist Role': 'Роль целевого специалиста','UI/UX Interface Designer': 'UI/UX дизайнер интерфейсов','System Architect (DESIGN.md / ADR)': 'Системный архитектор (DESIGN.md / ADR)','Technical Spec Analyst': 'Аналитик технических спецификаций','Senior Frontend Developer': 'Ведущий frontend-разработчик','Senior Backend Developer': 'Ведущий backend-разработчик','QA Automation Engineer': 'Инженер автоматизации тестирования','Refactoring & Complexity Specialist': 'Специалист по рефакторингу и сложности','Hotfix & Diagnostic Engineer': 'Инженер хотфиксов и диагностики','Documentation Specialist': 'Технический писатель / Документация','Spike & R&D Researcher': 'Исследователь R&D и прототипирования','DevOps & Tooling Specialist': 'DevOps и инфраструктурный специалист','Instructions for Subagent': 'Инструкции для субагента','Start Pipeline': 'Запустить пайплайн','Delegate Subagent': 'Делегировать субагенту','Dispatching...': 'Отправка…','Discounted rate active': 'Действует сниженный тариф','off-peak': 'непиковый','peak': 'пиковый','Context cache saved:': 'Сэкономлено на кэше:','1M tokens, $': '1 млн токенов, $','Input (cache hit)': 'Ввод (попадание в кэш)','Input (cache miss)': 'Ввод (промах кэша)','Output': 'Вывод','SESSION TOKENS': 'ТОКЕНЫ СЕССИИ','SPEND BY MODEL': 'РАСХОД ПО МОДЕЛЯМ','Session total:': 'Всего за сессию:','Copy Summary': 'Скопировать сводку','Context Lens': 'Линза контекста','Saved tokens': 'Сэкономлено токенов','% Saved': '% экономии','ops': 'операций','Budget': 'Бюджет','Active focus': 'Активный фокус','No focus paths set': 'Пути фокусировки не заданы','Status': 'Статус','Graph & CI': 'Граф и CI','Events & PRs': 'События и PR','Branch': 'Ветка','Sync': 'Синхронизация','Up to date with remote (@{upstream})': 'Синхронизировано с удалённым репозиторием (@{upstream})','Up to date with remote': 'Синхронизировано с удалённым репозиторием','Clean': 'Чисто','No modified or untracked files in the working directory.': 'В рабочем каталоге нет изменённых или неотслеживаемых файлов.','RECENT COMMITS': 'ПОСЛЕДНИЕ КОММИТЫ','Active jobs': 'Активные задачи','No active jobs': 'Нет активных задач','Register in Models': 'Зарегистрировать в моделях','Base URL': 'Базовый URL','API key env / credential name': 'Имя переменной окружения / ключа API','Default model': 'Модель по умолчанию','Enabled': 'Включено','Save': 'Сохранить','Saved': 'Сохранено','Refresh': 'Обновить','Loading settings…': 'Загрузка настроек…','Preferred engine': 'Предпочитаемый движок','API key': 'API-ключ','stored, leave empty to keep it': 'сохранён, оставьте пустым для сохранения','Built-in official endpoint, leave blank to use it': 'Встроенная официальная конечная точка, оставьте пустым','Discard': 'Сбросить','Model synchronization': 'Синхронизация моделей','All API-key providers': 'Все провайдеры API-ключей','Preview only (dry-run)': 'Только предпросмотр (dry-run)','Confirm stale removal': 'Подтверждать удаление устаревших','Refresh status': 'Обновить статус','Refresh all': 'Обновить всё','Discover': 'Обнаружить','Check availability': 'Проверить доступность','Check credentials': 'Проверить учётные данные','Choose models': 'Выбрать модели','Manual model selection': 'Выбор моделей вручную','Mode': 'Режим','Hybrid (auto-rewrite + tools)': 'Гибридный (авто-переписывание + инструменты)','Describe strategy': 'Стратегия описания','Auto (use vision LLM)': 'Авто (использовать Vision LLM)','Escalation': 'Эскалация','Simple only (one pass)': 'Только простая (один проход)','Routing': 'Маршрутизация','Channel order': 'Порядок каналов','Issue Reporter': 'Репортёр проблем','GitHub sign-in is not configured for this installation.': 'Вход через GitHub не настроен для этой установки.','0 plugins': '0 плагинов','Catalog': 'Каталог','Report Editor': 'Редактор отчёта','My Reports': 'Мои отчёты','Authorization': 'Авторизация','Search installed plugins…': 'Поиск установленных плагинов…','Search installed plugins...': 'Поиск установленных плагинов...','Refresh inventory': 'Обновить список','Loading inventory & status…': 'Загрузка списка и статуса…','Loading inventory & status...': 'Загрузка списка и статуса...'
}
const isProtectedTextNode = (node) => {const p = node.parentElement
if (!p) return true
if (p.closest('[data-no-translate],[data-no-translation],.no-translate')) return true
if (p.closest('code, pre, script, style, textarea, input, select, kbd, samp, [contenteditable="true"], [data-composer-input], [role="textbox"]')) return true
if (p.closest('.katex, [data-latex], math')) return true
if (p.closest('[data-chat-flow-status="running"], [data-turn-running], [data-turn-tail], [data-streaming="true"], .dsw-turn-running, [class*="streaming"], [class*="Streaming"]')) return true
const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
if (sel && !sel.isCollapsed && sel.rangeCount > 0) {try {const range = sel.getRangeAt(0)
if (range.intersectsNode ? range.intersectsNode(node) : (sel.containsNode && sel.containsNode(node, true))) {return true
}} catch (e) {  void e; }}
return false
}
const ZH_WALKER = (root) => {try {if (runtime.getLocale && runtime.getLocale().active !== 'ru') return
const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
const hits = []
const curOverrides = getOverrides()
for (let node = walker.nextNode(); node; node = walker.nextNode()) {const val = node.nodeValue
if (!val) continue
const trimmed = val.trim()
if (!trimmed) continue
if (isProtectedTextNode(node)) continue
if (curOverrides[trimmed] !== undefined) {node.nodeValue = val.replace(trimmed, curOverrides[trimmed])
continue
}
const p = node.parentElement
const isProtectedContent = p && p.closest('.chat-message, .markdown-body')
if (trimmed.length >= 1 && ZH_CJK.test(val)) {if (!isProtectedContent) hits.push(node)
} else if (trimmed.length >= 1 && DOM_EN_TEXT[trimmed]) {if (!isProtectedContent) {node.nodeValue = val.replace(trimmed, DOM_EN_TEXT[trimmed])
}}}
for (const node of hits) {const next = zhTranslateText(node.nodeValue)
if (next && next !== node.nodeValue) node.nodeValue = next
}
for (const el of root.querySelectorAll ? root.querySelectorAll('[title],[placeholder],[aria-label]') : []) {if (el.closest && el.closest('[data-no-translate],[data-no-translation],.no-translate')) continue
for (const attr of ['title', 'placeholder', 'aria-label']) {const v = el.getAttribute && el.getAttribute(attr)
if (v) {const tr = v.trim()
if (DOM_EN_TEXT[tr]) {el.setAttribute(attr, v.replace(tr, DOM_EN_TEXT[tr]))
} else if (DOM_EN_ATTRS[tr]) {el.setAttribute(attr, v.replace(tr, DOM_EN_ATTRS[tr]))
} else if (ZH_CJK.test(v)) {const next = zhTranslateText(v)
if (next) el.setAttribute(attr, next)
}}}}
if (root.getAttribute) {for (const attr of ['title', 'placeholder', 'aria-label']) {const v = root.getAttribute(attr)
if (v) {const tr = v.trim()
if (DOM_EN_TEXT[tr]) root.setAttribute(attr, v.replace(tr, DOM_EN_TEXT[tr]))
else if (DOM_EN_ATTRS[tr]) root.setAttribute(attr, v.replace(tr, DOM_EN_ATTRS[tr]))
}}}} catch (err) {  void err; }}
let zhObserver = null
let zhWalking = false
const queueZhWalk = () => {if (zhDebounceTimer) return
zhDebounceTimer = setTimeout(() => {zhDebounceTimer = null
if (zhWalking) return
zhWalking = true
try {ZH_WALKER(document.body)
} finally {zhWalking = false
}}, 80)
}
const onInteraction = () => queueZhWalk()
const syncZhDom = () => {try {if (typeof document === 'undefined') return
const ru = runtime.getLocale().active === 'ru'
if (!ru) {if (zhObserver) { zhObserver.disconnect(); zhObserver = null }
if (zhDebounceTimer) { clearTimeout(zhDebounceTimer); zhDebounceTimer = null }
document.removeEventListener('pointerup', onInteraction)
document.removeEventListener('click', onInteraction)
return
}
if (!zhObserver) {zhObserver = new MutationObserver((records) => {for (const record of records) {if (record.type === 'childList') {for (const node of record.addedNodes) {if (node.nodeType === 1) {if (node.closest && node.closest('.chat-message, .markdown-body, pre, code, [data-stream]')) continue
queueZhWalk()
return
}}}}})
zhObserver.observe(document.body, { childList: true, subtree: true })
document.addEventListener('pointerup', onInteraction, { passive: true })
document.addEventListener('click', onInteraction, { passive: true })
}
queueZhWalk()
} catch (err) {  void err; }}
const unsubscribeZh = runtime.subscribe(syncZhDom)
ctx.effect(() => {return () => {unsubscribeZh()
if (zhObserver) zhObserver.disconnect()
if (zhDebounceTimer) { clearTimeout(zhDebounceTimer); zhDebounceTimer = null }
if (typeof document !== 'undefined') {document.removeEventListener('pointerup', onInteraction)
document.removeEventListener('click', onInteraction)
}}}, 'dsh-russian-lang: zh-dom')
syncZhDom()
const TYPO_YO_PAIRS = [["еще","ещё"],["ее","её"],["черный","чёрный"],["черная","чёрная"],["черные","чёрные"],["зеленый","зелёный"],["желтый","жёлтый"],["легкий","лёгкий"],["тяжелый","тяжёлый"],["надежный","надёжный"],["дешевый","дешёвый"],["идет","идёт"],["дает","даёт"],["ведет","ведёт"],["несет","несёт"],["живет","живёт"],["привел","привёл"],["шел","шёл"],["нее","неё"],["мое","моё"],["серьезно","серьёзно"],["придется","придётся"],["насчет","насчёт"],["твое","твоё"],["свое","своё"],["пойдем","пойдём"],["пришел","пришёл"],["нашел","нашёл"],["идем","идём"],["вперед","вперёд"],["пошел","пошёл"],["ребенка","ребёнка"],["ребенок","ребёнок"],["счет","счёт"],["своем","своём"],["придет","придёт"],["ушел","ушёл"],["ждет","ждёт"],["мертв","мёртв"],["твоем","твоём"],["вернется","вернётся"],["днем","днём"],["найдем","найдём"],["пойдет","пойдёт"],["начнем","начнём"],["вернемся","вернёмся"],["остается","остаётся"],["принес","принёс"],["идешь","идёшь"],["трех","трёх"],["ребенком","ребёнком"],["самолет","самолёт"],["определенно","определённо"],["пойдешь","пойдёшь"],["умрет","умрёт"],["прием","приём"],["прошел","прошёл"],["убьет","убьёт"],["тетя","тётя"],["провел","провёл"],["произойдет","произойдёт"],["семьей","семьёй"],["пойдемте","пойдёмте"],["пройдет","пройдёт"],["возьмем","возьмём"],["вернешься","вернёшься"],["найдешь","найдёшь"],["живешь","живёшь"],["отчет","отчёт"],["займет","займёт"],["ждем","ждём"],["сошел","сошёл"],["вдвоем","вдвоём"],["найдет","найдёт"],["вел","вёл"],["живем","живём"],["зашел","зашёл"],["начнется","начнётся"],["путем","путём"],["подойдет","подойдёт"],["режиссер","режиссёр"],["уйдет","уйдёт"],["придешь","придёшь"],["идемте","идёмте"],["ведешь","ведёшь"],["пес","пёс"],["умрешь","умрёшь"],["ждешь","ждёшь"],["найдете","найдёте"],["найдется","найдётся"],["клево","клёво"],["поймешь","поймёшь"],["разберемся","разберёмся"],["времен","времён"],["введен","введён"],["включен","включён"],["включенных","включённых"],["возьмется","возьмётся"],["завершен","завершён"],["завершенного","завершённого"],["задает","задаёт"],["задается","задаётся"],["заменен","заменён"],["звезд","звёзд"],["звезды","звёзды"],["изменен","изменён"],["истек","истёк"],["незавершенная","незавершённая"],["неподтвержденные","неподтверждённые"],["несохраненные","несохранённые"],["обновлен","обновлён"],["обновленные","обновлённые"],["определен","определён"],["отклонен","отклонён"],["отменен","отменён"],["очередность","очерёдность"],["поврежден","повреждён"],["повторен","повторён"],["подключен","подключён"],["подтвержденные","подтверждённые"],["приемки","приёмки"],["раздает","раздаёт"],["разрешенная","разрешённая"],["разрешенные","разрешённые"],["создаем","создаём"],["сойдется","сойдётся"],["сохранен","сохранён"],["сохраненный","сохранённый"],["счету","счёту"],["тяжелые","тяжёлые"],["темная","тёмная"],["уберет","уберёт"],["удален","удалён"],["учетные","учётные"],["учетных","учётных"],["емкости","ёмкости"],["емкость","ёмкость"]]
const typoYo = makeTypoYo(TYPO_YO_PAIRS)
const getTypoConf = () => {try {const t = resolveTypography(scope.getSnapshot().value)
if (!t.enabled) return null
return { yo: t.yo }} catch (err) { return null }}
const typoNode = (node, conf) => {const before = node.nodeValue
if (!before || !before.match || (before.match(/[\u0400-\u04FF]/g) || []).length < 3) return
if (isProtectedTextNode(node)) return
if (node.parentElement && node.parentElement.closest('a, button')) return
if (/\$[^$\n]+\$/.test(before)) return
let after = typoQuotes(before)
after = typoDash(after)
after = typoPunct(after)
after = typoNbsp(after)
if (conf.yo) after = typoYo(after)
if (after !== before) node.nodeValue = after
}
const typoWalk = (root, conf) => {const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
for (let node = walker.nextNode(); node; node = walker.nextNode()) typoNode(node, conf)
}
let typoObserver = null
let typoQueued = null
const flushTypo = () => {typoQueued = null
try {const conf = getTypoConf()
if (!conf || !typoPending.size) return
for (const root of typoPending) {if (root.nodeType === 3) typoNode(root, conf)
else typoWalk(root, conf)
}
typoPending.clear()
} catch (err) {  void err; }}
const typoPending = new Set()
const queueTypo = (roots) => {for (const r of roots) typoPending.add(r)
if (!typoQueued) typoQueued = requestAnimationFrame(flushTypo)
}
const syncTypo = () => {try {if (typeof document === 'undefined') return
const conf = getTypoConf()
const isRu = runtime.getLocale ? runtime.getLocale().active === 'ru' : true
if (!isRu || !conf) {if (typoObserver) { typoObserver.disconnect(); typoObserver = null }
if (typoQueued) { cancelAnimationFrame(typoQueued); typoQueued = null }
typoPending.clear()
return
}
if (typoObserver) {typoWalk(document.body, conf)
return
}
typoWalk(document.body, conf)
typoObserver = new MutationObserver((records) => {const roots = []
for (const record of records) {if (record.type === 'childList') {for (const added of record.addedNodes) {if (added.nodeType === 3 || added.nodeType === 1) roots.push(added)
}}}
if (roots.length > 0) queueTypo(roots)
})
typoObserver.observe(document.body, { childList: true, subtree: true })
} catch (err) {  void err; }}
ctx.effect(() => {const unsubscribeLocale = runtime.subscribe(syncTypo)
const unsubscribeScope = typeof scope?.subscribe === 'function' ? scope.subscribe(syncTypo) : (() => {})
syncTypo()
return () => {unsubscribeLocale()
unsubscribeScope()
if (typoObserver) { typoObserver.disconnect(); typoObserver = null }
if (typoQueued) { cancelAnimationFrame(typoQueued); typoQueued = null }
typoPending.clear()
}}, 'dsh-russian-lang: typography')
const layout = makeLayout(new Set(["не","что","ты","это","на","он","мы","как","вы","да","мне","нет","меня","так","но","его","все","она","тебя","если","за","бы","тебе","они","чтобы","же","есть","просто","из","для"]), new Set())
const layoutFixCandidate = layout.candidate
const learnWords = layout.learnWords
const layoutEnabled = () => scope.getSnapshot().value?.layoutConversion !== false
const slashAliasesEnabled = () => {const val = scope.getSnapshot().value
const ruActive = runtime.getLocale ? (runtime.getLocale().active === 'ru') : true
return ruActive && val?.slashAliases !== false
}
function setNativeInputValue(el, value, cursorStart, cursorEnd) {if (!el) return
const oldVal = el.value || ''
if (oldVal === value) return
const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
const desc = Object.getOwnPropertyDescriptor(proto, 'value')
if (desc && desc.set) {desc.set.call(el, value)
} else {el.value = value
}
if (el._valueTracker) {el._valueTracker.setValue(value === '' ? '__force__' : '')
}
try {const propsKey = Object.keys(el).find((k) => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'))
if (propsKey && el[propsKey] && typeof el[propsKey].onChange === 'function') {el[propsKey].onChange({ target: el, currentTarget: el })
}} catch (e) {  void e; }
try {el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
} catch (e) {el.dispatchEvent(new Event('input', { bubbles: true }))
}
el.dispatchEvent(new Event('change', { bubbles: true }))
if (typeof cursorStart === 'number' && typeof el.setSelectionRange === 'function') {const end = typeof cursorEnd === 'number' ? cursorEnd : cursorStart
try { el.setSelectionRange(cursorStart, end) } catch (e) {  void e; }}}
let layoutHintEl = null
const layoutCurrentInput = (ev) => {if (ev && ev.target) {const t = ev.target
if (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && (t.type === 'text' || !t.type))) {return t
}
const c = t.closest ? t.closest('[data-composer-input], [contenteditable="true"], [role="textbox"]') : null
if (c) return c
}
const el = document.activeElement
if (el) {if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && (el.type === 'text' || !el.type))) {return el
}
const c = el.closest ? el.closest('[data-composer-input], [contenteditable="true"], [role="textbox"]') : null
if (c) return c
}
const focused = document.querySelector('[data-composer-input], [contenteditable="true"][role="textbox"], textarea:focus, textarea')
if (focused) return focused
return null
}
function getCaretCharacterOffset(root) {if (!root) return -1
const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
if (!sel || !sel.rangeCount) return -1
try {const range = sel.getRangeAt(0)
if (!root.contains(range.startContainer)) return -1
const preCaretRange = range.cloneRange()
preCaretRange.selectNodeContents(root)
preCaretRange.setEnd(range.startContainer, range.startOffset)
return preCaretRange.toString().length
} catch (e) {return -1
}}
function setCaretCharacterOffset(root, offset) {if (!root || offset < 0) return
const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
if (!sel) return
try {let current = 0
let targetNode = null
let targetOffset = 0
const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
let node = walker.nextNode()
while (node) {const len = node.nodeValue.length
if (current + len >= offset) {targetNode = node
targetOffset = Math.max(0, offset - current)
break
}
current += len
node = walker.nextNode()
}
if (targetNode) {const range = document.createRange()
range.setStart(targetNode, targetOffset)
range.collapse(true)
sel.removeAllRanges()
sel.addRange(range)
}} catch (e) {  void e; }}
const isCaretInCode = (el, value, caretOffset) => {if (!el) return false
if (caretOffset == null || caretOffset < 0) caretOffset = (value || '').length
const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
if (sel && sel.anchorNode && sel.anchorNode.parentElement) {if (sel.anchorNode.parentElement.closest('code, pre, .katex, [data-latex], math')) return true
}
const textBefore = (value || '').slice(0, caretOffset)
const triple = textBefore.match(/```/g)
if (triple && triple.length % 2 === 1) return true
const lastLine = textBefore.split('\n').pop()
const single = lastLine.match(/`/g)
if (single && single.length % 2 === 1) return true
return false
}
const getComposerText = (el) => {if (!el) return ''
if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {return el.value || ''
}
const host = (el.closest && el.closest('[data-composer-input], [contenteditable="true"]')) || el
const raw = host.innerText !== undefined ? host.innerText : (host.textContent || '')
return raw.replace(/\r/g, '').replace(/[\u200B\uFEFF]/g, '').replace(/\n+$/, '')
}
const setComposerText = (el, value, cursorStart, cursorEnd) => {if (!el) return
if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {setNativeInputValue(el, value, cursorStart, cursorEnd)
return
}
const host = (el.closest && el.closest('[data-composer-input], [contenteditable="true"]')) || el
const initialOffset = typeof cursorStart === 'number' ? cursorStart : getCaretCharacterOffset(host)
try {host.focus()
const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
if (sel) {const range = document.createRange()
range.selectNodeContents(host)
sel.removeAllRanges()
sel.addRange(range)
}
document.execCommand('insertText', false, value)
const targetOffset = typeof cursorStart === 'number' ? cursorStart : (initialOffset >= 0 ? Math.min(initialOffset, value.length) : value.length)
setCaretCharacterOffset(host, targetOffset)
} catch (e) {  void e; }}
const layoutDismiss = () => {if (layoutHintEl) { layoutHintEl.remove(); layoutHintEl = null }}
const layoutShowHint = (inputEl, converted, direction) => {layoutDismiss()
layoutHintEl = document.createElement('div')
layoutHintEl.dataset.russianLangLayout = '1'
Object.assign(layoutHintEl.style, {position: 'fixed', zIndex: '99999', background: 'var(--dsw-alias-bg-layer-3)',color: 'var(--dsw-alias-label-primary)',border: '1px solid var(--dsw-alias-border-l2)', borderRadius: '8px', padding: '6px 10px',fontSize: '13px', boxShadow: 'var(--dsw-elevation-2, var(--dsw-alias-shadow-l2))', cursor: 'pointer'
})
const label = direction === 'cyr2lat' ? 'Команда, не та раскладка' : 'Не та раскладка'
layoutHintEl.textContent = label + ': ' + converted
layoutHintEl.addEventListener('mousedown', (ev) => {if (!layoutEnabled()) return
ev.preventDefault()
setComposerText(inputEl, converted)
learnWords(converted)
layoutDismiss()
})
document.body.appendChild(layoutHintEl)
const r = inputEl.getBoundingClientRect()
layoutHintEl.style.left = (r.left + 8) + 'px'
layoutHintEl.style.bottom = (window.innerHeight - r.top + 6) + 'px'
}
let layoutBadgeEl = null
const layoutBadge = (el) => {const value = getComposerText(el)
const detected = typeof detectInputLayout === 'function' ? detectInputLayout(value) : null
const last = value.trim().slice(-1)
const isCyr = /[\u0430-\u044f\u0451]/.test(last)
const isLat = /[a-z]/i.test(last)
const label = detected || (isCyr ? 'RU' : (isLat ? 'EN' : ''))
if (!label) { layoutBadgeHide(); return }
if (!layoutBadgeEl) {layoutBadgeEl = document.createElement('button')
layoutBadgeEl.type = 'button'
layoutBadgeEl.dataset.russianLangLayoutBadge = '1'
Object.assign(layoutBadgeEl.style, {position: 'fixed', zIndex: '99998', background: 'var(--dsw-alias-bg-layer-3)',color: 'var(--dsw-alias-label-secondary)', border: '1px solid var(--dsw-alias-border-l2)',borderRadius: '6px', padding: '1px 6px', fontSize: '11px', cursor: 'pointer',fontFamily: 'monospace', lineHeight: '1.4', fontWeight: '600'
})
layoutBadgeEl.title = 'Раскладка — клик: конвертировать (Alt+L)'
layoutBadgeEl.addEventListener('mousedown', (ev) => {if (!layoutEnabled()) return
ev.preventDefault()
const v = getComposerText(el)
const c = layoutFixCandidate(v, 'lat2cyr') || layoutFixCandidate(v, 'cyr2lat')
if (c) {setComposerText(el, c.converted)
learnWords(c.converted)
}})
document.body.appendChild(layoutBadgeEl)
}
layoutBadgeEl.textContent = label
const r = el.getBoundingClientRect()
layoutBadgeEl.style.left = (r.right - 36) + 'px'
layoutBadgeEl.style.top = (r.top - 22) + 'px'
}
const layoutBadgeHide = () => {if (layoutBadgeEl) { layoutBadgeEl.remove(); layoutBadgeEl = null }}
let isFormatting = false
const layoutOnInput = (ev) => {if (isFormatting) return
if (!layoutEnabled()) { layoutDismiss(); layoutBadgeHide(); return }
try {const el = layoutCurrentInput(ev)
if (!el) { layoutDismiss(); layoutBadgeHide(); return }
layoutBadge(el)
const value = getComposerText(el)
if (value.trim().length < 4) { layoutDismiss(); return }
const latCount = (value.match(/[a-z]/g) || []).length
const cyrCount = (value.match(/[\u0430-\u044f\u0451]/g) || []).length
if (latCount > cyrCount && cyrCount === 0) {const c = layoutFixCandidate(value, 'lat2cyr')
if (c) { layoutShowHint(el, c.converted, 'ru'); return }}
if (cyrCount > 0 && latCount === 0 && value.trim().startsWith('/')) {const c = layoutFixCandidate(value, 'cyr2lat')
if (c) { layoutShowHint(el, c.converted, 'cmd'); return }}
layoutDismiss()
} catch (err) {  void err; }}
const unsubscribeLayout = runtime.subscribe(layoutOnInput)
const layoutOnKeydown = (ev) => {const el = layoutCurrentInput(ev)
if (!el) return
const value = getComposerText(el)
const isL = ev.code === 'KeyL' || ev.key.toLowerCase() === 'l' || ev.key.toLowerCase() === 'д'
if (layoutEnabled() && ev.altKey && !ev.ctrlKey && !ev.metaKey && isL) {const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
const selectedText = (sel && !sel.isCollapsed) ? sel.toString() : ''
if (selectedText) {const c = layoutFixCandidate(selectedText, 'lat2cyr') || layoutFixCandidate(selectedText, 'cyr2lat')
if (c) {ev.preventDefault()
isFormatting = true
try {if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {const sStart = el.selectionStart || 0
const sEnd = el.selectionEnd || sStart
const nextVal = value.slice(0, sStart) + c.converted + value.slice(sEnd)
setNativeInputValue(el, nextVal, sStart, sStart + c.converted.length)
} else {document.execCommand('insertText', false, c.converted)
}
learnWords(c.converted)
} finally {isFormatting = false
}
return
}}
const c = layoutFixCandidate(value, 'lat2cyr') || layoutFixCandidate(value, 'cyr2lat')
if (c) {ev.preventDefault()
isFormatting = true
try {if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {const sStart = el.selectionStart || 0
const sEnd = el.selectionEnd || sStart
setNativeInputValue(el, c.converted, sStart, sEnd)
} else {const host = (el.closest && el.closest('[data-composer-input], [contenteditable="true"]')) || el
const offset = getCaretCharacterOffset(host)
setComposerText(el, c.converted, offset, offset)
}
learnWords(c.converted)
} finally {isFormatting = false
}}
return
}
if ((ev.key === ' ' || ev.key === 'Enter') && slashAliasesEnabled()) {if (value && value.startsWith('/') && typeof expandSlashAlias === 'function') {const expanded = expandSlashAlias(value)
if (expanded !== value) {if (ev.key === ' ') {ev.preventDefault()
isFormatting = true
try {const nextVal = expanded + ' '
setComposerText(el, nextVal, nextVal.length, nextVal.length)
} finally {isFormatting = false
}
return
} else if (ev.key === 'Enter') {isFormatting = true
try {setComposerText(el, expanded, expanded.length, expanded.length)
} finally {isFormatting = false
}}}}}
if (ev.key === 'Enter' && !ev.shiftKey && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {const typoLive = resolveTypography(scope ? scope.getSnapshot().value : null).liveInput
if (typoLive && typeof formatInputLive === 'function' && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) {const formatted = formatInputLive(value)
if (formatted && formatted !== value) {setNativeInputValue(el, formatted, formatted.length, formatted.length)
}}}
try {const typoLive = resolveTypography(scope ? scope.getSnapshot().value : null).liveInput
if (typoLive && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {const isTextarea = el.tagName === 'TEXTAREA' || el.tagName === 'INPUT'
if (isTextarea) {const caretPos = el.selectionStart || 0
if (!isCaretInCode(el, value, caretPos)) {const textBefore = caretPos >= 0 ? value.slice(0, caretPos) : value
if (ev.key === '-' && textBefore.endsWith('-')) {ev.preventDefault()
isFormatting = true
try {const nextVal = value.slice(0, caretPos - 1) + '—' + value.slice(el.selectionEnd || caretPos)
setNativeInputValue(el, nextVal, caretPos, caretPos)
} finally {isFormatting = false
}
return
}
if (ev.key === '"') {ev.preventDefault()
isFormatting = true
try {const prevChar = textBefore.slice(-1)
const isOpening = !textBefore || /[\s([{-]/.test(prevChar)
const quoteChar = isOpening ? '«' : '»'
const nextVal = value.slice(0, caretPos) + quoteChar + value.slice(el.selectionEnd || caretPos)
setNativeInputValue(el, nextVal, caretPos + 1, caretPos + 1)
} finally {isFormatting = false
}
return
}}}}} catch (e) {  void e; }}
const getHoverBox = () => {if (typeof document === 'undefined') return null
if (!hoverBoxEl) {hoverBoxEl = document.createElement('div')
hoverBoxEl.id = 'dsh-ru-inspector-hover'
hoverBoxEl.className = 'rl-inspector-hover'
hoverBoxEl.innerHTML = '<span class="rl-inspector-badge"></span>'
document.body.appendChild(hoverBoxEl)
}
return hoverBoxEl
}
updateInspectorPill = () => {if (typeof document === 'undefined') return
if (!pillEl) {pillEl = document.createElement('div')
pillEl.id = 'dsh-ru-inspector-pill'
pillEl.className = 'rl-inspector-pill'
pillEl.innerHTML = '<span>🔍 Инспектор</span>' +
'<button type="button" class="rl-btn rl-pill-exit" style="padding:2px 8px;font-size:11px;height:22px;">✕ Выйти (Alt+I)</button>'
pillEl.querySelector('.rl-pill-exit').onclick = () => {isInspectorActive = false
updateInspectorPill()
if (hoverBoxEl) hoverBoxEl.style.display = 'none'
}
document.body.appendChild(pillEl)
}
pillEl.style.display = isInspectorActive ? 'flex' : 'none'
if (isInspectorActive && pillEl.classList) pillEl.classList.add('rl-inspector-pill-active')
}
const escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const openProposalModal = (info) => {if (typeof document === 'undefined') return
const oldP = document.getElementById('dsh-ru-proposal-modal')
if (oldP) oldP.remove()
const pmodal = document.createElement('div')
pmodal.id = 'dsh-ru-proposal-modal'
pmodal.className = 'rl-modal-mask'
pmodal.style.zIndex = '100001'
const r = (lbl, val, cls) => val
? '<div class="rl-diff-row"><span style="color:var(--rl-ls);font-size:11px;">' + lbl + '</span><code class="rl-code-box ' + (cls || '') + '">' + escapeHtml(val) + '</code></div>'
: ''
pmodal.innerHTML = '<div class="rl-modal-box" style="max-width:540px;max-height:90vh;overflow-y:auto;">' +
'<div style="display:flex;justify-content:space-between;align-items:center;">' +
'<div style="font-weight:600;font-size:14px;">💡 Предложение исправления перевода</div>' +
'<button type="button" class="rl-proposal-close-btn" style="background:none;border:none;color:var(--rl-ls);font-size:18px;cursor:pointer;">&times;</button>' +
'</div>' +
'<div style="font-size:12px;color:var(--rl-ls);line-height:1.4;">' +
'Предложение оформляется как публичный запрос на улучшение перевода в проекте. Локальные оверрайды не изменяются.' +
'</div>' +
'<div class="rl-sub-box">' +
'<div style="font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Сравнение вариантов</div>' +
r('Оригинал (EN/ZH):', info.origText) +
r('Текущий перевод (было):', info.currentTranslation || info.rawText) +
r('Активный локальный оверрайд:', info.overrideText, 'rl-color-warn') +
r('Предлагаемый перевод (стало):', info.proposal, 'rl-color-brand') +
'</div>' +
'<div class="rl-meta-box">' +
'<div>• <b>Namespace</b>: <code>' + escapeHtml(info.ns || '(DOM узел)') + '</code></div>' +
'<div>• <b>Ключ</b>: <code>' + escapeHtml(info.key || '(DOM узел)') + '</code></div>' +
(info.plugin ? '<div>• <b>Плагин</b>: <code>' + escapeHtml(info.plugin) + '</code></div>' : '') +
'<div>• <b>Версия русификатора</b>: <code>0.3.42</code></div>' +
'</div>' +
'<div style="display:flex;flex-direction:column;gap:4px;">' +
'<label style="font-size:12px;font-weight:500;">Пояснение к исправлению (необязательно):</label>' +
'<textarea class="rl-proposal-comment rl-select" placeholder="Почему этот вариант лучше, где отображается в UI..." style="min-height:50px;width:100%;resize:vertical;font-family:inherit;"></textarea>' +
'</div>' +
'<div class="rl-proposal-result" style="display:none;font-size:12px;padding:8px 10px;border-radius:6px;background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 10%,transparent);color:var(--dsw-alias-state-success-primary);"></div>' +
'<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px;">' +
'<button type="button" class="rl-btn rl-proposal-cancel-btn">Отмена</button>' +
'<button type="button" class="rl-btn rl-btn-primary rl-proposal-submit-btn">🚀 Открыть форму issue на GitHub</button>' +
'</div>' +
'</div>'
const closeProposal = () => pmodal.remove()
pmodal.querySelector('.rl-proposal-close-btn').onclick = closeProposal
pmodal.querySelector('.rl-proposal-cancel-btn').onclick = closeProposal
pmodal.onclick = (e) => { if (e.target === pmodal) closeProposal() }
const submitBtn = pmodal.querySelector('.rl-proposal-submit-btn')
const commentArea = pmodal.querySelector('.rl-proposal-comment')
const resultDiv = pmodal.querySelector('.rl-proposal-result')
submitBtn.onclick = () => {if (submitBtn.disabled) return
submitBtn.disabled = true
submitBtn.textContent = 'Подготовка…'
const commentVal = commentArea.value.trim()
const issueUrl = makeIssueUrl({isProposal: true,proposal: info.proposal,original: info.origText || info.rawText,current: info.currentTranslation || info.rawText,override: info.overrideText || null,comment: commentVal || null,ns: info.ns,key: info.key,plugin: info.plugin,dshVersion: (typeof runtime?.getDshVersion === 'function' ? runtime.getDshVersion() : null) || '0.2.1-alpha.1'
}, '0.3.42')
try { window.open(issueUrl, '_blank') } catch (_) {  void _; }
resultDiv.style.display = 'block'
resultDiv.innerHTML = 'Форма создания issue открыта в новой вкладке. Если окно заблокировано браузером: <a href="' + escapeHtml(issueUrl) + '" target="_blank" rel="noopener noreferrer" style="color:inherit;font-weight:600;text-decoration:underline;">Нажмите сюда для перехода</a>'
submitBtn.textContent = '✓ Форма открыта'
setTimeout(() => {submitBtn.disabled = false
submitBtn.textContent = '🚀 Открыть форму issue на GitHub'
}, 3000)
}
document.body.appendChild(pmodal)
}
const openInspectorModal = (meta, rawText, targetElement) => {if (typeof document === 'undefined') return
if (hoverBoxEl) hoverBoxEl.style.display = 'none'
const old = document.getElementById('dsh-ru-inspector-modal')
if (old) old.remove()
const modal = document.createElement('div')
modal.id = 'dsh-ru-inspector-modal'
modal.className = 'rl-modal-mask'
const k = meta ? (meta.ns && meta.key ? meta.ns + '.' + meta.key : (meta.key || '')) : ''
const ns = meta && meta.ns ? meta.ns : ''
const origText = meta ? (meta.zh || meta.en || '') : ''
let srcLabel = 'Текст'
if (meta) {if (meta.source === 'override') srcLabel = '✍️ Оверрайд'
else if (meta.source === 'dictionary') srcLabel = '🟢 Словарь' + (ns ? ' ' + ns : '')
else if (meta.source === 'dom_zh') srcLabel = '🟡 DOM ZH'
else if (meta.source === 'dom_zh_original') srcLabel = '🟡 DOM ZH (Оригинал)'
else if (meta.source === 'dom_en') srcLabel = '🟡 DOM EN'
else if (meta.source === 'dom_en_original') srcLabel = '🟡 DOM EN (Оригинал)'
else if (meta.source === 'untranslated_zh') srcLabel = '🔴 Не переведено (ZH)'
else if (meta.source === 'untranslated_en') srcLabel = '🔴 Не переведено (EN)'
}
const currentTranslation = (meta && meta.value) || rawText
modal.innerHTML = '<div class="rl-modal-box">' +
'<div style="display:flex;justify-content:space-between;align-items:center;">' +
'<div style="font-weight:600;font-size:14px;display:flex;align-items:center;gap:6px;">' +
'<span>🔍 Инспектор перевода</span>' +
'<span class="rl-badge rl-badge-dim" style="font-size:11px;"></span>' +
'</div>' +
'<button type="button" class="rl-btn-close" style="background:none;border:none;color:var(--dsw-alias-label-secondary);font-size:18px;cursor:pointer;">&times;</button>' +
'</div>' +
'<div style="display:flex;flex-direction:column;gap:8px;font-size:12px;background:var(--dsw-alias-bg-layer-3);padding:10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);">' +
'<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
'<span style="color:var(--dsw-alias-label-secondary);">Ключ:</span>' +
'<div style="display:flex;gap:6px;align-items:center;">' +
'<code class="rl-modal-key" style="color:var(--dsw-brand-primary, var(--dsw-alias-state-brand-primary));font-weight:600;font-size:12px;"></code>' +
'<button type="button" class="rl-btn rl-copy-key-btn" style="padding:1px 6px;height:20px;font-size:10px;" title="Скопировать ключ">📋</button>' +
'</div>' +
'</div>' +
'<div class="rl-modal-orig-row" style="color:var(--dsw-alias-label-secondary);word-break:break-word;display:none;">Оригинал: <b class="rl-orig-text" style="color:var(--dsw-alias-label-primary);"></b></div>' +
'<div style="color:var(--dsw-alias-label-secondary);word-break:break-word;">Текущий текст: <b class="rl-raw-text" style="color:var(--dsw-alias-label-primary)"></b></div>' +
'</div>' +
'<div style="display:flex;flex-direction:column;gap:6px;">' +
'<label style="font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary);">Ваш вариант перевода (оверрайд):</label>' +
'<textarea class="rl-edit-val rl-select" placeholder="Ваш перевод..." style="min-height:60px;font-family:inherit;width:100%;resize:vertical;"></textarea>' +
'</div>' +
'<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
'<div style="display:flex;gap:6px;align-items:center;">' +
'<button type="button" class="rl-btn rl-copy-report-btn" style="font-size:11px;">📋 Скопировать репорт</button>' +
'<button type="button" class="rl-btn rl-propose-btn" style="font-size:11px;" title="Предложить официальное исправление в проект">💡 Предложить исправление</button>' +
'</div>' +
'<div style="display:flex;gap:6px;">' +
(meta && meta.source === 'override' ? '<button type="button" class="rl-btn rl-reset-override-btn" style="color:var(--dsw-alias-state-error-primary);font-size:11px;">Сбросить</button>' : '') +
'<button type="button" class="rl-btn rl-cancel-btn">Отмена</button>' +
'<button type="button" class="rl-btn rl-btn-primary rl-save-btn">✓ Применить оверрайд</button>' +
'</div>' +
'</div>' +
'</div>'
modal.querySelector('.rl-badge-dim').textContent = srcLabel
modal.querySelector('.rl-modal-key').textContent = k || '(текстовый узел)'
if (origText) {const row = modal.querySelector('.rl-modal-orig-row')
if (row) row.style.display = 'block'
const el = modal.querySelector('.rl-orig-text')
if (el) el.textContent = origText
}
modal.querySelector('.rl-raw-text').textContent = rawText
const textarea = modal.querySelector('.rl-edit-val')
textarea.value = currentTranslation
modal.querySelector('.rl-btn-close').onclick = () => modal.remove()
modal.querySelector('.rl-cancel-btn').onclick = () => modal.remove()
modal.onclick = (e) => { if (e.target === modal) modal.remove() }
const copyKeyBtn = modal.querySelector('.rl-copy-key-btn')
if (copyKeyBtn) {copyKeyBtn.onclick = () => {try { navigator.clipboard.writeText(k || rawText) } catch (err) {  void err; }
copyKeyBtn.textContent = '✓'
setTimeout(() => { copyKeyBtn.textContent = '📋' }, 1500)
}}
const copyReportBtn = modal.querySelector('.rl-copy-report-btn')
if (copyReportBtn) {copyReportBtn.onclick = () => {const snippet = typeof generateBugReportSnippet === 'function'
? generateBugReportSnippet({ key: k, ns, original: origText || rawText, current: rawText, override: textarea.value.trim(), pkgVersion: '0.3.42' })
: ('### Репорт: ' + (k || rawText) + '\n- Исходный: ' + (origText || rawText) + '\n- Перевод: ' + textarea.value.trim())
try { navigator.clipboard.writeText(snippet) } catch (err) {  void err; }
copyReportBtn.textContent = '✓ Скопировано'
setTimeout(() => { copyReportBtn.textContent = '📋 Скопировать репорт' }, 2000)
}}
const proposeBtn = modal.querySelector('.rl-propose-btn')
if (proposeBtn) {proposeBtn.onclick = () => {const proposalVal = textarea.value.trim()
if (!proposalVal) {alert('Пожалуйста, введите предлагаемый вариант перевода.')
return
}
if (proposalVal === rawText || (origText && proposalVal === origText)) {if (typeof window !== 'undefined' && typeof window.confirm === 'function') {if (!window.confirm('Предложенный перевод совпадает с текущим значением. Всё равно продолжить?')) {return
}}}
const phCheck = typeof validatePlaceholders === 'function'
? validatePlaceholders(origText || rawText, proposalVal)
: { valid: true }
if (!phCheck.valid) {if (typeof window !== 'undefined' && typeof window.confirm === 'function') {if (!window.confirm('Внимание: ' + phCheck.error + '\nВсё равно открыть форму предложения?')) {return
}}}
openProposalModal({meta,rawText,origText,currentTranslation,proposal: proposalVal,overrideText: getOverrides()[k || rawText] || null,targetKey: k || rawText,ns,key: k,plugin: (meta && meta.plugin) || ns
})
}}
const saveBtn = modal.querySelector('.rl-save-btn')
const resetBtn = modal.querySelector('.rl-reset-override-btn')
if (resetBtn) {resetBtn.onclick = async () => {const targetKey = k || rawText
const cur = getOverrides()
const updated = Object.assign({}, cur)
delete updated[targetKey]
resetBtn.disabled = true
try {const res = await Promise.resolve(scope.set('overrides', updated))
if (res === false) throw new Error('Reset rejected')
modal.remove()
if (typeof queueZhWalk === 'function') queueZhWalk()
} catch (err) {resetBtn.disabled = false
console.warn('dsh-russian-lang: reset override failed', err && err.message || err)
}}}
const inspSnap = typeof scope?.getSnapshot === 'function' ? scope.getSnapshot() : { status: 'ready', writable: true }
if (inspSnap.status !== 'ready' || inspSnap.writable === false) {if (saveBtn) {saveBtn.disabled = true
saveBtn.title = 'Настройки доступны только для чтения'
}
if (resetBtn) resetBtn.disabled = true
}
if (saveBtn) {saveBtn.onclick = async () => {const val = textarea.value.trim()
const targetKey = k || rawText
if (!targetKey || !val || saveBtn.disabled) return
const cur = getOverrides()
const updated = Object.assign({}, cur, { [targetKey]: val })
saveBtn.disabled = true
saveBtn.textContent = 'Сохранение…'
try {const res = await Promise.resolve(scope.set('overrides', updated))
if (res === false) throw new Error('Save rejected')
if (targetElement) {try {if (targetElement.childNodes && targetElement.childNodes.length === 1 && targetElement.childNodes[0].nodeType === 3) {targetElement.childNodes[0].nodeValue = val
} else {targetElement.textContent = val
}} catch (err) {  void err; }}
saveBtn.textContent = '✓ Применено'
if (typeof queueZhWalk === 'function') queueZhWalk()
setTimeout(() => modal.remove(), 500)
} catch (err) {saveBtn.disabled = false
saveBtn.textContent = 'Ошибка сохранения'
console.warn('dsh-russian-lang: save override failed', err && err.message || err)
}}}
document.body.appendChild(modal)
setTimeout(() => textarea.focus(), 50)
}
const inspectorOnClick = (e) => {if (!e.altKey && !isInspectorActive) return
if (e.target && e.target.closest && (e.target.closest('#dsh-ru-inspector-modal') || e.target.closest('#dsh-ru-inspector-pill'))) return
const raw = (e.target && (e.target.innerText || e.target.textContent) || '').trim()
if (!raw) return
e.preventDefault()
e.stopPropagation()
const meta = translationRegistry.get(raw) || (typeof findTranslationKey === 'function' ? findTranslationKey(raw, RU, getOverrides(), ZH_RU, DOM_EN_TEXT, { detectUntranslated: true }) : null)
openInspectorModal(meta, raw, e.target)
}
const inspectorOnMouseMove = (e) => {if (!isInspectorActive && !e.altKey) {if (hoverBoxEl && hoverBoxEl.style.display !== 'none') hoverBoxEl.style.display = 'none'
return
}
if (!e.target || (e.target.closest && (e.target.closest('#dsh-ru-inspector-modal') || e.target.closest('#dsh-ru-inspector-pill') || e.target.closest('#dsh-ru-inspector-hover')))) return
const raw = (e.target.innerText || e.target.textContent || '').trim()
if (!raw || raw.length > 200) {if (hoverBoxEl) hoverBoxEl.style.display = 'none'
return
}
const box = getHoverBox()
if (!box) return
const rect = e.target.getBoundingClientRect()
box.style.top = (rect.top + window.scrollY) + 'px'
box.style.left = (rect.left + window.scrollX) + 'px'
box.style.width = rect.width + 'px'
box.style.height = rect.height + 'px'
box.style.display = 'block'
const badge = box.querySelector('.rl-inspector-badge')
if (badge) {const meta = translationRegistry.get(raw) || (typeof findTranslationKey === 'function' ? findTranslationKey(raw, RU, getOverrides(), ZH_RU, DOM_EN_TEXT, { detectUntranslated: true }) : null)
let title = '🔍 Клик: инспекция'
if (meta) {if (meta.source === 'override') title = '✍️ ' + meta.key
else if (meta.source === 'dictionary') title = '🟢 ' + (meta.ns ? meta.ns + '.' : '') + meta.key
else if (meta.source === 'dom_zh') title = '🟡 ' + meta.zh
else if (meta.source === 'dom_en') title = '🟡 ' + meta.en
else if (meta.source === 'untranslated_zh') title = '🔴 ZH'
else if (meta.source === 'untranslated_en') title = '🔴 EN'
}
badge.textContent = title
}}
const inspectorOnKeyDown = (e) => {if (e.altKey && (e.key === 'i' || e.key === 'I' || e.code === 'KeyI')) {e.preventDefault()
isInspectorActive = !isInspectorActive
updateInspectorPill()
if (!isInspectorActive && hoverBoxEl) hoverBoxEl.style.display = 'none'
}}
const inspectorOnKeyUp = (e) => {if (e.key === 'Alt' && !isInspectorActive) {if (hoverBoxEl) hoverBoxEl.style.display = 'none'
}}
ctx.effect(() => {document.addEventListener('click', inspectorOnClick, true)
document.addEventListener('mousemove', inspectorOnMouseMove, true)
document.addEventListener('keydown', inspectorOnKeyDown, true)
document.addEventListener('keyup', inspectorOnKeyUp, true)
return () => {document.removeEventListener('click', inspectorOnClick, true)
document.removeEventListener('mousemove', inspectorOnMouseMove, true)
document.removeEventListener('keydown', inspectorOnKeyDown, true)
document.removeEventListener('keyup', inspectorOnKeyUp, true)
const m = document.getElementById('dsh-ru-inspector-modal')
if (m) m.remove()
if (hoverBoxEl) { hoverBoxEl.remove(); hoverBoxEl = null }
if (pillEl) { pillEl.remove(); pillEl = null }}}, 'dsh-russian-lang: inspector')
const toastObserver = typeof MutationObserver !== 'undefined' ? new MutationObserver((mutations) => {for (const m of mutations) {for (const node of m.addedNodes) {if (!node || node.nodeType !== 1) continue
if (node.matches && (node.matches('.dsw-toast, [role="alert"], .toast, .ant-message-notice'))) {const text = (node.innerText || node.textContent || '').trim()
if (/failed to fetch|network error|econnrefused|etimedout/i.test(text)) {const h = typeof humanizeError === 'function' ? humanizeError(text) : null
if (h && h.title) {const targetEl = node.querySelector('.toast-body, .ant-message-custom-content') || node
targetEl.textContent = h.title + ': ' + h.message
}}}}}}) : null
ctx.effect(() => {if (toastObserver && typeof document !== 'undefined' && document.body) {toastObserver.observe(document.body, { childList: true, subtree: true })
}
return () => { if (toastObserver) toastObserver.disconnect() }}, 'dsh-russian-lang: toast-humanizer')
ctx.effect(() => {const unsubscribeSettings = scope.subscribe(() => {if (!layoutEnabled()) { layoutDismiss(); layoutBadgeHide() }})
document.addEventListener('input', layoutOnInput, true)
document.addEventListener('keydown', layoutOnKeydown, true)
return () => {unsubscribeSettings()
unsubscribeLayout()
document.removeEventListener('input', layoutOnInput, true)
document.removeEventListener('keydown', layoutOnKeydown, true)
layoutDismiss()
layoutBadgeHide()
}}, 'dsh-russian-lang: layout')
if (!ctx.slots || !React) return
const toggleRu = (wantRu) => {try {if (runtime.getLocale().active === wantRu) return
runtime.setLocale(wantRu ? 'ru' : 'en')
} catch (err) { console.warn('dsh-russian-lang: toggle failed', err) }}
const registerPluginsItem = () => {return ctx.slots.inject('plugins.item', () =>
ctx.slots.register({name: 'plugins.item',id: FORM_NS,order: 60,label: () => 'Russian language',locale: SETTINGS_NS_NAME,inject: () => ({ scope, runtime, toggleRu }),}, SettingsCard),)
}
if (typeof configForms?.whileServed === 'function') {ctx.effect(() => configForms.whileServed([FORM_NS], registerPluginsItem), 'dsh-russian-lang: plugins.item')
} else {registerPluginsItem()
}
ctx.slots.inject('plugins.row.config', () =>
ctx.slots.register({name: 'plugins.row.config',key: ROW_CONFIG_KEY,locale: SETTINGS_NS_NAME,inject: () => ({ scope, runtime, toggleRu }),}, SettingsCard),)
try {ctx.slots.inject('conversation.session.header.utilities', () =>
ctx.slots.register({name: 'conversation.session.header.utilities',id: 'dsh-russian-lang-quick-switch',order: 100,locale: SETTINGS_NS_NAME,inject: () => ({ scope, runtime, toggleRu }),}, QuickLangSwitch),)
} catch (err) {  void err; }
try {ctx.slots.inject('conversation.chat.assistant-actions', () =>
ctx.slots.register({name: 'conversation.chat.assistant-actions',id: 'dsh-russian-lang-translate-action',order: 50,locale: SETTINGS_NS_NAME,inject: () => ({ runtime }),}, TranslateTurnAction),)
} catch (err) {  void err; }
try {ctx.slots.inject('conversation.session.header.utilities', () =>
ctx.slots.register({name: 'conversation.session.header.utilities',id: 'dsh-russian-lang-md-export',order: 101,locale: SETTINGS_NS_NAME,inject: () => ({ runtime }),}, ExportMarkdownButton),)
} catch (err) {  void err; }
module.exports.isProtectedTextNode = isProtectedTextNode
module.exports.ZH_WALKER = ZH_WALKER
}
function QuickLangSwitch(props) {const inj = typeof props.inject === 'function' ? (props.inject() || {}) : (props.inject || {})
const scope = props.scope || inj.scope
const runtime = props.runtime || inj.runtime
const toggleRu = props.toggleRu || inj.toggleRu
const [snap, setSnap] = React.useState(() => (scope && typeof scope.getSnapshot === 'function' ? scope.getSnapshot() : { status: 'ready', value: {} }))
const [locale, setLocaleState] = React.useState(runtime ? (runtime.getLocale().active || 'en') : 'ru')
React.useEffect(() => {if (!scope || typeof scope.subscribe !== 'function') return
const un = scope.subscribe(() => setSnap(scope.getSnapshot()))
setSnap(scope.getSnapshot())
return un
}, [scope])
React.useEffect(() => {if (!runtime) return
return runtime.subscribe(() => {try { setLocaleState(runtime.getLocale().active || 'en') } catch (e) {  void e; }})
}, [runtime])
if (snap.status !== 'ready' || snap.value?.quickSwitch === false) return null
const isRu = locale === 'ru'
return h('button', {type: 'button',className: 'rl-lang-chip' + (isRu ? ' rl-lang-chip-active' : ''),title: isRu ? 'Интерфейс: Русский (нажмите для переключения на EN)' : 'Interface: English (click for RU)',onClick: () => { if (toggleRu) toggleRu(!isRu) },}, h('span', { className: 'rl-lang-text' }, isRu ? 'RU' : 'EN'))
}
function ExportMarkdownButton(props) {const [done, setDone] = React.useState(false)
const onExport = () => {try {const titleEl = document.querySelector('.dsw-session-title, [data-session-title], header h1, header h2, [class*="title"]')
const rawTitle = (titleEl && titleEl.textContent.trim()) || document.title || 'Диалог DSH'
const title = rawTitle.replace(/\s*—\s*DeepSeek Harness\s*$/, '').trim() || 'Диалог DSH'
const flow = document.querySelector('[data-chat-flow]') || document.querySelector('[data-chat-flow-scroll]') || document.body
const flowItems = Array.from(flow.querySelectorAll('[data-chat-flow-kind]'))
const messages = []
if (flowItems.length > 0) {flowItems.forEach((node) => {const kind = node.getAttribute('data-chat-flow-kind')
if (kind === 'user' || kind === 'steering') {const bubble = node.querySelector('[class*="bubble"]') || node
const clone = bubble.cloneNode(true)
clone.querySelectorAll('button, svg, [class*="actions"], [class*="Actions"]').forEach((b) => b.remove())
const text = clone.innerText.trim()
if (text) messages.push({ role: 'user', content: text })
} else if (kind === 'assistant-step') {const clone = node.cloneNode(true)
clone.querySelectorAll('button, svg, [class*="actions"], [class*="Actions"], .rl-turn-translation').forEach((b) => b.remove())
const text = clone.innerText.trim()
if (text) messages.push({ role: 'assistant', content: text })
}})
}
if (messages.length === 0) {const allElements = Array.from(document.querySelectorAll('[class*="userRow"], [class*="UserRow"], [class*="assistant-step"], [class*="AssistantMarkdown"], .dsw-turn-node, [data-role]'))
const seen = new Set()
allElements.forEach((node) => {const isUser = node.matches('[class*="userRow"], [class*="UserRow"], [data-role="user"]') || !!node.querySelector('[data-role="user"]')
const role = isUser ? 'user' : 'assistant'
const clone = node.cloneNode(true)
clone.querySelectorAll('button, svg, [class*="actions"], [class*="Actions"], .rl-turn-translation, [data-turn-tail]').forEach((b) => b.remove())
const text = clone.innerText.trim()
if (!text || seen.has(text)) return
seen.add(text)
messages.push({ role, content: text })
})
}
const session = {title,createdAt: new Date().toISOString(),messages
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
setTimeout(() => {try { document.body.removeChild(a); URL.revokeObjectURL(url) } catch (e) {  void e; }}, 30000)
setTimeout(() => setDone(false), 2000)
} catch (err) {console.warn('dsh-russian-lang: export md failed', err)
}}
return h('button', {type: 'button',className: 'rl-lang-chip rl-export-md-btn',title: 'Экспорт диалога в Markdown (.md)',onClick: onExport,}, h('span', { className: 'rl-lang-text' }, done ? '✓ MD' : '📥 MD'))
}
async function translateTurnContent(text) {if (!text || typeof text !== 'string') return { error: 'Текст для перевода пуст.' }
try {const res = await fetch('/api/dsh-russian-lang/translate', {method: 'POST',headers: { 'content-type': 'application/json', 'x-dsh-translator': '1' },body: JSON.stringify({ text })
})
const data = await res.json().catch(() => ({}))
if (!res.ok) {return { error: data.error || ('Ошибка перевода (HTTP ' + res.status + ')') }}
return { translatedText: data.translatedText || text }} catch (err) {return { error: 'Не удалось связаться с хостом DSH: ' + (err.message || err) }}}
function TranslateTurnAction(props) {const t = typeof props.t === 'function' ? props.t : ((k) => k)
const [loading, setLoading] = React.useState(false)
const [open, setOpen] = React.useState(false)
return h('button', {type: 'button',className: 'rl-action-btn' + (open ? ' rl-action-btn-active' : ''),title: t('translateTurn'),disabled: loading,onClick: async (ev) => {ev.stopPropagation()
const btn = ev.currentTarget
const tailFlowItem = btn.closest('[data-chat-flow-kind="turn-tail"]') || btn.closest('[data-chat-flow-kind]') || btn.closest('[data-turn-tail]')?.closest('[data-chat-flow-kind]') || btn.closest('[data-turn-tail]')
if (!tailFlowItem) return
const parentContainer = tailFlowItem.parentElement
let box = parentContainer ? parentContainer.querySelector('.rl-turn-translation[data-tail-key="' + (tailFlowItem.getAttribute('data-chat-flow-key') || '') + '"]') : null
if (!box) {box = tailFlowItem.querySelector('.rl-turn-translation')
}
if (box) {box.style.display = box.style.display === 'none' ? 'block' : 'none'
setOpen(box.style.display !== 'none')
return
}
setLoading(true)
try {const assistantNodes = []
let prev = tailFlowItem.previousElementSibling
while (prev && prev.getAttribute('data-chat-flow-kind') !== 'user') {if (prev.getAttribute('data-chat-flow-kind') === 'assistant-step') {assistantNodes.unshift(prev)
}
prev = prev.previousElementSibling
}
let rawText = ''
if (assistantNodes.length > 0) {rawText = assistantNodes.map((node) => {const clone = node.cloneNode(true)
clone.querySelectorAll('button, svg, [class*="actions"], [class*="Actions"]').forEach((b) => b.remove())
return clone.innerText.trim()
}).filter(Boolean).join('\n\n')
} else if (parentContainer) {const allSteps = Array.from(parentContainer.querySelectorAll('[data-chat-flow-kind="assistant-step"]'))
if (allSteps.length > 0) {const beforeTail = allSteps.filter((s) => (s.compareDocumentPosition(tailFlowItem) & Node.DOCUMENT_POSITION_FOLLOWING))
const targetSteps = beforeTail.length > 0 ? [beforeTail[beforeTail.length - 1]] : [allSteps[allSteps.length - 1]]
rawText = targetSteps.map((s) => {const clone = s.cloneNode(true)
clone.querySelectorAll('button, svg, [class*="actions"], [class*="Actions"]').forEach((b) => b.remove())
return clone.innerText.trim()
}).filter(Boolean).join('\n\n')
}}
if (!rawText) {const prose = tailFlowItem.querySelector('.dsw-prose, [data-block-kind="text"], .dsw-markdown-view, p')
if (prose) rawText = prose.innerText.trim()
}
let transResult = { error: 'Не удалось обнаружить текст сообщения ассистента для перевода.' }
if (rawText) {transResult = await translateTurnContent(rawText)
}
const isErr = !!transResult.error
const displayText = transResult.translatedText || transResult.error || ''
box = document.createElement('div')
box.className = 'rl-turn-translation'
const key = tailFlowItem.getAttribute('data-chat-flow-key')
if (key) box.dataset.tailKey = key
box.innerHTML = '<div class="rl-trans-head">' +
'<span class="rl-trans-title">' + (isErr ? '⚠️ Машинный перевод' : '🌐 Перевод на русский') + '</span>' +
'<div class="rl-trans-tools">' +
(!isErr ? '<button type="button" class="rl-trans-btn rl-btn-copy" title="Скопировать перевод">📋 Копировать</button>' : '') +
'<button type="button" class="rl-trans-btn rl-btn-close" title="Закрыть">✕</button>' +
'</div>' +
'</div>' +
'<div class="rl-trans-body"' + (isErr ? ' style="color: var(--dsw-state-warn-primary, var(--dsw-alias-state-warning-primary)); font-size: 13px;"' : '') + '></div>'
box.querySelector('.rl-trans-body').textContent = displayText
const copyBtn = box.querySelector('.rl-btn-copy')
if (copyBtn) {copyBtn.addEventListener('click', (e) => {e.stopPropagation()
try { navigator.clipboard.writeText(displayText) } catch (err) {  void err; }
copyBtn.textContent = '✓ Скопировано'
setTimeout(() => { copyBtn.textContent = '📋 Копировать' }, 2000)
})
}
const closeBtn = box.querySelector('.rl-btn-close')
closeBtn.addEventListener('click', (e) => {e.stopPropagation()
box.style.display = 'none'
setOpen(false)
})
if (parentContainer) {parentContainer.insertBefore(box, tailFlowItem)
} else {tailFlowItem.appendChild(box)
}
setOpen(true)
} catch (err) {console.warn('dsh-russian-lang: translate turn failed', err)
} finally {setLoading(false)
}},}, h('span', null, loading ? '...' : (open ? 'RU ✓' : 'RU ↗')))
}
function SettingsCard(props) {const inj = typeof props.inject === 'function'
? (props.inject() || {})
: (props.inject || {})
const scope = props.scope || inj.scope
const runtime = props.runtime || inj.runtime
const toggleRu = props.toggleRu || inj.toggleRu
const t = typeof props.t === 'function' ? props.t : ((k) => k)
const [open, setOpen] = React.useState(false)
const [snap, setSnap] = React.useState(() => (scope && scope.getSnapshot ? scope.getSnapshot() : { status: 'loading', value: {} }))
const [ruActive, setRuActive] = React.useState(() => { try { return runtime.getLocale().active === 'ru' } catch (e) { return false } })
const [typo, setTypoState] = React.useState(() =>
(snap.value && snap.value.typography) || {})
const [upStatus, setUpStatus] = React.useState({currentVersion: '0.3.42',latestVersion: undefined,updateAvailable: false
})
const [upLoading, setUpLoading] = React.useState(false)
const [upMsg, setUpMsg] = React.useState(null)
const checkUpdate = () => {setUpLoading(true)
setUpMsg(null)
fetch('/api/dsh-russian-lang/update', {headers: { 'x-dsh-plugin-update': '1' }}).then((r) => r.json()).then((data) => {setUpStatus(data)
setUpLoading(false)
}).catch(() => {setUpLoading(false)
setUpMsg({ type: 'err', text: t('updaterFailed') })
})
}
const triggerUpdate = () => {setUpLoading(true)
setUpMsg(null)
fetch('/api/dsh-russian-lang/update', {method: 'POST',headers: { 'x-dsh-plugin-update': '1' }}).then((r) => r.json()).then((data) => {setUpLoading(false)
if (data.restartRequired || data.updatedVersion) {setUpStatus(data)
setUpMsg({ type: 'ok', text: t('updaterSuccess') })
} else if (data.error) {setUpMsg({ type: 'err', text: data.error })
}}).catch(() => {setUpLoading(false)
setUpMsg({ type: 'err', text: t('updaterFailed') })
})
}
const [transStatus, setTransStatus] = React.useState(null)
const [transStarting, setTransStarting] = React.useState(false)
const [transMsg, setTransMsg] = React.useState(null)
const fetchTransStatus = () => {fetch('/api/dsh-russian-lang/translator/status').then((r) => r.json()).then((data) => setTransStatus(data)).catch(() => setTransStatus(null))
}
const startLibreTranslate = () => {setTransStarting(true)
setTransMsg(null)
fetch('/api/dsh-russian-lang/translator/setup', {method: 'POST',headers: { 'x-dsh-translator': '1' }}).then((r) => r.json()).then((data) => {setTransStarting(false)
if (data.ok) {setTransMsg({ type: 'ok', text: data.message || 'Контейнер LibreTranslate запущен.' })
fetchTransStatus()
} else {setTransMsg({ type: 'err', text: data.error || 'Ошибка запуска контейнера.' })
}}).catch((err) => {setTransStarting(false)
setTransMsg({ type: 'err', text: 'Ошибка: ' + (err.message || err) })
})
}
React.useEffect(() => {if (open || (props && props.view === 'page')) {checkUpdate()
fetchTransStatus()
}}, [open, props])
React.useEffect(() => {if (!scope || !scope.subscribe) return undefined
const un = scope.subscribe(() => {const s = scope.getSnapshot()
setSnap(s)
if (s.value && s.value.typography) setTypoState(s.value.typography)
})
setSnap(scope.getSnapshot())
return un
}, [scope])
React.useEffect(() => {try {const un = runtime.subscribe(() => {try { setRuActive(runtime.getLocale().active === 'ru') } catch (e) {  void e; }})
return un
} catch (e) { return undefined }}, [runtime])
const status = snap.status || 'loading'
const value = snap.value || {}
const effectiveTypo = resolveTypography(Object.assign({}, value, { typography: typo }))
const smartUxActive = effectiveTypo.enabled || effectiveTypo.liveInput ||
effectiveTypo.yo || value.slashAliases !== false || value.layoutConversion !== false
const overrides = value.overrides || {}
const overridesCount = Object.keys(overrides).length
const [newKey, setNewKey] = React.useState('')
const [newVal, setNewVal] = React.useState('')
const [pluginsStatusOpen, setPluginsStatusOpen] = React.useState(false)
const [pluginsData, setPluginsData] = React.useState(null)
const [pluginsLoading, setPluginsLoading] = React.useState(false)
const [pluginFilter, setPluginFilter] = React.useState('')
const [expandedPlugins, setExpandedPlugins] = React.useState({})
const [submittingIssue, setSubmittingIssue] = React.useState({})
const loadPluginsStatus = () => {setPluginsLoading(true)
fetch('/api/dsh-russian-lang/status/plugins').then((r) => r.json()).then((data) => { setPluginsData(data); setPluginsLoading(false); }).catch(() => { setPluginsLoading(false); })
}
const setTypo = async (patch) => {if (disabled) return
const next = Object.assign({}, typo, patch)
try {const res = await Promise.resolve(scope.set('typography', next))
if (res !== false) {setTypoState(next)
} else {console.warn('dsh-russian-lang: scope.set typography returned false')
}} catch (err) {console.warn('dsh-russian-lang: scope.set typography failed', err && err.message || err)
}}
const disabled = status !== 'ready' || snap.writable === false
const safeSet = async (k, v) => {if (disabled) return false
try {const res = await Promise.resolve(scope.set(k, v))
if (res === false) throw new Error(k)
return true
} catch (err) {if (typeof console !== 'undefined' && console.warn) console.warn('dsh-russian-lang: set ' + k + ' failed', err)
return false
}}
const onEnabled = (ev) => { if (disabled) return; if (toggleRu) toggleRu(ev.target.checked) }
const checkbox = (checked, onChange, disabledState) =>
h('input', {type: 'checkbox', checked: !!checked, disabled: !!disabledState,className: 'rl-check', onChange: (ev) => { if (disabledState) return; onChange(ev); },})
const statusLine = status === 'ready'
? ''
: (status === 'unavailable' ? t('statusUnavailable') : t('statusLoading'))
let ChevronIcon = null
try {const primitives = require('@deepseek-ai/dsh-client-ui-primitives')
ChevronIcon = primitives && primitives.IconChevronDownOutline14
} catch (_) { ChevronIcon = null }
const FallbackChevron = () => h('svg', {width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none','aria-hidden': 'true',}, h('path', {d: 'M3.5 5.25 7 8.75l3.5-3.5', stroke: 'currentColor',strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',}))
const Chevron = ChevronIcon || FallbackChevron
const presetKey = value.agentPromptPreset || 'technical_expert'
const presetInfo = typeof SYSTEM_PROMPT_PRESETS !== 'undefined' ? SYSTEM_PROMPT_PRESETS[presetKey] : null
if (props && props.view === 'summary') {return h('div', { className: 'rl-sub' }, statusLine || t('cardSub'))
}
const page = !!(props && props.view === 'page')
return h('div', { className: page ? 'rl-page-seat' : 'rl-card' },h('button', {type: 'button',className: 'rl-head',style: page ? { display: 'none' } : undefined,'aria-expanded': page ? 'true' : String(open),onClick: () => setOpen(!open),},h('span', { className: 'rl-head-main' },h('div', { className: 'rl-title' },'🇷🇺 ' + t('cardTitle'),h('span', { className: 'rl-badge ' + (ruActive ? 'rl-badge-ok' : 'rl-badge-warn') },ruActive ? t('badgeRu') : t('badgeEn')),h('span', { className: 'rl-badge rl-badge-ok' }, t('badgeCoverage'))),h('div', { className: 'rl-sub' },statusLine || t('cardSub'))),h('span', {className: 'rl-chev' + (open ? ' rl-chev-open' : ''),}, h(Chevron, null))),(page || open) && h('div', { className: 'rl-body' },h('div', { className: 'rl-page' },h('div', { className: 'rl-section-card' },h('div', { className: 'rl-section-title' },h('span', null, t('secLanguage')),h('span', { className: 'rl-badge ' + (ruActive ? 'rl-badge-ok' : 'rl-badge-dim') },ruActive ? t('badgeRu') : t('badgeEn'))),h('div', { className: 'rl-section-desc' }, t('secLanguageDesc')),h('div', { className: 'rl-item-card' },h('div', { className: 'rl-item-head' },h('label', { className: 'rl-item-label' },checkbox(ruActive, onEnabled, disabled),t('enabled'))),h('div', { className: 'rl-item-desc' }, t('enabledDesc'))),h('div', { className: 'rl-item-card' },h('div', { className: 'rl-item-head' },h('label', { className: 'rl-item-label' },checkbox(value.quickSwitch !== false,(ev) => safeSet('quickSwitch', ev.target.checked), disabled),t('quickSwitch'))),h('div', { className: 'rl-item-desc' }, t('quickSwitchDesc'))),overridesCount > 0 ? h('div', { className: 'rl-badge rl-badge-dim', style: { alignSelf: 'flex-start' } },t('overridesCount') + ': ' + overridesCount) : null
),h('div', { className: 'rl-section-card' },h('div', { className: 'rl-section-title' },h('span', null, t('secTypography')),status === 'ready' && h('span', {className: 'rl-badge ' + (smartUxActive ? 'rl-badge-ok' : 'rl-badge-dim')
}, t(smartUxActive ? 'badgeSmartUx' : 'badgeSmartUxOff'))),h('div', { className: 'rl-section-desc' }, t('secTypographyDesc')),h('div', { className: 'rl-grid-2', style: { gridAutoRows: '1fr' } },h('div', { className: 'rl-item-card' },h('div', { className: 'rl-item-head' },h('label', { className: 'rl-item-label' },checkbox(effectiveTypo.enabled && ruActive,(ev) => setTypo({ enabled: ev.target.checked }), !ruActive || disabled),t('typography'))),h('div', { className: 'rl-item-desc' }, t('typographyDesc'))),h('div', { className: 'rl-item-card' },h('div', { className: 'rl-item-head' },h('label', { className: 'rl-item-label' },checkbox(effectiveTypo.liveInput && ruActive,(ev) => setTypo({ liveInput: ev.target.checked }), !ruActive || disabled),t('liveInput'))),h('div', { className: 'rl-item-desc' }, t('liveInputDesc'))),h('div', { className: 'rl-item-card' },h('div', { className: 'rl-item-head' },h('label', { className: 'rl-item-label' },checkbox(effectiveTypo.yo && ruActive,(ev) => setTypo({ yo: ev.target.checked }), !ruActive || disabled),t('yo'))),h('div', { className: 'rl-item-desc' }, t('yoDesc'))),h('div', { className: 'rl-item-card' },h('div', { className: 'rl-item-head' },h('label', { className: 'rl-item-label' },checkbox(value.slashAliases !== false && ruActive,(ev) => { if (ruActive) safeSet('slashAliases', ev.target.checked) }, !ruActive || disabled),t('slashAliases'))),h('div', { className: 'rl-item-desc' }, t('slashAliasesDesc'))),h('div', { className: 'rl-item-card' },h('div', { className: 'rl-item-head' },h('label', { className: 'rl-item-label' },checkbox(value.layoutConversion !== false,(ev) => safeSet('layoutConversion', ev.target.checked), disabled),t('altLHintText'))),h('div', { className: 'rl-item-desc' }, t('layoutConversionDesc'))))),h('div', { className: 'rl-section-card' },h('div', { className: 'rl-section-title' },h('span', null, t('secAgentPrompt')),h('span', { className: 'rl-badge ' + (value.agentPrompt ? 'rl-badge-ok' : 'rl-badge-dim') },value.agentPrompt ? 'Активен' : 'Выключен')),h('div', { className: 'rl-section-desc' }, t('secAgentPromptDesc')),h('div', { className: 'rl-item-card' },h('div', { className: 'rl-item-head' },h('label', { className: 'rl-item-label' },checkbox(value.agentPrompt === true,async (ev) => {if (disabled) return
try {await Promise.resolve(scope.set('agentPrompt', ev.target.checked))
} catch (err) {if (typeof console !== 'undefined' && console.warn) console.warn(err)
}}, disabled),t('agentPrompt'))),h('div', { className: 'rl-item-desc' }, t('agentPromptDesc'))),value.agentPrompt ? h(React.Fragment, null,h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },h('label', { className: 'rl-item-label', style: { fontWeight: 500 } }, t('agentPromptPreset')),h('select', {className: 'rl-select',disabled: !!disabled,value: value.agentPromptPreset || 'technical_expert',onChange: (ev) => safeSet('agentPromptPreset', ev.target.value)
},h('option', { value: 'technical_expert' }, t('presetExpert')),h('option', { value: 'tech_writer' }, t('presetWriter')),h('option', { value: 'concise' }, t('presetConcise')),h('option', { value: 'code_reviewer' }, t('presetReviewer')),h('option', { value: 'architect' }, t('presetArchitect')),h('option', { value: 'tutor' }, t('presetTutor')))),presetInfo ? h('div', { className: 'rl-preview-box' },h('div', { style: { fontWeight: 600, marginBottom: '4px', color: 'var(--dsw-alias-label-primary)' } }, '💬 ' + presetInfo.label + ':'),presetInfo.text
) : null
) : null
),h('div', { className: 'rl-section-card' },h('div', { className: 'rl-section-title' },h('span', null, t('secUpdater')),h('span', { className: 'rl-badge ' + (upStatus.updateAvailable ? 'rl-badge-warn' : 'rl-badge-ok') },upStatus.updateAvailable ? t('badgeUpdateAvailable') : t('badgeUpToDate'))),h('div', { className: 'rl-section-desc' }, t('secUpdaterDesc')),h('div', { className: 'rl-item-card' },h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' } },h('div', null,h('div', { style: { fontWeight: 600, color: 'var(--dsw-alias-label-primary)' } },t('updaterCurrent').replace('{version}', upStatus.currentVersion || '0.3.42')),upStatus.updateAvailable
? h('div', { style: { color: 'var(--dsw-state-warn-primary, var(--dsw-alias-state-warning-primary))', marginTop: '2px', fontWeight: 500 } },t('updaterLatest').replace('{version}', upStatus.latestVersion || ''))
: h('div', { style: { color: 'var(--dsw-alias-label-secondary)', marginTop: '2px' } },t('updaterUpToDate'))),upStatus.updateAvailable
? h('button', {type: 'button',className: 'rl-btn rl-btn-primary',disabled: upLoading,onClick: triggerUpdate,}, upLoading ? t('updaterUpdating') : t('updaterBtn').replace('{version}', upStatus.latestVersion || ''))
: h('button', {type: 'button',className: 'rl-btn',disabled: upLoading,onClick: checkUpdate,}, upLoading ? t('updaterChecking') : t('updaterCheckBtn'))),upMsg ? h('div', {style: {marginTop: '10px', padding: '8px 12px', borderRadius: '8px',background: upMsg.type === 'ok' ? 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)' : 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent)',color: upMsg.type === 'ok' ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)', fontSize: '12px', fontWeight: 500
}}, upMsg.text) : null
)),h('div', { className: 'rl-section-card' },h('div', { className: 'rl-section-title' },h('span', null, t('secTranslator')),h('span', {className: 'rl-badge ' + (value.translateEngine === 'local' ? 'rl-badge-ok' : (value.translateEngine === 'google' ? 'rl-badge-warn' : 'rl-badge-dim'))
}, value.translateEngine === 'local' ? 'Локально' : (value.translateEngine === 'google' ? 'Google' : 'Выключен'))),h('div', { className: 'rl-section-desc' }, t('secTranslatorDesc')),h('div', { className: 'rl-item-card' },h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },h('label', { className: 'rl-item-label', style: { fontWeight: 500 } }, t('translateEngine')),h('select', {className: 'rl-select',disabled: !!disabled,value: value.translateEngine || 'off',onChange: async (ev) => {const val = ev.target.value
if (await safeSet('translateEngine', val)) {if (val === 'local') fetchTransStatus()
}}},h('option', { value: 'off' }, t('engineOff')),h('option', { value: 'local' }, t('engineLocal')),h('option', { value: 'google' }, t('engineGoogle')))),value.translateEngine === 'google' ? h('div', {style: {marginTop: '10px', padding: '8px 12px', borderRadius: '8px',background: 'color-mix(in srgb, var(--dsw-state-warn-primary, var(--dsw-alias-state-warning-primary)) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--dsw-alias-state-warning-primary) 30%, transparent)',color: 'var(--dsw-state-warn-primary, var(--dsw-alias-state-warning-primary))', fontSize: '12px', fontWeight: 500, lineHeight: 1.4
}}, t('googleWarn')) : null,value.translateEngine === 'local' ? h('div', {style: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }},h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('localInfo')),h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' } },h('span', {className: 'rl-badge ' + (transStatus && transStatus.running ? 'rl-badge-ok' : 'rl-badge-dim')
}, transStatus && transStatus.running ? t('localStatusRunning') : t('localStatusStopped')),(!transStatus || !transStatus.running) ? h('button', {type: 'button',className: 'rl-btn rl-btn-primary',disabled: transStarting,onClick: startLibreTranslate
}, transStarting ? t('localStarting') : t('localStartBtn')) : null
),transMsg ? h('div', {style: {marginTop: '6px', padding: '8px 12px', borderRadius: '8px',background: transMsg.type === 'ok' ? 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)' : 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent)',color: transMsg.type === 'ok' ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)', fontSize: '12px', fontWeight: 500
}}, transMsg.text) : null
) : null
)),h('div', { className: 'rl-section-card' },h('div', { className: 'rl-section-title' },h('span', null, t('secOverrides')),h('span', { className: 'rl-badge rl-badge-dim' },String(overridesCount) + ' ' + (typeof plural === 'function' ? plural(overridesCount, ['запись', 'записи', 'записей']) : 'записей'))),h('div', { className: 'rl-section-desc' }, t('secOverridesDesc')),h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },h('input', {className: 'rl-select',disabled: !!disabled,style: { flex: '1 1 180px', maxWidth: 'none' },placeholder: t('overrideKeyPlaceholder'),value: newKey,onChange: (e) => setNewKey(e.target.value),}),h('input', {className: 'rl-select',disabled: !!disabled,style: { flex: '2 1 240px', maxWidth: 'none' },placeholder: t('overrideValuePlaceholder'),value: newVal,onChange: (e) => setNewVal(e.target.value),}),h('button', {type: 'button',className: 'rl-btn rl-btn-primary',disabled: !newKey.trim() || !newVal.trim() || !!disabled,onClick: async () => {const k = newKey.trim()
const v = newVal.trim()
if (!k || !v) return
if (await safeSet('overrides', Object.assign({}, overrides, { [k]: v }))) {setNewKey('')
setNewVal('')
}},}, t('overrideAddBtn'))),overridesCount === 0
? h('div', { className: 'rl-hint-text', style: { fontStyle: 'italic', padding: '4px 0' } }, t('overrideEmpty'))
: h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' } },Object.keys(overrides).map((k) =>
h('div', {key: k,style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--dsw-alias-bg-layer-3)', borderRadius: '6px', border: '1px solid var(--dsw-alias-border-l2)', fontSize: '12px' },},h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', overflow: 'hidden' } },h('code', { style: { color: 'var(--dsw-brand-primary, var(--dsw-alias-state-brand-primary))', fontWeight: 600 } }, k),h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, '→'),h('span', { style: { color: 'var(--dsw-alias-label-primary)' } }, overrides[k])),h('button', {type: 'button',className: 'rl-btn',disabled: !!disabled,style: { padding: '2px 8px', height: '24px', fontSize: '11px', color: 'var(--dsw-alias-state-error-primary)' },onClick: () => {const next = Object.assign({}, overrides)
delete next[k]
safeSet('overrides', next)
},}, t('overrideDelete'))))),h('div', { className: 'rl-hint-text', style: { marginTop: '8px' } }, t('overrideTip')),h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' } },h('button', {type: 'button',className: 'rl-btn' + (isInspectorActive ? ' rl-btn-primary' : ''),onClick: () => {isInspectorActive = !isInspectorActive
updateInspectorPill()
},}, isInspectorActive ? t('inspectorToggleOn') : t('inspectorToggleOff')),h('button', {type: 'button',className: 'rl-btn',style: { fontSize: '11px' },onClick: () => {try {navigator.clipboard.writeText(JSON.stringify(overrides, null, 2))
alert(t('overridesCopied'))
} catch (err) {  void err; }}}, t('exportJsonBtn')),h('button', {type: 'button',className: 'rl-btn',disabled: !!disabled,style: { fontSize: '11px' },onClick: async () => {if (disabled) return
const input = typeof window !== 'undefined' && typeof window.prompt === 'function' ? window.prompt(t('overridesImportPrompt')) : null
if (!input) return
try {const parsed = JSON.parse(input)
if (parsed && typeof parsed === 'object') {const merged = Object.assign({}, overrides, parsed)
const res = await Promise.resolve(scope.set('overrides', merged))
if (res === false) throw new Error('Import rejected')
}} catch (err) { alert(t('overridesImportError') + (err && err.message || err)) }}}, t('importJsonBtn')))),h('div', { className: 'rl-section-card' },h('div', {style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' },onClick: () => {const next = !pluginsStatusOpen
setPluginsStatusOpen(next)
if (next && !pluginsData && !pluginsLoading) loadPluginsStatus()
}},h('div', { className: 'rl-section-title', style: { marginBottom: 0 } },h('span', null, t('secPluginStatus')),pluginsData && pluginsData.plugins
? h('span', { className: 'rl-badge rl-badge-ok' },`🟢 ${pluginsData.plugins.filter((p) => p.status === 'full').length}/${pluginsData.plugins.length} (${Math.round((pluginsData.plugins.filter((p) => p.status === 'full').length / pluginsData.plugins.length) * 100)}%)`)
: h('span', { className: 'rl-badge rl-badge-ok' }, '🟢 100%')),h('button', {type: 'button',className: 'rl-btn',style: { fontSize: '11px', padding: '2px 8px' }}, pluginsStatusOpen ? '▲ Свернуть' : '▼ Развернуть')),h('div', { className: 'rl-section-desc', style: { marginTop: '4px' } }, t('secPluginStatusDesc')),pluginsStatusOpen && h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' } },h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },h('input', {className: 'rl-select',style: { flex: '1 1 200px', maxWidth: 'none' },placeholder: t('searchPluginPlaceholder'),value: pluginFilter,onChange: (e) => setPluginFilter(e.target.value)
}),h('button', {type: 'button',className: 'rl-btn',style: { fontSize: '11px' },disabled: pluginsLoading,onClick: loadPluginsStatus
}, pluginsLoading ? 'Загрузка…' : '🔄 Обновить')),pluginsLoading && !pluginsData && h('div', { className: 'rl-hint-text' }, 'Загрузка сведений о плагинах…'),pluginsData && pluginsData.plugins && (() => {const q = pluginFilter.trim().toLowerCase()
const filtered = pluginsData.plugins.filter((p) => !q || p.packageName.toLowerCase().includes(q) || (p.namespace && p.namespace.toLowerCase().includes(q)))
if (filtered.length === 0) {return h('div', { className: 'rl-hint-text', style: { fontStyle: 'italic', padding: '6px 0' } }, 'Плагины не найдены.')
}
return h('div', { className: 'rl-scroll-list' },filtered.map((p) => {const isExpanded = !!expandedPlugins[p.packageName]
const isSubmitting = !!submittingIssue[p.packageName]
const badgeClass = p.status === 'full' ? 'rl-badge-ok' : (p.status === 'partial' ? 'rl-badge-warn' : 'rl-badge-dim')
const badgeText = p.status === 'full'
? `🟢 100% (${p.count} строк)`
: (p.status === 'partial'
? `🟡 ${p.percent}% (${p.count}/${p.total})`
: (p.status === 'none' ? `🔴 0% (${p.total} строк)` : '⚪ Не проверено'))
return h('div', { key: p.packageName, className: 'rl-plugin-card' },h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' } },h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },h('code', { className: 'rl-color-brand', style: { fontSize: '12px' } }, p.packageName),h('span', { className: 'rl-badge ' + badgeClass }, badgeText)),h('div', { style: { fontSize: '11px', color: 'var(--rl-ls)' } },`Установлен: v${p.installedVersion || '—'} · База: v${p.verifiedVersion || '—'}`)),(p.status !== 'full' || (p.missingKeys && p.missingKeys.length > 0)) && h('div', { className: 'rl-plugin-subrow' },p.missingKeys && p.missingKeys.length > 0
? h('button', {type: 'button',className: 'rl-btn',style: { fontSize: '11px', padding: '2px 8px' },onClick: () => setExpandedPlugins(Object.assign({}, expandedPlugins, { [p.packageName]: !isExpanded }))
}, isExpanded ? t('hideMissingKeys') : `${t('showMissingKeys')} (${p.missingKeys.length})`)
: h('span', null),h('button', {type: 'button',className: 'rl-btn rl-btn-primary',style: { fontSize: '11px', padding: '3px 10px' },disabled: isSubmitting,onClick: () => {setSubmittingIssue(Object.assign({}, submittingIssue, { [p.packageName]: true }))
const issueUrl = makeIssueUrl({plugin: p.packageName,ns: p.namespace,installedVersion: p.installedVersion,verifiedVersion: p.verifiedVersion,coveragePercent: p.percent,totalKeys: p.total,missingKeys: p.missingKeys,dshVersion: pluginsData?.dshVersion || '0.2.1-alpha.1'
}, '0.3.42')
try { window.open(issueUrl, '_blank') } catch (_) {  void _; }
setTimeout(() => {setSubmittingIssue(Object.assign({}, submittingIssue, { [p.packageName]: false }))
}, 2500)
}}, isSubmitting ? '✓ Открыто' : t('registerMissingIssue'))),isExpanded && p.missingKeys && p.missingKeys.length > 0 && h('div', { className: 'rl-missing-box' },p.missingKeys.map((mk) => {const mkKey = typeof mk === 'string' ? mk : mk.key
const mkEn = typeof mk === 'object' && mk.en ? ` — "${mk.en}"` : ''
return h('div', { key: mkKey, style: { wordBreak: 'break-word', color: 'var(--rl-ls)' } },h('code', { style: { color: 'var(--rl-lp)' } }, mkKey),mkEn
)
})))
}))
})())),h('div', { className: 'rl-section-card' },h('div', { className: 'rl-section-title' },h('span', null, t('secSupport')),h('span', { className: 'rl-badge rl-badge-ok' }, '🟢 100.0%')),h('div', { className: 'rl-section-desc' }, t('secSupportDesc')),h('div', { className: 'rl-grid-3' },h('div', { className: 'rl-stat-box' },h('div', { className: 'rl-stat-val' }, '101'),h('div', { className: 'rl-stat-label' }, t('statNamespaces'))),h('div', { className: 'rl-stat-box' },h('div', { className: 'rl-stat-val' }, '2 442'),h('div', { className: 'rl-stat-label' }, t('statCoreKeys'))),h('div', { className: 'rl-stat-box' },h('div', { className: 'rl-stat-val' }, '6 153'),h('div', { className: 'rl-stat-label' }, t('statPluginKeys')))),h('div', { className: 'rl-actions-row' },h('a', {href: makeIssueUrl({}, '0.3.42'),target: '_blank',rel: 'noopener noreferrer',className: 'rl-btn rl-btn-primary'
}, '💬 ' + t('reportIssue')),h('div', { className: 'rl-hint-text', style: { flex: 1 } },t('exportMdHint')))))))
}
const RL_CSS = ['.rl-color-brand{color:var(--rl-sb);font-weight:600;}.rl-color-warn{color:var(--dsw-alias-state-warning-primary);}.rl-diff-row{display:flex;flex-direction:column;gap:2px;}.rl-code-box{background:var(--rl-l2);padding:4px 8px;border-radius:4px;word-break:break-word;font-size:11px;}.rl-sub-box{background:var(--rl-l3);border:1px solid var(--rl-b);border-radius:8px;padding:10px;font-size:12px;display:flex;flex-direction:column;gap:8px;}.rl-meta-box{background:var(--rl-l1);border:1px solid var(--rl-b);border-radius:6px;padding:8px 10px;font-size:11px;color:var(--rl-ls);display:flex;flex-direction:column;gap:4px;}.rl-plugin-card{background:var(--rl-l3);border:1px solid var(--rl-b);border-radius:8px;padding:8px 12px;font-size:12px;display:flex;flex-direction:column;gap:6px;}.rl-plugin-subrow{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-top:4px;padding-top:4px;border-top:1px dashed var(--rl-b);}.rl-missing-box{max-height:140px;overflow-y:auto;background:var(--rl-l2);padding:6px 8px;border-radius:6px;font-size:11px;display:flex;flex-direction:column;gap:3px;margin-top:4px;}.rl-scroll-list{display:flex;flex-direction:column;gap:6px;max-height:420px;overflow-y:auto;padding-right:4px;}:root{--rl-sb:var(--dsw-brand-primary, var(--dsw-alias-state-brand-primary));--rl-ls:var(--dsw-alias-label-secondary);--rl-lp:var(--dsw-alias-label-primary);--rl-b:var(--dsw-alias-border-l2);--rl-l3:var(--dsw-alias-bg-layer-3);--rl-l2:var(--dsw-alias-bg-layer-2);--rl-l1:var(--dsw-alias-bg-layer-1)}.rl-modal-mask{position:fixed;top:0;left:0;width:100vw;height:100vh;background:var(--dsw-bg-mask, var(--dsw-alias-bg-mask));display:flex;align-items:center;justify-content:center;z-index:99999;backdrop-filter:blur(2px)}.rl-modal-box{background:var(--rl-l2);color:var(--rl-lp);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;width:calc(100vw - 40px);max-width:500px;box-shadow:var(--dsw-elevation-3, var(--dsw-alias-shadow-l3));display:flex;flex-direction:column;gap:12px;padding:18px}.rl-card{border:1px solid var(--rl-b);background:var(--rl-l3);border-radius:12px;list-style:none;overflow:hidden;transition:border-color .15s ease}.rl-head{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;display:flex;align-items:center;gap:12px;padding:14px 18px}.rl-head:hover{background:var(--rl-l2)}.rl-head-main{flex:1;display:flex;flex-direction:column;gap:4px}.rl-title{color:var(--rl-lp);font-size:16px;font-weight:600;line-height:1.4;display:flex;align-items:center;flex-wrap:wrap;gap:8px}.rl-sub{color:var(--rl-ls);font-size:13px}.rl-chev{margin-left:auto;flex:none;color:var(--dsw-alias-label-tertiary);display:inline-flex;transition:transform .16s}.rl-chev-open{transform:rotate(180deg)}.rl-body{border-top:1px solid var(--rl-b);padding:18px}.rl-page{display:flex;flex-direction:column;gap:16px;max-width:960px}.rl-section-card{border:1px solid var(--rl-b);background:var(--rl-l2);border-radius:10px;padding:16px 18px;display:flex;flex-direction:column;gap:12px}.rl-section-title{font-size:14px;font-weight:600;color:var(--rl-lp);display:flex;align-items:center;justify-content:space-between;gap:8px}.rl-section-desc{font-size:12px;color:var(--rl-ls);margin-top:-4px;line-height:1.4}.rl-grid-2{display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:10px}.rl-grid-3{display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px}.rl-badge{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--rl-b);display:inline-flex;align-items:center;gap:4px;font-weight:500}.rl-badge-ok{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, transparent)}.rl-badge-warn{border-color:var(--dsw-state-warn-primary, var(--dsw-alias-state-warning-primary));color:var(--dsw-state-warn-primary, var(--dsw-alias-state-warning-primary));background:color-mix(in srgb, var(--dsw-state-warn-primary, var(--dsw-alias-state-warning-primary)) 8%, transparent)}.rl-badge-dim{border-color:var(--rl-b);color:var(--rl-ls);background:var(--rl-l3)}.rl-item-card{border:1px solid var(--rl-b);background:var(--rl-l3);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:4px}.rl-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.rl-item-label{font-size:13px;font-weight:500;color:var(--rl-lp);display:flex;align-items:center;gap:8px;cursor:pointer}.rl-item-desc{font-size:11px;color:var(--rl-ls);line-height:1.4}.rl-stat-box{border:1px solid var(--rl-b);background:var(--rl-l3);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:2px}.rl-stat-val{font-size:16px;font-weight:700;color:var(--rl-lp)}.rl-stat-label{font-size:11px;color:var(--rl-ls);letter-spacing:0.3px}.rl-preview-box{border:1px solid var(--rl-b);background:var(--rl-l3);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--rl-ls);line-height:1.4}.rl-btn{appearance:none;font:inherit;cursor:pointer;border:1px solid var(--rl-b);border-radius:8px;padding:6px 12px;font-size:12px;background:var(--rl-l3);color:var(--rl-lp);font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:all .15s ease;text-decoration:none}.rl-btn:hover:not(:disabled){background:var(--rl-l1);border-color:var(--rl-ls)}.rl-btn-primary{background:var(--rl-lp);color:var(--rl-l3);border-color:transparent}.rl-btn-primary:hover:not(:disabled){opacity:0.9}.rl-select{height:32px;border:1px solid var(--rl-b);background:var(--rl-l3);color:var(--rl-lp);border-radius:6px;padding:0 8px;font-size:12px;outline:none;width:100%;max-width:380px}.rl-select:focus{border-color:var(--rl-sb)}.rl-check{width:16px;height:16px;accent-color:var(--rl-lp);cursor:pointer;flex-shrink:0}.rl-hint-text{font-size:11px;color:var(--rl-ls);line-height:1.4}.rl-actions-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding-top:4px}.rl-lang-chip{appearance:none;cursor:pointer;border:1px solid var(--rl-b);background:var(--rl-l3);color:var(--rl-ls);font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;display:inline-flex;align-items:center;transition:all .15s;margin:0 4px}.rl-lang-chip:hover{border-color:var(--rl-lp);color:var(--rl-lp)}.rl-lang-chip-active{color:var(--rl-lp);border-color:var(--rl-lp);background:var(--rl-l2)}.rl-action-btn{appearance:none;background:0 0;border:1px solid transparent;border-radius:4px;color:var(--rl-ls);cursor:pointer;font-size:11px;padding:2px 5px;display:inline-flex;align-items:center;transition:all .15s}.rl-action-btn:hover{color:var(--rl-lp);border-color:var(--rl-b);background:var(--rl-l3)}.rl-action-btn-active{color:var(--rl-lp);background:var(--rl-l2);border-color:var(--rl-b)}.rl-turn-translation{margin:8px 0;padding:10px 12px;border:1px solid var(--rl-b);background:var(--rl-l2);border-radius:8px;font-size:13px;line-height:1.5}.rl-trans-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;border-bottom:1px solid var(--rl-b);padding-bottom:4px}.rl-trans-title{font-size:11px;font-weight:600;color:var(--rl-ls);text-transform:uppercase;letter-spacing:0.5px}.rl-trans-tools{display:flex;gap:4px}.rl-trans-btn{appearance:none;background:var(--rl-l3);border:1px solid var(--rl-b);color:var(--rl-ls);cursor:pointer;padding:2px 7px;border-radius:4px;font-size:11px}.rl-trans-btn:hover{background:var(--rl-l1);color:var(--rl-lp)}.rl-trans-body{color:var(--rl-lp);white-space:pre-wrap;word-break:break-word;user-select:text}.rl-export-md-btn{appearance:none;border:1px solid var(--rl-b);height:32px;color:var(--rl-lp);cursor:pointer;background:transparent;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:6px 12px;font-size:13px;font-weight:500;display:inline-flex;white-space:nowrap;margin-left:6px;transition:all .15s ease}.rl-export-md-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}.rl-inspector-hover{position:absolute;pointer-events:none;border:2px solid var(--rl-sb);border-radius:4px;background:color-mix(in srgb,var(--rl-sb) 12%,transparent);box-shadow:0 0 10px color-mix(in srgb,var(--rl-sb) 30%,transparent);z-index:99998;transition:all .06s ease;display:none}.rl-inspector-badge{position:absolute;bottom:calc(100% + 4px);left:0;background:var(--rl-sb);color:var(--dsw-label-primary-inverted, var(--dsw-alias-label-inverse));font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;white-space:nowrap;box-shadow:var(--dsw-elevation-2, var(--dsw-alias-shadow-l2));pointer-events:none}.rl-inspector-pill{position:fixed;bottom:18px;right:18px;background:var(--rl-l2);color:var(--rl-lp);border:1px solid var(--dsw-alias-border-l1);border-radius:20px;padding:6px 12px;box-shadow:var(--dsw-elevation-3, var(--dsw-alias-shadow-l3));display:none;align-items:center;gap:8px;font-size:12px;z-index:99990;user-select:none}.rl-inspector-pill-active{border-color:var(--rl-sb);box-shadow:0 0 12px color-mix(in srgb,var(--rl-sb) 35%,transparent)}'
].join('')
const STYLE_ID = 'dsh-russian-lang-styles'
if (typeof document !== 'undefined' && (document.getElementById && !document.getElementById(STYLE_ID))) {const tag = document.createElement('style')
tag.id = STYLE_ID
tag.dataset.dshPlugin = 'dsh-russian-lang'
tag.dataset.plugin = '@goodandready/dsh-russian-lang'
tag.dataset.pluginCss = 'rl-card'
tag.textContent = RL_CSS
document.head.appendChild(tag)
}
module.exports = { apply, inject: ['slots', 'locale', 'configForms'], resolveTypography, SettingsCard }
return module.exports
},})