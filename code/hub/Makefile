# code/hub — AI QA Studio hub.
#   make install     — npm deps (idempotent)
#   make serve       — real ACP agent (needs ~/.claude creds; .claude surface is committed)
#   make serve-fake  — scripted fake agent (no auth/credit; for frontend dev)
#   make type-check  — tsc --noEmit
.DEFAULT_GOAL := help
.PHONY: help install serve serve-fake type-check
help:
	@awk 'BEGIN{FS=" *— *"} /^#   make / { sub(/^#   /,""); printf "  %s\n",$$0 }' $(MAKEFILE_LIST)
node_modules: package.json
	npm install --no-audit --no-fund && touch node_modules
install: node_modules
serve: node_modules
	npm run --silent serve
serve-fake: node_modules
	npm run --silent serve:fake
type-check: node_modules
	npm run --silent type-check
