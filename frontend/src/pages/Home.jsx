import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import TrailerModal from '../components/TrailerModal';
import { Play, Info, Flame, TrendingUp, Award, Grid, ArrowRight, Film } from 'lucide-react';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [trailerOpen, setTrailerOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Request http://localhost:5000/api/movies
        const res = await API.get('/movies');
        // Parse results array from response.data.results (not response.data)
        const movieList = res.data?.results || [];
        setMovies(movieList);

        if (movieList.length > 0) {
          setHeroMovie(movieList[0]);
          setTrendingMovies(movieList);
          setPopularMovies(movieList);
          setTopRatedMovies([...movieList].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)));
        }

        // Fetch genres safely without blocking movies
        try {
          const genresRes = await API.get('/movies/genres');
          if (genresRes.data && genresRes.data.genres) {
            setGenres(genresRes.data.genres);
          }
        } catch (genreErr) {
          console.warn('Genres fallback:', genreErr.message);
        }
      } catch (err) {
        console.error('Error fetching homepage movies:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (query) => {
    if (query && query.trim()) {
      navigate(`/movies?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Cinematic Hero Section */}
      {heroMovie && (
        <section style={{
          position: 'relative',
          minHeight: '540px',
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(to right, rgba(8, 11, 18, 0.95) 20%, rgba(8, 11, 18, 0.75) 60%, rgba(8, 11, 18, 0.9) 100%), url(${heroMovie.backdrop_path}) center/cover no-repeat`,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 -120px 100px -20px var(--bg-primary)'
        }}>
          <div className="container" style={{ padding: '60px 24px', width: '100%' }}>
            <div style={{ maxWidth: '640px' }} className="animate-fade-in">
              <div className="badge badge-amber" style={{ marginBottom: '16px' }}>
                <Flame size={14} color="#f59e0b" /> #1 Featured Movie of the Week
              </div>

              <h1 style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
                lineHeight: 1.15,
                marginBottom: '16px',
                textShadow: '0 4px 16px rgba(0,0,0,0.8)'
              }}>
                {heroMovie.title}
              </h1>

              {/* Tagline / Year / Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <span className="badge badge-indigo">
                  {heroMovie.release_year || heroMovie.release_date?.split('-')[0]}
                </span>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.95rem' }}>
                  ★ {heroMovie.vote_average}/10
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                  {heroMovie.genres?.join(' • ')}
                </span>
              </div>

              <p style={{
                color: 'var(--text-muted)',
                fontSize: '1rem',
                lineHeight: 1.6,
                marginBottom: '28px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {heroMovie.overview}
              </p>

              {/* Hero Call to Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setTrailerOpen(true)}
                  className="btn-primary"
                  style={{ padding: '12px 24px' }}
                >
                  <Play size={18} fill="#ffffff" /> Watch Trailer
                </button>
                <Link
                  to={`/movies/${heroMovie.id}`}
                  className="btn-secondary"
                  style={{ padding: '12px 24px' }}
                >
                  <Info size={18} /> View Movie Details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Floating Search Bar Section */}
      <section className="container" style={{ marginTop: heroMovie ? '-30px' : '40px', position: 'relative', zIndex: 10, maxWidth: '820px' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearchSubmit}
          placeholder="Search over thousands of movies by title, director, or genre..."
        />
      </section>

      {/* Trending Movies Row */}
      <section className="container" style={{ marginTop: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={24} color="#6366f1" /> Trending Movies
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Most watched and reviewed films this week
            </p>
          </div>
          <Link to="/movies?sortBy=popularity" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#818cf8',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            Explore All <ArrowRight size={16} />
          </Link>
        </div>
        <MovieGrid movies={trendingMovies.slice(0, 4)} loading={loading} />
      </section>

      {/* Popular Movies Row */}
      <section className="container" style={{ marginTop: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flame size={24} color="#e11d48" /> Popular Hits
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Blockbusters loved by audiences worldwide
            </p>
          </div>
          <Link to="/movies?sortBy=popularity" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#818cf8',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            Explore All <ArrowRight size={16} />
          </Link>
        </div>
        <MovieGrid movies={popularMovies.slice(0, 4)} loading={loading} />
      </section>

      {/* Top Rated Movies Row */}
      <section className="container" style={{ marginTop: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={24} color="#f59e0b" /> Highest Rated Masterpieces
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Critically acclaimed films with top-tier ratings
            </p>
          </div>
          <Link to="/movies?sortBy=rating" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#818cf8',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            Explore All <ArrowRight size={16} />
          </Link>
        </div>
        <MovieGrid movies={topRatedMovies.slice(0, 4)} loading={loading} />
      </section>

      {/* Complete Indian Movies Collection (100 Movies) */}
      <section className="container" style={{ marginTop: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Film size={24} color="#6366f1" /> All Indian Movies Collection ({movies.length})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Curated collection spanning Telugu (25), Hindi (20), Tamil (20), Malayalam (15), Kannada (10) &amp; Bengali (10)
            </p>
          </div>
          <Link to="/movies" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#818cf8',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            Explore All Filters <ArrowRight size={16} />
          </Link>
        </div>
        <MovieGrid movies={movies} loading={loading} />
      </section>

      {/* Browse by Genre Section */}
      <section className="container" style={{ marginTop: '64px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Grid size={24} color="#06b6d4" /> Explore by Genre
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Find your next favorite film according to your mood
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '14px'
        }}>
          {genres.map((genre) => (
            <Link
              key={genre}
              to={`/movies?genre=${encodeURIComponent(genre)}`}
              className="glass-panel"
              style={{
                padding: '16px 20px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                transition: 'all 0.2s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                e.currentTarget.style.color = '#818cf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>

      {/* Trailer Modal */}
      {heroMovie && (
        <TrailerModal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          trailerUrl={heroMovie.trailer_url}
          title={heroMovie.title}
        />
      )}
    </div>
  );
};

export default Home;
