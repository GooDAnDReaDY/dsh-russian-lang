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

payload = json.dumps(merged, ensure_ascii=False, indent=1, sort_keys=True)

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
    'overridesCount': 'Своих переопределений',
    'statusLoading': 'Настройки загружаются…',
    'statusUnavailable': 'Настройки недоступны на этом хосте',
    'hint': 'Машинные переводы помечены в очереди выверки; ручная правка словарей приоритетна.',
    'altL': 'Alt+L — конвертировать раскладку текущего поля',
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
      const fill = (template, params) => template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match)
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
                const template = this.lookup(ns, pluralKey) ?? this.lookup('common', pluralKey)
                if (template !== undefined) {
                  return fill(template, params)
                }
              }
            } else if (form !== 'other' && !/[.](one|other|few|many)$/.test(key)) {
              // Счётный ключ без суффикса: t('X', {n}). Если словарь даёт формы
              // X.one / X.few / X.many - берём подходящую, иначе как раньше.
              const pluralKey = key + '.' + form
              const template = this.lookup(ns, pluralKey) ?? this.lookup('common', pluralKey)
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
        // Ядро не знает ru: добавляем его в snapshot runtime. Родная строка
        // Language берёт меню из snapshot.locales, setLocale() по нему же
        // валидирует выбор — «Русский» появляется в родном списке.
        const s0 = runtime.getLocale()
        runtime.snapshot = Object.freeze({
          active: s0.active,
          locales: s0.locales.concat([{ id: 'ru', label: 'Русский' }]),
          revision: s0.revision + 1
        })
        ctx.emit('locale/change', runtime.snapshot)
        syncLang()

        // Хост-схема namespace "locale" знает только zh/en, запись preference
        // "ru" он отклонит. Перехватываем её: выбор сохраняется нашим флагом
        // russian-lang.enabled, остальные языки пишутся штатно.
        //
        // Кроме того, adopt() в ядре при каждом обновлении настроек возвращает
        // активный язык к сохранённому preference (или языку браузера): он
        // читает scope через getSnapshot. Пока активен русский, докладываем в
        // снимок preference "ru", иначе любой settings-запись вернёт en.
        const realHost = runtime.host
        if (realHost) {
          const origGetSnapshot = realHost.getSnapshot.bind(realHost)
          const patchedGetSnapshot = () => {
            const s = origGetSnapshot()
            try {
              if (runtime.getLocale().active === 'ru') {
                return Object.assign({}, s, {
                  value: Object.assign({}, s && s.value ? s.value : {}, { preference: 'ru' })
                })
              }
            } catch (err) { /* ignore */ }
            return s
          }
          realHost.getSnapshot = patchedGetSnapshot
          runtime.host = {
            getSnapshot: patchedGetSnapshot,
            subscribe: (fn) => realHost.subscribe(fn),
            set: (field, value) => {
              if (field === 'preference' && value === 'ru') return Promise.resolve()
              return realHost.set(field, value)
            },
            unset: (field) => realHost.unset ? realHost.unset(field) : Promise.resolve()
          }
        }
      }

      // 3. Флаг russianLang.enabled всегда повторяет активный язык: выбор
      // английского или китайского в родном меню выключает русский и наоборот.
      const syncFlag = () => {
        try {
          const wantRu = runtime.getLocale().active === 'ru'
          const value = scope.getSnapshot().value || {}
          if (!!value.enabled !== wantRu) scope.set('enabled', wantRu)
        } catch (err) { /* снимок ещё не готов */ }
      }
      ctx.effect(() => {
        try { return runtime.subscribe(syncFlag) }
        catch (err) { return undefined }
      }, 'dsh-russian-lang: sync-flag')

      // 4. Старт: сохранённый флаг включает русский.
      const activate = () => {
        try {
          if (runtime.getLocale().active === 'ru') return
          if (native) runtime.setLocale('ru')
          else runtime.publish('ru', true)
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

      // 6. Типографика (russian-lang.typography { enabled, yo }): постпроцессор
      // текстовых узлов при активном русском - ёлочки, тире, неразрывные
      // пробелы перед короткими словами, опционально ё (безопасный список).
      // Код, ссылки, кнопки и поля ввода не трогаем. Правила идемпотентны,
      // повторный проход по своим же правкам ничего не меняет.
      const TYPO_SKIP = new Set(['CODE', 'PRE', 'A', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'KBD', 'SAMP', 'BUTTON'])
      const typoQuotes = (text) => text.replace(/"([^"\n]{1,200})"/g, '\u00AB$1\u00BB')
      const typoDash = (text) => text
        .replace(/(^|[\s(\[\u00AB])--(?=\s|$)/g, '$1\u2014')
        .replace(/(^|[\s(\[\u00AB])-(?=\s)/g, '$1\u2014')
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
        let after = typoQuotes(before)
        after = typoDash(after)
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
        'a':'ф','s':'ы','d':'в','f':'а','g':'п','h':'р','j':'о','k':'л','l':'д',';':'ж','\'':'э',
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
        // доля слов текста, присутствующих в частотном словаре
        const words = text.toLowerCase().split(/[^а-яё]+/).filter(Boolean)
        if (!words.length) return 0
        const hit = words.filter((w) => FREQ.has(w)).length
        return hit / words.length
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
          layoutDismiss()
        })
        document.body.appendChild(layoutHintEl)
        // позиция над инпутом
        const r = inputEl.getBoundingClientRect()
        layoutHintEl.style.left = (r.left + 8) + 'px'
        layoutHintEl.style.bottom = (window.innerHeight - r.top + 6) + 'px'
      }
      const layoutOnInput = () => {
        try {
          if (runtime.getLocale().active !== 'ru') { layoutDismiss(); return }
          const el = layoutCurrentInput()
          if (!el) { layoutDismiss(); return }
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
            }
          }
        }
      }, true)
      ctx.effect(() => {
        unsubscribeLayout()
        document.removeEventListener('input', layoutOnInput, true)
        layoutDismiss()
      }, 'dsh-russian-lang: layout')

      // 8. Карточка настроек («Настройки → Плагины → Настройки плагинов»).
      // Ключ слота равен пространству настроек; карточка свёрнута по умолчанию;
      // форма активна только при статусе ready снимка.
      if (!ctx.slots || !React) return
      const toggleRu = (wantRu) => {
        try {
          if (runtime.getLocale().active === wantRu) return
          if (native) runtime.setLocale(wantRu ? 'ru' : 'en')
          else runtime.publish(wantRu ? 'ru' : 'en', true)
        } catch (err) { console.warn('dsh-russian-lang: toggle failed', err) }
      }
      ctx.slots.register({
        name: 'settings.plugin.item',
        key: SETTINGS_NS_NAME,
        locale: SETTINGS_NS_NAME,
        inject: () => ({ scope, runtime, toggleRu }),
      }, SettingsCard)
    }

    // Карточка настроек: React-компонент вне apply (замыкание не нужно —
    // зависимости приходят через props.inject).
    function SettingsCard(props) {
      const src = typeof props.inject === 'function'
        ? (props.inject() || {})
        : (props.inject || {})
      const scope = src.scope
      const runtime = src.runtime
      const toggleRu = src.toggleRu
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
        try { scope.set('typography', next) } catch (err) { /* ignore */ }
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

      // Ядровый шеврон раскрытия; в урезанной сборке — запасной SVG той же формы.
      const Chevron = (() => {
        try {
          const primitives = require('@deepseek-ai/dsh-client-ui-primitives')
          if (primitives && primitives.IconChevronDownOutline14) return primitives.IconChevronDownOutline14
        } catch (e) { /* нет набора */ }
        return () => React.createElement('svg', {
          width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none',
          'aria-hidden': 'true',
        }, React.createElement('path', {
          d: 'M3.5 5.25 7 8.75l3.5-3.5', stroke: 'currentColor',
          'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        }))
      })()

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
          React.createElement('div', { className: 'rl-note' },
            t('overridesCount') + ': ' + overridesCount),
          React.createElement('div', { className: 'rl-hint' }, t('altL')),
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
''' % (payload, card_json, yo_json, freq_json)

open(os.path.join(HERE, 'lib', 'client.js'), 'w', encoding='utf-8').write(client)
print('namespace-ов: %d, ключей: %d -> lib/client.js'
      % (len(merged), sum(len(v) for v in merged.values())))
