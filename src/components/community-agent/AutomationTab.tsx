import { useState, useEffect } from 'react';
import StatusIndicator from './StatusIndicator';
import QueueItem from './QueueItem';

interface Props {
  adminFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
}

interface SchedulerData {
  running?: boolean;
  interval?: number;
  lastRun?: string;
  nextRun?: string;
  strategy?: string;
}

interface QueueEntry {
  id: string | number;
  platform: string;
  content: string;
  status: string;
  scheduledAt?: string;
  error?: string;
  retryCount?: number;
}

export default function AutomationTab({ adminFetch }: Props) {
  const [scheduler, setScheduler] = useState<SchedulerData | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [s, q] = await Promise.all([
        adminFetch<SchedulerData>('/scheduler').catch(() => null),
        adminFetch<{ queue?: QueueEntry[]; items?: QueueEntry[] } | null>('/queue').catch(() => null),
      ]);
      setScheduler(s);
      const qData = q as { queue?: QueueEntry[]; items?: QueueEntry[] } | null;
      setQueue(qData?.queue || qData?.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const schedulerAction = async (action: string) => {
    setActionLoading(action);
    try {
      await adminFetch('/scheduler', { method: 'POST', body: JSON.stringify({ action }) });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const approveItem = async (id: string | number) => {
    await adminFetch(`/queue/${id}/approve`, { method: 'POST' });
    await fetchData();
  };

  const retryItem = async (id: string | number) => {
    await adminFetch(`/queue/${id}/retry`, { method: 'POST' });
    await fetchData();
  };

  const deleteItem = async (id: string | number) => {
    await adminFetch(`/queue/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  const filtered = filter === 'all' ? queue : queue.filter(q => q.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Scheduler Control */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <StatusIndicator color={scheduler?.running ? 'green' : 'gray'} pulse={scheduler?.running} size="md" />
          Scheduler Control
        </h3>
        {loading ? (
          <div className="h-20 rounded animate-shimmer" />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-500">Status</span>
                <p className="text-white">{scheduler?.running ? 'Running' : 'Stopped'}</p>
              </div>
              <div>
                <span className="text-gray-500">Interval</span>
                <p className="text-white">{scheduler?.interval ? `${scheduler.interval}s` : '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Last run</span>
                <p className="text-white">{scheduler?.lastRun ? new Date(scheduler.lastRun).toLocaleTimeString() : '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Next run</span>
                <p className="text-white">{scheduler?.nextRun ? new Date(scheduler.nextRun).toLocaleTimeString() : '—'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => schedulerAction('start')}
                disabled={!!actionLoading || scheduler?.running}
                className="gradient-btn text-white text-sm px-4 py-2 rounded-lg disabled:opacity-40"
              >
                {actionLoading === 'start' ? 'Starting...' : 'Start'}
              </button>
              <button
                onClick={() => schedulerAction('stop')}
                disabled={!!actionLoading || !scheduler?.running}
                className="glass-card text-white text-sm px-4 py-2 rounded-lg hover:bg-white/10 disabled:opacity-40"
              >
                {actionLoading === 'stop' ? 'Stopping...' : 'Stop'}
              </button>
              <button
                onClick={() => schedulerAction('run-now')}
                disabled={!!actionLoading}
                className="glass-card text-[#FF9900] text-sm px-4 py-2 rounded-lg hover:bg-white/10 disabled:opacity-40"
              >
                {actionLoading === 'run-now' ? 'Running...' : 'Run Now'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content Queue */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Content Queue</h3>
          <div className="flex gap-1">
            {['all', 'pending', 'published', 'failed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full capitalize ${
                  filter === f ? 'bg-[#FF9900]/20 text-[#FF9900]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >{f}</button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded animate-shimmer" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(item => (
              <QueueItem key={item.id} item={item} onApprove={approveItem} onRetry={retryItem} onDelete={deleteItem} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">Queue is empty</p>
        )}
      </div>
    </div>
  );
}
