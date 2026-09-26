const express = require('express');
const router = express.Router();
const { setRating, getMovieRatingStats } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

// Public route to get movie stats, protected route to submit rating
router.post('/', protect, setRating);
router.get('/:movieId', getMovieRatingStats);

module.exports = router;
