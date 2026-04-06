import { useState, useEffect } from 'react';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { getProfile, saveProfile, getGlobalStats, getActivity, getLevel } from '../utils/storage';

function fmtTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en', { year:'numeric', month:'short', day:'numeric' });
}

const SCORE_MODES = [
  { key: 'practice', label: 'practice' },
  { key: 'test60',   label: '1 minute' },
  { key: 'test120',  label: '2 minutes' },
];

export default function ProfilePage() {
  const [profile,  setProfile]  = useState(getProfile());
  const [stats,    setStats]    = useState(getGlobalStats());
  const [activity, setActivity] = useState(getActivity());
  const [editing,  setEditing]  = useState(false);
  const [username, setUsername] = useState(profile.username);

  useEffect(() => {
    const refresh = () => {
      setStats(getGlobalStats()); setActivity(getActivity());
      const p = getProfile(); setProfile(p); setUsername(p.username);
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  function saveUsername() {
    const trimmed = username.trim() || 'Player';
    const updated = { ...profile, username: trimmed };
    saveProfile(updated); setProfile(updated); setUsername(trimmed); setEditing(false);
  }

  const level      = getLevel(stats.totalScore);
  const pct        = Math.round((level.current / level.max) * 100);
  const totalTests = Object.values(activity).reduce((s, v) => s + (v?.count || 0), 0);
  const initials   = (profile.username || 'P').charAt(0).toUpperCase();

  const section = {
    background: 'var(--bg2)', borderRadius: 12,
    padding: '28px 32px', marginBottom: 16,
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

      {/* ── Profile card ── */}
      <div style={section}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:28, flexWrap:'wrap' }}>

          {/* Avatar */}
          <div style={{
            width:80, height:80, borderRadius:'50%', flexShrink:0,
            background:'var(--sub-alt)', border:`2px solid var(--sub)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:32, fontWeight:700, color:'var(--main)',
          }}>
            {initials}
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:200 }}>
            {/* Username */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              {editing ? (
                <>
                  <input
                    autoFocus value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => { if (e.key==='Enter') saveUsername(); if (e.key==='Escape') setEditing(false); }}
                    style={{
                      background:'var(--sub-alt)', border:`1px solid var(--accent)`, borderRadius:6,
                      color:'var(--main)', fontSize:22, fontWeight:700, padding:'2px 10px',
                      outline:'none', width:200, fontFamily:'inherit',
                    }}
                  />
                  <button onClick={saveUsername} style={{
                    background:'var(--accent)', border:'none', borderRadius:6,
                    color:'#111', padding:'4px 14px', fontSize:12, fontWeight:700, cursor:'pointer',
                  }}>save</button>
                  <button onClick={()=>setEditing(false)} style={{
                    background:'var(--sub-alt)', border:'none', borderRadius:6,
                    color:'var(--sub)', padding:'4px 10px', fontSize:12, cursor:'pointer',
                  }}>cancel</button>
                </>
              ) : (
                <>
                  <span style={{ fontSize:24, fontWeight:700, color:'var(--main)' }}>{profile.username}</span>
                  <button onClick={()=>setEditing(true)} style={{
                    background:'none', border:'none', cursor:'pointer',
                    color:'var(--sub)', fontSize:13, padding:'2px 6px',
                  }}>✎</button>
                </>
              )}
            </div>

            <div style={{ fontSize:13, color:'var(--sub)', marginBottom:2 }}>
              joined {fmtDate(profile.joinDate)}
            </div>
            <div style={{ fontSize:13, color:'var(--sub)', marginBottom:14 }}>
              streak{' '}
              <b style={{ color: stats.streak > 0 ? 'var(--accent)' : 'var(--sub)' }}>
                {stats.streak} day{stats.streak !== 1 ? 's' : ''}
              </b>
            </div>

            {/* Level + XP */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18, fontWeight:700, color:'var(--accent)', minWidth:24 }}>
                {level.level}
              </span>
              <div style={{ flex:1, maxWidth:180, height:5, background:'var(--sub-alt)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, height:'100%', background:'var(--accent)', borderRadius:3, transition:'width 0.5s' }} />
              </div>
              <span style={{ fontSize:11, color:'var(--sub)' }}>{level.current}/{level.max} xp</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:36, flexWrap:'wrap', alignSelf:'center' }}>
            {[
              { label:'tests started',   value: stats.testsStarted },
              { label:'tests completed', value: stats.testsCompleted },
              { label:'time typing',     value: fmtTime(stats.totalTimeSecs) },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:11, color:'var(--sub)', textTransform:'lowercase', marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:28, fontWeight:700, color:'var(--main)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Best scores ── */}
      <div style={section}>
        <div style={{ fontSize:13, color:'var(--sub)', fontWeight:500, marginBottom:16, textTransform:'lowercase', letterSpacing:1 }}>
          best scores
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {SCORE_MODES.map(({ key, label }) => {
            const best = stats.bestScores?.[key];
            return (
              <div key={key} style={{
                background:'var(--sub-alt)', borderRadius:8, padding:'18px 28px',
                minWidth:130, textAlign:'center', flex:1,
              }}>
                <div style={{ fontSize:11, color:'var(--sub)', marginBottom:8, textTransform:'lowercase', letterSpacing:0.8 }}>{label}</div>
                {best ? (
                  <>
                    <div style={{ fontSize:36, fontWeight:700, color:'var(--accent)', lineHeight:1 }}>
                      {typeof best.wpm === 'number' ? best.wpm.toFixed(0) : best.wpm}
                    </div>
                    <div style={{ fontSize:11, color:'var(--sub)', marginTop:2, marginBottom:4 }}>wpm</div>
                    <div style={{ fontSize:13, color:'var(--correct)' }}>
                      {typeof best.acc === 'number' ? best.acc.toFixed(1) : best.acc}%
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize:32, color:'var(--sub-alt)', lineHeight:1, paddingTop:4 }}>—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Activity heatmap ── */}
      <div style={section}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <span style={{ fontSize:13, color:'var(--sub)', textTransform:'lowercase', letterSpacing:1 }}>
            {totalTests} test{totalTests !== 1 ? 's' : ''} in the last 12 months
          </span>
        </div>
        <ActivityHeatmap activity={activity} />
      </div>

    </div>
  );
}
