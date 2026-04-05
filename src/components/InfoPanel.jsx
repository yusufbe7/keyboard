import { UNLOCK_ORDER } from '../constants';

// ── Trend arrow label ─────────────────────────────────────────
function Trend({ curr, prev, suffix = '', decimals = 0 }) {
  if (!prev) return null;
  const diff = curr - prev;
  if (Math.abs(diff) < 0.01) return null;
  const up = diff > 0;
  return (
    <span style={{ fontSize: 11, color: up ? '#4ade80' : '#f87171', marginLeft: 5 }}>
      ({up ? '↑+' : '↓'}{up ? '' : ''}{diff > 0 ? '+' : ''}{diff.toFixed(decimals)}{suffix})
    </span>
  );
}

// ── Letter color helpers ──────────────────────────────────────
function getLetterBg(letter, i, unlockedCount, letterStats, currentChar) {
  if (letter === currentChar) return '#1e3a5f';
  if (i >= unlockedCount) return '#1a1a1a';
  const s = letterStats[letter];
  if (!s || s.attempts === 0) return '#242424';
  const acc = ((s.attempts - s.errors) / s.attempts) * 100;
  if (acc >= 90) return '#14532d';
  if (acc >= 70) return '#713f12';
  return '#7f1d1d';
}

function getLetterColor(letter, i, unlockedCount, letterStats, currentChar) {
  if (letter === currentChar) return '#90caf9';
  if (i >= unlockedCount) return '#2e2e2e';
  const s = letterStats[letter];
  if (!s || s.attempts === 0) return '#4a4a4a';
  const acc = ((s.attempts - s.errors) / s.attempts) * 100;
  if (acc >= 90) return '#4ade80';
  if (acc >= 70) return '#fbbf24';
  return '#f87171';
}

// ── Main component ────────────────────────────────────────────
export default function InfoPanel({
  wpm, accuracy, score,
  prevMetrics,
  unlockedCount,
  letterStats,
  currentChar,
  streak,
  dailyTime,
  dailyGoal,
}) {
  // Current key stats
  const curStats = currentChar ? letterStats[currentChar] : null;
  const curAcc = curStats?.attempts > 0
    ? Math.round(((curStats.attempts - curStats.errors) / curStats.attempts) * 100)
    : null;
  const learningRate =
    curAcc === null   ? '—'           :
    curAcc >= 90      ? 'Good'        :
    curAcc >= 70      ? 'Learning'    : 'Uncertain';
  const lrColor =
    learningRate === 'Good'     ? '#4ade80' :
    learningRate === 'Learning' ? '#fbbf24' : '#f87171';

  // Daily goal
  const dailyPct  = Math.min(100, Math.round((dailyTime / dailyGoal) * 100));
  const dailyMins = Math.floor(dailyTime / 60);
  const dailySecs = dailyTime % 60;

  // Accuracy streak message
  const streakMsg =
    streak >= 2 ? `${streak}-lesson accuracy streak! 🔥` :
    streak === 1 ? '1 lesson streak — keep going!' :
    'No accuracy streaks.';

  return (
    <div style={{
      background: '#181818',
      border: '1px solid #252525',
      borderRadius: 10,
      marginBottom: 20,
      fontSize: 13,
      color: '#ccc',
      overflow: 'hidden',
    }}>
      {/* ── Row 1: Metrics ── */}
      <PanelRow label="Metrics:">
        <span>
          Speed:{' '}
          <b style={{ color: '#e0e0e0' }}>{wpm.toFixed(1)}wpm</b>
          <Trend curr={wpm} prev={prevMetrics.wpm} suffix="wpm" decimals={1} />
        </span>
        <Divider />
        <span>
          Accuracy:{' '}
          <b style={{ color: '#e0e0e0' }}>{accuracy.toFixed(2)}%</b>
          <Trend curr={accuracy} prev={prevMetrics.accuracy} suffix="%" decimals={2} />
        </span>
        <Divider />
        <span>
          Score:{' '}
          <b style={{ color: '#e0e0e0' }}>{Math.round(score)}</b>
          <Trend curr={score} prev={prevMetrics.score} decimals={0} />
        </span>
      </PanelRow>

      {/* ── Row 2: All keys ── */}
      <PanelRow label="All keys:">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {UNLOCK_ORDER.map((letter, i) => (
            <div
              key={letter}
              title={`${letter.toUpperCase()}${i >= unlockedCount ? ' (locked)' : ''}`}
              style={{
                width: 26, height: 26, borderRadius: 4,
                background: getLetterBg(letter, i, unlockedCount, letterStats, currentChar),
                border: `1px solid ${letter === currentChar ? '#569cd6' : 'transparent'}`,
                color: getLetterColor(letter, i, unlockedCount, letterStats, currentChar),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                transition: 'background 0.2s, color 0.2s',
                userSelect: 'none',
              }}
            >
              {letter.toUpperCase()}
            </div>
          ))}
        </div>
      </PanelRow>

      {/* ── Row 3: Current key ── */}
      <PanelRow label="Current key:">
        {currentChar ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Key tile */}
            <div style={{
              width: 28, height: 28, borderRadius: 5,
              background: '#1e3a5f', border: '1px solid #569cd6',
              color: '#90caf9', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {currentChar.toUpperCase()}
            </div>
            {curStats?.attempts > 0 ? (
              <>
                <Metric label="Accuracy" value={`${curAcc}%`} />
                <Metric label="Attempts" value={`${curStats.attempts - curStats.errors}/${curStats.attempts} correct`} />
                <Metric label="Learning rate" value={learningRate} valueColor={lrColor} />
              </>
            ) : (
              <span style={{ color: '#4a4a4a' }}>No data yet for this key.</span>
            )}
          </div>
        ) : (
          <span style={{ color: '#4a4a4a' }}>—</span>
        )}
      </PanelRow>

      {/* ── Row 4: Accuracy ── */}
      <PanelRow label="Accuracy:">
        <span style={{ color: streak > 0 ? '#4ade80' : '#555' }}>
          {streakMsg}
        </span>
      </PanelRow>

      {/* ── Row 5: Daily goal ── */}
      <PanelRow label="Daily goal:" last>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <span style={{ color: '#666', whiteSpace: 'nowrap', minWidth: 90 }}>
            {dailyPct}% / 30 min
          </span>
          <div style={{
            flex: 1, height: 5, background: '#252525',
            borderRadius: 3, overflow: 'hidden', maxWidth: 300,
          }}>
            <div style={{
              width: `${dailyPct}%`, height: '100%',
              background: dailyPct >= 100 ? '#4ade80' : '#3b82f6',
              borderRadius: 3, transition: 'width 1s linear',
            }} />
          </div>
          <span style={{ color: '#444', fontSize: 11, whiteSpace: 'nowrap' }}>
            {dailyMins}m {dailySecs}s typed
          </span>
        </div>
      </PanelRow>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────
function PanelRow({ label, children, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '9px 16px',
      borderBottom: last ? 'none' : '1px solid #202020',
      gap: 8,
    }}>
      <span style={{
        fontSize: 11, color: '#484848', minWidth: 100,
        fontWeight: 500, flexShrink: 0, letterSpacing: 0.3,
        paddingTop: 1,
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <span style={{ color: '#303030', margin: '0 2px' }}>|</span>;
}

function Metric({ label, value, valueColor = '#d4d4d4' }) {
  return (
    <span style={{ fontSize: 12 }}>
      <span style={{ color: '#4a4a4a' }}>{label}: </span>
      <b style={{ color: valueColor }}>{value}</b>
    </span>
  );
}
