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
    return JWTTimestamp < changedTimestamp
  }
  // false means not changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
