#!/usr/bin/env python3
"""Доменные слова для детектора раскладки.

Дополняет tools/ru-freq.json словами из собственных русских переводов плагина
(ru/*.json + ru-plugins/*.json). Так детектор раскладки узнаёт DSH-термины,
которых нет в частотном списке («рабочая сессия», «настройки», «анализировать»).

Использование:
    python3 tools/merge-domain-words.py
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
FREQ = os.path.join(HERE, 'ru-freq.json')
RU_DIRS = ('ru', 'ru-plugins')

WORD = re.compile(r'[а-яё]{3,}')

# Слова-стоп, которые не являются самостоятельными терминами для детектора.
STOP = {
    'и', 'в', 'не', 'на', 'что', 'с', 'по', 'для', 'это', 'как', 'от', 'из',
    'или', 'если', 'при', 'о', 'к', 'у', 'а', 'но', 'то', 'все', 'его', 'их',
    'вы', 'мы', 'он', 'она', 'они', 'быть', 'есть', 'нет', 'так', 'уже',
    'только', 'можно', 'нужно', 'будет', 'будет', 'также', 'ещё', 'даже',
    'чтобы', 'этого', 'этот', 'эта', 'это', 'который', 'которых', 'которые',
    'свои', 'своей', 'своих', 'самый', 'сама', 'само', 'менее', 'более',
}


def ru_words():
    seen = set()
    for d in RU_DIRS:
        base = os.path.join(REPO, d)
        for name in sorted(os.listdir(base)):
            if not name.endswith('.json'):
                continue
            data = json.load(open(os.path.join(base, name), encoding='utf-8'))
            for ns, entries in data.items():
                for key, value in entries.items():
                    if not isinstance(value, str):
                        continue
                    for w in WORD.findall(value.lower()):
                        if w not in STOP:
                            seen.add(w)
    return seen


def main():
    freq = json.load(open(FREQ, encoding='utf-8'))
    have = set(freq)
    added = []
    for w in sorted(ru_words()):
        if w not in have:
            freq.append(w)
            added.append(w)
            have.add(w)
    json.dump(freq, open(FREQ, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('freq: %d слов (+%d доменных)' % (len(freq), len(added)))


if __name__ == '__main__':
    main()
