'use client';

import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [tenantId, setTenantId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/csrf`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = (await response.json()) as { csrfToken?: string | null };
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      }
    };
    void load();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('Signing in...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify({ tenantId, email, password }),
      credentials: 'include'
    });
    if (response.ok) {
      setStatus('Signed in');
    } else {
      const data = await response.json();
      setStatus(data.message ?? 'Login failed');
    }
  };

  return (
    <main className="min-h-screen px-8 py-16">
      <div className="mx-auto max-w-lg space-y-6 rounded border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm text-slate-300">
            Tenant ID
            <input
              className="mt-2 w-full rounded border border-slate-700 bg-slate-950 p-2"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              className="mt-2 w-full rounded border border-slate-700 bg-slate-950 p-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm text-slate-300">
            Password
            <input
              type="password"
              className="mt-2 w-full rounded border border-slate-700 bg-slate-950 p-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="w-full rounded bg-indigo-500 py-2 text-white hover:bg-indigo-400">
            Sign in
          </button>
        </form>
        {status && <p className="text-sm text-slate-400">{status}</p>}
      </div>
    </main>
  );
}
