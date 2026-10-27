import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, login } from '@/api';
import { PageShell } from '@/components/layout/PageShell';

export function AdminLoginPage() {
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/admin');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Sign in failed.');
    }
  };

  return (
    <PageShell bar="admin" mainClassName="single single--narrow">
      <div className="auth-card">
        <p className="eyebrow">Owner access</p>
        <h1>Owner sign in</h1>
        <form onSubmit={submit} className="login-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit">Sign in</button>
          {error ? <p role="alert">{error}</p> : null}
        </form>
      </div>
    </PageShell>
  );
}
