import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientJsPath = path.resolve(__dirname, '../lib/client.js');

test('lib/client.js не содержит захардкоженных hex/rgba цветов вне var() фолбэков (#233)', () => {
  const content = fs.readFileSync(clientJsPath, 'utf8');

  // Убираем комментарии
  let clean = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');

  // Исключаем var(--token, fallback)
  // Регулярка для var(--..., ...)
  clean = clean.replace(/var\(--[a-zA-Z0-9_-]+(?:,\s*[^)]+)?\)/g, '__VAR__');

  // Ищем hex цвета (#fff, #16a34a и т.д.)
  const hexMatches = clean.match(/#[0-9a-fA-F]{3,8}\b/g) || [];

  // Ищем rgba? цвета
  const rgbaMatches = clean.match(/rgba?\([^)]+\)/g) || [];

  const totalViolations = hexMatches.length + rgbaMatches.length;
  assert.equal(
    totalViolations,
    0,
    `Обнаружены захардкоженные цвета в lib/client.js вне var():\nHex (${hexMatches.length}): ${hexMatches.join(', ')}\nRGBA (${rgbaMatches.length}): ${rgbaMatches.join(', ')}`
  );
});
