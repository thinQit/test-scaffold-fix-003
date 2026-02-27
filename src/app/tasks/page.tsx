'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
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
}

interface TasksResponse {
  tasks: Task[];
  meta: { total: number; page: number; pageSize: number };
}

export function TasksPage() {
  const { notify } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueAfter, setDueAfter] = useState('');
  const [dueBefore, setDueBefore] = useState('');
  const [sort, setSort] = useState('createdAt');
  const pageSize = 10;

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (dueAfter) params.set('dueAfter', dueAfter);
    if (dueBefore) params.set('dueBefore', dueBefore);
    if (sort) params.set('sort', sort);
    return params.toString();
  }, [page, pageSize, status, priority, dueAfter, dueBefore, sort]);

  useEffect(() => {
    let mounted = true;
    const loadTasks = async () => {
      setLoading(true);
      const { data, error: apiError } = await api.get<TasksResponse>(`/api/tasks?${queryString}`);
      if (!mounted) return;
      if (apiError || !data) {
        setError(apiError || 'Unable to load tasks');
        notify(apiError || 'Unable to load tasks', 'error');
      } else {
        setTasks(data.tasks);
      }
      setLoading(false);
    };
    loadTasks();
    return () => {
      mounted = false;
    };
  }, [notify, queryString]);

  const totalPages = Math.max(1, Math.ceil(tasks.length === 0 ? 1 : tasks.length / pageSize));

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-secondary">Manage and filter your tasks.</p>
        </div>
        <Link href="/tasks/new" aria-label="Create a new task">
          <Button>Create Task</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Filters</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full rounded-md border border-border px-3 py-2"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Priority</label>
              <select
                className="w-full rounded-md border border-border px-3 py-2"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Sort</label>
              <select
                className="w-full rounded-md border border-border px-3 py-2"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>
            <Input
              label="Due After"
              type="date"
              name="dueAfter"
              value={dueAfter}
              onChange={(event) => setDueAfter(event.target.value)}
            />
            <Input
              label="Due Before"
              type="date"
              name="dueBefore"
              value={dueBefore}
              onChange={(event) => setDueBefore(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Task list</h2>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-secondary">No tasks found. Try adjusting filters.</p>
          ) : (
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li key={task.id} className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0">
                  <div>
                    <Link href={`/tasks/${task.id}`} className="font-medium text-primary">
                      {task.title}
                    </Link>
                    {task.description && <p className="text-sm text-secondary">{task.description}</p>}
                    <p className="text-xs text-secondary">
                      Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'secondary'}>
                      {task.priority}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </Button>
        <span className="text-sm text-secondary">Page {page} of {totalPages}</span>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default TasksPage;
