#!/usr/bin/env python3
"""Сверить русские словари с английскими оригиналами.

Сравнивает:
    core-en.json     <-> ru/*.json
    plugins-en.json  <-> ru-plugins/*.json

Показывает, что не переведено (появилось после обновления) и что лишнее
(ключ исчез или переименован). Перед сверкой обновите оригиналы:

    python3 extract-dicts.py <node_modules> [profile-node_modules]
    python3 check-coverage.py
"""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

PLACEHOLDER = re.compile(r'\{(\w+)\}')


def placeholders(text):
    """Set of {name} placeholders in a template string."""
    return set(PLACEHOLDER.findall(text or ''))


def load_dir(name):
    out = {}
    for path in sorted(glob.glob(os.path.join(HERE, name, '*.json'))):
        for ns, entries in json.load(open(path, encoding='utf-8')).items():
            out.setdefault(ns, {}).update(entries)
    return out


def load_file(name):
    path = os.path.join(HERE, name)
    if not os.path.exists(path):
        alt = os.path.join(HERE, 'upstream', name)
        if os.path.exists(alt):
            path = alt
    return json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}


def _ru_plural(ru_key):
    """Base of a Russian plural key (X.few / X.many) if it exists."""
    m = re.match(r'^(.*)\.(few|many)$', ru_key)
    return m.group(1) if m else None


def compare(title, en, ru, extra=None):
    """extra — дополнительные покрытия (MT-реестр): ключ считается переведённым,
    если есть в ru ИЛИ в extra."""
    missing = stale = bad = 0
    print('=== %s ===' % title)
    for ns in sorted(en):
        absent = [k for k in en[ns]
                  if k not in ru.get(ns, {}) and k not in (extra or {}).get(ns, {})]
        if absent:
            missing += len(absent)
            print('  НЕТ ПЕРЕВОДА  %-26s %3d: %s' % (ns, len(absent), ', '.join(absent[:8])))
    for ns in sorted(ru):
        extra = []
        for k in ru[ns]:
            if k in en.get(ns, {}):
                continue
            # X.few / X.many — осознанные ру-формы множественного числа, валидны,
            # если в en есть базовый X (любая форма: голый счётный ключ или
            # X.one / X.other).
            base = _ru_plural(k)
            if base and (base in en.get(ns, {})
                         or base + '.one' in en.get(ns, {})
                         or base + '.other' in en.get(ns, {})):
                continue
            extra.append(k)
        if extra:
            stale += len(extra)
            print('  ЛИШНЕЕ        %-26s %3d: %s' % (ns, len(extra), ', '.join(extra[:8])))
        # Плейсхолдеры: ru не должен терять и не должен добавлять {placeholders}
        # относительно en (иначе подстановка параметров ломается).
        for k in ru[ns]:
            if k not in en.get(ns, {}):
                continue
            en_ph = placeholders(en[ns][k])
            ru_ph = placeholders(ru[ns][k])
            lost = en_ph - ru_ph
            extra_ph = ru_ph - en_ph
            if lost:
                bad += 1
                print('  ПОТЕРЯН PH    %-26s %-24s ru без {%s} (en {%s})'
                      % (ns, k, ', '.join(sorted(lost)), ', '.join(sorted(en_ph))))
            if extra_ph:
                bad += 1
                print('  ЛИШНИЙ PH     %-26s %-24s ru с {%s} (en {%s})'
                      % (ns, k, ', '.join(sorted(extra_ph)), ', '.join(sorted(en_ph))))
    total = sum(len(v) for v in en.values())
    done = total - missing
    print('  ключей: %d | переведено: %d | не переведено: %d | лишних: %d | плохих PH: %d | покрытие: %.1f%%'
          % (total, done, missing, stale, bad, (100.0 * done / total) if total else 100.0))
    print()
    return missing + bad


def check_mt_registry(en):
    """PH-целостность mt-registry.json против en-оригиналов.

    MT-переводы мёржутся в бандл как обычные строки (build.py), поэтому битый
    плейсхолдер в реестре уйдёт в UI сырым {..}. Сверяем каждый ключ с en.
    Namespace'ы из self-ru.json не отгружаются (их переводят сами плагины) —
    пропускаем.
    """
    self_ru = set(load_file('self-ru.json')) if os.path.exists(
        os.path.join(HERE, 'self-ru.json')) else set()
    bad = 0
    mt = load_file('mt-registry.json')
    if not mt:
        return 0
    print('=== MT-РЕЕСТР ===')
    for ns, entries in sorted(mt.items()):
        if ns in self_ru:
            continue
        for key, rec in entries.items():
            en_text = en.get(ns, {}).get(key)
            if not isinstance(en_text, str):
                continue
            ru_text = rec.get('ru', '') if isinstance(rec, dict) else rec
            lost = placeholders(en_text) - placeholders(ru_text)
            extra = placeholders(ru_text) - placeholders(en_text)
            if lost or extra:
                bad += 1
                print('  MT PH %-26s %-24s ru {%s} (en {%s})'
                      % (ns, key,
                         ', '.join(sorted(lost | extra)),
                         ', '.join(sorted(placeholders(en_text)))))
    print('  MT плохих PH: %d' % bad)
    print()
    return bad


def runtime_coverage():
    """Эффективное runtime-покрытие: сколько ключей реально переведено в UI.

    self-ru namespace'ы не отгружаются (их переводят сами плагины) — их ключи
    не считаем «непереведёнными». MT-реестр отгружается в бандл как обычные
    строки — считаем его за покрытие. Метрика честная: не занижает и не врёт.
    """
    self_ru = set(load_file('self-ru.json')) if os.path.exists(
        os.path.join(HERE, 'self-ru.json')) else set()
    mt = load_file('mt-registry.json')

    # эффективный en: без self-ru
    en_eff = {}
    for name in ('core-en.json', 'plugins-en.json'):
        for ns, entries in load_file(name).items():
            if ns in self_ru:
                continue
            en_eff.setdefault(ns, {}).update(entries)

    # эффективный ru: ручные словари + отгружаемые MT-строки
    ru_eff = load_dir('ru')
    ru_eff.update(load_dir('ru-plugins'))
    for ns, entries in (mt or {}).items():
        if ns in self_ru:
            continue
        for key, rec in entries.items():
            val = rec.get('ru', '') if isinstance(rec, dict) else rec
            if key not in ru_eff.get(ns, {}):
                ru_eff.setdefault(ns, {})[key] = val

    total = sum(len(v) for v in en_eff.values())

    # Раскладка обязана быть НЕПЕРЕСЕКАЮЩЕЙСЯ и давать в сумме done. Прежняя
    # версия печатала «ручных 2320 + MT 1802» при итоге 2899: слагаемые
    # считались по своим источникам и пересекались на ключах, у которых есть и
    # ручной перевод, и запись в MT-реестре (#135).
    ru_manual = load_dir('ru')
    ru_manual.update(load_dir('ru-plugins'))
    manual = mt_reviewed = mt_draft = 0
    for ns, entries in en_eff.items():
        for k in entries:
            if k in ru_manual.get(ns, {}):
                manual += 1
            elif k in (mt or {}).get(ns, {}):
                rec = mt[ns][k]
                status = rec.get('status') if isinstance(rec, dict) else None
                if status == 'reviewed':
                    mt_reviewed += 1
                else:
                    mt_draft += 1
    done = manual + mt_reviewed + mt_draft
    pct = (100.0 * done / total) if total else 100.0
    print('=== ЭФФЕКТИВНОЕ ПОКРЫТИЕ (runtime) ===')
    print('  ключей в UI: %d | переведено: %d | покрытие: %.1f%%'
          % (total, done, pct))
    print('  из них: ручных %d | MT выверенных %d | MT без вычитки %d'
          % (manual, mt_reviewed, mt_draft))
    if mt_draft:
        print('  ВНИМАНИЕ: %.1f%% интерфейса — машинный перевод без вычитки '
              '(очередь: upstream/review-queue.md)' % (100.0 * mt_draft / total))
    print()
    return pct


def strip_self_ru(en):
    """Убрать namespace'ы, которые плагины локализуют сами (self-ru.json).
    Их перевод не наша ответственность и не «непереведённое»."""
    self_ru = set(load_file('self-ru.json')) if os.path.exists(
        os.path.join(HERE, 'self-ru.json')) else set()
    return {ns: e for ns, e in en.items() if ns not in self_ru}


if __name__ == '__main__':
    en_all = {}
    for name in ('core-en.json', 'plugins-en.json'):
        part = load_file(name)
        for ns, entries in part.items():
            en_all.setdefault(ns, {}).update(entries)
    mt_all = {}
    for ns, entries in load_file('mt-registry.json').items():
        mt_all[ns] = {k: (r.get('ru', '') if isinstance(r, dict) else r)
                      for k, r in entries.items()}
    left = compare('ЯДРО', load_file('core-en.json'), load_dir('ru'), mt_all)
    left += compare('ПЛАГИНЫ', strip_self_ru(load_file('plugins-en.json')),
                    strip_self_ru(load_dir('ru-plugins')), mt_all)
    left += check_mt_registry(en_all)
    runtime_coverage()
    sys.exit(0 if left == 0 else 1)
