const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// mergeParams allows this route to gain access to tourId on tourRouter so both example routes below work
const router = express.Router({ mergeParams: true });

// GET /tour/:tourId/reviews - get all reviews for tour
// POST /tours/:tourId/reviews
// POST /reviews - both these routes will go through post router below

router.route('/').get(reviewController.getAllReviews).post(
  authController.protect, // protects route
  authController.restrictTo('user'), // only allows 'users' to create reviews
  reviewController.createReview
);

module.exports = router;
