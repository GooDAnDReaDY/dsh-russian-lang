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

Complete native Russian localization pack for DeepSeek Harness Web GUI with typography engine, smart layout-switch hints, and plural form handling.

### Key Features

- **Comprehensive Core Coverage**: Translates over 30 core DSH namespaces (720+ keys) including `common`, `conversation`, `settings`, `settings.models`, `workspace`, `subagent`, `reference`, and plugin settings cards.
- **Native Language Switcher Integration**: Seamlessly adds **Русский** into **Settings → General → Language** and sets `<html lang="ru-RU">` without patching core files.
- **Russian Plural Forms**: Resolves Russian counting rules (`one/few/many`) for nouns and dynamic variables.
- **Typography Postprocessor (`russian-lang.typography`)**: Automatically formats quotes («ёлочки»), em-dashes, and non-breaking spaces after short prepositions without affecting code blocks.
- **Input Layout Fixer (`Alt+L`)**: Detects text typed in the wrong keyboard layout (e.g. `ghjtrn` → `проект`), displays a live preview tooltip, and supports instant conversion with `Alt+L`.
- **Custom Translation Overrides**: Override any key via `russian-lang.overrides` in settings.
- **Spellcheck**: Enables browser spellchecking on Russian text areas while keeping monospace code fields clean.

### Install

```bash
dsh plugin --profile web add @goodandready/dsh-russian-lang
```

After installation, select **Settings → General → Language → Русский** and reload.

### Limitations

- Translates the Web UI interface, buttons, and status indicators. Agent tool definitions and LLM system prompts remain in their native language.
- Layout auto-fix uses a built-in frequency dictionary (~9k words) to avoid false positives.

### License

MIT

---

<a name="-русский"></a>
<details open>
<summary><h2>🇷🇺 Русский (Полное руководство)</h2></summary>

Полная нативная русская локализация веб-интерфейса DeepSeek Harness с типографикой, исправлением раскладки и поддержкой plural-форм.

### Ключевые возможности

- **Полное покрытие ядра**: переведено более 30 пространств имён ядра DSH (720+ ключей), включая `common`, `conversation`, `settings`, `settings.models`, `workspace`, `subagent`, `reference` и карточки плагинов.
- **Нативная интеграция в селектор языков**: добавляет пункт «Русский» прямо в **Настройки → Общие → Язык** и синхронизирует `<html lang="ru-RU">` без модификации исходных файлов ядра.
- **Русские plural-формы**: обёртка `translate` корректно обрабатывает падежи числительных (`one/few/many`).
- **Модуль типографики (`russian-lang.typography`)**: автоматическая замена кавычек на «ёлочки», расстановка длинных тире и неразрывных пробелов после коротких предлогов (не затрагивает блоки кода и команды).
- **Исправление неверной раскладки (`Alt+L`)**: подсказка над полем ввода при наборе текста не в той раскладке (например, `ghjtrn` → `проект`), клик по подсказке заменяет текст; горячая клавиша `Alt+L`.
- **Пользовательские переопределения**: возможность переопределить любой ключ перевода через `russian-lang.overrides`.
- **Проверка орфографии**: включение встроенного браузерного `spellcheck` для текстовых полей при активном русском языке.

### Установка

```bash
dsh plugin --profile web add @goodandready/dsh-russian-lang
```

После установки выберите: **Настройки → Общие → Язык → Русский**.

### Ограничения

- Переводится только интерфейс веб-приложения. Системные промпты и описания тулов LLM не изменяются.
- Модуль исправления раскладки опирается на частотный словарь (~9k слов) во избежание ложных замен.

### Лицензия

MIT

</details>

---

<a name="-中文"></a>
<details>
<summary><h2>🇨🇳 中文 (完整技术文档)</h2></summary>

DeepSeek Harness 官方 Web UI 俄语本地化语言包，内置俄语排版引擎、智能键盘输入法纠错与复数语法支持。

### 核心功能

- **全界面核心词条覆盖**：翻译超过 30 个 DSH 核心命名空间（720+ 条词条），涵盖 `common`、`conversation`、`settings`、`workspace`、`subagent` 等。
- **无缝集成系统语言选择菜单**：在 **设置 → 通用 → 语言** 中直接新增 **Русский** 选项并同步 `<html lang="ru-RU">`，无需修改系统核心文件。
- **俄语复数语法引擎**：基于 `translate` 智能适配俄语变格规则 (`one/few/many`)。
- **俄语排版后处理器 (`russian-lang.typography`)**：自动转换俄语书名引号 («ёлочки»)、破折号与连字符，代码块内容自动免处理。
- **误切输入法纠错 (`Alt+L`)**：智能识别误用英文键盘输入的西里尔文本（如 `ghjtrn` → `проект`）并提供悬浮预览，支持快捷键 `Alt+L` 快速纠正。
- **自定义词条覆盖**：支持通过 `russian-lang.overrides` 自定义特定词条翻译。

### 安装方法

```bash
dsh plugin --profile web add @goodandready/dsh-russian-lang
```

安装完成后在 **设置 → 通用 → 语言** 中选择 **Русский** 即可。

### 开源协议

MIT

</details>
