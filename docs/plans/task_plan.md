# Task Plan: Issue #158 — Smart Russian UX Features

## Goal
Implement advanced productivity features for Russian-speaking DSH users:
1. **Live Input Typography & Shortcuts**: auto-replace `""` -> `«»`, `--` -> `—`, `...` -> `…`, non-breaking spaces after prepositions; input layout indicator (`RU`/`EN`); Russian slash-command aliases (`/цель` -> `/goal`, `/сжать` -> `/compact`, `/план` -> `/plan`, etc.); <kbd>Alt+T</kbd> transliteration.
2. **Agent Directives & Presets**: System prompt style presets in settings card («Технический эксперт», «Технический писатель», «Лаконичный режим») + "Translate turn to Russian" helper button on assistant message actions.
3. **Quick Language Switcher**: `RU ⇄ EN` toggle button in header utilities (`conversation.session.header.utilities`).
4. **Localized Session Export**: Markdown exporter with Russian dates, statuses, token metrics.
5. **DO NOT RELEASE / PUBLISH** until explicit user command.

## Phases
- [x] **Phase 0: Planning & Design Contract** — Created DESIGN.md, task_plan.md, findings.md, progress.md.
- [x] **Phase 1: Pure Logic Implementation in `lib/pure.js`** — Transliteration, live typography engine (ignoring code blocks), Russian slash-command parser, localized export formatter.
- [x] **Phase 2: Host Settings & System Prompt Extension in `lib/index.js`** — Expanded settings schema with prompt presets (`technical_expert`, `tech_writer`, `concise`), dynamic system prompt sections.
- [x] **Phase 3: Browser UI Components in `build.py` / `lib/client.js`** — Quick language switcher chip in header utilities, live typography and slash-command alias expansion in composer, assistant message translate action, settings card prompt preset selector.
- [x] **Phase 4: Unit Testing & Verification** — Added tests in `test/test_smart_ux.mjs` (all 93 checks passing), optimized banner image to 81K.
- [ ] **Phase 5: Commit & Quality Summary** — Conventional commit with `Refs: #158`, report to user without release.

## Next Step
Commit changes to `feat/158-smart-ux` with `git-antigravity` and summarize to user.
