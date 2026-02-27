'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface RegisterResponse {
  user: { id: string; email: string; name?: string; role?: string; createdAt?: string; updatedAt?: string };
  token: string;
}

export function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { notify } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await api.post<RegisterResponse>('/api/auth/register', {
      name: name || undefined,
      email,
      password,
    });
    if (apiError || !data) {
      setError(apiError || 'Unable to register');
      notify(apiError || 'Unable to register', 'error');
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
    notify('Account created!', 'success');
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="text-sm text-secondary">Start managing tasks in minutes.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} aria-label="Registration form">
            <Input
              label="Name"
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              helperText="Use at least 8 characters."
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" fullWidth loading={loading} aria-label="Register account">
              {loading ? 'Creating account' : 'Sign up'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-sm text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary">
          Log in
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
