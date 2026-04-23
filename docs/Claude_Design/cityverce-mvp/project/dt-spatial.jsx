// VR + AR adapted components, and shared mode-spanning artboards.
// Key differences from screen HUD:
// - VR panels: much larger type, generous padding, rounded chunky cards,
//   high contrast, minimum gaze-target size, no dense tables.
// - AR cards: anchored to world, subtly translucent, minimal chrome,
//   one-glance semantics only.

// ─── VR PANEL (Expert register, VR-scaled) ────────────────────
function VRBuildingPanel({ b }) {
  const occPct = Math.round((b.occ / b.cap) * 100);
  const delta = b.demand - b.base;
  const dc = delta > 0 ? DT.expert.warn : DT.expert.ok;
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(120% 120% at 0% 0%, oklch(0.25 0.015 230 / 0.95), oklch(0.18 0.012 230 / 0.96))',
      border: `2px solid ${DT.expert.line}`,
      borderRadius: 28,
      color: DT.expert.text0,
      fontFamily: DT.expert.sans,
      display:'flex', flexDirection:'column',
      boxShadow: '0 0 40px oklch(0.78 0.12 190 / 0.18), inset 0 0 0 1px oklch(0.4 0.02 230 / 0.3)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '22px 28px 20px', borderBottom: `1px solid ${DT.expert.lineSoft}`,
        display:'flex', alignItems:'center', gap: 16 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: dc, boxShadow:`0 0 20px ${dc}` }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 16, letterSpacing:'0.2em', color: DT.expert.text2, textTransform:'uppercase' , fontWeight: 600 }}>BUILDING</div>
          <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: -0.01, marginTop: 4 }}>{b.name}</div>
        </div>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 16, letterSpacing:'0.2em', color: DT.expert.text1, textTransform:'uppercase' , fontWeight: 600 }}>{b.type}</div>
      </div>

      <div style={{ padding: '26px 28px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 22, flex: 1 }}>
        <div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 14, letterSpacing:'0.2em', color: DT.expert.text2, textTransform:'uppercase' , fontWeight: 600 }}>Power Demand</div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 72, fontWeight: 300, lineHeight: 1, marginTop: 6, color: dc, letterSpacing: '-0.02em' }}>
            {b.demand.toFixed(0)}<span style={{ fontSize: 26, color: DT.expert.text2, marginLeft: 6 }}>kW</span>
          </div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 18, color: dc, marginTop: 6 }}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)} kW vs base
          </div>
        </div>
        <div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 14, letterSpacing:'0.2em', color: DT.expert.text2, textTransform:'uppercase' , fontWeight: 600 }}>Occupancy</div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 72, fontWeight: 300, lineHeight: 1, marginTop: 6, letterSpacing: '-0.02em' }}>
            {b.occ}<span style={{ fontSize: 26, color: DT.expert.text2, marginLeft: 6 }}>/ {b.cap}</span>
          </div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 18, color: DT.expert.text1, marginTop: 6 }}>
            {occPct}% of capacity
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 22, paddingTop: 18, borderTop: `1px dashed ${DT.expert.lineSoft}` }}>
          <div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 13, letterSpacing:'0.2em', color: DT.expert.text2, textTransform:'uppercase', marginBottom: 8 , fontWeight: 600 }}>Occupancy Load</div>
            <div style={{ height: 14, borderRadius: 7, background: 'oklch(0.26 0.012 230)', overflow:'hidden' }}>
              <div style={{ height:'100%', width: `${occPct}%`, background: `linear-gradient(90deg, color-mix(in oklch, ${DT.expert.accent} 40%, transparent), ${DT.expert.accent})` }}/>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 13, letterSpacing:'0.2em', color: DT.expert.text2, textTransform:'uppercase', marginBottom: 8 , fontWeight: 600 }}>Weather Factor</div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 32, color: DT.expert.text0 }}>{b.weather.toFixed(2)}×</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 28px', borderTop: `1px solid ${DT.expert.lineSoft}`,
        display:'flex', justifyContent:'space-between', fontFamily: DT.expert.mono, fontSize: 14,
        letterSpacing:'0.18em', textTransform:'uppercase', color: DT.expert.text2 }}>
        <span>{b.id}</span>
        <span>Updated 04s ago</span>
      </div>
    </div>
  );
}

// ─── AR ANCHORED LABEL (Expert register) ───────────────────────
function ARAnchoredLabel({ b, style }) {
  const occPct = Math.round((b.occ / b.cap) * 100);
  const delta = b.demand - b.base;
  const dc = delta > 0 ? DT.expert.warn : DT.expert.ok;
  return (
    <div style={{ position:'relative', ...style }}>
      {/* vertical leader */}
      <div style={{ position:'absolute', left: 32, top: '100%', width: 1, height: 42,
        background: `linear-gradient(180deg, ${DT.expert.accent}, transparent)` }}/>
      <div style={{ position:'absolute', left: 28, top: `calc(100% + 42px)`, width: 10, height: 10,
        borderRadius: '50%', background: DT.expert.accent, boxShadow: `0 0 16px ${DT.expert.accent}` }}/>
      <div style={{
        display: 'inline-flex', alignItems:'center', gap: 14,
        padding: '10px 16px 10px 12px',
        background: 'oklch(0.2 0.012 230 / 0.75)',
        border: `1px solid oklch(0.4 0.02 230 / 0.55)`,
        borderRadius: 999,
        color: DT.expert.text0,
        fontFamily: DT.expert.sans,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
      }}>
        <span style={{ width: 10, height: 10, borderRadius:'50%', background: dc, boxShadow:`0 0 12px ${dc}` }}/>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</span>
        <span style={{ width: 1, height: 16, background: DT.expert.line }}/>
        <span style={{ fontFamily: DT.expert.mono, fontSize: 13, color: dc }}>{b.demand.toFixed(1)} kW</span>
        <span style={{ fontFamily: DT.expert.mono, fontSize: 13, color: DT.expert.text1 }}>{occPct}%</span>
      </div>
    </div>
  );
}

// ─── AR ANCHORED LABEL (Kids register) ─────────────────────────
function ARKidsLabel({ b, style }) {
  const m = STATUS_MOODS[b.status] || STATUS_MOODS.ok;
  return (
    <div style={{ position:'relative', ...style }}>
      <div style={{ position:'absolute', left: 28, top: '100%', width: 2, height: 42,
        background: `linear-gradient(180deg, ${m.fg}, transparent)` }}/>
      <div style={{ position:'absolute', left: 22, top: `calc(100% + 42px)`, width: 14, height: 14,
        borderRadius: '50%', background: m.fg, boxShadow: `0 0 16px ${m.fg}AA`, border: '2px solid #FFF' }}/>
      <div style={{
        display:'inline-flex', alignItems:'center', gap: 10,
        padding: '10px 16px',
        background: '#FFFFFFEE',
        borderRadius: 999,
        color: DT.kids.text0,
        fontFamily: DT.kids.sans, fontWeight: 700,
        border: `2px solid ${m.fg}55`,
        boxShadow: '0 6px 20px rgba(60,40,20,0.18)',
        backdropFilter: 'blur(10px)',
      }}>
        <span style={{ fontSize: 22 }}>{b.emoji}</span>
        <span style={{ fontSize: 15 }}>{b.kids}</span>
        <span style={{ width: 1, height: 16, background: DT.kids.line }}/>
        <span style={{ fontSize: 13, color: m.fg }}>{m.emoji} {m.word}</span>
      </div>
    </div>
  );
}

// ─── VR KIDS PANEL ────────────────────────────────────────────
function VRKidsPanel({ b }) {
  const occPct = Math.round((b.occ / b.cap) * 100);
  const m = STATUS_MOODS[b.status] || STATUS_MOODS.ok;
  return (
    <div style={{
      width:'100%', height:'100%', borderRadius: 32,
      background: `linear-gradient(180deg, #FFFFFF, ${DT.kids.bg0})`,
      border: `3px solid ${DT.kids.line}`,
      boxShadow: '0 8px 0 rgba(60,40,20,0.06), 0 12px 40px rgba(60,40,20,0.1)',
      color: DT.kids.text0, fontFamily: DT.kids.sans,
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      <div style={{ padding:'26px 28px', background: DT.kids.bg2, display:'flex', alignItems:'center', gap: 20 }}>
        <div style={{ width: 86, height: 86, borderRadius: 24, background:'#FFF',
          border: `3px solid ${DT.kids.line}`, display:'grid', placeItems:'center', fontSize: 52 }}>{b.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, color: DT.kids.text2, fontWeight: 700, letterSpacing: '0.08em', textTransform:'uppercase' }}>{b.kidsType}</div>
          <div style={{ fontFamily: DT.kids.display, fontSize: 42, fontWeight: 800, lineHeight: 1.05, marginTop: 4 }}>{b.kids}</div>
        </div>
        <span style={{ ...kidsS.tag(m.bg, m.fg), fontSize: 18, padding: '10px 18px' }}>
          <span style={{ fontSize: 22 }}>{m.emoji}</span>{m.word}
        </span>
      </div>
      <div style={{ padding: '26px 28px', display:'flex', flexDirection:'column', gap: 20, flex: 1 }}>
        <div style={{ padding: '20px 24px', borderRadius: 22, background: '#FFF3DA', border: `3px solid ${DT.kids.lineSoft}` }}>
          <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 32 }}>👥</span>
            <span style={{ fontSize: 22, fontWeight: 800 }}>People inside</span>
          </div>
          <div style={{ fontFamily: DT.kids.display, fontSize: 72, fontWeight: 800, color: DT.kids.busy, lineHeight: 1 }}>
            {b.occ}<span style={{ fontSize: 28, color: DT.kids.text2, marginLeft: 10 }}>of {b.cap}</span>
          </div>
          <div style={{ marginTop: 14, height: 22, borderRadius: 14, background: '#F1E6CE', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${occPct}%`, background: DT.kids.busy, borderRadius: 14 }}/>
          </div>
        </div>
        <div style={{ padding: '20px 24px', borderRadius: 22, background: '#EAF5DD', border: `3px solid ${DT.kids.lineSoft}` }}>
          <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 32 }}>⚡</span>
            <span style={{ fontSize: 22, fontWeight: 800 }}>Power use</span>
          </div>
          <div style={{ fontFamily: DT.kids.display, fontSize: 60, fontWeight: 800, lineHeight: 1, color: DT.kids.happy }}>
            {b.demand.toFixed(0)}<span style={{ fontSize: 24, color: DT.kids.text2, marginLeft: 8 }}>kW</span>
          </div>
          <div style={{ fontSize: 18, color: DT.kids.text1, marginTop: 8, fontWeight: 700 }}>
            Usually {b.base.toFixed(0)} kW · {b.demand > b.base ? 'a bit more today' : 'less than usual'}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VRBuildingPanel, ARAnchoredLabel, ARKidsLabel, VRKidsPanel });
