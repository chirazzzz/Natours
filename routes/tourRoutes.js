const express = require('express');
const tourController = require('../controllers/tourController');

/* Could destructure tourController to save functions 
const {getAllTours, createTour, getTour, updateTour, deleteTour} = tourController */

const router = express.Router();

// Param middleware that only runs for 'id' param
router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
