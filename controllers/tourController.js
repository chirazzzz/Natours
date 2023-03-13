const fs = require('fs');

const tours = fs.readFileSync(
  `${__dirname}/../dev-data/data/tours-simple.json`
);
const toursObj = JSON.parse(tours);

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: toursObj.length,
    data: {
      tours: toursObj,
    },
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  const idNumber = parseInt(req.params.id);
  const tour = toursObj.find((el) => el.id === idNumber);

  // if (idNumber > toursObj.length) {
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newId = toursObj[toursObj.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };
  toursObj.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(toursObj),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          toursObj: newTour,
        },
      });
      console.log('New tour saved');
    }
  );
};

exports.updateTour = (req, res) => {
  const idNumber = parseInt(req.params.id);
  if (idNumber > toursObj.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<>Updated tour here...',
    },
  });
};

exports.deleteTour = (req, res) => {
  const idNumber = parseInt(req.params.id);
  if (idNumber > toursObj.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};