# code/hub — AI QA Studio hub

The local backend. Two jobs (both proven in the POC, #9/#10):

- **HTTP** — serves the markdown source of truth: `GET /api/stories`, `GET /api/stories/:id`.
- **WebSocket** `/ws/agent` — bridges an **ACP** agent session. The browser is the ACP
  client; the hub spawns `claude-code-acp` and relays JSON-RPC stdio↔WS byte-for-byte.

```bash
make install
make serve-fake     # scripted fake agent — no auth/credit, for frontend dev
make serve          # real agent — needs ~/.claude creds; .claude surface is committed
```

- **Real mode** loads the committed `.claude` workflow surface (`.claude/commands` +
  `.claude/skills`) from the repo root — no build step.
  The adapter wraps the `claude` CLI (refuses to launch nested), so the hub clears
  `CLAUDECODE` when spawning it; auth comes from `~/.claude`.
- **Fake mode** (`HUB_FAKE=1`) impersonates a scripted agent — message → plan →
  tool call → a permission request → end_turn — so the GUI thread can be built
  deterministically without spending credit.

The frontend (`../frontend/`) proxies `/api` + `/ws` here in dev.
