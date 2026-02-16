'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  getToken,
  getStoredUser,
  clearAuth,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '@/lib/api';

function TaskForm({ initial, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState(initial?.status || 'pending');
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.slice(0, 10) : ''
  );

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ title, description, status, dueDate: dueDate || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-gray-200 bg-gray-50 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : initial ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function TaskItem({ task, onEdit, onDelete, onToggle }) {
  const isPast = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isOptimistic = task._optimistic;

  return (
    <div
      className={`flex items-start gap-3 rounded border border-gray-200 bg-white p-4 transition-all hover:bg-gray-50 ${
        isOptimistic ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => onToggle(task)}
        disabled={isOptimistic}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          task.status === 'completed'
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-gray-300 hover:border-blue-400'
        }`}
        title={task.status === 'completed' ? 'Mark pending' : 'Mark completed'}
      >
        {task.status === 'completed' && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium transition-colors ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-sm text-gray-500 truncate">{task.description}</p>
        )}
        {task.dueDate && (
          <p className={`mt-1 text-xs ${isPast ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => onEdit(task)}
          disabled={isOptimistic}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Edit"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(task)}
          disabled={isOptimistic}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Delete"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const DUE_DATE_FILTERS = [
  { value: 'all', label: 'Any Date' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due Today' },
  { value: 'week', label: 'This Week' },
  { value: 'none', label: 'No Date' },
];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function FilterBar({ statusFilter, setStatusFilter, dueDateFilter, setDueDateFilter }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status:</span>
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                statusFilter === f.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due:</span>
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
          {DUE_DATE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setDueDateFilter(f.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                dueDateFilter === f.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function filterTasks(tasks, statusFilter, dueDateFilter) {
  const now = startOfDay(new Date());
  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return tasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;

    if (dueDateFilter !== 'all') {
      if (dueDateFilter === 'none') {
        if (task.dueDate) return false;
      } else if (dueDateFilter === 'overdue') {
        if (!task.dueDate) return false;
        if (startOfDay(task.dueDate) >= now) return false;
        if (task.status === 'completed') return false;
      } else if (dueDateFilter === 'today') {
        if (!task.dueDate) return false;
        const due = startOfDay(task.dueDate);
        if (due.getTime() !== now.getTime()) return false;
      } else if (dueDateFilter === 'week') {
        if (!task.dueDate) return false;
        const due = startOfDay(task.dueDate);
        if (due < now || due >= endOfWeek) return false;
      }
    }

    return true;
  });
}

let tempIdCounter = 0;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('all');

  const filteredTasks = useMemo(
    () => filterTasks(tasks, statusFilter, dueDateFilter),
    [tasks, statusFilter, dueDateFilter]
  );

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
      setError('');
    } catch (err) {
      if (err.status === 401) {
        clearAuth();
        router.push('/login');
        return;
      }
      setError(err.message);
    } finally {
      setLoadingTasks(false);
    }
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    setUser(getStoredUser());
    loadTasks();
  }, [router, loadTasks]);

  async function handleCreate(data) {
    setSaving(true);
    const tempId = `temp-${++tempIdCounter}`;
    const optimisticTask = {
      _id: tempId,
      ...data,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    setTasks((prev) => [optimisticTask, ...prev]);
    setShowCreate(false);

    try {
      const created = await createTask(data);
      setTasks((prev) => prev.map((t) => (t._id === tempId ? created : t)));
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data) {
    const taskId = editingTask._id;
    const previousTask = tasks.find((t) => t._id === taskId);
    setSaving(true);

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, ...data, _optimistic: true } : t))
    );
    setEditingTask(null);

    try {
      const updated = await updateTask(taskId, data);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? previousTask : t))
      );
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(task) {
    if (!confirm(`Delete "${task.title}"?`)) return;

    const previousTasks = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== task._id));

    try {
      await deleteTask(task._id);
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  }

  async function handleToggle(task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const previousTask = { ...task };

    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? { ...t, status: newStatus, _optimistic: true } : t
      )
    );

    try {
      const updated = await updateTask(task._id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? previousTask : t))
      );
      setError(err.message);
    }
  }

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  const hasActiveFilters = statusFilter !== 'all' || dueDateFilter !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">Task Tracker</h1>
          <div className="flex items-center gap-3">
            {user && <span className="text-sm text-gray-500">{user.name}</span>}
            <button
              onClick={handleLogout}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Tasks ({tasks.length})
          </h2>
          {!showCreate && !editingTask && (
            <button
              onClick={() => setShowCreate(true)}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + New Task
            </button>
          )}
        </div>

        {showCreate && (
          <div className="mb-4">
            <TaskForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
              loading={saving}
            />
          </div>
        )}

        {!loadingTasks && tasks.length > 0 && (
          <FilterBar
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dueDateFilter={dueDateFilter}
            setDueDateFilter={setDueDateFilter}
          />
        )}

        {loadingTasks ? (
          <p className="py-12 text-center text-sm text-gray-400">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No tasks yet. Create one to get started!
          </p>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">No tasks match the current filters.</p>
            {hasActiveFilters && (
              <button
                onClick={() => { setStatusFilter('all'); setDueDateFilter('all'); }}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) =>
              editingTask && editingTask._id === task._id ? (
                <TaskForm
                  key={task._id}
                  initial={task}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditingTask(null)}
                  loading={saving}
                />
              ) : (
                <TaskItem
                  key={task._id}
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
