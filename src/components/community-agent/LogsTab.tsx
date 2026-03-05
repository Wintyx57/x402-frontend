import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../config';
import { ADMIN_STORAGE_KEY as STORAGE_KEY } from '../../constants/admin';

interface Props {
  adminFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
}

interface LogEntry {
  time?: string;
  timestamp?: string;
  level?: string;
  msg?: string;
  message?: string;
  [key: string]: unknown;
}

const levelColors: Record<string, string> = {
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  debug: 'text-gray-400',
};

const levelBg: Record<string, string> = {
  info: 'bg-blue-500/10',
  warn: 'bg-yellow-500/10',
  warning: 'bg-yellow-500/10',
  error: 'bg-red-500/10',
  debug: 'bg-white/5',
};

export default function LogsTab({ adminFetch }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [levelFilter, setLevelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const fetchLogs = () => {
    setLoading(true);
    adminFetch<{ logs?: LogEntry[]; items?: LogEntry[] }>('/logs')
      .then(data => setLogs(data?.logs || data?.items || (Array.isArray(data) ? data as LogEntry[] : [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const startSSE = () => {
    const token = sessionStorage.getItem(STORAGE_KEY) || '';
    const url = `${API_URL}/admin/community-agent/stream/logs`;
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    fetch(url, {
      headers: { 'X-Admin-Token': token, Accept: 'text/event-stream' },
      signal: ctrl.signal,
    }).then(async (res) => {
      if (!res.ok || !res.body) {
        return fetchLogs();
      }
      setLoading(false);
      setLive(true);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() || '';
        for (const part of parts) {
          if (!part.trim() || part.startsWith(': ')) continue;
          const lines = part.split('\n');
          let event = 'message';
          let data = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) event = line.slice(7);
            else if (line.startsWith('data: ')) data = line.slice(6);
          }
          if (!data) continue;
          try {
            const parsed = JSON.parse(data);
            if (event === 'snapshot') {
              setLogs(parsed);
            } else if (event === 'log') {
              setLogs(prev => [...prev.slice(-199), parsed]);
            }
          } catch { /* ignore */ }
        }
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') fetchLogs();
    }).finally(() => setLive(false));
  };

  useEffect(() => {
    startSSE();
    return () => { abortRef.current?.abort(); };
  }, [startSSE]);

  const filtered = logs.filter(l => {
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    const text = (l.msg || l.message || '') as string;
    if (search && !text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters + Live badge */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 px-3 py-1.5"
        >
          <option value="all">All levels</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
          <option value="debug">Debug</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search logs..."
          className="bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 px-3 py-1.5 flex-1 min-w-[200px]"
        />
        {live ? (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        ) : (
          <button
            onClick={() => { abortRef.current?.abort(); startSSE(); }}
            className="glass-card text-sm text-gray-300 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Logs */}
      <div className="glass-card rounded-xl p-4">
        {loading ? (
          <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-6 rounded animate-shimmer" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="font-mono text-xs space-y-1 max-h-[500px] overflow-y-auto">
            {filtered.map((log, i) => {
              const level = (log.level || 'info').toLowerCase();
              const ts = log.time || log.timestamp;
              const text = (log.msg || log.message || JSON.stringify(log)) as string;
              return (
                <div key={i} className={`flex gap-2 py-1 px-2 rounded ${levelBg[level] || 'bg-white/5'}`}>
                  <span className="text-gray-500 shrink-0">
                    {ts ? new Date(ts as string).toLocaleTimeString() : '—'}
                  </span>
                  <span className={`uppercase font-semibold shrink-0 w-12 ${levelColors[level] || 'text-gray-400'}`}>
                    [{level}]
                  </span>
                  <span className="text-gray-300 break-all">{text}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No logs available</p>
        )}
      </div>
    </div>
  );
}
