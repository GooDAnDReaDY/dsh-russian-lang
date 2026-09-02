#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Консистентность терминологии и валидация по глоссарию (glossary.json).

Проверяет:
1. Отсутствие запрещенных терминов и калек из glossary.json в словарях ru/ и ru-plugins/.
2. Единообразие перевода одинаковых en-терминов (один en-термин - один ru-перевод).

Использование:
    python3 tools/term_check.py            # отчет в stdout
    python3 tools/term_check.py --ci       # выход с кодом 1 при наличии запрещенных терминов
    python3 tools/term_check.py --strict   # строгая проверка расхождений en (без учета регистра)
"""
import argparse
import collections
import glob
import json
import os
import re
import sys

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


def load_glossary():
    path = os.path.join(REPO, 'glossary.json')
    if os.path.exists(path):
        return json.load(open(path, encoding='utf-8'))
    return {}


def validate_glossary(ru_dicts, glossary):
    """Поиск запрещенных терминов из glossary.json в переводах."""
    forbidden_hits = []
    terms = glossary.get('terms', {})
    for term_key, spec in terms.items():
        forbidden = spec.get('forbidden', [])
        canonical = spec.get('canonical', '')
        for bad in forbidden:
            # Для склоняемых слов отсекаем только гласную окончания (-а/-я/-о/-е/-ы/-и/-ь), сохраняя основу
            base = re.sub(r'[аяоеыиь]$', '', bad, flags=re.IGNORECASE)
            pattern = re.compile(r'\b' + re.escape(base) + r'(?:[аяуеыи]|ом|ем|ой|ей|ам|ами|ах|ов)?\b', re.IGNORECASE)
            for ns, entries in ru_dicts.items():
                for key, ru_text in entries.items():
                    if not isinstance(ru_text, str):
                        continue
                    if pattern.search(ru_text):
                        forbidden_hits.append((ns, key, ru_text, bad, canonical, term_key))
    return forbidden_hits


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--strict', action='store_true', help='Строгое сопоставление en')
    ap.add_argument('--ci', action='store_true', help='Падать с ошибкой при нарушении глоссария')
    args = ap.parse_args()

    en = _load_en()
    ru = load_merged(('ru', 'ru-plugins'))
    glossary = load_glossary()

    # 1. Проверка по глоссарию
    print('=== ПРОВЕРКА ГЛОССАРИЯ (glossary.json) ===')
    hits = validate_glossary(ru, glossary)
    if hits:
        print('  ОБНАРУЖЕНЫ ЗАПРЕЩЕННЫЕ ТЕРМИНЫ (%d):' % len(hits))
        for ns, key, ru_text, bad, canonical, term_key in hits:
            print('    [!] %s.%s: найдено «%s» вместо «%s» (%s)' % (ns, key, bad, canonical, term_key))
            print('        Текст: %s' % ru_text)
    else:
        terms_count = len(glossary.get('terms', {}))
        print('  Все термины глоссария соблюдены (%d правил).' % terms_count)
    print()

    # 2. Обратный индекс расхождений en -> ru
    print('=== СООТВЕТСТВИЕ ОРИГИНАЛАМ (EN -> RU) ===')
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
            if not args.ci:
                print('«%s»' % en_text)
                for ns, key, ru_text in variants:
                    print('   %s.%s -> %s' % (ns, key, ru_text))
                print()
    print('  Расхождений формулировок: %d' % conflicts)
    print()

    if args.ci and hits:
        print('ОШИБКА CI: нарушены правила glossary.json!')
        sys.exit(1)


if __name__ == '__main__':
    main()
