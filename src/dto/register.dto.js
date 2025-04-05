
class UserDTO {
  constructor(userData) {
    this.id = userData.id || null;
    this.firstName = userData.firstName ? userData.firstName.trim() : null;
    this.lastName = userData.lastName ? userData.firstName.trim() : null;
    this.email = userData.email ? userData.email.trim() : null;
    this.password = userData.password || null; // Should be hashed in the service
    this.phone = userData.phone || null;

    this.address = {
      street: userData.streetAddress || null,
      apartment: userData.apartmentNumber || null,
      city: userData.city || null,
      state: userData.stateProvince || null,
      postalCode: userData.postalCode || null,
      country: userData.country || null,
    };

    this.roleId = userData.roleId || 3; // Default: Normal user
    this.status = userData.status || 'pending';
    this.emailVerified = Boolean(userData.emailVerified);
    this.verificationToken = userData.verificationToken || null;

    this.twoFactor = {
      secret: userData.twoFaSecret || null,
      verified: Boolean(userData.twoFaVerified),
    };

    this.profilePictureUrl = userData.profilePictureUrl || null;
    this.dateOfBirth = userData.dateOfBirth || null;
    this.sellerRequestStatus = userData.sellerRequestStatus || 'pending';

    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }

  /** ✅ Convert to JSON for API responses (removes sensitive fields) */
  toJSON() {
    return {
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
  }
}

module.exports = UserDTO;
