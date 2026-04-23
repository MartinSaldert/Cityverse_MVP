// Expert power plant components — utility ops language.
// Floating label · Summary card · Detail panel.

const ppExS = {
  panel: {
    background: 'linear-gradient(180deg, oklch(0.22 0.014 230), oklch(0.17 0.012 230))',
    border: `1px solid ${DT.expert.line}`,
    borderRadius: 10,
    color: DT.expert.text0,
    fontFamily: DT.expert.sans,
    overflow: 'hidden',
    position: 'relative',
  },
  eyebrow: {
    fontFamily: DT.expert.mono, fontSize: 11, letterSpacing:'0.2em',
    color: DT.expert.text2, textTransform:'uppercase', fontWeight: 600 },
  value: { fontFamily: DT.expert.mono, fontVariantNumeric: 'tabular-nums' },
};

function emissionsToneEx(level) {
  return level === 'none' ? DT.expert.ok
       : level === 'low'  ? DT.expert.info
       : level === 'mid'  ? DT.expert.warn
       : level === 'high' ? DT.expert.crit
       : DT.expert.text2;
}

// Capacity bar — shared between summary + detail
function CapacityBar({ util, tone, height = 8 }) {
  const pct = Math.max(0, Math.min(1, util));
  return (
    <div style={{
      height, borderRadius: height/2,
      background: 'oklch(0.18 0.01 230)',
      border: `1px solid ${DT.expert.lineSoft}`,
      overflow:'hidden', position:'relative',
    }}>
      <div style={{ position:'absolute', inset: 0, width: `${pct*100}%`, background: `linear-gradient(90deg, ${tone}, ${tone} 70%, color-mix(in oklch, ${tone} 60%, transparent))` }}/>
    </div>
  );
}

// --- Floating label (world-space) -----------------------------------------
function ExPpLabel({ p, style }) {
  const t = POWER.types[p.type];
  const tone = POWER.ex[t.tone];
  const util = p.output / p.capacity;
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap: 10,
      padding: '6px 12px 6px 8px', borderRadius: 999,
      background: 'oklch(0.2 0.012 230 / 0.82)',
      border: `1px solid ${DT.expert.line}`,
      color: DT.expert.text0, fontFamily: DT.expert.sans,
      backdropFilter:'blur(14px)',
      ...style,
    }}>
      <div style={{ width: 22, height: 22, borderRadius: 999, background: `color-mix(in oklch, ${tone} 20%, transparent)`, display:'grid', placeItems:'center' }}>
        <PpIcon name={t.icon} size={14} color={tone}/>
      </div>
      <span style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, letterSpacing:'0.16em', textTransform:'uppercase' , fontWeight: 600 }}>{t.expert}</span>
      <span style={{ fontFamily: DT.expert.mono, fontSize: 12, color: DT.expert.text0 }}>{p.output.toFixed(1)}<span style={{ color: DT.expert.text3, marginLeft: 2 }}>MW</span></span>
      <span style={{ fontFamily: DT.expert.mono, fontSize: 11, color: tone }}>{Math.round(util*100)}%</span>
      {!p.online && <span style={{ fontFamily: DT.expert.mono, fontSize: 11, letterSpacing:'0.16em', color: DT.expert.crit, border: `1px solid ${DT.expert.crit}`, borderRadius: 4, padding: '1px 5px' }}>OFF</span>}
    </div>
  );
}

// --- Summary card ---------------------------------------------------------
function ExPpSummary({ p }) {
  const t = POWER.types[p.type];
  const tone = POWER.ex[t.tone];
  const util = p.output / p.capacity;
  const headroom = p.capacity - p.output;
  const emissions = t.emissions;

  return (
    <div style={{ ...ppExS.panel, width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ height: 2, background: p.online ? `linear-gradient(90deg, ${tone}, transparent)` : 'transparent' }}/>
      <div style={{ padding: '12px 14px', display:'flex', alignItems:'center', gap: 10, borderBottom:`1px solid ${DT.expert.lineSoft}` }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `color-mix(in oklch, ${tone} 15%, oklch(0.22 0.014 230))`, border: `1px solid ${DT.expert.line}`, display:'grid', placeItems:'center' }}>
          <PpIcon name={t.icon} size={22} color={tone}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...ppExS.eyebrow, color: tone, fontSize: 12 }}>{t.expert}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: DT.expert.text0, lineHeight: 1.1, marginTop: 1 }}>{p.name}</div>
        </div>
        <div style={{
          display:'inline-flex', alignItems:'center', gap: 5,
          padding: '3px 8px', borderRadius: 4,
          background: p.online ? `color-mix(in oklch, ${DT.expert.ok} 16%, transparent)` : `color-mix(in oklch, ${DT.expert.crit} 16%, transparent)`,
          border: `1px solid ${p.online ? DT.expert.ok : DT.expert.crit}`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius:999, background: p.online ? DT.expert.ok : DT.expert.crit }}/>
          <span style={{ fontFamily: DT.expert.mono, fontSize: 11, letterSpacing:'0.18em', color: p.online ? DT.expert.ok : DT.expert.crit, textTransform:'uppercase', fontWeight: 600 }}>{p.online ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div style={{ padding: '14px 16px', display:'flex', flexDirection:'column', gap: 10, flex:1 }}>
        <div>
          <div style={ppExS.eyebrow}>Output</div>
          <div style={{ display:'flex', alignItems:'baseline', gap: 6, marginTop: 2 }}>
            <div style={{ ...ppExS.value, fontSize: 36, color: DT.expert.text0, fontWeight: 300, letterSpacing:'-0.02em', lineHeight: 1 }}>{p.output.toFixed(1)}</div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 12, color: DT.expert.text2 }}>MW</div>
            <div style={{ flex:1 }}/>
            <div style={{ ...ppExS.value, fontSize: 12, color: tone }}>{Math.round(util*100)}%</div>
          </div>
          <div style={{ marginTop: 6 }}>
            <CapacityBar util={util} tone={tone}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4, fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, fontWeight: 500, letterSpacing:'0.08em' }}>
            <span>0</span><span>CAPACITY · {p.capacity} MW</span>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, marginTop: 'auto' }}>
          <div style={{ padding: '8px 10px', borderRadius: 6, background: 'oklch(0.17 0.01 230)', border: `1px solid ${DT.expert.lineSoft}` }}>
            <div style={{ ...ppExS.eyebrow, fontSize: 11 }}>Emissions</div>
            <div style={{ display:'flex', alignItems:'center', gap: 6, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: emissionsToneEx(emissions) }}/>
              <span style={{ ...ppExS.value, fontSize: 16, color: DT.expert.text0, textTransform:'capitalize', fontWeight: 500 }}>{emissions}</span>
            </div>
          </div>
          <div style={{ padding: '8px 10px', borderRadius: 6, background: 'oklch(0.17 0.01 230)', border: `1px solid ${DT.expert.lineSoft}` }}>
            <div style={{ ...ppExS.eyebrow, fontSize: 11 }}>Headroom</div>
            <div style={{ ...ppExS.value, fontSize: 16, color: DT.expert.text0, marginTop: 2, fontWeight: 500 }}>{headroom.toFixed(1)} <span style={{ color: DT.expert.text2, fontSize: 11 }}>MW</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Detail panel ---------------------------------------------------------
function ExPpDetail({ p }) {
  const t = POWER.types[p.type];
  const tone = POWER.ex[t.tone];
  const util = p.output / p.capacity;
  const headroom = p.capacity - p.output;
  const emissions = t.emissions;

  const Field = ({ eyebrow, value, unit, hint, icon, iconTone }) => (
    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${DT.expert.lineSoft}` }}>
      <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 4 }}>
        {icon && <PpIcon name={icon} size={12} color={iconTone || DT.expert.text2}/>}
        <div style={ppExS.eyebrow}>{eyebrow}</div>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap: 6 }}>
        <div style={{ ...ppExS.value, fontSize: 20, color: DT.expert.text0, fontWeight: 500 }}>{value}</div>
        {unit && <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2 }}>{unit}</div>}
        {hint && <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text3, marginLeft: 'auto' }}>{hint}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ ...ppExS.panel, width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${DT.expert.line}`, display:'flex', alignItems:'center', gap: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: p.online ? DT.expert.ok : DT.expert.crit, boxShadow: `0 0 8px ${p.online ? DT.expert.ok : DT.expert.crit}` }}/>
        <div style={{ ...ppExS.eyebrow, color: DT.expert.text1, letterSpacing:'0.22em' }}>Cityverse · Generation</div>
        <div style={{ flex:1 }}/>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text3 }}>{p.updatedAt}</div>
      </div>

      {/* Hero */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${DT.expert.lineSoft}` }}>
        <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 12,
            background: `radial-gradient(circle at 30% 30%, color-mix(in oklch, ${tone} 22%, oklch(0.32 0.02 230)), oklch(0.2 0.014 230))`,
            border: `1px solid ${DT.expert.line}`, display:'grid', placeItems:'center',
          }}>
            <PpIcon name={t.icon} size={44} color={tone}/>
          </div>
          <div style={{ flex:1, minWidth: 0 }}>
            <div style={{ ...ppExS.eyebrow, color: tone, fontSize: 12 }}>{t.expert}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: DT.expert.text0, marginTop: 2 }}>{p.name}</div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, fontWeight: 500, letterSpacing:'0.08em', marginTop: 2 }}>{p.id}</div>
          </div>
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 6,
            padding: '5px 10px', borderRadius: 5,
            background: p.online ? `color-mix(in oklch, ${DT.expert.ok} 16%, transparent)` : `color-mix(in oklch, ${DT.expert.crit} 16%, transparent)`,
            border: `1px solid ${p.online ? DT.expert.ok : DT.expert.crit}`,
          }}>
            <span style={{ width: 7, height: 7, borderRadius:999, background: p.online ? DT.expert.ok : DT.expert.crit }}/>
            <span style={{ fontFamily: DT.expert.mono, fontSize: 11.5, letterSpacing:'0.18em', color: p.online ? DT.expert.ok : DT.expert.crit, textTransform:'uppercase', fontWeight: 600 }}>{p.online ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Output + bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
            <div style={{ ...ppExS.eyebrow }}>Output</div>
            <div style={{ flex: 1 }}/>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text2 }}>Utilization</div>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap: 8, marginTop: 4 }}>
            <div style={{ ...ppExS.value, fontSize: 42, color: DT.expert.text0, fontWeight: 300, letterSpacing:'-0.02em', lineHeight: 1 }}>{p.output.toFixed(1)}</div>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 12, color: DT.expert.text2 }}>MW</div>
            <div style={{ flex:1 }}/>
            <div style={{ ...ppExS.value, fontSize: 24, color: tone, fontWeight: 400 }}>{Math.round(util*100)}<span style={{ fontSize: 12, color: DT.expert.text2, marginLeft: 2 }}>%</span></div>
          </div>
          <div style={{ marginTop: 8 }}>
            <CapacityBar util={util} tone={tone} height={10}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4, fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, fontWeight: 500, letterSpacing:'0.08em' }}>
            <span>0 MW</span>
            <span>CAPACITY · {p.capacity} MW</span>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
        <Field eyebrow="Capacity" value={p.capacity} unit="MW" icon="bolt"/>
        <Field eyebrow="Headroom" value={headroom.toFixed(1)} unit="MW" icon="bolt" iconTone={DT.expert.info}/>
        <Field eyebrow="Weather Factor" value={p.weatherFactor.toFixed(2)} unit="×"
               hint={t.wxSensitive ? 'sensitive' : 'none'} icon="leaf"
               iconTone={t.wxSensitive ? WEATHER.ex.sunny : DT.expert.text3}/>
        <Field eyebrow="Emissions" value={emissions} unit="" icon="smoke" iconTone={emissionsToneEx(emissions)}/>
      </div>

      {/* Footer — clean meter + last update */}
      <div style={{ padding: '12px 14px', borderTop: `1px solid ${DT.expert.line}`, background:'oklch(0.17 0.01 230 / 0.6)', marginTop:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <div style={ppExS.eyebrow}>Clean Index</div>
          <div style={{ flex: 1, display:'flex', gap: 3 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ flex: 1, height: 6, borderRadius: 2,
                background: i < t.clean ? DT.expert.ok : 'oklch(0.28 0.01 230)' }}/>
            ))}
          </div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, letterSpacing:'0.12em' }}>{t.clean}/3</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ExPpLabel, ExPpSummary, ExPpDetail, CapacityBar });
