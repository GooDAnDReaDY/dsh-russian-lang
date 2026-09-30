#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""tools/check_data_integrity.py — проверка целостности снапшотов и данных (#235, #432)"""

import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check_file(rel_path, min_size=10, is_json=True):
    path = os.path.join(HERE, rel_path)
    if not os.path.isfile(path):
        print(f"FAIL: Файл {rel_path} не найден!", file=sys.stderr)
        return False
    sz = os.path.getsize(path)
    if sz < min_size:
        print(f"FAIL: Размер {rel_path} ({sz} Б) меньше ожидаемого минимума ({min_size} Б)!", file=sys.stderr)
        return False
    if is_json:
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if not data:
                print(f"FAIL: {rel_path} пустой JSON!", file=sys.stderr)
                return False
        except Exception as e:
            print(f"FAIL: Ошибка парсинга {rel_path}: {e}", file=sys.stderr)
            return False
    return True

def check_supported_inventory():
    path = os.path.join(HERE, "supported-inventory.json")
    if not os.path.isfile(path):
        print("FAIL: supported-inventory.json отсутствует!", file=sys.stderr)
        return False
    try:
        with open(path, "r", encoding="utf-8") as f:
            inv = json.load(f)
        core_ver = inv.get("core", {}).get("supported_version")
        if not core_ver:
            print("FAIL: supported-inventory.json не содержит core.supported_version!", file=sys.stderr)
            return False
        keys_count = inv.get("metrics", {}).get("total_keys")
        if keys_count != 8584:
            print(f"FAIL: supported-inventory.json total_keys ({keys_count}) != 8584!", file=sys.stderr)
            return False
        plugins = inv.get("supported_plugins", {})
        if not plugins or len(plugins) < 50:
            print(f"FAIL: supported-inventory.json содержит недостаточно плагинов ({len(plugins)})!", file=sys.stderr)
            return False
        return True
    except Exception as e:
        print(f"FAIL: Ошибка проверки supported-inventory.json: {e}", file=sys.stderr)
        return False

def main():
    errors = 0
    checks = [
        ("mt-registry.json", 100000),
        ("plugins-en.json", 100000),
        ("tools/ru-freq.json", 50000),
        ("self-ru.json", 5),
        ("supported-inventory.json", 1000),
    ]

    for rel_path, min_sz in checks:
        if not check_file(rel_path, min_sz):
            errors += 1

    if not check_supported_inventory():
        errors += 1

    # Check ru/ and ru-plugins/
    for folder in ["ru", "ru-plugins"]:
        files = glob.glob(os.path.join(HERE, folder, "*.json"))
        if not files:
            print(f"FAIL: В каталоге {folder} нет JSON файлов!", file=sys.stderr)
            errors += 1
        for jf in files:
            if not check_file(os.path.relpath(jf, HERE), min_size=5):
                errors += 1

    if errors == 0:
        print("OK: Все снапшоты и корпусы данных прошли проверку целостности (включая supported-inventory.json).")
        return 0
    else:
        print(f"FAIL: Обнаружено {errors} ошибок целостности данных!", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
