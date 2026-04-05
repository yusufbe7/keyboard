import { useState, useEffect } from 'react';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { getProfile, saveProfile, getGlobalStats, getActivity, getLevel } from '../utils/storage';

// Format seconds → HH:MM:SS
function fmtTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en', { year:'numeric', month:'short', day:'numeric' });
}

const SCORE_MODES = [
  { key: 'practice', label: 'Practice' },
  { key: 'test60',   label: '1 Minute' },
  { key: 'test120',  label: '2 Minutes' },
];

export default function ProfilePage() {
  const [profile,  setProfile]  = useState(getProfile());
  const [stats,    setStats]    = useState(getGlobalStats());
  const [activity, setActivity] = useState(getActivity());
  const [editing,  setEditing]  = useState(false);
  const [username, setUsername] = useState(profile.username);

  // Refresh on focus (e.g. coming back from practice)
  useEffect(() => {
    const refresh = () => {
      setStats(getGlobalStats());
      setActivity(getActivity());
      const p = getProfile();
      setProfile(p);
      setUsername(p.username);
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  function saveUsername() {
    const trimmed = username.trim() || 'Player';
    const updated = { ...profile, username: trimmed };
    saveProfile(updated);
    setProfile(updated);
    setUsername(trimmed);
    setEditing(false);
  }

  const level      = getLevel(stats.totalScore);
  const pct        = Math.round((level.current / level.max) * 100);
  const totalTests = Object.values(activity).reduce((s, v) => s + (v?.count || 0), 0);

  // ── Avatar initials ──
  const initials = (profile.username || 'P').charAt(0).toUpperCase();

  const card = {
    background: '#252526', border: '1px solid #333',
    borderRadius: 10, padding: '28px 32px', marginBottom: 20,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

      {/* ── Profile card ── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#3a3a3a', border: '2px solid #444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: '#888', flexShrink: 0,
          }}>
            {initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            {/* Username row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              {editing ? (
                <>
                  <input
                    autoFocus
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveUsername(); if (e.key === 'Escape') setEditing(false); }}
                    style={{
                      background: '#333', border: '1px solid #569cd6', borderRadius: 6,
                      color: '#e0e0e0', fontSize: 22, fontWeight: 700, padding: '2px 10px',
                      outline: 'none', width: 200,
                    }}
                  />
                  <button onClick={saveUsername} style={{ background:'#1d4ed8', border:'none', borderRadius:6, color:'#fff', padding:'4px 12px', fontSize:12, cursor:'pointer' }}>Save</button>
                  <button onClick={()=>setEditing(false)} style={{ background:'#333', border:'none', borderRadius:6, color:'#aaa', padding:'4px 10px', fontSize:12, cursor:'pointer' }}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 24, fontWeight: 700, color: '#e0e0e0' }}>{profile.username}</span>
                  <button onClick={() => setEditing(true)} title="Edit username" style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#555', fontSize: 14, padding: '2px 6px',
                  }}>✏️</button>
                </>
              )}
            </div>

            <div style={{ fontSize: 13, color: '#555', marginBottom: 2 }}>
              Joined {fmtDate(profile.joinDate)}
            </div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
              Current streak <b style={{ color: stats.streak > 0 ? '#fbbf24' : '#555' }}>{stats.streak} day{stats.streak !== 1 ? 's' : ''}</b>
            </div>

            {/* Level + XP bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24', minWidth: 28 }}>{level.level}</span>
              <div style={{ flex: 1, maxWidth: 200, height: 6, background: '#333', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: '#fbbf24', borderRadius: 3, transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: 11, color: '#555' }}>{level.current}/{level.max} XP</span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignSelf: 'center' }}>
            {[
              { label: 'tests started',   value: stats.testsStarted   },
              { label: 'tests completed', value: stats.testsCompleted },
              { label: 'time typing',     value: fmtTime(stats.totalTimeSecs) },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#555', textTransform: 'lowercase', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#e0e0e0' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Best scores ── */}
      <div style={card}>
        <h3 style={{ fontSize: 14, color: '#666', fontWeight: 500, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
          Best Scores
        </h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {SCORE_MODES.map(({ key, label }) => {
            const best = stats.bestScores?.[key];
            return (
              <div key={key} style={{
                background: '#1e1e1e', border: '1px solid #2a2a2a',
                borderRadius: 8, padding: '16px 24px', minWidth: 130, textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
                {best ? (
                  <>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#e0e0e0', lineHeight: 1 }}>{best.wpm.toFixed ? best.wpm.toFixed(1) : best.wpm}</div>
                    <div style={{ fontSize: 12, color: '#569cd6', marginTop: 2 }}>wpm</div>
                    <div style={{ fontSize: 13, color: '#4ade80', marginTop: 4 }}>{best.acc?.toFixed ? best.acc.toFixed(1) : best.acc}%</div>
                  </>
                ) : (
                  <div style={{ fontSize: 28, color: '#333', lineHeight: 1, paddingTop: 4 }}>—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Activity heatmap ── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: 14, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
            {totalTests} test{totalTests !== 1 ? 's' : ''} last 12 months
          </h3>
          <span style={{ fontSize: 11, color: '#444' }}>last 12 months</span>
        </div>
        <ActivityHeatmap activity={activity} />
      </div>

    </div>
  );
}
