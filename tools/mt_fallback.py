#!/usr/bin/env python3
"""MT-fallback: машинный перевод недостающих ключей с реестром и очередью ревью.

Ключи без ручного перевода переводятся дешёвой моделью OpenRouter и пишутся в
`mt-registry.json` (служебный файл; в бандл попадает только строка перевода —
build.py подхватывает её как обычный ключ). Ручная правка в ru/*.json имеет
приоритет: если ключ появился в ru-словаре, запись реестра игнорируется.

Использование:
    python3 tools/mt_fallback.py --dry-run       # непереведённые ключи
    OPENROUTER_API_KEY=... python3 tools/mt_fallback.py --apply   # MT -> реестр
    python3 tools/mt_fallback.py --review        # очередь ревью -> upstream/review-queue.md

Модель: env MT_MODEL (по умолчанию inclusionai/ling-3.0-flash:free).
"""
import argparse
import glob
import json
import os
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
REGISTRY = os.path.join(REPO, 'mt-registry.json')
REVIEW = os.path.join(REPO, 'upstream', 'review-queue.md')

MODEL = os.environ.get('MT_MODEL', 'inclusionai/ling-3.0-flash:free')
BASE_URL = os.environ.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')


def _load_merged(paths):
    out = {}
    for path in paths:
        if os.path.exists(path):
            for ns, entries in json.load(open(path, encoding='utf-8')).items():
                out.setdefault(ns, {}).update(entries)
    return out


def en_dict():
    return _load_merged([
        os.path.join(REPO, 'upstream', 'core-en.json'),
        os.path.join(REPO, 'plugins-en.json'),
    ])


def ru_dict():
    return _load_merged(
        sorted(glob.glob(os.path.join(REPO, 'ru', '*.json')))
        + sorted(glob.glob(os.path.join(REPO, 'ru-plugins', '*.json')))
    )


def pending_keys(ru):
    en = en_dict()
    out = {}
    for ns, entries in en.items():
        missing = sorted(k for k in entries if k not in ru.get(ns, {}))
        if missing:
            out[ns] = missing
    return out


def mt_call(en_text, api_key, model):
    url = BASE_URL.rstrip('/') + '/chat/completions'
    body = json.dumps({
        'model': model,
        'messages': [
            {'role': 'system', 'content': 'Translate the following UI string to natural Russian. Return only the translation, keep {placeholders} intact, do not add quotes.'},
            {'role': 'user', 'content': en_text},
        ],
        'temperature': 0.2,
    }).encode('utf-8')
    req = urllib.request.Request(url, data=body, method='POST')
    req.add_header('Authorization', 'Bearer ' + api_key)
    req.add_header('Content-Type', 'application/json')
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)['choices'][0]['message']['content'].strip()


def apply_mt(pending, api_key):
    registry = json.load(open(REGISTRY, encoding='utf-8')) if os.path.exists(REGISTRY) else {}
    en = en_dict()
    changed = errors = 0
    for ns, keys in sorted(pending.items()):
        for key in keys:
            if key in registry.get(ns, {}):
                continue
            try:
                ru = mt_call(en[ns][key], api_key, MODEL)
            except Exception as err:
                errors += 1
                print('  ERROR %s.%s: %s' % (ns, key, err))
                continue
            registry.setdefault(ns, {})[key] = {
                'ru': ru, 'en': en[ns][key], 'model': MODEL,
                'at': time.strftime('%Y-%m-%dT%H:%M:%S'),
            }
            changed += 1
            print('  %s.%s = %s' % (ns, key, ru))
            time.sleep(0.4)
    json.dump(registry, open(REGISTRY, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    print('MT: +%d переводов, ошибок %d' % (changed, errors))
    return changed


def review_queue(ru):
    registry = json.load(open(REGISTRY, encoding='utf-8')) if os.path.exists(REGISTRY) else {}
    os.makedirs(os.path.dirname(REVIEW), exist_ok=True)
    lines = ['# Очередь ревью машинных переводов', '',
             'Ключи, переведённые автоматически. Замените вручную в ru/*.json / '
             'ru-plugins/*.json — после появления ручного перевода запись реестра '
             'игнорируется.', '']
    total = 0
    for ns in sorted(registry):
        for key in sorted(registry[ns]):
            if key in ru.get(ns, {}):
                continue
            total += 1
            lines.append('- `%s.%s`: %s (модель: %s)'
                         % (ns, key, registry[ns][key]['ru'], registry[ns][key].get('model', '?')))
    if total:
        lines.append('')
        lines.append('Итого к выверке: %d' % total)
    open(REVIEW, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print('очередь ревью: %d ключей -> %s' % (total, REVIEW))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--review', action='store_true')
    args = ap.parse_args()

    ru = ru_dict()
    if args.dry_run or not (args.apply or args.review):
        p = pending_keys(ru)
        for ns, keys in sorted(p.items()):
            for k in keys:
                print('%s.%s' % (ns, k))
        print('непереведённых: %d' % sum(len(v) for v in p.values()))
        return 0 if args.dry_run else 2

    if args.apply:
        api_key = os.environ.get('OPENROUTER_API_KEY')
        if not api_key:
            print('OPENROUTER_API_KEY не задан', file=sys.stderr)
            return 2
        apply_mt(pending_keys(ru), api_key)
        return 0

    if args.review:
        review_queue(ru)
        return 0
    return 2


if __name__ == '__main__':
    sys.exit(main())
