#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""tools/check_data_integrity.py — проверка целостности снапшотов и данных (#235, #432)"""

import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def parse_semver(v):
    """Парсинг строки версии SemVer вида MAJOR.MINOR.PATCH[-PRERELEASE]."""
    if not isinstance(v, str):
        return None
    m = re.match(r"^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.]+))?$", v.strip())
    if not m:
        return None
    return (int(m.group(1)), int(m.group(2)), int(m.group(3)), m.group(4) or "")


def semver_cmp(v1, v2):
    """Сравнение двух распарсенных кортежей SemVer."""
    p1 = (v1[0], v1[1], v1[2])
    p2 = (v2[0], v2[1], v2[2])
    if p1 != p2:
        return -1 if p1 < p2 else 1
    # релизная версия новее пререлизной с теми же числами: 0.2.0 > 0.2.0-rc.1
    if not v1[3] and v2[3]:
        return 1
    if v1[3] and not v2[3]:
        return -1
    if v1[3] == v2[3]:
        return 0
    return -1 if v1[3] < v2[3] else 1


def satisfies_range(ver_str, range_str):
    """Проверка удовлетворения версии строке допустимого диапазона (например '>=0.2.0-rc.1 <0.3.0')."""
    v = parse_semver(ver_str)
    if not v:
        return False
    clauses = range_str.strip().split()
    for cl in clauses:
        if cl.startswith(">="):
            target = parse_semver(cl[2:])
            if not target or semver_cmp(v, target) < 0:
                return False
        elif cl.startswith("<="):
            target = parse_semver(cl[2:])
            if not target or semver_cmp(v, target) > 0:
                return False
        elif cl.startswith(">"):
            target = parse_semver(cl[1:])
            if not target or semver_cmp(v, target) <= 0:
                return False
        elif cl.startswith("<"):
            target = parse_semver(cl[1:])
            if not target or semver_cmp(v, target) >= 0:
                return False
        elif cl.startswith("="):
            target = parse_semver(cl[1:])
            if not target or semver_cmp(v, target) != 0:
                return False
        else:
            target = parse_semver(cl)
            if not target or semver_cmp(v, target) != 0:
                return False
    return True


def check_file(rel_path, min_size=10, is_json=True, base_dir=HERE):
    path = os.path.join(base_dir, rel_path)
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


def check_supported_inventory(inv_data=None, base_dir=HERE, web_pkg_path=None):
    if inv_data is None:
        path = os.path.join(base_dir, "supported-inventory.json")
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
        # 1. Проверка версии ядра на валидный semver и совместимость с compatible_range
        core_info = inv.get("core", {})
        core_ver = core_info.get("supported_version", "")
        comp_range = core_info.get("compatible_range", "")

        if not core_ver or not comp_range:
            print("FAIL: supported-inventory.json не содержит supported_version или compatible_range ядра!", file=sys.stderr)
            return False

        if "9999" in str(core_ver) or not parse_semver(core_ver):
            print(f"FAIL: supported-inventory.json содержит невалидный semver ядра ({core_ver})!", file=sys.stderr)
            return False

        if not satisfies_range(core_ver, comp_range):
            print(f"FAIL: Версия ядра {core_ver} не попадает в диапазон совместимости {comp_range}!", file=sys.stderr)
            return False

        # 2. Проверка соответствия метрик реальным снимкам на диске
        plugins_en_path = os.path.join(base_dir, "plugins-en.json")
        core_en_path = os.path.join(base_dir, "upstream", "core-en.json")
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
        if web_pkg_path is None:
            web_pkg_path = os.path.expanduser("~/.dsh/profiles/web/package.json")

        if os.path.isfile(web_pkg_path):
            try:
                with open(web_pkg_path, "r", encoding="utf-8") as f:
                    web_pkg = json.load(f)
                deps = web_pkg.get("dependencies", {})
                drift_errors = []
                for pkg_name, installed_ver in sorted(deps.items()):
                    if pkg_name == "@goodandready/dsh-russian-lang":
                        continue
                    if pkg_name in plugins:
                        supp_ver = str(plugins[pkg_name])
                        clean_inst_m = re.search(r"(\d+\.\d+\.\d+)", str(installed_ver))
                        clean_supp_m = re.search(r"(\d+\.\d+\.\d+)", supp_ver)
                        if clean_inst_m and clean_supp_m:
                            if clean_inst_m.group(1) != clean_supp_m.group(1):
                                drift_errors.append(f"Дрейф версии {pkg_name}: inventory={supp_ver}, installed={installed_ver}!")
                        else:
                            clean_inst = str(installed_ver).lstrip("^~")
                            clean_supp = supp_ver.lstrip("^~")
                            if clean_inst != clean_supp:
                                drift_errors.append(f"Дрейф версии {pkg_name}: inventory={supp_ver}, installed={installed_ver}!")
                    else:
                        drift_errors.append(f"Плагин {pkg_name} установлен в профиле ({installed_ver}), но отсутствует в supported-inventory.json!")
                if drift_errors:
                    for err in drift_errors:
                        print(f"FAIL: {err}", file=sys.stderr)
                    return False
            except Exception as e:
                print(f"WARN: Ошибка при чтении профиля web: {e}", file=sys.stderr)
        else:
            # В CI окружении профиль web отсутствует — пропускаем профильную проверку
            pass

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
