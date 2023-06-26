const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

/* Moved this code out of createReview so that func could use factory.createOne
  this will now be called as middleware in reviewRoutes.js before createReview */
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes to get tour and user ids if none are specified (allows devs to specify)
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
