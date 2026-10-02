#!/usr/bin/env python3
"""Тесты инструментов: mt_fallback, merge_freq, self_ru_scan, freq_refresh,
upstream_check (diff/report). Запуск: python3 test/test_tools.py
Требований к сети и профилю нет — только фикстуры."""
import collections
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
src_shorthand = "register('other2', { en, ru })"
check(srs.self_ru_ns(src_double) == {'dsh-gitea'}, 'self_ru_scan: двойные кавычки')
check(srs.self_ru_ns(src_single) == {'dsh-spendmeter'}, 'self_ru_scan: одинарные кавычки')
check('dsh-market' in srs.self_ru_ns(src_literal), 'self_ru_scan: register(ns,"ru",..)')
# register(ns,{en}) без ru — НЕ self-ru
check(srs.self_ru_ns(src_none) == set(), 'self_ru_scan: {en} без ru не ловится')
# register(ns,{en,ru}) shorthand с ru — ловится
check(srs.self_ru_ns(src_shorthand) == {'other2'}, 'self_ru_scan: {en,ru} shorthand ловится')

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
prev = {'ns': {'a': '1', 'b': '2', 'gone': '3'}, 'vanished_ns': {'k1': 'v1', 'k2': 'v2'}}
curr = {'ns': {'a': '1', 'b2': '2x', 'c': '3'}}
added, removed, untranslated = uc.diff(prev, curr, {'ns': {'a': 'раз'}})
check(added.get('ns') == ['b2', 'c'], 'diff: новые ключи')
check(removed.get('ns') == ['b', 'gone'], 'diff: удалённые ключи')
check(removed.get('vanished_ns') == ['k1', 'k2'], 'diff: полностью удалённый namespace попадает в removed (#425)')
check(untranslated.get('ns') == ['b2', 'c'], 'diff: непереведённые')

rep = uc.report_md('9.9.9', added, removed, untranslated)
check('Новых ключей: **2**' in rep and 'удалённых: **4**' in rep, 'report_md: счётчики')

# ---------- term_check ----------
tc = load('term_check', os.path.join(TOOLS, 'term_check.py'))
en_fix = {'ns1': {'save': 'Save'}, 'ns2': {'submit': 'Save'}}
ru_fix = {'ns1': {'save': 'Сохранить'}, 'ns2': {'submit': 'Отправить'}}
idx = collections.defaultdict(list)
for ns, entries in en_fix.items():
    for key, en_text in entries.items():
        idx[en_text.strip()].append((ns, key, ru_fix[ns][key]))
variants = {en_text: len({r for _, _, r in uses}) for en_text, uses in idx.items()}
check(variants['Save'] == 2, 'term_check: одно en — два разных ru ловится')


# ---------- term_check (glossary validation) ----------
sample_glossary = {
    'terms': {
        'prompt': {
            'canonical': 'Промпт',
            'forbidden': ['Затравка', 'Побуждение']
        }
    }
}
clean_ru = {'ns1': {'p': 'Введите системный промпт'}}
bad_ru = {'ns1': {'p': 'Введите системную затравку'}}

check(len(tc.validate_glossary(clean_ru, sample_glossary)) == 0,
      'term_check.validate_glossary: чистый словарь проходит')
bad_hits = tc.validate_glossary(bad_ru, sample_glossary)
check(len(bad_hits) == 1 and bad_hits[0][3] == 'Затравка',
      'term_check.validate_glossary: запрещённый термин ловится')

# ---------- mt_autofill ----------
ma = load('mt_autofill', os.path.join(TOOLS, 'mt_autofill.py'))
prev_fix = {'nsA': {'old': 'x'}}
curr_fix = {'nsA': {'old': 'x', 'new1': 'y', 'new2': 'z'}}
added_fix = ma.new_keys(prev_fix, curr_fix)
check(added_fix == {'nsA': ['new1', 'new2']}, 'mt_autofill: новые ключи')
check(ma.new_keys({'nsA': {'a': '1'}}, {'nsA': {'a': '1'}}) == {}, 'mt_autofill: без новых пусто')

# ---------- итог ----------
print()

# ---------- lint_translations ----------
import lint_translations as lt

clean_en = {'ns1': {'hello': 'Hello {user}'}}
clean_ru = {'ns1': {'hello': 'Привет, {user}'}}
broken_ph_ru = {'ns1': {'hello': 'Привет, {wrong}'}}

check(len(lt.lint_placeholders(clean_en, clean_ru)) == 0, 'lint_translations: чистые плейсхолдеры проходят')
ph_errs = lt.lint_placeholders(clean_en, broken_ph_ru)
check(len(ph_errs) == 1 and ph_errs[0][0] == 'PH_MISMATCH', 'lint_translations: ловит несоответствие плейсхолдеров')

sample_glo = {'terms': {'subagent': {'canonical': 'Субагент', 'forbidden': ['Подагент']}}}
bad_term_ru = {'ns1': {'sub': 'Это вспомогательный подагент'}}
glo_errs = lt.lint_glossary(bad_term_ru, sample_glo)
check(len(glo_errs) == 1 and glo_errs[0][0] == 'FORBIDDEN_TERM', 'lint_translations: ловит запрещённый термин')



# ---------- mt_autofill: первый запуск без базового среза (#136) ----------
import shutil
import subprocess

with tempfile.TemporaryDirectory() as td:
    repo = os.path.join(td, 'repo')
    os.makedirs(os.path.join(repo, 'upstream'))
    os.makedirs(os.path.join(repo, 'tools'))
    for name in ('mt_autofill.py', 'mt_fallback.py'):
        shutil.copy(os.path.join(TOOLS, name), os.path.join(repo, 'tools', name))
    plugins_en = {'ns1': {'a': 'Alpha', 'b': 'Beta'}}
    with open(os.path.join(repo, 'plugins-en.json'), 'w', encoding='utf-8') as fh:
        json.dump(plugins_en, fh, ensure_ascii=False)
    with open(os.path.join(repo, 'mt-registry.json'), 'w', encoding='utf-8') as fh:
        json.dump({}, fh)
    snapshot = os.path.join(repo, 'upstream', 'plugins-snapshot.json')

    # Ключа намеренно нет: база среза перевода не требует, значит и ключ для
    # неё не нужен — раньше проверка ключа стояла выше и обрывала первый запуск.
    env = dict(os.environ)
    env.pop('OPENROUTER_API_KEY', None)
    run = subprocess.run([sys.executable, os.path.join(repo, 'tools', 'mt_autofill.py')],
                         capture_output=True, text=True, env=env)
    check(run.returncode == 0, 'mt_autofill: первый запуск без API-ключа завершается успешно')
    check(os.path.exists(snapshot), 'mt_autofill: первый запуск создаёт базовый срез')
    if os.path.exists(snapshot):
        base = json.load(open(snapshot, encoding='utf-8'))
        check(base == plugins_en, 'mt_autofill: база среза равна текущему plugins-en.json')
        raw = open(snapshot, 'rb').read()
        check(chr(13).encode() not in raw, 'mt_autofill: срез пишется с LF, без CRLF (#137)')

    # Повторный прогон видит только реальную разницу, а не «всё новое».
    import importlib.util as _ilu
    _spec = _ilu.spec_from_file_location('mt_autofill_mod', os.path.join(repo, 'tools', 'mt_autofill.py'))
    _mod = _ilu.module_from_spec(_spec)
    sys.modules['mt_autofill_mod'] = _mod
    try:
        _spec.loader.exec_module(_mod)
        delta = _mod.new_keys(plugins_en, {'ns1': {'a': 'Alpha', 'b': 'Beta', 'c': 'Gamma'}})
        check(delta == {'ns1': ['c']}, 'mt_autofill: дельта — только добавленный ключ')
    except SystemExit:
        check(False, 'mt_autofill: модуль импортируется без побочных эффектов')


# ---------- mt-registry: статус вычитки (#135) ----------
registry = json.load(open(os.path.join(REPO, 'mt-registry.json'), encoding='utf-8'))
recs = [r for ns in registry for r in registry[ns].values()]
check(bool(recs), 'mt-registry: реестр не пуст')
check(all(isinstance(r, dict) and 'status' in r for r in recs),
      'mt-registry: у каждой записи есть поле status')
check(all(r.get('status') in ('draft', 'reviewed') for r in recs),
      'mt-registry: status принимает только draft или reviewed')

# (Early FAILS gate moved to final end of file)

# ---------- export_i18n / import_i18n ----------
import export_i18n as exp
import import_i18n as imp

sample_en = {'ns1': {'greeting': 'Hello {name}', 'farewell': 'Goodbye'}}
sample_ru = {'ns1': {'greeting': 'Привет, {name}', 'farewell': 'До свидания'}}

# PO roundtrip
po_data = exp.export_po(sample_en, sample_ru)
po_parsed = imp.parse_po(po_data)
check(po_parsed.get('ns1', {}).get('greeting') == 'Привет, {name}', 'export/import PO: сохраняет плейсхолдеры и строки')
check(po_parsed.get('ns1', {}).get('farewell') == 'До свидания', 'export/import PO: сохраняет простые строки')

# XLIFF roundtrip
xlf_data = exp.export_xliff(sample_en, sample_ru)
xlf_parsed = imp.parse_xliff(xlf_data)
check(xlf_parsed.get('ns1', {}).get('greeting') == 'Привет, {name}', 'export/import XLIFF: сохраняет плейсхолдеры и строки')

# CSV roundtrip
csv_data = exp.export_csv(sample_en, sample_ru)
csv_parsed = imp.parse_csv(csv_data)
check(csv_parsed.get('ns1', {}).get('greeting') == 'Привет, {name}', 'export/import CSV: сохраняет плейсхолдеры и строки')

# Issue #406: import_i18n --dry-run does not overwrite or create output file
import tempfile, subprocess
with tempfile.TemporaryDirectory() as tmpdir:
    in_csv = os.path.join(tmpdir, 'in.csv')
    with open(in_csv, 'w', encoding='utf-8') as f:
        f.write(csv_data)

    # 1. Non-existent output with --dry-run must NOT be created
    out_nonexistent = os.path.join(tmpdir, 'out_dry.json')
    res = subprocess.run([
        sys.executable,
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools', 'import_i18n.py'),
        '--format', 'csv',
        '--input', in_csv,
        '--dry-run',
        '--out-json', out_nonexistent
    ], capture_output=True, text=True)
    check(res.returncode == 0, 'import_i18n --dry-run завершается с кодом 0')
    check(not os.path.exists(out_nonexistent), 'import_i18n: --dry-run не создаёт несуществующий файл')

    # 2. Existing output with --dry-run must retain exact byte content
    out_existing = os.path.join(tmpdir, 'out_exist.json')
    original_bytes = b'{"pre_existing": true, "untouched": 123}'
    with open(out_existing, 'wb') as f:
        f.write(original_bytes)

    res = subprocess.run([
        sys.executable,
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools', 'import_i18n.py'),
        '--format', 'csv',
        '--input', in_csv,
        '--dry-run',
        '--out-json', out_existing
    ], capture_output=True, text=True)
    with open(out_existing, 'rb') as f:
        current_bytes = f.read()
    check(current_bytes == original_bytes, 'import_i18n: --dry-run не изменяет существующий файл (байт-в-байт)')

    # 3. Regular run without --dry-run writes valid json
    res = subprocess.run([
        sys.executable,
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools', 'import_i18n.py'),
        '--format', 'csv',
        '--input', in_csv,
        '--out-json', out_existing
    ], capture_output=True, text=True)
    with open(out_existing, 'r', encoding='utf-8') as f:
        loaded = json.load(f)
    check(loaded.get('ns1', {}).get('greeting') == 'Привет, {name}', 'import_i18n: запись без --dry-run сохраняет валидный JSON')


# Issue #418: import_i18n placeholder validation
bad_ru = {'ns1': {'greeting': 'Привет, {wrong}', 'farewell': 'До свидания'}}
bad_po = exp.export_po(sample_en, bad_ru)
po_val_failed = False
try:
    imp.parse_po(bad_po, validate=True)
except ValueError as e:
    po_val_failed = True
check(po_val_failed, 'import_i18n: parse_po выбрасывает ValueError при несовпадении плейсхолдеров')

bad_xlf = exp.export_xliff(sample_en, bad_ru)
xlf_val_failed = False
try:
    imp.parse_xliff(bad_xlf, validate=True)
except ValueError as e:
    xlf_val_failed = True
check(xlf_val_failed, 'import_i18n: parse_xliff выбрасывает ValueError при несовпадении плейсхолдеров')

bad_csv = exp.export_csv(sample_en, bad_ru)
csv_val_failed = False
try:
    imp.parse_csv(bad_csv, validate=True)
except ValueError as e:
    csv_val_failed = True
check(csv_val_failed, 'import_i18n: parse_csv выбрасывает ValueError при несовпадении плейсхолдеров')

with tempfile.TemporaryDirectory() as tmpdir:
    bad_po_file = os.path.join(tmpdir, 'bad.po')
    out_target = os.path.join(tmpdir, 'out_fail.json')
    with open(bad_po_file, 'w', encoding='utf-8') as f:
        f.write(bad_po)

    res_fail = subprocess.run([
        sys.executable,
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools', 'import_i18n.py'),
        '--format', 'po',
        '--input', bad_po_file,
        '--out-json', out_target
    ], capture_output=True, text=True)
    check(res_fail.returncode != 0, 'import_i18n CLI: ненулевой код возврата при битых плейсхолдерах')
    check(not os.path.exists(out_target), 'import_i18n CLI: целевой файл не создаётся при ошибке валидации')
    check('Placeholder mismatch in ns1.greeting' in res_fail.stderr, 'import_i18n CLI: имя ключа и ns выведены в stderr')


# Issue #419: Dotted namespaces round-trip in PO and XLIFF
dotted_en = {'settings.models.advanced': {'api.timeout': 'Timeout (s)', 'key.name': 'Key name'}}
dotted_ru = {'settings.models.advanced': {'api.timeout': 'Таймаут (с)', 'key.name': 'Имя ключа'}}

po_dotted = exp.export_po(dotted_en, dotted_ru)
po_dotted_parsed = imp.parse_po(po_dotted)
check('settings.models.advanced' in po_dotted_parsed, 'export/import PO: сохраняет вложенный namespace с точками')
check(po_dotted_parsed.get('settings.models.advanced', {}).get('api.timeout') == 'Таймаут (с)', 'export/import PO: сохраняет ключ с точками во вложенном namespace')

xlf_dotted = exp.export_xliff(dotted_en, dotted_ru)
xlf_dotted_parsed = imp.parse_xliff(xlf_dotted)
check('settings.models.advanced' in xlf_dotted_parsed, 'export/import XLIFF: сохраняет вложенный namespace с точками')
check(xlf_dotted_parsed.get('settings.models.advanced', {}).get('api.timeout') == 'Таймаут (с)', 'export/import XLIFF: сохраняет ключ с точками во вложенном namespace')


# Issue #420: Multiline values in CSV import
multiline_en = {'ns_multi': {'key_nl': 'First line\nSecond line with {param}'}}
multiline_ru = {'ns_multi': {'key_nl': 'Первая строка\nВторая строка с {param}'}}
csv_multi = exp.export_csv(multiline_en, multiline_ru)
csv_multi_parsed = imp.parse_csv(csv_multi)
check(csv_multi_parsed.get('ns_multi', {}).get('key_nl') == 'Первая строка\nВторая строка с {param}', 'export/import CSV: сохраняет многострочные значения с переносом строк')


# Issue #424: build.py --check orphan file detection
locales_plugins_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib', 'locales', 'plugins')
orphan_dummy = os.path.join(locales_plugins_dir, '999-orphan-dummy-test.json')
try:
    with open(orphan_dummy, 'w', encoding='utf-8') as f:
        f.write('{"orphan": {}}')

    res_orphan = subprocess.run([
        sys.executable,
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build.py'),
        '--check'
    ], capture_output=True, text=True)
    check(res_orphan.returncode != 0, 'build.py --check: завершается с ошибкой при наличии устаревших артефактов')
    check('устаревшие артефакты в lib/locales/plugins/' in res_orphan.stderr, 'build.py --check: выводит предупреждение об устаревших артефактах в stderr')
    check('999-orphan-dummy-test.json' in res_orphan.stderr, 'build.py --check: указывает имя файла сироты')
finally:
    if os.path.exists(orphan_dummy):
        os.remove(orphan_dummy)


# Issue #426: systemd install.sh replaces __REPO__ with actual repo path
with tempfile.TemporaryDirectory() as tmpsystemd:
    res_inst = subprocess.run(
        ['bash', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools', 'systemd', 'install.sh')],
        env=dict(os.environ, SYSTEMD_USER_DIR=tmpsystemd),
        capture_output=True,
        text=True
    )
    check(res_inst.returncode == 0, 'tools/systemd/install.sh: завершается успешно')
    installed_service = os.path.join(tmpsystemd, 'dsh-upstream-check.service')
    check(os.path.exists(installed_service), 'tools/systemd/install.sh: устанавливает service файл')
    svc_content = open(installed_service, 'r', encoding='utf-8').read()
    check('__REPO__' not in svc_content, 'tools/systemd/install.sh: заменяет плейсхолдер __REPO__')
    repo_root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    check(f'WorkingDirectory={repo_root}' in svc_content, 'tools/systemd/install.sh: содержит абсолютный путь к репозиторию')


# Issue #431: Translation metadata export and import
sample_meta = {
    'ns_meta': {
        'action_key': {
            'status': 'reviewed',
            'model': 'deepseek/deepseek-chat',
            'at': '2026-09-30T12:00:00'
        }
    }
}
sample_en_meta = {'ns_meta': {'action_key': 'Save file'}}
sample_ru_meta = {'ns_meta': {'action_key': 'Сохранить файл'}}

# PO roundtrip with meta
po_meta_out = exp.export_po(sample_en_meta, sample_ru_meta, sample_meta)
check('# dsh-status: reviewed' in po_meta_out, 'export_po: экспортирует статус проверки в комментарии')
po_trans, po_m = imp.parse_po(po_meta_out, return_meta=True)
check(po_m.get('ns_meta', {}).get('action_key', {}).get('status') == 'reviewed', 'import_po: восстанавливает статус проверки')
check(po_m.get('ns_meta', {}).get('action_key', {}).get('model') == 'deepseek/deepseek-chat', 'import_po: восстанавливает модель')

# XLIFF roundtrip with meta
xlf_meta_out = exp.export_xliff(sample_en_meta, sample_ru_meta, sample_meta)
check('<note from="dsh-status">reviewed</note>' in xlf_meta_out, 'export_xliff: экспортирует статус проверки в note')
xlf_trans, xlf_m = imp.parse_xliff(xlf_meta_out, return_meta=True)
check(xlf_m.get('ns_meta', {}).get('action_key', {}).get('status') == 'reviewed', 'import_xliff: восстанавливает статус проверки')

# CSV roundtrip with meta
csv_meta_out = exp.export_csv(sample_en_meta, sample_ru_meta, sample_meta)
check('reviewed' in csv_meta_out, 'export_csv: экспортирует статус проверки в колонку')
csv_trans, csv_m = imp.parse_csv(csv_meta_out, return_meta=True)
check(csv_m.get('ns_meta', {}).get('action_key', {}).get('status') == 'reviewed', 'import_csv: восстанавливает статус проверки')

# CLI registry update test
with tempfile.TemporaryDirectory() as tmpdir:
    po_f = os.path.join(tmpdir, 'meta.po')
    out_j = os.path.join(tmpdir, 'out.json')
    reg_j = os.path.join(tmpdir, 'reg.json')
    with open(po_f, 'w', encoding='utf-8') as f:
        f.write(po_meta_out)

    res_cli = subprocess.run([
        sys.executable,
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools', 'import_i18n.py'),
        '--format', 'po',
        '--input', po_f,
        '--out-json', out_j,
        '--registry', reg_j
    ], capture_output=True, text=True)
    check(res_cli.returncode == 0, 'import_i18n CLI: успешно импортирует PO с метаданными')
    check(os.path.exists(reg_j), 'import_i18n CLI: создаёт/обновляет файл реестра')
    reg_loaded = json.load(open(reg_j, encoding='utf-8'))
    check(reg_loaded.get('ns_meta', {}).get('action_key', {}).get('status') == 'reviewed', 'import_i18n CLI: реестр содержит статус reviewed')


# ---------- upstream_watch ----------
import upstream_watch as uw

sample_en = {
    'ns1': {'key1': 'Hello {user}', 'key2': 'Save changes'},
    'ns2': {'key_new': 'New feature'}
}
sample_ru = {
    'ns1': {'key1': 'Привет, {user}', 'key2': 'Сохранить {wrong}'},
    'ns3': {'old_key': 'Старый ключ'}
}

delta = uw.compute_delta(sample_en, sample_ru)
check(len(delta['new']) == 1 and delta['new'][0][1] == 'key_new', 'upstream_watch: находит новые ключи')
check(len(delta['obsolete']) == 1 and delta['obsolete'][0][1] == 'old_key', 'upstream_watch: находит устаревшие ключи')
check(len(delta['ph_mismatches']) == 1 and delta['ph_mismatches'][0][1] == 'key2', 'upstream_watch: находит несовпадения плейсхолдеров')
rep = uw.generate_markdown_report(delta)
check('### Новые ключи для перевода' in rep and 'key_new' in rep, 'upstream_watch: генерирует markdown отчёт')

# ---------- upstream_check git isolation (#407) ----------
import upstream_check as uc

with tempfile.TemporaryDirectory() as tmpgit:
    # 1. Initialize dummy git repo with initial commit
    subprocess.run(['git', 'init'], cwd=tmpgit, capture_output=True, check=True)
    subprocess.run(['git', 'config', 'user.name', 'Tester'], cwd=tmpgit, capture_output=True, check=True)
    subprocess.run(['git', 'config', 'user.email', 'test@example.com'], cwd=tmpgit, capture_output=True, check=True)
    with open(os.path.join(tmpgit, 'base.txt'), 'w') as f:
        f.write('initial')
    subprocess.run(['git', 'add', 'base.txt'], cwd=tmpgit, capture_output=True, check=True)
    subprocess.run(['git', 'commit', '-m', 'init'], cwd=tmpgit, capture_output=True, check=True)

    # 2. Add foreign file and stage it
    with open(os.path.join(tmpgit, 'foreign.js'), 'w') as f:
        f.write('console.log("foreign")')
    subprocess.run(['git', 'add', 'foreign.js'], cwd=tmpgit, capture_output=True, check=True)

    # 3. Add upstream change
    os.makedirs(os.path.join(tmpgit, 'upstream'), exist_ok=True)
    with open(os.path.join(tmpgit, 'upstream', 'report.md'), 'w') as f:
        f.write('# Report')

    # Foreign staged file must cause git_commit_local to abort cleanly
    res_abort = uc.git_commit_local(repo_path=tmpgit, push=False)
    check('отменено: обнаружены сторонние изменения' in res_abort, 'upstream_check: отменяет коммит при наличии сторонних staged файлов')

    # Foreign file must still NOT be in git log
    log_check = subprocess.run(['git', 'log', '-1', '--name-only'], cwd=tmpgit, capture_output=True, text=True)
    check('foreign.js' not in log_check.stdout, 'upstream_check: чужой файл не попал в коммит')

    # 4. Clean foreign file from index and working tree
    subprocess.run(['git', 'reset', 'HEAD', 'foreign.js'], cwd=tmpgit, capture_output=True, check=True)
    os.remove(os.path.join(tmpgit, 'foreign.js'))

    # Clean scenario: only upstream exists
    res_ok = uc.git_commit_local(repo_path=tmpgit, push=False)
    check(res_ok == 'закоммичено локально (push отключен)', 'upstream_check: чистый сценарий успешно коммитит upstream')

    log_after = subprocess.run(['git', 'log', '-1', '--name-only'], cwd=tmpgit, capture_output=True, text=True)
    check('upstream/report.md' in log_after.stdout, 'upstream_check: только upstream пути попадают в коммит')

    # 5. Calling again when clean returns "без изменений"
    res_nochange = uc.git_commit_local(repo_path=tmpgit, push=False)
    check(res_nochange == 'без изменений', 'upstream_check: повторный запуск без изменений возвращает "без изменений"')


# ---------- Issue #418: Printf specifier mismatch rejection (%s != %d) ----------
printf_en = {'ns_fmt': {'msg': 'Value %s'}}
printf_bad_ru = {'ns_fmt': {'msg': 'Число %d'}}
po_printf_bad = exp.export_po(printf_en, printf_bad_ru)
po_printf_failed = False
try:
    imp.parse_po(po_printf_bad, validate=True)
except ValueError:
    po_printf_failed = True
check(po_printf_failed, 'import_i18n: parse_po выбрасывает ValueError при замене %s на %d')

# ---------- Issue #431: Multiline PO continuation lines ----------
po_multiline = '''
msgctxt "ns_ml"
#: ns_ml.key
msgid ""
"Hello "
"{name}"
msgstr ""
"Привет "
"{name}"
'''
ml_parsed = imp.parse_po(po_multiline)
check(ml_parsed.get('ns_ml', {}).get('key') == 'Привет {name}', 'import_i18n: parse_po поддерживает многострочные msgid и msgstr')

# ---------- Issue #431: Full metadata roundtrip (status, model, at, comment, context, en) ----------
full_meta = {
    'ns_meta_full': {
        'btn_key': {
            'status': 'reviewed',
            'model': 'deepseek-chat',
            'at': '2026-09-30T12:00:00',
            'comment': 'First line\nSecond line',
            'context': 'Button\nOn dialog',
            'en': 'Submit form'
        }
    }
}
meta_en = {'ns_meta_full': {'btn_key': 'Submit form'}}
meta_ru = {'ns_meta_full': {'btn_key': 'Отправить форму'}}

for fmt, exp_fn, parse_fn in [('PO', exp.export_po, imp.parse_po), ('XLIFF', exp.export_xliff, imp.parse_xliff), ('CSV', exp.export_csv, imp.parse_csv)]:
    out = exp_fn(meta_en, meta_ru, full_meta)
    _, m = parse_fn(out, return_meta=True)
    rec = m.get('ns_meta_full', {}).get('btn_key', {})
    for field in ('status', 'model', 'at', 'comment', 'context', 'en'):
        check(rec.get(field) == full_meta['ns_meta_full']['btn_key'][field], f'export/import {fmt}: сохраняет метаданные поля {field}')

# ---------- Issue #407: upstream_check dirty tree guard & GIT_BIN ----------
with tempfile.TemporaryDirectory() as tmpgit:
    subprocess.run([uc.GIT_BIN, 'init'], cwd=tmpgit, capture_output=True, check=True)
    subprocess.run([uc.GIT_BIN, 'config', 'user.name', 'Tester'], cwd=tmpgit, capture_output=True, check=True)
    subprocess.run([uc.GIT_BIN, 'config', 'user.email', 'test@example.com'], cwd=tmpgit, capture_output=True, check=True)
    with open(os.path.join(tmpgit, 'foreign.js'), 'w') as f:
        f.write('console.log("foreign")')
    dirty_paths = uc.get_dirty_paths(repo_path=tmpgit)
    check('foreign.js' in dirty_paths, 'upstream_check: get_dirty_paths находит посторонние изменения')
    check(os.path.basename(uc.GIT_BIN) in ('git-antigravity', 'git-codex', 'git'), 'upstream_check: использует GIT_BIN')

# ---------- Issue #432: Inventory validation (semver range, fake versions, drift) ----------
try:
    import check_data_integrity as cdi
except ImportError:
    sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'tools'))
    import check_data_integrity as cdi

inv_file = os.path.join(os.path.dirname(HERE), 'supported-inventory.json')
with open(inv_file, 'r', encoding='utf-8') as f:
    base_inv = json.load(f)

# 1. Real inventory must pass
check(cdi.check_supported_inventory(base_inv), 'check_data_integrity: валидный supported-inventory.json успешно проходит проверку')

# 2. Out-of-range semver (e.g. 0.98.7) must fail
fake_core_inv = json.loads(json.dumps(base_inv))
fake_core_inv['core']['supported_version'] = '0.98.7'
check(not cdi.check_supported_inventory(fake_core_inv), 'check_data_integrity: отвергает версию ядра 0.98.7 вне compatible_range')

# 3. Fake 9999 version must fail
fake_9999_inv = json.loads(json.dumps(base_inv))
fake_9999_inv['core']['supported_version'] = '0.2.0-9999'
check(not cdi.check_supported_inventory(fake_9999_inv), 'check_data_integrity: отвергает фиктивную версию ядра с 9999')

# 4. satisfies_range unit checks
check(cdi.satisfies_range('0.2.0-rc.2', '>=0.2.0-rc.1 <0.3.0'), 'check_data_integrity: 0.2.0-rc.2 удовлетворяет >=0.2.0-rc.1 <0.3.0')
check(not cdi.satisfies_range('0.98.7', '>=0.2.0-rc.1 <0.3.0'), 'check_data_integrity: 0.98.7 не удовлетворяет >=0.2.0-rc.1 <0.3.0')
check(not cdi.satisfies_range('0.1.1-rc.2', '>=0.2.0-rc.1 <0.3.0'), 'check_data_integrity: 0.1.1-rc.2 не удовлетворяет >=0.2.0-rc.1 <0.3.0')
check(cdi.parse_semver('0.02.0') is None, 'check_data_integrity: SemVer leading zero rejected')
check(cdi.parse_semver('01.0.0') is None, 'check_data_integrity: SemVer major leading zero rejected')
check(cdi.parse_semver('0.2.0-rc.01') is None, 'check_data_integrity: prerelease leading zero rejected')
check(cdi.satisfies_range('0.2.0-rc.10', '>=0.2.0-rc.2 <0.3.0'), 'check_data_integrity: rc.10 >= rc.2 numeric prerelease')

# ---------- Issue #438: Final exit gate for all tests ----------
if FAILS:
    print('ПРОВАЛЕНО: %d' % len(FAILS))
    sys.exit(1)
else:
    print('ВСЕ ТЕСТЫ ПРОЙДЕНЫ')
    sys.exit(0)
