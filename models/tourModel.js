const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    // schema definition
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true, // trim only works on Strings and it removes any whitespace at start/end of string
      maxlength: [40, 'A tour name must have 40 characters or less'], // maxlength/minlength work with strings
      minlength: [10, 'A tour name must have 10 characters or more'],
      // validate: [validator.isAlpha, 'Tour name must only contain letter characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        // enum can only be used with strings
        values: ['easy', 'medium', 'difficult'], // specify the only acceptable options
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], // min/max work with numbers and date
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc when creating NEW document
          return val < this.price; // priceDiscount (100) < price (397) => true
          // priceDiscount (400) < price (397) => false and trigger validation error
        },
        message:
          'Price discount ({VALUE}) should be smaller than regular price',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], // this means an Array of type: String
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // this is how you exclude fields from being sent to client
    },
    startDates: [Date], // this means an Array of type: Date
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    // schema options
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual property durationWeeks is created each time we use .get
// cannot be used in query because it's not part of DB - just amending the response to client
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // used regular func coz we need to use 'this' keyword to point to current document
});

// DOCUMENT MIDDLEWARE: only runs before .save() & .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: only runs when querying DB
// tourSchema.pre('find', function (next) { <<== this only selects .find query (https://mongoosejs.com/docs/api/query.html#Query.prototype.find() )
tourSchema.pre(/^find/, function (next) {
  // ^find is RegEx that selects any query beginning with find so also incs findOne, findOneAndDelete etc
  this.find({ secretTour: { $ne: true } }); // 'this' refers to the current query and we filter out secretTour not equal to true

  this.start = Date.now(); // adds start key into query obj which has current Time - Date.Now()
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`); // calc time taken Date.now() - this.start from pre middleware above
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  // to filter out secretTour we need to another $match to aggregation pipeline
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // 'this' refers to aggregation pipeline we unshift $match to beginning of aggregate array

  console.log(this.pipeline());

  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
