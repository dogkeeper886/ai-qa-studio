/**
 * Hub entrypoint. `HUB_FAKE=1` swaps the real ACP adapter for the scripted
 * fake agent (frontend dev without auth/credit). PORT overrides the port.
 */

import { startHub } from "./server.js";

const port = Number(process.env.PORT) || 5174;
const fake = process.env.HUB_FAKE === "1";

const server = await startHub({ port, fake });
const addr = server.address();
const actualPort = typeof addr === "object" && addr ? addr.port : port;
process.stderr.write(
  `[hub] http+ws on http://localhost:${actualPort}  (agent: ${fake ? "FAKE" : "real claude-code-acp"})\n` +
  `[hub]   GET  /api/stories         · GET /api/stories/:id\n` +
  `[hub]   WS   /ws/agent\n`,
);
