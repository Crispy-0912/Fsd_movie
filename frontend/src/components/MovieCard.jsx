import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Calendar } from 'lucide-react';

const MovieCard = (props) => {
  // Support both <MovieCard movie={movie} /> and direct props <MovieCard id={...} title={...} />
  const movie = props.movie || props;
  if (!movie || (!movie.id && !movie.title)) return null;

  const {
    id,
    title,
    poster_path,
    overview,
    vote_average,
    release_year,
    release_date,
    genres,
    language
  } = movie;

  const onWatchlistToggle = props.onWatchlistToggle || movie.onWatchlistToggle;
  const isWatchlisted = props.isWatchlisted ?? movie.isWatchlisted ?? false;

  const poster = poster_path || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
  const displayYear = release_year || (release_date ? release_date.split('-')[0] : 'N/A');
  const displayRating = vote_average ? Number(vote_average).toFixed(1) : 'NR';

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.6), 0 0 16px rgba(99, 102, 241, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Poster Image & Badges */}
      <Link to={`/movies/${id}`} style={{ position: 'relative', display: 'block', aspectRatio: '2/3', overflow: 'hidden' }}>
        <img
          src={poster}
          alt={title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(15, 20, 34, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#fbbf24'
        }}>
          <Star size={13} fill="#fbbf24" color="#fbbf24" />
          <span>{displayRating}</span>
        </div>

        {/* Watchlist Quick Button */}
        {onWatchlistToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWatchlistToggle(movie);
            }}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isWatchlisted ? '#6366f1' : 'rgba(15, 20, 34, 0.85)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${isWatchlisted ? '#6366f1' : 'rgba(255, 255, 255, 0.15)'}`,
              color: '#ffffff',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
            }}
          >
            <Bookmark size={15} fill={isWatchlisted ? '#ffffff' : 'none'} />
          </button>
        )}
      </Link>

      {/* Content Details */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/movies/${id}`}>
          <h4
            title={title}
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '6px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {title}
          </h4>
        </Link>

        {overview && (
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4
          }}>
            {overview}
          </p>
        )}

        {/* Meta info: Year and Genres */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text-dim)',
          fontSize: '0.8rem',
          marginTop: 'auto',
          paddingTop: '6px'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            {displayYear}{language ? ` • ${language}` : ''}
          </span>

          <span style={{
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--text-muted)'
          }}>
            {genres && genres.length > 0 ? genres.slice(0, 2).join(', ') : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
