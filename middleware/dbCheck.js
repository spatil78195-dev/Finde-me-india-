const mongoose = require('mongoose');

/**
 * Middleware that immediately rejects API requests when MongoDB is not connected.
 * This prevents the 10-second mongoose buffering timeout on every request.
 */
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    const status = mongoose.connection.readyState === 2 ? 'Connecting...' : 'Disconnected';
    console.error(`[DB-GUARD] Rejected request to ${req.originalUrl} - Status: ${status}`);
    
    return res.status(503).json({
      message: '⚠️ Database not connected.',
      troubleshooting: [
        'Check if MONGODB_URI is added to Vercel Environment Variables.',
        'Ensure 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.',
        'Wait a moment and refresh; connection may be initializing.'
      ]
    });
  }
  next();
};

module.exports = requireDB;
