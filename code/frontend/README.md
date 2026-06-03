# code/frontend — AI QA Studio web GUI

Vite + React + TS. **Reuses the design framework verbatim** — imports
`design/wireframes/{tokens.css,components.css,components.js}` directly and composes
the `qa-*` custom elements (the parity payoff: the wireframe *is* the GUI, by reuse).

```bash
# 1) start the hub (separate terminal): cd ../hub && make serve-fake
make install
make dev            # http://localhost:5173 — proxies /api + /ws to the hub :5174
```

- Brand via `VITE_APP_NAME` (defaults to "AI QA Studio").
- Today: the **stories view** — the shell + the live `docs/stories/` list from the hub,
  with loading / empty / error states (`.qa-empty`). The read view and the chat panel
  (#4 / #13) build on this foundation.
