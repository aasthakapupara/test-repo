const safeExecute = async (fn, ...args) => {
    try {
        return await fn(...args);
    } catch (err) {
        console.error("Error in redis:", err);
        return null; // Return null or handle errors gracefully
    }
};

module.exports = safeExecute;