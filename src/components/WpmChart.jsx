export default function WpmChart({ data = [] }) {
  if (!data || data.length < 2) return null;

  const W = 400, H = 72;
  const pad = { t: 6, r: 8, b: 18, l: 32 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const maxV = Math.max(...data, 10);
  const minV = Math.min(...data, 0);
  const range = maxV - minV || 1;

  const px = (i) => pad.l + (i / (data.length - 1)) * iW;
  const py = (v) => pad.t + iH - ((v - minV) / range) * iH;

  const points  = data.map((v, i) => [px(i), py(v)]);
  const linePts = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area    = `${linePts} L${px(data.length-1).toFixed(1)},${(pad.t+iH).toFixed(1)} L${pad.l},${(pad.t+iH).toFixed(1)} Z`;

  const yLabels = [
    { v: maxV,                    y: py(maxV) },
    { v: Math.round((maxV+minV)/2), y: py((maxV+minV)/2) },
    { v: minV,                    y: py(minV) },
  ];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ display:'block', overflow:'visible', margin:'0 auto' }}>
      <defs>
        <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e2b714" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#e2b714" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yLabels.map(({ y }, i) => (
        <line key={i} x1={pad.l} y1={y} x2={pad.l+iW} y2={y}
          stroke="#3a3c3f" strokeWidth="1" />
      ))}

      {/* Y labels */}
      {yLabels.map(({ v, y }, i) => (
        <text key={i} x={pad.l-5} y={y+4}
          textAnchor="end" fill="#646669" fontSize="10"
          fontFamily="'Roboto Mono', monospace">
          {Math.round(v)}
        </text>
      ))}

      {/* Area fill */}
      <path d={area} fill="url(#wpmGrad)" />

      {/* Line */}
      <path d={linePts} fill="none" stroke="#e2b714" strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#e2b714" />
      ))}

      {/* X label */}
      <text x={pad.l+iW/2} y={H-2}
        textAnchor="middle" fill="#646669" fontSize="10"
        fontFamily="'Roboto Mono', monospace">
        {data.length * 5}s
      </text>
    </svg>
  );
}
