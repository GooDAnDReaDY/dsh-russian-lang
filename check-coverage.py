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
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

PLACEHOLDER = re.compile(r'\{(\w+)\}')


def placeholders(text):
    """Set of {name} placeholders in a template string."""
    return set(PLACEHOLDER.findall(text))


def load_dir(name):
    out = {}
    for path in sorted(glob.glob(os.path.join(HERE, name, '*.json'))):
        for ns, entries in json.load(open(path, encoding='utf-8')).items():
            out.setdefault(ns, {}).update(entries)
    return out


def load_file(name):
    path = os.path.join(HERE, name)
    return json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}


def _ru_plural(ru_key):
    """Base of a Russian plural key (X.few / X.many) if it exists."""
    m = re.match(r'^(.*)\.(few|many)$', ru_key)
    return m.group(1) if m else None


def compare(title, en, ru):
    missing = stale = bad = 0
    print('=== %s ===' % title)
    for ns in sorted(en):
        absent = [k for k in en[ns] if k not in ru.get(ns, {})]
        if absent:
            missing += len(absent)
            print('  НЕТ ПЕРЕВОДА  %-26s %3d: %s' % (ns, len(absent), ', '.join(absent[:8])))
    for ns in sorted(ru):
        extra = []
        for k in ru[ns]:
            if k in en.get(ns, {}):
                continue
            # X.few / X.many — осознанные ру-формы множественного числа, валидны,
            # если в en есть базовый X.one / X.other.
            base = _ru_plural(k)
            if base and (base + '.one' in en.get(ns, {}) or base + '.other' in en.get(ns, {})):
                continue
            extra.append(k)
        if extra:
            stale += len(extra)
            print('  ЛИШНЕЕ        %-26s %3d: %s' % (ns, len(extra), ', '.join(extra[:8])))
        # Плейсхолдеры: ru не должен терять и не должен добавлять {placeholders}
        # относительно en (иначе подстановка параметров ломается).
        for k in ru[ns]:
            if k not in en.get(ns, {}):
                continue
            en_ph = placeholders(en[ns][k])
            ru_ph = placeholders(ru[ns][k])
            lost = en_ph - ru_ph
            extra_ph = ru_ph - en_ph
            if lost:
                bad += 1
                print('  ПОТЕРЯН PH    %-26s %-24s ru без {%s} (en {%s})'
                      % (ns, k, ', '.join(sorted(lost)), ', '.join(sorted(en_ph))))
            if extra_ph:
                bad += 1
                print('  ЛИШНИЙ PH     %-26s %-24s ru с {%s} (en {%s})'
                      % (ns, k, ', '.join(sorted(extra_ph)), ', '.join(sorted(en_ph))))
    total = sum(len(v) for v in en.values())
    done = total - missing
    print('  ключей: %d | переведено: %d | не переведено: %d | лишних: %d | плохих PH: %d | покрытие: %.1f%%'
          % (total, done, missing, stale, bad, (100.0 * done / total) if total else 100.0))
    print()
    return missing + bad


if __name__ == '__main__':
    left = compare('ЯДРО', load_file('core-en.json'), load_dir('ru'))
    left += compare('ПЛАГИНЫ', load_file('plugins-en.json'), load_dir('ru-plugins'))
    sys.exit(0 if left == 0 else 1)
