const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars']
    }
  },
  {
    timestamps: true
  }
);

// Guarantee one rating per user per movie at the database index level
ratingSchema.index({ user: 1, movieId: 1 }, { unique: true });

// Static method to calculate average rating and count for a movie
ratingSchema.statics.getAverageRating = async function (movieId) {
  const stats = await this.aggregate([
    { $match: { movieId: Number(movieId) } },
    {
      $group: {
        _id: '$movieId',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    return {
      averageRating: Number(stats[0].averageRating.toFixed(1)),
      totalRatings: stats[0].totalRatings
    };
  }

  return {
    averageRating: 0,
    totalRatings: 0
  };
};

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
