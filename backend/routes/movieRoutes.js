const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getGenres,
  getLanguages
} = require('../controllers/movieController');

router.get('/', getMovies);
router.get('/trending', getTrendingMovies);
router.get('/popular', getPopularMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/genres', getGenres);
router.get('/languages', getLanguages);
router.get('/:id', getMovieById);

module.exports = router;
