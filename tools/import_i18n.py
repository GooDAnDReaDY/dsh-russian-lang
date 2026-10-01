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
import glob
import io
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

PH_RE = re.compile(r'\{[a-zA-Z0-9_]+\}|%(?:[0-9]+\$)?[+-]?\d*(?:\.\d+)?[hlLzjt]*[sdfiuoxXcp]')


def ph_set(s):
    return set(PH_RE.findall(s or ''))


def ph_counter(s):
    return Counter(PH_RE.findall(s or ''))


def ph_ok(en_str, ru_str):
    if not en_str:
        return True
    return ph_counter(en_str) == ph_counter(ru_str)


def get_known_namespaces():
    ns_set = set()
    for d in ('ru', 'ru-plugins'):
        for p in glob.glob(os.path.join(REPO, d, '*.json')):
            try:
                for k in json.load(open(p, encoding='utf-8')).keys():
                    ns_set.add(k)
            except Exception:
                pass
    return sorted(ns_set, key=len, reverse=True)


KNOWN_NS = None


def resolve_legacy_ref(ref):
    global KNOWN_NS
    if KNOWN_NS is None:
        KNOWN_NS = get_known_namespaces()
    for ns in KNOWN_NS:
        if ref.startswith(ns + '.'):
            return ns, ref[len(ns) + 1:]
    if '.' in ref:
        return ref.split('.', 1)
    return 'common', ref


def unescape_po_string(s):
    try:
        return json.loads(s)
    except Exception:
        return s[1:-1] if len(s) >= 2 and s[0] == '"' and s[-1] == '"' else s


def parse_po(text, validate=True, return_meta=False):
    result = {}
    meta_result = {}
    errors = []

    current_ref = None
    current_ctxt = None
    current_msgid = None
    current_msgstr = None
    current_meta = {}
    is_no_en = False

    active_field = None  # 'msgctxt', 'msgid', 'msgstr'

    def commit_entry():
        nonlocal current_ref, current_ctxt, current_msgid, current_msgstr, current_meta, is_no_en
        if current_msgstr is None:
            return

        ns = None
        key = None
        if current_ctxt:
            ns = current_ctxt
            if current_ref and current_ref.startswith(ns + '.'):
                key = current_ref[len(ns) + 1:]
            elif current_ref:
                key = current_ref
        elif current_ref:
            ns, key = resolve_legacy_ref(current_ref)

        if ns and key and current_msgstr is not None:
            has_en = bool(current_msgid) and not is_no_en
            if validate and has_en and not ph_ok(current_msgid, current_msgstr):
                en_c = ph_counter(current_msgid)
                ru_c = ph_counter(current_msgstr)
                missing = en_c - ru_c
                extra = ru_c - en_c
                errors.append((ns, key, current_msgid, current_msgstr, dict(missing), dict(extra)))

            result.setdefault(ns, {})[key] = current_msgstr
            if has_en and 'en' not in current_meta:
                current_meta['en'] = current_msgid
            if current_meta:
                meta_result.setdefault(ns, {})[key] = dict(current_meta)

        current_ref = None
        current_ctxt = None
        current_msgid = None
        current_msgstr = None
        current_meta = {}
        is_no_en = False

    lines = text.splitlines(True)
    for raw_line in lines:
        line_clean = raw_line.rstrip('\r\n')
        s = line_clean.strip()
        if not s:
            commit_entry()
            active_field = None
            continue

        if s.startswith('#'):
            active_field = None
            if s.startswith('#:'):
                ref_part = line_clean[2:]
                if ref_part.startswith(' '):
                    ref_part = ref_part[1:]
                current_ref = ref_part
            elif s.startswith('# dsh-status:'):
                current_meta['status'] = s.split(':', 1)[1].strip()
            elif s.startswith('# dsh-model:'):
                current_meta['model'] = s.split(':', 1)[1].strip()
            elif s.startswith('# dsh-at:'):
                current_meta['at'] = s.split(':', 1)[1].strip()
            elif s.startswith('# dsh-comment:') or s.startswith('# comment:'):
                val = s.split(':', 1)[1].strip()
                if 'comment' in current_meta:
                    current_meta['comment'] += '\n' + val
                else:
                    current_meta['comment'] = val
            elif s.startswith('# dsh-context:') or s.startswith('# context:'):
                val = s.split(':', 1)[1].strip()
                if 'context' in current_meta:
                    current_meta['context'] += '\n' + val
                else:
                    current_meta['context'] = val
            elif s.startswith('# dsh-en:'):
                current_meta['en'] = s.split(':', 1)[1].strip()
            elif s.startswith('# dsh-no-en:'):
                is_no_en = True
            continue

        if s.startswith('msgctxt'):
            active_field = 'msgctxt'
            raw = s[7:].strip()
            current_ctxt = unescape_po_string(raw)
        elif s.startswith('msgid'):
            active_field = 'msgid'
            raw = s[5:].strip()
            current_msgid = unescape_po_string(raw)
        elif s.startswith('msgstr'):
            active_field = 'msgstr'
            raw = s[6:].strip()
            current_msgstr = unescape_po_string(raw)
        elif s.startswith('"') and s.endswith('"') and active_field:
            part = unescape_po_string(s)
            if active_field == 'msgid':
                current_msgid = (current_msgid or '') + part
            elif active_field == 'msgstr':
                current_msgstr = (current_msgstr or '') + part
            elif active_field == 'msgctxt':
                current_ctxt = (current_ctxt or '') + part

    commit_entry()

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
    result = {}
    meta_result = {}
    errors = []
    root = ET.fromstring(text)
    for unit in root.iter():
        if unit.tag.endswith('trans-unit'):
            unit_id = unit.attrib.get('id', '')
            ns_context = None
            meta = {}
            is_no_en = False
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
                    elif from_attr in ('dsh-comment', 'comment') and elem.text:
                        meta['comment'] = elem.text.strip()
                    elif from_attr in ('dsh-context', 'context') and elem.text:
                        meta['context'] = elem.text.strip()
                    elif from_attr == 'dsh-no-en':
                        is_no_en = True

            if ns_context:
                ns = ns_context
                if unit_id.startswith(ns + '.'):
                    key = unit_id[len(ns) + 1:]
                else:
                    key = unit_id
            elif '.' in unit_id:
                ns, key = resolve_legacy_ref(unit_id)
            else:
                continue

            source = None
            target = None
            for child in unit:
                if child.tag.endswith('source'):
                    source = child.text or ''
                elif child.tag.endswith('target'):
                    target = child.text or ''

            if target is not None:
                has_en = bool(source) and not is_no_en
                if validate and has_en and not ph_ok(source, target):
                    en_c = ph_counter(source)
                    ru_c = ph_counter(target)
                    missing = en_c - ru_c
                    extra = ru_c - en_c
                    errors.append((ns, key, source, target, dict(missing), dict(extra)))

                result.setdefault(ns, {})[key] = target
                if has_en and 'en' not in meta:
                    meta['en'] = source
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
                en_c = ph_counter(en)
                ru_c = ph_counter(ru)
                missing = en_c - ru_c
                extra = ru_c - en_c
                errors.append((ns, key, en, ru, dict(missing), dict(extra)))
            result.setdefault(ns, {})[key] = ru

            meta = {}
            for col in ('status', 'model', 'at', 'comment', 'context', 'en'):
                if row.get(col):
                    meta[col] = row[col].strip()
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
    ap.add_argument('--registry', default=None, help='Путь к mt-registry.json для сохранения метаданных')
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
