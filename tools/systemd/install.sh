#!/usr/bin/env bash
# Установка ночного апстрим-чека как user-таймера (не требует root при
# включённом linger, либо просто cron-строкой ниже). Прокси из crontab
# подхватывается автоматически.
set -eu
REPO=${1:-/mnt/external/Project/DEV/dhsplugins/dsh-russian-lang}
echo "Запуск вручную: python3 tools/upstream_check.py"
echo "Cron-строка (04:17 ежедневно):"
echo "17 4 * * * cd $REPO && /usr/bin/python3 tools/upstream_check.py >> ~/.dsh-upstream-check.log 2>&1"
