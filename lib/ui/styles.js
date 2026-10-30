/**
 * CSS-стили для UI-компонентов dsh-russian-lang.
 * Модуль декомпозирован в рамках #533.
 */

export const INSPECTOR_STYLES = `
.rl-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.rl-modal-box {
  background: var(--dsw-alias-bg-layer-2, #1e1e24);
  color: var(--dsw-alias-label-primary, #ffffff);
  border: 1px solid var(--dsw-alias-border-l1, #33333e);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: system-ui, -apple-system, sans-serif;
  box-sizing: border-box;
}

.rl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--dsw-alias-border-l1, #444);
  background: var(--dsw-alias-bg-layer-3, #2a2a34);
  color: var(--dsw-alias-label-primary, #fff);
  transition: all 0.15s ease;
}

.rl-btn:hover {
  background: var(--dsw-alias-bg-layer-4, #353542);
}

.rl-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rl-btn-primary {
  background: var(--dsw-alias-brand-primary, #6366f1);
  border-color: var(--dsw-alias-brand-primary, #6366f1);
  color: #fff;
}

.rl-btn-primary:hover {
  filter: brightness(1.1);
}
`

export const QUICK_SWITCH_STYLES = `
.rl-quick-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: var(--dsw-alias-bg-layer-2, #24242e);
  color: var(--dsw-alias-label-primary, #e2e8f0);
  border: 1px solid var(--dsw-alias-border-l1, #3b3b4f);
  user-select: none;
  transition: all 0.2s ease;
}

.rl-quick-switch:hover {
  border-color: #6366f1;
  background: var(--dsw-alias-bg-layer-3, #2d2d3a);
}

.rl-quick-switch-active {
  background: rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
  color: #818cf8;
}
`

export const STATUS_TABLE_STYLES = `
.rl-status-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-family: inherit;
}

.rl-status-table th {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, #333);
  color: var(--dsw-alias-label-secondary, #94a3b8);
  font-weight: 500;
}

.rl-status-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, #262626);
}

.rl-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
`
