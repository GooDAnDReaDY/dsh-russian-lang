# Findings: Issue #158 — Smart Russian UX Features

## Architectural Insights
1. **DSH Slots**:
   - `conversation.session.header.utilities`: Available in DSH sessions. Used by `dsh-cost-meter`, `dsh-kanban`, `dsh-context-lens`. Ideal for the `RU ⇄ EN` quick language switch chip.
   - `conversation.input.right`: Used by `dsh-subscriptions`, `dsh-voice`. Ideal for input layout indicator (`RU` / `EN`).
   - `conversation.chat.assistant-actions`: Slot for adding custom buttons to message toolbars.
2. **Pure Logic Separation (`lib/pure.js`)**:
   - Pure functions can be tested directly with Node `--test` and bundled automatically by `build.py` into `lib/client.js`.
   - Must avoid DOM and browser globals in `lib/pure.js`.
3. **Typography & Code Blocks**:
   - Quotes and dashes must not replace text inside backticks (`...` or ```...```) to avoid corrupting code or markdown syntax.
4. **Cordis System Prompt Injection**:
   - `prompt.section({ name: 'dsh-russian-lang-agent-prompt', order: 1000, text: ... })` is the canonical DSH mechanism for host system prompts.
