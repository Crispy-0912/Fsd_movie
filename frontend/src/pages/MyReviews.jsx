import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Film, ArrowRight } from 'lucide-react';

const MyReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const res = await API.get('/reviews/my/all');
      if (res.data && res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load my reviews:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const handleUpdate = async (formData) => {
    try {
      const res = await API.put(`/reviews/${editingReview._id}`, {
        rating: formData.rating,
        reviewText: formData.reviewText
      });
      if (res.data && res.data.success) {
        setReviews(reviews.map(r => r._id === editingReview._id ? res.data.review : r));
        setEditingReview(null);
        return true;
      }
    } catch (err) {
      console.error('Failed to update review:', err.message);
      return false;
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await API.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err.message);
    }
  };

  const handleLike = async (reviewId) => {
    try {
      const res = await API.post(`/reviews/${reviewId}/like`);
      if (res.data && res.data.success) {
        setReviews(reviews.map(r => {
          if (r._id === reviewId) {
            const hasLiked = r.likes.includes(user?.id || user?._id);
            const newLikes = hasLiked
              ? r.likes.filter(id => id !== (user?.id || user?._id))
              : [...r.likes, user?.id || user?._id];
            return { ...r, likes: newLikes };
          }
          return r;
        }));
      }
    } catch (err) {
      console.error('Failed to like review:', err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your reviews..." />;
  }

  return (
    <div className="container" style={{ padding: '48px 24px', minHeight: '80vh', maxWidth: '880px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageSquare size={28} color="#6366f1" /> My Reviews
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            History of movie reviews you have written ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </p>
        </div>

        <Link to="/movies" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
          Explore More Movies <ArrowRight size={16} />
        </Link>
      </div>

      {editingReview && (
        <div style={{ marginBottom: '32px' }}>
          <ReviewForm
            movieId={editingReview.movieId}
            movieTitle={editingReview.movieTitle}
            moviePoster={editingReview.moviePoster}
            existingReview={editingReview}
            onSubmit={handleUpdate}
            onCancel={() => setEditingReview(null)}
          />
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '64px 24px',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '40px auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8'
          }}>
            <MessageSquare size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem' }}>No Reviews Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '0.95rem', lineHeight: 1.5 }}>
            You haven't written any movie reviews yet. Head to any movie details page and share your thoughts!
          </p>
          <Link to="/movies" className="btn-primary" style={{ marginTop: '8px' }}>
            Find a Movie to Review
          </Link>
        </div>
      ) : (
        <div>
          {reviews.map((rev) => (
            <div key={rev._id} style={{ marginBottom: '20px' }}>
              {rev.movieTitle && (
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Film size={16} color="#818cf8" />
                  <Link to={`/movies/${rev.movieId}`} style={{ fontWeight: 600, color: '#818cf8', fontSize: '0.95rem' }}>
                    {rev.movieTitle}
                  </Link>
                </div>
              )}
              <ReviewCard
                review={rev}
                currentUserId={user?.id || user?._id}
                isAdmin={user?.role === 'admin'}
                onLike={handleLike}
                onEdit={(r) => setEditingReview(r)}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;
