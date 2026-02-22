import StatusIndicator from './StatusIndicator';

const platformIcons: Record<string, string> = {
  telegram: '📨',
  discord: '💬',
  twitter: '🐦',
  reddit: '🔴',
  devto: '📝',
  linkedin: '💼',
  farcaster: '🟣',
};

interface Props {
  name: string;
  enabled: boolean;
  autoPublish?: boolean;
}

export default function PlatformBadge({ name, enabled, autoPublish }: Props) {
  const color = enabled ? (autoPublish ? 'green' : 'yellow') : 'gray';
  const label = enabled ? (autoPublish ? 'auto' : 'manual') : 'off';
  return (
    <div className="flex items-center gap-2 py-1.5">
      <StatusIndicator color={color} pulse={enabled} />
      <span className="text-base">{platformIcons[name] || '📡'}</span>
      <span className="text-sm text-white capitalize flex-1">{name}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        enabled ? 'bg-white/10 text-gray-300' : 'bg-white/5 text-gray-500'
      }`}>{label}</span>
    </div>
  );
}
