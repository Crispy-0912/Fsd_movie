import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, maxRating = 5, onRate = null, size = 18, showLabel = true }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const isInteractive = typeof onRate === 'function';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '3px' }}>
        {[...Array(maxRating)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = hoverRating ? starValue <= hoverRating : starValue <= Math.round(rating);

          return (
            <button
              key={i}
              type="button"
              disabled={!isInteractive}
              onClick={() => isInteractive && onRate(starValue)}
              onMouseEnter={() => isInteractive && setHoverRating(starValue)}
              onMouseLeave={() => isInteractive && setHoverRating(0)}
              style={{
                cursor: isInteractive ? 'pointer' : 'default',
                background: 'none',
                border: 'none',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease'
              }}
              onFocus={(e) => isInteractive && (e.currentTarget.style.transform = 'scale(1.15)')}
              onBlur={(e) => isInteractive && (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Star
                size={size}
                fill={isFilled ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)'}
                color={isFilled ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)'}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fbbf24', marginLeft: '4px' }}>
          {Number(rating).toFixed(1)}/5
        </span>
      )}
    </div>
  );
};

export default RatingStars;
