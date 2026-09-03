#!/usr/bin/env python3
"""Авто-дотягивание новых ключей плагинов в MT-очередь (#69).

Сравнивает текущий plugins-en.json с прошлым срезом (upstream/plugins-snapshot.json),
находит новые ключи и переводит их через mt_fallback.apply_mt. Обновляет срез.

Использование:
    OPENROUTER_API_KEY=... python3 tools/mt_autofill.py
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SNAPSHOT = os.path.join(REPO, 'upstream', 'plugins-snapshot.json')
PLUGINS_EN = os.path.join(REPO, 'plugins-en.json')

sys.path.insert(0, HERE)
import mt_fallback  # noqa: E402


def load(path):
    return json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}


def save_snapshot(data):
    with open(SNAPSHOT, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1, sort_keys=True)


def new_keys(prev, curr):
    """Новые ключи: есть в curr, нет в prev (по namespace)."""
    out = {}
    for ns, entries in curr.items():
        missing = sorted(k for k in entries if k not in prev.get(ns, {}))
        if missing:
            out[ns] = missing
    return out


def main():
    prev = load(SNAPSHOT)
    curr = load(PLUGINS_EN)

    # Срез не коммитится (#136), поэтому в свежем клоне его нет. База — это
    # запись текущего plugins-en.json, перевода она не требует, значит и ключ
    # для неё не нужен: проверяем ключ уже после этой ветки.
    if not prev:
        save_snapshot(curr)
        print('первый запуск: срез принят за базу, дельта не считается')
        return 0

    api_key = os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        print('OPENROUTER_API_KEY не задан', file=sys.stderr)
        return 2

    added = new_keys(prev, curr)
    total = sum(len(v) for v in added.values())
    print('новых ключей плагинов: %d' % total)
    if not total:
        return 0

    # переводим только новые ключи (apply_mt сам пропустит уже переведённые)
    changed = mt_fallback.apply_mt(added, api_key)
    save_snapshot(curr)
    print('дотянуто MT: %d' % changed)
    return 0


if __name__ == '__main__':
    sys.exit(main())
