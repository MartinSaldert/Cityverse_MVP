// Expert weather components — operations-console language.
// Compact badge · Summary card · Detail panel.
// Visual vocabulary matches the Expert building family (IBM Plex, tabular
// numerics, monospaced meta labels, subtle semantic accents).

const wxExS = {
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
    fontFamily: DT.expert.mono, fontSize: 11, letterSpacing: '0.2em',
    color: DT.expert.text2, textTransform: 'uppercase', fontWeight: 600,
  },
  value: {
    fontFamily: DT.expert.mono, fontVariantNumeric: 'tabular-nums',
  },
  cell: {
    padding: '10px 12px', borderRight: `1px solid ${DT.expert.lineSoft}`,
    display: 'flex', flexDirection: 'column', gap: 3,
  },
};

function wxTone(code) { return WEATHER.ex[WEATHER.codes[code]?.tone] || DT.expert.info; }

// --- 1. Compact badge (AR pill, toolbar, floating HUD chip) ----------------
function ExWxBadge({ wx = WX, style, compactLabel = false }) {
  const meta = WEATHER.codes[wx.condition];
  const tone = wxTone(wx.condition);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '7px 12px 7px 9px', borderRadius: 999,
      background: 'oklch(0.2 0.012 230 / 0.82)',
      border: `1px solid ${DT.expert.line}`,
      color: DT.expert.text0, fontFamily: DT.expert.sans,
      backdropFilter: 'blur(14px)',
      ...style,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 999, background: 'oklch(0.28 0.014 230)',
        display:'grid', placeItems:'center', color: tone }}>
        <WxIcon name={meta.icon} size={18} color={tone}/>
      </div>
      <div style={{ display:'flex', flexDirection:'column', lineHeight: 1.1 }}>
        <span style={{ fontFamily: DT.expert.mono, fontSize: 11, letterSpacing:'0.16em', color: DT.expert.text2, textTransform:'uppercase' , fontWeight: 600 }}>{compactLabel ? 'WX' : meta.expert}</span>
        <span style={{ fontFamily: DT.expert.mono, fontSize: 14, color: DT.expert.text0, fontWeight: 500 }}>{wx.temperature.toFixed(1)}°<span style={{ color: DT.expert.text2, fontSize: 11.5, marginLeft: 2 }}>C</span></span>
      </div>
      <span style={{ width: 1, height: 18, background: DT.expert.line }}/>
      <span style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text1, display:'inline-flex', alignItems:'center', gap: 4 }}>
        <WxIcon name="wind" size={12} color={DT.expert.text2}/> {wx.windSpeed.toFixed(0)} <span style={{ color: DT.expert.text3 }}>km/h</span>
      </span>
    </div>
  );
}

// --- 2. Summary card — "weather at a glance" ------------------------------
function ExWxSummary({ wx = WX }) {
  const meta = WEATHER.codes[wx.condition];
  const tone = wxTone(wx.condition);
  const feelsDelta = wx.feelsLike - wx.temperature;
  return (
    <div style={{ ...wxExS.panel, width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${tone}, transparent)` }}/>
      <div style={{ padding: '12px 14px', display:'flex', alignItems:'center', gap: 10, borderBottom: `1px solid ${DT.expert.lineSoft}` }}>
        <div style={{ ...wxExS.eyebrow, flex: 1 }}>Weather · Live</div>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2, fontWeight: 500, letterSpacing: '0.14em' }}>{wx.updatedAt}</div>
      </div>

      <div style={{ padding: '14px 16px', display:'flex', alignItems:'center', gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 12,
          background: `radial-gradient(circle at 30% 30%, oklch(0.3 0.02 230), oklch(0.22 0.014 230))`,
          border: `1px solid ${DT.expert.line}`,
          display:'grid', placeItems:'center', color: tone,
        }}>
          <WxIcon name={meta.icon} size={36} color={tone}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...wxExS.eyebrow, color: tone, fontSize: 12 }}>{meta.expert}</div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 40, color: DT.expert.text0, lineHeight: 1, marginTop: 2, fontWeight: 300, letterSpacing:'-0.02em' }}>
            {wx.temperature.toFixed(1)}<span style={{ fontSize: 18, color: DT.expert.text2, marginLeft: 3 }}>°C</span>
          </div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text2, marginTop: 4 }}>
            Feels like {wx.feelsLike.toFixed(1)}° <span style={{ color: feelsDelta < 0 ? DT.expert.info : DT.expert.warn }}>({feelsDelta >= 0 ? '+' : ''}{feelsDelta.toFixed(1)})</span>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop: `1px solid ${DT.expert.lineSoft}`, marginTop: 'auto' }}>
        <div style={wxExS.cell}>
          <div style={wxExS.eyebrow}><WxIcon name="wind" size={10} color={DT.expert.text3} style={{ display:'inline', verticalAlign:'middle', marginRight: 4 }}/>Wind</div>
          <div style={{ ...wxExS.value, fontSize: 17, color: DT.expert.text0, fontWeight: 500 }}>{wx.windSpeed.toFixed(1)}<span style={{ fontSize: 11, color: DT.expert.text2, marginLeft: 3 }}>km/h {wx.windCardinal}</span></div>
        </div>
        <div style={wxExS.cell}>
          <div style={wxExS.eyebrow}><WxIcon name="drop" size={10} color={DT.expert.text3} style={{ display:'inline', verticalAlign:'middle', marginRight: 4 }}/>Humidity</div>
          <div style={{ ...wxExS.value, fontSize: 17, color: DT.expert.text0, fontWeight: 500 }}>{wx.humidity}<span style={{ fontSize: 11, color: DT.expert.text2, marginLeft: 3 }}>%</span></div>
        </div>
        <div style={{ ...wxExS.cell, borderRight: 'none' }}>
          <div style={wxExS.eyebrow}><WxIcon name="cloud" size={10} color={DT.expert.text3} style={{ display:'inline', verticalAlign:'middle', marginRight: 4 }}/>Clouds</div>
          <div style={{ ...wxExS.value, fontSize: 17, color: DT.expert.text0, fontWeight: 500 }}>{wx.cloudCover}<span style={{ fontSize: 11, color: DT.expert.text2, marginLeft: 3 }}>%</span></div>
        </div>
      </div>
    </div>
  );
}

// --- 3. Detail panel — full-fat readout -----------------------------------
function ExWxDetail({ wx = WX }) {
  const meta = WEATHER.codes[wx.condition];
  const tone = wxTone(wx.condition);
  const feelsDelta = wx.feelsLike - wx.temperature;
  const Field = ({ eyebrow, value, unit, hint, icon, iconTone }) => (
    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${DT.expert.lineSoft}` }}>
      <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 4 }}>
        <WxIcon name={icon} size={12} color={iconTone || DT.expert.text2}/>
        <div style={wxExS.eyebrow}>{eyebrow}</div>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap: 6 }}>
        <div style={{ ...wxExS.value, fontSize: 20, color: DT.expert.text0, fontWeight: 500 }}>{value}</div>
        {unit && <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text2 }}>{unit}</div>}
        {hint && <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text3, marginLeft: 'auto' }}>{hint}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ ...wxExS.panel, width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${DT.expert.line}`, display:'flex', alignItems:'center', gap: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: tone, boxShadow: `0 0 8px ${tone}` }}/>
        <div style={{ ...wxExS.eyebrow, color: DT.expert.text1, letterSpacing:'0.22em' }}>Cityverse · Weather</div>
        <div style={{ flex: 1 }}/>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 11.5, color: DT.expert.text3 }}>{wx.updatedAt}</div>
      </div>

      {/* Hero */}
      <div style={{ padding: '16px 18px 14px', display:'flex', alignItems:'center', gap: 14, borderBottom: `1px solid ${DT.expert.lineSoft}` }}>
        <div style={{
          width: 72, height: 72, borderRadius: 12,
          background: `radial-gradient(circle at 30% 30%, oklch(0.32 0.02 230), oklch(0.2 0.014 230))`,
          border: `1px solid ${DT.expert.line}`,
          display:'grid', placeItems:'center', color: tone,
        }}>
          <WxIcon name={meta.icon} size={44} color={tone}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...wxExS.eyebrow, color: tone }}>{meta.expert}</div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 46, color: DT.expert.text0, lineHeight: 1, fontWeight: 300, letterSpacing:'-0.02em', marginTop: 4 }}>
            {wx.temperature.toFixed(1)}<span style={{ fontSize: 18, color: DT.expert.text2, marginLeft: 3 }}>°C</span>
          </div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text2, marginTop: 6 }}>
            Feels like {wx.feelsLike.toFixed(1)}° · <span style={{ color: feelsDelta < 0 ? DT.expert.info : DT.expert.warn }}>{feelsDelta >= 0 ? '+' : ''}{feelsDelta.toFixed(1)}</span>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 4 }}>
          <WindCompass deg={wx.windDir} size={56} ring={DT.expert.text2} accent={tone} label={false}/>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text2, letterSpacing: '0.12em' }}>{wx.windCardinal} · {wx.windDir}°</div>
        </div>
      </div>

      {/* Field grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
        <Field eyebrow="Wind" value={wx.windSpeed.toFixed(1)} unit="km/h" hint={wx.windCardinal} icon="wind"/>
        <Field eyebrow="Humidity" value={wx.humidity} unit="%" icon="drop" iconTone={WEATHER.ex.rainy}/>
        <Field eyebrow="Pressure" value={wx.pressure} unit="hPa" icon="gauge"/>
        <Field eyebrow="Clouds" value={wx.cloudCover} unit="%" icon="cloud"/>
        <Field eyebrow="Precipitation" value={wx.precipitation.toFixed(1)} unit="mm/h" icon="rain" iconTone={WEATHER.ex.rainy}/>
        <Field eyebrow="Feels Like" value={wx.feelsLike.toFixed(1)} unit="°C" icon="thermometer" iconTone={feelsDelta < 0 ? WEATHER.ex.cold : WEATHER.ex.hot}/>
      </div>

      {/* Footer meta — day/night + season */}
      <div style={{ padding: '10px 14px', display:'flex', alignItems:'center', gap: 14, marginTop: 'auto',
        borderTop: `1px solid ${DT.expert.line}`, background: 'oklch(0.17 0.01 230 / 0.6)' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap: 6, fontFamily: DT.expert.mono, fontSize: 12, color: DT.expert.text1, letterSpacing:'0.1em' }}>
          <WxIcon name={wx.isDaytime ? 'sun' : 'moon'} size={14} color={wx.isDaytime ? WEATHER.ex.sunny : WEATHER.ex.night}/>
          {wx.isDaytime ? 'Daytime' : 'Nighttime'}
        </span>
        <span style={{ width: 1, height: 14, background: DT.expert.line }}/>
        <span style={{ display:'inline-flex', alignItems:'center', gap: 6, fontFamily: DT.expert.mono, fontSize: 12, color: DT.expert.text1, letterSpacing:'0.1em' }}>
          <WxIcon name="leaf" size={14} color={DT.expert.text2}/> Season · {wx.season}
        </span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text2, fontWeight: 500, letterSpacing:'0.12em' }}>LAST UPDATE {wx.updatedAt}</span>
      </div>
    </div>
  );
}

Object.assign(window, { ExWxBadge, ExWxSummary, ExWxDetail });
