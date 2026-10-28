import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ApiError, login } from '@/api';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { en } from '@/locales/en';

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
      setError(caught instanceof ApiError ? caught.message : en.admin.signInFailed);
    }
  };

  return (
    <PageShell
      bar="admin"
      mainClassName="mx-auto w-full max-w-[760px] px-[clamp(1rem,3vw,2rem)] pb-14 pt-8"
    >
      <div className="mt-8 rounded-2xl border border-border bg-card p-7 shadow-lg">
        <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-primary">
          {en.admin.accessEyebrow}
        </p>
        <h1 className="mb-5 mt-0 text-[clamp(1.6rem,2.5vw,2rem)] font-bold tracking-tight">
          {en.admin.signInTitle}
        </h1>
        <form onSubmit={submit} className="grid gap-3">
          <label className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground" htmlFor="username">
            {en.admin.username}
          </label>
          <Input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <label className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground" htmlFor="password">
            {en.admin.password}
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button
            type="submit"
            className="mt-2 min-h-11 border-primary bg-primary text-white hover:border-[#0a4656] hover:bg-[#0a4656] hover:text-white"
          >
            {en.admin.signIn}
          </Button>
          {error ? (
            <p
              className="mt-2 rounded-sm border border-[#f0cbc7] bg-[#fef3f2] px-3 py-2.5 text-sm font-semibold text-[#b42318]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </PageShell>
  );
}
