export default function Skeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`animate-shimmer rounded-lg ${className}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 space-y-3" aria-hidden="true">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg animate-shimmer shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-shimmer rounded" />
          <div className="h-3 w-1/3 animate-shimmer rounded" />
        </div>
        <div className="h-6 w-14 animate-shimmer rounded-lg shrink-0" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full animate-shimmer rounded" />
        <div className="h-3 w-2/3 animate-shimmer rounded" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-14 animate-shimmer rounded-lg" />
        <div className="h-5 w-14 animate-shimmer rounded-lg" />
        <div className="h-5 w-14 animate-shimmer rounded-lg" />
      </div>
      <div className="border-t border-white/5 pt-2 flex justify-between">
        <div className="h-3 w-24 animate-shimmer rounded" />
        <div className="h-3 w-16 animate-shimmer rounded" />
      </div>
    </div>
  );
}
