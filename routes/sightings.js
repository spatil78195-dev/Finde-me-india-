const express = require('express');
const router = express.Router();
const multer = require('multer');
const Sighting = require('../models/Sighting');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Helper: run multer as a promise (safe for Vercel)
function runMulter(req, res) {
  return new Promise((resolve) => {
    upload.single('photo')(req, res, (err) => {
      // Even if multer errors (e.g. Vercel stream issue), resolve so req.body is used
      resolve();
    });
  });
}

// POST /api/sightings/:personId - report a sighting (no auth required)
router.post('/:personId', async (req, res) => {
  try {
    // Run multer safely — won't throw even if multipart fails
    await runMulter(req, res);

    const { location, message, reporterName, reporterPhone } = req.body;

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    let photo = null;
    if (req.file && req.file.buffer) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      let mime = req.file.mimetype || 'image/jpeg';
      const header = req.file.buffer.subarray(0, 16).toString('utf8');
      if (header.includes('ftypavif')) mime = 'image/avif';
      else if (header.includes('ftypheic')) mime = 'image/heic';
      else if (req.file.buffer[0] === 0xFF && req.file.buffer[1] === 0xD8) mime = 'image/jpeg';
      else if (req.file.buffer[0] === 0x89 && req.file.buffer[1] === 0x50) mime = 'image/png';
      photo = `data:${mime};base64,${b64}`;
    }

    const sighting = await Sighting.create({
      personId: req.params.personId,
      location,
      message: message || '',
      reporterName: reporterName || '',
      reporterPhone: reporterPhone || '',
      photo,
      reportedBy: req.user ? req.user.id : null
    });

    res.status(201).json(sighting);
  } catch (err) {
    console.error('Sighting error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to submit sighting' });
  }
});

// GET /api/sightings/person/:personId - sightings for a person
router.get('/person/:personId', async (req, res) => {
  try {
    const sightings = await Sighting.find({ personId: req.params.personId })
      .sort({ createdAt: -1 });
    res.json(sightings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
