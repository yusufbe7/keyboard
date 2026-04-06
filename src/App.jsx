import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PracticePage from './pages/PracticePage';
import ProfilePage  from './pages/Profile';
import { getProfile, getGlobalStats, getLevel } from './utils/storage';

// ── Icon components ───────────────────────────────────────────
function IconKeyboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="5"  y="9"    width="2" height="2" rx="0.4" fill="currentColor"/>
      <rect x="8.5" y="9"   width="2" height="2" rx="0.4" fill="currentColor"/>
      <rect x="12"  y="9"   width="2" height="2" rx="0.4" fill="currentColor"/>
      <rect x="15.5" y="9"  width="2" height="2" rx="0.4" fill="currentColor"/>
      <rect x="5"  y="13"   width="2" height="2" rx="0.4" fill="currentColor"/>
      <rect x="6.5" y="13.2" width="11" height="1.6" rx="0.4" fill="currentColor"/>
      <rect x="17"  y="13"  width="2" height="2" rx="0.4" fill="currentColor"/>
    </svg>
  );
}
function IconCrown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 17h18M5 17L3 7l5 5 4-6 4 6 5-5-2 10H5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}
function IconInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="7.5" r="1" fill="currentColor"/>
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

// Icon button with hover state
function NavIcon({ to, icon, active, title }) {
  const [hovered, setHovered] = useState(false);
  const style = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 6,
    color: active ? 'var(--main)' : hovered ? 'var(--main)' : 'var(--sub)',
    background: active ? 'var(--sub-alt)' : hovered ? 'var(--sub-alt)' : 'transparent',
    textDecoration: 'none', transition: 'color 0.15s, background 0.15s',
    cursor: 'pointer',
  };
  if (to) return (
    <Link to={to} title={title} style={style}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {icon}
    </Link>
  );
  return (
    <div title={title} style={style}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {icon}
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const [profile, setProfile] = useState(getProfile());
  const [stats,   setStats]   = useState(getGlobalStats());

  // Refresh profile/stats when navigating or focusing
  useEffect(() => {
    setProfile(getProfile());
    setStats(getGlobalStats());
  }, [pathname]);

  const level = getLevel(stats.totalScore);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--main)' }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 52,
        background: 'var(--bg2)',
      }}>
        {/* Left: logo + nav icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Logo icon — links to home */}
          <NavIcon to="/" icon={<IconKeyboard />} active={pathname === '/'} title="typeflow — practice" />
          <NavIcon to="/profile" icon={<IconCrown />} active={pathname === '/profile'} title="leaderboard / profile" />
          <NavIcon icon={<IconInfo />}     title="about" />
          <NavIcon icon={<IconSettings />} title="settings" />
        </div>

        {/* Right: bell + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <NavIcon icon={<IconBell />} title="notifications" />
          <Link
            to="/profile"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              textDecoration: 'none', padding: '4px 10px',
              borderRadius: 6, transition: 'background 0.15s',
              color: 'var(--sub)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--sub-alt)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <IconUser />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--sub)' }}>
              {profile.username}
            </span>
            <span style={{
              background: 'var(--sub-alt)', color: 'var(--sub)',
              fontSize: 10, fontWeight: 700,
              padding: '1px 6px', borderRadius: 4, minWidth: 18, textAlign: 'center',
            }}>
              {level.level}
            </span>
          </Link>
        </div>
      </header>

      {/* ── Routes ── */}
      <Routes>
        <Route path="/"        element={<PracticePage />} />
        <Route path="/profile" element={<ProfilePage />}  />
      </Routes>
    </div>
  );
}
