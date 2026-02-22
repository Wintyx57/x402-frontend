const colors: Record<string, string> = {
  green: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
  yellow: 'bg-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  red: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]',
  gray: 'bg-gray-500',
};

interface Props {
  color: 'green' | 'yellow' | 'red' | 'gray';
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export default function StatusIndicator({ color, pulse = false, size = 'sm' }: Props) {
  const sz = size === 'md' ? 'w-3 h-3' : 'w-2 h-2';
  return (
    <span className="relative inline-flex">
      {pulse && color !== 'gray' && (
        <span className={`absolute inline-flex h-full w-full rounded-full ${colors[color]} opacity-50 animate-ping`} />
      )}
      <span className={`relative inline-flex rounded-full ${sz} ${colors[color]}`} />
    </span>
  );
}
