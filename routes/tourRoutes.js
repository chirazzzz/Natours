const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

/* Could destructure tourController to save functions 
const {getAllTours, createTour, getTour, updateTour, deleteTour} = tourController */

const router = express.Router();

// Param middleware that only runs for 'id' param
// router.param('id', tourController.checkID);

// POST /tour/:tourId/reviews - add review to tour
// GET /tour/:tourId/reviews - get all reviews for tour

/* imported reviewRouter and run it for this specific route - /:tourId/reviews
  exactly like the router.use lines in app.js */
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/best-5')
  .get(tourController.aliasBestTours, tourController.getAllTours);

router
  .route('/cheapest-5')
  .get(tourController.aliasCheapestTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// as query string => /tours-within?distance=79&center=-1,233&unit=km
// in REST style => /tours-within/79/center/34.137116, -118.115006/unit/km

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect, // protects route
    authController.restrictTo('admin', 'lead-guide'), // verifies if user has permission (either admin or lead-guide) to delete
    tourController.deleteTour
  );

module.exports = router;
