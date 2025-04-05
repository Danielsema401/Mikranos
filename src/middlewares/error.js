const httpStatus = require('http-status');
const APIError = require('../errors/api-error');

const handler = (err, req, res, next) => {
  if (!(err instanceof APIError)) {
    err = new APIError({  // Convert non-API errors
      message: err.message || 'Something went wrong',
      status: err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  let response = {
    statusCode: err.status || httpStatus.INTERNAL_SERVER_ERROR,
    message: err.message,
    details: err.errors || [],
  };

  console.error("Error occurred:", err);

  if (process.env.NODE_ENV !== 'development') {
    delete response.stack;
  }

  res.status(response.statusCode).json(response);
};



// If error is not an instanceOf APIError, convert it.

const converter = (err, req, res, next) => {
  let convertedError = err;

  if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message || 'Internal Server Error',
      status: err.status || httpStatus.INTERNAL_SERVER_ERROR,
      stack: err.stack,
    });
  }

  next(convertedError);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */

const notFound = (req, res, next) => {
  next(new APIError({
    message: 'Not Found',
    status: httpStatus.NOT_FOUND,
  }));
};


module.exports = {
  handler,
  converter,
  notFound,
};
