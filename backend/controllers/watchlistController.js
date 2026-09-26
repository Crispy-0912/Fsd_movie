const Watchlist = require('../models/Watchlist');

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user._id }).sort({ addedAt: -1 });

    res.status(200).json({
      success: true,
      count: watchlist.length,
      watchlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId, movieTitle, moviePoster, movieYear, movieRating, movieGenres } = req.body;
    const userId = req.user._id;

    if (!movieId || !movieTitle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movieId and movieTitle.'
      });
    }

    // Check if already in watchlist
    const existing = await Watchlist.findOne({ user: userId, movieId: Number(movieId) });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This movie is already in your watchlist.'
      });
    }

    const item = await Watchlist.create({
      user: userId,
      movieId: Number(movieId),
      movieTitle,
      moviePoster: moviePoster || '',
      movieYear: movieYear || '',
      movieRating: movieRating || 0,
      movieGenres: movieGenres || []
    });

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist!',
      item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/watchlist/:movieId
// @access  Private
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;

    const item = await Watchlist.findOneAndDelete({ user: userId, movieId: Number(movieId) });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in your watchlist.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie removed from watchlist.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if movie is in user's watchlist
// @route   GET /api/watchlist/check/:movieId
// @access  Private
const checkWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;

    const exists = await Watchlist.exists({ user: userId, movieId: Number(movieId) });

    res.status(200).json({
      success: true,
      inWatchlist: !!exists
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist
};
