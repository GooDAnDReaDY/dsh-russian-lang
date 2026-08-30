# 📦 @goodandready/dsh-russian-lang

<div align="center">

[![npm version](https://img.shields.io/npm/v/@goodandready/dsh-russian-lang.svg?style=flat-square)](https://www.npmjs.com/package/@goodandready/dsh-russian-lang)
[![license](https://img.shields.io/github/license/GooDAnDReaDY/dsh-russian-lang.svg?style=flat-square)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-6366f1.svg?style=flat-square)](https://github.com/topics/dsh-plugin)

**[ 🇬🇧 English ](#-english) • [ 🇷🇺 Русский ](#-русский) • [ 🇨🇳 中文 ](#-中文)**

</div>

---

<a name="-english"></a>
## 🇬🇧 English

# @goodandready/dsh-russian-lang

Русская локализация веб-интерфейса DeepSeek Harness.

## Что делает

- Регистрирует русские словари для namespace'ов ядра (`common`,
  `conversation`, `settings`, `settings.models`, `workspace`, `subagent`,
  `reference` и другие — **30 namespace'ов ядра, 722 ключа, 100% покрытия**
  релизной поверхности DSH 0.1.1-rc.2) и для ряда сторонних плагинов.
- Добавляет **«Русский» третьей позицией** в родной список языков
  (**Настройки → Общие → Язык**). Выбор сохраняется штатным механизмом
  настроек DSH и переживает браузеры.
- Синхронизирует `<html lang="ru-RU">` при активном русском.

Непереведённые ключи показываются по-английски (штатный fallback ядра), пустых
мест в интерфейсе не появляется.

### Помимо словарей

- **Русские plural-формы.** Обёртка `translate` резолвит `one/few/many` для
  счётных ключей (как с суффиксом `.one/.other`, так и голых — через
  `X.one/X.few/X.many`).
- **Пользовательские переопределения.** Пространство настроек
  `russian-lang.overrides` — `{ ключ: формулировка }`, применяется верхним
  слоем поверх словарей.
- **Типографика вывода** (`russian-lang.typography`). Идемпотентный
  постпроцессор текстовых узлов: кавычки-«ёлочки», тире, неразрывные пробелы
  после коротких слов, опциональная ё (флаг `yo`). Код, ссылки и поля ввода не
  трогаются.
- **Орфография** — браузерный `spellcheck` на текстовых полях при активном
  русском; моноширинные поля (код, команды) исключаются.
- **Фикс неправильной раскладки.** Если текст набран латиницей вместо
  кириллицы, над инпутом появляется подсказка с превью конвертации; клик
  заменяет. Конверсия кириллицы→латиницы предлагается только для
  slash-команд. Ручной конверт текущего инпута — `Alt+L`.

## Как это работает

Реестр локалей живёт в браузере: плагин докладывает русские словари в чужие
namespace'ы через `ctx.locale.register(ns, 'ru', dict)`. Namespace'ы, которые
плагины уже локализуют сами на русский, пропускаются (иначе загрузчик падает с
`already has locale ru`).

Список языков штатного селектора (`Настройки → Общие → Язык`) живёт в snapshot
локаль-runtime; меню строится из него, и `setLocale()` валидирует выбор по
нему же. На версиях ядра, где `ru` ещё не в списке (DSH 0.1.1-rc.2 из
коробки), плагин расширяет snapshot пунктом «Русский» — файлы ядра не
правятся. Если ядро когда-нибудь узнает `ru` само, расширение не происходит
и всё работает штатно. Запись выбора в настройки идёт через собственный
namespace `russian-lang` (хост-схема ядра знает только `zh/en` и не
принимает `ru`).

Ничего в установке DSH не патчится; удаление плагина полностью возвращает
интерфейс к исходному состоянию.

## Установка

```bash
dsh plugin --profile web add @goodandready/dsh-russian-lang
```

Затем: **Настройки → Общие → Язык → Русский**.

## Разработка и проверка

```bash
python3 extract-dicts.py <node_modules ядра> [node_modules профиля]  # обновить *-en.json
python3 check-coverage.py                                             # что не переведено / устарело
python3 build.py                                                    # собрать lib/client.js
python3 tools/mt_fallback.py --dry-run                              # непереведённые ключи
python3 tools/mt_fallback.py --review                              # очередь ручной выверки MT
python3 tools/merge_freq.py                                        # обновить freq-словарь для фикса раскладки
python3 tools/upstream_check.py                                    # ночной апстрим-детектор новых ключей
python3 tools/top100.py <профиль>/node_modules                     # отчёт покрытия плагинов
python3 test/test_extract.py                                       # smoke для extract-dicts/check-coverage
python3 test/smoke.py                                              # E2E против запущенного контура
```

MT-переводы непереведённых ключей (`mt_fallback.py --apply`) пишутся в
`mt-registry.json` как обычные строки; ручной перевод в `ru/*.json` всегда
имеет приоритет. Очередь ручной выверки — `upstream/review-queue.md`.

`smoke.py` требует `websocket-client` (`pip install websocket-client`) и Chrome
на `/usr/bin/google-chrome`. Адрес переопределяется через `DSH_URL`.

## Скриншоты

| Что | Файл |
|-----|------|
| Интерфейс на русском | `docs/media/ui-russian.png` |
| Список языков в Настройки → Общие | `docs/media/language-selector.png` |

Скриншоты обновляются через `python3 test/screenshots.py`.

## Ограничения

- Переводится только веб-интерфейс. Описания тулов и системные промпты агента
  — не locale, плагин их не трогает.
- Плагины, которые рисуют текст инлайном без locale-слотов, не переводятся.
- Текст, добавленный сторонним плагином без `ctx.locale.register`, остаётся на
  языке плагина — для перевода нужно обновить сам плагин.
- Фикс раскладки опирается на встроенный частотный словарь (~9k слов) и может
  не распознать редкую терминологию; ложных замен нет — только подсказка.

## Лицензия

MIT

---

<a name="-русский"></a>
<details open>
<summary><h2>🇷🇺 Русский (Полное руководство)</h2></summary>

Полная русская локализация веб-интерфейса DeepSeek Harness.

## Что делает плагин

- Регистрирует русские словари для пространств имён ядра (`common`, `conversation`, `settings`, `settings.models`, `workspace`, `subagent`, `reference` и другие — более 30 пространств имён и 700+ ключей перевода).
- Полная локализация настроек, карточек провайдеров и статусов агента.

## Установка

```bash
dsh plugin --profile web add @goodandready/dsh-russian-lang
```

## Лицензия

MIT

</details>

---

<a name="-中文"></a>
<details>
<summary><h2>🇨🇳 中文 (完整技术文档)</h2></summary>

DeepSeek Harness 官方 Web UI 俄语本地化语言包。

## 功能说明

- 为核心命名空间提供超过 30 个命名空间、700+ 条完整俄语翻译词条（涵盖会话、设置、智能体运行状态等）。
- 完美适配系统原生语言切换菜单。

## 安装指南

```bash
dsh plugin --profile web add @goodandready/dsh-russian-lang
```

## 开源协议

MIT

</details>
