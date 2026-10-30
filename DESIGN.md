# DESIGN.md — @goodandready/dsh-russian-lang

## Product / Purpose
- **Назначение**: Комплексный плагин нативной русской локализации, умной экранной типографики, исправления раскладки клавиатуры и инспектора перевода для DeepSeek Harness (DSH v0.2.0-rc.2+).
- **Аудитория**: Русскоязычные инженеры, разработчики и пользователи DSH, работающие с локальными и облачными ИИ-моделями в веб-интерфейсе.
- **Статус**: Production (v0.3.26+), поддержка 100% UI-покрытия ядра и 65+ плагинов экосистемы (8 584 ключа, 101 пространство имён).

## User Surfaces
- **DSH UI / слоты и точки монтирования**:
  1. `plugins.item` и `plugins.row.config`: Карточка настроек (`id: 'dsh-russian-lang'`) и встроенная строка настроек (`key: '@goodandready/dsh-russian-lang#dsh-russian-lang'`) во вкладке «Настройки → Плагины → Настройки плагинов».
  2. `conversation.session.header.utilities`: Быстрый переключатель языка `RU ⇄ EN` в один клик в шапке активной сессии.
  3. `conversation.chat.assistant-actions`: Кнопка «Перевести на русский» в тулбаре реплик ассистента.
  4. Инспектор перевода (<kbd>Alt+I</kbd>): интерактивное исследование UI-элементов, подсветка источников (`Core`, `Plugin`, `DOM`, `Untranslated`), редактирование оверрайдов и копирование баг-репортов.
  5. Переключение раскладки (<kbd>Alt+L</kbd>) и транслитерация (<kbd>Alt+T</kbd>) в полях ввода сообщений.
- **DSH Managed Config vs Legacy Config**:
  - DSH v0.2.0-rc.2+ / v0.1.7+: пространство `dsh-russian-lang` (согласно `cordis.patch.yml` и форме настроек).
  - DSH <= 0.1.6: пространство `russian-lang` (автоматический fallback).
- **HTTP API (`lib/index.js`)**:
  - `/api/dsh-russian-lang/dict/core`: словарь ядра DSH.
  - `/api/dsh-russian-lang/dict/plugins`: словари плагинов (по требованию, query `?names=...`).
  - `/api/dsh-russian-lang/dict/all`: полный объединённый словарь для обратной совместимости.
  - `/api/dsh-russian-lang/update`: проверка и установка обновлений плагина.
  - `/api/dsh-russian-lang/translate`: серверный перевод реплик модели (LibreTranslate/Google).
- **CLI (`bin/dsh-i18n.mjs`)**:
  - `extract <dir>`: извлечение ключей из исходного кода.
  - `validate <file.json>`: валидация словарей, скобок и терминов глоссария.
  - `scaffold <name>`: генерация шаблона локализации для нового плагина.
- **Документация**:
  - `README.md`: публичная документация для пользователей и разработчиков.
  - `docs/design/DESIGN.md`: дизайн-контракт UI/UX/API.
  - `docs/index.md`: навигация по внутренней документации проекта.

## Visual Direction
- **Атмосфера**: Высокоточный, чистый интерфейс системного уровня (Swiss typographic / Graphite DSH theme).
- **Принципы**: Нативная интеграция в дизайн-систему ядра DSH. Отсутствие чужеродных шрифтов, цветов и навязчивых баннеров.
- **Не копировать**: Сторонние UI-библиотеки, жестко закодированные hex-цвета, стили других вендоров.

## Foundations
- **Цветовая палитра**: Исключительно семантические CSS-переменные DSH:
  - Фон слоёв: `var(--dsw-alias-bg-layer-3)`, `var(--dsw-alias-bg-layer-2)`
  - Границы: `var(--dsw-alias-border-l2)`, `var(--dsw-alias-border-l1)`
  - Текст: `var(--dsw-alias-label-primary)`, `var(--dsw-alias-label-secondary)`, `var(--dsw-alias-label-tertiary)`
  - Акценты: `var(--dsw-alias-accent-primary)`, `var(--dsw-alias-accent-hover)`
- **Типографика**: Наследуемый системный шрифт интерфейса DSH (`font: inherit`). Размеры: 15px заголовок карточки, 13px поля настроек, 12px бейджи и подсказки.
- **Изоляция стилей**: Префикс `rl-` для всех селекторов, компактные переменные `--rl-bg`, `--rl-border`, `--rl-text-1..3`. Атрибут `<style data-plugin="@goodandready/dsh-russian-lang">`.
- **Лимит бандла**: Строгий размер клиентского скрипта < 160 KiB (с запасом до лимита DSH Store 256 KiB).

## Precedence & Data Contract
- **Иерархия разрешения переводов (от высшего к низшему)**:
  1. Пользовательские переопределения (`dsh-russian-lang.overrides` / `russian-lang.overrides`)
  2. Ручные словари плагинов и ядра (`ru/`, `ru-plugins/`)
  3. Машинный перевод с вычиткой (`mt-registry.json: reviewed`)
  4. Машинный перевод черновой (`mt-registry.json: draft`)
  5. Оригинальный английский текст из апстрима (`core-en.json`, `plugins-en.json`)
- **Защита DOM (Protected DOM)**:
  - Пропуск узлов с атрибутом `data-no-translate`, `data-no-translation` или CSS-классом `.no-translate`
  - Пропуск тегов `<pre>`, `<code>`, `<textarea>`, `<input>` (за исключением плейсхолдеров, если задан перевод)
  - DOM-замена китайских узлов (`zh_ru` карта) только при активной русской локали и для элементов сторонних плагинов, не поддерживающих i18n-ядро.

## Components And States
- **SettingsCard**:
  - Монтирование в слоты DSH v0.2.0-rc.1+ / v0.2.0-rc.2+:
    - `plugins.item` (#388): `id = 'dsh-russian-lang'`, монтируется через `whileServed(['dsh-russian-lang'])`.
    - `plugins.row.config` (#387): `key = '@goodandready/dsh-russian-lang#dsh-russian-lang'`, предоставляет встраиваемый вид строки настроек плагина.
    - Устаревший слот `settings.plugin.item` (#389) упразднён в DSH v0.2.0-rc.1 и удалён.
  - Состояния: `loading` (скелетон), `unavailable` (сервер недоступен), `ready` (форма настроек), `readonly` (`snap.writable === false`).
  - Полный контракт конфигурации (10 ключей):
    1. `enabled`: `boolean`, default `true` — включение русской локализации.
    2. `overrides`: `Record<string, string>`, default `{}` — пользовательские оверрайды текстов (поддерживаются scoped-ключи вида `ns.key` с приоритетом над bare-ключами).
    3. `typography`: `object`, default `{}` — интеллектуальная экранная типографика (строго opt-in):
       - `enabled`: `boolean`, default `false` — замена кавычек на «ёлочки», длинные тире, неразрывные пробелы.
       - `yo`: `boolean`, default `false` — безопасное восстановление буквы «ё».
       - `liveInput`: `boolean`, default `false` — живая типографика при вводе в текстовых полях.
    4. `agentPrompt`: `boolean`, default `false` — добавление системной инструкции агенту отвечать по-русски.
    5. `agentPromptPreset`: `string`, default `'technical_expert'` — пресет системного промпта.
    6. `slashAliases`: `boolean`, default `true` — русские алиасы слэш-команд (/помощь, /очистить и др.).
    7. `layoutConversion`: `boolean`, default `true` — автоопределение неверной раскладки и подсказка <kbd>Alt+L</kbd>.
    8. `quickSwitch`: `boolean`, default `true` — быстрый переключатель RU/EN в строке состояния (<kbd>Alt+Shift+L</kbd>).
    9. `translateEngine`: `'off' | 'local' | 'google'`, default `'off'` — движок перевода реплик ассистента.
    10. `localApiUrl`: `string`, default `'http://localhost:5000'` — URL локального инстанса LibreTranslate.
  - Защита от записи (Readonly Guard):
    - При `snap.writable === false` все интерактивные контролы (`importJsonBtn`, чекбоксы, кнопка сохранения в инспекторе) блокируются (`disabled: true`). Попытки вызова `scope.set` блокируются guards, а отказы промиса обрабатываются без сбоев интерфейса.
  - Жизненный цикл и утилизация (Lifecycle & Clean Disposal):
    - При `dispose()` полностью восстанавливаются 19 расширений объекта `runtime`, отключаются все `MutationObserver` (`zhObserver`, `typoObserver`, `spellObserver`), отменяются таймеры и анимационные кадры (`cancelAnimationFrame`), отписываются подписчики `scope` и `locale`.
- **QuickLanguageSwitcher**:
  - Компактный чип `RU` / `EN` в шапке активной сессии (`conversation.session.header.utilities`). Мгновенное переключение без перезагрузки страницы.
- **InspectorModal**:
  - Нажатие <kbd>Alt+I</kbd> включает режим исследования элементов. Клик с <kbd>Alt</kbd> открывает модальное окно с деталями ключа, источником и формой добавления оверрайда. При `writable === false` кнопки «Применить» и «Сбросить» деактивированы.
  - **Inspector Proposals Modal (#485)**:
    - Модальное окно предпросмотра исправления перевода (`openProposalModal`) со сплит-сопоставлением «было / стало», исходным текстом оригинала и текущим оверрайдом.
    - Валидация плейсхолдеров (`validatePlaceholders`): предупреждение о потере аргументов `{0}`, `%s`, `{name}` перед отправкой.
    - Экспорт предложения в GitHub/Gitea Issue (`makeIssueUrl` с параметром `isProposal: true` и безопасным лимитом URL 2000 символов).

## Three Delivery Channels (Три канала поставки)
1. **Приватный DEV-репозиторий (Gitea / MiniAI: 192.168.1.111)**:
   - Полный рабочий исходный код, сборочные скрипты (`build.py`), тесты (`test/`), инструменты (`tools/`), инвентарь (`supported-inventory.json`), внутренняя база знаний (`openwiki/**`), внутренние руководства (`AGENTS.md`, `docs/design/DESIGN.md`, `index.md`, `docs/index.md`).
2. **Публичное зеркало GitHub (`GooDAnDReaDY/dsh-russian-lang`)**:
   - Обезличенный дистрибутивный продуктовый срез: публичный `README.md`, `LICENSE`, `CHANGELOG.md`, скомпилированный `lib/client.js`, серверный `lib/index.js`, `glossary.json`, `cordis.patch.yml`, `package.json`.
   - Синхронизация выполняется строго через `scripts/publish-github.sh --push <tag>` с проверкой отсутствия запрещённых файлов.
   - Безусловно исключаются: `AGENTS.md`, `index.md`, `openwiki/**`, `docs/**` (кроме `docs/media`), `supported-inventory.json`, `.gitea/**`, `.worktrees/**`, сборочные скрипты и тесты.
3. **Публичный пакет npm (`@goodandready/dsh-russian-lang`)**:
   - Только продуктовые runtime-артефакты, определённые в `package.json:files`: `lib/`, `!lib/client.template.js`, `bin/`, `glossary.json`, `cordis.patch.yml`, `README.md`, `LICENSE`.
   - Размер архива строго < 256 KiB (контролируется `check_pack_size.py`). Исключаются любые тесты, исходный шаблон `lib/client.template.js`, внутренняя документация и скрипты.

## Do / Don't
- **Do**:
  - Использовать CSS-переменные DSH для идеальной интеграции со светлой и тёмной темой.
  - Сохранять обратную совместимость со старыми версиями DSH.
  - Тщательно очищать слушатели событий (`cleanup`, `ctx.effect`) при отключении плагина.
  - Поддерживать 100% покрытие проверенными формулировками без битых плейсхолдеров.
- **Don't**:
  - Не портить блоки кода и инлайн-код автоматической типографикой.
  - Не блокировать рендеринг страницы при сетевых задержках загрузки словарей.
  - Не превышать лимит размера файлов пакета (256 KiB) и размер `lib/client.js` (< 160 KiB).

## Locked Design Decisions
- **2026-09-07** — Настройки размещаются карточкой в слоте настроек (изначально `settings.plugin.item`, с 2026-09-28 мигрировано на нативные слоты DSH v0.2.0-rc.1+ `plugins.item` и `plugins.row.config` по #387-#389).
- **2026-09-08** — Переключатель языка `RU ⇄ EN` размещается в `conversation.session.header.utilities` для мгновенного доступа в 1 клик.
- **2026-09-15** — Словарь ядра разделяется: компактный бутстрап встраивается в `lib/client.js`, полный словарь загружается через `/api/dsh-russian-lang/dict/core`.
- **2026-09-20** — Поддержка двухуровневого хранения настроек: managed `dsh-russian-lang` (DSH v0.2.0-rc.2+) и legacy `russian-lang` (DSH <= 0.1.6).
- **2026-09-30** — Исключение `lib/client.template.js` из поставки npm и зеркала GitHub; хранение строго в DEV-репозитории.
- **2026-10-09** — Панель состояния локализации экосистемы в карточке настроек с отображением статусов, фильтрацией и регистрацией issue (#484).
- **2026-10-09** — Отправка предложений исправлений перевода прямо из инспектора с валидацией плейсхолдеров и предпросмотром контекста (#485).
