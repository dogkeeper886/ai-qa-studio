# AI QA Workflow - Command Installation Makefile
# DEPRECATED: Use agent-driven installation via CLAUDE.md instead.
# Tell your AI agent: "Read CLAUDE.md and install the commands I need"
# This Makefile is kept for backward compatibility only.
#
# Follows GNU Coding Standards conventions

# Installation directories
prefix      = $(HOME)
exec_prefix = $(prefix)
bindir      = $(exec_prefix)/bin
datarootdir = $(prefix)/share
datadir     = $(datarootdir)

# Claude Code specific directories
CLAUDE_DIR  = $(prefix)/.claude/commands

# Project directory for CLAUDE.md installation (defaults to current directory)
PROJECT_DIR = $(CURDIR)

# Source directories
SRCDIR        = commands
TEMPLATEDIR   = templates
SKILLS_SRCDIR = skills

# Claude Code skills directory
CLAUDE_SKILLS_DIR = $(prefix)/.claude/skills

# Installation command
INSTALL         = install
INSTALL_DATA    = $(INSTALL) -m 644

# All command files
COMMANDS = $(wildcard $(SRCDIR)/*/*.md)

# Template file
CLAUDE_MD_TEMPLATE = $(TEMPLATEDIR)/CLAUDE.md

# Marker to identify AI QA Workflow section
MARKER_START = \#\# AI QA Workflow
MARKER_END = <!-- End AI QA Workflow -->

.PHONY: all install install-claude install-workflow install-skills uninstall uninstall-workflow uninstall-skills clean help

# Default target
all:
	@echo "Run 'make install' to install commands"
	@echo "Run 'make help' for more options"

# Standard install target - installs commands and skills
install: install-claude install-skills
	@echo ""
	@echo "Installation complete."
	@echo "Restart your IDE to load the commands."
	@echo ""
	@echo "To add workflow guidance to your project's CLAUDE.md, run:"
	@echo "  make install-workflow PROJECT_DIR=/path/to/your/project"

# Install to Claude Code
install-claude:
	@echo "Installing commands to Claude Code..."
	@mkdir -p $(DESTDIR)$(CLAUDE_DIR)
	@for file in $(COMMANDS); do \
		$(INSTALL_DATA) $$file $(DESTDIR)$(CLAUDE_DIR)/; \
	done
	@echo "Commands installed to $(DESTDIR)$(CLAUDE_DIR)"

# Install skills to Claude Code
install-skills:
	@echo "Installing skills to Claude Code..."
	@mkdir -p $(DESTDIR)$(CLAUDE_SKILLS_DIR)
	@for skill_dir in $(SKILLS_SRCDIR)/*/; do \
		skill_name=$$(basename $$skill_dir); \
		mkdir -p $(DESTDIR)$(CLAUDE_SKILLS_DIR)/$$skill_name; \
		$(INSTALL_DATA) $$skill_dir/SKILL.md $(DESTDIR)$(CLAUDE_SKILLS_DIR)/$$skill_name/; \
	done
	@echo "Skills installed to $(DESTDIR)$(CLAUDE_SKILLS_DIR)"

# Install workflow guidance to project's CLAUDE.md
install-workflow:
	@echo "Installing AI QA Workflow to $(PROJECT_DIR)/CLAUDE.md..."
	@if [ -f "$(PROJECT_DIR)/CLAUDE.md" ]; then \
		if grep -q "$(MARKER_START)" "$(PROJECT_DIR)/CLAUDE.md"; then \
			echo "AI QA Workflow section already exists in $(PROJECT_DIR)/CLAUDE.md"; \
			echo "Use 'make uninstall-workflow' first to update."; \
		else \
			echo "" >> "$(PROJECT_DIR)/CLAUDE.md"; \
			cat "$(CLAUDE_MD_TEMPLATE)" >> "$(PROJECT_DIR)/CLAUDE.md"; \
			echo "" >> "$(PROJECT_DIR)/CLAUDE.md"; \
			echo "$(MARKER_END)" >> "$(PROJECT_DIR)/CLAUDE.md"; \
			echo "Appended AI QA Workflow to existing $(PROJECT_DIR)/CLAUDE.md"; \
		fi \
	else \
		echo "# CLAUDE.md" > "$(PROJECT_DIR)/CLAUDE.md"; \
		echo "" >> "$(PROJECT_DIR)/CLAUDE.md"; \
		echo "This file provides guidance to Claude Code when working with this repository." >> "$(PROJECT_DIR)/CLAUDE.md"; \
		echo "" >> "$(PROJECT_DIR)/CLAUDE.md"; \
		cat "$(CLAUDE_MD_TEMPLATE)" >> "$(PROJECT_DIR)/CLAUDE.md"; \
		echo "" >> "$(PROJECT_DIR)/CLAUDE.md"; \
		echo "$(MARKER_END)" >> "$(PROJECT_DIR)/CLAUDE.md"; \
		echo "Created $(PROJECT_DIR)/CLAUDE.md with AI QA Workflow"; \
	fi

# Uninstall - remove installed commands
uninstall: uninstall-skills
	@echo "Removing installed commands..."
	@rm -f $(DESTDIR)$(CLAUDE_DIR)/*.md
	@rmdir $(DESTDIR)$(CLAUDE_DIR) 2>/dev/null || true
	@echo "Commands uninstalled."

# Uninstall skills from Claude Code
uninstall-skills:
	@echo "Removing installed skills..."
	@for skill_dir in $(SKILLS_SRCDIR)/*/; do \
		skill_name=$$(basename $$skill_dir); \
		rm -rf $(DESTDIR)$(CLAUDE_SKILLS_DIR)/$$skill_name; \
	done
	@echo "Skills uninstalled."

# Remove AI QA Workflow section from project's CLAUDE.md
uninstall-workflow:
	@echo "Removing AI QA Workflow from $(PROJECT_DIR)/CLAUDE.md..."
	@if [ -f "$(PROJECT_DIR)/CLAUDE.md" ]; then \
		if grep -q "$(MARKER_START)" "$(PROJECT_DIR)/CLAUDE.md"; then \
			sed -i '/$(MARKER_START)/,/$(MARKER_END)/d' "$(PROJECT_DIR)/CLAUDE.md"; \
			echo "Removed AI QA Workflow section from $(PROJECT_DIR)/CLAUDE.md"; \
		else \
			echo "AI QA Workflow section not found in $(PROJECT_DIR)/CLAUDE.md"; \
		fi \
	else \
		echo "$(PROJECT_DIR)/CLAUDE.md does not exist"; \
	fi

# Clean - nothing to clean in source directory
clean:
	@echo "Nothing to clean."

# Help message
help:
	@echo "AI QA Workflow - Command Installation"
	@echo ""
	@echo "Targets:"
	@echo "  make                  - Show this help"
	@echo "  make install          - Install commands + skills to Claude Code"
	@echo "  make install-claude   - Install commands to Claude Code only"
	@echo "  make install-skills   - Install skills to Claude Code only"
	@echo "  make install-workflow - Add workflow guidance to project's CLAUDE.md"
	@echo "  make uninstall        - Remove installed commands"
	@echo "  make uninstall-skills - Remove installed skills"
	@echo "  make uninstall-workflow - Remove workflow section from CLAUDE.md"
	@echo "  make help             - Show this help message"
	@echo ""
	@echo "Skills (9 total) installed to:"
	@echo "  ~/.claude/skills/<name>/SKILL.md"
	@echo ""
	@echo "Variables (GNU standard):"
	@echo "  prefix=DIR       - Installation prefix (default: HOME)"
	@echo "  DESTDIR=DIR      - Stage installation to DIR (for packaging)"
	@echo "  PROJECT_DIR=DIR  - Target project for CLAUDE.md (default: current dir)"
	@echo ""
	@echo "Examples:"
	@echo "  make install                              # Install to ~/.claude"
	@echo "  make install-workflow                     # Add workflow to ./CLAUDE.md"
	@echo "  make install-workflow PROJECT_DIR=~/myapp # Add workflow to ~/myapp/CLAUDE.md"
	@echo "  make uninstall-workflow PROJECT_DIR=~/myapp"
	@echo "  make uninstall                            # Remove all installed commands"
