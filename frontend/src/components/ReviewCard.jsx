import React from 'react';
import RatingStars from './RatingStars';
import { ThumbsUp, Trash2, Edit3, Shield } from 'lucide-react';

const ReviewCard = ({ review, currentUserId, isAdmin, onLike, onEdit, onDelete }) => {
  if (!review) return null;

  const isAuthor = currentUserId && review.user?._id === currentUserId;
  const canModify = isAuthor || isAdmin;
  const isLiked = currentUserId && review.likes?.includes(currentUserId);
  const likesCount = review.likes?.length || 0;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 24px',
        marginBottom: '16px',
        background: 'rgba(21, 27, 45, 0.65)'
      }}
    >
      {/* Header: User Info & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={review.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={review.user?.name || 'User'}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
            }}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(99, 102, 241, 0.3)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>
                {review.user?.name || 'Anonymous User'}
              </span>
              {review.user?.role === 'admin' && (
                <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  <Shield size={10} /> ADMIN
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
            </span>
          </div>
        </div>

        {/* Rating and Owner Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RatingStars rating={review.rating} maxRating={5} size={15} showLabel={false} />

          {canModify && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isAuthor && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(review)}
                  title="Edit Review"
                  style={{
                    color: 'var(--text-muted)',
                    padding: '4px 6px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <Edit3 size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(review._id)}
                  title="Delete Review"
                  style={{
                    color: '#fb7185',
                    padding: '4px 6px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(225, 29, 72, 0.1)'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Body */}
      <p style={{
        color: 'var(--text-main)',
        fontSize: '0.925rem',
        lineHeight: 1.6,
        marginBottom: '16px',
        whiteSpace: 'pre-line'
      }}>
        {review.reviewText}
      </p>

      {/* Footer: Like Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
        <button
          type="button"
          onClick={() => onLike && onLike(review._id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: isLiked ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            color: isLiked ? '#818cf8' : 'var(--text-muted)',
            border: `1px solid ${isLiked ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
            transition: 'all 0.2s ease'
          }}
        >
          <ThumbsUp size={14} fill={isLiked ? '#818cf8' : 'none'} />
          <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
