#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Тесты для QA-детектора переполнения верстки (test/overflow.py)."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import overflow

FAILS = []

def check(cond, label):
    print(('ok   ' if cond else 'FAIL ') + label)
    if not cond:
        FAILS.append(label)

# 1. Элемент с русским текстом, где scrollWidth > clientWidth
sample_overflow = {
    'tag': 'button',
    'selector': 'button.primary',
    'text': 'Сохранить все изменения',
    'clientWidth': 100,
    'scrollWidth': 140,
    'hasEllipsis': True
}
res1 = overflow.analyze_element_overflow(sample_overflow, threshold=2)
check(res1 is not None and res1['diff'] == 40, 'overflow: детектирует превышение scrollWidth')

# 2. Нормальный элемент без переполнения
sample_ok = {
    'tag': 'button',
    'selector': 'button.cancel',
    'text': 'Отмена',
    'clientWidth': 100,
    'scrollWidth': 80,
    'hasEllipsis': False
}
res2 = overflow.analyze_element_overflow(sample_ok, threshold=2)
check(res2 is None, 'overflow: нормальный элемент не помечается ошибкой')

# 3. Элемент без русского текста игнорируется
sample_en = {
    'tag': 'button',
    'selector': 'button.en',
    'text': 'Save and continue to next step',
    'clientWidth': 100,
    'scrollWidth': 200,
    'hasEllipsis': True
}
res3 = overflow.analyze_element_overflow(sample_en, threshold=2)
check(res3 is None, 'overflow: латиница без кириллицы игнорируется')

# 4. Формирование Markdown отчёта
rep = overflow.format_markdown_report([res1])
check('QA Отчёт' in rep and 'button.primary' in rep, 'overflow: корректный markdown отчёт')

print()
if FAILS:
    print('ПРОВАЛЕНО: %d' % len(FAILS))
    sys.exit(1)
print('Все тесты детектора переполнения верстки пройдены.')
