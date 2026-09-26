import React from 'react';
import MovieCard from './MovieCard';
import { Film } from 'lucide-react';

const MovieGrid = ({ movies = [], loading = false, onWatchlistToggle, watchlistIds = [] }) => {
  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: '24px'
      }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '2/3',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(90deg, #151b2d 25%, #1c243c 50%, #151b2d 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          />
        ))}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="glass-panel" style={{
        padding: '60px 24px',
        textAlign: 'center',
        margin: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Film size={32} color="var(--text-dim)" />
        </div>
        <h3 style={{ fontSize: '1.25rem' }}>No Movies Found</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '0.95rem' }}>
          We couldn't find any movies matching your current search or filter criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
      gap: '24px'
    }}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          id={movie.id}
          title={movie.title}
          poster_path={movie.poster_path}
          overview={movie.overview}
          vote_average={movie.vote_average}
          release_year={movie.release_year}
          language={movie.language}
          onWatchlistToggle={onWatchlistToggle}
          isWatchlisted={watchlistIds.includes(movie.id)}
        />
      ))}
    </div>
  );
};

export default MovieGrid;
