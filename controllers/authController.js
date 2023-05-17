const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  /* replaced User.create(req.body) coz users could make themselves admins by sending userRole: Admin
    new code only allows newUser to have 4 key/value pairs */
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    // must return next() to exit out of controller
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  /* Without .select('+password') user returns only id, name & email
      Must have +password to add normally hidden password to user */
  const user = await User.findOne({ email }).select('+password');
  // correctPassword() isn't imported from userModel coz its an instance method that is always available for User

  /* Had below line saved to correct however if user doesn't exist then user.password is undefined and func breaks
    Therefore had to place logic directly inside the if conditional which will only run if user exists
  const correct = await user.correctPassword(password, user.password) */

  // user.correctPassword is instance method
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) If everything is ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  /* jwt.verify has callback func as 3rd arg so we need to turn that into a promise
    so we wrap entire .verify func with promisify(). Allows us to use async/await */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }

  // 4) check if user changed password after the token was issued

  // currentUser.changedPasswordAfter is an instance method
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }
  // GRANTS ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

/* restrictTo requires params of user roles however this isn't normally accessible to middleware
  So we wrap middleware func within restrictTo and pass ['admin', 'lead-guide'] roles as args */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles = ['admin', 'lead-guide']. If role = 'user' they don't have permission
    if (!roles.includes(req.user.role)) {
      // if role = 'user' then return AppError
      // req.user.role is saved at the end of protect func above
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    // if role isn't included then next()
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // 2) Generate the random token

  // user.createPasswordResetToken() is an instance method
  const resetToken = user.createPasswordResetToken();
  /* this.passwordResetToken && this.passwordResetExpires in createPasswordResetToken 
    however it isn't saved to DB so it happens below*/
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request wih your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  /* Need to check if token is still valid. If passwordResetExpires is greater than now it's still in the future
      So we run mongoDB check if passwordResetExpires is $gt: Date.now() */
  const user = await User.findOne({
    passwordResetToken: hashedToken, // finds user that matches token
    passwordResetExpires: { $gt: Date.now() }, // checks that token hasn't expired
  });

  // 2) If token hasn't expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changePasswordAt property for the user

  // 4) Log the user in, send JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
