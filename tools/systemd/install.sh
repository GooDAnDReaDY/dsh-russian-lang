#!/usr/bin/env bash
set -eu
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
TARGET_DIR="${SYSTEMD_USER_DIR:-${HOME}/.config/systemd/user}"
mkdir -p "$TARGET_DIR"

SOURCE_SERVICE="$REPO/tools/systemd/dsh-upstream-check.service.template"
if [ ! -f "$SOURCE_SERVICE" ]; then
  SOURCE_SERVICE="$REPO/tools/systemd/dsh-upstream-check.service"
fi

sed "s|__REPO__|$REPO|g; s|__HOME__|$HOME|g" "$SOURCE_SERVICE" > "$TARGET_DIR/dsh-upstream-check.service"
cp -f "$REPO/tools/systemd/dsh-upstream-check.timer" "$TARGET_DIR/"

EXPORT_RUNTIME="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
if [ -z "${SYSTEMD_USER_DIR:-}" ]; then
  XDG_RUNTIME_DIR="$EXPORT_RUNTIME" systemctl --user daemon-reload
  XDG_RUNTIME_DIR="$EXPORT_RUNTIME" systemctl --user enable --now dsh-upstream-check.timer
fi

echo "✓ Upstream Watcher timer установлен в $TARGET_DIR"
