// The studio shell — composes the design framework VERBATIM (tokens + components
// + the qa-* custom elements from design/wireframes/) and renders the workbench
// live from the hub: a list of repos (active/) and, inside one, that repo's
// stories. Navigation is React state, so switching repos needs no restart.
import "../../../design/wireframes/tokens.css";
import "../../../design/wireframes/components.css";
import "../../../design/wireframes/components.js"; // side effect: defines qa-* + window.qaDoc
import { useEffect, useRef, useState } from "react";

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

  // qa-sidebar/qa-topbar render once in connectedCallback and don't observe
  // attribute changes — so key them by their value to remount on navigation.
  return (
    <qa-app>
      <qa-sidebar key={active} active={active} brand={BRAND}></qa-sidebar>
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
      const md = await (await fetch(`/api/repos/${encodeURIComponent(repo)}/stories/${s.id}`)).text();
      window.qaDoc?.open({ name: `${repo}/docs/stories/${s.file}`, rendered: mdToHtml(md), source: md });
    } catch {
      /* read view is hardened later; this proves the repo-scoped loop */
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

/** The assistant drawer (the ✦ Assistant control opens it). qa-drawer is a
 *  light-DOM custom element that rewrites its own innerHTML, which conflicts
 *  with React children — so render it empty and fill its .dbody imperatively.
 *  The live agent thread is the next build (#13); this is the shell. */
function Assistant() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const dbody = ref.current?.querySelector(".dbody");
    if (dbody && !dbody.childElementCount) {
      dbody.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;
             text-align:center;gap:.55rem;color:var(--muted);padding:1.5rem .5rem">
          <div style="width:42px;height:42px;border-radius:12px;border:1px solid var(--border);background:var(--bg);
               display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:var(--accent)">✦</div>
          <div style="font-size:.95rem;font-weight:700;color:var(--fg)">Start a session</div>
          <div style="font-size:.78rem;line-height:1.55;max-width:17rem">Ask the agent to plan tests, trace a ticket, or draft
            cases. The live thread renders here once the chat panel lands (#13) — this is its shell, wired to the hub.</div>
        </div>`;
    }
  }, []);
  return <qa-drawer ref={ref} title="✦ Assistant" placeholder="Message the agent — ⏎ to send"></qa-drawer>;
}

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

/** Minimal markdown → HTML for the doc viewer (headings, lists, paragraphs,
 *  inline code/bold). The full renderer is a later concern; this proves the loop. */
function mdToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const out: string[] = [];
  let inList = false;
  const closeList = () => { if (inList) { out.push("</ul>"); inList = false; } };
  for (const line of md.split("\n")) {
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    const li = line.match(/^[-*]\s+(.*)$/);
    if (h) { closeList(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); }
    else if (li) { if (!inList) { out.push("<ul>"); inList = true; } out.push(`<li>${inline(li[1])}</li>`); }
    else if (line.trim() === "") closeList();
    else { closeList(); out.push(`<p>${inline(line)}</p>`); }
  }
  closeList();
  return out.join("\n");
}
