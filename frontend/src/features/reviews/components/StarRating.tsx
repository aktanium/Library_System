import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  showCount?: number;
}

const sizeClasses: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

const Star = ({ filled, halfFilled = false, className }: { filled: boolean; halfFilled?: boolean; className: string }) => {
  if (halfFilled) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id="halfStarGradient">
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="transparent" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          fill="url(#halfStarGradient)"
          stroke="#f59e0b"
          strokeWidth={1.5}
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    );
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? '#f59e0b' : 'none'}
      stroke={filled ? '#f59e0b' : '#cbd5e1'}
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
};

const StarRating = ({
  value,
  onChange,
  size = 'md',
  readOnly = false,
  showCount,
}: StarRatingProps) => {
  const [hover, setHover] = useState<number | null>(null);
  const sizeClass = sizeClasses[size];
  const displayValue = hover ?? value;

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-1">
      <div className="inline-flex items-center gap-0.5">
        {stars.map((n) => {
          const filled = displayValue >= n;
          // Half-star when read-only and value is fractional (e.g. avg = 3.5)
          const halfFilled = readOnly && !filled && displayValue >= n - 0.5;

          if (readOnly) {
            return (
              <span key={n} className="inline-flex">
                <Star filled={filled} halfFilled={halfFilled} className={sizeClass} />
              </span>
            );
          }

          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange?.(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
              className="p-0.5 rounded transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <Star filled={filled} className={sizeClass} />
            </button>
          );
        })}
      </div>
      {typeof showCount === 'number' && (
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
          ({showCount} {showCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
