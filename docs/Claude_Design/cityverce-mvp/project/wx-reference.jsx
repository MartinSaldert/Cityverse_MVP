// Weather reference board — condition palette, icon grid, typography, rules.

function WxReferenceBoard() {
  const codes = Object.entries(WEATHER.codes);
  return (
    <div style={{ width:'100%', height:'100%', padding: 18, background:'#FBF7EE',
      fontFamily: DT.expert.sans, color: DT.expert.bg0, overflow:'hidden',
      display:'flex', flexDirection:'column', gap: 14 }}>

      <div>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 10, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8A7E62' , fontWeight: 600 }}>Weather System · Reference</div>
        <div style={{ fontFamily: DT.expert.sans, fontWeight: 600, fontSize: 20, marginTop: 4 }}>One condition vocabulary, two voices</div>
      </div>

      {/* Condition icons — Expert & Kids rendered side-by-side for each code */}
      <div style={{ background:'#FFF', border:'1px solid #E9E2D0', borderRadius: 12, padding: 12 }}>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A7E62', marginBottom: 8 , fontWeight: 600 }}>Condition Codes</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10 }}>
          {codes.map(([code, c]) => {
            const exTone = WEATHER.ex[c.tone] || DT.expert.info;
            const kTone  = WEATHER.k[c.tone]  || WEATHER.k.sunny;
            return (
              <div key={code} style={{ border:'1px solid #EDE5CF', borderRadius: 10, padding: '10px 10px 8px', background:'#FDFAF1' }}>
                <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background:'#1E2730', display:'grid', placeItems:'center' }}>
                    <WxIcon name={c.icon} size={20} color={exTone}/>
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background:`${kTone}22`, display:'grid', placeItems:'center' }}>
                    <WxIcon name={c.icon} size={20} color={kTone} fill="solid"/>
                  </div>
                </div>
                <div style={{ fontFamily: DT.expert.mono, fontSize: 9, letterSpacing:'0.1em', textTransform:'uppercase', color:'#8A7E62', marginTop: 8 , fontWeight: 600 }}>{code}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color:'#2B2418' }}>{c.expert}</div>
                <div style={{ fontFamily: DT.kids.display, fontSize: 13, fontWeight: 700, color: kTone }}>{c.kids}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 12, flex:1, minHeight: 0 }}>
        {/* Palette */}
        <div style={{ background:'#FFF', border:'1px solid #E9E2D0', borderRadius: 12, padding: 12 }}>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A7E62', marginBottom: 8 , fontWeight: 600 }}>Semantic Palette</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 6 }}>
            {['sunny','mild','cloudy','rainy','snowy','night','hot','cold'].map(k => (
              <div key={k}>
                <div style={{ height: 28, borderRadius: 6, background: WEATHER.ex[k], border:'1px solid #1E273022' }}/>
                <div style={{ height: 12, borderRadius: 0, background: WEATHER.k[k], marginTop: 2 }}/>
                <div style={{ fontFamily: DT.expert.mono, fontSize: 9, color:'#8A7E62', letterSpacing:'0.08em', textTransform:'uppercase', marginTop: 4 , fontWeight: 600 }}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 9, color:'#8A7E62', marginTop: 10, lineHeight: 1.5 }}>
            Top swatch = Expert (oklch, cool). Bottom = Kids (saturated, warm). Same semantic role both sides.
          </div>
        </div>

        {/* Rules */}
        <div style={{ background:'#FFF', border:'1px solid #E9E2D0', borderRadius: 12, padding: 12, display:'flex', flexDirection:'column' }}>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A7E62', marginBottom: 8 , fontWeight: 600 }}>Rules</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color:'#2B2418', lineHeight: 1.55 }}>
            <li>Condition code is the contract. Expert reads scientific, Kids reads plain.</li>
            <li>Temperature is always a number + °C in Expert; rounded + "feels hot/cold" in Kids.</li>
            <li>Wind: speed + cardinal in Expert; named band (Calm → Very windy) in Kids.</li>
            <li>Icons share geometry; Kids fills them, Expert keeps them line-art.</li>
            <li>Use accent tone sparingly — only hero icon + one numeric highlight per card.</li>
            <li>Day/night + season live in the footer, never in the hero. They frame, not lead.</li>
          </ul>
          <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px dashed #E9E2D0', fontFamily: DT.expert.mono, fontSize: 9.5, color:'#8A7E62', letterSpacing:'0.1em' }}>
            TYPE · Expert: IBM Plex Sans + Mono for values. Kids: Baloo 2 everywhere.
          </div>
        </div>
      </div>
    </div>
  );
}

function WxUnityNotes() {
  const Row = ({ k, v }) => (
    <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', padding: '6px 0', borderBottom:'1px dashed #E9E2D0', fontSize: 11.5 }}>
      <div style={{ fontFamily: DT.expert.mono, fontSize: 10, color:'#8A7E62', letterSpacing:'0.1em', textTransform:'uppercase' , fontWeight: 600 }}>{k}</div>
      <div style={{ color:'#2B2418', lineHeight: 1.45 }}>{v}</div>
    </div>
  );
  return (
    <div style={{ width:'100%', height:'100%', padding: 18, background:'#FBF7EE',
      fontFamily: DT.expert.sans, color: DT.expert.bg0, overflow:'hidden', display:'flex', flexDirection:'column', gap: 12 }}>
      <div>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 10, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8A7E62' , fontWeight: 600 }}>Unity · Weather Implementation</div>
        <div style={{ fontWeight: 600, fontSize: 18, marginTop: 4 }}>Binding, surfaces, and mode switching</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14, flex:1 }}>
        <div style={{ background:'#FFF', border:'1px solid #E9E2D0', borderRadius: 12, padding: 14 }}>
          <Row k="Data source" v="WeatherState ScriptableObject streamed from sim tick; UI subscribes via UnityEvent<WeatherState>."/>
          <Row k="Canvas — screen" v="Screen Space – Camera. Summary card anchored top-right, detail panel opens as an inspector flyout."/>
          <Row k="Canvas — VR" v="World Space panel, 1.2m from viewer, 28dp base type. Summary on left wrist menu; detail on a pinned slate."/>
          <Row k="Canvas — AR" v="Billboarded badge anchored above the environment plane. Tap expands to summary; long-press opens detail."/>
          <Row k="Mode switch" v="One prefab per surface with Expert/Kids as sibling GameObjects. Toggle via Animator bool `isKidsMode`; shared data binder."/>
          <Row k="Icons" v="One SpriteAtlas with all 12 glyphs. Expert uses outline variant, Kids uses filled + tint via Image.color."/>
        </div>
        <div style={{ background:'#FFF', border:'1px solid #E9E2D0', borderRadius: 12, padding: 14 }}>
          <Row k="Condition enum" v="WeatherCondition { Clear, PartlyCloudy, Cloudy, Rain, Storm, Snow, Fog, ClearNight }. Translate via WeatherLexicon.asset."/>
          <Row k="Temperature" v="Store °C. Expert: one decimal. Kids: Mathf.RoundToInt. Delta uses feelsLike − temperature."/>
          <Row k="Wind" v="Speed km/h + bearing°. WindCompass rotates a RectTransform by bearing; cardinal computed via helper."/>
          <Row k="Kids bands" v="Temp → Hot/Warm/Mild/Cool/Cold. Wind → Calm/Breezy/Windy/Very windy. Rain → Dry/A bit of rain/Rainy/Pouring."/>
          <Row k="Accessibility" v="Min 24dp type HUD, 32dp VR. Never color-only status: always icon + word. 4.5:1 contrast against panel."/>
          <Row k="Performance" v="Rebuild UI only on WeatherState.updatedAt change. Tween numeric deltas over 600ms with easing for calmness."/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WxReferenceBoard, WxUnityNotes });
