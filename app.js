const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express();

/**** 1) Middleware - for all routes ****/

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

/**** 2) Routes - middleware for particular routes ****/
// Here's where we 'mount' our Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


module.exports = app;
