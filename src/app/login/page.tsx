'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface AuthResponse {
  user: { id: string; email: string; name?: string; role?: string; createdAt?: string; updatedAt?: string };
  token: string;
}

export function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { notify } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await api.post<AuthResponse>('/api/auth/login', { email, password });
    if (apiError || !data) {
      setError(apiError || 'Unable to login');
      notify(apiError || 'Unable to login', 'error');
      setLoading(false);
      return;
    }
    login({
      id: data.user.id,
      email: data.user.email,
      name: data.user.name || data.user.email,
      role: (data.user.role as 'customer' | 'admin') || 'customer',
      createdAt: data.user.createdAt || new Date().toISOString(),
      updatedAt: data.user.updatedAt || new Date().toISOString(),
    });
    localStorage.setItem('token', data.token);
    notify('Welcome back!', 'success');
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Log in</h1>
          <p className="text-sm text-secondary">Access your tasks and dashboard.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} aria-label="Login form">
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" fullWidth loading={loading} aria-label="Log in">
              {loading ? 'Signing in' : 'Log in'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-sm text-secondary">
        New here?{' '}
        <Link href="/register" className="font-medium text-primary">
          Create an account
        </Link>
      </div>
      {loading && (
        <div className="flex justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}

export default LoginPage;
