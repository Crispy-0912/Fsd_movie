import React, { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import { Send, AlertCircle, X } from 'lucide-react';

const ReviewForm = ({ movieId, movieTitle, moviePoster, existingReview, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 5);
  const [reviewText, setReviewText] = useState(existingReview ? existingReview.reviewText : '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.reviewText);
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rating || rating < 1) {
      setError('Please select a star rating (1–5).');
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setError('Review must be at least 5 characters long.');
      return;
    }

    if (reviewText.trim().length > 1000) {
      setError('Review cannot exceed 1000 characters.');
      return;
    }

    setSubmitting(true);
    const success = await onSubmit({
      movieId,
      movieTitle,
      moviePoster,
      rating,
      reviewText: reviewText.trim()
    });
    setSubmitting(false);

    if (success && !existingReview) {
      setReviewText('');
      setRating(5);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel"
      style={{
        padding: '24px',
        marginBottom: '28px',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        background: 'rgba(15, 20, 34, 0.85)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '1.1rem', color: '#ffffff' }}>
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </h4>
        {existingReview && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
          >
            <X size={16} /> Cancel Edit
          </button>
        )}
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(225, 29, 72, 0.12)',
          border: '1px solid rgba(225, 29, 72, 0.3)',
          color: '#fb7185',
          fontSize: '0.85rem',
          marginBottom: '16px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Star Rating Picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Your Rating:</span>
        <RatingStars
          rating={rating}
          maxRating={5}
          onRate={(stars) => setRating(stars)}
          size={24}
          showLabel={true}
        />
      </div>

      {/* Textarea */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <textarea
          required
          rows={4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your thoughts on the movie, acting, visuals, or plot..."
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-md)',
            color: '#ffffff',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            minHeight: '100px'
          }}
        />
        <div style={{
          textAlign: 'right',
          fontSize: '0.75rem',
          color: reviewText.length > 950 ? '#fb7185' : 'var(--text-dim)',
          marginTop: '4px'
        }}>
          {reviewText.length}/1000 characters
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
          style={{ padding: '10px 22px', fontSize: '0.9rem' }}
        >
          <Send size={15} /> {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Post Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
