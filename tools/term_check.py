#!/usr/bin/env python3
"""Консистентность терминологии: один en-термин — один ru-перевод.

Собирает обратный индекс en-строка -> [(ns, key, ru)] по всем словарям
(core-en/plugins-en против ru/ru-plugins) и печатает группы, где одинаковый
en-текст переведён по-разному. Расхождения с разными {placeholders} или
разным регистром целиком не считаются конфликтом.

Использование:
    python3 tools/term_check.py            # отчёт в stdout
    python3 tools/term_check.py --strict   # только точные совпадения en (без учёта регистра)
"""
import argparse
import collections
import glob
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)


def load_merged(dirs):
    out = {}
    for d in dirs:
        for path in sorted(glob.glob(os.path.join(REPO, d, '*.json'))):
            for ns, entries in json.load(open(path, encoding='utf-8')).items():
                out.setdefault(ns, {}).update(entries)
    return out


def _load_en():
    out = {}
    for name in ('upstream/core-en.json', 'plugins-en.json'):
        p = os.path.join(REPO, name)
        if os.path.exists(p):
            for ns, entries in json.load(open(p, encoding='utf-8')).items():
                out.setdefault(ns, {}).update(entries)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--strict', action='store_true')
    args = ap.parse_args()

    en = _load_en()
    ru = load_merged(('ru', 'ru-plugins'))

    index = collections.defaultdict(list)
    for ns, entries in en.items():
        for key, en_text in entries.items():
            ru_text = ru.get(ns, {}).get(key)
            if not isinstance(en_text, str) or not isinstance(ru_text, str):
                continue
            norm = en_text.strip().lower() if args.strict else en_text.strip()
            index[norm].append((ns, key, ru_text))

    conflicts = 0
    for en_text, uses in sorted(index.items()):
        variants = []
        seen_ru = set()
        for ns, key, ru_text in uses:
            marker = ru_text.lower()
            if marker in seen_ru:
                continue
            seen_ru.add(marker)
            variants.append((ns, key, ru_text))
        if len(variants) > 1:
            conflicts += 1
            print('«%s»' % en_text)
            for ns, key, ru_text in variants:
                print('   %s.%s -> %s' % (ns, key, ru_text))
            print()
    print('расхождений: %d' % conflicts)


if __name__ == '__main__':
    main()
