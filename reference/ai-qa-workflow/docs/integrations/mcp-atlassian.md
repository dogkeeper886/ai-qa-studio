# MCP Atlassian Configuration

Provides Jira and Confluence API access for ticket tracing, page operations, and project management commands.

## Repository

https://github.com/sooperset/mcp-atlassian

## Claude Code CLI

### Option 1: Docker (Recommended)

```bash
claude mcp add mcp-atlassian -- docker run -i --rm \
  -e CONFLUENCE_URL \
  -e CONFLUENCE_USERNAME \
  -e CONFLUENCE_API_TOKEN \
  -e JIRA_URL \
  -e JIRA_USERNAME \
  -e JIRA_API_TOKEN \
  ghcr.io/sooperset/mcp-atlassian:latest
```

### Option 2: uvx

```bash
claude mcp add mcp-atlassian -- uvx mcp-atlassian \
  --confluence-url https://your-company.atlassian.net/wiki \
  --confluence-username your.email@company.com \
  --confluence-api-token your_confluence_api_token \
  --jira-url https://your-company.atlassian.net \
  --jira-username your.email@company.com \
  --jira-api-token your_jira_api_token
```

## JSON Configuration

### Option 1: Docker (Recommended)

```json
{
  "mcpServers": {
    "mcp-atlassian": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "CONFLUENCE_URL",
        "-e", "CONFLUENCE_USERNAME",
        "-e", "CONFLUENCE_API_TOKEN",
        "-e", "JIRA_URL",
        "-e", "JIRA_USERNAME",
        "-e", "JIRA_API_TOKEN",
        "ghcr.io/sooperset/mcp-atlassian:latest"
      ],
      "env": {
        "CONFLUENCE_URL": "https://your-company.atlassian.net/wiki",
        "CONFLUENCE_USERNAME": "your.email@company.com",
        "CONFLUENCE_API_TOKEN": "your_confluence_api_token",
        "JIRA_URL": "https://your-company.atlassian.net",
        "JIRA_USERNAME": "your.email@company.com",
        "JIRA_API_TOKEN": "your_jira_api_token"
      }
    }
  }
}
```

### Option 2: uvx

```json
{
  "mcpServers": {
    "mcp-atlassian": {
      "command": "uvx",
      "args": [
        "mcp-atlassian",
        "--confluence-url", "https://your-company.atlassian.net/wiki",
        "--confluence-username", "your.email@company.com",
        "--confluence-api-token", "your_confluence_api_token",
        "--jira-url", "https://your-company.atlassian.net",
        "--jira-username", "your.email@company.com",
        "--jira-api-token", "your_jira_api_token"
      ]
    }
  }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CONFLUENCE_URL` | Confluence instance URL (e.g., `https://your-company.atlassian.net/wiki`) |
| `CONFLUENCE_USERNAME` | Confluence account email |
| `CONFLUENCE_API_TOKEN` | Confluence API token |
| `JIRA_URL` | Jira instance URL (e.g., `https://your-company.atlassian.net`) |
| `JIRA_USERNAME` | Jira account email |
| `JIRA_API_TOKEN` | Jira API token |
