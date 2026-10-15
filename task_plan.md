# Task Plan: Release v0.3.46 (memoryMeter & Ecosystem Translations)

## Goal
Выпуск версии 0.3.46 плагина @goodandready/dsh-russian-lang:
- Перевод 28 ключей карточки настроек memoryMeter (Gitea #492).
- Перевод новых ключей экосистемы плагинов (DSH v0.2.1-alpha.2 / Prod) для достижения 100.0% эффективного покрытия.
- Сборка словарей, валидация лимита 256 KiB, прохождение тестов, PR, merge, deploy на прод, зеркалирование на GitHub и публикация в npm.

## Phases
- [ ] Phase 1: Локализация карточки настроек memoryMeter (Gitea #492) <!-- id: 1 -->
- [ ] Phase 2: Синхронизация и перевод новых ключей экосистемы плагинов <!-- id: 2 -->
- [ ] Phase 3: Сборка словарей и проверка покрытия (100.0%) <!-- id: 3 -->
- [ ] Phase 4: Проверка лимитов размеров файлов и тестирование <!-- id: 4 -->
- [ ] Phase 5: Документация (README, CHANGELOG, package.json 0.3.46) <!-- id: 5 -->
- [ ] Phase 6: Gitea PR, проверка diff, merge в main, тег v0.3.46 <!-- id: 6 -->
- [ ] Phase 7: Деплой на production MiniPC, рестарт и верификация dsh-web.service <!-- id: 7 -->
- [ ] Phase 8: Публикация в npm, зеркалирование на GitHub, GitHub Release <!-- id: 8 -->
- [ ] Phase 9: Закрытие Gitea issues #492, #500, cleanup worktree <!-- id: 9 -->

## Current Phase: Phase 1
## Next Step: Добавить 28 ключей в ru-plugins/71-memory-meter.json
