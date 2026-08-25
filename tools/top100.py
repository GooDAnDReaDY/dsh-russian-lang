#!/usr/bin/env python3
"""Покрытие DSH-плагинов профиля переводом: прогресс-таблица.

Сканирует node_modules профиля, находит DSH-плагины (поле `dsh`, cordis.patch.yml
или lib/client.js), извлекает их en-словари (extract-dicts.harvest), сверяет с
ru-plugins/*.json и печатает таблицу docs/top.md. Служит источником для
прогресс-доски: показывает, какие плагины ещё не переведены.

Использование:
    python3 tools/top100.py <node_modules профиля> [--limit N]
"""
import argparse
import glob
import importlib.util
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
_spec = importlib.util.spec_from_file_location('extract_dicts', os.path.join(REPO, 'extract-dicts.py'))
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
harvest = _mod.harvest


def is_plugin_pkg(path):
    pj = os.path.join(path, 'package.json')
    if not os.path.exists(pj):
        return False
    try:
        meta = json.load(open(pj, encoding='utf-8'))
    except Exception:
        return False
    return ('dsh' in meta
            or os.path.exists(os.path.join(path, 'cordis.patch.yml'))
            or os.path.exists(os.path.join(path, 'lib', 'client.js')))


def plugin_roots(prof):
    found = []
    for entry in os.listdir(prof):
        p = os.path.join(prof, entry)
        if os.path.isdir(p):
            if entry.startswith('@'):
                for sub in os.listdir(p):
                    sp = os.path.join(p, sub)
                    if os.path.isdir(sp):
                        found.append(sp)
            else:
                found.append(p)
    return [p for p in found if is_plugin_pkg(p)]


def load_ru(dirpath):
    ru = {}
    for path in sorted(glob.glob(os.path.join(dirpath, '*.json'))):
        for ns, entries in json.load(open(path, encoding='utf-8')).items():
            ru.setdefault(ns, {}).update(entries)
    return ru


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('profile', help='node_modules профиля')
    ap.add_argument('--limit', type=int, default=100)
    args = ap.parse_args()

    skel_dir = os.path.join(REPO, 'ru-plugins')
    ru = load_ru(skel_dir)
    rows = []
    for pkg in plugin_roots(args.profile):
        cjs = os.path.join(pkg, 'lib', 'client.js')
        if not os.path.exists(cjs):
            continue
        ns_en = harvest([cjs])
        name = os.path.basename(pkg)
        for ns, entries in ns_en.items():
            done = len([k for k in entries if k in ru.get(ns, {})])
            rows.append((name, ns, len(entries), done))

    rows.sort(key=lambda r: (-r[2], r[0], r[1]))
    os.makedirs(os.path.join(REPO, 'docs'), exist_ok=True)
    total_all = sum(r[2] for r in rows)
    done_all = sum(r[3] for r in rows)
    out = ['# Покрытие DSH-плагинов переводом', '',
           'Сортировка по числу en-ключей (самые содержательные выше). '
           '`сделано/total` — ключи в ru-plugins/*.json.', '',
           'Всего плагинов: %d · ключей: %d · переведено: %d (%.0f%%)'
           % (len(set(r[0] for r in rows)), total_all, done_all, 100.0 * done_all / total_all if total_all else 0),
           '', '| плагин | namespace | переведено | всего |', '|---|---|---|---|']
    for name, ns, total, done in rows[:args.limit]:
        out.append('| %s | `%s` | %d | %d |' % (name, ns, done, total))
    out.append('')
    open(os.path.join(REPO, 'docs', 'top.md'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    print('\n'.join(out))
    print('-> docs/top.md')


if __name__ == '__main__':
    main()
