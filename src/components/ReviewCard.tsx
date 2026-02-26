import StarRating from './StarRating';

interface Review {
  id: string;
  wallet_address: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ReviewCardProps {
  review: Review;
}

function timeAgoShort(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffMin < 5) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  return `${diffD}d ago`;
}

function truncateWallet(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">{truncateWallet(review.wallet_address)}</span>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <span className="text-xs text-gray-600">{timeAgoShort(review.created_at)}</span>
      </div>
      {review.comment && (
        <p className="text-sm text-gray-400 leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}
