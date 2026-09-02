#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Upstream Watchdog: сканер дельты обновлений словарей DSH и плагинов.

Сравнивает upstream/core-en.json и plugins-en.json с текущими ru/ и ru-plugins/.
Находит:
- Новые непереведённые ключи
- Устаревшие удалённые ключи
- Изменения в плейсхолдерах {placeholder}

Использование:
  python3 tools/upstream_watch.py               # отчёт в консоль
  python3 tools/upstream_watch.py --check       # код возврата 1 при наличии непереведённых
  python3 tools/upstream_watch.py --report queue.md # экспорт отчёта
"""
import argparse
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

PH_RE = re.compile(r'\{([a-zA-Z0-9_]+)\}')


def ph_set(s):
    return set(PH_RE.findall(s or ''))


def load_en():
    en = {}
    for name in ('upstream/core-en.json', 'plugins-en.json'):
        p = os.path.join(REPO, name)
        if os.path.exists(p):
            for ns, entries in json.load(open(p, encoding='utf-8')).items():
                en.setdefault(ns, {}).update(entries)
    return en


def load_ru():
    ru = {}
    for d in ('ru', 'ru-plugins'):
        for p in sorted(glob.glob(os.path.join(REPO, d, '*.json'))):
            for ns, entries in json.load(open(p, encoding='utf-8')).items():
                ru.setdefault(ns, {}).update(entries)
    mt_p = os.path.join(REPO, 'mt-registry.json')
    if os.path.exists(mt_p):
        mt = json.load(open(mt_p, encoding='utf-8'))
        for ns, entries in mt.items():
            for key, rec in entries.items():
                if key not in ru.get(ns, {}):
                    ru.setdefault(ns, {})[key] = rec.get('ru', '')
    return ru


def compute_delta(en_dict, ru_dict):
    """Анализирует расхождения между upstream (EN) и текущим переводом (RU)."""
    new_keys = []
    obsolete_keys = []
    ph_mismatches = []

    for ns, entries in en_dict.items():
        for key, en_text in entries.items():
            ru_text = ru_dict.get(ns, {}).get(key)
            if ru_text is None:
                new_keys.append((ns, key, en_text))
            else:
                if ph_set(en_text) != ph_set(ru_text):
                    ph_mismatches.append((ns, key, en_text, ru_text))

    for ns, entries in ru_dict.items():
        if ns == 'russian-lang':
            continue
        for key, ru_text in entries.items():
            if key not in en_dict.get(ns, {}):
                obsolete_keys.append((ns, key, ru_text))

    return {
        'new': new_keys,
        'obsolete': obsolete_keys,
        'ph_mismatches': ph_mismatches
    }


def generate_markdown_report(delta):
    lines = ['# Очередь ревью и дельта Upstream DSH', '']
    new_keys = delta['new']
    obsolete = delta['obsolete']
    ph_errs = delta['ph_mismatches']

    lines.append('## Сводка дельты')
    lines.append('- **Новых непереведённых ключей**: %d' % len(new_keys))
    lines.append('- **Устаревших ключей вне upstream**: %d' % len(obsolete))
    lines.append('- **Ошибок плейсхолдеров**: %d' % len(ph_errs))
    lines.append('')

    if new_keys:
        lines.append('### Новые ключи для перевода')
        lines.append('| Namespace | Ключ | Оригинал (EN) |')
        lines.append('|---|---|---|')
        for ns, key, en_text in new_keys:
            lines.append('| `%s` | `%s` | %s |' % (ns, key, en_text))
        lines.append('')

    if ph_errs:
        lines.append('### Ошибки соответствия {placeholder}')
        lines.append('| Namespace | Ключ | EN | RU |')
        lines.append('|---|---|---|---|')
        for ns, key, en_text, ru_text in ph_errs:
            lines.append('| `%s` | `%s` | `%s` | `%s` |' % (ns, key, en_text, ru_text))
        lines.append('')

    return '\n'.join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true', help='Выход с кодом 1 при наличии дельты')
    ap.add_argument('--report', default=None, help='Путь к markdown отчёту')
    args = ap.parse_args()

    en = load_en()
    ru = load_ru()
    delta = compute_delta(en, ru)

    print('=== UPSTREAM WATCHDOG ===')
    print('  Новых ключей: %d' % len(delta['new']))
    print('  Устаревших ключей: %d' % len(delta['obsolete']))
    print('  Ошибок плейсхолдеров: %d' % len(delta['ph_mismatches']))

    if args.report:
        rep = generate_markdown_report(delta)
        with open(args.report, 'w', encoding='utf-8') as f:
            f.write(rep)
        print('Отчёт сохранён в %s' % args.report)

    if args.check and (delta['new'] or delta['ph_mismatches']):
        print('ОШИБКА: обнаружены непереведённые ключи или битые плейсхолдеры!')
        sys.exit(1)


if __name__ == '__main__':
    main()