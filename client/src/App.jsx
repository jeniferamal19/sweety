import { useState } from 'react';
import { getUser, clearSession } from './api';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';

export default function App() {
  const [user, setUser] = useState(getUser());

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  if (!user) return <AuthPage onLogin={setUser} />;

  return (
    <div className="container">
      <div className="row">
        <h1>Sweety</h1>
        <div>
          <span style={{ marginRight: 12 }}>
            Hi, {user.name}{user.role === 'doctor' ? ' (Doctor)' : ''}
          </span>
          <button className="secondary" onClick={handleLogout}>Log out</button>
        </div>
      </div>
      {user.role === 'doctor' ? <DoctorDashboard /> : <Dashboard />}
    </div>
  );
}