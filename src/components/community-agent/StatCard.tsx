interface Props {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  loading?: boolean;
}

export default function StatCard({ label, value, icon, color = 'text-[#FF9900]', loading }: Props) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="text-lg mb-1">{icon}</div>
      {loading ? (
        <div className="h-8 w-16 mx-auto rounded animate-shimmer" />
      ) : (
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      )}
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
