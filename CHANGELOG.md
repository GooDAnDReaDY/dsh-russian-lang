# Changelog

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
