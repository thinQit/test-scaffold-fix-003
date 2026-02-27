'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface Task {
  id: string;
  title: string;
}

interface CreateTaskResponse {
  task: Task;
}

export function NewTaskPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await api.post<CreateTaskResponse>('/api/tasks', {
      title,
      description: description || undefined,
      dueDate: dueDate || undefined,
      priority,
      status,
    });
    if (apiError || !data) {
      setError(apiError || 'Unable to create task');
      notify(apiError || 'Unable to create task', 'error');
      setLoading(false);
      return;
    }
    notify('Task created!', 'success');
    router.push(`/tasks/${data.task.id}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Create a task</h1>
        <p className="text-secondary">Fill out the details to add a task.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Task details</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} aria-label="Create task form">
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
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} aria-label="Create task">
              {loading ? 'Creating task' : 'Create task'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewTaskPage;
