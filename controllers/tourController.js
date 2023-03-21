const fs = require('fs');
const Tour = require('./../models/tourModel')

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

exports.checkBody = (req, res, next) => {
  if(!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Name or Price not submitted',
    })
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: toursObj.length,
    // data: {
    //   tours: toursObj,
    // },
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  const idNumber = parseInt(req.params.id);
  // const tour = toursObj.find((el) => el.id === idNumber);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
};

exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    // data: {
    //   toursObj: newTour,
    // },
  });
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
