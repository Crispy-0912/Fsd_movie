const Review = require('../models/Review');
const Rating = require('../models/Rating');

// @desc    Create a new movie review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { movieId, movieTitle, moviePoster, rating, reviewText } = req.body;
    const userId = req.user._id;

    if (!movieId || !rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movieId, rating, and review text.'
      });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ user: userId, movieId: Number(movieId) });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this movie. You can edit your existing review.'
      });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      movieId: Number(movieId),
      movieTitle: movieTitle || '',
      moviePoster: moviePoster || '',
      rating: Number(rating),
      reviewText: reviewText.trim()
    });

    // Also synchronize/upsert in Rating collection
    await Rating.findOneAndUpdate(
      { user: userId, movieId: Number(movieId) },
      { rating: Number(rating) },
      { upsert: true, new: true }
    );

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar role');

    res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      review: populatedReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a movie
// @route   GET /api/reviews/:movieId
// @access  Public
const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const reviews = await Review.find({ movieId: Number(movieId) })
      .populate('user', 'name avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    // Check authorization (only owner or admin can edit)
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this review.'
      });
    }

    const { rating, reviewText } = req.body;
    if (rating) review.rating = Number(rating);
    if (reviewText) review.reviewText = reviewText.trim();

    const updatedReview = await review.save();

    // Also update Rating collection if rating was changed
    if (rating) {
      await Rating.findOneAndUpdate(
        { user: review.user, movieId: review.movieId },
        { rating: Number(rating) }
      );
    }

    const populated = await Review.findById(updatedReview._id).populate('user', 'name avatar role');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully!',
      review: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    // Check authorization (owner or admin can delete)
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review.'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like or unlike a review
// @route   POST /api/reviews/:id/like
// @access  Private
const toggleLikeReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    const userId = req.user._id;
    const isLiked = review.likes.includes(userId);

    if (isLiked) {
      // Unlike
      review.likes = review.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Like
      review.likes.push(userId);
    }

    await review.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: review.likes.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's reviews
// @route   GET /api/reviews/my/all
// @access  Private
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('user', 'name avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getMovieReviews,
  updateReview,
  deleteReview,
  toggleLikeReview,
  getUserReviews
};
