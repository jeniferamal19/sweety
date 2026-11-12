import { useState } from 'react';
import { api, saveSession } from '../api';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data =
        mode === 'register'
          ? await api.register({ name, email, password })
          : await api.login({ email, password });
      saveSession(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === 'register';

  return (
    <div className="auth-shell">
      <div className="brand auth-brand">
        <span className="brand-mark" aria-hidden="true">S</span>
        <span>
          <strong>Sweety</strong>
          <small>Glucose care</small>
        </span>
      </div>
      <div className="auth-intro">
        <span className="eyebrow">A LITTLE MORE CLARITY</span>
        <h1>Care starts with knowing.</h1>
        <p>Track your blood glucose, one reading at a time.</p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="card-heading">
          <div>
            <span className="eyebrow">WELCOME TO SWEETY</span>
            <h2>{isRegister ? 'Create account' : 'Log in'}</h2>
          </div>
        </div>

        {isRegister && (
          <>
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </>
        )}

        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading} style={{ marginTop: 12, width: '100%' }}>
          {loading ? 'Please wait...' : isRegister ? 'Sign up' : 'Log in'}
        </button>

        <p style={{ marginBottom: 0 }}>
          {isRegister ? 'Already have an account? ' : 'New here? '}
          <button
            type="button"
            className="link"
            onClick={() => {
              setMode(isRegister ? 'login' : 'register');
              setError('');
            }}
          >
            {isRegister ? 'Log in' : 'Create an account'}
          </button>
        </p>
      </form>
    </div>
  );
}