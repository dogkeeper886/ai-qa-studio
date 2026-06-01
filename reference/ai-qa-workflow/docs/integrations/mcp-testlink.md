# MCP TestLink Configuration

Provides TestLink API access for test case CRUD, test plan management, and execution recording.

## Repository

https://github.com/dogkeeper886/testlink-mcp

## Claude Code CLI

```bash
claude mcp add testlink -- docker run --rm -i \
  -e TESTLINK_URL=http://<TESTLINK_HOST>/testlink \
  -e TESTLINK_API_KEY=your_api_key_here \
  dogkeeper886/testlink-mcp:latest
```

## JSON Configuration

```json
{
  "mcpServers": {
    "testlink": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e", "TESTLINK_URL",
        "-e", "TESTLINK_API_KEY",
        "dogkeeper886/testlink-mcp:latest"
      ],
      "env": {
        "TESTLINK_URL": "http://<TESTLINK_HOST>/testlink",
        "TESTLINK_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TESTLINK_URL` | TestLink instance URL (e.g., `http://<TESTLINK_HOST>/testlink`) |
| `TESTLINK_API_KEY` | TestLink API key (generate from TestLink user settings) |
