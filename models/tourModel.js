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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
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
  return this.duration / 7; // used regular func coz we need to use 'this' keyword to point ot current document
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

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
