# code/frontend — AI QA Studio web GUI (Vite + React + TS).
#   make install     — npm deps
#   make dev         — Vite dev server on :5173 (proxies /api + /ws to the hub :5174)
#   make build       — type-check + production build
#   make type-check  — tsc --noEmit
.DEFAULT_GOAL := help
.PHONY: help install dev build type-check
help:
	@awk 'BEGIN{FS=" *— *"} /^#   make / { sub(/^#   /,""); printf "  %s\n",$$0 }' $(MAKEFILE_LIST)
node_modules: package.json
	npm install --no-audit --no-fund && touch node_modules
install: node_modules
dev: node_modules
	npm run --silent dev
build: node_modules
	npm run --silent build
type-check: node_modules
	npm run --silent type-check
