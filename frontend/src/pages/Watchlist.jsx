import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bookmark, Star, Calendar, Trash2, ExternalLink, ArrowRight } from 'lucide-react';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWatchlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/watchlist');
      if (res.data && res.data.success) {
        setWatchlist(res.data.watchlist || []);
      }
    } catch (err) {
      console.error('Failed to load watchlist:', err.message);
      setError('Could not load watchlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (movieId) => {
    try {
      await API.delete(`/watchlist/${movieId}`);
      setWatchlist(watchlist.filter((item) => item.movieId !== movieId));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your personal watchlist..." />;
  }

  return (
    <div className="container" style={{ padding: '48px 24px', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bookmark size={28} color="#6366f1" fill="#6366f1" /> My Watchlist
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            Movies saved to watch later ({watchlist.length} {watchlist.length === 1 ? 'film' : 'films'})
          </p>
        </div>

        <Link to="/movies" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
          Explore More Movies <ArrowRight size={16} />
        </Link>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {watchlist.length === 0 ? (
        /* Empty State */
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
            <Bookmark size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem' }}>Your Watchlist is Empty</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '0.95rem', lineHeight: 1.5 }}>
            You haven't saved any movies to your watchlist yet. Browse our trending catalog and bookmark titles you want to watch.
          </p>
          <Link to="/movies" className="btn-primary" style={{ marginTop: '8px' }}>
            Discover Movies
          </Link>
        </div>
      ) : (
        /* Watchlist Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {watchlist.map((item) => (
            <div
              key={item._id || item.movieId}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-glass)';
              }}
            >
              {/* Poster Header */}
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#0a0d14' }}>
                <img
                  src={item.moviePoster?.startsWith('http') ? item.moviePoster : `https://image.tmdb.org/t/p/w500${item.moviePoster}`}
                  alt={item.movieTitle}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(8, 11, 18, 0.8)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#fbbf24'
                }}>
                  <Star size={12} fill="#fbbf24" color="#fbbf24" />
                  <span>{item.movieRating ? Number(item.movieRating).toFixed(1) : 'NR'}</span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3
                  title={item.movieTitle}
                  style={{
                    fontSize: '1.1rem',
                    marginBottom: '6px',
                    color: '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.movieTitle}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '16px' }}>
                  <Calendar size={12} />
                  <span>{item.movieYear || 'N/A'}</span>
                  {item.movieGenres && item.movieGenres.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{item.movieGenres.slice(0, 2).join(', ')}</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: 'auto',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '14px'
                }}>
                  <Link
                    to={`/movies/${item.movieId}`}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    <ExternalLink size={14} /> Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.movieId)}
                    className="btn-danger"
                    title="Remove from watchlist"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
