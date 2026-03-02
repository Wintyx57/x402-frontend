import { useState, useEffect } from 'react';
import StatusIndicator from './StatusIndicator';

interface Props {
  adminFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
}

interface HistoryEntry {
  id?: string | number;
  platform: string;
  status: string;
  content?: string;
  timestamp?: string;
  publishedAt?: string;
  error?: string;
}

export default function HistoryTab({ adminFetch }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    adminFetch<{ history?: HistoryEntry[]; items?: HistoryEntry[] }>('/history')
      .then(data => setHistory(data?.history || data?.items || (Array.isArray(data) ? data as HistoryEntry[] : [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [adminFetch]);

  const platforms = [...new Set(history.map(h => h.platform))];

  const filtered = history.filter(h => {
    if (platformFilter !== 'all' && h.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={platformFilter}
          onChange={e => setPlatformFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 px-3 py-1.5"
        >
          <option value="all">All platforms</option>
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 px-3 py-1.5"
        >
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* History List */}
      <div className="glass-card rounded-xl p-5">
        {loading ? (
          <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded animate-shimmer" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((entry, i) => {
              const ts = entry.timestamp || entry.publishedAt;
              const isSuccess = entry.status === 'published' || entry.status === 'success';
              return (
                <div key={entry.id || i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono">
                      {ts ? new Date(ts).toLocaleString() : '—'}
                    </span>
                    <span className="text-sm text-white capitalize">{entry.platform}</span>
                    <StatusIndicator color={isSuccess ? 'green' : 'red'} />
                    <span className={`text-xs ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
                      {entry.status}
                    </span>
                  </div>
                  {entry.content && (
                    <p className="text-sm text-gray-400 line-clamp-2 ml-[5.5rem]">{entry.content}</p>
                  )}
                  {entry.error && (
                    <p className="text-xs text-red-400 ml-[5.5rem]">{entry.error}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No publication history</p>
        )}
      </div>
    </div>
  );
}
