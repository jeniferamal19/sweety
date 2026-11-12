import { useState } from 'react';
import { getUser, clearSession } from './api';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';

export default function App() {
  const [user, setUser] = useState(getUser());
  const [navigationOpen, setNavigationOpen] = useState(false);

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  if (!user) return <AuthPage onLogin={setUser} />;

  return (
    <div className="app-shell">
      {navigationOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setNavigationOpen(false)}
        />
      )}
      <aside className={`sidebar${navigationOpen ? ' sidebar-open' : ''}`} aria-label="Main navigation">
        <button
          type="button"
          className="sidebar-close"
          aria-label="Close navigation"
          onClick={() => setNavigationOpen(false)}
        >
          Close
        </button>
        <a className="brand" href="#dashboard" onClick={() => setNavigationOpen(false)}>
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>
            <strong>Sweety</strong>
            <small>Glucose care</small>
          </span>
        </a>

        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav">
          <a className="nav-link" href="#dashboard" onClick={() => setNavigationOpen(false)}>
            <span className="nav-icon" aria-hidden="true">⌂</span>
            <span>Dashboard</span>
          </a>
          {user.role !== 'doctor' && (
            <a className="nav-link" href="#glucose-tracking" onClick={() => setNavigationOpen(false)}>
              <span className="nav-icon" aria-hidden="true">◷</span>
              <span>Glucose tracking</span>
            </a>
          )}
          <a className="nav-link" href="#reports" onClick={() => setNavigationOpen(false)}>
            <span className="nav-icon" aria-hidden="true">▤</span>
            <span>Reports</span>
          </a>
        </nav>

        <div className="sidebar-note">
          <span className="sidebar-note-mark" aria-hidden="true">+</span>
          <strong>Small steps add up</strong>
          <span>Every reading helps you see the bigger picture.</span>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button
            type="button"
            className="menu-toggle"
            aria-label={navigationOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navigationOpen}
            onClick={() => setNavigationOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="topbar-date">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <div className="profile-area">
            <div className="profile-copy">
              <strong>Hi, {user.name}</strong>
              <span>{user.role === 'doctor' ? 'Doctor account' : 'Your health dashboard'}</span>
            </div>
            <span className="profile-avatar" aria-hidden="true">
              {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </span>
            <button className="logout-button" onClick={handleLogout}>Log out</button>
          </div>
        </header>
        <main className="main-content">
          {user.role === 'doctor' ? <DoctorDashboard /> : <Dashboard />}
        </main>
        <footer className="app-footer">Your readings, thoughtfully organized.</footer>
      </div>
    </div>
  );
}