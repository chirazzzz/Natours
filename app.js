const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

/**** 1) Middleware - for all routes ****/
// morgan also calls (req, res, next) callback func >>> https://github.com/expressjs/morgan/blob/master/index.js
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// express.json() is middleware that adds data from body to request obj
app.use(express.json());

// express.static() is middleware that allows static files to be served (anything in public directory)
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/**** 2) Routes - middleware for particular routes ****/
// Here's where we 'mount' our Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// app.all('*') handles any random routes
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on our server`,
  });
});

module.exports = app;
