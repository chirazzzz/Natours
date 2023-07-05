const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app.set('view engine', 'pug'); // pug is supported through express so no installation required
app.set('views', path.join(__dirname, 'views')); // using path.join to avoid bug where it can't find ../views coz file system is different

/**** 1) Global Middleware - for all routes ****/
/* a) Serving static fontVariantAlternates: 
  express.static() is middleware that allows static files to be served (anything in public directory) */
app.use(express.static(path.join(__dirname, 'public')));

// b) Set security HTTP headers
app.use(helmet());

/* c) Development logging
  morgan also calls (req, res, next) callback func >>> https://github.com/expressjs/morgan/blob/master/index.js */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// d) Limit requests from same API
const limiter = rateLimit({
  max: 100, // if creating an more frequently used API this limit would need to be larger
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP address, please try again in an hour!',
});
app.use('/api', limiter);

/* e) Body parser, reading data from body into req.body
  express.json() is middleware that adds data from body to request obj */
app.use(express.json({ limit: '10kb' }));

// f) Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// g) Data sanitization against XSS (Cross Site Scripting) attacks
app.use(xss());

// h) Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// i) Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

/**** 2) Routes - middleware for particular routes ****/
app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Chirag ',
  });
});

app.get('/overview', (req, res) => {
  res.status(200).render('overview', {
    title: 'All Tours',
  });
});

app.get('/tour', (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
  });
});

// Here's where we 'mount' our Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// app.all('*') handles any random routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on our server`, 404)); // whenever you pass arg into next() Express assumes that is an error
});

app.use(globalErrorHandler);

module.exports = app;
