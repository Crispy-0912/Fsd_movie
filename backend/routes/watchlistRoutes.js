const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All watchlist routes require authentication

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:movieId', removeFromWatchlist);
router.get('/check/:movieId', checkWatchlist);

module.exports = router;
