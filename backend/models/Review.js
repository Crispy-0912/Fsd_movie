const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    movieId: {
      type: Number,
      required: true,
      index: true
    },
    movieTitle: {
      type: String,
      default: ''
    },
    moviePoster: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required for review'],
      min: 1,
      max: 5
    },
    reviewText: {
      type: String,
      required: [true, 'Review text cannot be empty'],
      trim: true,
      minlength: [5, 'Review must be at least 5 characters long'],
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    reported: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews from the same user on the same movie
reviewSchema.index({ user: 1, movieId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
