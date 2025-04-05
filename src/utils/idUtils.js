const { v4: uuidv4 } = require('uuid');
const shortId = require('shortid');

/**
 * Generate a new UUID v4.
 * @returns {string} The generated UUID.
 */
const generateUUID = () => {
    return uuidv4();
};

/**
 * Generate a new short ID.
 * @returns {string} The generated short ID.
 */
const generateShortId = () => {
    return shortId.generate();
};

module.exports = {
    generateUUID,
    generateShortId
};
