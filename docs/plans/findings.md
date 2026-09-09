# Findings: Smart Russian UX Runtime & Architecture

## 1. React Controlled Textareas in DSH Composer
- Setting `el.value = ...` in React 18/19 controlled components gets discarded because React maintains an internal value tracker.
- Solution: Call `Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)`, update `_valueTracker.setValue(value)`, and dispatch bubbling `input` and `change` events.
- Guard with `isFormatting` boolean to avoid event recursion.

## 2. Slash Command Aliases
- When typing a command like `/цель`, typing Space or Enter should immediately trigger command expansion to `/goal `.
- Intercepting both `input` (for pasted or space-suffixed commands) and `keydown` (for Space and Enter) ensures seamless UX.

## 3. Turn Translation & Markdown Export
- Turn translation must protect fenced code blocks (` ```...``` `) and only translate prose.
- Localized Markdown export button in session header utilities provides a clear 1-click export of the active dialog.
