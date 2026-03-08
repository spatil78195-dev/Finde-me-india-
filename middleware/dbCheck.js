const mongoose = require('mongoose');

/**
 * Middleware that immediately rejects API requests when MongoDB is not connected.
 * This prevents the 10-second mongoose buffering timeout on every request.
 */
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.error(`[DB-GUARD] Rejected request to ${req.originalUrl} - MongoDB state: ${mongoose.connection.readyState}`);
    return res.status(503).json({
      message: '⚠️ Database not connected. Our team is working on resolving this server issue.'
    });
  }
  next();
};

module.exports = requireDB;
