// Power plant reference + unity notes.

function PpReferenceBoard() {
  const types = Object.entries(POWER.types);
  return (
    <div style={{ width:'100%', height:'100%', padding: 18, background:'#FBF7EE',
      fontFamily: DT.expert.sans, color: DT.expert.bg0, overflow:'hidden',
      display:'flex', flexDirection:'column', gap: 14 }}>

      <div>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 10, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8A7E62' , fontWeight: 600 }}>Generation System · Reference</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>One plant vocabulary, two voices</div>
      </div>

      <div style={{ background:'#FFF', border:'1px solid #E9E2D0', borderRadius: 12, padding: 12 }}>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A7E62', marginBottom: 8 , fontWeight: 600 }}>Plant Types</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap: 10 }}>
          {types.map(([k, t]) => {
            const exT = POWER.ex[t.tone], kT = POWER.k[t.tone];
            return (
              <div key={k} style={{ border:'1px solid #EDE5CF', borderRadius: 10, padding: '10px 10px 8px', background:'#FDFAF1' }}>
                <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background:'#1E2730', display:'grid', placeItems:'center' }}>
                    <PpIcon name={t.icon} size={18} color={exT}/>
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background:`${kT}22`, display:'grid', placeItems:'center' }}>
                    <PpIcon name={t.icon} size={18} color={kT} fill="solid"/>
                  </div>
                </div>
                <div style={{ fontFamily: DT.expert.mono, fontSize: 9, letterSpacing:'0.1em', textTransform:'uppercase', color:'#8A7E62', marginTop: 8 , fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color:'#2B2418' }}>{t.expert}</div>
                <div style={{ fontFamily: DT.kids.display, fontSize: 13, fontWeight: 700, color: kT }}>{t.kids}</div>
                <div style={{ display:'flex', gap: 3, marginTop: 8 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ flex:1, height: 4, borderRadius: 2, background: i < t.clean ? '#4FAF73' : '#E9E2D0' }}/>
                  ))}
                </div>
                <div style={{ fontFamily: DT.expert.mono, fontSize: 9, color:'#8A7E62', letterSpacing:'0.08em', marginTop: 4 }}>CLEAN {t.clean}/3 · EM {t.emissions}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, flex:1, minHeight: 0 }}>
        <div style={{ background:'#FFF', border:'1px solid #E9E2D0', borderRadius: 12, padding: 12 }}>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A7E62', marginBottom: 8 , fontWeight: 600 }}>Semantic Palette</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap: 6 }}>
            {['solar','wind','gas','oil','nuclear','battery'].map(k => (
              <div key={k}>
                <div style={{ height: 28, borderRadius: 6, background: POWER.ex[k], border:'1px solid #1E273022' }}/>
                <div style={{ height: 12, background: POWER.k[k], marginTop: 2 }}/>
                <div style={{ fontFamily: DT.expert.mono, fontSize: 9, color:'#8A7E62', letterSpacing:'0.08em', textTransform:'uppercase', marginTop: 4 , fontWeight: 600 }}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 9, color:'#8A7E62', marginTop: 10, lineHeight: 1.5 }}>
            Top = Expert (oklch, cool). Bottom = Kids (warm, saturated). Tone is assigned to plant type — not to status. Status is carried by online pill + state word.
          </div>
        </div>
        <div style={{ background:'#FFF', border:'1px solid #E9E2D0', borderRadius: 12, padding: 12, display:'flex', flexDirection:'column' }}>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A7E62', marginBottom: 8 , fontWeight: 600 }}>Rules</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color:'#2B2418', lineHeight: 1.55 }}>
            <li>Output (MW) is the hero number. Utilization % is the supporting value.</li>
            <li>Bar fill uses the plant tone; empty track is always neutral — not red.</li>
            <li>Online / Offline lives in a pill at the same position on every card.</li>
            <li>Expert reads "Utilization 64% · Emissions mid". Kids reads "A bit dirty, making 38 MW now".</li>
            <li>"Cleanness" is a 0–3 meter both modes share — never judgemental copy.</li>
            <li>Weather factor only appears for weather-sensitive plants (solar, wind).</li>
          </ul>
          <div style={{ marginTop:'auto', paddingTop: 10, borderTop: '1px dashed #E9E2D0', fontFamily: DT.expert.mono, fontSize: 9.5, color:'#8A7E62', letterSpacing:'0.1em' }}>
            TYPE · Expert: IBM Plex Sans + Mono. Kids: Baloo 2. Both modes 4.5:1 contrast.
          </div>
        </div>
      </div>
    </div>
  );
}

function PpUnityNotes() {
  const Row = ({ k, v }) => (
    <div style={{ display:'grid', gridTemplateColumns:'150px 1fr', padding: '6px 0', borderBottom:'1px dashed #E9E2D0', fontSize: 11.5 }}>
      <div style={{ fontFamily: DT.expert.mono, fontSize: 10, color:'#8A7E62', letterSpacing:'0.1em', textTransform:'uppercase' , fontWeight: 600 }}>{k}</div>
      <div style={{ color:'#2B2418', lineHeight: 1.45 }}>{v}</div>
    </div>
  );
  return (
    <div style={{ width:'100%', height:'100%', padding: 18, background:'#FBF7EE',
      fontFamily: DT.expert.sans, color: DT.expert.bg0, overflow:'hidden', display:'flex', flexDirection:'column', gap: 12 }}>
      <div>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 10, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8A7E62' , fontWeight: 600 }}>Unity · Generation Implementation</div>
        <div style={{ fontWeight: 600, fontSize: 18, marginTop: 4 }}>Binding, surfaces, mode switching</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14, flex:1 }}>
        <div style={{ background:'#FFF', border:'1px solid #E9E2D0', borderRadius: 12, padding: 14 }}>
          <Row k="Data source" v="PlantState ScriptableObject per plant. Sim tick updates output/online/weatherFactor; UI binds via UnityEvent<PlantState>."/>
          <Row k="Plant enum" v="PlantType { Solar, Wind, Gas, Oil, Nuclear, Battery }. Lookup via PlantLexicon.asset (Expert/Kids label, blurb, tone, clean score, emissions)."/>
          <Row k="Canvas — screen" v="Screen Space – Camera. Summary cards tile into a Generation panel; detail opens as inspector flyout."/>
          <Row k="Canvas — VR" v="World Space slate, 1.2m from viewer, 28dp base type. Summary cards live on wrist menu; detail is a pinned slate."/>
          <Row k="Canvas — AR" v="Billboarded floating label anchored above plant model. Tap expands to summary; long-press opens detail."/>
          <Row k="Mode switch" v="Expert/Kids prefabs as sibling children of the same surface. Animator bool `isKidsMode` toggles; shared PlantBinder feeds both."/>
        </div>
        <div style={{ background:'#FFF', border:'1px solid #E9E2D0', borderRadius: 12, padding: 14 }}>
          <Row k="Output + bar" v="CapacityBar: fill width = output/capacity, tone from PlantLexicon. Never turns red — low fill is calm grey."/>
          <Row k="Online state" v="Single OnlinePill prefab. Shared between modes; text + color swap via bool; keeps position constant card-to-card."/>
          <Row k="Clean meter" v="3-segment meter driven by clean score (0–3). Expert: accent-ok fill. Kids: cleanColor() function — never shames dirty plants, just names them."/>
          <Row k="Weather dependence" v="Only solar + wind render the weather row. Pulls wx.condition + WeatherFactor from shared WeatherState."/>
          <Row k="Accessibility" v="Min 24dp type HUD, 32dp VR. Status never color-only: always pill + word. Icon + label pairing everywhere."/>
          <Row k="Future fields" v="Faults → red banner above hero. Fuel → fuel bar between output and footer. Dispatch priority → small rank badge next to online pill. Storage → battery reuses same template."/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PpReferenceBoard, PpUnityNotes });
