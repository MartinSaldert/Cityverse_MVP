// Kids power plant components — friendly, educational.

const ppKidS = {
  card: {
    background:'#FFF',
    border: `3px solid ${DT.kids.line}`,
    borderRadius: 22,
    color: DT.kids.text0,
    fontFamily: DT.kids.sans,
    overflow:'hidden',
    boxShadow:'0 8px 0 rgba(233,221,194,0.5), 0 12px 28px rgba(43,36,24,0.08)',
  },
};

function cleanLabel(score) {
  return score >= 3 ? 'Very clean' : score === 2 ? 'Pretty clean' : score === 1 ? 'A bit dirty' : 'Dirty';
}
function cleanColor(score) {
  return score >= 3 ? DT.kids.happy : score === 2 ? '#7BC285' : score === 1 ? DT.kids.busy : DT.kids.alert;
}

function KidsPpLabel({ p, style }) {
  const t = POWER.types[p.type];
  const tone = POWER.k[t.tone];
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap: 10,
      padding: '8px 14px 8px 8px', borderRadius: 999,
      background:'#FFF', border: `2px solid ${tone}`,
      boxShadow: `0 4px 0 ${tone}44`,
      fontFamily: DT.kids.sans, color: DT.kids.text0,
      ...style,
    }}>
      <div style={{ width: 30, height: 30, borderRadius:999, background: `${tone}22`, display:'grid', placeItems:'center' }}>
        <PpIcon name={t.icon} size={20} color={tone} fill="solid"/>
      </div>
      <span style={{ fontFamily: DT.kids.display, fontSize: 14, fontWeight: 800, color: DT.kids.text0 }}>{t.kids}</span>
      <span style={{ fontFamily: DT.kids.display, fontSize: 14, fontWeight: 800, color: tone }}>{Math.round(p.output)} <span style={{ fontSize: 10, color: DT.kids.text2 }}>MW</span></span>
      {!p.online && <span style={{ fontSize: 10, fontWeight: 800, color: DT.kids.alert, border: `2px solid ${DT.kids.alert}`, borderRadius: 8, padding: '0 6px' }}>OFF</span>}
    </div>
  );
}

function KidsPpSummary({ p }) {
  const t = POWER.types[p.type];
  const tone = POWER.k[t.tone];
  const util = p.output / p.capacity;
  return (
    <div style={{ ...ppKidS.card, width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{
        padding: '14px 16px',
        background: `linear-gradient(160deg, ${tone}22, #FFF 80%)`,
        borderBottom: `2px solid ${DT.kids.lineSoft}`,
        display:'flex', alignItems:'center', gap: 12,
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background:'#FFF',
          border: `3px solid ${tone}`, display:'grid', placeItems:'center', boxShadow: `0 4px 0 ${tone}33`, flexShrink: 0 }}>
          <PpIcon name={t.icon} size={34} color={tone} fill="solid"/>
        </div>
        <div style={{ flex:1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.08em', textTransform:'uppercase' }}>{t.kids}</div>
          <div style={{ fontFamily: DT.kids.display, fontSize: 20, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.05 }}>{p.kids}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: DT.kids.text1, marginTop: 2 }}>{t.kidsBlurb}</div>
        </div>
        <div style={{
          display:'inline-flex', alignItems:'center', gap: 4,
          padding: '4px 8px', borderRadius: 999,
          background: p.online ? '#E2F5E6' : '#FDE1DD',
          border: `2px solid ${p.online ? DT.kids.happy : DT.kids.alert}`,
        }}>
          <span style={{ fontSize: 14 }}>{p.online ? '✓' : '✕'}</span>
          <span style={{ fontFamily: DT.kids.display, fontSize: 11, fontWeight: 800, color: p.online ? DT.kids.happy : DT.kids.alert }}>{p.online ? 'On' : 'Off'}</span>
        </div>
      </div>

      <div style={{ padding: '14px 16px', display:'flex', flexDirection:'column', gap: 10, flex:1 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.08em', textTransform:'uppercase' }}>How much it's making</div>
          <div style={{ display:'flex', alignItems:'baseline', gap: 6, marginTop: 2 }}>
            <div style={{ fontFamily: DT.kids.display, fontSize: 34, fontWeight: 800, color: tone, lineHeight: 1 }}>{Math.round(p.output)}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: DT.kids.text2 }}>MW right now</div>
            <div style={{ flex:1 }}/>
            <div style={{ fontFamily: DT.kids.display, fontSize: 14, fontWeight: 800, color: DT.kids.text1 }}>{Math.round(util*100)}%</div>
          </div>
          <div style={{ marginTop: 6, height: 14, borderRadius: 7, background:'#F4EAD0', border: `2px solid ${DT.kids.lineSoft}`, overflow:'hidden' }}>
            <div style={{ width: `${util*100}%`, height:'100%', background: tone }}/>
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: DT.kids.text2, marginTop: 4 }}>out of {p.capacity} MW it can make</div>
        </div>

        <div style={{ marginTop:'auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
          <div style={{ padding: '8px 10px', borderRadius: 12, background: DT.kids.bg0, border: `2px solid ${DT.kids.lineSoft}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.06em', textTransform:'uppercase' }}>Cleanness</div>
            <div style={{ display:'flex', alignItems:'center', gap: 6, marginTop: 2 }}>
              <PpIcon name="leaf" size={16} color={cleanColor(t.clean)} fill="solid"/>
              <span style={{ fontFamily: DT.kids.display, fontSize: 14, fontWeight: 800, color: cleanColor(t.clean) }}>{cleanLabel(t.clean)}</span>
            </div>
          </div>
          <div style={{ padding: '8px 10px', borderRadius: 12, background: DT.kids.bg0, border: `2px solid ${DT.kids.lineSoft}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.06em', textTransform:'uppercase' }}>Weather</div>
            <div style={{ fontFamily: DT.kids.display, fontSize: 14, fontWeight: 800, color: DT.kids.text0, marginTop: 2 }}>{t.wxSensitive ? 'Needs it' : 'Does not care'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KidsPpDetail({ p }) {
  const t = POWER.types[p.type];
  const tone = POWER.k[t.tone];
  const util = p.output / p.capacity;
  return (
    <div style={{ ...ppKidS.card, width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
      {/* Hero */}
      <div style={{
        padding: '18px 18px 16px',
        background: `linear-gradient(160deg, ${tone}33, #FFF 85%)`,
        borderBottom: `2px solid ${DT.kids.lineSoft}`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.08em', textTransform:'uppercase' }}>Power source</div>
        <div style={{ display:'flex', alignItems:'center', gap: 14, marginTop: 6 }}>
          <div style={{ width: 74, height: 74, borderRadius: 22, background:'#FFF',
            border: `3px solid ${tone}`, display:'grid', placeItems:'center', boxShadow: `0 4px 0 ${tone}33` }}>
            <PpIcon name={t.icon} size={46} color={tone} fill="solid"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily: DT.kids.display, fontSize: 24, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.05 }}>{p.kids}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: DT.kids.text1, marginTop: 2 }}>{t.kidsBlurb}</div>
          </div>
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap: 3,
            padding: '8px 10px', borderRadius: 14,
            background: p.online ? '#E2F5E6' : '#FDE1DD',
            border: `2px solid ${p.online ? DT.kids.happy : DT.kids.alert}`,
            minWidth: 64,
          }}>
            <span style={{ fontSize: 22 }}>{p.online ? '🟢' : '🔴'}</span>
            <span style={{ fontFamily: DT.kids.display, fontSize: 12, fontWeight: 800, color: p.online ? DT.kids.happy : DT.kids.alert }}>{p.online ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>

      {/* Output block */}
      <div style={{ padding: '14px 16px', borderBottom: `2px solid ${DT.kids.lineSoft}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.08em', textTransform:'uppercase' }}>How much energy it's making</div>
        <div style={{ display:'flex', alignItems:'baseline', gap: 6, marginTop: 4 }}>
          <div style={{ fontFamily: DT.kids.display, fontSize: 40, fontWeight: 800, color: tone, lineHeight: 1 }}>{Math.round(p.output)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: DT.kids.text2 }}>MW <span style={{ color: DT.kids.text3 }}>(out of {p.capacity})</span></div>
          <div style={{ flex:1 }}/>
          <div style={{ fontFamily: DT.kids.display, fontSize: 16, fontWeight: 800, color: DT.kids.text1 }}>{Math.round(util*100)}%</div>
        </div>
        <div style={{ marginTop: 8, height: 16, borderRadius: 8, background:'#F4EAD0', border: `2px solid ${DT.kids.lineSoft}`, overflow:'hidden' }}>
          <div style={{ width: `${util*100}%`, height:'100%', background: tone }}/>
        </div>
      </div>

      {/* Rows */}
      <div style={{ padding: 14, display:'flex', flexDirection:'column', gap: 10 }}>
        <div style={{ padding: '12px 14px', borderRadius: 16, background: DT.kids.bg0, border: `2px solid ${DT.kids.lineSoft}`, display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${cleanColor(t.clean)}22`, display:'grid', placeItems:'center', flexShrink: 0 }}>
            <PpIcon name="leaf" size={22} color={cleanColor(t.clean)} fill="solid"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.06em', textTransform:'uppercase' }}>Cleanness</div>
            <div style={{ fontFamily: DT.kids.display, fontSize: 16, fontWeight: 800, color: cleanColor(t.clean), lineHeight: 1.1 }}>{cleanLabel(t.clean)}</div>
            <div style={{ display:'flex', gap: 3, marginTop: 6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ flex:1, height: 6, borderRadius: 3, background: i < t.clean ? cleanColor(t.clean) : '#F0E6D1' }}/>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: 16, background: DT.kids.bg0, border: `2px solid ${DT.kids.lineSoft}`, display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${WEATHER.k.sunny}22`, display:'grid', placeItems:'center', flexShrink: 0 }}>
            <WxIcon name={t.icon === 'solar' ? 'sun' : t.icon === 'wind' ? 'wind' : 'cloud'} size={22} color={t.wxSensitive ? WEATHER.k.sunny : DT.kids.text3} fill="solid"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.06em', textTransform:'uppercase' }}>Weather helps?</div>
            <div style={{ fontFamily: DT.kids.display, fontSize: 16, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.1 }}>
              {t.wxSensitive ? (p.weatherFactor > 1 ? 'Yes! Working well today' : 'A bit quieter today') : 'Works the same every day'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 14px', marginTop:'auto', borderTop: `2px solid ${DT.kids.lineSoft}`, background: DT.kids.bg2,
        display:'flex', alignItems:'center', gap: 8, fontSize: 11, fontWeight: 700, color: DT.kids.text2 }}>
        <span>⏱</span> Updated just now
      </div>
    </div>
  );
}

Object.assign(window, { KidsPpLabel, KidsPpSummary, KidsPpDetail });
