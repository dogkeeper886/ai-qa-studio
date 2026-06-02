# code/ — studio app (not embedded yet)

The web GUI / component framework is **not copied into this repo**. It is still being built in the sibling repo, where its file structure and markdown templates are still changing — embedding a copy now would only drift and need re-porting.

## Source of truth (look it up, don't copy)

Live at `../r1-qa-studio/` on this machine:

| What | Where |
|------|-------|
| Wireframes + component framework | `../r1-qa-studio/design/wireframes/` — `tokens.css`, `components.css`, `components.js`, `components.html`, `s*-*.html` screens |
| Web GUI (React + Vite) | `../r1-qa-studio/frontend/` |
| Agent runtime / hub (Agent SDK, TS) | `../r1-qa-studio/hub/` |
| Desktop shell (Tauri) | `../r1-qa-studio/src-tauri/` |
| Design-system spec | `../r1-qa-studio/docs/product/07_Web_UI_Design_System.md` |

## Plan

The component framework, tokens, and GUI shell are **generic core**. When they stabilise, **port them here deliberately** — de-R1'd, one piece at a time — rather than syncing raw. Until then, reference the sibling folder.
