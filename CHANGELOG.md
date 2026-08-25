# Changelog

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
