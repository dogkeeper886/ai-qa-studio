# AI QA Workflow Agent - Design Guidelines

## Core Design Principles

### 1. Simplicity First
- **One format to rule them all**: Use markdown for command definitions
- **No complex schemas**: Plain text that humans can read and edit
- **Minimal tooling**: Simple scripts, not complex frameworks

### 2. Duplication Elimination
- **Define once, use everywhere**: Single source of truth for each command
- **Skills route to commands**: No duplicated logic between layers
- **Layered architecture**: Skills (routers) → Commands (operations) → MCP tools

### 3. Human-Centric Design
- **Readable definitions**: Markdown files that tell a story
- **Self-documenting**: Code that explains itself
- **Easy maintenance**: Update one place, fix everywhere

## Command Definition Standards

### File Structure
```
commands/
├── test-generation.md
├── code-review.md
└── bug-analysis.md
```

### Markdown Template
```markdown
# Command Name

## Purpose
Clear, one-sentence description of what this does

## Input
- parameter_name (type): Description
- another_param (type, optional): Description

## Process
1. Step one
2. Step two
3. Step three

## Output
What gets created or modified

```
