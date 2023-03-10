const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

/**** 1) Middleware ****/
// morgan also calls (req, res, next) callback func >>> https://github.com/expressjs/morgan/blob/master/index.js
app.use(morgan('dev'));

// express.json() is middleware that adds data from body to request obj
app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware 🤯');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`);
const toursObj = JSON.parse(tours);
const users = fs.readFileSync(`${__dirname}/dev-data/data/users.json`);
const usersObj = JSON.parse(users);

/**** 2) Route Handlers ****/

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
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

const getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: usersObj.length,
    data: {
      tours: usersObj,
    },
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};

/**** 3) Routes ****/
const tourRouter = express.Router();
app.use('/api/v1/tours', tourRouter);

tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

const userRouter = express.Router();
app.use('/api/v1/users', userRouter);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

/**** 4) Server ****/

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
