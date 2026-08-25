# Changelog

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
