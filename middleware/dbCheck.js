const mongoose = require('mongoose');

/**
 * Middleware that immediately rejects API requests when MongoDB is not connected.
 * This prevents the 10-second mongoose buffering timeout on every request.
 */
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: '⚠️ Database not connected. Please ensure MongoDB is running. See README.md for setup instructions.'
    });
  }
  next();
};

module.exports = requireDB;
