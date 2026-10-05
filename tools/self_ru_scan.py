#!/usr/bin/env python3
"""Сканер self-ru namespace'ов: какие плагины уже локализуют себя на русский (#474).

Обходит node_modules профиля, в каждом DSH-плагине ищет регистрации локалей
(`register(NS, {en, ru})`, `register("ns", "ru", ...)`, `locale.register(LOCALE_NS, MESSAGES)`)
и печатает/пишет список namespace'ов, которые плагин держит сам. build.py исключает их:
повторная регистрация ru валит загрузчик чужого плагина («already has locale ru»).

Использование:
    python3 tools/self_ru_scan.py <node_modules профиля> [--out self-ru.json]
"""
import argparse
import glob
import json
import os
import re

REG_OBJ = re.compile(r"""register\(\s*(?:\"([^\"]+)\"|'([^']+)'|([A-Za-z_$][\w$]*))\s*,\s*\{""")
REG_RU = re.compile(r"""register\(\s*(?:\"([^\"]+)\"|'([^']+)'|([A-Za-z_$][\w$]*))\s*,\s*['\"]ru['\"]\s*,""")
REG_VAR_PAIR = re.compile(r'register\(\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\)')


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
        elif c in '"\'\`':
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


def _resolve_const(name, src):
    """Ищет строковое значение константы в коде плагина (#474)."""
    m = re.search(r'(?:const|let|var|export\s+const)\s+' + re.escape(name) + r'\s*=\s*["\']([^"\']+)["\']', src)
    if m:
        return m.group(1)
    m = re.search(r'\b' + re.escape(name) + r'\s*=\s*["\']([^"\']+)["\']', src)
    if m:
        return m.group(1)
    return None


def self_ru_ns(src):
    """Namespace'ы, которые исходный код регистрирует как ru."""
    nss = set()

    # 1. register(ns, "ru", ...) — безусловно
    for m in REG_RU.finditer(src):
        ns = m.group(1) or m.group(2)
        if ns:
            nss.add(ns)
            continue
        const_ns = _resolve_const(m.group(3), src)
        if const_ns:
            nss.add(const_ns)

    # 2. register(NS, { ... }) — только если в объекте есть ru
    for m in REG_OBJ.finditer(src):
        brace = src.find('{', m.end() - 1)
        if brace == -1:
            continue
        body = _object_body(src, brace)
        if not body or not _has_ru(body):
            continue
        ns = m.group(1) or m.group(2)
        if ns:
            nss.add(ns)
            continue
        const_ns = _resolve_const(m.group(3), src)
        if const_ns:
            nss.add(const_ns)

    # 3. register(LOCALE_NS, MESSAGES) где MESSAGES содержит ru (#474)
    for m in REG_VAR_PAIR.finditer(src):
        ns_id, msg_id = m.group(1), m.group(2)
        m_assign = re.search(r'(?:const|let|var|export\s+const)\s+' + re.escape(msg_id) + r'\s*=', src)
        if not m_assign:
            m_assign = re.search(r'\b' + re.escape(msg_id) + r'\s*=', src)
        if m_assign:
            brace = src.find('{', m_assign.end())
            if brace != -1:
                body = _object_body(src, brace)
                if body and _has_ru(body):
                    const_ns = _resolve_const(ns_id, src)
                    if const_ns:
                        nss.add(const_ns)

    return nss


def self_ru_ns_from_plugin(pkg_dir):
    """Находит namespace'ы, которые плагин регистрирует на русский язык."""
    js_files = glob.glob(os.path.join(pkg_dir, 'lib', '*.js')) + glob.glob(os.path.join(pkg_dir, '*.js'))
    if not js_files:
        return set()

    sources = []
    for f in js_files:
        try:
            sources.append(open(f, encoding='utf-8', errors='ignore').read())
        except Exception:
            pass

    combined_src = '\n'.join(sources)
    return self_ru_ns(combined_src)


def scan(profile):
    found = set()
    if not os.path.isdir(profile):
        return found
    for entry in sorted(os.listdir(profile)):
        if entry.startswith('.'):
            continue
        full = os.path.join(profile, entry)
        if not os.path.isdir(full):
            continue
        dirs = [full]
        if entry.startswith('@'):
            dirs = [os.path.join(full, s) for s in sorted(os.listdir(full))
                    if os.path.isdir(os.path.join(full, s))]
        for p in dirs:
            if os.path.basename(p) == 'dsh-russian-lang':
                continue
            found |= self_ru_ns_from_plugin(p)
    return found


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('profile', help='node_modules профиля')
    ap.add_argument('--out', default=None, help='куда писать JSON (по умолчанию печать)')
    args = ap.parse_args()
    nss = scan(args.profile)
    if args.out:
        json.dump(sorted(nss), open(args.out, 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=2)
        print('%d self-ru namespace -> %s' % (len(nss), args.out))
    else:
        for ns in sorted(nss):
            print(ns)


if __name__ == '__main__':
    main()
