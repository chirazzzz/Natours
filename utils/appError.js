class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // when extending parent class we call super() to call parent constructor passing message as arg because Error only accepts message parameter

    this.statusCode = statusCode;
    // any 400, 401, 404 etc statusCodes are fails. Anything else is an error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // will test for this and only send error messages for Operational errors

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
