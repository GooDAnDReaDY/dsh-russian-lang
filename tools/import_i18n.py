#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Импорт переводов из форматов PO, XLIFF 1.2 и CSV в dsh-russian-lang.

Использование:
  python3 tools/import_i18n.py --format po --input translations.po --out-json imported.json
  python3 tools/import_i18n.py --format xliff --input translations.xlf --out-json imported.json
  python3 tools/import_i18n.py --format csv --input translations.csv --out-json imported.json
"""
import argparse
import csv
import json
import re
import sys
import xml.etree.ElementTree as ET

PH_RE = re.compile(r'\{([a-zA-Z0-9_]+)\}|%([0-9]+\$)?[sdf]')


def ph_set(s):
    return set(PH_RE.findall(s))


def ph_ok(en_str, ru_str):
    return ph_set(en_str) == ph_set(ru_str)


def parse_po(text, validate=True):
    """Парсинг простого PO файла с поддержкой msgctxt и проверкой плейсхолдеров."""
    result = {}
    errors = []
    current_ref = None
    current_ctxt = None
    current_msgid = None
    current_msgstr = None

    for line in text.splitlines():
        line = line.strip()
        if line.startswith('msgctxt'):
            raw = line[7:].strip()
            if raw.startswith('"') and raw.endswith('"'):
                try: current_ctxt = json.loads(raw)
                except Exception: current_ctxt = raw[1:-1]
        elif line.startswith('#:'):
            current_ref = line[2:].strip()
        elif line.startswith('msgid'):
            raw = line[5:].strip()
            if raw.startswith('"') and raw.endswith('"'):
                try: current_msgid = json.loads(raw)
                except Exception: current_msgid = raw[1:-1]
        elif line.startswith('msgstr'):
            raw = line[6:].strip()
            if raw.startswith('"') and raw.endswith('"'):
                try: current_msgstr = json.loads(raw)
                except Exception: current_msgstr = raw[1:-1]

            ns = None
            key = None
            if current_ctxt:
                ns = current_ctxt
                if current_ref and current_ref.startswith(ns + '.'):
                    key = current_ref[len(ns) + 1:]
                elif current_ref:
                    key = current_ref
            elif current_ref and '.' in current_ref:
                ns, key = current_ref.split('.', 1)

            if ns and key and current_msgstr is not None:
                if validate and current_msgid and not ph_ok(current_msgid, current_msgstr):
                    missing = ph_set(current_msgid) - ph_set(current_msgstr)
                    extra = ph_set(current_msgstr) - ph_set(current_msgid)
                    errors.append((ns, key, current_msgid, current_msgstr, missing, extra))
                result.setdefault(ns, {})[key] = current_msgstr
                current_ref = None
                current_ctxt = None
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
    """Парсинг XLIFF 1.2 с поддержкой context-group и проверкой плейсхолдеров."""
    result = {}
    errors = []
    root = ET.fromstring(text)
    for unit in root.iter():
        if unit.tag.endswith('trans-unit'):
            unit_id = unit.attrib.get('id', '')
            ns_context = None
            for elem in unit.iter():
                if elem.tag.endswith('context') and elem.attrib.get('context-type') == 'namespace' and elem.text:
                    ns_context = elem.text.strip()
                    break

            if ns_context:
                ns = ns_context
                if unit_id.startswith(ns + '.'):
                    key = unit_id[len(ns) + 1:]
                else:
                    key = unit_id
            elif '.' in unit_id:
                ns, key = unit_id.split('.', 1)
            else:
                continue

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
    ap.add_argument('--out-json', required=True)
    ap.add_argument('--dry-run', action='store_true', help='Только проверить синтаксис без записи файла')
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

    if args.dry_run:
        print('Режим --dry-run: файл %s не изменён' % args.out_json)
        return

    with open(args.out_json, 'w', encoding='utf-8') as f:
        json.dump(parsed, f, ensure_ascii=False, indent=2)
    print('Импортировано в %s' % args.out_json)


if __name__ == '__main__':
    main()
