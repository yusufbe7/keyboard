// Simple SVG sparkline showing WPM samples over the lesson.
// data — number[] (wpm snapshot every 5 s)
export default function WpmChart({ data = [] }) {
  if (!data || data.length < 2) return null;

  const W = 360, H = 70;
  const pad = { t: 8, r: 4, b: 20, l: 36 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const maxV = Math.max(...data, 10);
  const minV = Math.min(...data, 0);
  const range = maxV - minV || 1;

  const px = (i) => pad.l + (i / (data.length - 1)) * iW;
  const py = (v) => pad.t + iH - ((v - minV) / range) * iH;

  const points = data.map((v, i) => [px(i), py(v)]);
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  // Area fill path
  const areaPath = `${linePath} L${px(data.length - 1).toFixed(1)},${(pad.t + iH).toFixed(1)} L${pad.l},${(pad.t + iH).toFixed(1)} Z`;

  // Y-axis labels (top and bottom)
  const yLabels = [
    { v: maxV, y: py(maxV) },
    { v: Math.round((maxV + minV) / 2), y: py((maxV + minV) / 2) },
    { v: minV, y: py(minV) },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
        Speed over time
      </div>
      <svg
        width={W} height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#569cd6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#569cd6" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map(({ y }) => (
          <line key={y} x1={pad.l} y1={y} x2={pad.l + iW} y2={y}
            stroke="#252525" strokeWidth="1" />
        ))}

        {/* Y-axis labels */}
        {yLabels.map(({ v, y }) => (
          <text key={v} x={pad.l - 4} y={y + 4}
            textAnchor="end" fill="#444" fontSize="10" fontFamily="Consolas, monospace">
            {Math.round(v)}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#wpmGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#569cd6" strokeWidth="1.8"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points */}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="#569cd6" />
        ))}

        {/* X-axis label */}
        <text x={pad.l + iW / 2} y={H - 2}
          textAnchor="middle" fill="#333" fontSize="10" fontFamily="Consolas, monospace">
          {data.length * 5}s
        </text>
      </svg>
    </div>
  );
}
