# MCP WPA Configuration

Provides WPA supplicant control for wireless network testing and management.

## Repository

https://github.com/dogkeeper886/wpa-mcp

## Claude Code CLI

### Option 1: HTTP (Recommended)

```bash
claude mcp add wpa-mcp -t http http://<HOST_IP>:3000/mcp
```

### Option 2: Docker

```bash
claude mcp add wpa-mcp -- docker run -i --rm \
  -e WPA_HOST=<HOST_IP> \
  dogkeeper886/wpa-mcp:latest
```

## JSON Configuration

### Option 1: HTTP (Recommended)

```json
{
  "mcpServers": {
    "wpa-mcp": {
      "type": "http",
      "url": "http://<HOST_IP>:3000/mcp"
    }
  }
}
```

### Option 2: Docker

```json
{
  "mcpServers": {
    "wpa-mcp": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "WPA_HOST",
        "dogkeeper886/wpa-mcp:latest"
      ],
      "env": {
        "WPA_HOST": "<HOST_IP>"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HOST_IP` | IP address of the host running the WPA supplicant service |
| `WPA_HOST` | WPA supplicant host address (Docker mode only) |
