// Power plant icons — shared SVG vocabulary, matches weather icon style.

function PpIcon({ name, size = 24, color = 'currentColor', fill = 'none', accent, style }) {
  const sw = Math.max(1.25, size / 16);
  const s = { width: size, height: size, display: 'block', ...style };
  const a = accent || color;
  switch (name) {
    case 'solar':
      return (
        <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="2.5" fill={fill === 'solid' ? a : 'none'} stroke={a}/>
          {[0,45,90,135,180,225,270,315].map(deg => {
            const rad = (deg * Math.PI)/180, r1 = 4, r2 = 5.5;
            return <line key={deg} x1={6+Math.cos(rad)*r1} y1={6+Math.sin(rad)*r1} x2={6+Math.cos(rad)*r2} y2={6+Math.sin(rad)*r2} stroke={a}/>;
          })}
          <path d="M3 20 L8 11 L21 11 L16 20 Z" fill={fill === 'solid' ? color : 'none'}/>
          <line x1="10" y1="13" x2="8.5" y2="18.5"/>
          <line x1="14" y1="13" x2="12.5" y2="18.5"/>
          <line x1="18" y1="13" x2="16.5" y2="18.5"/>
          <line x1="7" y1="15.5" x2="19" y2="15.5"/>
        </svg>
      );
    case 'wind':
      return (
        <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="1.4" fill={color} stroke="none"/>
          <path d="M12 9 L12 3"/>
          <path d="M12 9 L17 11.5"/>
          <path d="M12 9 L7 11.5"/>
          <line x1="12" y1="10.5" x2="12" y2="21" stroke={a}/>
          <line x1="9.5" y1="21" x2="14.5" y2="21" stroke={a}/>
        </svg>
      );
    case 'gas':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          <rect x="6" y="11" width="5" height="10" rx="0.5"/>
          <rect x="13" y="8" width="5" height="13" rx="0.5"/>
          <path d="M8.5 11 V7 Q8.5 5 10 5" stroke={a} fill="none"/>
          <path d="M15.5 8 V4 Q15.5 2.5 17 2.5" stroke={a} fill="none"/>
        </svg>
      );
    case 'oil':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          <ellipse cx="12" cy="6" rx="6" ry="1.8"/>
          <path d="M6 6 V18 Q6 20 12 20 Q18 20 18 18 V6"/>
          <line x1="9" y1="9" x2="9" y2="16" stroke={a}/>
          <line x1="12" y1="9" x2="12" y2="16" stroke={a}/>
          <line x1="15" y1="9" x2="15" y2="16" stroke={a}/>
        </svg>
      );
    case 'nuclear':
      return (
        <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          <circle cx="12" cy="12" r="2.2" fill={a} stroke="none"/>
          <ellipse cx="12" cy="12" rx="8" ry="3" stroke={color}/>
          <ellipse cx="12" cy="12" rx="8" ry="3" stroke={color} transform="rotate(60 12 12)"/>
          <ellipse cx="12" cy="12" rx="8" ry="3" stroke={color} transform="rotate(120 12 12)"/>
        </svg>
      );
    case 'battery':
      return (
        <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          <rect x="3" y="8" width="17" height="10" rx="2"/>
          <rect x="20.5" y="11" width="2" height="4" rx="0.5" fill={color} stroke="none"/>
          <rect x="5" y="10" width="4" height="6" fill={a} stroke="none"/>
          <rect x="10" y="10" width="4" height="6" fill={a} stroke="none" opacity={0.6}/>
          <rect x="15" y="10" width="3" height="6" fill={a} stroke="none" opacity={0.25}/>
        </svg>
      );
    case 'bolt':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          <path d="M13 2 L4 14 H11 L10 22 L20 10 H13 Z"/>
        </svg>
      );
    case 'leaf':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          <path d="M5 19s0-9 7-13c5-3 7-1 7-1s1 2-1 7c-4 8-13 7-13 7Z"/>
          <path d="M5 19l9-9" stroke={a}/>
        </svg>
      );
    case 'smoke':
      return (
        <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
          <path d="M5 18 Q7 15 5 12 Q3 9 6 7"/>
          <path d="M11 20 Q13 17 11 14 Q9 11 12 8" stroke={a}/>
          <path d="M17 19 Q19 16 17 13 Q15 10 18 7"/>
        </svg>
      );
    default: return null;
  }
}

Object.assign(window, { PpIcon });
