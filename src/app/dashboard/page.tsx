'use client';

import { useEffect, useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt?: string;
  completedAt?: string;
}

interface StatsResponse {
  byStatus: { todo: number; in_progress: number; done: number };
  upcomingDue: Task[];
  completedPerWeek: { weekStart: string; count: number }[];
}

export function DashboardPage() {
  const { notify } = useToast();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      setLoading(true);
      const { data, error: apiError } = await api.get<StatsResponse>('/api/tasks/stats');
      if (!mounted) return;
      if (apiError || !data) {
        setError(apiError || 'Unable to load dashboard');
        notify(apiError || 'Unable to load dashboard', 'error');
      } else {
        setStats(data);
      }
      setLoading(false);
    };
    loadStats();
    return () => {
      mounted = false;
    };
  }, [notify]);

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

  if (!stats) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-secondary">No dashboard data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-secondary">Overview of your tasks and progress.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-secondary">To Do</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.byStatus.todo}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-secondary">In Progress</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.byStatus.in_progress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-secondary">Done</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.byStatus.done}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Upcoming due tasks</h2>
            <p className="text-sm text-secondary">Due in the next 7 days.</p>
          </CardHeader>
          <CardContent>
            {stats.upcomingDue.length === 0 ? (
              <p className="text-sm text-secondary">No upcoming tasks.</p>
            ) : (
              <ul className="space-y-3">
                {stats.upcomingDue.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-secondary">
                        Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge variant={task.status === 'done' ? 'success' : 'warning'}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Completion trend</h2>
            <p className="text-sm text-secondary">Last 4 weeks</p>
          </CardHeader>
          <CardContent>
            {stats.completedPerWeek.length === 0 ? (
              <p className="text-sm text-secondary">No completion data yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.completedPerWeek.map((item) => (
                  <div key={item.weekStart} className="flex items-center justify-between">
                    <span className="text-sm">
                      Week of {new Date(item.weekStart).toLocaleDateString()}
                    </span>
                    <Badge variant="success">{item.count} done</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
