import { Routes, Route, Link, useLocation } from 'react-router-dom';
import PracticePage from './pages/PracticePage';
import ProfilePage  from './pages/Profile';

export default function App() {
  const { pathname } = useLocation();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--main)' }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 52,
        background: 'var(--bg)',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.8"/>
            <rect x="5" y="9" width="2" height="2" rx="0.5" fill="var(--sub)"/>
            <rect x="8.5" y="9" width="2" height="2" rx="0.5" fill="var(--sub)"/>
            <rect x="12" y="9" width="2" height="2" rx="0.5" fill="var(--sub)"/>
            <rect x="15.5" y="9" width="2" height="2" rx="0.5" fill="var(--sub)"/>
            <rect x="6.5" y="12.5" width="11" height="2" rx="0.5" fill="var(--sub)"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', letterSpacing: -0.3 }}>
            typeflow
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {[['/', 'practice'], ['/profile', 'profile']].map(([to, label]) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '5px 14px', borderRadius: 6,
                  fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                  color: active ? 'var(--accent)' : 'var(--sub)',
                  background: active ? 'var(--sub-alt)' : 'transparent',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ── Routes ── */}
      <Routes>
        <Route path="/"        element={<PracticePage />} />
        <Route path="/profile" element={<ProfilePage />}  />
      </Routes>
    </div>
  );
}
