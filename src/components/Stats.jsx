export default function Stats({ wpm, accuracy, time, score }) {
  const mins = String(Math.floor(time / 60)).padStart(2, '0');
  const secs = String(time % 60).padStart(2, '0');

  const items = [
    { label: 'Speed',    value: wpm,            unit: 'wpm', color: '#569cd6' },
    { label: 'Accuracy', value: accuracy,        unit: '%',   color: accuracy >= 90 ? '#4ade80' : '#f87171' },
    { label: 'Score',    value: score,           unit: 'pts', color: '#c084fc' },
    { label: 'Time',     value: `${mins}:${secs}`, unit: '',  color: '#ce9178' },
  ];

  return (
    <div style={{
      display: 'flex', gap: 16, marginBottom: 24,
      justifyContent: 'center', flexWrap: 'wrap',
    }}>
      {items.map(({ label, value, unit, color }) => (
        <div key={label} style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: 8, padding: '14px 28px', textAlign: 'center', minWidth: 110,
        }}>
          <div style={{
            fontSize: 11, color: '#555', marginBottom: 4,
            textTransform: 'uppercase', letterSpacing: 1.2,
          }}>
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>
            {value}
            <span style={{ fontSize: 12, fontWeight: 400, color: '#444', marginLeft: 2 }}>
              {unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
