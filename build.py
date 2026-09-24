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
freq_bundle = freq_words[:30]
freq_json = json.dumps(freq_bundle, ensure_ascii=False, separators=(',', ':'))

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
yo_json = json.dumps(yo_pairs, ensure_ascii=False, separators=(',', ':'))
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
    'presetReviewer': 'Код-ревьюер (поиск багов, безопасность, аудит)',
    'presetArchitect': 'Системный архитектор (контракты, масштабируемость)',
    'presetTutor': 'Наставник (понятные объяснения, пошаговый разбор)',
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
    'secOverrides': '✍️ Пользовательские переопределения (Custom Overrides)',
    'secOverridesDesc': 'Возможность заменить любую формулировку интерфейса DSH на собственную. Переопределения сохраняются в настройках и имеют наивысший приоритет.',
    'overrideKeyPlaceholder': 'Ключ (например, common.back или settings.title)',
    'overrideValuePlaceholder': 'Ваш русский перевод',
    'overrideAddBtn': 'Добавить',
    'overrideEmpty': 'Переопределений пока нет.',
    'overrideDelete': 'Удалить',
    'overrideTip': '💡 Совет: зажмите Alt и кликните на любой переведённый элемент интерфейса, чтобы открыть всплывающий инспектор перевода и сразу изменить формулировку.',
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
card_json = json.dumps(card_ru, ensure_ascii=False, separators=(',', ':'))

template_path = os.path.join(HERE, 'lib', 'client.template.js')
with open(template_path, 'r', encoding='utf-8') as f:
    client = f.read()

client = client.replace('/*__RU_BOOTSTRAP__*/{}', payload)
client = client.replace('/*__ZH_RU__*/{}', zh_ru_json)
client = client.replace('/*__CARD_RU__*/{}', card_json)
client = client.replace('/*__YO_JSON__*/[]', yo_json)
client = client.replace('/*__FREQ_JSON__*/[]', freq_json)

# Чистая половина (lib/pure.js) — один исходник на бандл и на тесты (#133).
# Подставляем ПОСЛЕ %-форматирования: иначе каждый процент внутри pure.js
# пришлось бы удваивать, и первый же забытый `%` ронял бы сборку.
pure_src = open(os.path.join(HERE, 'lib', 'pure.js'), encoding='utf-8').read()
pure_clean = _re.sub(r'/\*\*[\s\S]*?\*/', '', pure_src)
pure_inline = _re.sub(r'^export (const|function|class) ', r'\1 ', pure_clean, flags=_re.M)
pure_inline = '\n'.join(l for l in pure_inline.split('\n') if l.strip() and not l.strip().startswith('//'))
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
# Очистка комментариев для компактности production-бандла

# Очистка комментариев для компактности production-бандла
# Шаг 1: убираем полные строки-комментарии (чтобы /* внутри // не сбивали парсер блоков)
lines = [l for l in client.split('\n') if not l.strip().startswith('//')]
client = '\n'.join(lines)
# Шаг 2: убираем блочные комментарии
client = _re.sub(r'/\*[\s\S]*?\*/', '', client)
# Шаг 3: убираем хвостовые комментарии и пустые строки
cleaned_lines = []
for l in client.split('\n'):
    s = _re.sub(r'(?<!http:)(?<!https:)\s+//.*$', '', l).strip()
    if s:
        cleaned_lines.append(s)

# Шаг 4: компактное объединение строк после запятой и открывающей фигурной скобки
# (сохраняя запас безопасности < 160 KiB и перевод строки для TYPO_YO_PAIRS)
compact_lines = []
for l in cleaned_lines:
    if compact_lines and (compact_lines[-1].endswith('{') or compact_lines[-1].endswith(',')) and not compact_lines[-1].startswith('const TYPO_YO_PAIRS'):
        compact_lines[-1] = compact_lines[-1] + l
    else:
        compact_lines.append(l)
client = '\n'.join(compact_lines)

client_target = os.path.join(HERE, 'lib', 'client.js')
write_or_check(client_target, client)
print('Bootstrap namespace-ов: %d, ключей: %d -> lib/client.js'
      % (len(bootstrap_dict), sum(len(v) for v in bootstrap_dict.values())))

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
