# @goodandready/dsh-russian-lang — Индекс DEV-репозитория

Внутренняя навигационная карта и регламент разработки плагина русской локализации для DeepSeek Harness.

---

## Быстрая навигация по документации

| Документ | Назначение |
|---|---|
| [README.md](README.md) | Публичная документация: возможности, установка, конфигурация, горячие клавиши |
| [docs/design/DESIGN.md](docs/design/DESIGN.md) | Обязательный дизайн-контракт: UI-слоты, дизайн-система, защита DOM, каналы поставки |
| [AGENTS.md](AGENTS.md) | Руководство для ИИ-агентов: регламент Git, правила изоляции, проверки качества |
| [docs/index.md](docs/index.md) | Карта документации и медиа-материалов проекта |
| [openwiki/](openwiki/) | Внутренняя база знаний: архитектура, конфигурация, регламенты, тестирование, API |
| [glossary.json](glossary.json) | Канонический глоссарий терминов DSH и AI-экосистемы |
| [CHANGELOG.md](CHANGELOG.md) | История изменений и журнал релизов |

---

## Архитектура и структура файлов

```
dsh-russian-lang/
├── bin/
│   └── dsh-i18n.mjs              # CLI-утилита (extract, validate, scaffold, po/xliff)
├── lib/
│   ├── client.template.js         # Исходный код клиентской части (только в DEV)
│   ├── client.js                  # Скомпилированный клиентский бандл (< 160 KiB)
│   ├── index.js                   # Серверная половина Cordis-плагина
│   └── locales/                   # Встроенные и резервные словари
├── ru/                            # Словари ядра DSH (JSON)
├── ru-plugins/                    # Словари плагинов экосистемы (65+ плагинов)
├── tools/                         # Инструменты валидации, импорта/экспорта и CI
├── test/                          # Тестовый набор (Node.js VM + Python)
├── docs/                          # Дизайн-контракт и архитектурная документация
├── cordis.patch.yml               # Декларация схемы настроек Cordis
├── build.py                       # Сборщик клиентского бандла
└── check-coverage.py              # Валидатор покрытия и целостности данных
```

---

## Регламент разработки (Workflow)

### 1. Подготовка и сборка
Все операции на MiniAI выполняются под пользователем `sudo -u vadim`.
При любых изменениях в `lib/client.template.js` или базовых словарях:
```bash
python3 build.py
```
Скрипт выполняет слияние шаблона со словарями, проверяет синтаксис и гарантирует размер бандла `< 160 KiB`.

### 2. Тестирование
```bash
# Запуск полного тестового набора
npm test

# Полный статический анализ и проверка шлюзов качества
npm run check
```

### 3. Релиз и развёртывание на production
1. Создание PR в Gitea (`base: main`) и слияние методом merge commit.
2. Установка тега версии: `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. Синхронизация с публичным GitHub:
   ```bash
   bash scripts/publish-github.sh --push vX.Y.Z
   ```
4. Создание релиза на GitHub.
5. Публикация в реестр npm:
   ```bash
   npm publish --access public
   ```
6. Обновление рабочего профиля DSH:
   ```bash
   cd /home/vadim/.dsh/profiles/web
   pnpm up @goodandready/dsh-russian-lang@latest
   systemctl --user restart dsh-web.service
   ```
