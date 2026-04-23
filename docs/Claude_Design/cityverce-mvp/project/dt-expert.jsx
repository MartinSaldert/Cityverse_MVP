// Expert-mode components — professional operations dashboard language.
// Mirrors the console family: charcoal panels, IBM Plex, tabular numerics,
// monospaced meta labels, subtle status accents.

const exS = {
  panel: {
    background: 'linear-gradient(180deg, oklch(0.22 0.014 230), oklch(0.17 0.012 230))',
    border: `1px solid ${DT.expert.line}`,
    borderRadius: 10,
    color: DT.expert.text0,
    fontFamily: DT.expert.sans,
    position: 'relative',
    overflow: 'hidden',
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
  },
  hd: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px 9px',
    borderBottom: `1px solid ${DT.expert.lineSoft}`,
    fontFamily: DT.expert.mono, fontSize: 11.5,
    letterSpacing: '0.16em', textTransform: 'uppercase',
    color: DT.expert.text2,
  },
  hdIdx: { color: DT.expert.accent, marginRight: 2 },
  hdSpacer: { flex: 1, height: 1, background: DT.expert.lineSoft },
  hdMeta: { color: DT.expert.text3, fontSize: 9.5 },
  label: { fontFamily: DT.expert.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: DT.expert.text2 , fontWeight: 600 },
  val:   { fontFamily: DT.expert.mono, letterSpacing: '-0.005em', color: DT.expert.text0, fontVariantNumeric: 'tabular-nums' },
  divider: { height: 1, background: DT.expert.lineSoft, margin: '4px 0' },
  dot(color){ return { display:'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }; },
};

function ExStatus({ status }) {
  const map = {
    busy:   { c: DT.expert.warn, t: 'High Load' },
    ok:     { c: DT.expert.ok,   t: 'Nominal' },
    steady: { c: DT.expert.info, t: 'Steady' },
    cozy:   { c: DT.expert.accent, t: 'Low Use' },
    alert:  { c: DT.expert.crit, t: 'Alert' },
  };
  const s = map[status] || map.ok;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily: DT.expert.mono,
      fontSize: 11, letterSpacing:'0.16em', textTransform:'uppercase', color: DT.expert.text1 , fontWeight: 600 }}>
      <span style={exS.dot(s.c)} />{s.t}
    </span>
  );
}

function ExSpark({ points = [0.3,0.5,0.4,0.7,0.6,0.8,0.7,0.85,0.9,0.75,0.6,0.8], color = DT.expert.accent }) {
  const w = 100, h = 22;
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (points.length - 1)) * w} ${h - p * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 22, display:'block' }}>
      <path d={d + ` L ${w} ${h} L 0 ${h} Z`} fill={color} fillOpacity="0.15" />
      <path d={d} stroke={color} strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function ExBar({ pct, color = DT.expert.accent }) {
  return (
    <div style={{ height: 4, borderRadius: 2, background: 'oklch(0.26 0.012 230 / 0.9)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`,
        background: `linear-gradient(90deg, color-mix(in oklch, ${color} 55%, transparent), ${color})`, borderRadius: 2 }} />
    </div>
  );
}

// ─── SUMMARY CARD ─────────────────────────────────────────────
function ExSummaryCard({ b }) {
  const occPct = Math.round((b.occ / b.cap) * 100);
  const delta = b.demand - b.base;
  return (
    <div style={exS.panel}>
      <div style={exS.hd}>
        <span style={exS.hdIdx}>05</span>
        <span>Building · Summary</span>
        <span style={exS.hdSpacer}/>
        <span style={exS.hdMeta}>14:32:07</span>
      </div>
      <div style={{ padding: '12px 14px 14px', display:'flex', flexDirection:'column', gap: 12, flex: 1 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.005, color: DT.expert.text0 }}>{b.name}</div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, fontWeight: 500, letterSpacing: '0.08em', marginTop: 2 }}>{b.id}</div>
          </div>
          <ExStatus status={b.status} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', alignItems: 'center' }}>
          <span style={exS.label}>Type</span>
          <span style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text1, letterSpacing:'0.14em', textTransform:'uppercase' , fontWeight: 600 }}>{b.type}</span>
        </div>

        <div style={{ borderTop: `1px dashed ${DT.expert.lineSoft}`, paddingTop: 10, display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
          <div>
            <div style={exS.label}>Demand</div>
            <div style={{ ...exS.val, fontSize: 22, color: delta > 0 ? DT.expert.warn : DT.expert.text0, marginTop: 2 }}>
              {b.demand.toFixed(1)}<span style={{ fontSize: 11.5, color: DT.expert.text2, marginLeft: 3 }}>kW</span>
            </div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: delta > 0 ? DT.expert.warn : DT.expert.ok, marginTop: 2 }}>
              {delta > 0 ? '+' : ''}{delta.toFixed(1)} kW vs base
            </div>
          </div>
          <div>
            <div style={exS.label}>Occupancy</div>
            <div style={{ ...exS.val, fontSize: 22, marginTop: 2 }}>
              {b.occ}<span style={{ fontSize: 11.5, color: DT.expert.text2, marginLeft: 3 }}>ppl</span>
            </div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, marginTop: 2, letterSpacing:'0.12em' }}>
              {occPct}% · cap {b.cap}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <span style={exS.label}>Occupancy Load</span>
            <span style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2 }}>{occPct}%</span>
          </div>
          <ExBar pct={occPct} color={DT.expert.accent} />
        </div>

        <div style={{ marginTop: 'auto' }}>
          <ExSpark color={delta > 0 ? DT.expert.warn : DT.expert.accent}/>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4 }}>
            <span style={exS.label}>60-min demand</span>
            <span style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text3 }}>Updated 04s ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────
function ExDetailPanel({ b }) {
  const occPct = Math.round((b.occ / b.cap) * 100);
  const delta = b.demand - b.base;
  return (
    <div style={exS.panel}>
      <div style={exS.hd}>
        <span style={exS.hdIdx}>05</span>
        <span>Building · Detail</span>
        <span style={exS.hdSpacer}/>
        <span style={exS.hdMeta}>Inspector</span>
      </div>
      <div style={{ padding: '14px 16px', display:'flex', flexDirection:'column', gap: 14, flex: 1, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 10 }}>
          <div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, letterSpacing:'0.18em' }}>BUILDING</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: DT.expert.text0, marginTop: 2 }}>{b.name}</div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 12, color: DT.expert.text2, fontWeight: 500, letterSpacing:'0.08em', marginTop: 2 }}>{b.id} · {b.type}</div>
          </div>
          <ExStatus status={b.status} />
        </div>

        {/* Primary KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10,
            padding: '10px 0', borderTop: `1px solid ${DT.expert.lineSoft}`, borderBottom: `1px solid ${DT.expert.lineSoft}` }}>
          <div>
            <div style={exS.label}>Current Demand</div>
            <div style={{ ...exS.val, fontSize: 22, color: delta>0 ? DT.expert.warn : DT.expert.text0 }}>
              {b.demand.toFixed(1)}<span style={{ fontSize: 11.5, color: DT.expert.text2, marginLeft: 3 }}>kW</span>
            </div>
          </div>
          <div>
            <div style={exS.label}>Base Demand</div>
            <div style={{ ...exS.val, fontSize: 22 }}>
              {b.base.toFixed(1)}<span style={{ fontSize: 11.5, color: DT.expert.text2, marginLeft: 3 }}>kW</span>
            </div>
          </div>
          <div>
            <div style={exS.label}>Δ Delta</div>
            <div style={{ ...exS.val, fontSize: 22, color: delta>0 ? DT.expert.warn : DT.expert.ok }}>
              {delta>0?'+':''}{delta.toFixed(1)}<span style={{ fontSize: 11.5, color: DT.expert.text2, marginLeft: 3 }}>kW</span>
            </div>
          </div>
        </div>

        {/* Factors */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 4 }}>
              <span style={exS.label}>Occupancy</span>
              <span style={{ fontFamily: DT.expert.mono, fontSize: 12, color: DT.expert.text0 }}>{b.occ} / {b.cap} <span style={{ color: DT.expert.text2 }}>ppl</span></span>
            </div>
            <ExBar pct={occPct} color={DT.expert.accent}/>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, marginTop: 3, letterSpacing:'0.12em' }}>
              FACTOR {(b.occ / b.cap).toFixed(2)}× · {occPct}%
            </div>
          </div>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 4 }}>
              <span style={exS.label}>Weather</span>
              <span style={{ fontFamily: DT.expert.mono, fontSize: 12, color: DT.expert.text0 }}>{b.weather.toFixed(2)}×</span>
            </div>
            <ExBar pct={(b.weather-0.8)/0.8*100} color={DT.expert.warn}/>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, marginTop: 3, letterSpacing:'0.12em' }}>
              19°C · CLOUD 42% · WIND 14 KM/H
            </div>
          </div>
        </div>

        {/* Trend */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 4 }}>
            <span style={exS.label}>Demand · 60 min</span>
            <span style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text3 }}>min {(b.demand*0.75).toFixed(1)} · avg {(b.demand*0.9).toFixed(1)} · max {(b.demand*1.08).toFixed(1)}</span>
          </div>
          <div style={{ background: 'oklch(0.16 0.012 230 / 0.6)', borderRadius: 6, padding: '6px 6px 2px' }}>
            <ExSpark points={[0.3,0.4,0.55,0.5,0.6,0.7,0.65,0.8,0.9,0.85,0.75,0.82]}/>
          </div>
        </div>

        {/* Future reserved */}
        <div style={{ marginTop: 'auto', padding: '8px 10px', border: `1px dashed ${DT.expert.lineSoft}`, borderRadius: 6,
          display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8 }}>
          {[
            ['CO₂', '— g/kWh'],
            ['Battery', '— %'],
            ['District', '—'],
            ['Alerts', '0'],
          ].map(([k,v]) => (
            <div key={k}>
              <div style={{ ...exS.label, fontSize: 9 }}>{k}</div>
              <div style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text3, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily: DT.expert.mono,
          fontSize: 11, letterSpacing:'0.16em', color: DT.expert.text3, textTransform:'uppercase' , fontWeight: 600 }}>
          <span>Last updated · 14:32:03</span>
          <span>Tick #1 284 920</span>
        </div>
      </div>
    </div>
  );
}

// ─── FLOATING LABEL ───────────────────────────────────────────
function ExFloatLabel({ b, style }) {
  const occPct = Math.round((b.occ / b.cap) * 100);
  const delta = b.demand - b.base;
  const dc = delta > 0 ? DT.expert.warn : DT.expert.ok;
  return (
    <div style={{ position: 'relative', ...style }}>
      {/* leader line */}
      <div style={{ position:'absolute', left: 20, bottom: -22, width: 1, height: 22, background: DT.expert.line }}/>
      <div style={{ position:'absolute', left: 16, bottom: -26, width: 9, height: 9, border: `1px solid ${DT.expert.accent}`,
        transform: 'rotate(45deg)', background: 'oklch(0.22 0.012 230)' }}/>
      <div style={{
        background: 'oklch(0.21 0.012 230 / 0.92)',
        border: `1px solid ${DT.expert.line}`,
        borderRadius: 6,
        padding: '8px 12px',
        display: 'inline-flex', flexDirection:'column', gap: 6,
        fontFamily: DT.expert.sans, color: DT.expert.text0,
        backdropFilter: 'blur(10px)',
        minWidth: 180,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
          <span style={exS.dot(dc)} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
          <div style={{ marginLeft:'auto', fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text2, fontWeight: 500, letterSpacing:'0.1em' }}>{b.type.toUpperCase()}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11, letterSpacing: '0.16em', color: DT.expert.text3 }}>DEMAND</div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 16, color: dc }}>{b.demand.toFixed(1)}<span style={{ fontSize: 11, color: DT.expert.text2, marginLeft: 2 }}>kW</span></div>
          </div>
          <div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11, letterSpacing: '0.16em', color: DT.expert.text3 }}>OCC.</div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 16, color: DT.expert.text0 }}>{occPct}<span style={{ fontSize: 11, color: DT.expert.text2, marginLeft: 2 }}>%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ExSummaryCard, ExDetailPanel, ExFloatLabel });
