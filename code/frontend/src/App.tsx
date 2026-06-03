// The studio shell — composes the design framework VERBATIM (tokens + components
// + the qa-* custom elements from design/wireframes/) and renders the stories
// view live from the hub. This is the parity payoff: the wireframe becomes the
// GUI by reuse, not re-creation.
import "../../../design/wireframes/tokens.css";
import "../../../design/wireframes/components.css";
import "../../../design/wireframes/components.js"; // side effect: defines qa-* + window.qaDoc
import { useEffect, useState } from "react";

const BRAND = (import.meta.env.VITE_APP_NAME as string | undefined) ?? "AI QA Studio";
const STORIES_GRID = { gridTemplateColumns: "7rem 1fr 6rem" } as const;
const ELLIPSIS = { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } as const;

interface Story {
  id: string;
  file: string;
  title: string;
}

type Phase = "loading" | "ok" | "error";

export default function App() {
  const [stories, setStories] = useState<Story[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    let live = true;
    fetch("/api/stories")
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<{ stories: Story[] }>; })
      .then((d) => { if (live) { setStories(d.stories); setPhase("ok"); } })
      .catch(() => { if (live) setPhase("error"); });
    return () => { live = false; };
  }, []);

  async function openStory(s: Story): Promise<void> {
    try {
      const md = await (await fetch(`/api/stories/${s.id}`)).text();
      window.qaDoc?.open({ name: `docs/stories/${s.file}`, rendered: mdToHtml(md), source: md });
    } catch {
      /* read view is hardened in #4; the foundation just proves the loop */
    }
  }

  return (
    <qa-app>
      <qa-sidebar active="stories" brand={BRAND}></qa-sidebar>
      <main>
        <qa-topbar crumb={`${BRAND} / Stories`} no-assistant=""></qa-topbar>
        <div className="qa-content">
          <h1 className="pagehead">Stories</h1>
          <p className="pagesub">
            The feature requests in this project, read live from <code>docs/stories/</code> via the hub.
          </p>

          {phase === "loading" && <Cell kind="loading" icon="…" title="Loading stories…" />}
          {phase === "error" && (
            <Cell kind="error" icon="!" title="Couldn't reach the hub" sub="Is it running? `make serve-fake` in code/hub/." />
          )}
          {phase === "ok" && stories.length === 0 && (
            <Cell kind="" icon="∅" title="No stories yet" sub="Add a STORY-NNN.md under docs/stories/." />
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
        </div>
      </main>
      <qa-md-viewer></qa-md-viewer>
    </qa-app>
  );
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
 *  inline code/bold). The full renderer is a #4 concern; this proves the loop. */
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
