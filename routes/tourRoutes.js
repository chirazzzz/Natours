const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

/* Could destructure tourController to save functions 
const {getAllTours, createTour, getTour, updateTour, deleteTour} = tourController */

const router = express.Router();

// Param middleware that only runs for 'id' param
// router.param('id', tourController.checkID);

router
  .route('/best-5')
  .get(tourController.aliasBestTours, tourController.getAllTours);

router
  .route('/cheapest-5')
  .get(tourController.aliasCheapestTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect, // protects route
    authController.restrictTo('admin', 'lead-guide'), // verifies if user has permission (either admin or lead-guide) to delete
    tourController.deleteTour
  );

// GET /tour/:tourID/reviews - get all reviews for tour
// GET /tour/:tourID/reviews/:reviewID - get specific review for tour

// POST /tour/:tourID/reviews - add review to tour
router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
