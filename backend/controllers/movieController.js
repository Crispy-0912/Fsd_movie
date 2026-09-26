const tmdbService = require('../services/tmdbService');

// @desc    Get movies with search, filter, sort, and pagination
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const {
      query = '',
      genre = '',
      year = '',
      language = '',
      minRating = 0,
      sortBy = 'popularity',
      page = 1,
      limit = 100
    } = req.query;

    const moviesData = await tmdbService.searchMovies({
      query,
      genre,
      year,
      language,
      minRating: Number(minRating),
      sortBy,
      page: Number(page),
      limit: req.query.limit !== undefined ? Number(req.query.limit) : 100
    });

    res.status(200).json({
      success: true,
      ...moviesData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movieId = req.params.id;
    const movie = await tmdbService.getMovieDetails(movieId);

    // Default application rating stats (will aggregate with MongoDB ratings in Phase 4)
    const appStats = {
      averageRating: 0,
      totalRatings: 0
    };

    res.status(200).json({
      success: true,
      movie: {
        ...movie,
        appStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending movies
// @route   GET /api/movies/trending
// @access  Public
const getTrendingMovies = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const trending = await tmdbService.getTrendingMovies(page);
    res.status(200).json({
      success: true,
      ...trending
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular movies
// @route   GET /api/movies/popular
// @access  Public
const getPopularMovies = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const popular = await tmdbService.getPopularMovies(page);
    res.status(200).json({
      success: true,
      ...popular
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top rated movies
// @route   GET /api/movies/top-rated
// @access  Public
const getTopRatedMovies = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const topRated = await tmdbService.getTopRatedMovies(page);
    res.status(200).json({
      success: true,
      ...topRated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie genres list
// @route   GET /api/movies/genres
// @access  Public
const getGenres = async (req, res, next) => {
  try {
    const genres = tmdbService.getGenres();
    res.status(200).json({
      success: true,
      genres
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie languages list
// @route   GET /api/movies/languages
// @access  Public
const getLanguages = async (req, res, next) => {
  try {
    const languages = tmdbService.getLanguages();
    res.status(200).json({
      success: true,
      languages
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getGenres,
  getLanguages
};
