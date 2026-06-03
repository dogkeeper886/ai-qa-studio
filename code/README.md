# code/ — the studio app

The local-first studio app, built on this repo's own foundations (the ACP loop
proven in the POC, `../poc/acp/`; the design framework in `../design/wireframes/`).

| Dir | What | Status |
|-----|------|--------|
| [`hub/`](hub/) | the backend — serves `docs/stories/` over HTTP, bridges an **ACP** agent session over WebSocket (real `claude-code-acp` adapter, or a fake dev stream) | **building (#2)** |
| `frontend/` | the Vite + React + TS shell — imports the `design/wireframes/` framework verbatim (tokens/components) and renders the screens, wired to the hub | **building (#2)** |

In dev the frontend (Vite) serves the UI and proxies `/api` + `/ws` to the hub —
two processes, `make` in each. See [`hub/README.md`](hub/README.md).

## Why it's here now (it wasn't before)

This used to point at `../r1-qa-studio/` as the source of truth, deferring an embed
until things stabilised. Two things changed: the **ACP direction** (the POC) replaced
r1's bespoke Claude-SDK hub, and the **design framework** was ported here (#6). So the
app is built here directly — ACP-native and target-agnostic — reusing r1's frontend
*patterns* (React shell, Vite proxy) but not its event layer.
