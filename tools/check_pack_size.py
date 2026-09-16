#!/usr/bin/env python3
import json
import subprocess
import sys
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAX_BYTES = 262144 # 256 KiB DSH Store strict ceiling

p = subprocess.run(['npm', 'pack', '--dry-run', '--json'], cwd=HERE, capture_output=True, text=True)
if p.returncode != 0:
    print("Error running npm pack --dry-run:", p.stderr)
    sys.exit(1)

try:
    data = json.loads(p.stdout)
    pkg = data[0] if isinstance(data, list) else list(data.values())[0]
except Exception as e:
    print("Failed to parse npm pack output:", e)
    sys.exit(1)

files = pkg.get('files', [])
total_size = pkg.get('size', 0)
unpacked_size = pkg.get('unpackedSize', 0)

print(f"Total package files: {len(files)}, tarball size: {total_size} bytes, unpacked size: {unpacked_size} bytes")

violations = []
for f in files:
    path = f.get('path', '')
    size = f.get('size', 0)
    if size > MAX_BYTES:
        violations.append((path, f"SIZE EXCEEDED: {size} bytes (> {MAX_BYTES})"))
    # Disallow forbidden directories in npm package
    forbidden_prefixes = ('ru/', 'ru-plugins/', 'docs/', 'tools/', 'test/', 'upstream/', 'zh-refs/', '.gitea/')
    for prefix in forbidden_prefixes:
        if path.startswith(prefix):
            violations.append((path, f"FORBIDDEN FILE IN NPM: {path}"))

if violations:
    print("BLOCKED BY DSH PACKAGE STANDARD:")
    for v in violations:
        print(f"  - {v[0]}: {v[1]}")
    sys.exit(1)

print("npm pack size and file filter check PASSED (0 files > 256 KiB, 0 garbage files).")
