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
REG_OBJ = re.compile(r'register\(\s*(?:"([^"]+)"|\'([^\']+)\'|([A-Za-z_$][\w$]*))\s*,\s*\{')
REG_RU = re.compile(r'register\(\s*(?:"([^"]+)"|\'([^\']+)\'|([A-Za-z_$][\w$]*))\s*,\s*["\']ru["\']\s*,')


def _object_body(src, open_brace):
    """Сбалансированный объект, начиная с '{'."""
    depth, i, in_str, quote, esc = 0, open_brace, False, '', False
    while i < len(src):
        c = src[i]
        if in_str:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == quote:
                in_str = False
        elif c in '"\'`':
            in_str, quote = True, c
        elif c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return src[open_brace:i + 1]
        i += 1
    return None


def _has_ru(obj):
    """Объект локали содержит ru — как ключ (ru: {...}) или shorthand (ru)."""
    return re.search(r'\bru\s*(?::|\s*[,}])', obj) is not None


def self_ru_ns(src):
    """Namespace'ы, которые этот client.js регистрирует как ru."""
    nss = set()
    # register(ns, "ru", ...) — безусловно
    for m in REG_RU.finditer(src):
        ns = m.group(1) or m.group(2)
        if ns:
            nss.add(ns)
            continue
        a = re.search(r'%s\s*=\s*["\']([^"\']+)["\']' % re.escape(m.group(3)), src)
        if a:
            nss.add(a.group(1))
    # register(NS, { ... }) — только если в объекте есть ru
    for m in REG_OBJ.finditer(src):
        brace = src.index('{', m.end() - 1)
        body = _object_body(src, brace)
        if not body or not _has_ru(body):
            continue
        ns = m.group(1) or m.group(2)
        if ns:
            nss.add(ns)
            continue
        a = re.search(r'%s\s*=\s*["\']([^"\']+)["\']' % re.escape(m.group(3)), src)
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
