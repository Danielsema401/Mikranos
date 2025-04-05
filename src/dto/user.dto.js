// ==========================================================================
//      src/models/USER.MODEL.JS (DATABASE INTERACTION ONLY)
// ==========================================================================
class UserDto {
  constructor(userData) {
    this.id = userData.id || null;
    this.firstName = userData.firstName || null;
    this.lastName = userData.lastName || null;
    this.email = userData.email;
    this.hashedPassword = userData.hashedPassword || userData.password;
    this.phone = userData.phone || null;

    this.address = {
      street: userData.streetAddress || null,
      apartment: userData.apartmentNumber || null,
      city: userData.city || null,
      state: userData.stateProvince || null,
      postalCode: userData.postalCode || null,
      country: userData.country || null,
    };

    this.seller = {
      businessName: userData.businessName || null,
      businessAddress: userData.businessAddress || null,
      businessPhone: userData.businessPhone || null,
      businessEmail: userData.businessEmail || null,
      businessDescriptions: userData.businessDescriptions || null,
      verificationDocumentsUrl: userData.verificationDocumentsUrl || null,
    };

    this.roleId = userData.roleId || 3;
    this.status = userData.status || 'pending';
    this.emailVerified = Boolean(userData.emailVerified);
    this.verificationToken = userData.verificationToken || null;
    this.token = userData.token || null;
    this.refreshTokenExpires = userData.refreshTokenExpires || null;
    this.lastLogin = userData.lastLogin || null;

    this.twoFactor = {
      secret: userData.twoFaSecret || null,
      verified: Boolean(userData.twoFaVerified),
    };

    this.profilePictureUrl = userData.profilePictureUrl || null;
    this.dateOfBirth = userData.dateOfBirth || null;
    this.sellerRequestStatus = userData.sellerRequestStatus || 'pending';
    this.createdAt = userData.createdAt || null;
    this.updatedAt = userData.updatedAt || null;
  }

  /** ✅ Update user object safely */
  update(userData) {
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) this[key] = value;
    });
    this.updatedAt = userData.updatedAt || new Date(); // Always update timestamp
  }

  /** ✅ Convert snake_case from DB to camelCase */
  static fromDatabase(rawUser) {
    const formattedUser = {};
    for (const key in rawUser) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      formattedUser[camelKey] = rawUser[key];
    }
    return new UserDto(formattedUser); // ✅ Fixed this line
  }

  /** ✅ Convert camelCase to snake_case for saving in DB */
  toDatabase() {
    const dbUser = {};
    for (const key in this) {
      if (typeof this[key] === 'object' && this[key] !== null) {
        Object.entries(this[key]).forEach(([nestedKey, nestedValue]) => {
          dbUser[`${key}_${nestedKey}`] = nestedValue;
        });
      } else {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        dbUser[snakeKey] = this[key];
      }
    }
    return dbUser;
  }

  /** ✅ Verify email */
  verifyEmail() {
    this.emailVerified = true;
  }

  /** ✅ Enable Two-Factor Authentication */
  enableTwoFactor() {
    this.twoFactor.verified = true;
  }

  /** ✅ Refresh token details */
  setRefreshToken(token, expiresIn) {
    this.token = token;
    this.refreshTokenExpires = expiresIn;
  }

  /** ✅ Convert to JSON for API response */
  toJSON() {
    const data = {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      roleId: this.roleId,
      status: this.status,
      emailVerified: this.emailVerified,
      profilePictureUrl: this.profilePictureUrl,
      dateOfBirth: this.dateOfBirth,
      sellerRequestStatus: this.sellerRequestStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      twoFactorVerified: this.twoFactor.verified,
    };

    // Include token if available (useful for login/register response)
    if (this.token) {
      data.token = this.token;
    }

    // Remove null or undefined values to keep response clean
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    });

    return data;
  }

}

/** , id , firstName , lastName , email , hashedPassword , phone , address , street , apartment , city , state , postalCode , country , roleId , status , emailVerified , verificationToken , token , refreshTokenExpires , lastLogin , twoFaSecret , twoFaVerified , profilePictureUrl , dateOfBirth , sellerRequestStatus , createdAt , updatedAt*/

module.exports = UserDto;



//////////////////////////////////////////////////////////////////////////////////////
