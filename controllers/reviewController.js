const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  // if theres tourId filter will be that tourId
  if (req.params.tourId) filter = { tour: req.params.tourId };

  // either returns all reviews (filter is blank) or reviews for the tourId
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

/* Moved this code out of createReview so that func could use factory.createOne
  this will now be called as middleware in reviewRoutes.js before createReview */
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes to get tour and user ids if none are specified (allows devs to specify)
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
