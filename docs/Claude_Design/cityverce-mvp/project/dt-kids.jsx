// Kids-mode components — warm, friendly, large type, icon-forward.
// Uses emoji + shape-coded status + simple sentences.

const kidsS = {
  panel: {
    background: DT.kids.bg1,
    border: `2px solid ${DT.kids.line}`,
    borderRadius: 22,
    color: DT.kids.text0,
    fontFamily: DT.kids.sans,
    position: 'relative',
    overflow: 'hidden',
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 0 rgba(0,0,0,0.04)',
  },
  tag(bg, fg) {
    return {
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'5px 10px', borderRadius: 999,
      background: bg, color: fg, fontWeight: 700,
      fontSize: 13, letterSpacing: '0.01em',
    };
  },
};

const STATUS_MOODS = {
  busy:   { emoji: '🧡', bg: '#FFE5D1', fg: '#B35A17', word: 'Busy right now' },
  ok:     { emoji: '💚', bg: '#D8F2E2', fg: '#1E8450', word: 'All good' },
  steady: { emoji: '💙', bg: '#D6EAF9', fg: '#2A6DA6', word: 'Steady' },
  cozy:   { emoji: '💜', bg: '#E9DEF7', fg: '#5F3FA8', word: 'Quiet & cozy' },
  alert:  { emoji: '🚨', bg: '#FBDAD5', fg: '#B0392A', word: 'Needs help' },
};

function KStatusPill({ status }) {
  const m = STATUS_MOODS[status] || STATUS_MOODS.ok;
  return <span style={kidsS.tag(m.bg, m.fg)}><span>{m.emoji}</span>{m.word}</span>;
}

function KBigNum({ value, unit, color = DT.kids.text0 }) {
  return (
    <div style={{ display:'flex', alignItems:'baseline', gap: 6 }}>
      <span style={{ fontFamily: DT.kids.display, fontSize: 42, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 16, color: DT.kids.text2, fontWeight: 600 }}>{unit}</span>
    </div>
  );
}

function KFillBar({ pct, color }) {
  return (
    <div style={{ height: 14, borderRadius: 10, background: '#F1E6CE', overflow:'hidden', border: `1px solid ${DT.kids.lineSoft}` }}>
      <div style={{
        height: '100%', width: `${Math.max(3, Math.min(100, pct))}%`,
        background: color, borderRadius: 10,
        transition: 'width .3s',
      }}/>
    </div>
  );
}

// Friendly demand-level translator
function demandWord(delta) {
  if (delta > 6)  return { w: 'Using a lot of power', e: '⚡⚡⚡', c: '#D15A17' };
  if (delta > 2)  return { w: 'Using more than usual', e: '⚡⚡', c: '#E69A1E' };
  if (delta > -2) return { w: 'Using normal power',    e: '⚡',  c: DT.kids.happy };
  return { w: 'Using less power today', e: '🌙', c: DT.kids.cozy };
}

function weatherWord(f) {
  if (f > 1.2)  return 'The weather is making it work harder';
  if (f > 1.05) return 'Weather is nudging it a little';
  return 'Weather is calm';
}

// ─── SUMMARY CARD ─────────────────────────────────────────────
function KidsSummaryCard({ b }) {
  const occPct = Math.round((b.occ / b.cap) * 100);
  const delta = b.demand - b.base;
  const dw = demandWord(delta);
  return (
    <div style={kidsS.panel}>
      <div style={{ background: DT.kids.bg2, padding: '14px 16px 12px', display:'flex', alignItems:'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFFFFF',
          border: `2px solid ${DT.kids.line}`, display:'grid', placeItems:'center', fontSize: 26 }}>{b.emoji}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, color: DT.kids.text2, fontWeight: 700, letterSpacing: '0.08em', textTransform:'uppercase' }}>{b.kidsType}</div>
          <div style={{ fontFamily: DT.kids.display, fontSize: 20, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.1, marginTop: 2 }}>{b.kids}</div>
        </div>
      </div>

      <div style={{ padding: '14px 16px', display:'flex', flexDirection:'column', gap: 12, flex: 1 }}>
        <KStatusPill status={b.status} />

        <div>
          <div style={{ fontSize: 13, color: DT.kids.text2, fontWeight: 600, marginBottom: 4 }}>People inside</div>
          <KBigNum value={b.occ} unit={`of ${b.cap}`} color={DT.kids.text0}/>
          <div style={{ marginTop: 8 }}>
            <KFillBar pct={occPct} color={DT.kids.busy} />
            <div style={{ fontSize: 12, color: DT.kids.text2, marginTop: 4, fontWeight: 600 }}>{occPct}% full</div>
          </div>
        </div>

        <div style={{ borderTop: `2px dashed ${DT.kids.lineSoft}`, paddingTop: 12 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{dw.e}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: dw.c }}>{dw.w}</span>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display:'flex', gap: 6, alignItems:'center',
          padding: '8px 10px', borderRadius: 12, background: '#FFF3DA' }}>
          <span style={{ fontSize: 16 }}>⛅</span>
          <span style={{ fontSize: 12, color: DT.kids.text1, fontWeight: 600 }}>{weatherWord(b.weather)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────
function KidsDetailPanel({ b }) {
  const occPct = Math.round((b.occ / b.cap) * 100);
  const delta = b.demand - b.base;
  const dw = demandWord(delta);
  return (
    <div style={kidsS.panel}>
      <div style={{ background: DT.kids.bg2, padding: '18px 20px 16px', display:'flex', alignItems:'center', gap: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: '#FFF',
          border: `2px solid ${DT.kids.line}`, display:'grid', placeItems:'center', fontSize: 34 }}>{b.emoji}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, color: DT.kids.text2, fontWeight: 700, letterSpacing: '0.08em', textTransform:'uppercase' }}>{b.kidsType}</div>
          <div style={{ fontFamily: DT.kids.display, fontSize: 26, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.1, marginTop: 2 }}>{b.kids}</div>
        </div>
        <KStatusPill status={b.status}/>
      </div>

      <div style={{ padding: '16px 20px', display:'flex', flexDirection:'column', gap: 16, flex:1, overflow:'hidden' }}>
        {/* Intro sentence */}
        <div style={{ fontSize: 16, lineHeight: 1.4, color: DT.kids.text1, fontWeight: 600 }}>
          Right now, <b>{b.occ} people</b> are inside. It's {dw.w.toLowerCase()}.
        </div>

        {/* People row */}
        <div style={{ padding: '14px 16px', borderRadius: 16, background: '#FFF3DA', border: `2px solid ${DT.kids.lineSoft}` }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>👥</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: DT.kids.text0 }}>People inside</span>
          </div>
          <KBigNum value={b.occ} unit={`of ${b.cap}`} color={DT.kids.busy}/>
          <div style={{ marginTop: 8 }}><KFillBar pct={occPct} color={DT.kids.busy}/></div>
          <div style={{ fontSize: 12, color: DT.kids.text2, marginTop: 6, fontWeight: 600 }}>
            {occPct < 30 ? 'Almost empty' : occPct < 70 ? 'About half full' : occPct < 95 ? 'Quite busy' : 'Completely full!'}
          </div>
        </div>

        {/* Power row */}
        <div style={{ padding: '14px 16px', borderRadius: 16, background: '#EAF5DD', border: `2px solid ${DT.kids.lineSoft}` }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{dw.e}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: DT.kids.text0 }}>Power use</span>
          </div>
          <KBigNum value={b.demand.toFixed(0)} unit="kW right now" color={dw.c}/>
          <div style={{ fontSize: 13, color: DT.kids.text1, marginTop: 6, fontWeight: 600 }}>
            Usually <b>{b.base.toFixed(0)} kW</b> · {delta > 0 ? `using ${delta.toFixed(0)} kW extra` : `using ${Math.abs(delta).toFixed(0)} kW less`}
          </div>
        </div>

        {/* Weather row */}
        <div style={{ padding: '14px 16px', borderRadius: 16, background: '#E3F0FB', border: `2px solid ${DT.kids.lineSoft}` }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>⛅</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: DT.kids.text0 }}>Weather effect</span>
          </div>
          <div style={{ fontSize: 14, color: DT.kids.text1, fontWeight: 600 }}>{weatherWord(b.weather)}</div>
          <div style={{ marginTop: 8, display:'flex', gap: 10, flexWrap:'wrap' }}>
            <span style={kidsS.tag('#FFF', DT.kids.text1)}>🌡️ 19°C</span>
            <span style={kidsS.tag('#FFF', DT.kids.text1)}>☁️ A bit cloudy</span>
            <span style={kidsS.tag('#FFF', DT.kids.text1)}>🍃 Light wind</span>
          </div>
        </div>

        <div style={{ marginTop: 'auto', fontSize: 12, color: DT.kids.text2, fontWeight: 600, textAlign:'center' }}>
          Updated just a moment ago ·  <span style={{ opacity: 0.7 }}>🔄</span>
        </div>
      </div>
    </div>
  );
}

// ─── FLOATING LABEL ───────────────────────────────────────────
function KidsFloatLabel({ b, style }) {
  const occPct = Math.round((b.occ / b.cap) * 100);
  const dw = demandWord(b.demand - b.base);
  const m = STATUS_MOODS[b.status] || STATUS_MOODS.ok;
  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ position:'absolute', left: 34, bottom: -16, width: 0, height: 0,
        borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
        borderTop: `14px solid #FFF` }}/>
      <div style={{
        background: '#FFFFFF',
        border: `2px solid ${DT.kids.line}`,
        borderRadius: 18,
        padding: '10px 14px',
        boxShadow: '0 6px 20px rgba(60,40,20,0.12)',
        display:'flex', alignItems:'center', gap: 10,
        minWidth: 210,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: DT.kids.bg2,
          display:'grid', placeItems:'center', fontSize: 22 }}>{b.emoji}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: DT.kids.display, fontSize: 15, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.1 }}>{b.kids}</div>
          <div style={{ fontSize: 11.5, color: DT.kids.text2, fontWeight: 600, marginTop: 2 }}>
            <span>👥 {b.occ}/{b.cap}</span>
            <span style={{ margin:'0 6px', opacity: .4 }}>·</span>
            <span>{dw.e} {dw.w.toLowerCase()}</span>
          </div>
        </div>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: m.fg, flexShrink: 0 }}/>
      </div>
    </div>
  );
}

Object.assign(window, { KidsSummaryCard, KidsDetailPanel, KidsFloatLabel });
