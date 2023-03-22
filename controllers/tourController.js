const fs = require('fs');
const Tour = require('./../models/tourModel');

/*** imported data from json file not needed now we've hooked upto Mongo Atlas
const tours = fs.readFileSync(
  `${__dirname}/../dev-data/data/tours-simple.json`
);
const toursObj = JSON.parse(tours); 

// checkID is a middleware example that shows how middleware works
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  
  const idNumber = parseInt(req.params.id);
  if (idNumber > toursObj.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  next();
}; ***/

exports.getAllTours = async (req, res) => {
  try {
    const allTours = await Tour.find();

    res.status(200).json({
      status: 'success',
      results: allTours.length,
      data: {
        tours: allTours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Something went wrong, no tours located!',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // findById is helper function which does Tour.findOne({ id: req.params.id })
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Something went wrong, no tour located for that ID!',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<>Updated tour here...',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
