const { omit } = require('lodash');


const omitFields = (body) => {
    return omit(body, [
        'id', 'roleId', 'hashedPassword', 'status', 'emailVerified', 'verificationToken', 'token',
        'refreshTokenExpires', 'resetPasswordToken', 'resetPasswordExpires',
        'lastLogin', 'createdAt', 'updatedAt', 'twoFaSecret', 'twoFaVerified',
        'profilePictureUrl', 'dateOfBirth', 'sellerRequestStatus'
    ]);
};

module.exports = { omitFields };
