import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientJsPath = path.resolve(__dirname, '../lib/client.js');
const templateJsPath = path.resolve(__dirname, '../lib/client.template.js');

// Canonical list of --dsw-* tokens extracted from @deepseek-ai/dsh-web-frontend
const CANONICAL_CORE_TOKENS = new Set([
  "--dsw-alias-bg-base",
  "--dsw-alias-bg-layer-1",
  "--dsw-alias-bg-layer-2",
  "--dsw-alias-bg-layer-3",
  "--dsw-alias-bg-layer-4",
  "--dsw-alias-bg-mask-1",
  "--dsw-alias-bg-module-platform",
  "--dsw-alias-border-l1",
  "--dsw-alias-border-l2",
  "--dsw-alias-border-l2-darkmode-thin",
  "--dsw-alias-border-l3",
  "--dsw-alias-border-l4",
  "--dsw-alias-brand-primary",
  "--dsw-alias-brand-primary-new-colorprimary-new-color",
  "--dsw-alias-button-ghost-active-border",
  "--dsw-alias-button-ghost-active-fill",
  "--dsw-alias-button-primary-fill",
  "--dsw-alias-button-primary-hover",
  "--dsw-alias-button-tool-bar-fill",
  "--dsw-alias-button-tool-bar-hover",
  "--dsw-alias-code-diff-added",
  "--dsw-alias-code-diff-deleted",
  "--dsw-alias-interactive-bg-active",
  "--dsw-alias-interactive-bg-hover",
  "--dsw-alias-interactive-bg-hover-danger",
  "--dsw-alias-label-caption",
  "--dsw-alias-label-dimmed",
  "--dsw-alias-label-error",
  "--dsw-alias-label-primary",
  "--dsw-alias-label-primary-foreground",
  "--dsw-alias-label-primary-inverted",
  "--dsw-alias-label-secondary",
  "--dsw-alias-label-shimmer",
  "--dsw-alias-label-tertiary",
  "--dsw-alias-link",
  "--dsw-alias-markdown-code-block",
  "--dsw-alias-markdown-code-block-banner",
  "--dsw-alias-markdown-inline-code",
  "--dsw-alias-markdown-tag",
  "--dsw-alias-menu-group-header-fill",
  "--dsw-alias-menu-icon",
  "--dsw-alias-scrollbar-bg-l2",
  "--dsw-alias-scrollbar-hover-l2",
  "--dsw-alias-state-business-primary",
  "--dsw-alias-state-error-primary",
  "--dsw-alias-state-error-secondary",
  "--dsw-alias-state-idle-primary",
  "--dsw-alias-state-success-primary",
  "--dsw-alias-state-success-secondary",
  "--dsw-alias-state-success-tertiary",
  "--dsw-alias-state-warn-label",
  "--dsw-alias-state-warn-primary",
  "--dsw-alias-state-warn-secondary",
  "--dsw-alias-state-warn-tertiary",
  "--dsw-alias-switch-thumb",
  "--dsw-alias-toast-bg",
  "--dsw-alias-toast-label",
  "--dsw-alias-tooltip-bg",
  "--dsw-alias-tooltip-key-bg",
  "--dsw-elevation-panel",
  "--dsw-elevation-prominent",
  "--dsw-elevation-soft",
  "--dsw-elevation-stroke-color",
  "--dsw-focus-ring-color",
  "--dsw-focus-ring-width",
  "--dsw-font-family",
  "--dsw-font-markdown-base",
  "--dsw-font-markdown-base-strong",
  "--dsw-font-markdown-code",
  "--dsw-font-markdown-code-block",
  "--dsw-font-markdown-code-font-family",
  "--dsw-font-markdown-h1",
  "--dsw-font-markdown-h2",
  "--dsw-font-markdown-h3",
  "--dsw-font-markdown-h4",
  "--dsw-font-markdown-table",
  "--dsw-font-markdown-table-head",
  "--dsw-font-xs-13",
  "--dsw-hovercard-bg",
  "--dsw-mask-blur",
  "--dsw-menu-backdrop-filter",
  "--dsw-menu-surface-fill",
  "--dsw-radius-lg",
  "--dsw-radius-md",
  "--dsw-radius-panel",
  "--dsw-radius-sm",
  "--dsw-radius-xs",
  "--dsw-shadow-lv3",
  "--dsw-specific-input-major",
  "--dsw-specific-menu",
  "--dsw-static-amber-400",
  "--dsw-static-amber-500",
  "--dsw-static-blue-400",
  "--dsw-static-blue-500",
  "--dsw-static-blue-600",
  "--dsw-static-deepseek-400",
  "--dsw-static-deepseek-450",
  "--dsw-static-deepseek-500",
  "--dsw-static-green-500",
  "--dsw-static-neutral-00",
  "--dsw-static-neutral-400",
  "--dsw-static-neutral-bluish-00",
  "--dsw-static-neutral-bluish-300",
  "--dsw-static-red-600"
]);

const regex = /--dsw-[a-zA-Z0-9-]+/g;

test('lib/client.js не содержит несуществующих CSS-токенов темы ядра (#490)', () => {
  const content = fs.readFileSync(clientJsPath, 'utf8');
  const tokens = new Set(content.match(regex) || []);
  const invalid = [];

  for (const t of tokens) {
    if (!CANONICAL_CORE_TOKENS.has(t)) {
      invalid.push(t);
    }
  }

  assert.deepEqual(
    invalid,
    [],
    `Обнаружены несуществующие (ghost) токены в lib/client.js: ${invalid.join(', ')}`
  );
});

test('lib/client.template.js не содержит несуществующих CSS-токенов темы ядра (#490)', () => {
  const content = fs.readFileSync(templateJsPath, 'utf8');
  const tokens = new Set(content.match(regex) || []);
  const invalid = [];

  for (const t of tokens) {
    if (!CANONICAL_CORE_TOKENS.has(t)) {
      invalid.push(t);
    }
  }

  assert.deepEqual(
    invalid,
    [],
    `Обнаружены несуществующие (ghost) токены в lib/client.template.js: ${invalid.join(', ')}`
  );
});
