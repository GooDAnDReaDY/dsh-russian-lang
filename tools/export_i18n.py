#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Экспорт словарей dsh-russian-lang в форматы PO, XLIFF 1.2 и CSV.

Использование:
  python3 tools/export_i18n.py --format po --out translations.po
  python3 tools/export_i18n.py --format xliff --out translations.xlf
  python3 tools/export_i18n.py --format csv --out translations.csv
"""
import argparse
import csv
import glob
import io
import json
import os
import xml.sax.saxutils as saxutils

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)


def load_all_dicts():
    ru = {}
    for d in ('ru', 'ru-plugins'):
        for p in sorted(glob.glob(os.path.join(REPO, d, '*.json'))):
            for ns, entries in json.load(open(p, encoding='utf-8')).items():
                ru.setdefault(ns, {}).update(entries)

    en = {}
    for name in ('upstream/core-en.json', 'plugins-en.json'):
        p = os.path.join(REPO, name)
        if os.path.exists(p):
            for ns, entries in json.load(open(p, encoding='utf-8')).items():
                en.setdefault(ns, {}).update(entries)
    return en, ru


def export_po(en_dict, ru_dict):
    lines = [
        'msgid ""',
        'msgstr ""',
        '"Content-Type: text/plain; charset=UTF-8\\n"',
        '"Language: ru\\n"',
        ''
    ]
    for ns in sorted(ru_dict.keys()):
        for key, ru_text in sorted(ru_dict[ns].items()):
            en_text = en_dict.get(ns, {}).get(key, '')
            lines.append('#: %s.%s' % (ns, key))
            lines.append('msgid %s' % json.dumps(en_text or key, ensure_ascii=False))
            lines.append('msgstr %s' % json.dumps(ru_text, ensure_ascii=False))
            lines.append('')
    return '\n'.join(lines)


def export_xliff(en_dict, ru_dict):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">',
        '  <file original="dsh-russian-lang" source-language="en" target-language="ru" datatype="plaintext">',
        '    <body>'
    ]
    for ns in sorted(ru_dict.keys()):
        for key, ru_text in sorted(ru_dict[ns].items()):
            en_text = en_dict.get(ns, {}).get(key, '')
            unit_id = saxutils.escape('%s.%s' % (ns, key))
            src = saxutils.escape(en_text or key)
            tgt = saxutils.escape(ru_text)
            lines.append('      <trans-unit id="%s">' % unit_id)
            lines.append('        <source>%s</source>' % src)
            lines.append('        <target>%s</target>' % tgt)
            lines.append('      </trans-unit>')
    lines.append('    </body>')
    lines.append('  </file>')
    lines.append('</xliff>')
    return '\n'.join(lines)


def export_csv(en_dict, ru_dict):
    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(['namespace', 'key', 'en', 'ru'])
    for ns in sorted(ru_dict.keys()):
        for key, ru_text in sorted(ru_dict[ns].items()):
            en_text = en_dict.get(ns, {}).get(key, '')
            writer.writerow([ns, key, en_text, ru_text])
    return out.getvalue()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--format', choices=['po', 'xliff', 'csv'], default='po')
    ap.add_argument('--out', required=True)
    args = ap.parse_args()

    en, ru = load_all_dicts()
    if args.format == 'po':
        data = export_po(en, ru)
    elif args.format == 'xliff':
        data = export_xliff(en, ru)
    elif args.format == 'csv':
        data = export_csv(en, ru)

    with open(args.out, 'w', encoding='utf-8') as f:
        f.write(data)
    print('Экспортировано в %s (формат: %s)' % (args.out, args.format))


if __name__ == '__main__':
    main()