#!/usr/bin/env python3
"""Обновить частотный словарь для фикса раскладки одной командой.

Скачивает топ-50k русского FrequencyWords (hermitdave/FrequencyWords),
берёт первые --top слов (только кириллица, длина >= 2) и перезаписывает
tools/ru-freq.json. Доменные слова DSH добавляются следом через
tools/merge_freq.py (вызывается автоматически).

Использование:
    python3 tools/freq_refresh.py [--top 8000]
"""
import argparse
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
FREQ = os.path.join(HERE, 'ru-freq.json')
URL = ('https://raw.githubusercontent.com/hermitdave/FrequencyWords/'
       'master/content/2018/ru/ru_50k.txt')
WORD = re.compile(r'^[а-яё]+$')


def download(url, timeout=60):
    with urllib.request.urlopen(url, timeout=timeout) as resp:
        return resp.read().decode('utf-8', errors='ignore')


def top_words(text, top):
    words = []
    for line in text.splitlines():
        w = line.split()[0] if line.split() else ''
        if len(w) >= 2 and WORD.match(w):
            words.append(w)
            if len(words) >= top:
                break
    return words


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--top', type=int, default=8000)
    args = ap.parse_args()

    print('скачиваю %s ...' % URL)
    try:
        text = download(URL)
    except Exception as err:
        print('не удалось скачать: %s' % err, file=sys.stderr)
        return 1
    words = top_words(text, args.top)
    if len(words) < 1000:
        print('подозрительно мало слов (%d), не записываю' % len(words), file=sys.stderr)
        return 1
    json.dump(words, open(FREQ, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('база: %d слов -> %s' % (len(words), FREQ))

    # доменные слова DSH поверх базы
    merge = os.path.join(HERE, 'merge_freq.py')
    if os.path.exists(merge):
        import subprocess
        r = subprocess.run([sys.executable, merge], cwd=REPO)
        return r.returncode
    return 0


if __name__ == '__main__':
    sys.exit(main())
