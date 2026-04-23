// Reference boards + Unity guidance artboards.
// Tokens, type, status vocabulary, spatial-surface map, layout notes.

function Card({ title, children, w = 520, h = 360, tone = 'dark' }) {
  const dark = tone === 'dark';
  return (
    <div style={{
      width: w, height: h,
      background: dark ? 'linear-gradient(180deg, oklch(0.24 0.014 230 / 0.9), oklch(0.2 0.012 230 / 0.94))' : '#FFF',
      border: `1px solid ${dark ? DT.expert.line : DT.kids.line}`,
      borderRadius: dark ? 10 : 20,
      color: dark ? DT.expert.text0 : DT.kids.text0,
      fontFamily: dark ? DT.expert.sans : DT.kids.sans,
      padding: '16px 18px',
      display:'flex', flexDirection:'column', gap: 14,
      overflow: 'hidden',
    }}>
      <div style={{
        fontFamily: dark ? DT.expert.mono : DT.kids.sans,
        fontSize: dark ? 10.5 : 13,
        letterSpacing: dark ? '0.18em' : '0.04em',
        textTransform: dark ? 'uppercase' : 'none',
        color: dark ? DT.expert.text2 : DT.kids.text2,
        fontWeight: dark ? 500 : 700,
      }}>{title}</div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

// ─── TOKENS: Palette ──────────────────────────────────────────
function PaletteBoard() {
  const rows = [
    ['Expert · Surface', [
      ['bg-0', DT.expert.bg0], ['bg-1', DT.expert.bg1], ['bg-2', DT.expert.bg2],
      ['line', 'oklch(0.32 0.015 230)'], ['text-2', 'oklch(0.58 0.015 228)'], ['text-0', 'oklch(0.96 0.008 220)'],
    ]],
    ['Expert · Status', [
      ['accent', DT.expert.accent], ['ok', DT.expert.ok], ['warn', DT.expert.warn], ['crit', DT.expert.crit], ['info', DT.expert.info],
    ]],
    ['Kids · Surface', [
      ['bg-0', DT.kids.bg0], ['bg-2', DT.kids.bg2], ['line', DT.kids.line], ['text-0', DT.kids.text0], ['text-2', DT.kids.text2],
    ]],
    ['Kids · Mood', [
      ['happy', DT.kids.happy], ['sunny', DT.kids.sunny], ['cloudy', DT.kids.cloudy], ['busy', DT.kids.busy], ['cozy', DT.kids.cozy], ['alert', DT.kids.alert],
    ]],
  ];
  return (
    <Card title="Color System · Tokens" w={620} h={440}>
      <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
        {rows.map(([label, sw]) => (
          <div key={label}>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.18em', color: DT.expert.text3, textTransform:'uppercase', marginBottom: 6 , fontWeight: 600 }}>{label}</div>
            <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
              {sw.map(([n, c]) => (
                <div key={n} style={{ display:'flex', flexDirection:'column', gap: 4, width: 76 }}>
                  <div style={{ height: 40, borderRadius: 6, background: c, border: `1px solid ${DT.expert.line}` }}/>
                  <div style={{ fontFamily: DT.expert.mono, fontSize: 10, color: DT.expert.text1 }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── TOKENS: Type ─────────────────────────────────────────────
function TypeBoard() {
  return (
    <Card title="Typography · Expert / Kids" w={620} h={440}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 18, height: '100%' }}>
        <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.18em', color: DT.expert.text3, textTransform:'uppercase' , fontWeight: 600 }}>Expert · IBM Plex</div>
          <div style={{ fontFamily: DT.expert.sans, fontSize: 28, fontWeight: 600, color: DT.expert.text0, letterSpacing: -0.01 }}>Factory 01</div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 34, fontWeight: 300, color: DT.expert.accent }}>84.2 kW</div>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 10.5, letterSpacing:'0.16em', color: DT.expert.text2, textTransform:'uppercase' , fontWeight: 600 }}>CURRENT DEMAND · TICK 1284920</div>
          <div style={{ fontFamily: DT.expert.sans, fontSize: 12, color: DT.expert.text1, lineHeight: 1.5, marginTop: 6 }}>
            Sans for names + body. Mono for numbers, labels, timestamps. Tabular nums everywhere.
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap: 10, background: DT.kids.bg0, borderRadius: 14, padding: 14, color: DT.kids.text0 }}>
          <div style={{ fontFamily: DT.kids.sans, fontSize: 11, letterSpacing:'0.08em', textTransform:'uppercase', color: DT.kids.text2, fontWeight: 700 }}>Kids · Baloo 2</div>
          <div style={{ fontFamily: DT.kids.display, fontSize: 30, fontWeight: 800, color: DT.kids.text0 }}>The Big Factory</div>
          <div style={{ fontFamily: DT.kids.display, fontSize: 36, fontWeight: 800, color: DT.kids.busy }}>84 kW</div>
          <div style={{ fontFamily: DT.kids.sans, fontSize: 13, fontWeight: 700, color: DT.kids.text1 }}>🧡 Busy right now</div>
          <div style={{ fontFamily: DT.kids.sans, fontSize: 13, color: DT.kids.text1, lineHeight: 1.5 }}>
            Rounded display for names + numbers. Plain sentences. Emoji as mood markers, never as dividers.
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── STATUS VOCABULARY ───────────────────────────────────────
function StatusBoard() {
  const rows = [
    { code: 'OK',     k: 'All good',        e: '💚', exC: DT.expert.ok,     kC: DT.kids.happy,  use: 'Nominal operation, factors near 1.0×' },
    { code: 'BUSY',   k: 'Busy right now',  e: '🧡', exC: DT.expert.warn,   kC: DT.kids.busy,   use: 'High demand vs base, crowded' },
    { code: 'STEADY', k: 'Steady',          e: '💙', exC: DT.expert.info,   kC: DT.kids.cloudy, use: 'Flat load — utility/infrastructure' },
    { code: 'COZY',   k: 'Quiet & cozy',    e: '💜', exC: DT.expert.accent, kC: DT.kids.cozy,   use: 'Under-occupied, low load' },
    { code: 'ALERT',  k: 'Needs help',      e: '🚨', exC: DT.expert.crit,   kC: DT.kids.alert,  use: 'Reserved for real fault / warning' },
  ];
  return (
    <Card title="Status Vocabulary · Shared semantics" w={620} h={440}>
      <div style={{ display:'grid', gridTemplateColumns:'90px 1fr 1fr 1fr', gap: 10, alignItems:'center', fontSize: 12 }}>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.16em', color: DT.expert.text3 }}>CODE</div>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.16em', color: DT.expert.text3 }}>EXPERT</div>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.16em', color: DT.expert.text3 }}>KIDS</div>
        <div style={{ fontFamily: DT.expert.mono, fontSize: 9.5, letterSpacing:'0.16em', color: DT.expert.text3 }}>WHEN TO USE</div>
        {rows.map(r => (
          <React.Fragment key={r.code}>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text0, letterSpacing:'0.1em' }}>{r.code}</div>
            <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius:'50%', background: r.exC, boxShadow:`0 0 10px ${r.exC}` }}/>
              <span style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.text1, letterSpacing:'0.12em', textTransform:'uppercase' , fontWeight: 600 }}>{r.code}</span>
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap: 6, padding:'3px 9px', borderRadius: 999, background:'#FFF', color: r.kC, border:`1px solid ${r.kC}44`, fontWeight: 700, fontSize: 12 }}>
              <span>{r.e}</span>{r.k}
            </div>
            <div style={{ fontSize: 11.5, color: DT.expert.text2, lineHeight: 1.4 }}>{r.use}</div>
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}

// ─── SPATIAL SURFACE MAP ─────────────────────────────────────
function SpatialMap() {
  const cells = [
    ['2D HUD', 'Compact summary cards, status chips, mini sparks. 12–13px text, dense grids allowed.', ['Summary Card', 'Status Pill', 'Floating Label (leader)']],
    ['World-Space', 'Medium panels pinned above buildings. Face-camera billboard. 16–20px type, no dense tables.', ['Floating Label', 'Summary Card (mid-zoom)']],
    ['VR Panel', 'Large chunky cards at arm\'s length. 22–40px type. Big hit targets (≥44mm on-panel).', ['VR Building Panel', 'VR Kids Panel']],
    ['AR Anchor', 'Translucent single-line pills anchored to building. One-glance only.', ['AR Anchored Label', 'AR Kids Label']],
  ];
  return (
    <Card title="Spatial Surface Map · Which component goes where" w={620} h={440}>
      <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
        {cells.map(([k, desc, uses]) => (
          <div key={k} style={{ display:'grid', gridTemplateColumns:'100px 1fr 160px', gap: 12, padding: '10px 0', borderBottom: `1px dashed ${DT.expert.lineSoft}` }}>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 11, color: DT.expert.accent, letterSpacing:'0.12em', textTransform:'uppercase' , fontWeight: 600 }}>{k}</div>
            <div style={{ fontSize: 12, color: DT.expert.text1, lineHeight: 1.45 }}>{desc}</div>
            <div style={{ display:'flex', flexDirection:'column', gap: 3 }}>
              {uses.map(u => (
                <span key={u} style={{ fontFamily: DT.expert.mono, fontSize: 10, color: DT.expert.text2, letterSpacing:'0.08em' }}>· {u}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── UNITY IMPLEMENTATION NOTES ──────────────────────────────
function UnityNotes() {
  const sections = [
    {
      h: 'Canvas Render Modes',
      items: [
        'Screen Space – Overlay: HUD top/bottom bars, mini map, summary cards on a resolution-scaled CanvasScaler (1920×1080 reference, Scale With Screen Size).',
        'Screen Space – Camera: optional tilt-parallax HUD layer for cinematic moments.',
        'World Space: all billboarded labels above buildings. LookAt camera, clamp up-axis to world-up.',
        'XR: one Canvas per panel, TrackedDeviceGraphicRaycaster, curved mesh only for wide VR panels.',
      ],
    },
    {
      h: 'Sizing discipline',
      items: [
        'Keep one base canvas unit = 1 dp. HUD base type 16 dp, VR base type 24–28 dp.',
        'Panels use a 12-unit grid. Summary card = 300×380, Detail = 420×560, VR panel = 800×520, AR pill = 380×64.',
        'Leave ≥24 dp padding around panel edges. VR ≥40 dp.',
      ],
    },
    {
      h: 'Data binding',
      items: [
        'One ScriptableObject per building archetype (type, capacity, baseDemand).',
        'One BuildingState component per instance; publishes OnChanged for UI to subscribe to.',
        'Broker pushes to BuildingState via message bus (weather/*, energy/*, buildings/*).',
      ],
    },
    {
      h: 'Mode switching',
      items: [
        'Single UIMode enum { Expert, Kids } driven by app setting.',
        'Each prefab has Expert and Kids child roots; only one active. Do NOT branch in shaders — just swap graphics.',
        'Localisation: Expert = terse technical copy; Kids = full sentences, precomputed.',
      ],
    },
    {
      h: 'Accessibility',
      items: [
        'Minimum contrast 4.5:1 for text; all status colors doubled by shape/emoji.',
        'Min on-screen tap 44 dp. VR min on-panel target 40 mm.',
        'No info conveyed by color alone. Never rely on <12 px text.',
      ],
    },
  ];
  return (
    <Card title="Unity · Implementation notes" w={920} h={540}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16, height: '100%' }}>
        {sections.map(s => (
          <div key={s.h} style={{ borderLeft: `2px solid ${DT.expert.accent}`, paddingLeft: 12 }}>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 10.5, letterSpacing:'0.16em', color: DT.expert.text2, textTransform:'uppercase', marginBottom: 8 , fontWeight: 600 }}>{s.h}</div>
            <ul style={{ margin: 0, padding: 0, listStyle:'none', display:'flex', flexDirection:'column', gap: 6 }}>
              {s.items.map((it, i) => (
                <li key={i} style={{ fontSize: 11.5, color: DT.expert.text1, lineHeight: 1.5,
                  paddingLeft: 10, position:'relative' }}>
                  <span style={{ position:'absolute', left: 0, top: 8, width: 4, height: 4, borderRadius: '50%', background: DT.expert.accent }}/>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── PRINCIPLES / BRIEF STATEMENT ────────────────────────────
function BriefStatement() {
  return (
    <Card title="Design Direction · One page" w={920} h={540}>
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap: 20, height:'100%', fontFamily: DT.expert.sans, color: DT.expert.text1 }}>
        <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: DT.expert.text0, letterSpacing: -0.01, lineHeight: 1.2 }}>
            A modern, quiet, slightly futuristic city operations surface —<br/>
            <span style={{ color: DT.expert.accent }}>glanceable first, inspectable second.</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.55 }}>
            Two modes share one data model and one status vocabulary. Expert speaks in kW, factors, and ticks. Kids speaks in sentences, emoji, and "people". Both read from the same <b style={{ color: DT.expert.text0 }}>BuildingState</b> and never show different truths.
          </div>
          <div style={{ marginTop: 8, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10 }}>
            {[
              ['Glanceable', 'One mood, one metric, ≤1.5s read'],
              ['Layered',    'Label → summary → detail'],
              ['Quiet',      'No gradients as decoration, no filler'],
              ['Spatial',    'Same card, different scale per surface'],
              ['Honest',     'Numbers over badges; no fake precision'],
              ['Kind',       'Kids mode never uses alarm language'],
            ].map(([h, t]) => (
              <div key={h} style={{ padding: '8px 10px', border: `1px solid ${DT.expert.lineSoft}`, borderRadius: 6 }}>
                <div style={{ fontFamily: DT.expert.mono, fontSize: 10, letterSpacing:'0.16em', color: DT.expert.accent, textTransform:'uppercase' , fontWeight: 600 }}>{h}</div>
                <div style={{ fontSize: 11, color: DT.expert.text2, marginTop: 3, lineHeight: 1.4 }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
          <div style={{ fontFamily: DT.expert.mono, fontSize: 10, letterSpacing:'0.16em', color: DT.expert.text3, textTransform:'uppercase' , fontWeight: 600 }}>Card Hierarchy</div>
          <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
            {[
              ['Floating Label',  'Name · mood · 1–2 numbers',            '180–380 dp'],
              ['Summary Card',    'Status · People · Power · Weather',    '300–340 dp'],
              ['Detail Panel',    'KPIs · factors · trend · future slots', '420–520 dp'],
              ['VR Panel',        'Giant KPIs · chunky progress',          '800 dp+'],
              ['AR Anchor',       'Pill with 1 line, leader to ground',   '380 dp'],
            ].map(([k, desc, sz]) => (
              <div key={k} style={{ display:'grid', gridTemplateColumns:'120px 1fr 70px', gap: 8,
                padding: '8px 10px', background: 'oklch(0.2 0.012 230 / 0.6)', borderRadius: 6, alignItems:'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: DT.expert.text0 }}>{k}</div>
                <div style={{ fontSize: 11, color: DT.expert.text2, lineHeight: 1.4 }}>{desc}</div>
                <div style={{ fontFamily: DT.expert.mono, fontSize: 10, color: DT.expert.text3, letterSpacing:'0.08em' }}>{sz}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: '10px 12px', borderRadius: 8, border: `1px dashed ${DT.expert.lineSoft}` }}>
            <div style={{ fontFamily: DT.expert.mono, fontSize: 10, letterSpacing:'0.16em', color: DT.expert.accent, textTransform:'uppercase', marginBottom: 4 , fontWeight: 600 }}>Interaction pattern</div>
            <div style={{ fontSize: 11.5, color: DT.expert.text1, lineHeight: 1.5 }}>
              Gaze or hover on a building → AR/floating label appears. Tap or pinch → expand to summary. Long-press or select → detail panel in HUD / VR side-panel.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

Object.assign(window, { PaletteBoard, TypeBoard, StatusBoard, SpatialMap, UnityNotes, BriefStatement });
