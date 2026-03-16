import { lazy, Suspense } from 'react';
import { TrailsProvider } from '0xtrails';

const TRAILS_API_KEY = import.meta.env.VITE_TRAILS_API_KEY || '';

const BridgeCard = lazy(() => import('./BridgeCard'));

function BridgeCardSkeleton() {
  return (
    <div className="max-w-lg mx-auto glass-card rounded-2xl p-5 space-y-3 animate-pulse" aria-busy="true">
      <div className="h-4 w-32 animate-shimmer rounded" />
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-8 w-20 animate-shimmer rounded-lg" />
        ))}
      </div>
      <div className="h-px bg-white/10" />
      <div className="h-4 w-16 animate-shimmer rounded" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-14 flex-1 animate-shimmer rounded-xl" />
        ))}
      </div>
      <div className="h-12 animate-shimmer rounded-xl" />
    </div>
  );
}

export default function BridgeWidget() {
  return (
    <TrailsProvider config={{ trailsApiKey: TRAILS_API_KEY }}>
      <Suspense fallback={<BridgeCardSkeleton />}>
        <BridgeCard />
      </Suspense>
    </TrailsProvider>
  );
}
