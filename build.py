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

# ё-пары для типографики: слова с ё из частотного корпуса дают пары
# «еще -> ещё», плюс ручной список ниже. yo по умолчанию выключен.
#
# Чёрный список сверяется с написанием ЧЕРЕЗ Е (левая половина пары). Это не
# косметика: цикл идёт по словам, содержащим ё, поэтому сравнение самого слова
# со списком не срабатывает никогда — так пара «все -> всё» и уезжала в бандл
# вопреки списку, комментарию и тесту (#132).
#
# Корпус на роль детектора омографов не годится: он написан без ё, поэтому
# «еще», «идет», «черный» лежат в нём как обычные слова. Отличить омограф от
# ё-less написания может только человек, отсюда ручной список.
YO_BLACKLIST = {
    # Омографы: написание через «е» — самостоятельное слово с другим смыслом.
    'все',      # все (мн.ч.)        != всё (ср.р.)
    'всем',     # всем (дат. мн.)    != всём (предл. ср.р.)
    'чем',      # чем (тв./союз)     != чём (предл.)
    'нем',      # нем (краткое прил.)!= нём (предл. от «он»)
    'моем',     # моем («мы моем»)   != моём (предл.)
    'берет',    # берет (головной убор) != берёт
    'черт',     # черт (род. мн. от «черта») != чёрт
    'черта',    # черта (линия, признак)    != чёрта (род. от «чёрт»)
    'черту',    # черту (дат. от «черта»)   != чёрту
    'чертов',   # чертов (род. мн. от «черта») != чёртов
    # Мусор корпуса: не слова, попали из шумных источников.
    'ето', 'пеп', 'хен',
}

# Ручные пары: частотные в интерфейсе слова, которых нет в корпусе с ё.
YO_CURATED = [
    ('еще', 'ещё'), ('ее', 'её'),
    ('черный', 'чёрный'), ('черная', 'чёрная'), ('черные', 'чёрные'),
    ('зеленый', 'зелёный'), ('желтый', 'жёлтый'),
    ('легкий', 'лёгкий'), ('тяжелый', 'тяжёлый'),
    ('надежный', 'надёжный'), ('дешевый', 'дешёвый'),
    ('идет', 'идёт'), ('дает', 'даёт'), ('ведет', 'ведёт'),
    ('несет', 'несёт'), ('живет', 'живёт'),
    ('привел', 'привёл'), ('шел', 'шёл'),
]

yo_pairs = []
seen_yo = set()


def add_yo(e, y, min_len):
    """Пара попадает в бандл, если она не в блеклисте и не короче min_len.

    Короткие пары отсекаются отдельно от блеклиста: «ей -> ёй», «ен -> ён»,
    «че -> чё» — обрывки, а не слова, и перечислять их поимённо бессмысленно.
    """
    if e == y or len(e) < min_len or e in YO_BLACKLIST or (e, y) in seen_yo:
        return
    seen_yo.add((e, y))
    yo_pairs.append([e, y])


for e, y in YO_CURATED:
    add_yo(e, y, 2)
for w in freq_words:
    if 'ё' in w:
        add_yo(w.replace('ё', 'е'), w, 3)
yo_json = json.dumps(yo_pairs, ensure_ascii=False)
print('ё-пар (ручных + корпусных): %d' % len(yo_pairs))

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

//__PURE_JS__

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
            const form = pluralForm(n)
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
      // Точечные замены атрибутов и текста в плагинах с хардкодом (dsh-visualize, effort-slider)
      const DOM_EN_ATTRS = {
        'Streaming preview': 'Предпросмотр стриминга',
        'Visualization streaming preview': 'Предпросмотр визуализации'
      }
      const DOM_EN_TEXT = {
        'Low': 'Низкий',
        'Medium': 'Средний',
        'High': 'Высокий',
        'Effort': 'Рассуждения'
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
                if (p && (p.closest('[class*="effort"], [class*="slider"], [class*="reasoning"]') || p.getAttribute('role') === 'option')) {
                  node.nodeValue = node.nodeValue.replace(trimmed, DOM_EN_TEXT[trimmed])
                }
              }
            }
          }
          for (const node of hits) {
            const next = zhTranslateText(node.nodeValue)
            if (next) node.nodeValue = next
          }
          // title/placeholder/aria-label — атрибуты с пользовательским текстом.
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
      // ё-пары: ручные + корпусные, омографы отсеяны в build.py (#132).
      const TYPO_YO_PAIRS = %s
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
      // Локальный словарь обучения (#67): слова, принятые через «Исправить».
      // Живёт в памяти сессии, в настройки и бандл не пишется.
      const layout = makeLayout(new Set(%s), new Set())
      const layoutFixCandidate = layout.candidate
      const learnWords = layout.learnWords

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
      const layoutOnKeydown = (ev) => {
        // Alt+L (клавиша KeyL, Latin 'l' или русская 'д'): ручной конверт текущего инпута
        const isL = ev.code === 'KeyL' || ev.key.toLowerCase() === 'l' || ev.key.toLowerCase() === 'д'
        if (ev.altKey && !ev.ctrlKey && !ev.metaKey && isL) {
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
      }
      document.addEventListener('keydown', layoutOnKeydown, true)
      ctx.effect(() => {
        unsubscribeLayout()
        document.removeEventListener('input', layoutOnInput, true)
        document.removeEventListener('keydown', layoutOnKeydown, true)
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
              href: makeIssueUrl({}, '__PKG_VERSION__'),
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

# Чистая половина (lib/pure.js) — один исходник на бандл и на тесты (#133).
# Подставляем ПОСЛЕ %-форматирования: иначе каждый процент внутри pure.js
# пришлось бы удваивать, и первый же забытый `%` ронял бы сборку.
pure_src = open(os.path.join(HERE, 'lib', 'pure.js'), encoding='utf-8').read()
pure_inline = _re.sub(r'^export (const|function|class) ', r'\1 ', pure_src, flags=_re.M)
if '//__PURE_JS__' not in client:
    raise SystemExit('в шаблоне нет маркера //__PURE_JS__ — вставлять pure.js некуда')
client = client.replace('//__PURE_JS__', pure_inline)

# Версия для ссылки «сообщить об ошибке»: берём из package.json, чтобы строка
# не устаревала руками (в 0.1.31 в ней стояло «0.1.29»).
pkg = json.load(open(os.path.join(HERE, 'package.json'), encoding='utf-8'))
client = client.replace('__PKG_VERSION__', pkg['version'])

# Перевод строки задаём явно: в текстовом режиме Windows пишет CRLF, Linux —
# LF, и один и тот же исходник даёт разные байты бандла. Сверка собранного
# файла с закоммиченным (CI, #134) от этого становится нестабильной.
with open(os.path.join(HERE, 'lib', 'client.js'), 'w',
          encoding='utf-8', newline='\n') as fh:
    fh.write(client)
print('namespace-ов: %d, ключей: %d -> lib/client.js'
      % (len(merged), sum(len(v) for v in merged.values())))
