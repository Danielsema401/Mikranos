// helpers/user/format.js
const formatForDatabase = (user) => ({
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone: user.phone,
    // Snake_case for DB columns
});

const formatForAPI = (user) => ({
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    // CamelCase for API responses
});

module.exports = { formatForDatabase, formatForAPI };
