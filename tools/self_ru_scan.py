#!/usr/bin/env python3
"""Сканер self-ru namespace'ов: какие плагины уже локализуют себя на русский.

Обходит node_modules профиля, в каждом DSH-плагине ищет регистрации локалей
(`register(NS, {en, ru})`, `register("ns", "ru", ...)`) и печатает/пишет
список namespace'ов, которые плагин держит сам. build.py исключает их:
повторная регистрация ru валит загрузчик чужого плагина
(«already has locale ru», см. 0.1.7/0.1.8).

Использование:
    python3 tools/self_ru_scan.py <node_modules профиля> [--out self-ru.json]
"""
import argparse
import json
import os
import re

# register(NS, { ... }) / register('ns', { ... }) / register(ns, 'ru', ...)
REG_CALL = re.compile(r'register\(\s*(?:"([^"]+)"|\'([^\']+)\'|([A-Za-z_$][\w$]*))\s*,\s*(?:\{|["\']ru["\'])')
ASSIGN = re.compile(r'(?:^|[\s,;({])(?:const\s+|let\s+|var\s+)?%s\s*=\s*["\']([^"\']+)["\']' % r'([A-Za-z_$][\w$]*)')


def self_ru_ns(src):
    """Namespace'ы, которые этот client.js регистрирует как ru."""
    nss = set()
    for m in REG_CALL.finditer(src):
        ns = m.group(1) or m.group(2)
        if ns:
            nss.add(ns)
            continue
        ident = m.group(3)
        if not ident:
            continue
        # const NS = 'dsh-x' / NS = "dsh-x" — любая форма присваивания рядом
        a = re.search(r'%s\s*=\s*["\']([^"\']+)["\']' % re.escape(ident), src)
        if a:
            nss.add(a.group(1))
    return nss


def scan(profile):
    found = set()
    for entry in sorted(os.listdir(profile)):
        full = os.path.join(profile, entry)
        if not os.path.isdir(full):
            continue
        dirs = [full]
        if entry.startswith('@'):
            dirs = [os.path.join(full, s) for s in os.listdir(full)
                    if os.path.isdir(os.path.join(full, s))]
        for p in dirs:
            cjs = os.path.join(p, 'lib', 'client.js')
            if os.path.exists(cjs):
                found |= self_ru_ns(open(cjs, encoding='utf-8', errors='ignore').read())
    return found


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('profile', help='node_modules профиля')
    ap.add_argument('--out', default=None, help='куда писать JSON (по умолчанию печать)')
    args = ap.parse_args()
    nss = scan(args.profile)
    if args.out:
        json.dump(sorted(nss), open(args.out, 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=1)
        print('%d self-ru namespace -> %s' % (len(nss), args.out))
    else:
        for ns in sorted(nss):
            print(ns)


if __name__ == '__main__':
    main()
