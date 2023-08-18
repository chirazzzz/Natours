const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug'); // pug is supported through express so no installation required
app.set('views', path.join(__dirname, 'views')); // using path.join to avoid bug where it can't find ../views coz file system is different

/**** 1) Global Middleware - for all routes ****/
/* a) Serving static fontVariantAlternates: 
  express.static() is middleware that allows static files to be served (anything in public directory) */
app.use(express.static(path.join(__dirname, 'public')));

// b) Set security HTTP headers

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://*.mapbox.com',
  'https://js.stripe.com',
  'https://m.stripe.network',
  'https://*.cloudflare.com',
];
const workerSrcUrls = [
  'https://*.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://events.mapbox.com',
  'https://m.stripe.network',
];
const connectSrcUrls = [
  'https://*.mapbox.com',
  'https://*.stripe.com',
  'https://*.cloudflare.com/',
  'https://bundle.js:*',
  'ws://127.0.0.1:*/',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", ...fontSrcUrls],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:', ...scriptSrcUrls],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com/'],
      workerSrc: ["'self'", 'data:', 'blob:', ...workerSrcUrls],
      childSrc: ["'self'", 'blob:'],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      formAction: ["'self'"],
      connectSrc: [
        "'self'",
        "'unsafe-inline'",
        'data:',
        'blob:',
        ...connectSrcUrls,
      ],
      upgradeInsecureRequests: [],
    },
  })
);

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
  cookieParser, reads data from cookies  
  express.json() is middleware that adds data from body to request obj */
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

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
  console.log(req.cookies);
  next();
});

/**** 2) Routes - middleware for particular routes ****/
// Here's where we 'mount' our Routers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// app.all('*') handles any random routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on our server`, 404)); // whenever you pass arg into next() Express assumes that is an error
});

app.use(globalErrorHandler);

module.exports = app;
