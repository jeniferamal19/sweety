import { useState } from 'react';
import { getUser, clearSession } from './api';
import AuthPage from './pages/AuthPage';

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
        <button className="secondary" onClick={handleLogout}>Log out</button>
      </div>
      <div className="card">Welcome, {user.name}! Your readings will appear here.</div>
    </div>
  );
}