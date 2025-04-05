/**
 * Validate if an email address is in a valid format.
 * @param {string} email - The email to validate.
 * @returns {boolean} Whether the email is valid.
 */
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

module.exports = {
    isValidEmail
};
