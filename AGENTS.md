# AGENTS.md — @goodandready/dsh-russian-lang

Внутреннее руководство для автономных ИИ-агентов, работающих с проектом `@goodandready/dsh-russian-lang`.
Подчиняется правилам `gitea-project-workflow`, `project-design-contract`, `dsh-plugin-authoring`.

## Product / Purpose
- **Проект**: `@goodandready/dsh-russian-lang`
- **Путь в DEV**: `/mnt/external/Project/DEV/dhsplugins/dsh-russian-lang`
- **Профиль DSH**: `/home/vadim/.dsh/profiles/web` (устанавливается и тестируется вживую на MiniAI `mini111-lan`)
- **Назначение**: Полная русская локализация, экранная типографика, исправление раскладки клавиатуры и инспектор перевода для DeepSeek Harness.
- **Дизайн-контракт**: `docs/design/DESIGN.md` (обязателен к соблюдению перед любыми изменениями UI/UX/API).

## Entry Points & Core Files
- `lib/client.template.js`: Исходный шаблон клиентского бандла (React/preact-компоненты карточки настроек, переключателя, инспектора и типографики).
- `lib/client.js`: Скомпилированный клиентский бандл (генерируется через `python3 build.py`, размер строго < 160 KiB).
- `lib/index.js`: Серверная половина Cordis-плагина (HTTP-маршруты словарей, регистрация схемы настроек, перевод реплик).
- `ru/`: Словари ядра DSH (JSON).
- `ru-plugins/`: Словари 65+ плагинов экосистемы DSH (JSON).
- `glossary.json`: Канонический глоссарий терминов DSH и AI-экосистемы.
- `bin/dsh-i18n.mjs`: CLI-утилита для извлечения, валидации и скаффолдинга словарей.
- `build.py`: Скрипт сборки клиентского бандла и валидации синхронизации (`--check`).
- `check-coverage.py`: Проверка 100% покрытия переводов ядра и плагинов.
- `scripts/gitea_tool.py`: Инструмент интеграции с локальным Gitea (issues, PRs, merge).
- `scripts/publish-github.sh`: Синхронизация релизных коммитов в публичное зеркало GitHub.

## Development Workflow & Rules
1. **Строгая изоляция и разрешения**:
   - Все файловые операции и git-команды на MiniAI выполнять под пользователем `sudo -u vadim`.
2. **Сборка и лимиты**:
   - После изменения `lib/client.template.js` или словарей `ru/*.json` обязательно запускать `python3 build.py`.
   - Проверять размер `lib/client.js` (< 160 KiB). Никаких тяжелых зависимостей в браузере.
3. **Тестирование**:
   - `npm test`: запуск всех тестов Node.js и Python.
   - `npm run check`: полный аудит (build check, lint translations, coverage, glossary, pack size, data integrity).
4. **Релизы и каналы поставки**:
   - Изменения вливать через PR в Gitea с сохранением истории (`Do: 'merge'`).
   - Публикация на GitHub: `scripts/publish-github.sh --push vX.Y.Z`.
   - Публикация в npm: `npm publish --access public`.
   - Деплой на продакшн: обновление в `/home/vadim/.dsh/profiles/web` и перезапуск `dsh-web.service`.
