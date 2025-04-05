const moment = require('moment-timezone');

/**
 * Format the current time in Africa/Addis_Ababa timezone.
 * @returns {string} Formatted current time string.
 */
const getCurrentTimeInAddisAbaba = () => {
    return moment().tz('Africa/Addis_Ababa').format('YYYY-MM-DD HH:mm:ss A');
};

/**
 * Format a given date to a specific format in the Africa/Addis_Ababa timezone.
 * @param {Date | string} date - The date to format.
 * @returns {string} Formatted date string.
 */
const formatDateToAddisAbaba = (date) => {
    return moment(date).tz('Africa/Addis_Ababa').format('YYYY-MM-DD HH:mm:ss A');
};

module.exports = {
    getCurrentTimeInAddisAbaba,
    formatDateToAddisAbaba
};
