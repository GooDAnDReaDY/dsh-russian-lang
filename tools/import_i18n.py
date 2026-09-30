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


def parse_po(text, validate=True):
    """Парсинг простого PO файла с проверкой плейсхолдеров."""
    result = {}
    errors = []
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
            if current_ns and current_key and current_msgstr is not None:
                if validate and current_msgid and not ph_ok(current_msgid, current_msgstr):
                    missing = ph_set(current_msgid) - ph_set(current_msgstr)
                    extra = ph_set(current_msgstr) - ph_set(current_msgid)
                    errors.append((current_ns, current_key, current_msgid, current_msgstr, missing, extra))
                result.setdefault(current_ns, {})[current_key] = current_msgstr
                current_ns = None
                current_key = None
                current_msgid = None
                current_msgstr = None

    if validate and errors:
        err_lines = [
            f"Placeholder mismatch in {ns}.{k}: missing={missing}, extra={extra} (source={src!r}, target={tgt!r})"
            for ns, k, src, tgt, missing, extra in errors
        ]
        raise ValueError("\n".join(err_lines))
    return result


def parse_xliff(text, validate=True):
    """Парсинг XLIFF 1.2 с проверкой плейсхолдеров."""
    result = {}
    errors = []
    root = ET.fromstring(text)
    for unit in root.iter():
        if unit.tag.endswith('trans-unit'):
            unit_id = unit.attrib.get('id', '')
            if '.' in unit_id:
                ns, key = unit_id.split('.', 1)
                source = None
                target = None
                for child in unit:
                    if child.tag.endswith('source') and child.text:
                        source = child.text
                    elif child.tag.endswith('target') and child.text:
                        target = child.text
                if target is not None:
                    if validate and source and not ph_ok(source, target):
                        missing = ph_set(source) - ph_set(target)
                        extra = ph_set(target) - ph_set(source)
                        errors.append((ns, key, source, target, missing, extra))
                    result.setdefault(ns, {})[key] = target

    if validate and errors:
        err_lines = [
            f"Placeholder mismatch in {ns}.{k}: missing={missing}, extra={extra} (source={src!r}, target={tgt!r})"
            for ns, k, src, tgt, missing, extra in errors
        ]
        raise ValueError("\n".join(err_lines))
    return result


def parse_csv(text, validate=True):
    """Парсинг CSV с проверкой плейсхолдеров."""
    result = {}
    errors = []
    reader = csv.DictReader(text.splitlines())
    for row in reader:
        ns = row.get('namespace')
        key = row.get('key')
        en = row.get('en')
        ru = row.get('ru')
        if ns and key and ru is not None:
            if validate and en and not ph_ok(en, ru):
                missing = ph_set(en) - ph_set(ru)
                extra = ph_set(ru) - ph_set(en)
                errors.append((ns, key, en, ru, missing, extra))
            result.setdefault(ns, {})[key] = ru

    if validate and errors:
        err_lines = [
            f"Placeholder mismatch in {ns}.{k}: missing={missing}, extra={extra} (source={src!r}, target={tgt!r})"
            for ns, k, src, tgt, missing, extra in errors
        ]
        raise ValueError("\n".join(err_lines))
    return result


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--format', choices=['po', 'xliff', 'csv'], required=True)
    ap.add_argument('--input', required=True)
    ap.add_argument('--out-json', default=None)
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    content = open(args.input, encoding='utf-8').read()
    try:
        if args.format == 'po':
            parsed = parse_po(content, validate=True)
        elif args.format == 'xliff':
            parsed = parse_xliff(content, validate=True)
        elif args.format == 'csv':
            parsed = parse_csv(content, validate=True)
    except ValueError as err:
        print(f"Ошибка валидации плейсхолдеров ({args.format}):\n{err}", file=sys.stderr)
        sys.exit(1)

    total_keys = sum(len(v) for v in parsed.values())
    print('Успешно распарсено: %d namespace, %d ключей' % (len(parsed), total_keys))

    if args.out_json:
        if args.dry_run:
            print('[DRY-RUN] Режим проверки: запись в %s пропущена' % args.out_json)
        else:
            with open(args.out_json, 'w', encoding='utf-8') as f:
                json.dump(parsed, f, indent=2, ensure_ascii=False)
            print('Сохранено в %s' % args.out_json)


if __name__ == '__main__':
    main()
