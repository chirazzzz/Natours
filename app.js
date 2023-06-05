const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

/**** 1) Global Middleware - for all routes ****/
// a) Set security HTTP headers
app.use(helmet());

/* b) Development logging
  morgan also calls (req, res, next) callback func >>> https://github.com/expressjs/morgan/blob/master/index.js */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// c) Limit requests from same API
const limiter = rateLimit({
  max: 100, // if creating an more frequently used API this limit would need to be larger
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP address, please try again in an hour!',
});
app.use('/api', limiter);

/* d) Body parser, reading data from body into req.body
  express.json() is middleware that adds data from body to request obj */
app.use(express.json({ limit: '10kb' }));

/* e) Serving static fontVariantAlternates: 
  express.static() is middleware that allows static files to be served (anything in public directory) */
app.use(express.static(`${__dirname}/public`));

// f) Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

/**** 2) Routes - middleware for particular routes ****/
// Here's where we 'mount' our Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// app.all('*') handles any random routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on our server`, 404)); // whenever you pass arg into next() Express assumes that is an error
});

app.use(globalErrorHandler);

module.exports = app;
