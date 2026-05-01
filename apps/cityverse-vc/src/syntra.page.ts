const IOT_MONITOR_URL = process.env.CITYVERSE_IOT_MONITOR_URL ?? 'http://localhost:3002/ops-v2'

export function renderSyntraPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Syntra Prompt Console</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/png" href="/branding/syntra-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Sans+Condensed:wght@500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent: oklch(0.78 0.12 190);
      --accent-lime: oklch(0.86 0.16 135);
      --accent-amber: oklch(0.82 0.14 75);
      --accent-rose: oklch(0.72 0.14 20);
      --bg-0: oklch(0.18 0.012 230);
      --bg-1: oklch(0.215 0.014 230);
      --bg-2: oklch(0.255 0.016 230);
      --bg-inset: oklch(0.155 0.011 230);
      --line: oklch(0.32 0.015 230 / 0.55);
      --line-soft: oklch(0.28 0.012 230 / 0.35);
      --text-0: oklch(0.96 0.008 220);
      --text-1: oklch(0.78 0.012 225);
      --text-2: oklch(0.58 0.015 228);
      --text-3: oklch(0.44 0.012 230);
      --radius: 10px;
      --radius-sm: 6px;
      --mono: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
      --sans: 'IBM Plex Sans', system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif;
      --cond: 'IBM Plex Sans Condensed', var(--sans);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: var(--bg-0); color: var(--text-0); }
    body {
      font-family: var(--sans);
      font-feature-settings: "ss01","cv11","tnum";
      font-variant-numeric: tabular-nums;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      letter-spacing: -0.002em;
    }
    .bg-field { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
    .bg-iso {
      position: absolute; inset: -10%;
      background:
        linear-gradient(120deg, transparent 0 49.5%, oklch(0.3 0.02 220 / 0.09) 49.5% 50.5%, transparent 50.5%) 0 0 / 80px 138.5px,
        linear-gradient(60deg, transparent 0 49.5%, oklch(0.3 0.02 220 / 0.09) 49.5% 50.5%, transparent 50.5%) 0 0 / 80px 138.5px,
        linear-gradient(0deg, transparent 0 49.5%, oklch(0.3 0.02 220 / 0.05) 49.5% 50.5%, transparent 50.5%) 0 0 / 80px 80px;
      transform: perspective(1800px) rotateX(58deg) rotateZ(-28deg) scale(1.6) translateY(6%);
      transform-origin: 50% 40%; opacity: 0.5;
      mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 20%, transparent 75%);
    }
    .bg-glow {
      position: absolute; inset: 0;
      background:
        radial-gradient(1000px 600px at 78% 18%, color-mix(in oklch, var(--accent) 12%, transparent), transparent 60%),
        radial-gradient(800px 500px at 10% 90%, oklch(0.4 0.08 230 / 0.18), transparent 60%);
    }
    .bg-grain {
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
      mix-blend-mode: overlay; opacity: 0.3;
    }
    .app { position: relative; z-index: 1; max-width: 1440px; margin: 0 auto; padding: 18px 22px 28px; }
    .chrome { display: grid; grid-template-columns: 540px 1px 1fr auto; align-items: center; column-gap: 14px; padding: 8px 4px 14px; }
    .topnav { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 0 4px 14px; }
    .topnav a {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 120px; padding: 8px 12px; border-radius: var(--radius-sm);
      border: 1px solid var(--line); background: oklch(0.22 0.012 230 / 0.6); color: var(--text-1);
      text-decoration: none; font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
    }
    .topnav a.active {
      background: color-mix(in oklch, var(--accent) 14%, oklch(0.22 0.012 230));
      border-color: color-mix(in oklch, var(--accent) 50%, var(--line));
      color: var(--text-0);
      box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--accent) 20%, transparent), 0 0 24px color-mix(in oklch, var(--accent) 18%, transparent);
    }
    .brand { display: flex; align-items: center; gap: 12px; width: 540px; min-width: 540px; }
    .brand > div { display: flex; flex-direction: column; justify-content: center; min-height: 52px; }
    .brand-logo {
      width: auto; height: 110px; max-width: 520px; object-fit: contain;
      filter: drop-shadow(0 0 16px color-mix(in oklch, var(--accent) 28%, transparent));
      flex-shrink: 0;
    }
    .brand-name { font-family: var(--cond); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; font-size: 13px; line-height: 1.1; min-height: 14px; display: flex; align-items: center; }
    .brand-sub { display: none; }
    .chrome-divider { width: 1px; height: 22px; background: var(--line); }
    .chrome-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-self: end; }
    .pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line);
      font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.1em;
      color: var(--text-1); text-transform: uppercase; background: oklch(0.2 0.012 230 / 0.6); white-space: nowrap;
    }
    .pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-3); }
    .dot-ok { background: var(--accent-lime) !important; box-shadow: 0 0 10px var(--accent-lime); }
    .dot-warn { background: var(--accent-amber) !important; box-shadow: 0 0 10px var(--accent-amber); }
    .dot-err { background: var(--accent-rose) !important; box-shadow: 0 0 10px var(--accent-rose); }
    .dot-idle { background: var(--text-3) !important; box-shadow: none; }
    .panel {
      background: linear-gradient(180deg, oklch(0.24 0.014 230 / 0.7), oklch(0.2 0.012 230 / 0.75));
      border: 1px solid var(--line); border-radius: var(--radius); position: relative; backdrop-filter: blur(6px);
    }
    .panel::before {
      content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
      background: linear-gradient(180deg, oklch(1 0 0 / 0.04), transparent 40%);
    }
    .panel-hd {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 14px 10px; border-bottom: 1px solid var(--line-soft);
    }
    .panel-hd .label { font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.16em; font-size: 10.5px; color: var(--text-2); }
    .panel-hd .hd-sep { flex: 1; height: 1px; background: var(--line-soft); }
    .panel-hd .hd-meta { font-family: var(--mono); font-size: 10.5px; color: var(--text-3); letter-spacing: 0.12em; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr); gap: 14px; }
    .section { padding: 14px 18px 16px; }
    .hero-title { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 12px; }
    .kicker { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.18em; color: var(--text-2); text-transform: uppercase; }
    .title { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; margin-top: 4px; }
    .subtitle { font-family: var(--mono); font-size: 11px; color: var(--text-2); letter-spacing: 0.06em; margin-top: 6px; }
    .status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
    .status-card {
      border: 1px solid var(--line-soft); border-radius: var(--radius-sm); background: oklch(0.18 0.012 230 / 0.55);
      padding: 10px 12px;
    }
    .status-card .slabel { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-3); }
    .status-card .svalue { display:flex; align-items:center; gap:8px; margin-top: 8px; font-family: var(--mono); font-size: 12px; color: var(--text-0); }
    .svalue .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot-ok { background: var(--accent-lime); box-shadow: 0 0 10px var(--accent-lime); }
    .dot-warn { background: var(--accent-amber); box-shadow: 0 0 10px var(--accent-amber); }
    .dot-err { background: var(--accent-rose); box-shadow: 0 0 10px var(--accent-rose); }
    .dot-idle { background: var(--text-3); }
    form { display: flex; flex-direction: column; gap: 10px; }
    textarea, input {
      width: 100%; background: oklch(0.16 0.012 230 / 0.9); border: 1px solid var(--line); border-radius: var(--radius-sm);
      padding: 12px 12px; font-family: var(--mono); font-size: 13px; color: var(--text-0);
    }
    textarea { min-height: 144px; resize: vertical; }
    textarea::placeholder, input::placeholder { color: var(--text-3); }
    .actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      height: 36px; padding: 0 14px; border-radius: var(--radius-sm);
      border: 1px solid var(--line); background: oklch(0.22 0.012 230 / 0.6);
      color: var(--text-0); font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
      cursor: pointer; white-space: nowrap;
    }
    .btn.primary {
      background: color-mix(in oklch, var(--accent) 14%, oklch(0.22 0.012 230));
      border-color: color-mix(in oklch, var(--accent) 50%, var(--line));
      box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--accent) 20%, transparent), 0 0 24px color-mix(in oklch, var(--accent) 18%, transparent);
    }
    .btn:disabled { opacity: 0.6; cursor: wait; }
    .note { font-family: var(--mono); font-size: 10.5px; color: var(--text-2); letter-spacing: 0.06em; }
    .transcript { padding: 14px 18px 16px; display: flex; flex-direction: column; gap: 10px; min-height: 560px; }
    .entry {
      border: 1px solid var(--line-soft); border-radius: var(--radius-sm); background: oklch(0.18 0.012 230 / 0.55);
      padding: 12px 12px 10px;
    }
    .entry.user { border-color: color-mix(in oklch, var(--accent) 28%, var(--line-soft)); }
    .entry.assistant { border-color: color-mix(in oklch, var(--accent-lime) 22%, var(--line-soft)); }
    .entry.system { border-color: color-mix(in oklch, var(--accent-amber) 22%, var(--line-soft)); }
    .entry-head { display:flex; justify-content:space-between; gap: 10px; align-items: center; margin-bottom: 8px; }
    .entry-role { font-family: var(--mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-2); }
    .entry-time { font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; color: var(--text-3); text-transform: uppercase; }
    .entry-body { font-size: 14px; line-height: 1.55; white-space: pre-wrap; }
    .entry-meta { margin-top: 8px; font-family: var(--mono); font-size: 10px; color: var(--text-3); letter-spacing: 0.08em; }
    .side-list { display: flex; flex-direction: column; gap: 10px; }
    .kv {
      display:flex; justify-content:space-between; align-items:baseline; gap:12px;
      padding: 10px 0; border-top: 1px solid var(--line-soft);
    }
    .kv:first-child { border-top: none; padding-top: 0; }
    .kv .kk { font-family: var(--mono); font-size: 10px; letter-spacing: 0.16em; color: var(--text-2); text-transform: uppercase; }
    .kv .vv { font-family: var(--mono); font-size: 12px; color: var(--text-0); text-align: right; }
    .health-line { margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--line-soft); }
    .links { display:flex; flex-wrap:wrap; gap:8px; margin-top: 12px; }
    .links a {
      display:inline-flex; align-items:center; justify-content:center; min-width: 120px; padding: 8px 10px;
      border-radius: var(--radius-sm); border: 1px solid var(--line); background: oklch(0.18 0.012 230 / 0.6);
      color: var(--text-1); text-decoration:none; font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
    }
    .empty {
      flex: 1; display:grid; place-items:center; border:1px dashed var(--line-soft); border-radius: var(--radius-sm);
      color: var(--text-3); font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; min-height: 180px;
    }
    @media (max-width: 1080px) {
      .grid, .status-grid { grid-template-columns: 1fr; }
      .chrome { grid-template-columns: 1fr; row-gap: 10px; }
      .brand { width: auto; min-width: 0; }
      .chrome-divider { display:none; }
      .chrome-right { justify-self: start; }
    }
  </style>
</head>
<body>
  <div class="bg-field"><div class="bg-iso"></div><div class="bg-glow"></div><div class="bg-grain"></div></div>
  <div class="app">
    <header class="chrome">
      <div class="brand">
        <img class="brand-logo" src="/branding/syntra-logo.png" alt="Syntra logo" />
        <div>
          <div class="brand-name">Syntra <span style="color:var(--accent)">Prompt</span></div>
          <div class="brand-sub"></div>
        </div>
      </div>
      <div class="chrome-divider"></div>
      <div class="chrome-right">
        <span class="pill"><span id="hdrBrokerDot" class="dot dot-idle"></span><span id="hdrBrokerText">Broker: —</span></span>
        <span class="pill"><span id="hdrBridgeDot" class="dot dot-idle"></span><span id="hdrBridgeText">Bridge: —</span></span>
        <span class="pill"><span id="hdrOpenClawDot" class="dot dot-idle"></span><span id="hdrOpenClawText">OpenClaw: —</span></span>
        <span class="pill"><span id="hdrUnityDot" class="dot dot-idle"></span><span id="hdrUnityText">Unity: —</span></span>
      </div>
    </header>

    <nav class="topnav" aria-label="Syntra navigation">
      <a href="/">City Console</a>
      <a href="${IOT_MONITOR_URL}">Operations Monitor</a>
      <a href="/syntra" class="active">Syntra Prompt</a>
    </nav>

    <div class="grid">
      <section class="panel">
        <div class="panel-hd"><span class="label">Prompt Injection Surface</span><span class="hd-sep"></span><span class="hd-meta">Text in · speech out</span></div>
        <div class="section">
          <div class="hero-title">
            <div>
              <div class="kicker">Canonical operator mode</div>
              <div class="title">Type to Syntra. Let the avatar answer.</div>
              <div class="subtitle">This page sends text only to Syntra, then relays her reply to the Mac mini bridge for spoken avatar output.</div>
            </div>
          </div>

          <div class="status-grid">
            <div class="status-card"><div class="slabel">Bridge</div><div class="svalue"><span id="bridgeDot" class="dot dot-idle"></span><span id="bridgeStatus">Checking…</span></div></div>
            <div class="status-card"><div class="slabel">OpenClaw</div><div class="svalue"><span id="openclawDot" class="dot dot-idle"></span><span id="openclawStatus">Checking…</span></div></div>
            <div class="status-card"><div class="slabel">Unity link</div><div class="svalue"><span id="unityDot" class="dot dot-idle"></span><span id="unityStatus">Checking…</span></div></div>
          </div>

          <form id="promptForm">
            <textarea id="promptInput" name="prompt" placeholder="Ask Syntra for a status update, simulation analysis, or a short spoken response…" required></textarea>
            <div class="actions">
              <button id="sendButton" type="submit" class="btn primary">Send to Syntra</button>
              <button id="clearButton" type="button" class="btn">Clear transcript</button>
              <span id="runState" class="note">Idle.</span>
            </div>
          </form>
        </div>
      </section>

      <aside class="panel">
        <div class="panel-hd"><span class="label">System Notes</span><span class="hd-sep"></span><span class="hd-meta">Known-good path</span></div>
        <div class="section side-list">
          <div class="kv"><span class="kk">Agent scope</span><span class="vv">Syntra only</span></div>
          <div class="kv"><span class="kk">Input mode</span><span class="vv">Text prompt</span></div>
          <div class="kv"><span class="kk">Output mode</span><span class="vv">Avatar speech</span></div>
          <div class="kv"><span class="kk">Bridge target</span><span class="vv">Mac mini :3099</span></div>
          <div class="kv"><span class="kk">Unity receiver</span><span class="vv">Workstation :8787/avatar</span></div>
          <div class="health-line note">If the avatar path fails, Syntra text should still return here. Civilization, barely.</div>
          <div class="links">
            <a href="/health" target="_blank" rel="noreferrer">VC health</a>
            <a href="/api/syntra/status" target="_blank" rel="noreferrer">Syntra status</a>
            <a href="http://localhost:3099/health" target="_blank" rel="noreferrer">Bridge health</a>
          </div>
        </div>
      </aside>
    </div>

    <section class="panel" style="margin-top:14px;">
      <div class="panel-hd"><span class="label">Transcript</span><span class="hd-sep"></span><span class="hd-meta">Local operator log</span></div>
      <div class="transcript" id="transcript">
        <div class="empty" id="emptyState">No Syntra turns yet</div>
      </div>
    </section>
  </div>

  <script>
    const transcript = document.getElementById('transcript');
    const emptyState = document.getElementById('emptyState');
    const promptForm = document.getElementById('promptForm');
    const promptInput = document.getElementById('promptInput');
    const sendButton = document.getElementById('sendButton');
    const clearButton = document.getElementById('clearButton');
    const runState = document.getElementById('runState');

    function stamp() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function addEntry(role, text, meta) {
      if (emptyState) emptyState.remove();
      const article = document.createElement('article');
      article.className = 'entry ' + role;
      article.innerHTML = '<div class="entry-head"><span class="entry-role">' + role + '</span><span class="entry-time">' + stamp() + '</span></div>' +
        '<div class="entry-body"></div>' +
        (meta ? '<div class="entry-meta"></div>' : '');
      article.querySelector('.entry-body').textContent = text;
      if (meta) article.querySelector('.entry-meta').textContent = meta;
      transcript.prepend(article);
    }

    function setStatus(idPrefix, state, label) {
      const dot = document.getElementById(idPrefix + 'Dot');
      const text = document.getElementById(idPrefix + 'Status');
      if (dot) dot.className = 'dot ' + state;
      if (text) text.textContent = label;
    }

    function setHeader(prefix, state, text) {
      const dot = document.getElementById(prefix + 'Dot');
      const label = document.getElementById(prefix + 'Text');
      if (dot) dot.className = 'dot ' + state;
      if (label) label.textContent = text;
    }

    async function refreshStatus() {
      try {
        const res = await fetch('/api/header-status');
        const data = await res.json();
        setStatus('bridge', data.bridge.ok ? 'dot-ok' : 'dot-err', data.bridge.ok ? 'Online' : 'Offline');
        setStatus('openclaw', data.openclaw.ok ? 'dot-ok' : 'dot-err', data.openclaw.ok ? 'Ready' : 'Unavailable');
        setStatus('unity', data.bridge.unityConnected ? 'dot-ok' : 'dot-warn', data.bridge.unityConnected ? 'Connected' : 'Waiting');
        setHeader('hdrBroker', data?.broker?.ok ? 'dot-ok' : 'dot-warn', 'Broker: ' + (data?.broker?.ok ? 'Connected' : 'Waiting'));
        setHeader('hdrBridge', data?.bridge?.ok ? 'dot-ok' : 'dot-err', 'Bridge: ' + (data?.bridge?.ok ? 'Online' : 'Offline'));
        setHeader('hdrOpenClaw', data?.openclaw?.ok ? 'dot-ok' : 'dot-err', 'OpenClaw: ' + (data?.openclaw?.ok ? 'Ready' : 'Down'));
        setHeader('hdrUnity', data?.bridge?.unityConnected ? 'dot-ok' : (data?.bridge?.ok ? 'dot-warn' : 'dot-err'), 'Unity: ' + (data?.bridge?.unityConnected ? 'Connected' : (data?.bridge?.ok ? 'Waiting' : 'Offline')));
      } catch (error) {
        setStatus('bridge', 'dot-err', 'Status unavailable');
        setStatus('openclaw', 'dot-err', 'Status unavailable');
        setStatus('unity', 'dot-err', 'Status unavailable');
        setHeader('hdrBroker', 'dot-err', 'Broker: Unavailable');
        setHeader('hdrBridge', 'dot-err', 'Bridge: Unavailable');
        setHeader('hdrOpenClaw', 'dot-err', 'OpenClaw: Unavailable');
        setHeader('hdrUnity', 'dot-err', 'Unity: Unavailable');
      }
    }

    promptForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const prompt = promptInput.value.trim();
      if (!prompt) return;

      addEntry('user', prompt);
      runState.textContent = 'Running Syntra turn…';
      sendButton.disabled = true;

      try {
        const res = await fetch('/api/syntra/prompt', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || ('Request failed with status ' + res.status));
        }
        addEntry('assistant', data.replyText, data.bridgeAudioUrl ? 'Avatar audio: ' + data.bridgeAudioUrl : 'Avatar relay complete');
        runState.textContent = 'Syntra reply spoken.';
        promptInput.value = '';
        refreshStatus();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        addEntry('system', message, 'Avatar relay failed or Syntra unavailable');
        runState.textContent = 'Failed.';
      } finally {
        sendButton.disabled = false;
      }
    });

    clearButton.addEventListener('click', () => {
      transcript.innerHTML = '<div class="empty" id="emptyState">No Syntra turns yet</div>';
      runState.textContent = 'Transcript cleared.';
    });

    refreshStatus();
    setInterval(refreshStatus, 5000);
  </script>
</body>
</html>`
}
