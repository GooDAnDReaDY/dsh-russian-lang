# Task Plan: Fix Smart Russian UX Runtime Features (Issue #162 -> Release v0.2.9)

## 1. Goal
Fix all 6 non-working features reported by user during v0.2.8 testing, verify 100% on MiniPC test server, and release v0.2.9.

## 2. Issues to Fix
- [x] Item 2: Live typography in input composer (React controlled textarea descriptor setter + event dispatch)
- [x] Item 3: Russian slash command aliases (/цель -> /goal) on Space & Enter
- [x] Item 4: Alt+T phonetic transliteration in input composer
- [x] Item 5: System prompt presets dropdown & missing toggles in SettingsCard
- [x] Item 6: Turn Translate action (RU ↗) with real translation, code preservation, and inline card
- [x] Item 7: Localized Markdown export button (📥 MD) in session header utilities

## 3. Execution Steps
1. [x] Research root causes in DSH web client architecture.
2. [x] Implement fixes in `build.py` and compile `lib/client.js`.
3. [x] Verify unit tests (`npm test` & `test_smart_ux.mjs`).
4. [x] Bump version to `0.2.9`, update CHANGELOG and docs.
5. [ ] Package tarball (`npm pack`) and validate on MiniPC test environment (`192.168.1.123`).
6. [ ] Commit, push branch `fix/smart-ux-runtime`, create PR in Gitea for Issue #162, merge into `main`.
7. [ ] Tag `v0.2.9`, publish to npm (`--access public`), sync GitHub mirror and create release.
8. [ ] Deploy to production profile on MiniAI (`192.168.1.111`).
9. [ ] Close Issue #162 and report results to user.
