const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Curated 100 UNIQUE Indian Movies dataset
const CURATED_MOVIES = require('../data/moviesData');


const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'Thriller', 'War', 'Western'
];

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
  }

  hasValidKey() {
    return !!this.apiKey && this.apiKey.trim().length > 10;
  }

  formatMovie(item) {
    return {
      id: item.id,
      title: item.title,
      tagline: item.tagline || '',
      overview: item.overview,
      poster_path: item.poster_path ? (item.poster_path.startsWith('http') ? item.poster_path : `${IMAGE_BASE_URL}/w500${item.poster_path}`) : null,
      backdrop_path: item.backdrop_path ? (item.backdrop_path.startsWith('http') ? item.backdrop_path : `${IMAGE_BASE_URL}/original${item.backdrop_path}`) : null,
      release_date: item.release_date,
      release_year: item.release_year || (item.release_date ? item.release_date.split('-')[0] : 'N/A'),
      genres: Array.isArray(item.genres)
        ? item.genres.map(g => (typeof g === 'string' ? g : g.name))
        : (item.genre_ids ? item.genre_ids.map(id => this.mapGenreIdToName(id)) : []),
      vote_average: Number((item.vote_average || 0).toFixed(1)),
      vote_count: item.vote_count || 0,
      runtime: item.runtime || 120,
      popularity: item.popularity || 0,
      trailer_url: item.trailer_url || `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' trailer')}`,
      cast: item.cast || [],
      language: item.language || 'Hindi'
    };
  }

  mapGenreIdToName(id) {
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    return genreMap[id] || 'General';
  }

  async getTrendingMovies(page = 1) {
    if (this.hasValidKey()) {
      try {
        const res = await axios.get(`${TMDB_BASE_URL}/trending/movie/week?api_key=${this.apiKey}&page=${page}`, { timeout: 4000 });
        if (res.data && res.data.results) {
          return {
            page: res.data.page,
            total_pages: res.data.total_pages,
            total_results: res.data.total_results,
            results: res.data.results.map(m => this.formatMovie(m))
          };
        }
      } catch (err) {
        console.warn('TMDB live call fallback to curated data:', err.message);
      }
    }

    // Curated fallback
    const sorted = [...CURATED_MOVIES].sort((a, b) => b.popularity - a.popularity);
    return {
      page: 1,
      total_pages: 1,
      total_results: sorted.length,
      results: sorted.map(m => this.formatMovie(m))
    };
  }

  async getPopularMovies(page = 1) {
    if (this.hasValidKey()) {
      try {
        const res = await axios.get(`${TMDB_BASE_URL}/movie/popular?api_key=${this.apiKey}&page=${page}`, { timeout: 4000 });
        if (res.data && res.data.results) {
          return {
            page: res.data.page,
            total_pages: res.data.total_pages,
            total_results: res.data.total_results,
            results: res.data.results.map(m => this.formatMovie(m))
          };
        }
      } catch (err) {
        console.warn('TMDB live call fallback to curated data:', err.message);
      }
    }

    const sorted = [...CURATED_MOVIES].sort((a, b) => b.vote_count - a.vote_count);
    return {
      page: 1,
      total_pages: 1,
      total_results: sorted.length,
      results: sorted.map(m => this.formatMovie(m))
    };
  }

  async getTopRatedMovies(page = 1) {
    if (this.hasValidKey()) {
      try {
        const res = await axios.get(`${TMDB_BASE_URL}/movie/top_rated?api_key=${this.apiKey}&page=${page}`, { timeout: 4000 });
        if (res.data && res.data.results) {
          return {
            page: res.data.page,
            total_pages: res.data.total_pages,
            total_results: res.data.total_results,
            results: res.data.results.map(m => this.formatMovie(m))
          };
        }
      } catch (err) {
        console.warn('TMDB live call fallback to curated data:', err.message);
      }
    }

    const sorted = [...CURATED_MOVIES].sort((a, b) => b.vote_average - a.vote_average);
    return {
      page: 1,
      total_pages: 1,
      total_results: sorted.length,
      results: sorted.map(m => this.formatMovie(m))
    };
  }

  async getMovieDetails(id) {
    const movieId = Number(id);

    if (this.hasValidKey()) {
      try {
        const [movieRes, creditsRes, videosRes] = await Promise.all([
          axios.get(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${this.apiKey}`, { timeout: 4000 }),
          axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${this.apiKey}`, { timeout: 4000 }),
          axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${this.apiKey}`, { timeout: 4000 })
        ]);

        const movie = movieRes.data;
        const cast = (creditsRes.data?.cast || []).slice(0, 10).map(c => ({
          name: c.name,
          character: c.character,
          profile_path: c.profile_path ? `${IMAGE_BASE_URL}/w185${c.profile_path}` : null
        }));

        let trailerUrl = null;
        const videos = videosRes.data?.results || [];
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];
        if (trailer) {
          trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
        }

        const formatted = this.formatMovie({
          ...movie,
          cast,
          trailer_url: trailerUrl
        });
        return formatted;
      } catch (err) {
        console.warn(`TMDB live call for movie ${movieId} fallback to curated:`, err.message);
      }
    }

    // Curated fallback
    const found = CURATED_MOVIES.find(m => m.id === movieId);
    if (found) {
      return this.formatMovie(found);
    }

    // Default movie structure if ID is unknown
    return {
      id: movieId,
      title: `Movie #${movieId}`,
      tagline: 'A cinematic discovery on MovieMate.',
      overview: 'Details for this movie are available through the TMDB database.',
      poster_path: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80',
      backdrop_path: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
      release_date: '2024-01-01',
      release_year: '2024',
      genres: ['Action', 'Drama'],
      vote_average: 7.5,
      vote_count: 1000,
      runtime: 120,
      popularity: 80,
      trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      cast: []
    };
  }

  async searchMovies({ query = '', genre = '', language = '', year = '', minRating = 0, sortBy = 'popularity', page = 1, limit = 12 }) {
    if (this.hasValidKey()) {
      try {
        let endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${this.apiKey}&page=${page}`;
        if (query.trim()) {
          endpoint = `${TMDB_BASE_URL}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
        } else {
          if (year) endpoint += `&primary_release_year=${year}`;
          if (minRating) endpoint += `&vote_average.gte=${minRating}`;
          if (sortBy === 'rating') endpoint += `&sort_by=vote_average.desc&vote_count.gte=100`;
          else if (sortBy === 'release_date') endpoint += `&sort_by=primary_release_date.desc`;
          else endpoint += `&sort_by=popularity.desc`;
        }

        const res = await axios.get(endpoint, { timeout: 4000 });
        if (res.data && res.data.results) {
          let results = res.data.results.map(m => this.formatMovie(m));
          if (genre) {
            results = results.filter(m => m.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
          }
          if (language && language !== 'All') {
            results = results.filter(m => m.language && m.language.toLowerCase() === language.toLowerCase());
          }
          return {
            page: res.data.page,
            total_pages: res.data.total_pages,
            total_results: res.data.total_results,
            results
          };
        }
      } catch (err) {
        console.warn('TMDB search live call fallback to curated:', err.message);
      }
    }

    // Filter curated movies
    let filtered = [...CURATED_MOVIES];

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q) ||
        (m.language && m.language.toLowerCase().includes(q)) ||
        m.genres.some(g => g.toLowerCase().includes(q))
      );
    }

    if (genre && genre !== 'All') {
      filtered = filtered.filter(m =>
        m.genres.some(g => g.toLowerCase() === genre.toLowerCase())
      );
    }

    if (language && language !== 'All') {
      filtered = filtered.filter(m =>
        m.language && m.language.toLowerCase() === language.toLowerCase()
      );
    }

    if (year) {
      filtered = filtered.filter(m => m.release_date && m.release_date.startsWith(String(year)));
    }

    if (minRating && Number(minRating) > 0) {
      filtered = filtered.filter(m => m.vote_average >= Number(minRating));
    }

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sortBy === 'release_date') {
      filtered.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // popularity
      filtered.sort((a, b) => b.popularity - a.popularity);
    }

    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      page: Number(page),
      total_pages: Math.max(1, Math.ceil(filtered.length / limit)),
      total_results: filtered.length,
      results: paginated.map(m => this.formatMovie(m))
    };
  }

  getGenres() {
    return GENRES;
  }

  getLanguages() {
    return ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada', 'Bengali'];
  }
}

module.exports = new TMDBService();
