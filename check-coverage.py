#!/usr/bin/env python3
"""Сверить русские словари с английскими оригиналами.

Сравнивает:
    core-en.json     <-> ru/*.json
    plugins-en.json  <-> ru-plugins/*.json

Показывает, что не переведено (появилось после обновления) и что лишнее
(ключ исчез или переименован). Перед сверкой обновите оригиналы:

    python3 extract-dicts.py <node_modules> [profile-node_modules]
    python3 check-coverage.py
"""
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def load_dir(name):
    out = {}
    for path in sorted(glob.glob(os.path.join(HERE, name, '*.json'))):
        for ns, entries in json.load(open(path, encoding='utf-8')).items():
            out.setdefault(ns, {}).update(entries)
    return out


def load_file(name):
    path = os.path.join(HERE, name)
    return json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}


def compare(title, en, ru):
    missing = stale = 0
    print('=== %s ===' % title)
    for ns in sorted(en):
        absent = [k for k in en[ns] if k not in ru.get(ns, {})]
        if absent:
            missing += len(absent)
            print('  НЕТ ПЕРЕВОДА  %-26s %3d: %s' % (ns, len(absent), ', '.join(absent[:8])))
    for ns in sorted(ru):
        extra = [k for k in ru[ns] if k not in en.get(ns, {})]
        if extra:
            stale += len(extra)
            print('  ЛИШНЕЕ        %-26s %3d: %s' % (ns, len(extra), ', '.join(extra[:8])))
    total = sum(len(v) for v in en.values())
    done = total - missing
    print('  ключей: %d | переведено: %d | не переведено: %d | лишних: %d | покрытие: %.1f%%'
          % (total, done, missing, stale, (100.0 * done / total) if total else 100.0))
    print()
    return missing


if __name__ == '__main__':
    left = compare('ЯДРО', load_file('core-en.json'), load_dir('ru'))
    left += compare('ПЛАГИНЫ', load_file('plugins-en.json'), load_dir('ru-plugins'))
    sys.exit(0 if left == 0 else 1)
