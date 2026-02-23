import type { ReactNode } from 'react';
import { Send, MessageSquare, MessagesSquare, FileCode, Briefcase, Radio, Globe } from 'lucide-react';
import StatusIndicator from './StatusIndicator';

const platformIcons: Record<string, ReactNode> = {
  telegram: <Send className="w-4 h-4" />,
  discord: <MessageSquare className="w-4 h-4" />,
  twitter: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  reddit: <MessagesSquare className="w-4 h-4" />,
  devto: <FileCode className="w-4 h-4" />,
  linkedin: <Briefcase className="w-4 h-4" />,
  farcaster: <Radio className="w-4 h-4" />,
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
      <span className="text-gray-400">{platformIcons[name] || <Globe className="w-4 h-4" />}</span>
      <span className="text-sm text-white capitalize flex-1">{name}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        enabled ? 'bg-white/10 text-gray-300' : 'bg-white/5 text-gray-500'
      }`}>{label}</span>
    </div>
  );
}
