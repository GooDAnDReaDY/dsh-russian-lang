#!/usr/bin/env python3
"""Собрать lib/client.js из словарей ru/*.json и ru-plugins/*.json.

Словари — источник истины, бандл генерируется. Перевод правится в JSON, после
обновления dsh достаточно перегенерировать бандл.
"""
import glob
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# ru/         — словари ядра DSH
# ru-plugins/ — словари сторонних плагинов; механизм тот же, разделение нужно
#               только чтобы видеть, что чьё. Чужой namespace зарегистрировать
#               безопасно: если плагин не установлен, словарь просто не
#               запрашивается.
# mt-registry.json — MT-fallback (tools/mt_fallback.py): ключи без ручного
#               перевода, переведённые машинно. Ручной ru-перевод приоритетен;
#               в бандл попадает только строка, разметка остаётся служебной.
# SELF_RU — namespace'ы, которые сами плагины уже регистрируют как "ru".
# Регистрация ru повторно падает в загрузчике ("already has locale ru"), поэтому
# их не перекрываем вовсе. Список генерируется tools/self_ru_scan.py
# (<профиль>/node_modules) в self-ru.json и коммитится.
SELF_RU_FALLBACK = {
    'dsh-spendmeter', 'task-board', 'settings.commandcode', 'pin',
    'dsh-context', 'context-doctor', 'settings.ollama-cloud', 'plugin-store',
    'usageStats', 'usageDashboard', 'dsh-messenger-gateway',
    'dsh-gitea', 'dsh-key-rotation', 'dsh-vision-bridge',
}
self_ru_path = os.path.join(HERE, 'self-ru.json')
if os.path.exists(self_ru_path):
    SELF_RU = set(json.load(open(self_ru_path, encoding='utf-8')))
else:
    print('ПРЕДУПРЕЖДЕНИЕ: self-ru.json нет, используется резервный список '
          '(обновите: python3 tools/self_ru_scan.py <профиль>/node_modules --out self-ru.json)')
    SELF_RU = SELF_RU_FALLBACK
merged = {}
sources = (sorted(glob.glob(os.path.join(HERE, 'ru', '*.json')))
           + sorted(glob.glob(os.path.join(HERE, 'ru-plugins', '*.json'))))
for path in sources:
    part = json.load(open(path, encoding='utf-8'))
    for ns, entries in part.items():
        if ns in SELF_RU:
            continue
        merged.setdefault(ns, {}).update(entries)

mt_path = os.path.join(HERE, 'mt-registry.json')
if os.path.exists(mt_path):
    mt = json.load(open(mt_path, encoding='utf-8'))
    for ns, entries in mt.items():
        if ns in SELF_RU:
            continue
        for key, rec in entries.items():
            if key not in merged.get(ns, {}):
                merged.setdefault(ns, {})[key] = rec.get('ru', '')

payload = json.dumps(merged, ensure_ascii=False, separators=(',', ':'), sort_keys=True)

# Карта zh->ru для DOM-перевода панелей, игнорирующих locale-ядро (например
# dsh-skill-hub выбирает свой словарь по documentElement.lang и умеет только
# en/zh). Собирается из zh-референсов сторонних плагинов и наших ru-словарей:
# совпал ключ — пара zh-строка -> ru-строка. Вставляется в бандл, клиент
# заменяет китайские текстовые узлы при активном русском.
import re as _re
zh_ru = {}
for ref_path in sorted(glob.glob(os.path.join(HERE, 'zh-refs', '*.json'))):
    base = os.path.basename(ref_path)
    num = base.split('-')[0]
    ru_path = os.path.join(HERE, 'ru-plugins', num + '-' + base[len(num + '-'):-len('.zh.json')] + '.json')
    if not os.path.exists(ru_path):
        continue
    zh = json.load(open(ref_path, encoding='utf-8'))
    # ru-файл — {ns: {ключ: перевод}}
    ru_part = json.load(open(ru_path, encoding='utf-8'))
    ru_entries = {}
    for ns_entries in ru_part.values():
        ru_entries.update(ns_entries)
    for key, zh_text in zh.items():
        if not isinstance(zh_text, str) or not _re.search(r'[\u3400-\u9fff\uf900-\ufaff]', zh_text):
            continue
        ru_text = ru_entries.get(key)
        if isinstance(ru_text, str) and ru_text:
            zh_ru[zh_text] = ru_text
zh_ru_json = json.dumps(zh_ru, ensure_ascii=False, sort_keys=True)
print('zh->ru пар для DOM-перевода: %d' % len(zh_ru))

# Частотный словарь для фикса раскладки (tools/ru-freq.json). Обновляется
# tools/freq_refresh.py и встраивается в бандл для детектора.
freq_path = os.path.join(HERE, 'tools', 'ru-freq.json')
freq_words = json.load(open(freq_path, encoding='utf-8')) if os.path.exists(freq_path) else []
freq_json = json.dumps(freq_words, ensure_ascii=False)

# ё-пары для типографики: слова с ё из частотного корпуса дают безопасные
# пары «еще -> ещё» (корпусное написание). Неоднозначные («все» может быть
# и «всё») — в чёрном списке. yo по умолчанию выключен.
YO_BLACKLIST = {'все'}
yo_pairs = []
seen_yo = set()
for w in freq_words:
    if 'ё' in w and w not in YO_BLACKLIST:
        e = w.replace('ё', 'е')
        if e != w and (e, w) not in seen_yo:
            seen_yo.add((e, w))
            yo_pairs.append([e, w])
yo_json = json.dumps(yo_pairs, ensure_ascii=False)
print('ё-пар из корпуса: %d' % len(yo_pairs))

# Подписи карточки настроек (namespace russian-lang — наш собственный).
card_ru = {
    'cardTitle': 'Русская локализация',
    'cardSub': 'Язык интерфейса, типографика, раскладка',
    'enabled': 'Русский язык включён',
    'typography': 'Типографика вывода',
    'typographyDesc': 'Исправляет типографику в тексте ответов: кавычки-«ёлочки», тире вместо дефисов, неразрывные пробелы после коротких предлогов. Код и ссылки не трогаются.',
    'yo': 'Буква ё',
    'yoDesc': 'Восстанавливать «ё» в частых словах (ещё, чёрный, идёт и др.), написанных через «е». Неоднозначные слова (например «все/всё») не трогаются.',
    'agentPrompt': 'Русский промпт агента',
    'agentPromptDesc': 'Добавляет в системный промпт инструкцию отвечать по-русски. Не по умолчанию.',
    'overridesCount': 'Своих переопределений',
    'statusLoading': 'Настройки загружаются…',
    'statusUnavailable': 'Настройки недоступны на этом хосте',
    'hint': 'Машинные переводы помечены в очереди выверки; ручная правка словарей приоритетна.',
    'altL': 'Alt+L — конвертировать раскладку текущего поля',
    'reportIssue': 'Сообщить об ошибке перевода',
    'requestPlugin': 'Запросить перевод плагина',
}
card_json = json.dumps(card_ru, ensure_ascii=False)

client = r'''// dsh-russian-lang — браузерная половина. ФАЙЛ СГЕНЕРИРОВАН, правьте ru/*.json
// и ru-plugins/*.json и запускайте build.py.
//
// Плагин докладывает русский словарь в чужие namespace'ы: реестр локалей это
// разрешает — register(ns, locale, dict) конфликтует только если пара
// (namespace, язык) уже занята, а "ru" не занимает никто.
//
// Ядро без русского: список языков (LOCALES) зашит в @deepseek-ai/dsh-client-locale,
// из него родная строка Language строит меню и setLocale() берёт валидацию.
// Список живёт в snapshot локаль-runtime — плагин расширяет snapshot пунктом
// "Русский", и родной селектор показывает его третьей позицией. Файлы ядра не
// правятся; если ядро когда-нибудь узнает "ru" само, расширение не происходит.
window.__ModuleLoader__.load({
  id: '@goodandready/dsh-russian-lang',
  factory: (require) => {
    var module = { exports: {} }
    var React = null
    try { React = require('react') } catch (e) { /* карточка настроек необязательна */ }

    /** namespace -> { ключ: перевод } */
    const RU = %s

    /** zh-строка -> ru-строка для DOM-перевода панелей вне locale-ядра. */
    const ZH_RU = %s

    // Подписи собственной карточки настроек (namespace russian-lang).
    RU['russian-lang'] = %s

    const SETTINGS_NS_NAME = 'russian-lang'

    function apply(ctx) {
      const runtime = ctx.locale
      const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS_NAME })

      // 1. Словари: каждый namespace — свой эффект, словарь снимается вместе с
      // плагином. Если namespace уже несёт ru (плагин локализовался сам) —
      // не конфликтуем.
      for (const ns of Object.keys(RU)) {
        ctx.effect(() => {
          try { return ctx.locale.register(ns, 'ru', RU[ns]) }
          catch (err) { return () => {} }
        }, 'dsh-russian-lang: ' + ns)
      }

      // 1b. Пользовательские переопределения + плюрализация.
      // Overrides: пользовательский слой поверх словарей (russian-lang.overrides).
      // Plural: ядро выбирает .one/.other по n===1, русскому нужны few/many.
      const pluralRules = new Intl.PluralRules('ru-RU')
      const origTranslate = runtime.translate.bind(runtime)
      const getOverrides = () => {
        try {
          const value = scope.getSnapshot().value
          return value && value.overrides ? value.overrides : {}
        } catch (err) { return {} }
      }
      // Форматирование чисел, валют и относительного времени для русского языка
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
        const n = typeof val === 'number' ? val : Number(val)
        return isNaN(n) ? String(val) : numberFormat.format(n)
      }

      const formatRelativeTime = (val, unit) => {
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

      // Морфологический хелпер склонений сущностей (Smart Inflection Engine)
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

      const inflectWord = (word, cName) => {
        if (!word || typeof word !== 'string') return word
        const lower = word.toLowerCase()
        if (INFLECT_CUSTOM[lower] && INFLECT_CUSTOM[lower][cName]) {
          const res = INFLECT_CUSTOM[lower][cName]
          return word[0] === word[0].toUpperCase() ? res[0].toUpperCase() + res.slice(1) : res
        }
        if (/[a-zA-Z0-9_-]/.test(word) || /^[А-ЯЁ]{2,}$/.test(word)) return word
        if (/[оеиую]$/i.test(word) && !/(ко|ло|но|то|во|ро|до|по|со|мо|го)$/i.test(word)) return word

        const isCap = word[0] === word[0].toUpperCase()
        const w = lower
        if (w.endsWith('ия')) {
          const stem = w.slice(0, -2)
          const map = { gen: stem + 'ии', dat: stem + 'ии', acc: stem + 'ию', ins: stem + 'ией', pre: stem + 'ии' }
          const out = map[cName] || w
          return isCap ? out[0].toUpperCase() + out.slice(1) : out
        }
        if (w.endsWith('а')) {
          const stem = w.slice(0, -1)
          const lastCons = stem.slice(-1)
          const genEnd = /[гкхжшчщ]/.test(lastCons) ? 'и' : 'ы'
          const map = { gen: stem + genEnd, dat: stem + 'е', acc: stem + 'у', ins: stem + 'ой', pre: stem + 'е' }
          const out = map[cName] || w
          return isCap ? out[0].toUpperCase() + out.slice(1) : out
        }
        if (w.endsWith('я')) {
          const stem = w.slice(0, -1)
          const map = { gen: stem + 'и', dat: stem + 'е', acc: stem + 'ю', ins: stem + 'ей', pre: stem + 'е' }
          const out = map[cName] || w
          return isCap ? out[0].toUpperCase() + out.slice(1) : out
        }
        if (w.endsWith('ь')) {
          const stem = w.slice(0, -1)
          const map = { gen: stem + 'и', dat: stem + 'и', acc: stem + 'ь', ins: stem + 'ью', pre: stem + 'и' }
          const out = map[cName] || w
          return isCap ? out[0].toUpperCase() + out.slice(1) : out
        }
        if (w.endsWith('й')) {
          const stem = w.slice(0, -1)
          const map = { gen: stem + 'я', dat: stem + 'ю', acc: stem + 'я', ins: stem + 'ем', pre: stem + 'е' }
          const out = map[cName] || w
          return isCap ? out[0].toUpperCase() + out.slice(1) : out
        }
        if (/[бвгджзклмнпрстфхцчшщ]$/.test(w)) {
          const map = { gen: w + 'а', dat: w + 'у', acc: w, ins: w + 'ом', pre: w + 'е' }
          const out = map[cName] || w
          return isCap ? out[0].toUpperCase() + out.slice(1) : out
        }
        return word
      }

      const inflect = (phrase, cName) => {
        if (!phrase || typeof phrase !== 'string') return phrase
        const validCases = new Set(['gen', 'dat', 'acc', 'ins', 'pre'])
        if (!validCases.has(cName)) return phrase
        return phrase.split(' ').map((w) => inflectWord(w, cName)).join(' ')
      }

      // Русская поисковая морфология и нечеткий матчинг для палитры команд и меню
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
        'q':'й','w':'ц','e':'у','r':'к','t':'е','y':'н','u':'г','i':'ш','o':'щ','p':'з','[':'х',']':'ъ',
        'a':'ф','s':'ы','d':'в','f':'а','g':'п','h':'р','j':'о','k':'л','l':'д',';':'ж',"'" : 'э',
        'z':'я','x':'ч','c':'с','v':'м','b':'и','n':'т','m':'ь',',':'б','.':'ю'
      }
      const translitEnToRu = (str) => str.toLowerCase().split('').map(c => EN_RU_KEYS[c] || c).join('')

      const fuzzyMatchRu = (query, target) => {
        if (!query || !target) return 0
        const q = query.toLowerCase().trim()
        const t = target.toLowerCase().trim()
        if (t === q) return 100
        if (t.includes(q)) return 90
        const qTranslit = translitEnToRu(q)
        if (t.includes(qTranslit)) return 85
        const qStems = q.split(/\s+/).map(stemRussian).filter(Boolean)
        const tStems = t.split(/\s+/).map(stemRussian).filter(Boolean)
        let matched = 0
        for (const qs of qStems) {
          if (tStems.some(ts => ts.startsWith(qs) || qs.startsWith(ts))) matched++
        }
        if (matched === qStems.length && qStems.length > 0) return 80
        if (matched > 0) return 50
        return 0
      }

      const getPluginLocalizationStatus = (ns) => {
        if (!ns) return { status: 'none', count: 0, label: 'RU отсутствует' }
        const dict = RU[ns] || {}
        const count = Object.keys(dict).length
        if (count > 0) {
          return { status: 'full', count, label: `RU: ${count} строк` }
        }
        return { status: 'none', count: 0, label: 'RU отсутствует' }
      }

      // Русификатор и человекочитаемый интерпретатор системных ошибок (Error Humanizer)
      const ERROR_MAP = {
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

      const humanizeError = (err) => {
        if (!err) return null
        const rawMsg = typeof err === 'string' ? err : (err.message || String(err))
        const code = err.code || (rawMsg.match(/\b(E[A-Z]{2,20})\b/) || [])[1]
        const status = err.status || err.statusCode || (rawMsg.match(/\b([45]\d{2})\b/) || [])[1]
        const lookupKey = code || status
        if (lookupKey && ERROR_MAP[lookupKey]) {
          const info = ERROR_MAP[lookupKey]
          return { code: String(lookupKey), title: info.title, message: info.message, hint: info.hint, raw: rawMsg }
        }
        if (/rate limit|too many requests/i.test(rawMsg)) {
          return { code: '429', title: ERROR_MAP[429].title, message: ERROR_MAP[429].message, hint: ERROR_MAP[429].hint, raw: rawMsg }
        }
        if (/unauthorized|invalid token|invalid api key/i.test(rawMsg)) {
          return { code: '401', title: ERROR_MAP[401].title, message: ERROR_MAP[401].message, hint: ERROR_MAP[401].hint, raw: rawMsg }
        }
        return { code: 'UNKNOWN', title: 'Ошибка операции', message: rawMsg, hint: 'Проверьте параметры операции и логи.', raw: rawMsg }
      }

      const makeIssueUrl = (opts = {}) => {
        const repo = 'GooDAnDReaDY/dsh-russian-lang'
        const title = opts.title || (opts.plugin ? `[Перевод] Запрос локализации для плагина ${opts.plugin}` : '[Ошибка перевода] Неточный перевод фразы')
        const bodyLines = [
          '### Описание проблемы',
          opts.description || (opts.plugin ? `Просьба добавить русскую локализацию для плагина \`${opts.plugin}\`.` : 'Обнаружена неточность в переводе интерфейса.'),
          '',
          '### Технический контекст',
          opts.ns ? `- **Namespace**: \`${opts.ns}\`` : null,
          opts.key ? `- **Ключ**: \`${opts.key}\`` : null,
          opts.en ? `- **Оригинал (EN)**: ${opts.en}` : null,
          opts.ru ? `- **Текущий перевод (RU)**: ${opts.ru}` : null,
          opts.plugin ? `- **Плагин**: \`${opts.plugin}\`` : null,
          `- **Версия dsh-russian-lang**: \`0.1.29\``,
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

      const formatCurrency = (val, cur) => {
        const n = typeof val === 'number' ? val : Number(val)
        if (isNaN(n)) return String(val)
        return getCurrencyFormat(cur).format(n)
      }

      // Расширенный fill с поддержкой спецификаторов {param:number}, {param:reltime}, {param:currency}
      const fill = (template, params) => template.replace(/\{(\w+)(?::(\w+))?\}/g, (match, name, spec) => {
        if (!(name in params)) return match
        const val = params[name]
        if (spec === 'number') return formatNumber(val)
        if (spec === 'reltime') return formatRelativeTime(val)
        if (spec === 'currency') return formatCurrency(val, params.currency || 'RUB')
        if (spec === 'gen' || spec === 'dat' || spec === 'acc' || spec === 'ins' || spec === 'pre') return inflect(String(val), spec)
        return String(val)
      })

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
      // lookup: в ядре 0.1.2 lookup(ns, key, chain) требует третий довод —
      // цепочку языков; в старых ядрах его два. Спрашиваем у самого метода
      // (lookup.length), цепочку берём у ядра (fallbackChain приватный, но в
      // собранном коде доступен), иначе минимальная [active]. Голый вызов без
      // chain ронял чужой слот sidebar.workspaces (chain is not iterable).
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
        // 1. Пользовательский override — самый верхний слой.
        const overrides = getOverrides()
        if (overrides[key] !== undefined) {
          return params ? fill(overrides[key], params) : overrides[key]
        }
        // 2. Плюрализация для русского.
        if (runtime.getLocale().active === 'ru' && params) {
          const n = params.n ?? params.count
          if (typeof n === 'number') {
            const form = pluralRules.select(n)
            const m = /^(.*)[.](one|other)$/.exec(key)
            if (m) {
              // Ядро выбирает .one/.other по n===1; русскому нужны few/many.
              if (form === 'few' || form === 'many') {
                const pluralKey = m[1] + '.' + form
                const template = lookup(ns, pluralKey) ?? lookup('common', pluralKey)
                if (template !== undefined) {
                  return fill(template, params)
                }
              }
            } else if (form !== 'other' && !/[.](one|other|few|many)$/.test(key)) {
              // Счётный ключ без суффикса: t('X', {n}). Если словарь даёт формы
              // X.one / X.few / X.many - берём подходящую, иначе как раньше.
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

      // 2. <html lang>: в таблице DOCUMENT_LANGUAGE ядра нет "ru", без нас там
      // окажется undefined после переключения.
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
        // Ядро не знает ru: регистрируем его через addLanguage (реальный API
        // LocaleRuntime). Родная строка Language берёт меню из snapshot.locales,
        // setLocale() по нему же валидирует выбор — «Русский» появляется в
        // родном списке. (Старый код писал runtime.snapshot/publish напрямую —
        // этих методов в DSH 0.1.2-alpha нет, переключение молча не работало.)
        runtime.addLanguage({ id: 'ru', label: 'Русский', fallback: 'en' })
        syncLang()

        // Хост-monkey-patch (подмена runtime.host.getSnapshot/set ради
        // preference="ru") удалён: в DSH v0.1.2-alpha.2 settings пишется через
        // ctx.remote.settings.mutate, а adopt() читает preference из scope
        // snapshot напрямую. Подмена host конфликтовала с новой settings-mirror
        // и ломала запись namespace, из-за чего галочки не сохранялись. Выбор
        // языка держим своим russian-lang.enabled; включение делает tryBoot ниже.
      }

      // 3. Флаг russianLang.enabled всегда повторяет активный язык: выбор
      // английского или китайского в родном меню выключает русский и наоборот.
      // scope.set возвращает Promise<void> в v0.1.2-alpha.2, ошибка приходит
      // через rejection и try/catch её не ловит — обрабатываем оба канала.
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

      // 4. Старт: сохранённый флаг включает русский.
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

      // Подписчик регистрируется синхронно, до первого publish() в tryBoot
      // ниже - иначе ctx.effect откладывает выполнение, и boot-publish
      // происходит до того, как syncLang слушатель зарегистрирован.
      const unsubscribeLang = runtime.subscribe(syncLang)
      ctx.effect(() => unsubscribeLang, 'dsh-russian-lang: html-lang')
      syncLang()

      // 5. Орфография (russian-lang.spellcheck): при активном русском включаем
      // браузерный спелчек на текстовых полях. Код-редакторы и поля команд не
      // трогаем - отличаем их по моноширинному шрифту. Исходные значения
      // сохраняем в data-атрибутах и возвращаем при уходе с русского.
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
          // ponytail: реагируем только на добавленные узлы; полям, сменившим
          // шрифт на месте, поможет следующая перезагрузка страницы.
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
        unsubscribeSpell()
        if (spellObserver) spellObserver.disconnect()
        try { document.querySelectorAll('[' + SPELL_ON + ']').forEach(spellOff) } catch (err) { /* ignore */ }
      }, 'dsh-russian-lang: spellcheck')
      syncSpell()

      // 5b. DOM-перевод панелей, игнорирующих locale-ядро. dsh-skill-hub
      // выбирает свой zh/en-словарь по documentElement.lang и умеет только эти
      // два языка; наш ru-словарь в его lookup не попадает. Эти строки
      // встречаются в DOM как готовый китайский текст, поэтому при активном
      // русском заменяем их по карте ZH_RU (собрана на сборке из zh-референса
      // плагина и нашего перевода по тем же ключам). Плейсхолдеры ({count} и
      // т.п.) к моменту рендера уже подставлены — шаблонные пары превращаем в
      // регексы, значения переносим в ru-шаблон. Реагируем на мутации DOM
      // (панель перерисовывается React'ом), при уходе с русского ничего не
      // восстанавливаем — панель сама перерисуется по новому lang.
      const ZH_CJK = /[\u3400-\u9fff\uf900-\ufaff]/
      const ZH_RE_ESC = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const ZH_EXACT = new Map()
      const ZH_PATTERNS = []
      for (const [zhText, ruText] of Object.entries(ZH_RU)) {
        if (typeof zhText !== 'string' || !ZH_CJK.test(zhText) || !ruText) continue
        if (/\{[a-zA-Z_]\w*\}/.test(zhText)) {
          const parts = zhText.split(/\{[a-zA-Z_]\w*\}/g)
          if (parts.some((p) => p.length === 0)) continue // якорь на соседние {} ненадёжен
          ZH_PATTERNS.push({ re: new RegExp(parts.map(ZH_RE_ESC).join('([\\s\\S]*?)')), ruParts: ruText.split(/\{[a-zA-Z_]\w*\}/g) })
        } else {
          ZH_EXACT.set(zhText, ruText)
        }
      }
      ZH_PATTERNS.sort((a, b) => b.re.source.length - a.re.source.length)
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
      const ZH_WALKER = (root) => {
        try {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
          const hits = []
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (node.nodeValue && node.nodeValue.length >= 2 && ZH_CJK.test(node.nodeValue)) hits.push(node)
          }
          for (const node of hits) {
            const next = zhTranslateText(node.nodeValue)
            if (next) node.nodeValue = next
          }
          // title/placeholder/aria-label — атрибуты с пользовательским текстом.
          for (const el of root.querySelectorAll ? root.querySelectorAll('[title],[placeholder],[aria-label]') : []) {
            for (const attr of ['title', 'placeholder', 'aria-label']) {
              const v = el.getAttribute && el.getAttribute(attr)
              if (v && v.length >= 2 && ZH_CJK.test(v)) {
                const next = zhTranslateText(v)
                if (next) el.setAttribute(attr, next)
              }
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
              // Панель перерисовывается React'ом; обход после микрозадачи,
              // чтобы поймать уже вставленные узлы. Тяжёлых страниц мало —
              // ponytail: обход всего body, при тормозах ограничить секцией.
              queueMicrotask(() => { try { ZH_WALKER(document.body) } catch (err) { /* ignore */ } })
            })
            zhObserver.observe(document.body, { childList: true, subtree: true, characterData: true })
          }
          ZH_WALKER(document.body)
        } catch (err) { /* ignore */ }
      }
      const unsubscribeZh = runtime.subscribe(syncZhDom)
      ctx.effect(() => {
        unsubscribeZh()
        if (zhObserver) zhObserver.disconnect()
      }, 'dsh-russian-lang: zh-dom')
      syncZhDom()

      // 6. Типографика (russian-lang.typography { enabled, yo }): постпроцессор
      // текстовых узлов при активном русском - ёлочки, тире, неразрывные
      // пробелы перед короткими словами, опционально ё (безопасный список).
      // Код, ссылки, кнопки и поля ввода не трогаем. Правила идемпотентны,
      // повторный проход по своим же правкам ничего не меняет.
      const TYPO_SKIP = new Set(['CODE', 'PRE', 'A', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'KBD', 'SAMP', 'BUTTON'])
      const typoQuotes = (text) => text
        .replace(/"([^"\n]{1,200})"/g, '\u00AB$1\u00BB')
        .replace(/[“„]([^“”\n]{1,200})[”"]/g, '\u00AB$1\u00BB')
        .replace(/[『「]([^』」\n]{1,200})[』」]/g, '\u00AB$1\u00BB')
      const typoDash = (text) => text
        .replace(/(^|[\s(\[\u00AB])--(?=\s|$)/g, '$1\u2014')
        .replace(/(^|[\s(\[\u00AB])-(?=\s)/g, '$1\u2014')
      const typoPunct = (text) => text.replace(/\s+([,.:;!?])(?=\s|$)/g, '$1')
      const TYPO_SHORT = new Set(['в', 'с', 'к', 'о', 'у', 'а', 'и', 'но', 'не', 'ни', 'на', 'по', 'до', 'из', 'за', 'от', 'об'])
      const typoNbsp = (text) => text.replace(/(^|[\s(\[\u00AB])([а-яё]{1,2})(\s+)/g, (match, lead, word) => (
        TYPO_SHORT.has(word) ? lead + word + '\u00A0' : match
      ))
      const TYPO_YO_CURATED = [
        [/еще/g, 'ещё'], [/Еще/g, 'Ещё'], [/ЕЩЕ/g, 'ЕЩЁ'],
        [/\bее\b/g, 'её'], [/\bЕе\b/g, 'Её'],
        [/\bчерный\b/g, 'чёрный'], [/\bчерная\b/g, 'чёрная'], [/\bчерные\b/g, 'чёрные'],
        [/\bзеленый\b/g, 'зелёный'], [/\bжелтый\b/g, 'жёлтый'],
        [/\bлегкий\b/g, 'лёгкий'], [/\bтяжелый\b/g, 'тяжёлый'],
        [/\bнадежный\b/g, 'надёжный'], [/\bдешевый\b/g, 'дешёвый'],
        [/\bидет\b/g, 'идёт'], [/\bдает\b/g, 'даёт'], [/\bберет\b/g, 'берёт'],
        [/\bведет\b/g, 'ведёт'], [/\bнесет\b/g, 'несёт'], [/\bживет\b/g, 'живёт'],
        [/\bпривел\b/g, 'привёл'], [/\bшел\b/g, 'шёл']
      ]
      // Корпусные ё-пары из freq-словаря (безопасные написания), генерируются build.py.
      const TYPO_YO_FREQ = %s
      const TYPO_YO = TYPO_YO_CURATED.concat(
        TYPO_YO_FREQ
          .filter((p) => p[0].length >= 3 && p[0] !== p[1])
          .map((p) => [new RegExp('\\b' + p[0] + '\\b', 'g'), p[1]])
      )
      const typoYo = (text) => {
        for (const pair of TYPO_YO) text = text.replace(pair[0], pair[1])
        return text
      }
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
        if (node.parentElement && node.parentElement.closest('code, pre, a, script, style, textarea, input, select, button, kbd, samp')) return
        if (node.parentElement && node.parentElement.closest('.katex, [data-latex], math')) return
        if (/\$[^$\n]+\$/.test(before)) return
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
            for (const record of records) roots.push(record.nodeType ? record.target : record)
            queueTypo(roots)
          })
          typoObserver.observe(document.body, { childList: true, characterData: true, subtree: true })
        } catch (err) { /* ignore */ }
      }
      const unsubscribeTypo = runtime.subscribe(syncTypo)
      ctx.effect(() => {
        unsubscribeTypo()
        if (typoObserver) typoObserver.disconnect()
      }, 'dsh-russian-lang: typography')
      syncTypo()

      // 7. Фикс раскладки (russian-lang.layout): подсказка-конвертер.
      // Пользователь печатает в неверной раскладке (yjdsq gjvfu -> новый вопрос).
      // Показываем плашку с превью, клик заменяет текст; тихой замены нет.
      const LAYOUT_LAT_TO_CYR = {
        'q':'й','w':'ц','e':'у','r':'к','t':'е','y':'н','u':'г','i':'ш','o':'щ','p':'з','[':'х',']':'ъ',
        'a':'ф','s':'ы','d':'в','f':'а','g':'п','h':'р','j':'о','k':'л','l':'д',';':'ж',"'" : 'э',
        'z':'я','x':'ч','c':'с','v':'м','b':'и','n':'т','m':'ь',',':'б','.':'ю','/':'.',
        '`':'ё'
      }
      const LAYOUT_CYR_TO_LAT = {}
      for (const k in LAYOUT_LAT_TO_CYR) LAYOUT_CYR_TO_LAT[LAYOUT_LAT_TO_CYR[k]] = k
      const FREQ = new Set(%s)

      const isLatin = (ch) => /[a-z]/.test(ch)
      const isCyrillic = (ch) => /[\u0430-\u044f\u0451]/.test(ch)
      const translit = (word, map) => {
        let out = ''
        for (const ch of word.toLowerCase()) out += map[ch] !== undefined ? map[ch] : ch
        return out
      }
      const ruWordFraction = (text) => {
        // доля слов текста, присутствующих в частотном словаре или локальном
        const words = text.toLowerCase().split(/[^а-яё]+/).filter(Boolean)
        if (!words.length) return 0
        const hit = words.filter((w) => FREQ.has(w) || localDict.has(w)).length
        return hit / words.length
      }
      // Локальный словарь обучения (#67): слова, которые пользователь принял
      // через «Исправить». Живёт в памяти сессии, в настройки/бандл не пишется.
      const localDict = new Set()
      const learnWords = (text) => {
        for (const w of text.toLowerCase().split(/[^а-яё]+/).filter(Boolean)) {
          if (w.length >= 3) localDict.add(w)
        }
      }
      const layoutFixCandidate = (value, direction) => {
        // direction: 'lat2cyr' | 'cyr2lat'. Возвращает {converted} если подозрительно.
        if (direction === 'lat2cyr') {
          const converted = translit(value, LAYOUT_LAT_TO_CYR)
          if (!/[а-яё]{2}/.test(converted)) return null
          if (ruWordFraction(converted) < 0.7) return null
          return { converted }
        } else {
          // cyr2lat только для команды в инпуте (/...)
          const converted = translit(value, LAYOUT_CYR_TO_LAT)
          if (!converted.startsWith('/')) return null
          return { converted }
        }
      }

      // Отвечаем на real input: input / input_event, слушаем на document.
      // Читаем value у поля, где курсор (textarea/input), не трогая contenteditable.
      let layoutHintEl = null
      const layoutCurrentInput = () => {
        const el = document.activeElement
        if (el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type === 'text'))) return el
        return null
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
          inputEl.value = converted
          inputEl.dispatchEvent(new Event('input', { bubbles: true }))
          learnWords(converted) // #67: запомнить принятые слова
          layoutDismiss()
        })
        document.body.appendChild(layoutHintEl)
        // позиция над инпутом
        const r = inputEl.getBoundingClientRect()
        layoutHintEl.style.left = (r.left + 8) + 'px'
        layoutHintEl.style.bottom = (window.innerHeight - r.top + 6) + 'px'
      }

      // #66: индикатор активной раскладки у чат-инпута. Определяем по последнему
      // введённому символу (кириллица → RU, латиница → EN); клик — Alt+L-конверт.
      let layoutBadgeEl = null
      const layoutBadge = (el) => {
        const value = el.value || ''
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
            fontFamily: 'monospace', lineHeight: '1.4',
          })
          layoutBadgeEl.title = 'Раскладка — клик: конвертировать (Alt+L)'
          layoutBadgeEl.addEventListener('mousedown', (ev) => {
            ev.preventDefault()
            const v = el.value || ''
            const c = layoutFixCandidate(v, 'lat2cyr') || layoutFixCandidate(v, 'cyr2lat')
            if (c) { el.value = c.converted; el.dispatchEvent(new Event('input', { bubbles: true })) }
          })
          document.body.appendChild(layoutBadgeEl)
        }
        layoutBadgeEl.textContent = label
        const r = el.getBoundingClientRect()
        layoutBadgeEl.style.left = (r.right - 24) + 'px'
        layoutBadgeEl.style.top = (r.top - 20) + 'px'
      }
      const layoutBadgeHide = () => {
        if (layoutBadgeEl) { layoutBadgeEl.remove(); layoutBadgeEl = null }
      }
      const layoutOnInput = () => {
        try {
          if (runtime.getLocale().active !== 'ru') { layoutDismiss(); layoutBadgeHide(); return }
          const el = layoutCurrentInput()
          if (!el) { layoutDismiss(); layoutBadgeHide(); return }
          layoutBadge(el) // #66: метка раскладки
          const value = el.value || ''
          if (value.trim().length < 4) { layoutDismiss(); return }
          // lat2cyr: если есть латиница и почти нет кириллицы
          const latCount = (value.match(/[a-z]/g) || []).length
          const cyrCount = (value.match(/[\u0430-\u044f\u0451]/g) || []).length
          if (latCount > cyrCount && cyrCount === 0) {
            const c = layoutFixCandidate(value, 'lat2cyr')
            if (c) { layoutShowHint(el, c.converted, 'ru'); return }
          }
          // cyr2lat: если всё кириллица и начинается с /
          if (cyrCount > 0 && latCount === 0 && value.trim().startsWith('/')) {
            const c = layoutFixCandidate(value, 'cyr2lat')
            if (c) { layoutShowHint(el, c.converted, 'cmd'); return }
          }
          layoutDismiss()
        } catch (err) { /* ignore */ }
      }
      const unsubscribeLayout = runtime.subscribe(layoutOnInput)
      document.addEventListener('input', layoutOnInput, true)
      document.addEventListener('keydown', (ev) => {
        // Alt+л (Latin 'l' код) ручной конверт текущего инпута
        if (ev.altKey && !ev.ctrlKey && !ev.metaKey && ev.key.toLowerCase() === 'l') {
          const el = layoutCurrentInput()
          if (el) {
            const value = el.value || ''
            const c = layoutFixCandidate(value, 'lat2cyr') || layoutFixCandidate(value, 'cyr2lat')
            if (c) {
              ev.preventDefault()
              el.value = c.converted
              el.dispatchEvent(new Event('input', { bubbles: true }))
              learnWords(c.converted) // #67
            }
          }
        }
      }, true)
      ctx.effect(() => {
        unsubscribeLayout()
        document.removeEventListener('input', layoutOnInput, true)
        layoutDismiss()
        layoutBadgeHide()
      }, 'dsh-russian-lang: layout')

      // 8. Карточка настроек («Настройки → Плагины → Настройки плагинов»).
      // Ключ слота равен пространству настроек; карточка свёрнута по умолчанию;
      // форма активна только при статусе ready снимка.
      if (!ctx.slots || !React) return
      const toggleRu = (wantRu) => {
        try {
          if (runtime.getLocale().active === wantRu) return
          runtime.setLocale(wantRu ? 'ru' : 'en')
        } catch (err) { console.warn('dsh-russian-lang: toggle failed', err) }
      }
      // Регистрируем карточку через inject: так слот объявляется родителю,
      // и карточка появляется в списке «Настройки → Плагины». Без inject
      // register бросает "slot is not declared" на новых ядрах.
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
    }

    // Карточка настроек: React-компонент вне apply.
    // v0.1.2-alpha.2: раннер slot-registry вызывает entry.inject() и
    // РАЗВОРАЧИВАЕТ его результат прямо в props компонента
    // (props.scope / props.runtime / props.toggleRu) — так же, как ядро читает
    // props.save/props.edit в своих карточках. Формат props.inject() устарел:
    // на alpha.2 props.inject === undefined, поэтому scope был undefined и
    // scope.set падал ("Cannot read properties of undefined (reading 'set')").
    // Читаем новые props напрямую, с фолбэком на inject() для старых ядер.
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
      // Оптимистичное состояние типографики: галочка переключается сразу,
      // а host-подтверждение (scope.subscribe) лишь синхронизирует его позже.
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
      }, [])
      React.useEffect(() => {
        try {
          const un = runtime.subscribe(() => {
            try { setRuActive(runtime.getLocale().active === 'ru') } catch (e) { /* ignore */ }
          })
          return un
        } catch (e) { return undefined }
      }, [])

      const status = snap.status || 'loading'
      const value = snap.value || {}
      const typography = typo
      const overridesCount = Object.keys(value.overrides || {}).length

      const setTypo = (patch) => {
        const next = Object.assign({}, typo, patch)
        setTypoState(next) // мгновенно
        // v0.1.2-alpha.2: scope.set returns Promise<void>, ошибка приходит через
        // promise rejection. catch на promise не обработает sync throw, поэтому
        // принимаем оба и логируем только реальные.
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

      const row = (label, control, desc) =>
        React.createElement('div', { className: 'rl-field' },
          React.createElement('span', { className: 'rl-label' }, label),
          control,
          desc ? React.createElement('div', { className: 'rl-desc' }, desc) : null)

      const checkbox = (checked, onChange, disabled) =>
        React.createElement('input', {
          type: 'checkbox', checked: !!checked, disabled: !!disabled,
          className: 'rl-check', onChange: (ev) => onChange(ev),
        })

      const statusLine = status === 'ready'
        ? ''
        : (status === 'unavailable' ? t('statusUnavailable') : t('statusLoading'))
      const disabled = status !== 'ready'

      // Шеврон раскрытия — чистый SVG той же формы, что ядровый
      // (без зависимости от @deepseek-ai/dsh-client-ui-primitives: этот модуль
      // не зарегистрирован в module table старых ядер и валил загрузчик).
      const Chevron = () => React.createElement('svg', {
        width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none',
        'aria-hidden': 'true',
      }, React.createElement('path', {
        d: 'M3.5 5.25 7 8.75l3.5-3.5', stroke: 'currentColor',
        'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      }))

      return React.createElement('div', { className: 'rl-card' },
        React.createElement('button', {
          type: 'button',
          className: 'rl-head',
          'aria-expanded': String(open),
          onClick: () => setOpen(!open),
        },
          React.createElement('span', { style: { flex: '1' } },
            React.createElement('div', { className: 'rl-title' }, t('cardTitle')),
            React.createElement('div', { className: 'rl-sub' },
              statusLine || t('cardSub'))),
          React.createElement('span', {
            className: 'rl-chev' + (open ? ' rl-chev-open' : ''),
          }, React.createElement(Chevron, null))),
        open && React.createElement('div', { className: 'rl-body' },
          row(t('enabled'), checkbox(ruActive, onEnabled, false), null),
          row(t('typography'), checkbox(typography.enabled !== false && ruActive,
            (ev) => setTypo({ enabled: ev.target.checked }), !ruActive), t('typographyDesc')),
          row(t('yo'), checkbox(typography.yo === true,
            (ev) => setTypo({ yo: ev.target.checked }), !ruActive), t('yoDesc')),
          row(t('agentPrompt'), checkbox(value.overrides && value.overrides.agentPrompt === true,
            (ev) => {
              const next = Object.assign({}, value.overrides || {}, { agentPrompt: ev.target.checked })
              try {
                const r = scope.set('overrides', next)
                if (r && typeof r.catch === 'function') r.catch((err) => {
                  console.warn('dsh-russian-lang: scope.set overrides failed', err && err.message || err)
                })
              } catch (err) {
                console.warn('dsh-russian-lang: scope.set overrides sync threw', err && err.message || err)
              }
            }, false), t('agentPromptDesc')),
          React.createElement('div', { className: 'rl-note' },
            t('overridesCount') + ': ' + overridesCount),
          React.createElement('div', { className: 'rl-hint' }, t('altL')),
          React.createElement('div', { className: 'rl-actions' },
            React.createElement('a', {
              href: makeIssueUrl(),
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'rl-link'
            }, '💬 ' + t('reportIssue'))),
          React.createElement('div', { className: 'rl-foot' }))
      )
    }

    // Стили карточки: префикс rl-, только переменные темы.
    const RL_CSS = [
      '.rl-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none}',
      '.rl-head{appearance:none;width:100%%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;display:flex;align-items:center;gap:12px;padding:14px 16px}',
      '.rl-title{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}',
      '.rl-sub{color:var(--dsw-alias-label-secondary);font-size:13px}',
      '.rl-chev{margin-left:auto;flex:none;color:var(--dsw-alias-label-tertiary);display:inline-flex;transition:transform .16s}',
      '.rl-chev-open{transform:rotate(180deg)}',
      '.rl-body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}',
      '.rl-field{display:flex;flex-direction:column;gap:6px;padding:12px 0}',
      '.rl-label{color:var(--dsw-alias-label-primary);font-size:13px}',
      '.rl-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.4}',
      '.rl-check{width:16px;height:16px;accent-color:var(--dsw-alias-label-primary)}',
      '.rl-note{color:var(--dsw-alias-label-secondary);font-size:12px;padding:8px 0 4px}',
      '.rl-hint{color:var(--dsw-alias-label-secondary);font-size:12px;padding:4px 0 8px}',
      '.rl-actions{border-top:1px solid var(--dsw-alias-border-l2);display:flex;justify-content:flex-start;align-items:center;gap:12px;padding:8px 0 4px}',
      '.rl-link{color:var(--dsw-alias-label-secondary);font-size:12px;text-decoration:none;display:inline-flex;align-items:center;gap:6px}',
      '.rl-link:hover{color:var(--dsw-alias-label-primary);text-decoration:underline}',
      '.rl-foot{border-top:1px solid var(--dsw-alias-border-l2);display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px}',
    ].join('\n')
    if (typeof document !== 'undefined' && !document.querySelector('style[data-plugin-css="rl-card"]')) {
      const tag = document.createElement('style')
      tag.dataset.plugin = '@goodandready/dsh-russian-lang'
      tag.dataset.pluginCss = 'rl-card'
      tag.textContent = RL_CSS
      document.head.appendChild(tag)
    }

    module.exports = { apply, inject: ['locale', 'connection', 'remote', 'settingsScope', 'slots'] }
    return module.exports
  },
})
''' % (payload, zh_ru_json, card_json, yo_json, freq_json)

open(os.path.join(HERE, 'lib', 'client.js'), 'w', encoding='utf-8').write(client)
print('namespace-ов: %d, ключей: %d -> lib/client.js'
      % (len(merged), sum(len(v) for v in merged.values())))
