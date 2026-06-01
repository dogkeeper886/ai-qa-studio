# MCP Server Configuration Cheat Sheet

Quick reference for configuring MCP servers used by AI QA Workflow commands.

## Configuration Formats

Each MCP server can be configured in two ways:

- **Claude Code CLI** - `claude mcp add` commands for terminal-based setup
- **JSON Configuration** - JSON blocks for MCP-compatible IDEs

## MCP Servers

| Server | Purpose | Runtime Options |
|--------|---------|-----------------|
| [mcp-atlassian](mcp-atlassian.md) | Jira and Confluence API access | Docker, uvx |
| [mcp-testlink](mcp-testlink.md) | TestLink API access | Docker |
| [mcp-playwright](mcp-playwright.md) | Browser automation | NPX, Docker |
| [mcp-wpa](mcp-wpa.md) | WPA supplicant control | HTTP, Docker |
| [mcp-radius-sql](mcp-radius-sql.md) | RADIUS database queries | HTTP |
| [test-framework-template](test-framework-template.md) | Dual-judge test framework | N/A (not an MCP server) |

## Prerequisites

- **Docker** - Required for Docker-based configurations
- **Node.js** - Required for NPX-based configurations
- **Python/uv** - Required for uvx-based configurations
- **Claude Code CLI** - Required for `claude mcp add` commands

## Related Resources

- [Test Lifecycle Workflow](../workflows/test-lifecycle.md)
- [Design Principles](../design/)
