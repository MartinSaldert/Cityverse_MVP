// Alert-state components — explicit warning/critical treatments for both modes.
// Status propagates from the shared vocabulary (ALERT). These are the visual
// forms Unity uses when BuildingState.status === 'alert'.

function ExAlertCard({ b, reason = 'Demand exceeds base by 24%', severity = 'warn' }) {
  const sev = severity === 'crit' ? DT.expert.crit : DT.expert.warn;
  const occPct = Math.round((b.occ / b.cap) * 100);
  const delta = b.demand - b.base;
  return (
    <div style={{
      width:'100%', height:'100%',
      background: 'linear-gradient(180deg, oklch(0.22 0.014 230), oklch(0.17 0.012 230))',
      border: `1px solid ${sev}`,
      borderRadius: 10,
      color: DT.expert.text0,
      fontFamily: DT.expert.sans,
      position:'relative', overflow:'hidden',
      boxShadow: `0 0 0 1px color-mix(in oklch, ${sev} 20%, transparent) inset, 0 0 24px color-mix(in oklch, ${sev} 14%, transparent)`,
      display:'flex', flexDirection:'column',
    }}>
      {/* Alert stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${sev}, transparent 60%, ${sev})` }}/>

      <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${DT.expert.lineSoft}`,
        display:'flex', alignItems:'center', gap: 10 }}>
        <div style={{
          width: 26, height: 26, display:'grid', placeItems:'center',
          border: `1.5px solid ${sev}`, borderRadius: 4, color: sev,
          boxShadow: `0 0 14px color-mix(in oklch, ${sev} 34%, transparent)`,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1 L11 10 L1 10 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6 5 V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="8.5" r="0.7" fill="currentColor"/></svg>
        </div>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 12, color: sev, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight: 600 }}>
          {severity === 'crit' ? 'Critical · Attention' : 'Warning · Review'}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, fontWeight: 500, letterSpacing:'0.14em' }}>14:32:07</div>
      </div>

      <div style={{ padding: '14px 16px', display:'flex', flexDirection:'column', gap: 12, flex:1 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: DT.expert.text0 }}>{b.name}</div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, fontWeight: 500, letterSpacing:'0.08em', marginTop: 2 }}>{b.id} · {b.type}</div>
        </div>

        <div style={{ padding: '10px 12px', borderRadius: 6, background: `color-mix(in oklch, ${sev} 10%, transparent)`, border: `1px solid color-mix(in oklch, ${sev} 36%, transparent)` }}>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 11, letterSpacing:'0.18em', color: sev, textTransform:'uppercase', marginBottom: 4 , fontWeight: 600 }}>Reason</div>
          <div style={{ fontSize: 13, color: DT.expert.text0, lineHeight: 1.45 }}>{reason}</div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11, letterSpacing:'0.16em', color: DT.expert.text2, textTransform:'uppercase' , fontWeight: 600 }}>Demand</div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 22, color: sev }}>{b.demand.toFixed(1)}<span style={{ fontSize: 11.5, color: DT.expert.text2, marginLeft: 3 }}>kW</span></div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: sev }}>+{delta.toFixed(1)} kW vs base</div>
          </div>
          <div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11, letterSpacing:'0.16em', color: DT.expert.text2, textTransform:'uppercase' , fontWeight: 600 }}>Occupancy</div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 22, color: DT.expert.text0 }}>{b.occ}<span style={{ fontSize: 11.5, color: DT.expert.text2, marginLeft: 3 }}>/ {b.cap}</span></div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2 }}>{occPct}% capacity</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display:'flex', gap: 8 }}>
          <button style={{
            flex: 1, height: 32, borderRadius: 6, border: `1px solid ${DT.expert.line}`,
            background: 'transparent', color: DT.expert.text1,
            fontFamily: DT.expert.mono, fontSize: 12, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer',
          }}>Acknowledge</button>
          <button style={{
            flex: 1, height: 32, borderRadius: 6, border: `1px solid ${sev}`,
            background: `color-mix(in oklch, ${sev} 22%, transparent)`, color: DT.expert.text0,
            fontFamily: DT.expert.mono, fontSize: 12, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer',
            boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${sev} 22%, transparent)`,
          }}>Inspect</button>
        </div>
      </div>
    </div>
  );
}

function KidsAlertCard({ b, reason = 'Using lots of power — check the inside!' }) {
  return (
    <div style={{
      width:'100%', height:'100%',
      background: '#FFF',
      border: `3px solid ${DT.kids.alert}`,
      borderRadius: 22,
      fontFamily: DT.kids.sans, color: DT.kids.text0,
      overflow:'hidden', display:'flex', flexDirection:'column',
      boxShadow: `0 8px 0 color-mix(in oklch, ${DT.kids.alert} 18%, transparent), 0 12px 32px rgba(230,90,75,0.15)`,
    }}>
      <div style={{ padding: '14px 16px', background: '#FBDAD5', display:'flex', alignItems:'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: '#FFF',
          border: `2px solid ${DT.kids.alert}`, display:'grid', placeItems:'center', fontSize: 22,
        }}>🚨</div>
        <div>
          <div style={{ fontFamily: DT.kids.display, fontSize: 18, fontWeight: 800, color: DT.kids.alert, lineHeight: 1 }}>Needs some help!</div>
          <div style={{ fontSize: 12, color: DT.kids.text1, fontWeight: 600, marginTop: 2 }}>Let's take a look</div>
        </div>
      </div>
      <div style={{ padding: '14px 16px', display:'flex', flexDirection:'column', gap: 12, flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: DT.kids.bg2,
            border: `2px solid ${DT.kids.line}`, display:'grid', placeItems:'center', fontSize: 26 }}>{b.emoji}</div>
          <div>
            <div style={{ fontSize: 11, color: DT.kids.text2, fontWeight: 700, letterSpacing:'0.08em', textTransform:'uppercase' }}>{b.kidsType}</div>
            <div style={{ fontFamily: DT.kids.display, fontSize: 20, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.1 }}>{b.kids}</div>
          </div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: 14, background: '#FFF3DA', border: `2px solid ${DT.kids.lineSoft}` }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: DT.kids.text0 }}>What's happening</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: DT.kids.text1, lineHeight: 1.4 }}>{reason}</div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: 14, background: '#EAF5DD', border: `2px solid ${DT.kids.lineSoft}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DT.kids.text0, marginBottom: 4 }}>Try this</div>
          <div style={{ fontSize: 13, color: DT.kids.text1, fontWeight: 600, lineHeight: 1.4 }}>👉 Tap the building to see inside, or ask a grown-up to help.</div>
        </div>

        <button style={{
          marginTop: 'auto', height: 40, borderRadius: 14, border: 'none',
          background: DT.kids.alert, color: '#FFF',
          fontFamily: DT.kids.display, fontSize: 15, fontWeight: 800, cursor:'pointer',
          boxShadow: `0 4px 0 ${DT.kids.alert}88`,
        }}>Show me the building</button>
      </div>
    </div>
  );
}

// Compact inline alert for AR / world-space pill
function ExAlertPill({ b, style }) {
  return (
    <div style={{ position:'relative', ...style }}>
      <div style={{
        display:'inline-flex', alignItems:'center', gap: 10,
        padding: '8px 14px',
        background: `color-mix(in oklch, ${DT.expert.crit} 14%, transparent)`,
        border: `1px solid ${DT.expert.crit}`,
        borderRadius: 999,
        color: DT.expert.text0,
        fontFamily: DT.expert.sans,
        boxShadow: `0 0 18px color-mix(in oklch, ${DT.expert.crit} 28%, transparent)`,
        backdropFilter: 'blur(12px)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius:'50%', background: DT.expert.crit, animation:'dtpulse 1.4s infinite' }}/>
        <span style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.crit, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight: 600 }}>Alert</span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{b.name}</span>
        <span style={{ width: 1, height: 14, background: DT.expert.line }}/>
        <span style={{ fontFamily: DT.expert.mono, fontSize: 12, color: DT.expert.crit }}>{b.demand.toFixed(1)} kW</span>
      </div>
      <style>{`@keyframes dtpulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.55; transform: scale(1.3); } }`}</style>
    </div>
  );
}

Object.assign(window, { ExAlertCard, KidsAlertCard, ExAlertPill });
