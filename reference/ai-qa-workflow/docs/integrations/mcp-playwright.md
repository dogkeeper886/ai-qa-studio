# MCP Playwright Configuration

Provides browser automation for end-to-end testing through Playwright.

## Repository

https://github.com/microsoft/playwright-mcp

## Claude Code CLI

### Option 1: NPX (Recommended)

```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

### Option 2: Docker

```bash
claude mcp add playwright -- docker run -i --rm --init --pull=always \
  mcr.microsoft.com/playwright/mcp
```

## JSON Configuration

### Option 1: NPX (Recommended)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Option 2: Docker

```json
{
  "mcpServers": {
    "playwright": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--init",
        "--pull=always",
        "mcr.microsoft.com/playwright/mcp"
      ]
    }
  }
}
```
