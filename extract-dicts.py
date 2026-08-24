#!/usr/bin/env python3
"""Извлечь английские словари из установленных бандлов.

Использование:
    python3 extract-dicts.py <node_modules ядра> [node_modules профиля]

    node_modules ядра    — каталог, где лежит @deepseek-ai/* (дистрибутив dsh)
    node_modules профиля — каталог node_modules профиля dsh со сторонними
                           плагинами (необязательный)

Пишет рядом со скриптом:
    core-en.json     — namespace'ы ядра (@deepseek-ai/*)
    plugins-en.json  — namespace'ы сторонних плагинов профиля

Это исходники для перевода и база для сверки: check-coverage.py сравнивает их
с ru/ и ru-plugins/ и показывает, что появилось нового.

Поддерживаются все формы регистрации, которые встречаются в живых бандлах:

    register(NS, { zh, en })                     ссылки на объявленные объекты
    register(NS, { zh: ve, en: xe })             минифицированные имена
    register("job", { zh: {...}, en: {...} })    литеральный namespace
    register(NS, "en", en)                       пофазовая форма, идентификатор
    register(NS, "en", { ... })                  пофазовая форма, литерал
    register(NS, { en: { ...en, ...extra.en } }) объединение через spread

    Identifier (NS) resolves through the surrounding `NS = "ns"`-style assignment
    in either single or double quotes; both quoting styles are recognised.
    for ([locale, dict] of pairs) register(NS, locale, dict)   цикл по парам
"""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKIP = ('dsh-russian-lang',)         # свой же плагин переводить не надо

ASSIGN_STR = re.compile(r"""([A-Za-z_$][\w$]*)\s*=\s*(?:"((?:[^"\\]|\\.){2,60})"|'((?:[^'\\]|\\.){2,60})')""")
PAIR = re.compile(r'''(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$.-]*))\s*:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')''')
REF_PAIR = re.compile(r'"([^"]+)"\s*:\s*([A-Za-z_$][\w$]*)\["([^"]+)"\]')


def object_at(src, brace):
    depth, i, in_str, quote, esc = 0, brace, False, '', False
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
                return src[brace:i + 1]
        i += 1
    return None


def object_by_ident(src, ident, depth=0):
    for m in re.finditer(r'(?:^|[\s,;({])%s\s*=\s*\{' % re.escape(ident), src):
        body = object_at(src, m.end() - 1)
        if body and PAIR.search(body):
            return body
    # Псевдоним: `const en = copy;` — идём по цепочке.
    if depth < 3:
        alias = re.search(r'(?:const|let|var)\s+%s\s*=\s*([A-Za-z_$][\w$]*)\s*;' % re.escape(ident), src)
        if alias:
            return object_by_ident(src, alias.group(1), depth + 1)
    return None


def parse_dict(text, src=None):
    out = {}
    if src:
        for m in REF_PAIR.finditer(text or ''):
            donor = object_by_ident(src, m.group(2))
            value = parse_dict(donor).get(m.group(3)) if donor else None
            if value is not None:
                out[m.group(1)] = value
    for m in PAIR.finditer(text or ''):
        key = m.group(1) or m.group(2) or m.group(3)
        if key in ('zh', 'en'):
            continue
        val = m.group(4) or m.group(5)
        try:
            out[key] = json.loads('"' + val + '"')
        except Exception:
            out[key] = val
    return out


def resolve_en(src, body):
    out = {}
    inline = re.search(r'\ben\s*:\s*\{', body)
    if inline:
        chunk = object_at(body, inline.end() - 1)
        out.update(parse_dict(chunk, src))
        for sm in re.finditer(r'\.\.\.\s*([A-Za-z_$][\w$]*)(?:\.([A-Za-z_$][\w$]*))?', chunk or ''):
            donor = object_by_ident(src, sm.group(1))
            if donor is None:
                continue
            if sm.group(2):
                inner = re.search(r'\b%s\s*:\s*\{' % re.escape(sm.group(2)), donor)
                donor = object_at(donor, inner.end() - 1) if inner else None
            out.update(parse_dict(donor))
        return out
    ref = re.search(r'\ben\s*(?::\s*([\w$]+))?\s*[,}]', body)
    if ref:
        out.update(parse_dict(object_by_ident(src, ref.group(1) or 'en'), src))
    return out


def harvest(paths):
    result = {}
    for path in sorted(set(paths)):
        if any(s in path for s in SKIP):
            continue
        src = open(path, encoding='utf-8', errors='ignore').read()
        names = {}
        for m in ASSIGN_STR.finditer(src):
            val = m.group(2) or m.group(3)
            if val:
                names[m.group(1)] = val

        for m in re.finditer(r'locale\.register\(\s*(?:"([^"]+)"|([A-Za-z_$][\w$]*))\s*,\s*', src):
            ns = m.group(1) or names.get(m.group(2) or '')
            if not ns:
                continue
            tail = src[m.end():m.end() + 60]

            single = re.match(r'"(zh|en)"\s*,\s*', tail)
            if single:
                if single.group(1) != 'en':
                    continue
                rest = tail[single.end():]
                if rest.lstrip().startswith('{'):
                    result.setdefault(ns, {}).update(
                        parse_dict(object_at(src, src.index('{', m.end() + single.end())), src))
                else:
                    ident = re.match(r'([A-Za-z_$][\w$]*)', rest.lstrip())
                    if ident:
                        result.setdefault(ns, {}).update(parse_dict(object_by_ident(src, ident.group(1)), src))
                continue

            if tail.lstrip().startswith('{'):
                body = object_at(src, src.index('{', m.end()))
                if body:
                    result.setdefault(ns, {}).update(resolve_en(src, body))

        # цикл по парам [locale, dict]
        if re.search(r'register\(\s*[\w$]+\s*,\s*locale\s*,\s*dict\s*\)', src):
            ns = names.get('LOCALE_NS')
            if ns:
                for pm in re.finditer(r'\[\s*"en"\s*,\s*\{', src):
                    result.setdefault(ns, {}).update(parse_dict(object_at(src, src.index('{', pm.end() - 1)), src))
    return result


def dump(data, name):
    path = os.path.join(HERE, name)
    json.dump(data, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    print('%-18s namespace-ов %-3d ключей %d' % (name, len(data), sum(len(v) for v in data.values())))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    core_root = sys.argv[1].rstrip('/\\')
    dump(harvest(glob.glob(os.path.join(core_root, '@deepseek-ai', '*', 'lib', 'client.js'))),
         'core-en.json')
    plugin_paths = []
    if len(sys.argv) > 2:
        prof = sys.argv[2].rstrip('/\\')
        for g in ('*/lib/client.js', '@*/*/lib/client.js', '*/client/client.js'):
            plugin_paths += glob.glob(os.path.join(prof, g))
    dump(harvest(plugin_paths), 'plugins-en.json')
