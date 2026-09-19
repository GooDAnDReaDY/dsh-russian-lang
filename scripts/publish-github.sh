#!/usr/bin/env bash
#
# Sanitized publication to a mirror remote (GitHub).
#
# Gitea is the source of truth: branches, tags, issues, PRs and the full history,
# including build sources and internal tooling. A mirror is a *product* channel, so
# the published tree carries only product files — never agent instructions, plans,
# build sources, caches or infrastructure documents.
#
# Usage:
#   ./scripts/publish-github.sh --check                # read-only: what would go
#   ./scripts/publish-github.sh --push  <gitea-ref>    # publish a sanitized tree
#
# The allowlist is the package's own `files` field (i.e. exactly what npm ships)
# plus the repository files a reader needs: .gitignore, LICENSE, README*.md,
# CHANGELOG.md, package.json, cordis.patch.yml.
#
# What --push does:
#   1. builds that tree from <gitea-ref>;
#   2. refuses to publish when a forbidden path or a required product file is missing;
#   3. creates ONE commit on top of the mirror branch carrying the tree and pushes it
#      as a normal fast-forward — never a force;
#   4. prints the Gitea SHA -> mirror SHA correspondence for the release notes.
#
# Rewriting mirror history is a destructive operation on a published channel and is
# deliberately not implemented. Removing a file from *past* mirror history requires
# recreating the mirror repository and an explicit owner decision.
#
# Environment: MIRROR_REMOTE (default github), MIRROR_BRANCH (default main).
set -euo pipefail

MIRROR_REMOTE="${MIRROR_REMOTE:-github}"
MIRROR_BRANCH="${MIRROR_BRANCH:-main}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Repository files a reader needs, on top of the package's npm contents.
EXTRA_ALLOW=(
  ".gitignore"
  "LICENSE"
  "README.md"
  "README.ru.md"
  "README.zh.md"
  "CHANGELOG.md"
  "package.json"
  "cordis.patch.yml"
)

# Never publish these, even if they sneak into the allowlist.
FORBIDDEN=(
  "AGENTS.md"
  "index.md"
  "deploy.sh"
  ".gitea"
  ".worktrees"
  ".planning"
  "__pycache__"
  ".ruff_cache"
  ".venv"
  "node_modules"
)

mode=""
gitea_ref=""
for arg in "$@"; do
  case "$arg" in
    --check) mode="check" ;;
    --push) mode="push" ;;
    -*) echo "unknown option: $arg" >&2; exit 2 ;;
    *) gitea_ref="$arg" ;;
  esac
done

if [ -z "$mode" ]; then
  echo "usage: ./scripts/publish-github.sh --check | --push <gitea-ref>" >&2
  exit 2
fi
if [ "$mode" = "push" ] && [ -z "$gitea_ref" ]; then
  echo "usage: ./scripts/publish-github.sh --push <gitea-ref>" >&2
  exit 2
fi

cd "$REPO_DIR"

# The allowlist comes from the package manifest of the ref being published.
ALLOW=("${EXTRA_ALLOW[@]}")
while IFS= read -r entry; do
  [ -n "$entry" ] && ALLOW+=("${entry%/}" )
done < <(git show "${gitea_ref:-origin/main}:package.json" | node -e '
  let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
    try{const p=JSON.parse(s);for(const f of (p.files||[])) console.log(f.replace(/\/\*\*$/,""));}catch(e){}
  });')

is_allowed() {
  local path="$1" entry
  for entry in "${ALLOW[@]}"; do
    if [ "$path" = "$entry" ]; then return 0; fi
    case "$path" in "$entry"/*) return 0 ;; esac
  done
  return 1
}

is_forbidden() {
  local path="$1" entry
  for entry in "${FORBIDDEN[@]}"; do
    if [ "$path" = "$entry" ]; then return 0; fi
    case "$path" in "$entry"/*) return 0 ;; esac
  done
  return 1
}

list_tree() {
  local ref="$1" path
  git ls-tree -r --name-only "$ref" | while IFS= read -r path; do
    if is_forbidden "$path"; then continue; fi
    if is_allowed "$path"; then echo "$path"; fi
  done | LC_ALL=C sort
}

echo "repository : $REPO_DIR"
echo "mirror     : $MIRROR_REMOTE/$MIRROR_BRANCH"
echo

if [ "$mode" = "check" ]; then
  ref="${gitea_ref:-origin/main}"
  echo "WILL BE PUBLISHED (sanitized tree of $ref):"
  list_tree "$ref" | sed 's/^/  /'
  echo
  echo "WILL BE DROPPED (not product):"
  git ls-tree -r --name-only "$ref" | while IFS= read -r path; do
    if is_allowed "$path" && ! is_forbidden "$path"; then continue; fi
    echo "  $path"
  done
  exit 0
fi

source_sha="$(git rev-parse "$gitea_ref")"
mirror_sha="$(git rev-parse "$MIRROR_REMOTE/$MIRROR_BRANCH")"
echo "gitea ref  : $gitea_ref = $source_sha"
echo "mirror head: $MIRROR_REMOTE/$MIRROR_BRANCH = $mirror_sha"
echo

sanitized_list="$(mktemp)"
tmp_index="$(mktemp)"
trap 'rm -f "$sanitized_list" "$tmp_index"' EXIT
list_tree "$gitea_ref" > "$sanitized_list"

if list_tree "$gitea_ref" | while IFS= read -r path; do
     if is_forbidden "$path"; then echo "FORBIDDEN $path"; fi
   done | grep -q FORBIDDEN; then
  echo "refusing to publish: the sanitized list contains a forbidden path" >&2
  exit 3
fi

for required in package.json README.md; do
  if ! grep -qx "$required" "$sanitized_list"; then
    echo "refusing to publish: required product file missing: $required" >&2
    exit 4
  fi
done

echo "files to publish: $(wc -l < "$sanitized_list")"
sed 's/^/  /' "$sanitized_list"
echo

# A temporary index is used instead of `git mktree`: mktree accepts only single-level
# entries and refuses nested paths such as lib/client.js, while `update-index
# --cacheinfo` builds the intermediate trees for us.
GIT_INDEX_FILE="$tmp_index" git read-tree --empty
while IFS= read -r path; do
  blob="$(git rev-parse "$gitea_ref:$path")"
  GIT_INDEX_FILE="$tmp_index" git update-index --add --cacheinfo "100644,$blob,$path"
done < "$sanitized_list"
new_tree="$(GIT_INDEX_FILE="$tmp_index" git write-tree)"

new_commit="$(git commit-tree "$new_tree" -p "$mirror_sha" -m "chore(publish): sanitized tree from ${source_sha:0:8}")"
echo "new mirror commit: $new_commit"

git push "$MIRROR_REMOTE" "$new_commit:refs/heads/$MIRROR_BRANCH"

echo
echo "correspondence to record in the release notes:"
echo "  gitea  $source_sha"
echo "  mirror $new_commit"
