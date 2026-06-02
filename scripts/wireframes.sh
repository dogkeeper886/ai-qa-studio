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
    docker rm -f "$NAME" >/dev/null 2>&1 && echo "stopped $NAME" || echo "$NAME not running"
    ;;
  status)
    docker ps --filter "name=$NAME" --format '{{.Names}}  {{.Status}}  {{.Ports}}'
    ;;
  logs)
    docker logs "$NAME"
    ;;
  *)
    echo "usage: $(basename "$0") [start|stop|status|logs]" >&2
    exit 1
    ;;
esac
