#!/usr/bin/env bash
set -eu
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
TARGET_DIR="${HOME}/.config/systemd/user"
mkdir -p "$TARGET_DIR"
cp "-f" "$REPO/tools/systemd/dsh-upstream-check.service" "$TARGET_DIR/"
cp "-f" "$REPO/tools/systemd/dsh-upstream-check.timer" "$TARGET_DIR/"

EXPORT_RUNTIME="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
XDG_RUNTIME_DIR="$EXPORT_RUNTIME" systemctl --user daemon-reload || true
XDG_RUNTIME_DIR="$EXPORT_RUNTIME" systemctl --user enable --now dsh-upstream-check.timer || true

echo "𝟐 Upstream Watcher timer ôstanovlen v $TARGET_DIR"
