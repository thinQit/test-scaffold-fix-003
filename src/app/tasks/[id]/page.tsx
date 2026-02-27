'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  updatedAt?: string;
  completedAt?: string;
}

interface TaskResponse {
  task: Task;
}

export function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { notify } = useToast();
  const taskId = params?.id as string;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');

  useEffect(() => {
    let mounted = true;
    const loadTask = async () => {
      setLoading(true);
      const { data, error: apiError } = await api.get<TaskResponse>(`/api/tasks/${taskId}`);
      if (!mounted) return;
      if (apiError || !data) {
        setError(apiError || 'Unable to load task');
        notify(apiError || 'Unable to load task', 'error');
      } else {
        setTask(data.task);
        setTitle(data.task.title);
        setDescription(data.task.description || '');
        setDueDate(data.task.dueDate ? data.task.dueDate.slice(0, 10) : '');
        setPriority(data.task.priority);
        setStatus(data.task.status);
      }
      setLoading(false);
    };
    if (taskId) {
      loadTask();
    }
    return () => {
      mounted = false;
    };
  }, [taskId, notify]);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const { data, error: apiError } = await api.put<TaskResponse>(`/api/tasks/${taskId}`, {
      title,
      description: description || undefined,
      dueDate: dueDate || undefined,
      priority,
      status,
    });
    if (apiError || !data) {
      notify(apiError || 'Unable to update task', 'error');
      setSaving(false);
      return;
    }
    setTask(data.task);
    notify('Task updated', 'success');
    setSaving(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;
    setSaving(true);
    const { error: apiError } = await api.delete<{ success: boolean }>(`/api/tasks/${taskId}`);
    if (apiError) {
      notify(apiError || 'Unable to delete task', 'error');
      setSaving(false);
      return;
    }
    notify('Task deleted', 'success');
    router.push('/tasks');
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

  if (!task) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-secondary">Task not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Task detail</h1>
          <p className="text-secondary">Update task information and status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
            {task.status.replace('_', ' ')}
          </Badge>
          <Badge variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'secondary'}>
            {task.priority}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Edit task</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleUpdate} aria-label="Update task form">
            <Input
              label="Title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full rounded-md border border-border px-3 py-2"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            </div>
            <Input
              label="Due Date"
              type="date"
              name="dueDate"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={saving} aria-label="Save task changes">
                {saving ? 'Saving' : 'Save changes'}
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>
                Delete task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default TaskDetailPage;
