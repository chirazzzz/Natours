const fs = require('fs');
const express = require('express');

const app = express();

// express.json() is middleware that adds data from body to request obj
app.use(express.json());

const tours = fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`);
const toursObj = JSON.parse(tours);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: toursObj.length,
    data: {
      tours: toursObj,
    },
  });
};

const getTour = (req, res) => {
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

const createTour = (req, res) => {
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

const updateTour = (req, res) => {
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

const deleteTour = (req, res) => {
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

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
