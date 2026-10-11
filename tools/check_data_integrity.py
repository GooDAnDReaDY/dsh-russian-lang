#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""tools/check_data_integrity.py — строгая проверка целостности данных и инвентаря (#235, #432)"""

import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def parse_semver(v):
    """Строгий парсер SemVer 2.0.0 (MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]).

    Согласно спецификации SemVer 2.0.0:
    - Числа MAJOR, MINOR, PATCH не должны содержать ведущих нулей (§2).
    - Числовые идентификаторы в PRERELEASE не должны содержать ведущих нулей (§9).
    """
    if not isinstance(v, str):
        return None
    v = v.strip()
    m = re.match(
        r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)"
        r"(?:-([0-9a-zA-Z.-]+))?"
        r"(?:\+([0-9a-zA-Z.-]+))?$",
        v
    )
    if not m:
        return None

    major, minor, patch = int(m.group(1)), int(m.group(2)), int(m.group(3))
    prerelease = m.group(4) or ""

    if prerelease:
        parts = prerelease.split(".")
        for p in parts:
            if not p:
                return None
            if p.isdigit() and len(p) > 1 and p.startswith("0"):
                return None

    return (major, minor, patch, prerelease)


def _cmp_prerelease(pre1, pre2):
    """Сравнение pre-release версий по спецификации SemVer 2.0.0 §11.4."""
    parts1 = pre1.split(".")
    parts2 = pre2.split(".")
    for p1, p2 in zip(parts1, parts2):
        if p1 == p2:
            continue
        p1_num = p1.isdigit()
        p2_num = p2.isdigit()
        if p1_num and p2_num:
            n1, n2 = int(p1), int(p2)
            if n1 != n2:
                return -1 if n1 < n2 else 1
        elif p1_num and not p2_num:
            # Числовые идентификаторы имеют меньший приоритет, чем нечисловые (§11.4.3)
            return -1
        elif not p1_num and p2_num:
            return 1
        else:
            return -1 if p1 < p2 else 1
    if len(parts1) != len(parts2):
        return -1 if len(parts1) < len(parts2) else 1
    return 0


def semver_cmp(v1, v2):
    """Сравнение двух распарсенных кортежей SemVer (SemVer 2.0.0 §11)."""
    p1 = (v1[0], v1[1], v1[2])
    p2 = (v2[0], v2[1], v2[2])
    if p1 != p2:
        return -1 if p1 < p2 else 1

    pre1, pre2 = v1[3], v2[3]
    if not pre1 and pre2:
        return 1
    if pre1 and not pre2:
        return -1
    if not pre1 and not pre2:
        return 0
    return _cmp_prerelease(pre1, pre2)


def satisfies_range(ver_str, range_str):
    """Проверка попадания версии в диапазон (например, '>=0.2.0-rc.1 <0.3.0')."""
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
        print(f"FAIL: Файл {rel_path} не существует!", file=sys.stderr)
        return False
    sz = os.path.getsize(path)
    if sz < min_size:
        print(f"FAIL: Файл {rel_path} ({sz} байт) меньше минимального порога ({min_size} байт)!", file=sys.stderr)
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
        # 1. Проверка версии ядра и диапазона совместимости SemVer
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

        # 2. Метрики ключей и проверка идентичности (EN identity gate)
        plugins_en_path = os.path.join(base_dir, "plugins-en.json")
        core_en_path = os.path.join(base_dir, "upstream", "core-en.json")
        root_core_path = os.path.join(base_dir, "core-en.json")
        if os.path.isfile(root_core_path) and os.path.isfile(core_en_path):
            with open(root_core_path, "rb") as f1, open(core_en_path, "rb") as f2:
                if f1.read() != f2.read():
                    print("FAIL: core-en.json и upstream/core-en.json расходятся (#469)!", file=sys.stderr)
                    return False
        core_ru_path = os.path.join(base_dir, "lib", "locales", "core.json")
        plugins_ru_dir = os.path.join(base_dir, "lib", "locales", "plugins")

        if os.path.isfile(plugins_en_path) and os.path.isfile(core_en_path):
            with open(plugins_en_path, "r", encoding="utf-8") as f:
                plugins_en = json.load(f)
            with open(core_en_path, "r", encoding="utf-8") as f:
                core_en = json.load(f)

            expected_core_keys = sum(len(v) for v in core_en.values() if isinstance(v, dict))
            expected_plugin_keys = sum(len(v) for v in plugins_en.values() if isinstance(v, dict))
            expected_total_keys = expected_core_keys + expected_plugin_keys
            expected_total_ns = len(core_en) + len(plugins_en)

            keys_count = inv.get("metrics", {}).get("total_keys")
            if keys_count != expected_total_keys:
                print(f"FAIL: total_keys в inventory ({keys_count}) не совпадает со snapshot ({expected_total_keys})!", file=sys.stderr)
                return False

            total_ns = inv.get("metrics", {}).get("total_namespaces")
            if total_ns != expected_total_ns:
                print(f"FAIL: total_namespaces в inventory ({total_ns}) не совпадает со snapshot ({expected_total_ns})!", file=sys.stderr)
                return False

            # Проверка идентичности ключей ядра (EN identity gate против подмены ключей)
            if os.path.isfile(core_ru_path):
                with open(core_ru_path, "r", encoding="utf-8") as f:
                    core_ru = json.load(f)
                missing_core_identity = []
                for ns, kv in core_en.items():
                    if isinstance(kv, dict):
                        ru_ns = core_ru.get(ns, {})
                        for k in kv.keys():
                            if k not in ru_ns:
                                missing_core_identity.append(f"{ns}.{k}")
                if missing_core_identity:
                    print(f"FAIL: upstream/core-en.json содержит ключи, отсутствующие в словарях: {missing_core_identity[:5]} (всего {len(missing_core_identity)})!", file=sys.stderr)
                    return False

            # Проверка идентичности ключей плагинов (EN identity gate для плагинов)
            if os.path.isdir(plugins_ru_dir):
                plugins_ru_keys = set()
                for pf in glob.glob(os.path.join(plugins_ru_dir, "*.json")):
                    try:
                        with open(pf, "r", encoding="utf-8") as f:
                            pdata = json.load(f)
                            for pns, pkv in pdata.items():
                                if isinstance(pkv, dict):
                                    for pk in pkv.keys():
                                        plugins_ru_keys.add((pns, pk))
                    except Exception:
                        pass
                missing_plugin_identity = []
                for pns, pkv in plugins_en.items():
                    if isinstance(pkv, dict):
                        for pk in pkv.keys():
                            if (pns, pk) not in plugins_ru_keys:
                                missing_plugin_identity.append(f"{pns}.{pk}")
                if missing_plugin_identity:
                    print(f"FAIL: plugins-en.json содержит ключи, отсутствующие в плагинных переводах: {missing_plugin_identity[:5]} (всего {len(missing_plugin_identity)})!", file=sys.stderr)
                    return False

        # 3. Валидация списка поддерживаемых плагинов
        plugins = inv.get("supported_plugins", {})
        if not plugins or len(plugins) < 50:
            print(f"FAIL: supported-inventory.json содержит слишком мало плагинов ({len(plugins)})!", file=sys.stderr)
            return False

        valid_version_pattern = re.compile(r"^(\^|~|>=)?(file:|github:)?[0-9a-zA-Z._\-\/:#]+$")
        for pkg, ver in plugins.items():
            if "9999" in str(ver) or "fake" in str(pkg).lower() or "fake" in str(ver).lower():
                print(f"FAIL: Обнаружена фиктивная версия/пакет: {pkg}={ver}", file=sys.stderr)
                return False
            if not valid_version_pattern.match(str(ver)):
                print(f"FAIL: Недопустимый формат версии для {pkg}: {ver}", file=sys.stderr)
                return False

        # 4. Проверка дрейфа версий в профиле (resolved + declared)
        if web_pkg_path is None:
            if os.environ.get("CI") == "1":
                return True
            web_pkg_path = os.path.expanduser("~/.dsh/profiles/web/package.json")

        if os.path.isfile(web_pkg_path):
            try:
                web_dir = os.path.dirname(os.path.abspath(web_pkg_path))
                with open(web_pkg_path, "r", encoding="utf-8") as f:
                    web_pkg = json.load(f)
                deps = web_pkg.get("dependencies", {})
                drift_errors = []

                for pkg_name, declared_ver in sorted(deps.items()):
                    if pkg_name == "@goodandready/dsh-russian-lang":
                        continue

                    # Проверка РЕАЛЬНО установленной (resolved) версии из node_modules/<pkg>/package.json
                    resolved_ver = None
                    nm_pkg_path = os.path.join(web_dir, "node_modules", *pkg_name.split("/"), "package.json")
                    if os.path.isfile(nm_pkg_path):
                        try:
                            with open(nm_pkg_path, "r", encoding="utf-8") as nmf:
                                resolved_ver = json.load(nmf).get("version")
                        except Exception:
                            pass

                    if pkg_name in plugins:
                        supp_ver = str(plugins[pkg_name])

                        # Если inventory указывает github: спецификатор или declared является github:
                        if supp_ver.startswith("github:") or str(declared_ver).startswith("github:"):
                            # Строго проверяем спецификатор целиком с commit-ish (#ref) без отбрасывания fragment (#432)
                            if supp_ver != str(declared_ver):
                                drift_errors.append(
                                    f"Дрейф спецификатора {pkg_name}: inventory={supp_ver}, declared={declared_ver}!"
                                )
                            # Проверяем фактическое наличие установленного пакета в node_modules
                            if resolved_ver is None:
                                drift_errors.append(
                                    f"Пакет {pkg_name} ({declared_ver}) не установлен в node_modules!"
                                )
                            continue

                        # Иначе сопоставляем версию (resolved имеет приоритет перед declared)
                        effective_ver = resolved_ver if resolved_ver is not None else declared_ver

                        inst_m = re.search(r"(\d+\.\d+\.\d+(?:-[0-9a-zA-Z.-]+)?)", str(effective_ver))
                        supp_m = re.search(r"(\d+\.\d+\.\d+(?:-[0-9a-zA-Z.-]+)?)", supp_ver)

                        if inst_m and supp_m:
                            inst_sem = parse_semver(inst_m.group(1))
                            supp_sem = parse_semver(supp_m.group(1))
                            if inst_sem and supp_sem:
                                if semver_cmp(inst_sem, supp_sem) != 0:
                                    drift_errors.append(
                                        f"Дрейф версии {pkg_name}: inventory={supp_ver}, installed={effective_ver}!"
                                    )
                            elif inst_m.group(1) != supp_m.group(1):
                                drift_errors.append(
                                    f"Дрейф версии {pkg_name}: inventory={supp_ver}, installed={effective_ver}!"
                                )
                        else:
                            clean_inst = str(effective_ver).lstrip("^~")
                            clean_supp = supp_ver.lstrip("^~")
                            if clean_inst != clean_supp:
                                drift_errors.append(
                                    f"Дрейф версии {pkg_name}: inventory={supp_ver}, installed={effective_ver}!"
                                )
                    else:
                        drift_errors.append(
                            f"Пакет {pkg_name} установлен в профиле ({declared_ver}), но не описан в supported-inventory.json!"
                        )

                if drift_errors:
                    for err in drift_errors:
                        print(f"FAIL: {err}", file=sys.stderr)
                    return False
            except Exception as e:
                print(f"WARN: Ошибка при чтении профиля web: {e}", file=sys.stderr)
        else:
            # В CI окружении профиль web может отсутствовать
            pass

        return True
    except Exception as e:
        print(f"FAIL: Ошибка при проверке supported-inventory.json: {e}", file=sys.stderr)
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
