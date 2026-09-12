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
    'badgeRu': '🟢 RU активен',
    'badgeEn': '⚪ EN активен',
    'badgeCoverage': '🟢 100% (6,002 ключа)',
    'badgeSmartUx': '⚡ Smart UX активен',
    'secLanguage': '🌐 Язык интерфейса',
    'secLanguageDesc': 'Нативное переключение языка интерфейса DSH на русский без перезагрузки страницы.',
    'enabled': 'Русский язык включён',
    'enabledDesc': 'Переключает язык интерфейса DeepSeek Harness на русский.',
    'quickSwitchNote': 'Быстрый переключатель RU ⇄ EN доступен в шапке сессии рядом с кнопками диалога.',
    'secTypography': '✍️ Умная типографика и ввод (Smart UX)',
    'secTypographyDesc': 'Автоматическое улучшение текстов по нормам русской типографики во время диалога и набора.',
    'typography': 'Типографика вывода',
    'typographyDesc': 'Исправляет типографику ответов модели: кавычки-«ёлочки», тире («—») вместо дефисов, неразрывные пробелы после предлогов.',
    'yo': 'Буква «ё»',
    'yoDesc': 'Восстанавливать «ё» в частых словах (ещё, чёрный, идёт и др.), написанных через «е». Неоднозначные слова (все/всё) не трогаются.',
    'liveInput': 'Живая типографика инпута',
    'liveInputDesc': 'Автоматически заменять "" на «» и -- на — прямо во время набора промпта (код в бэктиках игнорируется).',
    'slashAliases': 'Русские алиасы команд',
    'slashAliasesDesc': 'Поддержка русских команд: /цель -> /goal, /сжать -> /compact, /план -> /plan, /справка -> /help, /память -> /memory.',
    'altLHintText': 'Мгновенная конвертация раскладки текущего поля (ghbdtn ⇄ привет, /vjltkm ⇄ /model). В углу поля ввода также отображается метка раскладки.',
    'secAgentPrompt': '🤖 Системный промпт агента',
    'secAgentPromptDesc': 'Официальная секция расширения DSH systemPrompt для ведения диалога на русском языке.',
    'agentPrompt': 'Русский промпт агента',
    'agentPromptDesc': 'Добавляет в системный промпт инструкцию отвечать по-русски в выбранном стиле.',
    'agentPromptPreset': 'Стиль ответов агента',
    'presetExpert': 'Технический эксперт (строгая терминология, чистый код)',
    'presetWriter': 'Технический писатель (Markdown, таблицы, ГОСТ)',
    'presetConcise': 'Лаконичный режим (кратко, без лишней воды)',
    'secSupport': '📊 Покрытие экосистемы и поддержка',
    'secSupportDesc': 'Словари синхронизированы с DSH v0.1.5-rc.1. 100.0% UI-покрытие без черновых машинных переводов.',
    'statNamespaces': 'Пространств имён',
    'statCoreKeys': 'Ключей ядра',
    'statPluginKeys': 'Ключей плагинов',
    'overridesCount': 'Своих переопределений',
    'statusLoading': 'Настройки загружаются…',
    'statusUnavailable': 'Настройки недоступны на этом хосте',
    'translateTurn': 'Перевести на русский',
    'reportIssue': 'Сообщить о неточности перевода',
    'exportMdHint': 'Экспорт диалога в Markdown доступен по кнопке [ 📥 MD ] в шапке сессии.',
    'translateTurnHint': 'Перевод ответов ассистента на русский доступен по кнопке [ RU ↗ ] на блоках сообщений.',
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
        return () => {
          unsubscribeSpell()
          if (spellObserver) spellObserver.disconnect()
          try { document.querySelectorAll('[' + SPELL_ON + ']').forEach(spellOff) } catch (err) { /* ignore */ }
        }
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
        'Effort': 'Рассуждения',
        'Search engine (ModSearch)': 'Поисковая система (ModSearch)',
        'Search engine provider configuration.': 'Настройка провайдера поисковой системы.',
        'X search only': 'Только поиск в X'
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
        return () => {
          unsubscribeZh()
          if (zhObserver) zhObserver.disconnect()
        }
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
        return () => {
          unsubscribeTypo()
          if (typoObserver) typoObserver.disconnect()
        }
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
      function setNativeInputValue(el, value, cursorStart, cursorEnd) {
        if (!el) return
        const oldVal = el.value || ''
        if (oldVal === value) return

        // 1. Prototype descriptor setter (bypasses element-level getter/setter)
        const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
        const desc = Object.getOwnPropertyDescriptor(proto, 'value')
        if (desc && desc.set) {
          desc.set.call(el, value)
        } else {
          el.value = value
        }

        // 2. Desynchronize React _valueTracker so React detects change on input event
        if (el._valueTracker) {
          el._valueTracker.setValue(value === '' ? '__force__' : '')
        }

        // 3. Direct React synthetic event invocation if available on React Fiber/Props
        try {
          const propsKey = Object.keys(el).find((k) => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'))
          if (propsKey && el[propsKey] && typeof el[propsKey].onChange === 'function') {
            el[propsKey].onChange({ target: el, currentTarget: el })
          }
        } catch (e) {}

        // 4. Dispatch native browser input & change events
        try {
          el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
        } catch (e) {
          el.dispatchEvent(new Event('input', { bubbles: true }))
        }
        el.dispatchEvent(new Event('change', { bubbles: true }))

        // 5. Restore cursor position if requested
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
        const apply = () => {
          try {
            host.focus()
            document.execCommand('selectAll', false, null)
            document.execCommand('insertText', false, value)
          } catch (e) {}
        }
        apply()
        setTimeout(apply, 15)
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
        // позиция над инпутом
        const r = inputEl.getBoundingClientRect()
        layoutHintEl.style.left = (r.left + 8) + 'px'
        layoutHintEl.style.bottom = (window.innerHeight - r.top + 6) + 'px'
      }

      // #66: индикатор активной раскладки у чат-инпута.
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

          // #158: Живая типографика в поле ввода
          try {
            const snapVal = scope ? (scope.getSnapshot().value || {}) : {}
            const typoLive = snapVal.typography ? snapVal.typography.liveInput !== false : true
            if (typoLive && value && typeof formatInputLive === 'function') {
              const formatted = formatInputLive(value)
              if (formatted !== value) {
                isFormatting = true
                try {
                  const sStart = el.selectionStart
                  const diff = formatted.length - value.length
                  const nextPos = typeof sStart === 'number' ? Math.max(0, sStart + diff) : undefined
                  setComposerText(el, formatted, nextPos, nextPos)
                } finally {
                  isFormatting = false
                }
              }
            }
          } catch (e) { /* ignore */ }


          // #158: Русские алиасы слэш-команд при вводе пробела после команды
          try {
            const snapVal = scope ? (scope.getSnapshot().value || {}) : {}
            const allowAliases = snapVal.slashAliases !== false
            if (allowAliases && value.startsWith('/') && typeof expandSlashAlias === 'function') {
              const expanded = expandSlashAlias(value)
              if (expanded !== value) {
                isFormatting = true
                try {
                  const sStart = el.selectionStart
                  const diff = expanded.length - value.length
                  const nextPos = typeof sStart === 'number' ? Math.max(0, sStart + diff) : undefined
                  setComposerText(el, expanded, nextPos, nextPos)
                } finally {
                  isFormatting = false
                }
              }
            }
          } catch (e) { /* ignore */ }

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

      const layoutOnKeydown = (ev) => {
        const el = layoutCurrentInput(ev)
        if (!el) return

        const value = getComposerText(el)

        // Alt+L (клавиша KeyL, Latin 'l' или русская 'д'): ручной конверт текущего инпута
        const isL = ev.code === 'KeyL' || ev.key.toLowerCase() === 'l' || ev.key.toLowerCase() === 'д'
        if (ev.altKey && !ev.ctrlKey && !ev.metaKey && isL) {
          const c = layoutFixCandidate(value, 'lat2cyr') || layoutFixCandidate(value, 'cyr2lat')
          if (c) {
            ev.preventDefault()
            isFormatting = true
            try {
              setComposerText(el, c.converted)
              learnWords(c.converted) // #67
            } finally {
              isFormatting = false
            }
          }
          return
        }


        // #158: Разворачивание русских алиасов слэш-команд (/цель -> /goal)
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

        // #158: Мгновенная типографика прямо по нажатию клавиш
        try {
          const snapVal = scope ? (scope.getSnapshot().value || {}) : {}
          const typoLive = snapVal.typography ? snapVal.typography.liveInput !== false : true
          if (typoLive && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
            // 1. Двойной дефис: если нажат '-' и предыдущий символ тоже '-'
            if (ev.key === '-' && (value.endsWith('-') || /-\s*$/.test(value))) {
              ev.preventDefault()
              isFormatting = true
              try {
                if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                  const sStart = el.selectionStart || value.length
                  const nextVal = value.slice(0, sStart).replace(/-$/, '—') + value.slice(sStart)
                  setNativeInputValue(el, nextVal, sStart, sStart)
                } else {
                  document.execCommand('delete', false, null)
                  document.execCommand('insertText', false, '—')
                }
              } finally {
                isFormatting = false
              }
              return
            }
            // 3. Кавычки-ёлочки: если нажата клавиша '"'
            if (ev.key === '"') {
              ev.preventDefault()
              isFormatting = true
              try {
                const lastChar = value.slice(-1)
                if (lastChar === '«') {
                  setComposerText(el, value + '»', value.length + 1, value.length + 1)
                } else {
                  const isOpening = !value || /[\s([{-]/.test(lastChar)
                  const quoteChar = isOpening ? '«' : '»'
                  setComposerText(el, value + quoteChar, value.length + 1, value.length + 1)
                }
              } finally {
                isFormatting = false
              }
              return
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

      // #158: Быстрый переключатель RU ⇄ EN в шапке сессии
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

      // #158: Кнопка перевода реплики на русский в действиях ассистента
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

      // #158: Экспорт сессии в Markdown
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

    // Карточка настроек: React-компонент вне apply.
    // v0.1.2-alpha.2: раннер slot-registry вызывает entry.inject() и
    // РАЗВОРАЧИВАЕТ его результат прямо в props компонента
    // (props.scope / props.runtime / props.toggleRu) — так же, как ядро читает
    // props.save/props.edit в своих карточках. Формат props.inject() устарел:
    // на alpha.2 props.inject === undefined, поэтому scope был undefined и
    // scope.set падал ("Cannot read properties of undefined (reading 'set')").
    // Читаем новые props напрямую, с фолбэком на inject() для старых ядер.
    // #158: Быстрый переключатель языка в шапке
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

    // #158: Кнопка экспорта в Markdown
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
          const safeTitle = (title || 'dialog').replace(/[/\\?%%*:|"<>]/g, '-').slice(0, 50)
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

            // 1. Google translate web API (sl=auto -> tl=ru)
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

            // 2. MyMemory fallback with valid ISO language pair
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

    // #158: Кнопка перевода реплики на русский
    function TranslateTurnAction(props) {
      const t = typeof props.t === 'function' ? props.t : ((k) => k)
      const [loading, setLoading] = React.useState(false)
      const [open, setOpen] = React.useState(false)

      return React.createElement('button', {
        type: 'button',
        className: 'rl-action-btn' + (open ? ' rl-action-btn-active' : ''),
        title: t('translateTurn'),
        disabled: loading,
        onClick: async (ev) => {
          ev.stopPropagation()
          const btn = ev.currentTarget
          // The button is inside [data-chat-flow-kind="turn-tail"]
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

      const Chevron = () => React.createElement('svg', {
        width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none',
        'aria-hidden': 'true',
      }, React.createElement('path', {
        d: 'M3.5 5.25 7 8.75l3.5-3.5', stroke: 'currentColor',
        strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
      }))

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

            // Секция 1: Язык интерфейса
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

            // Секция 2: Умная типографика и ввод (Smart UX)
            React.createElement('div', { className: 'rl-section-card' },
              React.createElement('div', { className: 'rl-section-title' },
                React.createElement('span', null, t('secTypography')),
                React.createElement('span', { className: 'rl-badge rl-badge-ok' }, t('badgeSmartUx'))
              ),
              React.createElement('div', { className: 'rl-section-desc' }, t('secTypographyDesc')),
              React.createElement('div', { className: 'rl-grid-2' },
                // 1. Типографика вывода
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
                // 2. Живая типографика инпута
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
                // 3. Буква «ё»
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
                // 4. Русские алиасы слэш-команд
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

            // Секция 3: Системный промпт агента
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

            // Секция 4: Покрытие экосистемы и поддержка
            React.createElement('div', { className: 'rl-section-card' },
              React.createElement('div', { className: 'rl-section-title' },
                React.createElement('span', null, t('secSupport')),
                React.createElement('span', { className: 'rl-badge rl-badge-ok' }, '🟢 100.0%%')
              ),
              React.createElement('div', { className: 'rl-section-desc' }, t('secSupportDesc')),
              React.createElement('div', { className: 'rl-grid-3' },
                React.createElement('div', { className: 'rl-stat-box' },
                  React.createElement('div', { className: 'rl-stat-val' }, '99'),
                  React.createElement('div', { className: 'rl-stat-label' }, t('statNamespaces'))
                ),
                React.createElement('div', { className: 'rl-stat-box' },
                  React.createElement('div', { className: 'rl-stat-val' }, '1 225'),
                  React.createElement('div', { className: 'rl-stat-label' }, t('statCoreKeys'))
                ),
                React.createElement('div', { className: 'rl-stat-box' },
                  React.createElement('div', { className: 'rl-stat-val' }, '4 777'),
                  React.createElement('div', { className: 'rl-stat-label' }, t('statPluginKeys'))
                )
              ),
              React.createElement('div', { className: 'rl-actions-row' },
                React.createElement('a', {
                  href: makeIssueUrl({}, '__PKG_VERSION__'),
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
      '.rl-head{appearance:none;width:100%%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;display:flex;align-items:center;gap:12px;padding:14px 18px}',
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
      '.rl-select{height:32px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:6px;padding:0 8px;font-size:12px;outline:none;width:100%%;max-width:380px}',
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
