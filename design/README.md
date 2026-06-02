# design/ — wireframes & the component framework

The **design source of truth** for AI QA Studio screens. Wireframes are static
HTML/CSS — no build step, no app runtime — so screens can be designed and reviewed
before any frontend code exists.

## wireframes/

| File | What |
|------|------|
| `tokens.css` | design tokens (single source) — neutral black/grey/white + semantic, light & dark themes |
| `components.css` | styles for the `qa-*` light-DOM custom elements, keyed by tag |
| `components.js` | the element definitions (`<qa-app>`, `<qa-sidebar>`, `<qa-topbar>`, `<qa-rail>`, `<qa-drawer>`, `<qa-field>`, `<qa-btn>`, `<qa-toggle>`, `<qa-gate-card>`, `<qa-decision>`, `<qa-md-viewer>`) |
| `components.html` | the **living reference** — every component composed, in one page |

A screen = `tokens.css` + `components.css` + `components.js` (defer), then compose
`<qa-*>` elements. Open any `.html` directly in a browser; add `?theme=dark` for dark.

## Conventions

- **Target-agnostic core.** No vendor names. Brand is neutral ("AI QA Studio"),
  set per-screen via `qa-sidebar brand="…"`. Vendor specifics belong in a profile, not here.
- **Add a component the one defined way** — see the recipe in `components.js`'s header:
  define it there → style it by tag in `components.css` → add it to `components.html`.
  Don't hand-author shared markup in a screen.
- **Tokens only** — components use `tokens.css` variables, never literal colours/sizes,
  so everything re-themes for free.

Ported (de-R1'd) from `../r1-qa-studio/design/wireframes/` — see issue #6.
