#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Импорт переводов из форматов PO, XLIFF 1.2 и CSV в dsh-russian-lang с поддержкой метаданных.

Использование:
  python3 tools/import_i18n.py --format po --input translations.po --out-json imported.json
  python3 tools/import_i18n.py --format xliff --input translations.xlf --out-json imported.json
  python3 tools/import_i18n.py --format csv --input translations.csv --out-json imported.json
"""
import argparse
import csv
import io
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
PH_RE = re.compile(r'\{([a-zA-Z0-9_]+)\}|%([0-9]+\$)?[sdf]')


def ph_set(s):
    return set(PH_RE.findall(s))


def ph_ok(en_str, ru_str):
    return ph_set(en_str) == ph_set(ru_str)


def parse_po(text, validate=True, return_meta=False):
    """Парсинг простого PO файла с поддержкой msgctxt, метаданных и проверкой плейсхолдеров."""
    result = {}
    meta_result = {}
    errors = []
    current_ref = None
    current_ctxt = None
    current_msgid = None
    current_msgstr = None
    current_meta = {}

    for line in text.splitlines():
        line = line.strip()
        if line.startswith('# dsh-status:'):
            current_meta['status'] = line.split(':', 1)[1].strip()
        elif line.startswith('# dsh-model:'):
            current_meta['model'] = line.split(':', 1)[1].strip()
        elif line.startswith('# dsh-at:'):
            current_meta['at'] = line.split(':', 1)[1].strip()
        elif line.startswith('msgctxt'):
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
                if current_meta:
                    meta_result.setdefault(ns, {})[key] = dict(current_meta)
                current_ref = None
                current_ctxt = None
                current_msgid = None
                current_msgstr = None
                current_meta = {}

    if validate and errors:
        err_lines = [
            f"Placeholder mismatch in {ns}.{k}: missing={missing}, extra={extra} (source={src!r}, target={tgt!r})"
            for ns, k, src, tgt, missing, extra in errors
        ]
        raise ValueError("\n".join(err_lines))

    if return_meta:
        return result, meta_result
    return result


def parse_xliff(text, validate=True, return_meta=False):
    """Парсинг XLIFF 1.2 с поддержкой context-group, метаданных и проверкой плейсхолдеров."""
    result = {}
    meta_result = {}
    errors = []
    root = ET.fromstring(text)
    for unit in root.iter():
        if unit.tag.endswith('trans-unit'):
            unit_id = unit.attrib.get('id', '')
            ns_context = None
            meta = {}
            for elem in unit.iter():
                if elem.tag.endswith('context') and elem.attrib.get('context-type') == 'namespace' and elem.text:
                    ns_context = elem.text.strip()
                elif elem.tag.endswith('note'):
                    from_attr = elem.attrib.get('from', '')
                    if from_attr == 'dsh-status' and elem.text:
                        meta['status'] = elem.text.strip()
                    elif from_attr == 'dsh-model' and elem.text:
                        meta['model'] = elem.text.strip()
                    elif from_attr == 'dsh-at' and elem.text:
                        meta['at'] = elem.text.strip()

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
                if meta:
                    meta_result.setdefault(ns, {})[key] = dict(meta)

    if validate and errors:
        err_lines = [
            f"Placeholder mismatch in {ns}.{k}: missing={missing}, extra={extra} (source={src!r}, target={tgt!r})"
            for ns, k, src, tgt, missing, extra in errors
        ]
        raise ValueError("\n".join(err_lines))

    if return_meta:
        return result, meta_result
    return result


def parse_csv(text, validate=True, return_meta=False):
    """Парсинг CSV с поддержкой многострочных значений, метаданных и проверкой плейсхолдеров."""
    result = {}
    meta_result = {}
    errors = []
    reader = csv.DictReader(io.StringIO(text))
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

            meta = {}
            if row.get('status'):
                meta['status'] = row['status'].strip()
            if row.get('model'):
                meta['model'] = row['model'].strip()
            if row.get('at'):
                meta['at'] = row['at'].strip()
            if meta:
                meta_result.setdefault(ns, {})[key] = meta

    if validate and errors:
        err_lines = [
            f"Placeholder mismatch in {ns}.{k}: missing={missing}, extra={extra} (source={src!r}, target={tgt!r})"
            for ns, k, src, tgt, missing, extra in errors
        ]
        raise ValueError("\n".join(err_lines))

    if return_meta:
        return result, meta_result
    return result


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--format', choices=['po', 'xliff', 'csv'], required=True)
    ap.add_argument('--input', required=True)
    ap.add_argument('--out-json', required=True)
    ap.add_argument('--registry', default=os.path.join(REPO, 'mt-registry.json'), help='Путь к mt-registry.json для сохранения метаданных')
    ap.add_argument('--dry-run', action='store_true', help='Только проверить синтаксис без записи файла')
    args = ap.parse_args()

    content = open(args.input, encoding='utf-8').read()
    try:
        if args.format == 'po':
            parsed, meta = parse_po(content, validate=True, return_meta=True)
        elif args.format == 'xliff':
            parsed, meta = parse_xliff(content, validate=True, return_meta=True)
        elif args.format == 'csv':
            parsed, meta = parse_csv(content, validate=True, return_meta=True)
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

    if meta and args.registry:
        reg = {}
        if os.path.exists(args.registry):
            try:
                reg = json.load(open(args.registry, encoding='utf-8'))
            except Exception:
                reg = {}
        for ns, keys in meta.items():
            for k, m in keys.items():
                reg.setdefault(ns, {}).setdefault(k, {})
                reg[ns][k].update(m)
                if ns in parsed and k in parsed[ns]:
                    reg[ns][k]['ru'] = parsed[ns][k]
        with open(args.registry, 'w', encoding='utf-8') as f:
            json.dump(reg, f, ensure_ascii=False, indent=1, sort_keys=True)
            f.write('\n')
        print('Метаданные (%d ключей) сохранены в %s' % (sum(len(v) for v in meta.values()), args.registry))


if __name__ == '__main__':
    main()
