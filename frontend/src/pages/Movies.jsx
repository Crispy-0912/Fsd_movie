import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating (Highest first)' },
  { value: 'release_date', label: 'Release Date (Newest first)' },
  { value: 'title', label: 'Title (A-Z)' },
];

const YEAR_OPTIONS = ['All', '2024', '2023', '2022', '2021', '2020', '2010s', '2000s', 'Classics'];
const LANGUAGE_OPTIONS = ['All', 'Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada', 'Bengali'];

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('query') || '';
  const initialGenre = searchParams.get('genre') || 'All';
  const initialLanguage = searchParams.get('language') || 'All';
  const initialSort = searchParams.get('sortBy') || 'popularity';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [selectedYear, setSelectedYear] = useState('All');
  const [minRating, setMinRating] = useState('0');
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(1);

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch available genres once
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await API.get('/movies/genres');
        setGenres(['All', ...(res.data?.genres || [])]);
      } catch (err) {
        console.error('Failed to load genres:', err.message);
      }
    };
    fetchGenres();
  }, []);

  // Update URL params when query, genre, or language changes
  useEffect(() => {
    const params = {};
    if (searchQuery) params.query = searchQuery;
    if (selectedGenre && selectedGenre !== 'All') params.genre = selectedGenre;
    if (selectedLanguage && selectedLanguage !== 'All') params.language = selectedLanguage;
    if (sortBy && sortBy !== 'popularity') params.sortBy = sortBy;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedGenre, selectedLanguage, sortBy, setSearchParams]);

  // Fetch movies based on current filters and page
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let yearParam = selectedYear === 'All' ? '' : selectedYear;
        if (selectedYear === '2010s') yearParam = '201';
        if (selectedYear === '2000s') yearParam = '200';

        const res = await API.get('/movies', {
          params: {
            query: searchQuery,
            genre: selectedGenre === 'All' ? '' : selectedGenre,
            language: selectedLanguage === 'All' ? '' : selectedLanguage,
            year: yearParam,
            minRating: Number(minRating) || 0,
            sortBy,
            page: currentPage,
            limit: 100
          }
        });

        const movieList = res.data?.results || [];
        setMovies(movieList);
        setTotalPages(res.data?.total_pages || 1);
        setTotalResults(res.data?.total_results ?? movieList.length);
      } catch (err) {
        console.error('Failed to fetch movies:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchQuery, selectedGenre, selectedLanguage, selectedYear, minRating, sortBy, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedYear('All');
    setMinRating('0');
    setSortBy('popularity');
    setCurrentPage(1);
  };

  return (
    <div className="container" style={{ padding: '48px 24px', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Explore Movies</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Discover cinematic gems from around the world. Filter by genre, release year, or rating.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '680px', marginBottom: '32px' }}>
        <SearchBar
          value={searchQuery}
          onChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          placeholder="Search by movie title, overview, or keywords..."
        />
      </div>

      {/* Filter Controls Panel */}
      <div className="glass-panel" style={{
        padding: '24px',
        marginBottom: '40px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#818cf8' }}>
            <Filter size={16} /> Filters:
          </span>

          {/* Genre Select */}
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {genres.map((g) => (
              <option key={g} value={g} style={{ background: '#0f1422', color: '#fff' }}>
                Genre: {g}
              </option>
            ))}
          </select>

          {/* Language Select */}
          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang} style={{ background: '#0f1422', color: '#fff' }}>
                Language: {lang}
              </option>
            ))}
          </select>

          {/* Year Select */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y} style={{ background: '#0f1422', color: '#fff' }}>
                Year: {y}
              </option>
            ))}
          </select>

          {/* Min Rating Select */}
          <select
            value={minRating}
            onChange={(e) => {
              setMinRating(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="0" style={{ background: '#0f1422', color: '#fff' }}>Rating: Any</option>
            <option value="6" style={{ background: '#0f1422', color: '#fff' }}>Rating: 6.0+ ★</option>
            <option value="7" style={{ background: '#0f1422', color: '#fff' }}>Rating: 7.0+ ★</option>
            <option value="8" style={{ background: '#0f1422', color: '#fff' }}>Rating: 8.0+ ★</option>
          </select>
        </div>

        {/* Sort & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} color="var(--text-dim)" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: '#0f1422', color: '#fff' }}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-secondary"
            title="Reset all filters"
            style={{ padding: '10px 14px', fontSize: '0.85rem' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Results Count Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Showing <strong>{movies.length}</strong> of <strong>{totalResults}</strong> movies
        </p>
      </div>

      {/* Movies Grid */}
      <MovieGrid movies={movies} loading={loading} />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '48px'
        }}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              opacity: currentPage <= 1 ? 0.4 : 1,
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <span style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              opacity: currentPage >= totalPages ? 0.4 : 1,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Movies;
