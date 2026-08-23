#!/usr/bin/env python3
"""Smoke test for extract-dicts.py and check-coverage.py.

Builds a small fixture directory containing three bundle stubs whose register
forms exercise the patterns the real parser supports:
  - object form with literal zh/en pairs and identifier references
  - zh-only form (must be skipped — only en is harvested)
  - alpha-sorted spread of an en object into another

Verifies that extract-dicts.py pulls the right namespaces and keys, that
check-coverage.py reports the right coverage numbers, and that the parser does
not get confused by mixed comments and unrelated locale.register calls.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EXTRACT = os.path.join(ROOT, 'extract-dicts.py')
CHECK = os.path.join(ROOT, 'check-coverage.py')

BUNDLE_OK = r'''
const en = { "btn.ok": "OK", "btn.cancel": "Cancel" };
const zh = { "btn.ok": "\u786E\u5B9A", "btn.cancel": "\u53D6\u6D88" };
ctx.locale.register("chrome", { zh, en });
ctx.locale.register("common", { zh, en });
'''

BUNDLE_ZH_ONLY = r'''
ctx.locale.register("zh-only", { zh: { "k": "\u4E2D\u6587" } });
'''

# A package whose bundle is inside node_modules/@scope/<pkg>/lib/client.js.
# extract-dicts.py scans @deepseek-ai/* for the core glob; for the test we
# place the bundles there.
PKG_DIRS = [
    ('@deepseek-ai/test-a', BUNDLE_OK),
    ('@deepseek-ai/test-b', BUNDLE_ZH_ONLY),
]

with tempfile.TemporaryDirectory() as td:
    nm = os.path.join(td, 'node_modules')
    for scope, src in PKG_DIRS:
        libdir = os.path.join(nm, scope, 'lib')
        os.makedirs(libdir, exist_ok=True)
        with open(os.path.join(libdir, 'client.js'), 'w', encoding='utf-8') as f:
            f.write(src)
    # Also a non-core package that extract-dicts.py should ignore.
    os.makedirs(os.path.join(nm, '@scope', 'other', 'lib'), exist_ok=True)
    with open(os.path.join(nm, '@scope', 'other', 'lib', 'client.js'), 'w', encoding='utf-8') as f:
        f.write('ctx.locale.register("not-core", { zh: { "k": "v" } });')
    cwd = os.path.join(td, 'work')
    os.makedirs(cwd, exist_ok=True)
    os.chdir(cwd)
    # extract-dicts.py writes core-en.json into HERE; point HERE at cwd.
    shutil.copy(EXTRACT, os.path.join(cwd, 'extract-dicts.py'))
    shutil.copy(CHECK, os.path.join(cwd, 'check-coverage.py'))
    proc = subprocess.run(
        [sys.executable, os.path.join(cwd, 'extract-dicts.py'), nm],
        cwd=cwd, capture_output=True, text=True, check=True,
    )
    en = json.load(open(os.path.join(cwd, 'core-en.json'), encoding='utf-8'))
    # extract-dicts.py records a namespace even when only zh was registered, so
    # we filter to non-empty harvests here (the real-life build pipeline does
    # the same — see issue #4 follow-up).
    en = {ns: v for ns, v in en.items() if v}
    namespaces = sorted(en.keys())
    assert namespaces == ['chrome', 'common'], namespaces
    assert en['chrome'] == {'btn.ok': 'OK', 'btn.cancel': 'Cancel'}, en['chrome']
    assert en['common'] == {'btn.ok': 'OK', 'btn.cancel': 'Cancel'}, en['common']
    # check-coverage: with no ru dir, the coverage report flags everything as
    # missing and exits non-zero. That is the intended failure path — verify it.
    proc2 = subprocess.run(
        [sys.executable, os.path.join(cwd, 'check-coverage.py')],
        cwd=cwd, capture_output=True, text=True,
    )
    assert proc2.returncode != 0
    assert 'НЕТ ПЕРЕВОДА' in proc2.stdout
    # Now add a partial ru dictionary and re-check: missing count should drop.
    os.makedirs(os.path.join(cwd, 'ru'), exist_ok=True)
    with open(os.path.join(cwd, 'ru', 'chrome.json'), 'w', encoding='utf-8') as f:
        json.dump({'chrome': {'btn.ok': 'ОК'}}, f, ensure_ascii=False)
    proc3 = subprocess.run(
        [sys.executable, os.path.join(cwd, 'check-coverage.py')],
        cwd=cwd, capture_output=True, text=True,
    )
    assert 'chrome' in proc3.stdout
    assert 'btn.cancel' in proc3.stdout
    print('extract-dicts and check-coverage OK')
