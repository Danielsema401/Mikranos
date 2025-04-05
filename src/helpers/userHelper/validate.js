// helpers/user/validate.js
const { isEmail } = require('validator');

const validateUser = (user) => {
    if (!user.email || !isEmail(user.email)) {
        throw new Error('Invalid email address');
    }
    if (!user.phone || user.phone.length < 5) {
        throw new Error('Phone number too short');
    }
    return user; // Return unchanged if valid
};

module.exports = validateUser;
