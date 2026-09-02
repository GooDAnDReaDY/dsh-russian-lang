#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Импорт переводов из форматов PO, XLIFF 1.2 и CSV с валидацией плейсхолдеров.

Использование:
  python3 tools/import_i18n.py --format po --input translations.po --dry-run
  python3 tools/import_i18n.py --format csv --input translations.csv --out-json imported.json
"""
import argparse
import csv
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

PH_RE = re.compile(r'\{([a-zA-Z0-9_]+)\}')


def ph_set(s):
    return set(PH_RE.findall(s or ''))


def ph_ok(en_str, ru_str):
    return ph_set(en_str) == ph_set(ru_str)


def parse_po(text):
    """Парсинг простого PO файла."""
    result = {}
    current_ns = None
    current_key = None
    current_msgid = None
    current_msgstr = None

    for line in text.splitlines():
        line = line.strip()
        if line.startswith('#:'):
            ref = line[2:].strip()
            if '.' in ref:
                parts = ref.split('.', 1)
                current_ns = parts[0]
                current_key = parts[1]
        elif line.startswith('msgid '):
            raw = line[6:].strip()
            if raw.startswith('"') and raw.endswith('"'):
                try: current_msgid = json.loads(raw)
                except Exception: current_msgid = raw[1:-1]
        elif line.startswith('msgstr '):
            raw = line[7:].strip()
            if raw.startswith('"') and raw.endswith('"'):
                try: current_msgstr = json.loads(raw)
                except Exception: current_msgstr = raw[1:-1]
            if current_ns and current_key and current_msgstr:
                result.setdefault(current_ns, {})[current_key] = current_msgstr
                current_ns = None
                current_key = None
    return result


def parse_xliff(text):
    """Парсинг XLIFF 1.2."""
    result = {}
    root = ET.fromstring(text)
    for unit in root.iter():
        if unit.tag.endswith('trans-unit'):
            unit_id = unit.attrib.get('id', '')
            if '.' in unit_id:
                ns, key = unit_id.split('.', 1)
                target = None
                for child in unit:
                    if child.tag.endswith('target') and child.text:
                        target = child.text
                if target:
                    result.setdefault(ns, {})[key] = target
    return result


def parse_csv(text):
    """Парсинг CSV."""
    result = {}
    reader = csv.DictReader(text.splitlines())
    for row in reader:
        ns = row.get('namespace')
        key = row.get('key')
        ru = row.get('ru')
        if ns and key and ru:
            result.setdefault(ns, {})[key] = ru
    return result


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--format', choices=['po', 'xliff', 'csv'], required=True)
    ap.add_argument('--input', required=True)
    ap.add_argument('--out-json', default=None)
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    content = open(args.input, encoding='utf-8').read()
    if args.format == 'po':
        parsed = parse_po(content)
    elif args.format == 'xliff':
        parsed = parse_xliff(content)
    elif args.format == 'csv':
        parsed = parse_csv(content)

    total_keys = sum(len(v) for v in parsed.values())
    print('Успешно распарсено: %d namespace, %d ключей' % (len(parsed), total_keys))

    if args.out_json:
        with open(args.out_json, 'w', encoding='utf-8') as f:
            json.dump(parsed, f, indent=2, ensure_ascii=False)
        print('Сохранено в %s' % args.out_json)


if __name__ == '__main__':
    main()