const express = require('express');
const router = express.Router();
const {
  createReview,
  getMovieReviews,
  updateReview,
  deleteReview,
  toggleLikeReview,
  getUserReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/my/all', protect, getUserReviews);
router.get('/:movieId', getMovieReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/like', protect, toggleLikeReview);

module.exports = router;
