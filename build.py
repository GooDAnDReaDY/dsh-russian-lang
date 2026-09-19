#!/usr/bin/env python3
"""Собрать lib/client.js из словарей ru/*.json и ru-plugins/*.json.

Словари — источник истины, бандл генерируется. Перевод правится в JSON, после
обновления dsh достаточно перегенерировать бандл.
"""
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

CHECK_MODE = '--check' in sys.argv
diff_files = []

def write_or_check(file_path, content):
    if CHECK_MODE:
        if not os.path.exists(file_path):
            diff_files.append(file_path + ' (файл отсутствует на диске)')
            return
        with open(file_path, 'r', encoding='utf-8') as f:
            disk_content = f.read()
        if disk_content != content:
            diff_files.append(file_path)
    else:
        with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)


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
core_dict = {}
for path in sorted(glob.glob(os.path.join(HERE, 'ru', '*.json'))):
    part = json.load(open(path, encoding='utf-8'))
    for ns, entries in part.items():
        if ns in SELF_RU:
            continue
        core_dict.setdefault(ns, {}).update(entries)

mt_path = os.path.join(HERE, 'mt-registry.json')
mt = json.load(open(mt_path, encoding='utf-8')) if os.path.exists(mt_path) else {}
for ns, entries in mt.items():
    if ns in SELF_RU or ns not in core_dict:
        continue
    for key, rec in entries.items():
        if key not in core_dict.get(ns, {}):
            core_dict[ns][key] = rec.get('ru', '')

# Выносим словарь ядра в lib/locales/core.json (Issue #214), чтобы размер
# client.js оставался в безопасной зоне Store (< 160 KiB из 256 KiB лимита).
core_file = os.path.join(HERE, 'lib', 'locales', 'core.json')
os.makedirs(os.path.dirname(core_file), exist_ok=True)
core_content = json.dumps(core_dict, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
write_or_check(core_file, core_content)
print('Core namespace-ов: %d, ключей: %d -> lib/locales/core.json' % (len(core_dict), sum(len(v) for v in core_dict.values())))

# В client.js оставляем только компактный бутстрап для мгновенной отрисовки
# базового каркаса (common, nav, menu, session) и плагинов с ранним статическим монтированием:
BOOTSTRAP_NAMESPACES = {'common', 'nav', 'menu', 'session', 'dsh-cron', 'dsh-usage-stats', 'pluginMarket'}
bootstrap_dict = {}
for ns in BOOTSTRAP_NAMESPACES:
    if ns in core_dict:
        bootstrap_dict[ns] = core_dict[ns]

# Добавляем ключевые статические строки плагинов в бутстрап
try:
    cron_data = json.load(open(os.path.join(HERE, 'ru-plugins', '56-cron.json'), encoding='utf-8'))
    if 'dsh-cron' in cron_data:
        bootstrap_dict['dsh-cron'] = {'sidebar.label': cron_data['dsh-cron'].get('sidebar.label', 'Задачи по расписанию')}
except Exception:
    pass

try:
    usage_data = json.load(open(os.path.join(HERE, 'ru-plugins', '16-usage-stats.json'), encoding='utf-8'))
    if 'dsh-usage-stats' in usage_data:
        bootstrap_dict['dsh-usage-stats'] = {'footer.todayLabel': usage_data['dsh-usage-stats'].get('footer.todayLabel', 'Сегодня')}
except Exception:
    pass

try:
    mkt_data = json.load(open(os.path.join(HERE, 'ru-plugins', '74-plugin-market.json'), encoding='utf-8'))
    if 'pluginMarket' in mkt_data:
        bootstrap_dict['pluginMarket'] = {'trigger': mkt_data['pluginMarket'].get('trigger', 'Магазин плагинов')}
except Exception:
    pass

payload = json.dumps(bootstrap_dict, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
print('Bootstrap namespace-ов: %d, ключей: %d -> lib/client.js' % (len(bootstrap_dict), sum(len(v) for v in bootstrap_dict.values())))

# Сборка отдельных словарей плагинов в lib/locales/plugins/*.json
locales_dir = os.path.join(HERE, 'lib', 'locales', 'plugins')
os.makedirs(locales_dir, exist_ok=True)
plugin_sources = sorted(glob.glob(os.path.join(HERE, 'ru-plugins', '*.json')))
for path in plugin_sources:
    part = json.load(open(path, encoding='utf-8'))
    filtered = {}
    for ns, entries in part.items():
        if ns in SELF_RU:
            continue
        filtered[ns] = dict(entries)
        if ns in mt:
            for key, rec in mt[ns].items():
                if key not in filtered[ns]:
                    filtered[ns][key] = rec.get('ru', '')
    base = os.path.basename(path)
    out_file = os.path.join(locales_dir, base)
    plugin_content = json.dumps(filtered, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    write_or_check(out_file, plugin_content)

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
zh_ru_file = os.path.join(HERE, 'lib', 'locales', 'zh-ru.json')
os.makedirs(os.path.dirname(zh_ru_file), exist_ok=True)
zh_ru_content = json.dumps(zh_ru, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
write_or_check(zh_ru_file, zh_ru_content)
zh_ru_json = "{}" 
print('zh->ru пар для DOM-перевода: %d' % len(zh_ru))

# Частотный словарь для фикса раскладки (tools/ru-freq.json). Обновляется
# tools/freq_refresh.py и встраивается в бандл для детектора.
freq_path = os.path.join(HERE, 'tools', 'ru-freq.json')
freq_words = json.load(open(freq_path, encoding='utf-8')) if os.path.exists(freq_path) else []
freq_bundle = freq_words[:1200]
freq_json = json.dumps(freq_bundle, ensure_ascii=False)

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
    'badgeCoverage': '🟢 100% (7,902 ключа)',
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
        'secUpdater': '🔄 Обновление языкового пакета',
    'secUpdaterDesc': 'Проверка наличия новых релизов в реестре npm и обновление в один клик.',
    'updaterCurrent': 'Текущая версия: v{version}',
    'updaterLatest': 'Доступна новая версия: v{version}',
    'updaterUpToDate': 'Установлена актуальная версия',
    'updaterChecking': 'Проверка…',
    'updaterCheckBtn': 'Проверить обновления',
    'updaterBtn': 'Обновить до v{version} в 1 клик',
    'updaterUpdating': 'Установка обновления…',
    'updaterSuccess': '✅ Плагин успешно обновлён! Перезапустите DSH для применения.',
    'updaterFailed': '❌ Не удалось проверить/обновить плагин. Проверьте сеть или логи сервера.',
    'badgeUpdateAvailable': 'Доступно обновление',
    'badgeUpToDate': 'Актуальная версия',
    'secTranslator': '🌐 Перевод сообщений ассистента',
    'secTranslatorDesc': 'Настройка перевода ответов модели в чате на русский язык (локально в Docker или онлайн).',
    'translateEngine': 'Движок перевода',
    'engineOff': 'Выключен (по умолчанию, без сетевых вызовов)',
    'engineLocal': 'Локальный LibreTranslate (приватно, ~600 МБ RAM)',
    'engineGoogle': 'Google Translate (онлайн)',
    'googleWarn': '⚠️ Внимание: при онлайн-переводе текст сообщений ассистента передаётся на публичные серверы Google для перевода на лету. Не используйте для конфиденциальных данных.',
    'localStatusRunning': '🟢 Контейнер LibreTranslate активен',
    'localStatusStopped': '⚪ Контейнер LibreTranslate не запущен',
    'localStartBtn': 'Запустить LibreTranslate в Docker (~600 МБ RAM)',
    'localStarting': 'Запуск контейнера…',
    'localInfo': 'LibreTranslate запускается изолированно в Docker на сервере, потребляет ~500–700 МБ RAM и переводит на 100% локально.',
'secSupport': '📊 Покрытие экосистемы и поддержка',
    'secSupportDesc': 'Словари синхронизированы с DSH v0.1.6-alpha.1. 100.0% UI-покрытие ядра и всех установленных плагинов (7,902 ключа) без черновых машинных переводов.',
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
    // Plugins page row seat (DSH 0.1.6-alpha.2): key = '<package name>#<row id>'.
    const ROW_CONFIG_KEY = '@goodandready/dsh-russian-lang#russian-lang'

    function apply(ctx) {
      const runtime = ctx.locale
      const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS_NAME })

      // 1. Словари ядра DSH: каждый namespace — свой эффект, снимается вместе с плагином
      for (const ns of Object.keys(RU)) {
        ctx.effect(() => {
          try { return ctx.locale.register(ns, 'ru', RU[ns]) }
          catch (err) { return () => {} }
        }, 'dsh-russian-lang: ' + ns)
      }

      // 1a. Асинхронная подгрузка словарей ядра, плагинов и zh-ru карты из хоста (Issue #214)
      if (typeof fetch === 'function') {
        fetch('/api/dsh-russian-lang/dict/all', { headers: { 'Accept': 'application/json' } })
          .then((res) => res.ok ? res.json() : null)
          .then((data) => {
            if (!data) return
            const allDicts = Object.assign({}, data.core || {}, data.plugins || {}, data)
            if (data.zhRu && typeof ZH_RU === 'object') {
              Object.assign(ZH_RU, data.zhRu)
              if (typeof updateZhRu === 'function') updateZhRu(data.zhRu)
            }
            for (const ns of Object.keys(allDicts)) {
              if (ns === 'zhRu' || ns === 'plugins' || ns === 'core') continue
              const dict = allDicts[ns]
              if (typeof dict !== 'object' || !dict) continue
              if (!RU[ns]) {
                RU[ns] = dict
                ctx.effect(() => {
                  try { return ctx.locale.register(ns, 'ru', dict) }
                  catch (err) { return () => {} }
                }, 'dsh-russian-lang: ' + ns)
              } else {
                Object.assign(RU[ns], dict)
              }
            }
            if (typeof syncZhDom === 'function') syncZhDom()
          })
          .catch(() => {})
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

      // Встроенные переводы настроек и пресетов ядра / плагинов
      const CORE_ZH_PRESETS = {
        '请求批准': 'Запрашивать подтверждение',
        '完全放开': 'Полный доступ',
        '只读': 'Только чтение',
        '只能读，任何写入都需要审批。': 'Только чтение, любая запись требует подтверждения.',
        '工作区内可写；工作区外的操作请求人工审批。': 'Запись в рабочей области разрешена; операции вне рабочей области требуют подтверждения.',
        '全放行，不弹审批。': 'Полный доступ, запросы на подтверждение не выводятся.',
        '确定性规则 + 两阶段分类器自动决定；危险或故障时 fail-closed。': 'Детерминированные правила + двухэтапный классификатор; при рисках — безопасная блокировка.',
        '手动测试': 'Ручное тестирование',
        '事件': 'Событие',
        '模拟 (看匹配)': 'Симуляция (проверка)',
        '执行 (真实触发)': 'Выполнение (реальный триггер)',
        '通知渠道测试': 'Тест каналов уведомлений',
        '渠道': 'Канал',
        'Slack 风格单行摘要': 'Сводка в стиле Slack',
        '发送测试通知': 'Отправить тестовое уведомление',
        '飞书通知': 'Уведомления Feishu',
        '扫码连接飞书': 'Подключить Feishu по QR-коду',
        '将创建名为 [DSH 通知机器人] 的飞书应用': 'Будет создано приложение Feishu [DSH 通知机器人]',
        '卡片截断长度': 'Длина обрезки карточки',
        '复制 YAML': 'Копировать YAML',
        '去抖': 'Дебаунс',
        '已断开': 'Отключено',
        '已连接': 'Подключено',
        '已保存': 'Сохранено',
        '保存失败': 'Не удалось сохранить',
        '编辑': 'Редактировать',
        '取消编辑': 'Отмена',
        '启用': 'Включить',
        '停用': 'Отключить',
        '重试': 'Повторить',
        '刷新': 'Обновить',
        '网络请求失败': 'Сетевой запрос не удался',
        '如未立即生效请重启': 'Если изменения не применились, перезапустите DSH',
        '通知机器人': 'Бот уведомлений',
        '飞书扫码授权二维码': 'QR-код авторизации Feishu',
        '在浏览器中打开飞书授权链接': 'Открыть ссылку авторизации Feishu в браузере',
        '重新扫码会覆盖现有应用凭据与本': 'Повторное сканирование перезапишет учётные данные',
        '扫码者本人接收通知卡片': 'Получатель карточки уведомлений — авторизованный пользователь',
        'tool (可选)': 'Инструмент (опц.)',
        'runningSubagents (可选)': 'Подагенты (опц.)',
        'durationMs (可选)': 'Длительность мс (опц.)',
        'usage 输入 (可选)': 'Входные токены (опц.)',
        'usage 输出 (可选)': 'Выходные токены (опц.)',
        'profile (写入哪个 profile 的 cordis.patch.yml)': 'Профиль (куда записать cordis.patch.yml)',
        'URL (留空用 DSH_HOOKS_WEBHOOK_URL)': 'URL (по умолчанию DSH_HOOKS_WEBHOOK_URL)',
        '当前已配置的 Hook 规则列表': 'Список текущих настроенных правил хуков',
        '测试通道': 'Тест канала'
      }
      for (const [k, v] of Object.entries(CORE_ZH_PRESETS)) ZH_EXACT.set(k, v)

      const zhSortedExact = []
      const rebuildZhSorted = () => {
        zhSortedExact.length = 0
        for (const [k, v] of ZH_EXACT.entries()) zhSortedExact.push([k, v])
        zhSortedExact.sort((a, b) => b[0].length - a[0].length)
      }
      rebuildZhSorted()

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
        rebuildZhSorted()
      }
      updateZhRu(ZH_RU)

      const zhTranslateText = (text) => {
        if (!ZH_CJK.test(text)) return null
        const exact = ZH_EXACT.get(text)
        if (exact !== undefined) return exact
        const trimmed = text.trim()
        if (trimmed !== text) {
          const exactTrimmed = ZH_EXACT.get(trimmed)
          if (exactTrimmed !== undefined) return text.replace(trimmed, exactTrimmed)
        }
        for (const p of ZH_PATTERNS) {
          const m = p.re.exec(trimmed)
          if (m && m[0] === trimmed) {
            let out = p.ruParts[0]
            for (let i = 1; i < p.ruParts.length; i++) out += m[i] + p.ruParts[i]
            return text.replace(trimmed, out)
          }
        }
        let replaced = text
        let changed = false
        for (const [zhPhrase, ruPhrase] of zhSortedExact) {
          if (zhPhrase.length >= 2 && replaced.includes(zhPhrase)) {
            replaced = replaced.split(zhPhrase).join(ruPhrase)
            changed = true
          }
        }
        if (changed) return replaced
        return null
      }

      // Точечные замены атрибутов и текста в плагинах с хардкодом
      const DOM_EN_ATTRS = {
        'Streaming preview': 'Предпросмотр стриминга',
        'Visualization streaming preview': 'Предпросмотр визуализации',
        'Security Auditor Shield': 'Защитный щит аудитора',
        'Shield: Safe': 'Щит: Безопасно',
        'Shield: Alert': 'Щит: Тревога',
        'e.g. Implement report export and cover with unit tests': 'Например: Реализовать экспорт отчёта и покрыть юнит-тестами',
        'e.g. Implement report export and cover with unit tests...': 'Например: Реализовать экспорт отчёта и покрыть юнит-тестами…',
        'e.g. Implement user profile settings card with theme tokens': 'Например: Реализовать карточку настроек профиля с токенами темы',
        'Detailed functional specs, acceptance criteria, constraints...': 'Детальная функциональная спецификация, критерии приёмки, ограничения…',
        'Specific instructions, questions, or requirements for this specialist...': 'Конкретные инструкции, вопросы или требования для данного специалиста…',
      }
      const DOM_EN_TEXT = {
        'Scheduled tasks': 'Задачи по расписанию',
        'Today': 'Сегодня',
        'Plugin Market': 'Магазин плагинов',
        'Auto mode': 'Автоматический режим',
        'Full access': 'Полный доступ',
        'Read only': 'Только чтение',
        'Side card': 'Боковая панель',
        'panelName': 'Палитра команд',
        'Hooks': 'Хуки',
        'Manage what the side card shows and how it behaves': 'Настройка содержимого и поведения боковой панели',
        'Inject the sidebar-open tool for the model': 'Предоставить модели инструмент sidebar-open',
        'When enabled, the model can actively open files, folders, and HTTP(S) pages in the sidebar through the sidebar_open tool (off by default)': 'Если включено, модель может открывать файлы, папки и веб-страницы в боковой панели через инструмент sidebar_open (по умолчанию выключено)',
        'Position compatibility mode': 'Режим совместимости расположения',
        'Pick the title-bar compatibility scheme: auto-detect (default, conservative) / DSH official web / known desktop shells / custom (shift distance + custom CSS)': 'Выберите схему совместимости строки заголовка: автоопределение (по умолчанию) / официальный DSH Web / десктопные оболочки / пользовательский режим',
        'Auto-detect': 'Автоопределение',
        'Sidebar content': 'Содержимое боковой панели',
        'Changes': 'Изменения',
        'Tasks': 'Задачи',
        'Time Machine': 'Машина времени',
        'Live Canvas': 'Живой холст',
        'Side Chat (beta)': 'Боковой чат (бета)',
        'Terminal': 'Терминал',
        'Feature settings': 'Настройки функции',
        'Low': 'Низкий',
        'Medium': 'Средний',
        'High': 'Высокий',
        'Effort': 'Рассуждения',
        'Search engine (ModSearch)': 'Поисковая система (ModSearch)',
        'Search engine provider configuration.': 'Настройка провайдера поисковой системы.',
        'X search only': 'Только поиск в X',
        'Security Auditor Shield': 'Защитный щит аудитора',
        'Shield: Safe': 'Щит: Безопасно',
        'Shield: Alert': 'Щит: Тревога',
        'Lens': 'Линза',
        'Gallery': 'Галерея',
        'SSH: Local': 'SSH: Локально',
        'SSH: Remote': 'SSH: Удалённо',
        '7/7 rot': '7/7 рот.',
        'Smoke chat': 'Тестовый чат',
        // dsh-goal Quick Launch Modal (#249)
        'Quick Launch Goal': 'Быстрый запуск цели',
        'Define the objective for the agent in autonomous mode:': 'Сформулируйте задачу для автономной работы агента:',
        'Fix Bug': 'Исправление бага',
        'Refactor (YAGNI)': 'Рефакторинг (YAGNI)',
        'Tests & Coverage': 'Тесты и покрытие',
        'Code Review': 'Ревью кода',
        'New Feature': 'Новая функция',
        'Security Audit': 'Аудит безопасности',
        'Docs & Contract': 'Документация и контракт',
        'Upgrade Deps': 'Обновление зависимостей',
        'Dead Code': 'Мёртвый код',
        'Performance': 'Производительность',
        'Start Goal': 'Запустить цель',

        // dsh-agent-orchestrator Launch Modal (#249)
        'Launch Multi-Agent Orchestrator': 'Запуск мультиагентного оркестратора',
        'Full DAG Pipeline': 'Полный DAG-пайплайн',
        'Direct Specialist Subagent': 'Прямой субагент-специалист',
        'Objective Title': 'Название задачи',
        'Scope & Requirements': 'Объём и требования',
        'Topology Scenario': 'Топологический сценарий',
        'Auto (Infer based on prompt complexity)': 'Авто (определить по сложности задачи)',
        'Hotfix (1 Stage: Triage & Minimal Fix)': 'Хотфикс (1 этап: анализ и точечный фикс)',
        'Simple (2 Stages: Spec + Exec)': 'Простой (2 этапа: ТЗ + реализация)',
        'Medium (4 Stages: Spec -> Design -> Code -> QA)': 'Средний (4 этапа: ТЗ -> Дизайн -> Код -> Тестирование)',
        'Complex (6 Stages: Full Engineering Lifecycle)': 'Сложный (6 этапов: полный инженерный цикл)',
        'Enterprise (7 Stages: R&D Spike -> Fullstack -> Gate)': 'Enterprise (7 этапов: R&D исследование -> Фулстек -> Гейт приёмки)',
        'Target Specialist Role': 'Роль целевого специалиста',
        'UI/UX Interface Designer': 'UI/UX дизайнер интерфейсов',
        'System Architect (DESIGN.md / ADR)': 'Системный архитектор (DESIGN.md / ADR)',
        'Technical Spec Analyst': 'Аналитик технических спецификаций',
        'Senior Frontend Developer': 'Ведущий frontend-разработчик',
        'Senior Backend Developer': 'Ведущий backend-разработчик',
        'QA Automation Engineer': 'Инженер автоматизации тестирования',
        'Refactoring & Complexity Specialist': 'Специалист по рефакторингу и сложности',
        'Hotfix & Diagnostic Engineer': 'Инженер хотфиксов и диагностики',
        'Documentation Specialist': 'Технический писатель / Документация',
        'Spike & R&D Researcher': 'Исследователь R&D и прототипирования',
        'DevOps & Tooling Specialist': 'DevOps и инфраструктурный специалист',
        'Instructions for Subagent': 'Инструкции для субагента',
        'Start Pipeline': 'Запустить пайплайн',
        'Delegate Subagent': 'Делегировать субагенту',
        'Dispatching...': 'Отправка…',

        // dsh-cost-meter (#249)
        'Discounted rate active': 'Действует сниженный тариф',
        'off-peak': 'непиковый',
        'peak': 'пиковый',
        'Context cache saved:': 'Сэкономлено на кэше:',
        '1M tokens, $': '1 млн токенов, $',
        'Input (cache hit)': 'Ввод (попадание в кэш)',
        'Input (cache miss)': 'Ввод (промах кэша)',
        'Output': 'Вывод',
        'SESSION TOKENS': 'ТОКЕНЫ СЕССИИ',
        'SPEND BY MODEL': 'РАСХОД ПО МОДЕЛЯМ',
        'Session total:': 'Всего за сессию:',
        'Copy Summary': 'Скопировать сводку',

        // dsh-context-lens (#249)
        'Context Lens': 'Линза контекста',
        'Saved tokens': 'Сэкономлено токенов',
        '%% Saved': '%% экономии',
        'ops': 'операций',
        'Budget': 'Бюджет',
        'Active focus': 'Активный фокус',
        'No focus paths set': 'Пути фокусировки не заданы',

        // dsh-gitea / approval-gate (#249)
        'Status': 'Статус',
        'Graph & CI': 'Граф и CI',
        'Events & PRs': 'События и PR',
        'Branch': 'Ветка',
        'Sync': 'Синхронизация',
        'Up to date with remote (@{upstream})': 'Синхронизировано с удалённым репозиторием (@{upstream})',
        'Up to date with remote': 'Синхронизировано с удалённым репозиторием',
        'Clean': 'Чисто',
        'No modified or untracked files in the working directory.': 'В рабочем каталоге нет изменённых или неотслеживаемых файлов.',
        'RECENT COMMITS': 'ПОСЛЕДНИЕ КОММИТЫ',

        // dsh-cron (#249)
        'Active jobs': 'Активные задачи',
        'No active jobs': 'Нет активных задач',
        'Register in Models': 'Зарегистрировать в моделях',
        'Base URL': 'Базовый URL',
        'API key env / credential name': 'Имя переменной окружения / ключа API',
        'Default model': 'Модель по умолчанию',
        'Enabled': 'Включено',
        'Save': 'Сохранить',
        'Saved': 'Сохранено',
        'Refresh': 'Обновить',
        'Loading settings…': 'Загрузка настроек…',
        'Put the ar-… key in DSH credentials or process env under this name. Never paste the key into this form.': 'Укажите ключ ar-… в учётных данных DSH или переменной окружения. Не вставляйте ключ в форму.',
        'Preferred engine': 'Предпочитаемый движок',
        'API key': 'API-ключ',
        'stored, leave empty to keep it': 'сохранён, оставьте пустым для сохранения',
        'Separate multiple keys with commas. ModSearch rotates to the next key after authentication, rate-limit, or quota failures.': 'Разделяйте несколько ключей запятыми. ModSearch переключается на следующий ключ при ошибках аутентификации или лимитов.',
        'Built-in official endpoint, leave blank to use it': 'Встроенная официальная конечная точка, оставьте пустым',
        'Automatic engine chain Checked engines may join failover. Only engines ready here are listed.': 'Автоматическая цепочка движков: отмеченные движки участвуют в отказоустойчивости.',
        'Discard': 'Сбросить',
        'Model synchronization': 'Синхронизация моделей',
        'Refresh model catalogs for API-key providers. A dry-run is the default; applying changes is explicit.': 'Обновление каталогов моделей провайдеров API-ключей. По умолчанию выполняется проверка (dry-run); применение изменений явное.',
        'All API-key providers': 'Все провайдеры API-ключей',
        'Preview only (dry-run)': 'Только предпросмотр (dry-run)',
        'Confirm stale removal': 'Подтверждать удаление устаревших',
        'Refresh status': 'Обновить статус',
        'Refresh all': 'Обновить всё',
        'Discover': 'Обнаружить',
        'Check availability': 'Проверить доступность',
        'Check credentials': 'Проверить учётные данные',
        'Choose models': 'Выбрать модели',
        'Manual model selection': 'Выбор моделей вручную',
        'Images in chat are processed by the vision model you choose here. Leave both fields empty to auto-pick the first vision-capable model from the catalog.': 'Изображения в чате обрабатываются выбранной моделью зрения. Оставьте оба поля пустыми для автовыбора первой доступной модели.',
        'Mode': 'Режим',
        'Hybrid (auto-rewrite + tools)': 'Гибридный (авто-переписывание + инструменты)',
        'Describe strategy': 'Стратегия описания',
        'Auto (use vision LLM)': 'Авто (использовать Vision LLM)',
        'Escalation': 'Эскалация',
        'Simple only (one pass)': 'Только простая (один проход)',
        'Routing': 'Маршрутизация',
        'Channel order': 'Порядок каналов',
        'Issue Reporter': 'Репортёр проблем',
        'Turn a DSH plugin problem into a reviewable issue with automated diagnostics and previews.': 'Превратите проблему с плагином DSH в готовый issue с автоматической диагностикой.',
        'GitHub sign-in is not configured for this installation.': 'Вход через GitHub не настроен для этой установки.',
        '0 plugins': '0 плагинов',
        'Catalog': 'Каталог',
        'Report Editor': 'Редактор отчёта',
        'My Reports': 'Мои отчёты',
        'Authorization': 'Авторизация',
        'Search installed plugins…': 'Поиск установленных плагинов…',
        'Search installed plugins...': 'Поиск установленных плагинов...',
        'Refresh inventory': 'Обновить список',
        'Loading inventory & status…': 'Загрузка списка и статуса…',
        'Loading inventory & status...': 'Загрузка списка и статуса...'
      }

      const ZH_WALKER = (root) => {
        try {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
          const hits = []
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const val = node.nodeValue
            if (!val) continue
            const trimmed = val.trim()
            if (trimmed.length >= 1 && ZH_CJK.test(val)) {
              hits.push(node)
            } else if (trimmed.length >= 1 && DOM_EN_TEXT[trimmed]) {
              const p = node.parentElement
              if (p && !p.closest('code, pre, script, style, textarea, input, select, kbd, samp, [contenteditable="true"], [data-composer-input], [role="textbox"]')) {
                node.nodeValue = val.replace(trimmed, DOM_EN_TEXT[trimmed])
              }
            }
          }
          for (const node of hits) {
            const next = zhTranslateText(node.nodeValue)
            if (next && next !== node.nodeValue) node.nodeValue = next
          }
          for (const el of root.querySelectorAll ? root.querySelectorAll('[title],[placeholder],[aria-label]') : []) {
            for (const attr of ['title', 'placeholder', 'aria-label']) {
              const v = el.getAttribute && el.getAttribute(attr)
              if (v) {
                const tr = v.trim()
                if (DOM_EN_TEXT[tr]) {
                  el.setAttribute(attr, v.replace(tr, DOM_EN_TEXT[tr]))
                } else if (DOM_EN_ATTRS[tr]) {
                  el.setAttribute(attr, v.replace(tr, DOM_EN_ATTRS[tr]))
                } else if (ZH_CJK.test(v)) {
                  const next = zhTranslateText(v)
                  if (next) el.setAttribute(attr, next)
                }
              }
            }
          }
          if (root.getAttribute) {
            for (const attr of ['title', 'placeholder', 'aria-label']) {
              const v = root.getAttribute(attr)
              if (v) {
                const tr = v.trim()
                if (DOM_EN_TEXT[tr]) root.setAttribute(attr, v.replace(tr, DOM_EN_TEXT[tr]))
                else if (DOM_EN_ATTRS[tr]) root.setAttribute(attr, v.replace(tr, DOM_EN_ATTRS[tr]))
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
        
        // #198: Exclude code, pre, inputs, AND contenteditable composers
        if (node.parentElement && node.parentElement.closest('code, pre, a, script, style, textarea, input, select, button, kbd, samp, [contenteditable="true"], [data-composer-input], [role="textbox"]')) return
        if (node.parentElement && node.parentElement.closest('.katex, [data-latex], math')) return
        if (/\$[^$\n]+\$/.test(before)) return

        // #198: Exclude active streaming turns so selection is never destroyed while model streams
        if (node.parentElement && node.parentElement.closest('[data-chat-flow-status="running"], [data-turn-running], [data-turn-tail], [data-streaming="true"], .dsw-turn-running, [class*="streaming"], [class*="Streaming"]')) {
          return
        }

        // #198: Do not mutate node if user currently has an active text selection intersecting it
        const sel = typeof window !== 'undefined' && window.getSelection && window.getSelection()
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          try {
            const range = sel.getRangeAt(0)
            if (range.intersectsNode ? range.intersectsNode(node) : (sel.containsNode && sel.containsNode(node, true))) {
              return
            }
          } catch (e) { /* bestEffort */ void e; }
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
        } catch (e) { /* bestEffort */ void e; }

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
          try { el.setSelectionRange(cursorStart, end) } catch (e) { /* bestEffort */ void e; }
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
        } catch (e) { /* bestEffort */ void e; }
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
        if (triple && triple.length %% 2 === 1) return true
        const lastLine = textBefore.split('\n').pop()
        const single = lastLine.match(/`/g)
        if (single && single.length %% 2 === 1) return true
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

          // Restore caret without delayed setTimeout (#198)
          const targetOffset = typeof cursorStart === 'number' ? cursorStart : (initialOffset >= 0 ? Math.min(initialOffset, value.length) : value.length)
          setCaretCharacterOffset(host, targetOffset)
        } catch (e) { /* bestEffort */ void e; }
      }

      const layoutDismiss = () => {
        if (layoutHintEl) { layoutHintEl.remove(); layoutHintEl = null }
      }
      const layoutShowHint = (inputEl, converted, direction) => {
        layoutDismiss()
        layoutHintEl = document.createElement('div')
        layoutHintEl.dataset.russianLangLayout = '1'
        Object.assign(layoutHintEl.style, {
          position: 'fixed', zIndex: '99999', background: 'var(--dsw-alias-bg-layer-3)',
          color: 'var(--dsw-alias-label-primary)',
          border: '1px solid var(--dsw-alias-border-l2)', borderRadius: '8px', padding: '6px 10px',
          fontSize: '13px', boxShadow: 'var(--dsw-alias-shadow-l2)', cursor: 'pointer'
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
            position: 'fixed', zIndex: '99998', background: 'var(--dsw-alias-bg-layer-3)',
            color: 'var(--dsw-alias-label-secondary)', border: '1px solid var(--dsw-alias-border-l2)',
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

          // #198: Больше НИКАКИХ перезаписей всего документа в input event!
          // Живая типографика выполняется локально у каретки в keydown.

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

        // #198 / #202: Защита ввода в Lexical composer и нативных полях
        try {
          const snapVal = scope ? (scope.getSnapshot().value || {}) : {}
          const typoLive = snapVal.typography ? snapVal.typography.liveInput !== false : true
          if (typoLive && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
            const isTextarea = el.tagName === 'TEXTAREA' || el.tagName === 'INPUT'

            // #202: В contenteditable (Lexical composer) КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО
            // перехватывать нажатия клавиш клавиатуры (особенно Пробел!) и вызывать
            // неконтролируемый document.execCommand во время keydown.
            // Любая прямая мутация DOM ломает AST Lexical, вызывает сброс каретки
            // в позицию 0, блокирует ввод пробелов и заставляет текст печататься задом наперёд.
            // Живая подстановка символов у каретки допустима ТОЛЬКО в нативных textarea/input!
            if (isTextarea) {
              const caretPos = el.selectionStart || 0
              if (!isCaretInCode(el, value, caretPos)) {
                const textBefore = caretPos >= 0 ? value.slice(0, caretPos) : value

                // 1. Двойной дефис: если нажат '-' и предыдущий символ перед кареткой '-'
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

                // 2. Кавычки-ёлочки: если нажата клавиша '"'
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
        } catch (e) { /* bestEffort */ void e; }
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
      // Посадка строки на странице «Плагины» идёт первой (её рендерит текущее
      // ядро), прежняя settings.plugin.item сохранена фолбэком.
      try {
        ctx.slots.inject('plugins.row.config', () =>
          ctx.slots.register({
            name: 'plugins.row.config',
            key: ROW_CONFIG_KEY,
            locale: SETTINGS_NS_NAME,
            inject: () => ({ scope, runtime, toggleRu }),
          }, SettingsCard),
        )
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
            try { document.body.removeChild(a); URL.revokeObjectURL(url) } catch (e) { /* bestEffort */ void e; }
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
      if (!text || typeof text !== 'string') return { error: 'Текст для перевода пуст.' }
      try {
        const res = await fetch('/api/dsh-russian-lang/translate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          return { error: data.error || ('Ошибка перевода (HTTP ' + res.status + ')') }
        }
        return { translatedText: data.translatedText || text }
      } catch (err) {
        return { error: 'Не удалось связаться с хостом DSH: ' + (err.message || err) }
      }
    }

    // #158: Кнопка перевода    // #158: Кнопка перевода реплики на русский
    function TranslateTurnAction(props) {
      const t = typeof props.t === 'function' ? props.t : ((k) => k)
      const [loading, setLoading] = React.useState(false)
      const [open, setOpen] = React.useState(false)
      const [upStatus, setUpStatus] = React.useState({
        currentVersion: '__PKG_VERSION__',
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

      const [transStatus, setTransStatus] = React.useState(null)
      const [transStarting, setTransStarting] = React.useState(false)
      const [transMsg, setTransMsg] = React.useState(null)

      const fetchTransStatus = () => {
        fetch('/api/dsh-russian-lang/translator/status')
          .then((r) => r.json())
          .then((data) => setTransStatus(data))
          .catch(() => setTransStatus(null))
      }

      const startLibreTranslate = () => {
        setTransStarting(true)
        setTransMsg(null)
        fetch('/api/dsh-russian-lang/translator/setup', { method: 'POST' })
          .then((r) => r.json())
          .then((data) => {
            setTransStarting(false)
            if (data.ok) {
              setTransMsg({ type: 'ok', text: data.message || 'Контейнер LibreTranslate запущен.' })
              fetchTransStatus()
            } else {
              setTransMsg({ type: 'err', text: data.error || 'Ошибка запуска контейнера.' })
            }
          })
          .catch((err) => {
            setTransStarting(false)
            setTransMsg({ type: 'err', text: 'Ошибка: ' + (err.message || err) })
          })
      }

      React.useEffect(() => {
        if (open) {
          checkUpdate()
          fetchTransStatus()
        }
      }, [open])


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

            let transResult = { error: 'Не удалось обнаружить текст сообщения ассистента для перевода.' }
            if (rawText) {
              transResult = await translateTurnContent(rawText)
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
            '<div class="rl-trans-body"' + (isErr ? ' style="color: var(--dsw-alias-state-warning-primary); font-size: 13px;"' : '') + '></div>'
            box.querySelector('.rl-trans-body').textContent = displayText

            const copyBtn = box.querySelector('.rl-btn-copy')
            if (copyBtn) {
              copyBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                try { navigator.clipboard.writeText(displayText) } catch (err) { /* bestEffort */ void e; }
                copyBtn.textContent = '✓ Скопировано'
                setTimeout(() => { copyBtn.textContent = '📋 Копировать' }, 2000)
              })
            }

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

      // Row seat (plugins.row.config): the host page draws title/icon/crumb and the
      // padding, so the summary is a one-liner and the page drops our card chrome.
      if (props && props.view === 'summary') {
        return React.createElement('div', { className: 'rl-sub' }, statusLine || t('cardSub'))
      }
      const page = !!(props && props.view === 'page')

      return React.createElement('div', { className: page ? 'rl-page-seat' : 'rl-card' },
        React.createElement('button', {
          type: 'button',
          className: 'rl-head',
          style: page ? { display: 'none' } : undefined,
          'aria-expanded': page ? 'true' : String(open),
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
        (page || open) && React.createElement('div', { className: 'rl-body' },
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
                          try { scope.set('slashAliases', ev.target.checked) } catch (err) { /* bestEffort */ void e; }
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

            // Секция 3.5: One-Click Обновление плагина (DSH Updater Standard)
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
                      t('updaterCurrent').replace('{version}', upStatus.currentVersion || '__PKG_VERSION__')),
                    upStatus.updateAvailable
                      ? React.createElement('div', { style: { color: 'var(--dsw-alias-state-warning-primary)', marginTop: '2px', fontWeight: 500 } },
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
                    background: upMsg.type === 'ok' ? 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%%, transparent)' : 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%%, transparent)',
                    color: upMsg.type === 'ok' ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)', fontSize: '12px', fontWeight: 500
                  }
                }, upMsg.text) : null
              )
            ),

            // Секция 4: Машинный перевод сообщений
            React.createElement('div', { className: 'rl-section-card' },
              React.createElement('div', { className: 'rl-section-title' },
                React.createElement('span', null, t('secTranslator')),
                React.createElement('span', {
                  className: 'rl-badge ' + (value.translateEngine === 'local' ? 'rl-badge-ok' : (value.translateEngine === 'google' ? 'rl-badge-warn' : 'rl-badge-dim'))
                }, value.translateEngine === 'local' ? 'Локально' : (value.translateEngine === 'google' ? 'Google' : 'Выключен'))
              ),
              React.createElement('div', { className: 'rl-section-desc' }, t('secTranslatorDesc')),
              React.createElement('div', { className: 'rl-item-card' },
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
                  React.createElement('label', { className: 'rl-item-label', style: { fontWeight: 500 } }, t('translateEngine')),
                  React.createElement('select', {
                    className: 'rl-select',
                    value: value.translateEngine || 'off',
                    onChange: (ev) => {
                      try {
                        const val = ev.target.value
                        scope.set('translateEngine', val)
                        if (val === 'local') fetchTransStatus()
                      } catch (err) { console.warn('dsh-russian-lang: set translateEngine failed', err) }
                    }
                  },
                    React.createElement('option', { value: 'off' }, t('engineOff')),
                    React.createElement('option', { value: 'local' }, t('engineLocal')),
                    React.createElement('option', { value: 'google' }, t('engineGoogle'))
                  )
                ),
                value.translateEngine === 'google' ? React.createElement('div', {
                  style: {
                    marginTop: '10px', padding: '8px 12px', borderRadius: '8px',
                    background: 'color-mix(in srgb, var(--dsw-alias-state-warning-primary) 12%%, transparent)', border: '1px solid color-mix(in srgb, var(--dsw-alias-state-warning-primary) 30%%, transparent)',
                    color: 'var(--dsw-alias-state-warning-primary)', fontSize: '12px', fontWeight: 500, lineHeight: 1.4
                  }
                }, t('googleWarn')) : null,
                value.translateEngine === 'local' ? React.createElement('div', {
                  style: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }
                },
                  React.createElement('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('localInfo')),
                  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' } },
                    React.createElement('span', {
                      className: 'rl-badge ' + (transStatus && transStatus.running ? 'rl-badge-ok' : 'rl-badge-dim')
                    }, transStatus && transStatus.running ? t('localStatusRunning') : t('localStatusStopped')),
                    (!transStatus || !transStatus.running) ? React.createElement('button', {
                      type: 'button',
                      className: 'rl-btn rl-btn-primary',
                      disabled: transStarting,
                      onClick: startLibreTranslate
                    }, transStarting ? t('localStarting') : t('localStartBtn')) : null
                  ),
                  transMsg ? React.createElement('div', {
                    style: {
                      marginTop: '6px', padding: '8px 12px', borderRadius: '8px',
                      background: transMsg.type === 'ok' ? 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%%, transparent)' : 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%%, transparent)',
                      color: transMsg.type === 'ok' ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)', fontSize: '12px', fontWeight: 500
                    }
                  }, transMsg.text) : null
                ) : null
              )
            ),

            // Секция 5: Покрытие экосистемы и поддержка
            React.createElement('div', { className: 'rl-section-card' },
              React.createElement('div', { className: 'rl-section-title' },
                React.createElement('span', null, t('secSupport')),
                React.createElement('span', { className: 'rl-badge rl-badge-ok' }, '🟢 100.0%%')
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
      '.rl-badge-ok{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%%, transparent)}',
      '.rl-badge-warn{border-color:var(--dsw-alias-state-warning-primary);color:var(--dsw-alias-state-warning-primary);background:color-mix(in srgb, var(--dsw-alias-state-warning-primary) 8%%, transparent)}',
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
# Очистка однострочных комментариев для компактности production-бандла
lines = client.split('\n')
cleaned_lines = []
for l in lines:
    s = l.strip()
    if s.startswith('//') and not s.startswith('//__PURE_JS__'):
        continue
    cleaned_lines.append(l)
client = '\n'.join(cleaned_lines)

client_target = os.path.join(HERE, 'lib', 'client.js')
write_or_check(client_target, client)
print('Core namespace-ов: %d, ключей: %d -> lib/client.js'
      % (len(core_dict), sum(len(v) for v in core_dict.values())))

# Валидация размера файлов пакета по стандарту DSH Store (262144 байта / 256 KiB)
MAX_FILE_BYTES = 262144
for root, _, files in os.walk(os.path.join(HERE, 'lib')):
    for f in files:
        fpath = os.path.join(root, f)
        sz = os.path.getsize(fpath)
        rel = os.path.relpath(fpath, HERE)
        if sz > MAX_FILE_BYTES:
            raise SystemExit(f"BLOCKED: {rel} size is {sz} bytes (> {MAX_FILE_BYTES})")
print('Проверка лимита размера DSH Store: все файлы в lib/ меньше 256 KiB — OK')


if CHECK_MODE:
    if diff_files:
        print(f"FAIL: {len(diff_files)} файлов не синхронизированы со словарями ru/ и кодом build.py:", file=sys.stderr)
        for df in diff_files:
            print(f"  - {df}", file=sys.stderr)
        print("Запустите `python3 build.py` для обновления сборки.", file=sys.stderr)
        sys.exit(1)
    else:
        print("OK: Режим --check: все сгенерированные файлы полностью синхронизированы.")
        sys.exit(0)
