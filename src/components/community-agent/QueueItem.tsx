import StatusIndicator from './StatusIndicator';

interface QueueEntry {
  id: string | number;
  platform: string;
  content: string;
  status: string;
  scheduledAt?: string;
  error?: string;
  retryCount?: number;
}

interface Props {
  item: QueueEntry;
  onApprove?: (id: string | number) => void;
  onRetry?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

const statusColor = (s: string) => {
  if (s === 'pending') return 'yellow';
  if (s === 'published' || s === 'approved') return 'green';
  if (s === 'failed') return 'red';
  return 'gray';
};

export default function QueueItem({ item, onApprove, onRetry, onDelete }: Props) {
  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-start gap-3">
        <StatusIndicator color={statusColor(item.status)} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white capitalize">{item.platform}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              item.status === 'failed' ? 'bg-red-500/10 text-red-400' :
              item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-emerald-500/10 text-emerald-400'
            }`}>{item.status}{item.retryCount ? ` (retry ${item.retryCount})` : ''}</span>
          </div>
          <p className="text-sm text-gray-400 truncate">{item.content}</p>
          {item.scheduledAt && (
            <p className="text-xs text-gray-500 mt-1">{new Date(item.scheduledAt).toLocaleString()}</p>
          )}
          {item.error && <p className="text-xs text-red-400 mt-1">{item.error}</p>}
        </div>
        <div className="flex gap-1.5 shrink-0">
          {item.status === 'pending' && onApprove && (
            <button onClick={() => onApprove(item.id)} className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
              Approve
            </button>
          )}
          {item.status === 'failed' && onRetry && (
            <button onClick={() => onRetry(item.id)} className="text-xs px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20">
              Retry
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(item.id)} className="text-xs px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
