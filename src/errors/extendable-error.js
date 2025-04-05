class ExtendableError extends Error {
  constructor({
    message = "Unknown Error", // Default message if none provided
    errors = [],               // Default to empty array if no errors
    status = 500,              // Default status to 500 if not provided
    isPublic = false,          // Default to false if no public flag is set
    stack,                     // Stack will be set manually
  }) {
    super(message);
    this.name = this.constructor.name;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true; // Indicates this is a known operational error
    this.stack = stack || new Error().stack; // Ensure stack is always defined
  }
}

module.exports = ExtendableError;
