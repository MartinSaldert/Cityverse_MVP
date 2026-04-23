// Kids weather components — friendly, educational, calm.
// Compact badge · Summary card · Detail panel.
// Translates weather data into child-sized concepts: hot/cold, windy, rainy.

const wxKidS = {
  card: {
    background: '#FFF',
    border: `3px solid ${DT.kids.line}`,
    borderRadius: 22,
    color: DT.kids.text0,
    fontFamily: DT.kids.sans,
    overflow: 'hidden',
    boxShadow: '0 8px 0 rgba(233,221,194,0.5), 0 12px 28px rgba(43,36,24,0.08)',
  },
};

function kidsTemp(t) {
  if (t >= 28) return { word: 'Hot', icon: 'thermometer', color: WEATHER.k.hot, emoji: '🥵' };
  if (t >= 22) return { word: 'Warm', icon: 'sun', color: WEATHER.k.sunny, emoji: '☀️' };
  if (t >= 15) return { word: 'Mild', icon: 'leaf', color: WEATHER.k.mild, emoji: '🙂' };
  if (t >= 8)  return { word: 'Cool', icon: 'leaf', color: WEATHER.k.cold, emoji: '🧥' };
  return       { word: 'Cold', icon: 'snow', color: WEATHER.k.cold, emoji: '🥶' };
}
function kidsWind(s) {
  if (s < 6) return { word: 'Calm',  level: 0 };
  if (s < 20) return { word: 'Breezy', level: 1 };
  if (s < 35) return { word: 'Windy',  level: 2 };
  return { word: 'Very windy', level: 3 };
}
function kidsRain(p) {
  if (p < 0.1) return { word: 'Dry', level: 0 };
  if (p < 1) return { word: 'A bit of rain', level: 1 };
  if (p < 4) return { word: 'Rainy', level: 2 };
  return { word: 'Pouring', level: 3 };
}
function kidsCloud(c) {
  if (c < 25) return { word: 'Clear sky' };
  if (c < 60) return { word: 'Some clouds' };
  return { word: 'Cloudy sky' };
}

// --- 1. Compact badge -----------------------------------------------------
function KidsWxBadge({ wx = WX, style }) {
  const meta = WEATHER.codes[wx.condition];
  const tone = WEATHER.k[meta.tone] || DT.kids.sunny;
  const t = kidsTemp(wx.temperature);
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap: 10,
      padding: '8px 14px 8px 8px', borderRadius: 999,
      background:'#FFF',
      border: `2px solid ${tone}`,
      boxShadow: `0 4px 0 ${tone}44`,
      fontFamily: DT.kids.sans, color: DT.kids.text0,
      ...style,
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 999, background: `${tone}22`, display:'grid', placeItems:'center', color: tone }}>
        <WxIcon name={meta.icon} size={20} color={tone} fill="solid"/>
      </div>
      <span style={{ fontFamily: DT.kids.display, fontSize: 16, fontWeight: 800, color: DT.kids.text0 }}>{t.word}</span>
      <span style={{ fontFamily: DT.kids.display, fontSize: 16, fontWeight: 800, color: tone }}>{Math.round(wx.temperature)}°</span>
    </div>
  );
}

// --- 2. Summary card ------------------------------------------------------
function KidsWxSummary({ wx = WX }) {
  const meta = WEATHER.codes[wx.condition];
  const tone = WEATHER.k[meta.tone] || WEATHER.k.sunny;
  const t = kidsTemp(wx.temperature);
  const w = kidsWind(wx.windSpeed);
  const r = kidsRain(wx.precipitation);
  return (
    <div style={{ ...wxKidS.card, width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{
        padding: '16px 18px',
        background: `linear-gradient(160deg, ${tone}22, #FFF 80%)`,
        borderBottom: `2px solid ${DT.kids.lineSoft}`,
        display:'flex', alignItems:'center', gap: 14,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, background: '#FFF',
          border: `3px solid ${tone}`, display:'grid', placeItems:'center',
          boxShadow: `0 4px 0 ${tone}33`,
        }}>
          <WxIcon name={meta.icon} size={40} color={tone} fill="solid"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.08em', textTransform:'uppercase' }}>Weather now</div>
          <div style={{ fontFamily: DT.kids.display, fontSize: 26, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.05, marginTop: 2 }}>{meta.kids}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: DT.kids.text1, marginTop: 2 }}>It feels <span style={{ color: t.color }}>{t.word.toLowerCase()}</span> outside</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily: DT.kids.display, fontSize: 42, fontWeight: 800, color: t.color, lineHeight: 1 }}>{Math.round(wx.temperature)}°</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: DT.kids.text2, marginTop: 2 }}>feels {Math.round(wx.feelsLike)}°</div>
        </div>
      </div>

      <div style={{ padding: '14px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 10, marginTop:'auto' }}>
        {[
          { label: 'Wind',  value: w.word, icon: 'wind',  color: WEATHER.k.cloudy },
          { label: 'Rain',  value: r.word, icon: 'rain',  color: WEATHER.k.rainy  },
          { label: 'Sky',   value: kidsCloud(wx.cloudCover).word, icon: 'cloud', color: WEATHER.k.cloudy },
        ].map((x, i) => (
          <div key={i} style={{
            padding: '10px 10px 12px', borderRadius: 14, background: DT.kids.bg0,
            border: `2px solid ${DT.kids.lineSoft}`, textAlign:'center',
          }}>
            <div style={{ width: 34, height: 34, margin: '0 auto 4px', borderRadius: 10,
              background: `${x.color}22`, display:'grid', placeItems:'center' }}>
              <WxIcon name={x.icon} size={20} color={x.color} fill="solid"/>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.06em', textTransform:'uppercase' }}>{x.label}</div>
            <div style={{ fontFamily: DT.kids.display, fontSize: 15, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.1, marginTop: 2 }}>{x.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 3. Detail panel ------------------------------------------------------
function KidsWxDetail({ wx = WX }) {
  const meta = WEATHER.codes[wx.condition];
  const tone = WEATHER.k[meta.tone] || WEATHER.k.sunny;
  const t = kidsTemp(wx.temperature);
  const w = kidsWind(wx.windSpeed);
  const r = kidsRain(wx.precipitation);
  const c = kidsCloud(wx.cloudCover);

  const Meter = ({ level, color }) => (
    <div style={{ display:'flex', gap: 4, marginTop: 6 }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          height: 8, flex: 1, borderRadius: 4,
          background: i <= level ? color : '#F0E6D1',
          transition:'background .2s',
        }}/>
      ))}
    </div>
  );

  const Row = ({ label, value, icon, color, meter }) => (
    <div style={{
      padding: '12px 14px', borderRadius: 16, background: DT.kids.bg0,
      border: `2px solid ${DT.kids.lineSoft}`,
      display:'flex', alignItems:'center', gap: 12,
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}22`, display:'grid', placeItems:'center', flexShrink: 0 }}>
        <WxIcon name={icon} size={24} color={color} fill="solid"/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</div>
        <div style={{ fontFamily: DT.kids.display, fontSize: 18, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.15, marginTop: 1 }}>{value}</div>
        {meter !== undefined && <Meter level={meter.level} color={color}/>}
      </div>
    </div>
  );

  return (
    <div style={{ ...wxKidS.card, width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
      {/* Hero */}
      <div style={{
        padding: '18px 18px 16px',
        background: `linear-gradient(160deg, ${tone}2e, #FFF 85%)`,
        borderBottom: `2px solid ${DT.kids.lineSoft}`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.08em', textTransform:'uppercase' }}>Today's weather</div>
        <div style={{ display:'flex', alignItems:'center', gap: 14, marginTop: 6 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22, background:'#FFF',
            border: `3px solid ${tone}`, display:'grid', placeItems:'center',
            boxShadow: `0 4px 0 ${tone}33`,
          }}>
            <WxIcon name={meta.icon} size={46} color={tone} fill="solid"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DT.kids.display, fontSize: 28, fontWeight: 800, color: DT.kids.text0, lineHeight: 1.05 }}>{meta.kids}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: DT.kids.text1, marginTop: 2 }}>
              It feels <span style={{ color: t.color, fontWeight: 800 }}>{t.word.toLowerCase()}</span> {t.emoji} outside
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily: DT.kids.display, fontSize: 44, fontWeight: 800, color: t.color, lineHeight: 1 }}>{Math.round(wx.temperature)}°</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: DT.kids.text2, marginTop: 2 }}>feels {Math.round(wx.feelsLike)}°</div>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div style={{ padding: 14, display:'flex', flexDirection:'column', gap: 10 }}>
        <Row label="Wind"  value={w.word} icon="wind"  color={WEATHER.k.cloudy} meter={w}/>
        <Row label="Rain"  value={r.word} icon="rain"  color={WEATHER.k.rainy}  meter={r}/>
        <Row label="Sky"   value={c.word} icon="cloud" color={WEATHER.k.cloudy}/>
      </div>

      {/* Day/night + season */}
      <div style={{ padding: '12px 14px', marginTop:'auto', display:'flex', gap: 10,
        borderTop: `2px solid ${DT.kids.lineSoft}`, background: DT.kids.bg2 }}>
        <div style={{ flex: 1, padding: '8px 10px', borderRadius: 12, background:'#FFF',
          border: `2px solid ${DT.kids.lineSoft}`, display:'flex', alignItems:'center', gap: 8 }}>
          <WxIcon name={wx.isDaytime ? 'sun' : 'moon'} size={20} color={wx.isDaytime ? WEATHER.k.sunny : WEATHER.k.night} fill="solid"/>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.06em', textTransform:'uppercase' }}>Right now</div>
            <div style={{ fontFamily: DT.kids.display, fontSize: 14, fontWeight: 800, color: DT.kids.text0 }}>{wx.isDaytime ? 'Daytime' : 'Nighttime'}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '8px 10px', borderRadius: 12, background:'#FFF',
          border: `2px solid ${DT.kids.lineSoft}`, display:'flex', alignItems:'center', gap: 8 }}>
          <WxIcon name="leaf" size={20} color={WEATHER.k.mild} fill="solid"/>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: DT.kids.text2, letterSpacing:'0.06em', textTransform:'uppercase' }}>Season</div>
            <div style={{ fontFamily: DT.kids.display, fontSize: 14, fontWeight: 800, color: DT.kids.text0 }}>{wx.season}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { KidsWxBadge, KidsWxSummary, KidsWxDetail });
