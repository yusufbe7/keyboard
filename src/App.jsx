import { Routes, Route, Link, useLocation } from 'react-router-dom';
import PracticePage from './pages/PracticePage';
import ProfilePage  from './pages/Profile';

const NAV = [
  { to: '/',        label: 'Practice' },
  { to: '/profile', label: 'Profile'  },
];

export default function App() {
  const { pathname } = useLocation();

  return (
    <div style={{ minHeight: '100vh', background: '#1e1e1e', color: '#d4d4d4' }}>

      {/* ── Global header ── */}
      <header
        className="kb-header"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 48px', height: 60,
          background: '#161616', borderBottom: '1px solid #252525',
          position: 'sticky', top: 0, zIndex: 20,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 22 }}>⌨️</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#e0e0e0', letterSpacing: -0.5 }}>
            TypeFlow
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {NAV.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '6px 16px', borderRadius: 6,
                  fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                  color:      active ? '#e0e0e0' : '#555',
                  background: active ? '#252525' : 'transparent',
                  borderBottom: active ? '2px solid #569cd6' : '2px solid transparent',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ── Page routes ── */}
      <Routes>
        <Route path="/"        element={<PracticePage />} />
        <Route path="/profile" element={<ProfilePage />}  />
      </Routes>
    </div>
  );
}
