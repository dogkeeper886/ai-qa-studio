#!/usr/bin/env bash
# Build the gitignored .claude run-surface from workflow/ (the committed source
# of truth) so the Agent SDK / ACP adapter can load our skills + commands.
#
# Per CLAUDE.md: workflow/ holds one committed copy; .claude/{skills,commands}
# are linked on demand and never committed. Re-run any time workflow/ changes.
#
#   scripts/link-runsurface.sh
#
# Skills:   workflow/skills/{dev,qa,shared}/<skill>/SKILL.md
#             -> .claude/skills/<skill>            (Claude wants skill dirs flat)
# Commands: workflow/commands/{dev,qa,shared}/<ns>/<cmd>.md
#             -> .claude/commands/<ns>/<cmd>.md    (drop the dev|qa|shared group)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

rm -rf .claude/skills .claude/commands
mkdir -p .claude/skills .claude/commands

n_skills=0
while IFS= read -r skilldir; do
  name=$(basename "$skilldir")
  ln -s "$(realpath "$skilldir")" ".claude/skills/$name"
  n_skills=$((n_skills + 1))
done < <(find workflow/skills -name SKILL.md -printf '%h\n' | sort -u)

n_cmds=0
while IFS= read -r f; do
  rel=${f#workflow/commands/}   # e.g. qa/jira/jr-trace.md
  ns=${rel#*/}                  # jira/jr-trace.md  (strip the dev|qa|shared group)
  mkdir -p ".claude/commands/$(dirname "$ns")"
  ln -s "$(realpath "$f")" ".claude/commands/$ns"
  n_cmds=$((n_cmds + 1))
done < <(find workflow/commands -name '*.md' | sort)

echo "linked $n_skills skills, $n_cmds commands into .claude/ (gitignored)"
