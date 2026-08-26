#!/usr/bin/env python3
"""Тесты инструментов: mt_fallback, merge_freq, self_ru_scan, freq_refresh,
upstream_check (diff/report). Запуск: python3 test/test_tools.py
Требований к сети и профилю нет — только фикстуры."""
import importlib.util
import json
import os
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
TOOLS = os.path.join(REPO, 'tools')


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


FAILS = []


def check(cond, label):
    print(('ok   ' if cond else 'FAIL ') + label)
    if not cond:
        FAILS.append(label)


# ---------- mt_fallback ----------
mt = load('mt_fallback', os.path.join(TOOLS, 'mt_fallback.py'))

check(mt.ph_ok('Hello {name}!', 'Привет, {name}!'), 'ph_ok: совпадающие плейсхолдеры')
check(not mt.ph_ok('Confirm install', 'Подтвердите установку {placeholder}'),
      'ph_ok: лишний {placeholder} отбраковывается')
check(not mt.ph_ok('Updated {when}', 'Обновлено'), 'ph_ok: потерянный плейсхолдер ловится')
check(mt.ph_set('{a}{b} текст') == {'a', 'b'}, 'ph_set: множество из строки')

# pending_keys: en есть, ru нет -> в списке; ключ с ручным переводом -> нет
tmp = tempfile.mkdtemp(prefix='mt-test-')
os.makedirs(os.path.join(tmp, 'upstream'))
en_path = os.path.join(tmp, 'upstream', 'core-en.json')
json.dump({'nsA': {'greet': 'Hello', 'bye': 'Bye'}}, open(en_path, 'w', encoding='utf-8'))
os.makedirs(os.path.join(tmp, 'ru'))
json.dump({'nsA': {'greet': 'Привет'}},
          open(os.path.join(tmp, 'ru', 'x.json'), 'w', encoding='utf-8'))
mt.REPO = tmp
en = mt.en_dict()
check(en == {'nsA': {'greet': 'Hello', 'bye': 'Bye'}}, 'en_dict читает core-en.json')
ru = mt.ru_dict()
p = mt.pending_keys(ru)
check(p == {'nsA': ['bye']}, 'pending_keys: только непереведённые')

# apply_mt с фейковым провайдером: PH-mismatch ретраится и отбрасывается,
# хороший перевод пишется; реестр сохраняется инкрементально
calls = {'n': 0}
def flaky(en_text):
    calls['n'] += 1
    if calls['n'] % 2 == 1:
        return 'Мусор {placeholder}'  # первая попытка — битый PH
    return {'Hello': 'Привет', 'Bye': 'Пока'}[en_text]

mt.REGISTRY = os.path.join(tmp, 'registry.json')
changed = mt.apply_mt({'nsA': ['greet', 'bye']}, api_key=None, call=flaky)
reg = json.load(open(mt.REGISTRY, encoding='utf-8'))
check(changed == 2, 'apply_mt: оба ключа переведены после retry')
check(reg['nsA']['greet']['ru'] == 'Привет' and reg['nsA']['bye']['ru'] == 'Пока',
      'apply_mt: корректные строки в реестре')
check(calls['n'] >= 3, 'apply_mt: был retry при битом PH (%d вызовов)' % calls['n'])

# провайдер всегда врёт -> ни один ключ не записан
def always_bad(en_text):
    return 'Битый {placeholder}'
json.dump({}, open(mt.REGISTRY, 'w', encoding='utf-8'))  # очистить реестр
changed5 = mt.apply_mt({'nsA': ['bye']}, api_key=None, call=always_bad)
reg2 = json.load(open(mt.REGISTRY, encoding='utf-8'))
check(changed5 == 0 and reg2.get('nsA', {}).get('bye') is None,
      'apply_mt: вечный PH-mismatch не попадает в реестр')

# ---------- self_ru_scan ----------
srs = load('self_ru_scan', os.path.join(TOOLS, 'self_ru_scan.py'))
src_double = "const NS = \"dsh-gitea\";\nctx.locale.register(NS, { en, ru });"
src_single = "let NS = 'dsh-spendmeter'\nlocale.register(NS, { en, ru })"
src_literal = 'ctx.locale.register("dsh-market", "ru", dict)'
src_none = "register('other', { en })"
check(srs.self_ru_ns(src_double) == {'dsh-gitea'}, 'self_ru_scan: двойные кавычки')
check(srs.self_ru_ns(src_single) == {'dsh-spendmeter'}, 'self_ru_scan: одинарные кавычки')
check('dsh-market' in srs.self_ru_ns(src_literal), 'self_ru_scan: register(ns,"ru",..)')
# Сканер консервативен: register(ns, {...}) ловится всегда (перестраховка -
# лучше исключить лишний ns, чем уронить чужой плагин).
check(srs.self_ru_ns(src_none) == {'other'}, 'self_ru_scan: любой register(ns,{..}) ловится')

# ---------- merge_freq ----------
mf = load('merge_freq', os.path.join(TOOLS, 'merge_freq.py'))
words = mf.ru_words()
check(isinstance(words, set), 'merge_freq: возвращает множество слов')
check(all(len(w) >= 3 for w in words), 'merge_freq: слова не короче 3 букв')
check(not (words & mf.STOP), 'merge_freq: стоп-слова отфильтрованы')

# ---------- freq_refresh ----------
fr = load('freq_refresh', os.path.join(TOOLS, 'freq_refresh.py'))
sample = '\n'.join(['слово 100', 'два 90', 'а 80', 'english 70', 'ёшкин 60', 'кот 50'])
got = fr.top_words(sample, 10)
check(got[:3] == ['слово', 'два', 'ёшкин'], 'freq_refresh: фильтр кириллицы и длины')
check(all(w for w in got), 'freq_refresh: нет пустых')

# ---------- upstream_check (diff) ----------
uc = load('upstream_check', os.path.join(TOOLS, 'upstream_check.py'))
prev = {'ns': {'a': '1', 'b': '2', 'gone': '3'}}
curr = {'ns': {'a': '1', 'b2': '2x', 'c': '3'}}
added, removed, untranslated = uc.diff(prev, curr, {'ns': {'a': 'раз'}})
check(added.get('ns') == ['b2', 'c'], 'diff: новые ключи')
check(removed.get('ns') == ['b', 'gone'], 'diff: удалённые ключи')
check(untranslated.get('ns') == ['b2', 'c'], 'diff: непереведённые')

rep = uc.report_md('9.9.9', added, removed, untranslated)
check('Новых ключей: **2**' in rep and 'удалённых: **2**' in rep, 'report_md: счётчики')

# ---------- итог ----------
print()
if FAILS:
    print('ПРОВАЛЕНО: %d' % len(FAILS))
    sys.exit(1)
print('Все проверки инструментов пройдены.')
