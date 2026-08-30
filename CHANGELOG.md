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
