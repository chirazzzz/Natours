const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// create getAllReviews and createReview routes
const router = express.Router();

router
  .route('/')
  .get(
    authController.protect, // protects route
    reviewController.getAllReviews
  )
  .post(
    authController.protect,
    authController.restrictTo('user'), // only allows 'users' to create reviews
    reviewController.createReview
  );

module.exports = router;
