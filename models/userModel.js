const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // schema definition
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true, // trim only works on Strings and it removes any whitespace at start/end of string
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // This only works on CREATE and SAVE!!
      validator: function (el) {
        return el === this.password; // abc === abc ✅ abc === xyz ❌
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  // checks if password hasn't been changed - returns next() and exits middleware
  if (!this.isModified('password')) return next();

  /* bcrypt.hash returns promise so need async/await and takes 
    current password and adds CPU cost of 12 to encrypt it */
  this.password = await bcrypt.hash(this.password, 12);

  // only require passwordConfirm for validation so making it undefined means it won't save to DB
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  /* Check if we didn't modify password property or if it's not a new User
    then do NOT manipulate passwordChangedAt two lines below */
  if (!this.isModified('password') || this.isNew) return next();

  /* minus 2secs here because passwordChangedAt is created slightly after issuing JWT. 
    This breaks our logic where we check if user changed password after JWT was issued.
    So we force passwordChangedAt to be less than JWT by - 2000 */
  this.passwordChangedAt = Date.now() - 2000;
  next()
});

// This is an instance method which is available on all documents of a certain collection
userSchema.methods.correctPassword = async function (
  inputPassword,
  savedPassword
) {
  // returns true if input matches saved password and false if not
  return await bcrypt.compare(inputPassword, savedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // divided by 1000 coz getTime() gives milliseconds and we needed seconds
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;

    // if true that means password changed after token creation
    return JWTTimestamp < changedTimestamp;
  }
  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  /* used Node's built in crypto module to generate a resetToken which is sent to user
    because resetTokens don't require extra protection you get from bcrypt */
  const resetToken = crypto.randomBytes(32).toString('hex');

  // before changing resetToken value in DB it must be hashed with sha256 algo
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  // Changed Reset expires in 10 mins (10 * 60 * 1000)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // send back unencrypted token back to user
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
