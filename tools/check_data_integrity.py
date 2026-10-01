import re
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

def check_supported_inventory(inv_data=None):
    if inv_data is None:
        path = os.path.join(HERE, "supported-inventory.json")
        if not os.path.isfile(path):
            print("FAIL: supported-inventory.json отсутствует!", file=sys.stderr)
            return False
        try:
            with open(path, "r", encoding="utf-8") as f:
                inv = json.load(f)
        except Exception as e:
            print(f"FAIL: Ошибка парсинга supported-inventory.json: {e}", file=sys.stderr)
            return False
    else:
        inv = inv_data

    try:
        # 1. Проверка версии ядра на валидный semver без фиктивных версий
        core_ver = inv.get("core", {}).get("supported_version", "")
        if not core_ver or not re.match(r"^0\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$", str(core_ver)) or "9999" in str(core_ver):
            print(f"FAIL: supported-inventory.json содержит недопустимую/фиктивную версию ядра ({core_ver})!", file=sys.stderr)
            return False

        # 2. Проверка соответствия метрик реальным снимкам на диске
        plugins_en_path = os.path.join(HERE, "plugins-en.json")
        core_en_path = os.path.join(HERE, "upstream", "core-en.json")
        if os.path.isfile(plugins_en_path) and os.path.isfile(core_en_path):
            with open(plugins_en_path, "r", encoding="utf-8") as f:
                plugins_en = json.load(f)
            with open(core_en_path, "r", encoding="utf-8") as f:
                core_en = json.load(f)

            expected_core_keys = sum(len(v) for v in core_en.values())
            expected_plugin_keys = sum(len(v) for v in plugins_en.values())
            expected_total_keys = expected_core_keys + expected_plugin_keys
            expected_total_ns = len(core_en) + len(plugins_en)

            keys_count = inv.get("metrics", {}).get("total_keys")
            if keys_count != expected_total_keys:
                print(f"FAIL: total_keys в inventory ({keys_count}) не совпадает со снапшотом ({expected_total_keys})!", file=sys.stderr)
                return False

            total_ns = inv.get("metrics", {}).get("total_namespaces")
            if total_ns != expected_total_ns:
                print(f"FAIL: total_namespaces в inventory ({total_ns}) не совпадает со снапшотом ({expected_total_ns})!", file=sys.stderr)
                return False

        # 3. Валидация списка плагинов
        plugins = inv.get("supported_plugins", {})
        if not plugins or len(plugins) < 50:
            print(f"FAIL: supported-inventory.json содержит недостаточно плагинов ({len(plugins)})!", file=sys.stderr)
            return False

        valid_version_pattern = re.compile(r"^(\^|~|>=)?(file:|github:)?[0-9a-zA-Z._\-\/:#]+$")
        for pkg, ver in plugins.items():
            if "9999" in str(ver) or "fake" in str(pkg).lower() or "fake" in str(ver).lower():
                print(f"FAIL: Обнаружен фиктивный плагин/версия: {pkg}={ver}", file=sys.stderr)
                return False
            if not valid_version_pattern.match(str(ver)):
                print(f"FAIL: Некорректный формат версии для {pkg}: {ver}", file=sys.stderr)
                return False

        # 4. Проверка дрейфа относительно рабочего профиля (если доступен)
        web_pkg_path = os.path.expanduser("~/.dsh/profiles/web/package.json")
        if os.path.isfile(web_pkg_path):
            try:
                with open(web_pkg_path, "r", encoding="utf-8") as f:
                    web_pkg = json.load(f)
                deps = web_pkg.get("dependencies", {})
                for pkg_name, installed_ver in deps.items():
                    if pkg_name in plugins:
                        supp_ver = plugins[pkg_name]
                        if pkg_name == "@goodandready/dsh-key-rotation":
                            clean_inst = installed_ver.lstrip("^~")
                            if supp_ver != clean_inst:
                                print(f"FAIL: Дрейф версии {pkg_name}: inventory={supp_ver}, installed={clean_inst}!", file=sys.stderr)
                                return False
            except Exception as e:
                print(f"WARN: Проверка профиля web пропущена: {e}", file=sys.stderr)

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
