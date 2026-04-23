export function renderHomePage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Cityverse VC</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
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

    .chrome { display: flex; align-items: center; gap: 14px; padding: 8px 4px 14px; }
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
      background: color-mix(in oklch, var(--accent) 14%, oklch(0.22 0.012 230));
      border-color: color-mix(in oklch, var(--accent) 50%, var(--line));
      color: var(--text-0);
      box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--accent) 20%, transparent), 0 0 24px color-mix(in oklch, var(--accent) 18%, transparent);
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-name { font-family: var(--cond); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; font-size: 13px; }
    .brand-sub { font-family: var(--mono); font-size: 10.5px; color: var(--text-2); letter-spacing: 0.16em; text-transform: uppercase; }
    .chrome-divider { width: 1px; height: 22px; background: var(--line); }
    .breadcrumbs { font-family: var(--mono); font-size: 11px; color: var(--text-2); letter-spacing: 0.12em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
    .breadcrumbs b { color: var(--text-0); font-weight: 500; }
    .breadcrumbs .sep { color: var(--text-3); }
    .chrome-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
    .pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line);
      font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.1em;
      color: var(--text-1); text-transform: uppercase; background: oklch(0.2 0.012 230 / 0.6);
    }
    .pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-lime); box-shadow: 0 0 10px var(--accent-lime); }

    .panel {
      background: linear-gradient(180deg, oklch(0.24 0.014 230 / 0.7), oklch(0.2 0.012 230 / 0.75));
      border: 1px solid var(--line);
      border-radius: var(--radius);
      position: relative;
      backdrop-filter: blur(6px);
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
    .panel-hd .hd-idx { font-family: var(--mono); font-size: 10.5px; color: var(--accent); letter-spacing: 0.14em; }

    .hero { display: grid; grid-template-columns: 1.15fr 1fr; gap: 14px; margin-bottom: 14px; }
    .hero-left { padding: 14px 18px 16px; }
    .hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
    .loc { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .loc .kicker { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.18em; color: var(--text-2); text-transform: uppercase; }
    .loc .name { font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
    .loc .coord { font-family: var(--mono); font-size: 11px; color: var(--text-2); letter-spacing: 0.06em; }
    .chip-select {
      display: inline-flex; align-items: center; gap: 8px;
      border: 1px solid var(--line); border-radius: var(--radius-sm);
      padding: 6px 10px; font-family: var(--mono); font-size: 11px; color: var(--text-1);
      letter-spacing: 0.08em; text-transform: uppercase; background: oklch(0.22 0.012 230 / 0.6);
      cursor: pointer;
    }
    .time-row { display: grid; grid-template-columns: auto 1fr; gap: 20px; align-items: end; margin-top: 6px; }
    .clock { font-family: var(--mono); font-weight: 300; font-size: 72px; line-height: 1; letter-spacing: -0.02em; display: flex; align-items: baseline; gap: 4px; }
    .clock .sec { font-size: 30px; color: var(--accent); letter-spacing: 0; }
    .date-block { display: flex; flex-direction: column; gap: 6px; padding-bottom: 6px; }
    .date-main { font-size: 20px; font-weight: 500; letter-spacing: -0.01em; }
    .date-meta { display: flex; gap: 14px; font-family: var(--mono); font-size: 10.5px; color: var(--text-2); letter-spacing: 0.14em; text-transform: uppercase; }
    .date-meta b { color: var(--text-0); font-weight: 500; margin-left: 4px; }

    .hero-controls { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: stretch; margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--line-soft); }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field .flabel { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-2); }
    .input, input, select {
      width: 100%; background: oklch(0.16 0.012 230 / 0.9); border: 1px solid var(--line); border-radius: var(--radius-sm);
      padding: 8px 10px; font-family: var(--mono); font-size: 12px; color: var(--text-0);
    }
    input::placeholder { color: var(--text-3); }
    .btn, button {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      height: 32px; padding: 0 12px; border-radius: var(--radius-sm);
      border: 1px solid var(--line); background: oklch(0.22 0.012 230 / 0.6);
      color: var(--text-0); font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
      cursor: pointer; white-space: nowrap;
    }
    .btn.primary, .primary {
      background: color-mix(in oklch, var(--accent) 14%, oklch(0.22 0.012 230));
      border-color: color-mix(in oklch, var(--accent) 50%, var(--line));
      box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--accent) 20%, transparent), 0 0 24px color-mix(in oklch, var(--accent) 18%, transparent);
    }
    .inline-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .button-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .button-row button, .inline-row button { margin-top: 0; }

    .cmd-bar {
      display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
      padding: 10px 14px; border-top: 1px solid var(--line-soft);
      background: oklch(0.18 0.012 230 / 0.6); border-radius: 0 0 var(--radius) var(--radius);
    }
    .cmd-group { display: flex; align-items: center; gap: 6px; }
    .cmd-group + .cmd-group { padding-left: 8px; margin-left: 2px; border-left: 1px solid var(--line-soft); }
    .cmd-label { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-3); margin-right: 4px; }
    .speedset { display: inline-flex; border: 1px solid var(--line); border-radius: var(--radius-sm); overflow: hidden; }
    .speedset .s { font-family: var(--mono); font-size: 11px; padding: 6px 10px; color: var(--text-1); background: transparent; border: none; border-right: 1px solid var(--line-soft); cursor: pointer; letter-spacing: 0.06em; }
    .speedset .s:last-child { border-right: none; }
    .speedset .s.active { background: color-mix(in oklch, var(--accent) 18%, transparent); color: var(--text-0); box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--accent) 45%, transparent); }

    .hero-right { display: grid; grid-template-columns: 230px 1fr; gap: 16px; padding: 14px 18px; }
    .gauge-wrap { position: relative; display: grid; place-items: center; }
    .gauge { width: 210px; height: 210px; display: block; }
    .gauge-center { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; pointer-events: none; }
    .gauge-center .klabel { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.22em; color: var(--text-2); text-transform: uppercase; }
    .gauge-center .kvalue { font-family: var(--mono); font-size: 34px; line-height: 1.1; color: var(--accent-lime); letter-spacing: -0.01em; margin-top: 2px; }
    .gauge-center .kunit { font-size: 13px; color: var(--text-2); }
    .gauge-center .kstate { margin-top: 6px; display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.16em; color: var(--text-1); text-transform: uppercase; }
    .gauge-center .kstate .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-lime); box-shadow: 0 0 8px var(--accent-lime); }

    .supply-demand { display: flex; flex-direction: column; gap: 10px; padding: 2px 2px 2px 4px; justify-content: center; }
    .sd-row { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 10px; }
    .sd-row .sd-label { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.16em; color: var(--text-2); text-transform: uppercase; }
    .sd-row .sd-value { font-family: var(--mono); font-size: 20px; color: var(--text-0); letter-spacing: -0.01em; }
    .sd-row .sd-value .u { font-size: 11px; color: var(--text-2); margin-left: 4px; }
    .bar { height: 6px; border-radius: 3px; background: oklch(0.26 0.012 230 / 0.9); overflow: hidden; }
    .bar > i { display: block; height: 100%; border-radius: 3px; }
    .bar.solar > i { background: linear-gradient(90deg, color-mix(in oklch, var(--accent-amber) 70%, transparent), var(--accent-amber)); }
    .bar.wind > i { background: linear-gradient(90deg, color-mix(in oklch, var(--accent) 70%, transparent), var(--accent)); }
    .bar.total > i { background: linear-gradient(90deg, color-mix(in oklch, var(--accent-lime) 70%, transparent), var(--accent-lime)); }
    .bar.oil > i { background: linear-gradient(90deg, color-mix(in oklch, var(--accent-rose) 70%, transparent), var(--accent-rose)); }
    .bar.demand > i { background: linear-gradient(90deg, color-mix(in oklch, var(--text-1) 50%, transparent), var(--text-1)); }

    .fossil-badge {
      display: none; font-family: var(--mono); font-size: 9px; letter-spacing: 0.14em;
      color: var(--accent-rose); text-transform: uppercase;
      padding: 1px 5px; border: 1px solid color-mix(in oklch, var(--accent-rose) 40%, var(--line));
      border-radius: 3px; background: color-mix(in oklch, var(--accent-rose) 10%, transparent);
      vertical-align: middle; margin-left: 5px;
    }
    .fossil-active .fossil-badge { display: inline; }
    .fossil-active .sd-label { color: color-mix(in oklch, var(--accent-rose) 80%, var(--text-1)); }
    .fossil-pill {
      display: none; align-items: center; gap: 5px;
      padding: 3px 8px; border-radius: 999px;
      border: 1px solid color-mix(in oklch, var(--accent-rose) 40%, var(--line));
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em;
      color: var(--accent-rose); text-transform: uppercase;
      background: color-mix(in oklch, var(--accent-rose) 10%, transparent);
    }
    .fossil-pill .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent-rose); box-shadow: 0 0 8px var(--accent-rose); }
    .fossil-pill.active { display: inline-flex; }
    .hero-right-footer { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; border-top: 1px dashed var(--line-soft); padding-top: 12px; margin-top: 8px; }
    .stat { display: flex; flex-direction: column; gap: 4px; background: oklch(0.2 0.012 230 / 0.55); border: 1px solid var(--line-soft); border-radius: var(--radius-sm); padding: 10px; }
    .stat .slabel, .stat .label { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.18em; color: var(--text-2); text-transform: uppercase; }
    .stat .svalue, .stat .value { font-family: var(--mono); font-size: 18px; color: var(--text-0); }
    .stat .svalue .u { font-size: 10px; color: var(--text-2); margin-left: 3px; }

    .row.r-mid { display: grid; gap: 14px; margin-bottom: 14px; grid-template-columns: 1fr 1fr; }
    .wx-body, .nudges, .ec-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 10px; }
    .wx-top { display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center; padding-bottom: 10px; border-bottom: 1px dashed var(--line-soft); }
    .wx-icon { width: 54px; height: 54px; border-radius: 50%; background: radial-gradient(circle at 40% 40%, color-mix(in oklch, var(--accent-amber) 65%, transparent), color-mix(in oklch, var(--accent-amber) 20%, transparent) 55%, transparent 70%); position: relative; }
    .wx-icon::before { content:""; position:absolute; inset:18px; border-radius:50%; background: var(--accent-amber); box-shadow: 0 0 22px color-mix(in oklch, var(--accent-amber) 55%, transparent); }
    .wx-cond { font-size: 18px; font-weight: 500; letter-spacing: -0.005em; }
    .wx-cond .sub { display: block; font-family: var(--mono); font-size: 10.5px; color: var(--text-2); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 3px; }
    .wx-temp { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: end; }
    .wx-temp .big { font-family: var(--mono); font-weight: 300; font-size: 52px; line-height: 1; letter-spacing: -0.02em; }
    .wx-temp .big sup { font-size: 22px; color: var(--text-2); font-weight: 300; }
    .wx-temp .feels { font-family: var(--mono); font-size: 10.5px; color: var(--text-2); letter-spacing: 0.14em; text-transform: uppercase; padding-bottom: 6px; }
    .wx-temp .feels b { color: var(--text-0); font-weight: 500; }
    .wx-grid, .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; }
    .wx-grid .cell { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 6px 0; border-bottom: 1px dashed var(--line-soft); }
    .wx-grid .cell:nth-last-child(-n+2) { border-bottom: none; }
    .wx-grid .cell .k { font-family: var(--mono); font-size: 10.5px; color: var(--text-2); letter-spacing: 0.14em; text-transform: uppercase; }
    .wx-grid .cell .v { font-family: var(--mono); font-size: 13px; color: var(--text-0); }
    .wx-grid .cell .v .u { font-size: 10.5px; color: var(--text-2); margin-left: 3px; }
    .sun-arc { position: relative; height: 56px; margin-top: 2px; border-top: 1px dashed var(--line-soft); padding-top: 10px; }
    .sun-arc svg { display: block; width: 100%; height: 46px; }
    .sun-labels { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10px; color: var(--text-2); letter-spacing: 0.12em; text-transform: uppercase; }
    .sun-labels b { color: var(--text-0); font-weight: 500; margin-left: 4px; }

    .nudge { display: grid; grid-template-columns: 120px 1fr 70px; gap: 10px; align-items: center; padding: 5px 0; border-bottom: 1px dashed var(--line-soft); }
    .nudge:last-of-type { border-bottom: none; }
    .nudge .nk { font-family: var(--mono); font-size: 10.5px; color: var(--text-1); letter-spacing: 0.14em; text-transform: uppercase; }
    .nudge .nv { font-family: var(--mono); font-size: 12px; color: var(--accent); letter-spacing: 0.04em; text-align: right; }
    .nudge.zero .nv { color: var(--text-2); }
    .nudge .nv.neg { color: var(--accent-rose); }
    .slider { position: relative; height: 22px; display: flex; align-items: center; }
    .slider .track { position: absolute; left: 0; right: 0; height: 4px; border-radius: 2px; background: oklch(0.25 0.012 230 / 0.8); }
    .slider .ticks { position: absolute; inset: 0; display: flex; justify-content: space-between; pointer-events: none; }
    .slider .ticks i { width: 1px; height: 6px; background: var(--line); align-self: center; opacity: 0.6; }
    .slider .ticks i.mid { height: 10px; opacity: 1; }
    .slider .fill { position: absolute; top: 50%; transform: translateY(-50%); height: 4px; border-radius: 2px; background: linear-gradient(90deg, color-mix(in oklch, var(--accent) 30%, transparent), var(--accent)); }
    .slider .fill.neg { background: linear-gradient(90deg, var(--accent-rose), color-mix(in oklch, var(--accent-rose) 30%, transparent)); }
    .slider .thumb { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; border-radius: 50%; background: var(--bg-0); border: 2px solid var(--accent); box-shadow: 0 0 10px color-mix(in oklch, var(--accent) 45%, transparent); }
    .slider .thumb.neg { border-color: var(--accent-rose); box-shadow: 0 0 10px color-mix(in oklch, var(--accent-rose) 45%, transparent); }
    .slider .zero-mark { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 2px; height: 14px; background: var(--text-2); opacity: 0.6; }
    .nudges-foot { display: flex; gap: 8px; align-items: center; padding-top: 10px; margin-top: 4px; border-top: 1px solid var(--line-soft); }
    .nudges-foot .btn, .nudges-foot button { flex: 1; }

    .buildings-panel { margin-top: 0; }
    .bld-head { display: flex; align-items: center; gap: 10px; padding: 11px 14px 10px; border-bottom: 1px solid var(--line-soft); }
    .bld-head .count { font-family: var(--mono); font-size: 10.5px; color: var(--accent); letter-spacing: 0.14em; }
    .bld-head .push { flex: 1; }
    .top3-note { display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 10px; color: var(--accent); letter-spacing: 0.14em; text-transform: uppercase; padding: 3px 7px; border: 1px solid color-mix(in oklch, var(--accent) 30%, var(--line)); border-radius: 3px; background: color-mix(in oklch, var(--accent) 8%, transparent); white-space: nowrap; }
    table.bld { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    table.bld thead th { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-2); font-weight: 500; text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line-soft); background: oklch(0.2 0.012 230 / 0.95); }
    table.bld thead th.num, table.bld tbody td.num { text-align: right; }
    table.bld tbody td { padding: 10px 12px; border-bottom: 1px solid var(--line-soft); vertical-align: middle; }
    table.bld tbody tr:last-child td { border-bottom: none; }
    table.bld tbody tr:hover { background: oklch(0.22 0.014 230 / 0.5); }
    table.bld tbody tr.top { background: color-mix(in oklch, var(--accent) 6%, transparent); }
    .rk { font-family: var(--mono); font-size: 10.5px; color: var(--text-3); letter-spacing: 0.12em; width: 28px; text-align: center; }
    .rk.t { color: var(--accent); }
    .blabel { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .blabel .n { font-size: 13px; font-weight: 500; color: var(--text-0); letter-spacing: -0.005em; }
    .blabel .id { font-family: var(--mono); font-size: 10px; color: var(--text-3); letter-spacing: 0.08em; }
    .btype { display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-1); }
    .btype .sw { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
    .btype.villa .sw { background: oklch(0.78 0.1 170); }
    .btype.apartment .sw { background: oklch(0.78 0.1 210); }
    .btype.office .sw { background: oklch(0.82 0.12 75); }
    .btype.retail .sw { background: oklch(0.74 0.14 340); }
    .btype.civic .sw { background: oklch(0.74 0.12 285); }
    .btype.industrial .sw { background: oklch(0.72 0.14 20); }
    .btype.utility .sw { background: oklch(0.8 0.1 130); }
    .schd { font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-2); padding: 2px 6px; border: 1px solid var(--line-soft); border-radius: 3px; background: oklch(0.2 0.012 230 / 0.7); white-space: nowrap; }
    .num-cell { text-align: right; font-family: var(--mono); }
    .num-cell .big { font-size: 14px; color: var(--text-0); letter-spacing: -0.01em; }
    .num-cell .big .u, .num-cell .sm .u { font-size: 10px; color: var(--text-2); margin-left: 3px; }
    .num-cell .sm { font-size: 12px; color: var(--text-1); }
    .factor { display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 12px; color: var(--text-0); justify-content: flex-end; width: 100%; }
    .factor .fbar { width: 44px; height: 4px; border-radius: 2px; background: oklch(0.25 0.012 230 / 0.8); position: relative; overflow: hidden; }
    .factor .fbar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 2px; }
    .factor.pos .fbar i { background: var(--accent); }
    .factor.neg .fbar i { background: var(--accent-rose); }
    .factor.flat .fbar i { background: var(--text-2); }
    .bld-foot { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-top: 1px solid var(--line-soft); font-family: var(--mono); font-size: 10.5px; color: var(--text-2); letter-spacing: 0.14em; text-transform: uppercase; }
    .bld-foot b { color: var(--text-0); font-weight: 500; }

    .status-bar {
      margin-top: 14px; display: flex; align-items: center; gap: 18px;
      padding: 8px 14px; border: 1px solid var(--line); border-radius: var(--radius);
      background: oklch(0.2 0.012 230 / 0.6); font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-2);
    }
    .status-bar b { color: var(--text-0); font-weight: 500; margin-left: 4px; }
    .status-bar .sep { width: 1px; height: 12px; background: var(--line); }
    .status-bar .push { margin-left: auto; }

    @media (max-width: 1180px) {
      .hero, .row.r-mid { grid-template-columns: 1fr; }
      .hero-right { grid-template-columns: 1fr; }
      .hero-controls { grid-template-columns: 1fr; }
      .hero-right-footer { grid-template-columns: 1fr; }
      .button-row { grid-template-columns: repeat(2, 1fr); }
      .inline-row { grid-template-columns: 1fr; }
      .status-bar, .chrome { flex-wrap: wrap; }
    }
  </style>
</head>
<body>
  <div class="bg-field" aria-hidden="true">
    <div class="bg-iso"></div>
    <div class="bg-glow"></div>
    <div class="bg-grain"></div>
  </div>

  <div class="app">
    <div class="chrome">
      <div class="brand">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <circle cx="13" cy="13" r="11.5" stroke="currentColor" stroke-opacity="0.35"/>
          <circle cx="13" cy="13" r="7" stroke="currentColor" stroke-opacity="0.55"/>
          <rect x="13" y="3" width="10" height="10" transform="rotate(45 13 3)" fill="var(--accent)" fill-opacity="0.85"/>
        </svg>
        <div>
          <div class="brand-name">Cityverse <span style="color:var(--accent)">VC</span></div>
          <div class="brand-sub">Operator Console · MVP</div>
        </div>
      </div>
      <div class="chrome-divider"></div>
      <div class="breadcrumbs">
        <span>Simulation</span><span class="sep">/</span><b>MVP-01</b><span class="sep">/</span><b>CONTROL</b>
      </div>
      <div class="chrome-right">
        <span class="pill"><span class="dot"></span>Sim node healthy</span>
        <span class="pill">Session · operator</span>
      </div>
    </div>

    <nav class="topnav" aria-label="Cityverse navigation">
      <a href="/" class="active">VC Console</a>
      <a href="http://localhost:3002/">IOT Monitor</a>
    </nav>

    <div class="hero">
      <section class="panel">
        <div class="panel-hd">
          <span class="hd-idx">01</span>
          <span class="label">Simulation Context</span>
          <span class="hd-sep"></span>
          <span class="hd-meta">Primary</span>
        </div>
        <div class="hero-left">
          <div class="hero-top">
            <div class="loc">
              <span class="kicker">Active Location</span>
              <div class="name" id="heroLocationName">—</div>
              <span class="coord" id="heroLocationCoord">—</span>
            </div>
            <select id="locationSelect" class="chip-select" onchange="selectLocation()">
              <option value="">Loading locations…</option>
            </select>
          </div>

          <div class="time-row">
            <div class="clock"><span id="heroClockMain">--:--</span><span class="sec" id="heroClockSec">:--</span></div>
            <div class="date-block">
              <div class="date-main" id="heroDateMain">—</div>
              <div class="date-meta">
                <span>Day <b id="heroDayOfYear">—</b></span>
                <span>Status <b id="sStatus">—</b></span>
                <span>Speed <b id="sSpeed">—</b></span>
              </div>
            </div>
          </div>

          <div class="hero-controls">
            <div class="field">
              <span class="flabel">Set Date</span>
              <input id="simDate" type="date" />
            </div>
            <div class="field">
              <span class="flabel">Set Time</span>
              <input id="simClockTime" type="time" step="1" />
            </div>
            <div class="field">
              <span class="flabel">Action</span>
              <button class="primary" onclick="setDateTimeFromFields()">Set Date + Time</button>
            </div>
          </div>
        </div>

        <div class="cmd-bar">
          <div class="cmd-group">
            <span class="cmd-label">Clock</span>
            <button onclick="loadDateTimeFieldsFromClock()">Load Current</button>
            <button onclick="setTime()">ISO Override</button>
          </div>
          <div class="cmd-group">
            <span class="cmd-label">Speed</span>
            <div class="speedset">
              <button class="s" data-speed="1" onclick="setQuickSpeed(1)">1x</button>
              <button class="s" data-speed="5" onclick="setQuickSpeed(5)">5x</button>
              <button class="s" data-speed="10" onclick="setQuickSpeed(10)">10x</button>
              <button class="s" data-speed="30" onclick="setQuickSpeed(30)">30x</button>
            </div>
            <input id="speed" type="number" step="0.1" value="1" style="width:88px" />
            <button onclick="setSpeed()">Set Speed</button>
          </div>
          <div class="cmd-group">
            <span class="cmd-label">State</span>
            <button onclick="post('/api/clock/pause')">Pause</button>
            <button class="primary" onclick="post('/api/clock/resume')">Resume</button>
          </div>
          <div class="cmd-group">
            <span class="cmd-label">ISO</span>
            <input id="simTime" type="text" placeholder="2026-01-15T12:00:00.000Z" style="width:260px" />
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-hd">
          <span class="hd-idx">03</span>
          <span class="label">Energy · City</span>
          <span class="hd-sep"></span>
          <span id="fossilPill" class="fossil-pill"><span class="dot"></span>Fossil Online</span>
          <span class="hd-meta">Live · Generation + CO2</span>
        </div>
        <div class="hero-right">
          <div class="gauge-wrap">
            <svg class="gauge" viewBox="0 0 220 220">
              <defs>
                <linearGradient id="arcLime" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stop-color="oklch(0.86 0.16 135)" stop-opacity="0.4"/>
                  <stop offset="1" stop-color="oklch(0.86 0.16 135)"/>
                </linearGradient>
              </defs>
              <g id="gaugeTicks" stroke="oklch(0.35 0.02 230 / 0.7)" stroke-width="1"></g>
              <path d="M 41.7 178.3 A 90 90 0 1 1 178.3 178.3" stroke="oklch(0.26 0.012 230)" stroke-width="10" fill="none" stroke-linecap="round"/>
              <path id="gaugeArc" d="M 41.7 178.3 A 90 90 0 1 1 178.3 178.3" stroke="url(#arcLime)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="424" stroke-dashoffset="212" pathLength="424"/>
              <circle cx="110" cy="110" r="72" stroke="oklch(0.3 0.015 230 / 0.7)" stroke-width="1" fill="none" stroke-dasharray="2 4"/>
            </svg>
            <div class="gauge-center">
              <div>
                <div class="klabel">City Balance</div>
                <div class="kvalue" id="heroBalance">—<span class="kunit"> kW</span></div>
                <div class="kstate"><span class="dot"></span><span id="heroBalanceState">—</span></div>
              </div>
            </div>
          </div>

          <div class="supply-demand">
            <div class="sd-row"><div><div class="sd-label">Solar Output</div><div class="bar solar"><i id="barSolar" style="width:0%"></i></div></div><div class="sd-value" id="eSolar">—</div></div>
            <div class="sd-row"><div><div class="sd-label">Wind Output</div><div class="bar wind"><i id="barWind" style="width:0%"></i></div></div><div class="sd-value" id="eWind">—</div></div>
            <div class="sd-row"><div><div class="sd-label">Total Renewable</div><div class="bar total"><i id="barTotal" style="width:0%"></i></div></div><div class="sd-value" id="eTotal">—</div></div>
            <div class="sd-row" id="oilRow"><div><div class="sd-label">Oil Backup<span class="fossil-badge">Online</span></div><div class="bar oil"><i id="barOil" style="width:0%"></i></div></div><div class="sd-value" id="eOilBackup">—</div></div>
            <div class="sd-row"><div><div class="sd-label">City Demand</div><div class="bar demand"><i id="barDemand" style="width:0%"></i></div></div><div class="sd-value" id="cDemand">—</div></div>
          </div>

          <div class="hero-right-footer">
            <div class="stat"><span class="slabel">City Balance</span><span class="svalue" id="cBalance">—</span></div>
            <div class="stat"><span class="slabel">Buildings</span><span class="svalue" id="cBuildingCount">—</span></div>
            <div class="stat" id="co2Stat"><span class="slabel">CO2 Emissions</span><span class="svalue" id="sCo2Rate">—<span class="u">kg/h</span></span></div>
          </div>
        </div>
      </section>
    </div>

    <div class="row r-mid">
      <section class="panel">
        <div class="panel-hd">
          <span class="hd-idx">02</span>
          <span class="label">Weather · Daylight</span>
          <span class="hd-sep"></span>
          <span class="hd-meta" id="locationLabel">—</span>
        </div>
        <div class="wx-body">
          <div class="wx-top">
            <div class="wx-icon" aria-hidden="true"></div>
            <div class="wx-cond"><span id="wCondition">—</span><span class="sub" id="wSummarySub">—</span></div>
          </div>
          <div class="wx-temp">
            <div class="big" id="wTemp">—</div>
            <div class="feels">Feels like <b id="wFeels">—</b></div>
          </div>
          <div class="wx-grid">
            <div class="cell"><span class="k">Humidity</span><span class="v" id="wHumidity">—</span></div>
            <div class="cell"><span class="k">Cloud Cover</span><span class="v" id="wCloud">—</span></div>
            <div class="cell"><span class="k">Wind</span><span class="v" id="wWind">—</span></div>
            <div class="cell"><span class="k">Daylight</span><span class="v" id="wDayState">—</span></div>
          </div>
          <div class="sun-arc">
            <svg viewBox="0 0 280 46" preserveAspectRatio="none">
              <line x1="0" y1="42" x2="280" y2="42" stroke="oklch(0.3 0.02 230 / 0.6)" stroke-dasharray="2 3"/>
              <path d="M 8 42 Q 140 -22 272 42" stroke="oklch(0.35 0.02 230 / 0.6)" fill="none"/>
              <path d="M 8 42 Q 140 -22 272 42" stroke="var(--accent-amber)" fill="none" stroke-width="1.5" stroke-dasharray="280" stroke-dashoffset="112"/>
              <circle cx="182" cy="10" r="4" fill="var(--accent-amber)"/>
              <circle cx="182" cy="10" r="8" fill="var(--accent-amber)" fill-opacity="0.18"/>
              <circle cx="8" cy="42" r="2.5" fill="oklch(0.6 0.02 230)"/>
              <circle cx="272" cy="42" r="2.5" fill="oklch(0.6 0.02 230)"/>
            </svg>
            <div class="sun-labels">
              <span>Sunrise<b id="dSunrise">—</b></span>
              <span>Daylight<b id="dDayLength">—</b></span>
              <span>Sunset<b id="dSunset">—</b></span>
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-hd">
          <span class="hd-idx">04</span>
          <span class="label">Weather Nudges</span>
          <span class="hd-sep"></span>
          <span class="hd-meta">Bias · Demo controls</span>
        </div>
        <div class="nudges">
          <label class="nudge"><span class="nk">Pressure Bias</span><input id="pressureBias" type="number" step="1" value="0" /><span class="nv" id="pressureBiasValue">0</span></label>
          <label class="nudge"><span class="nk">Cloud Bias</span><input id="cloudBias" type="number" step="0.1" value="0" /><span class="nv" id="cloudBiasValue">0</span></label>
          <label class="nudge"><span class="nk">Wind Bias</span><input id="windBias" type="number" step="0.5" value="0" /><span class="nv" id="windBiasValue">0</span></label>
          <label class="nudge"><span class="nk">Temperature Bias</span><input id="tempBias" type="number" step="0.5" value="0" /><span class="nv" id="tempBiasValue">0</span></label>
          <label class="nudge zero"><span class="nk">Humidity Bias</span><input id="humidityBias" type="number" step="0.1" value="0" /><span class="nv" id="humidityBiasValue">0</span></label>
          <div class="nudges-foot">
            <button onclick="resetWeatherNudges()">Reset</button>
            <button class="primary" onclick="applyWeatherNudges()">Apply Weather Nudges</button>
          </div>
        </div>
      </section>
    </div>

    <section class="panel buildings-panel">
      <div class="bld-head">
        <span class="hd-idx">05</span>
        <span class="label">Buildings · Demand Contributors</span>
        <span class="count" id="buildingCountLabel">—</span>
        <span class="push"></span>
        <span class="top3-note">Top 3 highlighted</span>
      </div>
      <table class="bld">
        <thead>
          <tr>
            <th>#</th>
            <th>Building</th>
            <th>Type</th>
            <th>Schedule</th>
            <th class="num">Current Demand</th>
            <th class="num">Base Demand</th>
            <th class="num">People</th>
            <th class="num">Occupancy</th>
            <th class="num">Weather</th>
          </tr>
        </thead>
        <tbody id="buildingsBody">
          <tr><td colspan="9">Loading…</td></tr>
        </tbody>
      </table>
      <div class="bld-foot">
        <span>Total demand <b id="buildingDemandTotal">—</b></span>
        <span>Top 3 share <b id="top3Share">—</b></span>
      </div>
    </section>

    <div class="status-bar">
      <span>Sim <b id="statusRun">—</b></span>
      <span class="sep"></span>
      <span>Speed <b id="statusSpeed">—</b></span>
      <span class="sep"></span>
      <span>Location <b id="statusLocation">—</b></span>
      <span class="sep"></span>
      <span>Sim Time <b id="sDatetime">—</b></span>
      <span class="push"></span>
      <span>Build <b>MVP</b></span>
    </div>
  </div>

  <script>
    let lastClockData = null
    let lastLocationData = null

    ;(function buildGaugeTicks() {
      const g = document.getElementById('gaugeTicks')
      if (!g) return
      const cx = 110, cy = 110, r1 = 100, r2 = 106
      for (let i = 0; i <= 48; i++) {
        const t = i / 48
        const ang = (135 + t * 270) * Math.PI / 180
        const x1 = cx + Math.cos(ang) * r1
        const y1 = cy + Math.sin(ang) * r1
        const x2 = cx + Math.cos(ang) * r2
        const y2 = cy + Math.sin(ang) * r2
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        l.setAttribute('x1', x1)
        l.setAttribute('y1', y1)
        l.setAttribute('x2', x2)
        l.setAttribute('y2', y2)
        l.setAttribute('stroke-opacity', (i % 6 === 0) ? 0.85 : 0.35)
        g.appendChild(l)
      }
    })()

    async function fetchJson(url) {
      const res = await fetch(url)
      return await res.json()
    }

    async function post(url, body) {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      })
      await refresh()
    }

    function decimalHourToHHMM(h) {
      if (h == null) return '—'
      const hh = Math.floor(h)
      const mm = Math.round((h - hh) * 60)
      return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0')
    }

    function fmt(n, decimals, unit) {
      if (n == null || Number.isNaN(n)) return '—'
      return n.toFixed(decimals) + (unit ? ' ' + unit : '')
    }

    function setText(id, value) {
      const el = document.getElementById(id)
      if (el) el.textContent = value
    }

    function updateBiasReadouts() {
      ;['pressureBias','cloudBias','windBias','tempBias','humidityBias'].forEach(id => {
        const input = document.getElementById(id)
        const label = document.getElementById(id + 'Value')
        if (!input || !label) return
        label.textContent = input.value
      })
    }

    async function loadLocationOptions() {
      const res = await fetchJson('/api/location/options')
      const select = document.getElementById('locationSelect')
      select.innerHTML = ''
      for (const loc of res.data) {
        const opt = document.createElement('option')
        opt.value = loc.id
        opt.textContent = loc.label
        opt.dataset.latitude = String(loc.latitude)
        opt.dataset.longitude = String(loc.longitude)
        opt.dataset.country = loc.countryCode ?? ''
        select.appendChild(opt)
      }
      const current = await fetchJson('/api/location/current')
      lastLocationData = current.data
      select.value = current.data.id
      updateLocationMeta(current.data)
    }

    function updateLocationMeta(location) {
      if (!location) return
      lastLocationData = location
      setText('heroLocationName', location.label)
      setText('statusLocation', location.label)
      const coord = location.latitude.toFixed(4) + '° N · ' + location.longitude.toFixed(4) + '° E' + (location.countryCode ? ' · ' + location.countryCode : '')
      setText('heroLocationCoord', coord)
    }

    async function selectLocation() {
      const locationId = document.getElementById('locationSelect').value
      if (!locationId) return
      await post('/api/location/select', { locationId })
      const current = await fetchJson('/api/location/current')
      updateLocationMeta(current.data)
    }

    async function setSpeed() {
      const speed = Number(document.getElementById('speed').value)
      await post('/api/clock/speed', { speed })
    }

    async function setQuickSpeed(speed) {
      document.getElementById('speed').value = String(speed)
      await post('/api/clock/speed', { speed })
    }

    async function setTime() {
      const simTime = document.getElementById('simTime').value
      if (!simTime) return
      await post('/api/clock/time', { simTime })
    }

    async function setDateTimeFromFields() {
      const date = document.getElementById('simDate').value
      const time = document.getElementById('simClockTime').value
      if (!date || !time) return
      const simTime = new Date(date + 'T' + time + 'Z').toISOString()
      document.getElementById('simTime').value = simTime
      await post('/api/clock/time', { simTime })
    }

    function loadDateTimeFieldsFromClock() {
      if (!lastClockData) return
      const d = new Date(lastClockData.simTime)
      document.getElementById('simDate').value = d.toISOString().slice(0, 10)
      document.getElementById('simClockTime').value = d.toISOString().slice(11, 19)
      document.getElementById('simTime').value = d.toISOString()
      document.getElementById('speed').value = String(lastClockData.speed)
    }

    function resetWeatherNudges() {
      document.getElementById('pressureBias').value = '0'
      document.getElementById('cloudBias').value = '0'
      document.getElementById('windBias').value = '0'
      document.getElementById('tempBias').value = '0'
      document.getElementById('humidityBias').value = '0'
      updateBiasReadouts()
    }

    async function applyWeatherNudges() {
      await post('/api/weather/nudge', {
        pressureBias: Number(document.getElementById('pressureBias').value),
        cloudBias: Number(document.getElementById('cloudBias').value),
        windBias: Number(document.getElementById('windBias').value),
        tempBias: Number(document.getElementById('tempBias').value),
        humidityBias: Number(document.getElementById('humidityBias').value)
      })
    }

    function updateClockPanel(clock) {
      lastClockData = clock.data
      const d = new Date(clock.data.simTime)
      const iso = d.toISOString()
      const dayStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 0))
      const dayOfYear = Math.floor((d - dayStart) / 86400000)
      setText('sDatetime', iso.slice(0, 10) + ' ' + iso.slice(11, 19))
      setText('heroClockMain', iso.slice(11, 16))
      setText('heroClockSec', ':' + iso.slice(17, 19))
      setText('heroDateMain', d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }))
      setText('heroDayOfYear', String(dayOfYear))
      setText('sSpeed', clock.data.speed + 'x')
      setText('statusSpeed', clock.data.speed + 'x')
      setText('statusRun', clock.data.paused ? 'paused' : 'running')
      const statusValue = clock.data.paused ? 'Paused' : 'Running'
      setText('sStatus', statusValue)
      document.querySelectorAll('.speedset .s').forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.speed) === clock.data.speed)
      })
    }

    function updateWeatherPanel(weather) {
      const w = weather.data
      const select = document.getElementById('locationSelect')
      const selected = select.options[select.selectedIndex]
      const label = selected?.textContent ?? lastLocationData?.label ?? '—'
      setText('locationLabel', label)
      if (w.locationId && select.value !== w.locationId) select.value = w.locationId
      setText('dSunrise', decimalHourToHHMM(w.sunrise))
      setText('dSunset', decimalHourToHHMM(w.sunset))
      setText('dDayLength', w.daylightHours != null ? w.daylightHours.toFixed(1) + ' h' : '—')
      setText('wCondition', (w.condition ?? '—').replace(/_/g, ' '))
      setText('wSummarySub', (w.isDaytime ? 'Daytime' : 'Nighttime') + ' · ' + (w.season ?? '—'))
      setText('wTemp', fmt(w.temperatureC, 1, '°C'))
      setText('wFeels', fmt(w.feelsLikeC, 1, '°C'))
      setText('wHumidity', fmt(w.humidity, 0, '%'))
      setText('wCloud', w.cloudCover != null ? Math.round(w.cloudCover * 100) + '%' : '—')
      setText('wWind', fmt(w.windSpeedMs, 1, 'm/s'))
      setText('wDayState', w.isDaytime ? 'Day' : 'Night')
    }

    function setBar(id, value, max) {
      const el = document.getElementById(id)
      if (!el) return
      const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
      el.style.width = pct + '%'
    }

    function updateEnergyAndCityPanel(energy, city, buildings) {
      const e = energy.data
      const c = city.data
      const bs = buildings.data
      const total = Math.max(e.totalGenerationKw, c.demand.demandKw, 1)

      setText('eSolar', fmt(e.solarOutputKw, 1, 'kW'))
      setText('eWind', fmt(e.windOutputKw, 1, 'kW'))
      setText('eTotal', fmt(e.totalRenewableKw, 1, 'kW'))
      setText('eOilBackup', fmt(e.oilBackupOutputKw, 1, 'kW'))
      setText('cDemand', fmt(c.demand.demandKw, 1, 'kW'))
      setText('cBuildingCount', bs.length + ' online')
      setText('buildingCountLabel', bs.length + ' nodes')

      const oilRow = document.getElementById('oilRow')
      if (oilRow) oilRow.classList.toggle('fossil-active', e.oilBackupOnline)
      const fossilPill = document.getElementById('fossilPill')
      if (fossilPill) fossilPill.classList.toggle('active', e.oilBackupOnline)

      const co2Text = e.currentCo2KgPerHour != null ? e.currentCo2KgPerHour.toFixed(1) : '—'
      setText('sCo2Rate', co2Text)
      const co2Stat = document.getElementById('co2Stat')
      if (co2Stat) co2Stat.classList.toggle('fossil-active', e.oilBackupOnline)

      const balanceKw = c.balanceKw
      const balanceText = (balanceKw >= 0 ? '+ ' : '- ') + Math.abs(balanceKw).toFixed(1)
      setText('heroBalance', balanceText)
      setText('heroBalanceState', balanceKw >= 0 ? 'Surplus' : 'Deficit')
      setText('cBalance', (balanceKw >= 0 ? '+' : '') + balanceKw.toFixed(1) + ' kW')

      setBar('barSolar', e.solarOutputKw, total)
      setBar('barWind', e.windOutputKw, total)
      setBar('barTotal', e.totalRenewableKw, total)
      setBar('barOil', e.oilBackupOutputKw, total)
      setBar('barDemand', c.demand.demandKw, total)

      const arc = document.getElementById('gaugeArc')
      if (arc) {
        const ratio = Math.max(0, Math.min(1, e.totalGenerationKw / total))
        arc.setAttribute('stroke-dashoffset', String(424 - ratio * 424))
      }

      const sorted = [...bs].sort((a, b) => b.currentDemandKw - a.currentDemandKw)
      const top3 = sorted.slice(0, 3)

      const sumDemand = sorted.reduce((s, b) => s + b.currentDemandKw, 0)
      const top3Demand = top3.reduce((s, b) => s + b.currentDemandKw, 0)
      setText('buildingDemandTotal', fmt(sumDemand, 1, 'kW'))
      setText('top3Share', sumDemand > 0 ? ((top3Demand / sumDemand) * 100).toFixed(1) + '%' : '—')
    }

    function typeClass(type) {
      if (type === 'villa') return 'villa'
      if (type === 'apartment') return 'apartment'
      if (type === 'office') return 'office'
      if (type === 'retail') return 'retail'
      if (type === 'civic') return 'civic'
      if (type === 'industrial') return 'industrial'
      if (type === 'utility') return 'utility'
      return 'utility'
    }

    function renderFactor(value) {
      const pct = Math.max(0, Math.min(100, value * 60))
      const cls = value > 1.02 ? 'pos' : value < 0.98 ? 'neg' : 'flat'
      return '<span class="factor ' + cls + '"><span class="fbar"><i style="width:' + pct + '%"></i></span>' + value.toFixed(2) + '×</span>'
    }

    function updateBuildingsTable(buildings) {
      const sorted = [...buildings.data].sort((a, b) => b.currentDemandKw - a.currentDemandKw)
      document.getElementById('buildingsBody').innerHTML = sorted.map((b, i) => {
        const rowClass = i < 3 ? ' class="top"' : ''
        const occupancyPercent = b.occupancyCapacity > 0 ? Math.round((b.occupancyCount / b.occupancyCapacity) * 100) : 0
        return '<tr' + rowClass + '>' +
          '<td class="rk ' + (i < 3 ? 't' : '') + '">' + (i + 1) + '</td>' +
          '<td><div class="blabel"><span class="n">' + b.label + '</span><span class="id">' + b.id + '</span></div></td>' +
          '<td><span class="btype ' + typeClass(b.type) + '"><span class="sw"></span>' + b.type + '</span></td>' +
          '<td><span class="schd">' + b.scheduleClass + '</span></td>' +
          '<td class="num-cell"><span class="big">' + b.currentDemandKw.toFixed(1) + '<span class="u">kW</span></span></td>' +
          '<td class="num-cell"><span class="sm">' + b.baseDemandKw.toFixed(1) + '<span class="u">kW</span></span></td>' +
          '<td class="num-cell"><span class="big">' + b.occupancyCount + '<span class="u">ppl</span></span></td>' +
          '<td class="num-cell">' + renderFactor(occupancyPercent / 100) + '</td>' +
          '<td class="num-cell">' + renderFactor(b.weatherFactor) + '</td>' +
          '</tr>'
      }).join('')
    }

    async function refresh() {
      const [clock, weather, energy, city, buildings] = await Promise.all([
        fetchJson('/api/clock'),
        fetchJson('/api/weather/current'),
        fetchJson('/api/energy/current'),
        fetchJson('/api/city/current'),
        fetchJson('/api/buildings/current'),
      ])
      updateClockPanel(clock)
      updateWeatherPanel(weather)
      updateEnergyAndCityPanel(energy, city, buildings)
      updateBuildingsTable(buildings)
      if (!document.getElementById('simDate').value) loadDateTimeFieldsFromClock()
      updateBiasReadouts()
    }

    document.querySelectorAll('#pressureBias,#cloudBias,#windBias,#tempBias,#humidityBias').forEach(el => el.addEventListener('input', updateBiasReadouts))

    loadLocationOptions().then(() => {
      updateBiasReadouts()
      setInterval(refresh, 2000)
      refresh()
    })
  </script>
</body>
</html>`
}
