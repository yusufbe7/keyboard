import { UNLOCK_ORDER } from '../constants';

// ── Trend arrow ───────────────────────────────────────────────
function Trend({ curr, prev, suffix = '', decimals = 0 }) {
  if (!prev || prev === 0) return null;
  const diff = curr - prev;
  if (Math.abs(diff) < 0.005) return null;
  const up  = diff > 0;
  const abs = Math.abs(diff).toFixed(decimals);
  return (
    <span style={{ fontSize: 11, color: up ? '#4ade80' : '#f87171', marginLeft: 5 }}>
      ({up ? '↑+' : '↓-'}{abs}{suffix})
    </span>
  );
}

// ── Letter tile color helpers ────────────────────────────────
function tileAccuracy(letter, letterStats) {
  const s = letterStats[letter];
  if (!s || s.attempts === 0) return null;
  return ((s.attempts - s.errors) / s.attempts) * 100;
}

function tileBg(letter, i, unlockedCount, letterStats, currentChar) {
  if (letter === currentChar) return '#1e3a5f';
  if (i >= unlockedCount)     return '#1a1a1a';
  const acc = tileAccuracy(letter, letterStats);
  if (acc === null) return '#242424';
  if (acc >= 90)   return '#14532d';
  if (acc >= 70)   return '#713f12';
  return '#7f1d1d';
}

function tileFg(letter, i, unlockedCount, letterStats, currentChar) {
  if (letter === currentChar) return '#90caf9';
  if (i >= unlockedCount)     return '#2a2a2a';
  const acc = tileAccuracy(letter, letterStats);
  if (acc === null) return '#484848';
  if (acc >= 90)   return '#4ade80';
  if (acc >= 70)   return '#fbbf24';
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
  mode,
  wordIndex,
  wordCount,
  recentlyUnlocked,
}) {
  // Current key stats
  const curStats = currentChar ? letterStats[currentChar] : null;
  const curAcc   = curStats?.attempts > 0
    ? Math.round(((curStats.attempts - curStats.errors) / curStats.attempts) * 100)
    : null;
  const learningRate =
    curAcc === null   ? '—'        :
    curAcc >= 90      ? 'Good'     :
    curAcc >= 70      ? 'Learning' : 'Uncertain';
  const lrColor =
    learningRate === 'Good'     ? '#4ade80' :
    learningRate === 'Learning' ? '#fbbf24' : '#f87171';

  // Daily goal
  const dailyPct  = Math.min(100, Math.round((dailyTime / dailyGoal) * 100));
  const dailyMins = Math.floor(dailyTime / 60);
  const dailySecs = dailyTime % 60;

  // Streak/accuracy message
  const streakMsg =
    streak >= 2 ? `${streak}-lesson accuracy streak! 🔥` :
    streak === 1 ? '1 lesson streak — keep going!' :
    'No accuracy streaks.';

  // Word progress (practice mode)
  const wordProgress = mode === 'practice' && wordCount > 0
    ? `${wordIndex + 1} / ${wordCount} words`
    : null;

  return (
    <div style={{
      background: '#181818', border: '1px solid #222',
      borderRadius: 10, marginBottom: 16,
      fontSize: 13, color: '#aaa', overflow: 'hidden',
    }}>

      {/* ── Metrics ── */}
      <Row label="Metrics:">
        <span>
          Speed: <b style={{ color: '#e0e0e0' }}>{wpm.toFixed(1)}wpm</b>
          <Trend curr={wpm} prev={prevMetrics.wpm} suffix="wpm" decimals={1} />
        </span>
        <Sep />
        <span>
          Accuracy: <b style={{ color: '#e0e0e0' }}>{accuracy.toFixed(2)}%</b>
          <Trend curr={accuracy} prev={prevMetrics.accuracy} suffix="%" decimals={2} />
        </span>
        <Sep />
        <span>
          Score: <b style={{ color: '#e0e0e0' }}>{Math.round(score)}</b>
          <Trend curr={score} prev={prevMetrics.score} decimals={0} />
        </span>
        {wordProgress && (
          <>
            <Sep />
            <span style={{ color: '#666' }}>{wordProgress}</span>
          </>
        )}
      </Row>

      {/* ── All keys ── */}
      <Row label="All keys:" className="kb-allkeys-row">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {UNLOCK_ORDER.map((letter, i) => {
            const isRecent = recentlyUnlocked === letter;
            return (
              <div
                key={letter}
                title={`${letter.toUpperCase()}${i >= unlockedCount ? ' (locked)' : ''}`}
                className={isRecent ? 'kb-unlock-pop' : ''}
                style={{
                  width: 26, height: 26, borderRadius: 4,
                  background: tileBg(letter, i, unlockedCount, letterStats, currentChar),
                  border: `1px solid ${letter === currentChar ? '#569cd6' : 'transparent'}`,
                  color: tileFg(letter, i, unlockedCount, letterStats, currentChar),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  transition: 'background 0.3s, color 0.3s',
                  userSelect: 'none',
                }}
              >
                {letter.toUpperCase()}
              </div>
            );
          })}
        </div>
      </Row>

      {/* ── Current key ── */}
      <Row label="Current key:">
        {currentChar ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 5, flexShrink: 0,
              background: '#1e3a5f', border: '1px solid #569cd6',
              color: '#90caf9', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
            }}>
              {currentChar.toUpperCase()}
            </div>
            {curStats?.attempts > 0 ? (
              <>
                <Metric label="Accuracy"      value={`${curAcc}%`} />
                <Metric label="Correct"       value={`${curStats.attempts - curStats.errors}/${curStats.attempts}`} />
                <Metric label="Learning rate" value={learningRate} vc={lrColor} />
              </>
            ) : (
              <span style={{ color: '#444' }}>No data yet for this key.</span>
            )}
          </div>
        ) : (
          <span style={{ color: '#444' }}>—</span>
        )}
      </Row>

      {/* ── Accuracy ── */}
      <Row label="Accuracy:">
        <span style={{ color: streak > 0 ? '#4ade80' : '#555' }}>{streakMsg}</span>
      </Row>

      {/* ── Daily goal ── */}
      <Row label="Daily goal:" last>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <span style={{ color: '#555', whiteSpace: 'nowrap', minWidth: 80 }}>
            {dailyPct}% / 30 min
          </span>
          <div style={{
            flex: 1, maxWidth: 280, height: 5,
            background: '#252525', borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              width: `${dailyPct}%`, height: '100%',
              background: dailyPct >= 100 ? '#4ade80' : '#3b82f6',
              borderRadius: 3, transition: 'width 1s linear',
            }} />
          </div>
          <span style={{ color: '#333', fontSize: 11, whiteSpace: 'nowrap' }}>
            {dailyMins}m {String(dailySecs).padStart(2,'0')}s
          </span>
        </div>
      </Row>
    </div>
  );
}

// ── Shared layout ─────────────────────────────────────────────
function Row({ label, children, last, className }) {
  return (
    <div
      className={className}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '9px 16px',
        borderBottom: last ? 'none' : '1px solid #1e1e1e',
        gap: 8,
      }}
    >
      <span
        className="kb-panel-label"
        style={{ fontSize: 11, color: '#404040', minWidth: 100, flexShrink: 0, fontWeight: 500 }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

function Sep() {
  return <span style={{ color: '#2a2a2a', margin: '0 2px' }}>|</span>;
}

function Metric({ label, value, vc = '#d4d4d4' }) {
  return (
    <span style={{ fontSize: 12 }}>
      <span style={{ color: '#404040' }}>{label}: </span>
      <b style={{ color: vc }}>{value}</b>
    </span>
  );
}
