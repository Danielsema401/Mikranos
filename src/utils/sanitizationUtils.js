function sanitizeInput(input) {
    return input ? input.trim() : '';
}

module.exports = { sanitizeInput };
