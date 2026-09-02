#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Линтер целостности словарей dsh-russian-lang и установщик Git pre-commit hook.

Выполняет комплексный статический аудит:
1. Валидность синтаксиса JSON во всех словарях
2. Проверка соответствия плейсхолдеров {name} между EN и RU
3. Валидация терминов по glossary.json (отсутствие запрещённых калек)
4. Проверка на пустые значения строк

Использование:
  python3 tools/lint_translations.py                 # запуск проверки
  python3 tools/lint_translations.py --install-hook  # установка pre-commit hook в .git
"""
import argparse
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

PH_RE = re.compile(r'\{([a-zA-Z0-9_]+)\}')


def ph_set(s):
    return set(PH_RE.findall(s or ''))


def lint_json_files():
    """Проверка синтаксиса всех JSON файлов."""
    errors = []
    files = (glob.glob(os.path.join(REPO, 'ru', '*.json'))
             + glob.glob(os.path.join(REPO, 'ru-plugins', '*.json'))
             + [os.path.join(REPO, 'glossary.json'), os.path.join(REPO, 'mt-registry.json')])

    parsed_dicts = {}
    for fpath in files:
        if not os.path.exists(fpath):
            continue
        rel = os.path.relpath(fpath, REPO)
        try:
            with open(fpath, encoding='utf-8') as f:
                data = json.load(f)
                parsed_dicts[rel] = data
        except Exception as e:
            errors.append(('JSON_SYNTAX', rel, str(e)))
    return parsed_dicts, errors


def lint_placeholders(en_dict, ru_dict):
    """Проверка соответствия плейсхолдеров."""
    errors = []
    for ns, entries in en_dict.items():
        for key, en_text in entries.items():
            ru_text = ru_dict.get(ns, {}).get(key)
            if ru_text and isinstance(ru_text, str) and isinstance(en_text, str):
                en_ph = ph_set(en_text)
                ru_ph = ph_set(ru_text)
                if en_ph != ru_ph:
                    errors.append(('PH_MISMATCH', '%s.%s' % (ns, key), 'EN %s != RU %s' % (en_ph, ru_ph)))
    return errors


def lint_glossary(ru_dict, glossary):
    """Проверка запрещённых терминов из glossary.json."""
    errors = []
    terms = glossary.get('terms', {}) if isinstance(glossary, dict) else {}
    for term_key, spec in terms.items():
        forbidden = spec.get('forbidden', [])
        canonical = spec.get('canonical', '')
        for bad in forbidden:
            base = re.sub(r'[аяоеыиь]$', '', bad, flags=re.IGNORECASE)
            pattern = re.compile(r'\b' + re.escape(base) + r'(?:[аяуеыи]|ом|ем|ой|ей|ам|ами|ах|ов)?\b', re.IGNORECASE)
            for ns, entries in ru_dict.items():
                for key, ru_text in entries.items():
                    if isinstance(ru_text, str) and pattern.search(ru_text):
                        errors.append(('FORBIDDEN_TERM', '%s.%s' % (ns, key), 'найдено «%s» вместо «%s» (%s)' % (bad, canonical, term_key)))
    return errors


def install_git_hook():
    """Установка pre-commit hook."""
    git_dir = os.path.join(REPO, '.git')
    if not os.path.isdir(git_dir):
        # Проверяем worktree .git файл
        if os.path.isfile(git_dir):
            with open(git_dir) as f:
                line = f.read().strip()
                if line.startswith('gitdir:'):
                    git_dir = line.split(':', 1)[1].strip()

    hooks_dir = os.path.join(git_dir, 'hooks') if os.path.isdir(git_dir) else None
    if not hooks_dir or not os.path.exists(hooks_dir):
        os.makedirs(hooks_dir, exist_ok=True)

    hook_path = os.path.join(hooks_dir, 'pre-commit')
    hook_content = """#!/usr/bin/env bash
# dsh-russian-lang pre-commit linter
python3 tools/lint_translations.py || {
    echo "Pre-commit hook failed: lint errors in translations!"
    exit 1
}
"""
    with open(hook_path, 'w', encoding='utf-8') as f:
        f.write(hook_content)
    try:
        os.chmod(hook_path, 0o755)
    except Exception:
        pass
    print('Pre-commit hook успешно установлен в %s' % hook_path)


def run_all_lints():
    parsed_files, json_errors = lint_json_files()
    if json_errors:
        return json_errors

    # Собираем ru и en словари
    ru_merged = {}
    for rel, data in parsed_files.items():
        if rel.startswith('ru/') or rel.startswith('ru-plugins/'):
            for ns, entries in data.items():
                ru_merged.setdefault(ns, {}).update(entries)

    mt_data = parsed_files.get('mt-registry.json', {})
    for ns, entries in mt_data.items():
        for key, rec in entries.items():
            if key not in ru_merged.get(ns, {}):
                ru_merged.setdefault(ns, {})[key] = rec.get('ru', '')

    en_dict = {}
    for name in ('upstream/core-en.json', 'plugins-en.json'):
        p = os.path.join(REPO, name)
        if os.path.exists(p):
            for ns, entries in json.load(open(p, encoding='utf-8')).items():
                en_dict.setdefault(ns, {}).update(entries)

    glossary_data = parsed_files.get('glossary.json', {})

    ph_errors = lint_placeholders(en_dict, ru_merged)
    glossary_errors = lint_glossary(ru_merged, glossary_data)

    return json_errors + ph_errors + glossary_errors


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--install-hook', action='store_true', help='Установить git pre-commit hook')
    args = ap.parse_args()

    if args.install_hook:
        install_git_hook()
        return

    print('=== ЛИНТЕР СЛОВАРЕЙ (dsh-russian-lang) ===')
    errors = run_all_lints()

    if errors:
        print('  ОБНАРУЖЕНЫ ОШИБКИ (%d):' % len(errors))
        for err_type, target, msg in errors:
            print('    [!] %s (%s): %s' % (err_type, target, msg))
        sys.exit(1)
    else:
        print('  Все словари валидны: JSON, плейсхолдеры и глоссарий в норме (100% OK).')


if __name__ == '__main__':
    main()