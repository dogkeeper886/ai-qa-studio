#!/usr/bin/env bash
# Serve design/wireframes/ over http for previewing wireframes — via a container,
# so it's host-independent and daemon-managed (survives across shells, unlike a
# bare `python -m http.server` whose process gets reaped in some environments).
#
#   scripts/wireframes.sh [start|stop|status|logs]   (default: start)
#   PORT=9000 scripts/wireframes.sh                  (override the port; default 8765)
#
# Reflects edits live (read-only bind mount) — just refresh the browser.
set -euo pipefail

NAME=aiqa-wireframes
PORT="${PORT:-8765}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR="$ROOT/design/wireframes"

command -v docker >/dev/null 2>&1 || { echo "docker not found — required to serve the wireframes" >&2; exit 1; }

# container id if it exists (any state), else empty — name match is anchored so it
# can't collide with a similarly-named container
cid() { docker ps -aq --filter "name=^${NAME}$"; }

case "${1:-start}" in
  start)
    [ -d "$DIR" ] || { echo "no wireframes dir at $DIR" >&2; exit 1; }
    docker rm -f "$NAME" >/dev/null 2>&1 || true
    docker run -d --name "$NAME" -p "$PORT:80" \
      -v "$DIR:/usr/share/nginx/html:ro" nginx:alpine >/dev/null
    echo "Serving $DIR"
    echo "  http://localhost:$PORT/components.html   (component catalog)"
    echo "  http://localhost:$PORT/stories.html      (+ ?theme=dark for dark mode)"
    echo "Stop with: scripts/wireframes.sh stop"
    ;;
  stop)
    if [ -n "$(cid)" ]; then docker rm -f "$NAME" >/dev/null; echo "stopped $NAME"
    else echo "$NAME not running"; fi
    ;;
  status)
    if [ -n "$(cid)" ]; then docker ps --filter "name=^${NAME}$" --format '{{.Names}}  {{.Status}}  {{.Ports}}'
    else echo "$NAME not running"; fi
    ;;
  logs)
    if [ -n "$(cid)" ]; then docker logs "$NAME"
    else echo "$NAME not running — start it first: $(basename "$0") start" >&2; exit 1; fi
    ;;
  *)
    echo "usage: $(basename "$0") [start|stop|status|logs]" >&2
    exit 1
    ;;
esac
