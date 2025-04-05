const sanitize = require('./sanitize');
const validate = require('./validate');
const { formatForDatabase, formatForAPI } = require('./format');

module.exports = {
  sanitizeUser: sanitize,
  validateUser: validate,
  formatForDatabase,
  formatForAPI,
};
