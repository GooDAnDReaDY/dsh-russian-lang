## 0.1.32 — 2026-09-03

Hotfix-релиз: восстановление работоспособности типографики «ё» и починка
контура качества, который эту поломку пропустил.

- fix(typography): восстановление «ё» не работало и содержало правило, портящее текст (issue #132). Два дефекта гасили друг друга. Первый: `YO_BLACKLIST` сверялся со словом, содержащим «ё», тогда как в списке лежало написание через «е» — условие не срабатывало никогда, и пара `все -> всё` уезжала в бандл вопреки списку, комментарию в коде, описанию в карточке настроек и юнит-тесту. Второй: пары якорились через `\b`, который в JavaScript определён по `\w` = `[A-Za-z0-9_]` и границы перед кириллицей не даёт — из 166 пар срабатывали ровно три (`еще`, `Еще`, `ЕЩЕ`), остальные были мёртвым кодом. Починка только якорей немедленно включила бы порчу текста, поэтому порядок исправления обратный: сначала блеклист. Блеклист расширен омографами (`все`, `всем`, `чем`, `нем`, `моем`, `берет`, `черт`, `черта`, `черту`, `чертов`) и мусором корпуса (`ето`, `пеп`, `хен`); `берет` убран и из ручного списка. Якорь заменён на lookaround по кириллице, регистр восстанавливается из совпадения — пара нужна одна на слово вместо трёх на регистр. В бандле 137 живых пар вместо 166 мёртвых.
- refactor(lib): чистая половина вынесена в `lib/pure.js` (issue #133). 1069 строк JavaScript жили внутри питоновского литерала в `build.py`: импортировать оттуда было нечего, и тесты держали собственные копии функций, расходившиеся с оригиналом молча. Теперь типографика, плюрализация, `fill`, склонения, поисковая морфология, humanizer, `makeIssueUrl` и детектор раскладки лежат в отдельном ES-модуле; `build.py` читает его, снимает `export` и вставляет в бандл, тесты импортируют напрямую. Один исходник на бандл и на тесты.
- test(qa): 12 тестов переведены с копий на импорт из `lib/pure.js` (issue #133). Мутационная проверка: шесть намеренных поломок (кавычки, пунктуация, nbsp, возврат сломанного `\b`, балл нечёткого поиска, порог распознавания раскладки, относительное время) роняют соответствующий тест — раньше не роняла ни одна. Из `test_card_yo.mjs` убрано тождественно истинное утверждение `!pairs.some(([e, y]) => e === 'все' && y === 'все')`, которое заявляло защиту от `все -> всё` и не проверяло ничего, и питоновское `%`-форматирование, дававшее `NaN` в тексте ошибки. Добавлены проверки на омографы, на живую границу слова, на регистр и на идемпотентность.
- ci: прогоняются все тесты и сверяется бандл (issue #134). CI гонял 5 файлов из 14 — фичи 0.1.29–0.1.31 уехали в релиз непроверенными. Теперь `node --test test/*.mjs`, python-тесты `test_extract`/`test_overflow`, линтер словарей и новый шаг `git diff --exit-code lib/client.js`: закоммиченный бандл обязан совпадать со сборкой, иначе `npm publish` уедет кодом, который не проходил ревью. Сборка перенесена в начало — тесты читают свежий артефакт.
- fix(build): бандл писался в текстовом режиме и на Windows получал CRLF (issue #137). Без `newline=` Python подставляет `os.linesep`, поэтому один исходник давал разные байты: 1096 CR под Windows против 0 под Linux. Дефект сделал бы сверку бандла из #134 нестабильной по платформе релизящего. Перевод строки зафиксирован явно здесь и в `tools/mt_autofill.py`.
- fix(i18n): MT-реестр получил статус вычитки, счётчики покрытия перестали врать (issue #135). В записях `mt-registry.json` не было поля `status`, вычитанная строка была неотличима от неглядя сгенерированной, и очередь ревью на 2173 строки не могла уменьшаться — прогресс некуда записать. Добавлено `status: draft | reviewed` (2170 записей размечены), `mt_fallback.py` не сбрасывает `reviewed`, очередь генерируется только из `draft`. `check-coverage.py` печатал «переведено: 2899 (ручных 2320 + MT 1802)» — слагаемые считались по своим источникам и пересекались; теперь раскладка непересекающаяся и сходится к итогу: ручных 1847, MT выверенных 0, MT без вычитки 1052, с предупреждением, что 36.3% интерфейса — черновой машинный перевод.
- fix(tools): `mt_autofill.py` требовал API-ключ раньше ветки первого запуска (issue #136). Базовый срез `upstream/plugins-snapshot.json` — производное локальное состояние (байт-в-байт дубль `plugins-en.json`), он уходит в `.gitignore` по согласованию с владельцем. В свежем клоне среза нет, а его создание перевода не требует — проверка ключа перенесена ниже, первый запуск теперь отрабатывает без `OPENROUTER_API_KEY`.
- fix(test): `test_extract.py` падал на Windows при уборке временного каталога. Причина не в уборке: тест делал `os.chdir` внутрь `TemporaryDirectory`, а Windows не удаляет каталог, который является текущим для процесса (`WinError 32`). CWD возвращается в `finally` до выхода из контекста.
- docs: README документировал несуществующие ключи конфигурации (issue #138). Пример `settings.yaml` обещал пространство `dsh-russian-lang` с подключами `typography.quotes/dashes/nbsp`, секцией `layoutFix` и `spellcheck` — ничего этого в схеме нет, а реальные `yo` и `agentPrompt` не были описаны. Блок приведён к схеме из `lib/index.js`. Заявка «100% покрытие ядра» дополнена честной оговоркой о доле машинного перевода со ссылкой на очередь вычитки.
- fix(ui): ссылка «сообщить о проблеме перевода» подставляла версию `0.1.29` в пакете 0.1.31 — строка была вписана руками. Версия берётся из `package.json` на сборке.

## 0.1.31 — 2026-09-02

- feat(search): Russian search morphology and fuzzy matching for command palette (PR #128, issue #124). Adds `stemRussian` Porter-like stemmer and `fuzzyMatchRu` with support for inflected word forms, exact substrings, and layout transliteration in command palette search (`Ctrl+K`) and slash menu (`/`).
- feat(errors): human-readable system and network error translator (PR #129, issue #125). Adds `humanizeError` translating Node.js POSIX (`ENOENT`, `EACCES`, `ECONNREFUSED`), HTTP (`401`, `403`, `404`, `429`, `500`), and API rate limit errors into friendly Russian explanations with actionable troubleshooting hints.
- feat(tools): upstream watchdog and delta detector for DSH core updates (PR #130, issue #126). Adds `tools/upstream_watch.py` for automatically detecting newly added upstream strings and generating translation review queues (`upstream/review-queue.md`).
- feat(tools): comprehensive dictionary linter and git pre-commit hook (PR #131, issue #127). Adds `tools/lint_translations.py` for static JSON validation, placeholder verification, and glossary compliance with `--install-hook` support.

## 0.1.30 — 2026-09-02

- feat(ui): report translation issue and request plugin translation via GitHub Issues (PR #120, issue #112). Adds `makeIssueUrl` helper and UI link in SettingsCard generating pre-filled GitHub issues for `GooDAnDReaDY/dsh-russian-lang`.
- feat(ui): plugin localization coverage inspector and badge status (PR #121, issue #107). Adds `getPluginLocalizationStatus(ns)` helper for checking dictionary coverage of installed plugins.
- feat(tools): export and import utilities for PO, XLIFF 1.2, and CSV formats (PR #122, issue #109). Adds `tools/export_i18n.py` and `tools/import_i18n.py` with placeholder validation.
- refactor(bundle): optimize dictionary payload serialization and client size (PR #123, issue #110). Compact JSON serialization reducing client bundle footprint.

## 0.1.29 — 2026-09-02

- feat(tools): formalize DSH glossary (`glossary.json`) and validate in CI (`tools/term_check.py --ci`) (PR #115, issue #108). Prevents calques and terminology divergence across 50+ namespaces.
- feat(i18n): format helpers for numbers, currencies, and relative time (PR #116, issue #106). Adds `formatNumber` (non-breaking thousand separator), `formatRelativeTime` (`Intl.RelativeTimeFormat`), `formatCurrency` in `ru-RU`, and extends `fill()` with format specifiers `{val:number}`, `{val:reltime}`, `{val:currency}`.
- feat(i18n): smart inflection engine for entity names and roles (PR #117, issue #104). Adds `inflect(phrase, case)` supporting `gen`, `dat`, `acc`, `ins`, `pre` Russian cases with safe fallback for Latin and acronyms.
- feat(typography): streaming typography and Chinese quote normalization (PR #118, issue #105). Normalizes Chinese quotes (`“”`, `『』`) into Russian guillemets (`«...»`), cleans up stray spaces before punctuation, and isolates LaTeX math ($...$) and code blocks.
- test(qa): UI text overflow and truncation detector (PR #119, issue #111). Adds `test/overflow.py` and `test/test_overflow.py` for automated inspection of UI elements (`scrollWidth > clientWidth`).

## 0.1.28 — 2026-09-02

- fix(settings): карточка настроек работает на DSH v0.1.2-alpha.2 (PR #100, #101, #113; issues #99, #97). Три слоя проблем: (1) `scope.set` в ядре теперь возвращает `Promise<void>` — ошибка приходит через promise rejection, старый `try/catch` её глотал; добавлены `.catch(...)` для promise-канала и внешний `try/catch` для sync. (2) Устаревший monkey-patch `runtime.host.getSnapshot/set` конфликтовал с новой settings-mirror и ломал запись namespace — удалён полностью. (3) Контракт slot-inject изменился: renderer вызывает `entry.inject()` и разворачивает результат прямо в props (`props.scope`/`props.runtime`/`props.toggleRu`), а не отдаёт `props.inject` — карточка читала устаревший формат и получала `scope === undefined`, из-за чего каждый клик падал «Cannot read properties of undefined (reading 'set')». Читаем новые props с фолбэком на старый контракт.
- feat(locale): русский для dsh-skill-hub и @michengai/dsh-skills-manager (PR #103; issue #102). Оба плагина регистрируют только `{zh, en}` — добавлены `ru-plugins/11-skill-hub.json` (~170 ключей) и `ru-plugins/12-skills-manager.json` (~170 ключей), перевод по их английским словарям, плейсхолдеры сохранены. Бандл: 51 namespace, 3700 ключей.
- feat(locale): DOM-перевод панелей в обход locale-ядра (PR #113; issue #102). Панель dsh-skill-hub выбирает словарь по `documentElement.lang` и понимает только en/zh — русский в неё не попадает никак. Добавлен третий DOM-проход (рядом со spellcheck/типографикой): при активном русском CJK-текстовые узлы и атрибуты title/placeholder/aria-label заменяются по карте ZH_RU (348 пар), собранной на сборке из zh-референсов плагинов (`zh-refs/*.json`) и нашего перевода тех же ключей; шаблонные пары («共 {count} 个技能») — через регексы, значения переносятся в ru-шаблон («Всего навыков: 56»). MutationObserver удерживает переведёнными перерендеры React; при уходе с русского наблюдатель отключается.

## 0.1.26 — 2026-08-31

- fix(client): pass lookup chain to core lookup for DSH 0.1.2 (PR #94, issue #93). The translate wrapper called `this.lookup(ns, key)` with two args; DSH 0.1.2 `lookup(ns, key, chain)` requires a third argument (the locale chain) and iterates it, so `chain === undefined` threw `chain is not iterable`. That crashed `timeLabel` → `SessionNodeItem` → the whole `sidebar.workspaces` slot, so the conversation list vanished with no mention of Russian. Now the wrapper asks the method's arity (`lookup.length`) and passes the chain only when the core expects it, taking it from the core's `fallbackChain` (else `[active]`). Old 2-arg cores keep working. Adds `test/test_lookup_chain.mjs`.

## 0.1.24 — 2026-08-30

- fix: 0.1.23 вышла БЕЗ обещанного словаря `dsh-kanban`. Локальный `main` и `main` на GitHub разошлись: правка канбана лежала только на GitHub, релизные коммиты 0.1.21–0.1.23 — только локально, и сборка 0.1.23 шла по локальной ветке (49 пространств, 3309 ключей). 0.1.24 собрана после слияния обеих линий: 50 пространств, 3530 ключей, `dsh-kanban` внутри.

## 0.1.23 — 2026-08-30

- feat: русский словарь для `dsh-kanban` (221 ключ, `ru-plugins/10-kanban.json`). Плагин доски перестал нести свой `ru`: встроенные локали ядра — английская и китайская, русский даёт этот пакет. Пространство убрано из `self-ru.json` — пока оно там стояло, сборка пропускала его как «плагин локализовался сам». Выкатывать раньше dsh-kanban 0.1.12.

## 0.1.22 — 2026-08-30

- fix(client): use real LocaleRuntime API (addLanguage/setLocale) for RU switch (PR #88). 0.1.21 was published from a stale local main and missed this fix; 0.1.22 is the corrected build.

## 0.1.21 — 2026-08-30

- fix(client): use real LocaleRuntime API (addLanguage/setLocale) for RU switch (PR #88). Old code wrote runtime.snapshot / called runtime.publish() — neither exists on DSH 0.1.2-alpha, so switching silently no-op'd. Now the native Language menu lists Русский and selecting it switches the UI.

## 0.1.20 — 2026-08-30

- fix(client): register settings card via slots.inject so the slot is declared (PR #87). Direct register threw "slot is not declared" on DSH 0.1.2-alpha and the card never rendered; 0.1.19 only guarded the error. Now matches dsh-context/dsh-key-rotation.

## 0.1.19 — 2026-08-30

- fix: self-ru(dsh-key-limits) — private plugin self-localizes, exclude from bundle (49 ns/3309), fixes prod Failed to load (#81 suppl.)
- fix(client): guard settings.plugin.item slot (hotfix #85) already in 0.1.18+main, keep in release

# Changelog

## 0.1.18 (2026-08-29) — hotfix

- `fix(client)`: drop the `@deepseek-ai/dsh-client-ui-primitives` require and
  use a pure SVG chevron. That module is not registered in the module table of
  the current DSH core, so requiring it aborted our plugin's loader entry and
  broke production. Our bundle now requires only `react`. (#81)

## 0.1.16 (2026-08-27)

- `feat(client)`: RU/EN layout indicator near the chat input; click converts
  the current text (Alt+L behaviour). (#66)
- `feat(client)`: layout fixer learns from accepted corrections — a
  per-session local dictionary reduces false positives. (#67)
- `feat(host)`: optional Russian agent system prompt
  (`russian-lang.agentPrompt`), exposed in the settings card. (#68)
- `feat(tools)`: auto-fill new plugin keys into the MT queue
  (`tools/mt_autofill.py`, daily cron). (#69)
- `fix(client)`: settings card uses the core chevron icon (with fallback).
- `fix(mt)`: corrected 39 placeholder mismatches in shipped translations.
- `ci`: build npm `.tgz` artifact for the isolated test server.

## 0.1.15 (2026-08-26)

- `fix(client)`: settings-card checkboxes update instantly. Typography and ё
  toggles were controlled by async host state, so React reverted every click;
  now they use optimistic local state and sync from the host afterwards. The
  Russian switch reacts to locale changes.
- `feat(client)`: descriptive captions for «Типографика вывода» and
  «Буква ё» in the settings card.

## 0.1.13 (2026-08-26)

- `feat(dict)`: translate dsh-spend (namespace `usageStats`, 129 keys) — now
  shipped in the bundle; self-ru scanner no longer misfires on `{zh,en}`-only
  registrations. (#55)
- `feat(build/CI)`: test/_repro.cjs exits non-zero on a broken bundle; MT
  registry placeholder gate + honest runtime coverage metric (100%). (#55)
- `fix(ci)`: offline runner — dropped setup-python, added term_check warning
  step. (#55)
- `fix(tools)`: upstream_check no longer pushes directly to main (commits to
  `upstream/snapshot` for a PR instead). (#55)
- `feat(client)`: settings card now shows the Alt+L layout-convert hint. (#55)
- `chore(ops)`: weekly `freq_refresh` cron added.

## 0.1.10 (2026-08-25)

- `feat(client)`: settings card. New «Русская локализация» card in
  Настройки → Плагины → Настройки плагинов: switch Russian on/off (goes
  through the runtime, no syncFlag fight), typography toggle, ё toggle,
  overrides count. Collapsed by default; form gated on the snapshot status;
  rl- prefixed styles on theme variables.
- `feat(build)`: corpus-derived ё dictionary. build.py generates е→ё pairs
  from the bundled frequency corpus (144 pairs + 22 curated); ambiguous
  «все» is blacklisted. typography.yo stays default-off.
- `feat(tools): term_check.py` — en→ru terminology consistency report across
  all namespaces (27 contextual divergences documented).
- `chore(dict)`: plugin dictionaries refreshed from the production profile
  (plugins-en.json 16 ns / 1815 keys); MT filled 102 new dsh-market keys,
  25 bad drafts rejected by the new placeholder validation.

## 0.1.9 (2026-08-25)

- `feat(tools)`: placeholder validation in MT apply. `mt_fallback.py --apply`
  retries translations whose `{placeholders}` diverge from the en original and
  drops persistent mismatches instead of shipping raw `{...}` into the UI.
  Provider is injectable for tests. (#45)
- `feat(tools): self-ru namespace autodetection`. New
  `tools/self_ru_scan.py <profile>` writes `self-ru.json`; build.py prefers it
  over the hardcoded list, so new self-localizing plugins stop crashing the
  loader. (#45)
- `feat(tools): freq_refresh`. `tools/freq_refresh.py` downloads a fresh
  Russian frequency list and re-merges DSH domain words in one command. (#45)
- `test: full coverage for the tooling`. mt_fallback (PH rejection, retry,
  incremental registry), merge_freq (word extraction, stop-list),
  self_ru_scan (quote styles), freq_refresh (filter), upstream_check
  (diff/report). (#45)
- `ci: Gitea Actions workflow` — node tests, tool tests, build+syntax,
  coverage gate and a de-identification grep on every PR. (#45)
- `fix(tools)`: upstream_check/systemd installer no longer hardcode machine
  paths — configuration moved to environment variables.

## 0.1.8 (2026-08-25)

- `fix(plugin)`: complete the self-ru exclusion list. 0.1.7 missed
  `dsh-gitea`, `dsh-key-rotation` and `dsh-vision-bridge`, which also
  register their own ru locale; the loader still failed with «locale
  namespace X already has locale ru». All 14 self-ru namespaces are now
  excluded at build time; bundle 41→38 namespaces / 1878→1761 strings.

## 0.1.7 (2026-08-25)

- `fix(plugin)`: skip namespaces that plugins already localize to ru. 0.1.6
  added ru for namespaces the plugins themselves register as ru
  (dsh-messenger-gateway, dsh-spendmeter, task-board, settings.commandcode,
  pin, dsh-context, context-doctor, settings.ollama-cloud, plugin-store,
  usageStats, usageDashboard), which made the loader fail with
  «locale namespace X already has locale ru». Excluded at build time; bundle
  shrinks 52→41 namespaces / 2795→1878 strings.

## 0.1.6 (2026-08-25)

- `feat(tools): translate top plugins via MT`. `tools/mt_fallback.py` fills
  untranslated plugin keys through OpenRouter (deepseek/deepseek-chat) into
  `mt-registry.json`, now written incrementally so long runs survive
  interruption. 1086 keys across 16 plugin namespaces added; bundle grows
  39→52 namespaces / 1709→2795 strings. Full manual-review queue in
  `upstream/review-queue.md`; a manual translation in `ru-plugins/*.json`
  always wins over the machine one. (#3)
- `feat(tools): domain dictionary for wrong-layout detector`. New
  `tools/merge_freq.py` merges DSH vocabulary from the plugin's own
  translations into the layout-fix frequency list (8000→9181 words), so the
  detector recognises terms like «рабочая сессия». (#6)
- `test(smoke): probe feature surfaces`. Smoke reports runtime presence of
  the language/spellcheck/typography surfaces as probes. (#5)
- `fix(plugin)`: two placeholder bugs in context-doctor (`cd.updated` lost
  `{when}`, `cd.suggestions` had a stray `{n}`); surfaced once the plugin
  baseline `plugins-en.json` was committed.

## 0.1.5 (2026-08-25)

- `feat(tools): nightly upstream drift check`. `tools/upstream_check.py`
  installs the latest `@deepseek-ai/dsh`, harvests the en locale surface,
  diffs against a committed snapshot and opens/updates a `chore(upstream):`
  Gitea issue on drift. Installed as a daily cron job. (#18)
- `feat(tools): MT-fallback with review queue`. `tools/mt_fallback.py` fills
  untranslated keys via a cheap OpenRouter model into `mt-registry.json`;
  `build.py` merges those strings as ordinary keys (manual ru translation
  wins) and `--review` writes `upstream/review-queue.md`. (#22)
- `feat(tools): top-100 plugin coverage report`. `tools/top100.py` scans a
  profile's node_modules, harvests plugin locale surfaces and writes
  `docs/top.md`. (#21)
- `feat(client): wrong-layout input hint and Alt+L converter`. Detects latin
  typed instead of Cyrillic (bundled 8k Russian frequency list), shows a
  hint bar; click replaces. Cyrillic→Latin only for slash-command input.
  Alt+L converts the current input in place. (#25)

## 0.1.4 (2026-08-25)

- `feat(client): browser spellcheck on text fields`. While Russian is active,
  textareas and text/search inputs get `spellcheck=true` + `lang=ru-RU`;
  monospace fields (code, commands) are excluded, originals restored on
  language switch. (#24)
- `feat(client): plural forms for bare count keys`. The translate wrapper now
  resolves `X.one` / `X.few` / `X.many` for keys called as `t('X', {n})`
  without the core's `.one/.other` suffix; dictionaries gain correct forms for
  the context-doctor counters and workspace search hint. (#17)
- `feat(client): Russian typography pass`. Idempotent text-node post-processor:
  guillemets, em dash, non-breaking spaces after short function words;
  optional ё restoration (`russian-lang.typography.yo`, default off). Code,
  links and inputs are never touched. (#19)
- `chore(check)`: `X.few` / `X.many` are treated as intentional when the bare
  base key exists in en. (#17)

## 0.1.3 (2026-08-25)

- `feat(client): Russian plural forms (few/many)`. Wraps `runtime.translate` to
  resolve Russian plural forms (one/few/many) for keys ending in `.one`/`.other`,
  and adds `few`/`many` keys for all 7 plural pairs in the core.
- `feat(client): user-defined translation overrides`. New `russian-lang.overrides`
  settings namespace (`{ key: wording }`) applied as the top layer in translate.
- `feat(check): flag lost placeholders`. `check-coverage.py` fails on ru
  translations that drop or add `{placeholders}`; `X.few`/`X.many` are treated as
  intentional Russian plural forms.
- `feat(client): use ru-RU as the document locale`. `<html lang>` is now `ru-RU`
  (BCP 47); `Intl.PluralRules('ru-RU')`.

## 0.1.2 (2026-08-23)

- `fix(client): register html-lang subscriber synchronously`. The previous
  `ctx.effect(() => runtime.subscribe(syncLang))` deferred subscriber registration
  until after the first `publish()` from the boot path, so `<html lang>` never
  picked up the ru value on a fresh boot. Registered inline; the disposer is
  still attached through a `ctx.effect` so it tears down with the plugin.

## 0.1.1

- Initial public release. 30 DSH core namespaces (722 keys, 100% coverage) plus 9
  plugin namespaces (962 keys). Adds `Русский` as the third option in the native
  Settings - General - Language menu on unpatched cores. Persisted through the
  plugin-owned `russian-lang` settings namespace.
