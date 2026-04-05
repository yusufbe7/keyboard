export default function Stats({ wpm, accuracy, time }) {
  return (
    <div style={{
      display: 'flex',
      gap: 24,
      marginBottom: 24,
    }}>
      {[
        { label: 'Tezlik', value: `${wpm} wpm` },
        { label: 'Aniqlik', value: `${accuracy}%` },
        { label: 'Vaqt', value: `${time}s` },
      ].map(({ label, value }) => (
        <div key={label} style={{
          background: '#f0f0f0',
          borderRadius: 10,
          padding: '12px 24px',
          textAlign: 'center',
          minWidth: 100,
        }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}