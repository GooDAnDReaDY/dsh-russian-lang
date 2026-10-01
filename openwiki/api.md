---
title: API и инструменты
description: Документация серверных HTTP-маршрутов и CLI утилиты dsh-i18n.
tags: [api, routes, cli, tools]
---

# API и CLI утилиты

## Серверные HTTP-маршруты

Серверная часть плагина (`lib/index.js`) регистрирует следующие эндпоинты в контексте Cordis:

- `GET /api/dsh-russian-lang/dict/core`:
  Возвращает объединённый словарь русской локализации ядра DSH в формате JSON.
- `GET /api/dsh-russian-lang/dict/plugin/:name`:
  Возвращает словарь русской локализации для указанного плагина экосистемы.
- `GET /api/dsh-russian-lang/status`:
  Возвращает текущий статус службы локализации, число активных словарей и метрики покрытия.

## CLI-утилита `bin/dsh-i18n.mjs`

В комплект поставки плагина входит CLI-утилита `dsh-i18n` для разработчиков плагинов экосистемы:

```bash
# Извлечение ключей локализации из исходного кода плагина
node bin/dsh-i18n.mjs extract ./src/client

# Валидация словарей на соответствие плейсхолдеров и синтаксис
node bin/dsh-i18n.mjs validate ./locales/ru.json --source ./locales/en.json

# Экспорт словарей в формат PO (Gettext)
node bin/dsh-i18n.mjs po export ./locales/ru.json -o ./locales/ru.po

# Импорт переведённого PO обратно в JSON
node bin/dsh-i18n.mjs po import ./locales/ru.po -o ./locales/ru.json
```
