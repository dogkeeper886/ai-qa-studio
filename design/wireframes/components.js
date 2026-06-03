/* AI QA Studio — wireframe component framework (light-DOM custom elements).
   No build step. Each element renders plain markup into itself (light DOM) so
   tokens.css / components.css cascade in normally. Pairs with components.css.

   Catalog: <qa-app> <qa-sidebar> <qa-topbar> <qa-rail> <qa-drawer> <qa-field>
            <qa-btn> <qa-toggle> <qa-gate-card> <qa-decision> <qa-md-viewer>
            <qa-tool> <qa-artifact> <qa-turn>
   Convention: config via attributes; projected content (drawer body) is the
   element's existing innerHTML, captured then re-wrapped. Render-once on connect
   (wireframes don't mutate attributes live).

   Adding a component — the ONE defined way (keeps additions in-scope + reusable):
     1. Define it here as a light-DOM custom element: render once in
        connectedCallback, config via getAttribute, project children by reading
        this.innerHTML first; run interpolated text through esc().
     2. Style it in components.css keyed by the tag (qa-foo { ... }), using
        tokens.css variables ONLY — never literal colours/sizes.
     3. Add it to components.html so the living reference stays complete.
     4. Keep this script loaded with `defer` (custom-element upgrade timing).
   Don't hand-author shared markup in a screen — add it here, then reuse. */

const esc = s => (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

/* ---- theme ---- */
function applyTheme() {
  const b = document.body;
  if (!b.classList.contains('theme-light') && !b.classList.contains('theme-dark'))
    b.classList.add('theme-light');
  if (new URLSearchParams(location.search).get('theme') === 'dark') {
    b.classList.remove('theme-light'); b.classList.add('theme-dark');
  }
  const dark = b.classList.contains('theme-dark');
  document.querySelectorAll('[data-theme-toggle]').forEach(x => x.textContent = dark ? '◐ Light' : '◐ Dark');
}
function toggleTheme(btn) {
  const dark = document.body.classList.toggle('theme-dark');
  document.body.classList.toggle('theme-light', !dark);
  if (btn) btn.textContent = dark ? '◐ Light' : '◐ Dark';
}

/* ---- assistant drawer open/close (one drawer per page; body class drives it) ---- */
let assistantUserSet = false;
function syncAssistantBtn() {
  const open = !document.body.classList.contains('assistant-collapsed');
  document.querySelectorAll('[data-assistant]').forEach(b => { b.classList.toggle('on', open); b.setAttribute('aria-pressed', String(open)); });
}
function toggleAssistant() { assistantUserSet = true; document.body.classList.toggle('assistant-collapsed'); syncAssistantBtn(); }

/* ---- qa-app: just a layout host (styled in CSS) ---- */
customElements.define('qa-app', class extends HTMLElement {});

/* ---- qa-sidebar (brand="…" sets the product name; default "AI QA Studio") ---- */
customElements.define('qa-sidebar', class extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute('active') || 'projects';
    const brand = this.getAttribute('brand') || 'AI QA Studio';
    const user = this.getAttribute('user') || 'QA User';
    const role = this.getAttribute('role') || 'QA Engineer';
    const initials = user.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const nav = [['stories','Stories'],['projects','Projects'],['plans','Test Plans'],['executions','Executions'],['settings','Settings']];
    const ICONS = {
      stories:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3.5" y="2.5" width="9" height="11" rx="1.5"/><path d="M6 6h4M6 8.5h4M6 11h2.5"/></svg>',
      projects:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>',
      plans:      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3.5" y="2.5" width="9" height="11.5" rx="1.5"/><path d="M6 2.2h4v2.3H6z" fill="currentColor" stroke="none"/><path d="M5.75 8h4.5M5.75 10.7h2.8"/></svg>',
      executions: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M5 3.5l7 4.5-7 4.5z"/></svg>',
      settings:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 5h6M11.5 5H14M2 11h2.5M8 11h6"/><circle cx="9.5" cy="5" r="1.7"/><circle cx="6" cy="11" r="1.7"/></svg>'
    };
    const LINKS = { stories: 'stories.html' };  // nav targets that have a screen here (others stay inert until built)
    this.innerHTML =
      `<div class="brand"><span class="dot"></span> <span class="bname">${esc(brand)}</span></div>
       <nav class="nav">${nav.map(([k,l]) => `<a class="${k===active?'active':''}"${LINKS[k] ? ` href="${LINKS[k]}"` : ''} title="${esc(l)}"><span class="ic">${ICONS[k]||''}</span> <span class="label">${l}</span></a>`).join('')}</nav>
       <div class="spacer"></div>
       <div class="userchip"><span class="avatar">${esc(initials)}</span>
         <div class="uinfo"><div style="font-weight:600">${esc(user)}</div>
         <div class="qa-muted" style="font-size:.6875rem">${esc(role)}</div></div></div>
       <div class="railtoggle"><button class="rt" type="button"></button></div>`;
    // collapsible (IDE-style icon rail); bottom toggle indicates open/close
    const rt = this.querySelector('.rt');
    const sync = () => { const c = this.classList.contains('collapsed'); rt.textContent = c ? '»' : '«'; rt.title = c ? 'Expand sidebar' : 'Collapse sidebar'; };
    // default depends on viewport width; collapse when there isn't room, expand when there is.
    // `collapsed` attr or a manual toggle pins the choice and stops auto-management.
    const BP = parseInt(this.getAttribute('breakpoint') || '1200', 10);
    let pinned = this.hasAttribute('collapsed');
    if (pinned) this.classList.add('collapsed');
    const responsive = () => { if (!pinned) { this.classList.toggle('collapsed', window.innerWidth < BP); sync(); } };
    responsive();
    sync();
    window.addEventListener('resize', responsive);
    rt.onclick = () => { pinned = true; this.classList.toggle('collapsed'); sync(); };
  }
});

/* ---- qa-topbar (crumb="A / B / C" bolds the last segment) ---- */
customElements.define('qa-topbar', class extends HTMLElement {
  connectedCallback() {
    // crumb="Label | Label|url / Label" — last segment is the current page (bold); ancestors with a url link
    const parts = (this.getAttribute('crumb') || '').split('/').map(s => s.trim()).filter(Boolean);
    const crumb = parts.map((p, i) => {
      const [label, url] = p.split('|').map(s => s.trim());
      if (i === parts.length - 1) return `<b>${esc(label)}</b>`;
      return url ? `<a href="${esc(url)}">${esc(label)}</a>` : esc(label);
    }).join(' / ');
    const assistant = this.hasAttribute('no-assistant') ? '' : `<button class="qa-iconbtn" data-assistant>✦ Assistant</button>`;
    this.innerHTML =
      `<span class="crumb">${crumb}</span><div class="spacer"></div>
       <button class="qa-iconbtn" data-theme-toggle>◐ Dark</button>${assistant}`;
    this.querySelector('[data-theme-toggle]').onclick = e => toggleTheme(e.currentTarget);
    this.querySelector('[data-assistant]')?.addEventListener('click', () => toggleAssistant());
  }
});

/* ---- qa-rail (step="N" = current 1-indexed; add `inprogress` for ● on current) ---- */
customElements.define('qa-rail', class extends HTMLElement {
  connectedCallback() {
    const cur = parseInt(this.getAttribute('step') || '1', 10);
    const inprog = this.hasAttribute('inprogress');
    const labels = (this.getAttribute('labels') || 'Trace,Detect type,Plan,GATE 1,Cases,GATE 2').split(',');
    const links = (this.getAttribute('links') || '').split(',');  // optional per-step targets (blank = no link)
    this.innerHTML = labels.map((l, i) => {
      const n = i + 1;
      let cls = 'step', d = String(n);
      if (n < cur) { cls = 'step done'; d = '✓'; }
      else if (n === cur) { cls = 'step cur'; d = inprog ? '●' : String(n); }
      const href = (links[i] || '').trim();
      const tag = href ? 'a' : 'div', attr = href ? ` href="${href}"` : '';
      return `<${tag} class="${cls}"${attr}><span class="d">${d}</span>${esc(l.trim())}</${tag}>`;
    }).join('<span class="sep">→</span>');
  }
});

/* ---- qa-drawer (assistant). Collapsible via the ✕ + topbar ✦ Assistant; responsive.
       `pinned` = always-on (no ✕, no auto-hide); `closed` = start hidden. ---- */
customElements.define('qa-drawer', class extends HTMLElement {
  connectedCallback() {
    const body = this.innerHTML;
    const title = this.getAttribute('title') || '✦ Assistant';
    const ph = this.getAttribute('placeholder') || 'Message the assistant…';
    const pinned = this.hasAttribute('pinned');
    this.innerHTML =
      `<div class="dhead"><span>${esc(title)}</span>${pinned ? '' : '<button class="qa-iconbtn dclose" title="Close assistant">✕</button>'}</div>
       <div class="dbody">${body}</div>
       <div class="dinput">
         <div class="dctx"><button class="cchip" type="button">＋ Add context</button><button class="cchip" type="button">/ Commands</button></div>
         <div class="dcompose"><div class="dbox">${esc(ph)}</div><button class="dsend" type="button" title="Send">↑</button></div>
       </div>`;
    if (pinned) { document.body.classList.add('assistant-pinned'); return; }  // always-on: no close/responsive; topbar toggle hidden
    this.querySelector('.dclose').onclick = () => toggleAssistant();
    // default depends on viewport (and the `closed` attr); a manual toggle pins it
    const BP = parseInt(this.getAttribute('breakpoint') || '1100', 10);
    const startClosed = this.hasAttribute('closed');
    const responsive = () => { if (!assistantUserSet) document.body.classList.toggle('assistant-collapsed', startClosed || window.innerWidth < BP); syncAssistantBtn(); };
    responsive();
    window.addEventListener('resize', responsive);
  }
});

/* ---- qa-field (the standout input; add `multiline` for a textarea) ---- */
customElements.define('qa-field', class extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label');
    const ph = esc(this.getAttribute('placeholder') || '');
    const val = esc(this.getAttribute('value') || '');
    const lab = label ? `<label>${esc(label)}</label>` : '';
    const ctrl = this.hasAttribute('multiline')
      ? `<textarea class="field" placeholder="${ph}">${val}</textarea>`
      : `<input class="field" placeholder="${ph}" value="${val}">`;
    this.innerHTML = lab + ctrl;
  }
});

/* ---- qa-btn (variant: primary|ghost|sm|sm-primary) ---- */
customElements.define('qa-btn', class extends HTMLElement {
  connectedCallback() {
    const text = this.textContent.trim();
    const cls = { primary:'qa-btn', ghost:'qa-btn ghost', sm:'qa-btn sm', 'sm-primary':'qa-btn sm primary' }
      [this.getAttribute('variant') || 'primary'] || 'qa-btn';
    this.innerHTML = `<button class="${cls}">${esc(text)}</button>`;
  }
});

/* ---- qa-toggle (add `on` for the active state) ---- */
customElements.define('qa-toggle', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<span class="switch${this.hasAttribute('on') ? '' : ' off'}"><span class="knob"></span></span>`;
    this.querySelector('.switch').onclick = e => e.currentTarget.classList.toggle('off');
  }
});

/* ---- qa-gate-card (drawer verdict card; verdict=pass|fail|blocked) ---- */
customElements.define('qa-gate-card', class extends HTMLElement {
  connectedCallback() {
    const v = (this.getAttribute('verdict') || 'pass').toLowerCase();
    const title = this.getAttribute('title') || 'GATE 1 — Plan completeness';
    const detail = this.getAttribute('detail') || '';
    this.innerHTML =
      `<div class="gt"><span class="badge ${v}">${esc(v.toUpperCase())}</span> ${esc(title)}</div>
       ${detail ? `<div class="gd">${esc(detail)}</div>` : ''}
       <div class="ga"><qa-btn variant="sm-primary">Approve → Cases</qa-btn><qa-btn variant="sm">Iterate</qa-btn></div>`;
    const ah = this.getAttribute('approve-href');  // wire the Approve button to navigate
    if (ah) { const b = this.querySelector('qa-btn button'); if (b) b.onclick = () => location.href = ah; }
  }
});

/* ---- qa-decision (the "Your call" Decision member — gates AND execution approvals).
       Defaults render the gate variant; configure for other contexts:
         title        — heading (default "Your call")
         prompt       — the explanatory line · detail — optional 2nd line
         recommendation — advisory block + an "Apply recommended fix" action
         actions      — comma list of buttons (first = primary); omit for the
                        gate default set (approve-label / Apply fix / Iterate)
         attention    — paused/needs-you variant (accent border + ⏸)
         placeholder  — the instruction field's placeholder
         approve-href — navigate the primary button (wireframe links) ---- */
customElements.define('qa-decision', class extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || 'Your call';
    const rec = this.getAttribute('recommendation');
    const dh = this.getAttribute('prompt') || 'Approve to generate the test cases, or tell the agent what to change.';
    const detail = this.getAttribute('detail');
    const ph = this.getAttribute('placeholder') || 'Tell the agent what to change — or just approve…';
    const attn = this.hasAttribute('attention');
    const acts = this.hasAttribute('actions')
      ? this.getAttribute('actions').split(',').map(s => s.trim()).filter(Boolean)
          .map((l, i) => `<qa-btn variant="${i === 0 ? 'primary' : 'ghost'}">${esc(l)}</qa-btn>`).join('')
      : `<qa-btn variant="primary">${esc(this.getAttribute('approve-label') || 'Approve as-is → Cases')}</qa-btn>`
        + (rec ? `<qa-btn variant="ghost">Apply recommended fix</qa-btn>` : '')
        + `<qa-btn variant="ghost">Iterate…</qa-btn>`;
    this.innerHTML =
      `<div class="dq">${attn ? '⏸ ' : ''}${esc(title)}</div>
       <div class="dh">${esc(dh)}</div>
       ${detail ? `<div class="dsub">${esc(detail)}</div>` : ''}
       ${rec ? `<div class="rec"><b>Recommended (advisory):</b> ${esc(rec)}</div>` : ''}
       <qa-field placeholder="${esc(ph)}"></qa-field>
       <div class="dacts">${acts}</div>`;
    const ah = this.getAttribute('approve-href');  // wire the primary button to navigate
    if (ah) { const b = this.querySelector('.dacts qa-btn button'); if (b) b.onclick = () => location.href = ah; }
  }
});

/* ---- qa-md-viewer (markdown document modal; open via window.qaDoc.open({name,rendered,source})) ---- */
customElements.define('qa-md-viewer', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML =
      `<div class="mdback"><div class="mdwin">
         <div class="mdtop"><span class="fn"></span>
           <div class="seg2"><button class="r active">Rendered</button><button class="s">Source</button></div>
           <button class="qa-iconbtn x">✕</button></div>
         <div class="mdbody"><div class="md"></div><pre class="mdsrc"></pre></div>
       </div></div>`;
    const back = this.querySelector('.mdback'), win = this.querySelector('.mdwin');
    const r = this.querySelector('.r'), s = this.querySelector('.s');
    const mode = src => { win.classList.toggle('src', src); r.classList.toggle('active', !src); s.classList.toggle('active', src); };
    r.onclick = () => mode(false);
    s.onclick = () => mode(true);
    this.querySelector('.x').onclick = () => back.classList.remove('open');
    back.onclick = e => { if (e.target === back) back.classList.remove('open'); };
    // global open/close API (one viewer per page)
    window.qaDoc = {
      open: ({ name, rendered, source }) => {
        this.querySelector('.fn').textContent = name || '';
        this.querySelector('.md').innerHTML = rendered || '';   // trusted wireframe content
        this.querySelector('.mdsrc').textContent = source || '';
        mode(false);
        back.classList.add('open');
      },
      close: () => back.classList.remove('open')
    };
  }
});

/* ---- qa-tool: a tool-call step in the agent thread — collapsible + inspectable.
       name=title (may contain <code>) · kind=execute|edit|read|search|skill|mcp (glyph)
       status=queued|executing|completed|failed (badge) · `open` starts expanded.
       Projected innerHTML is the input/result detail, shown when expanded. ---- */
customElements.define('qa-tool', class extends HTMLElement {
  connectedCallback() {
    const detail = this.innerHTML.trim();
    const name = this.getAttribute('name') || 'Tool';      // trusted wireframe markup (may include <code>)
    const kind = (this.getAttribute('kind') || 'execute').toLowerCase();
    const status = (this.getAttribute('status') || 'completed').toLowerCase();
    if (this.hasAttribute('open')) this.classList.add('open');
    const GLYPH = { execute:'⟩', edit:'✎', read:'◇', search:'⌕', skill:'✦', mcp:'⊞' };
    const BADGE = { queued:['muted','Queued'], executing:['blocked','Running'], completed:['pass','Done'], failed:['fail','Failed'] };
    const [bcls, blabel] = BADGE[status] || BADGE.completed;
    this.innerHTML =
      `<button class="toolhead" type="button">
         <span class="tk">${GLYPH[kind] || GLYPH.execute}</span>
         <span class="tname">${name}</span>
         <span class="badge ${bcls}">${esc(blabel)}</span>
         ${detail ? '<span class="tchev">▸</span>' : ''}
       </button>
       ${detail ? `<div class="tbody">${detail}</div>` : ''}`;
    const head = this.querySelector('.toolhead');
    if (detail) head.onclick = () => this.classList.toggle('open');
  }
});

/* ---- qa-artifact: a produced artifact under review in the thread (the review gate).
       name=file path · kind=plan|cases|file|email (tag) · summary=one line.
       Projected innerHTML is an optional clamped content peek. Wire "Open & review"
       in the screen: el.querySelector('.aacts qa-btn button').onclick = () => qaDoc.open({…}). ---- */
customElements.define('qa-artifact', class extends HTMLElement {
  connectedCallback() {
    const peek = this.innerHTML.trim();   // trusted wireframe markup
    const name = this.getAttribute('name') || 'artifact.md';
    const kind = this.getAttribute('kind') || 'file';
    const summary = this.getAttribute('summary') || '';
    this.innerHTML =
      `<div class="ahead"><span class="aicon">▤</span><span class="afile">${esc(name)}</span><span class="badge muted">${esc(kind)}</span></div>
       ${summary ? `<div class="asum">${esc(summary)}</div>` : ''}
       ${peek ? `<div class="apeek">${peek}</div>` : ''}
       <div class="aacts"><qa-btn variant="sm-primary">Open &amp; review</qa-btn><qa-btn variant="sm">Approve</qa-btn><qa-btn variant="sm">Send back</qa-btn></div>`;
  }
});

/* ---- qa-turn: a completed turn folded to a one-line summary in the thread.
       outcome=end_turn|refusal|error|cancelled · turns · cost · denials ---- */
customElements.define('qa-turn', class extends HTMLElement {
  connectedCallback() {
    const outcome = (this.getAttribute('outcome') || 'end_turn').toLowerCase();
    const OUT = { end_turn:['ok','✓','Turn complete'], refusal:['bad','!','Refused'],
                  error:['bad','!','Turn errored'], cancelled:['mut','■','Cancelled'] };
    const [cls, glyph, label] = OUT[outcome] || OUT.end_turn;
    const denials = this.getAttribute('denials');
    const meta = [
      this.getAttribute('turns') ? `${esc(this.getAttribute('turns'))} turns` : '',
      this.getAttribute('cost') ? esc(this.getAttribute('cost')) : '',
      (denials && denials !== '0') ? `${esc(denials)} denied` : ''
    ].filter(Boolean).join(' · ');
    this.innerHTML =
      `<button class="tsbar" type="button">
         <span class="tsdot ${cls}">${glyph}</span>
         <span class="tslabel">${esc(label)}</span>
         <span class="tsmeta">${meta}</span>
         <span class="tschev">▸</span>
       </button>`;
    this.querySelector('.tsbar').onclick = () => this.classList.toggle('open');
  }
});

/* ---- init theme once the DOM is ready ---- */
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', applyTheme);
else
  applyTheme();
