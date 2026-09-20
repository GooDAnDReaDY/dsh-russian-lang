#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Удобный интерфейс управления Upstream Watcher для dsh-russian-lang.

Использование:
    python3 scripts/upstream-watch.py check       # локальная дельта (upstream_watch.py --check)
    python3 scripts/upstream-watch.py report      # экспорт markdown-отчета в upstream/report.md
    python3 scripts/upstream-watch.py dry-run     # пробный опрос npm без отправки issue
    python3 scripts/upstream-watch.py fetch       # опрос npm @deepseek-ai/dsh@latest и создание issue в Gitea
    python3 scripts/upstream-watch.py install     # вывод инструкций по установке таймера
"""
import os
import sys
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
TOOLS = os.path.join(REPO, 'tools')

def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if cmd == 'check':
        p = subprocess.run([sys.executable, os.path.join(TOOLS, 'upstream_watch.py'), '--check'], cwd=REPO)
        sys.exit(p.returncode)
    elif cmd == 'report':
        out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(REPO, 'upstream', 'report.md')
        p = subprocess.run([sys.executable, os.path.join(TOOLS, 'upstream_watch.py'), '--report', out], cwd=REPO)
        sys.exit(p.returncode)
    elif cmd == 'dry-run':
        p = subprocess.run([sys.executable, os.path.join(TOOLS, 'upstream_check.py'), '--dry-run'], cwd=REPO)
        sys.exit(p.returncode)
    elif cmd == 'fetch':
        p = subprocess.run([sys.executable, os.path.join(TOOLS, 'upstream_check.py')], cwd=REPO)
        sys.exit(p.returncode)
    elif cmd == 'install':
        sh = os.path.join(TOOLS, 'systemd', 'install.sh')
        subprocess.run(['bash', sh], cwd=REPO)
    else:
        print(__doc__)
        sys.exit(1)

if __name__ == '__main__':
    main()
