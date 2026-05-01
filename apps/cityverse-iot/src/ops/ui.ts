export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="/branding/syntra-icon.png">
  <title>Syntra Operations &mdash; Monitoring</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Sans+Condensed:wght@500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-0:     oklch(0.18 0.012 230);
      --bg-1:     oklch(0.215 0.014 230);
      --bg-2:     oklch(0.255 0.016 230);
      --line:     oklch(0.32 0.015 230 / 0.55);
      --line-soft:oklch(0.28 0.012 230 / 0.35);
      --text-0:   oklch(0.96 0.008 220);
      --text-1:   oklch(0.78 0.012 225);
      --text-2:   oklch(0.58 0.015 228);
      --text-3:   oklch(0.44 0.012 230);
      --teal:     oklch(0.78 0.12 190);
      --lime:     oklch(0.86 0.16 135);
      --amber:    oklch(0.82 0.14 75);
      --rose:     oklch(0.72 0.14 20);
      --radius:   10px;
      --radius-sm:6px;
      --mono: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
      --sans: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
      --cond: 'IBM Plex Sans Condensed', var(--sans);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: var(--bg-0); color: var(--text-0);
      font-family: var(--sans);
      font-feature-settings: "ss01","cv11","tnum";
      font-variant-numeric: tabular-nums;
      min-height: 100vh; -webkit-font-smoothing: antialiased;
    }

    /* Atmospheric background */
    .bg-field { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
    .bg-iso {
      position: absolute; inset: -10%;
      background:
        linear-gradient(120deg, transparent 0 49.5%, oklch(0.3 0.02 220 / 0.09) 49.5% 50.5%, transparent 50.5%) 0 0 / 80px 138.5px,
        linear-gradient(60deg,  transparent 0 49.5%, oklch(0.3 0.02 220 / 0.09) 49.5% 50.5%, transparent 50.5%) 0 0 / 80px 138.5px,
        linear-gradient(0deg,   transparent 0 49.5%, oklch(0.3 0.02 220 / 0.05) 49.5% 50.5%, transparent 50.5%) 0 0 / 80px 80px;
      transform: perspective(1800px) rotateX(58deg) rotateZ(-28deg) scale(1.6) translateY(6%);
      transform-origin: 50% 40%; opacity: 0.5;
      mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 20%, transparent 75%);
    }
    .bg-glow {
      position: absolute; inset: 0;
      background:
        radial-gradient(900px 500px at 80% 15%, color-mix(in oklch, var(--teal) 10%, transparent), transparent 60%),
        radial-gradient(700px 450px at 8% 85%, oklch(0.4 0.08 230 / 0.15), transparent 60%);
    }
    .bg-grain {
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
      mix-blend-mode: overlay; opacity: 0.3;
    }

    .app { position: relative; z-index: 1; max-width: 1440px; margin: 0 auto; padding: 18px 22px 28px; }

    /* Chrome */
    .chrome { display: grid; grid-template-columns: 540px 1px 1fr auto; align-items: center; column-gap: 14px; padding: 8px 4px 14px; }
    .topnav {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      margin: 0 4px 14px;
    }
    .topnav a {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 120px;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--line);
      background: oklch(0.22 0.012 230 / 0.6);
      color: var(--text-1);
      text-decoration: none;
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .topnav a.active {
      background: color-mix(in oklch, var(--teal) 14%, oklch(0.22 0.012 230));
      border-color: color-mix(in oklch, var(--teal) 50%, var(--line));
      color: var(--text-0);
      box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--teal) 20%, transparent), 0 0 24px color-mix(in oklch, var(--teal) 18%, transparent);
    }
    .brand { display: flex; align-items: center; gap: 12px; width: 540px; min-width: 540px; }
    .brand-logo {
      width: auto;
      height: 110px;
      max-width: 520px;
      object-fit: contain;
      filter: drop-shadow(0 0 16px color-mix(in oklch, var(--teal) 28%, transparent));
      flex-shrink: 0;
    }
    .brand-text { display: flex; flex-direction: column; gap: 2px; }
    .brand-name {
      font-family: var(--cond); font-weight: 600; letter-spacing: 0.14em;
      text-transform: uppercase; font-size: 13px; line-height: 1.1;
    }
    .brand-name span { font-size: inherit; line-height: inherit; }
    .brand-sub {
      font-family: var(--mono); font-size: 10.5px; color: var(--text-2);
      letter-spacing: 0.16em; text-transform: uppercase;
    }
    .chrome-div { width: 1px; height: 24px; background: var(--line); }
    .breadcrumbs {
      font-family: var(--mono); font-size: 11px; color: var(--text-2);
      letter-spacing: 0.12em; text-transform: uppercase;
      display: flex; align-items: center; gap: 8px;
    }
    .breadcrumbs b { color: var(--text-0); font-weight: 500; }
    .breadcrumbs .sep { color: var(--text-3); }
    .chrome-right { margin-left: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-self: end; }
    .pill {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line);
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em;
      color: var(--text-1); text-transform: uppercase;
      background: oklch(0.2 0.012 230 / 0.6); white-space: nowrap;
    }
    .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .dot-ok    { background: var(--lime);  box-shadow: 0 0 8px var(--lime); }
    .dot-warn  { background: var(--amber); box-shadow: 0 0 8px var(--amber); }
    .dot-err   { background: var(--rose);  box-shadow: 0 0 8px var(--rose); }
    .dot-none  { background: var(--text-3); }

    /* Sections */
    .section { margin-bottom: 18px; }
    .section-hd {
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
    }
    .section-hd .slabel {
      font-family: var(--mono); text-transform: uppercase;
      letter-spacing: 0.18em; font-size: 10px; color: var(--text-2); white-space: nowrap;
    }
    .section-hd .sline { flex: 1; height: 1px; background: var(--line-soft); }
    .section-hd .smeta {
      font-family: var(--mono); font-size: 10px; color: var(--text-3); letter-spacing: 0.1em;
    }

    /* Panel */
    .panel {
      background: linear-gradient(180deg, oklch(0.24 0.014 230 / 0.72), oklch(0.2 0.012 230 / 0.78));
      border: 1px solid var(--line); border-radius: var(--radius);
      position: relative; backdrop-filter: blur(6px);
    }
    .panel::before {
      content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
      background: linear-gradient(180deg, oklch(1 0 0 / 0.04), transparent 40%);
    }
    .panel-hd {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px 9px; border-bottom: 1px solid var(--line-soft);
    }
    .panel-hd .plabel {
      font-family: var(--mono); text-transform: uppercase;
      letter-spacing: 0.16em; font-size: 10px; color: var(--text-2);
    }
    .panel-hd .phd-sep { flex: 1; height: 1px; background: var(--line-soft); }

    /* Status pills */
    .spill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 2px 7px; border-radius: 999px;
      font-family: var(--mono); font-size: 9.5px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.08em;
    }
    .spill-ok      { background: oklch(0.26 0.06 135 / 0.25); color: var(--lime);  border: 1px solid oklch(0.26 0.06 135 / 0.4); }
    .spill-stale   { background: oklch(0.28 0.07 75 / 0.25);  color: var(--amber); border: 1px solid oklch(0.28 0.07 75 / 0.4); }
    .spill-no_data { background: oklch(0.22 0.01 230 / 0.5);  color: var(--text-2);border: 1px solid var(--line-soft); }
    .spill-live    { background: oklch(0.26 0.06 135 / 0.25); color: var(--lime);  border: 1px solid oklch(0.26 0.06 135 / 0.4); }

    /* Card grids */
    .cards-3 {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    }
    @media (max-width: 860px) {
      .cards-3 { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
    }

    /* Flow card */
    .flow-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 8px; }

    /* Freshness bar */
    .fresh-bar {
      height: 3px; border-radius: 2px; overflow: hidden;
      background: oklch(0.24 0.012 230 / 0.8);
    }
    .fresh-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
    .fresh-fill.ok     { background: linear-gradient(90deg, color-mix(in oklch, var(--lime) 40%, transparent), var(--lime)); }
    .fresh-fill.stale  { background: linear-gradient(90deg, color-mix(in oklch, var(--amber) 40%, transparent), var(--amber)); }
    .fresh-fill.no_data{ background: var(--text-3); }

    /* KV rows */
    .kv-grid { display: flex; flex-direction: column; }
    .kv-row {
      display: flex; justify-content: space-between; align-items: baseline;
      gap: 8px; padding: 5px 0;
    }
    .kv-row + .kv-row { border-top: 1px solid oklch(0.28 0.012 230 / 0.22); }
    .kv-row .kk {
      font-family: var(--mono); font-size: 10px; color: var(--text-2);
      letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap;
    }
    .kv-row .vv {
      font-family: var(--mono); font-size: 12px; color: var(--text-0);
      text-align: right; word-break: break-all;
    }
    .vv.muted { color: var(--text-3); font-style: italic; }
    .vv.ok    { color: var(--lime); }
    .vv.warn  { color: var(--amber); }

    /* Sparkline */
    .spark-wrap {
      margin-top: 4px; padding-top: 8px; border-top: 1px dashed var(--line-soft);
    }
    .spark-label {
      font-family: var(--mono); font-size: 9.5px; color: var(--text-3);
      letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 4px;
    }
    .spark svg { display: block; width: 100%; overflow: visible; }

    /* State card */
    .state-body { padding: 12px 14px 14px; }
    .state-hero {
      display: grid; grid-template-columns: auto 1fr; gap: 12px;
      align-items: center; padding-bottom: 10px; border-bottom: 1px dashed var(--line-soft);
      margin-bottom: 10px;
    }
    .s-big {
      font-family: var(--mono); font-weight: 300; font-size: 42px; line-height: 1;
      letter-spacing: -0.02em;
    }
    .s-big .u { font-size: 20px; color: var(--text-2); font-weight: 300; }
    .s-cond { font-size: 15px; font-weight: 500; letter-spacing: -0.005em; margin-bottom: 2px; }
    .s-cond-sub {
      font-family: var(--mono); font-size: 10px; color: var(--text-2);
      letter-spacing: 0.14em; text-transform: uppercase;
    }

    /* Stat big (energy / buildings) */
    .stat-big { padding-bottom: 10px; border-bottom: 1px dashed var(--line-soft); margin-bottom: 10px; }
    .stat-big .sv {
      font-family: var(--mono); font-weight: 300; font-size: 32px;
      line-height: 1; letter-spacing: -0.02em;
    }
    .stat-big .sk {
      font-family: var(--mono); font-size: 10px; color: var(--text-2);
      letter-spacing: 0.14em; text-transform: uppercase; margin-top: 3px;
    }

    /* Bar (energy) */
    .e-bar { height: 4px; border-radius: 2px; background: oklch(0.25 0.012 230 / 0.8); overflow: hidden; margin-top: 3px; margin-bottom: 4px; }
    .e-bar > i { display: block; height: 100%; border-radius: 2px; }
    .e-bar.solar > i { background: linear-gradient(90deg, color-mix(in oklch, var(--amber) 50%, transparent), var(--amber)); }
    .e-bar.wind  > i { background: linear-gradient(90deg, color-mix(in oklch, var(--teal)  50%, transparent), var(--teal)); }

    /* Buildings top list */
    .top-list { display: flex; flex-direction: column; }
    .top-item {
      display: flex; align-items: baseline; gap: 6px;
      padding: 5px 0; border-top: 1px solid oklch(0.28 0.012 230 / 0.22);
    }
    .top-rank { font-family: var(--mono); font-size: 10px; color: var(--text-3); width: 18px; flex-shrink: 0; }
    .top-rank.hi { color: var(--teal); }
    .top-label { font-family: var(--mono); font-size: 12px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .top-kw { font-family: var(--mono); font-size: 12px; color: var(--teal); white-space: nowrap; }

    /* No-data */
    .no-data {
      padding: 22px 14px; text-align: center;
      font-family: var(--mono); font-size: 11px; color: var(--text-3);
      letter-spacing: 0.12em; text-transform: uppercase;
    }

    /* Error banner */
    .error-banner {
      padding: 10px 14px; border-radius: var(--radius-sm);
      color: var(--rose); border: 1px solid oklch(0.72 0.14 20 / 0.3);
      background: oklch(0.72 0.14 20 / 0.08);
      font-family: var(--mono); font-size: 11px; margin-bottom: 14px;
    }

    /* Status bar */
    .status-bar {
      margin-top: 14px; display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
      padding: 8px 14px; border: 1px solid var(--line); border-radius: var(--radius);
      background: oklch(0.2 0.012 230 / 0.6);
      font-family: var(--mono); font-size: 10px; color: var(--text-3);
      letter-spacing: 0.12em; text-transform: uppercase;
    }
    .status-bar b { color: var(--text-1); font-weight: 500; }
    .status-bar .sb-push { flex: 1; }
  </style>
</head>
<body>
  <div class="bg-field">
    <div class="bg-iso"></div>
    <div class="bg-glow"></div>
    <div class="bg-grain"></div>
  </div>

  <div class="app">
    <!-- Chrome -->
    <div class="chrome">
      <div class="brand">
        <img class="brand-logo" src="/branding/syntra-logo.png" alt="Syntra logo" onerror="this.style.display='none'" />
        <div class="brand-text">
          <span class="brand-name">Syntra <span style="color:var(--teal)">Operations</span></span>
          <span class="brand-sub">Monitoring</span>
        </div>
      </div>
      <div class="chrome-div"></div>
      <div class="breadcrumbs">System <span class="sep">/</span> <b>Telemetry</b></div>
      <div class="chrome-right">
        <span id="broker-pill" class="pill"><span class="dot dot-none"></span>&nbsp;broker: &mdash;</span>
        <span id="status-pill" class="pill"><span class="dot dot-none"></span>&nbsp;loading</span>
        <span id="last-updated" style="font-family:var(--mono);font-size:10px;color:var(--text-3);letter-spacing:0.1em;">loading&hellip;</span>
      </div>
    </div>

    <nav class="topnav" aria-label="Syntra navigation">
      <a href="http://localhost:3001/">City Console</a>
      <a href="/" class="active">Operations Monitor</a>
      <a href="/ops-v2">Operations Monitor v2</a>
    </nav>

    <div id="error-banner" style="display:none" class="error-banner"></div>

    <!-- Flow Health -->
    <div class="section">
      <div class="section-hd">
        <span class="slabel">Flow Health</span>
        <span class="sline"></span>
        <span class="smeta">3 flows</span>
      </div>
      <div class="cards-3" id="flow-cards">
        ${['weather','energy','buildings'].map(k => `<div class="panel">
          <div class="panel-hd"><span class="plabel">${k}</span><span class="phd-sep"></span><span class="spill spill-no_data">no data</span></div>
          <div class="flow-body"><div class="no-data">loading&hellip;</div></div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Current State -->
    <div class="section">
      <div class="section-hd">
        <span class="slabel">Current State</span>
        <span class="sline"></span>
      </div>
      <div class="cards-3" id="state-cards">
        ${['weather','energy','buildings'].map(k => `<div class="panel">
          <div class="panel-hd"><span class="plabel">${k}</span><span class="phd-sep"></span><span class="spill spill-no_data">no data</span></div>
          <div class="state-body"><div class="no-data">loading&hellip;</div></div>
        </div>`).join('')}
      </div>
    </div>

    <div class="status-bar">
      <span>Service <b>cityverse-iot</b></span>
      <span>Flows <b>weather &middot; energy &middot; buildings</b></span>
      <span class="sb-push"></span>
      <span>Auto-refresh <b>5s</b></span>
    </div>
  </div>

  <script>
  var REFRESH_MS = 5000

  var SPARK_COLORS = {
    weather:   'oklch(0.82 0.14 75)',
    energy:    'oklch(0.86 0.16 135)',
    buildings: 'oklch(0.78 0.12 190)'
  }

  function fmt(ts) {
    if (!ts) return null
    return new Date(ts).toLocaleTimeString(undefined, { hour12: false })
  }

  function fmtFresh(s) {
    if (s == null) return null
    if (s < 5)    return 'just now'
    if (s < 60)   return s + 's ago'
    if (s < 3600) return Math.floor(s / 60) + 'm ' + (s % 60) + 's ago'
    return Math.floor(s / 3600) + 'h ago'
  }

  function fmtKw(kw) {
    if (kw == null) return '&mdash;'
    if (kw >= 1000) return (kw / 1000).toFixed(2) + '&thinsp;MW'
    return kw.toFixed(1) + '&thinsp;kW'
  }

  function freshWidth(s, status) {
    if (status === 'no_data' || s == null) return 0
    return Math.max(4, Math.round((1 - Math.min(s, 300) / 300) * 100))
  }

  function kv(k, v, cls) {
    return '<div class="kv-row"><span class="kk">' + k + '</span>' +
      '<span class="vv' + (cls ? ' ' + cls : '') + '">' + v + '</span></div>'
  }

  function sparkline(pts, color) {
    if (!pts || pts.length < 2) return ''
    var mn = Math.min.apply(null, pts), mx = Math.max.apply(null, pts)
    var range = mx - mn || 1
    var W = 100, H = 26
    var coords = pts.map(function(v, i) {
      return (i / (pts.length - 1) * W).toFixed(1) + ',' +
        (H - ((v - mn) / range * (H - 4)) - 2).toFixed(1)
    }).join(' ')
    var lx = (pts.length - 1) / (pts.length - 1) * W
    var ly = (H - ((pts[pts.length-1] - mn) / range * (H - 4)) - 2).toFixed(1)
    return '<div class="spark-wrap"><div class="spark-label">recent trend (' + pts.length + ' pts)</div>' +
      '<div class="spark"><svg viewBox="0 0 ' + W + ' ' + H + '" height="26">' +
      '<polyline points="' + coords + '" fill="none" stroke="' + color + '" stroke-width="1.5" ' +
        'stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>' +
      '<circle cx="' + W.toFixed(1) + '" cy="' + ly + '" r="2.2" fill="' + color + '"/>' +
      '</svg></div></div>'
  }

  function renderFlowCard(flow, records) {
    var sc = 'spill-' + flow.status
    var fw = freshWidth(flow.freshnessSeconds, flow.status)
    var fwc = flow.status === 'ok' ? 'ok' : flow.status === 'stale' ? 'stale' : 'no_data'
    var freshLabel = fmtFresh(flow.freshnessSeconds)

    var sparkHtml = ''
    if (records && records.length > 1) {
      var pts = []
      if (flow.flowKey === 'weather')   pts = records.map(function(r) { return r.summary.temperatureC   }).filter(function(v) { return v != null })
      if (flow.flowKey === 'energy')    pts = records.map(function(r) { return r.summary.totalRenewableKw }).filter(function(v) { return v != null })
      if (flow.flowKey === 'buildings') pts = records.map(function(r) { return r.summary.totalDemandKw  }).filter(function(v) { return v != null })
      sparkHtml = sparkline(pts, SPARK_COLORS[flow.flowKey] || SPARK_COLORS.energy)
    }

    return '<div class="panel">' +
      '<div class="panel-hd"><span class="plabel">' + flow.flowKey + '</span><span class="phd-sep"></span>' +
        '<span class="spill ' + sc + '">' + flow.status.replace(/_/g,' ') + '</span></div>' +
      '<div class="flow-body">' +
        '<div class="fresh-bar"><div class="fresh-fill ' + fwc + '" style="width:' + fw + '%"></div></div>' +
        '<div class="kv-grid">' +
          kv('freshness', freshLabel || (flow.hasData ? '&mdash;' : '&mdash;'), flow.status === 'ok' ? 'ok' : flow.status === 'stale' ? 'warn' : 'muted') +
          kv('last payload', fmt(flow.lastPayloadTimestamp) || '&mdash;', fmt(flow.lastPayloadTimestamp) ? null : 'muted') +
          kv('last ingest',  fmt(flow.lastIngestedAt)      || '&mdash;', fmt(flow.lastIngestedAt)      ? null : 'muted') +
          kv('messages', String(flow.messageCount)) +
        '</div>' +
        sparkHtml +
      '</div></div>'
  }

  function renderWeatherState(d) {
    if (!d) return noDataPanel('weather')
    var cond = d.condition.replace(/_/g,' ')
    var sub  = 'feels like ' + d.feelsLikeC.toFixed(1) + '\u00b0C'
    var dayLabel = (d.isDaytime ? 'day' : 'night') + ' &middot; ' + d.season
    var dlRow = d.daylightHours != null ? kv('daylight', d.daylightHours.toFixed(1) + '\u202fh') : ''
    return '<div class="panel">' +
      '<div class="panel-hd"><span class="plabel">weather</span><span class="phd-sep"></span><span class="spill spill-live">live</span></div>' +
      '<div class="state-body">' +
        '<div class="state-hero">' +
          '<div class="s-big">' + d.temperatureC.toFixed(1) + '<span class="u">&deg;C</span></div>' +
          '<div><div class="s-cond">' + cond + '</div><div class="s-cond-sub">' + sub + '</div></div>' +
        '</div>' +
        '<div class="kv-grid">' +
          kv('wind', d.windSpeedMs.toFixed(1) + '\u202fm/s &nbsp;' + Math.round(d.windDirectionDeg) + '&deg;') +
          kv('humidity', d.humidity.toFixed(0) + '%') +
          kv('daylight', dayLabel) +
          dlRow +
        '</div>' +
      '</div></div>'
  }

  function renderEnergyState(d) {
    if (!d) return noDataPanel('energy')
    var peak = Math.max(d.solarOutputKw, d.windOutputKw, 1)
    var sp = Math.round((d.solarOutputKw / peak) * 100)
    var wp = Math.round((d.windOutputKw  / peak) * 100)
    return '<div class="panel">' +
      '<div class="panel-hd"><span class="plabel">energy</span><span class="phd-sep"></span><span class="spill spill-live">live</span></div>' +
      '<div class="state-body">' +
        '<div class="stat-big">' +
          '<div class="sv">' + fmtKw(d.totalRenewableKw) + '</div>' +
          '<div class="sk">total renewable</div>' +
        '</div>' +
        '<div class="kv-grid">' +
          kv('solar', '<span style="color:var(--amber)">' + fmtKw(d.solarOutputKw) + '</span>') +
          '<div class="e-bar solar"><i style="width:' + sp + '%"></i></div>' +
          kv('wind',  '<span style="color:var(--teal)">'  + fmtKw(d.windOutputKw)  + '</span>') +
          '<div class="e-bar wind"><i style="width:' + wp + '%"></i></div>' +
        '</div>' +
      '</div></div>'
  }

  function renderBuildingsState(d) {
    if (!d) return noDataPanel('buildings')
    var tops = (d.topContributors || []).slice(0, 3).map(function(b, i) {
      return '<div class="top-item">' +
        '<span class="top-rank' + (i < 3 ? ' hi' : '') + '">#' + (i+1) + '</span>' +
        '<span class="top-label">' + b.label + '</span>' +
        '<span class="top-kw">' + fmtKw(b.currentDemandKw) + '</span>' +
      '</div>'
    }).join('')
    return '<div class="panel">' +
      '<div class="panel-hd"><span class="plabel">buildings</span><span class="phd-sep"></span><span class="spill spill-live">live</span></div>' +
      '<div class="state-body">' +
        '<div class="stat-big">' +
          '<div class="sv">' + fmtKw(d.totalDemandKw) + '</div>' +
          '<div class="sk">total demand &middot; ' + d.buildingCount + ' buildings</div>' +
        '</div>' +
        (tops ? '<div class="top-list">' + tops + '</div>' : '') +
      '</div></div>'
  }

  function noDataPanel(label) {
    return '<div class="panel">' +
      '<div class="panel-hd"><span class="plabel">' + label + '</span><span class="phd-sep"></span><span class="spill spill-no_data">no data</span></div>' +
      '<div class="state-body"><div class="no-data">No data yet</div></div>' +
    '</div>'
  }

  function safeFetch(url, cb) {
    fetch(url)
      .then(function(r) { return r.ok ? r.json() : Promise.reject(r.status) })
      .then(function(b) { cb(b.ok && b.data ? b.data : null) })
      .catch(function()  { cb(null) })
  }

  function fetchHistory(flowKey, cb) {
    fetch('/ops/history/' + flowKey)
      .then(function(r) { return r.json() })
      .then(function(b) { cb(b.ok && b.data ? b.data.records : []) })
      .catch(function()  { cb([]) })
  }

  function refresh() {
    fetch('/ops/summary')
      .then(function(r) { return r.json() })
      .then(function(summary) {
        document.getElementById('error-banner').style.display = 'none'

        var flows   = (summary.data && summary.data.flows) || []
        var broker  = !!(summary.data && summary.data.brokerConnected)
        var overall = (summary.data && summary.data.overallStatus) || 'unknown'

        var bp = document.getElementById('broker-pill')
        bp.innerHTML = '<span class="dot ' + (broker ? 'dot-ok' : 'dot-err') + '"></span>&nbsp;broker: ' + (broker ? 'connected' : 'disconnected')

        var sp = document.getElementById('status-pill')
        var sdot = overall === 'ok' ? 'dot-ok' : 'dot-warn'
        sp.innerHTML = '<span class="dot ' + sdot + '"></span>&nbsp;' + overall

        document.getElementById('last-updated').textContent =
          new Date().toLocaleTimeString(undefined, { hour12: false })

        // Flow cards: fetch history in parallel then render together
        var pending = flows.length || 0
        var histMap = {}

        function maybeRenderFlows() {
          if (--pending > 0) return
          document.getElementById('flow-cards').innerHTML =
            flows.map(function(f) { return renderFlowCard(f, histMap[f.flowKey]) }).join('')
        }

        if (flows.length === 0) {
          document.getElementById('flow-cards').innerHTML = ''
        } else {
          flows.forEach(function(f) {
            fetchHistory(f.flowKey, function(records) {
              histMap[f.flowKey] = records
              maybeRenderFlows()
            })
          })
        }

        // State cards (sequential fetches — avoids race on innerHTML)
        safeFetch('/weather/current', function(weather) {
          safeFetch('/energy/current', function(energy) {
            safeFetch('/buildings/summary', function(buildings) {
              document.getElementById('state-cards').innerHTML =
                renderWeatherState(weather) +
                renderEnergyState(energy) +
                renderBuildingsState(buildings)
            })
          })
        })
      })
      .catch(function() {
        var eb = document.getElementById('error-banner')
        eb.style.display = 'block'
        eb.textContent = 'Cannot reach /ops/summary \u2014 Operations service may be down.'
      })
  }

  refresh()
  setInterval(refresh, REFRESH_MS)
  </script>
</body>
</html>`
}
