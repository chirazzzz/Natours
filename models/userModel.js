const mongoose = require('mongoose');
const validator = require('validator');

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
    
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
