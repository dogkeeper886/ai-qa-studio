# Makefile — the studio's front door. One place to run the whole product, so you
# don't have to remember which process goes in which terminal. Delegates to the
# per-part makes in code/hub and code/frontend (which still work standalone) —
# this gathers them, it doesn't replace them.
#
#   make            — list these commands
#   make up         — start the studio (hub + frontend); HUB=real for the real agent
#   make down       — stop the studio cleanly (no leftover processes)
#   make install    — install deps for both parts
#
# `up` backgrounds each part in its own process group (setsid) and records the
# group id under .run/; `down` signals the whole group, so the make/npm/node
# children all stop together. Output lands in .run/<part>.log. .run/ is gitignored.
.DEFAULT_GOAL := help

# Fake agent by default — no creds or credit needed. HUB=real uses the real
# claude-code-acp adapter (needs ~/.claude); see code/hub/README.md.
HUB ?= fake
HUB_TARGET := $(if $(filter real,$(HUB)),serve,serve-fake)
RUN := .run

.PHONY: help up down install _spawn

help:
	@awk 'BEGIN{FS=" *— *"} /^#   make / { sub(/^#   /,""); printf "  %s\n",$$0 }' $(MAKEFILE_LIST)

install:
	@$(MAKE) -C code/hub install
	@$(MAKE) -C code/frontend install

up: install
	@command -v setsid >/dev/null 2>&1 || { echo "setsid required (util-linux)"; exit 1; }
	@mkdir -p $(RUN)
	@$(MAKE) --no-print-directory _spawn P=hub      D=code/hub      T=$(HUB_TARGET)
	@$(MAKE) --no-print-directory _spawn P=frontend D=code/frontend T=dev
	@echo "studio up:"
	@echo "  studio:  http://localhost:5173"
	@echo "  hub:     http://localhost:5174  (agent: $(HUB))"
	@echo "logs: $(RUN)/*.log   ·   stop: make down"

down:
	@for p in frontend hub; do \
	  f=$(RUN)/$$p.pgid; \
	  if [ -f $$f ] && kill -0 -"$$(cat $$f)" 2>/dev/null; then \
	    kill -TERM -"$$(cat $$f)" 2>/dev/null; echo "stopped $$p"; \
	  else echo "$$p not running"; fi; \
	  rm -f $$f; \
	done

# Internal: start one part ($(D)'s make $(T)) in its own process group, recording
# the group id (the setsid'd shell's own pid) so `down` can signal the whole tree.
_spawn:
	@if [ -f $(RUN)/$(P).pgid ] && kill -0 -"$$(cat $(RUN)/$(P).pgid)" 2>/dev/null; then \
	  echo "$(P) already running"; \
	else \
	  setsid sh -c 'echo $$$$ > $(RUN)/$(P).pgid; exec $(MAKE) -C $(D) $(T)' > $(RUN)/$(P).log 2>&1 & \
	  sleep 1; echo "started $(P)"; \
	fi
