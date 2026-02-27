'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface ProfileResponse {
  user: { id: string; email: string; name?: string; createdAt?: string };
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const [profile, setProfile] = useState<ProfileResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setLoading(true);
      const { data, error: apiError } = await api.get<ProfileResponse>('/api/auth/me');
      if (!mounted) return;
      if (apiError || !data) {
        setError(apiError || 'Unable to load profile');
        notify(apiError || 'Unable to load profile', 'error');
      } else {
        setProfile(data.user);
      }
      setLoading(false);
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [notify]);

  const handleLogout = async () => {
    await api.post<{ success: boolean }>('/api/auth/logout', {});
    logout();
    notify('Logged out', 'success');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-secondary">Profile not available.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-secondary">Manage your account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Account details</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-secondary">Name</p>
              <p className="font-medium">{profile.name || user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-secondary">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-secondary">Member since</p>
              <p className="font-medium">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={handleLogout} aria-label="Log out">
        Log out
      </Button>
    </div>
  );
}

export default ProfilePage;
