import { useState, useId } from 'react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const SIZE_MAP = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

export default function StarRating({ rating, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const uniqueId = useId();

  const displayed = interactive ? (hover || rating) : rating;

  return (
    <div
      className="flex items-center gap-0.5"
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? `Rate: ${displayed} out of 5 stars` : `${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.floor(displayed);
        const partial = !filled && star - 1 < displayed && displayed < star;
        const sizeClass = SIZE_MAP[size];

        return (
          <button
            key={star}
            type="button"
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            onMouseEnter={interactive ? () => setHover(star) : undefined}
            onMouseLeave={interactive ? () => setHover(0) : undefined}
            disabled={!interactive}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            className={`relative ${sizeClass} shrink-0 ${
              interactive ? 'cursor-pointer' : 'cursor-default pointer-events-none'
            } bg-transparent border-none p-0 transition-transform duration-100 ${
              interactive ? 'hover:scale-110' : ''
            }`}
          >
            <svg viewBox="0 0 24 24" className={`${sizeClass}`}>
              {/* Background (empty) star */}
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="none"
                stroke="#4B5563"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Filled portion */}
              {(filled || partial) && (
                <clipPath id={`clip-star-${uniqueId}-${star}`}>
                  <rect x="0" y="0" width={partial ? `${(displayed - (star - 1)) * 24}` : '24'} height="24" />
                </clipPath>
              )}
              {(filled || partial) && (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#FBBF24"
                  stroke="#FBBF24"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  clipPath={partial ? `url(#clip-star-${uniqueId}-${star})` : undefined}
                />
              )}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
