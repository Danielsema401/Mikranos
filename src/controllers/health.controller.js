// ======================================================
//             HEALTH.CONTROLLER
// ======================================================

const db = require('../config/db');

exports.healthCheck = async (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: `${process.uptime().toFixed(2)} seconds`,
        memoryUsage: {
            rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, // Resident Set Size
            heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        },
        database: {
            status: 'Checking...',
        },
    };

    try {
        // ✅ Check database connectivity
        const dbStatus = await db.ping();
        healthCheck.database.status = dbStatus ? 'Connected' : 'Disconnected';

        // ❌ If database is down, return 500
        if (!dbStatus) {
            healthCheck.status = 'Error';
            return res.status(500).json(healthCheck);
        }

        // ✅ Everything is OK
        return res.status(200).json(healthCheck);
    } catch (error) {
        // ❌ Handle errors
        healthCheck.status = 'Error';
        healthCheck.database.status = 'Disconnected';
        healthCheck.error = error.message;
        return res.status(500).json(healthCheck);
    }
};
