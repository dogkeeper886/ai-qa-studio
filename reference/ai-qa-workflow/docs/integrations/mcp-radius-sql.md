# MCP RADIUS SQL Configuration

Provides RADIUS database query access for authentication and accounting record lookups.

## Repository

https://github.com/dogkeeper886/ldap

## Claude Code CLI

```bash
claude mcp add radius-sql -t http \
  -H "Authorization: Bearer <BEARER_TOKEN>" \
  https://<RADIUS_HOST>/mcp
```

## JSON Configuration

```json
{
  "mcpServers": {
    "radius-sql": {
      "type": "http",
      "url": "https://<RADIUS_HOST>/mcp",
      "headers": {
        "Authorization": "Bearer <BEARER_TOKEN>"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BEARER_TOKEN` | Authentication token for the RADIUS MCP server |
| `RADIUS_HOST` | Hostname of the RADIUS MCP server |
