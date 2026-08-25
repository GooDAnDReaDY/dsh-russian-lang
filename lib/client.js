// dsh-russian-lang — браузерная половина. ФАЙЛ СГЕНЕРИРОВАН, правьте ru/*.json
// и ru-plugins/*.json и запускайте build.py.
//
// Плагин докладывает русский словарь в чужие namespace'ы: реестр локалей это
// разрешает — register(ns, locale, dict) конфликтует только если пара
// (namespace, язык) уже занята, а "ru" не занимает никто.
//
// Ядро без русского: список языков (LOCALES) зашит в @deepseek-ai/dsh-client-locale,
// из него родная строка Language строит меню и setLocale() берёт валидацию.
// Список живёт в snapshot локаль-runtime — плагин расширяет snapshot пунктом
// "Русский", и родной селектор показывает его третьей позицией. Файлы ядра не
// правятся; если ядро когда-нибудь узнает "ru" само, расширение не происходит.
window.__ModuleLoader__.load({
  id: '@goodandready/dsh-russian-lang',
  factory: (require) => {
    var module = { exports: {} }

    /** namespace -> { ключ: перевод } */
    const RU = {
 "betterSidebar": {
  "addPluginsBrowseMore": "Ещё плагины на GitHub (тема: dsh-better-sidebar)",
  "addPluginsEmpty": "Подборки пока нет — опубликуйте свой плагин под темой на GitHub",
  "addPluginsRecommended": "Рекомендуемые плагины",
  "addPluginsTabCard": "Добавить плагины вкладок",
  "addPluginsTabCardDesc": "Зарегистрировать новую страницу панели",
  "addPluginsTabDesc": "Страницы панели (вкладки) расширяются плагинами. Плагины регистрируются через сервис ctx.betterSidebar; кнопка «Установить» копирует команду — вставьте её в терминал на машине с профилем DSH и выполните.",
  "addPluginsViewerCard": "Добавить плагины предпросмотра",
  "addPluginsViewerCardDesc": "Зарегистрировать просмотр нового типа файлов",
  "addPluginsViewerDesc": "Просмотрщики файлов расширяются плагинами. Плагины регистрируются через сервис ctx.betterSidebar; кнопка «Установить» копирует команду — вставьте её в терминал на машине с профилем DSH и выполните.",
  "addToConversation": "Добавить в диалог",
  "binary": "Двоичный файл, предпросмотр недоступен",
  "binaryNoPreview": "Этот тип файлов нельзя показать",
  "branch": "Ветка",
  "brokenSymlink": "Битая ссылка",
  "browser": "Браузер",
  "browserBack": "Назад",
  "browserBlockedLoopback": "Заблокировано: локальные и внутренние адреса здесь открывать нельзя",
  "browserBlockedScheme": "Заблокировано: разрешены только адреса http и https",
  "browserEmbedAnyway": "Всё равно загрузить",
  "browserEmbedBlocked": "{host} запрещает встраивание",
  "browserEmbedBlockedDesc": "Сайт запрещает показывать себя внутри других страниц (X-Frame-Options / frame-ancestors), поэтому в панели он не откроется. Откройте его в обычном браузере.",
  "browserForward": "Вперёд",
  "browserGo": "Перейти",
  "browserInvalid": "Неверный адрес",
  "browserNoSandboxWarning": "Песочница выключена: страница работает с полными правами интерфейса (включить обратно можно в настройках)",
  "browserOpenExternal": "Открыть в браузере",
  "browserPlaceholder": "Введите адрес, например example.com",
  "browserStart": "Введите адрес, чтобы начать (режим песочницы)",
  "cancel": "Отмена",
  "changes": "Изменения",
  "checkoutError": "Переключить ветку не удалось",
  "cherryPickCommit": "Перенести коммит",
  "cherryPickDesc": "Применить изменения «{subject}» к текущей ветке.",
  "cherryPickTitle": "Перенос коммита",
  "close": "Закрыть",
  "collapse": "Свернуть панель",
  "collapseBottomPanel": "Свернуть нижнюю панель",
  "commit": "Закоммитить",
  "commitError": "Коммит не удался",
  "commitPlaceholder": "Сообщение коммита (Ctrl+Enter)",
  "copied": "Скопировано",
  "copy": "Копировать",
  "copyAbsolute": "Копировать абсолютный путь",
  "copyFullHash": "Копировать полный хеш",
  "copyInstall": "Копировать команду установки",
  "copyRelative": "Копировать относительный путь",
  "copyShortHash": "Копировать короткий хеш",
  "copySubject": "Копировать заголовок",
  "diffAdded": "Добавлено",
  "diffBinary": "Двоичный",
  "diffCollapse": "Свернуть",
  "diffDeleted": "Удалено",
  "diffEmpty": "Текстовых изменений нет",
  "diffExpand": "Показать ещё строк: {count}",
  "diffLoadError": "Не удалось загрузить различия",
  "diffRenamed": "Переименовано",
  "discard": "Отменить изменения",
  "discardDesc": "Изменения «{path}» в рабочем дереве будут отброшены без возможности вернуть.",
  "discardTitle": "Отмена изменений",
  "disconnected": "Терминал отключился, переподключаемся…",
  "download": "Скачать",
  "downloadToView": "Скачать, чтобы посмотреть",
  "edit": "Изменить",
  "editor": "Редактор",
  "editorEmptyHint": "Выберите файл в дереве или введите путь выше, чтобы открыть предпросмотр",
  "editorExplorer": "Как открывать файлы",
  "editorExplorerDesc": "Управляет поведением при открытии файлов",
  "editorExplorerMerged": "В одном окне",
  "editorExplorerMergedDesc": "Файлы сменяются в том же окне; новые окна открываются с деревом",
  "editorExplorerSplit": "Раздельно",
  "editorExplorerSplitDesc": "Окно без пути — это отдельный проводник (только дерево); каждый файл открывается своим окном (дерево пристыковано и по умолчанию закрыто)",
  "editorPathPlaceholder": "Путь к файлу (от папки сессии или абсолютный), Enter — открыть",
  "editorSearchNoResults": "Подходящих файлов нет",
  "editorSearchPlaceholder": "Поиск файлов по имени…",
  "editorSearchTruncated": "Слишком много совпадений — показана часть",
  "editorTreeToggle": "Дерево файлов",
  "error": "Не удалось загрузить",
  "exited": "Процесс терминала завершился",
  "expand": "Развернуть панель",
  "expandBottomPanel": "Развернуть нижнюю панель",
  "explorer": "Проводник",
  "files": "Файлы",
  "git": "Контроль версий",
  "gitDetail": "Посмотреть изменения",
  "hiddenFiles": "Скрытые файлы",
  "history": "История",
  "historyLoadError": "Не удалось догрузить историю",
  "htmlNoSandboxWarning": "Песочница выключена: этот HTML работает с полными правами интерфейса (включить обратно можно в настройках)",
  "jobDurationHours": "{hours} ч {minutes} мин",
  "jobDurationMinutes": "{minutes} мин {seconds} с",
  "jobDurationSeconds": "{seconds} с",
  "jobHideOutput": "Скрыть вывод",
  "jobKill": "Прервать",
  "jobKillConfirm": "Нажмите ещё раз для подтверждения",
  "jobKillError": "Прервать не удалось",
  "jobNoOutput": "Вывода пока нет",
  "jobNotReadYet": "Ждём, пока модель прочитает эту задачу; вывод появится здесь после вызова job_output",
  "jobOutputError": "Не удалось прочитать вывод",
  "jobOutputTruncated": "Вывод обрезан",
  "jobStatusCompleted": "Завершена",
  "jobStatusFailed": "Ошибка",
  "jobStatusKilled": "Прервана",
  "jobStatusRunning": "Выполняется",
  "jobStatusStopping": "Останавливается",
  "jobViewOutput": "Посмотреть вывод",
  "jobs": "Фоновые задачи",
  "jobsCount": "фоновых задач: {count}",
  "jobsCountRunning": "фоновых задач: {count} · выполняется: {running}",
  "loadMore": "Показать ещё",
  "loading": "Загрузка…",
  "newFile": "Новый файл",
  "newTab": "Новая вкладка",
  "newTerminal": "Новый терминал",
  "noChanges": "Изменений нет",
  "noSession": "Выберите диалог, чтобы пользоваться панелью",
  "notRepo": "Эта папка не является репозиторием git",
  "openEditor": "Открыть редактор",
  "openExplorer": "Проводник",
  "openFileNewTab": "Открыть в новой вкладке",
  "openFileSide": "Открыть сбоку",
  "openGit": "Панель git",
  "openPlugin": "Открыть",
  "openSubagent": "Задачи",
  "parent": "Родительская папка",
  "pluginGitRemotesDesc": "Вкладка Git Remotes: ветка, upstream, отставание и опережение, fetch (с необязательным prune), pull только ff-only и push после подтверждения во вкладке. Не заменяет встроенную вкладку git со стадированием и коммитами, не предлагает force-push и не даёт модели инструмент автопуша",
  "pluginNotLoaded": "Плагин не загружен, вкладка недоступна:",
  "pluginOfficeDesc": "Предпросмотр офисных файлов (.docx / .xlsx / .pptx) в редакторе better-sidebar; тяжёлые библиотеки рендеринга держатся вне основного бандла",
  "pluginSentinelDesc": "Пробуждение агента по условию: датчики файлов, процессов, портов, http, команд и вебхуков будят спящие сессии, когда условие сработало; добавляет вкладку Sentinel с общей таблицей наблюдений",
  "pluginSidebarQaDesc": "Выделил и спросил: выделите текст в диалоге, задайте вопрос в правой панели — откроется отдельная сессия-уточнение в той же рабочей папке; быстрая модель без рассуждений сжимает основной контекст и подставляет его вместе с цитатой, не прерывая основной диалог. Уточнения вкладываются, продолжаются и уходят в архив",
  "pluginVideoPreviewDesc": "Просмотр видео (.mp4/.webm/.mov/.mkv/.avi и других) прямо в редакторе better-sidebar через отдельный маршрут /video с поддержкой HTTP Range (206) — перемотка работает, ограничение mediaLimit в 20 МБ не действует",
  "preview": "Предпросмотр",
  "produced": "Создано",
  "producedOpen": "Открыть в панели",
  "referenceFile": "@файл",
  "refresh": "Обновить",
  "retry": "Повторить",
  "revertCommit": "Откатить коммит",
  "revertDesc": "Создать в текущей ветке новый коммит, отменяющий «{subject}».",
  "revertTitle": "Откат коммита",
  "sandboxRestore": "Вернуть песочницу",
  "sandboxStatusOn": "Песочница включена · страницы не видят данные интерфейса и локальные файлы; входы и сторонние куки могут не работать",
  "sandboxUnlock": "Временно отключить (небезопасно)",
  "save": "Сохранить",
  "saveFailed": "Сохранить не удалось",
  "saved": "Сохранено",
  "settingsBottomTerminalDesc": "При первом разворачивании нижней панели в сессии открывать в ней новый терминал (ограничение на число терминалов сохраняется; по умолчанию включено)",
  "settingsBottomTerminalTitle": "Открывать терминал при первом разворачивании нижней панели",
  "settingsBrowserHttpDesc": "Если включено, клик по внешней http-ссылке в диалоге или интерфейсе открывает панель (страницы плагинов с urlTarget имеют приоритет); Ctrl/Cmd+клик всегда в обход",
  "settingsBrowserHttpTitle": "Открывать http-страницы в панели",
  "settingsBrowserHttpsDesc": "Если включено, клик по внешней https-ссылке открывает панель. По умолчанию выключено: большинство https-сайтов запрещают встраивание, поэтому системный браузер удобнее",
  "settingsBrowserHttpsTitle": "Открывать https-страницы в панели",
  "settingsBrowserLinksDesc": "Если включено, клик по внешней ссылке открывает панель, а не новое окно; http и https управляются отдельными переключателями ниже; Ctrl/Cmd+клик всегда в обход",
  "settingsBrowserLinksTitle": "Открывать внешние ссылки из диалога в панели",
  "settingsBrowserSandboxDesc": "С выключенной песочницей любой открытый сайт работает в том же origin, что и интерфейс: он может читать данные сессии и действовать от вашего имени. Включайте только для полностью доверенных сайтов",
  "settingsBrowserSandboxTitle": "Отключить песочницу браузера (небезопасно)",
  "settingsConflict": "Настройку изменили в другом окне — повторите",
  "settingsDone": "Готово",
  "settingsFontFamilyDesc": "Своя гарнитура терминала (CSS-стек вида \"JetBrains Mono\", monospace; пусто — моноширинный шрифт темы)",
  "settingsFontFamilyPlaceholder": "\"JetBrains Mono\", monospace",
  "settingsFontFamilyTitle": "Шрифт терминала",
  "settingsFontSizeDesc": "Размер шрифта терминала в пикселях (9–32, по умолчанию 13)",
  "settingsFontSizeSuffix": "px",
  "settingsFontSizeTitle": "Размер шрифта терминала",
  "settingsGeneralTitle": "Общие",
  "settingsHtmlDefaultUnsafeDesc": "Если включено, каждый новый предпросмотр HTML открывается без песочницы (тот же origin, что и интерфейс — доступны файлы сессии и внутренние API); вернуть песочницу можно одним нажатием в строке состояния",
  "settingsHtmlDefaultUnsafeTitle": "Открывать предпросмотр HTML без песочницы (небезопасно)",
  "settingsHtmlSandboxDesc": "С выключенной песочницей просматриваемый HTML работает в том же origin, что и интерфейс: он может читать файлы сессии, локальное хранилище и вызывать внутренние API. Включайте только для полностью доверенных файлов",
  "settingsHtmlSandboxTitle": "Отключить песочницу предпросмотра HTML (небезопасно)",
  "settingsIntro": "Что показывает боковая панель и как она себя ведёт",
  "settingsJobsDesc": "Разворачивать панель и открывать страницу задач при появлении новой фоновой задачи в текущем диалоге (срабатывает на каждую); выключите, чтобы открывать вручную",
  "settingsJobsTitle": "Открывать страницу задач при новой фоновой задаче",
  "settingsNav": "Боковая панель",
  "settingsOpenDesc": "Разворачивать панель для совсем новых диалогов; у существующих сохраняется своя раскладка",
  "settingsOpenPathDesc": "Открывать файловые ссылки из диалога (строки инструментов, созданные файлы, упоминания) в редакторе панели, а не в системном приложении",
  "settingsOpenPathTitle": "Открывать файлы из диалога в панели",
  "settingsOpenTitle": "Разворачивать для новых диалогов",
  "settingsPopup": "Настройки функции",
  "settingsPopupDesc": "Параметры для «{feature}»",
  "settingsSaveFailed": "Не удалось сохранить",
  "settingsSubagentDesc": "Разворачивать панель и открывать страницу задач, когда в диалоге появляется субагент; выключите, чтобы открывать вручную",
  "settingsSubagentTitle": "Открывать страницу задач при появлении субагента",
  "settingsTabsTitle": "Содержимое панели",
  "settingsTitleBarDesc": "Оставлять место под системный заголовок окна Windows справа сверху, чтобы кнопки и содержимое панели располагались ниже, а не под ним",
  "settingsTitleBarStripDesc": "Высота полосы заголовка: на сколько пикселей опускаются кнопки и содержимое панели (0–120, по умолчанию 40)",
  "settingsTitleBarStripTitle": "Смещение",
  "settingsTitleBarTitle": "Режим совместимости с заголовком окна",
  "settingsToolsDesc": "Если включено, модель может создавать терминалы в панели и работать в них через восемь инструментов terminal_* (по умолчанию выключено)",
  "settingsToolsTitle": "Дать модели инструменты терминала",
  "settingsViewerCatchAll": "На всё остальное: любой файл",
  "settingsViewersTitle": "Просмотрщики файлов",
  "settingsWidthDesc": "Какую долю ширины окна занимает панель в новых диалогах (20–60)",
  "settingsWidthSuffix": "%",
  "settingsWidthTitle": "Ширина по умолчанию",
  "splitDown": "Разделить вниз",
  "splitLeft": "Разделить влево",
  "splitRight": "Разделить вправо",
  "splitUp": "Разделить вверх",
  "stage": "В индекс",
  "stageAll": "Всё в индекс",
  "staged": "В индексе",
  "subagent": "Задачи",
  "subagentCount": "субагентов: {count}",
  "subagentCountRunning": "субагентов: {count} · работает: {running}",
  "subagentDiagCorrupt": "Повреждён",
  "subagentDiagUnavailable": "Недоступен",
  "subagentDiagUnsupported": "Не поддерживается",
  "subagentEmpty": "Субагентов нет",
  "subagentEmptyDesc": "Здесь появятся субагенты, запущенные основным агентом",
  "subagentInactive": "Простаивает",
  "subagentMainAgent": "Основной агент",
  "subagentModeContinuable": "С продолжением",
  "subagentModeOneShot": "Разовый",
  "subagentRunning": "Работает",
  "subagentThinking": "Думает…",
  "terminal": "Терминал",
  "terminalConnectFailed": "Терминал не смог подключиться несколько раз подряд",
  "terminalDepsFailed": "Не удалось загрузить зависимость терминала node-pty",
  "terminalDepsHint": "Выполните команду ниже в терминале на машине с DSH, чтобы починить, и повторите (версия node-pty должна совпадать с версией ядра DSH):",
  "terminalDepsProfile": " (определён профиль: {profile})",
  "terminalError": "Не удалось подключиться к терминалу",
  "terminalLimit": "Достигнут предел терминалов (3)",
  "terminalRetry": "Повторить",
  "timeHoursAgo": "{n} ч назад",
  "timeJustNow": "только что",
  "timeMinutesAgo": "{n} мин назад",
  "timeYesterday": "вчера",
  "truncation": "Файл слишком большой — показаны первые 512 КБ",
  "unsaved": "Не сохранено",
  "unstage": "Из индекса",
  "unstageAll": "Всё из индекса",
  "unstaged": "Вне индекса",
  "viewCommitDiff": "Посмотреть изменения коммита",
  "viewerBinary": "Скачивание файла",
  "viewerCode": "Код",
  "viewerHtml": "HTML",
  "viewerImage": "Изображение",
  "viewerMarkdown": "Markdown",
  "viewerPdf": "PDF"
 },
 "command": {
  "listbox.aria": "Совпадения /{command}",
  "notice.imagesUnsupported": "/{command} не принимает вложения-изображения — сначала удалите их",
  "overlay.aria": "Параметры /{command}",
  "search.aria": "Фильтр параметров",
  "search.placeholder": "Поиск…",
  "status.applying": "Применение…",
  "status.empty": "Нет параметров",
  "status.loading": "Загрузка параметров…"
 },
 "common": {
  "back": "Назад",
  "cancel": "Отмена",
  "close": "Закрыть",
  "collapse": "Свернуть",
  "copied": "Скопировано",
  "copy": "Копировать",
  "delete": "Удалить",
  "edit": "Изменить",
  "expand": "Развернуть",
  "load.failed": "Не удалось загрузить",
  "loading": "Загрузка…",
  "more": "Ещё",
  "next": "Дальше",
  "none": "Нет",
  "ok": "ОК",
  "previous": "Назад",
  "retry": "Повторить",
  "save": "Сохранить",
  "search": "Поиск",
  "skip": "Пропустить",
  "submit": "Отправить",
  "submitting": "Отправка…",
  "truncated": "Обрезано",
  "unknown": "Неизвестно"
 },
 "context-doctor": {
  "cd.attention": "Стоит посмотреть",
  "cd.catalog": "{n} скиллов",
  "cd.catalog.few": "{n} скилла",
  "cd.catalog.many": "{n} скиллов",
  "cd.catalog.one": "{n} скилл",
  "cd.empty": "Данных пока нет",
  "cd.error": "Проверка не удалась",
  "cd.files": "файлов",
  "cd.guideline": "из 50k",
  "cd.healthy": "В норме",
  "cd.healthyHint": "Контекст расходуется экономно и укладывается в рекомендованный бюджет.",
  "cd.hint": "Открыть аудит контекста",
  "cd.instructions": "Цепочка инструкций",
  "cd.loading": "Проверка…",
  "cd.mcp": "Инструменты MCP",
  "cd.mcpTools": "{n} инструментов",
  "cd.mcpTools.few": "{n} инструмента",
  "cd.mcpTools.many": "{n} инструментов",
  "cd.mcpTools.one": "{n} инструмент",
  "cd.refresh": "Обновить",
  "cd.residentTokens": "Проверка бюджета контекста",
  "cd.review": "Стоит посмотреть",
  "cd.reviewHint": "Некоторые части контекста стоит пересмотреть, пока они не стали дорогими.",
  "cd.skills": "Каталог скиллов",
  "cd.suggestions": "{n} рекомендаций",
  "cd.suggestions.few": "{n} рекомендации",
  "cd.suggestions.many": "{n} рекомендаций",
  "cd.suggestions.one": "{n} рекомендация",
  "cd.title": "Аудит контекста",
  "cd.tools": "Схемы инструментов",
  "cd.toolsCount": "инструментов",
  "cd.updated": "Обновлено"
 },
 "conversation": {
  "access.confirm.acknowledge": "Я понимаю риски и хочу продолжить",
  "access.confirm.cancel": "Отмена",
  "access.confirm.description": "Полный доступ убирает часть подтверждений и позволяет агенту действовать напрямую, включая чувствительные операции, изменение файлов и внешние команды. Включайте, только если доверяете текущей задаче.",
  "access.confirm.enable": "Включить полный доступ",
  "access.confirm.title": "Включить полный доступ?",
  "approval.allowOnce": "Разрешить один раз",
  "approval.detail.aria": "Подробности запроса",
  "approval.escalation": "Инструмент {toolName} просит повышенных прав",
  "approval.reject": "Отклонить",
  "approval.waiting": "Ожидание подтверждения",
  "ask.answered": "{answered}/{total} отвечено",
  "ask.cancelled": "отменено",
  "ask.interrupted": "прервано",
  "ask.rowTitle": "Вопрос",
  "ask.waiting": "ожидание",
  "bash.failed": "Ошибка",
  "bash.running": "Выполняется",
  "bash.stopped": "Остановлено",
  "chat.loadError": "Не удалось загрузить историю: {message} ({code})",
  "chat.loadOlder": "Загрузить раньше",
  "chat.loadingHistory": "Загрузка истории…",
  "chat.toBottom": "Вниз",
  "clock.md": "{d}.{m}",
  "clock.ymd": "{d}.{m}.{y}",
  "command.done": "Готово",
  "command.failed": "Команда не выполнена",
  "command.imagesUnsupported": "/{command} не принимает вложения-изображения — сначала удалите их",
  "command.running": "Выполняется…",
  "command.title": "Команда",
  "context.aria": "{percent} контекста занято",
  "context.messages": "Сообщения",
  "context.system": "Системный промпт",
  "context.tools": "Инструменты",
  "context.used": "контекста занято",
  "details.close": "Закрыть подробности",
  "details.empty": "Выберите строку инструмента в переписке, чтобы увидеть подробности",
  "details.input": "Вход",
  "details.notInWindow": "Этот вызов вне текущего окна",
  "details.output": "Выход",
  "details.running": "Выполняется…",
  "details.title": "Подробности",
  "duration.minutes": "{minutes} мин {seconds} с",
  "duration.seconds": "{seconds} с",
  "fileOpen.folderTitle": "Не удалось открыть папку",
  "fileOpen.folderUnknown": "Не удалось открыть эту папку",
  "fileOpen.title": "Не удалось открыть файл",
  "fileOpen.unknown": "Не удалось открыть этот файл",
  "hero.chooseWorkspace": "Выбрать рабочую папку",
  "hero.headline": "Навстречу неизвестному",
  "hero.preview": "Предпросмотр",
  "hint.goal": "опишите цель длительной задачи",
  "hint.goal.active": "цель активна — изменить / пауза / продолжить / снять",
  "image.closePreview": "Закрыть просмотр оригинала",
  "image.dimensionTooLarge": "Стороны изображения не больше {size}px — уменьшите его и попробуйте снова",
  "image.dropBlocked": "Сейчас картинки добавить нельзя",
  "image.dropDesc": "До {count} изображений, каждое до {size}",
  "image.dropTitle": "Перетащите изображения сюда",
  "image.fileTooLarge": "Каждое изображение должно быть меньше {size}",
  "image.label": "Изображение",
  "image.loadFailed": "Изображение не загрузилось, нажмите для повтора",
  "image.loading": "Загрузка изображения…",
  "image.modelUnsupported": "Текущая модель не принимает изображения; выберите подходящую",
  "image.openOriginal": "Открыть оригинал",
  "image.openOriginalLabel": "{label}, нажмите, чтобы открыть оригинал",
  "image.original": "Оригинал",
  "image.pending": "Изображения к отправке",
  "image.preview": "Просмотр оригинала",
  "image.remove": "Убрать изображение {name}",
  "image.scrollLeft": "Прокрутить изображения влево",
  "image.scrollRight": "Прокрутить изображения вправо",
  "image.sendFailed": "Не удалось отправить изображения ({reason}); добавьте заново и повторите",
  "image.serviceUnavailable": "Служба загрузки изображений недоступна",
  "image.subagentUnsupported": "Сессии субагентов пока не поддерживают изображения",
  "image.tooMany": "В одно сообщение помещается до {count} изображений",
  "image.tooManyPixels": "Слишком большое разрешение; сожмите изображение и повторите",
  "image.totalTooLarge": "Изображения весят больше {size}; уберите часть и повторите",
  "image.unsupportedType": "Поддерживаются только PNG, JPG, WebP и GIF",
  "input.accessMode": "Режим доступа, сейчас: {name}",
  "input.commands": "Команды",
  "input.send": "Отправить сообщение",
  "input.stop": "Остановить генерацию",
  "json.truncated": "… обрезано, всего символов: {total}",
  "message.branch": "Ответвить новый диалог",
  "message.branchUnavailable": "Доступно только на последнем сообщении завершённого хода",
  "message.compaction": "Контекст сжат",
  "message.compaction.completed": "Сжато элементов истории: {items} (~{tokens} токенов)",
  "message.compaction.expand": "Показать итог сжатия",
  "message.compaction.running": "Сжатие контекста…",
  "message.compaction.unavailable": "Итог сжатия недоступен",
  "message.context.catalog.more": "… ещё {count}",
  "message.context.catalog.replaced": "Каталог заменён",
  "message.context.instructions.added": "добавлено",
  "message.context.instructions.loaded": "загружено",
  "message.context.instructions.removed": "удалено",
  "message.context.instructions.updated": "обновлено",
  "message.context.recall.counts": "{retained} оставлено · {omitted} пропущено",
  "message.context.recall.truncated": "обрезано",
  "message.context.relay.from": "Из сессии {session}",
  "message.context.snapshot.supersedes": "Заменяет прежние снимки",
  "message.contextInjection": "Инъекция контекста",
  "message.contextRecall": "Напоминание из сессии",
  "message.extraBlock": "Дополнительный блок",
  "message.maxTokens": "Достигнут лимит выходных токенов",
  "message.maxTokens.hint": "Ответ обрезан; написанное ранее сохранено в переписке. Отправьте «продолжай», чтобы модель дописала.",
  "message.ranFor": "Заняло {duration}",
  "message.referenceSeparator": ", ",
  "message.referenceSummary": "Упомянутая сессия · {labels}",
  "message.retry.active": "Повтор запроса к модели",
  "message.retry.cancelled": "Повтор запроса отменён",
  "message.retry.delay": "Задержка перед повтором: ",
  "message.retry.failure": "Причина сбоя: ",
  "message.retry.scheduled": "Ожидание повтора запроса",
  "message.retry.started": "Запрос к модели повторён",
  "message.retry.status": "{label} ({retry}/{maximum}) · {seconds} с",
  "message.stopped": "Остановлено",
  "message.tokensPerSecond": "{tps} ток/с",
  "message.ttft": "Первый токен {seconds} с",
  "message.turnError": "Ход не удался",
  "message.unknownBlock": "Неизвестный блок содержимого",
  "message.unknownSurface": "Неизвестное событие: {type}",
  "placeholder.default": "Напишите агенту",
  "placeholder.hero": "Опишите, что хотите сделать",
  "placeholder.parentOffline": "Родительская сессия офлайн: отправка недоступна, но остановить выполнение можно",
  "placeholder.steerQueue": "Cmd/Ctrl+Enter направит все сообщения из очереди",
  "placeholder.unavailable": "Сессия недоступна",
  "placeholder.workspace": "Выберите рабочую папку, чтобы начать",
  "queue.cancelEdit": "Отменить правку",
  "queue.count": "Сообщений в очереди: {n}",
  "queue.edit": "Изменить сообщение в очереди",
  "queue.edit.unsupported": "Содержит не только текст; правка пока не поддерживается",
  "queue.editFailed": "Не удалось изменить: сообщение, возможно, уже отправляется.",
  "queue.remove": "Убрать из очереди",
  "queue.removeFailed": "Не удалось убрать: сообщение, возможно, уже отправляется.",
  "queue.save": "Сохранить сообщение",
  "queue.steer": "Направить сообщение",
  "queue.steer.unavailable": "Направлять можно только пока агент работает",
  "queue.steerFailed": "Не удалось направить. Попробуйте ещё раз.",
  "row.failed": "Ошибка",
  "row.running": "Выполняется",
  "row.stopped": "Остановлено",
  "session.hierarchy": "Иерархия сессий",
  "settings.enter.description": "Только когда агент занят; Cmd/Ctrl+Enter даёт другое поведение",
  "settings.enter.queue": "В очередь",
  "settings.enter.steer": "Направить",
  "settings.enter.title": "Enter, когда агент занят",
  "stats.cacheHit": "Попаданий в кэш {percent}%",
  "stats.counts": "ходов: {turns} · шагов: {steps}",
  "stats.llm": "Модель {duration}",
  "stats.tokens": "Вход {input} ток · выход {output} ток",
  "stats.tokensPerSecond": "{throughput} ток/с",
  "stats.toolCall": "Инструменты {duration}",
  "stats.ttftAverage": "Первый токен в среднем {duration}",
  "terminal.collapseAria": "Свернуть вывод",
  "terminal.done": "Готово",
  "terminal.exitCode": "код возврата {code}",
  "terminal.expandAria": "Показать оставшиеся строки вывода: {n}",
  "terminal.expandRest": "… ещё строк: {n}",
  "terminal.failed": "Ошибка",
  "terminal.noOutput": "Вывода нет",
  "terminal.running": "Выполняется",
  "terminal.signal": "сигнал {signal}",
  "todo.completed": "{done}/{total} выполнено",
  "todo.progress.active": "{active} в работе",
  "todo.progress.done": "{done} выполнено",
  "todo.progress.pending": "{pending} в очереди",
  "todo.rowTitle": "Обновить список задач",
  "todo.title": "Задачи",
  "view.chat": "Чат"
 },
 "cordis": {
  "a11y.defining": "Определение плагина",
  "a11y.failed": "Определить не удалось",
  "a11y.stopped": "Определение прервано",
  "action.approve": "Разрешить",
  "action.approveOnce": "Разрешить только эту версию",
  "action.approvePlugin": "Разрешить будущие версии этого плагина",
  "action.decline": "Отклонить",
  "action.remove": "Удалить",
  "action.retry": "Повторить",
  "action.rollback": "Откатить",
  "action.run": "Запустить",
  "action.stop": "Остановить",
  "body.clientCode": "Клиент",
  "body.copied": "Скопировано",
  "body.copy": "Копировать",
  "body.hostCode": "Хост",
  "body.output": "Результат",
  "body.source": "Исходник плагина",
  "panel.approvals.aria": "Подтверждения Cordis",
  "panel.current": "Текущая: {packageId}",
  "panel.empty": "Плагинов пока нет",
  "panel.group.current": "Эта сессия",
  "panel.group.others": "Другие сессии",
  "panel.hint": "Управление запуском — в панели Cordis над настройками",
  "panel.loading": "Чтение…",
  "panel.next": "Следующая: {packageId}",
  "panel.plugins.aria": "Плагины Cordis",
  "panel.readFailed": "Не удалось прочитать список плагинов: {message}",
  "panel.runningCount": "работает: {count}",
  "panel.title": "Плагины Cordis",
  "panel.trigger": "Плагин Cordis",
  "panel.version": "Версия",
  "purpose.missing": "(назначение не указано)",
  "render.failedAbdicated": "Отрисовка в {slot} не удалась, вернули стандартный интерфейс:",
  "render.failedHeld": "Отрисовка в {slot} не удалась:",
  "row.defineTitle": "Зарегистрировать плагин Cordis",
  "row.removeTitle": "Удалить плагин Cordis",
  "row.runTitle": "Запустить плагин Cordis",
  "row.stopTitle": "Остановить плагин Cordis",
  "row.updateTitle": "Обновить плагин Cordis",
  "run.removed": "Этого пакета больше нет",
  "run.superseded": "Ниже есть более свежая карточка запуска",
  "status.awaitingApproval": "Ждёт подтверждения",
  "status.clientPending": "Клиент готов к активации",
  "status.failed": "Запуск не удался",
  "status.idle": "Готов",
  "status.removed": "Удалён",
  "status.running": "Работает",
  "status.superseded": "Есть более свежий запуск"
 },
 "deliverables": {
  "produced.label": "Создано",
  "produced.more": "+ {count} файлов",
  "produced.moreOne": "+ 1 файл",
  "produced.open": "Открыть {name}",
  "produced.showInFolder": "Показать в папке"
 },
 "directory-browser": {
  "browser.cancel": "Отмена",
  "browser.create": "Создать",
  "browser.createIn": "Новая папка в «{name}»",
  "browser.editPath": "Изменить путь",
  "browser.folderName": "Имя папки",
  "browser.home": "Домашняя папка",
  "browser.loading": "Загрузка…",
  "browser.newFolder": "Новая папка",
  "browser.open": "Открыть",
  "browser.showHidden": "Показывать скрытые файлы",
  "browser.title": "Выбор рабочей папки",
  "browser.truncated": "Слишком много папок; показано только начало.",
  "browser.untitledFolder": "Без имени"
 },
 "dsh-market": {
  "actWhy": "Почему не активен?",
  "aiFix": "Починить с агентом",
  "aiFixConservative": "Действуй осторожно: чини только явные ошибки из списка выше (падения при запуске, дубли записей, подтверждённые расхождения зависимостей). Предупреждения и записи к сведению (например, неподтверждённые диапазоны peer-зависимостей) трогай, только если они связаны с явной ошибкой. Не делай лишних обновлений и перестановок; объясняй каждое изменение и жди подтверждения.",
  "aiFixCopied": "Промпт скопирован — вставьте его в новый диалог и отправьте, когда будете готовы",
  "aiFixFail": "Буфер обмена недоступен — скопируйте диагностику ниже вручную",
  "aiFixHint": "Передать диагностику новой сессии агента (скопировано в буфер; отправлять или нет — решаете вы)",
  "aiFixIntro": "Помоги починить проблемы с плагинами DeepSeek Harness (профиль: {0}). Диагностика показала:",
  "aiFixScope": "Можно менять порядок в dsh.profile.bundles, включать и выключать плагины, править cordis.patch.yml. Учти: официальные бандлы трогать нельзя; прежде чем что-то менять, изложи план.",
  "all": "Все",
  "alreadyInstalled": "✓ Установлен",
  "approveBuilds": "Разрешить сборочные скрипты и повторить",
  "autoBackup": "Резервная копия раз в сутки (при открытии маркета)",
  "backTop": "Наверх",
  "backupDone": "Копия загружена",
  "backupDownload": "Выгрузить копию",
  "backupHint": "Включает список плагинов и настройки профиля, но не node_modules. Восстановление ставит плагины заново по списку.",
  "backupImport": "Импортировать и посмотреть",
  "backupLocal": "Локальный файл",
  "backupWorking": "Выполняется…",
  "buildsSkipped": "Этому плагину нужны сборочные скрипты; по умолчанию они заблокированы ради безопасности. Разрешите их и переустановите:",
  "busyWait": "Уже выполняется другая операция — дождитесь её окончания (установка, обновление и удаление идут по одной)",
  "cancel": "Отмена",
  "cancelOp": "Отменить",
  "cancelled": "Отменено",
  "cancelling": "Отмена…",
  "catConflict": "Конфликты",
  "catDeps": "Зависимости",
  "catOrder": "Порядок",
  "catsLess": "Свернуть",
  "catsMore": "Ещё",
  "checkBundles": "Порядок загрузки плагинов",
  "checkBundlesEmpty": "Слои плагинов не объявлены",
  "checkCommunity": "сообщество",
  "checkDir": "каталог",
  "checkDuplicates": "Повторяющиеся записи плагинов",
  "checkDuplicatesEmpty": "Повторов нет",
  "checkEntries": "записей (идентификаторы загрузчика)",
  "checkErrors": "Ошибки",
  "checkErrorsEmpty": "Ошибок нет",
  "checkHoisted": "поднят",
  "checkIssues": "Найдены проблемы",
  "checkLoadFail": "Не удалось загрузить диагностику: ",
  "checkLoading": "Анализ профиля…",
  "checkMultiEmpty": "Пакетов ядра в нескольких версиях нет",
  "checkMultiVersion": "Пакеты ядра в нескольких версиях",
  "checkOfficial": "официальный",
  "checkOrderTip": "порядок загрузки бандла сообщества конфликтует с объявленными правилами before/after",
  "checkOrphans": "Неверные записи конфига",
  "checkOrphansEmpty": "Неверных записей нет",
  "checkOverridden": "переопределяет",
  "checkOverrides": "Переопределения",
  "checkOverridesEmpty": "Переопределений нет",
  "checkPatch": "файл патча",
  "checkPeerEmpty": "Расхождений версий зависимостей нет",
  "checkPeerInfo": "{0} записей к сведению (не подтверждено)",
  "checkPeerMismatches": "Расхождения версий зависимостей",
  "checkPeerOverview": "расхождений: {0} · к сведению: {1}",
  "checkProfile": "профиль",
  "checkRange": "объявленный диапазон",
  "checkRefresh": "Проверить заново",
  "checkResolved": "разрешённая версия",
  "checkSatisfied": "удовлетворено",
  "checkSource": "источник",
  "checkUnknown": "неизвестно",
  "checkUnsatisfied": "не удовлетворено",
  "checkWarnings": "Предупреждения",
  "checkWarningsEmpty": "Предупреждений нет",
  "cmdDetails": "Команда установки",
  "confirm": "Подтвердить",
  "confirmRemove": "Подтверждаете?",
  "confirmTitle": "Установка",
  "confirmWarn": "Плагины — сторонний код сообщества. Устанавливая, вы доверяете этому источнику; сборочные скрипты по умолчанию заблокированы.",
  "credsWarning": "Внимание: в копию попадают настройки профиля и файлы, где могут лежать секреты (config.toml, .env и подобные). Локальная выгрузка ничего не вырезает, поэтому выгружайте на WebDAV, которому доверяете.",
  "deprecatedBadge": "Устарел",
  "deprecatedWarn": "Каталог помечает этот плагин как устаревший; новым пользователям ставить его не советуют.",
  "diagExplain": "Что это",
  "diagExplainText": "Эта страница ищет плагины, конфликтующие друг с другом, несовпадения версий зависимостей и неверный порядок загрузки. Термины:",
  "diagOkAll": "Всё в порядке: конфликтов, проблем с зависимостями и порядком не найдено",
  "diagTermBundle": "бандл — один пакет плагина, применяется по порядку",
  "diagTermEntry": "запись — то, что плагин добавляет в работающую композицию",
  "diagTermOrder": "порядок загрузки — очерёдность активации; более поздний может перекрыть более ранний",
  "diagTermOrphan": "неверная запись — конфиг ссылается на то, чего нет",
  "diagTermPeer": "peer-зависимость — пакет, который плагин ждёт от хоста",
  "diagTermShadow": "перекрытие — старая копия из плагина закрывает более новую хостовую",
  "disable": "Выключить",
  "disabledState": "Выключен",
  "dismiss": "Скрыть",
  "dismissNotice": "Скрыть это уведомление",
  "duplicateNames": "Плагины с одинаковыми именами (к сведению, это не конфликт)",
  "empty": "Подходящих плагинов нет",
  "enable": "Включить",
  "envFix": "Настроить автоматически",
  "envFixFail": "Автоматическая настройка не удалась — выгрузите журнал и пришлите нам файл",
  "envFixing": "Настройка…",
  "envMissing": "Перед установкой плагинов нужен один небольшой компонент",
  "exportLog": "Выгрузить журнал",
  "exportLogFail": "Не удалось выгрузить журнал",
  "exportedLog": "Журнал выгружен: dsh-market-log.txt — приложите его к обращению",
  "exportingLog": "Выгрузка…",
  "filter": "Фильтр",
  "filterDir": "Порядок",
  "filterSort": "Поле сортировки",
  "filterTime": "Вышло за",
  "firstPage": "В начало",
  "gist": "GitHub Gist",
  "gistCreated": "Выгружено:",
  "gistErrAuth": "GitHub не авторизовал: токен неверный или истёк, либо gh CLI не залогинен",
  "gistErrInvalid": "Содержимое Gist повреждено или формат копии не поддерживается",
  "gistErrNetwork": "GitHub недоступен — проверьте сеть или прокси",
  "gistErrNoId": "Для обновления нужен идентификатор Gist — заполните поле или переключитесь на «Создать»",
  "gistErrNotFound": "Gist не найден — проверьте идентификатор или ссылку",
  "gistErrRateLimit": "Достигнут лимит GitHub, либо у токена нет права gist",
  "gistErrTimeout": "GitHub не ответил вовремя — проверьте сеть и повторите",
  "gistExport": "Выгрузить в Gist…",
  "gistExportDone": "Выгружено в Gist",
  "gistExportGo": "Выгрузить",
  "gistExportHint": "Отмечено всё — полная копия вместе с настройками; если снять любую галочку, выгрузятся только выбранные плагины, а настройки — по отдельному флажку.",
  "gistExportSelect": "Выберите плагины для выгрузки",
  "gistId": "Идентификатор или ссылка на Gist (при выгрузке оставьте пустым, чтобы создать новый приватный)",
  "gistImport": "Загрузить из Gist",
  "gistIncludeConfig": "Включить файлы настроек (в них могут быть секреты)",
  "gistModeCreate": "Создать новый приватный Gist",
  "gistModeUpdate": "Обновить Gist из поля",
  "gistNoPlugins": "В этом профиле нечего выгружать",
  "gistNote": "В отличие от локальной выгрузки (архив на этой машине), Gist нужен для переноса между машинами: выгрузите в приватный Gist и загрузите на другом компьютере под тем же аккаунтом. Токен живёт только в памяти этой вкладки и никогда не пишется в браузерное хранилище; если залогинен gh CLI или задан DSH_GITHUB_TOKEN, вводить его не нужно. Gist приватный, до 1 МБ на файл.",
  "gistSelectAll": "Выбрать все",
  "gistSelectNone": "Снять выбор",
  "gistSpecLocal": "локально",
  "gistSrcEnv": "переменная DSH_GITHUB_TOKEN",
  "gistSrcGh": "gh CLI",
  "gistSrcToken": "введён вручную",
  "gistToken": "Токен GitHub (только в памяти вкладки — после обновления страницы введите заново; оставьте пустым, чтобы использовать серверный DSH_GITHUB_TOKEN или залогиненный gh CLI)",
  "gistVerify": "Проверить связь",
  "gistVerifySource": "Проверено — источник токена: {0}",
  "gotIt": "Понятно",
  "groupAdd": "Добавить плагин",
  "groupAddEmpty": "Все установленные плагины уже в этой группе",
  "groupAddTheme": "Добавить тему",
  "groupAssign": "Назначить",
  "groupConfirmDelete": "Удалить группу?",
  "groupCreate": "Создать",
  "groupDelete": "Удалить группу",
  "groupEmpty": "Пока пусто",
  "groupMixed": "Включена частично",
  "groupNamePh": "Название группы",
  "groupNew": "Новая группа",
  "groupRemove": "Убрать",
  "groupRename": "Переименовать",
  "hostDependencyMore": "ещё находок пропущено: {0}",
  "hostDependencyWarning": "Плагин перечисляет в зависимостях известные общие пакеты хоста DSH. Это может перекрыть хостовую версию; проверка смотрит только манифест и не подтверждает, что в рантайме появился дубль:",
  "hotBanner": "плагины готовы — обновите страницу, чтобы ими пользоваться",
  "install": "Установить",
  "installFail": "Установить не удалось",
  "installReplacement": "Установить замену",
  "installedBadge": "✓ Установлен",
  "installedEmpty": "Плагинов сообщества пока нет — загляните во вкладку «Обзор»",
  "installing": "Установка…",
  "lastPage": "В конец",
  "linkedDev": "подключён как разработка",
  "loadFail": "Не удалось загрузить каталог плагинов, попробуйте позже",
  "loading": "Загрузка каталога…",
  "localOnly": "Адрес WebDAV и учётные данные остаются только в этом браузере.",
  "marketNoToggle": "Сам маркет выключить нельзя",
  "marketUpdate": "Доступно обновление маркета — обновить",
  "nav": "Маркет плагинов",
  "nextPage": "Дальше",
  "noGroups": "Групп пока нет — создайте",
  "notInstalled": "Не установлен",
  "orderAlreadyOptimal": "Текущий порядок уже удовлетворяет всем правилам и зависимостям — переставлять нечего",
  "orderApplied": "✓ Применено — перезапустите, чтобы вступило в силу",
  "orderApply": "Применить порядок",
  "orderAutoSort": "Отсортировать автоматически",
  "orderConflicts": "конфликты before/after в текущем порядке",
  "orderDiffHint": "Этот порядок изменит композицию: переопределений {0}, потерянных записей {1}, дублей {2}",
  "orderDown": "↓",
  "orderDrag": "Перетащите, чтобы изменить порядок",
  "orderDragHint": "Тяните ⠿, чтобы переставить; «Применить порядок» сохранит",
  "orderReset": "Сбросить черновик",
  "orderSection": "Порядок загрузки",
  "orderSuggestApply": "Применить предложенный порядок",
  "orderSuggestHint": "Предложенный порядок (отсортирован по правилам before/after):",
  "orderTrialFail": "Статическая проверка композиции не прошла: {0}",
  "orderUp": "↑",
  "orphanIdRequired": "нет идентификатора",
  "orphanInsertNotArray": "неверный формат",
  "orphanInsertTargetMissing": "цель не найдена",
  "orphanInsertTargetNotGroup": "цель не является группой",
  "orphanNameMismatch": "имя не совпадает",
  "orphanPatchTargetMissing": "цель не найдена",
  "orphanReasonOther": "другое",
  "packagesDone": "обработано пакетов: {0}",
  "pageInfo": "Страница {0} из {1}",
  "partialNote": "Отменено — часть изменений уже применена",
  "patchDisabled": "Выключен патчем",
  "patchForced": "Включён патчем",
  "perPage": "На странице",
  "phaseBuilding": "Сборочные скрипты",
  "phaseDownloading": "Загрузка",
  "phaseLinking": "Связывание",
  "phaseResolving": "Разрешение зависимостей",
  "prevPage": "Назад",
  "progressHint": "Первая установка скачивает и разрешает зависимости — крупные плагины занимают 1–3 минуты",
  "published": "выпущен",
  "readme": "README",
  "refresh": "Обновить",
  "refreshBanner": "изменения применены — обновите страницу, чтобы их увидеть",
  "replacementHint": "Каталог предлагает",
  "restartBanner": "изменения внесены — перезапустите DeepSeek Harness",
  "restartFail": "Перезапустить не удалось",
  "restartHint": "Как перезапустить: остановите текущий процесс dsh и запустите его снова (например, dsh web)",
  "restartNow": "Перезапустить",
  "restartTimeout": "Не дождались запуска DeepSeek Harness",
  "restarting": "Перезапуск…",
  "restoreConfirm": "Восстановление перезапишет настройки этого профиля и переустановит плагины. Продолжить?",
  "restoreDone": "Восстановление завершено — перезапустите DeepSeek Harness",
  "restoreMissing": "Плагинов из копии не установлено: {0}",
  "restorePartial": "Восстановление продолжилось, но эти плагины установить не удалось:",
  "restorePreviewDone": "Копия загружена. Проверьте вкладку «Установленные» и запускайте восстановление.",
  "restoreStart": "Начать восстановление",
  "searchPh": "Поиск плагинов: уведомления, терминал, память…",
  "setCardDesc": "Версия маркета, обновление и удаление.",
  "setSelfCancel": "Отмена",
  "setSelfConfirm": "Удалить маркет плагинов? Поставить его заново можно будет только из командной строки.",
  "setSelfFailed": "Операция не удалась",
  "setSelfPurge": "Заодно стереть данные маркета",
  "setSelfPurgeOff": "Данные маркета сохранятся. Учтите: плагины, которые он выключил, останутся выключенными, а интерфейса, чтобы вернуть их, после удаления не будет.",
  "setSelfPurgeOn": "Будут удалены: список выключенных плагинов, свои группы и строки выключения, которые маркет записал в патч профиля, — выключенные им плагины снова заработают. Паролей и токенов это не касается: маркет их на диск не пишет.",
  "setSelfRemove": "Удалить маркет плагинов",
  "setSelfRemoveConfirm": "Удалить",
  "setSelfRemoveHint": "Удаляет маркет из этого профиля. Остальные плагины не трогаются.",
  "setSelfRemoved": "Удалён",
  "setSelfRemovedHint": "Перезапустите DeepSeek Harness, чтобы завершить.",
  "setSelfRestartAfter": "Перезапустить DeepSeek Harness сразу после удаления",
  "setSelfRestartingHint": "Перезапуск DeepSeek Harness…",
  "setSelfUpToDate": "Обновлений нет",
  "setSelfUpdate": "Обновить",
  "setSelfUpdateHint": "Обновление скачает новую версию; она заработает после перезапуска.",
  "setSelfUpdateReady": "Доступна новая версия:",
  "setSelfUpdatedHint": "Скачано. Перезапустите DeepSeek Harness, чтобы обновление вступило в силу: страница обновляется сразу, серверная половина — нет.",
  "setSelfWorking": "Удаление…",
  "sortAdded": "Дата выпуска",
  "sortAsc": "По возрастанию",
  "sortDesc": "По убыванию",
  "sortNewest": "Сначала новые",
  "sortOldest": "Сначала старые",
  "sortStars": "Звёзды",
  "stateBroken": "Установлен, но не прошёл проверку",
  "stateDisabled": "Выключен",
  "stateInert": "Установлен, но не является плагином слоя профиля",
  "stateLive": "Работает (загружен на лету)",
  "stateRestart": "Установлен — перезапустите, чтобы применить",
  "subtitle": "Плагины сообщества для DeepSeek Harness",
  "tabBackup": "Копия и восстановление",
  "tabDiagnostics": "Диагностика",
  "tabDiscover": "Обзор",
  "tabGroups": "Группы",
  "tabInstalled": "Установленные",
  "tabList": "Список",
  "tabThemes": "Темы",
  "terminalWarn": "Похоже, это плагин для терминала: в веб-профиле он может ничего не делать или даже сломать запуск DeepSeek Harness. Прочитайте его README и ставьте в тот профиль, для которого он написан.",
  "themeActive": "Активна",
  "themeApply": "Применить",
  "themeDeactivate": "Отключить",
  "themeEmpty": "Других тем в каталоге пока нет — следите за обновлениями",
  "timeAll": "Всё время",
  "timeDay": "Сутки",
  "timeMonth": "30 дней",
  "timeQuarter": "90 дней",
  "timeWeek": "7 дней",
  "timeYear": "Год",
  "toastReady": "установлен и работает",
  "toastTheme": "теперь активна. Переключить можно в «Настройки → Маркет плагинов → Темы»",
  "toggleFail": "Переключить не удалось",
  "ungrouped": "Без группы",
  "uninstall": "Удалить",
  "uninstallConfirmDesc": "Плагин будет удалён из текущего профиля.",
  "uninstalling": "Удаление…",
  "upToDate": "Обновлений нет",
  "update": "Обновить",
  "updateAll": "Обновить все",
  "updateFail": "Обновить не удалось",
  "updateNow": "Обновить сейчас",
  "updated": "✓ Обновлён — перезапустите, чтобы применить",
  "updatedLive": "✓ Обновлён — работает",
  "updating": "Обновление…",
  "versionHint": "Версия маркета плагинов — указывайте её при обращении",
  "viewReplacement": "Посмотреть замену",
  "viewSource": "Исходник",
  "webdav": "WebDAV",
  "webdavNote": "Адрес WebDAV и имя пользователя остаются только в этом браузере; пароль хранится на сервере и вводится заново каждую сессию.",
  "webdavPassword": "Пароль (необязательно)",
  "webdavPreset": "Готовая настройка провайдера",
  "webdavRestore": "Восстановить с WebDAV",
  "webdavUpload": "Выгрузить копию",
  "webdavUrl": "Адрес файла копии",
  "webdavUser": "Имя пользователя (необязательно)"
 },
 "feedback": {
  "action.dislike": "Плохой ответ",
  "action.dislikeActive": "Убрать оценку",
  "action.like": "Хороший ответ",
  "action.likeActive": "Убрать оценку",
  "error.conflict": "Эту оценку изменили в другом месте; показано актуальное состояние",
  "error.generic": "Не удалось сохранить оценку",
  "error.load": "Не удалось загрузить оценку",
  "note.aria": "Комментарий к оценке",
  "note.cancel": "Отмена",
  "note.dialog": "Отзыв",
  "note.open": "Добавить комментарий",
  "note.placeholder": "Что получилось хорошо, а что нет? (необязательно)",
  "note.save": "Сохранить"
 },
 "goal": {
  "action.cancel": "Отменить правку",
  "action.clear": "Снять цель",
  "action.edit": "Изменить цель",
  "action.pause": "Приостановить цель",
  "action.resume": "Продолжить цель",
  "action.save": "Сохранить цель",
  "commandInput.aria": "Ввод команды",
  "objective.aria": "Формулировка цели",
  "phase.active": "Цель в работе",
  "phase.blocked": "Цель заблокирована",
  "phase.paused": "Цель на паузе"
 },
 "im-hub": {
  "f.agentCwd": "Рабочая папка",
  "f.agentCwdHint": "Папка для сессий агента; пусто — папка процесса dsh.",
  "f.agentMaxMessageLength": "Длина сообщения",
  "f.agentMaxMessageLengthHint": "Максимум символов в исходящем сообщении; длинные ответы разбиваются.",
  "f.agentModel": "Модель",
  "f.agentModelHint": "Переопределить модель; пусто — как задано в установке.",
  "f.agentProvider": "Провайдер",
  "f.agentProviderHint": "Переопределить провайдера модели; пусто — как задано в установке.",
  "f.allowedUserIdsHint": "Идентификаторы через запятую; пусто — доступ всем (для боевой работы не советуем).",
  "f.configured": "Задано",
  "f.enabled": "Включено",
  "f.enabledHint": "Общий выключатель всего IM-шлюза.",
  "f.feishuAllowedUserIds": "Разрешённые open id",
  "f.feishuAppId": "App id",
  "f.feishuAppIdHint": "App id приложения Feishu (cli_…).",
  "f.feishuAppSecret": "App secret",
  "f.feishuEnabled": "Включено",
  "f.feishuEnabledHint": "Включить адаптер Feishu по постоянному WebSocket-соединению (публичный адрес не нужен).",
  "f.httpHost": "Адрес привязки",
  "f.httpHostHint": "Адрес, на котором слушают HTTP-серверы в режиме вебхуков.",
  "f.httpPort": "Порт привязки",
  "f.httpPortHint": "Порт, на котором слушают HTTP-серверы в режиме вебхуков.",
  "f.inherit": "Наследовать",
  "f.larkAllowedUserIds": "Разрешённые open id",
  "f.larkAppId": "App id",
  "f.larkAppSecret": "App secret",
  "f.larkEnabled": "Включено",
  "f.larkEnabledHint": "Включить международный адаптер Lark (open.larksuite.com).",
  "f.mockEnabled": "Включено",
  "f.mockEnabledHint": "Адаптер только для тестов: локальный HTTP-эндпоинт без учётных данных платформы.",
  "f.mockPort": "Порт",
  "f.mockPortHint": "Фиксированный HTTP-порт тестового эндпоинта (0 — любой свободный).",
  "f.notConfigured": "Не задано",
  "f.off": "Выкл",
  "f.on": "Вкл",
  "f.secretHint": "Хранится на сервере и больше не показывается. Оставьте пустым, чтобы сохранить текущее значение.",
  "f.telegramAllowedUserIds": "Разрешённые id пользователей",
  "f.telegramEnabled": "Включено",
  "f.telegramEnabledHint": "Включить адаптер Telegram Bot API с опросом обновлений.",
  "f.telegramToken": "Токен бота",
  "f.telegramTokenHint": "Токен от @BotFather (123456:ABC-DEF…).",
  "f.wecomAgentId": "Agent id",
  "f.wecomAgentIdHint": "Agent id приложения WeCom.",
  "f.wecomAllowedUserIds": "Разрешённые id пользователей",
  "f.wecomCorpId": "Corp id",
  "f.wecomCorpIdHint": "Идентификатор организации из консоли WeCom.",
  "f.wecomCorpSecret": "App secret",
  "f.wecomEnabled": "Включено",
  "f.wecomEnabledHint": "Включить адаптер WeCom с обратным вызовом (нужен публичный адрес).",
  "f.wecomEncodingAesKey": "EncodingAESKey",
  "f.wecomToken": "Токен обратного вызова",
  "g.agent": "Агент",
  "g.feishu": "Feishu (Китай)",
  "g.general": "Общие",
  "g.http": "HTTP (режим вебхуков)",
  "g.lark": "Lark (международный)",
  "g.mock": "Тестовый адаптер",
  "g.telegram": "Telegram",
  "g.wecom": "WeCom (WeChat Work)",
  "p.agentCwd": "Например: /home/user/projects/my-agent (пусто — папка DSH)",
  "p.agentMaxMessageLength": "Например: 4000",
  "p.agentModel": "Например: deepseek-v4-flash (пусто — по умолчанию)",
  "p.agentProvider": "Например: volcengine (пусто — по умолчанию)",
  "p.feishuAllowedUserIds": "Например: ou_xxxxxxxxxxxxx",
  "p.feishuAppId": "Например: cli_xxxxxxxxxxxxx",
  "p.feishuAppSecret": "App Secret приложения Feishu",
  "p.httpHost": "Например: 0.0.0.0",
  "p.httpPort": "Например: 8080",
  "p.larkAllowedUserIds": "Например: ou_xxxxxxxxxxxxx",
  "p.larkAppId": "Например: cli_xxxxxxxxxxxxx",
  "p.larkAppSecret": "App Secret приложения Lark",
  "p.mockPort": "Например: 9099 (0 — автоматически)",
  "p.telegramAllowedUserIds": "Например: 123456789, 987654321",
  "p.telegramToken": "Например: 123456789:AA...",
  "p.wecomAgentId": "Например: 1000002",
  "p.wecomAllowedUserIds": "Например: ivanov, petrov",
  "p.wecomCorpId": "Например: wwxxxxxxxxxxxxxx",
  "p.wecomCorpSecret": "Secret приложения WeCom",
  "p.wecomEncodingAesKey": "EncodingAESKey из 43 символов",
  "p.wecomToken": "Токен адреса обратного вызова",
  "settings.collapse": "Свернуть",
  "settings.description": "Подключает агентов dsh к Feishu (Lark), WeCom и Telegram. Каждый чат получает свою сессию агента.",
  "settings.discard": "Отменить",
  "settings.expand": "Развернуть",
  "settings.invalidNumber": "Введите корректное число",
  "settings.overridden": "Переопределено",
  "settings.readOnly": "Установка доступна только для чтения: настройки из интерфейса не меняются.",
  "settings.reset": "Сбросить",
  "settings.save": "Сохранить",
  "settings.saveFailed": "Сохранить не удалось",
  "settings.saving": "Сохранение…",
  "settings.title": "IM-шлюз (dsh-im-hub)",
  "settings.unsaved": "Есть несохранённые изменения"
 },
 "job": {
  "count.idle.few": "{count} фоновые задачи",
  "count.idle.many": "{count} фоновых задач",
  "count.idle.one": "{count} фоновая задача",
  "count.idle.other": "{count} фоновых задач",
  "count.live.few": "{count} фоновые задачи выполняется",
  "count.live.many": "{count} фоновых задач выполняется",
  "count.live.one": "{count} фоновая задача выполняется",
  "count.live.other": "{count} фоновых задач выполняется",
  "duration.hours": "{hours} ч {minutes} мин",
  "duration.minutes": "{minutes} мин {seconds} с",
  "duration.seconds": "{seconds} с",
  "duration.title.done": "Заняло {duration}",
  "duration.title.live": "Выполняется {duration}",
  "list.aria": "Фоновые задачи",
  "status.completed": "завершена",
  "status.failed": "ошибка",
  "status.killed": "отменена",
  "status.running": "выполняется",
  "status.stopping": "останавливается"
 },
 "model": {
  "action.reload": "Обновить",
  "blocked.composer": "Эта модель недоступна — выберите другую, чтобы продолжить",
  "command.description": "Выбрать модель для этого диалога",
  "effort.providerDefault": "По умолчанию",
  "empty.efforts": "У этой модели нет уровней рассуждения.",
  "empty.models": "Доступных моделей нет.",
  "error.action": "Операция с моделью не удалась: {message}",
  "menu.aria": "Модель и уровень рассуждения",
  "menu.effort": "Уровень рассуждений",
  "menu.model": "Модель",
  "option.loadError": "Каталог не загрузился: {message}",
  "status.loading": "Обновление списка моделей…",
  "trigger.aria": "Выбор модели, сейчас {model}",
  "trigger.ariaEffort": "Выбор модели, сейчас {model}, уровень рассуждения {effort}",
  "trigger.fallback": "Выбрать модель",
  "trigger.selectAria": "Выбрать модель",
  "warning.groupLoad": "{name} не загрузился: {message}"
 },
 "permission.access": {
  "confirm.acknowledge": "Я понимаю риски и хочу продолжить",
  "confirm.cancel": "Отмена",
  "confirm.description": "Полный доступ убирает часть подтверждений и позволяет агенту действовать напрямую, включая чувствительные операции, изменение файлов и внешние команды. Включайте, только если доверяете текущей задаче.",
  "confirm.enable": "Включить полный доступ",
  "confirm.title": "Включить полный доступ?"
 },
 "pin": {
  "action.pin": "Закрепить",
  "action.unpin": "Открепить"
 },
 "plan": {
  "chip.off.aria": "Режим плана выключен, нажмите, чтобы включить",
  "chip.off.title": "Режим плана выключен — нажмите, чтобы включить (/plan)",
  "chip.on.aria": "Режим плана включён, нажмите, чтобы выключить",
  "chip.on.title": "Режим плана включён — нажмите, чтобы выключить (/plan off)"
 },
 "plugin-store": {
  "dialog.close": "Закрыть магазин плагинов",
  "header.open": "Открыть магазин плагинов",
  "header.title": "Магазин плагинов DSH",
  "settings.tab": "Магазин плагинов",
  "store.analyzeFailed": "Передать разбор агенту не удалось",
  "store.analyzeHint": "Отправить эту ошибку в новую сессию агента для разбора.",
  "store.analyzeSent": "Отправлено агенту",
  "store.analyzeWithAgent": "Попросить агента разобраться",
  "store.analyzing": "Создаём сессию агента…",
  "store.cancel": "Отмена",
  "store.category": "Категория",
  "store.categoryAll": "Все категории",
  "store.confirmInstall": "Установить плагин",
  "store.confirmRemove": "Удалить плагин",
  "store.confirmUpdate": "Обновить плагин",
  "store.copied": "Ссылка для установки скопирована",
  "store.copyInstall": "Скопировать ссылку для установки",
  "store.disclaimer": "Наличие в каталоге не подтверждает работоспособность, совместимость, безопасность или качество.",
  "store.done": "Готово",
  "store.empty": "Под эти фильтры ничего не подходит",
  "store.install": "Установить",
  "store.installFailed": "Установить не удалось",
  "store.installSuccess": "Установлено. Перезапустите DSH Web, чтобы плагин заработал.",
  "store.installed": "Установлен",
  "store.installedLoadFailed": "Список установленных плагинов недоступен",
  "store.installedOnly": "Только установленные",
  "store.installing": "Установка…",
  "store.loadFailed": "Не удалось загрузить каталог",
  "store.loadMore": "Показать ещё",
  "store.loading": "Загрузка каталога плагинов…",
  "store.openDetails": "Открыть карточку в магазине",
  "store.refresh": "Обновить каталог",
  "store.refreshFailed": "Каталог не обновился; показаны последние успешные данные",
  "store.remove": "Удалить плагин",
  "store.removeDetail": "Меняется только зависимость текущего профиля. Чтобы удаление вступило в силу, перезапустите DSH Web.",
  "store.removeFailed": "Удалить не удалось",
  "store.removeLead": "Плагин будет удалён из текущего профиля DSH Web.",
  "store.removeSuccess": "Удалено. Перезапустите DSH Web, чтобы изменение вступило в силу.",
  "store.removeTitle": "Удаление плагина",
  "store.removing": "Удаление…",
  "store.results": "{visible} из {total} проектов",
  "store.retry": "Повторить",
  "store.riskAcknowledge": "Я понимаю риск и хочу установить этот сторонний плагин",
  "store.riskDetail": "Присутствие в каталоге не является проверкой безопасности, совместимости или качества. Установленный код выполняется с правами процесса DSH, а чтобы он заработал, DSH Web нужно перезапустить.",
  "store.riskLead": "В текущий профиль DSH Web будет установлен код из стороннего репозитория.",
  "store.riskTitle": "Подтверждение риска стороннего плагина",
  "store.search": "Поиск по названию, автору, описанию или теме",
  "store.sort": "Сортировка",
  "store.sortName": "Название",
  "store.sortRecommended": "Рекомендуемые",
  "store.sortStars": "Звёзды",
  "store.sortUpdated": "Недавно обновлённые",
  "store.stars": "звёзд: {count}",
  "store.topicListed": "Указана тема",
  "store.update": "Обновить",
  "store.updateAvailable": "Есть обновление",
  "store.updateRiskDetail": "Обновление заменит версию плагина в этом профиле. Чтобы оно вступило в силу, перезапустите DSH Web.",
  "store.updateRiskLead": "В текущий профиль DSH Web будет установлена более новая ревизия стороннего репозитория.",
  "store.updateRiskTitle": "Подтверждение обновления стороннего плагина",
  "store.updateSuccess": "Обновлено. Перезапустите DSH Web, чтобы плагин заработал.",
  "store.updated": "Каталог обновлён {date}",
  "store.updating": "Обновление…",
  "store.validation.check-failed": "Проверка структуры не пройдена",
  "store.validation.check-pending": "Проверка структуры в очереди",
  "store.validation.check-running": "Идёт проверка структуры",
  "store.validation.expired": "Нужна повторная проверка",
  "store.validation.inconclusive": "Требует рассмотрения",
  "store.validation.not-applicable": "Вне проверки плагинов",
  "store.validation.recorded": "Есть запись о проверке",
  "store.validation.sandbox-failed": "Проверка в песочнице не пройдена",
  "store.validation.sandbox-pending": "Проверка в песочнице в очереди",
  "store.validation.sandbox-running": "Идёт проверка в песочнице",
  "store.validation.security-review": "Проверка безопасности",
  "store.validation.unrecognized": "Требует опознания",
  "store.validation.verified": "Проверен",
  "store.verified": "Проверен",
  "store.verifiedOnly": "Только проверенные"
 },
 "question": {
  "action.next": "Дальше",
  "action.skip": "Пропустить вопрос",
  "custom.placeholder": "Впишите свой ответ",
  "error.incomplete": "Сначала ответьте на этот вопрос.",
  "error.unanswered": "Выберите вариант или впишите свой ответ.",
  "nav.cancel": "Закрыть все вопросы",
  "nav.maximize": "Развернуть карточку вопроса",
  "nav.minimize": "Свернуть карточку вопроса",
  "nav.next": "Следующий вопрос",
  "nav.prev": "Предыдущий вопрос",
  "option.recommended": "Рекомендуем",
  "plan.approve": "Утвердить",
  "plan.decline": "Отклонить",
  "plan.discuss": "Обсудить",
  "plan.header": "Проверка плана"
 },
 "reference": {
  "candidate.file": "Файл",
  "candidate.folder": "Папка",
  "candidate.noCwd": "(нет cwd)",
  "candidate.session": "Сессия",
  "section.files": "Файлы и папки",
  "section.sessions": "Диалоги сессий"
 },
 "session-log-download": {
  "dialog.close": "Закрыть",
  "dialog.commandFailed": "Не удалось запустить экспорт сессии.",
  "dialog.errorTitle": "Экспорт сессии не удался",
  "dialog.preparingDescription": "Готовится ZIP с этой сессией, её подсессиями и вложениями.",
  "dialog.preparingTitle": "Экспорт сессии",
  "dialog.successDescription": "Браузер загружает ZIP с сессией.",
  "dialog.successTitle": "Загрузка сессии началась"
 },
 "settings": {
  "close": "Закрыть",
  "general.nav": "Общие",
  "openDocument": "Открыть файл настроек",
  "openDocument.error": "Не удалось открыть файл настроек",
  "title": "Настройки",
  "trigger": "Настройки"
 },
 "settings.agentPreset": {
  "brokenBadge": "Не загрузился",
  "brokenNoCopy": "Пресет, который не загрузился, скопировать нельзя",
  "builtIn": "Встроенный",
  "builtInGroup": "Встроенные",
  "cancel": "Отмена",
  "close": "Закрыть",
  "composition": "Композиция (agent.cordis.yml)",
  "copyIntro": "Пресет копируется целиком на этой машине. Идентификатор станет именем каталога и позже не меняется; всё остальное правится в файлах самого пресета.",
  "copyOf": "Скопирован с",
  "copyTitle": "Скопировать пресет",
  "create": "Создать",
  "creating": "Создание…",
  "creatorDraft": "Набросать свой пресет в режиме «Конструктор»",
  "customGroup": "Свои",
  "delete": "Удалить",
  "deleteConfirm": "Удалить",
  "deleteDescription": "Каталог пресета будет удалён. Уже запущенные на нём сессии продолжат работать, но выбрать его для новых нельзя.",
  "deleteTitle": "Удалить этот пресет?",
  "deleting": "Удаление…",
  "description": "Действует на сессии, запущенные с этого момента. Работающие сессии остаются на своём пресете.",
  "displayName": "Название",
  "displayNamePlaceholder": "Показывается в списке; по умолчанию — идентификатор",
  "duplicate": "Скопировать",
  "duplicateUnavailable": "В этой установке нет каталога пресетов с правом записи",
  "error": "Не удалось загрузить пресеты агента.",
  "headerHint": "Пресет агента, на котором идёт сессия; зафиксирован при запуске",
  "idInvalid": "Строчные буквы, цифры и дефисы, начиная с буквы или цифры.",
  "idRequired": "Задайте пресету идентификатор.",
  "idTaken": "Пресет с таким идентификатором уже есть.",
  "inUse": "Используется",
  "loading": "Загрузка пресетов…",
  "nav": "Пресеты агента",
  "noDescription": "Без описания.",
  "openLocation": "Открыть папку",
  "presetCodeDescription": "Всё, что умеет обычный режим, но инструменты отдаются через Code Mode SDK: модель собирает многошаговые операции в одну программу на TypeScript.",
  "presetCodeName": "Режим кода",
  "presetCordisDescription": "Для создания своих пресетов: всё из обычного режима плюс инспекция рантайма, опыты с плагинами и подсказки по авторству пресетов.",
  "presetCordisName": "Конструктор",
  "presetId": "Идентификатор",
  "presetIdPlaceholder": "my-agent",
  "presetMinimalDescription": "Агент из двух инструментов: постоянный bash и str_replace_editor.",
  "presetMinimalName": "Минимальный режим",
  "presetStandardDescription": "Полноценный кодинг-агент: правка файлов, консоль, поиск по файлам и в вебе, скиллы, планирование, цели, субагенты и воркфлоу.",
  "presetStandardName": "Обычный режим",
  "retry": "Повторить",
  "revealedPathLabel": "Файлы пресета:",
  "seatHint": "Пресет агента для сессии, которую вы собираетесь запустить",
  "sectionIntro": "Пресет — это состав плагинов, на котором работает агент сессии: его инструменты, промпт и возможности. Скопируйте готовый и допилите под себя или попросите агента набросать свой в режиме «Конструктор».",
  "setDefault": "Сделать основным",
  "showLocation": "Показать расположение",
  "title": "Пресет агента",
  "userTrust": "Свой",
  "view": "Посмотреть"
 },
 "settings.locale": {
  "language.title": "Язык"
 },
 "settings.models": {
  "add": "Добавить провайдера",
  "addModel": "Добавить модель",
  "advancedHint": "Остальные поля живут в settings.yaml — правьте этот раздел напрямую.",
  "apply": "Применить",
  "applying": "Применение…",
  "baseUrl": "Базовый URL",
  "baseUrlDefault": "По умолчанию у провайдера",
  "cancel": "Отмена",
  "close": "Закрыть",
  "conflict": "Пока карточка была открыта, настройки изменил кто-то ещё. Закройте и откройте заново, чтобы править актуальные значения.",
  "contextWindow": "Окно контекста",
  "contextWindowPlaceholder": "Как у провайдера по умолчанию",
  "create": "Создать провайдера",
  "creating": "Создание…",
  "credentialConfigured": "API-ключ задан",
  "credentialMissing": "API-ключ не задан",
  "customAdd": "Добавить своего провайдера",
  "customApi": "Протокол API",
  "customApiUnset": "Не выбран",
  "customDisplayName": "Отображаемое имя",
  "customNeedsBaseUrl": "Своему провайдеру нужен базовый URL.",
  "customNeedsModels": "Своему провайдеру нужна хотя бы одна модель.",
  "customRoute": "Идентификатор провайдера",
  "customRouteHint": "Идентификатор в нижнем регистре, начинается с буквы. По нему провайдер адресуется в запросах, и так же называется его ключ.",
  "customRouteInvalid": "Начните со строчной буквы, дальше строчные буквы, цифры и дефисы.",
  "customRouteTaken": "Такой идентификатор уже занят другим провайдером.",
  "customTag": "Свой",
  "customTitle": "Свой провайдер",
  "customized": "Настройки изменены",
  "deleteConfirm": "Удалить {provider}",
  "deleteDescription": "Удаление {provider} убирает его настройки. Ключ, которым он пользовался, хранится отдельно и останется.",
  "deleteDescriptionWithCredential": "Удаление {provider} убирает его настройки и сохранённый API-ключ.",
  "deleteTitle": "Удалить {provider}?",
  "deleting": "Удаление {provider}…",
  "edit": "Изменить",
  "editProvider": "Изменить {provider}",
  "fetchAdopt": "Добавить выбранные",
  "fetchDescription": "Вот модели, доступные у этого провайдера. Отметьте те, что нужно добавить.",
  "fetchDeselectAll": "Снять выбор",
  "fetchEmpty": "Провайдер не вернул ни одной модели. Добавьте их вручную.",
  "fetchModels": "Запросить список моделей",
  "fetchNeedsBaseUrl": "Сначала укажите базовый URL, потом запрашивайте.",
  "fetchSelectAll": "Выбрать все",
  "fetchTitle": "Выберите модели",
  "fetching": "Запрос к провайдеру…",
  "intro": "Введите свои API-ключи, чтобы пользоваться моделями этих провайдеров.",
  "keyBlank": "Введите API-ключ или оставьте поле пустым, чтобы сохранить прежний.",
  "keyBlankNew": "Введите API-ключ или оставьте поле пустым, если провайдер авторизуется иначе.",
  "keyEnvLocked": "Задан переменной окружения (только чтение)",
  "keyIllegalCharacters": "Ключ в недопустимом формате. Проверьте его.",
  "keyInput": "API-ключ",
  "keyPlaceholder": "Введите API-ключ",
  "keyPlaceholderNative": "Введите API-ключ или оставьте пустым для авторизации из окружения",
  "keyRequired": "Чтобы продолжить, введите API-ключ.",
  "keyStored": "Задан — введите новое значение, чтобы заменить",
  "loadFailed": "Не удалось загрузить список провайдеров",
  "maxTokens": "Максимум выходных токенов",
  "maxTokensPlaceholder": "Как у провайдера по умолчанию",
  "model": "Модель",
  "modelAdvanced": "Ёмкости",
  "modelCapacityInvalid": "Ёмкость задаётся числом, можно с суффиксом K или M.",
  "modelContextInvalid": "Окно контекста — положительное число, например 131072, 256K или 1M.",
  "modelContextWindow": "Окно контекста",
  "modelDuplicate": "Каждый идентификатор модели встречается один раз.",
  "modelId": "Идентификатор модели",
  "modelIdDuplicate": "Идентификатор модели должен быть уникальным.",
  "modelIdRequired": "Нужен идентификатор модели.",
  "modelMaxTokens": "Максимум выходных токенов",
  "modelMaxTokensInvalid": "Максимум выходных токенов — положительное число, например 8192, 64K или 1M.",
  "modelName": "Отображаемое имя",
  "modelNameInvalid": "Отображаемое имя не может быть пустым.",
  "modelNamePlaceholder": "Пусто — возьмётся идентификатор модели",
  "models": "Модели",
  "modelsCustomized": "Каталог моделей изменён",
  "modelsEmpty": "В выборе моделей не будет ничего. Неуказанные идентификаторы всё равно можно отправлять напрямую.",
  "modelsInherited": "По умолчанию, как в адаптере",
  "nav": "Модели",
  "onboardingDescription": "Настройте официального провайдера DeepSeek, чтобы начать.",
  "onboardingLater": "Настроить позже",
  "onboardingSave": "Сохранить и продолжить",
  "onboardingSaving": "Сохранение…",
  "onboardingTitle": "Добавьте API-ключ, чтобы начать",
  "provider": "Провайдер",
  "readOnly": "В этой установке файл настроек доступен только для чтения.",
  "remove": "Удалить",
  "removeModel": "Удалить модель",
  "removeProvider": "Удалить {provider}",
  "resetModels": "Вернуть значения по умолчанию",
  "retry": "Повторить",
  "savedProvider": "{provider} сохранён.",
  "title": "Модели",
  "welcomeError": "Не удалось сохранить подтверждение. Попробуйте ещё раз."
 },
 "settings.permission": {
  "confirm.acknowledge": "Я понимаю риски и хочу продолжить",
  "confirm.cancel": "Отмена",
  "confirm.description": "Полный доступ позволяет новым сессиям реже спрашивать подтверждение и действовать напрямую, включая чувствительные операции, изменение файлов и внешние команды. Включайте, только если доверяете будущим задачам.",
  "confirm.enable": "Включить полный доступ",
  "confirm.title": "Включить полный доступ?",
  "description": "Режим разрешений по умолчанию для новых сессий",
  "loading": "Загрузка",
  "title": "Разрешения",
  "unavailable": "Недоступно"
 },
 "settings.pluginInventory": {
  "active": "Подключён",
  "catalog": "Список плагинов",
  "configuration": "Настройки",
  "cordis": "Состояние Cordis",
  "disabledTag": "Выключен",
  "empty": "Плагинов нет.",
  "emptySearch": "Подходящих плагинов нет.",
  "enabledTag": "Включён",
  "error": "Плагины временно недоступны.",
  "failed": "Не удалось подключить",
  "loading": "Чтение плагинов…",
  "loadingPhase": "Загрузка",
  "pending": "Ожидает зависимости",
  "retry": "Повторить",
  "search": "Поиск плагинов",
  "tab": "Список плагинов",
  "unloading": "Выгружается",
  "unobserved": "Не подключён"
 },
 "settings.plugins": {
  "agentLoopDescription": "Как агент раздаёт вызовы инструментов.",
  "agentLoopMaxParallel": "Параллельных вызовов",
  "agentLoopMaxParallelHint": "Сколько безопасных для параллели вызовов идёт одновременно в пределах шага.",
  "agentLoopTitle": "Цикл агента",
  "bashDescription": "Ограничения для каждой команды, которую запускает агент.",
  "bashMaxOutputBytes": "Предел вывода на поток (байт)",
  "bashMaxOutputBytesHint": "Всё сверх предела уходит во временный файл, а не теряется.",
  "bashTimeoutMs": "Таймаут команды (мс)",
  "bashTimeoutMsHint": "Сколько команда может выполняться до принудительного завершения.",
  "bashTitle": "Консоль",
  "collapse": "Скрыть настройки",
  "configurableTab": "Настройки плагинов",
  "discard": "Отменить",
  "empty": "В этой установке настройки плагинов не выведены.",
  "expand": "Показать настройки",
  "intro": "Настройка и просмотр плагинов, установленных в этой сборке.",
  "invalidNumber": "Введите число или оставьте пустым, чтобы взять значение по умолчанию.",
  "nav": "Плагины",
  "overridden": "Переопределено",
  "readOnly": "В этой установке настройки доступны только для чтения.",
  "reset": "Вернуть по умолчанию",
  "save": "Сохранить",
  "saveFailed": "Установка не приняла эти значения; они оставлены, чтобы вы их поправили.",
  "saving": "Сохранение…",
  "tabs": "Разделы плагинов",
  "title": "Плагины",
  "unsaved": "Не сохранено",
  "webSearchApiKey": "API-ключ",
  "webSearchApiKeyHint": "Хранится вне файла настроек. Оставьте пустым, чтобы сохранить текущий ключ.",
  "webSearchApiKeySet": "Ключ задан.",
  "webSearchApiKeyUnset": "Ключ не задан; без него поиск недоступен.",
  "webSearchBaseUrl": "Адрес сервиса",
  "webSearchBaseUrlHint": "Оставьте пустым, чтобы взять адрес провайдера по умолчанию.",
  "webSearchDescription": "Поисковый провайдер DeepSeek.",
  "webSearchMaxUses": "Максимум поисков на запрос",
  "webSearchMaxUsesHint": "Сколько раз в рамках одного запроса можно искать, прежде чем придётся отвечать.",
  "webSearchTitle": "Поиск в вебе"
 },
 "settings.subscriptions": {
  "cancel": "Отмена",
  "checking": "Проверка…",
  "generating": "Генерация изображения…",
  "image": "изображение",
  "imageClose": "Закрыть",
  "imageLoadFailed": "Повторить",
  "imageLoading": "Загрузка…",
  "imagePreview": "Просмотр изображения",
  "intro": "Вход и выход из провайдеров по подписке. Вход открывает страницу авторизации в новой вкладке; без браузера можно вставить адрес обратного вызова или код.",
  "loggedIn": "Выполнен вход",
  "loggedInAccount": "Вход выполнен как {account}",
  "loggedInAccountExpires": "Вход выполнен как {account} · истекает {date}",
  "loggedInExpires": "Вход выполнен · истекает {date}",
  "login": "Войти",
  "loginInProgress": "Идёт вход…",
  "loginMissingUrl": "ответ на вход пришёл без authorizeUrl",
  "logout": "Выйти",
  "logoutConfirm": "Выйти из {provider}?",
  "manualPlaceholder": "Вставьте адрес обратного вызова или код",
  "manualSummary": "Не работает вход через браузер? Вставьте адрес обратного вызова или код",
  "nav": "Подписки",
  "notLoggedIn": "Вход не выполнен",
  "submit": "Отправить",
  "unavailable": "Нет связи; состояние подписок не загрузить.",
  "usageEmpty": "Окна расхода не переданы.",
  "usageError": "Не удалось получить расход: {message}",
  "usageLoading": "Загрузка расхода…",
  "usagePlan": "Тариф: {plan}",
  "usageRefresh": "Обновить",
  "usageResets": "сбрасывается {date}",
  "usageSession": "Окно 5 часов",
  "usageTitle": "Расход",
  "usageWeekly": "За неделю",
  "usageWindow": "Окно",
  "viewImage": "Посмотреть изображение",
  "viewImageNamed": "Посмотреть {name}"
 },
 "settings.theme": {
  "appearance.dark": "Тёмная",
  "appearance.light": "Светлая",
  "appearance.system": "Как в системе",
  "appearance.title": "Оформление"
 },
 "sidebar": {
  "session.new": "Новая сессия",
  "session.new.label": "Новая сессия",
  "toggle.collapse": "Свернуть панель",
  "toggle.open": "Открыть панель"
 },
 "skill": {
  "menu.userOnly": "только вручную",
  "row.failed": "Не удалось загрузить скилл",
  "row.instructions": "Инструкции",
  "row.running": "Загрузка скилла",
  "row.stopped": "Загрузка скилла остановлена"
 },
 "slash.menu": {
  "command": "Команды",
  "loading": "Загрузка…",
  "skill": "Скиллы",
  "subagent": "Субагенты",
  "suggestions.aria": "Подсказки по вводу"
 },
 "subagent": {
  "activity.inactive": "не работает",
  "activity.running": "работает",
  "branch.collapse": "Свернуть потомков {label}",
  "branch.expand": "Развернуть потомков {label}",
  "count.running.few": "{count} субагента работает",
  "count.running.many": "{count} субагентов работает",
  "count.running.one": "{count} субагент работает",
  "count.running.other": "{count} субагентов работает",
  "count.total.few": "{count} субагента",
  "count.total.many": "{count} субагентов",
  "count.total.one": "{count} субагент",
  "count.total.other": "{count} субагентов",
  "diagnostic.corrupt": "запись сессии повреждена",
  "diagnostic.unavailable": "запись сессии временно недоступна",
  "diagnostic.unsupported": "неподдерживаемая версия записи субагента",
  "duration.days": "{days} дн",
  "duration.daysHours": "{days} дн {hours} ч",
  "duration.exactDays": "{days} дн {hours} ч {minutes} мин {seconds} с",
  "duration.exactTitle": "Всего активного времени: {duration}",
  "duration.hours": "{hours} ч {minutes} мин {seconds} с",
  "duration.minutes": "{minutes} мин {seconds} с",
  "duration.months": "~{months} мес",
  "duration.monthsDays": "~{months} мес {days} дн",
  "duration.seconds": "{seconds} с",
  "duration.years": "~{years} г",
  "duration.yearsMonths": "~{years} г {months} мес",
  "load.error": "Не удалось загрузить субагентов",
  "loading.aria": "Загрузка субагентов",
  "loading.label": "Загрузка субагентов…",
  "mode.continuable": "с продолжением",
  "mode.oneShot": "разовый",
  "readonly.body": "Родительская сессия офлайн; откройте её заново, чтобы продолжить переписку.",
  "readonly.oneShot.body": "Разовые задачи не принимают продолжения; здесь можно изучить полную запись выполнения.",
  "readonly.oneShot.title": "Запись разового субагента",
  "readonly.title": "Пока этот субагент доступен только для чтения",
  "retry": "Повторить",
  "switcher.aria": "Переключить субагента: {title}",
  "tree.aria": "Сессии субагентов"
 },
 "task-board": {
  "archive.empty": "В архиве пусто",
  "board.archive": "Архив",
  "board.archiveView": "Архив ({count})",
  "board.backToBoard": "К доске",
  "board.close": "В чат",
  "board.created": "Создана",
  "board.empty": "В этой колонке задач нет",
  "board.filterAll": "Все",
  "board.hostError": "Действие на хосте не удалось: {error}",
  "board.hostMeta": "Часовой пояс хоста {timeZone} · ревизия {revision}",
  "board.new": "Новая задача",
  "board.pending": "Отправка",
  "board.retryHost": "Переподключиться к хосту",
  "board.runs": "запусков",
  "board.search": "Фильтр задач…",
  "board.status": "Статус",
  "board.status.backlog": "Бэклог",
  "board.status.done": "Готово",
  "board.status.failed": "Ошибка",
  "board.status.running": "В работе",
  "board.status.todo": "К выполнению",
  "board.title": "Доска задач",
  "board.updated": "Обновлена",
  "card.scheduled": "по расписанию",
  "delete.cancel": "Отмена",
  "delete.confirm": "Удалить «{name}»? Отменить это будет нельзя.",
  "delete.ok": "Удалить",
  "delete.title": "Удаление задачи",
  "detail.archive": "В архив",
  "detail.archivedAt": "В архиве · {time}",
  "detail.close": "Закрыть",
  "detail.delete": "Удалить",
  "detail.description": "Описание",
  "detail.execution": "История запусков",
  "detail.executionEnded": "Завершён",
  "detail.executionSettings": "Параметры запуска",
  "detail.executionStarted": "Начат",
  "detail.noExecution": "Ещё не запускалась",
  "detail.noSession": "Сессии нет",
  "detail.prompt": "Промпт запуска",
  "detail.rerun": "Запустить снова",
  "detail.restore": "Вернуть из архива",
  "detail.result.cancelled": "Отменён",
  "detail.result.failed": "Ошибка",
  "detail.result.running": "Выполняется",
  "detail.result.succeeded": "Успешно",
  "detail.run": "Запустить",
  "detail.schedule": "Запуски по расписанию",
  "detail.schedule.cron": "Выражение cron",
  "detail.schedule.dueSoon": "Скоро",
  "detail.schedule.enable": "Включить запуски по расписанию",
  "detail.schedule.invalid": "Неверное выражение cron",
  "detail.schedule.lastTriggered": "Последний запуск",
  "detail.schedule.nextRun": "Следующий запуск",
  "detail.schedule.notScheduled": "Расписания пока нет",
  "detail.schedule.preset.daily9": "Каждый день в 09:00",
  "detail.schedule.preset.hourly": "Каждый час",
  "detail.schedule.preset.tenMin": "Каждые 10 минут",
  "detail.schedule.preset.weeklyMon9": "По понедельникам в 09:00",
  "detail.schedule.presets": "Готовые варианты",
  "detail.title": "Задача",
  "detail.viewSession": "Открыть сессию",
  "entry.label": "Доска задач",
  "exec.error.noWorkspace": "Нет рабочей папки, в которой можно выполнить задачу",
  "exec.error.promptRejected": "Промпт отклонён",
  "exec.hint": "Применяется при запуске задачи: рабочая папка определяет, где появится сессия выполнения; режим задаёт пресет агента; разрешение выставляется командой /permission. Пусто — как по умолчанию в рантайме.",
  "exec.mode.brokenSuffix": " (недоступен)",
  "exec.mode.default": "Как в установке",
  "exec.mode.defaultSuffix": " (по умолчанию)",
  "exec.mode.removed": " (удалён)",
  "exec.permission.danger-full-access": "Полный доступ",
  "exec.permission.default": "Как в сессии",
  "exec.permission.read-only": "Только чтение",
  "exec.permission.workspace-write": "Запись в рабочую папку",
  "exec.workspace.recent": "Последняя (по умолчанию)",
  "new.cancel": "Отмена",
  "new.description": "Описание",
  "new.descriptionPlaceholder": "Контекст, границы, критерии приёмки (необязательно)",
  "new.mode": "Режим",
  "new.permission": "Разрешения",
  "new.prompt": "Промпт запуска",
  "new.promptPlaceholder": "Полная инструкция агенту (если пусто, возьмётся заголовок)",
  "new.required": "Нужен заголовок",
  "new.submit": "Создать",
  "new.title": "Заголовок",
  "new.titlePlaceholder": "Что нужно сделать, одной строкой",
  "new.workspace": "Рабочая папка",
  "run.failed": "Запуск не удался: {error}",
  "settings.announceToAgent": "Сообщать агентам о доске задач",
  "settings.announceToAgentHint": "Включено: в системный промпт каждого агента добавляется упоминание доски. Выключено: агенты узнают о ней, только если вы скажете сами.",
  "settings.collapse": "Скрыть настройки",
  "settings.description": "Настройка доски задач на хосте, упоминания в промпте и защиты от засыпания, пока есть незавершённая работа.",
  "settings.discard": "Отменить",
  "settings.enabled": "Включить доску задач",
  "settings.enabledHint": "Когда выключено, пункт в панели и сама доска скрыты.",
  "settings.expand": "Показать настройки",
  "settings.inherit": "Наследовать",
  "settings.invalidNumber": "Введите число или оставьте пустым, чтобы взять значение по умолчанию.",
  "settings.notExposed": "Эта версия DSH не выводит namespace настроек плагина на страницу конфигурации, поэтому форма недоступна. Правьте ~/.dsh/settings.yaml напрямую или добавьте namespace в список WEB_SETTINGS_NAMESPACES у dsh-host-apiproxy и перезапустите.",
  "settings.off": "Выкл",
  "settings.on": "Вкл",
  "settings.overridden": "Переопределено",
  "settings.powerBoundary": "Батарея будет расходоваться быстрее. Закрытие крышки, ручной уход в сон, гибернация, выключение, действия при низком заряде и корпоративные политики под гарантию не попадают; уже спящий компьютер не разбудят.",
  "settings.powerError": "Последняя ошибка защиты от засыпания: {error}",
  "settings.powerStatus": "Платформа: {platform}; защита: {phase}; работающих сессий: {running}; включённых расписаний: {schedules}",
  "settings.powerUnknown": "неизвестно",
  "settings.preventIdleSleep": "Не давать системе засыпать",
  "settings.preventIdleSleepHint": "По умолчанию выключено. Когда включено, хост не даёт системе уйти в сон, пока работает хоть одна сессия DSH, включено расписание или состояние сессий ещё неизвестно. Экран при этом может гаснуть.",
  "settings.readOnly": "В этой установке настройки доступны только для чтения.",
  "settings.reset": "Вернуть по умолчанию",
  "settings.save": "Сохранить",
  "settings.saveFailed": "Установка не приняла эти значения; они оставлены, чтобы вы их поправили.",
  "settings.saving": "Сохранение…",
  "settings.title": "Доска задач",
  "settings.unsaved": "Не сохранено",
  "status.move.backlog": "В бэклог",
  "status.move.todo": "К выполнению",
  "time.justNow": "только что"
 },
 "trajectory": {
  "toolbar.actualTime": "Реальное время",
  "toolbar.aria": "Панель траектории",
  "toolbar.calls": "Вызовы",
  "toolbar.collapseCalls": "Свернуть вызовы",
  "toolbar.collapseTurns": "Свернуть ходы",
  "toolbar.duration": "Длительность",
  "toolbar.expandCalls": "Развернуть вызовы",
  "toolbar.expandTurns": "Развернуть ходы",
  "toolbar.search": "Поиск по траектории",
  "toolbar.searchPlaceholder": "Поиск",
  "toolbar.turns": "Ходы",
  "toolbar.useActualDuration": "По реальной длительности",
  "toolbar.useEqualWidth": "Операции равной ширины",
  "view.trajectory": "Траектория"
 },
 "usageDashboard": {
  "buckets.cacheRead": "Чтение кэша",
  "buckets.cacheWrite": "Запись в кэш",
  "buckets.caption": "Четыре непересекающиеся корзины тарификации · всего {total} ток",
  "buckets.output": "Выход",
  "buckets.title": "Состав токенов",
  "buckets.uncachedInput": "Вход мимо кэша",
  "composition.caption": "Оценка по эвристике, не по счёту; в сумму занятости не сойдётся",
  "composition.messages": "Сообщения",
  "composition.system": "Системный промпт",
  "composition.title": "Состав контекста",
  "composition.tools": "Схемы инструментов",
  "efficiency.llm": "Время модели",
  "efficiency.steps": "Шаги",
  "efficiency.stepsValue": "{steps}",
  "efficiency.throughput": "Скорость выдачи",
  "efficiency.title": "Эффективность запросов",
  "efficiency.tool": "Время инструментов",
  "efficiency.ttft": "Первый токен, среднее",
  "efficiency.ttftOver": "шагов: {steps}",
  "efficiency.turns": "Ходы",
  "efficiency.turnsValue": "{turns}",
  "empty.usage": "Расхода токенов пока нет",
  "empty.usageHint": "Цифры появятся, когда сессия сделает первый запрос к модели.",
  "overview.billedInput": "Оплаченный вход",
  "overview.billedInputSub": "мимо кэша {uncached} · из кэша {cached}",
  "overview.cacheHit": "Попадания в кэш",
  "overview.cacheHitSub": "прочитано {read} из {total} ток",
  "overview.context": "Контекст занят",
  "overview.contextSub": "{used} из {window} ток",
  "overview.contextUnknown": "Размер окна модели неизвестен",
  "overview.output": "Выход",
  "overview.outputSub": "всего {total} ток",
  "scope.aria": "Охват статистики",
  "scope.session": "Эта сессия",
  "scope.sessions": "Все сессии",
  "sessions.currentTag": "Текущая",
  "sessions.detail.noData": "Данные по этой сессии загружаются или их нет",
  "sessions.detail.title": "Подробности сессии",
  "sessions.empty": "Расход по сессиям не записан",
  "sessions.inactive": "Простаивает",
  "sessions.running": "Работает",
  "sessions.selectHint": "Выберите строку, чтобы посмотреть сессию",
  "sessions.subagentTag": "Субагент",
  "sessions.summary.input": "Оплаченный вход, всего",
  "sessions.summary.output": "Выход, всего",
  "sessions.summary.sessions": "Сессий с расходом",
  "sessions.summary.sessionsValue": "{count}",
  "sessions.summary.totalValue": "всего сессий: {count}",
  "sessions.summary.turns": "Ходов всего",
  "sessions.summary.turnsValue": "{turns}",
  "sessions.table.cacheHit": "Попаданий в кэш",
  "sessions.table.input": "Оплаченный вход",
  "sessions.table.output": "Выход",
  "sessions.table.session": "Сессия",
  "sessions.table.status": "Состояние",
  "sessions.table.turns": "Ходы",
  "sessions.table.updated": "Изменена",
  "steps.cacheRead": "Кэш Ч",
  "steps.cacheWrite": "Кэш З",
  "steps.caption": "Только загруженное окно, новые сверху; итог считает то же окно",
  "steps.done": "Готово",
  "steps.empty": "В загруженном окне шагов нет",
  "steps.input": "Вход",
  "steps.interrupted": "Прервано",
  "steps.model": "Модель",
  "steps.output": "Выход",
  "steps.reasoning": "Рассуждения",
  "steps.sortBy": "Сортировать по «{column}»",
  "steps.status": "Состояние",
  "steps.title": "Подробности по шагам",
  "steps.tps": "ток/с",
  "steps.ttft": "Первый токен",
  "steps.turn": "Ход.шаг",
  "steps.windowTotal": "Итог по окну",
  "time.daysAgo": "{n} дн назад",
  "time.hoursAgo": "{n} ч назад",
  "time.justNow": "только что",
  "time.minutesAgo": "{n} мин назад",
  "view.usage": "Статистика"
 },
 "workflowRun": {
  "member.empty": "Пустое имя участника",
  "member.open": "Открыть {name}",
  "phase.empty": "Пустое имя фазы",
  "phase.unassigned": "Вне фаз",
  "run.empty": "Ни один участник не запущен",
  "run.members.few": "{count} участника",
  "run.members.many": "{count} участников",
  "run.members.one": "{count} участник",
  "run.members.other": "{count} участников",
  "run.title": "{name}",
  "status.cancelled": "Отменено",
  "status.completed": "Завершено",
  "status.failed": "Ошибка",
  "status.interrupted": "Прервано",
  "status.running": "Работает",
  "statusCount.cancelled": "Отменено: {count}",
  "statusCount.completed": "Завершено: {count}",
  "statusCount.failed": "Ошибок: {count}",
  "statusCount.interrupted": "Прервано: {count}",
  "statusCount.running": "Работает: {count}"
 },
 "workspace": {
  "actions.newSession.aria": "Новая сессия в {name}",
  "actions.session.aria": "Действия с сессией {name}",
  "actions.workspace.aria": "Действия с рабочей папкой {name}",
  "conflict.named": "Рабочая папка «{name}» уже есть.",
  "date.ymd": "{d}.{m}.{y}",
  "delete.desc": "Уберёт «{name}» из списка рабочих папок. Сама папка и журналы сессий останутся, а её сессии переедут в «Без папки».",
  "delete.pending": "Удаление рабочей папки…",
  "delete.workspace": "Удалить рабочую папку",
  "empty.noMatches": "Ничего не найдено",
  "empty.none": "Сессий пока нет",
  "field.sessionName": "Название сессии",
  "field.workspaceName": "Название рабочей папки",
  "folderError.retry": "Выбрать снова",
  "folderError.title": "Не удалось открыть папку",
  "group.ungrouped": "Без папки",
  "groupBy.flat": "Одним списком",
  "groupBy.label": "Группировать",
  "groupBy.workspace": "По рабочим папкам",
  "hover.copied": "Скопировано",
  "hover.created": "Создано {time}",
  "menu.addWorkspace": "Добавить рабочую папку…",
  "menu.archiveSession": "Убрать сессию в архив",
  "menu.fork": "Ответвить сессию",
  "orderBy.label": "Сортировать",
  "orderBy.manual": "Вручную",
  "orderBy.updated": "По изменению",
  "picker.loading": "Загрузка рабочих папок…",
  "rename": "Переименовать",
  "rename.session.title": "Переименовать сессию",
  "rename.workspace.title": "Переименовать рабочую папку",
  "search.clear": "Очистить поиск",
  "search.hasMore": "Показаны первые {n} результатов. Уточните запрос.",
  "search.hasMore.few": "Показаны первые {n} результата. Уточните запрос.",
  "search.hasMore.one": "Найден один подходящий результат.",
  "search.noMatches": "Подходящих сессий нет",
  "search.pending": "Поиск по истории сессий…",
  "search.placeholder": "Поиск по сессиям...",
  "search.results.aria": "Результаты поиска",
  "search.sessions.aria": "Поиск сессий",
  "search.unavailable": "Поиск по содержимому временно недоступен. Показаны совпадения по названию.",
  "section.sessions": "Сессии",
  "section.workspaces": "Рабочие папки",
  "session.new": "Новая сессия",
  "sessions.collapse": "Показать меньше",
  "sessions.count.few": "{n} сессии",
  "sessions.count.many": "{n} сессий",
  "sessions.count.one": "{n} сессия",
  "sessions.count.other": "{n} сессий",
  "sessions.expand": "Показать ещё {n}",
  "status.completed": "Завершено",
  "status.idle": "Простаивает",
  "status.planReview": "План ждёт проверки",
  "status.running": "Работает",
  "status.subagentsRunning.few": "{n} субагента работает",
  "status.subagentsRunning.many": "{n} субагентов работает",
  "status.subagentsRunning.one": "{n} субагент работает",
  "status.subagentsRunning.other": "{n} субагентов работает",
  "status.waitingAnswer": "Ждёт ответа",
  "status.waitingApproval": "Ждёт подтверждения",
  "time.ago": "{t} назад",
  "time.days": "{n} дн",
  "time.hours": "{n} ч",
  "time.minutes": "{n} мин",
  "time.months": "{n} мес",
  "time.now": "только что",
  "time.years": "{n} г",
  "viewOptions.label": "Параметры отображения",
  "workspace.add": "Добавить рабочую папку"
 }
}

    const SETTINGS_NS_NAME = 'russian-lang'

    function apply(ctx) {
      const runtime = ctx.locale
      const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS_NAME })

      // 1. Словари: каждый namespace — свой эффект, словарь снимается вместе с
      // плагином. Если namespace уже несёт ru (плагин локализовался сам) —
      // не конфликтуем.
      for (const ns of Object.keys(RU)) {
        ctx.effect(() => {
          try { return ctx.locale.register(ns, 'ru', RU[ns]) }
          catch (err) { return () => {} }
        }, 'dsh-russian-lang: ' + ns)
      }

      // 1b. Пользовательские переопределения + плюрализация.
      // Overrides: пользовательский слой поверх словарей (russian-lang.overrides).
      // Plural: ядро выбирает .one/.other по n===1, русскому нужны few/many.
      const pluralRules = new Intl.PluralRules('ru-RU')
      const origTranslate = runtime.translate.bind(runtime)
      const getOverrides = () => {
        try {
          const value = scope.getSnapshot().value
          return value && value.overrides ? value.overrides : {}
        } catch (err) { return {} }
      }
      const fill = (template, params) => template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match)
      runtime.translate = function (ns, key, params) {
        // 1. Пользовательский override — самый верхний слой.
        const overrides = getOverrides()
        if (overrides[key] !== undefined) {
          return params ? fill(overrides[key], params) : overrides[key]
        }
        // 2. Плюрализация для русского.
        if (runtime.getLocale().active === 'ru' && params) {
          const n = params.n ?? params.count
          if (typeof n === 'number') {
            const form = pluralRules.select(n)
            const m = /^(.*)[.](one|other)$/.exec(key)
            if (m) {
              // Ядро выбирает .one/.other по n===1; русскому нужны few/many.
              if (form === 'few' || form === 'many') {
                const pluralKey = m[1] + '.' + form
                const template = this.lookup(ns, pluralKey) ?? this.lookup('common', pluralKey)
                if (template !== undefined) {
                  return fill(template, params)
                }
              }
            } else if (form !== 'other' && !/[.](one|other|few|many)$/.test(key)) {
              // Счётный ключ без суффикса: t('X', {n}). Если словарь даёт формы
              // X.one / X.few / X.many - берём подходящую, иначе как раньше.
              const pluralKey = key + '.' + form
              const template = this.lookup(ns, pluralKey) ?? this.lookup('common', pluralKey)
              if (template !== undefined) {
                return fill(template, params)
              }
            }
          }
        }
        return origTranslate(ns, key, params)
      }

      // 2. <html lang>: в таблице DOCUMENT_LANGUAGE ядра нет "ru", без нас там
      // окажется undefined после переключения.
      const syncLang = () => {
        try {
          if (typeof document !== 'undefined' && document.documentElement
              && runtime.getLocale().active === 'ru') {
            document.documentElement.lang = 'ru-RU'
          }
        } catch (err) { /* ignore */ }
      }

      const native = runtime.getLocale().locales.some((l) => l.id === 'ru')

      if (!native) {
        // Ядро не знает ru: добавляем его в snapshot runtime. Родная строка
        // Language берёт меню из snapshot.locales, setLocale() по нему же
        // валидирует выбор — «Русский» появляется в родном списке.
        const s0 = runtime.getLocale()
        runtime.snapshot = Object.freeze({
          active: s0.active,
          locales: s0.locales.concat([{ id: 'ru', label: 'Русский' }]),
          revision: s0.revision + 1
        })
        ctx.emit('locale/change', runtime.snapshot)
        syncLang()

        // Хост-схема namespace "locale" знает только zh/en, запись preference
        // "ru" он отклонит. Перехватываем её: выбор сохраняется нашим флагом
        // russian-lang.enabled, остальные языки пишутся штатно.
        //
        // Кроме того, adopt() в ядре при каждом обновлении настроек возвращает
        // активный язык к сохранённому preference (или языку браузера): он
        // читает scope через getSnapshot. Пока активен русский, докладываем в
        // снимок preference "ru", иначе любой settings-запись вернёт en.
        const realHost = runtime.host
        if (realHost) {
          const origGetSnapshot = realHost.getSnapshot.bind(realHost)
          const patchedGetSnapshot = () => {
            const s = origGetSnapshot()
            try {
              if (runtime.getLocale().active === 'ru') {
                return Object.assign({}, s, {
                  value: Object.assign({}, s && s.value ? s.value : {}, { preference: 'ru' })
                })
              }
            } catch (err) { /* ignore */ }
            return s
          }
          realHost.getSnapshot = patchedGetSnapshot
          runtime.host = {
            getSnapshot: patchedGetSnapshot,
            subscribe: (fn) => realHost.subscribe(fn),
            set: (field, value) => {
              if (field === 'preference' && value === 'ru') return Promise.resolve()
              return realHost.set(field, value)
            },
            unset: (field) => realHost.unset ? realHost.unset(field) : Promise.resolve()
          }
        }
      }

      // 3. Флаг russianLang.enabled всегда повторяет активный язык: выбор
      // английского или китайского в родном меню выключает русский и наоборот.
      const syncFlag = () => {
        try {
          const wantRu = runtime.getLocale().active === 'ru'
          const value = scope.getSnapshot().value || {}
          if (!!value.enabled !== wantRu) scope.set('enabled', wantRu)
        } catch (err) { /* снимок ещё не готов */ }
      }
      ctx.effect(() => {
        try { return runtime.subscribe(syncFlag) }
        catch (err) { return undefined }
      }, 'dsh-russian-lang: sync-flag')

      // 4. Старт: сохранённый флаг включает русский.
      const activate = () => {
        try {
          if (runtime.getLocale().active === 'ru') return
          if (native) runtime.setLocale('ru')
          else runtime.publish('ru', true)
        } catch (err) { console.warn('dsh-russian-lang: activate failed', err) }
      }
      let booted = false
      const tryBoot = () => {
        if (booted) return
        try {
          const value = scope.getSnapshot().value
          if (value && value.enabled === true) { booted = true; activate() }
        } catch (err) { /* ignore */ }
      }
      ctx.effect(() => scope.subscribe(tryBoot), 'dsh-russian-lang: boot')
      tryBoot()

      // Подписчик регистрируется синхронно, до первого publish() в tryBoot
      // ниже - иначе ctx.effect откладывает выполнение, и boot-publish
      // происходит до того, как syncLang слушатель зарегистрирован.
      const unsubscribeLang = runtime.subscribe(syncLang)
      ctx.effect(() => unsubscribeLang, 'dsh-russian-lang: html-lang')
      syncLang()

      // 5. Орфография (russian-lang.spellcheck): при активном русском включаем
      // браузерный спелчек на текстовых полях. Код-редакторы и поля команд не
      // трогаем - отличаем их по моноширинному шрифту. Исходные значения
      // сохраняем в data-атрибутах и возвращаем при уходе с русского.
      const SPELL_ON = 'data-russian-lang-spell-on'
      const SPELL_WAS = 'data-russian-lang-spell-was'
      const LANG_WAS = 'data-russian-lang-lang-was'
      const EDITABLE = 'textarea, input[type=text], input[type=search], [contenteditable=""], [contenteditable="true"]'
      const MONO_RE = /mono|consol|courier/i
      const isMonoField = (el) => {
        try { return MONO_RE.test(getComputedStyle(el).fontFamily || '') }
        catch (err) { return false }
      }
      const spellOn = (el) => {
        if (el.hasAttribute(SPELL_ON) || isMonoField(el)) return
        el.setAttribute(SPELL_ON, '1')
        el.setAttribute(SPELL_WAS, el.getAttribute('spellcheck') ?? '')
        el.setAttribute(LANG_WAS, el.getAttribute('lang') ?? '')
        el.setAttribute('spellcheck', 'true')
        el.setAttribute('lang', 'ru-RU')
      }
      const spellOff = (el) => {
        if (!el.hasAttribute(SPELL_ON)) return
        const was = el.getAttribute(SPELL_WAS)
        if (was === '') el.removeAttribute('spellcheck')
        else el.setAttribute('spellcheck', was)
        const lang = el.getAttribute(LANG_WAS)
        if (lang === '') el.removeAttribute('lang')
        else el.setAttribute('lang', lang)
        el.removeAttribute(SPELL_ON)
        el.removeAttribute(SPELL_WAS)
        el.removeAttribute(LANG_WAS)
      }
      let spellObserver = null
      const syncSpell = () => {
        try {
          if (typeof document === 'undefined') return
          const ru = runtime.getLocale().active === 'ru'
          if (!ru) {
            if (spellObserver) { spellObserver.disconnect(); spellObserver = null }
            document.querySelectorAll('[' + SPELL_ON + ']').forEach(spellOff)
            return
          }
          document.querySelectorAll(EDITABLE).forEach(spellOn)
          if (spellObserver) return
          // ponytail: реагируем только на добавленные узлы; полям, сменившим
          // шрифт на месте, поможет следующая перезагрузка страницы.
          spellObserver = new MutationObserver((records) => {
            for (const record of records) {
              for (const node of record.addedNodes) {
                if (node.nodeType !== 1) continue
                if (node.matches(EDITABLE)) spellOn(node)
                node.querySelectorAll ? node.querySelectorAll(EDITABLE).forEach(spellOn) : null
              }
            }
          })
          spellObserver.observe(document.body, { childList: true, subtree: true })
        } catch (err) { /* ignore */ }
      }
      const unsubscribeSpell = runtime.subscribe(syncSpell)
      ctx.effect(() => {
        unsubscribeSpell()
        if (spellObserver) spellObserver.disconnect()
        try { document.querySelectorAll('[' + SPELL_ON + ']').forEach(spellOff) } catch (err) { /* ignore */ }
      }, 'dsh-russian-lang: spellcheck')
      syncSpell()

      // 6. Типографика (russian-lang.typography { enabled, yo }): постпроцессор
      // текстовых узлов при активном русском - ёлочки, тире, неразрывные
      // пробелы перед короткими словами, опционально ё (безопасный список).
      // Код, ссылки, кнопки и поля ввода не трогаем. Правила идемпотентны,
      // повторный проход по своим же правкам ничего не меняет.
      const TYPO_SKIP = new Set(['CODE', 'PRE', 'A', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'KBD', 'SAMP', 'BUTTON'])
      const typoQuotes = (text) => text.replace(/"([^"\n]{1,200})"/g, '\u00AB$1\u00BB')
      const typoDash = (text) => text
        .replace(/(^|[\s(\[\u00AB])--(?=\s|$)/g, '$1\u2014')
        .replace(/(^|[\s(\[\u00AB])-(?=\s)/g, '$1\u2014')
      const TYPO_SHORT = new Set(['в', 'с', 'к', 'о', 'у', 'а', 'и', 'но', 'не', 'ни', 'на', 'по', 'до', 'из', 'за', 'от', 'об'])
      const typoNbsp = (text) => text.replace(/(^|[\s(\[\u00AB])([а-яё]{1,2})(\s+)/g, (match, lead, word) => (
        TYPO_SHORT.has(word) ? lead + word + '\u00A0' : match
      ))
      const TYPO_YO = [
        [/еще/g, 'ещё'], [/Еще/g, 'Ещё'], [/ЕЩЕ/g, 'ЕЩЁ'],
        [/\bее\b/g, 'её'], [/\bЕе\b/g, 'Её'],
        [/\bчерный\b/g, 'чёрный'], [/\bчерная\b/g, 'чёрная'], [/\bчерные\b/g, 'чёрные'],
        [/\bзеленый\b/g, 'зелёный'], [/\bжелтый\b/g, 'жёлтый'],
        [/\bлегкий\b/g, 'лёгкий'], [/\bтяжелый\b/g, 'тяжёлый'],
        [/\bнадежный\b/g, 'надёжный'], [/\bдешевый\b/g, 'дешёвый'],
        [/\bидет\b/g, 'идёт'], [/\bдает\b/g, 'даёт'], [/\bберет\b/g, 'берёт'],
        [/\bведет\b/g, 'ведёт'], [/\bнесет\b/g, 'несёт'], [/\bживет\b/g, 'живёт'],
        [/\bпривел\b/g, 'привёл'], [/\bшел\b/g, 'шёл']
      ]
      const typoYo = (text) => {
        for (const pair of TYPO_YO) text = text.replace(pair[0], pair[1])
        return text
      }
      const getTypoConf = () => {
        try {
          const t = scope.getSnapshot().value && scope.getSnapshot().value.typography
          if (!t || t.enabled === false) return null
          return { yo: t.yo === true }
        } catch (err) { return null }
      }
      const typoNode = (node, conf) => {
        const before = node.nodeValue
        if (!before || !before.match || (before.match(/[\u0400-\u04FF]/g) || []).length < 3) return
        if (node.parentElement && node.parentElement.closest('code, pre, a, script, style, textarea, input, select, button, kbd, samp')) return
        let after = typoQuotes(before)
        after = typoDash(after)
        after = typoNbsp(after)
        if (conf.yo) after = typoYo(after)
        if (after !== before) node.nodeValue = after
      }
      const typoWalk = (root, conf) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
        for (let node = walker.nextNode(); node; node = walker.nextNode()) typoNode(node, conf)
      }
      let typoObserver = null
      let typoQueued = null
      const flushTypo = () => {
        typoQueued = null
        try {
          const conf = getTypoConf()
          if (!conf || !typoPending.size) return
          for (const root of typoPending) {
            if (root.nodeType === 3) typoNode(root, conf)
            else typoWalk(root, conf)
          }
          typoPending.clear()
        } catch (err) { /* ignore */ }
      }
      const typoPending = new Set()
      const queueTypo = (roots) => {
        for (const r of roots) typoPending.add(r)
        if (!typoQueued) typoQueued = requestAnimationFrame(flushTypo)
      }
      const syncTypo = () => {
        try {
          if (typeof document === 'undefined') return
          if (runtime.getLocale().active !== 'ru' || !getTypoConf()) {
            if (typoObserver) { typoObserver.disconnect(); typoObserver = null }
            return
          }
          if (typoObserver) return
          typoWalk(document.body, getTypoConf())
          typoObserver = new MutationObserver((records) => {
            const roots = []
            for (const record of records) roots.push(record.nodeType ? record.target : record)
            queueTypo(roots)
          })
          typoObserver.observe(document.body, { childList: true, characterData: true, subtree: true })
        } catch (err) { /* ignore */ }
      }
      const unsubscribeTypo = runtime.subscribe(syncTypo)
      ctx.effect(() => {
        unsubscribeTypo()
        if (typoObserver) typoObserver.disconnect()
      }, 'dsh-russian-lang: typography')
      syncTypo()

      // 7. Фикс раскладки (russian-lang.layout): подсказка-конвертер.
      // Пользователь печатает в неверной раскладке (yjdsq gjvfu -> новый вопрос).
      // Показываем плашку с превью, клик заменяет текст; тихой замены нет.
      const LAYOUT_LAT_TO_CYR = {
        'q':'й','w':'ц','e':'у','r':'к','t':'е','y':'н','u':'г','i':'ш','o':'щ','p':'з','[':'х',']':'ъ',
        'a':'ф','s':'ы','d':'в','f':'а','g':'п','h':'р','j':'о','k':'л','l':'д',';':'ж','\'':'э',
        'z':'я','x':'ч','c':'с','v':'м','b':'и','n':'т','m':'ь',',':'б','.':'ю','/':'.',
        '`':'ё'
      }
      const LAYOUT_CYR_TO_LAT = {}
      for (const k in LAYOUT_LAT_TO_CYR) LAYOUT_CYR_TO_LAT[LAYOUT_LAT_TO_CYR[k]] = k
      const FREQ = new Set(["не", "что", "ты", "это", "на", "он", "мы", "как", "вы", "да", "мне", "нет", "меня", "так", "но", "его", "все", "она", "тебя", "если", "за", "бы", "тебе", "они", "чтобы", "же", "есть", "просто", "из", "для", "ну", "когда", "хорошо", "здесь", "по", "был", "знаю", "то", "только", "всё", "было", "вас", "может", "нас", "вот", "от", "быть", "кто", "будет", "почему", "вам", "их", "очень", "могу", "уже", "спасибо", "или", "нам", "еще", "там", "нужно", "сейчас", "где", "чем", "хочу", "ничего", "этого", "была", "мой", "ее", "ладно", "знаешь", "до", "этом", "потому", "теперь", "думаю", "больше", "её", "со", "раз", "ему", "надо", "время", "этот", "ли", "ещё", "пока", "даже", "привет", "сказал", "себя", "должен", "тоже", "хочешь", "давай", "никогда", "эй", "того", "тогда", "него", "ни", "тут", "были", "конечно", "правда", "об", "моя", "пожалуйста", "тобой", "сказать", "сегодня", "один", "лучше", "можешь", "сюда", "мной", "значит", "сделать", "всегда", "дело", "можно", "ей", "должны", "порядке", "без", "день", "том", "буду", "делать", "хотел", "чего", "эти", "много", "после", "этим", "всего", "во", "твой", "ним", "лет", "боже", "них", "сэр", "ведь", "мистер", "жизнь", "потом", "ней", "такой", "который", "всех", "через", "им", "возможно", "немного", "такое", "слишком", "себе", "зачем", "должна", "моей", "люди", "знаете", "этой", "думаешь", "свою", "точно", "человек", "твоя", "под", "сказала", "назад", "эту", "можем", "случилось", "мама", "мог", "вместе", "отец", "сделал", "мои", "кажется", "друг", "куда", "никто", "поэтому", "эта", "которые", "два", "тот", "сколько", "понимаю", "снова", "жизни", "нравится", "людей", "помочь", "видел", "люблю", "хочет", "место", "знать", "прости", "отлично", "похоже", "парень", "домой", "всем", "деньги", "иди", "времени", "дома", "именно", "доктор", "думал", "говорил", "делаешь", "будем", "прямо", "стоит", "поговорить", "найти", "разве", "слушай", "своей", "лишь", "ага", "можете", "простите", "хотела", "сам", "тем", "будешь", "прошу", "три", "деле", "хотите", "говорить", "давайте", "совсем", "знал", "знает", "какой", "моего", "скажи", "дом", "дела", "вами", "свои", "говорит", "несколько", "должно", "про", "ваш", "происходит", "жаль", "туда", "действительно", "папа", "завтра", "оно", "черт", "одна", "перед", "наш", "уверен", "отсюда", "нужна", "самом", "тех", "нужен", "свой", "мою", "кого", "верно", "работу", "каждый", "твоей", "будут", "хватит", "понял", "нее", "уж", "имя", "против", "пор", "чём", "раньше", "говорю", "более", "надеюсь", "итак", "при", "ваша", "вообще", "пошли", "мать", "нельзя", "наверное", "нами", "твои", "могли", "дай", "ради", "всю", "ребята", "ко", "хотя", "понимаешь", "идти", "этих", "откуда", "такая", "ясно", "другой", "извините", "вижу", "видеть", "над", "могут", "равно", "мисс", "скоро", "будто", "зовут", "виду", "наши", "думала", "послушай", "между", "своего", "вопрос", "этому", "почти", "года", "человека", "которая", "подожди", "руки", "нормально", "такие", "возьми", "минут", "извини", "вещи", "могла", "смотри", "хоть", "работа", "пару", "сын", "ваше", "дня", "пора", "неё", "жить", "видишь", "достаточно", "господи", "быстро", "твою", "весь", "убить", "ночь", "говоришь", "собой", "скажу", "готов", "слышал", "какая", "посмотри", "первый", "самое", "видела", "пусть", "месте", "нашли", "сказали", "плохо", "смогу", "ваши", "отца", "детей", "знаем", "рад", "прав", "никаких", "имею", "миссис", "иногда", "смерти", "своих", "пойду", "брат", "вроде", "рядом", "мир", "произошло", "которую", "сделала", "говорила", "знала", "мое", "одного", "таким", "помощь", "такого", "кем", "насчет", "вчера", "случае", "увидеть", "нашей", "говорят", "правильно", "убил", "одно", "пойти", "друга", "сама", "долго", "работать", "дверь", "делает", "женщина", "важно", "кроме", "будь", "собираюсь", "вашей", "нужны", "здорово", "номер", "проблема", "проблемы", "денег", "чёрт", "хороший", "твоего", "одну", "дальше", "вернуться", "давно", "последний", "ночи", "узнать", "уверена", "машину", "права", "пять", "моих", "также", "тому", "вечером", "дети", "опять", "серьезно", "работает", "своим", "сначала", "две", "одной", "моим", "те", "жена", "думаете", "помнишь", "глаза", "ними", "чувак", "ночью", "чувствую", "взять", "сразу", "утром", "часть", "придется", "стать", "идея", "дорогая", "прекрасно", "слова", "сделали", "видели", "наша", "сердце", "помню", "парня", "момент", "утро", "здравствуйте", "стал", "скорее", "ох", "большой", "часов", "год", "друзья", "сильно", "говори", "смысле", "которой", "уйти", "которого", "капитан", "работы", "любовь", "дочь", "новый", "боюсь", "имеет", "стой", "дней", "той", "голову", "ах", "столько", "понятно", "дать", "девушка", "довольно", "доме", "вечер", "оба", "пойдем", "увидимся", "шанс", "хорошая", "прежде", "сделаю", "какого", "быстрее", "понять", "рассказать", "вашего", "бог", "интересно", "затем", "умер", "обо", "никого", "парни", "самый", "твое", "вон", "пришел", "чтоб", "поверить", "слово", "будете", "нашел", "милая", "странно", "какие", "ой", "та", "однажды", "сможешь", "получить", "обычно", "ума", "полагаю", "алло", "посмотреть", "иначе", "наших", "тело", "хотели", "свое", "пришли", "моё", "другие", "выглядит", "подумал", "лицо", "приятно", "мам", "говорите", "обратно", "нашего", "телефон", "мире", "честь", "господин", "доброе", "план", "другом", "час", "джон", "пути", "делал", "типа", "посмотрим", "насколько", "пытался", "правду", "решил", "поздно", "нем", "работе", "любит", "хотят", "кому", "сестра", "места", "скажешь", "следующий", "других", "получил", "кстати", "говорили", "пришла", "безопасности", "рада", "город", "внимание", "кофе", "которое", "вся", "семья", "конец", "позже", "дал", "думать", "спать", "вернулся", "остаться", "некоторые", "кровь", "оружие", "пришлось", "хуже", "дорогой", "полиция", "сможем", "понимаете", "четыре", "которых", "ужасно", "ждать", "способ", "делаю", "готовы", "совершенно", "смотреть", "вернусь", "большое", "единственный", "вперед", "часа", "муж", "идет", "таких", "ребенка", "машина", "стороны", "смог", "сына", "играть", "сами", "верю", "честно", "нашла", "звучит", "угодно", "руку", "начала", "перевод", "какое", "взял", "станет", "пытаюсь", "внутри", "знали", "новости", "добрый", "подождите", "скажите", "ребенок", "вашу", "мальчик", "осталось", "делаете", "году", "мере", "поняла", "отношения", "далеко", "вокруг", "хотим", "слышала", "двух", "приятель", "никому", "мужчина", "неделю", "вернуть", "смерть", "сих", "ту", "сможет", "дайте", "двое", "видите", "долларов", "крови", "решение", "путь", "следует", "неужели", "около", "готова", "семьи", "идем", "смотрите", "круто", "история", "вдруг", "спросить", "твоих", "второй", "вина", "джек", "женщины", "нашу", "заткнись", "минуту", "собираешься", "твоим", "шоу", "прощения", "больно", "машины", "пап", "трудно", "постоянно", "поможет", "проблем", "например", "дерьмо", "полиции", "начать", "знают", "лучший", "добро", "спасти", "рождения", "оставить", "чарли", "любишь", "конце", "забыл", "месяцев", "часто", "мило", "комнате", "нему", "матери", "милый", "полностью", "школе", "леди", "серьёзно", "убили", "случай", "джо", "убийство", "послушайте", "посмотрите", "пошел", "никакого", "сделаем", "говоря", "неплохо", "использовать", "прошлой", "иду", "узнал", "прекрати", "чуть", "держи", "невозможно", "господа", "слушайте", "наше", "машине", "сэм", "свет", "образом", "иметь", "другое", "другого", "шесть", "людям", "погоди", "имени", "детка", "недели", "меньше", "легко", "крайней", "девочка", "придётся", "мало", "ненавижу", "последние", "насчёт", "выглядишь", "сообщение", "думает", "друзей", "обещаю", "агент", "вместо", "последнее", "самого", "настолько", "ответ", "детектив", "понятия", "родители", "показать", "поехали", "стало", "мэм", "своими", "всей", "очевидно", "помогите", "маленький", "школу", "пожаловать", "твоё", "либо", "забрать", "прошло", "особенно", "имеешь", "истории", "эм", "вопросы", "большая", "минутку", "пол", "остановить", "чему", "свидания", "обязательно", "городе", "убийца", "сделай", "ваших", "любви", "спокойной", "своё", "мадам", "идите", "выйти", "делают", "немедленно", "делай", "возможность", "человеком", "бывает", "ужин", "моем", "купить", "позвонить", "наконец", "стала", "любой", "клянусь", "смешно", "абсолютно", "всему", "переводчики", "забудь", "секунду", "выбор", "тысяч", "потерял", "майкл", "волнуйся", "ноги", "таком", "настоящий", "означает", "встретиться", "известно", "работаю", "замечательно", "любом", "оставь", "связи", "боль", "выпить", "представить", "убийства", "малыш", "умерла", "воды", "окей", "речь", "хорошие", "поводу", "перестань", "увидел", "повезло", "президент", "мужик", "которым", "прошлом", "дам", "десять", "умереть", "поговорим", "отцом", "искать", "тихо", "оставил", "пистолет", "начал", "сложно", "города", "неделе", "хотелось", "принять", "историю", "босс", "держать", "пойдём", "подумала", "фильм", "слышишь", "рано", "удачи", "еду", "словно", "причина", "пришёл", "компании", "спокойно", "работал", "подумать", "вести", "вещь", "брата", "конца", "получится", "блин", "право", "ввиду", "бога", "подарок", "комнату", "мира", "успокойся", "позволить", "моему", "идёт", "самая", "рассказал", "курсе", "намного", "мистера", "женщин", "тяжело", "ух", "предложение", "одним", "счет", "улице", "другим", "уходи", "майк", "среди", "помоги", "получилось", "месяц", "проверить", "генри", "голос", "позвольте", "стороне", "вероятно", "случится", "уверены", "мужа", "питер", "провести", "людьми", "неважно", "нашёл", "доктора", "месяца", "игра", "идём", "нём", "джордж", "познакомиться", "возьму", "слышали", "пошла", "корабль", "чувствуешь", "позволь", "сторону", "игры", "согласен", "письмо", "вниз", "молодец", "наверняка", "утра", "вашим", "нечего", "встречи", "вид", "никакой", "связь", "список", "такую", "весело", "сидеть", "гораздо", "собирался", "впервые", "находится", "объяснить", "полицию", "решили", "семью", "свидание", "отличная", "остальные", "прийти", "руках", "фбр", "чувство", "котором", "решила", "понадобится", "сынок", "найду", "фрэнк", "школы", "чувства", "дядя", "стали", "ушла", "первым", "поверь", "расскажи", "хочется", "девушки", "сон", "имел", "каким", "парнем", "многие", "части", "ехать", "считаю", "никуда", "голове", "старый", "оттуда", "называется", "вопросов", "фото", "пройти", "заниматься", "другу", "вернулась", "пара", "никак", "девочки", "благодарю", "своем", "недавно", "приехал", "глаз", "могло", "становится", "пыталась", "является", "брось", "богу", "нашим", "помощи", "волосы", "невероятно", "одном", "ушел", "джейн", "тела", "недель", "собирается", "защитить", "всеми", "существует", "жив", "первая", "позвоню", "благодаря", "вперёд", "навсегда", "помните", "земле", "делу", "вполне", "пытается", "будущее", "семь", "своему", "ок", "идиот", "слава", "стоило", "удалось", "делаем", "команда", "главное", "огонь", "дэнни", "замуж", "начали", "мужчины", "силы", "семье", "шеф", "суд", "слышу", "тюрьме", "попробовать", "друзьями", "алекс", "вашем", "новая", "маленькая", "черта", "придет", "страшно", "услышать", "новые", "общем", "звонил", "купил", "понравится", "близко", "самой", "смысл", "хорошее", "любил", "сара", "единственная", "делали", "макс", "мэри", "жду", "получается", "хорошего", "эми", "дамы", "жену", "гарри", "неправильно", "стоять", "плевать", "ключ", "верить", "лично", "слышать", "взяли", "поздравляю", "пить", "заставить", "получили", "рот", "делала", "преступления", "двери", "землю", "разумеется", "очередь", "первой", "разговор", "видимо", "звонок", "джеймс", "менее", "нового", "получила", "хм", "подальше", "сможете", "похож", "состоянии", "необходимо", "адвокат", "касается", "секунд", "стоп", "дали", "оставаться", "сделает", "ходить", "помощью", "хватает", "изменить", "король", "народ", "новую", "девушку", "живет", "секс", "сделаешь", "думали", "нашем", "попасть", "каждого", "другую", "просил", "пошёл", "войны", "случайно", "игру", "мертв", "держись", "забыла", "цель", "минуты", "месье", "выше", "однако", "женщину", "раза", "мысли", "выход", "платье", "вовсе", "пришло", "женой", "ребёнка", "сожалею", "твоем", "осторожно", "смогла", "этими", "стану", "маме", "парней", "нравятся", "покое", "поехать", "садись", "миллионов", "отличный", "ребёнок", "дочери", "дороги", "ого", "ха", "нечто", "первое", "выяснить", "ник", "информацию", "офис", "записи", "лучшее", "течение", "вечеринку", "убью", "годы", "забыть", "правила", "сожалению", "слов", "джимми", "дни", "дала", "жизнью", "совет", "занят", "попробуй", "подруга", "расскажу", "целый", "красивая", "попросил", "вышел", "удар", "вещей", "адрес", "дэвид", "оставьте", "сержант", "увидишь", "виноват", "разница", "открыть", "написал", "ждет", "новое", "счастлив", "вау", "выбора", "продолжай", "задницу", "покажу", "единственное", "доверять", "встреча", "убивать", "концов", "обоих", "будьте", "останется", "тюрьму", "наверно", "ищу", "момента", "обед", "лица", "видео", "стойте", "взяла", "подождать", "считает", "вечно", "покажи", "бен", "книгу", "многое", "земли", "дел", "какую", "поскольку", "узнала", "сильнее", "жены", "встречу", "весьма", "блядь", "поняли", "родителей", "оу", "лейтенант", "глупо", "узнает", "думают", "сезон", "снаружи", "голова", "мамой", "заняться", "кино", "вечера", "свете", "выйдет", "восемь", "найдем", "помогу", "больницу", "больнице", "магазин", "тони", "заметил", "договорились", "слушать", "бизнес", "примерно", "уехать", "мамы", "позвонил", "выходит", "маму", "документы", "попал", "шаг", "отпусти", "смотрю", "здравствуй", "понравилось", "смогли", "правы", "большие", "рассказала", "идут", "готово", "плохой", "офицер", "узнали", "скажет", "сюрприз", "внимания", "вышло", "дорогу", "считаешь", "фотографии", "вода", "делом", "каком", "полный", "следующей", "доказать", "захочешь", "книги", "война", "планы", "мысль", "веришь", "видно", "скажем", "большинство", "ребят", "продолжать", "ранее", "жертвы", "ближе", "качестве", "двигаться", "написано", "чувствовать", "хорош", "любить", "величество", "головы", "дороге", "попросить", "времена", "подумай", "забавно", "главный", "внизу", "каждую", "остался", "вставай", "мнение", "твоему", "часы", "вряд", "постой", "сомневаюсь", "отдай", "вечеринка", "ошибка", "приехали", "бросил", "вернется", "профессор", "любят", "ключи", "подходит", "беги", "ничто", "поле", "вышла", "открой", "воду", "сексом", "музыка", "побери", "бабушка", "собираемся", "несмотря", "госпожа", "стране", "рэй", "отдать", "трубку", "сил", "кончено", "другая", "комната", "ричард", "сердца", "опасности", "сша", "закончить", "детьми", "врач", "живу", "имеете", "команды", "пожалуй", "роль", "порядок", "группа", "встретимся", "кольцо", "самые", "позвони", "всём", "вверх", "разговаривать", "джим", "закон", "мужчин", "шутишь", "играет", "хорошим", "новой", "начнем", "ухожу", "член", "такси", "серия", "днк", "получше", "убила", "настоящая", "молодой", "эмили", "показания", "одному", "шутка", "уходить", "снять", "недостаточно", "каких", "кейт", "одни", "разобраться", "язык", "едем", "директор", "сто", "энди", "учитывая", "спросил", "днем", "первого", "джей", "наверху", "говорим", "счастлива", "помог", "отцу", "приходится", "определенно", "сигнал", "закончится", "помогает", "группы", "моём", "едва", "легче", "ответить", "спустя", "принести", "секрет", "приказ", "де", "опасно", "позволю", "билли", "бросить", "телефону", "самых", "эдди", "получишь", "господь", "внутрь", "компания", "прекрасный", "томми", "такими", "пойдет", "женщиной", "работаешь", "большую", "волнует", "рук", "память", "старик", "избавиться", "квартиру", "закончили", "информация", "встречаться", "удовольствием", "спас", "мозг", "читать", "ким", "чертовски", "стол", "джонни", "ублюдок", "дон", "тысячи", "боб", "ложь", "ёто", "потеряла", "взглянуть", "писать", "мен", "увидела", "передать", "войти", "везде", "бобби", "кое", "солнце", "устал", "сделку", "настоящее", "потеряли", "мм", "класс", "смотрел", "держите", "закончил", "марк", "джерри", "потрясающе", "обещал", "убедиться", "скажете", "факт", "уничтожить", "страны", "учитель", "полно", "начинается", "бежать", "операции", "сукин", "ошибку", "украл", "данные", "двоих", "света", "запах", "придурок", "найди", "лучшая", "вернулись", "убирайся", "боишься", "окно", "убийстве", "ситуации", "костюм", "казалось", "доказательства", "обсудить", "жил", "принимать", "море", "оставила", "судя", "штука", "ситуация", "возможности", "следы", "генерал", "рождество", "платить", "пытались", "забрал", "эрик", "самым", "великолепно", "песню", "билл", "помогать", "новость", "силу", "жертва", "баксов", "другими", "обожаю", "достать", "вовремя", "появился", "кларк", "тише", "одежду", "приходит", "расследование", "зато", "девушкой", "яйца", "зависит", "принадлежит", "согласно", "предложить", "уровень", "любила", "вашему", "собака", "знак", "чисто", "срочно", "начало", "вне", "клуб", "искал", "собираетесь", "души", "расслабься", "супер", "ждал", "неправда", "доступ", "куча", "туалет", "знакомы", "офисе", "сука", "слегка", "ждут", "песня", "наверх", "небольшой", "анна", "красиво", "запись", "причины", "работала", "состояние", "белый", "зайти", "дважды", "думай", "центр", "дружище", "исправить", "джейк", "использовал", "идешь", "желание", "книга", "многих", "разные", "полковник", "оказался", "идеи", "добраться", "нос", "возьмите", "матерью", "суда", "каково", "сила", "уходите", "рука", "повсюду", "лучшие", "сделано", "взгляд", "наркотики", "бери", "судья", "чушь", "плохая", "система", "практически", "выходные", "лили", "суде", "еда", "док", "узнаю", "нож", "написать", "собиралась", "чай", "глазах", "остальное", "брак", "представляешь", "остальных", "мимо", "поеду", "потерять", "старые", "звук", "частью", "приехала", "даст", "спит", "пытаешься", "выглядеть", "беременна", "увижу", "спал", "вкус", "крис", "поезд", "пиво", "уехал", "устроить", "радио", "обе", "команду", "безумие", "решить", "солдат", "ме", "мальчика", "короля", "проще", "особо", "ребенком", "дедушка", "мертва", "церкви", "результаты", "имена", "беспокойся", "неприятности", "камеры", "отправить", "брайан", "здание", "шон", "возле", "защищать", "плохие", "работают", "называть", "третий", "способен", "удивительно", "смысла", "долг", "боли", "клэр", "первую", "стыдно", "случиться", "сестры", "называют", "райан", "счёт", "слушаю", "мартин", "возвращаться", "выбрал", "черту", "инспектор", "земля", "оказалось", "сходить", "головой", "плюс", "оружия", "музыку", "явно", "сказано", "назвал", "стрелять", "своём", "столь", "ушли", "последняя", "лицом", "решать", "остались", "заплатить", "разу", "жене", "даю", "центре", "началось", "президента", "сообщить", "кучу", "звали", "принял", "придёт", "рода", "справиться", "поцелуй", "сбежал", "еды", "встречались", "прошла", "команде", "оставлю", "ищем", "согласна", "останусь", "тест", "прошлое", "смотришь", "код", "двумя", "шучу", "человеку", "выбраться", "следовало", "продать", "которому", "звонила", "поставить", "клиент", "здоровье", "прочь", "приду", "держу", "поговорю", "похожа", "рассказывать", "играл", "стив", "заставил", "встретил", "самолет", "кости", "сбежать", "прекратить", "уйду", "принесу", "власти", "ушёл", "остается", "постели", "вернись", "впереди", "захочет", "реально", "двадцать", "квартире", "маленькой", "важное", "ешь", "бар", "жива", "дает", "завтрак", "любовью", "зря", "полицейский", "принес", "мария", "страшного", "устала", "прекратите", "убери", "нравишься", "заходи", "энни", "сработает", "старая", "скучаю", "заявление", "плохого", "поймать", "ответственность", "прощай", "девять", "осталась", "наедине", "выбрать", "обвинения", "ммм", "компанию", "поедем", "цветы", "имела", "ждёт", "камеру", "новых", "преступление", "трех", "кусок", "пропал", "посмотрю", "медленно", "душу", "получит", "рады", "значения", "забрали", "пойдешь", "сохранить", "привести", "видит", "информации", "войну", "письма", "бумаги", "холодно", "руками", "томас", "упал", "моими", "отношение", "карл", "ма", "операция", "судьба", "любимый", "задать", "папочка", "внезапно", "временем", "представляю", "церковь", "решения", "чувствовал", "чудесно", "специально", "маленькие", "дурак", "ад", "мальчики", "начинает", "компьютер", "станешь", "продолжайте", "роберт", "урок", "кровью", "глазами", "занимается", "линии", "люк", "брать", "давать", "вновь", "трое", "девушек", "чё", "услышал", "вызвать", "работали", "позвонила", "бороться", "остановись", "вариант", "послал", "назвать", "просила", "ход", "положение", "вернемся", "уходим", "уилл", "связано", "каждой", "звонит", "роман", "миру", "беспокоит", "кэтрин", "номера", "комнаты", "прекрасная", "победить", "правительство", "ищет", "систему", "попросила", "операцию", "ногу", "поступил", "прошлый", "живёт", "герой", "воздух", "живут", "читал", "адвоката", "поступить", "поможешь", "адам", "люси", "чудо", "разных", "школа", "курс", "отель", "задание", "приехать", "умру", "телефона", "считать", "ценю", "мечты", "родился", "работой", "вспомнить", "виде", "похожи", "слышите", "уходит", "понимает", "угу", "кровати", "умоляю", "срок", "действовать", "мужем", "извиниться", "пахнет", "дух", "лучших", "отдел", "будущем", "большим", "беспокоиться", "узнаем", "интервью", "скотт", "сыном", "предлагаю", "убит", "болит", "каждое", "встретились", "итоге", "мяч", "закрой", "умею", "справлюсь", "убедить", "остановиться", "возвращайся", "цели", "форме", "сидит", "королева", "дождь", "отдал", "бывший", "едет", "танцевать", "пива", "причин", "обязан", "проклятье", "колледж", "мозга", "оставайся", "системы", "карты", "просить", "садитесь", "хорошей", "душ", "смогут", "камень", "волнуйтесь", "страну", "звонить", "проводить", "ура", "мёртв", "смотрит", "детям", "мужчиной", "труп", "вино", "армии", "убивал", "вкусно", "заставляет", "любое", "которыми", "твоём", "малышка", "эбби", "правило", "кровать", "кабинет", "чарльз", "баре", "действия", "ситуацию", "убрать", "жениться", "ходил", "джона", "исчез", "келли", "погиб", "зрения", "счастье", "желаю", "давление", "душе", "взгляни", "основном", "прошел", "душа", "свадьбу", "тюрьмы", "отдохнуть", "фунтов", "встать", "произойдет", "дженни", "миллион", "святого", "глубоко", "сзади", "святой", "подобного", "предложил", "пит", "значение", "отеле", "позади", "идеально", "занимаюсь", "занимался", "нескольких", "подобное", "мозги", "несчастный", "рассказывал", "считаете", "выходи", "полной", "свадьбы", "мамочка", "страх", "появится", "банк", "носить", "отпечатки", "ничем", "чак", "возрасте", "горжусь", "выиграл", "принесла", "встрече", "нибудь", "приходить", "следить", "лео", "ног", "лекарство", "лучшим", "тип", "умирает", "признать", "воспоминания", "имеют", "защиты", "билет", "выпьем", "работаем", "купила", "выиграть", "трогай", "магазине", "красный", "петь", "название", "вытащить", "сестру", "отвечать", "отпустите", "кевин", "контролировать", "чёрта", "власть", "вторая", "волноваться", "бросила", "спрашиваю", "секса", "данный", "красивый", "джентльмены", "суть", "уши", "оставили", "начинаю", "сотни", "связаться", "окна", "доброй", "майор", "держаться", "цру", "штаны", "занята", "отвали", "цвет", "получу", "сидел", "случается", "хозяин", "учиться", "некоторых", "прошли", "погодите", "некоторое", "братом", "считают", "новым", "показалось", "целую", "поблагодарить", "количество", "лекарства", "сумасшедший", "расскажите", "ожидал", "элис", "умрет", "грейс", "слухи", "участок", "улицу", "классно", "животных", "изменилось", "странный", "передай", "ди", "надеялся", "собственной", "гости", "дэн", "контроль", "грудь", "братья", "миль", "улики", "огромное", "замок", "данных", "дому", "районе", "сядь", "наоборот", "богом", "элли", "создать", "закончилось", "отвечает", "побыть", "поесть", "умеешь", "лесу", "самому", "алан", "отправил", "деньгами", "принеси", "таблетки", "ресторан", "нашему", "поверьте", "включая", "живо", "мужчину", "придумал", "шериф", "хрена", "ханна", "собирались", "половину", "ён", "забыли", "сделайте", "удовольствие", "стараюсь", "проходит", "спала", "автобус", "настоящие", "узнаешь", "спроси", "лучшего", "придумать", "вечеринке", "пользу", "появилась", "списке", "лежит", "живой", "счастливы", "понимать", "плохое", "любого", "зубы", "кухне", "попытаться", "расскажешь", "буквально", "клиентов", "ван", "копы", "великий", "пяти", "прием", "скучно", "приходил", "песни", "девчонка", "рукой", "попала", "джош", "проект", "бой", "естественно", "стивен", "увидите", "процесс", "делайте", "вызов", "ниже", "рейчел", "перерыв", "дерьма", "принцесса", "само", "врн", "ненадолго", "радостью", "ответил", "убьет", "тед", "короче", "провел", "сесть", "вечеринки", "попробуем", "теб", "вернётся", "разберусь", "умный", "поймали", "ак", "кошмар", "днём", "дорога", "общего", "жертв", "ведет", "очки", "барри", "чикаго", "найдём", "игре", "официально", "попробую", "энн", "женат", "совпадение", "начальник", "убивает", "терпеть", "счастью", "гей", "множество", "убьют", "болезнь", "свидетель", "тему", "элизабет", "службы", "положи", "пригласить", "бояться", "точки", "голоса", "дин", "собрать", "памяти", "хороша", "думаем", "пригласил", "классе", "проверь", "парню", "убийцы", "вину", "харви", "больницы", "смертью", "всякий", "принц", "бойся", "надеяться", "поднять", "обнаружили", "перестать", "отойди", "покинуть", "чувствует", "нелегко", "ими", "оказаться", "жила", "избежать", "старший", "представляет", "столе", "ошибки", "половина", "смей", "заботиться", "лаборатории", "любим", "успокойтесь", "имеем", "последней", "вызывает", "важнее", "первые", "убийцу", "полегче", "женщине", "жили", "позволил", "груди", "праздник", "умеет", "присоединиться", "черный", "опыт", "бред", "болен", "су", "источник", "собираются", "любимая", "занимаешься", "картер", "эмма", "побольше", "закрыть", "ангел", "тренер", "откройте", "ветер", "остров", "первом", "семьей", "интересует", "беру", "уехала", "виновата", "кэти", "морган", "ищешь", "контракт", "получите", "телевизор", "любите", "попали", "местах", "ненавидит", "целью", "дольше", "полчаса", "согласны", "войне", "осторожнее", "замужем", "звонки", "причине", "папой", "пойдёт", "роли", "спишь", "управлять", "собаку", "бля", "представь", "глава", "постель", "правде", "шум", "придут", "ударил", "схожу", "провели", "начинать", "внимательно", "пятницу", "проходите", "кафе", "отказаться", "поговори", "предупредить", "свободу", "переживай", "начнём", "полная", "руке", "улицы", "виски", "странное", "фил", "артур", "карту", "знаком", "словами", "оказывается", "звоню", "уолтер", "энергии", "познакомились", "ларри", "бежим", "сквозь", "шлюха", "ордер", "капитана", "согласился", "мертвы", "класса", "написала", "париж", "страна", "умирать", "зад", "счета", "сильный", "ерунда", "дерево", "одолжение", "домом", "колени", "выжить", "ждала", "грузовик", "заплатил", "путешествие", "узнают", "чек", "билеты", "достал", "спину", "останешься", "надолго", "рак", "помощник", "парк", "стены", "сработало", "ощущение", "показал", "полу", "находиться", "девочек", "робин", "карен", "пёп", "любую", "зная", "сообщения", "именем", "квартира", "анализ", "другому", "совершил", "оливер", "лошадь", "ответы", "готовить", "субботу", "дышать", "зла", "мэгги", "выгляжу", "разрешение", "девчонки", "хрень", "секундочку", "перезвоню", "миллиона", "одиночку", "займусь", "увидит", "боится", "одновременно", "использовали", "спрашивал", "лиза", "врать", "отказался", "цвета", "жертву", "теми", "метров", "горло", "дворе", "пропала", "дитя", "пошло", "небольшая", "станции", "чувствовала", "бедный", "статус", "поведение", "начинай", "ванной", "кабинете", "немножко", "извинения", "здания", "удастся", "виделись", "пытаемся", "отпустить", "спросила", "выходить", "извиняюсь", "свадьба", "джесси", "марта", "проверю", "контролем", "отвезти", "доверяю", "найдешь", "сражаться", "звезда", "найдут", "заберу", "лагерь", "ходит", "посреди", "звони", "браво", "мишель", "скорость", "использует", "заслуживает", "заметила", "спиной", "прям", "возвращается", "положить", "воскресенье", "чертов", "мэтт", "ть", "камера", "впечатление", "оказалась", "корабля", "мясо", "обсуждать", "фильма", "разговаривал", "штата", "результат", "крайне", "держит", "доказательств", "вселенной", "признаться", "необходимости", "детали", "группу", "грустно", "штук", "ком", "эндрю", "меч", "убей", "занять", "одежда", "бомба", "чувствуете", "кейси", "поймал", "ящик", "работаете", "клубе", "тоби", "забудьте", "живых", "алиби", "пройдет", "проблему", "свободен", "подойди", "каждая", "детстве", "считал", "налево", "помни", "девушке", "напоминает", "дают", "увидели", "фильме", "постараюсь", "потребуется", "сестрой", "отношениях", "отношений", "доктором", "джин", "надежда", "приедет", "личное", "обычный", "изменился", "ужас", "салли", "мэр", "условия", "ай", "иисус", "научиться", "играю", "разрешения", "нашими", "связаны", "пациент", "обвинение", "жди", "старше", "начну", "старой", "пропустил", "палец", "позабочусь", "прошлого", "сумку", "боялся", "красивые", "простить", "найдите", "франции", "секреты", "верите", "америке", "ужасный", "драться", "создал", "гостей", "колледже", "нигде", "заметили", "молли", "позаботиться", "терять", "рисковать", "отдела", "след", "золото", "волос", "простой", "доктору", "отстой", "будущего", "ровно", "собрались", "совета", "штуку", "водой", "саймон", "спрашивать", "приняли", "пытаются", "воспользоваться", "требует", "марти", "живешь", "играешь", "клиента", "позвонили", "стоял", "отпуск", "аминь", "движение", "особенного", "каждом", "заняты", "наплевать", "мечта", "надеть", "зал", "арестовали", "виктор", "шансы", "минимум", "оружием", "неловко", "захотел", "джейсон", "начинаем", "понедельник", "сне", "вернешься", "риск", "сучка", "попытка", "скучать", "софи", "каждым", "огромный", "помогла", "второе", "встретила", "провела", "сомнения", "подумали", "скорей", "мастер", "пальцы", "небо", "открыл", "съесть", "сериале", "займет", "добиться", "сперва", "заходите", "ла", "послушать", "двигайся", "большого", "норме", "личность", "товарищ", "донна", "поставил", "приходи", "быстрей", "следующем", "заслужил", "мест", "лес", "горы", "собаки", "джереми", "гений", "занимались", "встречался", "джонс", "твоими", "проверил", "привело", "врача", "людях", "сверху", "опоздал", "мистером", "парке", "мо", "поиграть", "нил", "несомненно", "дашь", "вышли", "управление", "разум", "хороших", "прибыли", "плакать", "получает", "украсть", "стоят", "собрался", "лондон", "стене", "рш", "джейми", "заново", "напротив", "искали", "программу", "желания", "полное", "девочку", "болезни", "планете", "покончить", "близки", "рик", "взгляните", "охрана", "лице", "сделка", "армия", "выстрел", "ужасное", "крутой", "выйду", "круг", "поехал", "стену", "поделать", "счастливой", "хэнк", "росс", "вещах", "зале", "требуется", "нравилось", "зло", "украли", "верит", "отправиться", "наружу", "последнюю", "устройство", "лето", "уме", "хан", "поисках", "отчет", "встретить", "закончила", "отойдите", "хелен", "вскоре", "дочерью", "ответь", "враг", "ищут", "исследования", "оказались", "пола", "сцену", "умерли", "используют", "отдам", "наблюдать", "мсье", "закончим", "силой", "пытаясь", "подружка", "справишься", "ждали", "бесплатно", "поиски", "попрошу", "форму", "открывай", "живым", "неожиданно", "своя", "бывают", "появились", "мистеру", "собственный", "писал", "пожар", "обнаружил", "следов", "продал", "командир", "планеты", "представление", "говорится", "важный", "псих", "тим", "бо", "борту", "свидетелей", "полном", "выглядят", "уильям", "контакт", "ранен", "смотрели", "позвоните", "хрен", "снимать", "субтитры", "стэн", "ходят", "жарко", "цена", "терри", "хмм", "сети", "животное", "искала", "плачу", "постарайся", "бутылку", "пенни", "надоело", "объясню", "футбол", "похороны", "управления", "тупой", "агента", "приходят", "второго", "останься", "пальцев", "упала", "обмен", "миром", "продолжим", "безусловно", "торт", "уйди", "выхода", "блять", "поработать", "взрыв", "отвратительно", "волнуюсь", "клуба", "участие", "счастья", "получим", "квартиры", "папы", "красавица", "участвовать", "америки", "вырос", "недалеко", "добавить", "отправили", "дэниел", "тетя", "платят", "элисон", "пьян", "общаться", "сбежала", "кайл", "удобно", "коп", "дл", "лицу", "вспомнил", "рождества", "фу", "ходила", "принято", "наблюдения", "голоден", "подозреваемый", "джексон", "выбрала", "группе", "смотрела", "дождаться", "направо", "столом", "нога", "дорогуша", "сыну", "куплю", "просит", "каждому", "занятия", "выбирать", "папе", "нападение", "англии", "вернёмся", "произойти", "хранить", "чаще", "тратить", "возраста", "восторге", "обязаны", "некуда", "объясняет", "молоко", "служба", "корабле", "напал", "сыграть", "помогли", "степени", "лечение", "остаётся", "продолжить", "париже", "осторожен", "настоящим", "закона", "границы", "кэролайн", "радость", "беспокоюсь", "луис", "глупости", "превосходно", "заставила", "благодарен", "собак", "уберите", "хорошенько", "выбрали", "приняла", "входите", "последнего", "пойдемте", "преступник", "устраивает", "теле", "самую", "женаты", "пирог", "бросай", "карта", "постойте", "лорд", "джеки", "расстались", "носит", "плана", "верни", "сок", "установить", "пациентов", "родителями", "книге", "мари", "надежды", "модель", "общества", "следующее", "мусор", "сплю", "единственным", "эд", "доказательство", "беспокойтесь", "ходили", "держитесь", "уходишь", "нанял", "большее", "мак", "напали", "призрак", "связан", "свадьбе", "уверяю", "последним", "посмотрел", "далее", "цену", "заказ", "патрик", "маленькую", "играли", "определить", "повторяю", "продавать", "точка", "дружок", "процентов", "пишет", "джефф", "родителям", "оставайтесь", "газеты", "дар", "новостей", "приступ", "словам", "ворота", "штат", "здании", "число", "автомобиль", "ти", "сердцем", "принимаю", "секунды", "папу", "понравился", "разговаривали", "дыхание", "помнить", "замечательный", "возьмем", "пример", "пользоваться", "проверьте", "борт", "ужасная", "принёс", "роза", "смотрят", "идёшь", "оставим", "причиной", "штуки", "звонили", "сними", "настроение", "положении", "судить", "ею", "водитель", "собрание", "угол", "названием", "привел", "отстань", "предпочитаю", "странные", "подарки", "звезды", "концерт", "отвечай", "разговоры", "убирайтесь", "кан", "четверг", "камер", "защиту", "доставить", "задача", "шею", "прислал", "живы", "острове", "сумасшедшая", "фургон", "арестовать", "ложись", "солнца", "счастливого", "хорошую", "силах", "одиночестве", "контроля", "каков", "трёх", "нравлюсь", "шансов", "верну", "магазина", "увидеться", "поля", "маленьким", "пары", "сан", "лучшей", "живот", "туфли", "роуз", "образ", "вирус", "дьявол", "талант", "наказание", "владелец", "видим", "отличное", "пугает", "погибли", "даёт", "творится", "договор", "очереди", "безопасность", "сознание", "сошел", "самоубийство", "свободны", "увидим", "причину", "способности", "пытаться", "заплачу", "вины", "века", "миллионы", "кричать", "системе", "высочество", "президентом", "женился", "события", "доверие", "роджер", "зомби", "следовать", "обеда", "джесс", "сделаете", "относится", "ребёнком", "стиле", "виновен", "изо", "джулия", "скрывать", "фамилия", "прекрасна", "банка", "фотографию", "правил", "успел", "дверью", "пальто", "ответа", "эпизод", "тридцать", "выглядел", "делами", "защита", "сделают", "счастливым", "лестнице", "оставлять", "воде", "провожу", "повод", "спросите", "послать", "столик", "найдет", "полгода", "летом", "месяце", "вера", "началась", "ми", "ошибся", "хлеб", "пари", "чжин", "устроил", "шанса", "программа", "должность", "выглядите", "танец", "подняться", "завести", "духе", "пули", "расстроен", "ждем", "лондоне", "появляется", "приятного", "ел", "исключением", "расти", "пациента", "покупать", "глупая", "положил", "захотите", "дорого", "прокурор", "раны", "народа", "ребекка", "исчезла", "подумайте", "опасность", "почувствовал", "злишься", "нехорошо", "роде", "нуждается", "младший", "дадим", "сестре", "пропустить", "спрашиваешь", "стреляй", "событий", "редко", "базе", "свободе", "скорую", "пуля", "минуточку", "освободить", "приглашение", "слушаешь", "выйдешь", "кэрол", "точку", "журнал", "наркотиков", "вход", "теория", "глупый", "тома", "умираю", "стрелял", "навестить", "безопасно", "настоящего", "прибыл", "этаж", "уволили", "службу", "самолёт", "услугу", "определённо", "забуду", "молчать", "шутки", "подожду", "оливия", "проверим", "картину", "пей", "пост", "рой", "смех", "ногами", "поддерживать", "бить", "вел", "полицейские", "членов", "страха", "оскар", "покажите", "разрушить", "заметить", "лоис", "обещание", "поддержки", "начале", "следи", "разговора", "собственную", "странным", "кусочек", "одежды", "держал", "будучи", "позволит", "приготовить", "понравилась", "лгать", "обсудим", "суп", "обоим", "встречалась", "общество", "тысячу", "пойдёшь", "умрёт", "боялась", "маргарет", "принимает", "воздуха", "победа", "маленьких", "старого", "район", "подряд", "поедешь", "спрошу", "неа", "приём", "неделя", "снял", "успех", "возможное", "собственного", "личности", "находятся", "чья", "перестал", "дыши", "подойти", "годами", "целая", "территории", "уроки", "любили", "машин", "хватило", "сцене", "углу", "странная", "друзьям", "смит", "кармане", "сьюзан", "спасла", "смеяться", "эрика", "попробуйте", "милорд", "станут", "эйприл", "сценарий", "доволен", "фактически", "сути", "директора", "майка", "съел", "пулю", "газ", "маленького", "хо", "безумно", "слева", "деньгах", "надеялась", "принесли", "звать", "высоко", "сеть", "изменится", "эшли", "вторник", "вынужден", "едешь", "заднице", "ем", "тени", "задницы", "позволяет", "зак", "показывает", "поцеловать", "прошлым", "закончу", "точнее", "солдаты", "настоящей", "заработать", "береги", "расследования", "фред", "большего", "отличие", "веди", "действует", "замолчи", "речи", "играют", "возражаете", "этаже", "хватало", "фрэнки", "вреда", "делам", "средства", "представляете", "поспать", "зеркало", "тедди", "расстроена", "верил", "читала", "почувствовать", "свободы", "нравиться", "поверил", "толку", "бюро", "проснулся", "отеля", "фотография", "следующая", "образец", "правительства", "области", "последствия", "услышала", "меняет", "десяти", "бомбу", "позволите", "навредить", "поступила", "шевелись", "поближе", "долгое", "половиной", "правды", "пакет", "пойми", "движения", "переговоры", "программы", "подвале", "поступать", "офиса", "победил", "задница", "армию", "лиз", "грант", "умная", "небольшое", "урод", "захочу", "кэрри", "классный", "справедливо", "дне", "новом", "фильмы", "ибо", "стоишь", "щрн", "чжу", "передайте", "просили", "сильная", "поддержку", "проблемой", "концу", "протяжении", "больна", "джули", "подать", "слышно", "стиль", "обращаться", "согласилась", "следующие", "искусство", "аварии", "отличные", "копов", "счастливо", "отвезу", "карьеру", "дура", "се", "старых", "машиной", "пригласили", "остановите", "рассказывала", "занимаетесь", "юн", "улик", "интернете", "ужасные", "слушает", "вдвоем", "продолжает", "лжи", "живем", "правилам", "хуй", "больших", "признание", "делах", "маркус", "попрощаться", "отправился", "вызвал", "предстоит", "лесли", "обещала", "переехать", "звонков", "прекрасное", "остановились", "сделки", "опусти", "статью", "уровне", "полную", "забывай", "служить", "поблизости", "жертвой", "танцы", "университет", "заставили", "научился", "сошла", "скрыть", "приходите", "рай", "давал", "врачи", "угроза", "горе", "невеста", "лодку", "ээ", "заранее", "ум", "пью", "становятся", "белого", "учителя", "печально", "сенатор", "красавчик", "идею", "мадемуазель", "подтвердить", "скажут", "самим", "изменил", "прошёл", "видят", "яд", "отследить", "напарник", "детства", "пойму", "факты", "заканчивается", "начинают", "родилась", "выпил", "период", "ресторане", "купили", "ведешь", "уважения", "подарил", "левой", "проверили", "существо", "любопытно", "вашингтон", "почту", "любые", "чудовище", "непросто", "замечательная", "выпей", "помнит", "тайлер", "смотря", "построить", "пережить", "направлении", "ненавидишь", "меры", "вред", "тема", "зашел", "интерес", "красота", "справа", "кожа", "способны", "барни", "настроении", "назвали", "брюс", "убийств", "главным", "придешь", "начнется", "подписать", "приходилось", "майкла", "менеджер", "подруги", "елена", "лучшему", "сломал", "веду", "остановился", "жопу", "округе", "сознания", "ножом", "встречается", "главная", "товар", "уровня", "кожи", "приеду", "сегодняшнего", "пил", "выражение", "летать", "научил", "сижу", "рэйчел", "такова", "получать", "джека", "тошнит", "обсуждали", "фредди", "бывшая", "аэропорт", "позиции", "лорен", "повторять", "прочитать", "бонни", "проваливай", "найдете", "результате", "считается", "вправду", "станем", "белые", "прикрытием", "рыба", "форма", "записку", "поделиться", "сью", "ааа", "относительно", "остановитесь", "имели", "остальным", "расслабиться", "учился", "винить", "женщинами", "ведут", "соседи", "мешок", "засранец", "восстановить", "сеньор", "городу", "лабораторию", "сволочь", "спасли", "классная", "помогут", "лошади", "приму", "наркотиками", "охраны", "прокурора", "банке", "подойдет", "издеваешься", "выходите", "парнями", "останови", "пораньше", "помогал", "че", "фигня", "представьте", "умирают", "лу", "забрала", "убьёт", "америку", "гость", "монстр", "линда", "мин", "изменилась", "помешает", "сосед", "попытался", "острова", "громко", "сад", "правильный", "судьбу", "добры", "отомстить", "адвокатом", "народу", "менять", "занималась", "наиболее", "расскажет", "бум", "проснись", "нахуй", "счастливый", "вернутся", "интересное", "каждые", "стакан", "важная", "уйдет", "хлоя", "чёрный", "масло", "русские", "врагов", "коробку", "линию", "существуют", "взрыва", "министр", "обратиться", "отменить", "скорости", "сложнее", "жалко", "передо", "лукас", "нету", "миссия", "винсент", "шла", "спенсер", "аманда", "размер", "окажется", "падает", "джоуи", "сообщили", "шел", "ограбление", "лежать", "поймешь", "прелесть", "больной", "проиграл", "повторить", "изменения", "привезли", "личные", "поехала", "справимся", "испортил", "бет", "нечестно", "закончилась", "свидетеля", "санта", "вашими", "картины", "зол", "курить", "поездка", "хожу", "отсутствие", "доброго", "убивают", "спрашивает", "узнаете", "проверка", "боятся", "чан", "плане", "гордон", "бетти", "купер", "шести", "огня", "мотив", "поговорил", "занимаются", "полицейского", "назвала", "реки", "чжон", "брату", "сумму", "пишу", "мальчиков", "ставки", "материал", "лодке", "вали", "желает", "прочим", "перестаньте", "привела", "напомнить", "учить", "местечко", "застрял", "трогать", "рид", "луи", "бросили", "творишь", "север", "показаться", "заполучить", "вероятность", "рикки", "ведьма", "нэнси", "вор", "высокий", "ест", "метро", "героем", "передам", "братьев", "пацан", "встречаюсь", "открою", "взамен", "встречаемся", "кот", "лора", "последних", "способна", "члены", "угрозу", "совершить", "америка", "следующего", "рыбу", "джессика", "пешком", "известный", "службе", "мужу", "выжил", "ответила", "пригласила", "разок", "действий", "реальность", "чей", "вторую", "вес", "дорогие", "ошибаешься", "сиди", "камере", "разницы", "пляже", "послание", "хи", "казино", "езжай", "благодарения", "нравился", "джоан", "первых", "итан", "подобные", "мешать", "уезжаю", "дерек", "ночам", "мечтал", "мороженое", "туалете", "стою", "миллер", "побыстрее", "автор", "запомни", "рон", "нарушение", "свинья", "партнер", "хён", "встречал", "обязана", "разговариваю", "уехали", "происходило", "бедная", "тётя", "мальчиком", "базу", "добра", "отдала", "луна", "соглашение", "способом", "встал", "губы", "канал", "изменит", "шутите", "закрыто", "сдать", "огромная", "подними", "поможете", "ездить", "научить", "печенье", "колледжа", "брал", "саду", "гэри", "поддержать", "мнению", "джонсон", "тейлор", "заменить", "какова", "поспорить", "обычная", "входит", "сыр", "согласиться", "участке", "случая", "успеха", "взрослый", "бесполезно", "одри", "стреляли", "троих", "девочкой", "лидер", "гиббс", "осторожней", "угадай", "помогло", "сидишь", "бомбы", "забери", "беспокойство", "отряд", "ожидала", "умрешь", "ведёт", "получаю", "позволила", "скорой", "снег", "звонка", "снимай", "энергию", "времен", "животные", "ева", "рассказали", "отправила", "телом", "стоить", "развод", "предполагаю", "хороши", "чёрту", "лив", "арест", "искренне", "играем", "кристина", "вещами", "пусти", "использовала", "возвращайтесь", "организации", "крышу", "рубашку", "удержать", "конкретно", "аду", "километров", "залог", "бей", "обстоятельства", "являются", "брака", "выходных", "крошка", "врага", "воздухе", "показывают", "возвращаюсь", "поиск", "пытаетесь", "приближается", "ботинки", "полицейских", "шоссе", "похитили", "рассказывай", "искусства", "состоит", "выступление", "личный", "бизнеса", "спорить", "считаем", "джастин", "священник", "хвост", "деревне", "меняется", "украла", "ждешь", "снимки", "начинаешь", "признаю", "специальный", "берегу", "дадут", "присаживайтесь", "сиськи", "касл", "сообщил", "кит", "злой", "перейти", "визит", "победу", "привлечь", "натворил", "борьбе", "важна", "уважение", "судьбы", "задавать", "свобода", "болтать", "интернет", "микки", "нина", "одиноко", "музыки", "включить", "рейс", "осторожны", "сорок", "говард", "заднем", "попозже", "любая", "потратил", "комиссар", "джордан", "свободна", "местом", "арестованы", "спальне", "натали", "подери", "правой", "трус", "понимал", "шли", "дед", "убежище", "убежать", "чая", "браун", "какими", "радости", "позор", "вызову", "придти", "молодая", "характер", "продолжается", "лошадей", "температура", "кухню", "жестоко", "впечатляет", "агенты", "подругой", "зои", "попросили", "горит", "предположить", "тодд", "херня", "художник", "тревога", "старался", "номере", "стрит", "приходила", "нести", "плачет", "угадаю", "опасен", "ищете", "путем", "сторона", "ждите", "причинить", "проходи", "красивое", "стюарт", "приказы", "жутко", "мост", "плану", "уволить", "запрещено", "тост", "пэм", "неизвестно", "спине", "испугался", "рэнди", "идиоты", "подпись", "набор", "энтони", "удивлен", "штатов", "убийцей", "влюблен", "камни", "враги", "партии", "стола", "принесите", "обувь", "подходящее", "границу", "подумаю", "объект", "братан", "сэмми", "кенни", "правдой", "кровотечение", "берет", "разговаривает", "луиза", "порой", "неудобно", "понимают", "входи", "реакция", "самостоятельно", "чувств", "картина", "автобусе", "большей", "заказать", "сел", "приказал", "вопросом", "удача", "сэма", "влюбился", "ногах", "охрану", "поживаете", "беда", "поторопись", "отце", "притворяться", "возвращения", "тень", "советую", "недолго", "верится", "зашла", "попался", "слышит", "справится", "важные", "возвращением", "предложения", "планету", "серии", "николь", "выходной", "кресло", "поездки", "нормальный", "долю", "тина", "эдвард", "умнее", "магия", "двигатель", "звоните", "вечность", "привык", "невиновен", "рори", "кузен", "отношению", "начнут", "потише", "винс", "парочку", "останемся", "звуки", "мешает", "глупость", "собственность", "карлос", "таков", "потери", "понимаем", "лиам", "оборудование", "заказал", "маленькое", "книг", "гнев", "смеется", "помимо", "слушал", "поверишь", "парочка", "приведет", "бут", "главного", "желаете", "красивой", "платит", "офицера", "чаю", "белье", "сосредоточиться", "берегись", "пустой", "мудак", "кристин", "отделение", "университете", "милые", "вернул", "четверо", "тепло", "прямой", "глубже", "линдси", "эффект", "пульс", "трудом", "пускай", "пятьдесят", "ночной", "грубо", "опухоль", "четырех", "паркер", "выполнять", "проводит", "линия", "обид", "кончится", "оуэн", "берите", "кричит", "темноте", "устроим", "спасать", "майами", "пиццу", "беспокоить", "покой", "малыша", "сходи", "марко", "босса", "грей", "занимаемся", "солнышко", "леонард", "бегать", "дневник", "моменты", "испортить", "неприятно", "домик", "мэй", "стекло", "прими", "влюблена", "ян", "ужина", "объяснение", "эээ", "мю", "допустить", "крыше", "тхэ", "ожидать", "детектива", "провёл", "крик", "называли", "играла", "выразить", "успокоиться", "джорджа", "надежду", "всяких", "использую", "сильным", "градусов", "морской", "марш", "починить", "уилсон", "замке", "крепко", "послали", "заплатили", "спокойствие", "скучал", "согласились", "такому", "собственные", "событие", "дама", "используй", "дженна", "извиняться", "предал", "нанять", "соль", "сидела", "би", "теории", "стул", "месть", "ошибкой", "терпение", "целых", "вида", "обязанности", "поздравления", "выхожу", "днях", "сна", "выясним", "приятный", "медсестра", "капли", "здоров", "карла", "прекрасные", "отделе", "чёртов", "дочка", "небе", "шее", "диана", "исчезнуть", "барт", "райли", "остаток", "птица", "встань", "клетки", "чжун", "лиззи", "ставить", "программе", "новостях", "пропали", "разговаривала", "разговоров", "выиграли", "ноль", "плачь", "эмоции", "пространство", "увидят", "заодно", "возражаешь", "сменить", "выполнить", "используя", "считай", "ударить", "вывести", "пальцем", "хейли", "веру", "эх", "законы", "сомнений", "клиенты", "усилия", "посадить", "сотрудников", "позвать", "врачу", "ходишь", "трейси", "горячая", "природы", "эдриан", "утверждает", "почувствовала", "показывать", "английский", "исследование", "знай", "золотой", "костюме", "чо", "благодарна", "сойти", "тщательно", "просим", "идеальный", "полезно", "умно", "студии", "погода", "км", "поставь", "командой", "средств", "объяснять", "тв", "диване", "жених", "кнопку", "ванну", "председатель", "обстоятельствах", "пойдут", "следующим", "рим", "нетерпением", "телефоне", "изнутри", "воняет", "минутка", "позволишь", "юг", "страсть", "нью", "взрослые", "течении", "задумал", "настоящую", "моника", "трусы", "следил", "иск", "предыдущих", "опаздываю", "присядь", "джеймса", "передал", "покинул", "втором", "эфире", "разрешите", "питера", "наоми", "списка", "рассчитывать", "коем", "эксперт", "произойдёт", "дэйв", "личной", "центра", "ставлю", "прочитал", "рынок", "принца", "лагере", "вызвали", "позицию", "семьёй", "агентов", "реальности", "поворот", "отказалась", "дышит", "бегите", "личного", "расходы", "игрок", "лодка", "меган", "театр", "полон", "предупреждение", "бывшей", "опыта", "океан", "сердцу", "смириться", "знакомо", "судно", "блэр", "приговор", "уважаю", "секретарь", "единственной", "условиях", "языке", "робби", "открыто", "заставило", "молодых", "паспорт", "экзамен", "гордиться", "шампанское", "движется", "раскрыть", "фирмы", "ошибок", "используем", "возраст", "жен", "меню", "чести", "американцы", "пострадал", "несправедливо", "найдется", "белых", "грег", "южной", "болван", "лемон", "тишина", "филипп", "пределами", "надень", "заслуживаешь", "бедняжка", "напишу", "доверяешь", "тюрьма", "угрозы", "пробовал", "никки", "коул", "небеса", "справился", "даг", "трюк", "приносит", "войска", "страдать", "плохих", "поговорили", "вела", "вошел", "бабушки", "бассейн", "шарлотта", "конечном", "руль", "венди", "стефан", "проснулась", "всякие", "приготовила", "водить", "денни", "удивлена", "планета", "насилия", "бегом", "марка", "бросьте", "груз", "показали", "сняли", "записать", "смс", "эл", "диск", "местные", "помогаю", "силе", "прятаться", "сегодняшний", "глянь", "предлагаешь", "присутствие", "членом", "худшее", "грязные", "ын", "редактор", "советник", "полицией", "временно", "начнет", "салат", "ненавидеть", "называешь", "пойдёмте", "пропустила", "старую", "наполовину", "летит", "строить", "подробности", "кей", "ричи", "беде", "крики", "духа", "захотела", "миледи", "делается", "числа", "помешать", "переехал", "молчание", "длинный", "горячий", "закону", "феликс", "воли", "долгий", "ищите", "пушку", "сравнению", "рынке", "подозреваемого", "напугал", "чемодан", "американский", "нападения", "захватить", "спасение", "спрашивала", "жизней", "купи", "борьбы", "начиная", "пароль", "шкафу", "многим", "военные", "германии", "выросла", "судьи", "исчезли", "гас", "грех", "обычные", "выглядела", "уходят", "сны", "спятил", "арестован", "ухо", "блюдо", "симпатичный", "молока", "дьявола", "разберемся", "нахожу", "сдаться", "лори", "привели", "тяжелый", "грязи", "важен", "насилие", "повесить", "спасения", "университета", "обещали", "подобных", "граф", "поступок", "способность", "поднимайся", "молод", "чересчур", "потеря", "футов", "уезжать", "обеих", "сдал", "женщинам", "мяса", "боги", "хей", "смеешь", "удара", "процессе", "красная", "досье", "предупреждаю", "пройдёт", "велел", "сотрудничать", "достану", "моря", "ублюдки", "битва", "сигареты", "читаю", "нужды", "темно", "дрю", "переведено", "версия", "идемте", "объявление", "поймет", "кольца", "дворец", "преступников", "тайна", "стреляйте", "гомер", "джонатан", "поезда", "причинам", "поднимите", "тайны", "познакомился", "вытащил", "заставит", "прислали", "боя", "сердечный", "игр", "опоздала", "присяжных", "наделал", "северной", "нервы", "позволили", "поживаешь", "бывало", "файлы", "первыми", "слабость", "чудесный", "мировой", "возвращение", "поставили", "называет", "просьба", "собрал", "установили", "особенный", "подозреваемых", "хранилище", "формы", "преследовать", "средство", "синий", "полтора", "попытки", "старым", "спуститься", "мгновение", "джина", "выстрелил", "допрос", "примеру", "повторится", "телефоны", "японии", "голубой", "идей", "мальчишка", "всяком", "алкоголь", "удовольствия", "устроили", "наручники", "коннор", "подкрепление", "приз", "клаус", "рана", "убита", "признался", "уеду", "боитесь", "политика", "показала", "восхитительно", "числе", "технически", "уладить", "прогуляться", "бал", "джен", "получаешь", "йо", "вставать", "отправлю", "отдыха", "пункт", "выступать", "убраться", "дэвис", "брошу", "описать", "поможем", "холли", "третьего", "спали", "эйвери", "повидаться", "влияние", "доказывает", "победы", "мнения", "среду", "присесть", "прекрасной", "родной", "эли", "очков", "альбом", "белая", "парой", "случаях", "ка", "очередной", "приготовил", "обеспечить", "произошла", "ловушка", "написали", "третья", "корабли", "победитель", "мэра", "грязь", "грязный", "рабочий", "неприятностей", "лана", "александр", "принимал", "особенное", "поезде", "коллега", "здрасьте", "военный", "солгал", "слову", "варианты", "мэтью", "спрятать", "позвонит", "минута", "вмешиваться", "предложили", "агентом", "верят", "браке", "барбара", "символ", "забудем", "точности", "ада", "главной", "единого", "лечения", "намерен", "монро", "возвращаемся", "ненавидят", "уйдешь", "угрожал", "осмотреть", "признаков", "поужинать", "назови", "деревья", "создание", "правый", "отвести", "отныне", "середине", "возьмём", "блага", "королевы", "ответьте", "ронни", "чтож", "воле", "центов", "мести", "кира", "совести", "мередит", "пуаро", "сильные", "успеть", "носом", "разбил", "газете", "деревню", "дженнифер", "рики", "эллиот", "кампании", "лжец", "поженились", "приветствую", "деревни", "зайду", "си", "человеке", "трогайте", "врата", "сходим", "нервничаю", "объясни", "принимаешь", "идеей", "случаев", "спи", "встречаешься", "положите", "хорошем", "сексуально", "считала", "существа", "следующую", "называй", "жителей", "часами", "ответственности", "порно", "готовит", "кэт", "полночь", "служил", "дрянь", "выйдем", "двор", "указывает", "руби", "мобильный", "дадите", "красотка", "убираться", "цифры", "большом", "ношу", "разговариваешь", "безопасное", "привез", "вернёшься", "уважением", "отдайте", "документов", "ам", "выиграла", "застрелил", "старина", "сити", "размера", "собирать", "гм", "бросать", "галстук", "зашли", "сли", "компанией", "скорая", "кинг", "молчи", "жители", "решит", "коллеги", "едят", "одежде", "верь", "кладбище", "собственно", "целое", "аэропорту", "плавать", "действие", "дерева", "старика", "подходи", "калифорнии", "грехи", "услуги", "чемпион", "покажет", "иван", "улицах", "ошибаюсь", "вынести", "альберт", "допустим", "сторон", "добрые", "бывшего", "бизнесе", "переехала", "повреждения", "найдёшь", "незаконно", "тупая", "сидели", "виктория", "таки", "занятие", "глядя", "примет", "выглядело", "спок", "доступа", "бою", "расстоянии", "улица", "соврал", "держишь", "языком", "упоминал", "мертвых", "сид", "кошка", "майя", "создали", "организовать", "преимущество", "забирай", "россии", "гарольд", "губернатор", "добр", "лезь", "дерьмом", "держат", "снимок", "сцены", "режиссер", "образование", "просишь", "больница", "превратить", "писатель", "ели", "птицы", "чистый", "собралась", "дяди", "толпа", "сэндвич", "связался", "подписал", "награду", "необязательно", "перестала", "миссии", "открыта", "чрезвычайно", "склад", "грин", "прощайте", "читаешь", "ловушку", "скучала", "невесты", "спрятаться", "заклинание", "роз", "национальной", "сладкий", "дно", "оператор", "учил", "глупостей", "смена", "общий", "войдите", "живёшь", "рост", "идете", "льюис", "рецепт", "дилан", "остальными", "выключи", "нелепо", "погибла", "человечества", "бокал", "господина", "евро", "ребенку", "максимум", "спрашивай", "местный", "случалось", "катастрофа", "целом", "чистая", "кожу", "рози", "игрушки", "алисия", "ланч", "зуб", "элейн", "детях", "собственное", "неплохая", "клара", "банки", "измениться", "аллергия", "норман", "свидетели", "очнись", "двойной", "сообщу", "стар", "ездил", "поменять", "огромные", "путешествия", "шляпу", "поездку", "залезай", "плохим", "неудачник", "шоколад", "рут", "эрл", "джеффри", "тварь", "предатель", "наличными", "иисусе", "словом", "дю", "шампанского", "мер", "свидетелем", "сутки", "начался", "стояла", "старое", "сведения", "демон", "понадобятся", "пирс", "гулять", "отдых", "фантастика", "чон", "подарить", "услышали", "разделить", "пушки", "ехал", "группой", "причем", "заставляй", "мэтти", "поддержка", "бара", "леса", "союз", "надпись", "углом", "бумажник", "попало", "нравилась", "волосами", "веселье", "местных", "городской", "месту", "лечь", "донни", "страдания", "карьера", "настало", "поскорее", "коробке", "милой", "юмора", "кризис", "присяжные", "черная", "гордость", "повезет", "едой", "ручку", "проклятие", "проводил", "независимо", "позвал", "коктейль", "отчёт", "территорию", "похитил", "сигнала", "хер", "едут", "придумала", "шелдон", "представлял", "видеться", "энергия", "могилу", "особый", "непременно", "обучение", "наслаждайся", "технологии", "медведь", "пистолета", "тайне", "европе", "замешан", "сумка", "называю", "заботится", "обмануть", "дошло", "добрался", "облажался", "получают", "шерифа", "шуток", "рака", "чьи", "заболел", "уснуть", "предложила", "называл", "неплохой", "убиты", "пытайся", "злиться", "наука", "отношении", "военных", "тесты", "ожидания", "глубине", "начинайте", "коробки", "соседей", "благодарность", "передумал", "кругом", "заслужила", "достичь", "серьезные", "шоке", "оставляет", "иисуса", "мечтала", "пустая", "шейн", "убийством", "бил", "окончена", "справедливости", "присматривать", "предмет", "изменились", "злюсь", "повернись", "потрясающий", "самолете", "свидании", "основания", "банды", "влюбилась", "округа", "отставку", "электричество", "вызовите", "предотвратить", "ущерб", "джентльмен", "пожениться", "ошиблись", "остаюсь", "зоне", "расписание", "выпустить", "запад", "яйцо", "ин", "фиби", "отвечаю", "белом", "лекс", "русский", "реке", "связана", "пляж", "профессора", "отрицать", "считали", "ужином", "вдоль", "изменила", "сейф", "продюсер", "убежал", "здоровья", "обещай", "тайну", "дурака", "некоторым", "уважать", "двигайтесь", "оправдание", "фонд", "занятий", "обнаружила", "поймают", "закончился", "объясните", "напуган", "врачом", "ценой", "потеряю", "модели", "семи", "маршалл", "бабуля", "зови", "янг", "целиком", "угрозой", "кормить", "выборы", "ящике", "общее", "сайт", "соус", "опоздали", "плечо", "подругу", "перенести", "планировал", "ненавидел", "цветок", "моложе", "кара", "прожить", "травмы", "координаты", "окончательно", "вздыхает", "образцы", "входа", "благодарить", "свободно", "убийц", "договориться", "покажем", "фрэнка", "чувствах", "предоставить", "лучшем", "симптомы", "мужчине", "ходи", "подготовить", "открытие", "заснуть", "рассказ", "скорого", "писала", "уезжает", "оставишь", "близок", "копию", "вошла", "костюмы", "детский", "приведи", "арти", "выпивку", "магии", "дана", "попытаюсь", "пан", "станете", "волк", "снимите", "пойди", "интересный", "подход", "джулиан", "займёт", "остановит", "эллен", "познакомить", "матч", "труда", "интересах", "мэнни", "веры", "дэвида", "пишут", "коробка", "отпраздновать", "приготовлю", "приводит", "чжи", "травма", "великого", "чашку", "всякое", "борьба", "вслух", "молодые", "заглянуть", "впрочем", "предупреждал", "верните", "чист", "положено", "вспомнила", "зоны", "гостиной", "живете", "конкурс", "пак", "пенсию", "находимся", "продажи", "хотеть", "беспорядок", "шар", "помогают", "показаний", "обвинить", "вчерашнего", "ооо", "небольшую", "нейт", "отвечу", "акции", "чхве", "заключается", "гараже", "выяснили", "громче", "уйдем", "страдает", "цены", "диван", "ряд", "пропало", "вселенная", "сахара", "отличается", "важным", "многого", "привёл", "каковы", "захотелось", "капитаном", "гольф", "стресс", "выбросить", "владеет", "вариантов", "совесть", "неудивительно", "сообщите", "представления", "рабочих", "акт", "требую", "шин", "примите", "птиц", "проверила", "займемся", "молодцы", "банда", "протестую", "члена", "убедись", "базы", "описание", "эфир", "потрясающая", "тереза", "схватил", "макги", "оплатить", "хаос", "знания", "полицейским", "испытание", "лифт", "поймут", "открыли", "перчатки", "переживать", "прикрытие", "приходили", "должности", "лететь", "следит", "сошли", "переживаю", "честным", "интересы", "поискать", "направляется", "анализы", "решено", "создания", "понадобилось", "угрожает", "остаются", "зеленый", "зарплату", "думая", "родственники", "нора", "застрелили", "дебби", "мною", "одинаковые", "получал", "закрыты", "проникнуть", "лежал", "успешно", "мыслей", "захотят", "брук", "сбежали", "мужики", "трудности", "зверь", "спросили", "грани", "эксперимент", "осторожна", "называем", "ярости", "аварию", "органы", "выйди", "копа", "департамент", "альфа", "закончились", "обычное", "королем", "ходу", "подходите", "андре", "цветов", "фанат", "ела", "следуйте", "ждём", "преследует", "лучшую", "французский", "милость", "какому", "открывать", "наступит", "любимое", "костей", "лгал", "кретин", "вернули", "проходил", "фирма", "выслушать", "пиздец", "сцена", "скандал", "удалить", "быстрый", "вели", "долгая", "сжечь", "эмм", "легенда", "полным", "дик", "поболтать", "песен", "номером", "повтори", "понадобиться", "глория", "орудие", "займись", "удачу", "намерения", "хаус", "кармен", "озеро", "вошли", "увы", "телевизору", "копия", "семейный", "волю", "рыбы", "подвал", "улыбка", "красные", "круче", "скотти", "видом", "материалы", "выяснил", "хреново", "перекусить", "колин", "коммандер", "немало", "надеемся", "уезжаешь", "мотор", "тео", "придумали", "поговорите", "звездой", "спят", "одолжить", "спаси", "гектор", "репутацию", "бензин", "сериях", "братишка", "молодым", "звонят", "закрыли", "сильное", "представлять", "согласится", "напугана", "атаку", "городом", "информацией", "воля", "пятно", "статья", "долгу", "ники", "следите", "чертова", "илай", "поставлю", "аккуратно", "куски", "почте", "пас", "чертям", "раздражает", "рок", "голодна", "токио", "мелкий", "плачешь", "продолжаться", "честное", "выпускной", "гору", "строго", "пиджак", "обыск", "милым", "сидни", "идиотом", "сошёл", "пилот", "жалость", "харрис", "инструменты", "свежий", "скоростью", "врал", "записал", "съездить", "проходить", "ненависть", "домов", "напиток", "чертовы", "тремя", "снято", "пообещал", "посмотрела", "перевести", "свалить", "кеннеди", "смотрим", "протокол", "лондона", "сводит", "разумно", "собственных", "аарон", "восток", "холодильник", "рукам", "поверит", "приступим", "полдень", "рта", "уважении", "запомнить", "переспать", "пианино", "попроси", "врешь", "родила", "дата", "стена", "крыши", "крыса", "хватай", "начались", "массаж", "сумки", "слух", "ощущения", "долги", "вернитесь", "небес", "доверься", "рулем", "бессмысленно", "сентября", "давали", "даешь", "век", "нечем", "советы", "подвезти", "стэнли", "дыру", "фотографий", "послала", "напугать", "появилось", "закрыт", "преступника", "неба", "бывал", "империи", "пыль", "связать", "молиться", "зону", "испугалась", "защите", "карте", "врем", "сидите", "финн", "неподалеку", "заходил", "знакома", "предпочел", "христа", "очистить", "пропустили", "длинная", "сир", "преступлений", "извращенец", "добрались", "заключить", "закончишь", "вдвоём", "обществе", "достала", "двенадцать", "поцеловал", "одинок", "фрэнсис", "признаки", "валентина", "месяцы", "умрут", "антонио", "облегчение", "открывается", "йен", "средней", "важны", "газету", "фильмов", "положила", "волны", "годится", "покончено", "поверхности", "грязная", "собраться", "стерва", "ткани", "берут", "открыла", "носишь", "девчонку", "специалист", "секретов", "найдёт", "аж", "родом", "трагедия", "рене", "смешной", "десерт", "остановка", "меняются", "дафни", "изабель", "дозвониться", "версию", "авеню", "тысяча", "фишер", "статьи", "лед", "рассел", "забота", "застряла", "отказ", "пятнадцать", "учителем", "сильной", "заставлю", "задания", "синди", "лидия", "победили", "значок", "ремонт", "голода", "заходит", "единственные", "помогаешь", "бутылки", "напитки", "наслаждаться", "сексе", "устали", "спрятал", "метод", "гвен", "рождеством", "красоты", "бишоп", "поднял", "поедет", "козел", "мэдисон", "записей", "велосипед", "брэд", "ногой", "суждено", "задержать", "шпион", "постарайтесь", "гейл", "поверила", "смешного", "подумаешь", "одет", "наняли", "навыки", "пальца", "вёл", "звонишь", "лодки", "шок", "растет", "черные", "кэмерон", "объяснил", "повышение", "дейзи", "позаботься", "курт", "мужской", "рабочие", "ожидает", "выступить", "ферме", "рис", "продолжаем", "бена", "относиться", "собеседование", "виню", "флаг", "убьешь", "ступай", "змея", "паре", "охотник", "заработал", "управляет", "природа", "охранник", "ника", "аренду", "убейте", "стараться", "поступки", "оставалось", "возьмешь", "симпатичная", "поступили", "кость", "интересная", "читает", "политики", "довольны", "бесит", "выходил", "читали", "позову", "сядьте", "агентство", "попытается", "чужие", "мужчинами", "крыша", "берег", "золота", "стейси", "мардж", "доллар", "реку", "тара", "перезвони", "пишешь", "сообщений", "рту", "проекта", "курок", "рассказывает", "охота", "выпила", "взрослых", "похищение", "небольшие", "спорим", "появиться", "ра", "вампир", "вылезай", "позволяй", "ошиблась", "файл", "вилли", "серьезное", "догадаться", "преподобный", "тянет", "сумке", "мертвым", "живём", "академии", "напрасно", "худший", "милашка", "открыт", "побережье", "природе", "джи", "недоразумение", "сахар", "смены", "детективы", "тур", "изображение", "уничтожил", "бейли", "телефонный", "ошибаетесь", "синьор", "генерала", "платья", "сочувствую", "прочесть", "маску", "джулс", "направление", "успехи", "сидят", "обуви", "взялся", "инструкции", "человеческой", "светлость", "браслет", "сей", "портрет", "обман", "зашёл", "поражение", "составить", "китти", "еврей", "огромную", "училась", "ищи", "нормальной", "потратить", "выпью", "италии", "братец", "сотен", "перестали", "джейкоб", "пар", "авария", "духи", "логан", "станцию", "софия", "похоронах", "наблюдал", "проведу", "построил", "обращай", "спешить", "мебель", "новичок", "зона", "подходящий", "виноваты", "краю", "слезы", "логично", "саша", "эван", "приезжает", "кругу", "уволен", "уедем", "думайте", "флот", "музей", "ле", "космос", "отправились", "пригодится", "холодильнике", "честен", "привезти", "вопроса", "атаки", "беспокоится", "случайность", "режим", "газа", "митчелл", "плакала", "съела", "шутку", "красной", "красива", "многом", "защищает", "покоя", "лагеря", "хирург", "глупые", "церемонии", "база", "сериал", "тсс", "проверять", "габи", "королевой", "расстаться", "решает", "берешь", "газетах", "немцы", "пресса", "ударила", "кусочки", "простая", "оценки", "третьей", "впустую", "пропустите", "комплимент", "тон", "роберта", "заслуживаю", "брюки", "убедил", "необычно", "вспомни", "героя", "считая", "святая", "сценария", "закройте", "аппарат", "приведу", "лорел", "дуайт", "используешь", "аа", "соседка", "эль", "коридоре", "парне", "кен", "спрашивали", "играете", "вспоминать", "верный", "сойдет", "застряли", "каникулы", "слепой", "шёл", "возвращаются", "воспоминаний", "смену", "хозяйка", "череп", "себастьян", "носил", "кредит", "деда", "посидеть", "жалею", "небесах", "запрос", "пусто", "библиотеке", "красного", "правосудия", "скрывает", "пообедать", "страсти", "соня", "достали", "акцент", "возможностей", "уолт", "верила", "наблюдение", "комитет", "кухня", "верх", "познакомилась", "холмс", "охоту", "одинаково", "проходят", "кент", "сокровище", "обидеть", "действительности", "проводили", "совершила", "йюй", "большими", "взорвать", "свободное", "великой", "здравствует", "перевели", "леон", "доверяет", "стрелок", "чужой", "видение", "схватить", "студентов", "известен", "мелочь", "копии", "тупица", "привыкла", "останутся", "дружба", "душой", "молодого", "носят", "договаривались", "отметить", "клиентом", "захочется", "всерьез", "физически", "выключить", "льда", "сделаны", "отойти", "благослови", "упустил", "постепенно", "али", "приготовиться", "начнётся", "посол", "репутация", "ожерелье", "исчезнет", "вики", "девушками", "запустить", "проехали", "уверенность", "стук", "прячется", "роста", "подобно", "карьеры", "полотенце", "разрушил", "шрам", "ненависти", "заткнитесь", "заплатит", "крест", "идиотка", "старшей", "методы", "трата", "продукты", "печень", "исключительно", "рубашка", "божий", "произвести", "принесет", "крутая", "существование", "ветра", "чжэ", "вампиров", "виновным", "предупредил", "фон", "зацени", "посадили", "отдавать", "славы", "дым", "люка", "миллиардов", "проверку", "разрешил", "узнай", "королю", "пабло", "сделан", "хорошими", "заставлять", "откровенно", "мотоцикл", "устрою", "научилась", "доверия", "сладкая", "поет", "плоть", "уоррен", "умрем", "обещаешь", "завидую", "следят", "пьер", "сыграем", "путём", "актриса", "гадость", "кота", "джинни", "успели", "смеются", "полуночи", "становишься", "отдали", "учится", "уезжаем", "заинтересован", "носа", "подойдёт", "приют", "гараж", "простое", "плоти", "пошутил", "эмбер", "стихи", "надел", "линкольн", "славно", "чудеса", "держали", "прощу", "романтично", "поход", "чертову", "парням", "спрашиваете", "станция", "выходят", "присаживайся", "растут", "мужика", "поешь", "зарабатывать", "бардак", "пустыне", "закрыта", "кататься", "стен", "живее", "удачно", "пенис", "успокоить", "невинных", "участвовал", "режиссёр", "бак", "дату", "прямом", "основе", "третьем", "сезона", "июля", "цене", "забывать", "сложный", "уэйн", "позвонишь", "любимой", "играй", "годом", "теряем", "крылья", "помогала", "привыкнуть", "любимые", "нахожусь", "конфеты", "флота", "друге", "ближайшее", "вине", "правосудие", "бойтесь", "неправ", "напиши", "кайфом", "подозрения", "хлеба", "сказав", "перемены", "свечи", "подождем", "пила", "обороны", "сми", "куртку", "представитель", "умница", "принадлежат", "помещение", "устраивать", "нарушил", "предчувствие", "старалась", "красное", "горячо", "кролик", "сумма", "предположим", "шелби", "умеют", "готовлю", "руди", "матушка", "половины", "просят", "родственников", "продолжал", "закончена", "подготовиться", "бумага", "подойдите", "науки", "дэниэл", "производство", "обнаружить", "кокаин", "снов", "обманул", "напрямую", "пустите", "тайно", "оставляю", "среднего", "учеников", "курица", "получат", "уходил", "поступают", "отложить", "ошибался", "храм", "девчонок", "степень", "отпущу", "элен", "поженимся", "днями", "нахрен", "мерлин", "выслушай", "сигарету", "уйдёт", "поразительно", "отключить", "придумаем", "рита", "забавный", "шторм", "майки", "редакция", "водителя", "дороже", "щас", "внести", "проклят", "рэймонд", "график", "фрейзер", "испортила", "битвы", "документ", "прибыль", "землей", "поделаешь", "разговариваем", "переехали", "выпустите", "честный", "пицца", "найден", "игнорировать", "корова", "поймите", "одних", "избегать", "некогда", "школьный", "выборов", "сломать", "жалеть", "миранда", "глубокий", "богов", "побег", "писем", "юная", "заболела", "марго", "зависимости", "робот", "аппетита", "вашингтоне", "благодарности", "лме", "почитать", "оказать", "развода", "шевелитесь", "отвечаешь", "синдром", "поговорила", "хозяина", "текст", "отчаянно", "бумагу", "почерк", "шмидт", "учили", "поддерживаю", "резко", "проверял", "спорт", "начальника", "придёшь", "покончил", "джозеф", "идёмте", "совпадает", "дерьме", "сэнди", "веселиться", "ау", "держится", "стряслось", "джуди", "спальню", "джилл", "африке", "колесо", "прыгай", "терапии", "заметит", "справедливость", "бутылка", "увеличить", "останетесь", "отпечатков", "дракона", "значило", "симпсон", "ведёшь", "шкаф", "подошел", "сном", "пистолетом", "великим", "пациенты", "запомнил", "победит", "реджи", "фокус", "называете", "маленьком", "мартина", "ленни", "эрин", "страшный", "продали", "кристи", "крейн", "гора", "поколения", "пообещай", "адреса", "торопись", "мечтать", "огда", "присутствии", "великолепен", "путешествовать", "поставила", "уильямс", "вопросу", "проиграли", "луну", "состоится", "успела", "данном", "лжет", "планировали", "декстер", "вдох", "теряет", "проблемами", "китай", "лесбиянка", "розы", "алиса", "холодный", "несет", "открыты", "участка", "милях", "приятное", "шума", "давления", "сложная", "тяжелая", "длинные", "офицеры", "выбираться", "обычной", "соответствует", "мерзавец", "боссом", "предлагает", "выпустили", "спектакль", "одеяло", "остановил", "карьере", "совершили", "таблеток", "ловушке", "довольна", "богатый", "нарочно", "кэм", "великолепна", "сдаюсь", "отказываюсь", "кончилось", "села", "ричарда", "озера", "даниэль", "детки", "воображение", "заполнить", "нанести", "заместитель", "фамилию", "вру", "оставит", "солгала", "прояснить", "откажусь", "светит", "парковке", "горах", "качества", "опасный", "желудок", "племянник", "ноге", "великая", "состояния", "личная", "побежал", "ручки", "грозит", "мая", "выкинуть", "слышь", "рану", "лучшими", "проходили", "самих", "покончим", "усилий", "самолета", "выбирай", "остановится", "выяснилось", "сет", "личную", "индии", "ловить", "спеть", "проведем", "нуждаюсь", "ближайшие", "согласие", "правильное", "передачу", "всякой", "рюй", "забочусь", "вылечить", "любимых", "кирк", "лови", "пейдж", "выпуск", "алек", "услышит", "любому", "ракеты", "лекарств", "отправимся", "рекорд", "пожалеешь", "кончай", "чип", "давала", "ужинать", "секрете", "упомянул", "носу", "поверю", "тащи", "маршал", "мона", "диагноз", "наслаждайтесь", "ромео", "филип", "хобби", "шляпа", "хэй", "дождя", "приветик", "подстрелили", "позволим", "врачей", "копом", "казаться", "кристофер", "подставил", "стадии", "начни", "тупик", "ужасной", "разрыв", "себ", "главе", "превратился", "американцев", "человечество", "ребятки", "позаботится", "гони", "клетке", "вторжение", "отказывается", "приведите", "ствол", "опознать", "дем", "голосом", "иль", "слушание", "появятся", "обвинений", "соболезнования", "бежит", "напасть", "пес", "ванесса", "бекки", "парка", "свитер", "встаньте", "передачи", "пёс", "шутить", "включи", "умрёшь", "прыгать", "носки", "крысы", "слушаюсь", "занимает", "ванную", "купим", "сексуальный", "кэсси", "милое", "крепче", "бежал", "учились", "лемъ", "вирджиния", "плакал", "забирать", "эстер", "вызвала", "зовите", "заключение", "продажу", "партия", "третье", "молода", "данным", "медовый", "проводим", "чувствуют", "император", "поведения", "площади", "беспокоишься", "зубов", "глазам", "минди", "взломать", "позднее", "блейк", "создавать", "прогресс", "лестницы", "отказались", "основной", "лев", "упустили", "луны", "оценить", "рисовать", "персонал", "торопиться", "огромной", "короткий", "дорог", "гляди", "печать", "ставит", "кандидат", "редактируется", "ждёшь", "ресторана", "трупы", "дыра", "клинику", "фр", "минус", "обожает", "опустите", "спор", "папаша", "клетку", "беременности", "лаборатория", "трубы", "присутствовать", "объявить", "окончания", "читай", "шикарно", "остатки", "буквы", "сведению", "разума", "выгнали", "детской", "отправь", "устроила", "компьютера", "вторым", "сексуальная", "ллойд", "зубами", "кроули", "сяду", "реклама", "сделана", "масла", "свободный", "ручка", "сомневаться", "взаимно", "отпустили", "управляющий", "находился", "нормальным", "спорю", "парижа", "выросли", "подходят", "становиться", "резюме", "смеешься", "словах", "присмотреть", "бенни", "смелости", "съешь", "бок", "влияет", "милли", "пойдете", "гриффин", "допоздна", "штате", "подружки", "звезд", "медицинской", "напряжение", "бросает", "пасибо", "офицеров", "св", "отпечаток", "герр", "частный", "пи", "кресле", "род", "повеселиться", "спина", "семей", "появляются", "давить", "богат", "увидев", "ноа", "зовет", "коме", "счастливая", "говнюк", "куинн", "прихожу", "юрист", "нисколько", "уилла", "окончен", "приказу", "соглашусь", "лин", "шестой", "арчи", "заявил", "награда", "любезно", "представляла", "переодеться", "адвокаты", "найдёте", "рекламу", "клинике", "дурацкий", "коленях", "работник", "разошлись", "пожить", "версии", "вынуждены", "скучаешь", "обойти", "компьютере", "рассмотреть", "миссию", "партию", "последнем", "багаж", "терпится", "делиться", "пьяный", "теряю", "забираю", "потеряешь", "работников", "риз", "кричал", "мышь", "сказки", "убежала", "находишь", "полна", "синьора", "пятый", "старших", "заявления", "уэйд", "прикрыть", "идеальное", "журналист", "результатов", "силами", "справилась", "подал", "семейные", "расследовании", "необычное", "размером", "живи", "признаюсь", "отчасти", "мили", "проклятый", "женится", "сумасшедшие", "выбросил", "случаи", "отвлечь", "спасите", "установил", "показатели", "мелочи", "распоряжении", "пережил", "случился", "детство", "снимаю", "преступники", "суду", "жар", "американских", "добрым", "джой", "знакомый", "задуматься", "сотню", "разбираться", "испытания", "ставку", "отведу", "товарищи", "заложников", "забывайте", "песок", "боба", "вик", "традиция", "вершине", "идеальная", "заплатишь", "заботился", "работай", "выпивка", "высокая", "догадался", "шерлок", "уговорить", "трогал", "пользы", "прямиком", "алкоголя", "сработать", "приезжай", "сохранять", "видения", "понравиться", "заходить", "значить", "одержим", "стояли", "белой", "восьми", "военной", "поедим", "насрать", "находит", "казни", "герои", "найдено", "наказания", "темы", "отдыхать", "сеньора", "разбираюсь", "притормози", "шелли", "приготовьтесь", "подозреваю", "обойтись", "океана", "тренировки", "правильным", "негодяй", "фиона", "мелани", "королеву", "попытку", "выбери", "сотовый", "собственном", "взрослая", "нормальные", "дойл", "платил", "бойд", "наказать", "площадке", "труднее", "сбил", "домашний", "госпиталь", "чистой", "получаем", "мерфи", "департамента", "просите", "еле", "якобы", "назовите", "холл", "гостинице", "рисунок", "страховка", "расскажете", "сотрудник", "решим", "деб", "край", "приходишь", "духом", "хранит", "преданность", "спрашивают", "закрыл", "животе", "заседание", "проход", "наличные", "злится", "комитета", "шлем", "отпустил", "продвигается", "славу", "изменили", "ухода", "сопротивление", "мечту", "ублюдка", "обязанность", "американец", "организация", "инструмент", "родная", "приблизительно", "защищал", "местам", "мусора", "признателен", "почта", "охотиться", "магию", "просыпайся", "пищу", "перестанешь", "надежде", "чепуха", "гениально", "принимают", "дональд", "бабушкой", "собакой", "устройства", "отказать", "десятки", "запасной", "настоящих", "стефани", "обедать", "поезжай", "ожидали", "стоун", "означать", "благо", "вызывают", "приглашения", "слуга", "поддерживает", "новенький", "ученик", "добился", "большинства", "достань", "ферму", "президенту", "налоги", "ворот", "томаса", "реальный", "калеб", "изучить", "выстрелы", "покер", "адвокату", "держала", "отчаянии", "белое", "автомобиля", "невесту", "важного", "лайла", "белым", "везет", "майлз", "несчастью", "жалкий", "счастливчик", "воу", "прислала", "голосов", "выдать", "встретился", "судебный", "обедом", "финч", "проверки", "подойду", "сары", "найдётся", "позови", "придурки", "требуют", "находитесь", "врет", "бабушке", "подарила", "поздороваться", "новому", "выступления", "великолепный", "помолчи", "адама", "сиденье", "харпер", "джанет", "исключение", "лезть", "прессе", "маршрут", "посетителей", "нельсон", "комиссии", "молитвы", "близких", "счету", "слежу", "экран", "встречала", "дверей", "волновался", "ритм", "сделало", "воспользовался", "девочке", "кэлли", "пришлю", "мн", "ангела", "пассажиров", "депрессии", "волнуешься", "ответов", "четко", "магазинам", "наряд", "воздухом", "поймаем", "непонятно", "подтверждение", "клёво", "славный", "бедняга", "жениха", "важных", "любитель", "складе", "шагом", "руководство", "полезен", "карман", "франков", "улыбаться", "простит", "продолжают", "яблоко", "романа", "выбираю", "прочитала", "нашло", "построили", "вайолет", "сексуальные", "поймёшь", "умеете", "способы", "положу", "чудесная", "схватили", "фирме", "праздновать", "явился", "рассказываешь", "соединенных", "персонаж", "изучать", "всякого", "американской", "сыром", "вертолет", "броуди", "сайте", "процедура", "гроб", "чистого", "положиться", "андреа", "сексуальной", "ноутбук", "пьет", "дождусь", "открытым", "убило", "уроков", "аэропорта", "хью", "кэл", "йоу", "языка", "передумала", "бегу", "дамочка", "потеряем", "проявить", "легкие", "тардис", "добровольно", "возьмет", "сниму", "драку", "форд", "черного", "глазом", "кошки", "поколение", "понимала", "делая", "собственная", "крутые", "готовиться", "пили", "сопротивляться", "констебль", "вивиан", "штаты", "продолжаешь", "отдохни", "фантазии", "микрофон", "иной", "клэй", "прекрасную", "настал", "конни", "теряешь", "жаловаться", "боевой", "дядю", "голосовать", "противостоять", "планирует", "уведите", "заслужили", "незачем", "прощаю", "го", "моста", "значительно", "назначил", "бш", "добрая", "историей", "личных", "волновалась", "драка", "пальцами", "предпочла", "бегах", "блондинка", "поверили", "мэдди", "кай", "отведи", "разбить", "произнести", "свести", "проверяю", "историй", "порядка", "начнешь", "гари", "олли", "оставался", "прекрасным", "печени", "библии", "трэвис", "поищу", "субтитров", "оо", "яиц", "злая", "толстый", "легких", "мертвый", "безопаснее", "орошо", "бри", "энджи", "следили", "исследований", "птичка", "работ", "пропуск", "отнести", "справляешься", "вступить", "миг", "двум", "нормальная", "разочарован", "продолжаю", "свидетельство", "цепи", "серийный", "замка", "трахнуть", "ёй", "съем", "выходим", "нм", "заставляют", "заехать", "противном", "приедешь", "настаиваю", "простого", "падения", "ребятами", "маленькими", "имея", "лифте", "адвокатов", "лечить", "следуй", "выиграю", "выживет", "дополнительные", "постараться", "преодолеть", "свиньи", "страницы", "хилл", "велик", "река", "традиции", "расстояние", "джоном", "рискнуть", "предположение", "журнала", "поиска", "царь", "уайт", "грэм", "охотится", "разрешить", "лист", "утрам", "случаем", "совещание", "услугам", "поправится", "вытащи", "дракон", "возражаю", "битве", "колено", "удостоверение", "гитлер", "композитор", "крепкий", "атака", "шона", "открытия", "старом", "вспоминаю", "разберёмся", "расслабьтесь", "попытайся", "мик", "попадает", "впрямь", "испании", "изначально", "освобождения", "посетить", "обвинять", "происходят", "палмер", "жюри", "зайди", "причинил", "взгляда", "ку", "прикольно", "рей", "величества", "девочками", "бинго", "марии", "пределы", "подонок", "высокие", "висит", "чокнутый", "устроит", "ушло", "убивала", "переспал", "спускайся", "решением", "копать", "учительница", "близнецы", "прах", "зрелище", "рекламы", "министерство", "обморок", "органов", "трудный", "требования", "доусон", "четверть", "помощника", "ареста", "завтрашнего", "половине", "конверт", "времён", "полли", "соответствии", "соревнование", "усердно", "четвертый", "нервничать", "ри", "похуже", "продают", "ремень", "курсы", "местонахождение", "открывает", "говно", "трой", "плечи", "флоррик", "оставляй", "ответили", "достанется", "чьей", "долгие", "кораблей", "насквозь", "обратном", "исполнилось", "выстрела", "использование", "приедут", "условии", "шеи", "убивали", "кошмары", "состав", "дядей", "теста", "соберись", "странного", "достиг", "священника", "останки", "штатах", "макса", "покупает", "ударили", "июня", "лука", "признай", "теорию", "собственными", "цирк", "обнять", "велосипеде", "высоте", "мэнди", "поют", "вскрытие", "дозу", "собрали", "отличным", "музыке", "игроков", "любовник", "хуя", "ехали", "соседству", "пламя", "доллара", "пожертвовать", "повидать", "покупки", "необходимое", "проблемах", "уважаемый", "берёт", "черных", "подумают", "основании", "собственности", "домашнее", "операционной", "стиви", "поссорились", "фирму", "следа", "погнали", "интересуют", "знакомству", "кейн", "мелкие", "передача", "благодарим", "гонки", "тэд", "клер", "услышишь", "противника", "кэри", "директором", "верим", "кучка", "николас", "проводишь", "ограбления", "врагом", "багажнике", "фостер", "шефа", "взгляды", "малый", "забавная", "исчезает", "развития", "няня", "клево", "серьезный", "уход", "обидно", "область", "пожелаешь", "пушка", "лежат", "пространства", "хон", "кабинета", "кону", "диего", "отто", "марио", "сломался", "охранять", "профессионал", "округ", "назначена", "чувствовали", "гарантирую", "вдвое", "целыми", "вытащу", "обещания", "заговор", "выходишь", "аллен", "покажется", "задержали", "монстра", "уволил", "учусь", "поторопиться", "обдумать", "замену", "смирно", "дружбу", "вуди", "грейсон", "снизу", "строя", "остановимся", "духов", "заявить", "руководитель", "клятву", "пофиг", "началом", "ввести", "альфред", "несешь", "давненько", "проследить", "ви", "довериться", "познакомься", "завод", "евреев", "стереть", "скотина", "властью", "особое", "поцеловала", "кристиан", "билла", "цел", "напоминать", "желаешь", "доставили", "поверите", "срочное", "отпуске", "позовите", "великие", "любимого", "провал", "маслом"])

      const isLatin = (ch) => /[a-z]/.test(ch)
      const isCyrillic = (ch) => /[\u0430-\u044f\u0451]/.test(ch)
      const translit = (word, map) => {
        let out = ''
        for (const ch of word.toLowerCase()) out += map[ch] !== undefined ? map[ch] : ch
        return out
      }
      const ruWordFraction = (text) => {
        // доля слов текста, присутствующих в частотном словаре
        const words = text.toLowerCase().split(/[^а-яё]+/).filter(Boolean)
        if (!words.length) return 0
        const hit = words.filter((w) => FREQ.has(w)).length
        return hit / words.length
      }
      const layoutFixCandidate = (value, direction) => {
        // direction: 'lat2cyr' | 'cyr2lat'. Возвращает {converted} если подозрительно.
        if (direction === 'lat2cyr') {
          const converted = translit(value, LAYOUT_LAT_TO_CYR)
          if (!/[а-яё]{2}/.test(converted)) return null
          if (ruWordFraction(converted) < 0.7) return null
          return { converted }
        } else {
          // cyr2lat только для команды в инпуте (/...)
          const converted = translit(value, LAYOUT_CYR_TO_LAT)
          if (!converted.startsWith('/')) return null
          return { converted }
        }
      }

      // Отвечаем на real input: input / input_event, слушаем на document.
      // Читаем value у поля, где курсор (textarea/input), не трогая contenteditable.
      let layoutHintEl = null
      const layoutCurrentInput = () => {
        const el = document.activeElement
        if (el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type === 'text'))) return el
        return null
      }
      const layoutDismiss = () => {
        if (layoutHintEl) { layoutHintEl.remove(); layoutHintEl = null }
      }
      const layoutShowHint = (inputEl, converted, direction) => {
        layoutDismiss()
        layoutHintEl = document.createElement('div')
        layoutHintEl.dataset.russianLangLayout = '1'
        Object.assign(layoutHintEl.style, {
          position: 'fixed', zIndex: '99999', background: '#fff', color: '#000',
          border: '1px solid #888', borderRadius: '8px', padding: '6px 10px',
          fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,.2)', cursor: 'pointer'
        })
        const label = direction === 'cyr2lat' ? 'Команда, не та раскладка' : 'Не та раскладка'
        layoutHintEl.textContent = label + ': ' + converted
        layoutHintEl.addEventListener('mousedown', (ev) => {
          ev.preventDefault()
          inputEl.value = converted
          inputEl.dispatchEvent(new Event('input', { bubbles: true }))
          layoutDismiss()
        })
        document.body.appendChild(layoutHintEl)
        // позиция над инпутом
        const r = inputEl.getBoundingClientRect()
        layoutHintEl.style.left = (r.left + 8) + 'px'
        layoutHintEl.style.bottom = (window.innerHeight - r.top + 6) + 'px'
      }
      const layoutOnInput = () => {
        try {
          if (runtime.getLocale().active !== 'ru') { layoutDismiss(); return }
          const el = layoutCurrentInput()
          if (!el) { layoutDismiss(); return }
          const value = el.value || ''
          if (value.trim().length < 4) { layoutDismiss(); return }
          // lat2cyr: если есть латиница и почти нет кириллицы
          const latCount = (value.match(/[a-z]/g) || []).length
          const cyrCount = (value.match(/[\u0430-\u044f\u0451]/g) || []).length
          if (latCount > cyrCount && cyrCount === 0) {
            const c = layoutFixCandidate(value, 'lat2cyr')
            if (c) { layoutShowHint(el, c.converted, 'ru'); return }
          }
          // cyr2lat: если всё кириллица и начинается с /
          if (cyrCount > 0 && latCount === 0 && value.trim().startsWith('/')) {
            const c = layoutFixCandidate(value, 'cyr2lat')
            if (c) { layoutShowHint(el, c.converted, 'cmd'); return }
          }
          layoutDismiss()
        } catch (err) { /* ignore */ }
      }
      const unsubscribeLayout = runtime.subscribe(layoutOnInput)
      document.addEventListener('input', layoutOnInput, true)
      document.addEventListener('keydown', (ev) => {
        // Alt+л (Latin 'l' код) ручной конверт текущего инпута
        if (ev.altKey && !ev.ctrlKey && !ev.metaKey && ev.key.toLowerCase() === 'l') {
          const el = layoutCurrentInput()
          if (el) {
            const value = el.value || ''
            const c = layoutFixCandidate(value, 'lat2cyr') || layoutFixCandidate(value, 'cyr2lat')
            if (c) {
              ev.preventDefault()
              el.value = c.converted
              el.dispatchEvent(new Event('input', { bubbles: true }))
            }
          }
        }
      }, true)
      ctx.effect(() => {
        unsubscribeLayout()
        document.removeEventListener('input', layoutOnInput, true)
        layoutDismiss()
      }, 'dsh-russian-lang: layout')
    }

    module.exports = { apply, inject: ['locale', 'connection', 'remote', 'settingsScope'] }
    return module.exports
  },
})
