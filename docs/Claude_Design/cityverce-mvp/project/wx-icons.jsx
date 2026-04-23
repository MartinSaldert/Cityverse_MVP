// Weather icons — single shared SVG vocabulary. Stroke-based so both modes
// can tint them (Expert: monotone semantic color. Kids: filled + warmer fills).
// Always render at the intended size; sw auto-scales to look balanced.

function WxIcon({ name, size = 24, color = 'currentColor', fill = 'none', accent, style }) {
  const sw = Math.max(1.25, size / 16);
  const s = { width: size, height: size, display: 'block', ...style };
  const a = accent || color;
  switch (name) {
    case 'sun':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? a : 'none'} stroke={color} strokeWidth={sw} strokeLinecap="round">
          <circle cx="12" cy="12" r="4.5" fill={fill === 'solid' ? a : 'none'} stroke={color}/>
          {[0,45,90,135,180,225,270,315].map(deg => {
            const r1 = 7.5, r2 = 10;
            const rad = (deg * Math.PI)/180;
            return <line key={deg} x1={12+Math.cos(rad)*r1} y1={12+Math.sin(rad)*r1} x2={12+Math.cos(rad)*r2} y2={12+Math.sin(rad)*r2}/>;
          })}
        </svg>
      );
    case 'moon':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? a : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round">
          <path d="M16.5 14.5A7 7 0 1 1 9.5 7.5a5.5 5.5 0 0 0 7 7Z"/>
          <circle cx="17" cy="7" r="0.9" fill={color} stroke="none"/>
          <circle cx="19.5" cy="10" r="0.6" fill={color} stroke="none"/>
        </svg>
      );
    case 'sunCloud':
      return (
        <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8.5" cy="9" r="3" stroke={a} fill={fill === 'solid' ? a : 'none'}/>
          {[0,45,90,135,180,225,270,315].map(deg => {
            const r1 = 5, r2 = 6.5;
            const rad = (deg * Math.PI)/180;
            return <line key={deg} x1={8.5+Math.cos(rad)*r1} y1={9+Math.sin(rad)*r1} x2={8.5+Math.cos(rad)*r2} y2={9+Math.sin(rad)*r2} stroke={a}/>;
          })}
          <path d="M8 17.5h9a3 3 0 0 0 0-6 4 4 0 0 0-7.6-.8A3 3 0 0 0 8 17.5Z" fill={fill === 'solid' ? color : 'none'} stroke={color}/>
        </svg>
      );
    case 'cloud':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round">
          <path d="M7 18h10a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6-1A3.5 3.5 0 0 0 7 18Z"/>
        </svg>
      );
    case 'rain':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          <path d="M7 14h10a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6-1A3.5 3.5 0 0 0 7 14Z"/>
          <line x1="9" y1="16.5" x2="8" y2="20" stroke={a}/>
          <line x1="12.5" y1="16.5" x2="11.5" y2="20.5" stroke={a}/>
          <line x1="16" y1="16.5" x2="15" y2="20" stroke={a}/>
        </svg>
      );
    case 'storm':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          <path d="M7 13h10a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6-1A3.5 3.5 0 0 0 7 13Z"/>
          <path d="M13 14l-3 4.5h3l-1.5 3.5" stroke={a} fill="none"/>
        </svg>
      );
    case 'snow':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 13h10a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6-1A3.5 3.5 0 0 0 7 13Z"/>
          {[[9,17],[12,19],[15,17],[10.5,20.5],[13.5,20.5]].map(([x,y],i)=>(
            <g key={i} stroke={a}>
              <line x1={x-1} y1={y} x2={x+1} y2={y}/>
              <line x1={x} y1={y-1} x2={x} y2={y+1}/>
            </g>
          ))}
        </svg>
      );
    case 'fog':
      return (
        <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
          <line x1="4" y1="9" x2="20" y2="9"/>
          <line x1="3" y1="12.5" x2="18" y2="12.5" stroke={a}/>
          <line x1="5" y1="16" x2="19" y2="16"/>
          <line x1="4" y1="19.5" x2="16" y2="19.5" stroke={a}/>
        </svg>
      );
    case 'wind':
      return (
        <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5"/>
          <path d="M3 14h15a2.5 2.5 0 1 1-2.5 2.5"/>
          <path d="M3 12h8"/>
        </svg>
      );
    case 'drop':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round">
          <path d="M12 3.5s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/>
        </svg>
      );
    case 'gauge':
      return (
        <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16a8 8 0 1 1 16 0"/>
          <line x1="12" y1="16" x2="16" y2="10" stroke={a}/>
          <circle cx="12" cy="16" r="1.3" fill={color} stroke="none"/>
        </svg>
      );
    case 'thermometer':
      return (
        <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4a2 2 0 0 0-2 2v8.2a4 4 0 1 0 4 0V6a2 2 0 0 0-2-2Z"/>
          <line x1="12" y1="8" x2="12" y2="14" stroke={a}/>
          <circle cx="12" cy="17.5" r="1.6" fill={a} stroke="none"/>
        </svg>
      );
    case 'leaf':
      return (
        <svg viewBox="0 0 24 24" style={s} fill={fill === 'solid' ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          <path d="M5 19s0-9 7-13c5-3 7-1 7-1s1 2-1 7c-4 8-13 7-13 7Z"/>
          <path d="M5 19l9-9" stroke={a}/>
        </svg>
      );
    default:
      return null;
  }
}

// Animated compass for wind direction. Angle is degrees FROM (meteorological).
function WindCompass({ deg = 240, size = 56, ring = 'currentColor', accent, label = true }) {
  const a = accent || ring;
  const toRad = (d) => (d - 90) * Math.PI / 180;
  const r = size/2 - 4;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={ring} strokeOpacity={0.35}/>
      {[0, 90, 180, 270].map(t => {
        const rad = toRad(t);
        return <line key={t} x1={size/2 + Math.cos(rad)*(r-1)} y1={size/2 + Math.sin(rad)*(r-1)} x2={size/2 + Math.cos(rad)*(r-4)} y2={size/2 + Math.sin(rad)*(r-4)} stroke={ring} strokeOpacity={0.45}/>;
      })}
      <g transform={`rotate(${deg} ${size/2} ${size/2})`}>
        <path d={`M ${size/2} 4 L ${size/2 - 3} ${size/2} L ${size/2} ${size/2 - 3} L ${size/2 + 3} ${size/2} Z`} fill={a}/>
        <circle cx={size/2} cy={size/2} r={1.8} fill={ring}/>
      </g>
      {label && <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize={size * 0.18} fill={ring} opacity={0.7} style={{ fontFamily: 'inherit' }}>N</text>}
    </svg>
  );
}

Object.assign(window, { WxIcon, WindCompass });
