const httpStatus = require('http-status');
const ExtendableError = require('./extendable-error');

class APIError extends ExtendableError {
  constructor({ message, status = httpStatus.INTERNAL_SERVER_ERROR, errors = null, isPublic = false }) {
    super({ message, status, errors, isPublic });
  }

  static Unauthorized(message = 'Unauthorized') {
    return new APIError({ message, status: httpStatus.UNAUTHORIZED, isPublic: true });
  }

  static Forbidden(message = 'Forbidden') {
    return new APIError({ message, status: httpStatus.FORBIDDEN, isPublic: true });
  }

  static NotFound(message = 'Not Found') {
    return new APIError({ message, status: httpStatus.NOT_FOUND, isPublic: true });
  }

  static InternalServerError(message = 'Internal Server Error') {
    return new APIError({ message, status: httpStatus.INTERNAL_SERVER_ERROR, isPublic: false });
  }
}

module.exports = APIError;
