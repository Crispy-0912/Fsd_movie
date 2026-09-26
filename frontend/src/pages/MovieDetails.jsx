import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import TrailerModal from '../components/TrailerModal';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Play,
  Bookmark,
  Calendar,
  Clock,
  Star,
  Film,
  Users,
  MessageSquare,
  ChevronLeft,
  CheckCircle
} from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user, isAdmin } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Ratings state
  const [userRating, setUserRating] = useState(0);
  const [appStats, setAppStats] = useState({ averageRating: 0, totalRatings: 0 });
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  // Watchlist state
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);

  const fetchMovieDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/movies/${id}`);
      if (res.data && res.data.success) {
        setMovie(res.data.movie);
      } else {
        setError('Movie details could not be loaded.');
      }
    } catch (err) {
      console.error('Error fetching movie:', err.message);
      setError('Failed to load movie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const res = await API.get(`/ratings/${id}`);
      if (res.data && res.data.success) {
        setAppStats({
          averageRating: res.data.averageRating || 0,
          totalRatings: res.data.totalRatings || 0
        });
        if (res.data.userRating) {
          setUserRating(res.data.userRating);
        }
      }
    } catch (err) {
      console.error('Error fetching ratings:', err.message);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await API.get(`/reviews/${id}`);
      if (res.data && res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err.message);
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkWatchlistStatus = async () => {
    try {
      const res = await API.get(`/watchlist/check/${id}`);
      if (res.data && res.data.success) {
        setIsWatchlisted(res.data.inWatchlist);
      }
    } catch (err) {
      console.error('Error checking watchlist:', err.message);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
    fetchRatingStats();
    fetchReviews();
    if (isAuthenticated) {
      checkWatchlistStatus();
    }
  }, [id, isAuthenticated]);

  const handleRateMovie = async (stars) => {
    if (!isAuthenticated) return;
    setRatingLoading(true);
    setRatingMessage('');
    try {
      const res = await API.post('/ratings', {
        movieId: Number(id),
        rating: stars
      });
      if (res.data && res.data.success) {
        setUserRating(res.data.rating);
        setAppStats({
          averageRating: res.data.averageRating,
          totalRatings: res.data.totalRatings
        });
        setRatingMessage('Your rating has been saved!');
        setTimeout(() => setRatingMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err.message);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated || !movie) return;
    setWatchlistLoading(true);
    try {
      if (isWatchlisted) {
        await API.delete(`/watchlist/${movie.id}`);
        setIsWatchlisted(false);
      } else {
        await API.post('/watchlist', {
          movieId: movie.id,
          movieTitle: movie.title,
          moviePoster: movie.poster_path,
          movieYear: movie.release_year,
          movieRating: movie.vote_average,
          movieGenres: movie.genres
        });
        setIsWatchlisted(true);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err.message);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleReviewSubmit = async (formData) => {
    try {
      if (editingReview) {
        // Update review
        const res = await API.put(`/reviews/${editingReview._id}`, {
          rating: formData.rating,
          reviewText: formData.reviewText
        });
        if (res.data && res.data.success) {
          setReviews(reviews.map((r) => (r._id === editingReview._id ? res.data.review : r)));
          setEditingReview(null);
          fetchRatingStats();
          return true;
        }
      } else {
        // Create new review
        const res = await API.post('/reviews', formData);
        if (res.data && res.data.success) {
          setReviews([res.data.review, ...reviews]);
          setUserRating(formData.rating);
          fetchRatingStats();
          return true;
        }
      }
    } catch (err) {
      console.error('Review submit failed:', err.message);
      return false;
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await API.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r._id !== reviewId));
      fetchRatingStats();
    } catch (err) {
      console.error('Failed to delete review:', err.message);
    }
  };

  const handleReviewLike = async (reviewId) => {
    if (!isAuthenticated) return;
    try {
      const res = await API.post(`/reviews/${reviewId}/like`);
      if (res.data && res.data.success) {
        setReviews(reviews.map((r) => {
          if (r._id === reviewId) {
            const currentUserId = user?.id || user?._id;
            const hasLiked = r.likes.includes(currentUserId);
            const newLikes = hasLiked
              ? r.likes.filter((uid) => uid !== currentUserId)
              : [...r.likes, currentUserId];
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
    return <LoadingSpinner text="Loading cinematic details..." />;
  }

  if (error || !movie) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <Film size={40} color="#e11d48" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{error || 'Movie Not Found'}</h2>
          <Link to="/movies" className="btn-primary">
            <ChevronLeft size={16} /> Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const formatRuntime = (mins) => {
    if (!mins) return 'N/A';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const currentUserId = user?.id || user?._id;
  const userHasReviewed = reviews.some((r) => r.user?._id === currentUserId);

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Backdrop Header */}
      <div style={{
        position: 'relative',
        minHeight: '440px',
        background: `linear-gradient(to bottom, rgba(8, 11, 18, 0.5) 0%, rgba(8, 11, 18, 0.95) 85%, var(--bg-primary) 100%), url(${movie.backdrop_path}) center/cover no-repeat`,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="container" style={{ paddingTop: '28px' }}>
          <Link
            to="/movies"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: 500,
              background: 'rgba(15, 20, 34, 0.75)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <ChevronLeft size={16} /> Back to Movies
          </Link>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="container" style={{ marginTop: '-200px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Movie Poster & Actions Column */}
          <div style={{ maxWidth: '340px', margin: '0 auto', width: '100%' }}>
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              aspectRatio: '2/3',
              background: 'var(--bg-card)'
            }}>
              <img
                src={movie.poster_path}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              >
                <Play size={18} fill="#ffffff" /> Watch Official Trailer
              </button>

              {isAuthenticated ? (
                <button
                  type="button"
                  disabled={watchlistLoading}
                  onClick={handleWatchlistToggle}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.95rem',
                    borderColor: isWatchlisted ? '#6366f1' : 'var(--border-glass)',
                    background: isWatchlisted ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <Bookmark size={18} fill={isWatchlisted ? '#6366f1' : 'none'} color={isWatchlisted ? '#6366f1' : '#ffffff'} />
                  {watchlistLoading ? 'Updating...' : isWatchlisted ? 'Saved in Watchlist' : 'Add to Watchlist'}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-secondary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                >
                  <Bookmark size={18} /> Sign in to Watchlist
                </Link>
              )}
            </div>
          </div>

          {/* Details Content Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                lineHeight: 1.15,
                marginBottom: '8px'
              }}>
                {movie.title}
              </h1>

              {movie.tagline && (
                <p style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  marginBottom: '16px'
                }}>
                  "{movie.tagline}"
                </p>
              )}

              {/* Meta Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Calendar size={15} color="#818cf8" /> {movie.release_date || 'N/A'}
                </span>

                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Clock size={15} color="#818cf8" /> {formatRuntime(movie.runtime)}
                </span>
              </div>

              {/* Genres */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {movie.genres?.map((g) => (
                  <Link
                    key={g}
                    to={`/movies?genre=${encodeURIComponent(g)}`}
                    className="badge badge-indigo"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    {g}
                  </Link>
                ))}
              </div>
            </div>

            {/* Ratings Summary Card */}
            <div className="glass-panel" style={{
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {/* TMDB Rating */}
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  TMDB Critic &amp; Public Score
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                  <Star size={24} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
                    {movie.vote_average?.toFixed(1)}
                  </span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>/ 10</span>
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Based on {movie.vote_count?.toLocaleString()} TMDB votes
                </p>
              </div>

              {/* MovieMate Application Rating */}
              <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  MovieMate Community Rating
                </span>
                <div style={{ marginTop: '8px' }}>
                  <RatingStars
                    rating={appStats.averageRating || (movie.vote_average ? (movie.vote_average / 2).toFixed(1) : 0)}
                    maxRating={5}
                    size={20}
                  />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '6px' }}>
                  {appStats.totalRatings > 0
                    ? `Based on ${appStats.totalRatings} user rating${appStats.totalRatings === 1 ? '' : 's'}`
                    : 'Be the first user to rate this movie!'}
                </p>
              </div>
            </div>

            {/* Interactive User Rating Selector (Section 8) */}
            <div className="glass-panel" style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '4px' }}>
                  {userRating > 0 ? 'Your Rating for this Movie' : 'Rate this Movie'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {isAuthenticated
                    ? userRating > 0 ? `You rated this ${userRating} out of 5 stars (click to change)` : 'Click on a star to rate from 1 to 5'
                    : 'Sign in to rate this movie'}
                </p>
              </div>

              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <RatingStars
                    rating={userRating}
                    onRate={ratingLoading ? null : handleRateMovie}
                    size={26}
                    showLabel={true}
                  />
                  {ratingLoading && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saving...</span>
                  )}
                  {ratingMessage && (
                    <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                      {ratingMessage}
                    </span>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Sign in to Rate
                </Link>
              )}
            </div>

            {/* Plot Overview */}
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#ffffff' }}>
                Overview
              </h3>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '1rem',
                lineHeight: 1.7,
                maxWidth: '780px'
              }}>
                {movie.overview}
              </p>
            </div>

            {/* Cast Section */}
            {movie.cast && movie.cast.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="#6366f1" /> Top Cast
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '16px'
                }}>
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="glass-panel"
                      style={{
                        padding: '12px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <img
                        src={actor.profile_path || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={actor.name}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                        }}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginBottom: '8px',
                          border: '2px solid rgba(99, 102, 241, 0.3)'
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.2 }}>
                        {actor.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.2 }}>
                        {actor.character}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Reviews Section (Section 9) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={22} color="#6366f1" /> Reviews ({reviews.length})
                </h3>
              </div>

              {/* Review Form or Edit Form */}
              {isAuthenticated ? (
                editingReview ? (
                  <ReviewForm
                    movieId={movie.id}
                    movieTitle={movie.title}
                    moviePoster={movie.poster_path}
                    existingReview={editingReview}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setEditingReview(null)}
                  />
                ) : userHasReviewed ? (
                  <div className="glass-panel" style={{
                    padding: '16px 20px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.25)'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} color="#818cf8" /> You have already reviewed this movie.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const myRev = reviews.find((r) => r.user?._id === currentUserId);
                        if (myRev) setEditingReview(myRev);
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    >
                      Edit Your Review
                    </button>
                  </div>
                ) : (
                  <ReviewForm
                    movieId={movie.id}
                    movieTitle={movie.title}
                    moviePoster={movie.poster_path}
                    onSubmit={handleReviewSubmit}
                  />
                )
              ) : (
                <div className="glass-panel" style={{
                  padding: '24px',
                  textAlign: 'center',
                  marginBottom: '28px',
                  background: 'rgba(15, 20, 34, 0.6)'
                }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Want to share your review and rate this movie?
                  </p>
                  <Link to="/login" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
                    Sign in to Write a Review
                  </Link>
                </div>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <LoadingSpinner text="Loading reviews..." />
              ) : reviews.length === 0 ? (
                <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No reviews yet for this movie. Be the first to share your review!
                </div>
              ) : (
                <div>
                  {reviews.map((rev) => (
                    <ReviewCard
                      key={rev._id}
                      review={rev}
                      currentUserId={currentUserId}
                      isAdmin={isAdmin}
                      onLike={handleReviewLike}
                      onEdit={(r) => setEditingReview(r)}
                      onDelete={handleReviewDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerUrl={movie.trailer_url}
        title={movie.title}
      />
    </div>
  );
};

export default MovieDetails;
