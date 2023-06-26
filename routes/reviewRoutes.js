const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// mergeParams allows this route to gain access to tourId on tourRouter so both example routes below work
const router = express.Router({ mergeParams: true });

// GET /tour/:tourId/reviews - get all reviews for tour
// POST /tours/:tourId/reviews
// POST /reviews - both these routes will go through post router below

// Protects all routes after this middleware
router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews).post(
  authController.restrictTo('user'), // only allows 'users' to create reviews
  reviewController.setTourUserIds,
  reviewController.createReview
);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  );

module.exports = router;
