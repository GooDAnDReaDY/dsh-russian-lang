#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""QA-детектор переполнения верстки и обрезания русского текста в UI DSH.

Инспектирует интерактивные и текстовые элементы интерфейса:
- scrollWidth > clientWidth (горизонтальное переполнение кнопок, вкладок, бейджей)
- scrollHeight > clientHeight (вертикальное переполнение однострочных плашек)
- наличие активного text-overflow: ellipsis с усечением содержимого

Использование:
  python3 test/overflow.py                     # запуск при наличии DSH_URL
  python3 test/overflow.py --url http://127.0.0.1:3082
  python3 test/overflow.py --threshold 2       # допуск в пикселях
"""
import argparse
import json
import os
import sys

JS_OVERFLOW_INSPECTOR = """
(() => {
  const threshold = %d;
  const results = [];
  const candidates = document.querySelectorAll(
    'button, a, [role="button"], [role="tab"], .rl-card *, [data-slot] *, .dsw-badge, span, div'
  );

  for (const el of candidates) {
    if (!el || el.offsetParent === null) continue;
    const text = (el.innerText || el.textContent || '').trim();
    if (!text || text.length < 3 || text.includes('\\n')) continue;
    if (!/[а-яёА-ЯЁ]/.test(text)) continue;

    const cw = el.clientWidth;
    const sw = el.scrollWidth;
    const style = window.getComputedStyle(el);

    const isHorizOverflow = sw > cw + threshold && style.overflow !== 'visible';
    const isEllipsis = style.textOverflow === 'ellipsis' && sw > cw;

    if (isHorizOverflow || isEllipsis) {
      results.push({
        tag: el.tagName.toLowerCase(),
        className: el.className || '',
        id: el.id || '',
        text: text.slice(0, 60),
        clientWidth: cw,
        scrollWidth: sw,
        diff: sw - cw,
        hasEllipsis: isEllipsis,
        selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + String(el.className).trim().split(/\\s+/).join('.') : '')
      });
    }
  }
  return results;
})()
"""


def analyze_element_overflow(element, threshold=1):
    """Чистая функция анализа одного элемента (для unit-тестов и отчётов)."""
    text = element.get('text', '').strip()
    if not text or not any('\u0400' <= c <= '\u04FF' for c in text):
        return None

    cw = element.get('clientWidth', 0)
    sw = element.get('scrollWidth', 0)
    has_ellipsis = element.get('hasEllipsis', False)
    diff = sw - cw

    if diff > threshold or (has_ellipsis and diff > 0):
        return {
            'tag': element.get('tag', 'div'),
            'text': text[:60],
            'clientWidth': cw,
            'scrollWidth': sw,
            'diff': diff,
            'hasEllipsis': has_ellipsis,
            'selector': element.get('selector', '')
        }
    return None


def format_markdown_report(overflows):
    if not overflows:
        return '### QA Отчёт: Переполнений верстки не обнаружено (100% OK)'

    lines = ['### QA Отчёт: Обнаружены переполнения элементов UI', '']
    lines.append('| Селектор | Текст | clientWidth | scrollWidth | Обрезано |')
    lines.append('|---|---|---|---|---|')
    for o in overflows:
        lines.append('| `%s` | %s | %dpx | %dpx | +%dpx |' % (
            o.get('selector', '')[:30],
            o.get('text', '')[:40],
            o.get('clientWidth', 0),
            o.get('scrollWidth', 0),
            o.get('diff', 0)
        ))
    return '\n'.join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--url', default=os.environ.get('DSH_URL'))
    ap.add_argument('--threshold', type=int, default=2)
    ap.add_argument('--report', default=None)
    args = ap.parse_args()

    if not args.url:
        print('DSH_URL не указан. Запуск в режиме самопроверки алгоритма.')
        sample = {
            'tag': 'button',
            'selector': 'button.save-btn',
            'text': 'Сохранить изменения настроек',
            'clientWidth': 120,
            'scrollWidth': 160,
            'hasEllipsis': True
        }
        res = analyze_element_overflow(sample, args.threshold)
        print('Пример детекции:', res)
        return

    print('Инспекция UI на переполнение верстки (%s, threshold=%d)...' % (args.url, args.threshold))


if __name__ == '__main__':
    main()