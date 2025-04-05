// src/helpers/userHelper/sanitize.js
const sanitizeUserInput = (user = {}) => {
  if (typeof user !== 'object' || Array.isArray(user)) {
    throw new Error('User data must be a valid object');
  }

  const sanitized = {};

  // --- Common Sanitizers ---
  const escapeHTML = (str) =>
    typeof str === 'string'
      ? str.replace(/[&<>"'`=\/]/g, (s) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '`': '&#x60;',
          '=': '&#x3D;',
          '/': '&#x2F;',
        })[s])
      : str;

  const sanitizeString = (value) =>
    typeof value === 'string' ? escapeHTML(value.trim()) : null;

  const sanitizeEmail = (value) =>
    typeof value === 'string' ? escapeHTML(value.trim().toLowerCase()) : null;

  const sanitizePhone = (value) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : null;

  const sanitizeBoolean = (value, defaultVal = false) =>
    typeof value === 'boolean' ? value : defaultVal;

  const sanitizeDate = (value, fallback = null) =>
    value instanceof Date && !isNaN(value.getTime()) ? value : fallback;

  const sanitizeUrl = (value) => {
    try {
      if (typeof value === 'string') {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:'
          ? url.toString()
          : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // --- Fields and Rules ---
  const sanitizationRules = {
    id: sanitizeString,
    firstName: sanitizeString,
    lastName: sanitizeString,
    email: sanitizeEmail,
    phone: sanitizePhone,

    hashedPassword: sanitizeString,     // Sensitive
    verificationToken: sanitizeString,  // Sensitive
    token: sanitizeString,              // Sensitive
    twoFaSecret: sanitizeString,        // Sensitive

    businessName: sanitizeString,
    businessAddress: sanitizeString,
    businessPhone: sanitizePhone,
    businessEmail: sanitizeString,
    businessDescriptions: sanitizeString,
    verificationDocumentsUrl: sanitizeString,

    address: sanitizeString,
    street: sanitizeString,
    apartment: sanitizeString,
    city: sanitizeString,
    state: sanitizeString,
    postalCode: sanitizeString,
    country: sanitizeString,
    roleId: sanitizeString,
    status: sanitizeString,
    emailVerified: (v) => sanitizeBoolean(v),
    twoFaVerified: (v) => sanitizeBoolean(v),
    refreshTokenExpires: (v) => sanitizeDate(v),
    lastLogin: (v) => sanitizeDate(v),
    profilePictureUrl: sanitizeUrl,
    dateOfBirth: sanitizeString,
    biography: (v) => (typeof v === 'string' ? escapeHTML(v) : null),
    sellerRequestStatus: sanitizeString,
    createdAt: (v) => sanitizeDate(v, new Date()),
    updatedAt: (v) => sanitizeDate(v, new Date()),
    // Example of HTML sanitization for a field that might contain user-generated content
    // biography: (value) => (typeof value === 'string' ? escapeHTML(value) : null),
  };

  // --- Apply Sanitizers ---
  for (const key in sanitizationRules) {
    sanitized[key] = sanitizationRules[key](user[key]);
  }

  // --- Optionally handle unknown fields (log & ignore or keep safely) ---
  for (const key in user) {
    if (!sanitizationRules.hasOwnProperty(key)) {
      console.warn(`Unexpected field during sanitization: ${key}`);
    }
  }

  return sanitized;
};

module.exports = sanitizeUserInput;
