# 📦 @goodandready/dsh-russian-lang

<div align="center">

<h3>Полная русская локализация веб-интерфейса DeepSeek Harness</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@goodandready/dsh-russian-lang"><img src="https://img.shields.io/npm/v/@goodandready/dsh-russian-lang.svg?style=for-the-badge&color=6366f1&labelColor=1e1b4b" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/GooDAnDReaDY/dsh-russian-lang.svg?style=for-the-badge&color=10b981&labelColor=064e3b" alt="license"></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/DSH-Plugin-8b5cf6.svg?style=for-the-badge&labelColor=2e1065" alt="DSH Plugin"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-20%2B-f59e0b.svg?style=for-the-badge&labelColor=451a03" alt="Node version"></a>
</p>

</div>

---

Полный нативный пакет русской локализации веб-интерфейса **DeepSeek Harness** со встроенным модулем типографики, исправлением неверной раскладки клавиатуры и поддержкой русских форм множественного числа (plural-форм).

```mermaid
graph LR
    Core[Ядро DSH] --> Router[Локализация dsh-russian-lang]
    Router --> Dicts[30+ Пространств имён ядра / 720+ ключей]
    Router --> Plurals[Русские plural-формы числительных]
    Router --> Typo[Модуль типографики: кавычки-ёлочки и тире]
    Router --> LayoutFix[Исправление неверной раскладки Alt+L]
    Router --> NativeMenu[Настройки -> Общие -> Язык -> Русский]
```

## ✨ Ключевые возможности

* **Полное покрытие ядра**: переведено более 30 пространств имён ядра DSH (720+ ключей локализации), включая `common`, `conversation`, `settings`, `settings.models`, `workspace`, `subagent`, `reference`, системные статусы и карточки плагинов.
* **Нативная интеграция в селектор языков**: добавляет пункт **«Русский»** прямо в меню **Настройки → Общие → Язык** и синхронизирует `<html lang="ru-RU">` без модификации и патчинга исходных файлов ядра.
* **Русские plural-формы**: обёртка `translate` корректно обрабатывает грамматические формы числительных (`один / несколько / много`).
* **Модуль типографики (`russian-lang.typography`)**: автоматическая расстановка кавычек-«ёлочек», длинных тире и неразрывных пробелов после коротких предлогов (не затрагивает блоки кода и моноширинные поля).
* **Исправление ошибочной раскладки (`Alt+L`)**: интеллектуальное распознавание текста, набранного латиницей вместо кириллицы (например, `ghjtrn` → `проект`), с выводом интерактивной подсказки над строкой ввода и горячей клавишей <kbd>Alt+L</kbd>.
* **Пользовательские переопределения**: возможность переопределить любой системный ключ перевода через пространство настроек `russian-lang.overrides`.
* **Проверка орфографии**: автоматическая активация браузерного словаря `spellcheck` для русскоязычных текстовых полей.

## 📦 Установка

```bash
dsh plugin --profile web add @goodandready/dsh-russian-lang
```

После установки выберите: **Настройки → Общие → Язык → Русский** и обновите страницу.

## 📄 Лицензия

MIT © [GooDAnDReaDY](https://github.com/GooDAnDReaDY)
