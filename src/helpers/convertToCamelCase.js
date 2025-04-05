convertToCamelCase(user) {
    const formattedUser = {};
    for (const key in user) {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        formattedUser[camelKey] = user[key];
    }
    return formattedUser;
};
