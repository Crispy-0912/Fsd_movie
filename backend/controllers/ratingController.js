const Rating = require('../models/Rating');
const Review = require('../models/Review');

// @desc    Add or update a rating for a movie
// @route   POST /api/ratings
// @access  Private
const setRating = async (req, res, next) => {
  try {
    const { movieId, rating } = req.body;
    const userId = req.user._id;

    if (!movieId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both movieId and rating.'
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.'
      });
    }

    // Upsert rating (update if exists, insert if new)
    const updatedRating = await Rating.findOneAndUpdate(
      { user: userId, movieId: Number(movieId) },
      { rating: numRating },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // If user has a review for this movie, keep review rating synchronized
    await Review.findOneAndUpdate(
      { user: userId, movieId: Number(movieId) },
      { rating: numRating }
    );

    // Calculate updated average
    const stats = await Rating.getAverageRating(movieId);

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully!',
      rating: updatedRating.rating,
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rating stats and current user's rating for a movie
// @route   GET /api/ratings/:movieId
// @access  Public (optional auth for user's own rating)
const getMovieRatingStats = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const stats = await Rating.getAverageRating(movieId);

    let userRating = 0;
    if (req.user) {
      const userDoc = await Rating.findOne({ user: req.user._id, movieId: Number(movieId) });
      if (userDoc) {
        userRating = userDoc.rating;
      }
    }

    res.status(200).json({
      success: true,
      movieId: Number(movieId),
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      userRating
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setRating,
  getMovieRatingStats
};
