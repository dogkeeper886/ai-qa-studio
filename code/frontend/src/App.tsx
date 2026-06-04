// The studio shell — composes the design framework VERBATIM (tokens + components
// + the qa-* custom elements from design/wireframes/) and renders the workbench
// live from the hub: a list of repos (active/) and, inside one, that repo's
// stories. Navigation is React state, so switching repos needs no restart.
import "../../../design/wireframes/tokens.css";
import "../../../design/wireframes/components.css";
import "../../../design/wireframes/components.js"; // side effect: defines qa-* + window.qaDoc
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import MarkdownIt from "markdown-it";
import { useAgent, type Attachment, type Command, type Option, type ThreadItem } from "./agent";

// Real markdown renderer for the doc viewer. html:false escapes any raw HTML in
// a story file (no script injection); the default preset gives GFM tables, and
// fenced blocks become <pre><code> — all styled by the design framework's
// qa-md-viewer .md rules. linkify turns bare URLs into links.
const markdown = new MarkdownIt({ html: false, linkify: true });

const BRAND = (import.meta.env.VITE_APP_NAME as string | undefined) ?? "AI QA Studio";
const REPOS_GRID = { gridTemplateColumns: "1fr 8rem" } as const;
const STORIES_GRID = { gridTemplateColumns: "7rem 1fr 6rem" } as const;
const ELLIPSIS = { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } as const;

interface Repo {
  name: string;
  hasStories: boolean;
}

interface Story {
  id: string;
  file: string;
  title: string;
}

type Phase = "loading" | "ok" | "error";

export default function App() {
  // null = the repo list (Projects); a name = that repo's stories page.
  const [repo, setRepo] = useState<string | null>(null);
  const active = repo ? "stories" : "projects";
  const crumb = repo ? `${BRAND} / ${repo} / Stories` : `${BRAND} / Projects`;

  // The sidebar nav links carry the wireframe's .html hrefs, which would do a
  // full-page navigation in the app. Intercept them and drive React state
  // instead: Projects → repo list. Inert items (no href) fall through.
  function onNav(e: React.MouseEvent) {
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (!href) return;
    e.preventDefault();
    if (href.endsWith("projects.html")) setRepo(null);
    // stories.html → already on the active repo's stories; stay put.
  }

  // qa-sidebar observes `active` and re-renders its nav in place, so it keeps
  // instance state (the collapse/expand choice) across navigation. qa-topbar is
  // stateless, so we just remount it by keying on the crumb.
  return (
    <qa-app>
      <qa-sidebar active={active} brand={BRAND} onClick={onNav}></qa-sidebar>
      <main>
        <qa-topbar key={crumb} crumb={crumb}></qa-topbar>
        <div className="qa-content">
          {repo === null ? <RepoList onOpen={setRepo} /> : <RepoStories repo={repo} onBack={() => setRepo(null)} />}
        </div>
      </main>
      <Assistant />
      <qa-md-viewer></qa-md-viewer>
    </qa-app>
  );
}

/** The repo list — the workbench's landing view, read live from active/. */
function RepoList({ onOpen }: { onOpen: (name: string) => void }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    let live = true;
    fetch("/api/repos")
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<{ repos: Repo[] }>; })
      .then((d) => { if (live) { setRepos(d.repos); setPhase("ok"); } })
      .catch(() => { if (live) setPhase("error"); });
    return () => { live = false; };
  }, []);

  return (
    <>
      <h1 className="pagehead">Projects</h1>
      <p className="pagesub">
        The repos in your workbench, read live from <code>active/</code> via the hub.
      </p>

      {phase === "loading" && <Cell kind="loading" icon="…" title="Loading projects…" />}
      {phase === "error" && (
        <Cell kind="error" icon="!" title="Couldn't reach the hub" sub="Is it running? `npm run serve:fake` in code/hub/." />
      )}
      {phase === "ok" && repos.length === 0 && (
        <Cell kind="" icon="∅" title="No projects yet" sub="Drop a repo under active/ to get started." />
      )}
      {phase === "ok" && repos.length > 0 && (
        <div className="table">
          <div className="thead" style={REPOS_GRID}>
            <div>Repo</div>
            <div></div>
          </div>
          {repos.map((r) => (
            <div key={r.name} className="trow" style={REPOS_GRID} onClick={() => onOpen(r.name)}>
              <div style={ELLIPSIS}>{r.name}</div>
              <div className="read">{r.hasStories ? "Open →" : "No stories"}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/** One repo's stories — the STORY-001 read view, now scoped to active/<repo>. */
function RepoStories({ repo, onBack }: { repo: string; onBack: () => void }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    let live = true;
    setPhase("loading");
    fetch(`/api/repos/${encodeURIComponent(repo)}/stories`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<{ stories: Story[] }>; })
      .then((d) => { if (live) { setStories(d.stories); setPhase("ok"); } })
      .catch(() => { if (live) setPhase("error"); });
    return () => { live = false; };
  }, [repo]);

  async function openStory(s: Story): Promise<void> {
    try {
      const res = await fetch(`/api/repos/${encodeURIComponent(repo)}/stories/${s.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`); // else the 404 JSON body renders as the story
      const src = await res.text();
      window.qaDoc?.open({ name: `${repo}/docs/stories/${s.file}`, rendered: markdown.render(src), source: src });
    } catch {
      /* story/repo vanished between list and click, or hub down — leave the list as-is */
    }
  }

  return (
    <>
      <a className="read" style={{ cursor: "pointer", display: "inline-block", marginBottom: ".5rem" }} onClick={onBack}>
        ← Projects
      </a>
      <h1 className="pagehead">{repo}</h1>
      <p className="pagesub">
        Stories in <code>{repo}/docs/stories/</code>, read live via the hub.
      </p>

      {phase === "loading" && <Cell kind="loading" icon="…" title="Loading stories…" />}
      {phase === "error" && (
        <Cell kind="error" icon="!" title="Couldn't reach the hub" sub="Is it running? `npm run serve:fake` in code/hub/." />
      )}
      {phase === "ok" && stories.length === 0 && (
        <Cell kind="" icon="∅" title="No stories yet" sub={`Add a STORY-NNN.md under ${repo}/docs/stories/.`} />
      )}
      {phase === "ok" && stories.length > 0 && (
        <div className="table">
          <div className="thead" style={STORIES_GRID}>
            <div>ID</div>
            <div>Title</div>
            <div></div>
          </div>
          {stories.map((s) => (
            <div key={s.id} className="trow" style={STORIES_GRID} onClick={() => void openStory(s)}>
              <div className="sid">{s.id}</div>
              <div style={ELLIPSIS}>{s.title}</div>
              <div className="read">Read →</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/** The assistant drawer wired to the live ACP loop. qa-drawer is a light-DOM
 *  custom element that builds its own chrome (header, .dbody, composer) on
 *  connect — so we let it build, then portal the React thread into its .dbody
 *  and wire the composer's textarea + send button. */
function Assistant() {
  const ref = useRef<HTMLElement>(null);
  const { items, status, commands, sendPrompt, respondPermission } = useAgent();
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [afford, setAfford] = useState<HTMLElement | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const boxRef = useRef<HTMLTextAreaElement | null>(null);

  // submit reads the live textarea + attachments; held in a ref so the static
  // composer event listeners (wired once below) always see current state.
  const submitRef = useRef(() => {});
  submitRef.current = () => {
    const box = boxRef.current;
    const text = box?.value ?? "";
    if (!text.trim() && attachments.length === 0) return;
    void sendPrompt(text, attachments);
    if (box) box.value = "";
    setAttachments([]);
    setPickerOpen(false);
  };

  useEffect(() => {
    const drawer = ref.current;
    if (!drawer) return;
    setBody(drawer.querySelector<HTMLElement>(".dbody"));
    setAfford(drawer.querySelector<HTMLElement>(".dafford"));
    const box = drawer.querySelector<HTMLTextAreaElement>(".dbox");
    boxRef.current = box;
    const btn = drawer.querySelector<HTMLButtonElement>(".dsend");
    const fire = () => submitRef.current();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); fire(); } };
    btn?.addEventListener("click", fire);
    box?.addEventListener("keydown", onKey);
    return () => { btn?.removeEventListener("click", fire); box?.removeEventListener("keydown", onKey); };
  }, []);

  const insertCommand = (name: string) => {
    const box = boxRef.current;
    if (box) { box.value = `/${name} `; box.focus(); }
    setPickerOpen(false);
  };
  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const read = await Promise.all([...files].map(async (f) => ({ name: f.name, text: await f.text() })));
    setAttachments((prev) => [...prev, ...read]);
  };

  return (
    <>
      <qa-drawer ref={ref} title="✦ Assistant" placeholder="Message the agent — ⏎ to send"></qa-drawer>
      {body && createPortal(<Thread items={items} status={status} respond={respondPermission} />, body)}
      {afford && createPortal(
        <Composer
          commands={commands}
          attachments={attachments}
          pickerOpen={pickerOpen}
          onTogglePicker={() => setPickerOpen((v) => !v)}
          onPickCommand={insertCommand}
          onBrowse={addFiles}
          onRemove={(i) => setAttachments((p) => p.filter((_, j) => j !== i))}
        />,
        afford,
      )}
    </>
  );
}

/** The composer affordances rendered into the drawer's .dafford slot: attachment
 *  chips, the Add-context (browse file) + Commands pills, and the command picker
 *  fed from the agent's live command list. */
function Composer({ commands, attachments, pickerOpen, onTogglePicker, onPickCommand, onBrowse, onRemove }: {
  commands: Command[];
  attachments: Attachment[];
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onPickCommand: (name: string) => void;
  onBrowse: (files: FileList | null) => void;
  onRemove: (i: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <>
      {pickerOpen && (
        <div className="dpicker">
          <div className="dpickhead">Commands</div>
          {commands.length === 0
            ? <div className="dpickempty">No commands available</div>
            : commands.map((c) => (
                <button className="dpickrow" type="button" key={c.name} onClick={() => onPickCommand(c.name)}>
                  <span className="dpickname">/{c.name}</span>
                  {c.description && <span className="dpickdesc">{c.description}</span>}
                </button>
              ))}
        </div>
      )}
      <div className="dctx">
        {attachments.map((a, i) => (
          <span className="ctxchip" key={`${a.name}-${i}`}>{a.name}<span className="x" title="Remove" onClick={() => onRemove(i)}>✕</span></span>
        ))}
        <button className="cchip" type="button" onClick={() => fileRef.current?.click()}>＋ Add context</button>
        <button className="cchip" type="button" onClick={onTogglePicker}>/ Commands</button>
      </div>
      <input ref={fileRef} type="file" multiple hidden onChange={(e) => { onBrowse(e.target.files); e.target.value = ""; }} />
    </>
  );
}

/** The agent thread: each item rendered by the matching qa-* component. The qa-*
 *  elements render once on connect, so items that mutate (tool status, plan,
 *  permission answer) are keyed by their changing parts to remount cleanly;
 *  the streaming text bubble is a plain div React updates in place. */
function Thread({ items, status, respond }: { items: ThreadItem[]; status: string; respond: (id: string | number, o: Option) => void }) {
  if (items.length === 0) {
    if (status === "error" || status === "closed") return <ChatEmpty error />;
    return <ChatEmpty />;
  }
  return (
    <>
      {items.map((it) => {
        const key =
          it.type === "tool" ? `${it.key}-${it.tool.status}-${it.tool.input.length}-${it.tool.output.length}`
          : it.type === "plan" ? `${it.key}-${it.entries.map((e) => e.status).join("")}`
          : it.type === "permission" ? `${it.key}-${it.answer ? "a" : "o"}`
          : it.key;
        return <ThreadRow key={key} item={it} respond={respond} />;
      })}
    </>
  );
}

function ThreadRow({ item, respond }: { item: ThreadItem; respond: (id: string | number, o: Option) => void }) {
  switch (item.type) {
    case "user": return <div className="msg user">{item.text}</div>;
    // The agent streams markdown (bold, lists, code, links) — render it, don't
    // show the raw source. html:false in the renderer escapes any embedded HTML.
    case "agent": return <div className="msg bot" dangerouslySetInnerHTML={{ __html: markdown.render(item.text) }} />;
    case "thought": return <div className="msg thought" dangerouslySetInnerHTML={{ __html: markdown.render(item.text) }} />;
    case "tool": {
      const t = item.tool;
      const body = [t.input, t.output].filter(Boolean).join("\n\n");
      return <qa-tool name={t.name} kind={t.kind} status={t.status} open={body ? true : undefined}>{body}</qa-tool>;
    }
    case "plan": return <qa-plan>{item.entries.map((e, i) => <div key={i} data-s={e.status}>{e.content}</div>)}</qa-plan>;
    case "permission": return <Permission item={item} respond={respond} />;
    case "turn": return <qa-turn outcome={item.outcome}></qa-turn>;
  }
}

/** Inline permission (qa-ask). qa-ask renders standard buttons labelled by the
 *  option names; we delegate clicks, match the label to its option, and answer. */
function Permission({ item, respond }: { item: Extract<ThreadItem, { type: "permission" }>; respond: (id: string | number, o: Option) => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (item.answer) return;
    const el = ref.current;
    if (!el) return;
    const onClick = (e: Event) => {
      const btn = (e.target as HTMLElement).closest("button");
      if (!btn) return;
      const opt = item.options.find((o) => o.name === btn.textContent?.trim());
      if (opt) respond(item.reqId, opt);
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [item, respond]);
  const opts = item.options.map((o) => `${o.name}|${o.kind}`).join(", ");
  const q = `Allow the agent to <code>${esc(item.title)}</code>?`;
  return <qa-ask ref={ref} label="Permission" q={q} options={opts} answered={item.answer ?? undefined}></qa-ask>;
}

/** The fresh-session state — mirrors the wireframe's #thread-empty. */
function ChatEmpty({ error }: { error?: boolean }) {
  if (error) return <Cell kind="error" icon="!" title="Couldn't reach the agent" sub="Is the hub running? `npm run serve:fake` in code/hub/." />;
  return (
    <div className="chat-empty">
      <div className="ce-glyph">✦</div>
      <div className="ce-title">Start a session</div>
      <div className="ce-sub">Ask the agent to trace a ticket, plan tests, or draft cases. You'll see every step, approve what it runs, and review what it produces — right here.</div>
    </div>
  );
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The framework's empty/loading/error cell (`.qa-empty`). */
function Cell({ kind, icon, title, sub }: { kind: string; icon: string; title: string; sub?: string }) {
  return (
    <div className={`qa-empty${kind ? ` qa-empty-${kind}` : ""}`}>
      <div className="qa-empty-icon">{icon}</div>
      <div className="qa-empty-body">
        <div className="qa-empty-title">{title}</div>
        {sub && <div className="qa-empty-sub">{sub}</div>}
      </div>
    </div>
  );
}
