# Progress: Fix Smart Russian UX Runtime Features (Issue #162 -> Release v0.2.9)

## Current Status: In Progress (Verification & Release phase)
- [x] Issue #162 created in Gitea.
- [x] Worktree initialized at `/mnt/external/Project/DEV/dhsplugins/dsh-russian-lang/.worktrees/fix-smart-ux-runtime`.
- [x] Root causes investigated and resolved in `build.py`:
  - `setNativeInputValue`: uses prototype descriptor setter + `_valueTracker` + synthetic `input`/`change` events for React 18/19.
  - `layoutOnInput`: added live typography & slash command expansion with cursor preservation and recursion guard.
  - `layoutOnKeydown`: added Space & Enter slash command expansion and selection-aware Alt+T transliteration.
  - `SettingsCard`: added `agentPromptPreset` select, `liveInput` and `slashAliases` toggles, Alt+T shortcut hint.
  - `TranslateTurnAction`: real translation via API/fallback with code block protection, copy button, close button.
  - `ExportMarkdownButton`: registered in `conversation.session.header.utilities` as `📥 MD` button.
- [x] `python3 build.py` recompiled cleanly.
- [x] `npm test` passed 100%.
- [x] `package.json` bumped to `0.2.9`.
- [x] `CHANGELOG.md` and `README.md` updated.
